import { useEffect, useState } from 'react';
import { Check, CheckCircle2, ChevronDown, ChevronUp, CircleHelp, LockKeyhole, RotateCcw, ShieldCheck, UnlockKeyhole, XCircle } from 'lucide-react';
import { contrastReport, fonts, presets, presetPatch, tokenNames, type DesignSystem, type Mode, type SystemPatch, type TokenName } from '../../shared/model';
import { IconButton } from './ui';

const mainTokens: TokenName[] = ['background', 'foreground', 'primary', 'primary-foreground', 'muted', 'border'];
const tokenLabel = (name: string) => name.replaceAll('-', ' ').replace(/^./, s => s.toUpperCase());
function ColorRow({ name, value, locked, onChange, onLock }: { name: string; value: string; locked: boolean; onChange: (value: string) => void; onLock: () => void }) {
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);
  useEffect(() => { setDraft(value); setInvalid(false); }, [value]);
  const commit = () => {
    if (!/^#[0-9a-fA-F]{6}$/.test(draft)) { setInvalid(true); return; }
    setInvalid(false); if (draft.toUpperCase() !== value.toUpperCase()) onChange(draft);
  };
  return <div className={`token-row ${locked ? 'locked' : ''}`}><label htmlFor={`token-${name}`}>{tokenLabel(name)}</label><div className="token-field"><input className="color-picker" type="color" value={/^#[0-9a-fA-F]{6}$/.test(draft) ? draft : value} disabled={locked} aria-label={`Chọn màu ${name}`} onChange={e => { setDraft(e.target.value.toUpperCase()); }} onBlur={commit} /><input id={`token-${name}`} className={`hex-input ${invalid ? 'invalid' : ''}`} value={draft} disabled={locked} aria-invalid={invalid} aria-label={`Màu ${name}`} spellCheck={false} maxLength={7} onChange={e => { setDraft(e.target.value); setInvalid(false); }} onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') { setDraft(value); setInvalid(false); } }} /><IconButton label={locked ? `Mở khóa ${name}` : `Khóa ${name}`} onClick={onLock}>{locked ? <LockKeyhole /> : <UnlockKeyhole />}</IconButton></div>{invalid && <small className="field-error">Dùng định dạng #RRGGBB</small>}</div>;
}
function SliderField({ label, value, min, max, unit, onChange, locked, onLock }: { label: string; value: number; min: number; max: number; unit: string; onChange: (n: number) => void; locked: boolean; onLock: () => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => { if (draft !== value) onChange(draft); };
  return <div className="slider-field"><div className="field-title"><label>{label}</label><IconButton label={`${locked ? 'Mở khóa' : 'Khóa'} ${label}`} onClick={onLock}>{locked ? <LockKeyhole /> : <UnlockKeyhole />}</IconButton></div><div className="slider-controls"><input aria-label={label} type="range" min={min} max={max} value={draft} disabled={locked} onChange={e => setDraft(Number(e.target.value))} onPointerUp={commit} onKeyUp={commit} onBlur={commit} style={{ '--range-progress': `${(draft - min) / (max - min) * 100}%` } as React.CSSProperties} /><div className="number-value"><input type="number" aria-label={`${label} giá trị`} min={min} max={max} value={draft} disabled={locked} onChange={e => setDraft(Math.min(max, Math.max(min, Number(e.target.value))))} onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }} /><span>{unit}</span></div></div></div>;
}
export function Inspector({ system, mode, onMode, patch, lock, notify, showAll, onShowAll, onBrowse }: { system: DesignSystem; mode: Mode; onMode: (mode: Mode) => void; patch: (patch: SystemPatch) => Promise<boolean>; lock: (path: string) => Promise<boolean>; notify: (s: string) => void; showAll: boolean; onShowAll: () => void; onBrowse: () => void }) {
  const [tab, setTab] = useState<'colors' | 'type' | 'shape'>('colors');
  const [showContrast, setShowContrast] = useState(false);
  const report = contrastReport(system, mode);
  const failing = report.filter(r => !r.aa);
  useEffect(() => { if (showAll) setTab('colors'); }, [showAll]);
  const updateSettings = (key: string, value: unknown) => void patch({ settings: { [key]: value } });
  const setPreset = async (index: number) => {
    const input = presetPatch(index);
    const removed: string[] = [];
    for (const m of ['light', 'dark'] as const) for (const key of Object.keys(input[m] ?? {})) {
      if (system.locks.includes(`${m}.${key}`)) { delete input[m]![key as TokenName]; removed.push(key); }
    }
    if (await patch(input)) notify(removed.length ? `Đã áp dụng bảng màu; giữ nguyên ${removed.length} token đã khóa.` : `Đã áp dụng bảng màu ${presets[index].name}.`);
  };
  return <aside className="inspector" aria-label="Tùy chỉnh design system">
    <div className="inspector-title"><h2>Tùy chỉnh</h2><p>Các thay đổi được lưu tự động</p></div>
    <div className="inspector-tabs" role="tablist" aria-label="Nhóm token">{[{ id: 'colors', label: 'Màu sắc' }, { id: 'type', label: 'Kiểu chữ' }, { id: 'shape', label: 'Hình dạng' }].map(item => <button role="tab" aria-selected={tab === item.id} key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id as typeof tab)}>{item.label}</button>)}</div>
    <div className="inspector-scroll">
      {tab === 'colors' && <>
        <div className="inspector-section palette-presets"><div className="field-title"><h3>Bảng màu nhanh</h3><button className="text-button" onClick={() => void setPreset(0)}><RotateCcw /> Đặt lại</button></div><div className="preset-circles">{presets.map((p, i) => <button key={p.name} title={p.name} aria-label={`Bảng màu ${p.name}`} aria-pressed={system.light.primary === p.color.toUpperCase()} className={system.light.primary === p.color.toUpperCase() ? 'selected' : ''} style={{ '--preset': p.color } as React.CSSProperties} onClick={() => void setPreset(i)}>{system.light.primary === p.color.toUpperCase() && <Check />}</button>)}</div><button className="browse-theme-button" onClick={onBrowse}>Khám phá thư viện 48 theme <ChevronDown /></button></div>
        <div className="segmented mode-segment"><button className={mode === 'light' ? 'active' : ''} onClick={() => onMode('light')}>Sáng</button><button className={mode === 'dark' ? 'active' : ''} onClick={() => onMode('dark')}>Tối</button></div>
        <div className="token-list">{(showAll ? tokenNames : mainTokens).map(name => <ColorRow key={`${mode}.${name}`} name={name} value={system[mode][name]} locked={system.locks.includes(`${mode}.${name}`)} onChange={value => void patch({ [mode]: { [name]: value } })} onLock={() => void lock(`${mode}.${name}`)} />)}</div>
        <button className="show-tokens" onClick={onShowAll}>{showAll ? 'Thu gọn token' : `Xem tất cả ${tokenNames.length} token`}{showAll ? <ChevronUp /> : <ChevronDown />}</button>
        <div className="inspector-divider" />
        <SliderField label="Bo góc" value={system.settings.radius} min={0} max={24} unit="px" onChange={n => updateSettings('radius', n)} locked={system.locks.includes('settings.radius')} onLock={() => void lock('settings.radius')} />
      </>}
      {tab === 'type' && <div className="inspector-section type-fields"><div className="field-title"><h3>Font chữ</h3><IconButton label={`${system.locks.includes('settings.font') ? 'Mở khóa' : 'Khóa'} font`} onClick={() => void lock('settings.font')}>{system.locks.includes('settings.font') ? <LockKeyhole /> : <UnlockKeyhole />}</IconButton></div><select aria-label="Font chữ" value={system.settings.font} disabled={system.locks.includes('settings.font')} onChange={e => updateSettings('font', e.target.value)}>{fonts.map(font => <option key={font}>{font}</option>)}</select><p className="field-help">Inter được đóng gói sẵn. Các font còn lại dùng font trên thiết bị.</p><div className="font-specimen" style={{ fontFamily: system.settings.font }}><span>Aa</span><p>Thiết kế theo cách của bạn.</p></div><SliderField label="Cỡ chữ cơ bản" value={system.settings.fontSize} min={12} max={20} unit="px" onChange={n => updateSettings('fontSize', n)} locked={system.locks.includes('settings.fontSize')} onLock={() => void lock('settings.fontSize')} /></div>}
      {tab === 'shape' && <div className="inspector-section shape-fields"><h3>Hình dạng & khoảng cách</h3><p className="field-help">Một thay đổi, đồng bộ mọi thành phần.</p><SliderField label="Bo góc" value={system.settings.radius} min={0} max={24} unit="px" onChange={n => updateSettings('radius', n)} locked={system.locks.includes('settings.radius')} onLock={() => void lock('settings.radius')} /><div className="radius-samples">{[1, 1.5, 2].map((v, i) => <div key={v} style={{ borderRadius: system.settings.radius * v }}><span>{['SM', 'MD', 'LG'][i]}</span></div>)}</div><SliderField label="Đơn vị khoảng cách" value={system.settings.spacing} min={2} max={8} unit="px" onChange={n => updateSettings('spacing', n)} locked={system.locks.includes('settings.spacing')} onLock={() => void lock('settings.spacing')} /><div className="spacing-samples">{[2, 4, 6, 8].map(v => <div key={v}><span style={{ width: system.settings.spacing * v }} /><small>{system.settings.spacing * v}px</small></div>)}</div></div>}
      <div className="inspector-divider" />
      <button className="contrast-summary" onClick={() => setShowContrast(!showContrast)} aria-expanded={showContrast}><span>Độ tương phản <CircleHelp /></span><strong className={failing.length ? 'warning-text' : 'green-text'}>{failing.length ? <XCircle /> : <CheckCircle2 />}{failing.length ? `${failing.length} cần sửa` : 'AA đạt'}</strong></button>
      {showContrast && <div className="contrast-details"><p>WCAG AA cho chữ thường: tối thiểu 4.5:1.</p>{report.map(row => <div key={row.text} className={row.aa ? 'pass' : 'fail'}><span>{tokenLabel(row.text)}<small>trên {row.background}</small></span><strong>{row.ratio.toFixed(2)}:1 {row.aa ? <Check size={12} /> : <XCircle size={12} />}</strong></div>)}</div>}
      <div className="lock-note"><ShieldCheck /><p>Khóa token để giữ nguyên giá trị khi agent chỉnh sửa.</p></div>
    </div>
  </aside>;
}
