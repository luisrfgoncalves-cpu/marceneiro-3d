// Tela de Configurações do Perfil do Marceneiro
// Permite criar, editar e salvar múltiplos perfis com regras técnicas,
// materiais, ferragens e sistemas de montagem.

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Star, ChevronDown, ChevronRight, Check } from 'lucide-react'
import type { MarceneiroProfile } from '../engine/profiles'
import {
  loadProfiles, saveProfile, deleteProfile, DEFAULT_PROFILE
} from '../engine/profiles'
import { RULE_DEFAULTS } from '../engine/rules'
import { MATERIAL_CATALOG } from '../lib/materials'

interface SettingsProps {
  onBack: () => void
}

function uid() { return Math.random().toString(36).slice(2) }

// Agrupa as regras por categoria para exibir organizado
const RULE_GROUPS = [
  {
    label: 'Fundo',
    icon: '📦',
    keys: ['fundo.rebaixoProfundidade', 'fundo.rebaixoEspaco', 'fundo.espessuraEspesso'],
  },
  {
    label: 'Gavetas',
    icon: '🗄️',
    keys: ['gaveta.alturaPadrao', 'gaveta.frenteAltura', 'gaveta.frenteGap', 'gaveta.espessuraLateral', 'gaveta.recuoTrilho'],
  },
  {
    label: 'Portas & Vãos',
    icon: '🚪',
    keys: ['vao.frenteVertical', 'vao.casalVertical', 'vao.horizontal', 'porta.gapLateral', 'porta.gapTampo'],
  },
  {
    label: 'Dobradiças',
    icon: '🔧',
    keys: ['dobradica.pontaDistancia', 'dobradica.copoDistanciaBorda', 'dobradica.copoDiametro'],
  },
  {
    label: 'Prateleiras & Chapa',
    icon: '📐',
    keys: ['prateleira.folga', 'chapa.larguraMax', 'chapa.alturaMax'],
  },
  {
    label: 'Tampo & Rodapé',
    icon: '🏠',
    keys: ['tampo.espessuraPadrao', 'rodape.alturaPadrao', 'rodape.espessuraPadrao'],
  },
]

function CollapsibleGroup({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border-strong rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-panel hover:bg-bg-panel-hover transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold text-text-base">
          <span>{icon}</span> {label}
        </span>
        {open ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
      </button>
      {open && <div className="p-4 space-y-3 bg-bg-base border-t border-border-strong">{children}</div>}
    </div>
  )
}

function RuleInput({ ruleKey, value, onChange }: { ruleKey: string; value: number; onChange: (v: number) => void }) {
  const def = RULE_DEFAULTS.find(r => r.key === ruleKey)
  if (!def) return null
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-base truncate">{def.descricao}</div>
        <div className="text-xs text-text-muted">Padrão: {def.valor_padrao} {def.unidade}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-20 text-center bg-bg-panel border border-border-strong rounded-lg px-2 py-1.5 text-sm font-mono text-text-base focus:outline-none focus:border-primary"
        />
        <span className="text-xs text-text-muted w-6">{def.unidade}</span>
      </div>
    </div>
  )
}

