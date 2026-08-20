// ModuleAdjuster — Layout profissional para mobile:
// • 3D canvas ocupa ~75% da tela (fullscreen)
// • Bottom sheet deslizável (collapsed/expanded) com abas
// • Footer CTA fixo sempre visível acima do sheet
// • Sem sobreposição de conteúdo

import { useMemo, useState } from 'react'
import { ArrowLeft, Check, TriangleAlert, Layout, Palette, Wrench, List, Save, ChevronUp, ChevronDown } from 'lucide-react'
import type { EngineRules } from '../engine/rules'
import { computeModule } from '../engine/computeModule'
import { estimateCost, type PriceCatalog } from '../engine/cost'
import type { Ambiente, ModuloConfig, PuxadorCor, PuxadorTipo, SistemaFundo, SistemaGaveta, TipoPorta } from '../engine/types'
import { Scene } from '../three/Scene'
import { COLOR_SWATCHES } from '../three/colors'
import { Segmented, Stepper, Toggle } from '../components/ui'
import { fmtLength, fromDisplay, toDisplay, useUnitPref } from '../lib/units'

interface ModuleAdjusterProps {
  config: ModuloConfig
  onChange: (config: ModuloConfig) => void
  rules: EngineRules
  onBack: () => void
  onConfirm?: () => void
  confirmLabel?: string
  catalog?: PriceCatalog
}

const AMBIENTES: Array<{ value: Ambiente; label: string }> = [
  { value: 'cozinha', label: 'Cozinha' },
  { value: 'dormitorio', label: 'Dormitório' },
  { value: 'banheiro', label: 'Banheiro' },
  { value: 'area_servico', label: 'Área de serviço' },
  { value: 'sala', label: 'Sala' },
]

const SISTEMAS_FUNDO: Array<{ value: SistemaFundo; label: string }> = [
  { value: 'encaixado_recuado', label: 'Encaixado recuado' },
  { value: 'rebaixo_parafusado', label: 'Rebaixo parafusado' },
  { value: 'parafusado_tras', label: 'Parafusado por trás' },
  { value: 'fundo_espesso', label: 'Fundo espesso' },
  { value: 'sem_fundo', label: 'Sem fundo' },
]

const SISTEMAS_GAVETA: Array<{ value: SistemaGaveta; label: string }> = [
  { value: 'telescopica', label: 'Telescópica' },
  { value: 'invisivel', label: 'Invisível (slow)' },
]

const TIPOS_PORTA: Array<{ value: TipoPorta; label: string }> = [
  { value: 'solteira', label: 'Solteira' },
  { value: 'casal', label: 'Casal' },
  { value: 'basculante', label: 'Basculante' },
]

const ABRE_PARA: Array<{ value: 'cima' | 'baixo'; label: string }> = [
  { value: 'cima', label: 'Para cima' },
  { value: 'baixo', label: 'Para baixo' },
]

const PUXADORES: Array<{ value: PuxadorTipo; label: string }> = [
  { value: 'perfil_gola_anodizado', label: 'Perfil gola' },
  { value: 'perfil_45_friso', label: 'Perfil 45°' },
  { value: 'usinado_45', label: 'Usinado 45°' },
  { value: 'passante', label: 'Passante MDF' },
  { value: 'alca_convencional', label: 'Alça' },
  { value: 'facetado_rometal', label: 'Facetado' },
  { value: 'tip_on', label: 'Toque (tip-on)' },
]

const PUXADOR_CORES: Array<{ value: PuxadorCor; label: string }> = [
  { value: 'prata', label: 'Prata' },
  { value: 'preto', label: 'Preto' },
  { value: 'bronze', label: 'Bronze' },
]

const CORREDICAS = [30, 35, 40, 45, 50, 55, 60]

const FITAS: Array<{ value: string; label: string }> = [
  { value: 'fita_proadec_22mm_maderado_x', label: '22mm Maderado' },
  { value: 'fita_proadec_22mm_branco_tx', label: '22mm Branco TX' },
  { value: 'fita_proadec_35mm_maderado_x', label: '35mm Maderado' },
  { value: 'fita_proadec_35mm_branco_tx', label: '35mm Branco TX' },
  { value: 'fita_proadec_64mm_maderado_x', label: '64mm Maderado' },
]

