// Ambiente do projeto (Seção 11.7): 3D do conjunto, módulos e orçamento total.
// Melhorado: Web Share API, duplicar módulo, status badge, bottom bar rica.

import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Save, Pencil, Trash2, Check, RefreshCw, Share2, Copy } from 'lucide-react'
import { layoutEnvironment, type EnvironmentProject } from '../engine/environment'
import { estimateCost, type PriceCatalog } from '../engine/cost'
import type { EngineRules } from '../engine/rules'
import { EnvironmentScene } from '../three/EnvironmentScene'
import { fmtLength, useUnitPref } from '../lib/units'
import { uid } from '../engine/environment'
import type { ModuleInstance } from '../engine/environment'

import { useAutoAnimate } from '@formkit/auto-animate/react'

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
  onDuplicateModule?: (module: ModuleInstance) => void
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
  onDuplicateModule,
}: EnvironmentProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [unit] = useUnitPref()
  const [parentRef] = useAutoAnimate()

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

  const handleShare = async () => {
    const text = [
      `📐 Projeto: ${project.nome}`,
      `👤 Cliente: ${project.cliente}`,
      `🏠 Ambiente: ${AMBIENTE_LABEL[project.ambiente] ?? project.ambiente}`,
      `📦 Módulos: ${project.modulos.length}`,
      `💰 Total estimado: ${totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      '',
      project.modulos.map((m, i) => {
        const b = budgets.find((x) => x.module.id === m.id)
        return `${i + 1}. ${m.nome} — ${fmtLength(m.config.largura, unit)} × ${fmtLength(m.config.altura, unit)} × ${fmtLength(m.config.profundidade, unit)} — ${(b?.total ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
      }).join('\n'),
    ].join('\n')

    if (navigator.share) {
      await navigator.share({ title: project.nome, text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('Copiado para a área de transferência!')
    }
  }

  const handleDuplicate = (m: ModuleInstance) => {
    if (onDuplicateModule) {
      onDuplicateModule({ ...m, id: uid(), nome: `${m.nome} (cópia)` })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-28">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-steel-400 active:text-steel-200 transition-colors">
          <ArrowLeft size={16} />
          Projetos
        </button>
        <button
          type="button"
          onClick={onToggleStatus}
          title="Alternar rascunho/aprovado"
          className={`ml-auto rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
            project.status === 'aprovado'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-steel-600/40 text-steel-300 border border-steel-600/40'
          }`}
        >
          {project.status === 'aprovado' ? '✓ Aprovado' : '⏳ Rascunho'}
        </button>
      </div>

      <h1 className="text-2xl font-bold text-steel-50">{project.nome}</h1>
      <p className="text-sm text-steel-400 mt-0.5">
        {AMBIENTE_LABEL[project.ambiente] ?? project.ambiente} · {project.cliente} ·{' '}
        <span className="text-steel-300">{project.modulos.length} módulo{project.modulos.length === 1 ? '' : 's'}</span>
        {totalWidth > 0 && ` · ${fmtLength(totalWidth, unit)}`}
      </p>

      {/* 3D Canvas */}
      <div className="mt-4 h-72 rounded-2xl overflow-hidden border border-steel-700/60 bg-steel-900/60 shadow-xl">
        <EnvironmentScene pieces={pieces} totalWidth={totalWidth} depth={depth} />
      </div>

      {/* Ações */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onAddModule}
          className="flex items-center gap-2 rounded-xl bg-wood-500 text-white text-sm font-semibold px-4 py-2.5 active:bg-wood-600 transition-colors shadow-lg shadow-wood-500/10"
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
          {saving ? <RefreshCw size={15} className="animate-spin" /> : saved ? <Check size={15} className="text-emerald-400" /> : <Save size={15} />}
          {saved ? 'Salvo!' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 rounded-xl bg-steel-700 text-steel-100 text-sm font-semibold px-4 py-2.5 active:bg-steel-600 transition-colors"
          title="Compartilhar proposta"
        >
          <Share2 size={15} />
          Compartilhar
        </button>
      </div>

      {/* Lista de módulos */}
      {project.modulos.length > 0 && (
        <div className="mt-5">
          <h2 className="text-xs font-bold text-steel-400 uppercase tracking-wider mb-3">Módulos do Projeto</h2>
          <ul ref={parentRef} className="space-y-2">
            {project.modulos.map((m, i) => {
              const b = budgets.find((x) => x.module.id === m.id)
              return (
                <li key={m.id} className="group rounded-2xl border border-steel-700/60 bg-steel-800/40 hover:border-steel-600/80 transition-colors p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 grid place-items-center rounded-lg bg-wood-500/15 text-wood-400 text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate font-semibold text-steel-50 group-hover:text-wood-400 transition-colors">{m.nome}</span>
                    <span className="font-mono text-sm text-wood-400 tabular-nums font-bold">
                      {(b?.total ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="mt-1.5 text-xs text-steel-500 font-mono">
                    L {fmtLength(m.config.largura, unit)} × A {fmtLength(m.config.altura, unit)} × P {fmtLength(m.config.profundidade, unit)}
                    {m.config.portas.quantidade > 0 && ` · ${m.config.portas.quantidade} porta${m.config.portas.quantidade > 1 ? 's' : ''}`}
                    {m.config.gavetas.quantidade > 0 && ` · ${m.config.gavetas.quantidade} gaveta${m.config.gavetas.quantidade > 1 ? 's' : ''}`}
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditModule(m.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-steel-700/60 hover:bg-steel-600/60 px-3 py-1.5 text-xs font-medium text-steel-200 active:scale-95 transition-all"
                    >
                      <Pencil size={12} />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(m)}
                      className="flex items-center gap-1.5 rounded-lg bg-steel-700/60 hover:bg-steel-600/60 px-3 py-1.5 text-xs font-medium text-steel-300 active:scale-95 transition-all"
                    >
                      <Copy size={12} />
                      Duplicar
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveModule(m.id)}
                      className="ml-auto flex items-center gap-1.5 rounded-lg bg-steel-700/60 hover:bg-red-500/20 hover:text-red-300 px-3 py-1.5 text-xs font-medium text-steel-400 active:scale-95 transition-all"
                    >
                      <Trash2 size={12} />
                      Remover
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {project.modulos.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-steel-600/70 p-10 text-center text-sm text-steel-400">
          <div className="text-3xl mb-3">📦</div>
          <div className="font-semibold text-steel-300 mb-1">Ambiente vazio</div>
          Adicione módulos prontos para começar o projeto 3D.
          <button type="button" onClick={onAddModule} className="mt-4 flex items-center gap-1.5 mx-auto rounded-xl bg-wood-500/15 text-wood-400 px-4 py-2.5 text-sm font-semibold active:bg-wood-500/25 hover:bg-wood-500/20 transition-colors">
            <Plus size={15} />
            Adicionar primeiro módulo
          </button>
        </div>
      )}

      {/* Bottom bar fixa */}
      <div className="fixed bottom-0 inset-x-0 border-t border-steel-700/60 bg-steel-900/96 backdrop-blur-xl px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-steel-500 uppercase tracking-wider font-semibold">Total estimado</div>
            <div className="font-mono text-xl font-bold text-wood-400 tabular-nums leading-tight">
              {totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-steel-500 uppercase tracking-wider font-semibold">{project.modulos.length} módulos</div>
            <div className="text-sm text-steel-300 font-medium">{AMBIENTE_LABEL[project.ambiente] ?? project.ambiente}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
