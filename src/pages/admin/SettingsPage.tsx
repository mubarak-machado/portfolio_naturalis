import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, Save, Loader2, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const settingsSchema = z.object({
    whatsapp: z.string().min(10, 'O número deve ter no mínimo 10 dígitos com DDD.').optional().nullable(),
})

type SettingsValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
    const queryClient = useQueryClient()

    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('store_settings')
                .select('*')
                .eq('id', 1)
                .single()

            if (error && error.code !== 'PGRST116') {
                throw error
            }
            return data || { whatsapp: '' }
        }
    })

    const form = useForm<SettingsValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(settingsSchema) as any,
        defaultValues: {
            whatsapp: '',
        }
    })

    useEffect(() => {
        if (settings) {
            form.reset({ whatsapp: settings.whatsapp || '' })
        }
    }, [settings, form])

    const saveMutation = useMutation({
        mutationFn: async (values: SettingsValues) => {
            const { error } = await supabase
                .from('store_settings')
                .upsert({ id: 1, whatsapp: values.whatsapp, updated_at: new Date().toISOString() })
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] })
            toast.success('Configurações salvas com sucesso!')
        },
        onError: (error: Error) => {
            toast.error(`Erro ao salvar configurações: ${error.message}`)
            console.error(error)
        }
    })

    const onSubmit = (data: SettingsValues) => {
        saveMutation.mutate(data)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 mt-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                        <Settings className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white mb-1 tracking-tight">Configurações da Loja</h1>
                        <p className="text-sm md:text-base text-surface-500 dark:text-surface-400 font-light">Gerencie informações públicas da sua loja</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 shadow-sm p-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <Label htmlFor="store-whatsapp" className="mb-2 block font-medium">WhatsApp de Contato</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-surface-400" />
                            </div>
                            <Input
                                id="store-whatsapp"
                                type="text"
                                placeholder="5511999999999"
                                className="pl-12 h-14 rounded-2xl text-base shadow-sm"
                                {...form.register('whatsapp')}
                            />
                        </div>
                        {form.formState.errors.whatsapp && (
                            <p className="text-danger-500 text-xs mt-1.5">{form.formState.errors.whatsapp.message}</p>
                        )}
                        <p className="text-surface-500 text-xs mt-2">
                            Insira o número completo, incluindo código do país (opcional) e DDD, apenas números. Ex: 5511999999999
                        </p>
                    </div>

                    <div className="pt-6 border-t border-surface-200/50 dark:border-surface-800/50 flex justify-end">
                        <Button
                            type="submit"
                            disabled={saveMutation.isPending || !form.formState.isDirty}
                            className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 h-12 shadow-lg shadow-primary-500/20"
                        >
                            {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 rounded-[1.5rem] max-w-2xl">
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-2 font-heading tracking-wide uppercase">Atenção Técnica Requerida</h3>
                <p className="text-sm text-amber-700/80 dark:text-amber-300 font-medium">
                    Para que esta página funcione, é necessário criar a tabela `store_settings` no painel do Supabase no SQL Editor. Verifique se o código SQL já foi rodado.
                </p>
            </div>
        </div>
    )
}
