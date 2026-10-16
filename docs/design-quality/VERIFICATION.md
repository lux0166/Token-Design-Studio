# Design-quality workflow verification

Date: 2026-10-16. Workflow version: 1.2.0.

## Scope and direction

The user confirmed mandatory agent self-review before code and after rendering, with human questions only for material unknowns. For a new UI lacking a clear brand/reference, the user selected two concise, different directions with reasons, followed by a real choice. The implementation preserves those answers in SPEC.md and in the delivered guide.

The editor change follows the existing white/green instructional panel, typography and responsive layout. Its task is to explain the new review requirements and let the user retrieve the complete guide. It is a refinement of an established page, so no replacement visual directions or unrelated product redesign were needed. Before-code self-review: ready within this scope; two checkpoints and their difference from human approval are explicit.

## Automated and packaging checks

- `npm test`: 17 passed, zero failed. The real HTTP/stdio integration test checks byte-equivalent guide delivery, the new resource, both prompts, API response, full-guide formatter and preservation of workspace state.
- The new installer test installs into a temporary CODEX_HOME, verifies delivery of design-quality.md, allows an identical repeat installation, and rejects a locally customized quality guide without overwriting it or the installed SKILL.md.
- `npm run build`: passed TypeScript project checks and Vite production bundling. The two existing Zod annotation warnings remain non-blocking dependency output.
- Skill package validator: passed; output/skills/token-studio-shadcn.skill contains all six expected source files.
- Installed skill: compared against the original committed baseline before changes; backed up under ~/.codex/backups/token-studio-shadcn/before-design-quality-20261016, updated all six files, then ran the ordinary installer successfully to confirm equality. No customized skill was blindly overwritten.
- `git diff --check`: passed after normalizing changed text files to LF.

## Browser checks and rendered critique

Tested http://127.0.0.1:5173/ → Kết nối MCP. Version 1.2.0, the new direction/critique explanation and updated specification/verification phases appeared. Switching to design-and-build updated the help and controls. Opening the full-guide disclosure exposed 40,506 characters, including the quality guide, two-direction rule and repair severity policy. The console returned no warnings/errors during inspection.

Desktop inspection: the captured workflow panel uses the existing hierarchy, shows the two checkpoints before the seven ordered steps, and retains labeled task/mode controls plus copy/download controls. The final capture used a 1536 × 2300 viewport and a 1180-pixel-wide crop around the complete panel. No actionable blocker or major visual defect was observed in this scoped change. The two explanation panels repeat the existing style deliberately, grouping interview requirements separately from design-review requirements. This is a self-review, not an independent review or user study.

At a 390 × 844 emulated viewport, document/main client and scroll widths both measured 375 CSS pixels; the workflow panel was approximately 335 pixels wide. No unintended horizontal overflow was detected. Device emulation was cleared afterward. workflow-desktop.png is an actual application capture cropped around the complete workflow panel for readability.

Copy action showed the application's success state. Independent clipboard roundtrip through the browser automation bridge returned an empty value, so clipboard payload delivery is not claimed as verified. The editor's displayed full guide and shared download formatter were checked; the resulting downloaded browser file was not independently read back.

## Scenario walkthrough, not a generative benchmark

The following is a same-agent policy/contract walkthrough against the new guide. It checks coverage and contradictions, not measured aesthetic improvement or successful behavior across models.

| Scenario | Required response under the guide | Walkthrough result |
| --- | --- | --- |
| New English 1:1 dashboard with no visual direction | Offer two brief task-specific directions; preserve the known administrator/teacher audience; await selection before UI code. | Covered by depth table, direction contract and interview rule. |
| Domain operations content | Explain how scheduling exceptions, remaining lesson credits and post-session feedback serve the relevant actor; do not inherit revenue widgets solely from a block. | Covered by section-to-task mapping and chart/KPI rationale. These are examples, not new confirmed Fluento requirements. |
| Exact screenshot supplied | Preserve the reference, compare actual render and disclose deviations; no unrequested alternatives. | Explicit separate path. |
| Change only radius | Read latest tokens/locks, change intended scope and check affected rendering; no generic design interview. | Explicit small-change path. |
| Human requests familiar cards/gradients | Respect that direction and review purpose, hierarchy and readability. | Warning signs are contextual and do not override explicit intent. |
| Existing-brand refinement | Retain conventions and unrelated behavior; review only affected areas. | Matches the editor change made here. |
| Missing reference/browser access | Disclose missing evidence; do not fabricate fidelity or a completed render critique. | Explicit limitation policy. |
| Critique-only request | Report concrete findings/remedies without unrequested implementation. | Explicit separate path. |

## Critical findings disposition

- C-01/C-02: direction rationale and section-to-task mapping added to the skill and quality guide.
- C-03: actual-render critique now has an evidence record, severity policy and repair/recheck requirement.
- C-04: preserves brand/reference choices, familiar interactions and contextual exceptions; avoids universal style bans.
- C-05: guide wired through source skill, installed package, get_workflow, prompts, resource, full editor disclosure and shared export formatter.
- C-06: instruction-delivery tests are explicitly separated from scenario walkthroughs and unperformed model/user evaluations.
- C-07: theme specimen remains a palette-comparison tool; no unrelated design changes were made.

Remaining limits: these are instructions, not a server-enforced approval gate or a calibrated detector of generic design. No independent model benchmark, aesthetic score, user validation or conversion improvement is claimed. Skill behavior should be revisited using real design tasks and human feedback.
