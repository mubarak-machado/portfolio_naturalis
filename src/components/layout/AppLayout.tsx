/**
 * AppLayout — Layout Principal da Aplicação (Admin)
 * ==================================================
 * Desktop: Sidebar fixa + ThemeControls topo-direito + conteúdo com margin-left.
 * Mobile (< md): Sidebar overlay + hamburger button + responsivo.
 */

import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Menu } from 'lucide-react'
import ThemeControls from '@/components/ThemeControls'
import { useIdleTimeout } from '@/hooks/useIdleTimeout'
import { useAppModal } from '@/contexts/ModalContext'

export default function AppLayout() {
    const { user, loading, signOut } = useAuth()
    const { showAlert } = useAppModal()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    // Log out admin on 30 minutes of inactivity
    useIdleTimeout(() => {
        if (user) {
            signOut()
            showAlert({
                title: 'Sessão Expirada',
                message: 'Você foi desconectado por inatividade para sua segurança.',
                type: 'warning'
            })
        }
    }, 1000 * 60 * 30)

    // Close mobile sidebar on window resize to desktop
    useEffect(() => {
        const handler = () => {
            if (window.innerWidth >= 768) setSidebarOpen(false)
        }
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 transition-colors">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    <p className="text-sm text-surface-500 dark:text-surface-400">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />
    }

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
            <Sidebar
                mobileOpen={sidebarOpen}
                onMobileClose={() => setSidebarOpen(false)}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(!collapsed)}
            />

            {/* Mobile top bar — hamburger + ThemeControls */}
            <div className="fixed top-0 left-0 right-0 z-30 md:hidden flex items-center justify-between px-4 h-16 bg-surface-50/95 dark:bg-surface-950/95 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 shadow-sm">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
                    aria-label="Abrir menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <span className="text-base font-heading font-bold text-surface-800 dark:text-surface-200">Rô Naturalis</span>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Desktop ThemeControls — moved to main header */}

            {/* Main content */}
            <main className={`
                pt-14 md:pt-0 px-4 py-4 md:p-6
                transition-all duration-300
                ${collapsed ? 'md:ml-[var(--sidebar-collapsed-width)]' : 'md:ml-[var(--sidebar-width)]'}
            `}>
                <div className="max-w-7xl mx-auto animate-fade-in">
                    {/* Desktop Header with ThemeControls (added mt-4 for "respiro") */}
                    <div className="hidden md:flex justify-end mt-4 mb-6">
                        <ThemeControls />
                    </div>

                    <Outlet />
                </div>
            </main>
        </div>
    )
}
