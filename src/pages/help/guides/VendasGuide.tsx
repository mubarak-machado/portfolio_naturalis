import { Link } from 'react-router-dom'
import { 
    ShoppingCart, 
    CheckCircle2, 
    AlertTriangle, 
    Info, 
    Edit, 
    ArrowRight,
    Search,
    History
} from 'lucide-react'

export default function VendasGuide() {
    return (
        <div className="prose dark:prose-invert max-w-none">
            {/* Header */}
            <header className="mb-12 border-b border-surface-200 dark:border-surface-800 pb-8 not-prose">
                <div className="flex items-center gap-3 text-orange-500 mb-4">
                    <ShoppingCart className="w-8 h-8" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em]">Fluxo de Operação</span>
                </div>
                <h1 className="text-4xl font-heading font-black text-surface-900 dark:text-white mb-4">
                    Vendas & Pedidos
                </h1>
                <p className="text-xl text-surface-500 dark:text-surface-400 font-light max-w-3xl">
                    Este guia cobre desde o recebimento de um pedido na vitrine até a finalização e edição de registros históricos.
                </p>
            </header>

            {/* Início: O Ciclo do Pedido */}
            <section className="mb-16">
                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                    <Info className="w-6 h-6 text-primary-500" />
                    O Ciclo de Vida do Pedido
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose">
                    <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50">
                        <div className="text-3xl font-black text-primary-500/30 mb-2">01</div>
                        <h4 className="font-bold mb-2">Entrada</h4>
                        <p className="text-sm text-surface-500">O cliente faz a compra na vitrine. O sistema gera um ID único e envia via WhatsApp.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50">
                        <div className="text-3xl font-black text-primary-500/30 mb-2">02</div>
                        <h4 className="font-bold mb-2">Processamento</h4>
                        <p className="text-sm text-surface-500">Você altera o status para 'Pago' ou 'Cancelado' e define a etapa de entrega.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50">
                        <div className="text-3xl font-black text-primary-500/30 mb-2">03</div>
                        <h4 className="font-bold mb-2">Conclusão</h4>
                        <p className="text-sm text-surface-500">O pedido é arquivado no histórico e impacta diretamente os gráficos do Dashboard.</p>
                    </div>
                </div>
            </section>

            {/* Execução: Editando Pedidos */}
            <section className="mb-16">
                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                    <Edit className="w-6 h-6 text-orange-500" />
                    Como Editar uma Venda Realizada
                </h2>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                        <div>
                            <p className="font-bold mb-1">Localize o Pedido</p>
                            <p className="text-surface-500">Vá em **Gestão de Pedidos** e use a barra de pesquisa ou os filtros de status para encontrar a venda.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                        <div>
                            <p className="font-bold mb-1">Ative o Modo Edição</p>
                            <p className="text-surface-500">Clique no ícone de "olho" para ver detalhes e selecione o botão **"Editar Pedido"** no rodapé da janela.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                        <div>
                            <p className="font-bold mb-1">Confirme as Alterações</p>
                            <p className="text-surface-500">Após mudar os dados, clique em **"Salvar"**. Um aviso de segurança aparecerá pedindo sua confirmação final.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cuidados e Efeitos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-16">
                <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-3 text-amber-500 mb-4">
                        <AlertTriangle className="w-6 h-6" />
                        <h3 className="font-bold uppercase tracking-wider text-sm">Cuidados Importantes</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-surface-600 dark:text-surface-400">
                        <li className="flex gap-2">
                            <span className="text-amber-500">•</span>
                            <span>**Data Retroativa**: Mudar a data de uma venda alterará os gráficos do dashboard no mês correspondente.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-amber-500">•</span>
                            <span>**Exclusão**: Deletar um pedido é permanente e remove o registro completamente do banco de dados.</span>
                        </li>
                    </ul>
                </div>

                <div className="p-8 rounded-[2rem] bg-primary-500/5 border border-primary-500/20">
                    <div className="flex items-center gap-3 text-primary-500 mb-4">
                        <CheckCircle2 className="w-6 h-6" />
                        <h3 className="font-bold uppercase tracking-wider text-sm">Efeitos no Sistema</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-surface-600 dark:text-surface-400">
                        <li className="flex gap-2">
                            <span className="text-primary-500">•</span>
                            <span>O faturamento total é recalculado instantaneamente após cada edição.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-500">•</span>
                            <span>O histórico do cliente é atualizado com os novos valores para cálculos de fidelidade.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Rodapé de Navegação */}
            <div className="flex justify-between items-center py-8 border-t border-surface-200 dark:border-surface-800 not-prose">
                <div />
                <Link to="/admin/ajuda/produtos" className="group flex items-center gap-3 text-sm font-bold text-surface-900 dark:text-white hover:text-primary-500 transition-colors">
                    Próximo tópico: Gestão de Inventário
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
