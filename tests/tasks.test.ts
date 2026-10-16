import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { taskInputSchema, validateTask, type TaskInput } from '../shared/tasks';
import { TaskStore } from '../server/tasks';

export function completeInput(mode: TaskInput['mode'] = 'design-and-build', scope: TaskInput['scope'] = 'screen'): TaskInput {
  return taskInputSchema.parse({ title: 'Lịch học 1–1', goal: 'Giáo viên tìm buổi học tiếp theo.', project: 'English learning', mode, scope,
    direction: { source: 'human', summary: 'Ưu tiên lịch học theo ngày, mật độ vừa.', evidence: 'Brief đã xác nhận trong fixture.' },
    acceptanceCriteria: ['Tìm buổi học kế tiếp và mở chi tiết.'],
    artifacts: ['spec', 'design', 'review', 'handoff', 'reference', 'change'].map(kind => ({ id: kind, kind, path: `.token-studio/tasks/example/${kind}.md`, label: kind, ...(kind === 'reference' ? { viewport: { width: 1440, height: 900 } } : {}) })).concat([
      { id: 'desktop', kind: 'render', path: '.token-studio/tasks/example/evidence/desktop.png', label: 'Desktop', viewport: { width: 1440, height: 900 } },
      { id: 'mobile', kind: 'render', path: '.token-studio/tasks/example/evidence/mobile.png', label: 'Mobile', viewport: { width: 390, height: 844 } },
    ]),
    checks: ['before-code', 'primary-flow', 'after-render', 'affected'].map(kind => ({ id: kind, label: kind, kind, status: 'passed', evidence: `Fixture validation record for ${kind}.` })),
  });
}
test('each task profile can complete with proportionate evidence', () => {
  for (const mode of ['design-and-build', 'replicate', 'refine', 'grill-me'] as const) assert.equal(validateTask(completeInput(mode)).valid, true, mode);
  const token = completeInput('refine', 'token-only'); token.artifacts = token.artifacts.filter(a => ['change', 'handoff'].includes(a.kind)); token.checks = token.checks.filter(c => c.kind === 'affected'); token.direction = { source: 'unresolved', summary: '', evidence: '' };
  assert.equal(validateTask(token).valid, true);
  const grill = completeInput('grill-me'); grill.artifacts = grill.artifacts.filter(a => a.kind === 'spec'); grill.checks = []; assert.equal(validateTask(grill).valid, true);
});
test('completion rejects unresolved intent, unsupported pass claims, unverified repairs and blocking limitations', () => {
  const task = completeInput();
  task.decisions.push({ id: 'intent', question: 'Ai có quyền đổi lịch?', answer: '', material: true, status: 'open', source: 'unresolved', evidence: '' });
  task.checks[0].evidence = '';
  task.findings.push({ id: 'f1', location: 'Lịch', observation: 'Không mở được buổi học', impact: 'Luồng chính thất bại', evidence: 'Kiểm tra thao tác thất bại.', severity: 'major', status: 'fixed', repair: 'Đã nối handler', recheck: '' });
  task.limitations.push({ message: 'Không truy cập được browser.', blocking: true });
  const codes = validateTask(task).issues.map(i => i.code); for (const code of ['decision', 'check', 'finding', 'limitation']) assert.ok(codes.includes(code));
});
test('new screens need desktop and mobile, replication needs matching reference viewport', () => {
  const task = completeInput(); task.artifacts = task.artifacts.filter(a => a.id !== 'mobile'); assert.ok(validateTask(task).issues.some(i => i.code === 'mobile'));
  const replica = completeInput('replicate'); replica.artifacts.find(a => a.kind === 'reference')!.viewport!.width = 1300; assert.ok(validateTask(replica).issues.some(i => i.code === 'reference-viewport'));
});
test('task input rejects unsafe links, duplicate IDs, unsupported shape and grill token edits', () => {
  const input = completeInput();
  for (const path of ['../../secret', 'C:\\secret', '/etc/passwd', 'javascript:alert(1)']) { input.artifacts[0].path = path; assert.equal(taskInputSchema.safeParse(input).success, false, path); }
  assert.equal(taskInputSchema.safeParse({ ...completeInput(), checks: [completeInput().checks[0], completeInput().checks[0]] }).success, false);
  assert.equal(taskInputSchema.safeParse({ ...completeInput('grill-me'), scope: 'token-only' }).success, false);
});
test('task persistence, revision conflicts, completion refusal and reopening are atomic', t => {
  const dir = mkdtempSync(join(tmpdir(), 'studio-tasks-')); t.after(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, 'tasks.json'), store = new TaskStore(path);
  const input = taskInputSchema.parse({ title: 'Draft', goal: 'Review schedule', project: 'Example' });
  const draft = store.create(input); const before = readFileSync(path);
  assert.throws(() => store.complete(draft.id, draft.revision), /Chưa thể hoàn tất/); assert.deepEqual(readFileSync(path), before);
  const ready = store.update(draft.id, completeInput(), 0); assert.throws(() => store.update(draft.id, input, 0), /revision hiện tại/);
  const done = store.complete(draft.id, ready.revision); assert.equal(done.status, 'completed');
  const reopened = store.update(draft.id, completeInput(), done.revision); assert.equal(reopened.status, 'in-progress'); assert.equal(reopened.completedAt, null);
  assert.deepEqual(new TaskStore(path).get(draft.id), reopened);
  assert.throws(() => store.create(input, draft.id), /đã tồn tại/);
  writeFileSync(path, '{bad'); const corrupt = readFileSync(path); assert.throws(() => new TaskStore(path)); assert.deepEqual(readFileSync(path), corrupt);
});
