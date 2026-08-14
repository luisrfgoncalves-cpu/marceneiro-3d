-- Seed de valores padrão do domínio (Seções 3 a 9 da spec v2.0).
-- Estes são os valor_padrao iniciais; o marceneiro pode customizar qualquer
-- regra editavel (Seção 2). Nenhuma regra é hardcoded no motor.

-- ---------------------------------------------------------------------------
-- Regras do domínio (fonte da config do motor)
-- ---------------------------------------------------------------------------
insert into "regras_config" (id, "key", valor_padrao, editavel, unidade, descricao) values
  ('regra_fundo_espessura_padrao', 'fundo.espessuraPadrao', 6, false, 'mm', 'Fundo padrão de armário — sempre 6mm, Branco TX (Seção 3.1)'),
  ('regra_fundo_rebaixo_profundidade', 'fundo.rebaixoProfundidade', 7, true, 'mm', 'Rebaixo do fundo parafusado (Seção 5.1)'),
  ('regra_fundo_rebaixo_espaco', 'fundo.rebaixoEspaco', 1.3, true, 'mm', 'Espaço do rebaixo do fundo (Seção 5.1)'),
  ('regra_fundo_espessura_espesso', 'fundo.espessuraEspesso', 18, true, 'mm', 'Fundo espesso à mostra (Seção 5.1)'),
  ('regra_gaveta_contra_recuo', 'gaveta.contraRecuo', 5, true, 'mm', 'Contra-frente/contra-fundo recuadas (Seção 5.2)'),
  ('regra_gaveta_rebaixo_profundidade', 'gaveta.rebaixoProfundidade', 7, true, 'mm', 'Rebaixo nas laterais da gaveta telescópica (Seção 5.2)'),
  ('regra_gaveta_rebaixo_espaco', 'gaveta.rebaixoEspaco', 1.3, true, 'mm', 'Espaço do rebaixo da gaveta (Seção 5.2)'),
  ('regra_gaveta_rasgo_profundidade', 'gaveta.rasgoProfundidade', 7, true, 'mm', 'Rasgo do fundo em gaveta invisível (Seção 5.2)'),
  ('regra_gaveta_rasgo_largura', 'gaveta.rasgoLargura', 1.3, true, 'mm', 'Largura do rasgo em gaveta invisível (Seção 5.2)'),
  ('regra_gaveta_altura_padrao', 'gaveta.alturaPadrao', 140, true, 'mm', 'Altura padrão da gaveta (Seção 6.2)'),
  ('regra_gaveta_frente_altura', 'gaveta.frenteAltura', 155, true, 'mm', 'Altura da frente da gaveta (Seção 6.2)'),
  ('regra_gaveta_frente_gap', 'gaveta.frenteGap', 30, true, 'mm', 'Espaçamento entre frentes de gaveta (Seção 6.2)'),
  ('regra_gaveta_espessura_lateral', 'gaveta.espessuraLateral', 15, true, 'mm', 'Espessura da lateral da gaveta (Seção 5.2)'),
  ('regra_gaveta_frente_espessura', 'gaveta.frenteEspessura', 18, true, 'mm', 'Espessura da frente da gaveta'),
  ('regra_gaveta_fundo_espessura', 'gaveta.fundoEspessura', 6, true, 'mm', 'Espessura do fundo da gaveta (Seção 5.2)'),
  ('regra_gaveta_recuo_trilho', 'gaveta.recuoTrilho', 30, true, 'mm', 'Recuo da corrediça na profundidade da gaveta (Seção 4.2)'),
  ('regra_taponamento_overlap', 'taponamento.overlap', 60, true, 'mm', 'Sobreposição do taponamento sobre a lateral (Seção 5.3)'),
  ('regra_vao_frente_vertical', 'vao.frenteVertical', 4, true, 'mm', 'Vão entre portas/frentes fechadas (Seção 5.8)'),
  ('regra_vao_casal_vertical', 'vao.casalVertical', 3, true, 'mm', 'Vão entre portas casal (Seção 5.8)'),
  ('regra_vao_horizontal', 'vao.horizontal', 3, true, 'mm', 'Vão horizontal entre frentes (Seção 5.8)'),
  ('regra_porta_gap_lateral', 'porta.gapLateral', 2, true, 'mm', 'Vão entre porta e lateral (padrão configurável)'),
  ('regra_porta_gap_tampo', 'porta.gapTampo', 5, true, 'mm', 'Vão entre a peça e o tampo/pedra (Seção 5.9)'),
  ('regra_dobradica_ponta_distancia', 'dobradica.pontaDistancia', 100, true, 'mm', 'Primeira/última dobradiça a 10cm das pontas (Seção 4.1)'),
  ('regra_dobradica_copo_distancia_borda', 'dobradica.copoDistanciaBorda', 21.5, true, 'mm', 'Furo do copo até a borda da porta (Seção 4.1)'),
  ('regra_dobradica_copo_diametro', 'dobradica.copoDiametro', 35, true, 'mm', 'Diâmetro do copo (Seção 4.1)'),
  ('regra_dobradica_tolerancia_conflito', 'dobradica.toleranciaConflito', 40, true, 'mm', 'Tolerância para detectar conflito com prateleira (Seção 4.1)'),
  ('regra_montante_gaveteiro_largura', 'montante.gaveteiroLargura', 100, true, 'mm', 'Largura do montante do gaveteiro (Seção 6.2)'),
  ('regra_montante_espessura', 'montante.espessura', 18, true, 'mm', 'Espessura do montante'),
  ('regra_orelhinha_largura', 'orelhinha.largura', 30, true, 'mm', 'Orelhinha lateral (Seção 6.2)'),
  ('regra_frente_embutida_montante', 'frente.embutidaMontante', 6, true, 'mm', 'Frente de baixo embutida 6mm abaixo do montante (Seção 6.2)'),
  ('regra_tampo_espessura_padrao', 'tampo.espessuraPadrao', 18, true, 'mm', 'Espessura padrão do tampo (Seção 5.4)'),
  ('regra_rodape_altura_padrao', 'rodape.alturaPadrao', 100, true, 'mm', 'Altura padrão do rodapé (Seção 4.6)'),
  ('regra_rodape_espessura_padrao', 'rodape.espessuraPadrao', 18, true, 'mm', 'Espessura do rodapé MDF (Seção 4.6)'),
  ('regra_prateleira_folga', 'prateleira.folga', 3, true, 'mm', 'Folga da prateleira no vão (Seção 5.6)'),
  ('regra_prateleira_cantoneira_recuo', 'prateleira.cantoneiraRecuo', 50, true, 'mm', 'Recuo da cantoneira zamac (Seção 4.10)'),
  ('regra_chapa_largura_max', 'chapa.larguraMax', 2750, true, 'mm', 'Maior lado da chapa padrão (Seção 5.10)'),
  ('regra_chapa_altura_max', 'chapa.alturaMax', 1830, true, 'mm', 'Menor lado da chapa padrão (Seção 5.10)'),
  ('regra_maleiro_frente_altura', 'maleiro.frenteAltura', 100, true, 'mm', 'Altura da prateleira/maleiro do gaveteiro (Seção 6.2)'),
  ('regra_maleiro_frente_espessura', 'maleiro.frenteEspessura', 6, true, 'mm', 'Espessura da frente do maleiro (Seção 6.2)'),
  ('regra_sapateira_frente_altura', 'sapateira.frenteAltura', 45, true, 'mm', 'Altura da frente da sapateira (Seção 6.2)')
