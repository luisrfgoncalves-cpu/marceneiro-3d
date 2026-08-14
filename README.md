# Marceneiro 3D — Motor Paramétrico de Marcenaria

Web app **mobile-first** de criação rápida de projetos de marcenaria planejada, com **preview 3D ao vivo**, para apresentar propostas ao cliente durante o atendimento. Ferramenta de pré-venda — o projeto definitivo é refeito no Promob após aprovação.

Documento-fonte: **spec v2.0** (sempre consultar antes de mexer no motor).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Three.js + @react-three/fiber + drei (3D web, carregado sob demanda)
- Supabase (PostgreSQL) — schema em `supabase/migrations/`
- Vitest (testes do motor)

## Funcionalidades (Milestones 1–3)

- **Motor paramétrico puro** (`src/engine/`) — recebe a config do módulo e devolve a lista de peças com dimensão/posição. Zero dependência de 3D.
- **Biblioteca de módulos prontos** — o marceneiro nunca começa do zero (Seção 11.1–11.2).
- **Divulgação progressiva** — painel Básico (dimensões, portas, gavetas, cores) e bloco **Avançado** colapsado que só renderiza quando expandido (Seção 11.3).
- **Preview 3D ao vivo** — ajustes refletem sem botão "aplicar" (Seção 11.5), com `InstancedMesh` para peças repetidas (Seção 10).
- **Regras técnicas implementadas**: 4 sistemas de fundo (5.1), 2 de gaveta (5.2), vãos 4/3/3mm (5.8), dobradiças a 10cm com realocação em conflito (4.1), taponamento só nas laterais (5.3), limite de chapa com alerta (5.10), área molhada sem fundo (6.3).
- **Módulos caixaria base+chapéu passam** (6.1): Armário, Aéreo, Torre, Guarda-roupa 4 portas.
- **Porta basculante + pistões a gás** (5.8/4.4).
- **Junção entre módulos vizinhos** (5.9): montante deitado (vão 5mm pedra) / de pé (3cm à mostra).
- **Fita por peça independente** (3.2): porta, prateleira, montante, fundo, topo.
- **Puxadores 7 tipos + tip-on** (4.3), **corrediças por medida** (4.2), **custo real por tipo**.
- **Orçamento instantâneo** (11.6): material m² + fitas m + ferragens un.
- **Projetos por ambiente** (11.7): módulos encostados, offset por largura efetiva.
- **Persistência à prova de falhas**: Supabase + fallback localStorage (nada se perde offline).
- **Unidade cm/mm**: preferência global, motor sempre em mm.

## Como rodar

```bash
npm install
npm run dev
```

## Variáveis de ambiente

Crie `.env` na raiz:

```
VITE_SUPABASE_URL=https://ef1bafc754f37fc50efc.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

- `VITE_SUPABASE_URL`: obtida em Project Settings > API (formato `https://<project-ref>.supabase.co`).
- `VITE_SUPABASE_ANON_KEY`: obtida em Project Settings > API (chave `anon` / `public`).

Sem `.env`, o app roda **offline** com os valores padrão do domínio embarcados (o motor lê tudo da camada de regras, nunca de constante fixa — Seção 2).

## Supabase — Aplicar migrações

As migrações estão em `supabase/migrations/` (0001_schema, 0002_seed, 0003_ux, 0004_ferragens).

Opção A — **Dashboard SQL Editor** (recomendado):
1. Abra o painel do Supabase > SQL Editor.
2. Execute cada arquivo `.sql` em ordem (0001 → 0004).
3. Verifique se as tabelas foram criadas e os seeds inseridos.

Opção B — **CLI** (se tiver Docker):
```bash
supabase link --project-ref <seu-project-ref>
supabase db push --include-all
```

Tabelas principais: `regras_config`, `modulo_tipos`, `ambiente_regras_padrao`, `materiais`, `fitas_borda`, `pedras`, `ferragens`, `parafusos_fixacao`, `sistemas_montagem`, `projects`, `project_modules`, `project_module_pecas`, `clientes`, `marcenaria_templates`, `ambiente_sugestoes`.

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
src/pages/             # Home, NewProject, Environment, TemplateGrid, ModuleAdjuster
src/components/        # controles de UI reutilizáveis + Budget
src/lib/               # persistence, prices, units, db
```

## Arquitetura (Seção 10)

O motor paramétrico calcula apenas números (dimensão + posição de cada peça). A camada 3D apenas desenha essa lista. Erro visual = problema de render; erro de medida = problema do motor — nunca os dois lugares ao mesmo tempo.

## Deploy (Vercel)

1. Conecte o repositório `luisrfgoncalves-cpu/marceneiro-3d` no Vercel.
2. Adicione as variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
3. Build command: `npm run build`, Output dir: `dist`.
4. O `vercel.json` já configura SPA fallback.
