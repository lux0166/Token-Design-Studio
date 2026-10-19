---
name: token-studio-shadcn
description: Interview users to resolve intent, specify deliberate design direction, and build shadcn/ui screens with Token Studio, component reuse and evidence-led critical review. Use for new screens, design-to-code, UI refinement, anti-slop design quality, critique, or grill me / interview-to-spec requests.
---

# Token Studio: design and ship with shadcn/ui

Use a consistent path from the user's task to working UI: **brief → interview → reuse → spec → build → verify → handoff**. Interview to resolve user intent before dependent implementation; do not turn guesses into requirements. Scale depth to the task: an explicit token correction needs no generic questionnaire, while an ambiguous new product needs discovery. Continue through implementation and verification when the user requested a build. In explicit **grill-me** mode, deliver the specification and stop before implementation.

Token Studio owns the theme, locks and change history. The target repository owns application code. A shadcn registry provides components and blocks. Use each source for its real capability; Token Studio does not supply a component registry or a Figma bridge.

For requested implementation or interview-to-spec work, read [references/tasks.md](references/tasks.md). Keep a proportionate project dossier under `.token-studio/tasks/<UUID>/`: actual decisions, artifacts, checks and repairs. Workflow 1.4.0 uses schemaVersion 2. Use the bundled template/schema, not an invented wire format. Link each acceptance criterion to sourced decisions and a specific acceptance check with artifact IDs. Capture separate plan/implementation snapshots and use the local helper to verify files, hashes and the current dossier before completion. A source link or a passed build alone is insufficient. Sync through the six task MCP tools when available; validate and complete only when the reported evidence meets the mode's requirements. Studio refuses incomplete completion records but cannot prevent external code changes or authenticate design evidence. For refine work limited to an existing UI region, use scope="local-ui", short scope/change/handoff notes and affected evidence; do not require separate screen documents. Token-only work also uses compact notes. Screen work retains full requirements. For critique-only requests, deliver findings without creating an implementation task unless requested.

For design work, read [references/design-quality.md](references/design-quality.md). Self-review the direction before dependent UI code and critique the actual render before handoff. When new UI has no clear brand/reference, propose two concise, meaningfully different directions with reasons and ask the human to choose; do not interpret silence as a choice. A clear reference, prior choice or explicit bounded delegation removes that interview gap. Do not add a human approval round for an already resolved direction. For an explicit critique-only request, deliver findings without unrequested code changes.

## 1. Read the context before asking

Inspect the user's request, prior answers, existing screen and relevant repository instructions. Extract the target user, primary job, success action, input/output, business constraints and necessary states. Record each material decision as human-confirmed, existing-project evidence, explicitly delegated, or unresolved. Evidence of existing behavior is not confirmation of a new business intent. Do not ask again for answers already present.

Draft a short brief from known facts and list material unknowns. For conversion work, express a hypothesis such as reducing form abandonment or making the primary action easier to find. Do not invent analytics, testimonials, scarcity or guaranteed uplift.

Gate: the agent knows which decisions are supported and which require interviewing.

## 2. Grill me: interview to a specification

Read [references/interview.md](references/interview.md). Ask one focused question at a time by default, with up to three closely related questions per round. Follow the user's answers into concrete examples, edge cases, tradeoffs and contradictions. Cover only relevant gaps; do not dump a fixed questionnaire or ask the user to decide implementation trivia that the repository already resolves.

Resolve material choices about users, main flow, scope, business rules, data ownership/persistence, integrations, prototype versus operating service, visual direction and success criteria. Wait for actual answers before dependent work; elapsed time and silence do not choose a default. Continue independent inspection while waiting. A recommendation remains a proposal until answered, or until the human explicitly delegates that decision within a clear boundary.

