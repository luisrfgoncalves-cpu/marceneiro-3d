// Estado de UI do editor de ambiente — seleção, modos de visão e destaque.
// Os dados do projeto permanecem no App (persistência); aqui só o estado efêmero.

import { create } from 'zustand'

export interface EnvView {
  /** Mostra portas/frentes de gaveta. */
  frentes: boolean
  /** Caixaria translúcida revelando o interior (estilo raio-x). */
  raioX: boolean
  /** Arestas destacadas nas peças. */
  arestas: boolean
  /** Cotas de largura por módulo + total. */
  cotas: boolean
  /** Sala contextualizada (parede + piso). */
  sala: boolean
}

interface EnvStore {
  selectedId: string | null
  view: EnvView
  select: (id: string | null) => void
  toggleView: (k: keyof EnvView) => void
}

export const useEnvStore = create<EnvStore>((set) => ({
  selectedId: null,
  view: { frentes: true, raioX: false, arestas: false, cotas: true, sala: true },
  select: (id) => set({ selectedId: id }),
  toggleView: (k) => set((s) => ({ view: { ...s.view, [k]: !s.view[k] } })),
}))
