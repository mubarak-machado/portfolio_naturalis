/**
 * OrdersPage — Gestão de Pedidos (Fase 1.5 → 1.7)
 * ==================================================
 * Tela dedicada para visualizar e gerenciar o histórico de vendas/pedidos.
 * 
 * Funcionalidades:
 * - Lista todos os pedidos ordenados do mais recente para o mais antigo.
 * - Filtros por status de pagamento e entrega.
 * - Modal de detalhes redesenhada com:
 *   · Dropdowns para troca de status (reversíveis)
 *   · Confirmação para ações sensíveis (troca de status, exclusão)
 *   · Botão de Excluir pedido (com confirmação dupla)
 *   · Botão de Arquivar (apenas quando status = entregue)
 */

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    ClipboardList,
    Search,
    Loader2,
    Eye,
    CheckCircle2,
    Truck,
    Package,
    X,
    User,
    Calendar,
    FileText,
    Banknote,
    CreditCard,
    Smartphone,
    Trash2,
    Archive,
    ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency, formatDateTime } from '@/lib/utils'
import type { PaymentMethod, SaleStatus, DeliveryStatus } from '@/types/database'
import { useAppModal } from '@/contexts/ModalContext'

interface OrderItem {
    id: string
    quantity: number
    unit_price: number
    total_price: number
    products: { name: string }
}

interface Order {
    id: string
    created_at: string
    total_amount: number
    payment_method: PaymentMethod
    status: SaleStatus
    delivery_status: DeliveryStatus
    notes: string | null
    customer_name?: string | null
    customer_phone?: string | null
    customers: { name: string, phone: string | null } | null
    sale_items?: OrderItem[]
}

