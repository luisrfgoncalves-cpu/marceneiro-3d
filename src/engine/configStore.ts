// Repositório de regras do domínio (Seção 2 da spec).
// Tenta carregar do Supabase (tabela regras_config). Se indisponível
// (sem env vars ou erro), usa os valores padrão embarcados — o que
// permite desenvolvimento e demo offline sem banco.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { DEFAULT_RULES, type EngineRules, type RuleKey, RULE_DEFAULTS, resolveRules } from './rules'

export interface RuleRecord {
  key: string
  valor_padrao: number
  editavel: boolean
  valor_customizado: number | null
  unidade: string
}

export class RuleStore {
  private custom: Map<RuleKey, number> = new Map()
  private supabase: SupabaseClient | null = null

  constructor() {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
    if (url && anon) {
      this.supabase = createClient(url, anon)
    }
  }

  get hasBackend(): boolean {
    return this.supabase !== null
  }

  getRules(): EngineRules {
    return resolveRules(this.custom)
  }

  get(key: RuleKey): number {
    const c = this.custom.get(key)
    if (c !== undefined) return c
    const def = RULE_DEFAULTS.find((d) => d.key === key)
    return def ? (def.valor_customizado ?? def.valor_padrao) : 0
  }

  setCustom(key: RuleKey, value: number): void {
    const def = RULE_DEFAULTS.find((d) => d.key === key)
    if (!def || !def.editavel) return
    this.custom.set(key, value)
  }

  resetCustom(key: RuleKey): void {
    this.custom.delete(key)
  }

  /** Carrega valor_customizado persistido no Supabase (com fallback local). */
  async load(): Promise<void> {
    if (!this.supabase) return
    try {
      const { data } = await this.supabase.from('regras_config').select('key,valor_customizado')
      if (data) {
        for (const row of data) {
          if (row.valor_customizado !== null) {
            this.custom.set(row.key as RuleKey, row.valor_customizado as number)
          }
        }
      }
    } catch {
      // offline — mantém padrões
    }
  }

  /** Persiste uma regra customizada (fire-and-forget; offline guarda local). */
  async save(key: RuleKey, value: number): Promise<void> {
    const def = RULE_DEFAULTS.find((d) => d.key === key)
    if (!def) return
    this.setCustom(key, value)
    if (!this.supabase) return
    try {
      const payload = {
        key,
        valor_padrao: def.valor_padrao,
        editavel: def.editavel,
        valor_customizado: value,
        unidade: def.unidade,
      }
      await this.supabase.from('regras_config').upsert(payload, { onConflict: 'key' })
    } catch {
      // offline — valor fica apenas em memória nesta sessão
    }
  }
}

export function createDefaultRules(): EngineRules {
  return DEFAULT_RULES
}
