// Tela de ajuste de módulo (Seção 11.3/11.5): preview 3D ao vivo + painel
// Básico (o que o cliente entende) e bloco Avançado colapsado.

import { useMemo } from 'react'
import { ArrowLeft, Check, TriangleAlert } from 'lucide-react'
import type { EngineRules } from '../engine/rules'
import { computeModule } from '../engine/computeModule'
import { estimateCost, type PriceCatalog } from '../engine/cost'
import type { Ambiente, ModuloConfig, PuxadorCor, PuxadorTipo, SistemaFundo, SistemaGaveta, TipoPorta } from '../engine/types'
import { Scene } from '../three/Scene'
import { COLOR_SWATCHES } from '../three/colors'
import { BudgetPanel } from '../components/Budget'
import { CollapsibleSection, Segmented, Stepper, Toggle } from '../components/ui'
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
  { value: 'perfil_gola_anodizado', label: 'Perfil gola anodizado' },
  { value: 'perfil_45_friso', label: 'Perfil 45° com friso' },
  { value: 'usinado_45', label: 'Usinado 45°' },
  { value: 'passante', label: 'Passante no MDF' },
  { value: 'alca_convencional', label: 'Alça convencional' },
  { value: 'facetado_rometal', label: 'Facetado (Rometal)' },
  { value: 'tip_on', label: 'Toque (tip-on) — sem puxador' },
]

const PUXADOR_CORES: Array<{ value: PuxadorCor; label: string }> = [
  { value: 'prata', label: 'Prata anodizado' },
  { value: 'preto', label: 'Preto' },
  { value: 'bronze', label: 'Bronze' },
]

const CORREDICAS = [30, 35, 40, 45, 50, 55, 60]

const FITAS: Array<{ value: string; label: string }> = [
  { value: 'fita_proadec_22mm_maderado_x', label: '22mm Maderado X' },
  { value: 'fita_proadec_22mm_branco_tx', label: '22mm Branco TX' },
  { value: 'fita_proadec_35mm_maderado_x', label: '35mm Maderado X' },
  { value: 'fita_proadec_35mm_branco_tx', label: '35mm Branco TX' },
  { value: 'fita_proadec_64mm_maderado_x', label: '64mm Maderado X' },
]

