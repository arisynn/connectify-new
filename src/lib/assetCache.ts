const decoded=new Map<string,HTMLImageElement>();
let registration:Promise<any>|undefined;
export const enableAssetCache=()=>{
  if('serviceWorker' in navigator&&!registration)registration=navigator.serviceWorker.register('/asset-cache-sw.js',{scope:'/'}).catch(()=>null);
  return registration;
};
export const warmImages=(urls:string[])=>{
  const work=()=>urls.filter(Boolean).forEach(url=>{
    if(decoded.has(url))return;
    const image=new Image();image.src=url;image.decode?.().catch(()=>{});decoded.set(url,image);
    if(decoded.size>160)decoded.delete(decoded.keys().next().value!);
  });
  if('requestIdleCallback' in window)(window as any).requestIdleCallback(work,{timeout:2000});else setTimeout(work,100);
};