type TabID = 'medidas' | 'cores' | 'ferragens' | 'pecas'

const SHEET_HEIGHTS = {
  collapsed: 220,
  expanded: 520,
}

export function ModuleAdjuster({ config, onChange, rules, onBack, onConfirm, confirmLabel = 'Confirmar', catalog }: ModuleAdjusterProps) {
  const [unit, setUnit] = useUnitPref()
  const [activeTab, setActiveTab] = useState<TabID>('medidas')
  const [sheetExpanded, setSheetExpanded] = useState(false)
  const result = useMemo(() => computeModule(config, rules), [config, rules])
  const budget = useMemo(() => (catalog ? estimateCost(config, result, catalog) : null), [catalog, config, result])

  const patch = (p: Partial<ModuloConfig>) => onChange({ ...config, ...p })
  const patchPortas = (p: Partial<ModuloConfig['portas']>) => onChange({ ...config, portas: { ...config.portas, ...p } })
  const patchGavetas = (p: Partial<ModuloConfig['gavetas']>) => onChange({ ...config, gavetas: { ...config.gavetas, ...p } })
  const patchTampo = (p: Partial<ModuloConfig['tampo']>) => onChange({ ...config, tampo: { ...config.tampo, ...p } })
  const patchRodape = (p: Partial<ModuloConfig['rodape']>) => onChange({ ...config, rodape: { ...config.rodape, ...p } })
  const patchTapon = (lado: 'esquerda' | 'direita', p: Partial<ModuloConfig['taponamento'][typeof lado]>) =>
    onChange({ ...config, taponamento: { ...config.taponamento, [lado]: { ...config.taponamento[lado], ...p } } })

  const dims: Array<{ label: string; mm: number; patch: (v: number) => void }> = [
    { label: 'Largura', mm: config.largura, patch: (v) => patch({ largura: v }) },
    { label: 'Altura', mm: config.altura, patch: (v) => patch({ altura: v }) },
    { label: 'Profundidade', mm: config.profundidade, patch: (v) => patch({ profundidade: v }) },
  ]

  const isBasculante = config.portas.tipo === 'basculante'
  const puxador = config.puxador ?? { tipo: 'perfil_gola_anodizado' as PuxadorTipo, cor: 'preto' as PuxadorCor }
  const corredica = config.corredica?.medida ?? 45
  const fitas = config.fitas ?? {}

  const [savingTemplate, setSavingTemplate] = useState(false)
  const handleSaveAsTemplate = async () => {
    setSavingTemplate(true)
    try {
      const personalTemplates = JSON.parse(localStorage.getItem('marceneiro3d_personal_templates') || '[]')
      const newTemplate = { id: `tpl_${Date.now()}`, nome: config.nome, config, ambienteSugerido: config.ambiente }
      localStorage.setItem('marceneiro3d_personal_templates', JSON.stringify([newTemplate, ...personalTemplates]))
      alert('Salvo como template pessoal!')
    } finally {
      setSavingTemplate(false)
    }
  }

  const sheetH = sheetExpanded ? SHEET_HEIGHTS.expanded : SHEET_HEIGHTS.collapsed
  // CTA height = 72px
  const ctaH = 72

  return (
    <div className="h-dvh flex flex-col bg-[#0f1119] text-steel-100 overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center gap-2 px-3 py-2 bg-steel-900/80 backdrop-blur border-b border-steel-800/60 z-20 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 grid place-items-center rounded-xl bg-steel-800/70 text-steel-200 active:scale-95 transition-transform"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-steel-50 truncate leading-tight">{config.nome}</h1>
          <p className="text-[11px] text-steel-500 font-mono leading-tight">
            {fmtLength(config.largura, unit)}×{fmtLength(config.altura, unit)}×{fmtLength(config.profundidade, unit)}
          </p>
        </div>
        {/* Unidades */}
        <div className="flex rounded-lg overflow-hidden border border-steel-700/50">
          {(['mm', 'cm'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-colors ${unit === u ? 'bg-wood-500 text-white' : 'bg-steel-800/60 text-steel-500'}`}
            >
              {u}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSaveAsTemplate}
          disabled={savingTemplate}
          className="w-9 h-9 grid place-items-center rounded-xl bg-steel-800/70 text-steel-300 active:scale-95 transition-transform"
          title="Salvar como Template Pessoal"
        >
          <Save size={15} />
        </button>
      </header>

      {/* ── 3D Canvas — ocupa tudo que sobra ── */}
      <div className="flex-1 min-h-0 relative" style={{ paddingBottom: sheetH + ctaH }}>
        <div className="absolute inset-0">
          <Scene result={result} />
        </div>

        {/* Warnings overlay */}
        {result.warnings.length > 0 && (
          <div className="absolute top-2 left-2 right-2 space-y-1 z-10 pointer-events-none">
            {result.warnings.map((w, i) => (
              <div key={i} className="bg-amber-950/90 border border-amber-800/50 backdrop-blur flex items-start gap-2 rounded-xl px-3 py-2 text-xs text-amber-300 shadow-lg">
                <TriangleAlert size={13} className="mt-0.5 shrink-0" />
                <span>{w.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Dimensões rápidas overlay (canto inferior esquerdo) */}
        <div className="absolute left-3 bottom-3 pointer-events-none">
          <div className="bg-steel-900/80 backdrop-blur rounded-xl px-3 py-2 border border-steel-700/40">
            <div className="text-[10px] text-steel-500 uppercase tracking-wider font-bold">Dimensões</div>
            <div className="text-xs text-steel-100 font-mono mt-0.5">
              L {fmtLength(config.largura, unit)} × A {fmtLength(config.altura, unit)} × P {fmtLength(config.profundidade, unit)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Sheet ── */}
      <div
        className="fixed left-0 right-0 bg-steel-900 border-t border-steel-700/60 z-20 transition-all duration-300 ease-in-out"
        style={{ bottom: ctaH, height: sheetH }}
      >
        {/* Handle + Abas */}
        <div className="flex items-center border-b border-steel-800/60">
          {/* Tab buttons */}
          {(
            [
              { id: 'medidas', label: 'Medidas', icon: <Layout size={15} /> },
              { id: 'cores', label: 'Cores', icon: <Palette size={15} /> },
              { id: 'ferragens', label: 'Ferragens', icon: <Wrench size={15} /> },
              { id: 'pecas', label: 'Peças', icon: <List size={15} /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setSheetExpanded(true) }}
              className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all ${
                activeTab === tab.id
                  ? 'text-wood-400 border-b-2 border-wood-500'
                  : 'text-steel-500'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
          {/* Toggle expand */}
          <button
            type="button"
            onClick={() => setSheetExpanded((e) => !e)}
            className="px-3 py-2 text-steel-500 active:text-steel-200"
            aria-label={sheetExpanded ? 'Minimizar painel' : 'Expandir painel'}
          >
            {sheetExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="overflow-y-auto h-full pb-4 px-4 pt-3 space-y-4">

          {activeTab === 'medidas' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {dims.map((d) => (
                  <Stepper
                    key={d.label}
                    label={d.label}
                    value={toDisplay(d.mm, unit)}
                    onChange={(v) => d.patch(fromDisplay(v, unit))}
                    step={unit === 'cm' ? 1 : 10}
                    unit={unit}
                    decimals={unit === 'cm' ? 1 : 0}
                  />
                ))}
                <div className="grid grid-cols-2 gap-x-4">
                  <Stepper label="Portas" value={config.portas.quantidade} onChange={(v) => patchPortas({ quantidade: v })} min={0} max={8} step={1} unit="un" />
                  <Stepper label="Gavetas" value={config.gavetas.quantidade} onChange={(v) => patchGavetas({ quantidade: v })} min={0} max={8} step={1} unit="un" />
                </div>
                <Stepper label="Prateleiras" value={config.prateleiras.quantidade} onChange={(v) => patch({ prateleiras: { ...config.prateleiras, quantidade: v } })} min={0} max={8} step={1} unit="un" />
              </div>
              <Segmented label="Ambiente" value={config.ambiente} options={AMBIENTES} onChange={(v) => patch({ ambiente: v })} />
            </div>
          )}

          {activeTab === 'cores' && (
            <div className="space-y-4">
              <ColorPicker label="MDF Interno" value={config.materialInterno} onChange={(id) => patch({ materialInterno: id })} />
              <ColorPicker label="MDF Externo / Frentes" value={config.materialExterno} onChange={(id) => patch({ materialExterno: id })} />
              <div className="space-y-3">
                <div className="text-xs font-bold text-steel-400 uppercase tracking-wider">Fitas de Borda</div>
                <Segmented label="Portas" value={fitas.porta ?? config.fitaBorda} options={FITAS} onChange={(v) => patch({ fitas: { ...fitas, porta: v } })} />
                <Segmented label="Prateleiras" value={fitas.prateleira ?? config.fitaBorda} options={FITAS} onChange={(v) => patch({ fitas: { ...fitas, prateleira: v } })} />
                <Segmented label="Tampo/Chapéu" value={fitas.topo ?? config.fitaBorda} options={FITAS} onChange={(v) => patch({ fitas: { ...fitas, topo: v } })} />
              </div>
            </div>
          )}

          {activeTab === 'ferragens' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="text-xs font-bold text-steel-400 uppercase tracking-wider">Portas</div>
                <Segmented label="Tipo" value={config.portas.tipo} options={TIPOS_PORTA} onChange={(v) => patchPortas({ tipo: v })} />
                {isBasculante && (
                  <Segmented label="Abertura" value={config.portas.abrePara ?? 'cima'} options={ABRE_PARA} onChange={(v) => patchPortas({ abrePara: v })} />
                )}
              </div>
              <div className="space-y-3">
                <div className="text-xs font-bold text-steel-400 uppercase tracking-wider">Puxadores</div>
                <Segmented label="Tipo" value={puxador.tipo} options={PUXADORES} onChange={(v) => patch({ puxador: { ...puxador, tipo: v } })} />
                {puxador.tipo !== 'tip_on' && puxador.tipo !== 'usinado_45' && (
                  <Segmented label="Cor" value={puxador.cor} options={PUXADOR_CORES} onChange={(v) => patch({ puxador: { ...puxador, cor: v } })} />
                )}
              </div>
              {config.gavetas.quantidade > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-steel-400 uppercase tracking-wider">Gavetas</div>
                  <Segmented label="Sistema" value={config.gavetas.sistema} options={SISTEMAS_GAVETA} onChange={(v) => patchGavetas({ sistema: v })} />
                  <Segmented
                    label="Corrediça"
                    value={corredica}
                    options={CORREDICAS.map((c) => ({ value: c, label: `${c} cm` }))}
                    onChange={(v) => patch({ corredica: { ...config.corredica, medida: v } })}
                  />
                </div>
              )}
              <div className="space-y-3">
                <div className="text-xs font-bold text-steel-400 uppercase tracking-wider">Estrutura</div>
                <Segmented label="Fundo" value={config.sistemaFundo} options={SISTEMAS_FUNDO} onChange={(v) => patch({ sistemaFundo: v })} />
                <Toggle label="Rodapé" checked={config.rodape.ativo} onChange={(v) => patchRodape({ ativo: v })} />
                {config.rodape.ativo && (
                  <div className="grid grid-cols-2 gap-x-4 pl-3 border-l-2 border-wood-500/30">
                    <Stepper label="Altura" value={toDisplay(config.rodape.altura, unit)} onChange={(v) => patchRodape({ altura: fromDisplay(v, unit) })} step={5} unit={unit} />
                    <Stepper label="Recuo" value={toDisplay(config.rodape.recuo, unit)} onChange={(v) => patchRodape({ recuo: fromDisplay(v, unit) })} step={5} unit={unit} />
                  </div>
                )}
                <Toggle label="Taponamento esq." checked={config.taponamento.esquerda.ativo} onChange={(v) => patchTapon('esquerda', { ativo: v })} />
                {config.taponamento.esquerda.ativo && (
                  <Stepper className="pl-3 border-l-2 border-wood-500/30" label="Avanço esq." value={toDisplay(config.taponamento.esquerda.avancao, unit)} onChange={(v) => patchTapon('esquerda', { avancao: fromDisplay(v, unit) })} step={5} unit={unit} />
                )}
                <Toggle label="Taponamento dir." checked={config.taponamento.direita.ativo} onChange={(v) => patchTapon('direita', { ativo: v })} />
                {config.taponamento.direita.ativo && (
                  <Stepper className="pl-3 border-l-2 border-wood-500/30" label="Avanço dir." value={toDisplay(config.taponamento.direita.avancao, unit)} onChange={(v) => patchTapon('direita', { avancao: fromDisplay(v, unit) })} step={5} unit={unit} />
                )}
                <Stepper label="Pingadeira frente" value={toDisplay(config.tampo.pingadeiraFrente, unit)} onChange={(v) => patchTampo({ pingadeiraFrente: fromDisplay(v, unit) })} step={5} unit={unit} />
                <Stepper label="Pingadeira lados" value={toDisplay(config.tampo.pingadeiraLados, unit)} onChange={(v) => patchTampo({ pingadeiraLados: fromDisplay(v, unit) })} step={5} unit={unit} />
              </div>
            </div>
          )}

          {activeTab === 'pecas' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-steel-400 uppercase tracking-wider">Lista de Peças</div>
                <span className="text-xs text-steel-500 font-mono bg-steel-800/60 px-2 py-0.5 rounded-full">{result.pieces.length} itens</span>
              </div>
              {result.pieces.map((p, idx) => (
                <div key={p.id || idx} className="rounded-xl border border-steel-800 bg-steel-800/30 px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-steel-100 leading-tight">{p.name}</span>
                    <span className="shrink-0 text-[11px] font-mono text-wood-400 bg-wood-500/10 px-1.5 py-0.5 rounded">{p.w}×{p.h}×{p.d}</span>
                  </div>
                  <div className="text-[11px] text-steel-500 mt-1">{p.materialId}</div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {p.edgeBanding.top && <span className="px-1.5 py-0.5 rounded bg-steel-700/60 text-[9px] font-bold text-steel-300">Topo</span>}
                    {p.edgeBanding.bottom && <span className="px-1.5 py-0.5 rounded bg-steel-700/60 text-[9px] font-bold text-steel-300">Base</span>}
                    {p.edgeBanding.left && <span className="px-1.5 py-0.5 rounded bg-steel-700/60 text-[9px] font-bold text-steel-300">Esq</span>}
                    {p.edgeBanding.right && <span className="px-1.5 py-0.5 rounded bg-steel-700/60 text-[9px] font-bold text-steel-300">Dir</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── CTA fixo no rodapé ── */}
      <div
        className="fixed left-0 right-0 bottom-0 bg-steel-950/98 border-t border-steel-800 px-4 z-30 flex items-center gap-3"
        style={{ height: ctaH, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="min-w-0 shrink-0">
          <div className="text-[9px] text-steel-500 font-bold uppercase tracking-wider">Estimativa</div>
          <div className="text-base font-mono font-bold text-wood-400 tabular-nums leading-tight">
            {budget ? budget.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
          </div>
        </div>
        {onConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-wood-500 hover:bg-wood-600 text-white font-bold py-3 text-sm active:scale-[0.98] transition-all shadow-xl shadow-wood-500/20"
          >
            <Check size={17} />
            <span>{confirmLabel}</span>
          </button>
        )}
      </div>

    </div>
  )
}

interface ColorPickerProps {
  label: string
  value: string
  onChange: (id: string) => void
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-steel-400 mb-2">{label}</div>
      <div className="flex flex-wrap gap-2.5">
        {COLOR_SWATCHES.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.label}
            onClick={() => onChange(s.id)}
            className={`relative w-10 h-10 rounded-full border-2 transition-all active:scale-90 flex-shrink-0 ${
              value === s.id ? 'border-wood-400 scale-110 shadow-lg shadow-wood-500/20' : 'border-steel-700'
            }`}
            style={{ background: s.color }}
            aria-label={s.label}
          >
            {value === s.id && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check size={14} className={s.color === '#f5f0e8' || s.color === '#d4aa7d' ? 'text-steel-700' : 'text-white'} />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="text-[11px] text-steel-500 mt-1.5">
        {COLOR_SWATCHES.find((s) => s.id === value)?.label ?? 'Padrão'}
      </div>
    </div>
  )
}

