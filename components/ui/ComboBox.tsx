"use client";
import React, { useState, useEffect, useRef } from 'react';

export interface ComboOption {
  value: string;
  label: string;
  meta?: any;
}

interface ComboBoxProps {
  options: ComboOption[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  allowClear?: boolean;
  searchable?: boolean;
  className?: string;
  emptyText?: string;
  maxHeight?: number;
}

// Accessible-ish custom combobox (listbox pattern simplified)
const ComboBox: React.FC<ComboBoxProps> = ({
  options,
  value,
  placeholder = 'Chọn...',
  onChange,
  disabled,
  allowClear = true,
  searchable = true,
  className = '',
  emptyText = 'Không có dữ liệu',
  maxHeight = 260
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [focusIndex, setFocusIndex] = useState<number>(-1);

  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
        setFocusIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (listRef.current) {
          const active = listRef.current.querySelector('[data-active="true"]');
          if (active instanceof HTMLElement) active.scrollIntoView({ block: 'nearest' });
        }
      }, 0);
    }
  }, [open]);

  const current = options.find(o => o.value === value) || null;

  const commit = (val: string) => {
    onChange(val);
    setOpen(false);
    setQuery('');
    setFocusIndex(-1);
  };

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (open) {
      if (e.key === 'Escape') {
        setOpen(false); setFocusIndex(-1); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIndex(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') { e.preventDefault(); if (focusIndex >= 0 && filtered[focusIndex]) commit(filtered[focusIndex].value); }
      if (e.key === 'Tab') { setOpen(false); }
    }
  }

  return (
    <div ref={wrapperRef} className={`relative inline-block text-left w-full ${className}`} onKeyDown={onKeyDown}>
      <button ref={buttonRef} type="button" disabled={disabled} onClick={() => setOpen(o => !o)}
        className={`w-full h-11 px-3 rounded-lg border bg-white dark:bg-neutral-800 text-sm flex items-center justify-between gap-2 shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${open ? 'border-blue-500' : 'border-neutral-300 dark:border-neutral-600'}`}
        aria-haspopup="listbox" aria-expanded={open}>
        <span className="truncate text-left flex-1">{current ? current.label : <span className="text-neutral-400">{placeholder}</span>}</span>
        <span className="text-neutral-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {allowClear && current && (
        <button className="absolute right-8 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs" onClick={(e) => { e.stopPropagation(); commit(''); }}>
          ✕
        </button>
      )}
      {open && (
        <div className="absolute z-40 mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-xl p-2 space-y-2">
          {searchable && (
            <input autoFocus value={query} onChange={e => { setQuery(e.target.value); setFocusIndex(0); }} placeholder="Tìm..."
              className="w-full h-9 px-2 rounded-md border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          )}
          <ul ref={listRef} className="max-h-[260px] overflow-y-auto thin-scroll pr-1" role="listbox" aria-activedescendant={focusIndex >= 0 ? `combo-opt-${focusIndex}` : undefined}>
            {filtered.length === 0 && (
              <li className="text-xs text-neutral-400 py-2 text-center">{emptyText}</li>
            )}
            {filtered.map((opt, idx) => {
              const active = opt.value === current?.value;
              const focused = idx === focusIndex;
              return (
                <li id={`combo-opt-${idx}`} key={opt.value} data-active={active || undefined}
                  role="option" aria-selected={active} onMouseEnter={() => setFocusIndex(idx)} onMouseLeave={() => setFocusIndex(-1)}
                  onClick={() => commit(opt.value)}
                  className={`px-3 py-2 rounded-md text-sm cursor-pointer mb-1 last:mb-0 flex items-center gap-2 border border-transparent ${active ? 'bg-blue-600 text-white shadow' : focused ? 'bg-neutral-100 dark:bg-neutral-700' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'} transition-colors`}>
                  <span className="truncate flex-1">{opt.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComboBox;