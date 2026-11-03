import {readdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const files=(await readdir('docs',{recursive:true,withFileTypes:true})).filter(e=>e.isFile()).map(e=>(e.parentPath+'/'+e.name).replace(/^docs\//,'./')).filter(f=>!f.endsWith('sw.js'));
const hash=createHash('sha256');for(const path of files.sort())hash.update(await readFile('docs/'+path.slice(2)));const version='kuumi-crm-'+hash.digest('hex').slice(0,12);
await writeFile('docs/.nojekyll','');
await writeFile('docs/sw.js',`const CACHE=${JSON.stringify(version)},FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kuumi-crm-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith(new URL(self.registration.scope).pathname))return;
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));return;}
e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));});`);
