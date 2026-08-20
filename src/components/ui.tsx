import { useState, type ReactNode } from 'react'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function CollapsibleSection({ title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-panel overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left text-sm font-bold text-text-base hover:bg-bg-panel-hover transition-colors"
      >
        <span>{title}</span>
        <ChevronDown size={16} className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-border-subtle"
          >
            <div className="px-4 pb-4 pt-3 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface StepperProps {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  decimals?: number
  className?: string
}

export function Stepper({ label, value, onChange, min = 0, max = 10000, step = 10, unit = 'mm', decimals = 0, className }: StepperProps) {
  const round = (v: number) => (decimals > 0 ? Math.round(v * 10) / 10 : Math.round(v))
  const set = (v: number) => onChange(Math.min(max, Math.max(min, round(v))))
  return (
    <label className={`flex items-center justify-between gap-3 ${className ?? ''}`}>
      <span className="text-sm font-semibold text-text-base">{label}</span>
      <span className="flex items-center gap-0 bg-bg-panel border border-border-strong rounded-xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => set(value - step)}
          className="w-10 h-10 grid place-items-center bg-bg-panel-hover hover:bg-border-subtle text-text-muted active:scale-90 transition-all"
          aria-label={`Diminuir ${label}`}
        >
          <Minus size={14} />
        </button>
        <span className="w-22 text-center font-mono text-sm font-bold text-text-base tabular-nums px-2 select-none">
          {value.toFixed(decimals)}
          <span className="text-text-muted text-xs ml-0.5">{unit}</span>
        </span>
        <button
          type="button"
          onClick={() => set(value + step)}
          className="w-10 h-10 grid place-items-center bg-bg-panel-hover hover:bg-border-subtle text-text-muted active:scale-90 transition-all"
          aria-label={`Aumentar ${label}`}
        >
          <Plus size={14} />
        </button>
      </span>
    </label>
  )
}

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  className?: string
}

export function Toggle({ label, checked, onChange, className = '' }: ToggleProps) {
  return (
    <label className={`flex items-center justify-between gap-4 cursor-pointer group ${className}`}>
      <span className="text-sm font-semibold text-text-base group-hover:text-wood-500 transition-colors">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 border ${
          checked ? 'bg-wood-500 border-wood-600' : 'bg-border-strong border-border-strong'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  )
}

interface SegmentedProps<T extends string | number> {
  label: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (v: T) => void
}

export function Segmented<T extends string | number>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="space-y-2">
      {label && <div className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</div>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              value === o.value
                ? 'bg-wood-500 text-white shadow-sm shadow-wood-500/30'
                : 'bg-bg-panel border border-border-strong text-text-muted hover:text-text-base hover:bg-bg-panel-hover'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
