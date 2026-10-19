import { ArrowUpRight, Check, ChevronDown, Clock3, Database, Home, Layers, Link2, Palette, Plus, X, ListChecks } from 'lucide-react';
import type { DesignSystem } from '../../shared/model';
import { IconButton } from './ui';
export type Page = 'editor' | 'overview' | 'mcp' | 'history' | 'themes' | 'tasks';
export function Sidebar({ page, onPage, systems, selectedId, onSelect, onCreate, online, mobileOpen, onClose }: {
  page: Page; onPage: (page: Page) => void; systems: DesignSystem[]; selectedId: string; onSelect: (id: string) => void;
  onCreate: () => void; online: boolean; mobileOpen: boolean; onClose: () => void;
}) {
  const nav = [{ id: 'overview', label: 'Tổng quan', icon: Home }, { id: 'editor', label: 'Design system', icon: Layers }, { id: 'themes', label: 'Thư viện theme', icon: Palette }, { id: 'tasks', label: 'Tác vụ thiết kế', icon: ListChecks }, { id: 'mcp', label: 'Kết nối MCP', icon: Link2 }, { id: 'history', label: 'Lịch sử', icon: Clock3 }] as const;
  return <>
    {mobileOpen && <button className="sidebar-scrim" aria-label="Đóng menu" onClick={onClose} />}
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <a className="brand" href="#" onClick={e => { e.preventDefault(); onPage('editor'); onClose(); }}><span className="brand-mark"><span /><span /><span /></span>Token Studio</a>
      <div className="mobile-close"><IconButton label="Đóng menu" onClick={onClose}><X /></IconButton></div>
      <div className="workspace-label"><span className="avatar-small">T</span><span>Không gian cá nhân</span><Check size={14} /></div>
      <nav aria-label="Điều hướng chính">{nav.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => { onPage(id); onClose(); }}><Icon /><span>{label}</span>{page === id && <span className="nav-dot" />}</button>)}</nav>
      <div className="systems-heading"><span>DESIGN SYSTEMS</span><IconButton label="Tạo design system" onClick={() => { onCreate(); onClose(); }}><Plus /></IconButton></div>
      <div className="system-list">{systems.map(s => <button key={s.id} className={`system-item ${s.id === selectedId ? 'active' : ''}`} onClick={() => { onSelect(s.id); onPage('editor'); onClose(); }}><span className="system-dot" style={{ background: s.light.primary }} /><span>{s.name}</span>{s.id === selectedId && <Check size={13} />}</button>)}</div>
      <div className="sidebar-bottom"><div className="local-note"><Database /><div><span>Lưu trên máy của bạn</span><small>Dữ liệu thuộc về bạn.</small></div><span className={`status-dot ${online ? '' : 'offline'}`} /></div><button className="quiet-link" onClick={() => { onPage('mcp'); onClose(); }}>Kết nối với agent của bạn <ArrowUpRight size={14} /></button></div>
    </aside>
  </>;
}
