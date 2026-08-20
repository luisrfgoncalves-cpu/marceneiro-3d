// Cadastro e criação de novos projetos (Seção 11.4 passos 1-2).
// Substituído emojis infantis por SVGs profissionais linha fina minimalistas.

import { useState } from 'react'
import type { DbCliente } from '../lib/db'
import type { Ambiente } from '../engine/types'

export interface NewProjectData {
  nome: string
  ambiente: Ambiente
  cliente: string
  clienteId?: string
}

interface NewProjectProps {
  clients: DbCliente[]
  onBack: () => void
  onCreate: (data: NewProjectData) => void
}

const AMBIENTES: Array<{ value: Ambiente; label: string; icon: React.ReactNode }> = [
  {
    value: 'cozinha',
    label: 'Cozinha',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        {/* Bancada / Fogão/ Forno */}
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <circle cx="8" cy="6" r="1.5" />
        <circle cx="16" cy="6" r="1.5" />
        <circle cx="8" cy="14" r="1" />
        <circle cx="16" cy="14" r="1" />
      </svg>
    ),
  },
  {
    value: 'dormitorio',
    label: 'Dormitório',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        {/* Cama Premium */}
        <path d="M2 4v16M2 11h20M2 17h20M22 8v12" strokeLinecap="round" />
        <path d="M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
      </svg>
    ),
  },
  {
    value: 'banheiro',
    label: 'Banheiro',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        {/* Cuba / Espelho */}
        <path d="M5 22h14M12 5V2M10 2h4" strokeLinecap="round" />
        <path d="M6 12a6 6 0 0 0 12 0H6z" />
        <rect x="8" y="5" width="8" height="6" rx="1" />
      </svg>
    ),
  },
  {
    value: 'area_servico',
    label: 'Área de Serviço',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        {/* Lavadora / Tanque */}
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <line x1="4" y1="8" x2="20" y2="8" />
        <circle cx="12" cy="14" r="3" />
        <circle cx="12" cy="14" r="1" />
      </svg>
    ),
  },
  {
    value: 'sala',
    label: 'Sala de Estar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        {/* Sofá minimalista */}
        <path d="M3 14V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M2 14h20v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z" />
        <path d="M6 14v-3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
      </svg>
    ),
  },
]

export function NewProject({ clients, onBack, onCreate }: NewProjectProps) {
  const [nome, setNome] = useState('')
  const [ambiente, setAmbiente] = useState<Ambiente>('cozinha')
  const [cliente, setCliente] = useState('')
  const [clienteId, setClienteId] = useState('')

  const selectClient = (id: string) => {
    const found = clients.find((c) => c.id === id)
    if (found) {
      setCliente(found.nome)
      setClienteId(found.id)
    } else {
      setClienteId('')
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !cliente.trim()) return
    onCreate({
      nome: nome.trim(),
      ambiente,
      cliente: cliente.trim(),
      clienteId: clienteId || undefined,
    })
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-12">
      <header className="mb-6">
        <button type="button" onClick={onBack} className="text-sm text-steel-400 hover:text-steel-200">
          ← Cancelar
        </button>
        <h1 className="text-2xl font-bold mt-1 text-steel-50">Iniciar projeto</h1>
        <p className="text-sm text-steel-400 mt-1">Insira os dados iniciais do cliente e do ambiente.</p>
      </header>

      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-4 rounded-2xl bg-steel-800/35 border border-steel-750 p-4">
          {/* Cliente existente */}
          {clients.length > 0 && (
            <label className="block">
              <span className="text-xs font-semibold text-steel-400 uppercase tracking-wider block mb-1.5">Selecionar cliente existente</span>
              <select
                className="w-full rounded-xl bg-steel-900 border border-steel-700/60 text-sm text-steel-200 px-3 py-2.5 outline-none focus:border-wood-500"
                value={clienteId}
                onChange={(e) => selectClient(e.target.value)}
              >
                <option value="">-- Novo cliente --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.contato || 'Sem contato'})
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Nome do Cliente */}
          <label className="block">
            <span className="text-xs font-semibold text-steel-400 uppercase tracking-wider block mb-1.5">Nome do Cliente</span>
            <input
              type="text"
              required
              disabled={!!clienteId}
              placeholder="Ex: João Silva"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full rounded-xl bg-steel-900 border border-steel-700/60 text-sm text-steel-200 px-3.5 py-2.5 outline-none focus:border-wood-500 disabled:opacity-50"
            />
          </label>

          {/* Nome do Projeto */}
          <label className="block">
            <span className="text-xs font-semibold text-steel-400 uppercase tracking-wider block mb-1.5">Nome do Ambiente / Projeto</span>
            <input
              type="text"
              required
              placeholder="Ex: Cozinha Planejada L"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-xl bg-steel-900 border border-steel-700/60 text-sm text-steel-200 px-3.5 py-2.5 outline-none focus:border-wood-500"
            />
          </label>
        </div>

        {/* Escolha do Ambiente */}
        <div>
          <span className="text-xs font-semibold text-steel-400 uppercase tracking-wider block mb-2 px-1">Selecione o Ambiente</span>
          <div className="grid grid-cols-2 gap-2.5">
            {AMBIENTES.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setAmbiente(a.value)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                  ambiente === a.value
                    ? 'border-wood-500 bg-wood-500/10 text-wood-400 font-bold'
                    : 'border-steel-750 bg-steel-800/25 text-steel-400 hover:border-steel-600'
                }`}
              >
                <div className={`mb-2 ${ambiente === a.value ? 'text-wood-400' : 'text-steel-500'}`}>{a.icon}</div>
                <span className="text-xs">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-wood-500 hover:bg-wood-600 text-white font-bold py-4 text-sm active:scale-[0.99] transition-all shadow-lg shadow-wood-500/20"
        >
          Avançar para Módulos
        </button>
      </form>
    </div>
  )
}

