const test = require('node:test');
const assert = require('node:assert/strict');
const {gutenbergAccess, googleAccess} = require('./discovery.js');

test('Gutenberg rejects deceptive hosts and unknown copyright', () => {
  const record = {id: 42, copyright: false, formats: {'application/pdf': 'https://gutenberg.org.example.com/book.pdf'}};
  assert.deepEqual(gutenbergAccess(record), []);
  record.formats['application/pdf'] = 'https://www.gutenberg.org/book.pdf';
  assert.equal(gutenbergAccess(record)[0].kind, 'pdf');
  assert.deepEqual(gutenbergAccess({...record, copyright: null}), []);
});
test('Google access does not promote regional mismatch or preview to full access', () => {
  const access = {country:'US', viewability:'PARTIAL', webReaderLink:'https://books.google.com/books?id=1'};
  const sale = {country:'US', saleability:'FREE'};
  assert.deepEqual(googleAccess(access,sale,'US'), []);
  assert.deepEqual(googleAccess({...access,publicDomain:true},sale,'IN'), []);
  assert.equal(googleAccess({...access,viewability:'ALL_PAGES'},sale,'US')[0].kind,'read');
});
