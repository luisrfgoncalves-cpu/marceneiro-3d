-- M3 — Ferragens (Seção 4), fitas 35/64mm (3.2), MDF hidrófugo/ultra (3.1)
-- e novos tipos de módulo (Seção 11.2). Tudo apenas seed/parâmetros; nenhuma
-- regra hardcoded no motor.

-- ---------------------------------------------------------------------------
-- Novas regras da junção entre módulos vizinhos (Seção 5.9)
-- ---------------------------------------------------------------------------
insert into "regras_config" (id, "key", valor_padrao, editavel, unidade, descricao) values
  ('regra_porta_remonte_montante_deitado', 'porta.remonteMontanteDeitado', 13, true, 'mm', 'Porta remonta sobre montante deitado (Seção 5.9)'),
  ('regra_porta_remonte_montante_de_pe', 'porta.remonteMontanteDePe', 20, true, 'mm', 'Porta/frente remonta sobre montante de pé (Seção 5.9)'),
  ('regra_montante_mostra_de_pe', 'montante.mostraDePe', 30, true, 'mm', 'Montante de pé à mostra abaixo da porta (Seção 5.9)')
on conflict ("key") do nothing;

-- ---------------------------------------------------------------------------
-- Novos tipos de módulo (Seção 11.2 / 6.1)
-- ---------------------------------------------------------------------------
insert into "modulo_tipos" (id, nome, descricao, parametros, limites) values
  ('armario', 'Armário', 'Caixaria com base e chapéu passando (Seção 6.1)',
   '{"largura":true,"altura":true,"profundidade":true,"portas":true,"prateleiras":true,"sistemaFundo":true}',
   '{"largura":{"min":300,"max":2400},"altura":{"min":400,"max":2400},"profundidade":{"min":250,"max":700}}'),
  ('aereo', 'Aéreo', 'Armário suspenso, sem rodapé (Seção 11.2)',
   '{"largura":true,"altura":true,"profundidade":true,"portas":true,"prateleiras":true,"sistemaFundo":true}',
   '{"largura":{"min":300,"max":1600},"altura":{"min":300,"max":1200},"profundidade":{"min":250,"max":500}}'),
  ('torre', 'Torre', 'Módulo alto com prateleiras (torre quente)',
   '{"largura":true,"altura":true,"profundidade":true,"portas":true,"prateleiras":true,"sistemaFundo":true}',
   '{"largura":{"min":300,"max":1200},"altura":{"min":1500,"max":2600},"profundidade":{"min":250,"max":700}}'),
  ('guarda_roupa', 'Guarda-roupa', 'Grande com portas casal',
   '{"largura":true,"altura":true,"profundidade":true,"portas":true,"prateleiras":true,"sistemaFundo":true}',
   '{"largura":{"min":1200,"max":4000},"altura":{"min":1800,"max":2700},"profundidade":{"min":500,"max":800}}')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Materiais hidrófugo e ultra (Seção 3.1) + fitas 35/64mm (Seção 3.2)
-- ---------------------------------------------------------------------------
insert into "materiais" (id, nome, tipo, espessura, fabricante, linha, cor, acabamento, face, preco_m2) values
  ('mdf_hidrofugo_verde_18mm', 'MDF Hidrófugo Verde 18mm', 'hidrofugo', 18, 'Duratex', 'Hidrófugo', 'Verde', 'fosco', 'dupla', 165),
  ('mdf_ultra_18mm', 'MDF Ultra 18mm', 'ultra', 18, 'Berneck', 'Ultra', 'Branco', 'fosco', 'dupla', 190)
on conflict (id) do nothing;

insert into "fitas_borda" (id, material_id, espessura, cor, fabricante, preco_unitario) values
  ('fita_proadec_35mm_maderado_x', 'mdf_maderado_x_18mm', 35, 'Maderado X', 'Proadec', 4.2),
  ('fita_proadec_64mm_maderado_x', 'mdf_maderado_x_18mm', 64, 'Maderado X', 'Proadec', 6.0),
  ('fita_proadec_35mm_branco_tx', 'mdf_branco_tx_18mm', 35, 'Branco TX', 'Proadec', 3.2)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Ferragens (Seção 4) — corrediças por medida, puxadores por tipo e pistões
-- ---------------------------------------------------------------------------
insert into "ferragens" (id, categoria, subtipo, marca, medidas, cor, preco_unitario) values
  ('dobradica_curva_slow', 'dobradica', 'curva', 'FGV', '110°', '—', 12),
  ('corredica_30cm', 'corredica', 'telescopica', 'Häfele', '30cm', 'prata', 15),
  ('corredica_35cm', 'corredica', 'telescopica', 'Häfele', '35cm', 'prata', 17),
  ('corredica_40cm', 'corredica', 'telescopica', 'Häfele', '40cm', 'prata', 18),
  ('corredica_45cm', 'corredica', 'telescopica', 'Häfele', '45cm', 'prata', 20),
  ('corredica_50cm', 'corredica', 'telescopica', 'Häfele', '50cm', 'prata', 22),
  ('corredica_55cm', 'corredica', 'telescopica', 'Häfele', '55cm', 'prata', 24),
  ('corredica_60cm', 'corredica', 'telescopica', 'Häfele', '60cm', 'prata', 26),
  ('corredica_invisivel_slow', 'corredica', 'invisivel', 'Bigfer', '40cm', 'prata', 55),
  ('puxador_perfil_gola_anodizado', 'puxador', 'perfil_gola_anodizado', '—', '—', 'prata', 22),
  ('puxador_perfil_45_friso', 'puxador', 'perfil_45_friso', '—', '—', 'prata', 28),
  ('puxador_usinado_45', 'puxador', 'usinado_45', '—', '—', '—', 18),
  ('puxador_passante', 'puxador', 'passante', '—', '—', '—', 15),
  ('puxador_alca_convencional', 'puxador', 'alca_convencional', '—', '—', 'preto', 30),
  ('puxador_facetado_rometal', 'puxador', 'facetado_rometal', 'Rometal', '—', 'preto', 35),
  ('pistao_60h_normal', 'pistao', 'normal', 'TN', '60h', '—', 40),
  ('pistao_80h_normal', 'pistao', 'normal', 'TN', '80h', '—', 45),
  ('pistao_100h_inverso', 'pistao', 'inverso', 'Häfele', '100h', '—', 52),
  ('pistao_120h_inverso', 'pistao', 'inverso', 'Häfele', '120h', '—', 60)
on conflict (id) do nothing;
