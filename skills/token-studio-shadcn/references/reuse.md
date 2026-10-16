# Reuse components and blocks deliberately

Use this when choosing UI building blocks. It is a decision guide, not a bundled registry. Inspect the actual project and current upstream sources before adding code.

## Selection order

1. Reuse a matching component or product pattern already in the target repository.
2. Use a suitable block from the official shadcn registry or an existing project registry. Inspect source files, dependencies, framework assumptions, accessibility behavior and license. Keep only what the task needs.
3. Compose installed primitives when a whole block is unnecessary or a poor match.
4. Add a small domain component for a demonstrated gap; do not rebuild the underlying dialog, focus trap, select or keyboard behavior.

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
