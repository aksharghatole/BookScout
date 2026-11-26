'use strict';
function createCatalogCache({ttl=300000,max=40,now=Date.now}={}){
 const entries=new Map();
 return {
  get(key){const item=entries.get(key);if(!item)return null;if(now()-item.at>=ttl||now()<item.at){entries.delete(key);return null;}entries.delete(key);entries.set(key,item);return item.books;},
  put(key,books){if(!Array.isArray(books)||!books.length||books.length>50||books.some(b=>!b||b.retailPrice||b.listPrice))return false;entries.delete(key);entries.set(key,{at:now(),books});while(entries.size>max)entries.delete(entries.keys().next().value);return true;},
  clear(){entries.clear();}
 };
}
function cacheKey(source,query,region){return JSON.stringify([source,String(query).trim(),region]);}
function cacheableSource(source){return ['Open Library','Open Library edition','Project Gutenberg','Wikisource','DOAB','OAPEN'].includes(source);}
function shareUrl(base,query,region){
 const q=String(query??'').trim().slice(0,300);if(!q||!['IN','US','GB'].includes(region))return '';
 const url=new URL(base);url.search='';url.hash='';url.searchParams.set('q',q);url.searchParams.set('country',region);return url.href;
}
function readShare(base){
 const u=new URL(base),q=(u.searchParams.get('q')||'').trim().slice(0,300),region=u.searchParams.get('country');
 return {query:q,region:['IN','US','GB'].includes(region)?region:''};
}
const catalog={createCatalogCache,cacheKey,cacheableSource,shareUrl,readShare};if(typeof module==='object'&&module.exports)module.exports=catalog;else globalThis.BookScoutCatalog=catalog;
