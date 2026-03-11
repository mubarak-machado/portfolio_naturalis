/**
 * CustomersPage — Gestão de Clientes (CRUD Completo)
 * ====================================================
 * Página para gerenciar o cadastro de clientes.
 * 
 * Funcionalidades:
 * - Listagem em tabela com busca por nome.
 * - Modal para criar/editar cliente.
 * - Exclusão com confirmação.
 * - Clique no telefone abre o WhatsApp Web.
 */

import { useState, useEffect, type FormEvent } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    User,
    Calendar,
    ShoppingBag,
    Package,
    ChevronRight,
    TrendingUp,
    Upload,
    Mail,
    FileText,
    Loader2,
    MessageCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import type { Customer, PaymentMethod, SaleStatus, DeliveryStatus } from '@/types/database'
import { useAppModal } from '@/contexts/ModalContext'

const emptyForm = { name: '', phone: '', email: '', notes: '' }

interface CustomerOrder {
    id: string
    created_at: string
    total_amount: number
    payment_method: PaymentMethod
    status: SaleStatus
    delivery_status: DeliveryStatus
}

interface CustomerWithLTV extends Customer {
    ltv?: number // Lifetime value (Total gasto)
    orders_count?: number
    last_order_date?: string
}

const statusMap = {
    paid: { label: 'Pago', color: 'bg-success-100 text-success-700 border-success-200' },
    pending: { label: 'Pendente', color: 'bg-warning-100 text-warning-700 border-warning-200' },
    cancelled: { label: 'Cancelado', color: 'bg-danger-100 text-danger-700 border-danger-200' },
}

