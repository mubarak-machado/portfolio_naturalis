/**
 * SalesPage — PDV / Frente de Caixa
 * ===================================
 * Interface de registro de vendas inspirada em caixas registradoras
 * modernas. O fluxo é:
 * 
 * 1. Lojista seleciona produtos do catálogo (coluna esquerda).
 * 2. Cada produto clicado é adicionado ao "carrinho" (coluna direita).
 * 3. Lojista ajusta quantidade e seleciona forma de pagamento.
 * 4. Ao confirmar, o sistema:
 *    a) Cria o registro da venda (tabela sales).
 *    b) Cria os itens da venda (tabela sale_items).
 *    c) Deduz a quantidade do estoque de cada produto.
 * 
 * Suporte:
 * - Produtos por unidade: incremento inteiro.
 * - Produtos a granel: entrada de peso em kg (permite decimais).
 * - Vincular cliente (opcional) para histórico.
 */

import { useState, useEffect } from 'react'
import {
    ShoppingCart,
    Search,
    Plus,
    Minus,
    X,
    Loader2,
    CreditCard,
    Banknote,
    Smartphone,
    CheckCircle2,
    Package,
    Scale,
    Box,
    User
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useAppModal } from '@/contexts/ModalContext'
import { supabase } from '@/lib/supabase'
import type { Product, Customer, PaymentMethod, SaleStatus, DeliveryStatus } from '@/types/database'

interface CartItem {
    product: Product
    quantity: number
}

const paymentOptions: { value: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
    { value: 'pix', label: 'PIX', icon: Smartphone },
    { value: 'cash', label: 'Dinheiro', icon: Banknote },
    { value: 'credit_card', label: 'Crédito', icon: CreditCard },
    { value: 'debit_card', label: 'Débito', icon: CreditCard },
]

