// Ambiente do projeto (Seção 11.7): 3D do conjunto, módulos e orçamento total.

import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Save, Pencil, Trash2, Check, RefreshCw } from 'lucide-react'
import { layoutEnvironment, type EnvironmentProject } from '../engine/environment'
import { estimateCost, type PriceCatalog } from '../engine/cost'
import type { EngineRules } from '../engine/rules'
import { EnvironmentScene } from '../three/EnvironmentScene'
import { fmtLength, useUnitPref } from '../lib/units'

const AMBIENTE_LABEL: Record<string, string> = {
  cozinha: 'Cozinha',
  dormitorio: 'Dormitório',
  banheiro: 'Banheiro',
  area_servico: 'Área de serviço',
  sala: 'Sala',
}

interface EnvironmentProps {
  project: EnvironmentProject
  rules: EngineRules
  catalog: PriceCatalog
  onBack: () => void
  onAddModule: () => void
  onEditModule: (id: string) => void
  onRemoveModule: (id: string) => void
  onToggleStatus: () => void
  onSave: () => Promise<boolean>
}

export function Environment({
  project,
  rules,
  catalog,
  onBack,
  onAddModule,
  onEditModule,
  onRemoveModule,
  onToggleStatus,
  onSave,
}: EnvironmentProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [unit] = useUnitPref()

  const { pieces, placed, totalWidth } = useMemo(() => layoutEnvironment(project, rules), [project, rules])
  const depth = useMemo(
    () => Math.max(...project.modulos.map((m) => m.config.profundidade), 600),
    [project.modulos],
  )

  const budgets = useMemo(
    () => placed.map((p) => ({ module: p.module, total: estimateCost(p.module.config, p.result, catalog).total })),
    [placed, catalog],
  )
  const totalBudget = budgets.reduce((s, b) => s + b.total, 0)

  const handleSave = async () => {
    setSaving(true)
    const ok = await onSave()
    setSaving(false)
    setSaved(ok)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-24">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-steel-400 active:text-steel-200">
          <ArrowLeft size={16} />
          Projetos
        </button>
        <button
          type="button"
          onClick={onToggleStatus}
          title="Alternar rascunho/aprovado"
          className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase transition-colors ${
            project.status === 'aprovado' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-steel-600/40 text-steel-300'
          }`}
        >
          {project.status}
        </button>
      </div>

      <h1 className="text-2xl font-bold text-steel-50 mt-2">{project.nome}</h1>
      <p className="text-sm text-steel-400">
        {AMBIENTE_LABEL[project.ambiente] ?? project.ambiente} · {project.cliente} · {project.modulos.length} módulo
        {project.modulos.length === 1 ? '' : 's'} · {fmtLength(totalWidth, unit)}
      </p>

      <div className="mt-4 h-72 rounded-2xl overflow-hidden border border-steel-700/60 bg-steel-900/60">
        <EnvironmentScene pieces={pieces} totalWidth={totalWidth} depth={depth} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onAddModule}
          className="flex items-center gap-2 rounded-xl bg-wood-500 text-white text-sm font-semibold px-4 py-2.5 active:bg-wood-600 transition-colors"
        >
          <Plus size={16} />
          Adicionar módulo
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-steel-700 text-steel-100 text-sm font-semibold px-4 py-2.5 active:bg-steel-600 transition-colors disabled:opacity-50"
        >
          {saving ? <RefreshCw size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          {saved ? 'Salvo' : 'Salvar'}
        </button>
      </div>

      {project.modulos.length > 0 && (
        <ul className="mt-5 space-y-2">
        {project.modulos.map((m, i) => {
          const b = budgets.find((x) => x.module.id === m.id)
          return (
            <li key={m.id} className="rounded-xl border border-steel-700/60 bg-steel-800/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 grid place-items-center rounded-md bg-steel-700/60 text-xs font-semibold text-steel-300">
                  {i + 1}
                </span>
                <span className="flex-1 truncate font-semibold text-steel-50">{m.nome}</span>
                <span className="font-mono text-sm text-wood-400 tabular-nums">
                  {(b?.total ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="mt-1 text-xs text-steel-400">
                {fmtLength(m.config.largura, unit)} × {fmtLength(m.config.altura, unit)} × {fmtLength(m.config.profundidade, unit)}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEditModule(m.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-steel-700/60 px-3 py-1.5 text-xs font-medium text-steel-200 active:bg-steel-600"
                >
                  <Pencil size={13} />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveModule(m.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-steel-700/60 px-3 py-1.5 text-xs font-medium text-steel-400 active:bg-steel-600"
                >
                  <Trash2 size={13} />
                  Remover
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      )}

      {project.modulos.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-steel-600/70 p-8 text-center text-sm text-steel-400">
          Ambiente vazio. Adicione módulos prontos para começar o projeto.
          <button type="button" onClick={onAddModule} className="mt-3 flex items-center gap-1.5 mx-auto rounded-lg bg-wood-500/15 text-wood-400 px-3 py-2 text-xs font-semibold active:bg-wood-500/25">
            <Plus size={14} />
            Adicionar módulo
          </button>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 border-t border-steel-700/60 bg-steel-900/95 backdrop-blur px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <span className="text-sm text-steel-300">Total estimado</span>
          <span className="font-mono text-xl font-bold text-wood-400 tabular-nums">
            {totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>
    </div>
  )
}