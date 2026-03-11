/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, HelpCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AlertType = 'info' | 'error' | 'success' | 'warning'

interface ModalOptions {
    title: string
    message: string
    type?: AlertType
    confirmText?: string
    cancelText?: string
}

interface ModalContextData {
    showAlert: (options: ModalOptions) => Promise<void>
    showConfirm: (options: ModalOptions) => Promise<boolean>
}

const ModalContext = createContext<ModalContextData>({} as ModalContextData)

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isConfirm, setIsConfirm] = useState(false)
    const [options, setOptions] = useState<ModalOptions>({ title: '', message: '', type: 'info' })
    const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>(() => () => { })

    const showAlert = (opts: ModalOptions): Promise<void> => {
        return new Promise((resolve) => {
            setOptions({ ...opts, type: opts.type || 'info' })
            setIsConfirm(false)
            setIsOpen(true)
            setResolvePromise(() => () => resolve())
        })
    }

    const showConfirm = (opts: ModalOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setOptions({
                ...opts,
                type: opts.type || 'info',
                confirmText: opts.confirmText || 'Confirmar',
                cancelText: opts.cancelText || 'Cancelar'
            })
            setIsConfirm(true)
            setIsOpen(true)
            setResolvePromise(() => resolve)
        })
    }

    const handleClose = (value: boolean) => {
        setIsOpen(false)
        resolvePromise(value)
    }

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => handleClose(false)}
                    />
                    <div className="relative w-full max-w-sm bg-white dark:bg-surface-800 rounded-2xl shadow-modal animate-scale-in flex flex-col overflow-hidden border border-surface-200 dark:border-surface-700">

                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                    options.type === 'error' && "bg-danger-500/10 text-danger-500",
                                    options.type === 'success' && "bg-success-500/10 text-success-500",
                                    options.type === 'warning' && "bg-accent-500/10 text-accent-500",
                                    options.type === 'info' && (!isConfirm ? "bg-primary-500/10 text-primary-500" : "bg-accent-500/10 text-accent-500")
                                )}>
                                    {options.type === 'error' && <AlertCircle className="w-5 h-5" />}
                                    {options.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                                    {options.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                                    {options.type === 'info' && !isConfirm && <Info className="w-5 h-5" />}
                                    {options.type === 'info' && isConfirm && <HelpCircle className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 mt-0.5">
                                    <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 leading-tight mb-2">
                                        {options.title}
                                    </h3>
                                    <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                                        {options.message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-surface-50 dark:bg-surface-900 border-t border-surface-100 dark:border-surface-700 flex gap-3 justify-end">
                            {isConfirm && (
                                <button
                                    onClick={() => handleClose(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                                >
                                    {options.cancelText}
                                </button>
                            )}
                            <button
                                onClick={() => handleClose(true)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-md transition-all",
                                    options.type === 'error'
                                        ? "bg-danger-600 hover:bg-danger-700 shadow-danger-500/25"
                                        : "gradient-primary shadow-primary-500/25 hover:shadow-lg"
                                )}
                            >
                                {isConfirm ? options.confirmText : 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    )
}

export function useAppModal() {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useAppModal must be used within a ModalProvider')
    }
    return context
}
