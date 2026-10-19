import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { taskInputSchema, acceptedTaskSchema, validateTask, upgradeTask } from '../shared/tasks';
import { TaskStore } from '../server/tasks';
import { fixtureTask, sealTask } from './fixtures/task';
function directory(t: any) { const dir = mkdtempSync(join(tmpdir(), 'studio-task-v2-')); t.after(() => rmSync(dir, { recursive: true, force: true })); return dir; }
test('v2 task profiles have sourced acceptance results; small scopes need no screen paperwork', t => {
    const root = directory(t);
    for (const mode of ['design-and-build', 'replicate', 'refine', 'grill-me'] as const)
        assert.deepEqual(validateTask(fixtureTask(root, mode)).issues, [], mode);
    for (const scope of ['token-only', 'local-ui'] as const) {
        const task = fixtureTask(root, 'refine', scope);
        task.artifacts = task.artifacts.filter(a => a.kind === 'test' || (scope === 'local-ui' && a.kind === 'render'));
        sealTask(task, root);
        assert.deepEqual(validateTask(task).issues, [], scope);
    }
});
test('rejects the two reproduced shallow dossiers and unmapped business acceptance', t => {
    const root = directory(t), grill = fixtureTask(root, 'grill-me');
    grill.decisions = [];
    assert.ok(validateTask(grill).issues.some(i => i.code === 'criterion-source'));
    const screen = fixtureTask(root);
    screen.acceptanceCriteria.push({ id: 'AC-02', text: 'Reject teacher overlaps', decisionIds: ['D-01'] });
    assert.ok(validateTask(screen).issues.some(i => i.code === 'criterion-result'));
    screen.checks.find(c => c.kind === 'acceptance')!.kind = 'primary-flow';
    assert.ok(validateTask(screen).issues.some(i => i.location === 'acceptanceCriteria.AC-01'));
});
test('rejects broken links, unresolved intent, stale pass claims and unrechecked repairs', t => {
    const task = fixtureTask(directory(t));
    task.decisions[0].status = 'conflicting';
    task.checks[0].artifactIds = ['missing'];
    task.checks[0].criterionIds = ['missing'];
    task.checks[0].fingerprint = '0'.repeat(64);
    task.findings.push({ id: 'f', location: 'Lesson', observation: 'No details', evidence: 'Failed click', impact: 'Main task fails', severity: 'major', status: 'fixed', repair: 'Wired action', recheck: '' });
    task.limitations.push({ message: 'No browser', blocking: true });
    const codes = validateTask(task).issues.map(i => i.code);
    for (const code of ['criterion-source', 'decision', 'reference', 'freshness', 'finding', 'limitation'])
        assert.ok(codes.includes(code), code);
});
test('viewport rules remain for screens; local-ui still needs affected render and scope', t => {
    const root = directory(t), task = fixtureTask(root);
    task.artifacts = task.artifacts.filter(a => a.id !== 'mobile');
    assert.ok(validateTask(task).issues.some(i => i.code === 'mobile'));
    const replica = fixtureTask(root, 'replicate');
    replica.artifacts.find(a => a.kind === 'reference')!.viewport!.width = 1300;
    assert.ok(validateTask(replica).issues.some(i => i.code === 'reference-viewport'));
    const local = fixtureTask(root, 'refine', 'local-ui');
    local.artifacts = local.artifacts.filter(a => a.kind !== 'render');
    local.notes.scope = '';
    assert.ok(validateTask(local).issues.some(i => i.code === 'render'));
    assert.ok(validateTask(local).issues.some(i => i.code === 'scope-notes'));
});
test('v2 rejects unsafe input paths, duplicate criteria and invalid scope combinations', t => {
    const task = fixtureTask(directory(t));
    for (const path of ['../../secret', 'C:\\secret', '/etc/passwd', 'javascript:alert(1)'])
        assert.equal(taskInputSchema.safeParse({ ...task, inputs: { plan: [path], implementation: [] } }).success, false, path);
    assert.equal(taskInputSchema.safeParse({ ...task, acceptanceCriteria: [task.acceptanceCriteria[0], task.acceptanceCriteria[0]] }).success, false);
    assert.equal(taskInputSchema.safeParse({ ...task, scope: 'local-ui' }).success, false);
    assert.equal(taskInputSchema.safeParse({ ...task, mode: 'grill-me', scope: 'token-only' }).success, false);
});
test('local report binds the full current dossier and structure-only cannot complete', t => {
    const task = fixtureTask(directory(t));
    task.verification!.kind = 'structure-only';
    assert.ok(validateTask(task).issues.some(i => i.code === 'local-verification'));
    task.verification!.kind = 'local';
    task.checks[0].evidence += ' changed';
    assert.ok(validateTask(task).issues.some(i => i.code === 'local-verification'));
});
test('store refuses incomplete/stale writes atomically and reopens completed v2 records', t => {
    const root = directory(t), path = join(root, 'tasks.json'), store = new TaskStore(path), draft = store.create(taskInputSchema.parse({ title: 'Draft', goal: 'Review', project: 'Fixture' })), before = readFileSync(path);
    assert.throws(() => store.complete(draft.id, 0), /Chưa thể hoàn tất/);
    assert.deepEqual(readFileSync(path), before);
    const task = fixtureTask(root), ready = store.update(draft.id, task, 0);
    assert.throws(() => store.update(draft.id, task, 0), /revision hiện tại/);
    const done = store.complete(draft.id, ready.revision);
    assert.equal(done.completionPolicyVersion, 2);
    assert.equal(done.status, 'completed');
    assert.deepEqual(store.complete(done.id, done.revision), store.get(done.id));
    const reopened = store.update(done.id, task, done.revision);
    assert.equal(reopened.status, 'in-progress');
    assert.equal(reopened.completedAt, null);
    assert.deepEqual(new TaskStore(path).get(done.id), reopened);
    assert.throws(() => store.create(task, done.id), /đã tồn tại/);
    writeFileSync(path, '{bad');
    assert.throws(() => new TaskStore(path));
    assert.equal(readFileSync(path, 'utf8'), '{bad');
});
test('v1 completed history survives store upgrade; edit reopens and v2 upgrade invents no pass', t => {
    const root = directory(t), path = join(root, 'tasks.json'), id = randomUUID(), now = new Date().toISOString();
    const legacy = acceptedTaskSchema.parse({ schemaVersion: 1, title: 'Old', goal: 'Specify', project: 'Fixture', mode: 'grill-me', acceptanceCriteria: ['Rules documented'], checks: [{ id: 'old', kind: 'acceptance', label: 'Old claim', status: 'passed', evidence: 'Old evidence' }] });
    writeFileSync(path, JSON.stringify({ schemaVersion: 1, tasks: [{ id, revision: 4, status: 'completed', createdAt: now, syncedAt: now, completedAt: now, task: legacy }] }));
    const original = readFileSync(path), store = new TaskStore(path);
    assert.equal(store.get(id).status, 'completed');
    assert.equal(store.complete(id, 4).revision, 4);
    assert.deepEqual(readFileSync(path), original);
    assert.equal(store.validate(id).completionPolicyVersion, 1);
    const reopened = store.update(id, legacy, 4);
    assert.equal(reopened.status, 'in-progress');
    assert.throws(() => store.complete(id, reopened.revision), /nâng hồ sơ/);
    assert.equal(readdirSync(root).filter(n => n.includes('.v1-')).length, 1);
    const upgraded = upgradeTask(legacy);
    assert.equal(upgraded.acceptanceCriteria[0].id, 'AC-01');
    assert.deepEqual(upgraded.acceptanceCriteria[0].decisionIds, []);
    assert.equal(upgraded.checks[0].status, 'pending');
    assert.equal(upgraded.checks[0].evidence, 'Old evidence');
    assert.equal(validateTask(upgraded).valid, false);
});
