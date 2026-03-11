import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
    LayoutDashboard, AlertCircle, ShoppingBag,
    TrendingUp, Package, Users, ArrowRight, Clock, CheckCircle2,
    DollarSign, BarChart3, PieChart
} from 'lucide-react'
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Product, Sale } from '@/types/database'

type TopProduct = {
    name: string
    value: number
    color?: string
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState({
        todayRevenue: 0,
        todaySales: 0,
        totalProducts: 0,
        totalCustomers: 0,
        totalMargin: 0
    })
    const [lowStock, setLowStock] = useState<Product[]>([])
    const [recentSales, setRecentSales] = useState<(Sale & { customerNameResolved?: string })[]>([])
    
    // Advanced Metrics State
    const [salesTrend, setSalesTrend] = useState<{ date: string, revenue: number }[]>([])
    const [topByVolume, setTopByVolume] = useState<TopProduct[]>([])
    const [topByRevenue, setTopByRevenue] = useState<TopProduct[]>([])
    const [topByMargin, setTopByMargin] = useState<TopProduct[]>([])
    
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const todayIso = today.toISOString()
            
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            const thirtyDaysAgoIso = thirtyDaysAgo.toISOString()

            try {
                // 1. Basic Metrics
                const { data: salesToday } = await supabase
                    .from('sales')
                    .select('id, total_amount')
                    .gte('created_at', todayIso)
                    .neq('status', 'cancelled')

                const revenueToday = (salesToday || []).reduce((acc, sale) => acc + Number(sale.total_amount), 0)
                const salesTodayCount = (salesToday || []).length

                const [{ count: pCount }, { count: cCount }] = await Promise.all([
                    supabase.from('products').select('*', { count: 'exact', head: true }),
                    supabase.from('customers').select('*', { count: 'exact', head: true })
                ])

                // 2. Fetch all successful sales from last 30 days for trend and analysis
                const { data: trendData } = await supabase
                    .from('sales')
                    .select('created_at, total_amount')
                    .gte('created_at', thirtyDaysAgoIso)
                    .neq('status', 'cancelled')
                    .order('created_at', { ascending: true })

                // Process Trend Data
                const trendMap = new Map()
                // Initialize last 30 days with 0
                for (let i = 29; i >= 0; i--) {
                    const d = new Date()
                    d.setDate(d.getDate() - i)
                    const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    trendMap.set(dateStr, 0)
                }

                (trendData || []).forEach(s => {
                    const dateStr = new Date(s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    if (trendMap.has(dateStr)) {
                        trendMap.set(dateStr, trendMap.get(dateStr) + Number(s.total_amount))
                    }
                })

                setSalesTrend(Array.from(trendMap.entries()).map(([date, revenue]) => ({ date, revenue })))

                // 3. Top Products Analysis (Deep Query)
                // We fetch sale_items joined with products for last 30 days
                const { data: itemsData } = await supabase
                    .from('sale_items')
                    .select(`
                        quantity,
                        total_price,
                        unit_price,
                        products (name, cost_price),
                        sales!inner (status, created_at)
                    `)
                    .gte('sales.created_at', thirtyDaysAgoIso)
                    .neq('sales.status', 'cancelled')

                // Aggregate
                const productStats: Record<string, { volume: number, revenue: number, margin: number }> = {}
                let totalMarginMonth = 0;

                (itemsData || []).forEach((item: any) => {
                    const pName = item.products?.name || 'Desconhecido'
                    const cost = item.products?.cost_price || 0
                    const margin = (item.unit_price - cost) * item.quantity
                    
                    if (!productStats[pName]) {
                        productStats[pName] = { volume: 0, revenue: 0, margin: 0 }
                    }
                    productStats[pName].volume += item.quantity
                    productStats[pName].revenue += item.total_price
                    productStats[pName].margin += margin
                    totalMarginMonth += margin
                })

                const topVolume = Object.entries(productStats)
                    .map(([name, stat]) => ({ name, value: stat.volume }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)

                const topRevenue = Object.entries(productStats)
                    .map(([name, stat]) => ({ name, value: stat.revenue }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)

                const topMargin = Object.entries(productStats)
                    .map(([name, stat]) => ({ name, value: stat.margin }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)

                setTopByVolume(topVolume)
                setTopByRevenue(topRevenue)
                setTopByMargin(topMargin)

                setMetrics({
                    todayRevenue: revenueToday,
                    todaySales: salesTodayCount,
                    totalProducts: pCount || 0,
                    totalCustomers: cCount || 0,
                    totalMargin: totalMarginMonth
                })

                // 4. Low stock
                const { data: lowStockData } = await supabase
                    .from('products')
                    .select('*')
                    .or('stock_quantity.lte.0,stock_quantity.lte.stock_minimal')
                    .order('stock_quantity', { ascending: true })
                    .limit(5)
                setLowStock(lowStockData as Product[] || [])

                // 5. Recent sales
                const { data: recentSalesData } = await supabase
                    .from('sales')
                    .select(`
                        *,
                        customers:customer_id (name)
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5)

                const mappedRecent = (recentSalesData || []).map(sale => {
                    const cInfo = Array.isArray(sale.customers) ? sale.customers[0] : sale.customers
                    return {
                        ...sale,
                        customerNameResolved: sale.customer_name || (cInfo as { name?: string })?.name || 'Visitante'
                    }
                })
                setRecentSales(mappedRecent as (Sale & { customerNameResolved?: string })[])

            } catch (err) {
                console.error('Erro ao carregar dashboard', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const statCards = [
        { label: 'Hoje', value: formatCurrency(metrics.todayRevenue), icon: TrendingUp, color: 'text-primary-600 bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400', sub: `${metrics.todaySales} vendas` },
        { label: 'Margem (30d)', value: formatCurrency(metrics.totalMargin), icon: DollarSign, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400', sub: 'Lucro Líquido Estimado' },
        { label: 'Catálogo', value: metrics.totalProducts.toString(), icon: Package, color: 'text-surface-600 bg-surface-100 dark:bg-surface-800 dark:text-surface-300', sub: 'Produtos ativos' },
        { label: 'Clientes', value: metrics.totalCustomers.toString(), icon: Users, color: 'text-blue-600 bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400', sub: 'Base total' },
    ]

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    return (
        <div className="animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                        <LayoutDashboard className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white mb-1 tracking-tight">Painel de Performance</h1>
                        <p className="text-sm md:text-base text-surface-500 dark:text-surface-400 font-light">Métricas vitais e tendências da Rô Naturalis</p>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {statCards.map((card, idx) => (
                    <div
                        key={card.label}
                        className="bg-white dark:bg-surface-900 rounded-[1.5rem] border border-surface-200/50 dark:border-surface-800/50 p-6 shadow-sm flex flex-col gap-3 animate-slide-up group"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-all duration-500`}>
                            <card.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-1">{card.label}</p>
                            <p className="text-2xl font-black text-surface-900 dark:text-white tracking-tight leading-none mb-1">
                                {loading ? '---' : card.value}
                            </p>
                            <p className="text-[11px] font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1: Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                <div className="lg:col-span-2 bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 p-6 shadow-sm flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary-500" />
                            Tendência de Venda (30d)
                        </h3>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesTrend}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    interval={Math.floor(salesTrend.length / 5)} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    tickFormatter={(val) => `R$ ${val}`} 
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                        border: 'none', 
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '12px'
                                    }}
                                    formatter={(val: any) => [formatCurrency(Number(val)), 'Faturamento']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top By Revenue */}
                <div className="lg:col-span-1 bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 p-6 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        Top Faturamento
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topByRevenue} layout="vertical" margin={{ left: -10, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={100} 
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                        border: 'none', 
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '12px'
                                    }}
                                    formatter={(val: any) => [formatCurrency(Number(val)), 'Receita Bruta']}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {topByRevenue.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2: Volume & Margin */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
                 {/* Top By Volume */}
                 <div className="bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 p-6 shadow-sm flex flex-col h-[350px]">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-orange-500" />
                        Volume de Vendas (un)
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topByVolume}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                    {topByVolume.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top By Margin */}
                <div className="bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 p-6 shadow-sm flex flex-col h-[350px]">
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-primary-500" />
                        Líderes de Margem de Lucro
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topByMargin} layout="vertical" margin={{ left: -10, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={100} 
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    formatter={(val: any) => [formatCurrency(Number(val)), 'Lucro Estimado']}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {topByMargin.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Stock Alerts & Recent Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-1 bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 shadow-sm flex flex-col h-[450px]">
                    <div className="p-6 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-surface-900 dark:text-white font-heading font-bold text-lg">
                            <AlertCircle className="w-5 h-5 text-warning-500" />
                            Prestes a acabar
                        </div>
                        <Link to="/admin/produtos" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                            Ver todos
                        </Link>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-surface-500">Carregando...</div>
                        ) : lowStock.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                                <CheckCircle2 className="w-16 h-16 text-success-500 mb-4 opacity-20" />
                                <p className="text-surface-500 dark:text-surface-400 text-sm">Estoque saudável.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {lowStock.map(p => (
                                    <div key={p.id} className="p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 flex justify-between items-center transition-colors border border-transparent hover:border-surface-200 dark:hover:border-surface-700">
                                        <div className="min-w-0 pr-4">
                                            <p className="text-sm font-bold text-surface-900 dark:text-white truncate mb-0.5">{p.name}</p>
                                            <p className="text-[10px] font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-widest">Mín: {p.stock_minimal || 0}</p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 ${p.stock_quantity <= 0 ? 'bg-danger-100 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400' : 'bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400'}`}>
                                            {p.stock_quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 shadow-sm flex flex-col h-[450px] overflow-hidden">
                    <div className="p-6 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-surface-900 dark:text-white font-heading font-bold text-lg">
                            <Clock className="w-6 h-6 text-accent-500" />
                            Novos Pedidos
                        </div>
                        <Link to="/admin/pedidos" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 transition-colors">
                            Histórico
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-x-auto p-0">
                        {loading ? (
                            <div className="p-8 text-center text-surface-500">Carregando...</div>
                        ) : recentSales.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                                <ShoppingBag className="w-16 h-16 text-surface-300 dark:text-surface-600 mb-4 opacity-20" />
                                <p className="text-surface-500 dark:text-surface-400 text-sm">Sem pedidos recentes.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-[10px] text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-950/50 uppercase tracking-[0.2em] font-black border-b border-surface-200 dark:border-surface-800">
                                    <tr>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50">
                                    {recentSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors group">
                                            <td className="px-6 py-4 text-surface-500 dark:text-surface-400 font-medium">
                                                {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 text-surface-900 dark:text-white font-bold group-hover:text-primary-500 transition-colors">
                                                {sale.customerNameResolved}
                                            </td>
                                            <td className="px-6 py-4 text-surface-900 dark:text-white font-black text-right">
                                                {formatCurrency(sale.total_amount)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${sale.status === 'paid' ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400' :
                                                    sale.status === 'cancelled' ? 'bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400' :
                                                        'bg-accent-50 text-accent-700 dark:bg-accent-900/20 dark:text-accent-400'
                                                    }`}>
                                                    {sale.status === 'paid' ? 'Pago' : sale.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
