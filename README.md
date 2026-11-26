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
