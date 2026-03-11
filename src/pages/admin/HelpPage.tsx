/**
 * HelpPage — Página de Ajuda (Stub)
 * ====================================
 * Será implementado na Fase 3 com documentação completa.
 * Placeholder para validar o roteamento.
 */

import { HelpCircle } from 'lucide-react'

export default function HelpPage() {
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-500">
                    <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-surface-100">Ajuda</h1>
                    <p className="text-sm text-surface-500 dark:text-surface-400">Aprenda a usar o sistema</p>
                </div>
            </div>
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-8 shadow-card text-center text-surface-500 dark:text-surface-400">
                Centro de ajuda será implementado na Fase 3.
            </div>
        </div>
    )
}
