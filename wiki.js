'use strict';
function wikiUrl(query){
 const q=String(query??'').trim().slice(0,300);if(!q)return '';
 return 'https://en.wikisource.org/w/api.php?action=query&generator=search&gsrnamespace=0&gsrlimit=12&gsrsearch='+encodeURIComponent(q)+'&prop=info%7Cpageprops%7Ccategories&cllimit=50&clcategories='+encodeURIComponent('Category:Validated texts|Category:Proofread texts|Category:Incomplete texts|Category:Disambiguation pages')+'&inprop=url&format=json&formatversion=2&origin=*';
}
function normalized(value){return String(value??'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
function wikiBooks(data,query){
 if(data?.error)throw Error('Wikisource API error');
 const pages=Array.isArray(data?.query?.pages)?data.query.pages:[];
 const words=new Set(normalized(query).split(' ').filter(x=>x.length>1));const seen=new Set(),out=[];
 for(const p of pages.slice(0,12)){
  if(!p||p.ns!==0||!Number.isSafeInteger(p.pageid)||p.pageid<=0||seen.has(p.pageid)||p.missing||p.invalid||typeof p.title!=='string'||!p.title.trim()||p.title.includes('/')||Object.prototype.hasOwnProperty.call(p.pageprops||{},'disambiguation'))continue;
  if(/\b(?:chapter|excerpt|sample|preview|disambiguation)\b/i.test(p.title))continue;
  const cats=(Array.isArray(p.categories)?p.categories:[]).map(c=>c?.title);
  if(cats.includes('Category:Incomplete texts')||cats.includes('Category:Disambiguation pages'))continue;
  const titleWords=normalized(p.title).split(' ');
  if(words.size&&!titleWords.some(t=>words.has(t)))continue;
  const quality=cats.includes('Category:Validated texts')?'Validated text':cats.includes('Category:Proofread texts')?'Proofread text':'Completeness not verified';
  const url='https://en.wikisource.org/?curid='+p.pageid;
  seen.add(p.pageid);out.push({id:String(p.pageid),source:'Wikisource',title:p.title,author:'',isbn:'',free:true,freeLabel:'FREE ONLINE TEXT',editionNote:'English Wikisource · '+quality+' · check local rights',accessLinks:[{kind:'read',label:'Read online text',url}],readUrl:url});
 }
 return out;
}
function rankScore(book,query,exact=''){
 const title=normalized(book.title),author=normalized(book.author),q=normalized(query);
 if(exact)return book.isbn===exact?100:0;
 if(!q)return 0;
 const queryWords=[...new Set(q.split(' '))],titleWords=new Set(title.split(' ')),authorWords=new Set(author.split(' '));
 let score=0;for(const word of queryWords){if(titleWords.has(word))score+=5;else if(authorWords.has(word))score+=3;else score-=3;}
 if(title===q)score+=50;else if(title&&(' '+q+' ').includes(' '+title+' '))score+=25;else if((' '+title+' ').includes(' '+q+' '))score+=15;
 return score;
}
function rankBooks(books,query,exact=''){return books.slice().sort((a,b)=>rankScore(b,query,exact)-rankScore(a,query,exact)||Number(!!b.free)-Number(!!a.free)||(b.accessLinks?.length||0)-(a.accessLinks?.length||0));}
const wiki={wikiUrl,wikiBooks,rankScore,rankBooks};if(typeof module==='object'&&module.exports)module.exports=wiki;else globalThis.BookScoutWiki=wiki;
