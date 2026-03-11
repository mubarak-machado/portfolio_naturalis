import React from 'react'
import { 
    AlignLeft, 
    AlignCenter, 
    AlignRight, 
    AlignVerticalJustifyStart, 
    AlignVerticalJustifyCenter, 
    AlignVerticalJustifyEnd 
} from 'lucide-react'

interface AlignmentToolbarProps {
    onAlign: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
}

export default function AlignmentToolbar({ onAlign }: AlignmentToolbarProps) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-surface-500 uppercase tracking-wider block">Alinhamento</label>
            <div className="grid grid-cols-6 gap-1 bg-surface-50 dark:bg-surface-800 p-1 rounded-lg border border-surface-200 dark:border-surface-700">
                <button 
                    onClick={() => onAlign('left')} 
                    className="p-1.5 hover:bg-white dark:hover:bg-surface-700 rounded transition-colors" 
                    title="Alinhar à Esquerda"
                >
                    <AlignLeft className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                </button>
                <button 
                    onClick={() => onAlign('center')} 
                    className="p-1.5 hover:bg-white dark:hover:bg-surface-700 rounded transition-colors" 
                    title="Centralizar Horizontalmente"
                >
                    <AlignCenter className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                </button>
                <button 
                    onClick={() => onAlign('right')} 
                    className="p-1.5 hover:bg-white dark:hover:bg-surface-700 rounded transition-colors" 
                    title="Alinhar à Direita"
                >
                    <AlignRight className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                </button>
                <button 
                    onClick={() => onAlign('top')} 
                    className="p-1.5 hover:bg-white dark:hover:bg-surface-700 rounded transition-colors" 
                    title="Alinhar ao Topo"
                >
                    <AlignVerticalJustifyStart className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                </button>
                <button 
                    onClick={() => onAlign('middle')} 
                    className="p-1.5 hover:bg-white dark:hover:bg-surface-700 rounded transition-colors" 
                    title="Centralizar Verticalmente"
                >
                    <AlignVerticalJustifyCenter className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                </button>
                <button 
                    onClick={() => onAlign('bottom')} 
                    className="p-1.5 hover:bg-white dark:hover:bg-surface-700 rounded transition-colors" 
                    title="Alinhar à Base"
                >
                    <AlignVerticalJustifyEnd className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                </button>
            </div>
        </div>
    )
}
