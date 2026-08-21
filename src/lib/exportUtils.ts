// Utilitários de exportação — converte a lista de peças do motor paramétrico
// para CSV (importar no app de corte) e calcula o custo do projeto.

import type { EnvironmentProject } from '../engine/environment'
import ExcelJS from 'exceljs'
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

/** Gera e baixa planilha Excel formatada com todas as peças do projeto */
export async function downloadExcel(project: EnvironmentProject): Promise<void> {
  const pecas = coletarPecas(project)
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Marceneiro 3D'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Plano de Corte', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  })

  // Estilização do cabeçalho
  const headerRow = sheet.addRow(['Módulo', 'Peça', 'Larg.(mm)', 'Alt.(mm)', 'Qtde', 'Material', 'Fita T', 'Fita B', 'Fita E', 'Fita D'])
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB45309' } }
    cell.border = { bottom: { style: 'medium', color: { argb: 'FFCA8A04' } } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })
  sheet.getRow(1).height = 28

  // Colunas
  sheet.columns = [
    { key: 'modulo', width: 22 },
    { key: 'nome', width: 28 },
    { key: 'largura', width: 13 },
    { key: 'altura', width: 13 },
    { key: 'quantidade', width: 8 },
    { key: 'material', width: 20 },
    { key: 'ft', width: 7 },
    { key: 'fb', width: 7 },
    { key: 'fe', width: 7 },
    { key: 'fd', width: 7 },
  ]

  // Dados com cores alternadas
  pecas.forEach((p, i) => {
    const row = sheet.addRow([
      p.modulo, p.nome, p.largura, p.altura, p.quantidade, p.material,
      p.fitaBordaTop ? 'S' : 'N',
      p.fitaBordaBottom ? 'S' : 'N',
      p.fitaBordaLeft ? 'S' : 'N',
      p.fitaBordaRight ? 'S' : 'N',
    ])
    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F5F0' } }
      })
    }
    row.getCell(3).numFmt = '0'
    row.getCell(4).numFmt = '0'
    row.getCell(5).numFmt = '0'
    row.alignment = { vertical: 'middle' }
  })

  // Rodapé com totais
  sheet.addRow([])
  const totalRow = sheet.addRow([
    `Total de peças: ${pecas.reduce((a, p) => a + p.quantidade, 0)}`,
    '', '', '', '', '', '', '', '', '',
  ])
  totalRow.getCell(1).font = { bold: true, color: { argb: 'FFB45309' } }

  // Download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `corte_${(project.nome ?? 'projeto').replace(/\s+/g, '_')}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}
