import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { createSnapshot, snapshotOf, snapshotSchema, systemSchema, patchSchema, type DesignSystem, type Snapshot, type StudioState, type SystemPatch } from '../shared/model.js';

export class StoreError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export const diskSchema = z.object({ revision: z.number().int().min(0), systems: z.array(systemSchema).min(1).max(100), calls: z.array(z.object({ id: z.string(), tool: z.string(), at: z.string(), ok: z.boolean(), detail: z.string() })).max(100) });
export class StudioStore {
  private state: StudioState;
  readonly path: string;
  constructor(path: string) {
    this.path = resolve(path);
    if (existsSync(this.path)) {
      // Corrupt files fail loudly rather than silently replacing a user's systems.
      this.state = diskSchema.parse(JSON.parse(readFileSync(this.path, 'utf8')));
      for (const s of this.state.systems) if (s.cursor > s.history.length) throw new Error('Lịch sử không hợp lệ');
    } else {
      this.state = { revision: 0, systems: ['Studio mặc định', 'Ocean', 'Violet'].map((name, i) => this.newSystem(createSnapshot(name, i))), calls: [] };
      this.persist(this.state);
    }
  }
  private newSystem(snapshot: Snapshot): DesignSystem {
    const now = new Date().toISOString();
    return { ...snapshot, id: randomUUID(), createdAt: now, updatedAt: now, history: [], cursor: 0 };
  }
  private persist(next: StudioState) {
    mkdirSync(dirname(this.path), { recursive: true });
    const temp = `${this.path}.${process.pid}.tmp`;
    writeFileSync(temp, JSON.stringify(next, null, 2), { mode: 0o600 });
    renameSync(temp, this.path);
    this.state = next;
  }
  private commit(next: StudioState) { next.revision = this.state.revision + 1; this.persist(next); return this.read(); }
  read(): StudioState { return structuredClone(this.state); }
  get(id: string) {
    const system = this.state.systems.find(s => s.id === id);
    if (!system) throw new StoreError('Không tìm thấy design system.', 404);
    return structuredClone(system);
  }
  assertRevision(revision?: number) {
    if (revision !== undefined && revision !== this.state.revision) throw new StoreError('Dữ liệu vừa được thay đổi. Đã tải bản mới nhất; hãy thử lại.', 409);
  }
  create(name: string, preset = 0, imported?: Snapshot) {
    if (this.state.systems.length >= 100) throw new StoreError('Tối đa 100 hệ thống trong workspace này.');
    const system = this.newSystem(snapshotSchema.parse(imported ?? createSnapshot(name, preset)));
    const next = this.read(); next.systems.push(system); this.commit(next); return system;
  }
  private replace(id: string, after: Snapshot, summary: string, source: 'editor' | 'agent') {
    const system = this.get(id);
    if (JSON.stringify(snapshotOf(system)) === JSON.stringify(after)) return this.read();
    const entry = { id: randomUUID(), at: new Date().toISOString(), source, summary, before: snapshotOf(system), after };
    const history = [...system.history.slice(0, system.cursor), entry].slice(-60);
    const next = this.read();
    next.systems = next.systems.map(s => s.id === id ? { ...s, ...after, history, cursor: history.length, updatedAt: entry.at } : s);
    return this.commit(next);
  }
  update(id: string, input: SystemPatch, source: 'editor' | 'agent', summary?: string) {
    const patch = patchSchema.parse(input);
    const system = this.get(id);
    const after = snapshotOf(system);
    const changed: string[] = [];
    for (const group of ['light', 'dark', 'settings'] as const) {
      const values = patch[group];
      if (!values) continue;
      for (const [key, value] of Object.entries(values)) {
        const path = `${group}.${key}`;
        if ((after[group] as Record<string, unknown>)[key] === value) continue;
        if (system.locks.includes(path)) throw new StoreError(`Token ${path} đã khóa. Chỉ người dùng có thể mở khóa trong editor.`, 423);
        (after[group] as Record<string, unknown>)[key] = value;
        changed.push(path);
      }
    }
    if (patch.name !== undefined) { after.name = patch.name; changed.push('name'); }
    return this.replace(id, snapshotSchema.parse(after), summary ?? `Cập nhật ${changed.length} thuộc tính`, source);
  }
  setLock(id: string, path: string) {
    const system = this.get(id), snapshot = snapshotOf(system);
    const [group, key] = path.split('.');
    if (!['light', 'dark', 'settings'].includes(group) || !Object.hasOwn(snapshot[group as 'light'], key ?? '')) throw new StoreError('Đường dẫn token không hợp lệ.');
    const locked = snapshot.locks.includes(path);
    snapshot.locks = locked ? snapshot.locks.filter(p => p !== path) : [...snapshot.locks, path];
    return this.replace(id, snapshotSchema.parse(snapshot), `${locked ? 'Mở khóa' : 'Khóa'} ${path}`, 'editor');
  }
  travel(id: string, direction: 'undo' | 'redo') {
    const system = this.get(id), cursor = system.cursor + (direction === 'undo' ? -1 : 1);
    if (cursor < 0 || cursor > system.history.length) throw new StoreError('Không có thay đổi để hoàn tác/làm lại.');
    const snapshot = direction === 'undo' ? system.history[cursor].before : system.history[cursor - 1].after;
    const next = this.read();
    next.systems = next.systems.map(s => s.id === id ? { ...s, ...snapshot, cursor, updatedAt: new Date().toISOString() } : s);
    return this.commit(next);
  }
  log(tool: string, ok: boolean, detail: string) {
    const next = this.read();
    next.calls.unshift({ id: randomUUID(), tool, at: new Date().toISOString(), ok, detail: detail.slice(0, 300) });
    // Audit reads must not invalidate the revision returned by get_system.
    next.calls = next.calls.slice(0, 100); this.persist(next);
  }
}
