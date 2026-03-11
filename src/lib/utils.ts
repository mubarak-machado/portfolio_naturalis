/**
 * Utilitários Gerais
 * ==================
 * Funções auxiliares reutilizáveis por toda a aplicação.
 * 
 * - cn(): Combina classes CSS condicionalmente. Muito útil
 *   para mesclar classes do Tailwind de forma segura sem
 *   conflitos de especificidade.
 * 
 * - formatCurrency(): Formata números para Real brasileiro (R$).
 * 
 * - formatDate(): Formata datas para o padrão brasileiro (dd/mm/aaaa).
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}
