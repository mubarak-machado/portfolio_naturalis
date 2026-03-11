import { 
    Settings, 
    Store, 
    MessageSquare, 
    Palette, 
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Shield
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SettingsGuide() {
    return (
        <div className="prose dark:prose-invert max-w-none">
            {/* Header */}
            <header className="mb-12 border-b border-surface-200 dark:border-surface-800 pb-8 not-prose">
                <div className="flex items-center gap-3 text-slate-500 mb-4">
                    <Settings className="w-8 h-8" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em]">Configuração Geral</span>
                </div>
                <h1 className="text-4xl font-heading font-black text-surface-900 dark:text-white mb-4">
                    Ajustes do Sistema
                </h1>
                <p className="text-xl text-surface-500 dark:text-surface-400 font-light max-w-3xl">
                    Personalize sua loja e defina os canais de contato com seus clientes.
                </p>
            </header>

            {/* Perfil da Loja */}
            <section className="mb-16">
                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                    <Store className="w-6 h-6 text-primary-500" />
                    Perfil da Loja
                </h2>
                <p className="mb-6">
                    Nesta seção, você define o nome da sua loja e as informações básicas que aparecem para o cliente.
                </p>
                <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 not-prose mb-6">
                    <div className="flex items-center gap-3 text-primary-500 mb-2">
                        <MessageSquare className="w-5 h-5" />
                        <h4 className="font-bold">WhatsApp Comercial</h4>
                    </div>
                    <p className="text-sm text-surface-500">Este é o número que receberá as notificações de novos pedidos. Certifique-se de que o número está com o código do país (DDI) e DDD corretos.</p>
                </div>
            </section>

            {/* Preferências de Interface */}
            <section className="mb-16">
                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                    <Palette className="w-6 h-6 text-pink-500" />
                    Tema e Aparência
                </h2>
                <p className="mb-4">
                    O sistema suporta **Modo Claro** e **Modo Escuro**. Você pode alternar clicando no ícone de sol/lua no cabeçalho.
                </p>
                <div className="flex gap-3 items-center p-4 rounded-xl bg-primary-500/5 text-primary-600 dark:text-primary-400 text-sm font-bold italic not-prose">
                    <Shield className="w-4 h-4" />
                    Dica: O Modo Escuro é excelente para longas sessões de uso, reduzindo a fadiga ocular.
                </div>
            </section>

            {/* Rodapé de Navegação */}
            <div className="flex justify-between items-center py-8 border-t border-surface-200 dark:border-surface-800 not-prose">
                <Link to="/admin/ajuda/marketing" className="group flex items-center gap-3 text-sm font-bold text-surface-500 hover:text-primary-500 transition-colors">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Anterior: Marketing Studio
                </Link>
                <Link to="/admin/ajuda" className="group flex items-center gap-3 text-sm font-bold text-surface-900 dark:text-white hover:text-primary-500 transition-colors">
                    Voltar ao Hub
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
