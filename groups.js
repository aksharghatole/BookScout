'use strict';
function canonical(value){return String(value??'').normalize('NFKC').toLowerCase().replace(/[\s\p{P}]+/gu,' ').trim();}
function workKey(book){const t=canonical(book.title),a=canonical(book.author);return t&&a&&a!=='unknown'&&a!=='author unavailable'&&t!=='untitled'?JSON.stringify([t,a]):'';}
function groupBooks(books,normalizeIsbn=x=>x||''){
 const groups=[],byIsbn=new Map(),byWork=new Map();
 for(const book of books){
  const isbn=normalizeIsbn(book.isbn),work=workKey(book);
  let group=(isbn&&byIsbn.get(isbn))||(work&&byWork.get(work));
  if(!group){group={records:[],representative:book};groups.push(group);}
  group.records.push(book);
  if(isbn&&!byIsbn.has(isbn))byIsbn.set(isbn,group);
  if(work&&!byWork.has(work))byWork.set(work,group);
 }
 return groups.map(g=>({...g,providers:[...new Set(g.records.map(b=>b.source).filter(Boolean))],free:g.records.some(b=>b.free),formats:[...new Set(g.records.flatMap(b=>(b.accessLinks||[]).map(a=>a.kind)))],minimum:Math.min(...g.records.map(b=>b.free?0:b.retailPrice?.amount??Infinity)),discount:Math.max(...g.records.map(b=>b.discountPct||0))}));
}
function orderGroups(groups,sort){const out=groups.slice();if(sort==='free')out.sort((a,b)=>Number(b.free)-Number(a.free));if(sort==='price')out.sort((a,b)=>a.minimum===b.minimum?0:a.minimum-b.minimum);if(sort==='discount')out.sort((a,b)=>b.discount-a.discount);return out;}
const groups={groupBooks,orderGroups};if(typeof module==='object'&&module.exports)module.exports=groups;else globalThis.BookScoutGroups=groups;
