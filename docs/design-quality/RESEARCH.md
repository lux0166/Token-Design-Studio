# Design quality research

Date: 2026-10-16. Scope: improving token-studio-shadcn's design direction and critique workflow, after backing up the current product to GitHub. This document records research and recommendations, not confirmed interview answers or completed fixes.

## Primary sources reviewed

| Source | Observation, paraphrased | Application proposed for Token Design Studio |
| --- | --- | --- |
| [Anthropic frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), accessed 2026-10-16 | Relates visual choices to subject matter, asks for a design plan and a critique before building, and reviews rendered work. Its discussion of recurring visual defaults treats them as contextual signals rather than universally invalid styles. | Require a brief-specific rationale before new UI work and inspect actual screenshots after building. Do not import a blanket font/color ban or force novelty into existing products. |
| [GOV.UK: using, adapting and creating patterns](https://www.gov.uk/service-manual/design/using-adapting-and-creating-patterns), accessed 2026-10-16 | Established patterns reuse accumulated experience; teams can adapt or create patterns when evidence shows current patterns do not meet user needs. | Reuse reliable interaction primitives, evaluate large blocks against the actual task and content, and explain adaptations. |
| [NN/g: visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/), accessed 2026-10-16 | Relative contrast, scale and grouping establish information priority. Equal visual emphasis can obscure where to start. | Evaluate what attracts attention and whether that matches the primary task; do not equate a fashionable palette with useful hierarchy. |
| [NN/g: ten usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), accessed 2026-10-16 | Familiar language, status feedback, consistency, error recovery and relevant information support usable interfaces. These are general evaluation heuristics. | Pair aesthetic review with task completion, meaningful content and failure-state review. A visual preference cannot override a broken user journey. |
| [W3C: WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/), accessed 2026-10-16 | Accessibility includes multiple criteria, including focus, contrast, input assistance and reflow. | Keep applicable accessibility checks separate from subjective design critique. Token-pair contrast or a screenshot alone is not a conformance audit. |
| [shadcn/ui introduction](https://ui.shadcn.com/docs), accessed 2026-10-16 | shadcn/ui provides customizable component code and composition conventions. | Treat component selection as an implementation foundation; it does not by itself define product-specific composition or brand direction. |

The interpretations in the third column are project proposals, not claims that these sources certify a design or prove that a prompt eliminates generic output. No upstream skill text was copied into the product.

## Proposed operating model

1. Ground the brief: target user, primary task, real or clearly synthetic domain content, existing conventions, visual preferences and constraints.
2. Specify direction: content priority, composition, typography roles, spacing/density, palette meaning, imagery and interaction behavior, with reasons linked to the brief. Where an axis is unresolved, ask or record bounded delegation.
3. Challenge the plan: identify the strongest alternative and why the chosen approach better supports the task. Reuse accepted conventions; do not produce extra mockups for a token correction or exact-reference replication.
4. Build within the contract and verify behavior.
5. Critique the rendered result: record location, observed issue, user impact, evidence, proposed remedy, and status after repair. Distinguish observed defects from taste or untested hypotheses.

## Risks and controls proposed

- A universal blacklist can make every design converge on a different template. Use context-sensitive warning signs and explicit exceptions.
- A numeric beauty score can create false certainty. Use concrete findings and evidence; do not invent a universal AI-slop detector.
- Endless critique can prevent delivery. Prioritize meaningful issues, recheck changed areas and disclose remaining limits; do not require endless variation.
- Mandatory client approval can recreate the permission loops the user dislikes. Approval behavior is an open interview decision; self-review and human approval are separate concepts.
- Requirements hidden only in a reference file may never reach an MCP client. The final implementation should wire any new guide through get_workflow, prompts, resources and the editor's exported guide, with parity tests.

## Evaluation approach proposed

Use task scenarios rather than testing whether a document contains the phrase "anti-slop": a domain dashboard, new marketing page, existing-brand refinement, exact screenshot replication, a small token correction, a deliberately familiar SaaS style, incomplete evidence, and critique of a real rendered screen. Check both positive behavior and avoidance of unnecessary redesign/interview loops. Text delivery tests can verify guide availability, but cannot prove visual improvement; scenario outcomes need separate evidence.