export default function CustomersPage() {
    const navigate = useNavigate()
    const [customers, setCustomers] = useState<CustomerWithLTV[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Modal Tooling
    const { showAlert, showConfirm } = useAppModal()

    // CRM Panel (Visão 360)
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithLTV | null>(null)
    const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([])
    const [loadingOrders, setLoadingOrders] = useState(false)

    async function loadCustomers() {
        setLoading(true)
        // Busca clientes junto com suas vendas agregadas para calcular LTV
        const { data, error } = await supabase
            .from('customers')
            .select(`
                *,
                sales (
                    id,
                    total_amount,
                    created_at,
                    status
                )
            `)
            .order('name')

        if (error) {
            console.error('Erro ao carregar clientes:', error)
            await showAlert({
                title: 'Erro de Carregamento',
                message: `Erro ao carregar lista de clientes: ${error.message}`,
                type: 'error'
            })
        }

        if (!error && data) {
            // Calcula LTV no frontend
            type SaleRecord = { status: string; total_amount: number; created_at: string }
            type CustomerRecord = Customer & { sales: SaleRecord[] }

            const enhancedCustomers = (data as unknown as CustomerRecord[]).map((c) => {
                const validSales = c.sales?.filter((s) => s.status !== 'cancelled') || []
                const ltv = validSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
                const last_order = validSales.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

                return {
                    ...c,
                    ltv,
                    orders_count: validSales.length,
                    last_order_date: last_order?.created_at
                }
            })
            setCustomers(enhancedCustomers)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadCustomers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const filtered = customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search))
    )

    function openCreate() {
        setEditingId(null)
        setForm(emptyForm)
        setImageFile(null)
        setImagePreview(null)
        setShowModal(true)
    }

    function openEdit(e: React.MouseEvent, customer: Customer) {
        e.stopPropagation() // Evita abrir o painel CRM
        setEditingId(customer.id)
        setForm({
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            notes: customer.notes || ''
        })
        setImageFile(null)
        setImagePreview(customer.image_url)
        setShowModal(true)
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limite
                showAlert({
                    title: 'Arquivo muito grande',
                    message: 'A imagem é muito grande! O tamanho máximo permitido é de 1MB.',
                    type: 'warning'
                })
                e.target.value = '' // Reseta o input
                return
            }
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    async function openCrmPanel(customer: CustomerWithLTV) {
        setSelectedCustomer(customer)
        setLoadingOrders(true)
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setCustomerOrders(data as CustomerOrder[])
        }
        setLoadingOrders(false)
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setSaving(true)

        let image_url = editingId
            ? customers.find((c) => c.id === editingId)?.image_url || null
            : null

        // Upload de imagem (se houver nova foto)
        if (imageFile) {
            const ext = imageFile.name.split('.').pop()
            const fileName = `customers/${Date.now()}.${ext}`
            const { error: uploadError } = await supabase.storage
                .from('product-images') // Reutilizando o bucket de produtos por conveniência
                .upload(fileName, imageFile)

            if (!uploadError) {
                const { data: urlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName)
                image_url = urlData.publicUrl
            } else {
                console.error("Erro no upload de imagem:", uploadError)
                await showAlert({
                    title: 'Erro de Upload',
                    message: `Erro ao fazer upload da imagem: ${uploadError.message}`,
                    type: 'error'
                })
                setSaving(false)
                return
            }
        }

        const payload = {
            name: form.name,
            phone: form.phone || null,
            email: form.email || null,
            notes: form.notes || null,
            image_url,
        }

        const { error } = editingId
            ? await supabase.from('customers').update(payload).eq('id', editingId)
            : await supabase.from('customers').insert(payload)

        if (error) {
            console.error('Erro ao salvar cliente:', error)
            await showAlert({
                title: 'Erro de Operação',
                message: `Falha ao salvar. Detalhes: ${error.message}`,
                type: 'error'
            })
            setSaving(false)
            return
        }

        setSaving(false)
        setShowModal(false)
        loadCustomers()
    }

    async function handleDelete(e: React.MouseEvent, id: string, name: string) {
        e.stopPropagation() // Evita abrir o painel CRM
        const confirmed = await showConfirm({
            title: 'Excluir Cliente',
            message: `Você tem certeza que deseja excluir permanentemente o cliente "${name}"?`,
            type: 'error',
            confirmText: 'Excluir'
        })
        if (!confirmed) return

        await supabase.from('customers').delete().eq('id', id)
        loadCustomers()
    }

    function openWhatsApp(e: React.MouseEvent, phone: string) {
        e.stopPropagation() // Evita abrir o painel CRM
        const cleaned = phone.replace(/\D/g, '')
        window.open(`https://wa.me/55${cleaned}`, '_blank')
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 mt-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white mb-1 tracking-tight">Clientes</h1>
                        <p className="text-sm md:text-base text-surface-500 dark:text-surface-400 font-light">
                            {customers.length} cliente{customers.length !== 1 ? 's' : ''} cadastrado{customers.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <button
                    onClick={openCreate}
                    className={cn(
                        'flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white w-full sm:w-auto mt-4 sm:mt-0',
                        'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30',
                        'transition-all duration-200'
                    )}
                >
                    <Plus className="w-5 h-5" />
                    Novo Cliente
                </button>
            </div>

            {/* Busca */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou telefone..."
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

            {/* Tabela */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white dark:bg-surface-900 rounded-[1.5rem] border border-surface-200/50 dark:border-surface-800/50 p-12 shadow-sm text-center">
                    <User className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                    <p className="text-base text-surface-500 dark:text-surface-400 font-medium">
                        {search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-surface-900 rounded-[1.5rem] md:rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 shadow-sm overflow-hidden auto-rows-max">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm whitespace-nowrap">
                            <thead>
                            <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50">
                                <th className="text-left px-5 py-3 font-medium text-surface-500 dark:text-surface-400">Nome / LTV</th>
                                <th className="text-left px-5 py-3 font-medium text-surface-500 dark:text-surface-400 hidden sm:table-cell">Telefone</th>
                                <th className="text-left px-5 py-3 font-medium text-surface-500 dark:text-surface-400 hidden md:table-cell">Última Compra</th>
                                <th className="text-right px-5 py-3 font-medium text-surface-500 dark:text-surface-400 hidden sm:table-cell">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((customer) => (
                                <tr
                                    key={customer.id}
                                    onClick={() => openCrmPanel(customer)}
                                    className="border-b border-surface-100 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors cursor-pointer group"
                                >
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            {customer.image_url ? (
                                                <img src={customer.image_url} alt="" className="w-10 h-10 rounded-full object-cover border border-surface-200 dark:border-surface-700" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 flex flex-shrink-0 items-center justify-center border border-surface-200 dark:border-surface-700">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    {customer.name}
                                                </div>
                                                {customer.ltv !== undefined && customer.ltv > 0 && (
                                                    <div className="text-xs text-primary-600 font-medium flex items-center gap-1 mt-0.5">
                                                        <TrendingUp className="w-3 h-3" /> LTV: {formatCurrency(customer.ltv)} ({customer.orders_count} pedidos)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-surface-600 dark:text-surface-300 hidden sm:table-cell">
                                        <div className="flex flex-col gap-1">
                                            {customer.phone ? (
                                                <button
                                                    onClick={(e) => openWhatsApp(e, customer.phone!)}
                                                    className="flex w-fit items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-colors"
                                                    title="Abrir no WhatsApp"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                    {customer.phone}
                                                </button>
                                            ) : (
                                                <span className="text-surface-400 text-xs">—</span>
                                            )}
                                            {customer.email && (
                                                <span className="flex items-center gap-1.5 text-surface-500 dark:text-surface-400 text-xs">
                                                    <Mail className="w-3 h-3" /> {customer.email}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-surface-500 dark:text-surface-400 hidden md:table-cell">
                                        {customer.last_order_date
                                            ? formatDate(customer.last_order_date)
                                            : <span className="text-surface-300 italic">Nunca comprou</span>}
                                    </td>
                                    <td className="px-5 py-3 hidden sm:table-cell">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={(e) => openEdit(e, customer)}
                                                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, customer.id, customer.name)}
                                                className="p-1.5 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-500/10 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-surface-900/40 dark:bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-surface-900 rounded-[2rem] shadow-2xl animate-scale-in border border-surface-200/50 dark:border-surface-800/50 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-surface-50/50 dark:bg-surface-800/20 border-b border-surface-200/50 dark:border-surface-800/50 px-6 py-5 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-xl font-heading font-bold text-surface-900 dark:text-white">
                                {editingId ? 'Editar Cliente' : 'Novo Cliente'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-6">
                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Foto de Perfil */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-primary-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-surface-400 group-hover:text-primary-500 mb-1" />
                                                    <span className="text-[10px] text-surface-400 font-medium px-2 text-center leading-tight">Adicionar Foto</span>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="cust-name" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Nome completo *</label>
                                    <input
                                        id="cust-name"
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 shadow-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="cust-phone" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">WhatsApp</label>
                                        <input
                                            id="cust-phone"
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="(11) 99999-9999"
                                            className="w-full px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="cust-email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">E-mail</label>
                                        <input
                                            id="cust-email"
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="cliente@email.com"
                                            className="w-full px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="cust-notes" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Anotações / Endereço</label>
                                    <textarea
                                        id="cust-notes"
                                        rows={3}
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        placeholder="Preferências, endereço de entrega..."
                                        className="w-full px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm resize-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-surface-100 dark:border-surface-800">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white',
                                            'gradient-primary shadow-lg shadow-primary-500/25',
                                            'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                                        )}
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        {editingId ? 'Salvar' : 'Criar Cliente'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Painel CRM Lateral (Visão 360) */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedCustomer(null)} />

                    <div className="relative w-full max-w-md h-full bg-white dark:bg-surface-900 shadow-[-10px_0_40px_rgba(0,0,0,0.1)] animate-slide-in-right flex flex-col">

                        {/* Header do Perfil */}
                        <div className="px-6 py-8 border-b border-surface-200 dark:border-surface-700 relative">
                            <div className="absolute top-4 right-4 flex items-center gap-1">
                                <button onClick={(e) => { setSelectedCustomer(null); openEdit(e, selectedCustomer); }} className="p-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors" title="Editar">
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button onClick={(e) => { setSelectedCustomer(null); handleDelete(e, selectedCustomer.id, selectedCustomer.name); }} className="p-2 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-500/10 transition-colors" title="Excluir">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button onClick={() => setSelectedCustomer(null)} className="p-2 ml-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4 overflow-hidden -ml-2">
                                {selectedCustomer.image_url ? (
                                    <img src={selectedCustomer.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10" />
                                )}
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-surface-100 mb-1">{selectedCustomer.name}</h2>
                            <div className="space-y-1 mt-2">
                                {selectedCustomer.phone && (
                                    <button
                                        onClick={(e) => openWhatsApp(e, selectedCustomer.phone!)}
                                        className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                                    >
                                        <MessageCircle className="w-4 h-4" /> {selectedCustomer.phone}
                                    </button>
                                )}
                                {selectedCustomer.email && (
                                    <p className="flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400">
                                        <Mail className="w-4 h-4" /> {selectedCustomer.email}
                                    </p>
                                )}
                                {selectedCustomer.notes && (
                                    <p className="flex items-start gap-1.5 text-sm text-surface-500 mt-2 bg-surface-50 p-2 rounded-lg border border-surface-200 dark:border-surface-700">
                                        <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{selectedCustomer.notes}</span>
                                    </p>
                                )}
                            </div>

                            {/* Cards de Métricas */}
                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className="bg-surface-50 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
                                    <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400 mb-1">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-xs font-medium">Lifetime Value</span>
                                    </div>
                                    <p className="text-xl font-bold text-primary-600">
                                        {formatCurrency(selectedCustomer.ltv || 0)}
                                    </p>
                                </div>
                                <div className="bg-surface-50 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
                                    <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400 mb-1">
                                        <ShoppingBag className="w-4 h-4" />
                                        <span className="text-xs font-medium">Pedidos Totais</span>
                                    </div>
                                    <p className="text-xl font-bold text-surface-900 dark:text-surface-100">
                                        {selectedCustomer.orders_count || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Histórico de Pedidos */}
                        <div className="flex-1 overflow-y-auto bg-surface-50/50 dark:bg-surface-950">
                            <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 sticky top-0 z-10 flex text-sm font-semibold text-surface-900 dark:text-surface-100">
                                <Package className="w-4 h-4 mr-2 text-surface-400" />
                                Histórico de Pedidos
                            </div>

                            <div className="p-6">
                                {loadingOrders ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                                    </div>
                                ) : customerOrders.length === 0 ? (
                                    <div className="text-center text-surface-500 py-8">
                                        Este cliente ainda não fez nenhum pedido.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {customerOrders.map(order => (
                                            <div key={order.id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-4 shadow-sm hover:shadow-card transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="font-semibold text-primary-600">
                                                            {formatCurrency(order.total_amount)}
                                                        </div>
                                                        <div className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                                                            <Calendar className="w-3 h-3" /> {formatDate(order.created_at)}
                                                        </div>
                                                    </div>
                                                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border w-fit uppercase', statusMap[order.status].color)}>
                                                        {statusMap[order.status].label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
                                                    <span className="text-xs text-surface-500 font-mono">ID: {order.id.split('-')[0]}</span>
                                                    <button onClick={() => {
                                                        navigate('/admin/pedidos', { state: { openOrderId: order.id } })
                                                    }} className="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center">
                                                        Detalhes <ChevronRight className="w-3 h-3 ml-0.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}
