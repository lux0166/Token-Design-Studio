# Critical review of the current workflow

Date: 2026-10-16. Baseline: initial GitHub commit cd96906. This is a review of the workflow and its contracts, not a claim to have run fresh usability tests on Fluento or redesigned Token Studio.

## What works

The skill already grounds intent through interviews, separates confirmed decisions from guesses, preserves existing components/tokens, rejects fabricated integrations and requires browser evidence. The theme library honestly labels demo data, adaptation limits and contrast failures. Those protections should be retained.

## Findings

| ID | Impact | Evidence in baseline | Consequence | Proposed correction |
| --- | --- | --- | --- | --- |
| C-01 | High | SKILL.md section 4 specifies geometry, styles and states, but does not require explaining why the composition serves this brief. | A technically complete contract can still describe an interchangeable template. | Add a concise direction contract tied to task, content priority, domain vocabulary and bounded visual choices. |
| C-02 | High | references/handoff.md has a design skeleton but no section-to-task rationale or challenge of decorative content. | Large blocks can dictate the product's information architecture. | Record what each major section helps a user decide or do, and remove/adapt unsupported template content. |
| C-03 | High | SKILL.md section 6 checks reference fidelity and behavior; a new screen without a reference has no equally explicit critique procedure. | Self-review can stop after responsiveness and a successful build. | Review the actual render for attention order, hierarchy, content specificity, consistency and relevant accessibility; record actionable findings and recheck repairs. |
| C-04 | Moderate | The workflow has no explicit distinction between a contextual warning sign and a forbidden aesthetic. | A future anti-slop patch could ban valid brand choices or force novelty into operational software. | Make existing brand, explicit reference and user choices authoritative. Card/gradient/font repetition is a prompt to inspect purpose, not automatic failure. |
| C-05 | High | shared/workflow.ts, server/workflow.ts and WorkflowPanel.tsx currently deliver only instructions/interview/reuse/handoff. | A new local reference could be missing from MCP tools, prompts or exported editor guidance. | Update the complete delivery path and verify HTTP/stdio parity if a quality guide is added. |
| C-06 | Moderate | Existing automated tests verify workflow delivery, tokens and product behavior, not agent design outcomes. | Passing tests could be misrepresented as proof that generated designs are better. | Separate delivery/integration tests from scenario-based skill evaluation and any human judgment. |
| C-07 | Moderate | ThemeLibrary.tsx uses a repeated specimen headline and chart to compare palettes, deliberately labeled as a preview. | The same composition would be inappropriate if reused as every product's dashboard; it is useful as a controlled theme specimen. | Keep the specimen's comparison role; do not infer that its layout is a product-design recommendation. |

## Counterarguments to the proposed upgrade

1. **"Always make it distinctive."** Familiar interfaces can be correct. Judge task fit and intentional choices; do not demand originality in login forms, settings or exact-reference work.
2. **"Show three options every time."** This wastes effort when direction is settled. Reserve alternatives for material unresolved choices; their number and review behavior are still being interviewed.
3. **"Let the agent score itself 9/10."** The score has no calibrated meaning and can hide failures. Findings need a location, evidence and user consequence.
4. **"Never ship with a warning."** Cosmetic preference should not indefinitely block useful work. Define severity and treatment before choosing gates.
5. **"A skill enforces compliance."** It supplies instructions; the client can ignore them. Report guide delivery and observed behavior separately from enforcement.

## Recommended order

Resolve the interview decisions; finalize the design-direction and critique contracts; update skill and all MCP/editor delivery paths together; check delivery parity and representative task scenarios; install/package only after verification. Do not redesign unrelated screens or claim universal anti-slop success.
