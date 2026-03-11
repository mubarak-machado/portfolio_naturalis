import React from 'react'
import { 
    Type, 
    Image as ImageIcon, 
    Box, 
    Settings2, 
    Trash2, 
    Sun, 
    Contrast, 
    Eye, 
    Maximize,
    Palette
} from 'lucide-react'
import type { CanvasLayer } from './types'
import AlignmentToolbar from './AlignmentToolbar'
import { cn } from '@/lib/utils'

interface PropertiesPanelProps {
    layer: CanvasLayer | null
    onUpdate: (updates: Partial<CanvasLayer>) => void
    onDelete: () => void
    onBringToFront: () => void
    onSendToBack: () => void
    onAlign: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
}

export default function PropertiesPanel({ 
    layer, 
    onUpdate, 
    onDelete, 
    onBringToFront, 
    onSendToBack,
    onAlign
}: PropertiesPanelProps) {
    if (!layer) return (
            <div className="flex flex-col items-center justify-center p-8 text-surface-400 dark:text-surface-500 h-full">
                <Settings2 className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm text-center">Nenhum elemento selecionado.<br />Clique em um elemento no canvas para editá-lo.</p>
            </div>
        )

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        onUpdate({ content: url })
    }

    return (
        <div className="p-5 space-y-6 h-full overflow-y-auto custom-scrollbar">
            {/* Header & Alignment */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-700">
                    <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                        {layer.type === 'text' && <Type className="w-4 h-4 text-primary-500" />}
                        {(layer.type === 'image' || layer.type === 'logo') && <ImageIcon className="w-4 h-4 text-primary-500" />}
                        {layer.type === 'shape' && <Box className="w-4 h-4 text-primary-500" />}
                        {layer.name}
                    </h3>
                </div>

                {!layer.isLocked && <AlignmentToolbar onAlign={onAlign} />}
            </div>

            <div className="space-y-4">
                {/* Text specific props */}
                {layer.type === 'text' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-2 block">Conteúdo</label>
                            <textarea
                                value={layer.content || ''}
                                onChange={e => onUpdate({ content: e.target.value })}
                                className="w-full p-2 text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:ring-2 focus:ring-primary-500/50"
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-2 block">Cor</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={layer.color || '#000000'} onChange={e => onUpdate({ color: e.target.value })} className="w-8 h-8 rounded cursor-pointer shrink-0 border-0 p-0 overflow-hidden" />
                                    <span className="text-[10px] font-mono text-surface-500">{layer.color}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-2 block">Tam. Fonte</label>
                                <input type="number" value={Math.round(layer.fontSize || 32)} onChange={e => onUpdate({ fontSize: Number(e.target.value) })} className="w-full p-2 text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-2 block">Espaçamento</label>
                                <input type="number" value={layer.letterSpacing || 0} onChange={e => onUpdate({ letterSpacing: Number(e.target.value) })} className="w-full p-2 text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg" placeholder="0" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-2 block">Altura Linha</label>
                                <input type="number" step="0.1" value={layer.lineHeight || 1.2} onChange={e => onUpdate({ lineHeight: Number(e.target.value) })} className="w-full p-2 text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Filters */}
                {layer.type === 'image' && (
                    <div className="space-y-3 bg-surface-50 dark:bg-surface-800/50 p-3 rounded-xl border border-surface-200 dark:border-surface-700">
                        <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Ajustes de Imagem</label>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="flex items-center gap-1.5 text-[10px] text-surface-500"><Sun className="w-3 h-3" /> Brilho</span>
                                    <span className="text-[10px] font-mono text-surface-500">{Math.round((layer.brightness || 0) * 100)}%</span>
                                </div>
                                <input type="range" min="-1" max="1" step="0.1" value={layer.brightness || 0} onChange={e => onUpdate({ brightness: Number(e.target.value) })} className="w-full h-1.5 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="flex items-center gap-1.5 text-[10px] text-surface-500"><Contrast className="w-3 h-3" /> Contraste</span>
                                    <span className="text-[10px] font-mono text-surface-500">{Math.round((layer.contrast || 0) * 100)}%</span>
                                </div>
                                <input type="range" min="-1" max="1" step="0.1" value={layer.contrast || 0} onChange={e => onUpdate({ contrast: Number(e.target.value) })} className="w-full h-1.5 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                            </div>

                            <button 
                                onClick={() => onUpdate({ grayscale: !layer.grayscale })}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                                    layer.grayscale 
                                        ? "bg-primary-500 text-white border-primary-500 shadow-sm" 
                                        : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700"
                                )}
                            >
                                <Eye className="w-3.3 h-3" /> {layer.grayscale ? 'REMOVER P&B' : 'APLICAR P&B'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Stroke Controls (Text/Shape) */}
                {(layer.type === 'text' || layer.type === 'shape') && (
                    <div className="space-y-3 bg-surface-50 dark:bg-surface-800/50 p-3 rounded-xl border border-surface-200 dark:border-surface-700">
                        <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Contorno (Stroke)</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 shrink-0">
                                <input type="color" value={layer.stroke || '#000000'} onChange={e => onUpdate({ stroke: e.target.value })} className="w-full h-8 rounded cursor-pointer border-0 p-0 overflow-hidden" />
                            </div>
                            <div className="flex-[2]">
                                <input type="range" min="0" max="20" step="1" value={layer.strokeWidth || 0} onChange={e => onUpdate({ strokeWidth: Number(e.target.value) })} className="w-full" />
                            </div>
                            <span className="text-[10px] font-mono text-surface-500 w-6 text-right">{layer.strokeWidth || 0}</span>
                        </div>
                    </div>
                )}

                {/* Shadow Controls */}
                {!layer.isLocked && (
                    <div className="space-y-3 bg-surface-50 dark:bg-surface-800/50 p-3 rounded-xl border border-surface-200 dark:border-surface-700">
                        <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-1">Efeito de Sombra</label>
                        <div className="space-y-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] text-surface-500 w-16">Cor & Blur</span>
                                <input type="color" value={layer.shadowColor || '#000000'} onChange={e => onUpdate({ shadowColor: e.target.value })} className="w-8 h-8 rounded p-0 border-0" />
                                <input type="range" min="0" max="50" value={layer.shadowBlur || 0} onChange={e => onUpdate({ shadowBlur: Number(e.target.value) })} className="flex-1" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-surface-500 w-16">Offset X/Y</span>
                                <input type="number" value={layer.shadowOffsetX || 0} onChange={e => onUpdate({ shadowOffsetX: Number(e.target.value) })} className="w-full p-1.5 text-[10px] bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded" />
                                <input type="number" value={layer.shadowOffsetY || 0} onChange={e => onUpdate({ shadowOffsetY: Number(e.target.value) })} className="w-full p-1.5 text-[10px] bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Transparency for all */}
                <div>
                    <label className="text-xs font-semibold text-surface-600 dark:text-surface-400 mb-2 block">Opacidade: {(layer.opacity ?? 1).toFixed(2)}</label>
                    <input type="range" min="0" max="1" step="0.05" value={layer.opacity ?? 1} onChange={e => onUpdate({ opacity: Number(e.target.value) })} className="w-full" />
                </div>

                {/* Layer Control Actions */}
                {!layer.isLocked && (
                    <div className="pt-4 mt-6 border-t border-surface-200 dark:border-surface-700 space-y-2">
                        <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block mb-2">Ordenação de Camada</label>
                        <div className="flex gap-2">
                            <button onClick={onBringToFront} className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold bg-surface-100 dark:bg-surface-800 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors uppercase">
                                <Maximize className="w-3 h-3" /> Trazer para Frente
                            </button>
                            <button onClick={onSendToBack} className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold bg-surface-100 dark:bg-surface-800 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors uppercase">
                                <Eye className="w-3 h-3 opacity-50" /> Enviar para Trás
                            </button>
                        </div>
                        <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-500/10 rounded-lg hover:bg-danger-100 dark:hover:bg-danger-500/20 transition-colors uppercase tracking-widest">
                            <Trash2 className="w-4 h-4" /> Excluir Elemento
                        </button>
                    </div>
                )}
                {layer.isLocked && (
                    <p className="text-xs text-surface-500 pt-4 mt-6 border-t border-surface-200 dark:border-surface-700 italic">
                        🔒 Este elemento está bloqueado e algumas propriedades não podem ser editadas diretamente para manter a estrutura do layout.
                    </p>
                )}
            </div>
        </div>
    )
}
