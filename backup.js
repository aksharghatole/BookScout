'use strict';
function validateBackup(data) {
  const fail=()=>{throw new Error("Invalid BookScout backup");};
  const str=(v,max)=>typeof v==="string"&&v.length<=max;
  const amt=v=>typeof v==="number"&&Number.isFinite(v)&&v>=0&&v<=1e9;
  const date=v=>str(v,40)&&Number.isFinite(Date.parse(v));
  const obj=v=>v&&typeof v==="object"&&!Array.isArray(v);
  if(!obj(data)||data.format!=="bookscout-backup"||data.version!==1||!["IN","US","GB"].includes(data.country)||!Array.isArray(data.saved)||data.saved.length>5000||!Array.isArray(data.history)||data.history.length>5||!data.history.every(v=>str(v,1000)))fail();
  const keys=new Set();
  const saved=data.saved.map(b=>{
    if(!obj(b)||!str(b.key,2000)||!b.key||keys.has(b.key)||!str(b.title,1000)||!b.title||!str(b.author,2000)||!str(b.isbn,13)||!/^(\d{13})?$/.test(b.isbn))fail();
    keys.add(b.key);
    const result={key:b.key,title:b.title,author:b.author,isbn:b.isbn,watch:{}};
    if(b.watch!==undefined&&!obj(b.watch))fail();
    for(const region of ["IN","US","GB"]){
      const w=b.watch?.[region];if(w===undefined)continue;if(!obj(w))fail();
      const clean={};
      if(w.target!==undefined){if(!amt(w.target))fail();clean.target=w.target;}
      if(w.history!==undefined){if(!Array.isArray(w.history)||w.history.length>60)fail();clean.history=w.history.map(x=>{if(!obj(x)||!amt(x.amount)||!date(x.at))fail();return {amount:x.amount,at:x.at};});}
      if(w.quotes!==undefined){if(!Array.isArray(w.quotes)||w.quotes.length>100)fail();clean.quotes=w.quotes.map(q=>{if(!obj(q)||!str(q.store,80)||!q.store.trim()||!["new","used","digital"].includes(q.format)||!amt(q.price)||!amt(q.shipping)||!date(q.at))fail();return {store:q.store,format:q.format,price:q.price,shipping:q.shipping,at:q.at};});}
      result.watch[region]=clean;
    }
    return result;
  });
  return {format:"bookscout-backup",version:1,country:data.country,saved,history:data.history.slice()};
}
if(typeof module==='object'&&module.exports)module.exports=validateBackup;else globalThis.BookScoutBackup=validateBackup;
