-- Apply after the existing CDE schema/recovery migrations. No player data is removed.
-- Only the server service role may change progress, inventory, currency, or receipts.
DROP POLICY IF EXISTS "Users can update their own profile_data" ON public.cde_profiles;
DROP POLICY IF EXISTS "Users can update their own account" ON public.cde_accounts;
REVOKE INSERT, UPDATE, DELETE ON public.cde_profiles, public.cde_accounts, public.cde_operations_log FROM anon, authenticated;

DROP FUNCTION IF EXISTS public.cde_mutate_state(UUID, UUID, TEXT, JSONB, JSONB, BIGINT);
CREATE OR REPLACE FUNCTION public.cde_mutate_state(
  p_account_id UUID, p_idempotency_key UUID, p_operation_type TEXT,
  p_profile_patch JSONB, p_game_patch JSONB, p_base_revision BIGINT,
  p_permen_delta BIGINT DEFAULT 0
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v public.cde_profiles%ROWTYPE;
  state JSONB;
  today TEXT := to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD');
  earned BIGINT := 0;
BEGIN
  SELECT * INTO v FROM public.cde_profiles WHERE account_id = p_account_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'PROFILE_NOT_FOUND'; END IF;
  -- Check after the row lock so simultaneous retries are idempotent as well.
  IF EXISTS(SELECT 1 FROM public.cde_operations_log WHERE idempotency_key = p_idempotency_key AND account_id = p_account_id) THEN
    RETURN jsonb_build_object('success',true,'permen',v.permen,'profile_data',v.profile_data,'revision',v.revision);
  END IF;
  IF p_base_revision IS NULL OR p_base_revision <> v.revision THEN RAISE EXCEPTION 'STALE_REVISION'; END IF;
  IF p_permen_delta > 0 THEN
    IF p_operation_type NOT IN ('OPEN_CHEST','CLAIM_MISSION_REWARD','CLAIM_ACHIEVEMENT_REWARD') OR p_permen_delta > 10 THEN RAISE EXCEPTION 'INVALID_INCOME_SOURCE'; END IF;
    IF v.profile_data #>> '{profile,economy,day}' = today THEN earned := COALESCE((v.profile_data #>> '{profile,economy,earned}')::BIGINT,0); END IF;
    IF earned + p_permen_delta > 100 THEN RAISE EXCEPTION 'DAILY_INCOME_LIMIT'; END IF;
    p_profile_patch := jsonb_set(COALESCE(p_profile_patch,'{}'::jsonb),'{economy}',jsonb_build_object('version',3,'day',today,'earned',earned+p_permen_delta));
  END IF;
  IF p_permen_delta < 0 AND p_operation_type NOT IN ('PURCHASE_ITEM','SPEED_UP_CHEST') THEN RAISE EXCEPTION 'INVALID_SPEND_SOURCE'; END IF;
  IF v.permen + p_permen_delta < 0 THEN RAISE EXCEPTION 'INSUFFICIENT_FUNDS'; END IF;
  state := COALESCE(v.profile_data,'{}'::jsonb);
  state := jsonb_set(state,'{profile}',COALESCE(state->'profile','{}'::jsonb)||COALESCE(p_profile_patch,'{}'::jsonb));
  state := jsonb_set(state,'{game}',COALESCE(state->'game','{}'::jsonb)||COALESCE(p_game_patch,'{}'::jsonb));
  UPDATE public.cde_profiles SET profile_data=state,permen=v.permen+p_permen_delta,revision=v.revision+1,updated_at=now() WHERE account_id=p_account_id;
  INSERT INTO public.cde_operations_log(idempotency_key,account_id,operation_type,created_at) VALUES(p_idempotency_key,p_account_id,p_operation_type,now());
  RETURN jsonb_build_object('success',true,'permen',v.permen+p_permen_delta,'profile_data',state,'revision',v.revision+1);
END;
$$;

DO $$ DECLARE f RECORD; BEGIN
  FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('cde_mutate_state','cde_mutate_permen') LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.signature);
  END LOOP;
END $$;