export function ModuleAdjuster({ config, onChange, rules, onBack, onConfirm, confirmLabel = 'Confirmar', catalog }: ModuleAdjusterProps) {
  const [unit, setUnit] = useUnitPref()
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

  return (
    <div className="h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 grid place-items-center rounded-xl bg-steel-800/60 text-steel-200 active:bg-steel-700"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-steel-50 truncate">{config.nome}</h1>
          <p className="text-xs text-steel-400 font-mono">
            {fmtLength(config.largura, unit)}×{fmtLength(config.altura, unit)}×{fmtLength(config.profundidade, unit)}
          </p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-steel-700/60">
          {(['mm', 'cm'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                unit === u ? 'bg-wood-500 text-white' : 'bg-steel-800/60 text-steel-400'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </header>

      {/* 3D ao vivo */}
      <div className="flex-1 min-h-0 relative">
        <Scene result={result} />
        {result.warnings.length > 0 && (
          <div className="absolute top-2 left-2 right-2 space-y-1">
            {result.warnings.map((w, i) => (
              <div
                key={i}
                className="glass-panel flex items-start gap-2 rounded-lg px-3 py-2 text-xs text-amber-300"
              >
                <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                <span>{w.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Painel de ajuste */}
      <div className="max-h-[45%] overflow-y-auto border-t border-steel-700/60 bg-steel-900/90 backdrop-blur px-4 py-4 space-y-4">
        {/* Básico (Seção 11.3) */}
        <div className="grid grid-cols-2 gap-3">
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
          <Stepper label="Portas" value={config.portas.quantidade} onChange={(v) => patchPortas({ quantidade: v })} min={0} max={8} step={1} unit="un" />
          <Stepper label="Gavetas" value={config.gavetas.quantidade} onChange={(v) => patchGavetas({ quantidade: v })} min={0} max={8} step={1} unit="un" />
          <Segmented label="Ambiente" value={config.ambiente} options={AMBIENTES} onChange={(v) => patch({ ambiente: v })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ColorPicker
            label="Cor externa"
            value={config.materialExterno}
            onChange={(id) => patch({ materialExterno: id })}
          />
          <ColorPicker
            label="Cor interna"
            value={config.materialInterno}
            onChange={(id) => patch({ materialInterno: id })}
          />
        </div>

        {/* Avançado (renderiza apenas quando expandido — Seção 11.3) */}
        <CollapsibleSection title="Avançado" defaultOpen={false}>
          <Segmented label="Tipo de porta" value={config.portas.tipo} options={TIPOS_PORTA} onChange={(v) => patchPortas({ tipo: v })} />
          {isBasculante ? (
            <>
              <Segmented label="Abertura" value={config.portas.abrePara ?? 'cima'} options={ABRE_PARA} onChange={(v) => patchPortas({ abrePara: v })} />
              <Toggle label="Pistão a gás" checked={config.portas.pistao ?? false} onChange={(v) => patchPortas({ pistao: v })} />
            </>
          ) : (
            <Stepper label="Dobradiças por porta" value={config.portas.dobradicasPorPorta} onChange={(v) => patchPortas({ dobradicasPorPorta: v })} min={2} max={6} step={1} unit="un" />
          )}
          <Segmented label="Corrediça das gavetas" value={config.gavetas.sistema} options={SISTEMAS_GAVETA} onChange={(v) => patchGavetas({ sistema: v })} />
          <Segmented
            label="Corrediça — medida"
            value={String(corredica)}
            options={CORREDICAS.map((c) => ({ value: String(c), label: `${c}cm` }))}
            onChange={(v) => patch({ corredica: { medida: Number(v) } })}
          />
          <Segmented label="Puxador" value={puxador.tipo} options={PUXADORES} onChange={(v) => patch({ puxador: { ...puxador, tipo: v } })} />
          {puxador.tipo !== 'tip_on' && (
            <Segmented label="Cor do puxador" value={puxador.cor} options={PUXADOR_CORES} onChange={(v) => patch({ puxador: { ...puxador, cor: v } })} />
          )}
          <Segmented label="Sistema de fundo" value={config.sistemaFundo} options={SISTEMAS_FUNDO} onChange={(v) => patch({ sistemaFundo: v })} />
          <Segmented label="Rodapé" value={config.rodape.material} options={[{ value: 'mdf', label: 'MDF' }, { value: 'pedra', label: 'Pedra' }]} onChange={(v) => patchRodape({ material: v })} />
          <Toggle label="Rodapé ativo" checked={config.rodape.ativo} onChange={(v) => patchRodape({ ativo: v })} />
          <Stepper label="Altura do rodapé" value={toDisplay(config.rodape.altura, unit)} onChange={(v) => patchRodape({ altura: fromDisplay(v, unit) })} step={unit === 'cm' ? 1 : 10} unit={unit} decimals={unit === 'cm' ? 1 : 0} />
          <Stepper label="Recuo do rodapé" value={toDisplay(config.rodape.recuo, unit)} onChange={(v) => patchRodape({ recuo: fromDisplay(v, unit) })} step={unit === 'cm' ? 0.5 : 5} unit={unit} decimals={unit === 'cm' ? 1 : 0} />
          <Stepper label="Espessura do tampo" value={config.tampo.espessura} onChange={(v) => patchTampo({ espessura: v })} min={15} max={36} step={1} />
          <Stepper label="Pingadeira frente (tampo)" value={toDisplay(config.tampo.pingadeiraFrente, unit)} onChange={(v) => patchTampo({ pingadeiraFrente: fromDisplay(v, unit) })} step={unit === 'cm' ? 0.5 : 5} unit={unit} decimals={unit === 'cm' ? 1 : 0} />
          <Stepper label="Pingadeira lados (tampo)" value={toDisplay(config.tampo.pingadeiraLados, unit)} onChange={(v) => patchTampo({ pingadeiraLados: fromDisplay(v, unit) })} step={unit === 'cm' ? 0.5 : 5} unit={unit} decimals={unit === 'cm' ? 1 : 0} />
          <Toggle label="Taponamento esquerdo" checked={config.taponamento.esquerda.ativo} onChange={(v) => patchTapon('esquerda', { ativo: v })} />
          <Stepper label="Avanço frontal (esq.)" value={toDisplay(config.taponamento.esquerda.avancao, unit)} onChange={(v) => patchTapon('esquerda', { avancao: fromDisplay(v, unit) })} step={unit === 'cm' ? 0.5 : 5} unit={unit} decimals={unit === 'cm' ? 1 : 0} />
          <Toggle label="Taponamento direito" checked={config.taponamento.direita.ativo} onChange={(v) => patchTapon('direita', { ativo: v })} />
          <Stepper label="Avanço frontal (dir.)" value={toDisplay(config.taponamento.direita.avancao, unit)} onChange={(v) => patchTapon('direita', { avancao: fromDisplay(v, unit) })} step={unit === 'cm' ? 0.5 : 5} unit={unit} decimals={unit === 'cm' ? 1 : 0} />
          <Toggle label="Orelhinha lateral" checked={config.orelhinha.ativo} onChange={(v) => patch({ orelhinha: { ...config.orelhinha, ativo: v } })} />
          <Stepper label="Largura da orelhinha" value={toDisplay(config.orelhinha.largura, unit)} onChange={(v) => patch({ orelhinha: { ...config.orelhinha, largura: fromDisplay(v, unit) } })} step={unit === 'cm' ? 0.5 : 5} unit={unit} decimals={unit === 'cm' ? 1 : 0} />
          <Segmented
            label="Fita da porta"
            value={fitas.porta ?? config.fitaBorda}
            options={FITAS}
            onChange={(v) => patch({ fitas: { ...fitas, porta: v } })}
          />
          <Segmented
            label="Fita da prateleira"
            value={fitas.prateleira ?? config.fitaBorda}
            options={FITAS}
            onChange={(v) => patch({ fitas: { ...fitas, prateleira: v } })}
          />
          <Segmented
            label="Fita do tampo/chapéu"
            value={fitas.topo ?? config.fitaBorda}
            options={FITAS}
            onChange={(v) => patch({ fitas: { ...fitas, topo: v } })}
          />
        </CollapsibleSection>

        <p className="text-xs text-steel-500">
          {result.pieces.length} peças · {result.hinges.length} dobradiças
          {result.pistons.length > 0 ? ` · ${result.pistons.length} pistão(ões)` : ''}
        </p>

        {budget && <BudgetPanel budget={budget} collapsed />}

        {onConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-wood-500 text-white font-semibold py-3 active:bg-wood-600 transition-colors"
          >
            <Check size={18} />
            {confirmLabel}
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
      <div className="text-sm text-steel-300 mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">
        {COLOR_SWATCHES.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.label}
            onClick={() => onChange(s.id)}
            className={`w-9 h-9 rounded-full border-2 transition-transform active:scale-90 ${
              value === s.id ? 'border-wood-400 scale-105' : 'border-steel-600'
            }`}
            style={{ background: s.color }}
            aria-label={s.label}
          />
        ))}
      </div>
    </div>
  )
}