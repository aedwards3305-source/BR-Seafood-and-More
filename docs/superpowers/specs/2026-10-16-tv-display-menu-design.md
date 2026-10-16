# TV Display Menu Export — Design Spec

**Date:** 2026-10-16
**Site:** B&R Seafood and More (`sites/br-seafood`)
**Status:** Implemented

## Problem

B&R is installing a TV (onn ONA32HB19E03, 32" 720p LED) above the checkout window
on the food trailer, to show the menu to customers in line. It will run two ways
over time:

1. **Now:** a USB flash drive plugged straight into the TV's own Media Player.
2. **Later:** a laptop wired in over HDMI, once one is set up at the trailer.

The admin site already has a live menu editor and a print-to-PDF export
([2026-06-17-print-menu-pdf-design.md](2026-06-17-print-menu-pdf-design.md)), but
nothing sized or styled for a TV, and nothing that produces a laptop-ready file.
The trailer has no reliable WiFi or hotspot, so both outputs have to be
self-contained — no live fetch, no dependency on a connection at the trailer.

## Decision

Add a **TV Display Menu** section to the admin Menu tab (next to Publish Changes)
with two one-click exports, both built from the same in-memory `menuData` used by
the rest of the editor:

1. **USB Drive Slideshow (`.zip`)** — a set of 1920x1080 JPEGs, one per slide,
   zipped for copying onto a FAT32 flash drive. Phase 1.
2. **PowerPoint for Laptop (`.pptx`)** — the identical slides, each embedded as a
   full-bleed image on its own slide. Phase 2.

Both outputs are generated from one shared renderer (`buildTvSlides()`) so the
flash-drive slideshow and the PowerPoint are pixel-identical. Slides are drawn
directly on an off-screen `<canvas>` (not `html2canvas`/DOM screenshotting) —
the project's prior print-PDF feature hit blank-page bugs from screenshotting
during `window.print()`, so this avoids that whole failure class and gives full
control over text wrapping and layout. Because each PowerPoint slide is a
rasterized image rather than live text, the laptop needs no particular fonts
installed and can't have layout shift on open.

## Why not a live auto-updating webpage

Considered building a `tv-display.html` kiosk page that fetches `data/menu.json`
and stays in sync automatically. Rejected for now because the trailer has no
dependable connection for the laptop to load or refresh it — a connection-dependent
display is a worse failure mode than a static export that's a few days stale.
If the trailer gets WiFi or a hotspot later, that page is worth revisiting; the
export buttons here don't block it.

## Slide content and layout

1920x1080 canvas (renders crisp at any TV resolution the panel downscales to).
Navy-to-ocean gradient background, white/teal/gold accents — matches the site's
brand tokens but intentionally distinct from the print menu's white-paper look,
since a TV board benefits from higher contrast. Item **descriptions are left off**
on purpose: a menu board favors large, scannable name + price over paragraph
copy read from a few feet away; full descriptions stay on the printed menu and
public site.

Slide order (empty categories are skipped, same as the public renderer):

1. **Welcome** — brand name, tagline, "Family Owned & Operated".
2. **Dinner Plates**, paginated 8 items per slide (2 cols x 4 rows, fixed grid so
   row height doesn't change between pages) — name (wrapped, up to 2 lines),
   price, a gold left-bar + "Best Seller"-style badge for featured items. Shown
   as "1 of 2" etc. when there's more than one page.
3. **Southern Sides & Specialty** (one combined slide) — sides as a wrapping chip
   grid (no price, matches the public page), the menu note as a gold-bordered
   callout, and specialty items as a smaller chip row with price. Skipped
   entirely if sides, specialty, and the menu note are all empty.

## Implementation

- `js/admin.js` — new "TV DISPLAY MENU EXPORT" section: canvas drawing helpers
  (`tvWrapText`, `tvRoundRect`, `tvBaseSlide`), per-slide-type draw functions,
  `buildTvSlides()` (shared renderer, waits on `document.fonts.ready`),
  `downloadTvImages()` (JSZip), `downloadTvPowerPoint()` (pptxgenjs, `LAYOUT_WIDE`
  = 13.333in x 7.5in native widescreen, one full-bleed image per slide).
- `admin.html` — new "TV Display Menu" card in the Menu tab's publish column;
  CDN script tags for `jszip@3.10.1` and `pptxgenjs@3.12.0` (pinned, no bundler
  in this static-site project — same pattern as the Font Awesome CDN tag).
- `css/admin.css` — small additions for the new card's badge/help text.

pptxgenjs has no auto-advance or loop-continuously API (checked the bundle
directly — no `advTm`/transition properties exist in 3.12.0), so that's a
one-time manual setup the first time the file is opened on the laptop:
**Transitions tab → Advance Slide After (e.g. 8s) → Apply to All, then
Slide Show tab → Set Up Show → Loop continuously until 'Esc'.** PowerPoint
remembers these settings in the file itself, so it only has to be done once per
export — re-running the export after a menu edit produces a new file that needs
the same one-time setup again. This is called out in the admin UI's help text
and in the hardware build doc.

## Testing / Verification

- `node -c js/admin.js` — syntax check.
- Served the real `admin.html` locally, logged in, clicked both export buttons
  via Playwright: both downloads fired with no console errors (only the
  expected `favicon.ico` 404).
- Unzipped the USB export: 4 valid 1920x1080 JPEGs.
- Validated the `.pptx` with the pptx skill's `validate.py` (all checks passed),
  then opened it in actual PowerPoint via COM automation and exported each
  slide to PNG — confirmed all 4 slides render correctly, full-bleed, matching
  the JPEGs pixel-for-pixel.
- Visually reviewed a standalone prototype of the canvas renderer against the
  live menu data before porting it into `admin.js`, iterating on dinner-slide
  row-height consistency across paginated pages.

## Out of Scope

- The live auto-updating kiosk webpage (see above) — revisit if the trailer
  gets a connection.
- Per-item icons on the TV slides (Font Awesome glyph-on-canvas mapping was
  judged not worth the fragility for a signage board; typographic hierarchy
  and color accents carry featured/specialty status instead).
- Using `images/qr-code.png` on the welcome slide — the file is untracked and
  its target link isn't established elsewhere in the site, so no caption could
  be written without guessing. Worth adding once its destination is confirmed.
- Changes to publishing, events, or site-settings flows.
