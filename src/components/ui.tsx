import { useState, type ReactNode } from 'react'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

/** Bloco colapsável — "avançado" só renderiza quando expandido (Seção 11.3). */
export function CollapsibleSection({ title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-steel-700/60 bg-steel-800/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-steel-100"
      >
        <span>{title}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-steel-700/40"
          >
            <div className="px-4 pb-4 pt-2 space-y-3">{children}</div>
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
}

export function Stepper({ label, value, onChange, min = 0, max = 10000, step = 10, unit = 'mm', decimals = 0 }: StepperProps) {
  const round = (v: number) => (decimals > 0 ? Math.round(v * 10) / 10 : Math.round(v))
  const set = (v: number) => onChange(Math.min(max, Math.max(min, round(v))))
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-steel-300">{label}</span>
      <span className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => set(value - step)}
          className="w-8 h-8 grid place-items-center rounded-lg bg-steel-700/60 text-steel-100 active:bg-steel-600"
          aria-label={`Diminuir ${label}`}
        >
          <Minus size={14} />
        </button>
        <span className="w-20 text-center font-mono text-sm text-steel-50 tabular-nums">
          {value.toFixed(decimals)}
          <span className="text-steel-500 ml-0.5">{unit}</span>
        </span>
        <button
          type="button"
          onClick={() => set(value + step)}
          className="w-8 h-8 grid place-items-center rounded-lg bg-steel-700/60 text-steel-100 active:bg-steel-600"
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
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-steel-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-wood-500' : 'bg-steel-600'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </label>
  )
}

interface SegmentedProps<T extends string> {
  label: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (v: T) => void
}

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div>
      <div className="text-sm text-steel-300 mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              value === o.value
                ? 'bg-wood-500 text-white'
                : 'bg-steel-700/60 text-steel-300 active:bg-steel-600'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}