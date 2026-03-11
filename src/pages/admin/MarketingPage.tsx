/**
 * MarketingPage — Gerador de Posts para WhatsApp (Fase 2.6 Canvas)
 * ========================================================
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import {
    Megaphone,
    Loader2,
    Sparkles,
    Download,
    ChevronLeft,
    Image as ImageIcon,
    AlertCircle,
    RefreshCw,
    LayoutTemplate,
    Settings2,
    X,
    Undo2,
    Redo2,
    Type,
    Square,
    Circle
} from 'lucide-react'
import Konva from 'konva'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { 
    generateMarketingTexts, 
    refineMarketingPurpose, 
    isGeminiConfigured, 
    type MarketingTextResult,
    type RefinedPromptResult
} from '@/lib/gemini'
import type { Product } from '@/types/database'

import CanvasEditor from '@/components/marketing/canvas/CanvasEditor'
import PropertiesPanel from '@/components/marketing/canvas/PropertiesPanel'
import { useLayerManager } from '@/components/marketing/canvas/useLayerManager'
import { getTemplates } from '@/components/marketing/canvas/templates'
import type { CanvasTemplate } from '@/components/marketing/canvas/types'
import { FRAME_PRESETS, type FrameFormat } from '@/components/marketing/types'

type Step = 1 | 2 | 3 | 4

const purposeSuggestions = [
    'Lançamento de produto',
    'Promoção especial',
    'Queima de estoque',
    'Produto mais vendido',
    'Novidade da semana',
    'Saúde e bem-estar',
]

export default function MarketingPage() {
    const [step, setStep] = useState<Step>(1)
    const [products, setProducts] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [purpose, setPurpose] = useState('')
    const [generatedTexts, setGeneratedTexts] = useState<MarketingTextResult[]>([])
    const [selectedTextIndex, setSelectedTextIndex] = useState<number>(0)
    const [generating, setGenerating] = useState(false)
    const [genError, setGenError] = useState<string | null>(null)
    const [refinedResult, setRefinedResult] = useState<RefinedPromptResult | null>(null)
    const [downloading, setDownloading] = useState<boolean>(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Canvas State
    const manager = useLayerManager([])
    const [templates, setTemplates] = useState<CanvasTemplate[]>([])
    const [activeTemplateIndex, setActiveTemplateIndex] = useState(0)
    const exportCanvasRef = useRef<Konva.Stage>(null)
    const previewContainerRef = useRef<HTMLDivElement>(null)
    const [dynamicZoom, setDynamicZoom] = useState(0.35)

    // Canvas dimensions state
    const [frameFormat, setFrameFormat] = useState<FrameFormat>('feed_portrait')
    const canvasWidth = FRAME_PRESETS[frameFormat].width
    const canvasHeight = FRAME_PRESETS[frameFormat].height

    // Load products
    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from('products')
                .select('*')
                .order('name')
            if (data) setProducts(data as Product[])
            setLoadingProducts(false)
        }
        load()
    }, [])

    // Responsive Canvas Zoom Calculation
    useEffect(() => {
        const calculateZoom = () => {
            if (previewContainerRef.current) {
                const containerHeight = previewContainerRef.current.clientHeight
                const containerWidth = previewContainerRef.current.clientWidth

                // We want to fit canvas into the container with some padding (40px)
                const zoomByHeight = (containerHeight - 40) / canvasHeight
                const zoomByWidth = (containerWidth - 40) / canvasWidth

                // Pick the smaller zoom so it fully fits
                const bestZoom = Math.min(zoomByHeight, zoomByWidth)
                setDynamicZoom(Math.max(0.1, bestZoom)) // Never go below 0.1 scale
            }
        }

        calculateZoom()
        window.addEventListener('resize', calculateZoom)
        return () => window.removeEventListener('resize', calculateZoom)
    }, [step, canvasWidth, canvasHeight])

    // Generate Texts
    const handleGenerateTexts = useCallback(async () => {
        if (!selectedProduct || !purpose.trim()) return
        setGenerating(true)
        setGenError(null)

        try {
            // STEP 1: Refine Purpose into a Strategy & Super Prompt
            const refined = await refineMarketingPurpose(
                selectedProduct.name,
                selectedProduct.description,
                purpose.trim()
            )
            setRefinedResult(refined)

            // STEP 2: Generate copies using the Super Prompt
            const texts = await generateMarketingTexts(
                selectedProduct.name,
                selectedProduct.description,
                selectedProduct.price,
                purpose.trim(),
                refined.refinedPrompt
            )
            setGeneratedTexts(texts)
            setSelectedTextIndex(0)
            setStep(4)
        } catch (err) {
            setGenError(err instanceof Error ? err.message : 'Erro ao gerar textos. Tente novamente.')
        } finally {
            setGenerating(false)
        }
    }, [selectedProduct, purpose])

    // Initialize Templates when texts/product are ready
    useEffect(() => {
        if (step === 4 && selectedProduct && generatedTexts.length > 0) {
            const text = generatedTexts[selectedTextIndex]
            const newTemplates = getTemplates({
                productName: selectedProduct.name,
                productPrice: selectedProduct.price,
                imageUrl: selectedProduct.image_url,
                headline: text.headline,
                body: text.body,
                cta: text.cta,
            }, frameFormat)
            setTemplates(newTemplates)

            // Auto-select first template when first entering step 4
            // but keep the current active index if we're just changing text variation
            const useIndex = activeTemplateIndex < newTemplates.length ? activeTemplateIndex : 0

            setActiveTemplateIndex(useIndex)
            manager.setLayers(newTemplates[useIndex].layers)
            manager.setSelectedLayerId(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, selectedProduct, generatedTexts, selectedTextIndex, frameFormat])

    const handleTemplateChange = (index: number) => {
        setActiveTemplateIndex(index)
        manager.setLayers(templates[index].layers)
        manager.setSelectedLayerId(null)
    }

    // Responsive Canvas Zoom
    useEffect(() => {
        const container = previewContainerRef.current
        if (!container) return

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { clientWidth, clientHeight } = entry.target as HTMLDivElement
                if (clientWidth === 0 || clientHeight === 0) continue

                // 32px padding on all sides (total 64)
                const paddingX = 64
                // Top/bottom padding a bit larger or same
                const paddingY = 64

                const scaleX = (clientWidth - paddingX) / canvasWidth
                const scaleY = (clientHeight - paddingY) / canvasHeight

                // Limit max scale to 1 so the pixelation doesn't happen,
                // but shrink as needed to fit the screen smoothly
                setDynamicZoom(Math.max(0.1, Math.min(scaleX, scaleY, 1)))
            }
        })

        // Give the container time to adopt its flex layout via the observer
        observer.observe(container)

        return () => observer.disconnect()
    }, [step, canvasWidth, canvasHeight])

    const handleAddText = () => {
        manager.addLayer({
            id: `text-${crypto.randomUUID()}`,
            type: 'text',
            name: 'Texto',
            content: 'Novo Texto',
            x: canvasWidth / 2 - 150,
            y: canvasHeight / 2 - 25,
            width: 300,
            height: 50,
            fontSize: 48,
            color: '#1c1917',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            rotation: 0,
            scale: 1,
            zIndex: 0
        })
    }

    const handleAddRect = () => {
        manager.addLayer({
            id: `shape-${crypto.randomUUID()}`,
            type: 'shape',
            name: 'Retângulo',
            backgroundColor: '#0ea5e9',
            x: canvasWidth / 2 - 150,
            y: canvasHeight / 2 - 150,
            width: 300,
            height: 300,
            rotation: 0,
            scale: 1,
            zIndex: 0
        })
    }

    const handleAddCircle = () => {
        manager.addLayer({
            id: `shape-${crypto.randomUUID()}`,
            type: 'shape',
            name: 'Círculo',
            backgroundColor: '#10b981',
            x: canvasWidth / 2 - 150,
            y: canvasHeight / 2 - 150,
            width: 300,
            height: 300,
            borderRadius: 500,
            rotation: 0,
            scale: 1,
            zIndex: 0
        })
    }

    // Using the main canvas ref directly via Konva API
    const handleDownload = async () => {
        if (!exportCanvasRef.current || !selectedProduct) return

        setDownloading(true)
        // Give Konva a tiny tick if needed
        await new Promise(r => setTimeout(r, 50))

        try {
            // Deselect all layers temporarily so handles don't show up in export
            const previousSelection = manager.selectedLayerId
            if (previousSelection) {
                manager.setSelectedLayerId(null)
                // Wait for react flush
                await new Promise(r => setTimeout(r, 50))
            }

            const dataUrl = exportCanvasRef.current.toDataURL({
                pixelRatio: 1 / dynamicZoom // Since stage is scaled down, we inverse the scale for 1080x1920 output
            })

            const link = document.createElement('a')
            const tName = templates[activeTemplateIndex]?.name || 'post'
            link.download = `${selectedProduct.name.replace(/\s+/g, '_')}_${tName.replace(/\s+/g, '_')}.png`
            link.href = dataUrl
            link.click()

            // Restore selection
            if (previousSelection) {
                manager.setSelectedLayerId(previousSelection)
            }
        } catch (err) {
            console.error('Erro ao exportar imagem:', err)
        } finally {
            setDownloading(false)
        }
    }

    const geminiOk = isGeminiConfigured()

    const stepLabels = ['Produto', 'Propósito', 'Textos IA', 'Canvas']

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 mt-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                        <Megaphone className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white mb-1 tracking-tight">Marketing Studio</h1>
                        <p className="text-sm md:text-base text-surface-500 dark:text-surface-400 font-light">Edição livre de templates gerados por IA</p>
                    </div>
                </div>
            </div>

            {/* Gemini not configured warning */}
            {!geminiOk && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-start gap-3 flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">API Key não configurada</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                            Adicione <code className="bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded text-xs font-mono">VITE_GEMINI_API_KEY=sua_chave</code> ao arquivo <code className="bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> e reinicie o servidor.
                        </p>
                    </div>
                </div>
            )}

            {/* Step Indicator */}
            <div className="flex items-center gap-1.5 md:gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 flex-shrink-0">
                {stepLabels.map((label, i) => {
                    const stepNum = (i + 1) as Step
                    const isActive = step === stepNum
                    const isDone = step > stepNum
                    return (
                        <div key={label} className="flex items-center gap-2">
                            {i > 0 && (
                                <div className={cn('w-4 md:w-8 h-0.5 rounded flex-shrink-0', isDone || isActive ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700')} />
                            )}
                            <button
                                onClick={() => {
                                    if (isDone) setStep(stepNum)
                                }}
                                disabled={!isDone}
                                className={cn(
                                    'flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
                                    isActive && 'bg-primary-500 text-white shadow-md shadow-primary-500/25',
                                    isDone && 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 cursor-pointer',
                                    !isActive && !isDone && 'bg-surface-100 dark:bg-surface-800 text-surface-400 cursor-default'
                                )}
                            >
                                <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold">
                                    {stepNum}
                                </span>
                                {label}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* ═══════ Etapa 1: Selecionar Produto ═══════ */}
            {step === 1 && (
                <div className="bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-heading font-bold text-surface-900 dark:text-surface-100 mb-6">1. Selecione o Produto Base</h2>

                    {loadingProducts ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
                    ) : products.length === 0 ? (
                        <p className="text-surface-500 dark:text-surface-400 text-center py-8">Nenhum produto cadastrado. Cadastre um produto primeiro no catálogo.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                            {products.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => { setSelectedProduct(product); setStep(2) }}
                                    className={cn(
                                        'flex flex-col items-center p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 text-left group',
                                        selectedProduct?.id === product.id
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 shadow-lg'
                                            : 'border-surface-200/50 dark:border-surface-800/50 hover:border-primary-300 dark:hover:border-primary-500/50 bg-white dark:bg-surface-800 hover:shadow-xl hover:-translate-y-1'
                                    )}
                                >
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            loading="lazy"
                                            alt={product.name}
                                            className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-xl mb-3 md:mb-4 bg-surface-50 dark:bg-surface-700 group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 md:w-24 md:h-24 bg-surface-100 dark:bg-surface-700 rounded-xl mb-3 md:mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <ImageIcon className="w-8 h-8 text-surface-300" />
                                        </div>
                                    )}
                                    <span className="text-sm font-semibold text-surface-900 dark:text-surface-100 text-center">{product.name}</span>
                                    <span className="text-sm text-primary-600 dark:text-primary-400 font-bold mt-1">
                                        R$ {product.price.toFixed(2).replace('.', ',')}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════ Etapa 2: Propósito ═══════ */}
            {step === 2 && selectedProduct && (
                <div className="bg-white dark:bg-surface-900 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 shadow-sm p-8 mb-8 max-w-3xl">
                    <h2 className="text-xl font-heading font-bold text-surface-900 dark:text-surface-100 mb-2">2. Qual o propósito da postagem?</h2>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
                        A IA vai analisar <span className="font-semibold text-primary-600 dark:text-primary-400">{selectedProduct.name}</span> e criar Copies adequadas.
                    </p>

                    {/* Quick suggestions */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {purposeSuggestions.map(s => (
                            <button
                                key={s}
                                onClick={() => setPurpose(s)}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-sm transition-all',
                                    purpose === s
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Descreva o propósito (ex: 'Promoção do Dia das Mães com 20% off')..."
                        rows={3}
                        className="w-full px-5 py-4 rounded-2xl text-base bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50 text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none resize-none transition-all shadow-inner"
                    />

                    <div className="flex justify-between mt-8">
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Voltar
                        </button>
                        <button
                            onClick={handleGenerateTexts}
                            disabled={!purpose.trim() || generating || !geminiOk}
                            className={cn(
                                'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white',
                                'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20',
                                'hover:shadow-xl hover:-translate-y-0.5',
                                'active:translate-y-0 transition-all duration-200',
                                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
                            )}
                        >
                            {generating ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> {refinedResult ? 'Criando Cópias...' : 'Arquitetando Estratégia...'}</>
                            ) : (
                                <><Sparkles className="w-5 h-5" /> Iniciar IA</>
                            )}
                        </button>
                    </div>

                    {generating && refinedResult && (
                        <div className="mt-4 p-4 bg-primary-100/50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/50 rounded-xl animate-pulse">
                            <h4 className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Estratégia Escolhida pela IA:</h4>
                            <p className="text-sm italic text-surface-600 dark:text-surface-400">"{refinedResult.strategy}"</p>
                        </div>
                    )}

                    {genError && (
                        <div className="mt-4 p-3 bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 rounded-lg text-sm text-danger-700 dark:text-danger-400">
                            {genError}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════ Etapa 4: Interactive Canvas Preview + Download ═══════ */}
            {step === 4 && selectedProduct && generatedTexts.length > 0 && templates.length > 0 && (
                <div className="flex-1 flex gap-6 min-h-0 pb-6 shrink-0 relative overflow-hidden">

                    {/* Main Area: Interactive Canvas (Left on Desktop, Full on Mobile) */}
                    <div className="flex-1 bg-white dark:bg-surface-900/50 rounded-[2rem] border border-surface-200/50 dark:border-surface-800/50 p-6 flex flex-col items-center overflow-hidden relative shadow-inner h-[800px] xl:h-auto">

                        <button
                            className="lg:hidden absolute bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg transition-transform active:scale-95"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Settings2 className="w-6 h-6" />
                        </button>

                        {/* Control Bar Top */}
                        <div className="w-full flex justify-between items-center mb-6 z-10 px-2">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-heading font-bold text-surface-900 dark:text-surface-100 hidden sm:block">Canvas Master</h2>

                                <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg">
                                    <button
                                        onClick={manager.undo}
                                        disabled={!manager.canUndo}
                                        className="p-1.5 rounded-md text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                        title="Desfazer"
                                    >
                                        <Undo2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={manager.redo}
                                        disabled={!manager.canRedo}
                                        className="p-1.5 rounded-md text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                        title="Refazer"
                                    >
                                        <Redo2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className={cn(
                                    'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all',
                                    'bg-primary-500 hover:bg-primary-600 active:scale-95 shadow-lg shadow-primary-500/25',
                                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex-1 sm:flex-none justify-center'
                                )}
                            >
                                {downloading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processando Final...</>
                                ) : (
                                    <><Download className="w-4 h-4" /> Baixar Imagem</>
                                )}
                            </button>
                        </div>

                        {/* Interactive Viewer (uses Zoom to fit container without breaking coordinates) */}
                        <div
                            ref={previewContainerRef}
                            className="w-full flex-1 relative flex items-center justify-center bg-surface-50 dark:bg-surface-950/50 rounded-lg overflow-hidden border border-surface-200 dark:border-surface-800"
                        >
                            <div
                                style={{
                                    width: Math.floor(canvasWidth * dynamicZoom),
                                    height: Math.floor(canvasHeight * dynamicZoom),
                                    transition: 'all 0.1s ease-out',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <CanvasEditor
                                    template={templates[activeTemplateIndex]}
                                    manager={manager}
                                    zoom={dynamicZoom}
                                    canvasRef={exportCanvasRef}
                                    canvasWidth={canvasWidth}
                                    canvasHeight={canvasHeight}
                                />
                            </div>
                        </div>

                    </div>

                    <div className={cn(
                        "fixed inset-y-0 right-0 z-50 w-[300px] sm:w-[360px] bg-surface-50 dark:bg-surface-950 p-4 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col gap-4 overflow-y-auto",
                        "lg:relative lg:translate-x-0 lg:shadow-none lg:bg-transparent lg:dark:bg-transparent lg:p-0 lg:w-[360px] lg:z-0 lg:flex-shrink-0",
                        isSidebarOpen ? "translate-x-0" : "translate-x-full"
                    )}>

                        {/* Mobile Sidebar Header with Close Button */}
                        <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-800 lg:hidden">
                            <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-primary-500" />
                                Preferências
                            </h2>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 text-surface-500 hover:text-surface-900 dark:hover:text-white bg-surface-200 dark:bg-surface-800 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add Elements Block */}
                        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 shadow-card p-4">
                            <h2 className="text-[11px] font-bold text-surface-500 dark:text-surface-400 mb-3 uppercase tracking-wider block">Adicionar Elementos</h2>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={handleAddText}
                                    className="flex flex-col items-center justify-center gap-2 py-3 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg border border-surface-200 dark:border-surface-700 transition-colors"
                                >
                                    <Type className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                                    <span className="text-[10px] font-medium text-surface-600 dark:text-surface-400">Texto</span>
                                </button>
                                <button
                                    onClick={handleAddRect}
                                    className="flex flex-col items-center justify-center gap-2 py-3 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg border border-surface-200 dark:border-surface-700 transition-colors"
                                >
                                    <Square className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                                    <span className="text-[10px] font-medium text-surface-600 dark:text-surface-400">Quadrado</span>
                                </button>
                                <button
                                    onClick={handleAddCircle}
                                    className="flex flex-col items-center justify-center gap-2 py-3 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg border border-surface-200 dark:border-surface-700 transition-colors"
                                >
                                    <Circle className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                                    <span className="text-[10px] font-medium text-surface-600 dark:text-surface-400">Círculo</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-surface-900 rounded-[1.5rem] border border-surface-200/50 dark:border-surface-700/50 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-surface-200/50 dark:border-surface-700/50">
                                <LayoutTemplate className="w-5 h-5 text-primary-500" />
                                <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">Configuração Global</h2>
                            </div>

                            <div className="mb-4">
                                <label className="text-[11px] font-semibold text-surface-500 dark:text-surface-400 mb-1 block uppercase">Tamanho do Post</label>
                                <select
                                    value={frameFormat}
                                    onChange={e => setFrameFormat(e.target.value as FrameFormat)}
                                    className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 mb-4"
                                >
                                    {(Object.entries(FRAME_PRESETS) as [FrameFormat, typeof FRAME_PRESETS[FrameFormat]][]).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="text-[11px] font-semibold text-surface-500 dark:text-surface-400 mb-1 block uppercase">Coleção de Templates</label>
                                <select
                                    value={activeTemplateIndex}
                                    onChange={e => handleTemplateChange(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                >
                                    {templates.map((t, i) => (
                                        <option key={t.id} value={i}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-2">
                                <label className="text-[11px] font-semibold text-surface-500 dark:text-surface-400 mb-1 block uppercase">Variação de Copy (Texto)</label>
                                <select
                                    value={selectedTextIndex}
                                    onChange={e => setSelectedTextIndex(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                >
                                    {generatedTexts.map((text, i) => (
                                        <option key={i} value={i}>Copy {i + 1}: {text.headline.substring(0, 30)}...</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => { setStep(2); setGeneratedTexts([]) }}
                                className="w-full mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center justify-center gap-2 py-2"
                            >
                                <RefreshCw className="w-4 h-4" /> Gerar novos propósitos
                            </button>
                        </div>

                        {/* Interactive Properties Panel */}
                        <div className="bg-white dark:bg-surface-900 rounded-[1.5rem] border border-surface-200/50 dark:border-surface-700/50 shadow-sm flex-shrink-0">
                            <PropertiesPanel
                                layer={manager.selectedLayer}
                                onUpdate={(updates) => {
                                    if (manager.selectedLayerId) {
                                        manager.updateLayer(manager.selectedLayerId, updates)
                                    }
                                }}
                                onDelete={() => manager.selectedLayerId && manager.deleteLayer(manager.selectedLayerId)}
                                onBringToFront={() => manager.selectedLayerId && manager.bringToFront(manager.selectedLayerId)}
                                onSendToBack={() => manager.selectedLayerId && manager.sendToBack(manager.selectedLayerId)}
                                onAlign={(type) => manager.selectedLayerId && manager.alignLayer(manager.selectedLayerId, type, canvasWidth, canvasHeight)}
                            />
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors shadow-sm mt-auto"
                        >
                            <ChevronLeft className="w-4 h-4" /> Sair do Editor
                        </button>
                    </div>

                    {/* Backdrop for mobile drawer */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
