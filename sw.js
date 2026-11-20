/* Same-origin offline app shell. The private IndexedDB library is never cached by the worker. */
const CACHE='mnemosyne-shell-2026-11-21-v1';
const SHELL=['./','./index.html','./styles/main.css','./app/main.js','./app/db.js','./app/backup.js','./app/knowledge.js','./app/learning.js','./app/interchange.js','./app/experience.js','./app/scene.js','./app/rooms.js','./manifest.webmanifest','./icons/mnemosyne.svg'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL.map(path=>new URL(path,self.registration.scope).href))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mnemosyne-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url),scope=self.registration.scope;
 if(req.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(scope)||url.pathname.includes('/tests/'))return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(new URL('./index.html',scope).href,copy)));}return response;}).catch(()=>caches.match(new URL('./index.html',scope).href)));
  return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));}
  return response;
 })));
});
