import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Package, Leaf, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { useAppModal } from '@/contexts/ModalContext'
import type { Product } from '@/types/database'

export default function StoreCatalogPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [addedId, setAddedId] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const { addItem } = useCart()
    const { showAlert } = useAppModal()

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data } = await supabase
                .from('products')
                .select('*')
                .order('name', { ascending: true })
            if (data) setProducts(data as Product[])
            setLoading(false)
        }
        load()
    }, [])

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    )

    function handleAdd(product: Product) {
        if (isAdding) return
        setIsAdding(true)

        const result = addItem(product)
        if (!result.success) {
            showAlert({
                title: 'Estoque Insuficiente',
                message: result.message || 'Sem estoque.',
                type: 'warning'
            })
            setIsAdding(false)
            return
        }
        setAddedId(product.id)
        setTimeout(() => {
            setAddedId(null)
            setIsAdding(false)
        }, 1200)
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
                <h1 className="text-3xl md:text-5xl font-heading font-bold text-surface-900 dark:text-white mb-4 tracking-tight">
                    Nossa Coleção
                </h1>
                <p className="text-lg text-surface-500 dark:text-surface-400 font-light max-w-2xl mx-auto">
                    Suplementos puros e naturais, selecionados para elevar sua saúde e bem-estar diário.
                </p>
            </div>

            {/* Search */}
            <div className="max-w-xl mx-auto mb-16 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-surface-400 dark:text-surface-500 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar suplementos, vitaminas..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-900 dark:text-white text-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder-surface-400 dark:placeholder-surface-500 shadow-sm"
                    />
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <Package className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                    <p className="text-surface-500 dark:text-surface-400">
                        {search ? 'Nenhum produto encontrado.' : 'Nenhum produto disponível.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {filtered.map((product, idx) => (
                        <div
                            key={product.id}
                            className={cn(
                                "group bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-slide-up flex flex-col",
                                product.stock_quantity <= 0 && "opacity-80"
                            )}
                            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                        >
                            {/* Image */}
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

                                {/* Stock badge */}
                                {product.stock_quantity <= 0 && (
                                    <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-danger-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                                        Esgotado
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-6 flex flex-col flex-1 bg-white dark:bg-surface-900 z-20">
                                <h3 className="font-heading font-bold text-lg text-surface-900 dark:text-surface-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {product.name}
                                </h3>
                                {product.description && (
                                    <p className="text-sm text-surface-500 dark:text-surface-400 mb-4 line-clamp-2 font-light flex-1">
                                        {product.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-surface-100 dark:border-surface-800">
                                    <p className="text-xl font-bold tracking-tight text-surface-900 dark:text-white">
                                        {formatCurrency(product.price)}
                                    </p>

                                    <button
                                        onClick={() => handleAdd(product)}
                                        disabled={product.stock_quantity <= 0}
                                        className={cn(
                                            'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                                            product.stock_quantity <= 0
                                                ? 'bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 cursor-not-allowed'
                                                : addedId === product.id
                                                    ? 'bg-success-500 text-white scale-105 shadow-[0_4px_15px_rgb(22,163,74,0.3)]'
                                                    : 'bg-primary-500 hover:bg-primary-600 text-white shadow-[0_4px_15px_rgb(43,157,88,0.3)] hover:shadow-[0_6px_20px_rgb(43,157,88,0.4)] hover:-translate-y-0.5'
                                        )}
                                    >
                                        {addedId === product.id ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Adicionado
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-4 h-4" />
                                                Add
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
