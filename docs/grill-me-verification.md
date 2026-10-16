# Grill me — workflow 1.1.0

Implemented and verified locally on 2026-10-16.

## Change

Added an adaptive interview stage before dependent implementation, an interview-only `grill-me` mode, the `grill_me` MCP prompt, `token-studio://workflow/interview`, and an interview guide with a decision ledger and SPEC.md template. Full design/build modes also resolve material unknowns through interviewing. The editor exposes mode selection, a copyable starter and downloadable guidance.

The skill records confirmed answers, existing project evidence, explicitly delegated decisions, open questions and conflicts separately. It instructs the agent to ask focused rounds, preserve prior answers and wait for material answers rather than select defaults from silence. In interview-only mode the agent ends at the specification.

## Verification

- `npm test`: 11 passing tests. Expanded the real MCP SDK integration to verify the new mode, prompt, resource and HTTP/stdio parity, plus invalid modes and unchanged design-system revision/state when reading guides. Existing token lock, concurrency, history, import/export and persistence checks remained green.
- `npm run build`: TypeScript and Vite production build succeeded. Rollup emitted existing third-party Zod comment-annotation warnings; no compilation errors.
- Skill packager: validation passed; generated `output/skills/token-studio-shadcn.skill`, including the interview reference.
- Local skill updated after verifying the installed files matched the previous bundled version. Previous version backed up under `C:/Users/Tran Huy/.codex/backups/token-studio-shadcn/before-grill-me-20261016/`.
- Browser: copied the interview starter and verified mode, task and specification-only instructions on the clipboard. Switched to design/build and verified that starter includes interviewing before dependent implementation. An empty task disabled the copy action.
- Downloaded the interview guide and verified the specification template and interview-only instruction in the downloaded file.
- Desktop inspected at 1536px width; screenshot `grill-me-desktop.png` captures the workflow panel from a 1536×1600 viewport. Mobile checked with direct tab emulation at 390×844 after the browser-level override failed to affect the target tab. The document's scrollWidth/clientWidth were both 375px and the phase grid had one column. No browser console warning/error entries were reported in these checks. Temporary emulation was cleared.

## Limits

Token Studio serves the workflow, template and prompts. The AI client conducts the interview and writes the target project's SPEC.md. The editor does not host an AI chat, persist interview answers or enforce a human-confirmed specification on every client. SDK tests verify transport/content availability, not universal AI compliance. A real project's specification needs that project's actual user answers; none were fabricated during this workflow update.
