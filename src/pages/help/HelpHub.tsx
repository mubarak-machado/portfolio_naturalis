import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    Users, 
    Megaphone, 
    Settings, 
    ArrowRight,
    HelpCircle,
    ShieldAlert,
    Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'

const HELP_CATEGORIES = [
    {
        id: 'dashboard',
        title: 'Painéis & Métricas',
        desc: 'Entenda os gráficos de vendas, faturamento e desempenho da sua loja.',
        icon: LayoutDashboard,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        path: '/admin/ajuda/dashboard'
    },
    {
        id: 'produtos',
        title: 'Gestão de Inventário',
        desc: 'Cadastre produtos, controle estoque e categorize seus suplementos.',
        icon: Package,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        path: '/admin/ajuda/produtos'
    },
    {
        id: 'vendas',
        title: 'Vendas & Pedidos',
        desc: 'Gerencie o fluxo de pedidos, altere status e edite detalhes de vendas.',
        icon: ShoppingCart,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        path: '/admin/ajuda/vendas'
    },
    {
        id: 'clientes',
        title: 'CRM de Clientes',
        desc: 'Mantenha sua base de contatos, histórico de compras e fidelização.',
        icon: Users,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        path: '/admin/ajuda/clientes'
    },
    {
        id: 'marketing',
        title: 'Marketing Studio',
        desc: 'Crie artes profissionais com IA e Canvas para o seu WhatsApp.',
        icon: Megaphone,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        path: '/admin/ajuda/marketing'
    },
    {
        id: 'configuracoes',
        title: 'Configurações',
        desc: 'Ajuste dados da loja, contato e preferências do sistema.',
        icon: Settings,
        color: 'text-slate-500',
        bg: 'bg-slate-500/10',
        path: '/admin/ajuda/configuracoes'
    }
]

export default function HelpHub() {
    return (
        <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12 py-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-bold mb-4 uppercase tracking-widest">
                    <Zap className="w-3.5 h-3.5" />
                    Guia do Usuário
                </div>
                <h1 className="text-3xl md:text-5xl font-heading font-black text-surface-900 dark:text-white mb-4 tracking-tight">
                    Como podemos te <span className="text-primary-500">ajudar hoje?</span>
                </h1>
                <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto font-light leading-relaxed">
                    Explore nossos guias passo a passo para dominar todas as ferramentas da Rô Naturalis e impulsionar suas vendas.
                </p>
            </div>

            {/* Grid de Categorias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {HELP_CATEGORIES.map((cat) => (
                    <Link 
                        key={cat.id} 
                        to={cat.path}
                        className="group relative bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/60 dark:border-surface-800/60 p-8 hover:border-primary-500/50 hover:shadow-2xl transition-all duration-500"
                    >
                        <div className={`w-14 h-14 ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                            <cat.icon className="w-7 h-7" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
                            {cat.title}
                            <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-500" />
                        </h3>
                        
                        <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed mb-4">
                            {cat.desc}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-500 uppercase tracking-widest">
                            Ler guia completo
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Tips Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 border-t border-surface-200 dark:border-surface-800">
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Dicas de Segurança</h4>
                        <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                            Nunca compartilhe suas chaves da API ou tokens do Supabase. O sistema já está configurado para o seu uso seguro.
                        </p>
                    </div>
                </div>
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Suporte Direto</h4>
                        <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                            Alguma dúvida não listada? Entre em contato via WhatsApp nas configurações para suporte técnico imediato.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
