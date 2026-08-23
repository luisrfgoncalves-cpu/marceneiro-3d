import { useMemo, useState } from 'react'
import { Scene } from '../three/Scene'
import { computeModule } from '../engine/computeModule'
import type { ModuloConfig } from '../engine/types'
import { Stepper, Segmented, CollapsibleSection, Toggle } from '../components/ui'
import { ArrowLeft, Save, Box, PaintRoller, Settings2, Scissors, Layers, DraftingCompass, X, FileDown } from 'lucide-react'
import { MATERIAL_CATALOG } from '../lib/materials'
import { Croqui2D } from '../components/Croqui2D'
import { buildDxf, moduleDxfRects, downloadDxf } from '../lib/dxf'

import type { EngineRules } from '../engine/rules'

interface ModuleAdjusterProps {
  initialConfig: ModuloConfig
  onSave: (config: ModuloConfig) => void
  onCancel: () => void
  onSaveAsTemplate?: (config: ModuloConfig) => void
  isNew?: boolean
  rules: EngineRules
}

type TabId = 'medidas' | 'cores' | 'ferragens' | 'estrutura' | 'pecas'

const TABS: Array<{ id: TabId; label: string; icon: typeof Box }> = [
  { id: 'medidas', label: 'Medidas', icon: Box },
  { id: 'cores', label: 'Cores', icon: PaintRoller },
  { id: 'ferragens', label: 'Ferragens', icon: Settings2 },
  { id: 'estrutura', label: 'Estrutura', icon: Layers },
  { id: 'pecas', label: 'Peças', icon: Scissors },
]

const PUXADOR_OPCOES = [
  { value: 'perfil_gola_anodizado', label: 'Perfil Gola' },
  { value: 'perfil_45_friso', label: 'Perfil 45° Friso' },
  { value: 'usinado_45', label: 'Usinado 45°' },
  { value: 'passante', label: 'Passante' },
  { value: 'alca_convencional', label: 'Alça' },
  { value: 'facetado_rometal', label: 'Rometal' },
  { value: 'tip_on', label: 'Tip-On' },
] as const

const SISTEMA_FUNDO_OPCOES = [
  { value: 'encaixado_recuado', label: 'Encaixado Recuado' },
  { value: 'rebaixo_parafusado', label: 'Rebaixo Paraf.' },
  { value: 'parafusado_tras', label: 'Parafusado Atrás' },
  { value: 'fundo_espesso', label: 'Espesso 18mm' },
  { value: 'sem_fundo', label: 'Sem Fundo' },
] as const

