'use strict';
function approvedUrl(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port)return '';if(!['gutenberg.org','www.gutenberg.org','books.google.com','play.google.com','books.googleusercontent.com','archive.org','en.wikisource.org','directory.doabooks.org','library.oapen.org'].includes(u.hostname))return '';u.hash='';return u.href;}catch{return '';}
}
function collectLinks(books){
 const out=[],seen=new Set();for(const b of books||[]){if(!b||!Array.isArray(b.accessLinks))continue;for(const a of b.accessLinks){if(!a||!['read','pdf','epub','txt','mobi'].includes(a.kind))continue;const url=approvedUrl(a.url);if(!url)continue;const key=JSON.stringify([url,a.kind]);if(seen.has(key))continue;seen.add(key);out.push({title:String(b.title||''),author:String(b.author||''),source:String(b.source||''),isbn:String(b.isbn||''),alternativeEdition:!!b.alternativeEdition,kind:a.kind,url});if(out.length>=500)return out;}}return out;
}
function csvCell(value){let s=String(value??'');if(/^[\s\u0000-\u001f]*[=+\-@]|^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function exportCsv(links){return ['title,author,source,isbn,alternative_edition,format,url',...links.map(x=>[x.title,x.author,x.source,x.isbn,x.alternativeEdition?'yes':'no',x.kind,x.url].map(csvCell).join(','))].join('\r\n')+'\r\n';}
function classifyResponse(response){
 if(!response||response.type==='opaque'||response.type==='opaqueredirect'||response.redirected)return 'unverified';
 if(response.status===404||response.status===410)return 'not found';
 if(response.status>=200&&response.status<300)return 'responded';
 return 'unverified';
}
async function checkLink(url,fetcher,signal){
 if(!approvedUrl(url)||signal?.aborted)return 'unverified';
 const local=new AbortController(),stop=()=>local.abort();if(signal)signal.addEventListener('abort',stop,{once:true});const timer=setTimeout(stop,8000);
 try{const response=await fetcher(url,{method:'HEAD',mode:'cors',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',cache:'no-store',signal:local.signal});return classifyResponse(response);}catch{return 'unverified';}finally{clearTimeout(timer);signal?.removeEventListener('abort',stop);}
}
async function checkBatch(links,{fetcher,signal,onUpdate=()=>{}}){const unique=[...new Set(links.map(x=>x.url).filter(approvedUrl))].slice(0,12);let cursor=0;await Promise.all(Array.from({length:Math.min(3,unique.length)},async()=>{while(cursor<unique.length&&!signal?.aborted){const url=unique[cursor++],status=await checkLink(url,fetcher,signal);if(!signal?.aborted)onUpdate(url,status);}}));}
const links={approvedUrl,collectLinks,exportCsv,classifyResponse,checkLink,checkBatch};if(typeof module==='object'&&module.exports)module.exports=links;else globalThis.BookScoutLinks=links;
