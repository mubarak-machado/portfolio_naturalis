/**
 * AuthContext — Contexto de Autenticação
 * =======================================
 * Gerencia o estado de login do usuário via Supabase Auth.
 * 
 * Resiliência:
 * - Se o Supabase não estiver configurado, pula a verificação
 *   de sessão e libera a UI imediatamente (mostra tela de login).
 * - Timeout de 3s caso o getSession() fique pendente.
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    configured: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setTimeout(() => setLoading(false), 0)
            return
        }

        // Timeout de segurança: 3 segundos
        const timeout = setTimeout(() => {
            setLoading(false)
        }, 3000)

        // Verifica sessão existente ao carregar
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                clearTimeout(timeout)
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            })
            .catch(() => {
                clearTimeout(timeout)
                setLoading(false)
            })

        // Escuta mudanças de autenticação (login, logout, refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => {
            clearTimeout(timeout)
            subscription.unsubscribe()
        }
    }, [])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error as Error | null }
    }

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password })
        return { error: error as Error | null }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, configured: isSupabaseConfigured, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider')
    }
    return context
}
