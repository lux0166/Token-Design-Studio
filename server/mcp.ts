import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { patchSchema, type SystemPatch } from '../shared/model.js';
import { agentInstructions, workflowModes, workflowResources } from '../shared/workflow.js';
import { getWorkflow, workflowPrompt } from './workflow.js';
import { appVersion } from './version.js';
import { taskInputSchema } from '../shared/tasks.js';
import type { TaskStore } from './tasks.js';
import { themeCatalog, getCatalogTheme, filterThemes, catalogSource } from '../shared/themes.js';

export interface AgentOperations {
  list(): unknown | Promise<unknown>;
  get(id: string): unknown | Promise<unknown>;
  create(name: string, preset: number, themeId?: string): unknown | Promise<unknown>;
  applyTheme(id: string, themeId: string, apply: boolean, expectedRevision?: number): unknown | Promise<unknown>;
  update(id: string, patch: SystemPatch, expectedRevision: number): unknown | Promise<unknown>;
  export(id: string): unknown | Promise<unknown>;
  contrast(id: string, mode: 'light' | 'dark'): unknown | Promise<unknown>;
  import(id: string, css: string, apply: boolean, expectedRevision?: number): unknown | Promise<unknown>;
}
export function createMcpServer(ops: AgentOperations, tasks: TaskStore, log?: (tool: string, ok: boolean, detail: string) => void) {
  const server = new McpServer({ name: 'token-studio', version: appVersion }, {
    instructions: agentInstructions,
  });
  const wrap = (name: string, fn: (args: any) => unknown | Promise<unknown>) => async (args: any) => {
    try {
      const result = await fn(args);
      log?.(name, true, args.systemId ?? args.taskId ?? 'Workspace');
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log?.(name, false, message);
      return { content: [{ type: 'text' as const, text: message }], isError: true };
    }
  };
  const read = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
  const write = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
  const id = z.string().uuid().describe('ID from list_systems');
  const taskId = z.string().uuid().describe('ID from create_task/list_tasks');
  const revision = z.number().int().min(0);
  server.registerTool('create_task', { description: 'Sync a project task dossier into Studio. Incomplete records are allowed. Files stay in the project; this server never reads their paths. Optional taskId preserves an offline UUID.', inputSchema: { task: taskInputSchema, taskId: taskId.optional() }, annotations: write }, wrap('create_task', a => tasks.create(a.task, a.taskId)));
  server.registerTool('list_tasks', { description: 'List synced design tasks, status and per-task revisions.', annotations: read }, wrap('list_tasks', () => tasks.list()));
  server.registerTool('get_task', { description: 'Read the latest dossier and per-task revision before replacing or completing it.', inputSchema: { taskId }, annotations: read }, wrap('get_task', a => tasks.get(a.taskId)));
  server.registerTool('update_task', { description: 'Replace the synced task content with the project source of truth. Requires latest per-task revision; reopens completed tasks. Does not read or write project files.', inputSchema: { taskId, task: taskInputSchema, expectedRevision: revision }, annotations: write }, wrap('update_task', a => tasks.update(a.taskId, a.task, a.expectedRevision)));
  server.registerTool('validate_task', { description: 'Read missing completion requirements without changing status. Checks reported records, not screenshot authenticity or beauty.', inputSchema: { taskId }, annotations: read }, wrap('validate_task', a => tasks.validate(a.taskId)));
  server.registerTool('complete_task', { description: 'Mark a task complete only when mode-specific evidence is recorded and required checks and substantive repairs pass. Rejects missing requirements; cannot prevent coding outside Studio.', inputSchema: { taskId, expectedRevision: revision }, annotations: write }, wrap('complete_task', a => tasks.complete(a.taskId, a.expectedRevision)));
  server.registerTool('get_workflow', {
    description: 'Start here for shadcn/ui tasks: get adaptive interview, specification, design direction, component reuse, mandatory plan/render self-review, build, verification and handoff guides. Use mode=grill-me for interview-to-spec only. Returns instructions; does not run an interview or enforce design quality.',
    inputSchema: { mode: z.enum(workflowModes).default('design-and-build') }, annotations: read,
  }, wrap('get_workflow', a => getWorkflow(a.mode)));
  server.registerTool('list_systems', { description: 'List local design systems and current workspace revision.', annotations: read }, wrap('list_systems', () => ops.list()));
  server.registerTool('get_system', { description: 'Read all light/dark tokens, settings, locks, and latest workspace revision. Read immediately before update.', inputSchema: { systemId: id }, annotations: read }, wrap('get_system', a => ops.get(a.systemId)));
  server.registerTool('list_themes', { description: 'Search the bundled local theme library. Returns real theme IDs, names, sources and light/dark swatches. For saved personal systems use list_systems/get_system.', inputSchema: { query: z.string().max(100).default('') }, annotations: read }, wrap('list_themes', a => ({ source: catalogSource, themes: filterThemes(themeCatalog, a.query).map(t => ({ id: t.id, name: t.name, source: t.source, light: { primary: t.snapshot.light.primary, background: t.snapshot.light.background }, dark: { primary: t.snapshot.dark.primary, background: t.snapshot.dark.background } })) })));
  server.registerTool('get_theme', { description: 'Read a bundled theme snapshot and adaptation notes. This does not apply it. Use an ID from list_themes.', inputSchema: { themeId: z.string().min(1).max(100) }, annotations: read }, wrap('get_theme', a => getCatalogTheme(a.themeId)));
  server.registerTool('apply_theme', { description: 'Preview a library theme on an existing system with apply=false (default); includes preserved locked paths and changed values. Apply=true requires latest expectedRevision and saves one undoable change while keeping name and locks.', inputSchema: { systemId: id, themeId: z.string().min(1).max(100), apply: z.boolean().default(false), expectedRevision: z.number().int().min(0).optional() }, annotations: write }, wrap('apply_theme', a => ops.applyTheme(a.systemId, a.themeId, a.apply, a.expectedRevision)));
  server.registerTool('create_system', { description: 'Create a local design system. Prefer themeId from list_themes for the full library. Without themeId, legacy preset indices are 0 Forest, 1 Ocean, 2 Violet, 3 Sunset, 4 Rose, 5 Zinc.', inputSchema: { name: z.string().trim().min(1).max(60), themeId: z.string().min(1).max(100).optional(), preset: z.number().int().min(0).max(5).default(0) }, annotations: write }, wrap('create_system', a => ops.create(a.name, a.preset, a.themeId)));
  server.registerTool('update_tokens', { description: 'Atomically update color tokens and settings; refuses entire batch if any changed token is locked. HEX #RRGGBB only. Read latest revision first.', inputSchema: { systemId: id, patch: patchSchema, expectedRevision: z.number().int().min(0) }, annotations: write }, wrap('update_tokens', a => ops.update(a.systemId, a.patch, a.expectedRevision)));
  server.registerTool('export_css', { description: 'Return complete light/dark CSS for Tailwind v4 / shadcn/ui. Does not write to project files.', inputSchema: { systemId: id }, annotations: read }, wrap('export_css', a => ops.export(a.systemId)));
  server.registerTool('check_contrast', { description: 'Compute WCAG contrast ratios for text color pairs; failures first. AA uses 4.5:1 for normal text.', inputSchema: { systemId: id, mode: z.enum(['light', 'dark']).default('light') }, annotations: read }, wrap('check_contrast', a => ops.contrast(a.systemId, a.mode)));
  server.registerTool('import_css', { description: 'Parse shadcn CSS (HEX, RGB, HSL, OKLCH); preview first with apply=false. Applying is atomic and respects locks. Requires latest expectedRevision when apply=true.', inputSchema: { systemId: id, css: z.string().min(1).max(200000), apply: z.boolean().default(false), expectedRevision: z.number().int().min(0).optional() }, annotations: write }, wrap('import_css', a => ops.import(a.systemId, a.css, a.apply, a.expectedRevision)));
  server.registerResource('workspace', 'token-studio://workspace', { description: 'Design system names and current revision', mimeType: 'application/json' }, async uri => ({ contents: [{ uri: uri.href, text: JSON.stringify(await ops.list()), mimeType: 'application/json' }] }));
  server.registerResource('theme-library', 'token-studio://themes', { description: 'Bundled theme IDs and sources. Read get_theme for a full snapshot.', mimeType: 'application/json' }, async uri => ({ contents: [{ uri: uri.href, text: JSON.stringify(themeCatalog.map(({id,name,source}) => ({id,name,source}))), mimeType: 'application/json' }] }));
  server.registerResource('task-schema', 'token-studio://tasks/schema', { description: 'Version 1 task content schema; files remain in the project.', mimeType: 'application/json' }, async uri => ({ contents: [{ uri: uri.href, text: JSON.stringify(z.toJSONSchema(taskInputSchema)), mimeType: 'application/json' }] }));
  const guide = getWorkflow();
  for (const [name, uri, text] of [
    ['design-workflow', workflowResources.instructions, guide.instructions],
    ['interview-to-spec', workflowResources.interview, guide.interviewGuide],
    ['component-reuse', workflowResources.reuse, guide.reuseGuide],
    ['design-quality', workflowResources.designQuality, guide.designQualityGuide],
    ['task-evidence', workflowResources.tasks, guide.taskGuide],
    ['delivery-evidence', workflowResources.handoff, guide.handoffTemplate],
  ]) {
    server.registerResource(name, uri, { description: `Token Studio ${name} guide`, mimeType: 'text/markdown' }, async requested => ({ contents: [{ uri: requested.href, text, mimeType: 'text/markdown' }] }));
  }
  server.registerPrompt('design_and_ship', {
    title: 'Design & Ship with shadcn/ui',
    description: 'Turn a user task into verified shadcn/ui code using the seven-stage workflow, including an adaptive interview and specification before dependent implementation.',
    argsSchema: { task: z.string().min(1).max(6000).describe('The human task, including available design references and target project'), mode: z.enum(workflowModes).optional() },
  }, ({ task, mode }) => ({
    description: 'Brief → Interview → Reuse → Spec → Build → Verify → Handoff',
    messages: [{ role: 'user', content: { type: 'text', text: workflowPrompt(task, mode) } }],
  }));
  server.registerPrompt('grill_me', {
    title: 'Grill me · Interview to specification',
    description: 'Ask focused adaptive questions, resolve material intent and write SPEC.md with business rules and testable acceptance criteria. Ends at the specification; no product implementation.',
    argsSchema: { task: z.string().min(1).max(6000).describe('The human idea or task to clarify, with existing context and references') },
  }, ({ task }) => ({
    description: 'Read context → interview → decisions → SPEC.md',
    messages: [{ role: 'user', content: { type: 'text', text: workflowPrompt(task, 'grill-me') } }],
  }));
  return server;
}
