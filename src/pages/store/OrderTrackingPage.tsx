import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Package, Truck, CheckCircle2, Clock, Loader2,
    ArrowLeft, CreditCard, User, Leaf
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency, formatDateTime } from '@/lib/utils'

interface TrackingData {
    id: string
    created_at: string
    total_amount: number
    payment_method: string
    status: string
    delivery_status: string
    customer_name: string | null
    items: {
        id: string
        quantity: number
        unit_price: number
        product_name: string
        product_image: string | null
    }[]
}

const deliverySteps = [
    { key: 'pending', label: 'Pedido Recebido', icon: Clock, desc: 'Seu pedido foi registrado' },
    { key: 'shipped', label: 'Em Trânsito', icon: Truck, desc: 'Seu pedido está a caminho' },
    { key: 'delivered', label: 'Entregue', icon: CheckCircle2, desc: 'Pedido entregue com sucesso' },
]

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'text-accent-500 bg-accent-50 dark:bg-accent-500/10' },
    paid: { label: 'Pago', color: 'text-success-500 bg-green-50 dark:bg-green-500/10' },
    cancelled: { label: 'Cancelado', color: 'text-danger-500 bg-red-50 dark:bg-red-500/10' },
}

export default function OrderTrackingPage() {
    const { token } = useParams<{ token: string }>()
    const [data, setData] = useState<TrackingData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            if (!token) return
            setLoading(true)

            // Use secure RPC to fetch order details
            const { data: orderData, error: rpcErr } = await supabase
                .rpc('get_order_by_tracking_token', { p_token: token })

            if (rpcErr || !orderData) {
                setError('Pedido não encontrado ou sem permissão.')
                setLoading(false)
                return
            }

            setData(orderData as TrackingData)
            setLoading(false)
        }
        load()
    }, [token])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="max-w-lg mx-auto px-4 py-20 text-center">
                <Package className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                    Pedido não encontrado
                </h2>
                <p className="text-surface-500 dark:text-surface-400 mb-6">
                    {error || 'Verifique o link e tente novamente.'}
                </p>
                <Link
                    to="/loja"
                    className="inline-flex items-center gap-2 text-primary-500 hover:underline text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Início
                </Link>
            </div>
        )
    }

    const order = data
    const currentStepIndex = deliverySteps.findIndex(s =>
        s.key === order.delivery_status || (order.delivery_status === 'pickup' && s.key === 'delivered')
    )
    const payment = statusLabels[order.status] || statusLabels.pending

    return (
        <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
            {/* Back link */}
            <Link
                to="/loja"
                className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-500 transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Início
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-surface-100 mb-1">
                        Acompanhar Pedido
                    </h1>
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                        {formatDateTime(order.created_at)}
                    </p>
                </div>
                <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', payment.color)}>
                    {payment.label}
                </span>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 mb-6">
                <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-6 uppercase tracking-wider">
                    Status da Entrega
                </h2>
                <div className="space-y-0">
                    {deliverySteps.map((step, idx) => {
                        const isActive = idx <= currentStepIndex
                        const isCurrent = idx === currentStepIndex
                        const Icon = step.icon
                        return (
                            <div key={step.key} className="flex gap-4">
                                {/* Connector + Icon */}
                                <div className="flex flex-col items-center">
                                    <div className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500',
                                        isCurrent
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110'
                                            : isActive
                                                ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400'
                                                : 'bg-surface-100 dark:bg-surface-800 text-surface-400'
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    {idx < deliverySteps.length - 1 && (
                                        <div className={cn(
                                            'w-0.5 h-12 transition-colors duration-500',
                                            isActive ? 'bg-primary-300 dark:bg-primary-500/50' : 'bg-surface-200 dark:bg-surface-700'
                                        )} />
                                    )}
                                </div>

                                {/* Text */}
                                <div className="pt-2 pb-8">
                                    <p className={cn(
                                        'font-semibold text-sm',
                                        isActive ? 'text-surface-900 dark:text-surface-100' : 'text-surface-400'
                                    )}>
                                        {step.label}
                                    </p>
                                    <p className={cn(
                                        'text-xs',
                                        isActive ? 'text-surface-500 dark:text-surface-400' : 'text-surface-300 dark:text-surface-600'
                                    )}>
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Customer info */}
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 mb-6">
                <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4 uppercase tracking-wider">
                    Dados do Pedido
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2.5 text-surface-600 dark:text-surface-400">
                        <User className="w-4 h-4 text-surface-400" />
                        {order.customer_name || 'Visitante'}
                    </div>
                    <div className="flex items-center gap-2.5 text-surface-600 dark:text-surface-400">
                        <CreditCard className="w-4 h-4 text-surface-400" />
                        {order.payment_method === 'pix' ? 'PIX' : order.payment_method === 'cash' ? 'Dinheiro' : order.payment_method === 'credit_card' ? 'Crédito' : 'Débito'}
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
                <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4 uppercase tracking-wider">
                    Itens do Pedido
                </h2>
                <div className="space-y-3">
                    {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 overflow-hidden flex-shrink-0">
                                {item.product_image ? (
                                    <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Leaf className="w-4 h-4 text-surface-300 dark:text-surface-600" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                                    {item.product_name || 'Produto'}
                                </p>
                                <p className="text-xs text-surface-500 dark:text-surface-400">
                                    {item.quantity}x {formatCurrency(item.unit_price)}
                                </p>
                            </div>
                            <p className="font-semibold text-sm text-surface-900 dark:text-surface-100">
                                {formatCurrency(item.quantity * item.unit_price)}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="border-t border-surface-200 dark:border-surface-700 mt-4 pt-4 flex justify-between">
                    <span className="font-semibold text-surface-700 dark:text-surface-300">Total</span>
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrency(order.total_amount)}
                    </span>
                </div>
            </div>
        </div>
    )
}
