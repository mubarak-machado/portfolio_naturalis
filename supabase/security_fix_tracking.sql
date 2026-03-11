-- ============================================
-- Correção de Segurança: Order Tracking RLS
-- ============================================
-- Este script revoga o acesso de leitura global às tabelas sales e sale_items
-- e cria uma RPC (Remote Procedure Call) segura para que visitantes 
-- possam consultar apenas os pedidos vinculados a um tracking token específico.
-- ============================================

-- 1. Revogar as políticas de leitura abertas (vulneráveis)
DROP POLICY IF EXISTS public_read_sales ON sales;
DROP POLICY IF EXISTS public_read_sale_items ON sale_items;
DROP POLICY IF EXISTS public_read_tracking ON order_tracking_tokens;

-- Adicionar nova policy apenas para admins nas tabelas afetadas (fallback seguro)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'authenticated_read_sales') THEN
        CREATE POLICY authenticated_read_sales ON sales FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sale_items' AND policyname = 'authenticated_read_sale_items') THEN
        CREATE POLICY authenticated_read_sale_items ON sale_items FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_tracking_tokens' AND policyname = 'authenticated_read_tracking') THEN
        CREATE POLICY authenticated_read_tracking ON order_tracking_tokens FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 2. Criar a RPC segura ('SECURITY DEFINER' roda com privilégios de quem a criou)
CREATE OR REPLACE FUNCTION get_order_by_tracking_token(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sale_id uuid;
    v_result json;
BEGIN
    -- Busca qual é o ID da venda atrelado ao token
    SELECT sale_id INTO v_sale_id
    FROM order_tracking_tokens
    WHERE token = p_token
    LIMIT 1;

    -- Se não achou, retorna nulo silenciosamente (não vaza se o token não existe)
    IF v_sale_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Constrói o JSON com os dados precisos da venda + seus itens
    SELECT json_build_object(
        'id', s.id,
        'created_at', s.created_at,
        'total_amount', s.total_amount,
        'payment_method', s.payment_method,
        'status', s.status,
        'delivery_status', s.delivery_status,
        'customer_name', s.customer_name,
        'items', (
            SELECT COALESCE(json_agg(json_build_object(
                'id', si.id,
                'quantity', si.quantity,
                'unit_price', si.unit_price,
                'product_name', p.name,
                'product_image', p.image_url
            )), '[]'::json)
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            WHERE si.sale_id = s.id
        )
    ) INTO v_result
    FROM sales s
    WHERE s.id = v_sale_id;

    RETURN v_result;
END;
$$;
