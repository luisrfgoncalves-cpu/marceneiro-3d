// Catálogo de preços (Seção 11.6): carrega do Supabase (materiais.preco_m2,
// fitas_borda.preco_unitario, ferragens.preco_unitario) com fallback local.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { defaultCatalog } from '../engine/cost'
import type { PriceCatalog } from '../engine/cost'

export type { PriceCatalog } from '../engine/cost'

export class PriceStore {
  private supabase: SupabaseClient | null = null

  constructor() {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
    if (url && anon) this.supabase = createClient(url, anon)
  }

  get hasBackend(): boolean {
    return this.supabase !== null
  }

  /** Carrega o catálogo mesclando com os padrões (nunca lança erro). */
  async load(): Promise<PriceCatalog> {
    const catalog = defaultCatalog()
    if (!this.supabase) return catalog

    try {
        const [mat, fita, ferragens] = await Promise.all([
          this.supabase.from('materiais').select('id,preco_m2'),
          this.supabase.from('fitas_borda').select('id,preco_unitario'),
          this.supabase
            .from('ferragens')
            .select('id,categoria,subtipo,medidas,preco_unitario')
            .returns<
              Array<{
                id: string
                categoria: string | null
                subtipo: string | null
                medidas: string | null
                preco_unitario: number | null
              }>
            >(),
        ])
      if (mat.data) {
        for (const m of mat.data) {
          if (m.preco_m2 != null) catalog.material[m.id] = Number(m.preco_m2)
        }
      }
      if (fita.data) {
        for (const f of fita.data) {
          if (f.preco_unitario != null) catalog.fita[f.id] = Number(f.preco_unitario)
        }
      }
      if (ferragens.data) {
        for (const f of ferragens.data) {
          const categoria = f.categoria as string
          const price = f.preco_unitario != null ? Number(f.preco_unitario) : null
          if (price == null) continue
          if (categoria === 'dobradica') catalog.dobradica = price
          else if (categoria === 'pistao') catalog.pistao = price
          else if (categoria === 'corredica') {
            const medida = String(f.medidas ?? '').replace(/\D/g, '')
            if (medida) {
              if (!catalog.corredicas) catalog.corredicas = {}
              catalog.corredicas[medida] = price
            } else {
              catalog.corredica = price
            }
          } else if (categoria === 'puxador') {
            const subtipo = (f.subtipo as string) || ''
            if (subtipo) {
              if (!catalog.puxadores) catalog.puxadores = {}
              catalog.puxadores[subtipo] = price
            } else {
              catalog.puxador = price
            }
          }
        }
      }
    } catch {
      // offline — usa os padrões
    }
    return catalog
  }
}
