// Tipos de persistência (Seção 8 / 11.9) — espelham as tabelas do Supabase.

export interface DbCliente {
  id: string
  nome: string
  contato: string | null
}

export interface DbProjectRow {
  id: string
  nome: string
  ambiente: string
  cliente: string
  status: string
  updated_at: string
}

export interface DbProjectModuleRow {
  id: string
  project_id: string
  modulo_tipo: string
  config: Record<string, unknown>
  posicao: Record<string, unknown>
  ordem: number
}

export interface DbPecaRow {
  id: string
  module_id: string
  nome: string
  dimensao: { w: number; h: number; d: number }
  posicao: { x: number; y: number; z: number }
  rotacao: { x: number; y: number; z: number }
  material_id: string | null
  veio: string | null
}
