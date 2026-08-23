import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, Plus, Save, Pencil, Trash2, Check, RefreshCw, Share2, Copy, Sun, Moon,
  ChevronUp, ChevronDown, X, RotateCw, ChevronLeft, ChevronRight, Minus, AlertTriangle,
  Armchair, Wand2, Layers3, Bomb, BookOpen, FileDown,
} from 'lucide-react'
import { layoutEnvironment, detectCollisions, type DecorTipo, type EnvironmentProject, type ModuleInstance } from '../engine/environment'
import type { EngineRules } from '../engine/rules'
import { EnvironmentScene } from '../three/EnvironmentScene'
import { fmtLength, useUnitPref } from '../lib/units'
import { uid } from '../engine/environment'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useTheme } from '../components/ThemeProvider'
import { useEnvStore } from '../state/envStore'
import { MATERIAL_CATALOG } from '../lib/materials'
import { DECOR_CATALOG } from '../three/decor'
import { QrCode } from '../components/QrCode'
import { buildAssemblyManual, shareViewUrl } from '../engine/manual'
import { projectDxf, downloadDxf } from '../lib/dxf'

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
  onBudget?: () => void
  onEditModule: (id: string) => void
  onRemoveModule: (id: string) => void
  onToggleStatus: () => void
  onSave: () => Promise<boolean>
  onDuplicateModule?: (module: ModuleInstance) => void
  onMoveModule?: (id: string, dir: -1 | 1) => void
  onRotateModule?: (id: string) => void
  onGapChange?: (id: string, gapAntes: number) => void
  onModuleFreeMove?: (id: string, posX: number, posZ: number) => void
  onOrganize?: (mode: 'encostar' | 'distribuir') => void
  onAddDecor?: (tipo: DecorTipo) => void
  onMoveDecor?: (id: string, x: number, z: number) => void
  onRotateDecor?: (id: string) => void
  onRemoveDecor?: (id: string) => void
  onPieceMaterial?: (moduleId: string, pieceName: string, materialId: string | null) => void
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
  onMoveModule,
  onRotateModule,
  onGapChange,
  onModuleFreeMove,
  onOrganize,
  onAddDecor,
  onMoveDecor,
  onRotateDecor,
  onRemoveDecor,
  onPieceMaterial,
  readOnly = false,
}: EnvironmentProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [unit] = useUnitPref()
  const [parentRef] = useAutoAnimate()
  const { theme, setTheme } = useTheme()

  const selectedId = useEnvStore((s) => s.selectedId)
  const select = useEnvStore((s) => s.select)

  // Bottom sheet arrastável no mobile — snap entre 30% e 72% da altura
  const [sheetH, setSheetH] = useState(42)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const fn = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  const drag = useRef({ active: false, startY: 0, startH: 42 })
  const snapSheet = (h: number) => (h > 51 ? 72 : h > 36 ? 42 : 30)

  // Vista explodida do ambiente
  const [explode, setExplode] = useState(0)
  const [showManual, setShowManual] = useState(false)

  const manual = useMemo(
    () => (showManual ? buildAssemblyManual(project, rules) : null),
    [showManual, project, rules],
  )

  const handleDxfProjeto = () => {
    downloadDxf(projectDxf(project, rules), `${project.nome.replace(/\s+/g, '-')}-placas`)
  }

  // Quick-edit: última peça clicada no canvas (troca rápida de material)
  const [pieceSel, setPieceSel] = useState<{ moduleId: string; name: string } | null>(null)
  const handlePieceSelect = useCallback((moduleId: string | null, pieceName?: string) => {
    setPieceSel(moduleId && pieceName ? { moduleId, name: pieceName } : null)
  }, [])

  const decoracoes = project.decoracoes ?? []
  const selectedIsDecor = selectedId?.startsWith('decor::') ?? false
  const selectedDecor = selectedIsDecor ? decoracoes.find((d) => `decor::${d.id}` === selectedId) : null

  const sceneHandlers = useMemo(
    () => ({
      onModuleFreeMove: (id: string, posX: number, posZ: number) => onModuleFreeMove?.(id, posX, posZ),
      onDecorMove: (id: string, x: number, z: number) => onMoveDecor?.(id, x, z),
    }),
    [onModuleFreeMove, onMoveDecor],
  )

  const { pieces, placed, totalWidth } = useMemo(() => layoutEnvironment(project, rules), [project, rules])
  const depth = useMemo(
    () => Math.max(...placed.map((p) => p.depth), ...project.modulos.map((m) => m.config.profundidade), 600),
    [placed, project.modulos],
  )
  const heights = useMemo(
    () => Object.fromEntries(project.modulos.map((m) => [m.id, m.config.altura])) as Record<string, number>,
    [project.modulos],
  )
  const colisoes = useMemo(() => detectCollisions(project, rules), [project, rules])
  const collisionIds = useMemo(
    () => new Set(colisoes.flatMap((c) => [c.aId, c.bId])),
    [colisoes],
  )
  const colisaoDoSelecionado = colisoes.find((c) => c.aId === selectedId || c.bId === selectedId)
  const selectedPlaced = placed.find((p) => p.module.id === selectedId)
  const selectedIndex = project.modulos.findIndex((m) => m.id === selectedId)
  const selectedModulo = selectedIndex >= 0 ? project.modulos[selectedIndex] : null

  // onBudget is available but placed inline in parent App.tsx instead
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
      {/* Modal Manual de Montagem */}
      {showManual && manual && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowManual(false)}>
          <div className="w-full max-w-2xl max-h-[88dvh] overflow-y-auto custom-scrollbar rounded-3xl bg-bg-panel border border-border-strong shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} className="text-violet-500" />
              <h3 className="text-sm font-bold text-text-base">Manual de montagem — {project.nome}</h3>
              <button type="button" onClick={() => setShowManual(false)} className="ml-auto w-8 h-8 grid place-items-center rounded-lg text-text-muted hover:text-text-base hover:bg-bg-panel-hover transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 min-w-0 space-y-4">
                {manual.modulos.map((m, mi) => (
                  <div key={mi} className="rounded-xl border border-border-subtle bg-bg-base p-3">
                    <div className="text-xs font-bold text-text-base mb-2">
                      {mi + 1}. {m.modulo} <span className="text-text-muted font-mono">({m.pecasTotal} peças)</span>
                    </div>
                    <ol className="space-y-2 list-none">
                      {m.steps.map((s) => (
                        <li key={s.ordem}>
                          <div className="text-[11px] font-bold text-violet-500">{s.titulo}</div>
                          <ul className="mt-0.5 space-y-0.5">
                            {s.itens.map((it, ii) => (
                              <li key={ii} className="text-[11px] font-mono text-text-muted pl-3">• {it}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>

              <div className="shrink-0 md:w-[220px] flex md:flex-col items-center gap-3 md:gap-2 md:text-center">
                <QrCode text={shareViewUrl(project.id)} size={170} />
                <p className="text-[11px] text-text-muted leading-snug">
                  Salve o projeto e compartilhe: quem escanear abre o <strong>3D interativo</strong> deste ambiente no celular.
                </p>
                <button
                  type="button"
                  onClick={handleDxfProjeto}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-2.5 transition-all active:scale-95 shrink-0"
                >
                  <FileDown size={14} /> DXF das placas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 3D Canvas */}
      <div className="flex-1 relative h-full">
        <EnvironmentScene
          pieces={pieces}
          placed={placed}
          decoracoes={decoracoes}
          totalWidth={totalWidth}
          depth={depth}
          heights={heights}
          collisionIds={collisionIds}
          readOnly={readOnly}
          screenshotName={project.nome.replace(/\s+/g, '-')}
          explode={explode}
          onPieceSelect={handlePieceSelect}
          handlers={sceneHandlers}
        />

        {/* Slider vista explodida */}
        {!readOnly && project.modulos.length > 0 && (
          <div className="absolute left-4 bottom-[calc(42vh+14px)] md:bottom-6 z-10 flex items-center gap-2 rounded-xl bg-steel-900/80 border border-steel-700/50 shadow-lg px-3 py-2 backdrop-blur-sm">
            <Bomb size={14} className="text-steel-300 shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(explode * 100)}
              onChange={(e) => setExplode(Number(e.target.value) / 100)}
              className="w-20 md:w-32 accent-violet-500"
              aria-label="Vista explodida"
              title="Vista explodida"
            />
            <span className="text-[10px] font-mono text-steel-300 w-7 text-right tabular-nums">{Math.round(explode * 100)}%</span>
          </div>
        )}

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
                {AMBIENTE_LABEL[project.ambiente] ?? project.ambiente} · {project.modulos.length} módulos · {(totalWidth / 10).toFixed(0)} cm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto shrink-0">
            <button
              type="button"
              id="btn-theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-11 h-11 rounded-xl bg-bg-panel border border-border-strong shadow-lg flex items-center justify-center text-text-muted hover:text-text-base hover:bg-bg-panel-hover active:scale-90 transition-all"
              title={theme === 'dark' ? 'Modo Claro (para uso diurno)' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

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

        {/* Aviso global de colisão */}
        {!readOnly && colisoes.length > 0 && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/40 backdrop-blur-md text-red-600 dark:text-red-400 text-xs font-bold px-3 py-2 rounded-xl shadow-lg">
              <AlertTriangle size={14} />
              {colisoes.length === 1
                ? `Módulos sobrepostos (${colisoes[0].overlapMm} mm)`
                : `${colisoes.length} sobreposições detectadas`}
            </div>
          </div>
        )}

        {/* Toolbar do módulo selecionado */}
        {!readOnly && selectedPlaced && selectedModulo && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(42vh+14px)] md:bottom-6 z-30 w-[min(94vw,640px)]">
            <div className="rounded-2xl bg-bg-panel/95 backdrop-blur-md border border-border-strong shadow-2xl p-2.5 flex flex-col gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 w-6 h-6 rounded-md bg-violet-500/20 text-violet-500 text-[10px] font-bold grid place-items-center">
                  {selectedIndex + 1}
                </span>
                <span className="truncate text-sm font-bold text-text-base">{selectedModulo.nome}</span>
                <span className="ml-auto shrink-0 text-[11px] font-mono text-text-muted">
                  L {fmtLength(selectedModulo.config.largura, unit)} × A {fmtLength(selectedModulo.config.altura, unit)} × P {fmtLength(selectedModulo.config.profundidade, unit)}
                </span>
                <button
                  type="button"
                  onClick={() => select(null)}
                  className="shrink-0 w-7 h-7 grid place-items-center rounded-lg text-text-muted hover:text-text-base hover:bg-bg-panel-hover transition-all"
                  title="Fechar"
                >
                  <X size={14} />
                </button>
              </div>

              {colisaoDoSelecionado && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 bg-red-500/10 border border-red-500/25 rounded-lg px-2 py-1">
                  <AlertTriangle size={12} />
                  Sobreposição de {colisaoDoSelecionado.overlapMm} mm com módulo vizinho
                </div>
              )}

              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                <ToolBtn icon={<Pencil size={14} />} label="Editar" primary onClick={() => onEditModule(selectedModulo.id)} />
                <ToolBtn icon={<Copy size={14} />} label="Duplicar" onClick={() => handleDuplicate(selectedModulo)} />
                <ToolBtn
                  icon={<RotateCw size={14} />}
                  label={selectedModulo.rotacionado ? '90° ✓' : 'Girar 90°'}
                  active={selectedModulo.rotacionado}
                  onClick={() => onRotateModule?.(selectedModulo.id)}
                />
                <span className="w-px h-7 bg-border-strong shrink-0" />
                <ToolBtn icon={<ChevronLeft size={15} />} label="" disabled={selectedIndex <= 0} onClick={() => onMoveModule?.(selectedModulo.id, -1)} title="Mover para trás" />
                <ToolBtn icon={<ChevronRight size={15} />} label="" disabled={selectedIndex >= project.modulos.length - 1} onClick={() => onMoveModule?.(selectedModulo.id, 1)} title="Mover para frente" />
                <div className="flex items-center gap-0.5 rounded-lg bg-bg-panel-hover border border-border-strong px-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onGapChange?.(selectedModulo.id, Math.min(500, (selectedModulo.gapAntes ?? 0) - 10))}
                    disabled={(selectedModulo.gapAntes ?? 0) <= -200}
                    className="w-8 h-8 grid place-items-center text-text-muted hover:text-text-base disabled:opacity-30 transition-all"
                    title="Diminuir vão antes do módulo"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-12 text-center text-[11px] font-mono font-bold text-text-base tabular-nums" title="Vão antes deste módulo (mm)">
                    {Math.round(selectedModulo.gapAntes ?? 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onGapChange?.(selectedModulo.id, Math.min(500, (selectedModulo.gapAntes ?? 0) + 10))}
                    disabled={(selectedModulo.gapAntes ?? 0) >= 500}
                    className="w-8 h-8 grid place-items-center text-text-muted hover:text-text-base disabled:opacity-30 transition-all"
                    title="Aumentar vão antes do módulo"
                  >
                    +
                  </button>
                </div>
                <span className="w-px h-7 bg-border-strong shrink-0" />
                <ToolBtn
                  icon={<Trash2 size={14} />}
                  label=""
                  danger
                  onClick={() => {
                    onRemoveModule(selectedModulo.id)
                    select(null)
                  }}
                  title="Remover módulo"
                />
              </div>
            </div>
          </div>
        )}

        {/* Toolbar da decoração selecionada */}
        {!readOnly && selectedDecor && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(42vh+14px)] md:bottom-6 z-30">
            <div className="rounded-2xl bg-bg-panel/95 backdrop-blur-md border border-border-strong shadow-2xl p-2.5 flex items-center gap-2">
              <span className="shrink-0 w-7 h-7 rounded-lg bg-green-500/20 text-green-500 grid place-items-center">
                <Armchair size={14} />
              </span>
              <span className="text-sm font-bold text-text-base capitalize">{selectedDecor.tipo}</span>
              <ToolBtn icon={<RotateCw size={14} />} label="Girar 90°" onClick={() => onRotateDecor?.(selectedDecor.id)} />
              <ToolBtn icon={<Trash2 size={14} />} label="" danger onClick={() => onRemoveDecor?.(selectedDecor.id)} title="Remover decoração" />
              <button
                type="button"
                onClick={() => select(null)}
                className="shrink-0 w-7 h-7 grid place-items-center rounded-lg text-text-muted hover:text-text-base hover:bg-bg-panel-hover transition-all"
                title="Fechar"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Quick-edit de material da peça clicada */}
        {!readOnly && pieceSel && (
          <div className="absolute left-4 top-20 z-30 w-[min(88vw,300px)]">
            <div className="rounded-2xl bg-bg-panel/95 backdrop-blur-md border border-border-strong shadow-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Layers3 size={13} className="text-violet-500 shrink-0" />
                <span className="truncate text-xs font-bold text-text-base">{pieceSel.name}</span>
                <button
                  type="button"
                  onClick={() => setPieceSel(null)}
                  className="ml-auto shrink-0 w-6 h-6 grid place-items-center rounded-md text-text-muted hover:text-text-base transition-all"
                  title="Fechar"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => onPieceMaterial?.(pieceSel.moduleId, pieceSel.name, null)}
                  className={`shrink-0 px-2 h-7 rounded-lg border border-primary text-primary text-[9px] font-bold grid place-items-center`}
                  title="Voltar ao material padrão"
                >
                  auto
                </button>
                {MATERIAL_CATALOG.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onPieceMaterial?.(pieceSel.moduleId, pieceSel.name, m.id)}
                    className="shrink-0 w-7 h-7 rounded-full border-2 border-black/10 hover:border-primary transition-all"
                    style={{ backgroundColor: m.color }}
                    title={`${m.brand} ${m.name}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

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

      {/* Sidebar (bottom sheet arrastável no mobile) */}
      <div
        className="w-full md:w-[360px] md:h-full bg-bg-panel border-t md:border-t-0 md:border-l border-border-subtle flex flex-col shadow-2xl z-20 transition-[height] duration-150"
        style={isDesktop ? undefined : { height: `${sheetH}vh` }}
      >
        {/* Handle de arraste (mobile) */}
        {!isDesktop && (
          <div
            className="pt-1.5 pb-1 flex justify-center touch-none cursor-grab active:cursor-grabbing shrink-0"
            onPointerDown={(e) => {
              drag.current = { active: true, startY: e.clientY, startH: sheetH }
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (!drag.current.active) return
              const vh = window.innerHeight / 100
              const dy = (drag.current.startY - e.clientY) / vh
              setSheetH(Math.min(85, Math.max(18, drag.current.startH + dy)))
            }}
            onPointerUp={() => {
              if (!drag.current.active) return
              drag.current.active = false
              setSheetH((h) => snapSheet(h))
            }}
            onPointerCancel={() => {
              drag.current.active = false
              setSheetH((h) => snapSheet(h))
            }}
          >
            <div className="w-10 h-1 rounded-full bg-border-strong" />
          </div>
        )}

        {/* Sidebar Header */}
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-text-base uppercase tracking-wide">
            Módulos ({project.modulos.length})
          </h2>
          {!readOnly && project.modulos.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOrganize?.('encostar')}
                className="flex items-center gap-1 rounded-lg bg-bg-panel-hover border border-border-strong text-text-muted hover:text-text-base text-[10px] font-bold px-2 py-1.5 transition-all active:scale-95"
                title="Encostar todos os módulos (limpa vãos e posições livres)"
              >
                <Wand2 size={12} /> Encostar
              </button>
              <button
                type="button"
                onClick={() => onOrganize?.('distribuir')}
                className="flex items-center gap-1 rounded-lg bg-bg-panel-hover border border-border-strong text-text-muted hover:text-text-base text-[10px] font-bold px-2 py-1.5 transition-all active:scale-95"
                title="Distribuir vãos igualmente"
              >
                <Layers3 size={12} /> Distribuir
              </button>
            </div>
          )}
          {!readOnly && (
            <button
              type="button"
              id="btn-add-module-sidebar"
              onClick={onAddModule}
              className={`flex items-center gap-1.5 rounded-lg bg-wood-500 hover:bg-wood-600 text-white text-xs font-bold px-3 py-2 transition-all shadow-sm active:scale-95 ${project.modulos.length > 1 ? 'ml-auto' : ''}`}
            >
              <Plus size={14} /> Adicionar
            </button>
          )}
        </div>

        {/* Module List */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
          <ul ref={parentRef} className="space-y-2">            {project.modulos.map((m, i) => {
              const isSel = m.id === selectedId
              const temColisao = collisionIds.has(m.id)
              return (
                <li
                  key={m.id}
                  onClick={() => select(m.id)}
                  className={`group rounded-xl border cursor-pointer transition-all p-3 ${
                    isSel
                      ? 'border-violet-500 bg-violet-500/5 shadow-sm'
                      : temColisao
                        ? 'border-red-400/60 bg-red-500/5'
                        : 'border-border-subtle bg-bg-base hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className={`shrink-0 w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center ${
                      isSel ? 'bg-violet-500 text-white' : temColisao ? 'bg-red-500/20 text-red-500' : 'bg-wood-50 dark:bg-wood-500/20 text-wood-600 dark:text-wood-400'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="truncate font-bold text-sm text-text-base">{m.nome}</span>
                    {m.rotacionado && (
                      <span className="shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-500">90°</span>
                    )}
                    {(m.gapAntes ?? 0) !== 0 && (
                      <span className="shrink-0 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-500">
                        vão {m.gapAntes! > 0 ? '+' : ''}{m.gapAntes}
                      </span>
                    )}
                    {temColisao && <AlertTriangle size={13} className="shrink-0 text-red-500" />}
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
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => onMoveModule?.(m.id, -1)}
                          disabled={i === 0}
                          className="w-9 h-4.5 flex items-center justify-center rounded-t-lg bg-bg-panel-hover border border-border-strong text-text-muted hover:text-text-base disabled:opacity-25 transition-all"
                          title="Mover para trás"
                        >
                          <ChevronUp size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveModule?.(m.id, 1)}
                          disabled={i === project.modulos.length - 1}
                          className="w-9 h-4.5 flex items-center justify-center rounded-b-lg bg-bg-panel-hover border border-border-strong text-text-muted hover:text-text-base disabled:opacity-25 transition-all"
                          title="Mover para frente"
                        >
                          <ChevronDown size={11} />
                        </button>
                      </div>
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
              )
            })}
          </ul>

          {/* Decoração */}
          {!readOnly && (
            <div className="pt-2">
              <div className="flex items-center gap-1.5 mb-2 px-0.5">
                <Armchair size={13} className="text-green-500 shrink-0" />
                <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wide">Decoração</h3>
                {decoracoes.length > 0 && (
                  <span className="text-[10px] font-mono text-text-muted">({decoracoes.length})</span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {DECOR_CATALOG.map((d) => (
                  <button
                    key={d.tipo}
                    type="button"
                    onClick={() => onAddDecor?.(d.tipo)}
                    className="rounded-lg border border-border-subtle bg-bg-base hover:border-green-500/60 hover:bg-green-500/5 py-2 text-[9px] font-bold text-text-muted hover:text-green-600 transition-all active:scale-95 capitalize leading-tight"
                    title={`Adicionar ${d.label}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              {decoracoes.length > 0 && (
                <ul className="space-y-1.5">
                  {decoracoes.map((d) => {
                    const sel = selectedId === `decor::${d.id}`
                    return (
                      <li
                        key={d.id}
                        onClick={() => select(`decor::${d.id}`)}
                        className={`rounded-lg border cursor-pointer transition-all px-2.5 py-2 flex items-center gap-2 ${
                          sel ? 'border-green-500 bg-green-500/5' : 'border-border-subtle bg-bg-base hover:border-border-strong'
                        }`}
                      >
                        <span className="capitalize text-xs font-bold text-text-base truncate">{d.tipo}</span>
                        <span className="ml-auto font-mono text-[10px] text-text-muted shrink-0">
                          {(d.x / 10).toFixed(0)}·{(d.z / 10).toFixed(0)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onRemoveDecor?.(d.id) }}
                          className="shrink-0 w-6 h-6 grid place-items-center rounded-md text-red-400 hover:bg-red-500/10 transition-all"
                          title="Remover"
                        >
                          <Trash2 size={11} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
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
              id="btn-manual"
              onClick={() => setShowManual(true)}
              className="w-12 h-[46px] flex items-center justify-center rounded-xl bg-bg-panel-hover border border-border-strong text-text-muted hover:text-text-base transition-all active:scale-90"
              title="Manual de montagem + QR"
            >
              <BookOpen size={16} />
            </button>
            <button
              type="button"
              id="btn-dxf"
              onClick={handleDxfProjeto}
              className="w-12 h-[46px] flex items-center justify-center rounded-xl bg-bg-panel-hover border border-border-strong text-text-muted hover:text-violet-500 hover:border-violet-500/50 transition-all active:scale-90"
              title="Exportar DXF das placas (CNC)"
            >
              <FileDown size={16} />
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

function ToolBtn({ icon, label, onClick, disabled, danger, primary, active, title }: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  primary?: boolean
  active?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      className={`shrink-0 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold transition-all active:scale-95 disabled:opacity-30 ${
        primary
          ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
          : danger
            ? 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20'
            : active
              ? 'bg-violet-600 text-white border border-violet-500'
              : 'bg-bg-panel-hover border border-border-strong text-text-muted hover:text-text-base'
      }`}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  )
}
