-- Modelo de dados de UX (Seção 11.9): clientes, templates e sugestões por ambiente.

-- Clientes — vinculado a um ou mais projects.
create table if not exists "clientes" (
  id text primary key,
  nome text not null,
  contato text,
  "userId" text,
  created_at timestamptz not null default now()
);

-- Templates prontos do sistema (Seção 11.2) — ponto de partida de cada módulo.
create table if not exists "modulo_templates" (
  id text primary key,
  nome text not null,
  descricao text,
  miniatura text,
  modulo_tipo text not null,
  config jsonb not null default '{}',
  ambiente_sugerido text,
  "userId" text
);

-- Templates pessoais do marceneiro (Seção 11.8) — vinculado à marcenaria/usuário.
create table if not exists "marcenaria_templates" (
  id text primary key,
  nome text not null,
  miniatura text,
  config jsonb not null default '{}',
  uso integer not null default 0,
  marcenaria_id text,
  "userId" text,
  created_at timestamptz not null default now()
);

-- Sugestões de módulos por ambiente (Seção 11.4 passo 2).
create table if not exists "ambiente_sugestoes" (
  ambiente text not null,
  template_id text not null,
  ordem integer not null default 0,
  primary key (ambiente, template_id)
);

alter table "clientes" enable row level security;
alter table "modulo_templates" enable row level security;
alter table "marcenaria_templates" enable row level security;
alter table "ambiente_sugestoes" enable row level security;

create policy "anon all clientes" on "clientes" for all to anon using (true) with check (true);
create policy "anon all modulo_templates" on "modulo_templates" for all to anon using (true) with check (true);
create policy "anon all marcenaria_templates" on "marcenaria_templates" for all to anon using (true) with check (true);
create policy "anon all ambiente_sugestoes" on "ambiente_sugestoes" for all to anon using (true) with check (true);

-- Seed de sugestões por ambiente (espelha src/engine/environment.ts)
insert into "ambiente_sugestoes" (ambiente, template_id, ordem) values
  ('cozinha', 'balcao_2p_2g', 0),
  ('cozinha', 'balcao_2p', 1),
  ('cozinha', 'balcao_2p', 2),
  ('dormitorio', 'gaveteiro', 0),
  ('dormitorio', 'gaveteiro', 1),
  ('banheiro', 'balcao_2p', 0),
  ('area_servico', 'balcao_2p_2g', 0)
on conflict (ambiente, template_id) do nothing;
