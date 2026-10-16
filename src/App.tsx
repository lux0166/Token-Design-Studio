import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, ChevronRight, Code2, Database, Home, Menu, Monitor, Moon, Palette, Pencil, Redo2, RefreshCw, Smartphone, Sun, Undo2, Upload, X } from 'lucide-react';
import { useStudio } from './lib/useStudio';
import { Sidebar, type Page } from './components/Sidebar';
import { Inspector } from './components/Inspector';
import { Preview, type PreviewTab } from './components/Preview';
import { OverviewPage, McpPage, HistoryPage } from './components/WorkspacePages';
import { ExportDialog, ImportDialog, RenameDialog } from './components/Dialogs';
import { IconButton } from './components/ui';
import { ThemeLibrary, ThemeLibraryDialog } from './components/ThemeLibrary';
import type { Mode } from '../shared/model';
import { version as appVersion } from '../package.json';

export default function App() {
  const studio = useStudio();
  const [page, setPage] = useState<Page>('editor');
  const [mode, setMode] = useState<Mode>('light');
  const [tab, setTab] = useState<PreviewTab>('overview');
  const [mobile, setMobile] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [dialog, setDialog] = useState<'create' | 'export' | 'import' | 'rename' | null>(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const { system } = studio;
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || dialog || page === 'mcp' || page === 'overview') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault(); const redo = e.shiftKey;
        if (!studio.pending && system && (redo ? system.cursor < system.history.length : system.cursor > 0)) void studio.travel(redo ? 'redo' : 'undo');
      }
    };
    window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener);
  }, [dialog, page, studio.pending, studio.travel, system]);
  if (!system || !studio.state) return <div className="boot-screen"><div className="brand"><span className="brand-mark"><span /><span /><span /></span>Token Studio</div>{studio.error ? <><AlertCircle /><h1>Chưa kết nối được server</h1><p>Khởi động ứng dụng bằng <code>npm run dev</code>, rồi thử lại.</p><p>{studio.error}</p><button className="button dark" onClick={() => void studio.refresh()}><RefreshCw />Thử lại</button></> : <><span className="loading-spinner" /><p>Đang mở không gian của bạn…</p></>}</div>;
  const inspectAll = () => { setShowAll(true); document.querySelector('.inspector')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  return <div className="app-shell">
    <Sidebar page={page} onPage={setPage} systems={studio.state.systems} selectedId={system.id} onSelect={studio.select} onCreate={() => setDialog('create')} online={studio.online} mobileOpen={mobileNav} onClose={() => setMobileNav(false)} />
    <div className="app-body"><header className="topbar"><div className="breadcrumb"><span className="mobile-menu"><IconButton label="Mở menu" onClick={() => setMobileNav(true)}><Menu /></IconButton></span><Home /><span>Không gian cá nhân</span><ChevronRight /><strong>{page === 'editor' || page === 'history' ? system.name : page === 'mcp' ? 'Kết nối MCP' : page === 'themes' ? 'Thư viện theme' : 'Tổng quan'}</strong></div><div className="toolbar-actions">{page === 'editor' && <><IconButton label="Hoàn tác (Ctrl+Z)" disabled={studio.pending > 0 || system.cursor === 0} onClick={() => void studio.travel('undo')}><Undo2 /></IconButton><IconButton label="Làm lại (Ctrl+Shift+Z)" disabled={studio.pending > 0 || system.cursor === system.history.length} onClick={() => void studio.travel('redo')}><Redo2 /></IconButton><span className="toolbar-separator" /></>}<button aria-label="Mở thư viện theme" title="Thư viện theme" className="button theme-library-open" onClick={() => setPage('themes')}><Palette /><span>Thư viện theme</span></button><button className="button import-button" onClick={() => setDialog('import')}><Upload /><span>Nhập theme</span></button><button className="button dark export-button" onClick={() => setDialog('export')}><Code2 /><span>Xuất CSS</span></button></div></header>
      {!studio.online && <div className="offline-banner" role="alert"><AlertCircle />Mất kết nối với server. Kiểm tra terminal; các thay đổi mới chưa được lưu.<button onClick={() => void studio.refresh()}>Thử lại</button></div>}
      {page === 'editor' ? <main className="editor-layout"><div className="editor-center"><div className="editor-heading"><div className="editor-title"><div><h1>{system.name}</h1><IconButton label="Đổi tên design system" onClick={() => setDialog('rename')}><Pencil /></IconButton></div><p>Một hệ thống nhất quán. Mọi thành phần đồng bộ.</p></div><div className="preview-toolbar"><div className="segmented icon-segment" aria-label="Chế độ màu"><button aria-label="Chế độ sáng" title="Chế độ sáng" className={mode === 'light' ? 'active' : ''} onClick={() => setMode('light')}><Sun /></button><button aria-label="Chế độ tối" title="Chế độ tối" className={mode === 'dark' ? 'active' : ''} onClick={() => setMode('dark')}><Moon /></button></div><div className="segmented icon-segment" aria-label="Kích thước bản xem trước"><button aria-label="Xem desktop" title="Xem desktop" className={!mobile ? 'active' : ''} onClick={() => setMobile(false)}><Monitor /></button><button aria-label="Xem mobile" title="Xem mobile" className={mobile ? 'active' : ''} onClick={() => setMobile(true)}><Smartphone /></button></div></div></div><div className="preview-tabs" role="tablist" aria-label="Bản xem trước">{[{ id: 'overview', label: 'Tổng quan' }, { id: 'components', label: 'Thành phần' }, { id: 'typography', label: 'Typography' }].map(item => <button role="tab" aria-selected={tab === item.id} key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id as PreviewTab)}>{item.label}</button>)}<span className="live-indicator"><span />LIVE PREVIEW</span></div><Preview system={system} mode={mode} tab={tab} mobile={mobile} onInspect={inspectAll} notify={studio.notify} /></div><Inspector system={system} mode={mode} onMode={setMode} patch={studio.patch} lock={studio.lock} notify={studio.notify} showAll={showAll} onShowAll={() => setShowAll(!showAll)} onBrowse={() => setPage('themes')} /></main> : <main className="page-main">{page === 'overview' ? <OverviewPage systems={studio.state.systems} onSelect={id => { studio.select(id); setPage('editor'); }} onCreate={() => setDialog('create')} onMcp={() => setPage('mcp')} /> : page === 'mcp' ? <McpPage calls={studio.state.calls} online={studio.online} /> : page === 'themes' ? <ThemeLibrary system={system} systems={studio.state.systems} onApply={studio.patch} onCreate={snapshot => studio.mutate('/api/systems', { name: snapshot.name, snapshot })} /> : <HistoryPage system={system} travel={studio.travel} pending={studio.pending > 0} />}</main>}
      <footer className="statusbar"><span>{studio.pending ? <span className="loading-spinner tiny" /> : studio.online ? <CheckCircle2 /> : <AlertCircle />}{studio.pending ? 'Đang lưu thay đổi…' : studio.online ? 'Đã lưu tất cả thay đổi' : 'Chưa kết nối server'}</span><div><span><Database />Local-first</span><span>v{appVersion}</span></div></footer>
    </div>
    {studio.toast && <div className="toast" role="status"><span>{studio.toast}</span><IconButton label="Đóng thông báo" onClick={() => studio.notify('')}><X /></IconButton></div>}
    {dialog === 'create' && <ThemeLibraryDialog system={system} systems={studio.state.systems} initialCreate onClose={closeDialog} onApply={studio.patch} onCreate={async snapshot => { const ok = await studio.mutate('/api/systems', { name: snapshot.name, snapshot }); if (ok) setPage('editor'); return ok; }} />}
    {dialog === 'rename' && <RenameDialog system={system} onClose={closeDialog} onRename={name => studio.patch({ name })} />}
    {dialog === 'export' && <ExportDialog system={system} onClose={closeDialog} />}
    {dialog === 'import' && <ImportDialog system={system} onClose={closeDialog} onApply={studio.patch} onImportJson={async snapshot => { const ok = await studio.mutate('/api/systems', { name: snapshot.name, snapshot }); if (ok) setPage('editor'); return ok; }} />}
  </div>;
}
