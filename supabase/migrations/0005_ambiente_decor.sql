-- 0005 — Decoração do ambiente (Fase 4)
-- Objetos low-poly posicionados livremente (planta, geladeira, sofá etc.)
-- Guardados como JSONB na própria linha do projeto.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS decor jsonb NOT NULL DEFAULT '[]'::jsonb;
