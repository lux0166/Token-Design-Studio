# Intentional design and critical review

Use this guide for new UI, substantial redesign and critique of rendered work. Apply only affected checks to refinement, replication and token corrections. These are agent self-review requirements, not a claim that Token Studio enforces client behavior.

## Choose the right depth

| Task | Direction work | Review work |
| --- | --- | --- |
| New UI without a clear brand/reference | Propose exactly two concise, genuinely different directions with reasons; ask the human to choose before dependent UI code. | Review the selected plan, then the actual render and primary task. |
| New UI with clear direction or bounded human delegation | Use that direction; record consequential implementation decisions within its boundaries. | Self-review without adding a human approval round. |
| Exact reference replication | Inspect and document the reference; do not substitute a preferred style or invent alternative directions. | Compare the render at the reference viewport; report inaccessible references and intentional deviations. |
| Existing-product refinement | Preserve its conventions and unrelated behavior. | Review changed areas and effects on hierarchy, states and responsive layout. |
| Small token correction | Read current tokens/locks and change the requested scope. No generic interview or full design dossier. | Check affected contrast/states and rendering as appropriate. |
| Explicit critique-only request | Inspect supplied artifacts and ask only for missing material context. | Deliver findings and proposed repairs; do not modify the product unless requested. |

Do not re-offer directions once the human chose. Explicit instructions or bounded delegation can change the two-direction rule; record the actual source. Missing important intent calls for a focused question, while a resolved direction calls for continued work.

## Before code: direction contract and self-review

Write a concise DESIGN.md or the project's equivalent alongside the specification. For a small change, use a short affected-scope note. Include:

- **Purpose:** actor, primary task, success state, domain vocabulary and real constraints.
- **Content priority:** what deserves attention first, next and later, and why. Map each major section to something a user needs to understand, decide or do. A chart needs a meaningful question, scale/units and data context; a KPI needs a decision it informs.
- **Composition:** reading order, layout, grouping, density, responsive rearrangement and progressive disclosure. Explain consequential choices with task/content evidence rather than adjective-only labels such as "modern".
- **Visual roles:** typography roles and readable sizes, spacing rhythm, semantic colors, shape/elevation, imagery/icon roles and motion if relevant. Reuse existing tokens, fonts and primitives unless the confirmed task requires changes.
- **Content and states:** realistic domain-specific text, meaningful actions and relevant empty/loading/error/success/long-content states. Clearly identify synthetic examples; do not present invented evidence as real.
- **Decision source:** confirmed reference/answer, existing-project evidence or bounded delegation. Keep material unknowns open.

For the two directions, compare information structure or emphasis, density, type and visual treatment as relevant; changing only the accent color is not a second direction. Give each a short description, user/task fit, tradeoff and recommendation. Ask the next meaningful question in the user's language. A recommendation is not a selection; silence does not select it. A mockup is optional unless requested or necessary to resolve the decision.

Perform this plan review before dependent code:

1. Does the main information and action match the user's task rather than the chosen block's demo content?
2. Could the page be reassigned to an unrelated product by changing only the logo/title? If so, investigate missing domain content, workflow or prioritization. This is a diagnostic, not a requirement to make conventional forms unusual.
3. What is the strongest reasonable alternative, and why does the selected composition fit better? A short internal design note is enough when the direction is already settled; do not manufacture a client choice.
4. Which elements have no clear information, grouping, brand or interaction purpose? Remove or justify them. Typography and brand expression can have a purpose; not every element needs to be a control.
5. Does the plan preserve the explicit reference, existing brand, accessibility and familiar interaction behavior?

Record **ready**, **revise**, or **needs an answer**, with a brief reason. Fix unsupported choices or resolve material intent before dependent code. This is self-review, not a mandatory human sign-off.

## Warning signs to investigate, not universal bans

- Identical cards for unrelated information; nested panels that obscure grouping; every section following the same template despite different jobs.
- Decorative statistics/charts, unsubstantiated proof, generic slogans and action labels that hide their outcome.
- Competing primary actions, oversized decorative headlines, low-information whitespace or dense blocks with no reading order.
- Repeated badges, gradients, shadows, all-caps labels, icons and entrance animations without an information or brand purpose.
- Theme swapping offered as the entire design rationale; ignoring product content, density, responsive behavior or failure states.

Keep these treatments when they serve the task or the human's direction. Do not ban a font, color, gradient, radius, component or familiar SaaS pattern just for being common. Do not replace one generic aesthetic with another. Preserve accessible semantics and reliable primitives; distinctive composition does not require novel controls.

## After render: evidence-led critique and repairs

Inspect an actual browser screenshot and the relevant interactions. Record viewport, screen/state and reference/contract. Review attention order, task clarity, domain content, type/spacing, grouping/density, brand consistency, appropriate states, responsive behavior and applicable accessibility. Treat a quick first-impression or squint check as a review aid, not a measured user study.

Use a compact finding record:

`ID | location/state | observation + evidence | user consequence | severity | repair | recheck/status`

- **Blocker:** the main task fails, essential content/controls are inaccessible, data/state is misleading, or the result materially violates confirmed intent/reference. Repair within scope before claiming completion; if externally blocked, state the blocker and do not claim a pass.
- **Major:** evidence shows competing hierarchy, unclear actions or repeated composition/content problems that substantially impair the intended experience. Repair and recheck within the authorized scope before handoff. A conflict with human intent requires a focused question.
- **Minor/preference:** local cosmetic issues or an untested aesthetic preference with limited task impact. Fix proportionately when useful; otherwise disclose the rationale and remaining issue without endless polishing. Do not invent user acceptance of a deferral.

Compare the strongest issue before/after at matching viewports and check affected behavior. Reuse the finding ID and mark fixed, still open, or out of scope with a reason. Recheck changed areas; do not regenerate the whole page repeatedly to seek novelty. If no actionable issue is found, report what was checked and the limits; never fabricate findings to satisfy a quota.

Keep observed defects, human preferences and untested hypotheses distinct. Do not produce an uncalibrated beauty/slop score, claim independent review when reviewing your own work, or equate automated instruction tests with demonstrated design improvement. Missing screenshots, references, services or user research must be visible limitations.

## Handoff evidence

Link the chosen direction and its source, plan-review result, actual render, findings/repairs and remaining limits. Existing browser, behavior, accessibility and reference-fidelity checks still apply. Self-review is required at the two checkpoints; human input is needed for unresolved material intent, not routine implementation decisions. Completion remains a scoped evidence-based judgment, not a universal aesthetic certificate.
