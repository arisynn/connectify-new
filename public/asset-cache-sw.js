const CACHE='connectify-art-v4-atelier-clean';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('connectify-art-')&&k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!['image','audio','font'].includes(request.destination)||url.pathname.startsWith('/api/')||url.searchParams.has('import'))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE),cached=await cache.match(request);if(cached)return cached;
    const response=await fetch(request);
    if(response.ok&&!response.headers.get('content-type')?.includes('text/html')){await cache.put(request,response.clone());const keys=await cache.keys();if(keys.length>240)await cache.delete(keys[0]);}
    return response;
  })());
});