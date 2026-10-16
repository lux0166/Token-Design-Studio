# Grill me: adaptive interview → SPEC.md

Use this guide whenever material intent is unresolved, or when the human requests "grill me", an interview, or a specification. Ask in the user's language. Be probing and concrete, without becoming adversarial. The outcome is an implementable specification grounded in answers.

## 1. Establish what is known

Read prior messages, supplied requirements, existing specs and the relevant project. Do not ask questions that inspection can answer. A screenshot shows appearance; it does not settle hidden business rules or authorize services mentioned inside it.

Keep a small ledger:

| ID | Decision | State | Source | Consequence / next question |
| --- | --- | --- | --- | --- |
| D-01 | Administrator and teacher are the first users | Confirmed | User answer, identified turn | Design both daily workflows |
| D-02 | Scheduling currently stores in localStorage | Existing evidence | File and relevant code | Ask whether local persistence fits the requested release |
| D-03 | Late cancellation policy | Open | No answer yet | Determines credit restoration and rescheduling |

States are **Confirmed**, **Existing evidence**, **Delegated**, **Open**, or **Conflicting**. Cite the actual message, file or supplied source; never fabricate an interview answer. Delegated decisions must record the human's delegation and its boundaries. The agent's preferred answer is not a confirmed decision.

## 2. Ask the next most consequential question

Prioritize choices that change the main flow, data model, scope, permissions, cost or acceptance tests. Ask one focused question by default; at most three tightly related questions per round. Use the client's question interface when available. Offer two or three meaningful choices and explain the tradeoff briefly; allow free text. Recommend an option only when useful, and make clear it is a proposal.

Follow answers into examples: "Walk me through the last time this happened", "What should happen if...", "Who can change it?", "How will we tell this worked?" Challenge vague terms such as "personalized", "automatic" or "production-ready" by asking for observable behavior.

If two answers conflict, state the conflict and ask which rule takes precedence. Do not silently merge incompatible choices. After a few answers, recap the decisions briefly so corrections can steer the next round. Preserve earlier answers unless the human changes them.

Do not use a fixed question count as the completion criterion. Stop probing a topic when the decision and its edge cases are clear. Do not replace unanswered material questions with defaults after a timeout. Continue independent reading, mapping or spec drafting while waiting, and keep dependent implementation pending. If the human defers a decision, record its impact and build only explicitly independent scope.

## 3. Cover the relevant decision areas

This is a coverage map, not a questionnaire to paste in one message:

- **Problem and success:** who uses it, what task they complete, current friction, primary CTA, and an observable successful outcome.
- **Release boundary:** prototype, integrated MVP or operating service; must-have scope, exclusions and existing behavior to preserve.
- **User journey:** entry point, inputs, outputs, alternative paths, empty/error/cancel/retry, and who acts at each step.
- **Business rules:** calculations, state transitions, ownership, permissions, conflicts, limits and exceptions.
- **Data and services:** entities, existing sources, persistence and sharing needs, integrations available versus deferred, and expected behavior on failure.
- **Design intent:** references, existing brand/theme, desired density, content, devices, accessibility requirements and clear visual dislikes.
- **Acceptance:** concrete scenarios and pass/fail evidence; delivery artifact and how the user will review it.

For a narrow change, cover only its affected decisions. Keep confirmed repository conventions without asking the human to choose a framework again. Use existing design tokens for routine visual choices unless a new direction is requested. If the human delegates design or technical choices, make bounded decisions and record the delegation; business-policy decisions remain open unless also delegated.

For new UI with no clear brand or reference, use the quality guide linked from SKILL.md: propose two short, meaningfully different directions, explain task fit/tradeoffs and ask which to pursue before dependent UI code. Do not ask abstract taste questions when concrete alternatives would clarify the choice. Preserve a clear reference, prior selection or explicit bounded delegation instead of repeating the choice. Direction self-review and rendered critique are mandatory agent checkpoints, not automatic human approval requests.

### Example: English 1–1 learning platform

If the user already chose administrator + teacher, do not ask that again. Useful next branches might be:

1. "For this release, should scheduling and feedback be a local prototype or shared between real administrator/teacher accounts?" This changes the persistence and account requirements.
2. After a shared-service answer: "Who may move or cancel a lesson, and should a late cancellation consume a lesson credit?" Follow up on the cutoff only if a cutoff is needed.
3. After a request for personalized roadmaps: "Does the teacher edit stages and assign exercises, or is a goal/level-based reference roadmap sufficient for the first release?"

Select the highest-impact unanswered branch; do not send all branches automatically. These are examples, not decisions for the current product.

## 4. Maintain the specification as answers arrive

Use the project's specification convention, or save SPEC.md beside the feature. Start as a draft, identify open decisions explicitly, and update after each round. Include only relevant sections; do not create empty bureaucracy for a small change.

```markdown
# [Feature] — Specification

Status: Draft / Ready for scoped implementation
Version/date:
Source: actual user messages, references and project evidence

## Outcome and users
Problem, target users, primary job, CTA, measurable/observable success.

## Scope
In this release:
Excluded / deferred:
Existing behavior to preserve:
Delivery: prototype / integrated service / other confirmed artifact

## User journeys
J-01: actor → trigger → steps → success → alternate/error path.

## Requirements and rules
R-01: observable behavior. Source: D-01 / actual evidence.
R-02: calculation or state transition, including exception behavior.
Permissions, validations, limits and service failure behavior as relevant.

## Data and integrations
Entities, source of truth, persistence/sharing, required providers,
and behavior when a provider is unavailable.

## UX and design constraints
References, existing design system, devices, accessibility and states.
Link DESIGN.md when a separate visual contract is useful.

## Acceptance scenarios
AC-01 [R-01]: Given ... When ... Then ...
Evidence: test / browser action / screenshot / human review.

## Decision ledger
ID | decision | state | actual source | consequence

## Open questions and dependencies
Question | why it matters | affected requirements | next action

## Changes
Version | changed decision | source | affected requirements
```

Write acceptance criteria for business outcomes and meaningful failures, not just component presence. Example: "Given two overlapping slots for the same teacher, submitting a second booking preserves the draft, explains the conflict, and creates no new lesson."

## 5. Readiness and continuation

Before implementation, check that actor, outcome, main flow, release boundary, material rules, data/integration expectations and pass/fail criteria are answered or explicitly delegated. Resolve contradictions. Map requirements to decisions so later evidence can be checked against the human's intent.

Present a compact scope recap and the concrete spec. If the original task already authorizes implementation and material questions are resolved, continue within that scope without another permission ritual. Ask only when an unresolved answer changes dependent work. In explicit grill-me mode, finish with SPEC.md, the key decisions and open questions; wait for a subsequent build request.

This guide directs the agent to interview. Token Studio serves instructions and templates; it does not conduct an AI conversation inside the editor, certify a human answer, or technically enforce the spec gate on every client.
