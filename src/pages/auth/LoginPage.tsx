/**
 * LoginPage — Tela de Login
 * ==========================
 * Formulário de autenticação com e-mail e senha.
 * Design premium com gradiente de fundo e card glassmorphism.
 * Inclui opção de criar conta (sign up).
 */

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAppModal } from '@/contexts/ModalContext'
import { cn } from '@/lib/utils'
import ThemeControls from '@/components/ThemeControls'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { signIn, signUp } = useAuth()
    const { showAlert } = useAppModal()
    const navigate = useNavigate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = isSignUp
            ? await signUp(email, password)
            : await signIn(email, password)

        if (error) {
            setError(
                error.message === 'Invalid login credentials'
                    ? 'E-mail ou senha incorretos.'
                    : error.message
            )
            setLoading(false)
            return
        }

        if (isSignUp) {
            setError(null)
            setIsSignUp(false)
            setLoading(false)
            await showAlert({
                title: 'Conta Criada!',
                message: 'Verifique seu e-mail para confirmar o cadastro.',
                type: 'success'
            })
            return
        }

        navigate('/admin')
    }

    return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-start md:justify-center pt-24 pb-8 px-4 bg-surface-50 dark:bg-surface-900 relative overflow-y-auto overflow-x-hidden transition-colors duration-300">
            {/* Theme Controls (top-right) */}
            <div className="absolute top-4 right-4 z-10">
                <ThemeControls />
            </div>

            {/* Background decorativo */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/20 dark:bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-400/20 dark:bg-accent-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-scale-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white/50 dark:bg-surface-800/50 backdrop-blur-md mb-6 shadow-xl p-3 border border-surface-200/50 dark:border-surface-700/50">
                        <img src="/logo.png" alt="Rô Naturalis Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white tracking-tight mb-2">Rô Naturalis</h1>
                    <p className="text-surface-500 dark:text-surface-400 font-medium">Gestão & Marketing para Suplementos</p>
                </div>

                {/* Card */}
                <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-2xl rounded-[2rem] border border-white/50 dark:border-surface-800/50 shadow-2xl shadow-primary-500/5 dark:shadow-none p-8 md:p-10">
                    <h2 className="text-2xl font-heading font-bold text-surface-900 dark:text-white mb-8 text-center">
                        {isSignUp ? 'Criar sua Conta' : 'Acesse seu Painel'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 uppercase tracking-wide">
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className={cn(
                                    'w-full px-5 py-3.5 rounded-xl text-sm font-medium',
                                    'bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50',
                                    'text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500',
                                    'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                                    'transition-all duration-200'
                                )}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 uppercase tracking-wide">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className={cn(
                                        'w-full px-5 py-3.5 pr-12 rounded-xl text-sm font-medium',
                                        'bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50',
                                        'text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500',
                                        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                                        'transition-all duration-200'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="px-4 py-2.5 rounded-lg bg-danger-500/20 border border-danger-500/30 text-danger-500 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                'w-full py-4 px-6 rounded-xl text-base font-bold text-white',
                                'bg-primary-600 hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-400',
                                'shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40',
                                'hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
                                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-primary-500/20',
                                'mt-8'
                            )}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : isSignUp ? (
                                'Criar Conta'
                            ) : (
                                'Entrar no Sistema'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp)
                                setError(null)
                            }}
                            className="text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            {isSignUp
                                ? 'Já tem conta? Entrar agora'
                                : 'Não tem conta? Criar uma conta'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
