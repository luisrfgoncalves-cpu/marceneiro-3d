import { useMemo, useState } from 'react'
import { ArrowLeft, Check, TriangleAlert, Layout, Palette, Wrench, List, Save } from 'lucide-react'
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

const STONE_PEDRAS: Array<{ value: 'granito' | 'marmore' | 'quartzito' | 'silestone' | 'porcelana'; label: string }> = [
  { value: 'granito', label: 'Granito Preto' },
  { value: 'marmore', label: 'Mármore Carrara' },
  { value: 'quartzito', label: 'Quartzito' },
  { value: 'silestone', label: 'Silestone Cinza' },
  { value: 'porcelana', label: 'Porcelana Beton' },
]

const FITAS: Array<{ value: string; label: string }> = [
  { value: 'fita_proadec_22mm_maderado_x', label: '22mm Maderado' },
  { value: 'fita_proadec_22mm_branco_tx', label: '22mm Branco TX' },
  { value: 'fita_proadec_35mm_maderado_x', label: '35mm Maderado' },
  { value: 'fita_proadec_35mm_branco_tx', label: '35mm Branco TX' },
  { value: 'fita_proadec_64mm_maderado_x', label: '64mm Maderado' },
]

const VEIOS: Array<{ value: 'vertical' | 'horizontal'; label: string }> = [
  { value: 'vertical', label: '↕ Vertical' },
  { value: 'horizontal', label: '↔ Horizontal' },
]

type TabID = 'medidas' | 'cores' | 'ferragens' | 'pecas'

