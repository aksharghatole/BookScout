'use strict';
function createSearchSession(sources,{load,active,onUpdate}){
 const states=sources.map(s=>({name:s.name,status:'pending',books:[]}));
 function publish(index){if(active())onUpdate(states.map(s=>({name:s.name,status:s.status,count:s.books.length})),states.flatMap(s=>s.books),index);}
 async function run(index,retry=false){
  if(!active()||!states[index]||(retry&&states[index].status!=='failed'))return false;
  const state=states[index];state.status='pending';state.books=[];if(retry)publish(index);
  try{const books=await load(sources[index]);if(!active())return false;if(!Array.isArray(books))throw Error('Invalid catalog response');state.books=books;state.status='done';}
  catch{if(!active())return false;state.status='failed';}
  publish(index);return state.status==='done';
 }
 let started=false;
 return {start(){if(started||!active())return Promise.resolve([]);started=true;publish(-1);return Promise.all(states.map((_,i)=>run(i)));},retry(index){if(!started)return Promise.resolve(false);return run(index,true);}};
}
if(typeof module==='object'&&module.exports)module.exports={createSearchSession};else globalThis.BookScoutSearch={createSearchSession};
