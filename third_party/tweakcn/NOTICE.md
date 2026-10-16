# Adapted tweakcn theme data

Source: https://github.com/jnsahaj/tweakcn
Revision: a3b47b37cba97dd637de517aab52c45ec0f83456
Original file: utils/theme-presets.ts
License: Apache License 2.0, included in LICENSE in this directory.

Token Studio bundles 42 adapted palette presets in shared/catalog/tweakcn.json. Upstream UI code is not copied. The sync script parses only literal object data without executing upstream code. Modifications: normalize opaque colors to uppercase HEX, complete the 32 supported tokens from defaults when absent, adapt radius and fonts to the existing settings model, and record omitted typography/shadow properties. The original theme names are retained for attribution and discovery; the rendering is an adaptation, not a claim of exact upstream fidelity or affiliation.

Refresh deliberately with `npx tsx scripts/sync-theme-catalog.ts` after reviewing the pinned revision. The running application has no remote theme dependency.
