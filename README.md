# BookScout

Free, client-side book discovery and price tracking. Search Google Books, Open Library and Project Gutenberg (Gutendex); compare legitimate free access and known digital prices. Retailer links are searches, not verified live quotes. Manual print/used quotes include shipping. Saved books, country-specific watch targets and price history stay in browser storage.

## Run locally

```sh
python -m http.server 8000
```

Open http://localhost:8000. No API key or build required. Run `node --test` for the automated checks (Node 20+).

## Publish on GitHub Pages

After merging, open Settings → Pages → Build and deployment → Deploy from a branch → main / (root). The app is designed for subpath hosting. HTTPS or localhost is required for the service worker. On supported browsers use the install menu. The shell works offline after its first successful load; catalog searches need internet. Installation has not yet been verified on an Android device.

Export a JSON backup before switching browser/origin. Restore explicitly replaces the existing saved library and history after confirmation. Price tracking requires manual rechecks; there are no scheduled alerts or live print prices. Free access is subject to local copyright rules.

## ISBN lookup

Use a printed ISBN, supported browser camera scanner, or barcode photo. Camera and photo processing are local; no images are uploaded. BarcodeDetector and camera availability vary by browser. If unsupported, enter the ISBN manually. ISBN searches use Open Library's ISBN-keyed Books API and Google Books identifiers; title searches still return work-level catalog results. Binding is shown only if the source supplies it.

## More discovery options

Use the optional free-ebook search to request Google's documented free catalog in addition to the usual search; only region-verified free results are included. Gutenberg searches are no longer restricted to English. Standard Ebooks, DOAB, Google full-view search and BookFinder are external discovery links, not imported offers; check title, edition and local access. Choose system, light or dark appearance in the header. Theme preference stays on this device.

## Price comparison and basket

Saved books now have a unified dated offer list and a basket subtotal by country and format. Shipping is included for manual quotes; the newest quote for each store/format is used rather than a stale historic minimum. The basket defaults to records no older than seven days, explicitly reports missing prices, and is an estimate, not a checkout total. No automatic print-store prices or background polling are provided.

## Experimental Apple Books price lookup

Enable the Apple Books option to request the documented iTunes Search API (https://performance-partners.apple.com/search-api). ISBN searches use the lookup endpoint. Results are separate digital editions with price only when a numeric price and matching storefront currency are returned. An ISBN is not inferred from the lookup response; prices are not recorded in Google Books watch history. Apple Books URLs must match the requested storefront and book ID. No Apple artwork or previews are used. Browser cross-origin restrictions may prevent direct JSON requests: if so the source reports unavailable; no proxy or remote script execution is used. The API has rate limits; the option is off by default. Physical shop prices remain manual. Live compatibility has not yet been verified.

## Free reading and downloads

Read online, PDF, EPUB, TXT and MOBI filters operate on explicit provider metadata. Public-domain Gutenberg records expose available formats from Gutendex (US status; check local rights). Google Books full reading and direct PDF/EPUB links require region-appropriate access metadata and public-domain status for downloads; preview and acquisition links remain separate. Library records are not confirmed loans. Expanded discovery links cover independent free-reading websites, public libraries, open textbooks, web fiction and Google Drive searches constrained by open-license terms. External results are not imported, verified, or labeled as direct downloads; confirm rights and edition on the source. The app does not sign into Drive or scan private files. All downloads are handled by the provider, not BookScout. See https://developers.google.com/books/docs/v1/reference/volumes and https://github.com/garethbjohnson/gutendex for metadata definitions.

## Internet Archive catalog

Title and author searches optionally query Internet Archive's Advanced Search API and inspect at most five item manifests (https://archive.org/developers/). Search queries request texts with license metadata; the item is independently checked for a recognized Creative Commons license/public-domain mark, restriction flags and eligible non-private file formats. The archive viewer and PDF, EPUB or TXT links are constructed from the returned manifest. This does not independently prove uploader rights, completeness, local public-domain status or actual download success. Restricted items, obvious samples and unlicensed records are excluded. ISBN searches do not use this source; search title and author instead. Browser/API failures are reported as unavailable. No paid key is required.
