# Print-to-PDF Menu — Design Spec

**Date:** 2026-06-17
**Site:** B&R Seafood and More (`sites/br-seafood`)
**Status:** Approved, ready for implementation planning

## Problem

The admin site can edit the menu, and a "Download PDF" button already exists
([admin.html:182](../../../admin.html), [admin.js:573-713](../../../js/admin.js)).
It uses **html2pdf / html2canvas**, which screenshots a DOM element and rasterizes it.
That approach produces **blank pages** when exported (the reported failure) and, even
when it works, yields blurry, non-selectable text and an off-brand layout.

Two goals, one fix:
1. **Fix:** PDF export currently downloads blank pages.
2. **Improve:** the printed menu should be a polished, brand-matched, print-ready layout.

## Decision

Replace the html2canvas rasterization with a **native browser print** flow (Approach A).
Build a self-contained, print-styled HTML menu and call `window.print()`; the admin uses
the browser's print dialog to **Save as PDF** or print to a physical printer.

Approaches considered:
- **A — Native print window/iframe (chosen):** reliable, crisp vector text, full CSS
  control, matches "print it as a PDF menu." One extra click (choose "Save as PDF").
- **B — Fix + restyle html2pdf:** keeps one-click download but stays rasterized,
  blurry, and fragile; poor multi-page break control. Rejected.
- **C — Server-side PDF (Vercel function):** overkill for a static site; adds a
  serverless dependency and cost. Rejected.

## Architecture & Data Flow

- The print reflects the **in-memory `menuData`** — i.e. the current editor state,
  including unpublished edits. "Use the updated menu" works as expected.
- New function `printMenu()` replaces `downloadMenuPdf()`:
  1. Build a **complete, self-contained HTML document string** from `menuData`
     (active items only) with an embedded `<style>` print stylesheet.
  2. Inject it into a **hidden iframe** (avoids popup-blocker issues that
     `window.open` can hit).
  3. Wait for the iframe `load` event **and** `iframe.contentWindow.document.fonts.ready`,
     then call `iframe.contentWindow.print()`.
  4. The browser's print dialog opens → admin chooses **"Save as PDF"** or a printer.
  5. Clean up the iframe after printing (e.g. on `afterprint` or a timed removal).
- **Remove** the html2pdf CDN `<script>` ([admin.html:748](../../../admin.html)) and the
  old `buildPrintableMenu` / `downloadMenuPdf` / html2canvas code in
  [admin.js:571-713](../../../js/admin.js) — that code is the source of the blank pages.
- **Button** ([admin.html:182-183](../../../admin.html)): relabel to
  **"Print Menu / Save as PDF"** with a print icon; rewire its click handler
  ([admin.js:1047](../../../js/admin.js)) to `printMenu()`.

## Print Layout (brand-matched)

Brand tokens (from `css/styles.css`): navy `#0a1628`, teal `#0d9488`, gold `#f59e0b`,
fonts Playfair Display (display) + Poppins (body).

- **Page:** Letter, portrait. Real print CSS — `@page { margin }`, and
  `break-inside: avoid` on each item and category so nothing splits awkwardly across
  pages; category headers stay with their content.
- **Header:** "B&R Seafood and More" in Playfair Display, tagline
  ("Golden Fried Seafood & Southern Sides"), gold rule using the **correct** brand gold
  `#f59e0b` (fixes the old off-brand `#d4a44c`).
- **Dinner Plates** (`dinners`): item name + price (teal), description, featured ★ and
  badge text (e.g. "Best Seller"). Includes the category badge "Includes 2 Sides".
- **Southern Sides** (`sides`): compact multi-column list, "Choose 2 with any dinner"
  badge, no prices (matches the public page).
- **Specialty Items** (`specialty-sides`): item name + price.
- **Menu note:** callout with gold left-border (`menuData.settings.menuNote`).
- **Footer:** address + phone — "6 2nd St NE, Minot, ND 58703 • (701) 818-3664".
- Only categories with at least one active item are rendered; empty categories are
  skipped (mirrors the public renderer behavior).
- Text is vector and selectable — crisp at any zoom, small file size.

## Fonts

The print document links Google Fonts (Playfair Display + Poppins) and the flow waits on
`document.fonts.ready` before printing so the dialog preview renders with brand fonts.
If fonts fail to load (e.g. offline), CSS fallbacks (`Georgia, serif` / `system-ui,
sans-serif`) keep the menu legible.

## Testing / Verification

Static site → manual in-browser verification:
1. Open admin → **Menu** tab; confirm `menuData` is loaded (preview renders).
2. Click **Print Menu / Save as PDF**.
3. Confirm the print dialog preview shows the **fully styled, non-blank** menu with all
   active items, brand fonts/colors, and clean page breaks.
4. Save as PDF; open the file and confirm it is not blank and contains every active item.
5. Edit an item (without publishing), reprint, and confirm the change appears — proving
   it uses the live editor state.

Optionally automate the dialog-open + rendered-content check with Playwright.

## Out of Scope

- One-click auto-download (rejected with Approach A).
- A separate physical-print vs. save-as-PDF button split (single button covers both via
  the native dialog).
- Server-side PDF generation.
- Changes to publishing, events, or site-settings flows.
