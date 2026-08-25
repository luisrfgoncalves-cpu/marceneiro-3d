-- Políticas RLS seguras baseadas em auth.uid() para isolamento multitenant (Milestone de Segurança)

-- 1. Drop das políticas antigas vulneráveis (anon all/true)
drop policy if exists "anon all projects" on "projects";
drop policy if exists "anon all project_modules" on "project_modules";
drop policy if exists "anon all project_module_pecas" on "project_module_pecas";
drop policy if exists "anon all clientes" on "clientes";
drop policy if exists "anon all marcenaria_templates" on "marcenaria_templates";
drop policy if exists "anon all regras_config" on "regras_config";
drop policy if exists "anon select regras_config" on "regras_config";
drop policy if exists "anon insert regras_config" on "regras_config";
drop policy if exists "anon update regras_config" on "regras_config";
drop policy if exists "anon delete regras_config" on "regras_config";

-- 2. Políticas para "projects"
create policy "Users can view their own projects" on "projects"
  for select to authenticated using (auth.uid()::text = "userId");

create policy "Users can insert their own projects" on "projects"
  for insert to authenticated with check (auth.uid()::text = "userId");

create policy "Users can update their own projects" on "projects"
  for update to authenticated using (auth.uid()::text = "userId") with check (auth.uid()::text = "userId");

create policy "Users can delete their own projects" on "projects"
  for delete to authenticated using (auth.uid()::text = "userId");

-- 3. Políticas para "project_modules" (associado ao project)
create policy "Users can view modules of their own projects" on "project_modules"
  for select to authenticated using (
    exists (
      select 1 from "projects"
      where "projects".id = "project_modules".project_id
        and "projects"."userId" = auth.uid()::text
    )
  );

create policy "Users can insert modules to their own projects" on "project_modules"
  for insert to authenticated with check (
    exists (
      select 1 from "projects"
      where "projects".id = "project_modules".project_id
        and "projects"."userId" = auth.uid()::text
    )
  );

create policy "Users can update modules of their own projects" on "project_modules"
  for update to authenticated using (
    exists (
      select 1 from "projects"
      where "projects".id = "project_modules".project_id
        and "projects"."userId" = auth.uid()::text
    )
  ) with check (
    exists (
      select 1 from "projects"
      where "projects".id = "project_modules".project_id
        and "projects"."userId" = auth.uid()::text
    )
  );

create policy "Users can delete modules of their own projects" on "project_modules"
  for delete to authenticated using (
    exists (
      select 1 from "projects"
      where "projects".id = "project_modules".project_id
        and "projects"."userId" = auth.uid()::text
    )
  );

-- 4. Políticas para "project_module_pecas" (associado ao module -> project)
create policy "Users can view pieces of their own projects" on "project_module_pecas"
  for select to authenticated using (
    exists (
      select 1 from "project_modules"
      join "projects" on "projects".id = "project_modules".project_id
      where "project_modules".id = "project_module_pecas".module_id
        and "projects"."userId" = auth.uid()::text
    )
  );

create policy "Users can insert pieces to their own projects" on "project_module_pecas"
  for insert to authenticated with check (
    exists (
      select 1 from "project_modules"
      join "projects" on "projects".id = "project_modules".project_id
      where "project_modules".id = "project_module_pecas".module_id
        and "projects"."userId" = auth.uid()::text
    )
  );

create policy "Users can update pieces of their own projects" on "project_module_pecas"
  for update to authenticated using (
    exists (
      select 1 from "project_modules"
      join "projects" on "projects".id = "project_modules".project_id
      where "project_modules".id = "project_module_pecas".module_id
        and "projects"."userId" = auth.uid()::text
    )
  ) with check (
    exists (
      select 1 from "project_modules"
      join "projects" on "projects".id = "project_modules".project_id
      where "project_modules".id = "project_module_pecas".module_id
        and "projects"."userId" = auth.uid()::text
    )
  );

create policy "Users can delete pieces of their own projects" on "project_module_pecas"
  for delete to authenticated using (
    exists (
      select 1 from "project_modules"
      join "projects" on "projects".id = "project_modules".project_id
      where "project_modules".id = "project_module_pecas".module_id
        and "projects"."userId" = auth.uid()::text
    )
  );

-- 5. Políticas para "clientes"
create policy "Users can view their own clients" on "clientes"
  for select to authenticated using (auth.uid()::text = "userId");

create policy "Users can insert their own clients" on "clientes"
  for insert to authenticated with check (auth.uid()::text = "userId");

create policy "Users can update their own clients" on "clientes"
  for update to authenticated using (auth.uid()::text = "userId") with check (auth.uid()::text = "userId");

create policy "Users can delete their own clients" on "clientes"
  for delete to authenticated using (auth.uid()::text = "userId");

-- 6. Políticas para "marcenaria_templates"
create policy "Users can view their own marcenaria templates" on "marcenaria_templates"
  for select to authenticated using (auth.uid()::text = "userId");

create policy "Users can insert their own marcenaria templates" on "marcenaria_templates"
  for insert to authenticated with check (auth.uid()::text = "userId");

create policy "Users can update their own marcenaria templates" on "marcenaria_templates"
  for update to authenticated using (auth.uid()::text = "userId") with check (auth.uid()::text = "userId");

create policy "Users can delete their own marcenaria templates" on "marcenaria_templates"
  for delete to authenticated using (auth.uid()::text = "userId");

-- 7. Políticas para "regras_config"
create policy "Users can view their own custom config rules" on "regras_config"
  for select to authenticated using (auth.uid()::text = "userId");

create policy "Users can insert their own custom config rules" on "regras_config"
  for insert to authenticated with check (auth.uid()::text = "userId");

create policy "Users can update their own custom config rules" on "regras_config"
  for update to authenticated using (auth.uid()::text = "userId") with check (auth.uid()::text = "userId");

create policy "Users can delete their own custom config rules" on "regras_config"
  for delete to authenticated using (auth.uid()::text = "userId");
