# Verification — Token Studio 0.1.0

## Automated verification

`npm test`: 11 passing tests. Validated persistence, atomic lock enforcement (including refusal of a whole mixed batch), stale revision rejection, logging without revision changes, schema and CSS injection rejection, HSL/OKLCH/RGB import, full CSS roundtrip, WCAG luminance and failure ordering, corrupt-file preservation, and 60-entry history with undo after reload.

Integration uses a real SDK Streamable HTTP client and stdio client against an isolated HTTP server and temporary data. It verifies all eight tools are listed, reads, writes reflected in the editor API, locked batch refusal, failed call logging, contrast, CSS export, import preview/apply, workspace resource, Host validation and cross-origin rejection. Test data does not touch the user's workspace.

`npm run typecheck` and `npm run build` passed. Build emits upstream Rollup PURE-comment annotation warnings in zod; output compiles successfully. npm installation audit reported no vulnerabilities.

## Browser and workflow verification

Started with the Codex in-app browser. DOM interactions and layout reads worked, but screenshots at an explicit 1536 × 1024 viewport were clipped or resampled by the host panel. Used Playwright CLI with Chromium as the screenshot and workflow fallback. Desktop checked at the native concept size, 1536 × 1024. Mobile checked at 390 × 844 and by full-page capture; document width stays within viewport.

Verified via browser UI: invalid hex feedback; editing a token updates actual computed component colors; undo and redo; locks disable fields; independent dark palette; changing font and radius affects preview; preview form success is local; notification switches; select and checkbox in gallery; typography scale; CSS import review and apply; CSS/JSON export; real JSON download; create system; rename and reload persistence; history; MCP setup uses the actual configured endpoint; overview count reflects creation; mobile drawer opens and closes; no horizontal mobile overflow. UI exercises used an isolated production-build server. Browser console recorded zero errors or warnings in that workflow.

A separate real HTTP MCP client changed primary and radius on the running development instance. Browser polling showed both values without reloading. The editor's Undo restored the original design. `mcp-live-edit.png` records that intermediate agent change. Agent call history is retained in the user's demo workspace.

## Visual comparison ledger

Inspected `concept.png`, latest `editor-desktop.png` and `editor-mobile.png` using `view_image` in the same review pass.

| Comparison | Reference and rendered evidence | Adjustment / result |
| --- | --- | --- |
| Layout | Sidebar, horizontal toolbar, flexible specimen canvas, inspector and footer | Adjusted desktop rails to 264px / 332px; preserved panel model and section order. |
| Typography | Strong title, restrained chrome, clear specimen headers | Increased initial small chrome and specimen text; packaged Inter with Vietnamese glyphs; corrected preview to use the actual bundled Inter Variable family. |
| Palette | White panels, cool gray canvas, forest green primary | Preserved colors and independent preview token scope. Shell stays legible when user changes preview theme. |
| Components | Hero, form, notifications and eight-swatch palette | Kept component families and spacing rhythm; controls are real DOM with functional state. |
| Artwork | Four overlapping green geometric forms | Built scalable native geometry using live theme variables, so the artwork changes with the theme. Flat fills replace decorative shading from the concept. |
| Inspector | Presets, mode switch, hex fields, locks, radius and contrast | Added truthful lock states and computed contrast; extra tokens are expandable. |
| Responsive | Same content must work on a phone | Drawer navigation, stacked cards, palette wraps to four columns, inspector follows canvas. Reduced mobile artwork and anchored it below the paragraph to avoid overlap. |
| Status | Concept used unconditional saved/success text | Real save/network state; preview form explicitly says local demonstration. |

The implementation was checked for fidelity to the concept's visual system and core layout. It is an independent implementation, with intentional differences below; no claim of pixel-exact replication.

Above-the-fold copy review: main navigation, page title, preview title, primary actions and inspector tabs preserved. Intentional additional copy includes the small LIVE PREVIEW indicator, expand-all-token control, lock guidance, and truthful local-form/preview-state wording. The workspace selector is a noninteractive label because this version has one personal workspace. Presets use accessible contrast-safe colors; Secondary is a soft semantic surface, rather than the saturated green sample in the generated concept. Actual inactive locks use unlocked icons. Expanded MCP, import/export and history screens implement the requested workflows using the same visual primitives.

## Design & Ship workflow addition

Added the six-stage shadcn/ui workflow as a bundled Codex skill, read-only MCP tool `get_workflow`, three Markdown resources and a parameterized `design_and_ship` prompt. HTTP initialize instructions direct design-to-code tasks to the workflow; the stdio adapter forwards prompts/resources and preserves those instructions. The canonical instructions live in `skills/token-studio-shadcn`, not in duplicated handler strings. Modes are `design-and-build`, `replicate` and `refine`.

Integration exercises HTTP/stdio prompt parity, prompt argument substitution, mode-specific instructions, resource content parity, invalid-mode rejection, REST/MCP response parity and the invariant that reading the guide does not modify systems or workspace revision. Existing mutation, lock, history and import/export tests continue to pass. `npm run build` passes, including TypeScript checks. The skill passed the bundled skill-creator validator and was installed at `C:/Users/Tran Huy/.codex/skills/token-studio-shadcn`; installation preserves customized existing skill files by refusing conflicting overwrites.

Browser verification: the in-app browser showed all six stages and eight tools. Selecting `replicate`, editing the task and copying produced clipboard text with the correct mode and task. The actual guide download completed and expanded instructions were readable. Screenshot fallback uses Playwright CLI due to the in-app screenshot issue described above; `agent-workflow.png` captures the actual new panel at a 1440 × 1100 viewport. Mobile checked at 390 × 844: document width remained 390px, all six stages were present, and the browser console reported zero errors/warnings. This addition intentionally extends the existing MCP screen with a workflow section and does not redesign the editor. The workflow is agent guidance, not enforced execution or a new component registry, and makes no unmeasured 10x speed or conversion claim.

## Current scope limits

Editor + MCP is implemented. No Figma sync, URL extraction, in-editor paid AI provider, custom component compilation, shadcn installable registry, team accounts or cloud deployment. The CSS export targets Tailwind v4 and does not export component React source. Contrast checks cover named text/background pairs, not a full page accessibility audit. Local processes may call the loopback service; this is not a multiuser authenticated server. Data history is capped at 60 changes; export JSON does not include history.
