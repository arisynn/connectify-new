-- Connectify — langkah lanjutan (jalankan sekali, aman diulang)
GRANT ALL ON public.mp_rooms TO service_role;
GRANT ALL ON public.cde_recovery_codes TO service_role;
GRANT ALL ON public.cde_accounts, public.cde_profiles, public.cde_operations_log TO service_role;
NOTIFY pgrst, 'reload schema';
