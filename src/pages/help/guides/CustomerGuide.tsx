import { 
    Users, 
    UserPlus, 
    History, 
    MessageSquare, 
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Search
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CustomerGuide() {
    return (
        <div className="prose dark:prose-invert max-w-none">
            {/* Header */}
            <header className="mb-12 border-b border-surface-200 dark:border-surface-800 pb-8 not-prose">
                <div className="flex items-center gap-3 text-purple-500 mb-4">
                    <Users className="w-8 h-8" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em]">Relacionamento</span>
                </div>
                <h1 className="text-4xl font-heading font-black text-surface-900 dark:text-white mb-4">
                    CRM de Clientes
                </h1>
                <p className="text-xl text-surface-500 dark:text-surface-400 font-light max-w-3xl">
                    Saiba quem são seus clientes mais fiéis e mantenha um histórico completo de cada interação.
                </p>
            </header>

            {/* Gestão de Contatos */}
            <section className="mb-16">
                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                    <UserPlus className="w-6 h-6 text-primary-500" />
                    Gestão de Clientes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                    <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50">
                        <h4 className="font-bold mb-2">Busca Rápida</h4>
                        <p className="text-sm text-surface-500">Use a barra de pesquisa para encontrar clientes por nome ou telefone instantaneamente.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50">
                        <h4 className="font-bold mb-2">Histórico Completo</h4>
                        <p className="text-sm text-surface-500">Ao clicar em um cliente, você vê todos os pedidos já realizados, o que facilita o atendimento personalizado.</p>
                    </div>
                </div>
            </section>

            {/* Contato Direto */}
            <section className="mb-16">
                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                    <MessageSquare className="w-6 h-6 text-emerald-500" />
                    Contato via WhatsApp
                </h2>
                <p className="mb-4 text-lg">
                    Agilidade é fundamental no pós-venda.
                </p>
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl not-prose">
                    <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed italic">
                        "Dentro do perfil do cliente, você encontrará o ícone do WhatsApp. Ao clicar, o sistema abre automaticamente uma conversa com o número dele, permitindo enviar atualizações de pedidos ou promoções personalizadas."
                    </p>
                </div>
            </section>

            {/* Rodapé de Navegação */}
            <div className="flex justify-between items-center py-8 border-t border-surface-200 dark:border-surface-800 not-prose">
                <Link to="/admin/ajuda/vendas" className="group flex items-center gap-3 text-sm font-bold text-surface-500 hover:text-primary-500 transition-colors">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Anterior: Vendas & Pedidos
                </Link>
                <Link to="/admin/ajuda/marketing" className="group flex items-center gap-3 text-sm font-bold text-surface-900 dark:text-white hover:text-primary-500 transition-colors">
                    Próximo: Marketing Studio
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
