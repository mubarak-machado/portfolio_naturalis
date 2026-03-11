import { 
    Megaphone, 
    Sparkles, 
    LayoutTemplate, 
    Download, 
    Zap,
    ArrowLeft,
    CheckCircle2,
    Lightbulb
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MarketingGuide() {
    return (
        <div className="prose dark:prose-invert max-w-none">
            {/* Header */}
            <header className="mb-12 border-b border-surface-200 dark:border-surface-800 pb-8 not-prose">
                <div className="flex items-center gap-3 text-pink-500 mb-4">
                    <Megaphone className="w-8 h-8" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em]">Criatividade & IA</span>
                </div>
                <h1 className="text-4xl font-heading font-black text-surface-900 dark:text-white mb-4">
                    Marketing Studio
                </h1>
                <p className="text-xl text-surface-500 dark:text-surface-400 font-light max-w-3xl">
                    Transforme seus produtos em posts profissionais para WhatsApp em segundos usando Inteligência Artificial.
                </p>
            </header>

            {/* Passo a Passo IA */}
            <section className="mb-16">
                <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                    <Sparkles className="w-6 h-6 text-primary-500" />
                    Como Gerar um Post com IA
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                            <div>
                                <p className="font-bold mb-1">Escolha o Produto</p>
                                <p className="text-sm text-surface-500">Selecione o item do seu catálogo que deseja promover.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                            <div>
                                <p className="font-bold mb-1">Descreva o Objetivo</p>
                                <p className="text-sm text-surface-500">Diga à IA o que você quer (ex: "Promoção de Verão" ou "Benefícios da Imunidade").</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                            <div>
                                <p className="font-bold mb-1">Escolha a Variação</p>
                                <p className="text-sm text-surface-500">A IA gerará várias opções de texto (Headline e Body) para você escolher.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                        <div className="flex items-center gap-3 text-indigo-500 mb-4">
                            <LayoutTemplate className="w-6 h-6" />
                            <h3 className="font-bold uppercase tracking-wider text-sm">O Editor Canvas</h3>
                        </div>
                        <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-4">
                            Após a IA gerar os textos, você entra no **Canvas**, onde pode arrastar elementos, mudar cores, adicionar formas e ajustar tudo antes de baixar.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary-600 uppercase tracking-widest">
                            Controle total sobre o design
                        </div>
                    </div>
                </div>
            </section>

            {/* Dicas e Efeitos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-16">
                <div className="p-8 rounded-[2rem] bg-primary-500/5 border border-primary-500/20">
                    <div className="flex items-center gap-3 text-primary-500 mb-4">
                        <Lightbulb className="w-6 h-6" />
                        <h3 className="font-bold uppercase tracking-wider text-sm">Dica de mestre</h3>
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                        No Canvas, você pode trocar o **Formato do Post** (Feed ou Story) e a IA ajustará o layout automaticamente para você.
                    </p>
                </div>

                <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-3 text-emerald-500 mb-4">
                        <CheckCircle2 className="w-6 h-6" />
                        <h3 className="font-bold uppercase tracking-wider text-sm">Pronto para Enviar</h3>
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                        Ao clicar em **"Baixar Imagem"**, o arquivo é salvo em PNG de alta resolução, pronto para ser disparado nas suas listas do WhatsApp.
                    </p>
                </div>
            </div>

            {/* Rodapé de Navegação */}
            <div className="flex justify-between items-center py-8 border-t border-surface-200 dark:border-surface-800 not-prose">
                <Link to="/admin/ajuda/produtos" className="group flex items-center gap-3 text-sm font-bold text-surface-500 hover:text-primary-500 transition-colors">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Anterior: Gestão de Inventário
                </Link>
                <Link to="/admin/ajuda" className="group flex items-center gap-3 text-sm font-bold text-surface-900 dark:text-white hover:text-primary-500 transition-colors">
                    Voltar ao Hub
                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
