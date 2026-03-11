/**
 * ThemeControls — Controles Universais de Tema e Fonte
 * =====================================================
 * Componente reutilizável exibido no TOPO de todas as telas.
 * Tema: botões (Claro/Escuro/Auto)
 * Fonte: botão único com dropdown (A / A+ / A++)
 */

import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor, Type } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme, type ThemeMode, type FontScale } from '@/contexts/ThemeContext'

const themeOptions: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Claro' },
    { value: 'dark', icon: Moon, label: 'Escuro' },
    { value: 'system', icon: Monitor, label: 'Auto' },
]

const fontOptions: { value: FontScale; label: string; desc: string }[] = [
    { value: 'normal', label: 'A', desc: 'Normal' },
    { value: 'large', label: 'A+', desc: 'Grande' },
    { value: 'extra-large', label: 'A++', desc: 'Extra Grande' },
]

interface ThemeControlsProps {
    className?: string
}

export default function ThemeControls({ className }: ThemeControlsProps) {
    const { theme, setTheme, fontScale, setFontScale } = useTheme()
    const [fontOpen, setFontOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown on outside click
    useEffect(() => {
        if (!fontOpen) return
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setFontOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [fontOpen])

    const currentFont = fontOptions.find(o => o.value === fontScale) || fontOptions[0]

    return (
        <div className={cn('flex items-center gap-1.5', className)}>
            {/* Theme toggle pills */}
            <div className="flex items-center gap-0.5 bg-surface-100/80 dark:bg-surface-800/80 backdrop-blur-md rounded-lg p-0.5">
                {themeOptions.map(opt => {
                    const Icon = opt.icon
                    return (
                        <button
                            key={opt.value}
                            onClick={() => setTheme(opt.value)}
                            title={opt.label}
                            className={cn(
                                'p-1.5 rounded-md transition-all duration-200',
                                theme === opt.value
                                    ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-600 dark:text-primary-400'
                                    : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                        </button>
                    )
                })}
            </div>

            {/* Font size — single button + dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setFontOpen(!fontOpen)}
                    title="Tamanho da fonte"
                    className={cn(
                        'flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-200',
                        'bg-surface-100/80 dark:bg-surface-800/80 backdrop-blur-md',
                        fontOpen
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                    )}
                >
                    <Type className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{currentFont.label}</span>
                </button>

                {fontOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg py-1 min-w-[130px] z-50 animate-fade-in">
                        {fontOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => { setFontScale(opt.value); setFontOpen(false) }}
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                                    fontScale === opt.value
                                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
                                        : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700'
                                )}
                            >
                                <span className="font-bold text-xs w-6">{opt.label}</span>
                                <span>{opt.desc}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
