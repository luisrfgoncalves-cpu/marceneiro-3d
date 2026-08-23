// Shell do app — navegação por estado (padrão do projeto irmão corte-sobmedida).
// Fluxo completo (Seção 11.4): Auth → Onboarding → Início → Novo projeto →
// Ambiente (11.7) → Biblioteca de módulos (11.2) → Ajuste com 3D ao vivo (11.3/11.5).

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { RuleStore } from './engine/configStore'
import { DEFAULT_RULES, type EngineRules } from './engine/rules'
import {
  distributeEvenly,
  uid,
  type DecorItem,
  type DecorTipo,
  type EnvironmentProject,
  type ModuleInstance,
} from './engine/environment'
import type { ModuloConfig } from './engine/types'
import { PriceStore } from './lib/prices'
import { Persistence } from './lib/persistence'
import { useEnvStore } from './state/envStore'
import type { DbCliente } from './lib/db'
import { Auth } from './pages/Auth'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { NewProject, type NewProjectData } from './pages/NewProject'
import { TemplateGrid } from './pages/TemplateGrid'
import { Settings } from './pages/Settings'
import { BudgetScreen } from './pages/BudgetScreen'

// 3D (Three.js) é carregado sob demanda — mantém o bundle inicial leve no mobile
// e a biblioteca de módulos instantânea (Seção 10/11.3).
const ModuleAdjuster = lazy(() =>
  import('./pages/ModuleAdjuster').then((m) => ({ default: m.ModuleAdjuster })),
)
const Environment = lazy(() => import('./pages/Environment').then((m) => ({ default: m.Environment })))

type Screen = 'auth' | 'onboarding' | 'home' | 'new_project' | 'environment' | 'grid' | 'adjuster' | 'settings' | 'budget'
type GridMode = 'add' | 'edit'

// Verifica se o usuário já escolheu "modo demo" neste dispositivo
const DEMO_KEY = 'marceneiro3d_demo_mode'
const isDemoMode = typeof localStorage !== 'undefined' && localStorage.getItem(DEMO_KEY) === 'true'

