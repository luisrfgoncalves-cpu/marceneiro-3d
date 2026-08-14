// Preferência de unidade (cm/mm) do marceneiro — requisito do usuário.
// O motor e a persistência trabalham SEMPRE em milímetros (fonte da verdade);
// esta camada só converte para exibição. Nenhum número muda de semântica.

import { useCallback, useState } from 'react'

export type Unit = 'mm' | 'cm'

const KEY = 'marceneiro3d_unit'
export const DEFAULT_UNIT: Unit = 'cm'

/** Converte mm do motor para o valor de exibição (cm ou mm). */
export function toDisplay(mm: number, unit: Unit): number {
  return unit === 'cm' ? mm / 10 : mm
}

/** Converte valor de exibição de volta para mm do motor. */
export function fromDisplay(v: number, unit: Unit): number {
  return unit === 'cm' ? Math.round(v * 10) : Math.round(v)
}

export function fmtLength(mm: number, unit: Unit, decimals = 1): string {
  const v = toDisplay(mm, unit)
  return `${v.toLocaleString('pt-BR', { maximumFractionDigits: decimals })} ${unit}`
}

export function useUnitPref(): [Unit, (u: Unit) => void] {
  const [unit, setUnit] = useState<Unit>(() => {
    try {
      return localStorage.getItem(KEY) === 'mm' ? 'mm' : DEFAULT_UNIT
    } catch {
      return DEFAULT_UNIT
    }
  })
  const set = useCallback((u: Unit) => {
    try {
      localStorage.setItem(KEY, u)
    } catch {
      // armazenamento indisponível — segue apenas em memória
    }
    setUnit(u)
  }, [])
  return [unit, set]
}

/** Passa um valor de exibição (na unidade atual) ao motor. */
export function useLengthBinding(unit: Unit) {
  return useCallback(
    (displayValue: number) => fromDisplay(displayValue, unit),
    [unit],
  )
}
