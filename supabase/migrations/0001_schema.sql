-- Schema conceitual do Motor Paramétrico de Marcenaria (Seção 8 da spec v2.0)
-- Convenções (mesmas do app irmão corte-sobmedida):
--   - identificadores camelCase entre aspas
--   - PK texto gerado no cliente, coluna "userId"
--   - RLS habilitado com política anon aberta (autenticação multi-tenant vem
--     em milestone posterior, junto com a funcionalidade de templates pessoais)

-- Regras do domínio — padrão de configurabilidade (Seção 2):
-- valor_padrao + editavel + valor_customizado + unidade.
create table if not exists "regras_config" (
  id text primary key,
  "key" text not null unique,
  valor_padrao numeric not null,
  editavel boolean not null default true,
  valor_customizado numeric,
  unidade text not null default 'mm',
  descricao text,
  "userId" text,
  updated_at timestamptz not null default now()
);

-- Catálogo de tipos de módulo + parâmetros permitidos e limites (min/max).
create table if not exists "modulo_tipos" (
  id text primary key,
  nome text not null,
  descricao text,
  parametros jsonb not null default '{}',
  limites jsonb not null default '{}',
  miniatura text,
  created_at timestamptz not null default now()
);

-- Regras padrão por ambiente (com/sem fundo, rodapé padrão, etc.).
create table if not exists "ambiente_regras_padrao" (
  ambiente text primary key,
  com_fundo boolean not null default true,
  rodape_padrao text,
  regras jsonb not null default '{}'
);

-- Materiais: MDF/MDP/hidrófugo/ultra (Seção 3.1).
create table if not exists "materiais" (
  id text primary key,
  nome text not null,
  tipo text not null, -- MDF | MDP | hidrofugo | ultra
  espessura numeric not null,
  fabricante text,
  linha text,
  cor text,
  acabamento text, -- brilho | fosco | textura
  face text, -- unica | dupla
  preco_m2 numeric,
  "userId" text,
  created_at timestamptz not null default now()
);

-- Fitas de borda (Seção 3.2) — sempre correspondentes à cor do MDF.
create table if not exists "fitas_borda" (
  id text primary key,
  material_id text references "materiais" (id) on delete set null,
  espessura numeric not null,
  cor text not null,
  fabricante text,
  preco_unitario numeric,
  "userId" text
);

-- Pedras e mármores (Seção 3.3) — catálogo aberto.
create table if not exists "pedras" (
  id text primary key,
  tipo text not null, -- granito | quartzo | marmore
  cor text not null,
  espessuras numeric[] not null default '{}',
  preco_m2 numeric
);

-- Ferragens (Seção 4).
create table if not exists "ferragens" (
  id text primary key,
  categoria text not null, -- dobradica | corredica | puxador | pistao | trilho | iluminacao | rodizio | fechadura | outro
  subtipo text,
  marca text,
  medidas text,
  cor text,
  preco_unitario numeric,
  "userId" text
);

-- Tabela mestre de parafusos por junção (Seção 4.9).
create table if not exists "parafusos_fixacao" (
  id text primary key,
  juncao text not null,
  medida text not null,
  tipo text,
  observacao text
);

-- Sistemas de montagem (Seção 5) — fundo e gaveta, com regras de folga/rebaixo.
create table if not exists "sistemas_montagem" (
  id text primary key,
  tipo text not null, -- fundo | gaveta
  nome text not null,
  regras jsonb not null default '{}',
  ativo boolean not null default true
);

-- Projetos (Seção 8 / 11.7) — sempre por ambiente, não peças avulsas.
create table if not exists "projects" (
  id text primary key,
  nome text not null,
  ambiente text,
  cliente text,
  status text not null default 'rascunho',
  "userId" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Instância de módulo dentro de um projeto — config completa (JSON) + posição.
create table if not exists "project_modules" (
  id text primary key,
  project_id text references "projects" (id) on delete cascade,
  modulo_tipo text not null,
  config jsonb not null default '{}',
  posicao jsonb not null default '{}', -- { x, y, rotacao } — Seção 11.9
  ordem integer not null default 0
);

-- Peças calculadas de cada módulo (Saída do motor — Seção 9).
create table if not exists "project_module_pecas" (
  id text primary key,
  module_id text references "project_modules" (id) on delete cascade,
  nome text not null,
  dimensao jsonb not null,
  posicao jsonb not null,
  rotacao jsonb not null default '{}',
  material_id text,
  veio text,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_modules_project on "project_modules" (project_id);
create index if not exists idx_pecas_module on "project_module_pecas" (module_id);
create index if not exists idx_regras_user on "regras_config" ("userId");

-- RLS habilitado com política aberta para anon (sem auth ainda — mesmo padrão
-- do app irmão; isolamento por conta será aplicado com Auth em milestone futuro).
alter table "regras_config" enable row level security;
alter table "modulo_tipos" enable row level security;
alter table "ambiente_regras_padrao" enable row level security;
alter table "materiais" enable row level security;
alter table "fitas_borda" enable row level security;
alter table "pedras" enable row level security;
alter table "ferragens" enable row level security;
alter table "parafusos_fixacao" enable row level security;
alter table "sistemas_montagem" enable row level security;
alter table "projects" enable row level security;
alter table "project_modules" enable row level security;
alter table "project_module_pecas" enable row level security;

create policy "anon select regras_config" on "regras_config" for select to anon using (true);
create policy "anon insert regras_config" on "regras_config" for insert to anon with check (true);
create policy "anon update regras_config" on "regras_config" for update to anon using (true);
create policy "anon delete regras_config" on "regras_config" for delete to anon using (true);

create policy "anon all modulo_tipos" on "modulo_tipos" for all to anon using (true) with check (true);
create policy "anon all ambiente_regras_padrao" on "ambiente_regras_padrao" for all to anon using (true) with check (true);
create policy "anon all materiais" on "materiais" for all to anon using (true) with check (true);
create policy "anon all fitas_borda" on "fitas_borda" for all to anon using (true) with check (true);
create policy "anon all pedras" on "pedras" for all to anon using (true) with check (true);
create policy "anon all ferragens" on "ferragens" for all to anon using (true) with check (true);
create policy "anon all parafusos_fixacao" on "parafusos_fixacao" for all to anon using (true) with check (true);
create policy "anon all sistemas_montagem" on "sistemas_montagem" for all to anon using (true) with check (true);
create policy "anon all projects" on "projects" for all to anon using (true) with check (true);
create policy "anon all project_modules" on "project_modules" for all to anon using (true) with check (true);
create policy "anon all project_module_pecas" on "project_module_pecas" for all to anon using (true) with check (true);
