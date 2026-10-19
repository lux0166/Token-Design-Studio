# Workflow 1.3.2 / 1.4.0 evaluation

Date: 2026-10-19. **Status: in progress; no overall release acceptance or quality improvement claim.**

## Native client smoke

The fresh Codex desktop chat `01a15314-b2d0-7600-bc87-815c0eadac9c` reported the installed skill in its catalog, checked all 11 managed files and read metadata 0.4.0 / workflow 1.4.0. It created a specification-only fixture with seven sourced decisions, nine criteria and nine acceptance checks. It performed plan snapshot and local verification without product code, implementation snapshots or render claims. The evaluator independently reran the installed helper against the real project: valid=true, issues=[], four local files. Its synthetic [specification](codex-native-SPEC.md) and [smoke status](client-smoke.json) are retained. MCP was not exposed in that chat and no synchronization was claimed.

Antigravity app 2.24.0.0 is installed. The separate skill target was installed and doctor passed, but native UI automation could not initialize. The user agreed to execute the prepared native smoke. This remains pending until the actual app output is independently checked. Do not count the CLI or the directory check as a substitute.

## Native comparative protocol

Use the two fixtures in [cases.json](cases.json), both clients, and versions 1.3.2/1.4.0: eight native sessions, one observation per cell. The reference case uses the actual frozen [1280×900 PNG](reference.png), with its SHA-256 in cases.json, not merely a text contract. Baseline source is pinned to cc26f76. Native prompts and guide hashes for current runs are in [native-plan.json](native-plan.json).

Four Codex desktop sessions have been launched in separate projectless workspaces; final results and evaluator checks are pending. Four Antigravity native sessions remain pending. The scoped fixture is an HTML/CSS/JS local prototype with actual browser interaction/evidence when available; production React/shadcn integration is outside this comparison. Discovery is measured by the separate client smoke, while comparison sessions explicitly follow the selected frozen guide. Default model settings are preserved; record actual model IDs when exposed and disclose unknowns.

`node scripts/prepare-native-evaluation.mjs` prepares isolated prompts plus matching schema/helper assets for both workflow versions. It starts no sessions and does not overwrite recorded results. Current baseline agents were instructed not to substitute the installed v2 helper and may retrieve matching v1 assets from pinned read-only Git history; record any resulting setup limits rather than concealing them.

## Supporting diagnostics

`node scripts/evaluate-workflow.mjs --release-040 --run` executes an additional eight-cell **CLI-constrained diagnostic**, with guide content supplied directly, no agent browser/commands and a text geometry reference. Exit code alone is not success: malformed/truncated JSON is blocked. Raw prompts, hashes, logs, prototypes and limitations remain under ignored output/evaluations/040/cli-diagnostics. These runs do not fulfill native app or actual-image evaluation gates.

The separate real Codex CLI behavior response chose two directions and waited, kept unresolved grill-me in specification mode, proceeded on the explicit radius edit without a generic interview, and refused completion without required browser evidence. This verifies the next-step response in those hypothetical cases, not full execution across both clients. The response and logs are under output/evaluations/040/behavior.

## Reporting rule

Record actual primary-flow behavior, content fidelity, hierarchy, geometry/overflow, explicit business-scope errors, screenshots and repairs. Preserve failures and no-improvement results. Distinguish agent self-review, evaluator observations and human feedback. There is no beauty/slop score, guaranteed production readiness, conversion gain or supported speed multiplier.

Supporting diagnostic result: all eight CLI sessions finished. Five produced parseable prototypes; three Antigravity responses were truncated/malformed JSON despite process exit 0. All four Codex cells produced prototypes; Antigravity 1.3.2 reference produced one, while its dashboard and both 1.4.0 cells failed. The generated outputs remain awaiting evaluator render review and are not native passes. See cli-diagnostics.json.