export default function App() {
  const store = useMemo(() => new RuleStore(), [])
  const persistence = useMemo(() => new Persistence(), [])
  const prices = useMemo(() => new PriceStore(), [])

  const [rules, setRules] = useState<EngineRules>(DEFAULT_RULES)
  

  // Determinar tela inicial:
  // 1. Modo demo (localStorage): ir direto ao onboarding/home
  // 2. Supabase disponível: checar sessão ativa → se não tiver → Auth
  // 3. Sem Supabase: vai para onboarding/home automaticamente (modo demo implícito)
  const alreadyOnboarded = typeof localStorage !== 'undefined' && localStorage.getItem('marceneiro3d_onboarding_done') === 'true'

  const getInitialScreen = (): Screen => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('view')) return 'environment'
    if (!persistence.hasBackend || isDemoMode) {
      return alreadyOnboarded ? 'home' : 'onboarding'
    }
    return 'auth'
  }

  const [screen, setScreen] = useState<Screen>(getInitialScreen)
  const [authChecked, setAuthChecked] = useState(false)

  // Se Supabase está disponível, verificar se já há sessão ativa
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const viewProjId = params.get('view')
    if (viewProjId) {
      persistence.loadSharedProject(viewProjId).then((proj) => {
        if (proj) {
          setCurrent(proj)
          setScreen('environment')
        } else {
          setScreen(persistence.hasBackend && !isDemoMode ? 'auth' : 'home')
        }
        setAuthChecked(true)
      })
      return
    }
    if (!persistence.hasBackend || isDemoMode) {
      setAuthChecked(true)
      return
    }
    persistence.getCurrentUser().then((user) => {
      if (user) {
        setScreen(alreadyOnboarded ? 'home' : 'onboarding')
      }
      setAuthChecked(true)
    })
  }, [persistence, alreadyOnboarded])

  const [projects, setProjects] = useState<EnvironmentProject[]>([])
  const [clients, setClients] = useState<DbCliente[]>([])
  const [current, setCurrent] = useState<EnvironmentProject | null>(null)
  const [gridMode, setGridMode] = useState<GridMode>('add')
  const [editModuleId, setEditModuleId] = useState<string | null>(null)
  const [config, setConfig] = useState<ModuloConfig | null>(null)

  useEffect(() => {
    store.load().then(() => setRules(store.getRules()))
  }, [store])

  useEffect(() => {
    // Só carregar projetos depois que auth for verificado
    if (!authChecked) return
    Promise.all([persistence.loadProjects(), persistence.loadClients(), prices.load()]).then(([ps, cs]) => {
      setProjects(ps)
      setClients(cs)
      
    })
  }, [persistence, prices, authChecked])

  const openEnvironment = useCallback(
    (project: EnvironmentProject) => {
      setCurrent(project)
      setScreen('environment')
    },
    [],
  )

  const handleCreate = async (data: NewProjectData) => {
    let clienteId = data.clienteId
    if (!clienteId) {
      const novo = await persistence.addCliente(data.cliente)
      clienteId = novo.id
      setClients((prev) => (prev.some((c) => c.id === novo.id) ? prev : [...prev, novo]))
    }
    const project: EnvironmentProject = {
      id: uid(),
      nome: data.nome,
      cliente: data.cliente,
      clienteId,
      ambiente: data.ambiente,
      modulos: [],
      status: 'rascunho',
      updatedAt: new Date().toISOString(),
    }
    setProjects((prev) => [project, ...prev])
    openEnvironment(project)
  }

  const commitModule = () => {
    if (!config || !current) return
    if (gridMode === 'add') {
      const mod: ModuleInstance = { id: uid(), nome: config.nome ?? 'Módulo', config }
      const updated = { ...current, modulos: [...current.modulos, mod] }
      setCurrent(updated)
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setScreen('environment')
    } else if (editModuleId) {
      const updated = {
        ...current,
        modulos: current.modulos.map((m) => (m.id === editModuleId ? { ...m, config } : m)),
      }
      setCurrent(updated)
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setScreen('environment')
    }
  }

  const handleSave = async (): Promise<boolean> => {
    if (!current) return false
    const res = await persistence.saveProject(current, rules)
    setProjects((prev) => prev.map((p) => (p.id === current.id ? current : p)))
    return res.ok
  }

  const handleDelete = async (id: string) => {
    await persistence.deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (current?.id === id) setCurrent(null)
  }

  const patchProject = (updated: EnvironmentProject) => {
    setCurrent(updated)
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  const handleMoveModule = (id: string, dir: -1 | 1) => {
    if (!current) return
    const idx = current.modulos.findIndex((m) => m.id === id)
    const j = idx + dir
    if (idx < 0 || j < 0 || j >= current.modulos.length) return
    const arr = [...current.modulos]
    ;[arr[idx], arr[j]] = [arr[j], arr[idx]]
    patchProject({ ...current, modulos: arr })
  }

  const handleRotateModule = (id: string) => {
    if (!current) return
    patchProject({
      ...current,
      modulos: current.modulos.map((m) => (m.id === id ? { ...m, rotacionado: !m.rotacionado } : m)),
    })
  }

  const handleGapChange = (id: string, gapAntes: number) => {
    if (!current) return
    patchProject({
      ...current,
      modulos: current.modulos.map((m) => (m.id === id ? { ...m, gapAntes } : m)),
    })
  }

  const handleModuleFreeMove = (id: string, posX: number, posZ: number) => {
    if (!current) return
    patchProject({
      ...current,
      modulos: current.modulos.map((m) => (m.id === id ? { ...m, posX, posZ } : m)),
    })
  }

  const handleOrganize = (mode: 'encostar' | 'distribuir') => {
    if (!current) return
    const modulos = distributeEvenly(current.modulos)
    patchProject({
      ...current,
      modulos: mode === 'encostar' ? modulos.map((m) => ({ ...m, gapAntes: 0 })) : modulos,
    })
  }

  const handleAddDecor = (tipo: DecorTipo) => {
    if (!current) return
    const item: DecorItem = { id: uid(), tipo, x: 800, z: 700, rot: 0 }
    const list = current.decoracoes ?? []
    patchProject({ ...current, decoracoes: [...list, item] })
  }

  const handleMoveDecor = (id: string, x: number, z: number) => {
    if (!current) return
    patchProject({
      ...current,
      decoracoes: (current.decoracoes ?? []).map((d) => (d.id === id ? { ...d, x, z } : d)),
    })
  }

  const handleRotateDecor = (id: string) => {
    if (!current) return
    patchProject({
      ...current,
      decoracoes: (current.decoracoes ?? []).map((d) =>
        d.id === id ? { ...d, rot: (((d.rot + 90) % 360) as DecorItem['rot']) } : d,
      ),
    })
  }

  const handleRemoveDecor = (id: string) => {
    if (!current) return
    useEnvStore.getState().select(null)
    patchProject({
      ...current,
      decoracoes: (current.decoracoes ?? []).filter((d) => d.id !== id),
    })
  }

  const handlePieceMaterial = (moduleId: string, pieceName: string, materialId: string | null) => {
    if (!current) return
    patchProject({
      ...current,
      modulos: current.modulos.map((m) => {
        if (m.id !== moduleId) return m
        const custom: Record<string, NonNullable<ModuloConfig['pecasCustomizadas']>[string]> = { ...m.config.pecasCustomizadas }
        if (materialId) custom[pieceName] = { ...custom[pieceName], material: materialId }
        else delete custom[pieceName]?.material
        return { ...m, config: { ...m.config, pecasCustomizadas: custom } }
      }),
    })
  }

  // --- Telas ---

  // Auth loading state (Supabase presente, mas ainda verificando sessão)
  if (persistence.hasBackend && !isDemoMode && !authChecked) {
    return (
      <div className="min-h-dvh grid place-items-center" style={{ background: '#0f172a' }}>
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (screen === 'auth') {
    return (
      <Auth
        persistence={persistence}
        onAuth={() => {
          // Recarregar projetos após login bem-sucedido
          Promise.all([persistence.loadProjects(), persistence.loadClients()]).then(([ps, cs]) => {
            setProjects(ps)
            setClients(cs)
          })
          setScreen(alreadyOnboarded ? 'home' : 'onboarding')
        }}
        onDemo={() => {
          localStorage.setItem(DEMO_KEY, 'true')
          setScreen(alreadyOnboarded ? 'home' : 'onboarding')
        }}
      />
    )
  }

  if (screen === 'budget' && current) {
    return <BudgetScreen project={current} onBack={() => setScreen('environment')} />
  }

  if (screen === 'settings') {
    return <Settings onBack={() => setScreen('home')} />
  }

  if (screen === 'onboarding') {
    return <Onboarding onComplete={() => setScreen('home')} />
  }

  if (screen === 'new_project') {
    return <NewProject clients={clients} onBack={() => setScreen('home')} onCreate={handleCreate} />
  }

  if (screen === 'grid' && current) {
    return (
      <TemplateGrid
        backLabel="Projeto"
        onBack={() => setScreen('environment')}
        onSelect={(template, cfg) => {
          setConfig({ ...cfg, nome: template.nome })
          setScreen('adjuster')
        }}
      />
    )
  }

  if (screen === 'adjuster' && config) {
    return (
      <Suspense
        fallback={
          <div className="h-dvh grid place-items-center">
            <div className="text-sm text-steel-400">Carregando 3D…</div>
          </div>
        }
      >
        <ModuleAdjuster
          initialConfig={config}
          rules={rules}
          onSave={(c) => {
            setConfig(c)
            commitModule()
          }}
          onCancel={() => {
            setScreen(gridMode === 'edit' ? 'environment' : 'grid')
            setConfig(null)
          }}
        />
      </Suspense>
    )
  }

  if (screen === 'environment' && current) {
    return (
      <Suspense
        fallback={
          <div className="h-dvh grid place-items-center">
            <div className="text-sm text-steel-400">Carregando 3D…</div>
          </div>
        }
      >
        <Environment
        project={current}
        readOnly={new URLSearchParams(window.location.search).has('view')}
        rules={rules}
        onBack={() => setScreen('home')}
        onAddModule={() => {
          setGridMode('add')
          setScreen('grid')
        }}
        onEditModule={(id) => {
          const m = current.modulos.find((x) => x.id === id)
          if (!m) return
          setGridMode('edit')
          setEditModuleId(id)
          setConfig(m.config)
          setScreen('adjuster')
        }}
        onRemoveModule={(id) => {
          patchProject({ ...current, modulos: current.modulos.filter((m) => m.id !== id) })
        }}
        onDuplicateModule={(mod) => {
          patchProject({ ...current, modulos: [...current.modulos, mod] })
        }}
        onMoveModule={handleMoveModule}
        onRotateModule={handleRotateModule}
        onGapChange={handleGapChange}
        onModuleFreeMove={handleModuleFreeMove}
        onOrganize={handleOrganize}
        onAddDecor={handleAddDecor}
        onMoveDecor={handleMoveDecor}
        onRotateDecor={handleRotateDecor}
        onRemoveDecor={handleRemoveDecor}
        onPieceMaterial={handlePieceMaterial}
        onToggleStatus={() => {
          patchProject({
            ...current,
            status: current.status === 'aprovado' ? 'rascunho' : 'aprovado',
          })
        }}
        onSave={handleSave}
      />
      </Suspense>
    )
  }

  return (
    <Home
      projects={projects}
      onNewProject={() => setScreen('new_project')}
      onSettings={() => setScreen('settings')}
      onOpen={openEnvironment}
      onDelete={handleDelete}
    />
  )
}
