'use strict';
function normalizeTitle(value){return String(value??'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
function authorKey(value){return normalizeTitle(value).split(' ').filter(Boolean).sort().join(' ');}
function resolveWork(records,exact,normalizeIsbn){
 if(!exact)return null;
 const matches=records.filter(b=>b&&normalizeIsbn(b.isbn)===exact&&!b.alternativeEdition&&normalizeTitle(b.title)&&normalizeTitle(b.title)!=='untitled'&&authorKey(b.author)&&!['unknown','author unavailable'].includes(normalizeTitle(b.author)));
 const chosen=matches.find(b=>b.source==='Open Library')||matches[0];
 if(!chosen)return null;
 const title=String(chosen.title).trim(),author=String(chosen.author).trim();
 return {title,author,query:(title+' '+author).slice(0,300)};
}
function alternativeBooks(records,work,exact,normalizeIsbn){
 if(!work||!Array.isArray(records))return [];
 const title=normalizeTitle(work.title),author=authorKey(work.author);
 return records.filter(b=>b&&b.free===true&&normalizeTitle(b.title)===title&&authorKey(b.author)===author&&normalizeIsbn(b.isbn)!==exact).map(b=>({...b,alternativeEdition:true,editionNote:['Alternative edition · ISBN differs or is unavailable',b.editionNote].filter(Boolean).join(' · ')}));
}
const alt={resolveWork,alternativeBooks};if(typeof module==='object'&&module.exports)module.exports=alt;else globalThis.BookScoutAlternatives=alt;
