import type { Request, Response } from 'express';
import { getSupabase } from './supabase.js';

// Rooms live in Supabase (table mp_rooms) so every API instance / serverless
// function sees the same lobby. Only friendly matches exist: no wagers.
const TABLE = 'mp_rooms';
const ROOM_TTL_MS = 6 * 3600000;
const PREPARE_TIMEOUT_MS = 15000;
const DISCONNECT_MS = 15000;

const log = (event: string, roomId: string, details: any = {}) => console.log(JSON.stringify({ timestamp: new Date().toISOString(), module: 'Multiplayer', event, roomId, ...details }));

const loadRoom = async (db: any, roomId?: string) => {
  const id = String(roomId || '').trim().toUpperCase();
  if (!id) return null;
  const { data } = await db.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (!data) return null;
  if (Date.now() - new Date(data.updated_at || 0).getTime() > ROOM_TTL_MS) { await db.from(TABLE).delete().eq('id', id); return null; }
  return data.data;
};
const findRoomByPlayer = async (db: any, name: string) => {
  const { data } = await db.from(TABLE).select('*').eq('status', 'active').limit(500);
  return (data || []).map((r: any) => r.data).find((r: any) => r?.players?.some((p: any) => p.name === name)) || null;
};
const saveRoom = async (db: any, room: any) => {
  room.revision = (room.revision || 0) + 1;
  room.updatedAt = Date.now();
  const { error } = await db.from(TABLE).upsert({ id: room.id, status: 'active', match_id: room.matchId || null, data: room, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  return room;
};
const deleteRoom = async (db: any, roomId: string) => { await db.from(TABLE).delete().eq('id', roomId); };

export const verifiedMultiplayerResult = async (matchId: string, name: string) => {
  const db = getSupabase();
  if (!db || !matchId) return null;
  const { data } = await db.from(TABLE).select('*').eq('match_id', matchId).limit(5);
  const room = (data || []).map((r: any) => r.data).find((r: any) => r?.matchId === matchId && r.status === 'FINISHED' && r.players.some((p: any) => p.name === name));
  if (!room) return null;
  return { game: room.gameMode === 'block-puzzle' ? 'block' : 'onet', isWinner: room.winner === name };
};

const finish = (room: any, winner: string | null, reason: string) => {
  room.winner = winner; room.finishReason = reason; room.status = 'FINISHED'; room.finishedAt = Date.now();
  log('MATCH_COMPLETED', room.id, { winner, reason, matchId: room.matchId });
};

// Time-based housekeeping that used to rely on in-process timers.
const settle = (room: any) => {
  const now = Date.now();
  for (const p of room.players) {
    if (!p.lastSync) continue;
    p.connection = now - p.lastSync <= 3000 ? 'CONNECTED' : now - p.lastSync <= DISCONNECT_MS ? 'RECONNECTING' : 'DISCONNECTED';
  }
  if (room.status === 'STARTING' && room.preparingAt && now - room.preparingAt > PREPARE_TIMEOUT_MS) {
    room.status = 'WAITING'; room.players.forEach((p: any) => { p.ready = false; p.readyForGame = false; });
    log('MATCH_START_TIMEOUT', room.id);
  }
  if (room.status === 'PLAYING' && !room.winner) {
    for (const p of room.players) {
      if (p.lastSync && now - p.lastSync > DISCONNECT_MS) {
        const opponent = room.players.find((o: any) => o.name !== p.name);
        if (room.startAt && now >= room.startAt) { if (opponent) finish(room, opponent.name, 'DISCONNECT'); }
        else { room.status = 'WAITING'; room.players.forEach((x: any) => { x.ready = false; x.readyForGame = false; }); log('COUNTDOWN_ABORTED_DISCONNECT', room.id, { player: p.name }); }
      }
    }
  }
};

export default async function handler(req: Request, res: Response) {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const action = String(req.query.action || req.body?.action || '');
    if (action.includes('wager') || (action === 'change_mode' && req.body.mode !== 'Friendly Match')) return res.status(403).json({ error: 'WAGER_DISABLED: Permen hanya berasal dari peti, misi, dan pencapaian.' });
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const db = getSupabase();
    if (!db) return res.status(503).json({ error: 'ACCOUNT_SERVICE_UNAVAILABLE' });
    const { data: auth } = await db.auth.getUser(token);
    if (!auth?.user?.id) return res.status(401).json({ error: 'INVALID_TOKEN' });
    const { data: account } = await db.from('cde_accounts').select('username').eq('id', auth.user.id).maybeSingle();
    if (!account) return res.status(401).json({ error: 'ACCOUNT_NOT_FOUND' });
    const me: string = account.username;
    const claimedName = req.body?.name || req.body?.host || req.query.name;
    if (claimedName && claimedName !== me) return res.status(403).json({ error: 'PLAYER_IDENTITY_MISMATCH' });

    const roomIdParam = String(req.body?.roomId || req.query.roomId || '').trim().toUpperCase();
    let room = roomIdParam ? await loadRoom(db, roomIdParam) : null;
    if (!room && action === 'sync' && !roomIdParam && req.query.name) room = await findRoomByPlayer(db, me);
    if (room && !['join', 'create'].includes(action) && !room.players.some((p: any) => p.name === me)) return res.status(403).json({ error: 'NOT_A_ROOM_MEMBER' });
    if (room) settle(room);
    const notFound = () => res.status(404).json({ error: 'ROOM_NOT_FOUND: Room tidak ditemukan.' });

    if (action === 'create') {
      const { level, theme, gameMode } = req.body;
      const id = Math.random().toString(36).substring(2, 8).toUpperCase();
      const created = { id, host: me, status: 'WAITING', revision: 0, players: [{ name: me, level, theme, ready: false, lastSync: Date.now(), connection: 'CONNECTED' }], mode: 'Friendly Match', gameMode: gameMode || 'onet', wager: null, createdAt: Date.now() };
      await saveRoom(db, created); log('ROOM_CREATED', id, { host: me, gameMode: created.gameMode });
      return res.json(created);
    }

    if (action === 'join') {
      const { level, theme } = req.body;
      if (!roomIdParam) return res.status(400).json({ error: 'MISSING_PARAMS: Kode room wajib diisi.' });
      if (!room) return notFound();
      const existing = room.players.find((p: any) => p.name === me);
      if (!existing && room.status !== 'WAITING' && room.status !== 'STARTING') return res.status(400).json({ error: 'ROOM_PLAYING: Room sedang dalam permainan.' });
      if (!existing && room.players.length >= 2) return res.status(400).json({ error: 'ROOM_FULL: Room sudah penuh.' });
      if (existing) { Object.assign(existing, { level, theme, ready: false, lastSync: Date.now(), connection: 'CONNECTED' }); log('PLAYER_REJOINED', room.id, { name: me }); }
      else { room.players.push({ name: me, level, theme, ready: false, lastSync: Date.now(), connection: 'CONNECTED' }); log('PLAYER_JOINED', room.id, { name: me }); }
      room.players.forEach((p: any) => p.ready = false);
      return res.json(await saveRoom(db, room));
    }

    if (action === 'leave') {
      if (!room) return res.json({ success: true });
      if (room.status === 'PLAYING' && !room.winner) { const opponent = room.players.find((p: any) => p.name !== me); if (opponent) finish(room, opponent.name, 'DISCONNECT'); }
      room.players = room.players.filter((p: any) => p.name !== me);
      log('PLAYER_LEFT', room.id, { name: me, remaining: room.players.length });
      if (!room.players.length) { await deleteRoom(db, room.id); log('ROOM_DESTROYED', room.id); return res.json({ success: true }); }
      if (room.host === me) { room.host = room.players[0].name; log('HOST_MIGRATED', room.id, { newHost: room.host }); }
      room.players.forEach((p: any) => { p.ready = false; p.readyForGame = false; });
      if (room.status === 'STARTING') room.status = 'WAITING';
      await saveRoom(db, room);
      return res.json({ success: true });
    }

    if (action === 'sync') {
      if (!room) return notFound();
      const { level, theme, progress, matchId } = req.query;
      const p = room.players.find((x: any) => x.name === me);
      if (p) {
        if (level) p.level = Number(level);
        if (theme) p.theme = String(theme);
        if (progress !== undefined && !(room.status === 'PLAYING' && matchId && matchId !== room.matchId)) p.progress = Number(progress);
        p.lastSync = Date.now(); p.connection = 'CONNECTED';
      }
      return res.json(await saveRoom(db, room));
    }

    if (!room) return notFound();

    if (action === 'ready') {
      const p = room.players.find((x: any) => x.name === me);
      if (p) { p.ready = !!req.body.ready; p.lastSync = Date.now(); log('PLAYER_READY_CHANGED', room.id, { name: me, ready: p.ready }); }
      return res.json(await saveRoom(db, room));
    }

    if (action === 'change_mode') {
      if (room.host !== me) return res.status(403).json({ error: 'FORBIDDEN: Hanya host yang bisa melakukan ini.' });
      room.mode = 'Friendly Match'; room.wager = null;
      return res.json(await saveRoom(db, room));
    }

    if (action === 'start_match') {
      if (room.host !== me) return res.status(403).json({ error: 'INVALID_ROOM: Room tidak valid atau kamu bukan host.' });
      if (room.status === 'STARTING' || room.status === 'PLAYING') return res.json({ success: true, room });
      if (room.players.length < 2 || !room.players.every((p: any) => p.ready)) return res.status(400).json({ error: 'NOT_READY: Semua pemain harus siap.' });
      room.status = 'STARTING'; room.preparingAt = Date.now(); room.startAt = null;
      room.matchId = 'M-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
      room.winner = null; room.finishReason = null;
      if (req.body.board) room.board = req.body.board;
      const tiles = room.board?.flat().filter(Boolean).length || 60;
      room.players.forEach((p: any) => { p.progress = room.gameMode === 'onet' ? tiles : 0; p.readyForGame = false; });
      log('MATCH_PREPARING', room.id, { matchId: room.matchId });
      return res.json({ success: true, room: await saveRoom(db, room) });
    }

    if (action === 'ready_for_game') {
      const p = room.players.find((x: any) => x.name === me);
      if (p) { p.readyForGame = true; p.lastSync = Date.now(); }
      if (room.status === 'STARTING' && room.players.length === 2 && room.players.every((x: any) => x.readyForGame)) {
        room.status = 'PLAYING'; room.startAt = Date.now() + 4000; log('MATCH_STARTED', room.id, { startAt: room.startAt });
      }
      return res.json({ success: true, room: await saveRoom(db, room) });
    }

    if (action === 'complete' || action === 'report_loss' || action === 'time_up') {
      if (room.status === 'PLAYING' && !room.winner) {
        const opponent = room.players.find((p: any) => p.name !== me);
        if (action === 'complete') finish(room, me, 'BOARD_COMPLETED');
        else if (action === 'report_loss') finish(room, opponent?.name || null, 'OPPONENT_LOST');
        else {
          const mine = room.players.find((p: any) => p.name === me)?.progress || 0, theirs = opponent?.progress || 0;
          const iWin = room.gameMode === 'onet' ? mine < theirs : mine > theirs;
          finish(room, mine === theirs ? 'DRAW' : iWin ? me : opponent?.name || null, 'TIME_UP');
        }
        await saveRoom(db, room);
      }
      return res.json(room);
    }

    if (action === 'rematch') {
      if (room.status === 'FINISHED') {
        room.status = 'WAITING'; room.winner = null; room.finishReason = null; room.matchId = null; room.startAt = null;
        room.players.forEach((p: any) => { p.ready = false; p.readyForGame = false; p.progress = 0; });
        log('ROOM_REMATCH', room.id, { by: me });
      }
      const p = room.players.find((x: any) => x.name === me);
      if (p) { p.ready = true; p.progress = 0; p.lastSync = Date.now(); }
      return res.json(await saveRoom(db, room));
    }

    return res.status(400).json({ error: 'INVALID_ACTION: Aksi tidak valid.' });
  } catch (e: any) {
    console.error('Multiplayer API Error:', e);
    res.status(500).json({ error: 'Server error', details: e.message });
  }
}
