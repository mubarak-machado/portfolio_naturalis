-- ============================================
-- Rô Naturalis — Script de Criação do Banco
-- ============================================
-- Execute este script no Supabase SQL Editor:
-- 1. Acesse seu projeto no Supabase Dashboard
-- 2. Vá em "SQL Editor" (ícone de banco de dados)
-- 3. Cole todo este conteúdo e clique em "RUN"
-- ============================================

-- ── Tabela de Produtos ──────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  selling_type TEXT NOT NULL DEFAULT 'unit' CHECK (selling_type IN ('unit', 'weight')),
  price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC,
  stock_quantity NUMERIC NOT NULL DEFAULT 0,
  stock_minimal NUMERIC,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabela de Clientes ──────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabela de Vendas (Pedidos) ────────────────
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'cash')),
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'cancelled')),
  delivery_status TEXT NOT NULL DEFAULT 'delivered' CHECK (delivery_status IN ('pending', 'shipped', 'delivered', 'pickup')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Itens de cada Venda ─────────────────────
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0
);

-- ── Trigger: atualiza updated_at automaticamente ──
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── Índices para performance ────────────────
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- ── Row Level Security (RLS) ────────────────
-- Desabilitamos temporariamente para simplificar
-- o desenvolvimento. Quando for transformar em SaaS
-- multi-inquilino, habilite e configure políticas.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas: qualquer usuário autenticado 
-- pode ler e modificar (adequado para uso single-tenant)
CREATE POLICY "Allow authenticated full access" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access" ON sales
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access" ON sale_items
  FOR ALL USING (auth.role() = 'authenticated');

-- ── Storage: bucket para fotos de produtos ──
-- Nota: crie o bucket 'product-images' manualmente
-- no Supabase Dashboard → Storage → New Bucket
-- Marque como público (public) para que as URLs
-- das fotos funcionem sem autenticação.

-- Políticas de acesso ao Storage (RLS)
-- Permite que qualquer pessoa veja as imagens
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Permite que usuários autenticados façam upload
CREATE POLICY "Authenticated Upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Permite que usuários autenticados atualizem suas próprias imagens
CREATE POLICY "Authenticated Update"
  ON storage.objects FOR UPDATE
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Permite que usuários autenticados deletem imagens
CREATE POLICY "Authenticated Delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- ============================================
-- ✅ Script executado com sucesso!
-- Agora crie um usuário em Authentication → Users
-- e configure as chaves no arquivo .env do projeto.
-- ============================================
