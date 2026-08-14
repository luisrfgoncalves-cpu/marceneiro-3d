# Marceneiro 3D — Motor Paramétrico de Marcenaria

Web app **mobile-first** de criação rápida de projetos de marcenaria planejada, com **preview 3D ao vivo**, para apresentar propostas ao cliente durante o atendimento. Ferramenta de pré-venda — o projeto definitivo é refeito no Promob após aprovação.

Documento-fonte: **spec v2.0** (sempre consultar antes de mexer no motor).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Three.js + @react-three/fiber + drei (3D web, carregado sob demanda)
- Supabase (PostgreSQL) — schema em `supabase/migrations/`
- Vitest (testes do motor)

## Funcionalidades (Milestone 1)

- **Motor paramétrico puro** (`src/engine/`) — recebe a config do módulo e devolve a lista de peças com dimensão/posição. Zero dependência de 3D.
- **Biblioteca de módulos prontos** — o marceneiro nunca começa do zero (Seção 11.1–11.2).
- **Divulgação progressiva** — painel Básico (dimensões, portas, gavetas, cores) e bloco **Avançado** colapsado que só renderiza quando expandido (Seção 11.3).
- **Preview 3D ao vivo** — ajustes refletem sem botão "aplicar" (Seção 11.5), com `InstancedMesh` para peças repetidas (Seção 10).
- **Regras técnicas implementadas**: 4 sistemas de fundo (5.1), 2 de gaveta (5.2), vãos 4/3/3mm (5.8), dobradiças a 10cm com realocação em conflito (4.1), taponamento só nas laterais (5.3), limite de chapa com alerta (5.10), área molhada sem fundo (6.3).

## Como rodar

```bash
npm install
npm run dev
```

## Variáveis de ambiente

```
VITE_SUPABASE_URL=seu_projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

Sem `.env`, o app roda **offline** com os valores padrão do domínio embarcados (o motor lê tudo da camada de regras, nunca de constante fixa — Seção 2).

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção (tsc + vite)
npm run lint     # linter (oxlint)
npm run test     # testes do motor (vitest)
```

## Estrutura

```
supabase/migrations/   # schema + seed (valores padrão das Seções 3–9)
src/engine/            # MOTOR — JS puro: regras, módulos, validação, computeModule
src/three/             # CAMADA 3D — só lê a lista de peças do motor
src/pages/             # TemplateGrid (biblioteca) + ModuleAdjuster (ajuste + 3D)
src/components/        # controles de UI reutilizáveis
```

## Arquitetura (Seção 10)

O motor paramétrico calcula apenas números (dimensão + posição de cada peça). A camada 3D apenas desenha essa lista. Erro visual = problema de render; erro de medida = problema do motor — nunca os dois lugares ao mesmo tempo.

## Deploy

Vercel, branch `main`. Configuração já presente em `vercel.json` (SPA fallback).
