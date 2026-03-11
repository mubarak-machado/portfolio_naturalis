/**
 * StoreLayout — Layout Público da Loja
 * =====================================
 * Header responsivo com hamburger no mobile, ThemeControls visíveis apenas no desktop.
 * Footer responsivo com stack vertical no mobile.
 */

import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'
import ThemeControls from '@/components/ThemeControls'

export default function StoreLayout() {
    const { totalItems } = useCart()
    const location = useLocation()
    const isLanding = location.pathname === '/loja' || location.pathname === '/loja/'
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const { data, error } = await supabase.from('store_settings').select('whatsapp').eq('id', 1).single()
            if (error && error.code !== 'PGRST116') throw error
            return data || { whatsapp: '5511999999999' }
        }
    })

    const whatsappNumber = settings?.whatsapp || '5511999999999'

    return (
        <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
            {/* ── Header ───────────────────────────── */}
            <header className={cn(
                'fixed w-full top-0 z-50 transition-all duration-300',
                isLanding && !scrolled && !menuOpen
                    ? 'bg-transparent border-transparent'
                    : 'glass dark:bg-surface-900/90 border-b border-surface-200 dark:border-surface-700 shadow-sm'
            )}>
                <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
                    {/* Mobile: hamburger LEFT */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className={cn(
                                'p-2 rounded-lg transition-all text-surface-600 dark:text-surface-300'
                            )}
                            aria-label="Menu"
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Logo — center on mobile, left on desktop */}
                    <Link to="/loja" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="Rô Naturalis" className="w-8 h-8 rounded-lg object-contain" />
                        <span className="font-heading font-bold text-lg md:text-xl tracking-tight transition-colors text-surface-900 dark:text-surface-100">
                            Rô Naturalis
                        </span>
                    </Link>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <ThemeControls />

                        <Link
                            to="/loja/checkout"
                            className="relative p-2 rounded-xl transition-all duration-300 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-primary-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-bounce-in">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        <Link
                            to="/admin/login"
                            className="text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 text-surface-600 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800"
                        >
                            Admin
                        </Link>
                    </div>

                    {/* Mobile: cart RIGHT */}
                    <div className="flex md:hidden">
                        <Link
                            to="/loja/checkout"
                            className="relative p-2 rounded-xl transition-all duration-300 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-primary-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Mobile dropdown menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-surface-200/30 dark:border-surface-700/30 bg-surface-50/95 dark:bg-surface-900/95 backdrop-blur-lg animate-fade-in shadow-xl pb-2">
                        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
                            <div className="flex justify-center mb-6">
                                <ThemeControls />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/loja/produtos"
                                    onClick={() => setMenuOpen(false)}
                                    className="px-4 py-4 rounded-xl text-base font-medium text-surface-800 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-800 min-h-[44px] flex items-center transition-colors"
                                >
                                    Nossos Produtos
                                </Link>
                                <Link
                                    to="/admin/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="px-4 py-4 rounded-xl text-base font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-800 min-h-[44px] flex items-center transition-colors"
                                >
                                    Acesso Admin
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* ── Main content ─────────────────────── */}
            <main className={cn('flex-1 flex flex-col', isLanding ? '' : 'pt-14 md:pt-16')}>
                <Outlet />
            </main>

            {/* ── Footer ───────────────────────────── */}
            <footer className="border-t border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900 mt-auto">
                <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                    <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-4">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Rô Naturalis" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
                            <span className="font-heading font-semibold text-lg text-surface-800 dark:text-surface-200">
                                Rô Naturalis
                            </span>
                        </div>
                        <p className="text-sm text-surface-500 font-medium text-center">
                            Suplementos naturais de qualidade. © {new Date().getFullYear()}
                        </p>
                        <div className="flex gap-4 text-xs text-surface-400 dark:text-surface-500">
                            <Link to="/loja/produtos" className="hover:text-primary-500 transition-colors">
                                Produtos
                            </Link>
                            <a
                                href={`https://wa.me/${whatsappNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary-500 transition-colors"
                            >
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
