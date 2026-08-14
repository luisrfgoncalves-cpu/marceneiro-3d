// Novo projeto — dados do cliente + ambiente (Seção 11.4 passos 1-2).

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { DbCliente } from '../lib/db'
import type { Ambiente } from '../engine/types'

const AMBIENTES: Array<{ id: Ambiente; nome: string; icone: string }> = [
  { id: 'cozinha', nome: 'Cozinha', icone: '🍳' },
  { id: 'dormitorio', nome: 'Dormitório', icone: '🛏️' },
  { id: 'banheiro', nome: 'Banheiro', icone: '🚿' },
  { id: 'area_servico', nome: 'Área de serviço', icone: '🧺' },
  { id: 'sala', nome: 'Sala', icone: '🛋️' },
]

export interface NewProjectData {
  nome: string
  cliente: string
  clienteId: string | null
  ambiente: Ambiente
}

interface NewProjectProps {
  clients: DbCliente[]
  onBack: () => void
  onCreate: (data: NewProjectData) => void
}

export function NewProject({ clients, onBack, onCreate }: NewProjectProps) {
  const [cliente, setCliente] = useState('')
  const [clienteNovo, setClienteNovo] = useState(false)
  const [clienteNovoNome, setClienteNovoNome] = useState('')
  const [ambiente, setAmbiente] = useState<Ambiente>('cozinha')
  const [nome, setNome] = useState('')

  const clienteNome = clienteNovo ? clienteNovoNome : cliente
  const nomeProjeto = useMemo(() => {
    const base = (clienteNome || 'Projeto').trim()
    const am = AMBIENTES.find((a) => a.id === ambiente)?.nome ?? ''
    return nome || `${am} do ${base}`
  }, [clienteNome, ambiente, nome])

  const clienteId = !clienteNovo ? clients.find((c) => c.nome === cliente)?.id ?? null : null

  const valid = clienteNovo ? clienteNovoNome.trim().length > 0 : cliente.length > 0

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-20">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-steel-400 active:text-steel-200">
        <ArrowLeft size={16} />
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-steel-50 mt-3">Novo projeto</h1>

      <div className="mt-6 rounded-2xl border border-steel-700/60 bg-steel-800/40 p-4">
        <label className="block text-sm font-semibold text-steel-200">Cliente</label>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setClienteNovo(false)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              !clienteNovo ? 'bg-wood-500 text-white' : 'bg-steel-700/50 text-steel-300'
            }`}
          >
            Cliente existente
          </button>
          <button
            type="button"
            onClick={() => setClienteNovo(true)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              clienteNovo ? 'bg-wood-500 text-white' : 'bg-steel-700/50 text-steel-300'
            }`}
          >
            Novo cliente
          </button>
        </div>

        {clienteNovo ? (
          <input
            type="text"
            value={clienteNovoNome}
            onChange={(e) => setClienteNovoNome(e.target.value)}
            placeholder="Nome do cliente"
            className="mt-2 w-full rounded-lg border border-steel-600 bg-steel-900 px-3 py-2 text-sm text-steel-50 outline-none focus:border-wood-500"
          />
        ) : (
          <select
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="mt-2 w-full rounded-lg border border-steel-600 bg-steel-900 px-3 py-2 text-sm text-steel-50 outline-none focus:border-wood-500"
          >
            <option value="">Selecione um cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-steel-700/60 bg-steel-800/40 p-4">
        <label className="block text-sm font-semibold text-steel-200">Ambiente</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {AMBIENTES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAmbiente(a.id)}
              className={`rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                ambiente === a.id ? 'bg-wood-500 text-white' : 'bg-steel-700/50 text-steel-300'
              }`}
            >
              <span className="block text-lg">{a.icone}</span>
              {a.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-steel-700/60 bg-steel-800/40 p-4">
        <label className="block text-sm font-semibold text-steel-200">Nome do projeto</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder={nomeProjeto}
          className="mt-2 w-full rounded-lg border border-steel-600 bg-steel-900 px-3 py-2 text-sm text-steel-50 outline-none focus:border-wood-500"
        />
      </div>

      <button
        type="button"
        disabled={!valid}
        onClick={() => onCreate({ nome: nomeProjeto, cliente: clienteNome, clienteId, ambiente })}
        className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-wood-500 text-white font-semibold py-4 active:bg-wood-600 transition-colors disabled:opacity-40 disabled:active:bg-wood-500"
      >
        Criar projeto
        <ArrowRight size={18} />
      </button>
    </div>
  )
}