on conflict ("key") do nothing;

-- ---------------------------------------------------------------------------
-- Tipos de módulo (catálogo + limites)
-- ---------------------------------------------------------------------------
insert into "modulo_tipos" (id, nome, descricao, parametros, limites) values
  ('balcao', 'Balcão', 'Gabinete de cozinha/balcão com portas e/ou gavetas',
   '{"largura":true,"altura":true,"profundidade":true,"portas":true,"gavetas":true,"sistemaFundo":true,"taponamento":true,"rodape":true,"tampo":true}',
   '{"largura":{"min":300,"max":2400},"altura":{"min":300,"max":1200},"profundidade":{"min":300,"max":700}}'),
  ('gaveteiro', 'Gaveteiro de guarda-roupa', 'Gaveteiro com maleiro, sapateiras e montantes de 10cm',
   '{"largura":true,"altura":true,"profundidade":true,"gavetas":true,"orelhinha":true,"prateleiras":true,"sapateiras":true}',
   '{"largura":{"min":200,"max":1200},"altura":{"min":400,"max":2400},"profundidade":{"min":300,"max":700}}')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Regras padrão por ambiente (Seção 6.3 / 11.4)
-- ---------------------------------------------------------------------------
insert into "ambiente_regras_padrao" (ambiente, com_fundo, rodape_padrao, regras) values
  ('cozinha', true, 'mdf', '{"material": "MDF"}'),
  ('dormitorio', true, 'mdf', '{}'),
  ('banheiro', false, 'pedra', '{"material": "MDF hidrofugo"}'),
  ('area_servico', false, 'pedra', '{"material": "MDF hidrofugo"}'),
  ('sala', true, 'mdf', '{}')
