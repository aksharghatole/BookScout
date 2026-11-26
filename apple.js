'use strict';
function appleUrl(query,region,exact){if(!['IN','US','GB'].includes(region))throw Error('Unsupported storefront');return 'https://itunes.apple.com/'+(exact?'lookup?isbn='+encodeURIComponent(exact):'search?media=ebook&entity=ebook&term='+encodeURIComponent(query))+'&country='+region+'&limit=15';}
function appleBooks(data,region,exact=''){
 const currency={IN:'INR',US:'USD',GB:'GBP'}[region];if(!currency||!Array.isArray(data?.results))return [];
 const rows=[];
 for(const v of data.results.slice(0,30)){
  if(!v||v.kind!=='ebook'&&v.kind!=='book'||typeof v.trackName!=='string'||!v.trackName.trim()||!Number.isSafeInteger(v.trackId)||v.trackId<=0)continue;
  const match=String(v.trackViewUrl||'').match(/^https:\/\/(?:books|itunes)\.apple\.com\/(in|us|gb)\/book\/(?:[^/?#]+\/)?id(\d+)(?:[?#].*)?$/i);
  if(!match||match[1].toUpperCase()!==region||Number(match[2])!==v.trackId)continue;
  const raw=v.price??v.trackPrice;
  const price=typeof raw==='number'&&Number.isFinite(raw)&&raw>=0&&raw<=1e9&&v.currency===currency?{amount:raw,currencyCode:currency}:null;
  rows.push({id:String(v.trackId),source:'Apple Books',title:v.trackName,author:typeof v.artistName==='string'?v.artistName:'',year:typeof v.releaseDate==='string'?v.releaseDate.slice(0,4):'',isbn:'',editionNote:exact?'ISBN lookup · verify digital edition':'Digital edition · ISBN not supplied',retailPrice:price,discountPct:0,free:false,buyUrl:'https://books.apple.com/'+region.toLowerCase()+'/book/id'+v.trackId});
 }
 return rows;
}
const apple={appleUrl,appleBooks};if(typeof module==='object'&&module.exports)module.exports=apple;else globalThis.BookScoutApple=apple;
