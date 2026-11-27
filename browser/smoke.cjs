'use strict';
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost'),relative=url.pathname==='/'?'index.html':url.pathname.slice(1);
  if(!/^[a-zA-Z0-9._-]+$/.test(relative)||!mime[path.extname(relative)]){res.writeHead(404).end();return}
  const content=await fs.readFile(path.join(root,relative));res.writeHead(200,{'Content-Type':mime[path.extname(relative)]});res.end(content);
 }catch{res.writeHead(404).end();}
});
const title='Pride and Prejudice',author='Jane Austen';
const google={items:[{id:'g1',volumeInfo:{title,authors:[author]},accessInfo:{country:'IN',publicDomain:true,viewability:'ALL_PAGES',webReaderLink:'https://books.google.com/books?id=g1',pdf:{isAvailable:true,downloadLink:'https://books.google.com/books/download/g1'}},saleInfo:{country:'IN',saleability:'NOT_FOR_SALE'}}]};
const gutenberg={results:[{id:1342,title,authors:[{name:author}],copyright:false,formats:{'text/html':'https://www.gutenberg.org/ebooks/1342.html.images','application/epub+zip':'https://www.gutenberg.org/ebooks/1342.epub3.images'}}]};
const open={docs:[{key:'/works/OL123W',title,author_name:[author]}]};
async function main(){
 let browser,releaseGutenberg;const delayed=new Promise(r=>releaseGutenberg=r);
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 const base='http://127.0.0.1:'+server.address().port;
 try{
  browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block',acceptDownloads:true});
  await context.addInitScript(()=>{if(!localStorage.getItem('bookscout-source-preferences-v1'))localStorage.setItem('bookscout-source-preferences-v1',JSON.stringify({expandArchive:false,expandWiki:false,expandFree:false,expandAcademic:false,expandApple:false,expandAlternatives:false,groupMatches:true}));localStorage.setItem('bookscout-country','IN')});
  let openAttempts=0,googleCalls=0,gutenbergCalls=0;
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.setDefaultTimeout(10000);
  await page.route('**/*',async route=>{
   const u=new URL(route.request().url());
   if(u.origin===base)return route.continue();
   const json=(data,status=200)=>route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(data)});
   if(route.request().method()==='HEAD')return route.fulfill({status:200,headers:{'access-control-allow-origin':'*'}});
   if(u.hostname==='www.googleapis.com'){googleCalls++;return json(google);}
   if(u.hostname==='openlibrary.org'){openAttempts++;return json(open,openAttempts===1?503:200);}
   if(u.hostname==='gutendex.com'){gutenbergCalls++;await delayed;return json(gutenberg);}
   return route.abort();
  });
  await page.goto(base);await page.locator('#query').fill(title);await page.locator('#searchForm button[type=submit]').click();
  await page.locator('#results .book').first().waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('#sourceStatus').textContent.includes('Project Gutenberg: searching'));
  assert.match(await page.locator('#results').innerText(),/Google Books/);
  console.log('PASS: progressive results render before the delayed provider');
  releaseGutenberg();
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Prices and access can change'));
  await page.getByRole('button',{name:'Retry Open Library',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#sourceStatus').textContent.includes('Open Library: 1 found'));
  assert.equal(openAttempts,2);assert.equal(googleCalls,1);
  assert.equal(await page.locator('#results .grouped-book').count(),1);
  console.log('PASS: failed provider retry retains and groups results');
  await page.locator('[data-filter=epub]').click();
  assert.equal(await page.locator('#results .book').count(),1);
  assert.match(await page.locator('#results').innerText(),/Download EPUB/);
  await page.locator('#linkPanel summary').click();
  const downloaded=page.waitForEvent('download');await page.locator('#exportLinks').click();
  const file=await downloaded;assert.equal(file.suggestedFilename(),'bookscout-access-links.csv');
  const csv=await fs.readFile(await file.path(),'utf8');assert.match(csv,/gutenberg\.org\/ebooks\/1342\.epub3\.images/);assert.doesNotMatch(csv,/books\.google\.com/);
  await page.locator('#checkLinks').click();await page.waitForFunction(()=>document.querySelector('#linkSummary').textContent.includes('2 checked'));
  console.log('PASS: format filtering, CSV download and link check UI');
  await page.locator('#results .save-book').click();assert.match(await page.locator('#savedCount').textContent(),/\(1\)/);
  await page.locator('#shareSearch').click();const share=new URL(await page.locator('#shareLink').inputValue());assert.equal(share.searchParams.get('q'),title);assert.equal(share.searchParams.get('country'),'IN');
  await page.locator('#refreshSearch').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Prices and access can change'));
  assert.equal(googleCalls,2);assert.equal(gutenbergCalls,2);
  await page.setViewportSize({width:390,height:844});await page.locator('[data-filter=free]').click();await page.locator('#results .book').first().waitFor({state:'visible'});
  await page.reload();assert.match(await page.locator('#savedCount').textContent(),/\(1\)/);
  await page.locator('#library > summary').click();await page.locator('.shelf-panel > summary').click();
  assert.equal(await page.locator('.shelf-links a').count(),2);
  await page.locator('.reading-progress').fill('42');await page.getByRole('button',{name:'Save progress',exact:true}).click();
  assert.match(await page.locator('.shelf-panel summary').textContent(),/42%/);
  await page.reload();await page.locator('#library > summary').click();await page.locator('.shelf-panel > summary').click();
  assert.equal(await page.locator('.reading-progress').inputValue(),'42');
  assert.equal(await page.locator('.shelf-links a').count(),2);
  console.log('PASS: reading progress and access links persist after reload');
  await page.locator('#shelfFilter').selectOption('finished');
  assert.equal(await page.locator('#savedList .saved-row').count(),0);
  await page.locator('#shelfFilter').selectOption('reading');
  assert.equal(await page.locator('#savedList .saved-row').count(),1);
  await page.locator('#shelfSearch').fill('no-such-book-xyz');
  assert.equal(await page.locator('#savedList .saved-row').count(),0);
  await page.locator('#shelfSearch').fill(title);
  assert.equal(await page.locator('#savedList .saved-row').count(),1);
  await page.locator('#shelfSearch').fill('');
  await page.locator('#shelfFilter').selectOption('all');
  if(!(await page.locator('.shelf-panel').evaluate(el=>el.open)))await page.locator('.shelf-panel > summary').click();
  await page.getByRole('button',{name:'Mark finished',exact:true}).click();
  await page.locator('#shelfFilter').selectOption('finished');
  assert.equal(await page.locator('#savedList .saved-row').count(),1);
  assert.match(await page.locator('.shelf-panel summary').textContent(),/100%/);
  console.log('PASS: shelf status and text filters with quick completion');
  await page.locator('#shelfSort').selectOption('title');
  await page.locator('#shelfSearch').fill('no-such-book-xyz');
  assert.equal(await page.locator('#savedList .saved-row').count(),0);
  await page.locator('#clearShelfFilters').click();
  assert.equal(await page.locator('#shelfSort').inputValue(),'recent');
  assert.equal(await page.locator('#shelfFilter').inputValue(),'all');
  assert.equal(await page.locator('#shelfSearch').inputValue(),'');
  assert.equal(await page.locator('#savedList .saved-row').count(),1);
  console.log('PASS: shelf filter reset');
  assert.deepEqual(errors,[],'Browser must not throw uncaught exceptions');
  console.log('PASS: save persistence, share URL, refresh and mobile viewport interaction');
  await context.close();
 }finally{releaseGutenberg();if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1});
