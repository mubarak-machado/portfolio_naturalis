/**
 * Supabase Client
 * ===============
 * Cria e exporta a instância única do cliente Supabase.
 * 
 * Resiliência: se as credenciais não estiverem configuradas
 * (placeholder ou ausentes), o flag `isConfigured` permite
 * que o resto da aplicação saiba e trate adequadamente,
 * sem crashar na inicialização.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Indica se o Supabase foi configurado com credenciais reais.
 * Usado pelo AuthContext para decidir se tenta conectar ou não.
 */
export const isSupabaseConfigured =
    supabaseUrl !== '' &&
    supabaseUrl !== 'cole_aqui_sua_url' &&
    supabaseAnonKey !== '' &&
    supabaseAnonKey !== 'cole_aqui_sua_chave'

if (!isSupabaseConfigured) {
    console.warn(
        '⚠️ Supabase não configurado. Edite o arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
    )
}

// Usamos uma URL dummy válida quando não configurado para evitar crash do createClient
export const supabase = createClient(
    isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
    isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder'
)
