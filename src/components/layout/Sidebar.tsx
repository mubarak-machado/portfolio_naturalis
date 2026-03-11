/**
 * Sidebar — Barra de Navegação Lateral (Admin)
 * ==============================================
 * Desktop: fixa à esquerda, colapsável.
 * Mobile (< md): oculta por padrão, overlay slide-in controlado pelo AppLayout.
 * No mobile inclui ThemeControls no footer.
 */

import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Megaphone,
    HelpCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    ExternalLink,
    X,
    Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import ThemeControls from '@/components/ThemeControls'

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/produtos', icon: Package, label: 'Produtos', end: false },
    { to: '/admin/clientes', icon: Users, label: 'Clientes', end: false },
    { to: '/admin/vendas', icon: ShoppingCart, label: 'PDV', end: false },
    { to: '/admin/pedidos', icon: ClipboardList, label: 'Pedidos', end: false },
    { to: '/admin/marketing', icon: Megaphone, label: 'Marketing', end: false },
    { to: '/admin/configuracoes', icon: Settings, label: 'Configurações', end: false },
    { to: '/admin/ajuda', icon: HelpCircle, label: 'Ajuda', end: false },
]

interface SidebarProps {
    mobileOpen: boolean
    onMobileClose: () => void
    collapsed: boolean
    onToggleCollapse: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }: SidebarProps) {
    const { signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/admin/login')
    }

    const handleNavClick = () => {
        // Close sidebar on mobile when a nav item is selected
        onMobileClose()
    }

    return (
        <>
            {/* ── Backdrop overlay (mobile only) ────────────── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
                    onClick={onMobileClose}
                />
            )}

            {/* ── Sidebar panel ─────────────────────────────── */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-screen flex flex-col',
                    'bg-surface-900 text-white border-r border-surface-700/50',
                    // Desktop
                    'hidden md:flex transition-all duration-300 ease-in-out',
                    collapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]',
                    // Mobile: always visible when open, full width sidebar, handle potential address bar height issues
                    mobileOpen && '!flex w-[280px] shadow-2xl h-[100dvh]'
                )}
            >
                {/* Logo + Close (mobile) */}
                <div className="flex items-center justify-between px-4 py-6 border-b border-surface-700/50">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Rô Naturalis" className="w-10 h-10 rounded-xl object-contain shadow-sm bg-surface-50" />
                        {(!collapsed || mobileOpen) && (
                            <div className="animate-fade-in">
                                <h1 className="text-lg font-heading font-semibold tracking-tight">Rô Naturalis</h1>
                                <p className="text-xs text-surface-400 font-medium">Gestão & Marketing</p>
                            </div>
                        )}
                    </div>
                    {/* Close button — mobile only */}
                    <button
                        onClick={onMobileClose}
                        className="md:hidden p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 px-3 py-3 rounded-xl',
                                    'text-sm font-medium transition-all duration-300',
                                    'hover:bg-surface-800 hover:text-white',
                                    // Larger touch targets on mobile
                                    'min-h-[48px]',
                                    isActive
                                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20 shadow-inner'
                                        : 'text-surface-400 border border-transparent'
                                )
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {(!collapsed || mobileOpen) && <span className="animate-fade-in tracking-wide">{item.label}</span>}
                        </NavLink>
                    ))}

                    {/* Link to public store */}
                    <a
                        href="/loja"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-surface-500 hover:bg-surface-800 hover:text-white transition-all duration-300 border border-transparent mt-6 min-h-[48px]"
                    >
                        <ExternalLink className="w-5 h-5 flex-shrink-0 opacity-80" />
                        {(!collapsed || mobileOpen) && <span className="animate-fade-in tracking-wide">Visitar Loja</span>}
                    </a>
                </nav>

                {/* Footer: Theme (mobile) + Logout + Collapse */}
                <div className="px-3 py-4 border-t border-surface-700/50 space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4">
                    {/* Theme + Font controls — mobile only (on desktop they're in AppLayout top-right) */}
                    <div className="md:hidden flex justify-center pb-2">
                        <ThemeControls />
                    </div>

                    <button
                        onClick={handleSignOut}
                        className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-xl w-full min-h-[48px]',
                            'text-sm font-medium text-surface-400 transition-all duration-300',
                            'hover:bg-danger-500/10 hover:text-danger-400'
                        )}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {(!collapsed || mobileOpen) && <span className="tracking-wide">Sair do Admin</span>}
                    </button>

                    {/* Collapse toggle — desktop only */}
                    <button
                        onClick={onToggleCollapse}
                        className={cn(
                            'hidden md:flex items-center justify-center w-full py-3 rounded-xl',
                            'text-surface-500 hover:text-surface-300 hover:bg-surface-800',
                            'transition-all duration-300 shadow-sm'
                        )}
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>
            </aside>
        </>
    )
}
