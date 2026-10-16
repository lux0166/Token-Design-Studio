import { useCallback, useEffect, useRef, useState } from 'react';
import type { StudioState, SystemPatch } from '../../shared/model';

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(data.error ?? 'Không thể kết nối server.');
  }
  return response.json();
}
export function useStudio() {
  const [state, setState] = useState<StudioState | null>(null);
  const stateRef = useRef<StudioState | null>(null);
  const [selectedId, setSelectedId] = useState(() => { try { return localStorage.getItem('token-studio.active') ?? ''; } catch { return ''; } });
  const [pending, setPending] = useState(0);
  const busy = useRef(0);
  const [online, setOnline] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const queue = useRef(Promise.resolve());
  const accept = useCallback((next: StudioState) => {
    if (stateRef.current && next.revision < stateRef.current.revision) return;
    stateRef.current = next; setState(next); setOnline(true);
  }, []);
  const refresh = useCallback(async () => {
    try {
      const next = await request<StudioState>('/api/state');
      if (!busy.current) accept(next);
      setOnline(true); setError('');
    } catch (error) { setOnline(false); setError(error instanceof Error ? error.message : 'Server chưa chạy.'); }
  }, [accept]);
  useEffect(() => { void refresh(); const timer = setInterval(() => { if (!busy.current) void refresh(); }, 1500); return () => clearInterval(timer); }, [refresh]);
  useEffect(() => { if (state && !state.systems.some(s => s.id === selectedId)) setSelectedId(state.systems[0].id); }, [state, selectedId]);
  useEffect(() => { try { localStorage.setItem('token-studio.active', selectedId); } catch { /* Disk store remains authoritative. */ } }, [selectedId]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 4200); return () => clearTimeout(timer); }, [toast]);
  const mutate = useCallback((path: string, body: Record<string, unknown>, method = 'POST'): Promise<boolean> => {
    busy.current++; setPending(busy.current);
    let success = false;
    const work = queue.current.then(async () => {
      try {
        const result = await request<StudioState | { state: StudioState; id: string }>(path, {
          method, body: JSON.stringify({ ...body, ...(path === '/api/systems' ? {} : { expectedRevision: stateRef.current?.revision }) }),
        });
        if ('state' in result) { accept(result.state); setSelectedId(result.id); } else accept(result);
        success = true;
      } catch (error) {
        setToast(error instanceof Error ? error.message : 'Không lưu được thay đổi.');
        try { accept(await request<StudioState>('/api/state')); } catch { setOnline(false); }
      } finally { busy.current--; setPending(busy.current); }
    });
    queue.current = work.catch(() => {});
    return work.then(() => success);
  }, [accept]);
  const patch = useCallback((patch: SystemPatch) => mutate(`/api/systems/${selectedId}`, { patch }, 'PATCH'), [mutate, selectedId]);
  const lock = useCallback((path: string) => mutate(`/api/systems/${selectedId}/lock`, { path }), [mutate, selectedId]);
  const travel = useCallback((direction: 'undo' | 'redo') => mutate(`/api/systems/${selectedId}/history`, { direction }), [mutate, selectedId]);
  return { state, system: state?.systems.find(s => s.id === selectedId) ?? state?.systems[0], selectedId, select: setSelectedId, online, error, pending, toast, notify: setToast, patch, lock, travel, mutate, refresh };
}
