// Biblioteca de módulos prontos (Seção 11.2) — grade de cards; nunca uma
// tela em branco. Tocar num card abre o módulo já montado na tela de ajuste.

import type { ModuloConfig } from '../engine/types'
import { MODULE_TEMPLATES, type ModuleTemplate } from '../engine/templates'
import { materialColor } from '../three/colors'

interface TemplateGridProps {
  onSelect: (template: ModuleTemplate, config: ModuloConfig) => void
  onBack: () => void
  backLabel?: string
}

export function TemplateGrid({ onSelect, onBack, backLabel = 'Início' }: TemplateGridProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-16">
      <header className="mb-6">
        <button type="button" onClick={onBack} className="text-sm text-steel-400 hover:text-steel-200">
          ← {backLabel}
        </button>
        <h1 className="text-2xl font-bold mt-1 text-steel-50">Novo módulo</h1>
        <p className="text-sm text-steel-400 mt-1">
          Escolha um modelo pronto e ajuste — nunca comece do zero.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {MODULE_TEMPLATES.map((t) => {
          const cfg = t.cria()
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t, cfg)}
              className="group text-left rounded-2xl border border-steel-700/60 bg-steel-800/50 overflow-hidden active:scale-[0.98] transition-transform"
            >
              <div className="h-28 grid place-items-center border-b border-steel-700/50" style={{ background: materialColor(cfg.materialExterno) + '22' }}>
                <PreviewChip config={cfg} />
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-steel-50">{t.nome}</div>
                <div className="text-xs text-steel-400 mt-0.5 line-clamp-2">{t.descricao}</div>
                <div className="text-[11px] text-steel-500 mt-2 font-mono">
                  {cfg.largura / 10}×{cfg.altura / 10}×{cfg.profundidade / 10} cm
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Mini ilustração da frente do módulo (esquemática 2D). */
function PreviewChip({ config }: { config: ModuloConfig }) {
  const frentes = config.portas.quantidade + config.gavetas.quantidade
  const gavetas = config.gavetas.quantidade
  const color = materialColor(config.materialExterno)
  const segs = Math.max(frentes, 1)
  return (
    <svg viewBox="0 0 64 44" className="w-16 h-12">
      <rect x="4" y="6" width="56" height="32" rx="2" fill="none" stroke={color} strokeWidth="2" />
      {Array.from({ length: segs }).map((_, i) => {
        const w = (56 - 4 * (segs + 1)) / segs
        const x = 4 + 4 + i * (w + 4)
        const isGaveta = i >= segs - gavetas
        const h = isGaveta ? 12 : 22
        const y = isGaveta ? 8 : 18
        return <rect key={i} x={x} y={y} width={w} height={h} rx={1} fill={color} opacity={isGaveta ? 0.75 : 0.95} />
      })}
    </svg>
  )
}