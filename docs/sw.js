const CACHE="kuumi-crm-2c3cd04fc90c",FILES=["./assets/index-918ZUJTq.js","./assets/index-Bx2pcpb4.css","./icons/apple-touch-icon.png","./icons/favicon.png","./icons/icon-192.png","./icons/icon-512.png","./index.html","./manifest.webmanifest"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kuumi-crm-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith(new URL(self.registration.scope).pathname))return;
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));return;}
e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));});