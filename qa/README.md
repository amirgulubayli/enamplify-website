# QA evidence

`unit-tests.txt` — Node’s built-in test runner: content integrity, links, Markdown escaping, metadata and optional delivery safeguards. Provider responses are mocked, and no real messages are sent.

`browser-report.json` — 38 pages at four widths (152 rendering cases), plus interaction checks and 39 local HTTP checks. The browser environment blocked localhost navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`; the actual generated page HTML was therefore rendered with identical local CSS/JS inlined. Real route responses were checked separately over the local HTTP server. This is not claimed as a browser test of a live cloud deployment.

External image/font requests were deliberately unavailable during browser checks. The screenshots exercise the graceful fallbacks; they do not prove Google Font or portrait delivery over a real network.

`pdf-report.json` — PDF page counts and text extraction. All six printed pages were rendered for visual review, with no clipped or overlapping content found.

`build.json` — build date, route count, canonical origin, indexing mode, form mode and asset sizes.

`browser_checks.py` — repeatable Playwright/Chromium rendering and interaction script. Its environment requires Python and Playwright; the website itself does not.

No automated test suite guarantees every browser, screen-reader combination or third-party service. Live deployment verification and broader accessibility review remain launch checks.
