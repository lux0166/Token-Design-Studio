# Project task dossiers — workflow 1.3.0

Keep the project's files as the source of truth. Create `.token-studio/tasks/<UUID>/task.json` with `{ "taskId": "<UUID>", "task": { ... } }`. Use `assets/task-template.json` as the content shape and `assets/task.schema.json` for validation. Replace example text with actual evidence; the template is deliberately incomplete. Reuse the same UUID across clients and sessions. Do not commit private conversations or confidential images without the user's scope permitting it.

## Files and synchronization

Place SPEC.md, DESIGN.md, REVIEW.md, HANDOFF.md and evidence/ in this folder as needed. Artifact paths are relative to the project root, not the dossier directory. For a screenshot reference, HTTP(S) URLs are also accepted; record viewport dimensions. Studio never fetches those URLs or reads the local paths. Save actual files in the project before recording links.

With MCP, use create_task with `task` and the UUID as taskId. Use list_tasks/get_task to resume, then update_task with the complete current task content and latest **task** expectedRevision. Theme and task revisions are independent. A conflict means reread and reconcile; never overwrite a newer task blindly. Keep the project JSON updated from actual work. Studio's synced record does not update project files. Call validate_task, repair the listed gaps, then complete_task with the latest revision. Any later update reopens the task. Without MCP, keep the same files, run the installed skill's `scripts/validate-task.cjs` against task.json when Node is available, and disclose that Studio was not synchronized. Do not imply offline validation changes server status.

For MCP-only clients without installed assets, use the create_task input schema or read `token-studio://tasks/schema`; `get_workflow` supplies this guide as taskGuide. Do not assume a path on the Studio server is accessible in the target project.

## Content fields

- schemaVersion: 1; title, goal, project; mode: design-and-build / replicate / refine / grill-me; scope: screen / token-only. Grill-me always uses screen and never changes tokens.
- decisions: id, question, answer, material, status (open/conflicting/resolved), source (human/project/reference/delegated/unresolved), evidence. Record the actual answer/reference and its source. A proposed recommendation or silence is not confirmation. Mark open important questions visibly; do independent work while waiting.
- direction: source (human/project/reference/delegated/unresolved), summary, evidence. When new UI lacks direction, offer two meaningfully different options and obtain a real choice before dependent code. Record the choice/explicit delegation rather than inventing it.
- acceptanceCriteria: concrete outcomes, not style adjectives.
- artifacts: id, kind (spec/design/review/handoff/reference/render/test/change), path, label; optional viewport {width,height} in CSS pixels. Render/reference evidence for fidelity includes the viewport.
- checks: id, label, kind (before-code/primary-flow/after-render/contrast/affected/acceptance), status (pending/passed/failed/blocked), required, evidence. Evidence links a command result, screenshot/interaction inspection, or precise observation. Missing browser access is blocked, not passed. Mark a check optional only when it is genuinely outside the affected scope, with the rationale recorded.
- findings: id, location, observation, evidence, impact, severity (blocker/major/minor), status (open/fixed/deferred/out-of-scope), repair, recheck. Blocker/major needs fixed + actual repair and recheck before completion. Do not downgrade findings to bypass the gate.
- limitations: message, blocking. Missing mandatory browser/reference access blocks completion. Nonblocking limitations describe genuinely out-of-scope capabilities, not unperformed required checks.

## Proportionate completion

All modes need acceptance criteria, resolved material decisions with sources, passed required checks with evidence, and no blocking limitations or unverified blocker/major repairs.

| Work | Additional records |
| --- | --- |
| New screen | spec/design/review/handoff, sourced direction, before-code + primary-flow + after-render checks, desktop render ≥1024px and narrow render ≤640px |
| Replicate | design/review/handoff, sourced direction, reference + render at matching viewport, the three screen checks; explain differences in REVIEW.md |
| Refine | design/review/handoff scoped to the affected area, sourced existing direction, render with viewport, the three screen checks; a brief note is enough for DESIGN.md |
| Grill-me | spec; stop at the specification, no code/render required |
| Token-only | change note + handoff, affected check; no generic interview, full spec or layout dossier |

Studio checks the reported dossier structure and results. It cannot certify the truth of a claimed test, whether an image was viewed, aesthetic quality, or agent actions outside Studio. Do not claim independent review, conversion improvement, guaranteed pixel fidelity or a beauty/slop score.
