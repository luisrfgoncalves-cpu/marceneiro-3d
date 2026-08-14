// Início — lista de projetos por ambiente (Seção 11.4) + criar novo.

import { Plus, Trash2, ArrowUpRight } from 'lucide-react'
import type { EnvironmentProject } from '../engine/environment'

const AMBIENTE_LABEL: Record<string, string> = {
  cozinha: 'Cozinha',
  dormitorio: 'Dormitório',
  banheiro: 'Banheiro',
  area_servico: 'Área de serviço',
  sala: 'Sala',
}

interface HomeProps {
  projects: EnvironmentProject[]
  onNewProject: () => void
  onOpen: (project: EnvironmentProject) => void
  onDelete: (id: string) => void
}

export function Home({ projects, onNewProject, onOpen, onDelete }: HomeProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-20">
      <header className="mb-6">
        <div className="text-sm font-semibold text-wood-400 uppercase tracking-wide">Marceneiro 3D</div>
        <h1 className="text-2xl font-bold text-steel-50 mt-1">Meus projetos</h1>
        <p className="text-sm text-steel-400 mt-1">Cada projeto é um ambiente completo, não peças avulsas.</p>
      </header>

      <button
        type="button"
        onClick={onNewProject}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-wood-500 text-white font-semibold py-4 active:bg-wood-600 transition-colors"
      >
        <Plus size={18} />
        Novo projeto
      </button>

      {projects.length === 0 ? (
        <div className="mt-10 text-center text-sm text-steel-500">
          Nenhum projeto ainda.
          <br />
          Comece escolhendo um ambiente e adicione módulos prontos.
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-steel-700/60 bg-steel-800/40 px-4 py-3"
            >
              <button type="button" onClick={() => onOpen(p)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-steel-50 truncate">{p.nome}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      p.status === 'aprovado' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-steel-600/40 text-steel-300'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-xs text-steel-400 mt-0.5">
                  {AMBIENTE_LABEL[p.ambiente] ?? p.ambiente} · {p.cliente} · {p.modulos.length} módulo{p.modulos.length === 1 ? '' : 's'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => onOpen(p)}
                className="w-9 h-9 grid place-items-center rounded-lg bg-steel-700/60 text-steel-200 active:bg-steel-600"
                aria-label="Abrir projeto"
              >
                <ArrowUpRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                className="w-9 h-9 grid place-items-center rounded-lg bg-steel-700/60 text-steel-400 active:bg-steel-600"
                aria-label="Excluir projeto"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
