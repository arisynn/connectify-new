import { supabase } from './supabase';

// All API traffic uses the configured backend and current account session.
export const apiFetch = async (route:string, options:RequestInit = {}) => {
  const base=(window as any).ENV?.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
  if(!base) throw new Error('Alamat server belum dikonfigurasi.');
  const headers=new Headers(options.headers);
  if(!headers.has('Authorization')) {
    const {data}=await supabase.auth.getSession();
    if(data?.session?.access_token) headers.set('Authorization',`Bearer ${data.session.access_token}`);
  }
  return window.fetch(`${base.replace(/\/$/,'')}${route}`,{...options,headers});
};