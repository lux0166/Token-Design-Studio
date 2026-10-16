# Theme library verification

Verified 2026-10-16 against the scope in SPEC.md.

## Delivered

- 48 bundled choices: six existing Token Studio presets and 42 adapted tweakcn palettes. Saved local design systems are additional reusable choices.
- Search, source filters, empty results/reset, light/dark preview, supported settings and seven contrast pairs.
- Explicit apply to the current system with locked values retained; creation from a named theme through the library and existing create entry point.
- MCP list_themes, get_theme, apply_theme and themeId support in create_system; HTTP and stdio parity, theme catalog resource and updated agent guidance.
- Bundled source data pinned to a public upstream commit, Apache-2.0 license and attribution. Upstream code is parsed as object literals during intentional refresh, never executed.

## Automated evidence

`npm test`: 16 passed, zero failed. Coverage includes all 48 catalog snapshots, schema validation and CSS roundtrip, stable IDs, independent cloned reads, search, personal reuse, lock preservation and single-action undo. The real HTTP/stdio integration test checks catalog access, creation, preview without writes, stale/missing revisions, invalid theme IDs returning HTTP 400 without state changes, and existing store/import protections.

`npm run build`: passed, including TypeScript project checks and Vite production bundling. Rollup reported two annotation-position warnings in dependency Zod; the production bundle completed successfully.

## Browser evidence

Tested the running React application at http://127.0.0.1:5173/:

- Searching Elegant/Cyber/Sage, choosing themes, changing preview modes and resetting unmatched search results worked. The selected preview remained available when search hid its row.
- Comparing backend snapshots before and after preview interactions proved revision and persisted systems did not change.
- Created `Theme Lab · Cyberpunk` through the actual dialog, then reloaded and verified its saved colors and availability.
- On that sample system, locked light.primary and settings.radius, applied Vintage Paper, verified both locks/values were retained and other colors changed, then used one undo to restore the complete prior snapshot.
- Compared the original four local systems before and after this exercise: all remained unchanged. The additional sample system remains available for inspection.
- At 390 × 844, main and document client/scroll widths both measured 375 CSS pixels: no horizontal overflow. The stacked list/preview worked; the create dialog fit within the viewport and Escape closed it. Opening create from the mobile drawer now closes that drawer.
- The desktop library fit at 1536 × 1250. Final browser console inspection returned no warnings or errors.
- Temporary device emulation was cleared after screenshots; the selected original system is Fluento · Learning, with an unapplied Elegant Luxury preview.

Screenshots: desktop.png, dark.png and mobile.png. These are application captures, not upstream screenshots.

## Practical limits

This is the agreed theme-library upgrade. It does not implement all tweakcn editor controls, cloud/community features, Figma export or a React component registry. Palettes are adapted to Token Studio's existing 32 colors per mode and supported settings. Upstream fonts may be substituted and per-theme shadows are unsupported; the UI lists compatibility notes. Contrast results describe the actual preview and do not promise every bundled palette meets AA.

The source skill, installed local skill and packaged .skill artifact were updated with catalog discovery and safe theme application instructions. See README.md and third_party/tweakcn/NOTICE.md for operation and provenance.
