-- 0006_public_sharing.sql
-- 1. Catalog tables select access to public (both anon and authenticated)
drop policy if exists "anon all modulo_tipos" on "modulo_tipos";
create policy "public select modulo_tipos" on "modulo_tipos" for select to public using (true);

drop policy if exists "anon all ambiente_regras_padrao" on "ambiente_regras_padrao";
create policy "public select ambiente_regras_padrao" on "ambiente_regras_padrao" for select to public using (true);

drop policy if exists "anon all materiais" on "materiais";
create policy "public select materiais" on "materiais" for select to public using (true);

drop policy if exists "anon all fitas_borda" on "fitas_borda";
create policy "public select fitas_borda" on "fitas_borda" for select to public using (true);

drop policy if exists "anon all pedras" on "pedras";
create policy "public select pedras" on "pedras" for select to public using (true);

drop policy if exists "anon all ferragens" on "ferragens";
create policy "public select ferragens" on "ferragens" for select to public using (true);

drop policy if exists "anon all parafusos_fixacao" on "parafusos_fixacao";
create policy "public select parafusos_fixacao" on "parafusos_fixacao" for select to public using (true);

drop policy if exists "anon all sistemas_montagem" on "sistemas_montagem";
create policy "public select sistemas_montagem" on "sistemas_montagem" for select to public using (true);

drop policy if exists "anon all modulo_templates" on "modulo_templates";
create policy "public select modulo_templates" on "modulo_templates" for select to public using (true);

drop policy if exists "anon all ambiente_sugestoes" on "ambiente_sugestoes";
create policy "public select ambiente_sugestoes" on "ambiente_sugestoes" for select to public using (true);

-- 2. Allow public select on projects, modules and pieces for viewing shared links
drop policy if exists "Users can view their own projects" on "projects";
create policy "Public can view projects" on "projects" for select to public using (true);

drop policy if exists "Users can view modules of their own projects" on "project_modules";
create policy "Public can view project modules" on "project_modules" for select to public using (true);

drop policy if exists "Users can view pieces of their own projects" on "project_module_pecas";
create policy "Public can view project module pieces" on "project_module_pecas" for select to public using (true);
