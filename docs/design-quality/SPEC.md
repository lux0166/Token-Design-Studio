# Design direction and critique — draft specification

Status: Implemented and locally verified within the confirmed scope. Date: 2026-10-16. See VERIFICATION.md for results and limitations.

## Outcome

Improve token-studio-shadcn so agent decisions about layout, content and visual direction are intentional, traceable to the user's product, and critically checked before handoff. Preserve the existing interview/spec workflow and the user's preference against unnecessary approval loops.

## Decision ledger

| ID | Decision | State | Source |
| --- | --- | --- | --- |
| D-01 | Fix the previously identified gaps in design direction, contextual generic-pattern review, domain specificity and rendered critique. | Confirmed | User: "Các điều kiện các khoảng trống này cần phải fix." |
| D-02 | Create and push a GitHub repository before research/interview/critique. | Confirmed; completed | User requested repo "Token Design Studio". Repository lux0166/Token-Design-Studio exists; initial main commit cd96906 is on origin. |
| D-03 | Existing skill has interviews, source-aware reuse, token consistency and browser verification. | Existing evidence | Baseline skill and references; see CRITICAL.md. |
| D-04 | Mandatory agent self-review before code and after render; ask the human only for missing material intent. | Confirmed | User selected "Tự kiểm tra bắt buộc; chỉ hỏi khi thiếu ý định". |
| D-05 | For new UI without clear brand/reference, propose two concise different directions with reasons and ask the human to choose. Preserve clear references, prior choices and explicit delegation. | Confirmed | User selected "Đề xuất 2 hướng ngắn, có khác biệt và lý do; hỏi tôi chọn". |
| D-06 | Repair blockers and major issues within authorized scope before claiming completion; treat minor preferences proportionately and disclose remaining limits. | Implementation decision within D-01/D-04 | Proposed severity policy from research/critical review. This is not a claimed human answer or an enforced client policy. |

## Confirmed boundary

The work targets the skill and its delivered workflow, not an unsolicited redesign of Fluento or Token Studio. Repository backup is complete. Research and critical review can proceed independently; dependent workflow behavior must follow the interview decisions. Repository visibility is currently private, selected conservatively because public visibility was not requested.

## Requirements

- R-01: For new or substantially redesigned UI, create a brief-specific direction contract before code: audience/task, information priority, content, composition, typography roles, density/spacing, semantic colors, imagery, motion and responsive rules where relevant. Explain consequential choices using confirmed intent, existing evidence or bounded delegation.
- R-02: Major sections map to tasks or decisions. Use realistic clearly synthetic examples when real data is unavailable. Do not invent testimonials, usage metrics or operational integrations.
- R-03: Review repeated card layouts, decorative statistics, vague headlines and needless effects as contextual warning signs, not forbidden styles. Preserve explicit references, existing brands and familiar interactions.
- R-04: Critique the direction before building and the actual render after building. Record observed issue, location, evidence, user consequence, remedy and post-repair status. Distinguish evidence from preference and hypothesis. These are agent self-review checkpoints, not an extra human approval round. For missing new-UI direction, follow the two-option interview rule in D-05.
- R-05: Keep new-build, replicate, refine and token-only paths proportionate. Do not force a full redesign or visual exploration onto a small correction.
- R-06: Any added guide is consistently available in the installed skill, get_workflow, MCP prompts/resources and editor export. Keep compatibility and source-of-truth handling deliberate.
- R-07: Separate automated instruction-delivery checks from task-scenario evaluation. A passing text assertion does not prove aesthetic quality or enforced agent compliance.

## Acceptance scenarios

- AC-01: A new English 1:1 operations dashboard prioritizes actual administrator/teacher tasks and records why its main sections exist; it does not inherit unrelated revenue tiles from a chosen block.
- AC-02: An exact screenshot request preserves the supplied direction and checks fidelity, without creating unrequested alternative aesthetics.
- AC-03: A small radius/token correction stays within scope and performs affected checks without a new generic interview or design dossier.
- AC-04: An explicitly requested familiar card-based SaaS style is respected; critique assesses hierarchy and purpose rather than automatically rejecting cards.
- AC-05: A new direction with unresolved material aesthetic choices triggers the agreed interview/selection behavior; silence is not an answer.
- AC-06: A rendered issue has a concrete evidence trail and is repaired/rechecked or treated under the severity policy established in the interview.
- AC-07: HTTP/stdio get_workflow and prompts return the same new quality guide; installed files match source; editor download includes it.
- AC-08: Missing browser/reference access is disclosed; the agent does not invent screenshot review, user validation, beauty scores or conversion gains.

## Completion

Source skill, installation/package and workflow delivery paths have been updated to 1.2.0. HTTP/stdio parity, installer behavior, production build, browser presentation and policy walkthroughs are recorded in VERIFICATION.md. There are no remaining material interview questions for this scope. Generative aesthetic improvement has not been benchmarked.
