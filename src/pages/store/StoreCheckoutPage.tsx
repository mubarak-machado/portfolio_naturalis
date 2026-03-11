import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Loader2,
    CreditCard, Smartphone, Banknote, User, Phone, FileText, CheckCircle2, ArrowRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { useAppModal } from '@/contexts/ModalContext'
import type { PaymentMethod } from '@/types/database'

const paymentOptions: { value: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
    { value: 'pix', label: 'PIX', icon: Smartphone },
    { value: 'cash', label: 'Dinheiro', icon: Banknote },
    { value: 'credit_card', label: 'Crédito', icon: CreditCard },
    { value: 'debit_card', label: 'Débito', icon: CreditCard },
]

export default function StoreCheckoutPage() {
    const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
    const { showAlert } = useAppModal()
    const navigate = useNavigate()

    const [step, setStep] = useState<'cart' | 'data'>('cart')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [notes, setNotes] = useState('')
    const [payment, setPayment] = useState<PaymentMethod>('pix')
    const [processing, setProcessing] = useState(false)
    const [trackingToken, setTrackingToken] = useState<string | null>(null)

    function handleUpdateQuantity(productId: string, quantity: number) {
        const result = updateQuantity(productId, quantity)
        if (!result.success && result.message) {
            showAlert({ title: 'Aviso', message: result.message, type: 'warning' })
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()

        // Anti-spam / rate-limiting (prevent multiple orders in 30 seconds)
        const lastOrderTime = sessionStorage.getItem('@ro_naturalis_last_order')
        if (lastOrderTime && Date.now() - parseInt(lastOrderTime) < 30000) {
            await showAlert({
                title: 'Aguarde um momento',
                message: 'Você acabou de fazer um pedido. Aguarde alguns segundos antes de tentar novamente.',
                type: 'warning'
            })
            return
        }

        if (!phone.trim()) {
            await showAlert({
                title: 'Telefone Obrigatório',
                message: 'Informe seu telefone para que possamos enviar o link de acompanhamento do pedido.',
                type: 'warning'
            })
            return
        }

        setProcessing(true)
        try {
            // 1. Create sale
            const { data: sale, error: saleErr } = await supabase
                .from('sales')
                .insert({
                    customer_id: null,
                    total_amount: totalPrice,
                    payment_method: payment,
                    status: 'pending',
                    delivery_status: 'pending',
                    notes: notes || null,
                    customer_name: name || 'Visitante',
                    customer_phone: phone,
                })
                .select('id')
                .single()

            if (saleErr || !sale) throw saleErr

            // 2. Create sale items
            const saleItems = items.map(item => ({
                sale_id: sale.id,
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.price,
                total_price: item.product.price * item.quantity,
            }))

            const { error: itemsErr } = await supabase.from('sale_items').insert(saleItems)
            if (itemsErr) throw itemsErr

            // 3. Update stock
            for (const item of items) {
                await supabase
                    .from('products')
                    .update({ stock_quantity: item.product.stock_quantity - item.quantity })
                    .eq('id', item.product.id)
            }

            // 4. Generate tracking token
            const { data: token, error: tokenErr } = await supabase
                .from('order_tracking_tokens')
                .insert({ sale_id: sale.id, phone })
                .select('token')
                .single()

            if (tokenErr) throw tokenErr

            setTrackingToken(token.token)
            clearCart()
        } catch (err) {
            console.error(err)
            await showAlert({
                title: 'Erro no Pedido',
                message: 'Não foi possível finalizar o pedido. Tente novamente.',
                type: 'error'
            })
        } finally {
            setProcessing(false)
        }
    }

    // ── Success screen ──
    if (trackingToken) {
        const trackingUrl = `${window.location.origin}/pedido/${trackingToken}`
        return (
            <div className="max-w-lg mx-auto px-4 py-20 animate-fade-in">
                <div className="bg-white dark:bg-surface-900 rounded-[2rem] p-8 md:p-10 border border-surface-200/50 dark:border-surface-800/50 shadow-xl text-center">
                    <div className="inline-flex p-5 rounded-full bg-success-50 dark:bg-success-900/20 mb-6">
                        <CheckCircle2 className="w-16 h-16 text-success-500" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold text-surface-900 dark:text-white mb-4 tracking-tight">
                        Pedido Realizado! 🎉
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mb-8 font-light text-lg">
                        Seu pedido foi registrado com sucesso. Use o link abaixo para acompanhar o status:
                    </p>

                    <div className="bg-surface-50 dark:bg-surface-950 rounded-2xl p-5 mb-8 border border-surface-100 dark:border-surface-800">
                        <p className="text-xs font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-2">Link de acompanhamento</p>
                        <a
                            href={trackingUrl}
                            className="text-primary-600 dark:text-primary-400 font-medium text-sm break-all hover:underline"
                        >
                            {trackingUrl}
                        </a>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(trackingUrl)
                                showAlert({ title: 'Copiado!', message: 'Link copiado para a área de transferência.', type: 'success' })
                            }}
                            className="w-full px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all shadow-[0_4px_15px_rgb(43,157,88,0.3)] hover:shadow-[0_6px_20px_rgb(43,157,88,0.4)]"
                        >
                            Copiar Link
                        </button>

                        <button
                            onClick={() => navigate(`/pedido/${trackingToken}`)}
                            className="w-full px-6 py-4 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 font-medium rounded-xl transition-all"
                        >
                            Ver Pedido
                        </button>
                    </div>

                    <Link
                        to="/loja/produtos"
                        className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 transition-colors mt-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Continuar Comprando
                    </Link>
                </div>
            </div>
        )
    }

    // ── Empty cart ──
    if (items.length === 0) {
        return (
            <div className="max-w-lg mx-auto px-4 py-24 text-center">
                <div className="bg-white dark:bg-surface-900 rounded-[2rem] p-10 border border-surface-200/50 dark:border-surface-800/50 shadow-xl">
                    <div className="inline-flex p-6 rounded-full bg-surface-50 dark:bg-surface-950 mb-6">
                        <ShoppingCart className="w-16 h-16 text-surface-300 dark:text-surface-600" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-surface-900 dark:text-white mb-3">
                        Seu carrinho está vazio
                    </h2>
                    <p className="text-surface-500 dark:text-surface-400 mb-8 font-light text-lg">
                        Explore nossa coleção e descubra suplementos naturais incríveis.
                    </p>
                    <Link
                        to="/loja/produtos"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all shadow-[0_4px_15px_rgb(43,157,88,0.3)] hover:shadow-[0_6px_20px_rgb(43,157,88,0.4)]"
                    >
                        Explorar Produtos
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-surface-900 dark:text-white mb-10 tracking-tight text-center md:text-left">
                {step === 'cart' ? 'Seu Carrinho' : 'Finalizar Pedido'}
            </h1>

            {step === 'cart' ? (
                <div className="animate-fade-in">
                    {/* Cart Items */}
                    <div className="space-y-4 mb-8">
                        {items.map(item => (
                            <div
                                key={item.product.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-6 p-5 sm:p-6 bg-white dark:bg-surface-900 rounded-[1.5rem] border border-surface-200/50 dark:border-surface-800/50 shadow-sm relative group"
                            >
                                {/* Thumbnail & Info */}
                                <div className="flex items-center gap-6 flex-1 min-w-0 pr-6 sm:pr-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface-50 dark:bg-surface-950 overflow-hidden flex-shrink-0 border border-surface-100 dark:border-surface-800">
                                        {item.product.image_url ? (
                                            <img src={item.product.image_url} alt="" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-surface-300 dark:text-surface-600">
                                                <ShoppingCart className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-base sm:text-lg font-heading font-bold text-surface-900 dark:text-white truncate mb-1">
                                            {item.product.name}
                                        </p>
                                        <p className="text-sm sm:text-base text-primary-600 dark:text-primary-400 font-medium tracking-tight">
                                            {formatCurrency(item.product.price)}
                                        </p>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto border-t border-surface-100 dark:border-surface-800 sm:border-0 pt-4 sm:pt-0 mt-3 sm:mt-0">
                                    {/* Quantity */}
                                    <div className="flex items-center gap-1 bg-surface-50 dark:bg-surface-950 p-1 rounded-xl border border-surface-200 dark:border-surface-800">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                                            className="p-1.5 sm:p-2 rounded-lg bg-transparent hover:bg-white dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-all shadow-sm"
                                        >
                                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                        <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-bold text-surface-900 dark:text-white">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                            className="p-1.5 sm:p-2 rounded-lg bg-transparent hover:bg-white dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-all shadow-sm"
                                        >
                                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                    </div>

                                    {/* Subtotal */}
                                    <p className="font-bold text-base sm:text-lg text-surface-900 dark:text-white sm:w-28 text-right tabular-nums">
                                        {formatCurrency(item.product.price * item.quantity)}
                                    </p>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeItem(item.product.id)}
                                    className="absolute sm:relative top-4 sm:top-0 right-4 sm:right-0 p-2 rounded-full text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                >
                                    <Trash2 className="w-5 h-5 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Total and Continue */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6 p-6 sm:p-8 bg-surface-50 dark:bg-surface-900/50 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 mt-10">
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                            <p className="text-sm sm:text-base text-surface-500 dark:text-surface-400 mb-1 font-medium">Total da compra</p>
                            <p className="text-3xl sm:text-4xl font-heading font-bold text-surface-900 dark:text-white tracking-tight tabular-nums">
                                {formatCurrency(totalPrice)}
                            </p>
                        </div>
                        <button
                            onClick={() => setStep('data')}
                            className="w-full sm:w-auto px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgb(43,157,88,0.3)] hover:shadow-[0_6px_20px_rgb(43,157,88,0.4)] active:scale-[0.98] text-lg"
                        >
                            Fechar Pedido
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-2xl mx-auto">
                    {/* Order summary */}
                    <div className="bg-white dark:bg-surface-900 rounded-[2rem] p-8 border border-surface-200/50 dark:border-surface-800/50 shadow-sm text-center">
                        <p className="text-base font-medium text-surface-500 dark:text-surface-400 mb-2">
                            Resumo do Pedido ({items.length} {items.length === 1 ? 'item' : 'itens'})
                        </p>
                        <p className="text-4xl font-heading font-bold text-surface-900 dark:text-white">
                            {formatCurrency(totalPrice)}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-surface-900 rounded-[2rem] p-6 sm:p-8 border border-surface-200/50 dark:border-surface-800/50 shadow-sm space-y-6">
                        {/* Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                                <User className="w-4 h-4 text-primary-500" />
                                Seu Nome
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Como podemos te chamar?"
                                className="w-full px-5 py-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder-surface-400 dark:placeholder-surface-500"
                            />
                        </div>

                        {/* Phone (required) */}
                        <div>
                            <label className="flex items-center justify-between text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-primary-500" />
                                    WhatsApp / Telefone
                                </span>
                                <span className="text-danger-500 text-xs font-bold uppercase tracking-wider bg-danger-50 dark:bg-danger-500/10 px-2 py-1 rounded-md">Obrigatório</span>
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="(00) 00000-0000"
                                required
                                className="w-full px-5 py-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder-surface-400 dark:placeholder-surface-500"
                            />
                            <p className="text-xs text-surface-500 mt-2 font-medium">
                                Enviaremos o status e link de acompanhamento para este número.
                            </p>
                        </div>

                        {/* Payment */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                                <CreditCard className="w-4 h-4 text-primary-500" />
                                Forma de Pagamento
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {paymentOptions.map(opt => {
                                    const Icon = opt.icon
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setPayment(opt.value)}
                                            className={cn(
                                                'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 min-h-[100px]',
                                                payment === opt.value
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 scale-[1.02] shadow-sm'
                                                    : 'border-surface-200 dark:border-surface-700 text-surface-500 hover:border-surface-300 dark:hover:border-surface-600 bg-white dark:bg-surface-900'
                                            )}
                                        >
                                            <Icon className={cn("w-6 h-6", payment === opt.value && "text-primary-500")} />
                                            <span className="text-sm font-bold">{opt.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                                <FileText className="w-4 h-4 text-primary-500" />
                                Observações (Opcional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Endereço de entrega, instruções especiais para o motoboy..."
                                rows={3}
                                className="w-full px-5 py-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-base focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all resize-none placeholder-surface-400 dark:placeholder-surface-500"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setStep('cart')}
                            className="flex-1 px-6 py-4 bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300 font-bold rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700 transition-all text-lg"
                        >
                            Voltar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgb(43,157,88,0.3)] hover:shadow-[0_6px_20px_rgb(43,157,88,0.4)] disabled:opacity-50 text-lg"
                        >
                            {processing ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                'Finalizar Pedido Agora'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
