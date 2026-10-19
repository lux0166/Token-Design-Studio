# Workflow 1.2.0 / 1.3.0 evaluation

Date: 2026-10-16. Eight constrained headless sessions were attempted: five produced usable prototypes, three Antigravity outputs contained truncated JSON despite a successful process status. Incomplete outputs are not repaired or counted as passes. The sessions used synthetic fixture data and existing client/account permissions. codex-cli 0.163.0-alpha.10.2. Model identifiers were not reported; client defaults were used without model overrides, so an identical underlying model cannot be independently certified. One sample per cell is insufficient for causal claims about quality or speed.

| Client surface | Workflow | Fixture | Elapsed | Outcome |
| --- | --- | --- | --- | --- |
| codex | 1.2.0 | english-operations | 164.5s | Generated; evaluator browser-checked |
| antigravity | 1.2.0 | english-operations | 189.9s | Blocked: incomplete JSON |
| codex | 1.2.0 | reference-schedule | 98.3s | Generated; evaluator browser-checked |
| antigravity | 1.2.0 | reference-schedule | 187.5s | Blocked: incomplete JSON |
| codex | 1.3.0 | english-operations | 139.0s | Generated; evaluator browser-checked |
| codex | 1.3.0 | reference-schedule | 79.8s | Generated; evaluator browser-checked |
| antigravity | 1.3.0 | english-operations | 186.5s | Generated; evaluator browser-checked |
| antigravity | 1.3.0 | reference-schedule | 186.9s | Blocked: incomplete JSON |

## Method and limits

The initial installed-skill probes returned exit code 0 but could not perform the required reads/actions: Codex shell reads were blocked by execution policy; Antigravity headless auto-denied command permission. No client config or security permission was changed. The subsequent matrix used a safer constrained generation path: Codex received guide context via stdin and Antigravity read the supplied prompt with its permitted native file tool. The guide subset was SKILL.md and design-quality.md, plus tasks.md for 1.3.0. The harness requested a standalone HTML/CSS/JS local prototype and honest limits, without agent commands or browser access. Source baseline is pinned to c3e8142; prompt hashes and raw artifacts are under ignored output/evaluations/matrix.

This is not the planned native Antigravity IDE/app discovery test, an image-reference fidelity benchmark, production shadcn integration, or an independent human design study. The reference case used a supplied text geometry contract. Those boundaries remain unverified and must not be inferred from successful directory installation. Candidate prototypes honestly reported unperformed browser/integration checks; evaluator interactions below were performed separately.

## Observed results

- Codex English dashboard: both versions exposed a next lesson, contextual student progress and a working details dialog. At a 390px viewport the baseline document scrolled to 587px; the candidate document stayed at 390px. This is one concrete improvement in this fixture, not proof of universal visual improvement.
- Codex reference schedule: both versions preserved the supplied lesson records and had working filters/details. At 1280px both measured sidebar 220px, header 64px and heading 28px/600. Both stayed at 390px document width on mobile. No meaningful improvement in this measured geometry was established.
- Antigravity candidate dashboard: next-lesson details worked and document width stayed at 390px on mobile. It nevertheless added an automatic teacher replacement action without a confirmed scheduling policy, and rendered literal &bull; in profile/dialog labels. The unconfirmed business action is a substantive scope/intent finding. These raw benchmark outputs were retained, not polished into a better result; apps/english-one was not edited. There is no usable baseline output for an Antigravity visual comparison.

## Behavioral walkthrough

One additional real Codex CLI response was inspected for four hypothetical task states. It proposed two directions and waited for a choice, asked about unresolved scheduling rules in grill-me without implementing, proceeded with the explicit token edit without a generic interview while requiring verification before completion, and treated missing browser evidence as a completion blocker. This verifies the reported next-step policy in that response, not actual execution across clients. See results.json and output/evaluations/behavior for the response and logs.

## Release interpretation

A later real Codex CLI smoke test used only the running isolated MCP endpoint through a per-invocation configuration override. It read workflow 1.3.0, created and retrieved an incomplete grill-me task, and validate_task correctly returned the missing spec requirement. The returned record was independently fetched from the HTTP API: revision 0, in-progress, completedAt null. This confirms real Codex MCP interoperability without changing user config or requiring denied shell reads. It does not establish filesystem skill discovery. A separate Antigravity native-file smoke attempt timed out after 100 seconds with no usable final response or dossier at the time of inspection; its process status was not counted as success.

The installer, task store, completion checks and UI have local automated/package/browser verification in ../releases/0.3.0.md. Native client skill discovery and full IDE/app evaluation remain pending under the current execution restrictions. The new workflow does not eliminate agent scope mistakes; structural completion checks cannot authenticate a claimed answer, screenshot or test. No beauty score, guaranteed anti-slop result, 10x gain or conversion uplift is claimed.
