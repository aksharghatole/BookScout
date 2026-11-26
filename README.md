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

## Wikisource and relevance ranking

English Wikisource is searched directly using the MediaWiki Action API (`generator=search`, namespace 0, `origin=*`). The optional source is enabled by default for title and author queries, not ISBN. Results link to online texts; no PDF or full-book guarantee is inferred. Obvious chapters, disambiguation pages and pages explicitly categorized as incomplete are skipped; proofread and validated labels reflect available catalog categories, not independent completeness verification. Other texts are labeled completeness not verified. Local copyright and edition still need checking. Search ranking now uses whole normalized words, exact-title/ISBN preference and free-access tie-breaking; it avoids substring matches such as `art` within `earth`. See https://www.mediawiki.org/wiki/API:Search and https://en.wikisource.org/wiki/Help:Text_status.

## Academic book discovery (experimental)

Enable the academic search option for DOAB and OAPEN REST catalog searches. The adapter requests metadata and bitstreams together (up to 12 records per provider), limits results to recognized book types, and checks ISBNs for exact searches. A recognized declared Creative Commons license is required for free badges and direct original PDF/EPUB file links. Links use only provider-relative retrieval paths and original-file metadata. Catalog pages are separate from download links; no file or reader is assumed when metadata is missing. Live endpoint compatibility and browser CORS are unverified; failures report unavailable. No keys or paid services are required. See https://doabooks.org/en/librarians/doab-metadata and https://oapen.org/article/metadata.

## Grouped search results

Matching records are grouped by validated ISBN or normalized matching title and author. Grouping is conservative: records with unknown authors are not grouped solely by title. The group shows provider count, free-access count and formats, and preserves each source card's own links, declared rights, price, ISBN and save action. Different editions may appear in a work-level group; no price or access is transferred between records. Disable grouping to view individual cards. Filters operate on the source records before grouping. Price sorting uses the minimum recorded price in each visible group, with free-access records treated as zero for discovery ordering (not checkout quotes).

## Progressive search and retries

Providers run independently; results, group ordering and provider statuses update as requests finish. Failed sources have individual Retry buttons, while successful results remain visible. Superseded searches and changed storefronts cannot update the current result list or price history. A pending filter view indicates that additional providers are still searching. No persistent result cache is introduced; each search fetches fresh source metadata. Live browser timing and rendering still need verification.

## Catalog cache and shareable searches

Successful nonempty catalog results from Open Library, Gutenberg, Wikisource, DOAB and OAPEN can be reused for five minutes in the current tab, with at most 40 entries. Cache keys include query, provider and storefront. Price sources and Internet Archive manifest checks are always fresh; failed or empty results are not cached. Cached sources are labeled, and Refresh all sources bypasses the cache. No persistent or cross-device catalog storage is used. Share search generates a URL containing only the current query and country; opening that URL starts a new search with the recipient's selected source options. The browser clipboard is optional; a selectable URL is available if copying fails.

## Source preferences and discovery categories

Optional provider selections and grouped-results preference are remembered in browser local storage. Core catalog sources remain enabled. Use Search with selected sources to rerun with the chosen options, or Reset preferences to restore defaults. External discovery has category filters for ebooks, academic books, fiction, libraries, licensed public web files and price comparison. New destinations include Unglue.it, Open Textbook Library, Book Dash and Library of Congress selected digitized books. These are targeted searches only, not confirmed book matches or direct file links. Google Drive searches remain constrained to open-license terms; no Drive account access is requested.

## ISBN alternative editions

ISBN searches still retain the exact edition records. When a catalog returns the requested ISBN with a usable title and author, external discovery uses those details instead of the bare ISBN. The default optional alternative-edition search also queries Gutenberg and Google's free catalog with that title and author; matches require the normalized title and author names to agree, a free-access flag, and no claim to the requested ISBN. Author word order may differ. Alternative records are labeled and retain their own source and identifiers; they are excluded from automatic ISBN price observations. No title is guessed if ISBN metadata is absent, and alternatives may differ in translation, formatting or content. No independent live file or copyright verification is implied.

## Reading and download link collection

The link panel collects up to 500 deduplicated source-provided access links from the active result filter, with the first 30 displayed and CSV export of the full collection. It retains source, author, ISBN, format and alternative-edition status. Spreadsheet formula-like values are escaped. An optional user-triggered check sends credential-free HTTPS HEAD requests to up to 12 unique approved provider URLs, three at a time, with eight-second timeouts and no redirect following. A 2xx response is labeled responded, 404/410 not found, and CORS errors, blocked requests, redirects or other statuses unverified. No content is downloaded and no source is treated as a verified complete or authorized book solely on HTTP response. A new search cancels outstanding checks. Google Drive and other external discovery links are not included as actual download links.

## Browser smoke checks

The GitHub Actions workflow runs the Node unit suite and a separate Playwright Chromium smoke check. The browser script serves the app on a local ephemeral port, intercepts catalog requests with deterministic fixtures, and exercises actual DOM rendering, progressive search, individual retries, grouping, filters, CSV export, link-status UI, saved-book persistence, share links, fresh search and a mobile viewport. It does not contact real catalogs or certify real download availability. Service workers are blocked in this browser fixture; offline asset presence remains covered by unit tests. Browser tooling is development-only. To run locally: `npm install --no-save --package-lock=false playwright@1.63.0`, `npx playwright install chromium`, then `node browser/smoke.cjs`. CI uses supported v6 checkout and setup-node actions and cancels superseded runs for the same ref.

## Reading shelf

Saving a result stores its allowlisted source-provided reading/download links with the storefront and capture date. The reading shelf offers manual progress from 0–100%, link removal and a Save current access links control on already saved results. Stored links are historical references, not live access verification; no books are downloaded or hosted locally. Shelf fields are optional in the existing backup format and validated during restore, maintaining compatibility with older backups. The browser smoke suite also verifies persistence of saved links and reading progress across reloads.
