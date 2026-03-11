-- ============================================
-- Fase 1.7: Vitrine do Cliente
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- após a execução do upgrade_fase1.5.sql e upgrade_customers.sql
-- ============================================

-- 1. Colunas adicionais na tabela sales para compras de visitantes
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_phone text;

-- 2. Tabela de tokens de rastreamento
CREATE TABLE IF NOT EXISTS order_tracking_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    phone text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_tracking_token ON order_tracking_tokens(token);

-- 3. RLS — Acesso público de leitura aos produtos (catálogo)
-- Permite que visitantes não autenticados vejam os produtos
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy para leitura pública de produtos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'public_read_products'
    ) THEN
        CREATE POLICY public_read_products ON products
            FOR SELECT
            USING (true);
    END IF;
END $$;

-- 4. RLS — Acesso público de leitura aos tokens de tracking
ALTER TABLE order_tracking_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'order_tracking_tokens' AND policyname = 'public_read_tracking'
    ) THEN
        CREATE POLICY public_read_tracking ON order_tracking_tokens
            FOR SELECT
            USING (true);
    END IF;
END $$;

-- Policy de inserção para tracking tokens (authenticated + anon para checkout)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'order_tracking_tokens' AND policyname = 'public_insert_tracking'
    ) THEN
        CREATE POLICY public_insert_tracking ON order_tracking_tokens
            FOR INSERT
            WITH CHECK (true);
    END IF;
END $$;

-- 5. Policy para inserção pública de sales (checkout de visitantes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'public_insert_sales'
    ) THEN
        CREATE POLICY public_insert_sales ON sales
            FOR INSERT
            WITH CHECK (true);
    END IF;
END $$;

-- Policy para inserção pública de sale_items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'sale_items' AND policyname = 'public_insert_sale_items'
    ) THEN
        CREATE POLICY public_insert_sale_items ON sale_items
            FOR INSERT
            WITH CHECK (true);
    END IF;
END $$;

-- 6. Permitir leitura pública de sales e sale_items pelo tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'public_read_sales'
    ) THEN
        CREATE POLICY public_read_sales ON sales
            FOR SELECT
            USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'sale_items' AND policyname = 'public_read_sale_items'
    ) THEN
        CREATE POLICY public_read_sale_items ON sale_items
            FOR SELECT
            USING (true);
    END IF;
END $$;

-- ============================================
-- Fim do upgrade Fase 1.7
-- ============================================
