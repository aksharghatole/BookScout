'use strict';
function compareOffers(book,region,format='all',now=Date.now()){
 const w=book?.watch?.[region];if(!w||typeof w!=='object')return [];
 const amount=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1e9;
 const dated=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
 const recent=x=>Math.max(0,Math.floor((now-Date.parse(x))/86400000));
 const rows=[];
 const h=Array.isArray(w.history)?w.history.filter(x=>x&&amount(x.amount)&&dated(x.at)).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)):[];
 if(h.length)rows.push({store:'Google Books',format:'digital',total:h[0].amount,price:h[0].amount,shipping:0,at:h[0].at,kind:'Observed',age:recent(h[0].at)});
 const quotes=Array.isArray(w.quotes)?w.quotes.filter(x=>x&&typeof x.store==='string'&&x.store.trim()&&['digital','new','used'].includes(x.format)&&amount(x.price)&&amount(x.shipping)&&dated(x.at)).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)):[];
 const seen=new Set();
 for(const q of quotes){const key=q.store.trim().toLowerCase()+'|'+q.format;if(seen.has(key))continue;seen.add(key);rows.push({store:q.store,format:q.format,total:Math.round((q.price+q.shipping)*100)/100,price:q.price,shipping:q.shipping,at:q.at,kind:'Manual',age:recent(q.at)});}
 return rows.filter(x=>format==='all'||x.format===format).sort((a,b)=>a.total-b.total||Date.parse(b.at)-Date.parse(a.at));
}
function basket(books,region,format='all',freshOnly=false,now=Date.now()){
 const items=(Array.isArray(books)?books:[]).map(book=>{
 const offers=compareOffers(book,region,format,now).filter(x=>!freshOnly||x.age<=7);
 return {key:book.key,title:book.title,author:book.author||'',isbn:book.isbn||'',offer:offers[0]||null,count:offers.length};
 });
 const found=items.filter(x=>x.offer);const total=Math.round(found.reduce((s,x)=>s+x.offer.total,0)*100)/100;
 return {items,total,covered:found.length,missing:items.length-found.length};
}
const bookCompare={compareOffers,basket};if(typeof module==='object'&&module.exports)module.exports=bookCompare;else globalThis.BookScoutCompare=bookCompare;
