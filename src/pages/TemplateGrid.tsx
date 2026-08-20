// Biblioteca de módulos prontos (Seção 11.2) — grade de cards; nunca uma
// tela em branco. Tocar num card abre o módulo já montado na tela de ajuste.
// Atualizado com renders isométricos 3D com luz, sombras e texturas de madeira realistas.

import { useState, useEffect } from 'react'
import type { ModuloConfig } from '../engine/types'
import { MODULE_TEMPLATES, type ModuleTemplate } from '../engine/templates'
import { materialColor } from '../three/colors'

interface TemplateGridProps {
  onSelect: (template: ModuleTemplate, config: ModuloConfig) => void
  projectAmbiente?: string
  onBack: () => void
  backLabel?: string
}

export function TemplateGrid({ onSelect, onBack, backLabel = 'Início' }: TemplateGridProps) {
  // Load personal templates from localStorage (sorted by uso, most used first)
  const [activeAmbiente, setActiveAmbiente] = useState<string>('todos')
  const [personalTemplates, setPersonalTemplates] = useState<Array<{
    id: string
    nome: string
    config: ModuloConfig
    uso: number
  }>>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('marceneiro3d_personal_templates')
      if (raw) {
        const all = JSON.parse(raw) as Array<{ id: string; nome: string; config: ModuloConfig; uso?: number }>
        const sorted = all.sort((a, b) => (b.uso ?? 0) - (a.uso ?? 0))
        setPersonalTemplates(sorted as any)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleSelectPersonal = (tpl: typeof personalTemplates[number]) => {
    // Increment uso
    try {
      const raw = localStorage.getItem('marceneiro3d_personal_templates')
      if (raw) {
        const all = JSON.parse(raw) as Array<{ id: string; nome: string; config: ModuloConfig; uso?: number }>
        const updated = all.map((t) => t.id === tpl.id ? { ...t, uso: (t.uso ?? 0) + 1 } : t)
        localStorage.setItem('marceneiro3d_personal_templates', JSON.stringify(updated))
      }
    } catch {
      // ignore
    }
    onSelect({ id: tpl.id, nome: tpl.nome, descricao: 'Template pessoal', cria: () => tpl.config }, tpl.config)
  }
  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-16">
      <header className="mb-6">
        <button type="button" onClick={onBack} className="text-sm text-steel-400 hover:text-steel-200">
          ← {backLabel}
        </button>
        <h1 className="text-2xl font-bold mt-1 text-steel-50">Novo módulo</h1>
        <p className="text-sm text-steel-400 mt-1">
          Escolha um modelo pronto e ajuste — nunca comece do zero.
        </p>
      </header>

      {personalTemplates.length > 0 && (
        <>
          <div className="mb-3 mt-2">
            <div className="text-xs font-bold text-wood-400 uppercase tracking-wider">Meus templates</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {personalTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectPersonal(tpl)}
                className="group text-left rounded-2xl border border-wood-500/30 bg-wood-500/5 overflow-hidden active:scale-[0.98] transition-all hover:border-wood-400/60 shadow-md"
              >
                <div className="h-28 flex items-center justify-center border-b border-wood-500/20 bg-gradient-to-b from-wood-950/60 to-steel-950 relative">
                  <div className="text-2xl opacity-50">📐</div>
                  {tpl.uso > 0 && (
                    <div className="absolute top-2 right-2 bg-wood-500/20 text-wood-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      ×{tpl.uso}
                    </div>
                  )}
                </div>
                <div className="p-3.5">
                  <div className="text-sm font-bold text-steel-100 group-hover:text-wood-400 transition-colors truncate">{tpl.nome}</div>
                  <div className="text-[10px] text-steel-500 mt-1 font-mono">
                    {tpl.config.largura / 10}×{tpl.config.altura / 10}×{tpl.config.profundidade / 10} cm
                  </div>
                  <div className="text-[9px] text-wood-500 mt-1 uppercase font-bold tracking-wider">Meu padrão</div>
                </div>
              </button>
            ))}
          </div>
          <div className="mb-3">
            <div className="text-xs font-bold text-steel-400 uppercase tracking-wider">Módulos do sistema</div>
          </div>
        </>
      )}

      
      {/* Filtro de Ambientes */}
      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar shrink-0 mb-2">
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'cozinha', label: '🍳 Cozinha' },
          { id: 'dormitorio', label: '🛏️ Quarto' },
          { id: 'banheiro', label: '🛁 Banheiro' },
          { id: 'sala', label: '🛋️ Sala' },
          { id: 'area_servico', label: '🪣 Serviço' },
        ].map(a => (
          <button
            key={a.id}
            type="button"
            onClick={() => setActiveAmbiente(a.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeAmbiente === a.id ? 'bg-wood-500 text-steel-50 shadow-sm' : 'bg-steel-800/40 border border-steel-750 text-steel-400 hover:text-steel-100'}`}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">

        {MODULE_TEMPLATES.filter(t => activeAmbiente === 'todos' || t.ambiente === activeAmbiente).map((t) => {
          const cfg = t.cria()
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t, cfg)}
              className="group text-left rounded-2xl border border-steel-750 bg-steel-800/40 overflow-hidden active:scale-[0.98] transition-all hover:border-steel-600/80 shadow-md"
            >
              <div className="h-36 grid place-items-center border-b border-steel-750 bg-gradient-to-b from-[#181d29] to-[#11141e] p-2 relative overflow-hidden">
                <PreviewChip templateId={t.id} color={materialColor(cfg.materialExterno)} />
              </div>
              <div className="p-3.5">
                <div className="text-sm font-bold text-steel-100 group-hover:text-wood-400 transition-colors">{t.nome}</div>
                <div className="text-xs text-steel-400 mt-1 line-clamp-2 leading-relaxed">{t.descricao}</div>
                <div className="text-[10px] text-steel-500 mt-2.5 font-mono">
                  {cfg.largura / 10}×{cfg.altura / 10}×{cfg.profundidade / 10} cm
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PreviewChip({ templateId, color }: { templateId: string; color: string }) {
  // Gradientes e cores para simular volumetria 3D realista
  const woodLight = color
  const woodDark = adjustBrightness(color, -25)
  const woodTop = adjustBrightness(color, 15)
  const shadow = 'rgba(0, 0, 0, 0.4)'
  const handleColor = '#b0b5c0'
  const internalColor = '#e5dec9' // MDF Interno Branco TX

  switch (templateId) {
    case 'balcao_2p':
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          {/* Sombrinha no chão */}
          <ellipse cx="60" cy="85" rx="35" ry="8" fill={shadow} opacity="0.6" filter="blur(3px)" />

          {/* Lateral Esquerda (Sombra) */}
          <path d="M 25 35 L 25 75 L 50 82 L 50 42 Z" fill={woodDark} />

          {/* Frentes / Portas (Luz frontal) */}
          <path d="M 50 42 L 50 82 L 72 73 L 72 33 Z" fill={woodLight} />
          <path d="M 72 33 L 72 73 L 95 64 L 95 24 Z" fill={woodLight} />

          {/* Tampo Superior (Isométrico luz topo) */}
          <path d="M 25 35 L 50 42 L 95 24 L 70 17 Z" fill="#4e3620" /> {/* Madeira escura de tampo */}

          {/* Rodapé */}
          <path d="M 28 75 L 28 80 L 48 85 L 48 80 Z" fill="#13151c" />
          <path d="M 48 80 L 48 85 L 92 68 L 92 63 Z" fill="#1c202a" />

          {/* Puxadores Gola horizontal no topo das portas */}
          <path d="M 52 42 L 70 35 L 70 36.5 L 52 43.5 Z" fill={handleColor} />
          <path d="M 74 33 L 93 25.5 L 93 27 L 74 34.5 Z" fill={handleColor} />
        </svg>
      )
    case 'balcao_2p_2g':
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <ellipse cx="60" cy="85" rx="35" ry="8" fill={shadow} opacity="0.6" filter="blur(3px)" />
          {/* Caixa */}
          <path d="M 25 35 L 25 75 L 50 82 L 50 42 Z" fill={woodDark} />
          <path d="M 25 35 L 50 42 L 95 24 L 70 17 Z" fill="#4e3620" />
          <path d="M 28 75 L 28 80 L 48 85 L 48 80 Z" fill="#13151c" />
          <path d="M 48 80 L 48 85 L 92 68 L 92 63 Z" fill="#1c202a" />

          {/* Gaveta Superior 1 */}
          <path d="M 50 42 L 50 52 L 72 44.5 L 72 34.5 Z" fill={woodLight} />
          {/* Gaveta Superior 2 */}
          <path d="M 72 34.5 L 72 44.5 L 95 37 L 95 27 Z" fill={woodLight} />

          {/* Portas Inferiores */}
          <path d="M 50 54 L 50 82 L 72 74.5 L 72 46.5 Z" fill={woodLight} />
          <path d="M 72 46.5 L 72 74.5 L 95 67 L 95 39 Z" fill={woodLight} />

          {/* Puxadores */}
          <path d="M 52 42.5 L 70 36 Z" stroke={handleColor} strokeWidth="1.5" />
          <path d="M 74 35 L 93 28.5 Z" stroke={handleColor} strokeWidth="1.5" />
          <path d="M 52 54.5 L 70 48 Z" stroke={handleColor} strokeWidth="1.5" />
          <path d="M 74 47 L 93 40.5 Z" stroke={handleColor} strokeWidth="1.5" />
        </svg>
      )
    case 'gaveteiro':
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <ellipse cx="60" cy="85" rx="28" ry="7" fill={shadow} opacity="0.6" filter="blur(3px)" />
          {/* Caixa lateral e topo */}
          <path d="M 35 25 L 35 72 L 55 79 L 55 32 Z" fill={woodDark} />
          <path d="M 35 25 L 55 32 L 85 20 L 65 13 Z" fill={woodTop} />
          {/* Rodapé */}
          <path d="M 38 72 L 38 76 L 53 81 L 53 77 Z" fill="#13151c" />
          <path d="M 53 77 L 53 81 L 82 70 L 82 66 Z" fill="#1c202a" />

          {/* 4 Gavetas */}
          <path d="M 55 33 L 55 43 L 83 33 L 83 23 Z" fill={woodLight} />
          <path d="M 55 44 L 55 54 L 83 44 L 83 34 Z" fill={woodLight} />
          <path d="M 55 55 L 55 65 L 83 55 L 83 45 Z" fill={woodLight} />
          <path d="M 55 66 L 55 76 L 83 66 L 83 56 Z" fill={woodLight} />

          {/* Puxadores de gaveta horizontais no centro */}
          <path d="M 64 36 L 74 32.5 Z" stroke={handleColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M 64 47 L 74 43.5 Z" stroke={handleColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M 64 58 L 74 54.5 Z" stroke={handleColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M 64 69 L 74 65.5 Z" stroke={handleColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'armario_2p':
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <ellipse cx="60" cy="85" rx="32" ry="7" fill={shadow} opacity="0.6" filter="blur(3px)" />
          {/* Caixa lateral e topo */}
          <path d="M 30 20 L 30 70 L 55 78 L 55 28 Z" fill={woodDark} />
          <path d="M 30 20 L 55 28 L 90 16 L 65 8 Z" fill={woodTop} />
          <path d="M 33 70 L 33 75 L 53 81 L 53 76 Z" fill="#13151c" />
          <path d="M 53 76 L 53 81 L 87 69 L 87 64 Z" fill="#1c202a" />

          {/* 2 Portas Altas */}
          <path d="M 55 29 L 55 76 L 71 70.5 L 71 23.5 Z" fill={woodLight} />
          <path d="M 71 23.5 L 71 70.5 L 87 65 L 87 18 Z" fill={woodLight} />

          {/* Puxador Alça Vertical */}
          <path d="M 69 42 L 69 54" stroke={handleColor} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 73 40.5 L 73 52.5" stroke={handleColor} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'aereo_2p':
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          {/* Caixa lateral e topo suspensa */}
          <path d="M 30 15 L 30 55 L 55 63 L 55 23 Z" fill={woodDark} />
          <path d="M 30 15 L 55 23 L 90 11 L 65 3 Z" fill={woodTop} />

          {/* Portas sem puxador aparente (Tip-on / Base recuada) */}
          <path d="M 55 24 L 55 61 L 71 55.5 L 71 18.5 Z" fill={woodLight} />
          <path d="M 71 18.5 L 71 55.5 L 87 50 L 87 13 Z" fill={woodLight} />

          {/* Canal do puxador na parte inferior */}
          <path d="M 55 61 L 87 50" stroke="#13151c" strokeWidth="1.5" />
        </svg>
      )
    case 'torre':
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <ellipse cx="60" cy="90" rx="25" ry="6" fill={shadow} opacity="0.6" filter="blur(3px)" />
          {/* Caixa super alta */}
          <path d="M 38 10 L 38 80 L 55 86 L 55 16 Z" fill={woodDark} />
          <path d="M 38 10 L 55 16 L 82 6 L 65 0 Z" fill={woodTop} />
          <path d="M 55 86 L 80 77" stroke="#13151c" strokeWidth="2" />

          {/* Porta Superior Pequena */}
          <path d="M 55 17 L 55 35 L 80 26.5 L 80 8.5 Z" fill={woodLight} />

          {/* Nicho de microondas/forno interno (mostrando fundo Branco TX) */}
          <path d="M 55 36.5 L 55 51.5 L 80 43 L 80 28 Z" fill={internalColor} />
          <path d="M 55 36.5 L 63 32 L 63 47 L 55 51.5 Z" fill="#c4beaa" /> {/* Lateral interna sombreada */}

          {/* Portas Inferiores */}
          <path d="M 55 53 L 55 83 L 80 74.5 L 80 44.5 Z" fill={woodLight} />

          {/* Detalhes de Puxador */}
          <path d="M 78 21 L 78 24" stroke={handleColor} strokeWidth="1.5" />
          <path d="M 78 58 L 78 66" stroke={handleColor} strokeWidth="1.5" />
        </svg>
      )
    case 'guarda_roupa_4p':
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <ellipse cx="60" cy="90" rx="40" ry="8" fill={shadow} opacity="0.6" filter="blur(3px)" />
          {/* Caixa isométrica guarda-roupa amplo */}
          <path d="M 22 15 L 22 76 L 47 84 L 47 23 Z" fill={woodDark} />
          <path d="M 22 15 L 47 23 L 98 9 L 73 1 Z" fill={woodTop} />
          <path d="M 47 84 L 96 70" stroke="#13151c" strokeWidth="2.5" />

          {/* 4 Portas */}
          <path d="M 47 24 L 47 82 L 59 78.5 L 59 20.5 Z" fill={woodLight} />
          <path d="M 59 20.5 L 59 78.5 L 71 75 L 71 17 Z" fill={woodLight} />
          <path d="M 71 17 L 71 75 L 83 71.5 L 83 13.5 Z" fill={woodLight} />
          <path d="M 83 13.5 L 83 71.5 L 95 68 L 95 10 Z" fill={woodLight} />

          {/* Puxadores de Perfil grandes centrais */}
          <path d="M 58 40 L 58 60" stroke={handleColor} strokeWidth="1.5" />
          <path d="M 60 40 L 60 60" stroke={handleColor} strokeWidth="1.5" />
          <path d="M 82 33 L 82 53" stroke={handleColor} strokeWidth="1.5" />
          <path d="M 84 33 L 84 53" stroke={handleColor} strokeWidth="1.5" />
        </svg>
      )
    case 'pia_pedra':
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <ellipse cx="60" cy="85" rx="42" ry="7" fill={shadow} opacity="0.6" filter="blur(3px)" />
          {/* Caixa de balcão de madeira abaixo */}
          <path d="M 20 45 L 20 75 L 50 83 L 50 53 Z" fill={woodDark} />
          <path d="M 50 53 L 50 83 L 100 68 L 100 38 Z" fill={woodLight} />
          
          {/* Tampo de Pedra (Granito Cinza/Preto) */}
          <path d="M 18 42 L 48 50 L 102 34 L 72 26 Z" fill="#2c2c2c" />
          <path d="M 18 42 L 18 45 L 48 53 L 48 50 Z" fill="#1f1f1f" />
          <path d="M 48 50 L 48 53 L 102 37 L 102 34 Z" fill="#1f1f1f" />

          {/* Recorte da Cuba com preenchimento cinza metálico */}
          <path d="M 40 40 L 52 44 L 75 37 L 63 33 Z" fill="#555" />
          <path d="M 43 41 L 51 43 L 72 37 L 64 34 Z" fill="#888" />
        </svg>
      )

    case 'home_rack':
      return (
        <svg viewBox="0 0 120 100" className="w-full h-full">
          <ellipse cx="60" cy="85" rx="42" ry="7" fill={shadow} opacity="0.6" filter="blur(3px)" />
          {/* Caixa de Rack baixa e longa */}
          <path d="M 15 42 L 15 70 L 45 79 L 45 51 Z" fill={woodDark} />
          <path d="M 15 42 L 45 51 L 105 33 L 75 24 Z" fill={woodTop} />
          <path d="M 45 79 L 102 63" stroke="#13151c" strokeWidth="2.5" />

          {/* Porta Lateral 1 */}
          <path d="M 45 52 L 45 77.5 L 63 72.5 L 63 47 Z" fill={woodLight} />

          {/* Nicho Aberto Central com Divisória Prateleira */}
          <path d="M 64 46.5 L 64 72 L 83 66.5 L 83 41 Z" fill="#13151c" />
          <path d="M 64 58.5 L 83 53" stroke={woodDark} strokeWidth="2" /> {/* Prateleira interna */}

          {/* Porta Lateral 2 */}
          <path d="M 84 40.5 L 84 66 L 102 61 L 102 35.5 Z" fill={woodLight} />
        </svg>
      )
    default:
      return null
  }
}

// Utilitário para clarear ou escurecer as cores MDF dinamicamente simulando luz isométrica
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}
