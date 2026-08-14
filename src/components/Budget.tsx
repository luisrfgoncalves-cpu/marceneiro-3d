// Painel de orçamento instantâneo (Seção 11.6).

import type { Budget } from '../engine/cost'

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function BudgetPanel({ budget, collapsed }: { budget: Budget; collapsed?: boolean }) {
  return (
    <div className="rounded-xl border border-wood-700/40 bg-wood-900/20 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-steel-100">Estimativa</span>
        <span className="font-mono text-lg font-bold text-wood-400 tabular-nums">{brl(budget.total)}</span>
      </div>
      {!collapsed && budget.items.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-steel-300">
          {budget.items.map((item) => (
            <li key={item.label} className="flex justify-between gap-2">
              <span className="flex-1 truncate">
                {item.label}
                <span className="text-steel-500">
                  {' '}
                  · {item.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {item.unit}
                </span>
              </span>
              <span className="font-mono tabular-nums">{brl(item.total)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-steel-500">
        Valor estimado para pré-aprovação — orçamento fechado é feito no Promob.
      </p>
    </div>
  )
}
