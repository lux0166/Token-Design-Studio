import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function IconButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button type="button" className="icon-button" aria-label={label} title={label} {...props}>{children}</button>;
}
export function Dialog({ title, children, onClose, wide = false, className = '' }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current!; el.showModal();
    const close = () => onClose(); el.addEventListener('cancel', close);
    return () => { el.removeEventListener('cancel', close); el.close(); };
  }, [onClose]);
  return <dialog ref={ref} className={`dialog ${wide ? 'wide' : ''} ${className}`} aria-labelledby="dialog-title" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="dialog-heading"><h2 id="dialog-title">{title}</h2><IconButton label="Đóng" onClick={onClose}><X /></IconButton></div>{children}
  </dialog>;
}
export function CopyButton({ value, label = 'Sao chép', disabled = false }: { value: string; label?: string; disabled?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  useEffect(() => { if (status === 'idle') return; const id = setTimeout(() => setStatus('idle'), 2500); return () => clearTimeout(id); }, [status]);
  return <button type="button" className="button" disabled={disabled} onClick={async () => { try { await navigator.clipboard.writeText(value); setStatus('done'); } catch { setStatus('error'); } }}>{status === 'done' ? <Check /> : <Copy />}{status === 'done' ? 'Đã sao chép' : status === 'error' ? 'Hãy chọn và chép thủ công' : label}</button>;
}
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`switch ${checked ? 'on' : ''}`} onClick={onChange}><span /></button>;
}
export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