After each round, update the decision ledger and draft SPEC.md (or the project's existing spec). Trace requirements to answers or project evidence; mark unresolved items and their consequences. When answers are sufficient, summarize the resulting scope, finish testable acceptance criteria, and continue authorized implementation. Ask a focused follow-up only for material gaps or contradictions; do not add an unrelated permission round. Explicit grill-me mode ends with SPEC.md and any remaining open questions.

Gate: no unresolved material intent is silently replaced by an assumption. Requirements, boundaries, rules and acceptance criteria are concrete enough to implement and test.

## 3. Inspect before choosing or installing

Read the target package manifest, lockfile, components.json when present, global CSS, route/layout, installed UI components and existing tests. Identify framework, aliases, package manager, Tailwind version, primitive base, icon library, fonts, existing component variants and actual build scripts. Preserve these choices unless the task requires a migration.

If Token Studio MCP is available, call list_systems and get_system for the chosen system. Use the ID actually returned; distinguish the design system name from its ID. Capture token settings and locks. When modifying an existing product, use its current theme as the starting point; preview any import before applying it.

When the task calls for choosing a theme, discover the bundled library with list_themes, then read get_theme for its supported snapshot and adaptation notes. Theme IDs are separate from system UUIDs. Use apply_theme with apply=false to inspect changes and preserved locked paths; apply=true requires the latest expectedRevision. create_system accepts themeId for a new named system. Preserve locked values, report any resulting mixed theme, and do not claim upstream typography/shadow fidelity when the notes identify substitutions. Personal saved themes are design systems discovered through list_systems/get_system.

For component selection, read [references/reuse.md](references/reuse.md). Prefer installed components, then a suitable verified official/open-source block, then composition from primitives. Create a new primitive only for a gap the existing APIs cannot reasonably cover. Record source, registry item and license for added blocks. A large block is useful only when its layout, dependencies and behavior fit the task.

For new icon selection, prioritize [Icones](https://icones.js.org/) as the discovery source. Select one coherent icon family that fits the confirmed direction; Icones is an explorer of Iconify collections, not a single icon set. Preserve the project's existing family and integration when refining it. Follow the icon policy in references/reuse.md: verify actual icon IDs and the collection's license, use the project's integration, and record provenance in DESIGN.md or the existing component map. When the confirmed direction calls for hand-drawn icons or illustrations, prefer [Koboyo Icons](https://koboyo.com/icons) and follow the Koboyo section in references/reuse.md for verified asset pages, style, local SVG integration and its custom license restrictions. Keep Icones as the default interface-icon source. Do not turn a small token change or grill-me interview into an icon migration.

Use available shadcn MCP discovery/search/view tools or the current official CLI/docs. Discover tool names and registry item IDs rather than inventing them. Read the component's actual source and current API before importing it. Do not assume Radix asChild and Base UI render are interchangeable, or Tailwind v3 and v4 use the same theme mapping. Do not reset a configured project or overwrite customized UI components to make an installer pass. Inspect proposed file/dependency changes; preserve local changes and use existing authorization for routine additions.

Gate: record a compact map of **screen section → existing component/block → state → semantic token → source**. Flag real gaps, not every minor composition choice.

## 4. Specify a design that can be implemented

For an existing design or screenshot, inspect the actual reference and assets. Record reference dimensions, content order, container widths, column layout, spacing, typography family/size/weight/line height, colors, radii, shadows, icon family and responsive rules. Preserve the reference's copy and hierarchy unless the user requested a change. If the design is inaccessible or missing, say so; do not claim fidelity to something unseen.

For new UI, define those decisions using the project's system and the interview specification. Use the project's design artifact format, or a concise DESIGN.md alongside SPEC.md when no convention exists. Include desktop and mobile behavior plus empty, loading, error, success, hover, focus and disabled states where relevant. For small local-ui/token changes, keep the affected contract in task.notes instead of creating empty documents. Keep product requirements separate from agent implementation decisions made within the confirmed or delegated boundaries. Use available reference/mockup tools when the project workflow calls for them; an unrelated tool subscription is not a prerequisite.

Explain the chosen information priority, composition, density, typography and major section roles using the product's task and content. A theme or installed block is a starting point, not a complete design rationale. Apply the before-code self-review in the quality guide; record ready/revise/needs an answer and resolve relevant gaps before dependent code. Preserve conventional controls and explicit brand/reference choices. Treat generic-pattern warning signs contextually, not as blanket style bans.

Tie every visual role to semantic tokens (background/foreground, card/card-foreground, primary/primary-foreground, border/input/ring, and so on). Color, font, radius and spacing should have a defined source. Avoid arbitrary one-off values that contradict the contract; exact reference geometry can be documented when the token scale cannot represent it.

If token edits are needed, read get_system immediately before each batch and use the returned revision for update_tokens. Change only the intended fields. On a stale revision, reread and reconcile instead of overwriting newer work. On a lock error, report the blocked field and continue unrelated work; never attempt to unlock it through another route. Do not silently pick a different design system.

Gate: layout, content, component mapping, tokens, interactions and responsive behavior can be translated to code without guessing material details. "Pixel-perfect" is a target to verify, not a promise made before rendering.

## 5. Build a working vertical slice, then complete the screen

Check the interview/spec gate before dependent implementation. Use requirement IDs from SPEC.md to keep behavior and tests aligned with the user's answers. If new evidence changes scope or exposes a material unanswered business rule, ask about that gap and update the spec instead of silently improvising.

Compose the mapped shadcn/ui components in the existing code structure. Keep business state, reusable components and page composition separated to the extent the feature needs. Use existing component variants and the project's helper for class composition; use semantic theme utilities rather than a second parallel color palette. Preserve keyboard/focus behavior supplied by the primitive.

Export CSS from Token Studio only when integrating a theme. Compare it with the real global stylesheet and merge compatible sections while preserving imports, fonts and unrelated custom tokens. The current Token Studio export targets Tailwind v4. Do not paste full CSS colors into a v3 hsl(var(--token)) configuration; make a deliberate compatible conversion if that migration is in scope. Theme export does not contain React component source.

Make the primary task work end to end with the real backend when one is present. Show pending, validation, failure and success states. Keep local state coherent and prevent accidental duplicate submission where it matters. If a backend/provider is outside the authorized scope or unavailable, make the limitation visible and record it; do not portray a local preview as a production integration. Every visible control needs meaningful behavior or a truthful disabled state.

Work in reviewable slices, preserving existing behavior. Adapt layout for content growth, localization, small screens and zoom. Use semantic markup, associated labels, meaningful icon-button names, visible focus, dialog focus management and accessible error messages. Respect reduced motion. Add authorization and server-side validation where the actual feature requires them; a successful form animation is not evidence of backend correctness.

Gate: the screen builds and its main task is usable before a visual polish claim.

## 6. Verify visual fidelity and product behavior separately

Run the project's available typecheck, lint, tests and production build as appropriate. Test the changed behavior and meaningful failure cases; avoid duplicating implementation logic in tests. Report commands and outcomes accurately, including checks unavailable in this environment.

Use a real browser. Exercise the primary user journey, keyboard navigation, form validation, loading/error/success, empty/long content and small-screen behavior for the affected feature. Inspect console/network failures. Use check_contrast on the relevant Token Studio modes and inspect the rendered screen too: token-pair checks alone do not audit every state or overlay.

For visual comparison, render at the reference viewport and capture a screenshot. Compare layout/geometry, typography, spacing, colors, borders/radii/shadows, assets/icons, copy and states. Measure the relevant DOM/computed styles when a difference is ambiguous. Correct visible differences, capture again and record any intentional deviations or environment limits. Use an image diff if it helps; font rendering and antialiasing mean a raw pixel count is not sufficient evidence alone. Test at least one narrow viewport when a responsive screen is in scope and confirm there is no unintended horizontal overflow.

For new UI as well as reference work, apply the after-render critical review in references/design-quality.md. Tie each finding to its location, observed evidence, user consequence and repair; recheck substantive repairs. Repair blockers and major issues within scope before claiming completion, and disclose external blockers. Handle minor preferences proportionately. Do not invent a beauty score, user validation or independent review; repeated cosmetic variation is not evidence of improvement.

Do not declare pixel-perfect or production-ready solely because the build passed. If meaningful visual differences, missing states, fake integrations or failed checks remain, describe them and continue repairs that are within scope. A blocked external service does not require abandoning independent local verification.

Gate: acceptance criteria and the main flow pass; visual evidence is captured at stated dimensions; unresolved issues are explicitly identified.

## 7. Deliver with evidence

Read [references/handoff.md](references/handoff.md) for the compact handoff format. Link the interview-derived specification, decisions, unresolved items, and acceptance results. Explain what changed and why, how to run/view it, which components were reused, what was verified, and any material limits. Link actual files and screenshots. Distinguish "implemented and locally verified" from "deployed".

Deploy, publish, merge, send messages or modify external services only within the human's authorization. Do not insert a new approval loop for ordinary reversible code work already requested. Do not claim a speed multiplier or conversion gain without measurements.

## MCP entry points

On a client that supports them, get_workflow returns this process, interview guide, designQualityGuide and relevant mode guidance. design_and_ship is the implementation prompt; grill_me is the interview-to-spec prompt. Use mode="grill-me" for interview only. Resources: token-studio://workflow, token-studio://workflow/interview, token-studio://workflow/reuse, token-studio://workflow/design-quality and token-studio://workflow/handoff. If Token Studio is not connected, use this skill with the target project's existing tokens and clearly report that no Token Studio synchronization was performed. If the client only exposes tools, get_workflow is sufficient to read all guides; prompt/resource support is optional.
