import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Leaf, ShieldCheck, Truck, Heart, ArrowRight, Star, ShoppingCart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import type { Product } from '@/types/database'

export default function StoreLandingPage() {
    const [featured, setFeatured] = useState<Product[]>([])

    useEffect(() => {
        async function loadFeatured() {
            const { data } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(4)
            if (data) setFeatured(data as Product[])
        }
        loadFeatured()
    }, [])

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const { data, error } = await supabase.from('store_settings').select('whatsapp').eq('id', 1).single()
            if (error && error.code !== 'PGRST116') throw error
            return data || { whatsapp: '5511999999999' }
        }
    })

    const whatsappNumber = settings?.whatsapp || '5511999999999'

    return (
        <div className="relative">
            {/* ── Hero Section ──────────────────────── */}
            <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden pt-14 md:pt-16 bg-gradient-to-br from-primary-50 via-surface-50 to-accent-50/50 dark:from-surface-950 dark:via-surface-950 dark:to-surface-950 transition-colors duration-500">
                {/* Decorative circles / Blobs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary-300/30 dark:bg-primary-900/20 blur-[120px] translate-x-1/4 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[700px] h-[700px] rounded-full bg-accent-300/20 dark:bg-accent-900/20 blur-[150px] -translate-x-1/4 translate-y-1/4" />

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
                    <div className="flex flex-col items-center justify-center gap-6 mb-12">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/50 dark:bg-surface-900/50 backdrop-blur-md rounded-3xl md:rounded-[2rem] p-4 md:p-6 shadow-xl border border-white/20 dark:border-surface-800/50 flex items-center justify-center group hover:scale-105 transition-transform duration-500">
                            <img src="/logo.png" alt="Logo Rô Naturalis" className="w-full h-full object-contain drop-shadow-md group-hover:drop-shadow-xl transition-all" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-heading font-black tracking-tight text-surface-900 dark:text-white uppercase">
                            Rô Naturalis
                        </h2>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-surface-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
                        Sua saúde merece{' '}
                        <span className="relative inline-block text-primary-600 dark:text-primary-400">
                            o melhor
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary-300/50 dark:text-primary-700/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" strokeLinecap="round" />
                            </svg>
                        </span>{' '}
                        da natureza
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-surface-600 dark:text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                        Suplementos naturais de alta qualidade, selecionados com cuidado rigoroso
                        para o seu bem-estar diário e vitalidade.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/loja/produtos"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all duration-300 shadow-[0_8px_30px_rgb(43,157,88,0.3)] hover:shadow-[0_8px_30px_rgb(43,157,88,0.4)] hover:-translate-y-0.5 text-base"
                        >
                            Explorar Coleção
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-900 dark:text-white font-medium rounded-xl border border-surface-200 dark:border-surface-800 transition-all duration-300 shadow-sm text-base"
                        >
                            Falar no WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Benefits ─────────────────────────── */}
            <section className="py-24 bg-surface-100 dark:bg-surface-900 transition-colors relative z-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                        {[
                            {
                                icon: ShieldCheck,
                                title: 'Garantia de Pureza',
                                desc: 'Ingredientes rastreáveis e formulações limpas, sem aditivos químicos.',
                                color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30',
                            },
                            {
                                icon: Truck,
                                title: 'Logística Rápida',
                                desc: 'Embalagem ecológica e entrega expressa para todo o país.',
                                color: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30',
                            },
                            {
                                icon: Heart,
                                title: 'Produção Consciente',
                                desc: 'Respeito à natureza em cada etapa do processo produtivo.',
                                color: 'text-danger-500 bg-danger-50 dark:bg-danger-900/30',
                            },
                        ].map((benefit) => (
                            <div
                                key={benefit.title}
                                className="bg-white dark:bg-surface-950 p-8 rounded-[2rem] hover:shadow-xl transition-all duration-500 group border border-surface-200/50 dark:border-surface-800/50 hover:-translate-y-1"
                            >
                                <div className={`inline-flex p-4 rounded-2xl ${benefit.color} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    <benefit.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-heading font-semibold text-surface-900 dark:text-surface-100 mb-3">
                                    {benefit.title}
                                </h3>
                                <p className="text-surface-500 dark:text-surface-400 text-base leading-relaxed font-light">
                                    {benefit.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Products ─────────────────── */}
            {featured.length > 0 && (
                <section className="py-24 bg-surface-50 dark:bg-surface-950 transition-colors relative">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between mb-12 gap-6 text-center md:text-left">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide uppercase mb-3">
                                    <Star className="w-4 h-4" />
                                    Nossa Seleção
                                </div>
                                <h2 className="text-3xl md:text-5xl font-heading font-bold text-surface-900 dark:text-white tracking-tight">
                                    Os favoritos da <br className="hidden md:block" /> comunidade
                                </h2>
                            </div>
                            <Link
                                to="/loja/produtos"
                                className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-800 dark:text-surface-200 font-medium rounded-xl transition-all duration-300 border border-surface-200 dark:border-surface-800 shadow-sm"
                            >
                                Ver todos os produtos
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {featured.map((product, idx) => (
                                <Link
                                    key={product.id}
                                    to={`/loja/produtos`}
                                    className={cn(
                                        "group bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-slide-up flex flex-col",
                                        product.stock_quantity <= 0 && "opacity-80"
                                    )}
                                    style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                                >
                                    <div className={cn(
                                        "aspect-[4/5] bg-surface-100 dark:bg-surface-800 relative overflow-hidden p-6",
                                        product.stock_quantity <= 0 && "grayscale-[0.5]"
                                    )}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface-100/50 to-transparent dark:from-surface-900/50 mix-blend-multiply z-10" />
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-contain mix-blend-darken dark:mix-blend-normal group-hover:scale-110 transition-transform duration-700 ease-out z-0 relative"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Leaf className="w-16 h-16 text-surface-300 dark:text-surface-600" />
                                            </div>
                                        )}

                                        {product.stock_quantity <= 0 && (
                                            <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-danger-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                                                Esgotado
                                            </div>
                                        )}
                                        {product.stock_quantity > 0 && idx === 0 && (
                                            <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-accent-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                                                Mais Vendido
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-1 bg-white dark:bg-surface-900 z-20">
                                        <h3 className="font-heading font-bold text-lg text-surface-900 dark:text-surface-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {product.name}
                                        </h3>
                                        {product.description && (
                                            <p className="text-sm text-surface-500 dark:text-surface-400 mb-4 line-clamp-2 font-light">
                                                {product.description}
                                            </p>
                                        )}
                                        <div className="mt-auto flex items-center justify-between">
                                            <p className="text-xl font-bold tracking-tight text-surface-900 dark:text-white">
                                                {formatCurrency(product.price)}
                                            </p>
                                            <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300 text-surface-900 dark:text-white">
                                                <ShoppingCart className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center mt-12 md:hidden">
                            <Link
                                to="/loja/produtos"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-800 dark:text-surface-200 font-medium rounded-xl transition-all duration-300 border border-surface-200 dark:border-surface-800 shadow-sm w-full justify-center"
                            >
                                Ver todos os produtos
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA Section ─────────────────────── */}
            <section className="py-24 bg-primary-900 overflow-hidden relative">
                {/* Decorative background vectors */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-800 rounded-full blur-[80px] opacity-50 translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-800 rounded-full blur-[80px] opacity-30 -translate-x-1/2 translate-y-1/2" />

                <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
                    <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 tracking-tight">
                        Pronto para transformar sua rotina?
                    </h2>
                    <p className="text-primary-100 mb-10 text-lg md:text-xl font-light max-w-2xl mx-auto">
                        Faça seu pedido agora e comece a sentir os benefícios no 
                        conforto da sua casa, com entrega garantida e rápida.
                    </p>
                    <Link
                        to="/loja/produtos"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary-900 font-bold rounded-2xl hover:bg-surface-50 transition-all duration-300 shadow-[0_8px_30px_rgb(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgb(255,255,255,0.2)] hover:-translate-y-1 text-lg"
                    >
                        Comprar Agora
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </section>
        </div>
    )
}
