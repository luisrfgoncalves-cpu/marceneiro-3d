// Validações do motor (Seção 5.10).
// - Nenhuma peça pode exceder o tamanho de chapa padrão → alerta.
// - (Conflito de dobradiça com prateleira é tratado em dobradicas.ts)
// - (Taponamento em base/montante é estruturalmente impossível na construção)

import type { EngineRules } from './rules'
import { pieceFaceDims } from './geometry'
import type { Piece, Warning } from './types'

export function validateSheetSize(pieces: Piece[], rules: EngineRules): Warning[] {
  const warnings: Warning[] = []
  for (const p of pieces) {
    const { major, minor } = pieceFaceDims(p)
    if (major > rules.chapaLarguraMax || minor > rules.chapaAlturaMax) {
      warnings.push({
        type: 'chapa_excedida',
        pieceName: p.name,
        message: `${p.name} (${p.w}×${p.h}×${p.d}mm) excede a chapa padrão de ${rules.chapaLarguraMax}×${rules.chapaAlturaMax}mm — sugere-se dividir o módulo.`,
      })
    }
  }
  return warnings
}

export function validate(pieces: Piece[], rules: EngineRules): Warning[] {
  return [...validateSheetSize(pieces, rules)]
}