export function Settings({ onBack }: SettingsProps) {
  const [profiles, setProfiles] = useState<MarceneiroProfile[]>([])
  const [selected, setSelected] = useState<MarceneiroProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'regras' | 'materiais' | 'ferragens'>('regras')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const all = loadProfiles()
    if (all.length === 0) {
      saveProfile(DEFAULT_PROFILE)
      setProfiles([DEFAULT_PROFILE])
      setSelected(DEFAULT_PROFILE)
    } else {
      setProfiles(all)
      setSelected(all.find(p => p.isDefault) ?? all[0])
    }
  }, [])

  const handleSave = () => {
    if (!selected) return
    saveProfile(selected)
    setProfiles(loadProfiles())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleNew = () => {
    const novo: MarceneiroProfile = {
      ...DEFAULT_PROFILE,
      id: uid(),
      nome: 'Novo Perfil',
      isDefault: false,
      createdAt: new Date().toISOString(),
    }
    saveProfile(novo)
    const all = loadProfiles()
    setProfiles(all)
    setSelected(novo)
  }

  const handleDelete = (id: string) => {
    if (profiles.length <= 1) return
    deleteProfile(id)
    const all = loadProfiles()
    setProfiles(all)
    setSelected(all.find(p => p.isDefault) ?? all[0])
  }

  const handleSetDefault = (id: string) => {
    if (!selected) return
    const updated = { ...selected, id, isDefault: true }
    saveProfile(updated)
    const all = loadProfiles()
    setProfiles(all)
    setSelected(all.find(p => p.id === id) ?? all[0])
  }


  const updateMaterial = (field: keyof MarceneiroProfile['materiais'], val: string | number) => {
    if (!selected) return
    setSelected({ ...selected, materiais: { ...selected.materiais, [field]: val } })
  }

  const updateFerragem = (field: keyof MarceneiroProfile['ferragens'], val: string) => {
    if (!selected) return
    setSelected({ ...selected, ferragens: { ...selected.ferragens, [field]: val } })
  }

  if (!selected) return null

  return (
    <div className="h-[100dvh] flex flex-col bg-bg-base text-text-base overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-bg-panel">
        <button type="button" onClick={onBack} className="w-9 h-9 grid place-items-center rounded-full hover:bg-bg-panel-hover transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-lg flex-1">Configurações da Marcenaria</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de Perfis */}
        <div className="w-48 md:w-56 shrink-0 border-r border-border-subtle flex flex-col overflow-hidden bg-bg-panel">
          <div className="p-3 border-b border-border-subtle">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Meus Perfis</div>
            <button
              type="button"
              onClick={handleNew}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-semibold"
            >
              <Plus size={14} /> Novo Perfil
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {profiles.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center gap-2 ${selected.id === p.id ? 'bg-primary text-white shadow-sm' : 'hover:bg-bg-panel-hover text-text-base'}`}
              >
                {p.isDefault && <Star size={12} className="shrink-0 fill-current" />}
                <span className="text-sm font-medium truncate">{p.nome}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo do Perfil */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Nome e ações do perfil */}
          <div className="shrink-0 px-4 py-3 border-b border-border-subtle bg-bg-panel flex items-center gap-3">
            <input
              type="text"
              value={selected.nome}
              onChange={e => setSelected({ ...selected, nome: e.target.value })}
              className="flex-1 bg-bg-base border border-border-strong rounded-xl px-3 py-2 text-base font-bold text-text-base focus:outline-none focus:border-primary"
            />
            {!selected.isDefault && (
              <button type="button" onClick={() => handleSetDefault(selected.id)} className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors text-xs font-bold flex items-center gap-1">
                <Star size={12} /> Padrão
              </button>
            )}
            {selected.isDefault && (
              <span className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-bold flex items-center gap-1">
                <Star size={12} fill="currentColor" /> Ativo
              </span>
            )}
            {profiles.length > 1 && (
              <button type="button" onClick={() => handleDelete(selected.id)} className="w-9 h-9 grid place-items-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                <Trash2 size={15} />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="shrink-0 flex gap-1 p-2 border-b border-border-subtle">
            {[
              { id: 'regras', label: '📐 Regras de Corte' },
              { id: 'materiais', label: '🎨 Materiais' },
              { id: 'ferragens', label: '🔩 Ferragens' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${activeTab === t.id ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-base hover:bg-bg-panel-hover'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">

            {activeTab === 'regras' && (
              <>
                <p className="text-xs text-text-muted pb-2">Configure as folgas, vãos e espessuras que este perfil deve usar. Deixe o valor padrão caso não queira personalizar.</p>
                {RULE_GROUPS.map(group => (
                  <CollapsibleGroup key={group.label} label={group.label} icon={group.icon}>
                    {group.keys.map(key => {
                      const def = RULE_DEFAULTS.find(r => r.key === key)
                      if (!def || !def.editavel) return null
                      // Resolve current value: from profile overrides or default
                      const camelKey = key.replace('.', '').replace(/.(w)/, (_, c: string) => c.toUpperCase())
                      const currentVal = (selected.regras as any)[camelKey] ?? def.valor_padrao
                      return (
                        <RuleInput
                          key={key}
                          ruleKey={key}
                          value={currentVal}
                          onChange={(v) => {
                            const update: any = { ...selected.regras }
                            update[camelKey] = v
                            setSelected({ ...selected, regras: update })
                          }}
                        />
                      )
                    })}
                  </CollapsibleGroup>
                ))}
              </>
            )}

            {activeTab === 'materiais' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Espessuras Padrão</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-border-strong">
                      <div className="text-xs text-text-muted mb-1">Caixaria</div>
                      <select
                        value={selected.materiais.espessuraCaixaria}
                        onChange={e => updateMaterial('espessuraCaixaria', Number(e.target.value))}
                        className="w-full bg-bg-base border border-border-strong rounded-lg px-2 py-1.5 text-sm text-text-base focus:outline-none focus:border-primary"
                      >
                        <option value={15}>15mm</option>
                        <option value={18}>18mm</option>
                      </select>
                    </div>
                    <div className="p-3 rounded-xl border border-border-strong">
                      <div className="text-xs text-text-muted mb-1">Frentes / Portas</div>
                      <select
                        value={selected.materiais.espessuraFrente}
                        onChange={e => updateMaterial('espessuraFrente', Number(e.target.value))}
                        className="w-full bg-bg-base border border-border-strong rounded-lg px-2 py-1.5 text-sm text-text-base focus:outline-none focus:border-primary"
                      >
                        <option value={15}>15mm</option>
                        <option value={18}>18mm</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Material de Caixaria (Interno)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {MATERIAL_CATALOG.filter(m => m.texture === 'solid').map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateMaterial('caixaria', m.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${selected.materiais.caixaria === m.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border-strong hover:bg-bg-panel-hover'}`}
                      >
                        <div className="w-8 h-8 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: m.color }} />
                        <div className="min-w-0">
                          <div className="text-[10px] text-text-muted truncate">{m.brand}</div>
                          <div className="text-xs font-bold text-text-base truncate">{m.name}</div>
                        </div>
                        {selected.materiais.caixaria === m.id && <Check size={14} className="ml-auto text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Material de Frentes (Externo)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {MATERIAL_CATALOG.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { updateMaterial('frentes', m.id); updateMaterial('fitaBorda', m.id) }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${selected.materiais.frentes === m.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border-strong hover:bg-bg-panel-hover'}`}
                      >
                        <div className="w-8 h-8 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: m.color }} />
                        <div className="min-w-0">
                          <div className="text-[10px] text-text-muted truncate">{m.brand}</div>
                          <div className="text-xs font-bold text-text-base truncate">{m.name}</div>
                        </div>
                        {selected.materiais.frentes === m.id && <Check size={14} className="ml-auto text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Sistema de Fundo</div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: 'rebaixo_parafusado', label: 'Rebaixo Parafusado', desc: 'Fundo 6mm rebaixado na lateral, parafusado na traseira' },
                      { value: 'encaixado_recuado', label: 'Encaixado Recuado', desc: 'Encaixe no rasgo sem parafuso' },
                      { value: 'parafusado_tras', label: 'Parafusado na Traseira', desc: 'Fundo colado e parafusado na traseira das laterais' },
                      { value: 'fundo_espesso', label: 'Fundo Espesso', desc: 'Fundo 18mm à mostra, aplicado na traseira' },
                      { value: 'sem_fundo', label: 'Sem Fundo', desc: 'Módulo aberto na traseira (racks, painéis)' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelected({ ...selected, sistemaFundo: opt.value as any })}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected.sistemaFundo === opt.value ? 'border-primary bg-primary/5' : 'border-border-strong hover:bg-bg-panel-hover'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${selected.sistemaFundo === opt.value ? 'border-primary bg-primary' : 'border-border-strong'}`} />
                        <div>
                          <div className="text-sm font-bold text-text-base">{opt.label}</div>
                          <div className="text-xs text-text-muted">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ferragens' && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Esquema de Montagem</div>
                  <div className="space-y-2">
                    {[
                      { value: 'minifix', label: 'Minifix + Cavilha', desc: 'Padrão da indústria. Desmontável. Requere furação CNC.' },
                      { value: 'vb36', label: 'VB36 (Excêntrico)', desc: 'Montagem rápida sem marcação. Alta resistência.' },
                      { value: 'parafuso', label: 'Parafuso Direto', desc: 'Mais simples, sem CNC. Para bancadas e estruturas.' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateFerragem('montagem', opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected.ferragens.montagem === opt.value ? 'border-primary bg-primary/5' : 'border-border-strong hover:bg-bg-panel-hover'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${selected.ferragens.montagem === opt.value ? 'border-primary bg-primary' : 'border-border-strong'}`} />
                        <div>
                          <div className="text-sm font-bold text-text-base">{opt.label}</div>
                          <div className="text-xs text-text-muted">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Tipo de Corrediça (Gavetas)</div>
                  <div className="space-y-2">
                    {[
                      { value: 'telescopica', label: 'Telescópica', desc: 'TN, Hafele, FGV. Lateral visível. Padrão cozinha.' },
                      { value: 'invisivel', label: 'Invisível (Undermount)', desc: 'Blum Tandem, Grass. Totalmente oculta. Exige 15mm.' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateFerragem('corredica', opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected.ferragens.corredica === opt.value ? 'border-primary bg-primary/5' : 'border-border-strong hover:bg-bg-panel-hover'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${selected.ferragens.corredica === opt.value ? 'border-primary bg-primary' : 'border-border-strong'}`} />
                        <div>
                          <div className="text-sm font-bold text-text-base">{opt.label}</div>
                          <div className="text-xs text-text-muted">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Tipo de Dobradiça (Portas)</div>
                  <div className="space-y-2">
                    {[
                      { value: 'reta', label: 'Reta (Sobreposta)', desc: 'Porta passa sobre a lateral. Mais comum em cozinhas.' },
                      { value: 'curva', label: 'Curva (Semi-embutida)', desc: 'Meia sobra. Mistura porta sobreposta com embutida.' },
                      { value: 'super_curva', label: 'Super Curva (Embutida)', desc: 'Porta rente à lateral. Visual mais clean.' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateFerragem('dobradica', opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected.ferragens.dobradica === opt.value ? 'border-primary bg-primary/5' : 'border-border-strong hover:bg-bg-panel-hover'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${selected.ferragens.dobradica === opt.value ? 'border-primary bg-primary' : 'border-border-strong'}`} />
                        <div>
                          <div className="text-sm font-bold text-text-base">{opt.label}</div>
                          <div className="text-xs text-text-muted">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Tipo de Puxador</div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: 'perfil_gola_anodizado', label: 'Perfil Gola Anodizado', desc: 'Rometal. Integrado na frente, sem puxador saliente.' },
                      { value: 'perfil_45_friso', label: 'Perfil 45° com Friso', desc: 'Recorte chanfrado com friso metálico.' },
                      { value: 'usinado_45', label: 'Usinado 45°', desc: 'Recorte usinado na própria frente. Sem metal.' },
                      { value: 'passante', label: 'Puxador Passante', desc: 'Parafuso na frente. Alumínio, inox ou madeira.' },
                      { value: 'alca_convencional', label: 'Alça Convencional', desc: 'Puxador com castanho. TN, Hafele, FGV.' },
                      { value: 'tip_on', label: 'Tip-On (Touch)', desc: 'Sem puxador. Abre pressionando a frente.' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateFerragem('puxador', opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected.ferragens.puxador === opt.value ? 'border-primary bg-primary/5' : 'border-border-strong hover:bg-bg-panel-hover'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${selected.ferragens.puxador === opt.value ? 'border-primary bg-primary' : 'border-border-strong'}`} />
                        <div>
                          <div className="text-sm font-bold text-text-base">{opt.label}</div>
                          <div className="text-xs text-text-muted">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Save */}
          <div className="shrink-0 p-4 border-t border-border-subtle bg-bg-base">
            <button
              type="button"
              onClick={handleSave}
              className={`w-full rounded-xl py-3.5 text-sm font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${saved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-white shadow-primary/20 hover:brightness-110'}`}
            >
              {saved ? <><Check size={16} /> Salvo!</> : 'Salvar Perfil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