export function ModuleAdjuster({ initialConfig, onSave, onCancel, rules }: ModuleAdjusterProps) {
  const [config, setConfig] = useState<ModuloConfig>(() => ({
    ...initialConfig,
    ferragens: initialConfig.ferragens || { montagem: 'minifix', dobradica: 'reta', corredica: 'telescopica' },
    pecasCustomizadas: initialConfig.pecasCustomizadas || {},
    puxador: initialConfig.puxador || { tipo: 'perfil_gola_anodizado', cor: 'preto' },
    corredica: initialConfig.corredica || { medida: 45 },
  }))
  const [activeTab, setActiveTab] = useState<TabId>('medidas')
  const [showCroqui, setShowCroqui] = useState(false)

  const { pieces, hinges, pistons, warnings } = useMemo(() => computeModule(config, rules), [config])
  const croquiResult = useMemo(
    () => ({ pieces, hinges, pistons, warnings, dimensions: { width: config.largura, height: config.altura, depth: config.profundidade } }),
    [pieces, hinges, pistons, warnings, config.largura, config.altura, config.profundidade],
  )

  const patch = (p: Partial<ModuloConfig>) => setConfig((c) => ({ ...c, ...p }))
  const handleSave = () => onSave(config)
  const temTampo = config.moduloTipo === 'balcao' || config.moduloTipo === 'pia'

  const handleDxf = () => {
    downloadDxf(buildDxf(moduleDxfRects(croquiResult)), `${(config.nome || 'modulo').replace(/\s+/g, '-')}-croqui`)
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-bg-base text-text-base overflow-hidden">
      {/* Modal Croqui 2D */}
      {showCroqui && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCroqui(false)}>
          <div className="w-full max-w-2xl max-h-[88dvh] overflow-y-auto custom-scrollbar rounded-3xl bg-bg-panel border border-border-strong shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <DraftingCompass size={16} className="text-violet-500" />
              <h3 className="text-sm font-bold text-text-base">Croqui técnico — {config.nome || 'Módulo'}</h3>
              <button type="button" onClick={() => setShowCroqui(false)} className="ml-auto w-8 h-8 grid place-items-center rounded-lg text-text-muted hover:text-text-base hover:bg-bg-panel-hover transition-all">
                <X size={16} />
              </button>
            </div>
            <Croqui2D result={croquiResult} />
            <div className="flex items-center justify-between gap-2 mt-3">
              <span className="text-[10px] text-text-muted">Escala 1:1 em mm · camadas por peça</span>
              <button type="button" onClick={handleDxf} className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-2 transition-all active:scale-95">
                <FileDown size={14} /> Baixar DXF (CNC)
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Visualizador 3D em Tela Cheia (Background) */}
      <div className="flex-1 relative h-full">
        <Scene
          result={{ pieces, hinges, pistons, warnings, dimensions: { width: config.largura, height: config.altura, depth: config.profundidade } }}
          screenshotName={(config.nome || 'modulo').replace(/\s+/g, '-')}
        />

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
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-bold text-text-base truncate flex-1">{config.nome || 'Ajuste de Módulo'}</h2>
            <button
              type="button"
              onClick={() => setShowCroqui(true)}
              className="shrink-0 w-9 h-9 grid place-items-center rounded-xl border border-border-strong bg-bg-panel-hover text-text-muted hover:text-violet-500 hover:border-violet-500/50 transition-all active:scale-95"
              title="Croqui técnico 2D + DXF"
            >
              <DraftingCompass size={16} />
            </button>
          </div>

          <div className="flex gap-1 p-1 bg-bg-panel-hover rounded-xl border border-border-strong overflow-x-auto custom-scrollbar">
             {TABS.map(t => {
               const Icon = t.icon
               return (
                 <button
                   key={t.id}
                   onClick={() => setActiveTab(t.id)}
                   className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${activeTab === t.id ? 'bg-bg-panel shadow-sm text-primary' : 'text-text-muted hover:text-text-base'}`}
                 >
                   <Icon size={18} className="mb-1" />
                   <span className="text-[10px] font-bold whitespace-nowrap">{t.label}</span>
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
                <label className="block">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Nome do Módulo</span>
                  <input
                    type="text"
                    value={config.nome ?? ''}
                    onChange={(e) => patch({ nome: e.target.value })}
                    placeholder="Ex.: Balcão esquerdo"
                    className="w-full bg-bg-panel-hover border border-border-strong rounded-xl px-3 py-2.5 text-sm font-semibold text-text-base placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                </label>
                <Stepper label="Largura" value={config.largura} min={100} max={4000} onChange={v => patch({ largura: v })} />
                <Stepper label="Altura" value={config.altura} min={200} max={3000} onChange={v => patch({ altura: v })} />
                <Stepper label="Profundidade" value={config.profundidade} min={80} max={1200} onChange={v => patch({ profundidade: v })} />
                <Stepper label="Espessura da Caixa" value={config.espessuraCaixa} min={15} max={25} step={3} onChange={v => patch({ espessuraCaixa: v })} />
              </div>

              <div className="pt-4 border-t border-border-subtle space-y-4">
                <Stepper label="Qtd. Portas" value={config.portas.quantidade} max={4} onChange={v => patch({ portas: { ...config.portas, quantidade: v } })} />
                <Stepper label="Qtd. Gavetas" value={config.gavetas.quantidade} max={5} onChange={v => patch({ gavetas: { ...config.gavetas, quantidade: v } })} />
                <Stepper label="Prateleiras" value={config.prateleiras.quantidade} max={8} onChange={v => patch({ prateleiras: { ...config.prateleiras, quantidade: v } })} />
              </div>
            </div>
          )}

          {activeTab === 'cores' && (
            <div className="space-y-6">
               <MaterialPicker
                 title="Material Externo (Caixaria/Portas)"
                 selected={config.materialExterno}
                 onSelect={(id) => patch({ materialExterno: id, fitaBorda: id })}
               />

               <MaterialPicker
                 title="Material Interno"
                 onlySolid
                 selected={config.materialInterno}
                 onSelect={(id) => patch({ materialInterno: id })}
               />

               <CollapsibleSection title="Fita de borda por peça (avançado)" defaultOpen={false}>
                 {(['porta', 'prateleira', 'montante', 'fundo', 'topo'] as const).map(role => (
                   <div key={role}>
                     <div className="text-xs font-bold text-text-muted capitalize mb-1.5">{role}</div>
                     <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                       <button
                         onClick={() => patch({ fitas: { ...config.fitas, [role]: undefined } })}
                         className={`shrink-0 w-8 h-8 rounded-lg border text-[9px] font-bold grid place-items-center ${!config.fitas?.[role] ? 'border-primary text-primary' : 'border-border-strong text-text-muted'}`}
                         title="Seguir padrão externo"
                       >auto</button>
                       {MATERIAL_CATALOG.map(m => (
                         <button
                           key={m.id}
                           onClick={() => patch({ fitas: { ...config.fitas, [role]: m.id } })}
                           className={`shrink-0 w-8 h-8 rounded-full border-2 ${config.fitas?.[role] === m.id ? 'border-primary ring-2 ring-primary/30' : 'border-black/10'}`}
                           style={{ backgroundColor: m.color }}
                           title={`${m.brand} ${m.name}`}
                         />
                       ))}
                     </div>
                   </div>
                 ))}
               </CollapsibleSection>
            </div>
          )}

          {activeTab === 'ferragens' && (
            <div className="space-y-6">
              <Segmented
                label="Esquema de Montagem"
                value={config.ferragens?.montagem || 'minifix'}
                onChange={v => patch({ ferragens: { ...config.ferragens!, montagem: v as any } })}
                options={[
                  { label: 'Minifix + Cavilha', value: 'minifix' },
                  { label: 'VB36', value: 'vb36' },
                  { label: 'Apenas Parafuso', value: 'parafuso' }
                ]}
              />

              <Segmented
                label="Tipo de Corrediça"
                value={config.gavetas.sistema || 'telescopica'}
                onChange={v => patch({ gavetas: { ...config.gavetas, sistema: v as any } })}
                options={[
                  { label: 'Telescópica', value: 'telescopica' },
                  { label: 'Invisível (Slow)', value: 'invisivel' }
                ]}
              />

              {config.gavetas.quantidade > 0 && (
                <>
                  <Stepper
                    label="Medida da Corrediça"
                    unit="cm"
                    step={5}
                    min={30}
                    max={60}
                    value={config.corredica?.medida ?? 45}
                    onChange={v => patch({ corredica: { medida: v } })}
                  />
                  <Segmented
                    label="Espessura da Caixa da Gaveta"
                    value={config.gavetas.espessura === 18 ? 18 : 15}
                    onChange={v => patch({ gavetas: { ...config.gavetas, espessura: v as any } })}
                    options={[
                      { label: '15mm', value: 15 },
                      { label: '18mm', value: 18 }
                    ]}
                  />
                </>
              )}

              {config.portas.quantidade > 0 && (
                <>
                  <Segmented
                    label="Tipo de Dobradiça"
                    value={config.ferragens?.dobradica || 'reta'}
                    onChange={v => patch({ ferragens: { ...config.ferragens!, dobradica: v as any } })}
                    options={[
                      { label: 'Reta (Sobreposta)', value: 'reta' },
                      { label: 'Curva (Parcial)', value: 'curva' },
                      { label: 'Super Curva', value: 'super_curva' }
                    ]}
                  />
                  <Stepper
                    label="Dobradiças por Porta"
                    value={config.portas.dobradicasPorPorta}
                    min={2}
                    max={5}
                    step={1}
                    onChange={v => patch({ portas: { ...config.portas, dobradicasPorPorta: v } })}
                  />
                  <Segmented
                    label="Tipo de Porta"
                    value={config.portas.tipo}
                    onChange={v => patch({ portas: { ...config.portas, tipo: v as any } })}
                    options={[
                      { label: 'Solteira', value: 'solteira' },
                      { label: 'Casal', value: 'casal' },
                      { label: 'Basculante', value: 'basculante' }
                    ]}
                  />
                  {config.portas.tipo === 'basculante' && (
                    <>
                      <Segmented
                        label="Abre Para"
                        value={config.portas.abrePara ?? 'cima'}
                        onChange={v => patch({ portas: { ...config.portas, abrePara: v as any } })}
                        options={[
                          { label: '↑ Cima', value: 'cima' },
                          { label: '↓ Baixo', value: 'baixo' }
                        ]}
                      />
                      <Toggle
                        label="Pistões a gás"
                        checked={config.portas.pistao ?? false}
                        onChange={v => patch({ portas: { ...config.portas, pistao: v } })}
                      />
                      <Stepper
                        label="Espessura da Porta"
                        value={config.portas.espessura}
                        min={15}
                        max={25}
                        step={3}
                        onChange={v => patch({ portas: { ...config.portas, espessura: v } })}
                      />
                    </>
                  )}
                </>
              )}

              <CollapsibleSection title="Puxadores" defaultOpen>
                <Segmented
                  label="Tipo"
                  value={config.puxador?.tipo ?? 'perfil_gola_anodizado'}
                  onChange={v => patch({ puxador: { ...(config.puxador ?? { cor: 'preto' as const }), tipo: v as any } })}
                  options={PUXADOR_OPCOES.map(o => ({ value: o.value, label: o.label }))}
                />
                <Segmented
                  label="Cor do Puxador"
                  value={config.puxador?.cor ?? 'preto'}
                  onChange={v => patch({ puxador: { ...(config.puxador ?? { tipo: 'perfil_gola_anodizado' as const }), cor: v as any } })}
                  options={[
                    { label: 'Preto', value: 'preto' },
                    { label: 'Prata', value: 'prata' },
                    { label: 'Bronze', value: 'bronze' }
                  ]}
                />
              </CollapsibleSection>
            </div>
          )}

          {activeTab === 'estrutura' && (
            <div className="space-y-4">
              <Segmented
                label="Sistema de Fundo"
                value={config.sistemaFundo}
                onChange={v => patch({ sistemaFundo: v as any })}
                options={SISTEMA_FUNDO_OPCOES.map(o => ({ value: o.value, label: o.label }))}
              />

              <CollapsibleSection title="Rodapé" defaultOpen={config.rodape.ativo}>
                <Toggle label="Rodapé ativo" checked={config.rodape.ativo} onChange={v => patch({ rodape: { ...config.rodape, ativo: v } })} />
                {config.rodape.ativo && (
                  <>
                    <Stepper label="Altura" value={config.rodape.altura} min={40} max={200} step={10} onChange={v => patch({ rodape: { ...config.rodape, altura: v } })} />
                    <Stepper label="Recuo frontal" value={config.rodape.recuo} min={0} max={150} step={5} onChange={v => patch({ rodape: { ...config.rodape, recuo: v } })} />
                    <Segmented
                      label="Material"
                      value={config.rodape.material}
                      onChange={v => patch({ rodape: { ...config.rodape, material: v as any } })}
                      options={[
                        { label: 'MDF', value: 'mdf' },
                        { label: 'Pedra', value: 'pedra' }
                      ]}
                    />
                  </>
                )}
              </CollapsibleSection>

              {temTampo && (
                <CollapsibleSection title="Tampo e Pingadeiras" defaultOpen={config.tampo.espessura > 0}>
                  <Stepper label="Espessura do Tampo" value={config.tampo.espessura} min={0} max={60} step={3} onChange={v => patch({ tampo: { ...config.tampo, espessura: v } })} />
                  {config.tampo.espessura > 0 && (
                    <>
                      <Stepper label="Pingadeira frente" value={config.tampo.pingadeiraFrente} min={0} max={100} step={5} onChange={v => patch({ tampo: { ...config.tampo, pingadeiraFrente: v } })} />
                      <Stepper label="Pingadeira lados" value={config.tampo.pingadeiraLados} min={0} max={100} step={5} onChange={v => patch({ tampo: { ...config.tampo, pingadeiraLados: v } })} />
                      <Segmented
                        label="Material do Tampo"
                        value={config.tampo.material ?? 'mdf'}
                        onChange={v => patch({ tampo: { ...config.tampo, material: v as any } })}
                        options={[
                          { label: 'MDF', value: 'mdf' },
                          { label: 'Pedra', value: 'pedra' }
                        ]}
                      />
                    </>
                  )}
                </CollapsibleSection>
              )}

              <CollapsibleSection title="Prateleiras e Sapateiras" defaultOpen={false}>
                <Stepper label="Prateleiras" value={config.prateleiras.quantidade} min={0} max={8} onChange={v => patch({ prateleiras: { ...config.prateleiras, quantidade: v } })} />
                <Stepper label="Espessura prateleira" value={config.prateleiras.espessura} min={15} max={25} step={3} onChange={v => patch({ prateleiras: { ...config.prateleiras, espessura: v } })} />
                <Stepper label="Sapateiras" value={config.sapateiras.quantidade} min={0} max={6} onChange={v => patch({ sapateiras: { ...config.sapateiras, quantidade: v } })} />
              </CollapsibleSection>

              <CollapsibleSection title="Montante central" defaultOpen={config.montantes.ativo}>
                <Toggle label="Montante ativo" checked={config.montantes.ativo} onChange={v => patch({ montantes: { ...config.montantes, ativo: v } })} />
                {config.montantes.ativo && (
                  <>
                    <Toggle label="Deitado (horizontal)" checked={config.montantes.deitado} onChange={v => patch({ montantes: { ...config.montantes, deitado: v } })} />
                    <Stepper label="Largura" value={config.montantes.largura} min={20} max={360} step={10} onChange={v => patch({ montantes: { ...config.montantes, largura: v } })} />
                    <Stepper label="Espessura" value={config.montantes.espessura} min={15} max={25} step={3} onChange={v => patch({ montantes: { ...config.montantes, espessura: v } })} />
                  </>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Taponamento lateral" defaultOpen={false}>
                {(['esquerda', 'direita'] as const).map(lado => (
                  <div key={lado} className="space-y-3 rounded-xl border border-border-subtle p-3">
                    <Toggle
                      label={`Taponar ${lado}`}
                      checked={config.taponamento[lado].ativo}
                      onChange={v => patch({ taponamento: { ...config.taponamento, [lado]: { ...config.taponamento[lado], ativo: v } } })}
                    />
                    {config.taponamento[lado].ativo && (
                      <>
                        <Stepper
                          label="Avanço frontal"
                          value={config.taponamento[lado].avancao}
                          min={0}
                          max={100}
                          step={5}
                          onChange={v => patch({ taponamento: { ...config.taponamento, [lado]: { ...config.taponamento[lado], avancao: v } } })}
                        />
                        <Segmented
                          label="Espessura"
                          value={config.taponamento[lado].espessura === 15 ? 15 : 18}
                          onChange={v => patch({ taponamento: { ...config.taponamento, [lado]: { ...config.taponamento[lado], espessura: v as any } } })}
                          options={[
                            { label: '15mm', value: 15 },
                            { label: '18mm', value: 18 }
                          ]}
                        />
                      </>
                    )}
                  </div>
                ))}
              </CollapsibleSection>

              <CollapsibleSection title="Orelhinha" defaultOpen={config.orelhinha.ativo}>
                <Toggle label="Orelhinha ativa" checked={config.orelhinha.ativo} onChange={v => patch({ orelhinha: { ...config.orelhinha, ativo: v } })} />
                {config.orelhinha.ativo && (
                  <Stepper label="Largura" value={config.orelhinha.largura} min={20} max={200} step={10} onChange={v => patch({ orelhinha: { ...config.orelhinha, largura: v } })} />
                )}
              </CollapsibleSection>

              <Segmented
                label="Sentido do Veio"
                value={config.veioGlobal ?? ('auto' as any)}
                onChange={v => patch({ veioGlobal: v === 'auto' ? undefined : (v as any) })}
                options={[
                  { label: 'Auto', value: 'auto' as any },
                  { label: 'Vertical', value: 'vertical' },
                  { label: 'Horizontal', value: 'horizontal' }
                ]}
              />
            </div>
          )}

          {activeTab === 'pecas' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-xl text-xs">
                Toque numa peça para trocar material, espessura, recuo do fundo ou fitas de borda individuais.
              </div>
              <div className="space-y-2">
                {pieces.map((p, i) => {
                  const ov = config.pecasCustomizadas?.[p.name] || {}
                  const thicknessAtual = Math.min(p.w, p.h, p.d)
                  return (
                    <CollapsibleSection key={i} title={p.name}>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-bold text-text-muted mb-2">Material</div>
                          <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                            <button
                              onClick={() => {
                                const next = { ...ov }
                                delete next.material
                                setConfig({ ...config, pecasCustomizadas: { ...config.pecasCustomizadas, [p.name]: next } })
                              }}
                              className={`shrink-0 px-2 h-8 rounded-lg border text-[9px] font-bold grid place-items-center ${!ov.material ? 'border-primary text-primary' : 'border-border-strong text-text-muted'}`}
                            >
                              padrão
                            </button>
                            {MATERIAL_CATALOG.map(m => (
                              <button
                                key={m.id}
                                onClick={() => setConfig({ ...config, pecasCustomizadas: { ...config.pecasCustomizadas, [p.name]: { ...ov, material: m.id } } })}
                                className={`shrink-0 w-8 h-8 rounded-full border-2 ${ov.material === m.id ? 'border-primary ring-2 ring-primary/30' : 'border-black/10'}`}
                                style={{ backgroundColor: m.color }}
                                title={`${m.brand} ${m.name}`}
                              />
                            ))}
                          </div>
                        </div>

                        <Stepper
                          label="Espessura"
                          value={ov.espessura ?? thicknessAtual}
                          min={6}
                          max={36}
                          step={3}
                          onChange={v => setConfig({ ...config, pecasCustomizadas: { ...config.pecasCustomizadas, [p.name]: { ...ov, espessura: v } } })}
                        />

                        {/^Fundo\b/i.test(p.name) && (
                          <Stepper
                            label="Recuo do Fundo"
                            value={ov.recuo ?? p.position.z}
                            min={0}
                            max={100}
                            step={5}
                            onChange={v => setConfig({ ...config, pecasCustomizadas: { ...config.pecasCustomizadas, [p.name]: { ...ov, recuo: v } } })}
                          />
                        )}

                        <div>
                          <div className="text-xs font-bold text-text-muted mb-2">Fitas de Borda</div>
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

interface MaterialPickerProps {
  title: string
  selected: string
  onSelect: (id: string) => void
  onlySolid?: boolean
}

function MaterialPicker({ title, selected, onSelect, onlySolid }: MaterialPickerProps) {
  const list = onlySolid ? MATERIAL_CATALOG.filter(m => m.texture === 'solid') : MATERIAL_CATALOG
  return (
    <div>
      <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {list.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${selected === m.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border-strong hover:bg-bg-panel-hover'}`}
          >
            <div className="w-8 h-8 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: m.color }} />
            <div className="min-w-0">
              <div className="text-[10px] text-text-muted truncate">{m.brand}</div>
              <div className="text-xs font-bold text-text-base truncate">{m.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
