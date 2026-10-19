import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, basename } from 'node:path';
import { existsSync, mkdirSync, realpathSync } from 'node:fs';
import lockfile from 'proper-lockfile';
import { appVersion as version } from './version.js';
import { spawn } from 'node:child_process';
import { z } from 'zod';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { hostHeaderValidation } from '@modelcontextprotocol/sdk/server/middleware/hostHeaderValidation.js';
import { StudioStore, StoreError } from './store.js';
import { TaskStore } from './tasks.js';
import { acceptedTaskSchema } from '../shared/tasks.js';
import { createMcpServer, type AgentOperations } from './mcp.js';
import { contrastReport, exportCss, snapshotSchema, patchSchema } from '../shared/model.js';
import { parseThemeCss } from './css.js';
import { getWorkflow } from './workflow.js';
import { workflowModes, workflowVersion } from '../shared/workflow.js';
import { getCatalogTheme, prepareThemeApplication, themeCatalog, ThemeCatalogError } from '../shared/themes.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT ?? 4318);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT không hợp lệ');
const requestedDataFile = resolve(process.env.STUDIO_DATA_FILE ?? resolve(projectRoot, 'data/studio.json'));
mkdirSync(dirname(requestedDataFile), { recursive: true });
const dataFile = existsSync(requestedDataFile) ? realpathSync(requestedDataFile) : resolve(realpathSync(dirname(requestedDataFile)), basename(requestedDataFile));
const tasksFile = resolve(dirname(dataFile), 'tasks.json');
if (tasksFile === dataFile) throw new Error('STUDIO_DATA_FILE không được trùng tasks.json dành cho hồ sơ tác vụ.');
const lockOptions = { realpath: false, retries: { retries: 24, minTimeout: 500, maxTimeout: 500, factor: 1 } };
const releaseDataLock = await lockfile.lock(dataFile, lockOptions);
let releaseTasksLock;
try { releaseTasksLock = await lockfile.lock(tasksFile, lockOptions); } catch (error) { await releaseDataLock(); throw error; }
const releaseLock = async () => { await Promise.all([releaseDataLock(), releaseTasksLock()]); };
process.once('exit', () => { for (const path of [dataFile, tasksFile]) try { lockfile.unlockSync(path, { realpath: false }); } catch { /* Already released. */ } });
const store = new StudioStore(dataFile);
const tasks = new TaskStore(tasksFile);
const app = express();
app.disable('x-powered-by');
app.use(hostHeaderValidation(['127.0.0.1', 'localhost', '[::1]']));
const allowedOrigins = new Set([`http://127.0.0.1:${port}`, `http://localhost:${port}`, 'http://127.0.0.1:5173', 'http://localhost:5173']);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if ((origin && !allowedOrigins.has(origin)) || req.headers['sec-fetch-site'] === 'cross-site') {
    res.status(403).json({ error: 'Origin không được phép.' }); return;
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(express.json({ limit: '512kb' }));
const ops: AgentOperations = {
  list: () => ({ revision: store.read().revision, systems: store.read().systems.map(({ id, name, updatedAt }) => ({ id, name, updatedAt })) }),
  get: id => ({ revision: store.read().revision, system: store.get(id) }),
  create: (name, preset, themeId) => store.create(name, preset, themeId ? { ...getCatalogTheme(themeId).snapshot, name } : undefined),
  applyTheme: (id, themeId, apply, expectedRevision) => {
    const theme = getCatalogTheme(themeId);
    const prepared = prepareThemeApplication(store.get(id), theme.snapshot);
    if (apply) {
      if (expectedRevision === undefined) throw new StoreError('Cần expectedRevision khi áp dụng theme.');
      store.assertRevision(expectedRevision);
      store.update(id, prepared.patch, 'agent', `Áp dụng theme ${theme.name}`);
    }
    return { applied: apply, revision: store.read().revision, keptLockedPaths: prepared.kept, changed: prepared.changed, patch: prepared.patch, preview: prepared.preview, ...(apply ? { system: store.get(id) } : {}) };
  },
  update: (id, patch, revision) => { store.assertRevision(revision); store.update(id, patch, 'agent'); return { revision: store.read().revision, system: store.get(id) }; },
  export: id => ({ css: exportCss(store.get(id)) }),
  contrast: (id, mode) => ({ mode, pairs: contrastReport(store.get(id), mode) }),
  import: (id, css, apply, revision) => {
    const parsed = parseThemeCss(css); patchSchema.parse(parsed.patch);
    if (apply) {
      if (revision === undefined) throw new StoreError('Cần expectedRevision khi áp dụng.');
      store.assertRevision(revision); store.update(id, parsed.patch, 'agent', `Nhập ${parsed.count} giá trị từ CSS`);
    }
    return { ...parsed, applied: apply, revision: store.read().revision };
  },
};
app.get('/api/state', (_req, res) => res.json(store.read()));
app.get('/api/status', (_req, res) => res.json({ status: 'online', application: 'token-design-studio', protocolVersion: 1, version, endpoint: `http://127.0.0.1:${port}/mcp`, dataFile: store.path, tasksFile, root: projectRoot, tools: 17, prompts: 2, themes: themeCatalog.length, workflowVersion, stdio: { command: process.execPath, args: existsSync(resolve(projectRoot, 'runtime/stdio.js')) ? [resolve(projectRoot, 'runtime/stdio.js')] : [resolve(projectRoot, 'node_modules/tsx/dist/cli.mjs'), resolve(projectRoot, 'server/stdio.ts')] } }));
app.get('/api/tasks', (_req, res) => res.json(tasks.list()));
app.post('/api/tasks', (req, res) => {
  const input = z.object({ task: acceptedTaskSchema, taskId: z.string().uuid().optional() }).strict().parse(req.body);
  res.status(201).json(tasks.create(input.task, input.taskId));
});
app.get('/api/tasks/:id', (req, res) => res.json(tasks.get(req.params.id)));
app.patch('/api/tasks/:id', (req, res) => {
  const input = z.object({ task: acceptedTaskSchema, expectedRevision: z.number().int().min(0) }).strict().parse(req.body);
  res.json(tasks.update(req.params.id, input.task, input.expectedRevision));
});
app.post('/api/tasks/:id/validate', (req, res) => res.json(tasks.validate(req.params.id)));
app.post('/api/tasks/:id/complete', (req, res) => {
  const input = z.object({ expectedRevision: z.number().int().min(0) }).strict().parse(req.body);
  res.json(tasks.complete(req.params.id, input.expectedRevision));
});
app.get('/api/workflow', (req, res) => {
  const mode = z.enum(workflowModes).default('design-and-build').parse(req.query.mode);
  res.json(getWorkflow(mode));
});
app.post('/api/systems', (req, res) => {
  const input = z.object({ name: z.string().trim().min(1).max(60), preset: z.number().int().min(0).max(5).default(0), snapshot: snapshotSchema.optional(), themeId: z.string().min(1).max(100).optional() }).strict().refine(value => !(value.snapshot && value.themeId), 'Chọn snapshot hoặc themeId, không dùng cả hai.').parse(req.body);
  const system = store.create(input.name, input.preset, input.themeId ? { ...getCatalogTheme(input.themeId).snapshot, name: input.name } : input.snapshot);
  res.status(201).json({ state: store.read(), id: system.id });
});
const revisionInput = z.object({ expectedRevision: z.number().int().min(0) });
app.patch('/api/systems/:id', (req, res) => {
  const { patch, expectedRevision } = revisionInput.extend({ patch: patchSchema }).strict().parse(req.body);
  store.assertRevision(expectedRevision);
  res.json(store.update(req.params.id, patch, 'editor'));
});
app.post('/api/systems/:id/lock', (req, res) => {
  const { path, expectedRevision } = revisionInput.extend({ path: z.string().max(80) }).strict().parse(req.body);
  store.assertRevision(expectedRevision); res.json(store.setLock(req.params.id, path));
});
app.post('/api/systems/:id/history', (req, res) => {
  const { direction, expectedRevision } = revisionInput.extend({ direction: z.enum(['undo', 'redo']) }).strict().parse(req.body);
  store.assertRevision(expectedRevision); res.json(store.travel(req.params.id, direction));
});
app.post('/api/import/preview', (req, res) => {
  const { css } = z.object({ css: z.string().min(1).max(200000) }).strict().parse(req.body);
  const parsed = parseThemeCss(css); patchSchema.parse(parsed.patch); res.json(parsed);
});
app.get('/api/systems/:id/export', (req, res) => {
  const system = store.get(req.params.id);
  if (req.query.format === 'json') res.json({ version: 1, system: snapshotSchema.parse({ name: system.name, light: system.light, dark: system.dark, settings: system.settings, locks: system.locks }) });
  else res.type('text/css').send(exportCss(system));
});
// Streamable HTTP, stateless per request. All sessions share the single atomic store.
app.post('/mcp', async (req, res, next) => {
  const server = createMcpServer(ops, tasks, (tool, ok, detail) => store.log(tool, ok, detail));
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => { void transport.close(); void server.close(); });
  try { await server.connect(transport); await transport.handleRequest(req, res, req.body); }
  catch (error) { if (!res.headersSent) next(error); }
});
app.all('/mcp', (_req, res) => { res.setHeader('Allow', 'POST'); res.status(405).json({ error: 'Stateless MCP: POST only.' }); });
const dist = resolve(projectRoot, 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('/{*path}', (_req, res) => res.sendFile(resolve(dist, 'index.html')));
}
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = error instanceof StoreError ? error.status : error instanceof ThemeCatalogError || error instanceof z.ZodError || (error instanceof Error && error.name === 'CssSyntaxError') ? 400 : 500;
  const message = error instanceof z.ZodError ? error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') : error instanceof Error ? error.message : 'Lỗi không xác định';
  if (status === 500) console.error(error);
  res.status(status).json({ error: message, ...(error instanceof StoreError && error.details ? { details: error.details } : {}) });
});
const httpServer = createServer(app);
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => {
  httpServer.close(() => { void releaseLock().finally(() => process.exit(0)); });
  setTimeout(() => httpServer.closeAllConnections(), 2000).unref();
});
await new Promise<void>((ready, reject) => {
httpServer.once('error', reject);
httpServer.listen(port, '127.0.0.1', () => {
  console.log(`Token Studio: http://127.0.0.1:${port} | MCP: http://127.0.0.1:${port}/mcp`);
  if (process.env.STUDIO_OPEN_BROWSER === '1' && process.platform === 'win32') {
    const opener = spawn('explorer.exe', [`http://127.0.0.1:${port}`], { detached: true, stdio: 'ignore', windowsHide: true });
    opener.on('error', () => console.warn('Mở trình duyệt thủ công tại URL phía trên.'));
    opener.unref();
  }
  ready();
});
}).catch(async error => { await releaseLock(); throw error; });
