/**
 * Database Types
 * ==============
 * Definições de tipos TypeScript que espelham exatamente as
 * tabelas do banco de dados do Supabase. Isso garante que
 * todo acesso ao banco seja verificado em tempo de compilação,
 * evitando erros de digitação em nomes de colunas.
 * 
 * Quando uma nova coluna for adicionada ao banco, adicione-a
 * aqui também para manter a sincronia.
 */

export type SellingType = 'unit' | 'weight'
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash'
export type SaleStatus = 'pending' | 'paid' | 'cancelled'
export type DeliveryStatus = 'pending' | 'shipped' | 'delivered' | 'pickup'

export interface Product {
    id: string
    name: string
    description: string | null
    selling_type: SellingType
    price: number
    cost_price: number | null
    stock_quantity: number
    stock_minimal: number | null
    image_url: string | null
    created_at: string
    updated_at: string
}

export interface Customer {
    id: string
    name: string
    phone: string | null
    email: string | null
    image_url: string | null
    notes: string | null
    created_at: string
}

export interface Sale {
    id: string
    customer_id: string | null
    total_amount: number
    payment_method: PaymentMethod
    status: SaleStatus
    delivery_status: DeliveryStatus
    notes: string | null
    customer_name: string | null
    customer_phone: string | null
    created_at: string
}

export interface SaleItem {
    id: string
    sale_id: string
    product_id: string
    quantity: number
    unit_price: number
    total_price: number
}

export interface OrderTrackingToken {
    id: string
    sale_id: string
    token: string
    phone: string
    created_at: string
}

export interface StoreSettings {
    id: number
    whatsapp: string | null
    updated_at: string
}

/**
 * Tipos auxiliares para inserção e atualização.
 * Omitem campos que são gerados automaticamente pelo banco.
 */
export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type ProductUpdate = Partial<ProductInsert>

export type CustomerInsert = Omit<Customer, 'id' | 'created_at'>
export type CustomerUpdate = Partial<CustomerInsert>

export type SaleInsert = Omit<Sale, 'id' | 'created_at'>
export type SaleItemInsert = Omit<SaleItem, 'id'>

/**
 * Database Schema — usado como genérico do createClient<Database>.
 * Segue o formato exigido pelo Supabase JS v2.
 */
export type Database = {
    public: {
        Tables: {
            products: {
                Row: Product
                Insert: ProductInsert
                Update: ProductUpdate
                Relationships: []
            }
            customers: {
                Row: Customer
                Insert: CustomerInsert
                Update: CustomerUpdate
                Relationships: []
            }
            sales: {
                Row: Sale
                Insert: SaleInsert
                Update: Partial<SaleInsert>
                Relationships: []
            }
            sale_items: {
                Row: SaleItem
                Insert: SaleItemInsert
                Update: Partial<SaleItemInsert>
                Relationships: []
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: Record<string, never>
        CompositeTypes: Record<string, never>
    }
}
