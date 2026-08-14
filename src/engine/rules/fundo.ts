// Sistemas de fundo (Seção 5.1) — 4 variantes alternáveis.
// O fundo padrão de armário é sempre 6mm Branco TX (única regra não-editável).

import type { EngineRules } from '../rules'
import { box, type Region } from '../geometry'
import type { Piece, SistemaFundo } from '../types'

export function computeFundo(
  sistema: SistemaFundo,
  interior: Region,
  espessuraCaixa: number,
  materialId: string,
  rules: EngineRules,
): Piece[] {
  const pieces: Piece[] = []
  if (sistema === 'sem_fundo') return pieces

  let w: number
  let x: number
  let d: number
  let z = 0

  if (sistema === 'parafusado_tras') {
    // Fundo aplicado por trás das laterais — cobre a largura total
    w = interior.w + 2 * espessuraCaixa
    x = 0
    d = rules.fundoEspessuraPadrao
    z = 0
  } else {
    // Encaixado recuado / rebaixo parafusado / fundo espesso
    w = interior.w
    x = interior.x
    if (sistema === 'fundo_espesso') {
      d = rules.fundoEspessuraEspesso
    } else if (sistema === 'rebaixo_parafusado') {
      d = rules.fundoEspessuraPadrao
      z = rules.fundoRebaixoProfundidade
    } else {
      d = rules.fundoEspessuraPadrao
      z = 0
    }
  }

  pieces.push(
    box({
      name: 'Fundo',
      w,
      h: interior.h,
      d,
      position: { x, y: interior.y, z },
      materialId,
      grainDirection: 'horizontal',
    }),
  )
  return pieces
}
