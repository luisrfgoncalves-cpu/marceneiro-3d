// Sistema de Perfis do Marceneiro — cada marceneiro salva seu jeito de trabalhar.
// Um Perfil contém: regras técnicas, materiais padrão, ferragens e sistema de montagem.
// O motor usa o perfil ativo ao criar novos módulos.

import type { EngineRules } from './rules'
import type { CorredicaTipo, DobradicaTipo, MontagemTipo, PuxadorTipo, PuxadorCor } from './types'

export interface MarceneiroProfile {
  id: string
  nome: string
  descricao?: string
  isDefault: boolean
  createdAt: string

  // Regras técnicas — somente as que diferem do DEFAULT_RULES
  regras: Partial<EngineRules>

  // Materiais padrão usados ao criar qualquer módulo
  materiais: {
    caixaria: string        // id ex: 'gua-branco-tx'
    frentes: string         // id do material das portas
    fitaBorda: string       // id da fita
    espessuraCaixaria: number   // 15 ou 18mm
    espessuraFrente: number     // 15 ou 18mm
  }

  // Ferragens padrão
  ferragens: {
    montagem: MontagemTipo
    dobradica: DobradicaTipo
    corredica: CorredicaTipo
    puxador: PuxadorTipo
    puxadorCor: PuxadorCor
  }

  // Sistema de fundo padrão
  sistemaFundo: 'sem_fundo' | 'encaixado_recuado' | 'rebaixo_parafusado' | 'parafusado_tras' | 'fundo_espesso'
}

const STORAGE_KEY = 'marceneiro3d_profiles'

export function loadProfiles(): MarceneiroProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as MarceneiroProfile[]
  } catch { /* ignore */ }
  return []
}

export function saveProfile(profile: MarceneiroProfile): void {
  const all = loadProfiles().filter(p => p.id !== profile.id)
  // Se for marcado como padrão, remove o padrão anterior
  const updated = profile.isDefault
    ? all.map(p => ({ ...p, isDefault: false }))
    : all
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...updated, profile]))
}

export function deleteProfile(id: string): void {
  const all = loadProfiles().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function getActiveProfile(): MarceneiroProfile | null {
  const all = loadProfiles()
  return all.find(p => p.isDefault) ?? all[0] ?? null
}

export const DEFAULT_PROFILE: MarceneiroProfile = {
  id: 'default',
  nome: 'Padrão Geral',
  descricao: 'Configuração base de marcenaria',
  isDefault: true,
  createdAt: new Date().toISOString(),
  regras: {},
  materiais: {
    caixaria: 'gua-branco-tx',
    frentes: 'ara-castanheira',
    fitaBorda: 'ara-castanheira',
    espessuraCaixaria: 18,
    espessuraFrente: 18,
  },
  ferragens: {
    montagem: 'minifix',
    dobradica: 'reta',
    corredica: 'telescopica',
    puxador: 'perfil_gola_anodizado',
    puxadorCor: 'prata',
  },
  sistemaFundo: 'rebaixo_parafusado',
}
