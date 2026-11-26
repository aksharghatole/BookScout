'use strict';
function host(provider){if(provider==='DOAB')return 'directory.doabooks.org';if(provider==='OAPEN')return 'library.oapen.org';throw Error('Unknown catalog')}
function academicUrl(provider,query,exact=''){const tokens=String(query??'').normalize('NFKC').match(/[\p{L}\p{N}]+/gu)?.slice(0,14)||[];const expression=exact?'dc.identifier.isbn:"'+exact+'"':tokens.map(t=>'(dc.title:"'+t+'" OR dc.contributor.author:"'+t+'")').join(' AND ');return 'https://'+host(provider)+'/rest/search?query='+encodeURIComponent(expression)+'&expand=metadata%2Cbitstreams&limit=12';}
function academicBooks(data,provider,exact='',isbnNormalize=x=>String(x).replace(/[-\s]/g,'')){
 if(!Array.isArray(data))throw Error('Unexpected academic catalog response');
 const domain=host(provider),rows=[],seen=new Set();
 for(const item of data.slice(0,12)){
  if(!item||item.withdrawn===true||item.archived===false||typeof item.handle!=='string'||!/^\d+(?:\.\d+)*\/[A-Za-z0-9._-]+$/.test(item.handle)||!Array.isArray(item.metadata))continue;
  const handle=item.handle;if(seen.has(handle))continue;
  const vals=key=>item.metadata.filter(x=>x?.key===key&&typeof x.value==='string').map(x=>x.value.trim()).filter(Boolean);
  const types=vals('dc.type').map(x=>x.toLowerCase());if(!types.some(x=>['book','monograph','edited book','book/monograph','book - monograph','book - edited volume'].includes(x))||types.some(x=>/chapter|article|part of book/.test(x)))continue;
  const title=vals('dc.title')[0]||item.name;if(typeof title!=='string'||!title.trim()||/\b(?:excerpt|sample|preview)\b/i.test(title))continue;
  const identifiers=vals('dc.identifier.isbn').map(isbnNormalize).filter(Boolean);if(exact&&!identifiers.includes(exact))continue;
  const rights=[...vals('dc.rights.uri'),...vals('dc.rights')].find(x=>/^https?:\/\/creativecommons\.org\/(?:licenses\/(?:by|by-sa|by-nc|by-nc-sa|by-nd|by-nc-nd)\/[1-4]\.0|publicdomain\/(?:zero|mark)\/1\.0)\/?$/i.test(x));
  const page='https://'+domain+'/handle/'+handle;const links=[];
  if(rights&&Array.isArray(item.bitstreams))for(const bit of item.bitstreams){
   if(!bit||bit.private===true||bit.deleted===true||bit.bundleName!=='ORIGINAL'||typeof bit.name!=='string'||/\b(?:excerpt|sample|preview|cover|chapter|frontmatter|toc)\b/i.test(bit.name.replace(/[_-]/g,' ')))continue;
   const kind=bit.mimeType==='application/pdf'?'pdf':bit.mimeType==='application/epub+zip'?'epub':'';if(!kind||links.some(x=>x.kind===kind))continue;
   const path=typeof bit.retrieveLink==='string'?bit.retrieveLink:'';
   if(!/^\/rest\/bitstreams\/[a-f0-9-]{36}\/retrieve$/i.test(path))continue;
   links.push({kind,label:'Download '+kind.toUpperCase()+' (catalog file)',url:'https://'+domain+path});
  }
  const open=!!rights;rows.push({id:handle,source:provider,title,author:vals('dc.contributor.author').join(', ')||vals('dc.contributor.editor').join(', '),publisher:vals('dc.publisher')[0]||'',year:(vals('dc.date.issued')[0]||'').slice(0,4),isbn:exact||'',free:open,freeLabel:'OPEN ACCESS · DECLARED LICENSE',editionNote:'Academic book record · confirm edition and file availability',readUrl:page,accessLinks:links,licenseUrl:rights?rights.replace(/^http:/i,'https:'):''});seen.add(handle);
 }
 return rows;
}
const academic={academicUrl,academicBooks};if(typeof module==='object'&&module.exports)module.exports=academic;else globalThis.BookScoutAcademic=academic;
