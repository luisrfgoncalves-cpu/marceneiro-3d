// Utilitários de exportação — converte a lista de peças do motor paramétrico
// para CSV (importar no app de corte) e calcula o custo do projeto.

import type { EnvironmentProject } from '../engine/environment'
import { DEFAULT_RULES } from '../engine/rules'
import { computeModule } from '../engine/computeModule'

export interface PecaExport {
  modulo: string
  nome: string
  largura: number  // mm
  altura: number   // mm
  quantidade: number
  material: string
  fitaBordaTop: boolean
  fitaBordaBottom: boolean
  fitaBordaLeft: boolean
  fitaBordaRight: boolean
}

export interface CustoDetalhado {
  mdf_m2: number
  custo_mdf: number
  custo_ferragens: number
  custo_servicos: number
  subtotal: number
  margem: number
  total: number
}

function mmToM2(w: number, h: number, qty: number): number {
  return (w / 1000) * (h / 1000) * qty
}

export function coletarPecas(project: EnvironmentProject): PecaExport[] {
  const resultado: PecaExport[] = []

  for (const inst of project.modulos) {
    try {
      const res = computeModule(inst.config, DEFAULT_RULES)
      for (const peca of res.pieces) {
        resultado.push({
          modulo: inst.config.nome ?? inst.config.moduloTipo,
          nome: peca.name,
          largura: Math.round(peca.w),
          altura: Math.round(peca.h),
          quantidade: 1,
          material: peca.materialId,
          fitaBordaTop: peca.edgeBanding?.top ?? false,
          fitaBordaBottom: peca.edgeBanding?.bottom ?? false,
          fitaBordaLeft: peca.edgeBanding?.left ?? false,
          fitaBordaRight: peca.edgeBanding?.right ?? false,
        })
      }
    } catch {
      // ignora módulo inválido
    }
  }

  const agrupado = new Map<string, PecaExport>()
  for (const p of resultado) {
    const key = `${p.modulo}|${p.nome}|${p.largura}|${p.altura}|${p.material}`
    const existing = agrupado.get(key)
    if (existing) {
      existing.quantidade++
    } else {
      agrupado.set(key, { ...p })
    }
  }

  return Array.from(agrupado.values())
}

export function gerarCSV(pecas: PecaExport[]): string {
  const linhas = [
    'Módulo,Peça,Largura (mm),Altura (mm),Quantidade,Material,Fita Topo,Fita Base,Fita Esq,Fita Dir'
  ]
  for (const p of pecas) {
    linhas.push([
      `"${p.modulo}"`,
      `"${p.nome}"`,
      p.largura,
      p.altura,
      p.quantidade,
      `"${p.material}"`,
      p.fitaBordaTop ? 'S' : 'N',
      p.fitaBordaBottom ? 'S' : 'N',
      p.fitaBordaLeft ? 'S' : 'N',
      p.fitaBordaRight ? 'S' : 'N',
    ].join(','))
  }
  return linhas.join('\n')
}

export function downloadCSV(project: EnvironmentProject): void {
  const pecas = coletarPecas(project)
  const csv = gerarCSV(pecas)
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `corte_${(project.nome ?? 'projeto').replace(/\s+/g, '_')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function calcularCusto(
  project: EnvironmentProject,
  precoPorM2: number,
  custoFerragens: number,
  margemLucro: number
): CustoDetalhado {
  const pecas = coletarPecas(project)
  const totalM2 = pecas.reduce((acc, p) => acc + mmToM2(p.largura, p.altura, p.quantidade), 0)
  const numModulos = project.modulos.length
  const custo_ferragens = numModulos * custoFerragens
  const custo_mdf = totalM2 * precoPorM2
  const custo_servicos = (custo_mdf + custo_ferragens) * 0.2
  const subtotal = custo_mdf + custo_ferragens + custo_servicos
  const margem = subtotal * (margemLucro / 100)
  const total = subtotal + margem

  return {
    mdf_m2: Math.round(totalM2 * 100) / 100,
    custo_mdf: Math.round(custo_mdf * 100) / 100,
    custo_ferragens: Math.round(custo_ferragens * 100) / 100,
    custo_servicos: Math.round(custo_servicos * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    margem: Math.round(margem * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}
