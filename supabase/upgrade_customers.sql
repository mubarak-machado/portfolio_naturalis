-- ============================================
-- Ró Naturalis — Upgrade de Clientes (Fase 1.5)
-- ============================================
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script e rode para aplicar o upgrade
-- ============================================

-- Adiciona os novos campos à tabela de clientes
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

-- (Opcional) Poderíamos criar um bucket separado para fotos de clientes, 
-- mas por praticidade continuaremos usando o bucket 'product-images' 
-- já que já possui as políticas de segurança corretas.

-- ============================================
-- ✅ Upgrade Concluído! O banco está pronto.
-- ============================================