const statusOptions: { value: SaleStatus; label: string; color: string; darkColor: string }[] = [
    { value: 'pending', label: 'Pendente', color: 'bg-amber-100 text-amber-800 border-amber-300', darkColor: 'dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30' },
    { value: 'paid', label: 'Pago', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', darkColor: 'dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30' },
    { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300', darkColor: 'dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30' },
]

const deliveryOptions: { value: DeliveryStatus; label: string; icon: typeof Truck; color: string; darkColor: string }[] = [
    { value: 'pending', label: 'Pendente', icon: Package, color: 'bg-amber-100 text-amber-800 border-amber-300', darkColor: 'dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30' },
    { value: 'shipped', label: 'Enviado', icon: Truck, color: 'bg-blue-100 text-blue-800 border-blue-300', darkColor: 'dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30' },
    { value: 'delivered', label: 'Entregue', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', darkColor: 'dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30' },
    { value: 'pickup', label: 'Retirada', icon: Package, color: 'bg-purple-100 text-purple-800 border-purple-300', darkColor: 'dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30' },
]

const paymentMap = {
    pix: { label: 'PIX', icon: Smartphone },
    cash: { label: 'Dinheiro', icon: Banknote },
    credit_card: { label: 'Crédito', icon: CreditCard },
    debit_card: { label: 'Débito', icon: CreditCard },
}

function getStatusBadge(value: SaleStatus) {
    return statusOptions.find(o => o.value === value) || statusOptions[0]
}

function getDeliveryBadge(value: DeliveryStatus) {
    return deliveryOptions.find(o => o.value === value) || deliveryOptions[0]
}

export default function OrdersPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<SaleStatus | 'all'>('all')
    const [deliveryFilter, setDeliveryFilter] = useState<DeliveryStatus | 'all'>('all')

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [loadingItems, setLoadingItems] = useState(false)
    const [updatingStatus, setUpdatingStatus] = useState(false)

    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState<Partial<Order>>({})

    const { showAlert, showConfirm } = useAppModal()

    async function loadOrders() {
        setLoading(true)
        const { data, error } = await supabase
            .from('sales')
            .select(`*, customers ( name, phone )`)
            .order('created_at', { ascending: false })

        if (!error && data) setOrders(data as Order[])
        setLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadOrders()
    }, [])

    // Handle deep link / navigation from other pages (e.g. Customers CRM Panel)
    useEffect(() => {
        const state = location.state as { openOrderId?: string } | null
        if (state?.openOrderId && orders.length > 0) {
            const order = orders.find(o => o.id === state.openOrderId)
            if (order) {
                openOrderDetails(order)
                // Clear state to avoid reopening on refresh/back
                navigate(location.pathname, { replace: true, state: {} })
            }
        }
    }, [location.state, orders, navigate, location.pathname])

    async function openOrderDetails(order: Order) {
        setSelectedOrder(order)
        setIsEditing(false)
        setEditForm({
            created_at: order.created_at,
            total_amount: order.total_amount,
            payment_method: order.payment_method,
            notes: order.notes,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            status: order.status,
            delivery_status: order.delivery_status
        })

        setLoadingItems(true)
        const { data, error } = await supabase
            .from('sale_items')
            .select(`*, products ( name )`)
            .eq('sale_id', order.id)

        if (!error && data) {
            setSelectedOrder({ ...order, sale_items: data as OrderItem[] })
        }
        setLoadingItems(false)
    }

    async function handleSaveEdits() {
        if (!selectedOrder) return

        const confirmed = await showConfirm({
            title: 'Confirmar Alterações',
            message: 'Deseja salvar as alterações realizadas neste pedido? Esta ação alterará os registros históricos.',
            type: 'warning',
            confirmText: 'Salvar Alterações',
            cancelText: 'Continuar Editando'
        })

        if (!confirmed) return

        setUpdatingStatus(true)
        const { error } = await supabase
            .from('sales')
            .update(editForm)
            .eq('id', selectedOrder.id)

        if (!error) {
            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, ...editForm } : o))
            setSelectedOrder(prev => prev ? { ...prev, ...editForm } : null)
            setIsEditing(false)
            await showAlert({ title: 'Sucesso', message: 'Pedido atualizado com sucesso.', type: 'success' })
        } else {
            console.error('Update error:', error)
            await showAlert({ title: 'Erro', message: 'Erro ao atualizar o pedido.', type: 'error' })
        }
        setUpdatingStatus(false)
    }

    async function updateOrderStatus(orderId: string, field: 'status' | 'delivery_status', newValue: string) {
        // Confirmação antes de troca de status
        const confirmed = await showConfirm({
            title: 'Confirmar Alteração',
            message: `Deseja alterar o status para "${field === 'status'
                ? statusOptions.find(o => o.value === newValue)?.label
                : deliveryOptions.find(o => o.value === newValue)?.label
                }"?`,
            type: 'info',
            confirmText: 'Confirmar',
            cancelText: 'Cancelar'
        })
        if (!confirmed) return

        setUpdatingStatus(true)
        const updates = { [field]: newValue }
        const { error } = await supabase.from('sales').update(updates).eq('id', orderId)

        if (!error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, ...updates } : null)
            }
            await showAlert({ title: 'Sucesso', message: 'Status atualizado.', type: 'success' })
        } else {
            await showAlert({ title: 'Erro', message: 'Erro ao atualizar o pedido.', type: 'error' })
        }
        setUpdatingStatus(false)
    }

    async function deleteOrder(orderId: string) {
        const confirmed = await showConfirm({
            title: '⚠️ Excluir Pedido',
            message: 'Esta ação é IRREVERSÍVEL. Todos os itens do pedido serão removidos permanentemente. Tem certeza?',
            type: 'error',
            confirmText: 'Sim, Excluir',
            cancelText: 'Cancelar'
        })
        if (!confirmed) return

        // Double confirmation for destructive action
        const doubleConfirm = await showConfirm({
            title: 'Confirmação Final',
            message: 'Você está prestes a excluir este pedido definitivamente. Continuar?',
            type: 'warning',
            confirmText: 'Excluir Definitivamente',
            cancelText: 'Voltar'
        })
        if (!doubleConfirm) return

        setUpdatingStatus(true)
        // Delete sale items first, then the sale
        await supabase.from('sale_items').delete().eq('sale_id', orderId)
        await supabase.from('order_tracking_tokens').delete().eq('sale_id', orderId)
        const { error } = await supabase.from('sales').delete().eq('id', orderId)

        if (!error) {
            setOrders(prev => prev.filter(o => o.id !== orderId))
            setSelectedOrder(null)
            await showAlert({ title: 'Excluído', message: 'Pedido excluído com sucesso.', type: 'success' })
        } else {
            await showAlert({ title: 'Erro', message: 'Erro ao excluir o pedido.', type: 'error' })
        }
        setUpdatingStatus(false)
    }

    async function archiveOrder(orderId: string) {
        const confirmed = await showConfirm({
            title: 'Arquivar Pedido',
            message: 'O pedido será marcado como cancelado (arquivado). Deseja continuar?',
            type: 'info',
            confirmText: 'Arquivar',
            cancelText: 'Cancelar'
        })
        if (!confirmed) return

        setUpdatingStatus(true)
        const { error } = await supabase.from('sales').update({ status: 'cancelled' }).eq('id', orderId)

        if (!error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as SaleStatus } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' as SaleStatus } : null)
            }
            await showAlert({ title: 'Arquivado', message: 'Pedido arquivado com sucesso.', type: 'success' })
        } else {
            await showAlert({ title: 'Erro', message: 'Erro ao arquivar o pedido.', type: 'error' })
        }
        setUpdatingStatus(false)
    }

    // Filtros
    const filteredOrders = orders.filter(order => {
        const customerName = order.customers?.name || order.customer_name || ''
        const matchSearch = customerName.toLowerCase().includes(search.toLowerCase())
            || order.id.toLowerCase().includes(search.toLowerCase())
            || (!order.customers && !order.customer_name && search.toLowerCase() === 'balcão')
        const matchStatus = statusFilter === 'all' || order.status === statusFilter
        const matchDelivery = deliveryFilter === 'all' || order.delivery_status === deliveryFilter
        return matchSearch && matchStatus && matchDelivery
    })

    const getCustomerDisplay = (order: Order) => {
        if (order.customers?.name) return order.customers.name
        if (order.customer_name && order.customer_name !== 'Visitante') return order.customer_name
        return null
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 mt-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                        <ClipboardList className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white mb-1 tracking-tight">Gestão de Pedidos</h1>
                        <p className="text-sm md:text-base text-surface-500 dark:text-surface-400 font-light">Histórico de vendas e entregas</p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou ID..."
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
                <div className="flex flex-wrap gap-3 md:gap-4 lg:w-max">
                    <div className="w-full sm:w-auto relative group">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as SaleStatus | 'all')}
                            className="w-full sm:w-auto min-w-[180px] px-4 py-3.5 appearance-none rounded-2xl text-sm font-medium bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 shadow-sm cursor-pointer pr-10"
                        >
                            <option value="all">Pagamento: Todos</option>
                            <option value="pending">Apenas Pendentes</option>
                            <option value="paid">Apenas Pagos</option>
                            <option value="cancelled">Cancelados</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                    </div>
                    <div className="w-full sm:w-auto relative group">
                        <select
                            value={deliveryFilter}
                            onChange={(e) => setDeliveryFilter(e.target.value as DeliveryStatus | 'all')}
                            className="w-full sm:w-auto min-w-[180px] px-4 py-3.5 appearance-none rounded-2xl text-sm font-medium bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 shadow-sm cursor-pointer pr-10"
                        >
                            <option value="all">Entrega: Todas</option>
                            <option value="pending">Apenas Pendentes</option>
                            <option value="shipped">A Caminho</option>
                            <option value="pickup">Para Retirar</option>
                            <option value="delivered">Entregues</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white dark:bg-surface-900 rounded-[1.5rem] md:rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400">
                            <tr>
                                <th className="px-3 md:px-6 py-3 md:py-4 font-medium">Data / Hora</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 font-medium hidden sm:table-cell">Cliente</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 font-medium">Total</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 font-medium hidden md:table-cell">Pagamento</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 font-medium hidden sm:table-cell">Situação</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-surface-500 dark:text-surface-400">
                                        Nenhum pedido encontrado com estes filtros.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const PayIcon = paymentMap[order.payment_method].icon
                                    const status = getStatusBadge(order.status)
                                    const delivery = getDeliveryBadge(order.delivery_status)
                                    const customer = getCustomerDisplay(order)
                                    return (
                                        <tr key={order.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/50 transition-colors">
                                            <td className="px-3 md:px-6 py-3 md:py-4">
                                                <div className="text-surface-900 dark:text-surface-100 font-medium text-xs md:text-sm">
                                                    {formatDateTime(order.created_at).split(' ')[0]}
                                                </div>
                                                <div className="text-[10px] md:text-xs text-surface-400 dark:text-surface-500">
                                                    {formatDateTime(order.created_at).split(' ')[1]}
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                                                {customer ? (
                                                    <div className="font-medium text-surface-900 dark:text-surface-100">{customer}</div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 text-surface-500 dark:text-surface-400 italic">
                                                        <User className="w-3.5 h-3.5" /> Venda Balcão
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 font-semibold text-primary-600 dark:text-primary-400 text-xs md:text-sm">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                                                <div className="flex items-center gap-1.5 text-surface-600 dark:text-surface-400">
                                                    <PayIcon className="w-4 h-4" />
                                                    {paymentMap[order.payment_method].label}
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border w-fit', status.color, status.darkColor)}>
                                                        {status.label}
                                                    </span>
                                                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border w-fit', delivery.color, delivery.darkColor)}>
                                                        {delivery.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                                                <button
                                                    onClick={() => openOrderDetails(order)}
                                                    className="inline-flex items-center justify-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors min-h-[36px]"
                                                >
                                                    <Eye className="w-4 h-4" /> Detalhes
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modal de Detalhes do Pedido (Redesenhada) ──────── */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-surface-900/70 dark:bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedOrder(null)} />

                    <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-surface-900 rounded-2xl shadow-modal animate-scale-in border border-surface-200 dark:border-surface-700">
                        {/* Header */}
                        <div className="flex-shrink-0 border-b border-surface-200 dark:border-surface-700 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">Detalhes do Pedido</h2>
                                <p className="text-xs text-surface-400 dark:text-surface-500 font-mono mt-0.5">ID: {selectedOrder.id.slice(0, 8)}...</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Cards de Resumo */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                                    <h3 className="text-xs font-medium text-surface-500 dark:text-surface-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                        <Calendar className="w-3.5 h-3.5" /> Data da Venda
                                    </h3>
                                    {isEditing ? (
                                        <input
                                            type="datetime-local"
                                            value={editForm.created_at ? (() => {
                                                const d = new Date(editForm.created_at)
                                                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
                                            })() : ''}
                                            onChange={(e) => setEditForm({ ...editForm, created_at: new Date(e.target.value).toISOString() })}
                                            className="w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg px-2 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary-500/50 outline-none"
                                        />
                                    ) : (
                                        <p className="font-semibold text-surface-900 dark:text-surface-100">{formatDateTime(selectedOrder.created_at)}</p>
                                    )}
                                </div>
                                <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                                    <h3 className="text-xs font-medium text-surface-500 dark:text-surface-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                        <User className="w-3.5 h-3.5" /> Cliente
                                    </h3>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Nome do Cliente"
                                                value={editForm.customer_name || ''}
                                                onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                                                className="w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg px-2 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary-500/50 outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Telefone"
                                                value={editForm.customer_phone || ''}
                                                onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
                                                className="w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg px-2 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary-500/50 outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <p className="font-semibold text-surface-900 dark:text-surface-100">
                                                {selectedOrder.customers?.name || selectedOrder.customer_name || 'Venda Balcão'}
                                            </p>
                                            {(selectedOrder.customers?.phone || selectedOrder.customer_phone) && (
                                                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{selectedOrder.customers?.phone || selectedOrder.customer_phone}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Detalhes Financeiros Editáveis */}
                            <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-xs font-medium text-surface-500 dark:text-surface-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                            <Banknote className="w-3.5 h-3.5" /> Valor Total
                                        </h3>
                                        {isEditing ? (
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">R$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editForm.total_amount || 0}
                                                    onChange={(e) => setEditForm({ ...editForm, total_amount: parseFloat(e.target.value) })}
                                                    className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm font-bold text-primary-600 outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                            </div>
                                        ) : (
                                            <p className="font-bold text-primary-600 dark:text-primary-400 text-lg">{formatCurrency(selectedOrder.total_amount)}</p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-medium text-surface-500 dark:text-surface-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                            <CreditCard className="w-3.5 h-3.5" /> Pagamento
                                        </h3>
                                        {isEditing ? (
                                            <select
                                                value={editForm.payment_method}
                                                onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value as PaymentMethod })}
                                                className="w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg px-2 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary-500/50 outline-none"
                                            >
                                                {Object.entries(paymentMap).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="font-semibold text-surface-900 dark:text-surface-100">{paymentMap[selectedOrder.payment_method].label}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Gestão de Status (Redesenhada) ── */}
                            <div className="border-2 border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
                                <div className="bg-surface-100 dark:bg-surface-800 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                                    <h3 className="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider flex items-center gap-2">
                                        <ChevronDown className="w-4 h-4" />
                                        Gestão de Status
                                    </h3>
                                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                                        Selecione o novo status. Todas as alterações pedem confirmação.
                                    </p>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-6">
                                    {/* Status de Pagamento — Dropdown */}
                                    <div>
                                        <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-2 uppercase tracking-wider">
                                            Pagamento
                                        </label>
                                        <select
                                            value={isEditing ? editForm.status : selectedOrder.status}
                                            disabled={updatingStatus}
                                            onChange={(e) => {
                                                if (isEditing) {
                                                    setEditForm({ ...editForm, status: e.target.value as SaleStatus })
                                                } else {
                                                    updateOrderStatus(selectedOrder.id, 'status', e.target.value)
                                                }
                                            }}
                                            className={cn(
                                                'w-full px-3 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all outline-none cursor-pointer',
                                                'bg-white dark:bg-surface-800',
                                                (isEditing ? editForm.status : selectedOrder.status) === 'paid' ? 'border-emerald-400 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400' :
                                                    (isEditing ? editForm.status : selectedOrder.status) === 'cancelled' ? 'border-red-400 dark:border-red-500/40 text-red-700 dark:text-red-400' :
                                                        'border-amber-400 dark:border-amber-500/40 text-amber-700 dark:text-amber-400',
                                                'disabled:opacity-50'
                                            )}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status de Entrega — Dropdown */}
                                    <div>
                                        <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-2 uppercase tracking-wider">
                                            Entrega
                                        </label>
                                        <select
                                            value={isEditing ? editForm.delivery_status : selectedOrder.delivery_status}
                                            disabled={updatingStatus}
                                            onChange={(e) => {
                                                if (isEditing) {
                                                    setEditForm({ ...editForm, delivery_status: e.target.value as DeliveryStatus })
                                                } else {
                                                    updateOrderStatus(selectedOrder.id, 'delivery_status', e.target.value)
                                                }
                                            }}
                                            className={cn(
                                                'w-full px-3 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all outline-none cursor-pointer',
                                                'bg-white dark:bg-surface-800',
                                                (isEditing ? editForm.delivery_status : selectedOrder.delivery_status) === 'delivered' ? 'border-emerald-400 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400' :
                                                    (isEditing ? editForm.delivery_status : selectedOrder.delivery_status) === 'shipped' ? 'border-blue-400 dark:border-blue-500/40 text-blue-700 dark:text-blue-400' :
                                                        (isEditing ? editForm.delivery_status : selectedOrder.delivery_status) === 'pickup' ? 'border-purple-400 dark:border-purple-500/40 text-purple-700 dark:text-purple-400' :
                                                            'border-amber-400 dark:border-amber-500/40 text-amber-700 dark:text-amber-400',
                                                'disabled:opacity-50'
                                            )}
                                        >
                                            {deliveryOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Observações */}
                            <div>
                                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                                    <FileText className="w-4 h-4 text-surface-400" /> Observações / Endereço
                                </h3>
                                {isEditing ? (
                                    <textarea
                                        value={editForm.notes || ''}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        placeholder="Adicione observações ou endereço de entrega..."
                                        rows={3}
                                        className="w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none resize-none"
                                    />
                                ) : (
                                    selectedOrder.notes ? (
                                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-lg text-sm text-amber-900 dark:text-amber-300 whitespace-pre-wrap">
                                            {selectedOrder.notes}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-surface-400 italic">Nenhuma observação.</p>
                                    )
                                )}
                            </div>

                            {/* Lista de Itens */}
                            <div>
                                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-1.5 mb-3">
                                    <Package className="w-4 h-4 text-surface-400" /> Itens do Pedido
                                </h3>

                                {loadingItems ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-surface-300" />
                                    </div>
                                ) : (
                                    <div className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400">
                                                <tr>
                                                    <th className="px-4 py-2.5 font-medium">Produto</th>
                                                    <th className="px-4 py-2.5 font-medium">Qtd</th>
                                                    <th className="px-4 py-2.5 font-medium">Preço Un.</th>
                                                    <th className="px-4 py-2.5 font-medium text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                                                {selectedOrder.sale_items?.map(item => (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-3 text-surface-900 dark:text-surface-100 font-medium">{item.products?.name}</td>
                                                        <td className="px-4 py-3 text-surface-600 dark:text-surface-400">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-surface-600 dark:text-surface-400">{formatCurrency(item.unit_price)}</td>
                                                        <td className="px-4 py-3 text-surface-900 dark:text-surface-100 font-semibold text-right">{formatCurrency(item.total_price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-surface-50 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700">
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-3 text-right font-medium text-surface-600 dark:text-surface-400">
                                                        Total ({paymentMap[isEditing ? (editForm.payment_method as PaymentMethod) : selectedOrder.payment_method].label}):
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-primary-600 dark:text-primary-400 text-lg">
                                                        {formatCurrency(isEditing ? (editForm.total_amount || 0) : selectedOrder.total_amount)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer — Ações */}
                        <div className="flex-shrink-0 border-t border-surface-200 dark:border-surface-700 px-6 py-4 bg-surface-50 dark:bg-surface-800/50 flex items-center justify-between gap-3">
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSaveEdits}
                                            disabled={updatingStatus}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-all disabled:opacity-50"
                                        >
                                            Salvar Alterações
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            disabled={updatingStatus}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-all"
                                        >
                                            Editar Pedido
                                        </button>

                                        {/* Excluir */}
                                        <button
                                            onClick={() => deleteOrder(selectedOrder.id)}
                                            disabled={updatingStatus}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 transition-all disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Excluir
                                        </button>

                                        {/* Arquivar (apenas se entregue) */}
                                        {selectedOrder.delivery_status === 'delivered' && selectedOrder.status !== 'cancelled' && (
                                            <button
                                                onClick={() => archiveOrder(selectedOrder.id)}
                                                disabled={updatingStatus}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20 transition-all disabled:opacity-50"
                                            >
                                                <Archive className="w-4 h-4" />
                                                Arquivar
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            {updatingStatus && (
                                <div className="flex items-center gap-2 text-sm text-surface-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processando...
                                </div>
                            )}

                            {!isEditing && (
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-300 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                                >
                                    Fechar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
