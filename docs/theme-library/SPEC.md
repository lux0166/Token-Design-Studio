# Theme library — specification

Status: Implemented and verified within the confirmed scope. Date: 2026-10-16. See VERIFICATION.md for evidence.

## Outcome and sources

Help a Token Studio user discover genuinely different theme palettes, compare light/dark appearance, and apply a chosen theme to an existing design system or create a new one.

D-01 Confirmed: the user requested a mechanism like https://tweakcn.com/editor/theme and supplied screenshots contrasting six starting palettes with tweakcn's searchable theme chooser.
D-02 Confirmed: the user selected "Thư viện theme hoàn chỉnh: nhiều phong cách, tìm kiếm, xem trước sáng/tối, áp dụng vào hệ thống hoặc tạo hệ thống mới" rather than a full editor overhaul.
D-03 Existing evidence: Token Studio stores 32 colors per mode, radius/font/fontSize/spacing, locks, revision checks, history, CSS export and JSON snapshots. The six legacy presets alter only a small subset of colors.
D-04 Existing constraints: local ownership, no subscription, existing systems and token locks must be preserved. Preview cannot silently save an unrelated system.

## Scope

- Searchable local catalog with theme names, color swatches and source labels; include existing six presets and adapted public tweakcn presets.
- Show both light and dark palettes on representative cards, form controls and typography. Show contrast for standard pairs and supported settings.
- Explicit apply action for the current system, preserving its name and locked values. One undo restores the previous supported values.
- Create a system with a chosen theme and name through both the existing create entry and library.
- Include the user's saved design systems as reusable local choices; no cloud account or remote runtime dependency.
- Expose the catalog through MCP so an agent can discover real IDs and use the same templates.

Excluded: full tweakcn clone, Figma/v0 integration, public sharing/community accounts, AI generation, expanded shadow editor, arbitrary remote fonts, full upstream CSS fidelity, changes to Fluento.

## Rules and data

R-01 [D-01,D-02]: library names and swatches filter immediately; empty search results show a clear reset action. Selected preview remains stable when a search hides its row.
R-02 [D-02,D-04]: theme selection and light/dark toggling do not write to disk or history. Applying is explicit and keeps system ID/name, existing locks and locked values. State changes use the existing latest revision and atomic validation.
R-03 [D-02,D-03]: create writes complete supported light/dark tokens and settings with a new ID. Existing systems remain intact. Blank names and unknown theme IDs are rejected.
R-04 [D-03]: adapted presets contain all 32 colors per mode. Upstream missing tokens use documented defaults; converted colors use opaque HEX. Original font/shadow attributes outside the supported model are identified in the preview, not portrayed as installed. Existing six preset indices retain their meanings for backward compatibility.
R-05 [D-04]: catalog data is bundled at a pinned source revision, with provenance and license. The running application does not fetch theme code or execute upstream source.
R-06 [D-02,D-04]: applying visible unlocked values is a single reversible history action. UI and MCP explain any locked paths kept; stale revisions cannot overwrite newer edits.

## Acceptance

AC-01 [R-01]: Given the catalog, searching "cyber" shows Cyberpunk; unmatched text shows an empty state and resetting restores entries.
AC-02 [R-02]: Given a system, selecting multiple themes and preview modes leaves its persisted snapshot/revision/history unchanged.
AC-03 [R-02,R-06]: Given locked primary/radius, applying another theme keeps those values and locks, changes available values, and undo restores the full previous snapshot.
AC-04 [R-03]: Given a named selected theme, create produces a new selectable system with correct colors/settings; reload retains it.
AC-05 [R-04,R-05]: Every bundled theme passes the snapshot schema, has stable unique ID, and lists source/adaptation information. CSS export/import roundtrips supported values.
AC-06 [R-05,R-06]: MCP discovery, theme read, creation and apply work through real HTTP/stdio clients, respect revision/locks and use isolated test data.
AC-07: Desktop and narrow viewport are usable; dialog focus/Escape, search, buttons and scroll areas behave correctly. Build and relevant automated tests pass.

## Implementation and design decisions

Reuse the existing React shell, native Dialog/CopyButton, CSS preview conventions, store and import/export pipeline. Add a library navigation destination and reuse the browser in the create dialog. Use the current white/green Token Studio chrome, with theme colors confined to preview cards. On small screens, stack the list and preview with bounded list scrolling. Keep source information near the preview.

The catalog adapts upstream palettes and compatible settings to Token Studio's current model. This is deliberate implementation within the selected library scope; it does not add the excluded full typography/shadow editor.

Open material questions: none for this scoped library. Full editor parity remains a separate request.
