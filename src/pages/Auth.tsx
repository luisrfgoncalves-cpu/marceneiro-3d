// Tela de autenticação — email/senha simples + modo de demonstração (offline).
// Design mobile-first com glassmorphism e micro-animações premium.

import { useState } from 'react'
import { Eye, EyeOff, ChevronRight, Hammer, WifiOff } from 'lucide-react'
import type { Persistence } from '../lib/persistence'

interface AuthProps {
  persistence: Persistence
  onAuth: () => void
  onDemo: () => void
}

type Mode = 'login' | 'signup'

export function Auth({ persistence, onAuth, onDemo }: AuthProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error: err } = await persistence.signIn(email, password)
        if (err) throw new Error(err.message)
        onAuth()
      } else {
        const { error: err } = await persistence.signUp(email, password)
        if (err) throw new Error(err.message)
        setSuccess('Conta criada! Verifique seu e-mail para confirmar e depois faça login.')
        setMode('login')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      if (msg.includes('Invalid login credentials')) setError('E-mail ou senha incorretos.')
      else if (msg.includes('User already registered')) setError('E-mail já cadastrado. Faça login.')
      else if (msg.includes('Password should be')) setError('Senha deve ter ao menos 6 caracteres.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-12"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      {/* Decorative blobs */}
      <div
        className="fixed top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }}
      />
      <div
        className="fixed bottom-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #1d4ed8, transparent)' }}
      />

      {/* Logo / header */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div
          className="w-16 h-16 rounded-2xl grid place-items-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          <Hammer size={30} color="white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Marceneiro 3D</h1>
          <p className="text-sm text-slate-400 mt-1">
            {mode === 'login' ? 'Acesse seus projetos' : 'Crie sua conta gratuita'}
          </p>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Mode toggle */}
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null); setSuccess(null) }}
              className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                background: mode === m ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'transparent',
                color: mode === m ? 'white' : '#94a3b8',
              }}
            >
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Senha</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error / success */}
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm text-red-300" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl px-4 py-3 text-sm text-emerald-300" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Entrar' : 'Criar conta'}
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Demo mode separator */}
      <div className="flex items-center gap-3 my-5 w-full max-w-sm">
        <div className="flex-1 h-px bg-slate-700" />
        <span className="text-xs text-slate-500">ou</span>
        <div className="flex-1 h-px bg-slate-700" />
      </div>

      <button
        type="button"
        onClick={onDemo}
        className="w-full max-w-sm flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-medium text-slate-300 transition-all active:scale-[0.98] hover:text-white"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <WifiOff size={16} className="opacity-70" />
        Continuar sem conta (modo demo)
      </button>

      <p className="text-xs text-slate-600 mt-6 text-center max-w-xs">
        No modo demo os projetos são salvos apenas neste dispositivo.
      </p>
    </div>
  )
}