on conflict (ambiente) do nothing;

-- ---------------------------------------------------------------------------
-- Tabela mestre de parafusos por junção (Seção 4.9)
-- ---------------------------------------------------------------------------
insert into "parafusos_fixacao" (id, juncao, medida, tipo, observacao) values
  ('pf_fundo', 'fixar_fundo', '3,5 × 20mm', 'parafuso', 'Fixação do fundo'),
  ('pf_tamponamento', 'tamponamento', '3,5 × 30mm', 'parafuso', 'Taponamento unindo lateral (15 ou 18mm)'),
  ('pf_dobradica_caixa', 'dobradica_caixa', '4 × 20mm', 'parafuso', 'Instalar dobradiça no armário (caixa)'),
  ('pf_dobradica_porta', 'dobradica_porta', '3,5 × 16mm', 'parafuso', 'Instalar dobradiça na porta'),
  ('pf_cantoneira', 'cantoneira_1furo', '3,5 × 16mm', 'parafuso', 'Fixar cantoneira de um furo'),
  ('pf_montagem', 'montagem_geral', '3,5 × 40mm', 'parafuso', 'Montagem geral entre painéis (ou 4 × 40mm)'),
  ('pf_cavilha', 'reforco_alinhamento', '8mm × 5cm', 'cavilha', 'Reforço/alinhamento (ou 4,5cm)')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Materiais (Seção 3.1) e fitas de borda (Seção 3.2) — referenciados pelos templates
-- ---------------------------------------------------------------------------
insert into "materiais" (id, nome, tipo, espessura, fabricante, linha, cor, acabamento, face, preco_m2) values
  ('mdf_branco_tx_15mm', 'MDF Branco TX 15mm', 'MDF', 15, 'Duratex', 'TX', 'Branco TX', 'fosco', 'dupla', 120),
  ('mdf_branco_tx_18mm', 'MDF Branco TX 18mm', 'MDF', 18, 'Duratex', 'TX', 'Branco TX', 'fosco', 'dupla', 135),
  ('mdf_maderado_x_18mm', 'MDF Maderado X 18mm', 'MDF', 18, 'Masisa', 'X', 'Maderado', 'textura', 'dupla', 145),
  ('mdf_maderado_escuro_18mm', 'MDF Maderado Escuro 18mm', 'MDF', 18, 'Masisa', 'X', 'Maderado escuro', 'textura', 'dupla', 150),
  ('mdf_preto_18mm', 'MDF Preto 18mm', 'MDF', 18, 'Berneck', 'BP', 'Preto', 'fosco', 'dupla', 155),
  ('mdf_cinza_18mm', 'MDF Cinza 18mm', 'MDF', 18, 'Berneck', 'BP', 'Cinza', 'fosco', 'dupla', 140)
on conflict (id) do nothing;

insert into "fitas_borda" (id, material_id, espessura, cor, fabricante, preco_unitario) values
  ('fita_proadec_22mm_maderado_x', 'mdf_maderado_x_18mm', 22, 'Maderado X', 'Proadec', 3.5),
  ('fita_proadec_22mm_branco_tx', 'mdf_branco_tx_18mm', 22, 'Branco TX', 'Proadec', 2.5)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sistemas de montagem (Seção 5)
-- ---------------------------------------------------------------------------
insert into "sistemas_montagem" (id, tipo, nome, regras, ativo) values
  ('fundo_encaixado_recuado', 'fundo', 'Encaixado recuado', '{"espessura":6,"rasgo":true}', true),
  ('fundo_rebaixo_parafusado', 'fundo', 'Rebaixo parafusado', '{"espessura":6,"rebaixoProfundidade":7,"rebaixoEspaco":1.3}', true),
  ('fundo_parafusado_tras', 'fundo', 'Parafusado por trás', '{"espessura":6}', true),
  ('fundo_espesso', 'fundo', 'Fundo espesso à mostra', '{"espessura":18}', true),
  ('gaveta_telescopica', 'gaveta', 'Telescópica', '{"rebaixoProfundidade":7,"rebaixoEspaco":1.3,"contraRecuo":5}', true),
  ('gaveta_invisivel', 'gaveta', 'Invisível (slow)', '{"rasgoProfundidade":7,"rasgoLargura":1.3}', true)
on conflict (id) do nothing;
