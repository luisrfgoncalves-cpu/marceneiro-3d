// Distribuição de portas no vão (Seção 5.8).
// Vãos normativos:
//   - entre portas/frentes fechadas (vertical): 4mm
//   - entre portas casal que se encontram (vertical): 3mm
//   - horizontal entre frentes: 3mm (sempre)
// As fórmulas são relativas (Seção 9): nunca valores fixos.

import type { EngineRules } from '../rules'
import type { Region } from '../geometry'
import type { Piston, TipoPorta } from '../types'

export interface Door {
  index: number
  w: number
  h: number
  x: number
  y: number
  z: number // plano frontal da porta (mm)
}

/**
 * Distribui n portas no vão `area`. `area.z + area.d` é o plano da frente.
 * Retorna cada porta com posição x (esquerda) e dimensões; z é o plano frontal.
 */
export function layoutDoors(
  area: Region,
  n: number,
  tipo: TipoPorta,
  regras: EngineRules,
): Door[] {
  if (n <= 0) return []
  const outer = regras.portaGapLateral
  const pairGap = regras.vaoCasalVertical
  const betweenGap = regras.vaoFrenteVertical

  // Sequência de vãos entre a borda esquerda e direita do vão
  const gaps: number[] = [outer]
  for (let i = 0; i < n - 1; i += 1) {
    if (tipo === 'casal') gaps.push(i % 2 === 0 ? pairGap : betweenGap)
    else gaps.push(betweenGap)
  }
  gaps.push(outer)

  const totalGap = gaps.reduce((a, b) => a + b, 0)
  const doorW = (area.w - totalGap) / n
  const doorH = area.h - regras.portaGapTampo

  const doors: Door[] = []
  let x = area.x
  for (let i = 0; i < n; i += 1) {
    x += gaps[i] // vão à esquerda desta porta (inclui o vão externo da primeira)
    doors.push({
      index: i,
      w: doorW,
      h: doorH,
      x,
      y: area.y,
      z: area.z + area.d,
    })
    x += doorW
  }
  return doors
}

/**
 * Frentes de gaveta empilhadas verticalmente — distribuição em `n` frentes
 * de igual altura cobrindo a largura do vão, com vão horizontal de 3mm.
 */
export function layoutFrentesHorizontais(
  area: Region,
  n: number,
  frenteAltura: number,
  regras: EngineRules,
): Door[] {
  if (n <= 0) return []
  const outer = regras.portaGapLateral
  const inner = regras.vaoHorizontal
  const w = area.w - 2 * outer
  const zoneH = area.h
  const occupied = n * frenteAltura + (n - 1) * inner
  const extra = zoneH - occupied
  const gap = extra >= 0 ? inner + extra / (n - 1 || 1) : inner

  const frentes: Door[] = []
  for (let i = 0; i < n; i += 1) {
    const y = area.y + zoneH - (i + 1) * frenteAltura - i * gap
    frentes.push({
      index: i,
      w,
      h: frenteAltura,
      x: area.x + outer,
      y,
      z: area.z + area.d,
    })
  }
  return frentes
}

/**
 * Portas basculantes (Seção 5.8) — empilhadas verticalmente em vãos horizontais
 * de 3mm (vaoHorizontal, sempre). Abrem para cima ou para baixo.
 */
export function layoutVasculantes(
  area: Region,
  n: number,
  regras: EngineRules,
): Door[] {
  if (n <= 0) return []
  const gap = regras.vaoHorizontal
  const outer = regras.portaGapLateral
  const w = area.w - 2 * outer
  const h = (area.h - (n + 1) * gap) / n

  const doors: Door[] = []
  for (let i = 0; i < n; i += 1) {
    const y = area.y + gap + i * (h + gap)
    doors.push({
      index: i,
      w,
      h,
      x: area.x + outer,
      y,
      z: area.z + area.d,
    })
  }
  return doors
}

/** Pistões a gás (Seção 4.4) — um por porta basculante, a 30% da altura. */
export function computePistons(doors: Door[]): Piston[] {
  return doors.map((d) => ({ doorId: `porta_${d.index + 1}`, yMm: d.y + d.h * 0.3 }))
}
