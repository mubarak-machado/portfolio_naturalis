import { Outlet, Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HelpLayout() {
    const location = useLocation()
    const pathSegments = location.pathname.split('/').filter(Boolean)
    
    // Breadcrumbs logic
    const breadcrumbs = pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        const isLast = index === pathSegments.length - 1

        return { path, label, isLast }
    })

    return (
        <div className="flex flex-col h-full">
            {/* Breadcrumbs Navigation */}
            <nav className="flex items-center gap-2 mb-6 text-sm text-surface-500 dark:text-surface-400 overflow-x-auto whitespace-nowrap pb-2">
                <Link 
                    to="/admin/ajuda" 
                    className="flex items-center gap-1.5 hover:text-primary-500 transition-colors"
                >
                    <BookOpen className="w-4 h-4" />
                    <span>Central de Ajuda</span>
                </Link>
                
                {pathSegments.length > 2 && breadcrumbs.slice(2).map((bc) => (
                    <div key={bc.path} className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                        {bc.isLast ? (
                            <span className="font-semibold text-surface-900 dark:text-surface-100 uppercase tracking-wider text-[11px]">
                                {bc.label === 'Ajuda' ? 'Início' : bc.label}
                            </span>
                        ) : (
                            <Link to={bc.path} className="hover:text-primary-500 transition-colors capitalize">
                                {bc.label}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            {/* Guide Content */}
            <div className="flex-1 min-h-0">
                <div className="bg-white dark:bg-surface-950 rounded-3xl border border-surface-200/60 dark:border-surface-800/60 shadow-card overflow-hidden h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}
