// Tela de Orçamento — calcula custos, gera PDF e exporta lista de peças CSV
// Usa react-pdf/renderer localmente (sem servidor) para gerar PDF no celular.

import { useState, useMemo } from 'react'
import { pdf } from '@react-pdf/renderer'
import { FileText, Share2, ChevronLeft, Package } from 'lucide-react'
import type { EnvironmentProject } from '../engine/environment'
import { calcularCusto, downloadCSV } from '../lib/exportUtils'
import { BudgetDocument } from '../components/BudgetPDF'
import { getActiveProfile } from '../engine/profiles'

interface BudgetScreenProps {
  project: EnvironmentProject
  onBack: () => void
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function BudgetScreen({ project, onBack }: BudgetScreenProps) {
  const [precoPorM2, setPrecoPorM2] = useState(180)
  const [custoFerragens, setCustoFerragens] = useState(120)
  const [margemLucro, setMargemLucro] = useState(35)
  const [nomeEmpresa, setNomeEmpresa] = useState(() => {
    const p = getActiveProfile()
    return p?.nome ?? 'Marceneiro 3D'
  })
  const [gerandoPDF, setGerandoPDF] = useState(false)
  const [pdfReady, setPdfReady] = useState<string | null>(null)

  const custo = useMemo(
    () => calcularCusto(project, precoPorM2, custoFerragens, margemLucro),
    [project, precoPorM2, custoFerragens, margemLucro]
  )

  const gerarPDF = async () => {
    setGerandoPDF(true)
    try {
      const blob = await pdf(
        <BudgetDocument project={project} custo={custo} nomeEmpresa={nomeEmpresa} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      setPdfReady(url)
    } catch (e) {
      console.error('Erro ao gerar PDF:', e)
    } finally {
      setGerandoPDF(false)
    }
  }

  const compartilhar = async () => {
    if (!pdfReady) return
    try {
      const response = await fetch(pdfReady)
      const blob = await response.blob()
      const file = new File([blob], `orcamento_${(project.nome ?? 'projeto').replace(/\s+/g,'_')}.pdf`, { type: 'application/pdf' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Orçamento — ${project.nome}` })
      } else {
        // Fallback: download direto
        const a = document.createElement('a')
        a.href = pdfReady
        a.download = file.name
        a.click()
      }
    } catch { /* usuário cancelou */ }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <header className="mb-6">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-steel-400 hover:text-steel-200 mb-4">
          <ChevronLeft size={16} /> Voltar
        </button>
        <h1 className="text-2xl font-bold text-steel-50">💰 Orçamento</h1>
        <p className="text-sm text-steel-400 mt-1">{project.nome} · {project.modulos.length} módulos</p>
      </header>

      {/* Nome da empresa */}
      <div className="bg-bg-panel border border-border-strong rounded-2xl p-4 mb-4">
        <label className="text-xs font-bold text-steel-400 uppercase tracking-wider">Nome da sua marcenaria (aparece no PDF)</label>
        <input
          type="text"
          value={nomeEmpresa}
          onChange={e => setNomeEmpresa(e.target.value)}
          className="mt-2 w-full bg-steel-900 text-steel-100 rounded-xl px-4 py-3 text-sm border border-steel-700 focus:outline-none focus:border-wood-400"
          placeholder="Marcenaria Silva..."
        />
      </div>

      {/* Parâmetros de Custo */}
      <div className="bg-bg-panel border border-border-strong rounded-2xl p-4 mb-4">
        <div className="text-xs font-bold text-steel-400 uppercase tracking-wider mb-4">Parâmetros de Custo</div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-steel-200">Preço por m² de chapa (MDF/MDP)</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range" min="50" max="500" step="10"
                value={precoPorM2}
                onChange={e => setPrecoPorM2(Number(e.target.value))}
                className="flex-1 accent-wood-400"
              />
              <div className="w-24 text-right font-mono text-wood-400 font-bold text-sm">
                {fmt(precoPorM2)}/m²
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-steel-200">Custo de ferragens por módulo</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range" min="20" max="500" step="10"
                value={custoFerragens}
                onChange={e => setCustoFerragens(Number(e.target.value))}
                className="flex-1 accent-wood-400"
              />
              <div className="w-24 text-right font-mono text-wood-400 font-bold text-sm">
                {fmt(custoFerragens)}/mod
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-steel-200">Margem de lucro</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range" min="5" max="100" step="5"
                value={margemLucro}
                onChange={e => setMargemLucro(Number(e.target.value))}
                className="flex-1 accent-wood-400"
              />
              <div className="w-24 text-right font-mono text-wood-400 font-bold text-sm">
                {margemLucro}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo de Custo */}
      <div className="bg-gradient-to-b from-wood-900/40 to-wood-950/60 border border-wood-600/30 rounded-2xl p-5 mb-6">
        <div className="text-xs font-bold text-wood-400 uppercase tracking-wider mb-4">Resumo do Orçamento</div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-steel-400">MDF / Chapas ({custo.mdf_m2} m²)</span>
            <span className="text-steel-200 font-mono">{fmt(custo.custo_mdf)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-steel-400">Ferragens e acessórios</span>
            <span className="text-steel-200 font-mono">{fmt(custo.custo_ferragens)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-steel-400">Mão de obra (estimada)</span>
            <span className="text-steel-200 font-mono">{fmt(custo.custo_servicos)}</span>
          </div>
          <div className="border-t border-wood-600/30 pt-2 mt-2 flex justify-between">
            <span className="text-steel-400 text-sm">Subtotal</span>
            <span className="text-steel-200 font-mono text-sm">{fmt(custo.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-steel-400">Margem ({margemLucro}%)</span>
            <span className="text-wood-400 font-mono">+ {fmt(custo.margem)}</span>
          </div>
          <div className="border-t border-wood-500/50 pt-3 mt-2 flex justify-between items-baseline">
            <span className="text-steel-100 font-bold text-base">TOTAL DO ORÇAMENTO</span>
            <span className="text-wood-300 font-bold font-mono text-2xl">{fmt(custo.total)}</span>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="space-y-3">
        {/* Exportar CSV */}
        <button
          type="button"
          onClick={() => downloadCSV(project)}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-steel-700 bg-steel-800/40 text-steel-200 font-bold hover:bg-steel-700/40 active:scale-[0.98] transition-all"
        >
          <Package size={20} />
          Exportar Lista de Peças (CSV)
        </button>

        {/* Gerar PDF */}
        {!pdfReady ? (
          <button
            type="button"
            onClick={gerarPDF}
            disabled={gerandoPDF}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-wood-600 hover:bg-wood-500 text-white font-bold active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <FileText size={20} />
            {gerandoPDF ? 'Gerando PDF...' : 'Gerar PDF do Orçamento'}
          </button>
        ) : (
          <button
            type="button"
            onClick={compartilhar}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold active:scale-[0.98] transition-all"
          >
            <Share2 size={20} />
            Compartilhar / Baixar PDF
          </button>
        )}

        {pdfReady && (
          <button
            type="button"
            onClick={() => { setPdfReady(null) }}
            className="w-full text-center text-xs text-steel-500 hover:text-steel-300 py-2"
          >
            ↺ Recalcular e gerar novo PDF
          </button>
        )}
      </div>
    </div>
  )
}
