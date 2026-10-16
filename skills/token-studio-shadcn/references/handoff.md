# Handoff and completion evidence

Use the repository's existing delivery format when it has one. Otherwise keep the following information in a concise response or feature-local handoff document. Do not create empty paperwork for a small change.

## What the reviewer needs

- **Outcome:** what user task now works, and what changed in its experience.
- **Specification:** link SPEC.md, confirmed or delegated decisions and their sources, acceptance requirement IDs and unresolved questions. For interview-only work, deliver the spec and its readiness status; do not claim implementation.
- **Implementation:** actual routes/files, reused components or blocks, source/license where new blocks were introduced, and how theme tokens were integrated.
- **Run/view:** the working command/URL or local artifact path. Describe required services without claiming unavailable integrations work.
- **Behavior checks:** primary journey and relevant pending/error/empty/validation states; commands run and their actual results.
- **Visual evidence:** reference and rendered screenshot paths; viewport dimensions; checked geometry, typography, spacing, colors, copy and states; fixed or accepted differences.
- **Design quality:** chosen direction and its source; before-code ready/revise/needs-an-answer result; rendered critique findings with evidence, user impact, repairs and recheck status. Separate observed issues from preference/hypothesis; do not claim independent review or a universal aesthetic score.
- **Limits:** failed/unavailable checks, remaining visual differences, missing external services and what is needed for release.
- **Release state:** local implementation, PR, deployed preview or production. Cite only a state actually reached; publishing requires the human's authorization.

## Design-contract skeleton

Adapt this to the work; remove sections that are irrelevant to the actual task.

```markdown
# [Feature/screen]

User and primary job:
Primary CTA and success state:
Scope and assumptions:
Reference / viewport:
Chosen direction / source / alternatives considered when relevant:
Before-code self-review result and rationale:

Layout and responsive rules:
Information priority and section → user task/decision map:
Typography / spacing / color / shape sources:
Component/block map and provenance:
Interactive states and data integration:

Acceptance criteria:
Verification evidence:
Rendered critique findings / severity / repairs / recheck:
Intentional deviations and remaining work:
```

## Completion vocabulary

Say **locally verified** when the local code and exercised states work. Say **visually compared at [dimensions]** when you inspected the actual screenshot at that viewport. Use **pixel-perfect** only with adequate direct comparison evidence and explicit accounting for differences. A test report does not prove a conversion gain, browser screenshot does not prove backend authorization, and an export does not mean a theme was installed or deployed.
