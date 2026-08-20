import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Save, Pencil, Trash2, Check, RefreshCw, Share2, Copy, Sun, Moon } from 'lucide-react'
import { layoutEnvironment, type EnvironmentProject } from '../engine/environment'
import type { EngineRules } from '../engine/rules'
import { EnvironmentScene } from '../three/EnvironmentScene'
import { fmtLength, useUnitPref } from '../lib/units'
import { uid } from '../engine/environment'
import type { ModuleInstance } from '../engine/environment'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useTheme } from '../components/ThemeProvider'

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
  onBack: () => void
  onAddModule: () => void
  onEditModule: (id: string) => void
  onRemoveModule: (id: string) => void
  onToggleStatus: () => void
  onSave: () => Promise<boolean>
  onDuplicateModule?: (module: ModuleInstance) => void
  readOnly?: boolean
}

export function Environment({
  project,
  rules,
  onBack,
  onAddModule,
  onEditModule,
  onRemoveModule,
  onToggleStatus,
  onSave,
  onDuplicateModule,
  readOnly = false,
}: EnvironmentProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [unit] = useUnitPref()
  const [parentRef] = useAutoAnimate()
  const { theme, setTheme } = useTheme()

  const { pieces, totalWidth } = useMemo(() => layoutEnvironment(project, rules), [project, rules])
  const depth = useMemo(
    () => Math.max(...project.modulos.map((m) => m.config.profundidade), 600),
    [project.modulos],
  )

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
      '',
      project.modulos.map((m, i) => `${i + 1}. ${m.nome} — ${fmtLength(m.config.largura, unit)} × ${fmtLength(m.config.altura, unit)} × ${fmtLength(m.config.profundidade, unit)}`).join('\n'),
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
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-bg-base overflow-hidden">
      {/* 3D Canvas */}
      <div className="flex-1 relative h-full">
        <EnvironmentScene pieces={pieces} totalWidth={totalWidth} depth={depth} />

        {/* Top HUD */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10 gap-3">
          <div className="flex items-center gap-2 pointer-events-auto min-w-0">
            {!readOnly ? (
              <button
                type="button"
                onClick={onBack}
                id="btn-back"
                className="shrink-0 w-11 h-11 rounded-full bg-bg-panel shadow-lg border border-border-strong flex items-center justify-center text-text-base hover:bg-bg-panel-hover active:scale-90 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <a href={window.location.origin} className="text-xs bg-wood-500 hover:bg-wood-600 text-white font-bold px-3 py-2 rounded-xl transition-all shadow-lg">
                Criar no Marceneiro 3D
              </a>
            )}
            <div className="bg-bg-panel shadow-lg rounded-xl px-4 py-2.5 flex flex-col justify-center border border-border-strong min-w-0">
              <h1 className="text-sm font-bold text-text-base truncate leading-tight">{project.nome}</h1>
              <p className="text-[10px] text-text-muted font-medium">
                {AMBIENTE_LABEL[project.ambiente] ?? project.ambiente} · {project.modulos.length} módulos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              id="btn-theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-11 h-11 rounded-xl bg-bg-panel border border-border-strong shadow-lg flex items-center justify-center text-text-muted hover:text-text-base hover:bg-bg-panel-hover active:scale-90 transition-all"
              title={theme === 'dark' ? 'Modo Claro (para uso diurno)' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Status badge */}
            <button
              type="button"
              onClick={onToggleStatus}
              className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide border shadow-sm transition-all ${
                project.status === 'aprovado'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700'
                  : 'bg-bg-panel text-text-muted border-border-strong'
              }`}
            >
              {project.status === 'aprovado' ? '✓ Aprovado' : '⏳ Rascunho'}
            </button>
          </div>
        </div>

        {/* Empty State */}
        {project.modulos.length === 0 && !readOnly && (
          <div className="absolute inset-0 flex items-end justify-center pb-[45vh] md:pb-0 md:items-center pointer-events-none z-10">
            <button
              type="button"
              id="btn-add-module-empty"
              onClick={onAddModule}
              className="pointer-events-auto flex flex-col items-center gap-3 rounded-2xl bg-bg-panel border-2 border-dashed border-border-strong p-8 shadow-xl hover:border-wood-500 hover:shadow-wood-500/10 active:scale-95 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-wood-50 dark:bg-wood-500/20 text-wood-500 flex items-center justify-center">
                <Plus size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-text-base font-bold text-base mb-1">Adicionar Módulo</h3>
                <p className="text-text-muted text-sm">Clique aqui para começar</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full h-[42vh] md:w-[360px] md:h-full bg-bg-panel border-t md:border-t-0 md:border-l border-border-subtle flex flex-col shadow-2xl z-20">
        {/* Sidebar Header */}
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-text-base uppercase tracking-wide">
            Módulos ({project.modulos.length})
          </h2>
          {!readOnly && (
            <button
              type="button"
              id="btn-add-module-sidebar"
              onClick={onAddModule}
              className="flex items-center gap-1.5 rounded-lg bg-wood-500 hover:bg-wood-600 text-white text-xs font-bold px-3 py-2 transition-all shadow-sm active:scale-95"
            >
              <Plus size={14} /> Adicionar
            </button>
          )}
        </div>

        {/* Module List */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
          <ul ref={parentRef} className="space-y-2">
            {project.modulos.map((m, i) => (
              <li
                key={m.id}
                className="group rounded-xl bg-bg-base border border-border-subtle hover:border-border-strong transition-all p-3"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-md bg-wood-50 dark:bg-wood-500/20 text-wood-600 dark:text-wood-400 text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="truncate font-bold text-sm text-text-base">{m.nome}</span>
                </div>

                <div className="text-[11px] text-text-muted font-mono mb-2.5 bg-bg-panel-hover rounded-lg px-2.5 py-1.5">
                  L {fmtLength(m.config.largura, unit)} × A {fmtLength(m.config.altura, unit)} × P {fmtLength(m.config.profundidade, unit)}
                  {(m.config.portas.quantidade > 0 || m.config.gavetas.quantidade > 0) && (
                    <div className="mt-1 flex items-center gap-3 text-text-muted">
                      {m.config.portas.quantidade > 0 && <span>{m.config.portas.quantidade} porta(s)</span>}
                      {m.config.gavetas.quantidade > 0 && <span>{m.config.gavetas.quantidade} gaveta(s)</span>}
                    </div>
                  )}
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      id={`btn-edit-${m.id}`}
                      onClick={() => onEditModule(m.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-2 py-2 transition-all active:scale-95 shadow-sm"
                    >
                      <Pencil size={13} /> Editar
                    </button>
                    <button
                      type="button"
                      id={`btn-dup-${m.id}`}
                      onClick={() => handleDuplicate(m)}
                      className="w-9 flex items-center justify-center rounded-lg bg-bg-panel-hover border border-border-strong text-text-muted hover:text-text-base py-2 transition-all active:scale-90"
                      title="Duplicar módulo"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      id={`btn-del-${m.id}`}
                      onClick={() => onRemoveModule(m.id)}
                      className="w-9 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 py-2 transition-all active:scale-90 border border-red-100 dark:border-red-500/20"
                      title="Remover módulo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Actions */}
        {!readOnly && (
          <div className="p-3 border-t border-border-subtle flex items-center gap-2 shrink-0 bg-bg-panel">
            <button
              type="button"
              id="btn-save"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-bold px-4 py-3 shadow-sm transition-all active:scale-95"
            >
              {saving ? <RefreshCw size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              id="btn-share"
              onClick={handleShare}
              className="w-12 h-[46px] flex items-center justify-center rounded-xl bg-bg-panel-hover border border-border-strong text-text-muted hover:text-text-base transition-all active:scale-90"
              title="Compartilhar / Copiar resumo"
            >
              <Share2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
