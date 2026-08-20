import { Plus, Trash2, ArrowUpRight, FolderOpen, CheckCircle, Clock } from 'lucide-react'
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
  // Calculando estatísticas do marceneiro
  const totalProjects = projects.length
  const approvedProjects = projects.filter((p) => p.status === 'aprovado').length
  const draftProjects = totalProjects - approvedProjects

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-20">
      {/* Header com boas-vindas */}
      <header className="mb-6">
        <div className="text-sm font-bold text-wood-400 uppercase tracking-wider">Marceneiro 3D</div>
        <h1 className="text-2xl font-bold text-steel-50 mt-1">Olá, Marceneiro! 👋</h1>
        <p className="text-sm text-steel-400 mt-1">Gerencie seus projetos e impressione seus clientes com propostas 3D em segundos.</p>
      </header>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-steel-750 bg-steel-800/25 p-3 flex flex-col justify-between">
          <div className="text-steel-400 text-xs flex items-center gap-1">
            <FolderOpen size={12} className="text-wood-400" />
            <span>Total</span>
          </div>
          <div className="text-2xl font-bold text-steel-50 mt-2 font-mono">{totalProjects}</div>
        </div>
        <div className="rounded-2xl border border-steel-750 bg-steel-800/25 p-3 flex flex-col justify-between">
          <div className="text-steel-400 text-xs flex items-center gap-1">
            <CheckCircle size={12} className="text-emerald-400" />
            <span>Aprovados</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{approvedProjects}</div>
        </div>
        <div className="rounded-2xl border border-steel-750 bg-steel-800/25 p-3 flex flex-col justify-between">
          <div className="text-steel-400 text-xs flex items-center gap-1">
            <Clock size={12} className="text-amber-400" />
            <span>Rascunhos</span>
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">{draftProjects}</div>
        </div>
      </div>

      {/* Ação principal */}
      <button
        type="button"
        onClick={onNewProject}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-wood-500 hover:bg-wood-600 text-white font-semibold py-4 active:scale-[0.99] transition-all shadow-lg shadow-wood-500/10"
      >
        <Plus size={18} />
        Criar Novo Projeto
      </button>

      {/* Projetos Recentes */}
      <div className="mt-8">
        <h2 className="text-base font-bold text-steel-200 mb-3">Meus Projetos Recentes</h2>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-steel-700/60 p-8 text-center text-sm text-steel-500">
            Nenhum projeto cadastrado no momento.
            <br />
            Toque em "Criar Novo Projeto" para começar a projetar na frente do cliente!
          </div>
        ) : (
          <ul className="space-y-3">
            {projects.map((p) => (
              <li
                key={p.id}
                className="group flex items-center gap-3 rounded-2xl border border-steel-700/60 bg-steel-800/40 p-4 hover:border-steel-600/80 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onOpen(p)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-steel-50 truncate group-hover:text-wood-400 transition-colors">{p.nome}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        p.status === 'aprovado'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-steel-600/30 text-steel-300 border border-steel-600/40'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="text-xs text-steel-400 mt-1 font-medium">
                    Cliente: <span className="text-steel-300">{p.cliente}</span>
                  </div>
                  <div className="text-xs text-steel-500 mt-0.5">
                    {AMBIENTE_LABEL[p.ambiente] ?? p.ambiente} · {p.modulos.length} módulo{p.modulos.length === 1 ? '' : 's'}
                  </div>
                </button>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpen(p)}
                    className="w-9 h-9 grid place-items-center rounded-xl bg-steel-700/50 hover:bg-steel-600/60 text-steel-200 active:scale-95 transition-all"
                    title="Abrir"
                  >
                    <ArrowUpRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(p.id)}
                    className="w-9 h-9 grid place-items-center rounded-xl bg-steel-700/50 hover:bg-red-500/20 hover:text-red-300 text-steel-400 active:scale-95 transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
