import { 
    LayoutDashboard, 
    TrendingUp, 
    BarChart3, 
    PieChart, 
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Calendar,
    DollarSign,
    Target
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DashboardGuide() {
    return (
        <div className="prose dark:prose-invert max-w-none">
            {/* Header */}
            <header className="mb-12 border-b border-surface-200 dark:border-surface-800 pb-8 not-prose">
                <div className="flex items-center gap-3 text-blue-500 mb-4">
                    <LayoutDashboard className="w-8 h-8" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em]">Visão Geral</span>
                </div>
                <h1 className="text-4xl font-heading font-black text-surface-900 dark:text-white mb-4">
                    Painéis & Métricas
                </h1>
                <p className="text-xl text-surface-500 dark:text-surface-400 font-light max-w-3xl">
                    Entenda a saúde do seu negócio através de indicadores de desempenho em tempo real e análises avançadas de produtos.
                </p>
            </header>

            {/* Principais Indicadores */}
            <section className="mb-16">
                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                    <TrendingUp className="w-6 h-6 text-primary-500" />
                    Indicadores de Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                    <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50">
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            Margem Bruta (30d)
                        </h4>
                        <p className="text-sm text-surface-500">
                            Calculada com base na diferença entre o **Preço de Venda** e o **Preço de Custo**. 
                            Ajuda a entender quanto lucro real cada produto está deixando.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50">
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary-500" />
                            Tendência de Vendas
                        </h4>
                        <p className="text-sm text-surface-500">
                            Gráfico interativo que mostra a oscilação do seu faturamento dia a dia nos últimos 30 dias.
                        </p>
                    </div>
                </div>
            </section>

            {/* Análise de Produtos */}
            <section className="mb-16">
                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                    <BarChart3 className="w-6 h-6 text-orange-500" />
                    Gráficos de Produtos (Top 5)
                </h2>
                <p className="mb-6">
                    O dashboard agora conta com três análises fundamentais para o seu estoque:
                </p>
                
                <div className="space-y-6">
                    <div className="flex gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800">
                        <div className="font-bold text-primary-500 text-lg">01.</div>
                        <div>
                            <span className="font-bold block text-surface-900 dark:text-white">Volume de Vendas:</span>
                            <span className="text-sm text-surface-500">Identifica os produtos que saem em maior quantidade. Essencial para controle de giro de estoque.</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800">
                        <div className="font-bold text-emerald-500 text-lg">02.</div>
                        <div>
                            <span className="font-bold block text-surface-900 dark:text-white">Top Faturamento:</span>
                            <span className="text-sm text-surface-500">Mostra quais produtos trazem o maior volume financeiro bruto para a loja.</span>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800">
                        <div className="font-bold text-purple-500 text-lg">03.</div>
                        <div>
                            <span className="font-bold block text-surface-900 dark:text-white">Líderes de Margem:</span>
                            <span className="text-sm text-surface-500">Revela os produtos que geram o maior lucro nominal. Nem sempre o que mais vende é o mais lucrativo!</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cuidados e Dicas */}
            <section className="mb-16 bg-primary-50 dark:bg-primary-950/20 p-8 rounded-[2rem] border border-primary-200/50">
                <h3 className="text-primary-700 dark:text-primary-400 font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" />
                    Dicas para Gestão
                </h3>
                <ul className="space-y-3 text-primary-900 dark:text-primary-300">
                    <li>• **Ajuste de Preços:** Use o gráfico de Margem para identificar se algum produto precisa de reajuste no preço de venda ou busca por fornecedor mais barato.</li>
                    <li>• **Promoções:** Identifique produtos de alto giro (Volume) e baixa rentabilidade para fazer combos com produtos de alta margem.</li>
                    <li>• **Sazonalidade:** Use a Tendência de 30 dias para prever reposições de estoque baseadas em aumentos recentes de procura.</li>
                </ul>
            </section>

            {/* Rodapé de Navegação */}
            <div className="flex justify-between items-center py-8 border-t border-surface-200 dark:border-surface-800 not-prose">
                <Link to="/admin/ajuda" className="group flex items-center gap-3 text-sm font-bold text-surface-500 hover:text-primary-500 transition-colors">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Voltar ao Hub
                </Link>
                <Link to="/admin/ajuda/vendas" className="group flex items-center gap-3 text-sm font-bold text-surface-900 dark:text-white hover:text-primary-500 transition-colors">
                    Próximo: Vendas & Pedidos
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