export default function SalesPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [search, setSearch] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')

    // Novos campos de Pedido (Fase 1.5)
    const [status, setStatus] = useState<SaleStatus>('paid')
    const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('delivered')
    const [notes, setNotes] = useState('')

    const { showAlert } = useAppModal()

    const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const [prodRes, custRes] = await Promise.all([
            supabase.from('products').select('*').order('name'),
            supabase.from('customers').select('*').order('name'),
        ])
        if (prodRes.data) setProducts(prodRes.data as Product[])
        if (custRes.data) setCustomers(custRes.data as Customer[])
        setLoading(false)
    }

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    // ── Ações do carrinho ─────────────────────
    function addToCart(product: Product) {
        const existing = cart.find((item) => item.product.id === product.id)
        if (existing) {
            setCart(cart.map((item) =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + (product.selling_type === 'weight' ? 0.1 : 1) }
                    : item
            ))
        } else {
            setCart([...cart, { product, quantity: product.selling_type === 'weight' ? 0.1 : 1 }])
        }
    }

    function updateQuantity(productId: string, quantity: number) {
        if (quantity <= 0) {
            setCart(cart.filter((item) => item.product.id !== productId))
        } else {
            setCart(cart.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            ))
        }
    }

    function removeFromCart(productId: string) {
        setCart(cart.filter((item) => item.product.id !== productId))
    }

    // ── Finalizar venda ───────────────────────
    async function finalizeSale() {
        if (cart.length === 0) return
        setProcessing(true)

        try {
            // 1. Criar registro da venda (Pedido)
            const { data: sale, error: saleError } = await supabase
                .from('sales')
                .insert({
                    customer_id: selectedCustomer,
                    total_amount: cartTotal,
                    payment_method: paymentMethod,
                    status: status,
                    delivery_status: deliveryStatus,
                    notes: notes || null,
                })
                .select()
                .single()

            if (saleError || !sale) throw saleError

            // 2. Criar itens da venda
            const items = cart.map((item) => ({
                sale_id: sale.id,
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.price,
                total_price: item.product.price * item.quantity,
            }))

            await supabase.from('sale_items').insert(items)

            // 3. Atualizar estoque de cada produto
            for (const item of cart) {
                const newStock = item.product.stock_quantity - item.quantity
                await supabase
                    .from('products')
                    .update({ stock_quantity: Math.max(0, newStock) })
                    .eq('id', item.product.id)
            }

            // Sucesso
            setCart([])
            setSelectedCustomer(null)
            setStatus('paid')
            setDeliveryStatus('delivered')
            setNotes('')
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
            loadData() // Recarrega estoque atualizado
        } catch (err) {
            console.error(err)
            await showAlert({
                title: 'Erro de Venda',
                message: 'Erro ao registrar venda. Tente novamente.',
                type: 'error'
            })
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 mt-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                        <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white mb-1 tracking-tight">PDV — Frente de Caixa</h1>
                        <p className="text-sm md:text-base text-surface-500 dark:text-surface-400 font-light">Registre suas vendas presencialmente</p>
                    </div>
                </div>
            </div>

            {/* Notificação de sucesso */}
            {showSuccess && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-success-500/10 border border-success-500/30 flex items-center gap-2 text-success-600 animate-slide-in">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Venda registrada com sucesso! Estoque atualizado.</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Coluna Esquerda: Catálogo ──────── */}
                <div className="lg:col-span-2">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={cn(
                                'w-full pl-12 pr-4 py-3.5 rounded-2xl text-base font-medium',
                                'bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                                'shadow-sm hover:shadow-md transition-all duration-200'
                            )}
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-8 shadow-card text-center text-surface-500 dark:text-surface-400">
                            <Package className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                            Nenhum produto encontrado.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 gap-y-4">
                            {filtered.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock_quantity <= 0}
                                    className={cn(
                                        'bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/50 dark:border-surface-800/50 p-3 text-left flex flex-col',
                                        'shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary-500/30',
                                        'transition-all duration-300 group',
                                        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:translate-y-0 disabled:hover:border-surface-200/50'
                                    )}
                                >
                                    <div className="aspect-square rounded-lg bg-surface-100 overflow-hidden mb-2">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-surface-300" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="font-medium text-sm text-surface-900 dark:text-surface-100 truncate">{product.name}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm font-bold text-primary-600">
                                            {formatCurrency(product.price)}
                                            {product.selling_type === 'weight' && <span className="text-xs font-normal">/kg</span>}
                                        </span>
                                        <span className={cn(
                                            'text-xs',
                                            product.stock_quantity <= 0 ? 'text-danger-500' : 'text-surface-400'
                                        )}>
                                            {product.selling_type === 'weight'
                                                ? <span className="inline-flex items-center gap-0.5"><Scale className="w-3 h-3" />{product.stock_quantity}kg</span>
                                                : <span className="inline-flex items-center gap-0.5"><Box className="w-3 h-3" />{product.stock_quantity}un</span>}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Coluna Direita: Carrinho ──────── */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 shadow-xl shadow-surface-200/50 dark:shadow-none sticky top-6 overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-surface-200/50 dark:border-surface-800/50">
                            <h2 className="font-heading font-bold text-lg text-surface-900 dark:text-white flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                Carrinho
                                {cart.length > 0 && (
                                    <span className="ml-auto bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {cart.length}
                                    </span>
                                )}
                            </h2>
                        </div>

                        {/* Cliente */}
                        <div className="px-5 py-3 border-b border-surface-100">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">
                                <User className="w-3 h-3" /> Cliente (opcional)
                            </label>
                            <select
                                value={selectedCustomer || ''}
                                onChange={(e) => setSelectedCustomer(e.target.value || null)}
                                className="w-full px-3 py-2 rounded-lg text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            >
                                <option value="">Venda balcão (sem cliente)</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Itens */}
                        <div className="max-h-64 overflow-y-auto">
                            {cart.length === 0 ? (
                                <div className="px-5 py-8 text-center text-surface-400 text-sm">
                                    Clique nos produtos para adicionar
                                </div>
                            ) : (
                                <div className="divide-y divide-surface-100">
                                    {cart.map((item) => (
                                        <div key={item.product.id} className="px-5 py-3">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <p className="text-sm font-medium text-surface-900 dark:text-surface-100 leading-tight">{item.product.name}</p>
                                                <button
                                                    onClick={() => removeFromCart(item.product.id)}
                                                    className="p-1 text-surface-400 hover:text-danger-500 transition-colors flex-shrink-0"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {item.product.selling_type === 'weight' ? (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.product.id, parseFloat(e.target.value) || 0)}
                                                            className="w-20 px-2 py-1 rounded text-sm text-center bg-surface-50 dark:bg-surface-800 border border-surface-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                                className="p-1 rounded bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200 transition-colors"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                                className="p-1 rounded bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200 transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-surface-400">
                                                        × {formatCurrency(item.product.price)}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                                                    {formatCurrency(item.product.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagamento */}
                        {cart.length > 0 && (
                            <div className="border-t border-surface-200 px-5 py-4 space-y-4">
                                {/* Método de pagamento */}
                                <div>
                                    <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">Forma de Pagamento</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {paymentOptions.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setPaymentMethod(opt.value)}
                                                className={cn(
                                                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                                                    paymentMethod === opt.value
                                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                        : 'border-surface-200 bg-white text-surface-500 hover:border-surface-300'
                                                )}
                                            >
                                                <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Status de Pagamento e Entrega */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Pagamento</p>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as SaleStatus)}
                                            className="w-full px-3 py-2 rounded-lg text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                        >
                                            <option value="paid">Pago</option>
                                            <option value="pending">Pendente</option>
                                        </select>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Entrega</p>
                                        <select
                                            value={deliveryStatus}
                                            onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
                                            className="w-full px-3 py-2 rounded-lg text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                        >
                                            <option value="delivered">Entregue (Balcão)</option>
                                            <option value="pickup">P/ Retirar</option>
                                            <option value="pending">Pendente (Envio)</option>
                                            <option value="shipped">A Caminho</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Observações */}
                                <div>
                                    <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Observações (Endereço, etc)</p>
                                    <textarea
                                        rows={2}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Ex: Entregar na rua X..."
                                        className="w-full px-3 py-2 rounded-lg text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 text-surface-700 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                                    />
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between py-2 border-t border-surface-200 mt-2">
                                    <span className="text-sm font-medium text-surface-600">Total</span>
                                    <span className="text-2xl font-bold text-primary-600">{formatCurrency(cartTotal)}</span>
                                </div>

                                {/* Botão finalizar */}
                                <button
                                    onClick={finalizeSale}
                                    disabled={processing}
                                    className={cn(
                                        'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white',
                                        'gradient-primary shadow-lg shadow-primary-500/25',
                                        'hover:shadow-xl hover:shadow-primary-500/30',
                                        'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                                    )}
                                >
                                    {processing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4" />
                                    )}
                                    Finalizar Venda
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
