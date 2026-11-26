'use strict';
const CACHE='bookscout-shell-v18';
const root=new URL('./',self.location.href);
const shell=['./','./index.html','./backup.js','./isbn.js','./scanner.js','./discovery.js','./archive.js','./wiki.js','./academic.js','./groups.js','./search-session.js','./catalog-cache.js','./alternatives.js','./compare.js','./apple.js','./theme.js','./manifest.webmanifest','./icon.svg'].map(p=>new URL(p,root).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(shell))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('bookscout-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==root.origin)return;
  if(event.request.mode==='navigate'&&url.pathname.startsWith(root.pathname)){
    event.respondWith(caches.open(CACHE).then(cache=>cache.match(new URL('index.html',root).href)).then(hit=>hit||fetch(event.request)));return;
  }
  if(shell.includes(url.href))event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(hit=>hit||fetch(event.request)));
});
