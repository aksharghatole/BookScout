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
