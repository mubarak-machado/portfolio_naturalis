import { useState } from 'react'
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    Upload,
    AlertTriangle,
    Loader2,
    Scale,
    Box,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency } from '@/lib/utils'
import type { Product, SellingType } from '@/types/database'
import { useAppModal } from '@/contexts/ModalContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const productSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional(),
    selling_type: z.enum(['unit', 'weight']),
    price: z.coerce.number().min(0, 'Preço inválido'),
    cost_price: z.coerce.number().nullable().optional(),
    stock_quantity: z.coerce.number().min(0, 'Estoque não pode ser negativo'),
    stock_minimal: z.coerce.number().nullable().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function ProductsPage() {
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const { showAlert, showConfirm } = useAppModal()
    const queryClient = useQueryClient()

    // ── TanStack Query: Fetch Products ─────────────────────
    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name', { ascending: true })
            if (error) throw error
            return data as Product[]
        }
    })

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    // ── React Hook Form ────────────────────────────────────
    const form = useForm<ProductFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: '',
            description: '',
            selling_type: 'unit',
            price: 0,
            cost_price: null,
            stock_quantity: 0,
            stock_minimal: null,
        }
    })

    // ── TanStack Query: Mutations ──────────────────────────
    const saveMutation = useMutation({
        mutationFn: async (values: ProductFormValues) => {
            let image_url = editingId
                ? products.find((p) => p.id === editingId)?.image_url || null
                : null

            // Upload de imagem 
            if (imageFile) {
                const ext = imageFile.name.split('.').pop()
                // eslint-disable-next-line react-hooks/purity
                const fileName = `${Date.now()}.${ext}`
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, imageFile)

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(fileName)
                    image_url = urlData.publicUrl
                }
            }

            const payload = {
                ...values,
                cost_price: values.cost_price || null,
                stock_minimal: values.stock_minimal || null,
                image_url,
            }

            if (editingId) {
                const { error } = await supabase.from('products').update(payload).eq('id', editingId)
                if (error) throw error
            } else {
                const { error } = await supabase.from('products').insert(payload)
                if (error) throw error
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success(editingId ? 'Produto atualizado!' : 'Produto criado com sucesso!')
            closeModal()
        },
        onError: (error: Error) => {
            toast.error(`Erro ao salvar: ${error.message}`)
        }
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('products').delete().eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success('Produto excluído!')
        },
        onError: async (error: { code?: string; message: string }) => {
            if (error.code === '23503') {
                await showAlert({
                    title: 'Ação Bloqueada',
                    message: `Não é possível excluir este produto pois ele já faz parte de vendas registradas.`,
                    type: 'error'
                })
            } else {
                toast.error(`Erro ao excluir: ${error.message}`)
            }
        }
    })

    // ── Handlers ───────────────────────────────────────────
    const openCreate = () => {
        setEditingId(null)
        setImageFile(null)
        setImagePreview(null)
        form.reset({
            name: '',
            description: '',
            selling_type: 'unit',
            price: 0,
            cost_price: null,
            stock_quantity: 0,
            stock_minimal: null,
        })
        setShowModal(true)
    }

    const openEdit = (product: Product) => {
        setEditingId(product.id)
        setImageFile(null)
        setImagePreview(product.image_url)
        form.reset({
            name: product.name,
            description: product.description || '',
            selling_type: product.selling_type,
            price: product.price,
            cost_price: product.cost_price || null,
            stock_quantity: product.stock_quantity,
            stock_minimal: product.stock_minimal || null,
        })
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingId(null)
    }

    async function handleDelete(id: string, name: string) {
        const confirmed = await showConfirm({
            title: 'Excluir Produto',
            message: `Tem certeza que deseja excluir "${name}"?`,
            type: 'error',
            confirmText: 'Excluir'
        })
        if (!confirmed) return
        deleteMutation.mutate(id)
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    function isLowStock(product: Product): boolean {
        if (product.stock_minimal === null) return false
        return product.stock_quantity <= product.stock_minimal
    }

    const onSubmit = (data: ProductFormValues) => {
        saveMutation.mutate(data)
    }

    const currentSellingType = useWatch({
        control: form.control,
        name: 'selling_type',
    })

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 mt-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                        <Package className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white mb-1 tracking-tight">Produtos</h1>
                        <p className="text-sm md:text-base text-surface-500 dark:text-surface-400 font-light">
                            {products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''} no catálogo
                        </p>
                    </div>
                </div>
                <Button onClick={openCreate} className="gap-2 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 w-full sm:w-auto mt-4 sm:mt-0">
                    <Plus className="w-5 h-5" />
                    Novo Produto
                </Button>
            </div>

            {/* Busca */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                    type="text"
                    placeholder="Buscar produtos por nome..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={cn(
                        'w-full pl-12 pr-4 py-3.5 rounded-2xl text-base font-medium',
                        'bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                        'shadow-sm hover:shadow-md transition-all duration-200'
                    )}
                />
            </div>

            {/* Lista de produtos */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-12 shadow-card text-center">
                    <Package className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                    <p className="text-surface-500 dark:text-surface-400 mb-1">
                        {search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
                    </p>
                    {!search && (
                        <p className="text-sm text-surface-400">
                            Clique em "Novo Produto" para começar.
                        </p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((product) => (
                        <div
                            key={product.id}
                            className={cn(
                                'bg-white dark:bg-surface-900 rounded-[1.5rem] border border-surface-200/50 dark:border-surface-800/50 overflow-hidden flex flex-col',
                                'shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
                                'group animate-scale-in'
                            )}
                        >
                            {/* Imagem */}
                            <div className={cn(
                                "aspect-[4/3] bg-surface-50 dark:bg-surface-800/50 relative overflow-hidden",
                                product.stock_quantity <= 0 && "grayscale-[0.5] opacity-80"
                            )}>
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-12 h-12 text-surface-300 dark:text-surface-600" />
                                    </div>
                                )}
                                {/* Badge de tipo */}
                                <div className="absolute top-3 left-3">
                                    <span className={cn(
                                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider',
                                        'bg-white/90 dark:bg-surface-900/90 backdrop-blur-md shadow-sm border border-black/5 dark:border-white/5',
                                        product.selling_type === 'weight' ? 'text-accent-600 dark:text-accent-400' : 'text-primary-600 dark:text-primary-400'
                                    )}>
                                        {product.selling_type === 'weight' ? (
                                            <><Scale className="w-3 h-3" /> Peso</>
                                        ) : (
                                            <><Box className="w-3 h-3" /> Unidade</>
                                        )}
                                    </span>
                                </div>
                                {/* Badge de estoque */}
                                {product.stock_quantity <= 0 ? (
                                    <div className="absolute top-3 right-3">
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold bg-danger-500 text-white shadow-sm uppercase tracking-wide">
                                            Esgotado
                                        </span>
                                    </div>
                                ) : isLowStock(product) && (
                                    <div className="absolute top-3 right-3">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-warning-500 text-white shadow-sm uppercase tracking-wide">
                                            <AlertTriangle className="w-3 h-3" /> Baixo
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-lg font-heading font-bold text-surface-900 dark:text-white mb-2 line-clamp-2 leading-tight">{product.name}</h3>
                                {product.description && (
                                    <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-4 line-clamp-2">{product.description}</p>
                                )}
                                <div className="mt-auto pt-4 border-t border-surface-100 dark:border-surface-800/50 flex flex-col gap-4">
                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-surface-500 dark:text-surface-400 uppercase tracking-widest font-semibold mb-0.5">Preço</span>
                                            <span className="text-xl font-heading font-black text-primary-600 dark:text-primary-400 leading-none">
                                                {formatCurrency(product.price)}
                                                {product.selling_type === 'weight' && <span className="text-xs font-medium text-surface-400 ml-1">/kg</span>}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] text-surface-500 dark:text-surface-400 uppercase tracking-widest font-semibold mb-0.5">Estoque</span>
                                            <span className={cn(
                                                'text-sm font-bold',
                                                isLowStock(product) ? 'text-danger-500' : 'text-surface-700 dark:text-surface-300'
                                            )}>
                                                {product.stock_quantity} <span className="text-xs font-medium">{product.selling_type === 'weight' ? 'kg' : 'un'}</span>
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => openEdit(product)}
                                            className="flex-1 rounded-xl bg-surface-100/50 hover:bg-surface-200/50 dark:bg-surface-800/50 dark:hover:bg-surface-700/50 text-surface-700 dark:text-surface-200"
                                        >
                                            <Edit2 className="w-4 h-4 mr-1.5" /> Editar
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleDelete(product.id, product.name)}
                                            className="rounded-xl w-10 h-10 shrink-0 bg-danger-50 text-danger-600 hover:bg-danger-100 dark:bg-danger-900/20 dark:text-danger-400 dark:hover:bg-danger-900/40 shadow-none border-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Modal de Criar/Editar (Shadcn Dialog + React Hook Form) ──────────────────────── */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Editar Produto' : 'Novo Produto'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Foto */}
                        <div>
                            <Label className="mb-1.5 block">Foto do Produto</Label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-xl bg-surface-100 dark:bg-surface-800 border-2 border-dashed border-surface-300 flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-6 h-6 text-surface-400" />
                                    )}
                                </div>
                                <label className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer',
                                    'bg-surface-100 dark:bg-surface-800 text-surface-600 hover:bg-surface-200 transition-colors'
                                )}>
                                    <Upload className="w-4 h-4" /> Escolher foto
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Nome */}
                        <div>
                            <Label htmlFor="prod-name" className="mb-1.5 block">Nome *</Label>
                            <Input
                                id="prod-name"
                                type="text"
                                placeholder="Ex: Whey Protein Isolado 900g"
                                {...form.register('name')}
                            />
                            {form.formState.errors.name && (
                                <p className="text-danger-500 text-xs mt-1">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        {/* Descrição */}
                        <div>
                            <Label htmlFor="prod-desc" className="mb-1.5 block">Descrição</Label>
                            <textarea
                                id="prod-desc"
                                rows={2}
                                placeholder="Descreva os benefícios e ingredientes..."
                                {...form.register('description')}
                                className="flex w-full rounded-md border border-surface-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 dark:border-surface-800 dark:placeholder:text-surface-400 dark:focus-visible:ring-primary-500 resize-none"
                            />
                        </div>

                        {/* Tipo de venda */}
                        <div>
                            <Label className="mb-1.5 block">Tipo de Venda *</Label>
                            <div className="flex gap-3">
                                {[
                                    { value: 'unit', label: 'Unidade', icon: Box },
                                    { value: 'weight', label: 'A granel (peso)', icon: Scale },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => form.setValue('selling_type', opt.value as SellingType)}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border transition-all',
                                            currentSellingType === opt.value
                                                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                                                : 'border-surface-200 bg-transparent text-surface-500 hover:border-surface-300 dark:border-surface-800'
                                        )}
                                    >
                                        <opt.icon className="w-4 h-4" /> {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preço e Custo */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="prod-price" className="mb-1.5 block">Preço Venda (R$) *</Label>
                                <Input
                                    id="prod-price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...form.register('price')}
                                />
                                {form.formState.errors.price && (
                                    <p className="text-danger-500 text-xs mt-1">{form.formState.errors.price.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="prod-cost" className="mb-1.5 block">Preço Custo (R$)</Label>
                                <Input
                                    id="prod-cost"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...form.register('cost_price')}
                                />
                            </div>
                        </div>

                        {/* Estoque e Mínimo */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="prod-stock" className="mb-1.5 block">Estoque Atual *</Label>
                                <Input
                                    id="prod-stock"
                                    type="number"
                                    step={currentSellingType === 'weight' ? '0.001' : '1'}
                                    min="0"
                                    {...form.register('stock_quantity')}
                                />
                                {form.formState.errors.stock_quantity && (
                                    <p className="text-danger-500 text-xs mt-1">{form.formState.errors.stock_quantity.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="prod-min" className="mb-1.5 block">Estoque Mínimo</Label>
                                <Input
                                    id="prod-min"
                                    type="number"
                                    step={currentSellingType === 'weight' ? '0.001' : '1'}
                                    min="0"
                                    {...form.register('stock_minimal')}
                                />
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={closeModal}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={saveMutation.isPending}
                                className="flex-1 gap-2 shadow-lg shadow-primary-500/25"
                            >
                                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingId ? 'Salvar Alterações' : 'Criar Produto'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
