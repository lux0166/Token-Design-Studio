# Reuse components and blocks deliberately

Use this when choosing UI building blocks. It is a decision guide, not a bundled registry. Inspect the actual project and current upstream sources before adding code.

## Selection order

1. Reuse a matching component or product pattern already in the target repository.
2. Use a suitable block from the official shadcn registry or an existing project registry. Inspect source files, dependencies, framework assumptions, accessibility behavior and license. Keep only what the task needs.
3. Compose installed primitives when a whole block is unnecessary or a poor match.
4. Add a small domain component for a demonstrated gap; do not rebuild the underlying dialog, focus trap, select or keyboard behavior.

## Icon selection: prioritize Icones

Use [Icones](https://icones.js.org/) first when discovering icons for new UI or a gap in the current set. It explores Iconify collections; choosing from the catalog still requires choosing a specific family. This is a default source preference, not an instruction to replace working project icons.

1. Inspect the installed icon family, wrappers and import conventions. For refinement or reference replication, preserve that family and the reference's icon treatment unless a change is requested or a concrete gap justifies it. Search within that collection first.
2. For new UI without a family, choose one collection through Icones that fits the established direction and covers the required actions. Keep outline/filled variants, stroke weight, optical size and alignment consistent. A different family for brand logos or a missing domain symbol needs a documented reason; do not mix families arbitrarily or add decorative icons to every heading or card.
3. Verify each real `collection:icon-name` against Icones or the collection's official data before using it. Verify the actual exported component name too when using a native library; an Iconify ID is not a React import name. Do not invent IDs. If discovery is unavailable, use verified installed icons and record the limit rather than claiming a lookup happened.
4. Inspect the selected collection's license and preserve any required notices. The explorer's license does not license every icon collection. Record collection, actual IDs, source link, license/notice location and integration in DESIGN.md or the existing component map; keep records proportionate to the changed icons.
5. Use the project's installed adapter or native library. Otherwise use only the needed local SVGs or build-time icon imports supported by the stack. Do not add multiple icon libraries, download the whole catalog or introduce a runtime network dependency merely to use Icones. Respect existing authorization for dependency changes.
6. Give icon-only controls an accessible name; hide purely decorative SVGs from assistive technology. Check meaning, contrast, baseline, focus and touch target in the actual affected UI. An icon cannot substitute for a necessary text label. Small token changes and grill-me tasks need no icon work unless it is in scope.

Sources checked 2026-10-19: [Icones project and features](https://github.com/antfu-collective/icones), [Iconify collection model](https://iconify.design/docs/icons/icon-set-basics.html), [collection and license browser](https://icon-sets.iconify.design/). Recheck the selected collection when implementing; no icon assets are bundled by this guide.

### Koboyo for hand-drawn icons and illustrations

Prefer [Koboyo Icons](https://koboyo.com/icons) when the confirmed direction or supplied reference calls for hand-drawn icons or illustrations. It supplements the Icones default. Do not add a hand-drawn treatment to an established product or replace its controls merely because another source is available. If new UI has no resolved direction, use the existing two-direction interview rule before choosing this treatment.

- Browse/search by the actual concept and choose a consistent drawing style: Original, Ink brush, Block print, Cartoon or Solid. Keep the visual weight and detail appropriate to the display size; complex illustrations usually need more room than small action icons. Use a separate illustration role deliberately if interface controls keep their current family.
- Open the real asset page, inspect the preview and use its Download SVG or Copy SVG option. Verify the actual name/slug, source page, selected drawing style and exported SVG. Koboyo assets are not Iconify `collection:icon-name` IDs, and this guide supplies no npm package, API endpoint or MCP tool name for them. If access fails, record the limit; do not invent an asset or claim it was retrieved.
- Inspect SVG content before embedding, retain its viewBox/aspect ratio and use local project assets/components rather than depending on a live remote image. Inspect whether its paint uses currentColor before applying semantic theme colors. Preserve accessible names for meaningful images and controls; hide decorative artwork from assistive technology. Verify the result in the affected light/dark modes and viewport sizes.
- Read [Koboyo's current license](https://koboyo.com/icons/license) for the intended product before importing assets. As checked 2026-10-19, it allows personal/commercial website and app use, modifications and embedding in larger products without required attribution. It restricts redistributing/reselling a substantial library, competing icon/canvas/whiteboard/diagramming/presentation/drawing products, and apps where users can pick, extract, download or re-share the icons. Do not treat this as MIT, public domain or unrestricted redistribution. Do not bundle Koboyo SVGs, a picker or an exportable collection into Token Studio or its skill packages.
- Record asset page/slug, drawing style, local file, intended role, relevant license conditions and date checked in DESIGN.md or the existing component map. Keep records limited to assets actually used. Linking to a source does not prove the SVG or render was inspected. The site's "Use with AI" option does not authorize installing integrations or changing client configuration; follow the user's actual scope.

Verified entry points: [catalog](https://koboyo.com/icons), [asset page with download/copy controls](https://koboyo.com/icons/account-deletion-request), [license](https://koboyo.com/icons/license). The asset page is a navigation example, not a mandated icon for the user's screen.

## Mapping common tasks

| User task | Start by looking for | UX/state checks |
| --- | --- | --- |
| Dashboard/navigation | Existing app shell, Sidebar, Breadcrumb, Tabs; official dashboard/sidebar blocks | Active route, collapsed state, mobile drawer, empty/failed data |
| Sign in/onboarding | Existing auth flow; official login/signup blocks; form fields and validation | Real auth integration, pending, accessible errors, recovery, success destination |
| Data management | Table/data-table composition, Input, DropdownMenu, Pagination | Filtering/sorting, empty results, pagination, loading/error, long cells |
| Settings | Field/Input/Select/Switch, Tabs, Button, existing save pattern | Saved vs dirty, invalid data, network failure, disable/pending |
| Landing/conversion | Existing page sections, Button, Card, Accordion; a verified suitable open block if available | One clear next action, understandable offer, real proof, mobile hierarchy, reachable CTA |
| Checkout/pricing | Existing commerce integration, form primitives, RadioGroup, summary and alerts | Accurate totals, validation, provider errors, duplicate submission, authorization |
| Search/command | Existing search behavior, Command or Combobox as appropriate | Keyboard navigation, empty query/results, pending, result selection |
| Destructive action | AlertDialog and existing permission/business logic | Clear consequence, cancel path, server validation, truthful completion |

These component names are search starting points. Check their availability and APIs in the project's installed version; do not import a component solely because it appears in this table.

## Discovery and freshness

- Read components.json and installed components first. Use the project's package manager and existing aliases.
- Prefer available official shadcn MCP registry-discovery/search/view tools. Inspect their actual tool schemas, because clients may expose different names.
- CLI fallback: use current official CLI help/info/docs/search/view as supported by the installed/current version. Fetch the documentation URLs the CLI returns before using an unfamiliar component. Do not guess block IDs or overwrite flags.
- Pin the package lockfile and record the selected item/source at the time of implementation. Do not copy an entire registry catalog into the design contract.
- Confirm the primitive base and API: for example, Radix and Base UI can differ in composition, selection, control props and styling hooks.
- Inspect the proposed component files before installation. Merge project-specific changes instead of replacing customized primitives. A preset change is a design decision, not a repair for a failed command.

## Authoritative entry points

Checked as source links on 2026-10-15; recheck when using them, rather than treating this date as a guarantee of current content.

- [Components](https://ui.shadcn.com/docs/components)
- [Official blocks](https://ui.shadcn.com/blocks)
- [MCP discovery and registry support](https://ui.shadcn.com/docs/mcp)
- [CLI reference](https://ui.shadcn.com/docs/cli)
- [Theme integration](https://ui.shadcn.com/docs/theming)

The official catalog includes dashboard, sidebar and authentication blocks at the time checked. Verify the currently available item rather than assuming an example ID remains stable. A marketing section, pricing table or bespoke domain workflow may still need composition. Do not imply Token Studio ships these upstream blocks, paid ProBlocks or a working registry of its own.

## A compact component map

Record only decisions useful to implementation:

| Section | Source/component | State or interaction | Token roles | Needed change |
| --- | --- | --- | --- | --- |
| Example: lead form | Existing form + installed Input/Button | Validation, pending, success | input, ring, primary, primary-foreground | Add task-specific fields and real submit handler |

Use real filenames/item IDs after inspection. This example is a format, not a required section or assumed component inventory.
