'use strict';
function license(value){
 const list=Array.isArray(value)?value:[value];
 for(const v of list){if(typeof v!=='string')continue;
 const m=v.trim().match(/^https?:\/\/(?:www\.)?creativecommons\.org\/(publicdomain\/(?:mark|zero)\/1\.0|licenses\/(?:by|by-sa|by-nc|by-nc-sa|by-nd|by-nc-nd)\/(?:[1-4]\.0)|licenses\/publicdomain)\/?$/i);
 if(m)return 'https://creativecommons.org/'+m[1].toLowerCase()+'/';}
 return '';
}
function identifier(value){return typeof value==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(value)&&value!=='.'&&value!=='..'?value:''}
function archiveSearchUrl(query){const tokens=String(query??'').normalize('NFKC').match(/[\p{L}\p{N}]+/gu)?.slice(0,12)||[];if(!tokens.length)return '';const expression='mediatype:texts AND licenseurl:[* TO *] AND '+tokens.map(t=>'(title:"'+t+'" OR creator:"'+t+'")').join(' AND ');return 'https://archive.org/advancedsearch.php?q='+encodeURIComponent(expression)+'&fl%5B%5D=identifier&fl%5B%5D=licenseurl&rows=12&page=1&output=json'}
function candidates(data){const docs=Array.isArray(data?.response?.docs)?data.response.docs:[];return [...new Set(docs.filter(d=>license(d?.licenseurl)).map(d=>identifier(d.identifier)).filter(Boolean))].slice(0,5)}
function archiveBook(data,expected){
 const m=data?.metadata,id=identifier(expected);
 if(!m||!id||m.identifier!==id||m.mediatype!=='texts'||typeof m.title!=='string'||!m.title.trim())return null;
 const rights=license(m.licenseurl);if(!rights)return null;
 const flagged=v=>v===true||v===1||/^(?:true|1|yes)$/i.test(String(v));
 const col=Array.isArray(m.collection)?m.collection:[m.collection];
 if(flagged(data.is_dark)||flagged(data.isDark)||flagged(data['access-restricted-item'])||flagged(m['access-restricted-item'])||flagged(m.noindex)||flagged(m.is_dark)||col.some(x=>/^(?:inlibrary|printdisabled|browserlending|lendinglibrary|restricted|loggedin)$/i.test(String(x))))return null;
 if(/\b(?:sample|excerpt|preview|chapter only|partial)\b/i.test(m.title))return null;
 const entries=Array.isArray(data.files)?data.files:[];
 const links=[];
 for(const kind of ['pdf','epub','txt']){
 const candidates=entries.filter(f=>f&&typeof f.name==='string'&&f.name.length<=250&&!/[\\/]/.test(f.name)&&!/\b(?:sample|excerpt|preview|cover|chapter|partial)\b/i.test(f.name.replace(/[_-]/g,' '))&&!flagged(f.private)&&Number(f.size)>0&&f.name.toLowerCase().endsWith('.'+kind)&&(f.source==='original'||(kind==='pdf'&&f.format==='Text PDF')||(kind==='epub'&&f.format==='EPUB')||(kind==='txt'&&f.format==='DjVuTXT')));
 candidates.sort((a,b)=>Number(b.size)-Number(a.size));
 if(candidates.length)links.push({kind,label:'Download '+kind.toUpperCase(),url:'https://archive.org/download/'+encodeURIComponent(id)+'/'+encodeURIComponent(candidates[0].name)});
 }
 if(!links.length)return null;
 const item='https://archive.org/details/'+encodeURIComponent(id);
 if(links.some(x=>x.kind==='pdf'))links.unshift({kind:'read',label:'Read online (archive viewer)',url:item});
 const creator=Array.isArray(m.creator)?m.creator.filter(x=>typeof x==='string').join(', '):typeof m.creator==='string'?m.creator:'';
 return {id,source:'Internet Archive',title:m.title,author:creator,year:typeof m.date==='string'?m.date.slice(0,4):'',isbn:'',free:true,freeLabel:'FREE · DECLARED OPEN LICENSE',editionNote:'Archive item · confirm edition, completeness and rights',accessLinks:links,licenseUrl:rights,readUrl:item,cover:'https://archive.org/services/img/'+encodeURIComponent(id)};
}
async function searchArchive(query,fetchJson,signal){
 const url=archiveSearchUrl(query);if(!url)return [];
 const ids=candidates(await fetchJson(url,signal));if(!ids.length)return [];
 const responses=await Promise.allSettled(ids.map(async id=>archiveBook(await fetchJson('https://archive.org/metadata/'+encodeURIComponent(id),signal),id)));
 if(responses.every(r=>r.status==='rejected'))throw Error('Archive item metadata unavailable');
 return responses.filter(r=>r.status==='fulfilled'&&r.value).map(r=>r.value);
}
const archive={license,archiveSearchUrl,candidates,archiveBook,searchArchive};if(typeof module==='object'&&module.exports)module.exports=archive;else globalThis.BookScoutArchive=archive;
