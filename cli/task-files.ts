import { readFileSync, realpathSync, statSync, existsSync } from 'node:fs';
import { resolve, relative, isAbsolute, dirname, join } from 'node:path';
import { localPath, planPaths, snapshotDigest, taskDigest, validateTask, type TaskInput, type TaskIssue } from '../shared/tasks';
import { canonical, sha256 } from '../shared/fingerprint';
export function projectFile(root: string, path: string) {
    localPath.parse(path);
    const base = realpathSync(root), absolute = realpathSync(resolve(base, path));
    const rel = relative(base, absolute);
    if (!rel || rel === '..' || rel.startsWith('..' + (process.platform === 'win32' ? '\\' : '/')) || isAbsolute(rel))
        throw new Error(`File nằm ngoài project root: ${path}`);
    const stat = statSync(absolute);
    if (!stat.isFile() || stat.size > 32 * 1024 * 1024)
        throw new Error(`Cần file thường tối đa 32 MB: ${path}`);
    return absolute;
}
function hashFiles(root: string, paths: string[]) {
    let total = 0;
    return [...new Set(paths)].sort().map(path => { const file = projectFile(root, path), bytes = readFileSync(file); total += bytes.length; if (total > 64 * 1024 * 1024)
        throw new Error('Tổng đầu vào vượt 64 MB. Thu hẹp phạm vi tác vụ.'); return { path, sha256: sha256(bytes) }; });
}
function implementationPaths(root: string, paths: string[]) {
    const result = new Set(paths), base = realpathSync(root);
    for (const path of paths) {
        let dir = dirname(resolve(base, path));
        while (dir === base || (!relative(base, dir).startsWith('..') && !isAbsolute(relative(base, dir)))) {
            for (const name of ['package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb'])
                if (existsSync(join(dir, name)))
                    result.add(relative(base, join(dir, name)).replaceAll('\\', '/'));
            if (dir === base)
                break;
            dir = dirname(dir);
        }
    }
    return [...result];
}
export function captureSnapshot(task: TaskInput, root: string, phase: 'plan' | 'implementation') {
    const paths = phase === 'plan' ? planPaths(task) : implementationPaths(root, task.inputs.implementation);
    const files = hashFiles(root, paths);
    return { phase, digest: snapshotDigest(task, phase, files), files };
}
export function artifactHashes(task: TaskInput, root: string) { return hashFiles(root, task.artifacts.filter(a => !/^https?:/i.test(a.path) && existsSync(resolve(root, a.path))).map(a => a.path)); }
export function verifyFiles(task: TaskInput, root: string, structureOnly = false) {
    const issues: TaskIssue[] = [...validateTask(task, { requireLocal: false }).issues], files = new Map<string, string>();
    const add = (code: string, message: string, location: string) => issues.push({ code, message, location });
    if (!structureOnly) {
        for (const phase of ['plan', 'implementation'] as const) {
            if (task.mode === 'grill-me' && phase === 'implementation')
                continue;
            try {
                const current = captureSnapshot(task, root, phase);
                current.files.forEach(f => files.set(f.path, f.sha256));
                if (!task.snapshots[phase] || canonical(current) !== canonical(task.snapshots[phase]))
                    add('freshness', `Đầu vào ${phase} đã thay đổi hoặc snapshot chưa được ghi.`, `snapshots.${phase}`);
            }
            catch (e) {
                add('input-file', (e as Error).message, `inputs.${phase}`);
            }
        }
        for (const a of task.artifacts) {
            if (/^https?:/i.test(a.path)) {
                if (a.kind !== 'reference')
                    add('remote-evidence', 'Bằng chứng bắt buộc phải là file local; chỉ reference được dùng URL.', `artifacts.${a.id}`);
                continue;
            }
            try {
                const f = hashFiles(root, [a.path])[0];
                files.set(f.path, f.sha256);
                if (a.sha256 && a.sha256 !== f.sha256)
                    add('artifact-changed', `File bằng chứng đã đổi: ${a.path}`, `artifacts.${a.id}`);
            }
            catch (e) {
                add('artifact-file', (e as Error).message, `artifacts.${a.id}`);
            }
        }
        // Check evidence as well as implementation files for edits during the read.
        try {
            if (hashFiles(root, [...files.keys()]).some(f => files.get(f.path) !== f.sha256))
                add('concurrent-edit', 'File thay đổi trong khi verify; chạy lại.', 'verification');
        }
        catch (e) {
            add('input-file', (e as Error).message, 'verification');
        }
    }
    return { kind: structureOnly ? 'structure-only' as const : 'local' as const, taskDigest: taskDigest(task), checkedAt: new Date().toISOString(), valid: issues.length === 0, issues, files: [...files].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([path, sha256]) => ({ path, sha256 })) };
}
