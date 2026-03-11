import { 
    Package, 
    PlusCircle, 
    AlertCircle, 
    CheckCircle2, 
    Layers,
    ArrowLeft,
    ArrowRight,
    Search,
    RefreshCw
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function InventoryGuide() {
    return (
        <div className="prose dark:prose-invert max-w-none">
            {/* Header */}
            <header className="mb-12 border-b border-surface-200 dark:border-surface-800 pb-8 not-prose">
                <div className="flex items-center gap-3 text-emerald-500 mb-4">
                    <Package className="w-8 h-8" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em]">Gestão de Estoque</span>
                </div>
                <h1 className="text-4xl font-heading font-black text-surface-900 dark:text-white mb-4">
                    Produtos & Inventário
                </h1>
                <p className="text-xl text-surface-500 dark:text-surface-400 font-light max-w-3xl">
                    Aprenda a manter seu catálogo atualizado, gerenciar categorias e garantir que seus produtos brilhem na vitrine.
                </p>
            </header>

            {/* Fluxo de Cadastro */}
            <section className="mb-16">
                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                    <PlusCircle className="w-6 h-6 text-primary-500" />
                    Cadastrando Novos Produtos
                </h2>
                <div className="space-y-6">
                    <div className="flex gap-4 p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 not-prose">
                        <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0 font-bold">1</div>
                        <div>
                            <p className="font-bold text-surface-900 dark:text-white">Imagens de Alta Qualidade</p>
                            <p className="text-sm text-surface-500 mt-1">Sempre use fotos nítidas. O sistema aceita imagens de até **1MB**. Imagens leves garantem que sua loja carregue rápido para o cliente.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 not-prose">
                        <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0 font-bold">2</div>
                        <div>
                            <p className="font-bold text-surface-900 dark:text-white">Descrições Persuasivas</p>
                            <p className="text-sm text-surface-500 mt-1">Destaque os benefícios do suplemento, posologia e diferenciais competitivos.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 not-prose">
                        <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0 font-bold">3</div>
                        <div>
                            <p className="font-bold text-surface-900 dark:text-white">Preço e Estoque</p>
                            <p className="text-sm text-surface-500 mt-1">Defina o preço de venda e a quantidade disponível. O estoque é atualizado automaticamente após cada venda.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cuidados e Efeitos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-16">
                <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-3 text-amber-500 mb-4">
                        <AlertCircle className="w-6 h-6" />
                        <h3 className="font-bold uppercase tracking-wider text-sm">Atenção ao Deletar</h3>
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                        Ao remover um produto, ele sumirá instantaneamente da vitrine e do catálogo. Certifique-se de que não há pedidos pendentes vinculados a este item.
                    </p>
                </div>

                <div className="p-8 rounded-[2rem] bg-primary-500/5 border border-primary-500/20">
                    <div className="flex items-center gap-3 text-primary-500 mb-4">
                        <CheckCircle2 className="w-6 h-6" />
                        <h3 className="font-bold uppercase tracking-wider text-sm">Vantagem de Categorizar</h3>
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                        Organizar produtos por categorias ajuda o cliente a encontrar o que precisa mais rápido, aumentando a taxa de conversão da sua loja.
                    </p>
                </div>
            </div>

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
