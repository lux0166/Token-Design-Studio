# Project task dossiers — workflow 1.4.0

Keep project files as the source of truth: `.token-studio/tasks/<UUID>/task.json`, shaped `{ "taskId": "<UUID>", "task": { ... } }`. Reuse that UUID across sessions. Use assets/task-template.json and assets/task.schema.json. Actual documents and screenshots stay in the project. Never fabricate an interview answer, a file read, a browser pass or user approval.

## Choose the smallest honest scope

- New screens and replication use `scope: "screen"`. Keep SPEC/DESIGN/REVIEW/HANDOFF or the project's equivalents as appropriate; a single relevant document may supply several labeled artifacts. New screen: sourced direction, before-code/primary-flow/after-render checks and desktop ≥1024px plus mobile ≤640px renders. Replication: real reference and render at matching viewport, documented differences. Existing screen-wide refinement retains design/review/handoff and the three screen checks.
- `mode: "refine", scope: "local-ui"`: a change in an existing UI region, without a new route, business flow or broad system redesign. Use notes.scope, notes.change and notes.handoff, affected and acceptance checks and a render of the changed region with viewport. Separate DESIGN/REVIEW/HANDOFF files are unnecessary. Test responsive/keyboard states when affected. If the change grows, update scope; ask only about new material intent.
- `scope: "token-only"`: short scope/change/handoff notes, affected and acceptance checks. Set requirements.contrast / requirements.render when the changed colors or visual roles require those checks. No generic interview or screen dossier.
- `mode: "grill-me", scope: "screen"`: specification and an acceptance check of its coverage, decisions and scenarios. Stop before product implementation. No code, browser or render required. Do not confuse specifying a future behavior with having implemented/tested that behavior.
- Critique-only work does not need an implementation dossier unless requested.

## Record actual intent and trace acceptance

Use schemaVersion **2**. Record decisions with id, question, actual answer, material, status, source and evidence. Sources are human/project/reference/delegated/unresolved. Existing answers or a sufficiently clear brief can supply a decision; do not ask again merely to populate fields. A proposal or silence is not confirmation.

Each acceptanceCriteria entry is `{id, text, decisionIds}`. Reference at least one resolved decision with an answer and source evidence. Use stable IDs such as AC-01. A concrete outcome includes relevant failure behavior, not just component presence. Checks use `{id, label, kind, status, required, evidence, criterionIds, artifactIds, fingerprint}`; kinds include before-code, primary-flow, after-render, contrast, affected and acceptance. Every criterion needs a passed **acceptance** check linking that ID and real local artifact evidence. Generic layout checks do not establish an untested booking or permission rule.

Artifacts use id, kind, path, label, optional viewport {width,height}, and sha256 when used by a passed check. Paths are relative to the project root. Only a reference may remain a remote URL during local verification; save required screenshots/reports locally. The hash identifies bytes, not whether an image was viewed. Findings retain location, observation, evidence, impact, severity, repair and recheck. Unresolved material decisions, failed required checks, blocking limitations and unverified blocker/major repairs prevent completion.

## Capture scope and evidence at the right time

Declare inputs.plan and inputs.implementation as **files**, not directories or glob patterns. Plan files include relevant brief/contracts; spec/design artifact paths are included automatically. Implementation files cover changed source plus related components/styles/assets/config. The helper adds enclosing package manifests and lockfiles. Include indirect dependencies that affect the changed UI; the helper does not infer the complete import graph. Exclude unrelated files and task.json itself. No background watcher runs.

The plan fingerprint binds goal, decisions, criteria, scope, direction, relevant notes and plan files. A before-code check binds to it. Implementation fingerprints bind the plan plus declared implementation files and package inputs; behavior/render checks bind to these. Code edits do not invalidate an unchanged plan, but plan edits invalidate the dependent implementation snapshot. Grill-me checks use the plan phase.

Use the installed scripts/validate-task.cjs (replace `<helper>` and `<root>` with actual paths):

```sh
node <helper> snapshot <task.json> --project-root <root> --phase plan --write
node <helper> snapshot <task.json> --project-root <root> --phase implementation --write
node <helper> verify <task.json> --project-root <root> --write
```

1. Create the real plan files, criteria/decision links and input lists. Capture plan before dependent code; perform the review and record its fingerprint on that check.
2. Implement authorized work. Capture implementation before checking its behavior/render. Omit this phase in grill-me.
3. Perform each real check and save its actual screenshot/log/observation. Snapshot output includes hashes for existing local artifacts; record the corresponding artifact.sha256 and the fingerprint of the phase checked. Missing future artifacts are not supplied with fake hashes. A completed check must refer to the fingerprint it actually tested.
4. `verify --write` reads files, compares hashes, checks coverage and stores task.verification with the digest of the current dossier. Fix missing/stale evidence and rerun relevant checks, then verify again. Refreshing a snapshot does **not** update existing check fingerprints or artifact hashes. Do not manually re-stamp old results after code changes.

Default `verify` prints a report; --write stores it atomically. Without an explicit command, the legacy `node <helper> <task.json>` invocation runs verify. Root is inferred only from the standard dossier location; otherwise pass --project-root. --structure-only does not read linked files and cannot support v2 completion. Files must resolve inside root (no escaping traversal/symlinks); limits are 32 MB per file and 64 MB per verification. The helper never runs commands from task data, downloads URLs or certifies image content.

## Sync and complete

With MCP, use create_task with the UUID as taskId. Resume via list_tasks/get_task; update_task replaces the task with the latest **task** expectedRevision. Theme revisions are independent. Sync the current task including its verification report. Inspect validate_task and repair its issues before complete_task with the latest revision. A changed record reopens a completed task. File edits outside Studio are detected only at the next local verify and sync, not automatically.

Without MCP, keep the same project dossier and verify locally; state that Studio was not synchronized. With MCP only, read token-studio://tasks/schema or the input schema; the helper must still run in the actual project to supply a local report. Do not assume the Studio server path is accessible. No fake local report when file/browser tools are missing: record the block and continue unrelated work.

Studio checks reported structure, traceability, hashes and report consistency. It cannot authenticate the client report, image inspection, human intent, aesthetic quality or external agent behavior. Preserve required screenshots/browser checks; do not claim independent review, production readiness or quality/speed gains from a structurally valid task.

## Upgrade and history

`node <helper> upgrade <task.json>` backs up v1 JSON, assigns stable criterion IDs and preserves old notes/evidence. Checks become pending; source and artifact links remain unresolved until actually supplied. It never invents a pass. Existing v2 content is unchanged by upgrade.

Studio keeps v1 completed history labeled as the old policy. New completion needs v2. Editing an old completed record reopens it. Read policyVersion, completionPolicyVersion, needsUpgrade and evidenceLevel rather than presenting old completion as new verification.