export function ModuleAdjuster({ config, onChange, rules, onBack, onConfirm, confirmLabel = 'Confirmar', catalog }: ModuleAdjusterProps) {
  const [unit, setUnit] = useUnitPref()
  const [activeTab, setActiveTab] = useState<TabID>('medidas')
  const result = useMemo(() => computeModule(config, rules), [config, rules])
  
  // Apenas mostrar orçamento se o catálogo tiver itens e a soma for maior que 0
  const budget = useMemo(() => {
    if (!catalog || Object.keys(catalog).length === 0) return null;
    const est = estimateCost(config, result, catalog);
    return est.total > 0 ? est : null;
  }, [catalog, config, result])

  const patch = (p: Partial<ModuloConfig>) => onChange({ ...config, ...p })
  const patchPia = (p: Partial<NonNullable<ModuloConfig['pia']>>) => onChange({ ...config, pia: { ...config.pia, ...p } as any })
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

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-bg-base text-text-base overflow-hidden">

      {/* ── 3D Canvas Area ── */}
      <div className="flex-1 min-h-[50vh] relative">
        <div className="absolute inset-0">
          <Scene result={result} />
        </div>

        {/* Top Header Overlay */}
        <header className="absolute top-4 left-4 right-4 flex items-center gap-2 z-10 pointer-events-none">
          <button
            type="button"
            onClick={onBack}
            className="pointer-events-auto w-10 h-10 grid place-items-center rounded-full bg-bg-panel shadow-lg border border-border-strong text-text-base hover:bg-bg-panel-hover active:scale-90 transition-all"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="bg-bg-panel shadow-lg rounded-xl px-4 py-2.5 flex flex-col justify-center border border-border-strong flex-1 min-w-0">
            <h1 className="text-sm font-bold text-text-base truncate leading-tight">{config.nome}</h1>
            <p className="text-[10px] text-text-muted font-medium">
              L {fmtLength(config.largura, unit)} × A {fmtLength(config.altura, unit)} × P {fmtLength(config.profundidade, unit)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveAsTemplate}
            disabled={savingTemplate}
            className="pointer-events-auto w-10 h-10 grid place-items-center rounded-xl bg-bg-panel shadow-lg border border-border-strong text-text-muted hover:text-text-base hover:bg-bg-panel-hover active:scale-90 transition-all"
            title="Salvar como Template Pessoal"
          >
            <Save size={16} />
          </button>
        </header>

        {/* Warnings Overlay */}
        {result.warnings.length > 0 && (
          <div className="absolute top-16 left-4 right-4 space-y-1.5 z-10 pointer-events-none max-w-sm">
            {result.warnings.map((w, i) => (
              <div key={i} className="bg-amber-950/90 border border-amber-800/50 backdrop-blur-md flex items-start gap-2 rounded-xl px-3 py-2 text-[11px] text-amber-200 shadow-lg pointer-events-auto">
                <TriangleAlert size={14} className="mt-0.5 shrink-0 text-amber-400" />
                <span className="leading-tight">{w.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sidebar (Tabs & Settings) ── */}
      <div className="w-full h-[50vh] md:w-[380px] md:h-full bg-bg-panel border-t md:border-t-0 md:border-l border-border-subtle flex flex-col shadow-2xl z-20">
        
        {/* Tabs Header */}
        <div className="flex items-center border-b border-border-subtle p-1 shrink-0">
          {(
            [
              { id: 'medidas', label: 'Medidas', icon: <Layout size={14} /> },
              { id: 'cores', label: 'Cores', icon: <Palette size={14} /> },
              { id: 'ferragens', label: 'Ferragens', icon: <Wrench size={14} /> },
              { id: 'pecas', label: 'Peças', icon: <List size={14} /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-wood-50 dark:bg-wood-500/20 text-wood-600 dark:text-wood-400'
                  : 'text-text-muted hover:text-text-base hover:bg-bg-panel-hover'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {activeTab === 'medidas' && (
            <div className="space-y-6">
              <div className="space-y-4 bg-bg-base p-4 rounded-xl border border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                   <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Dimensões Externas</div>
                   {/* Unit toggle inline */}
                   <div className="flex rounded-md overflow-hidden border border-border-strong">
                     {(['mm', 'cm'] as const).map((u) => (
                       <button
                         key={u}
                         type="button"
                         onClick={() => setUnit(u)}
                         className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${unit === u ? 'bg-wood-500 text-white' : 'bg-steel-800/60 text-steel-500'}`}
                       >
                         {u}
                       </button>
                     ))}
                   </div>
                </div>
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
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Stepper label="Portas" value={config.portas.quantidade} onChange={(v) => patchPortas({ quantidade: v })} min={0} max={8} step={1} unit="un" />
                  <Stepper label="Gavetas" value={config.gavetas.quantidade} onChange={(v) => patchGavetas({ quantidade: v })} min={0} max={8} step={1} unit="un" />
                </div>
                <Stepper label="Prateleiras" value={config.prateleiras.quantidade} onChange={(v) => patch({ prateleiras: { ...config.prateleiras, quantidade: v } })} min={0} max={8} step={1} unit="un" />
              </div>

              <Segmented label="Ambiente Sugerido" value={config.ambiente} options={AMBIENTES} onChange={(v) => patch({ ambiente: v })} />
              
              {config.moduloTipo === 'pia' && (
                <div className="space-y-4 pt-4 border-t border-steel-800/80">
                  <div className="text-xs font-bold text-wood-500 dark:text-wood-400 uppercase tracking-wider">Acessórios da Pia</div>
                  
                  {/* Cuba Toggle */}
                  <Toggle
                    label="Cuba Embutida"
                    checked={!!config.pia?.cuba}
                    onChange={(checked) => {
                      if (checked) {
                        patchPia({
                          cuba: { largura: 560, profundidade: 430, posX: 100, quantidade: 1 }
                        })
                      } else {
                        const copy = { ...config }
                        if (copy.pia) {
                          const { cuba, ...rest } = copy.pia
                          onChange({ ...copy, pia: rest as any })
                        }
                      }
                    }}
                  />
                  {config.pia?.cuba && (
                    <div className="space-y-3 pl-3 border-l-2 border-wood-500/30">
                      <Stepper
                        label="Largura Cuba"
                        value={toDisplay(config.pia.cuba.largura, unit)}
                        onChange={(v) => patchPia({ cuba: { ...config.pia!.cuba!, largura: fromDisplay(v, unit) } })}
                        step={unit === 'cm' ? 1 : 10}
                        unit={unit}
                      />
                      <Stepper
                        label="Qtd Cubas"
                        value={config.pia.cuba.quantidade ?? 1}
                        onChange={(v) => patchPia({ cuba: { ...config.pia!.cuba!, quantidade: v } })}
                        min={1}
                        max={2}
                        step={1}
                        unit="un"
                      />
                    </div>
                  )}

                  {/* Cooktop Toggle */}
                  <Toggle
                    label="Recorte Cooktop"
                    checked={!!config.pia?.cooktop}
                    onChange={(checked) => {
                      if (checked) {
                        patchPia({
                          cooktop: { largura: 560, profundidade: 480, posX: 1000 }
                        })
                      } else {
                        const copy = { ...config }
                        if (copy.pia) {
                          const { cooktop, ...rest } = copy.pia
                          onChange({ ...copy, pia: rest as any })
                        }
                      }
                    }}
                  />
                  {config.pia?.cooktop && (
                    <div className="space-y-3 pl-3 border-l-2 border-wood-500/30">
                      <Stepper
                        label="Largura Cooktop"
                        value={toDisplay(config.pia.cooktop.largura, unit)}
                        onChange={(v) => patchPia({ cooktop: { ...config.pia!.cooktop!, largura: fromDisplay(v, unit) } })}
                        step={unit === 'cm' ? 1 : 10}
                        unit={unit}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cores' && (
            <div className="space-y-6">
              <ColorPicker label="MDF Interno (Caixaria)" value={config.materialInterno} onChange={(id) => patch({ materialInterno: id })} />
              <ColorPicker label="MDF Externo (Frentes e Laterais)" value={config.materialExterno} onChange={(id) => patch({ materialExterno: id })} />
              
              {config.moduloTipo === 'pia' && (
                <div className="space-y-4 pt-2 border-t border-steel-800">
                  <div className="text-xs font-bold text-wood-500 dark:text-wood-400 uppercase tracking-wider">Tampo de Pedra</div>
                  <Segmented
                    label="Material da Pedra"
                    value={config.pia?.materialPedra ?? 'granito'}
                    options={STONE_PEDRAS}
                    onChange={(v) => patchPia({ materialPedra: v as any })}
                  />
                  <Segmented
                    label="Espessura da Pedra"
                    value={config.pia?.espessuraPedra ?? 30}
                    options={[
                      { value: 20, label: '20 mm' },
                      { value: 30, label: '30 mm' },
                      { value: 60, label: '60 mm (M.E.)' }
                    ]}
                    onChange={(v) => patchPia({ espessuraPedra: v })}
                  />
                </div>
              )}

              <Segmented
                label="Sentido do Veio (Global)"
                value={config.veioGlobal ?? 'vertical'}
                options={VEIOS}
                onChange={(v) => patch({ veioGlobal: v as 'vertical' | 'horizontal' })}
              />
              <div className="space-y-4 bg-bg-base p-4 rounded-xl border border-border-subtle">
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Fitas de Borda</div>
                <Segmented label="Portas e Frentes" value={fitas.porta ?? config.fitaBorda} options={FITAS} onChange={(v) => patch({ fitas: { ...fitas, porta: v } })} />
                <Segmented label="Prateleiras Internas" value={fitas.prateleira ?? config.fitaBorda} options={FITAS} onChange={(v) => patch({ fitas: { ...fitas, prateleira: v } })} />
                <Segmented label="Tampo/Chapéu" value={fitas.topo ?? config.fitaBorda} options={FITAS} onChange={(v) => patch({ fitas: { ...fitas, topo: v } })} />
              </div>
            </div>
          )}

          {activeTab === 'ferragens' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Portas</div>
                <Segmented label="Tipo de Porta" value={config.portas.tipo} options={TIPOS_PORTA} onChange={(v) => patchPortas({ tipo: v })} />
                {isBasculante && (
                  <Segmented label="Sentido de Abertura" value={config.portas.abrePara ?? 'cima'} options={ABRE_PARA} onChange={(v) => patchPortas({ abrePara: v })} />
                )}
              </div>
              <div className="space-y-4 bg-bg-base p-4 rounded-xl border border-border-subtle">
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Puxadores</div>
                <Segmented label="Modelo" value={puxador.tipo} options={PUXADORES} onChange={(v) => patch({ puxador: { ...puxador, tipo: v } })} />
                {puxador.tipo !== 'tip_on' && puxador.tipo !== 'usinado_45' && (
                  <Segmented label="Cor do Puxador" value={puxador.cor} options={PUXADOR_CORES} onChange={(v) => patch({ puxador: { ...puxador, cor: v } })} />
                )}
              </div>
              {config.gavetas.quantidade > 0 && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Gavetas</div>
                  <Segmented label="Sistema de Corrediça" value={config.gavetas.sistema} options={SISTEMAS_GAVETA} onChange={(v) => patchGavetas({ sistema: v })} />
                  <Segmented
                    label="Profundidade da Corrediça"
                    value={corredica}
                    options={CORREDICAS.map((c) => ({ value: c, label: `${c} cm` }))}
                    onChange={(v) => patch({ corredica: { ...config.corredica, medida: v } })}
                  />
                </div>
              )}
              <div className="space-y-4">
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Estrutura Interna</div>
                <Segmented label="Fixação do Fundo" value={config.sistemaFundo} options={SISTEMAS_FUNDO} onChange={(v) => patch({ sistemaFundo: v })} />
                
                <Toggle label="Rodapé" checked={config.rodape.ativo} onChange={(v) => patchRodape({ ativo: v })} />
                {config.rodape.ativo && (
                  <div className="grid grid-cols-2 gap-4 pl-3 border-l-2 border-wood-500/30">
                    <Stepper label="Altura do Rodapé" value={toDisplay(config.rodape.altura, unit)} onChange={(v) => patchRodape({ altura: fromDisplay(v, unit) })} step={5} unit={unit} />
                    <Stepper label="Recuo Traseiro" value={toDisplay(config.rodape.recuo, unit)} onChange={(v) => patchRodape({ recuo: fromDisplay(v, unit) })} step={5} unit={unit} />
                  </div>
                )}
                
                <Toggle label="Taponamento Esquerdo" checked={config.taponamento.esquerda.ativo} onChange={(v) => patchTapon('esquerda', { ativo: v })} />
                {config.taponamento.esquerda.ativo && (
                  <Stepper className="pl-3 border-l-2 border-wood-500/30" label="Avanço Frontal (Esq.)" value={toDisplay(config.taponamento.esquerda.avancao, unit)} onChange={(v) => patchTapon('esquerda', { avancao: fromDisplay(v, unit) })} step={5} unit={unit} />
                )}
                
                <Toggle label="Taponamento Direito" checked={config.taponamento.direita.ativo} onChange={(v) => patchTapon('direita', { ativo: v })} />
                {config.taponamento.direita.ativo && (
                  <Stepper className="pl-3 border-l-2 border-wood-500/30" label="Avanço Frontal (Dir.)" value={toDisplay(config.taponamento.direita.avancao, unit)} onChange={(v) => patchTapon('direita', { avancao: fromDisplay(v, unit) })} step={5} unit={unit} />
                )}
                
                {config.moduloTipo === 'balcao' && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-steel-800">
                    <Stepper label="Pingadeira Frente" value={toDisplay(config.tampo.pingadeiraFrente, unit)} onChange={(v) => patchTampo({ pingadeiraFrente: fromDisplay(v, unit) })} step={5} unit={unit} />
                    <Stepper label="Pingadeira Lados" value={toDisplay(config.tampo.pingadeiraLados, unit)} onChange={(v) => patchTampo({ pingadeiraLados: fromDisplay(v, unit) })} step={5} unit={unit} />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pecas' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-steel-800">
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Lista de Corte (Otimizada)</div>
                <span className="text-xs text-wood-600 dark:text-wood-300 font-mono bg-wood-50 dark:bg-wood-500/20 px-2 py-0.5 rounded-full">{result.pieces.length} peças</span>
              </div>
              {result.pieces.map((p, idx) => (
                <div key={p.id || idx} className="rounded-xl border border-border-subtle bg-bg-base hover:bg-bg-panel-hover transition-colors px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-text-base leading-tight">{p.name}</span>
                    <span className="shrink-0 text-[11px] font-mono text-text-muted bg-bg-panel-hover px-1.5 py-0.5 rounded border border-border-strong">{p.w}×{p.h}×{p.d}</span>
                  </div>
                  <div className="text-[11px] text-text-muted mt-1">{p.materialId}</div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {p.edgeBanding.top && <span className="px-1.5 py-0.5 rounded bg-wood-500/20 border border-wood-500/30 text-[9px] font-bold text-wood-300 uppercase tracking-wider">Topo</span>}
                    {p.edgeBanding.bottom && <span className="px-1.5 py-0.5 rounded bg-wood-500/20 border border-wood-500/30 text-[9px] font-bold text-wood-300 uppercase tracking-wider">Base</span>}
                    {p.edgeBanding.left && <span className="px-1.5 py-0.5 rounded bg-wood-500/20 border border-wood-500/30 text-[9px] font-bold text-wood-300 uppercase tracking-wider">Esq</span>}
                    {p.edgeBanding.right && <span className="px-1.5 py-0.5 rounded bg-wood-500/20 border border-wood-500/30 text-[9px] font-bold text-wood-300 uppercase tracking-wider">Dir</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Fixed Footer CTA ── */}
        <div className="p-4 border-t border-border-subtle bg-bg-panel shrink-0 flex items-center gap-4 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.08)]">
          {budget && (
            <div className="min-w-0 shrink-0">
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Custo de Produção</div>
              <div className="text-lg font-mono font-bold text-wood-400 tabular-nums leading-tight">
                {budget.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
          )}
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-wood-500 hover:bg-wood-600 text-white font-bold py-3 text-sm active:scale-[0.98] transition-all shadow-lg shadow-wood-500/20 ml-auto"
            >
              <Check size={18} />
              <span>{confirmLabel}</span>
            </button>
          )}
        </div>

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
      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">{label}</div>
      <div className="flex flex-wrap gap-3">
        {COLOR_SWATCHES.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.label}
            onClick={() => onChange(s.id)}
            className={`relative w-11 h-11 rounded-xl transition-all active:scale-90 flex-shrink-0 ${
              value === s.id ? 'scale-110 shadow-lg shadow-wood-500/30 ring-2 ring-wood-400 ring-offset-2 ring-offset-steel-900' : 'border border-steel-700 hover:border-steel-500'
            }`}
            style={{ background: s.color }}
            aria-label={s.label}
          >
            {value === s.id && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check size={16} className={s.color === '#f5f0e8' || s.color === '#d4aa7d' || s.color === '#e6e4df' ? 'text-steel-800' : 'text-white'} />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="text-xs text-text-muted font-medium mt-2 bg-bg-panel-hover px-2 py-1 inline-block rounded-md">
        {COLOR_SWATCHES.find((s) => s.id === value)?.label ?? 'Material Padrão'}
      </div>
    </div>
  )
}
