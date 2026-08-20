import { useMemo, useState } from 'react'
import { Scene } from '../three/Scene'
import { computeModule } from '../engine/computeModule'
import type { ModuloConfig } from '../engine/types'
import { Stepper, Segmented, CollapsibleSection } from '../components/ui'
import { ArrowLeft, Save, Box, PaintRoller, Settings2, Scissors } from 'lucide-react'
import { MATERIAL_CATALOG } from '../lib/materials'

import type { EngineRules } from '../engine/rules'

interface ModuleAdjusterProps {
  initialConfig: ModuloConfig
  onSave: (config: ModuloConfig) => void
  onCancel: () => void
  onSaveAsTemplate?: (config: ModuloConfig) => void
  isNew?: boolean
  rules: EngineRules
}

export function ModuleAdjuster({ initialConfig, onSave, onCancel, rules }: ModuleAdjusterProps) {
  const [config, setConfig] = useState<ModuloConfig>(() => ({
    ...initialConfig,
    ferragens: initialConfig.ferragens || { montagem: 'minifix', dobradica: 'reta', corredica: 'telescopica' },
    pecasCustomizadas: initialConfig.pecasCustomizadas || {}
  }))
  const [activeTab, setActiveTab] = useState<'medidas' | 'cores' | 'ferragens' | 'pecas'>('medidas')

  const { pieces, warnings } = useMemo(() => computeModule(config, rules), [config])
  
  const handleSave = () => onSave(config)

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-bg-base text-text-base overflow-hidden">
      {/* Visualizador 3D em Tela Cheia (Background) */}
      <div className="flex-1 relative h-full">
        <Scene result={{ pieces, hinges: [], pistons: [], warnings, dimensions: { width: config.largura, height: config.altura, depth: config.profundidade } }} />
        
        {/* Top HUD (Back button, warnings) */}
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none z-10">
          <button
            type="button"
            onClick={onCancel}
            className="pointer-events-auto w-11 h-11 grid place-items-center rounded-full bg-bg-panel shadow-lg border border-border-strong text-text-base hover:bg-bg-panel-hover active:scale-90 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex flex-col gap-2 items-end pointer-events-auto">
             {warnings.map((w, i) => (
                <div key={i} className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs px-3 py-2 rounded-xl shadow-lg backdrop-blur-md max-w-[200px] text-right">
                  <strong className="block">{w.pieceName}</strong>
                  {w.message}
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Painel de Edição (Bottom Sheet no Mobile, Lateral no Desktop) */}
      <div className="w-full h-[55vh] md:w-[400px] md:h-[calc(100vh-32px)] md:absolute md:right-4 md:top-4 bg-bg-panel md:rounded-3xl border-t md:border border-border-subtle flex flex-col shadow-2xl z-20 overflow-hidden md:my-0 mt-auto rounded-t-3xl">
        
        {/* Header do Painel */}
        <div className="p-4 border-b border-border-subtle shrink-0">
          <h2 className="text-lg font-bold text-text-base mb-3">{config.nome || 'Ajuste de Módulo'}</h2>
          
          {/* Tabs Intuitivas */}
          <div className="flex gap-1 p-1 bg-bg-panel-hover rounded-xl border border-border-strong overflow-x-auto custom-scrollbar">
             {[
               { id: 'medidas', label: 'Medidas', icon: Box },
               { id: 'cores', label: 'Cores', icon: PaintRoller },
               { id: 'ferragens', label: 'Ferragens', icon: Settings2 },
               { id: 'pecas', label: 'Peças & Fitas', icon: Scissors }
             ].map(t => {
               const Icon = t.icon
               return (
                 <button 
                   key={t.id} 
                   onClick={() => setActiveTab(t.id as any)}
                   className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${activeTab === t.id ? 'bg-bg-panel shadow-sm text-primary' : 'text-text-muted hover:text-text-base'}`}
                 >
                   <Icon size={18} className="mb-1" />
                   <span className="text-[10px] font-bold">{t.label}</span>
                 </button>
               )
             })}
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          {activeTab === 'medidas' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Stepper label="Largura" value={config.largura} onChange={v => setConfig({...config, largura: v})} />
                <Stepper label="Altura" value={config.altura} onChange={v => setConfig({...config, altura: v})} />
                <Stepper label="Profundidade" value={config.profundidade} onChange={v => setConfig({...config, profundidade: v})} />
              </div>
              
              <div className="pt-4 border-t border-border-subtle space-y-4">
                <Stepper label="Qtd. Portas" value={config.portas.quantidade} max={4} onChange={v => setConfig({...config, portas: {...config.portas, quantidade: v}})} />
                <Stepper label="Qtd. Gavetas" value={config.gavetas.quantidade} max={5} onChange={v => setConfig({...config, gavetas: {...config.gavetas, quantidade: v}})} />
              </div>
            </div>
          )}

          {activeTab === 'cores' && (
            <div className="space-y-6">
               <div>
                 <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Material Externo (Caixaria/Portas)</h3>
                 <div className="grid grid-cols-2 gap-2">
                    {MATERIAL_CATALOG.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => setConfig({...config, materialExterno: m.id, fitaBorda: m.id})}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${config.materialExterno === m.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border-strong hover:bg-bg-panel-hover'}`}
                      >
                         <div className="w-8 h-8 rounded-full border border-black/10 shrink-0" style={{backgroundColor: m.color}} />
                         <div className="min-w-0">
                           <div className="text-[10px] text-text-muted truncate">{m.brand}</div>
                           <div className="text-xs font-bold text-text-base truncate">{m.name}</div>
                         </div>
                      </button>
                    ))}
                 </div>
               </div>
               
               <div>
                 <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Material Interno</h3>
                 <div className="grid grid-cols-2 gap-2">
                    {MATERIAL_CATALOG.filter(m => m.texture === 'solid').map(m => (
                      <button 
                        key={m.id}
                        onClick={() => setConfig({...config, materialInterno: m.id})}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${config.materialInterno === m.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border-strong hover:bg-bg-panel-hover'}`}
                      >
                         <div className="w-8 h-8 rounded-full border border-black/10 shrink-0" style={{backgroundColor: m.color}} />
                         <div className="min-w-0">
                           <div className="text-xs font-bold text-text-base truncate">{m.name}</div>
                         </div>
                      </button>
                    ))}
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'ferragens' && (
            <div className="space-y-6">
              <Segmented
                label="Esquema de Montagem"
                value={config.ferragens?.montagem || 'minifix'}
                onChange={v => setConfig({...config, ferragens: {...config.ferragens!, montagem: v as any}})}
                options={[
                  { label: 'Minifix + Cavilha', value: 'minifix' },
                  { label: 'VB36', value: 'vb36' },
                  { label: 'Apenas Parafuso', value: 'parafuso' }
                ]}
              />
              <Segmented
                label="Tipo de Corrediça"
                value={config.gavetas.sistema || 'telescopica'}
                onChange={v => setConfig({...config, gavetas: {...config.gavetas, sistema: v as any}})}
                options={[
                  { label: 'Telescópica', value: 'telescopica' },
                  { label: 'Invisível', value: 'invisivel' }
                ]}
              />
              {config.portas.quantidade > 0 && (
                <Segmented
                  label="Tipo de Dobradiça"
                  value={config.ferragens?.dobradica || 'reta'}
                  onChange={v => setConfig({...config, ferragens: {...config.ferragens!, dobradica: v as any}})}
                  options={[
                    { label: 'Reta (Sobreposta)', value: 'reta' },
                    { label: 'Curva (Parcial)', value: 'curva' },
                    { label: 'Super Curva (Embutida)', value: 'super_curva' }
                  ]}
                />
              )}
            </div>
          )}

          {activeTab === 'pecas' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-xl text-xs">
                Selecione uma peça abaixo para aplicar fitas de borda manuais ou alterar recuos avançados.
              </div>
              <div className="space-y-2">
                {pieces.map((p, i) => {
                  const ov = config.pecasCustomizadas?.[p.name] || {}
                  return (
                    <CollapsibleSection key={i} title={p.name}>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-bold text-text-muted mb-2">Fitas de Borda (Personalizadas)</div>
                          <div className="grid grid-cols-4 gap-2">
                            {['top', 'bottom', 'left', 'right'].map(side => {
                              const hasTape = ov.fitas?.[side as keyof typeof ov.fitas] ?? p.edgeBanding[side as keyof typeof p.edgeBanding]
                              return (
                                <button
                                  key={side}
                                  onClick={() => {
                                    const newOv = { ...ov, fitas: { ...ov.fitas, [side]: !hasTape } }
                                    setConfig({...config, pecasCustomizadas: { ...config.pecasCustomizadas, [p.name]: newOv }})
                                  }}
                                  className={`py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${hasTape ? 'bg-wood-500 text-white border-wood-600' : 'bg-bg-panel-hover text-text-muted border-border-strong'}`}
                                >
                                  {side === 'top' ? 'Cima' : side === 'bottom' ? 'Baixo' : side === 'left' ? 'Esq' : 'Dir'}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        {p.name.includes('Fundo') && (
                          <Stepper 
                            label="Recuo do Fundo" 
                            value={ov.recuo ?? 15} 
                            onChange={v => setConfig({...config, pecasCustomizadas: { ...config.pecasCustomizadas, [p.name]: { ...ov, recuo: v } }})} 
                          />
                        )}
                      </div>
                    </CollapsibleSection>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle bg-bg-base shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-3.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} /> Salvar Módulo
          </button>
        </div>

      </div>
    </div>
  )
}
