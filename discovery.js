'use strict';
function discovery(query){
 const q=String(query??'').trim();if(!q)return [];const p=encodeURIComponent(q);
 const site=(host,extra='')=>'https://www.google.com/search?q='+encodeURIComponent('site:'+host+' '+q+(extra?' '+extra:''));
 return [
 {name:'Standard Ebooks',description:'Curated public-domain editions; check local rights.',url:'https://standardebooks.org/ebooks?query='+p},
 {name:'DOAB',description:'Open-access scholarly books; check the license.',url:'https://directory.doabooks.org/discover?query='+p},
 {name:'Google Books full view',description:'Look for full-view editions; access varies by country.',url:'https://books.google.com/books?as_brr=1&q='+p},
 {name:'BookFinder',description:'Compare new and used books on an external website.',url:'https://www.bookfinder.com/'},
 {name:'OAPEN',description:'Open-access scholarly books and PDFs.',url:site('library.oapen.org')},
 {name:'Wikisource',description:'Free texts and translations; check local rights.',url:site('wikisource.org')},
 {name:'Global Grey Ebooks',description:'Independent public-domain ebook catalog; verify local rights.',url:site('globalgreyebooks.com')},
 {name:'Faded Page',description:'Canadian public-domain ebooks; check local rights.',url:site('fadedpage.com')},
 {name:'Internet Archive',description:'Catalog, borrowing and eligible downloads; check access.',url:'https://archive.org/search?query='+p},
 {name:'OpenStax',description:'Openly licensed textbooks and downloads.',url:site('openstax.org')},
 {name:'Royal Road',description:'Author-published web fiction and serials.',url:site('royalroad.com')},
 {name:'Scribble Hub',description:'Author-published web fiction and serials.',url:site('scribblehub.com')},
 {name:'ManyBooks',description:'Free and paid ebook catalog; confirm the offer.',url:site('manybooks.net')},
 {name:'Google Drive — licensed files',description:'Search for publicly indexed files with open-license terms. Check the uploader, license and exact edition before reading.',url:site('drive.google.com','("Creative Commons" OR "open access" OR "public domain")')},
 {name:'Unglue.it',description:'Freely licensed ebooks; check available formats.',url:site('unglue.it')},
 {name:'Open Textbook Library',description:'Openly licensed textbooks from the Open Education Network.',url:site('open.umn.edu/opentextbooks')},
 {name:'Book Dash',description:'Openly licensed children’s picture books.',url:site('bookdash.org/books')},
 {name:'Library of Congress',description:'Selected digitized public-domain books; check local rights.',url:site('loc.gov/collections/selected-digitized-books')},
 {name:'Author / publisher free editions',description:'Search the web for publisher or author-authorized open-access copies.',url:'https://www.google.com/search?q='+encodeURIComponent(q+' ("Creative Commons" OR "open access" OR "public domain") (publisher OR author)')}
 ].map(item=>({...item,category:discoveryCategory(item.name)}));
}
function discoveryCategory(name){
 if(['BookFinder'].includes(name))return 'buy';
 if(['DOAB','OAPEN','OpenStax','Open Textbook Library'].includes(name))return 'academic';
 if(['Royal Road','Scribble Hub'].includes(name))return 'fiction';
 if(['Internet Archive','Library of Congress'].includes(name))return 'library';
 if(['Google Drive — licensed files','Author / publisher free editions'].includes(name))return 'web';
 return 'ebooks';
}
function filterDiscovery(items,category){return category==='all'?items:items.filter(x=>x.category===category);}
const sourceDefaults=Object.freeze({expandFree:false,expandArchive:true,expandWiki:true,expandAcademic:false,expandApple:false,expandAlternatives:true,groupMatches:true});
function sourcePreferences(value){const prefs={...sourceDefaults};if(value&&typeof value==='object'&&!Array.isArray(value))for(const key of Object.keys(prefs))if(Object.prototype.hasOwnProperty.call(value,key)&&typeof value[key]==='boolean')prefs[key]=value[key];return prefs;}
function trustedLink(value,source){
 if(typeof value!=='string'||!value||/[\s\\]/.test(value))return '';
 const hosts=source==='gutenberg'?'(?:www\\.)?gutenberg\\.org':source==='google'?'(?:books\\.google\\.com|play\\.google\\.com|books\\.googleusercontent\\.com)':'(?!)';
 const pattern=new RegExp('^https?://'+hosts+'(?::443)?/','i');
 return pattern.test(value)?value.replace(/^http:/i,'https:'):'';
}
function gutenbergAccess(record){
 if(record?.copyright!==false||!Number.isSafeInteger(record.id)||record.id<=0)return [];
 const formats=record.formats&&typeof record.formats==='object'?record.formats:{};
 const candidates=[['read','Read online','text/html'],['pdf','Download PDF','application/pdf'],['epub','Download EPUB','application/epub+zip'],['txt','Download TXT','text/plain'],['mobi','Download MOBI','application/x-mobipocket-ebook']];
 const result=[];
 for(const [kind,label,mime] of candidates){const entry=Object.entries(formats).find(([key,value])=>key.split(';')[0].trim().toLowerCase()===mime&&trustedLink(value,'gutenberg'));if(entry)result.push({kind,label,url:trustedLink(entry[1],'gutenberg')});}
 return result;
}
function googleAccess(access,sale,region){
 if(!access||access.country!==region)return [];
 const pd=access.publicDomain===true||access.accessViewStatus==='FULL_PUBLIC_DOMAIN';
 const freeSale=sale?.country===region&&sale.saleability==='FREE';
 const result=[];
 const reader=trustedLink(access.webReaderLink,'google');
 if(reader&&(pd||freeSale&&access.viewability==='ALL_PAGES'))result.push({kind:'read',label:'Read full book',url:reader});
 if(pd)for(const kind of ['pdf','epub']){const url=trustedLink(access[kind]?.downloadLink,'google');if(access[kind]?.isAvailable===true&&url)result.push({kind,label:'Download '+kind.toUpperCase(),url});}
 return result;
}
function matchAccess(book,filter){
 if(filter==='all')return true;
 if(filter==='deal')return (book.discountPct||0)>=30;
 if(filter==='free')return book.free===true||Array.isArray(book.accessLinks)&&book.accessLinks.length>0;
 if(filter==='borrow')return book.source==='Open Library'&&!!book.catalogUrl;
 return Array.isArray(book.accessLinks)&&book.accessLinks.some(x=>x.kind===filter);
}
function googleFreeUrl(query,region,exact){return 'https://www.googleapis.com/books/v1/volumes?q='+encodeURIComponent(exact?'isbn:'+exact:query)+'&country='+encodeURIComponent(region)+'&maxResults=20&printType=books&filter=free-ebooks';}
const bookDiscovery={discovery,filterDiscovery,sourcePreferences,gutenbergAccess,googleAccess,matchAccess,googleFreeUrl};if(typeof module==='object'&&module.exports)module.exports=bookDiscovery;else globalThis.BookScoutDiscovery=bookDiscovery;
