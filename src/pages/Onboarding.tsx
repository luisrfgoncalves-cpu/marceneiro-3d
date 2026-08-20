// Onboarding premium — carrossel animado com gradientes, ilustrações SVG inline
// e persistência em localStorage. Só aparece uma vez por dispositivo.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
}

const SLIDES = [
  {
    label: '01',
    title: 'Impressione na Hora',
    sub: 'Proposta 3D em tempo real',
    body: 'Mostre o projeto do móvel ao cliente enquanto você ainda está conversando com ele. Causa impacto imediato e fecha mais vendas.',
    bg: 'from-[#1a1030] to-[#0d1a2a]',
    accent: '#c47b2a',
    svg: (
      <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* armário base */}
        <rect x="40" y="60" width="120" height="80" rx="4" fill="#2a1f14" stroke="#8b5a2b" strokeWidth="1.5"/>
        {/* porta esquerda */}
        <rect x="43" y="63" width="55" height="74" rx="2" fill="#3d2a18" stroke="#c47b2a" strokeWidth="1"/>
        {/* porta direita */}
        <rect x="102" y="63" width="55" height="74" rx="2" fill="#3d2a18" stroke="#c47b2a" strokeWidth="1"/>
        {/* puxadores */}
        <rect x="92" y="96" width="4" height="14" rx="2" fill="#c47b2a"/>
        <rect x="104" y="96" width="4" height="14" rx="2" fill="#c47b2a"/>
        {/* tampo */}
        <rect x="38" y="55" width="124" height="8" rx="3" fill="#5a3520" stroke="#8b5a2b" strokeWidth="1"/>
        {/* brilho 3D */}
        <path d="M40 63 L43 60" stroke="#c47b2a" strokeWidth="0.8" opacity="0.6"/>
        <path d="M160 63 L163 60" stroke="#c47b2a" strokeWidth="0.8" opacity="0.6"/>
        {/* celular com proposição */}
        <rect x="130" y="20" width="50" height="32" rx="5" fill="#1e2435" stroke="#3a4a6a" strokeWidth="1.2"/>
        <rect x="133" y="23" width="44" height="22" rx="3" fill="#263050"/>
        <text x="155" y="38" textAnchor="middle" fill="#c47b2a" fontSize="7" fontWeight="bold">3D</text>
        <path d="M127 36 L130 34" stroke="#c47b2a" strokeWidth="1" strokeDasharray="2,2"/>
      </svg>
    ),
  },
  {
    label: '02',
    title: 'Monte Rapidamente',
    sub: 'Biblioteca de módulos prontos',
    body: 'Escolha entre cozinhas, dormitórios, banheiros e muito mais. Adicione, remova e reorganize módulos com poucos toques.',
    bg: 'from-[#0d1a2a] to-[#101a14]',
    accent: '#3b82f6',
    svg: (
      <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Grade de módulos */}
        <rect x="15" y="35" width="52" height="52" rx="6" fill="#1e2c3a" stroke="#3b82f6" strokeWidth="1.5"/>
        <text x="41" y="65" textAnchor="middle" fill="#3b82f6" fontSize="9">Cozinha</text>
        <rect x="75" y="35" width="52" height="52" rx="6" fill="#1e2c3a" stroke="#4ade80" strokeWidth="1.5"/>
        <text x="101" y="65" textAnchor="middle" fill="#4ade80" fontSize="9">Quarto</text>
        <rect x="135" y="35" width="52" height="52" rx="6" fill="#1e2c3a" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="161" y="65" textAnchor="middle" fill="#f59e0b" fontSize="9">Banho</text>
        {/* linha 2 */}
        <rect x="15" y="95" width="52" height="52" rx="6" fill="#1e2c3a" stroke="#a78bfa" strokeWidth="1.5"/>
        <text x="41" y="125" textAnchor="middle" fill="#a78bfa" fontSize="9">Sala</text>
        <rect x="75" y="95" width="52" height="52" rx="6" fill="#1e2c3a" stroke="#f472b6" strokeWidth="1.5"/>
        <text x="101" y="125" textAnchor="middle" fill="#f472b6" fontSize="9">Closet</text>
        {/* botão + */}
        <rect x="135" y="95" width="52" height="52" rx="6" fill="#263050" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,2"/>
        <text x="161" y="125" textAnchor="middle" fill="#3b82f6" fontSize="22">+</text>
      </svg>
    ),
  },
  {
    label: '03',
    title: 'Edição Completa',
    sub: 'Medidas, cores e ferragens',
    body: 'Controle total sobre cada peça: medidas em mm ou cm, material interno e externo, tipo de puxador, sistema de gaveta, fita de borda e mais.',
    bg: 'from-[#101a14] to-[#1a1030]',
    accent: '#4ade80',
    svg: (
      <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* painel de configuração */}
        <rect x="20" y="20" width="160" height="120" rx="8" fill="#131520" stroke="#2a3a4a" strokeWidth="1.5"/>
        {/* abas */}
        <rect x="24" y="24" width="36" height="16" rx="4" fill="#4ade80"/>
        <text x="42" y="35" textAnchor="middle" fill="#0f1620" fontSize="7" fontWeight="bold">Medidas</text>
        <rect x="62" y="24" width="36" height="16" rx="4" fill="#1e2c3a"/>
        <text x="80" y="35" textAnchor="middle" fill="#4a6a8a" fontSize="7">Cores</text>
        <rect x="100" y="24" width="36" height="16" rx="4" fill="#1e2c3a"/>
        <text x="118" y="35" textAnchor="middle" fill="#4a6a8a" fontSize="7">Ferragens</text>
        {/* campos */}
        <rect x="28" y="48" width="144" height="12" rx="3" fill="#1e2c3a"/>
        <text x="34" y="57" fill="#4ade80" fontSize="6">Largura</text>
        <text x="160" y="57" textAnchor="end" fill="#a0c0a0" fontSize="7">800 mm</text>
        <rect x="28" y="64" width="144" height="12" rx="3" fill="#1e2c3a"/>
        <text x="34" y="73" fill="#4ade80" fontSize="6">Altura</text>
        <text x="160" y="73" textAnchor="end" fill="#a0c0a0" fontSize="7">2200 mm</text>
        <rect x="28" y="80" width="144" height="12" rx="3" fill="#1e2c3a"/>
        <text x="34" y="89" fill="#4ade80" fontSize="6">Profundidade</text>
        <text x="160" y="89" textAnchor="end" fill="#a0c0a0" fontSize="7">600 mm</text>
        {/* botão confirmar */}
        <rect x="28" y="118" width="144" height="16" rx="4" fill="#4ade80"/>
        <text x="100" y="129" textAnchor="middle" fill="#0f1620" fontSize="8" fontWeight="bold">Adicionar ao Projeto</text>
      </svg>
    ),
  },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1

  const next = () => {
    if (!isLast) {
      setStep(step + 1)
    } else {
      localStorage.setItem('marceneiro3d_onboarding_done', 'true')
      onComplete()
    }
  }

  const skip = () => {
    localStorage.setItem('marceneiro3d_onboarding_done', 'true')
    onComplete()
  }

  return (
    <div className={`h-dvh bg-gradient-to-br ${slide.bg} flex flex-col overflow-hidden`} style={{ transition: 'background 0.5s ease' }}>
      {/* Skip top right */}
      <div className="flex justify-end px-6 pt-6">
        {!isLast && (
          <button
            type="button"
            onClick={skip}
            className="text-xs text-steel-500 hover:text-steel-300 transition-colors font-medium"
          >
            Pular
          </button>
        )}
      </div>

      {/* Ilustração */}
      <div className="flex-1 flex items-center justify-center px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -20 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-sm"
          >
            <div
              className="w-full aspect-[5/3] rounded-3xl overflow-hidden p-4"
              style={{ background: `radial-gradient(circle at 50% 40%, ${slide.accent}18 0%, transparent 70%)`, border: `1px solid ${slide.accent}33` }}
            >
              {slide.svg}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Conteúdo texto */}
      <div className="px-6 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${step}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="text-[11px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: slide.accent }}>
              {slide.label} — {slide.sub}
            </div>
            <h2 className="text-[1.6rem] font-extrabold text-steel-50 leading-tight tracking-tight mb-3">
              {slide.title}
            </h2>
            <p className="text-sm text-steel-400 leading-relaxed">
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-2 my-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8' : 'w-1.5 bg-steel-700'}`}
              style={step === i ? { background: slide.accent, width: '2rem' } : {}}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={next}
          className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold py-4 text-sm transition-all active:scale-[0.98] shadow-xl"
          style={{ background: slide.accent, color: '#0f1620', boxShadow: `0 8px 32px ${slide.accent}44` }}
        >
          {isLast ? (
            <>
              <span>Começar a projetar</span>
              <Check size={16} />
            </>
          ) : (
            <>
              <span>Avançar</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
