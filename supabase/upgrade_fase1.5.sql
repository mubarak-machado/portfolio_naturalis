-- ============================================
-- Rô Naturalis — Upgrade Fase 1.5 (Pedidos)
-- ============================================
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script e rode para aplicar o upgrade
-- ============================================

-- Adiciona os novos campos à tabela de vendas
ALTER TABLE sales ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'cancelled'));
ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'delivered' CHECK (delivery_status IN ('pending', 'shipped', 'delivered', 'pickup'));
ALTER TABLE sales ADD COLUMN IF NOT EXISTS notes TEXT;

-- Cria índices para os novos campos (ajuda nos filtros do app)
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_delivery_status ON sales(delivery_status);

-- ============================================
-- ✅ Upgrade Concluído! O banco está pronto para a Fase 1.5
-- ============================================
