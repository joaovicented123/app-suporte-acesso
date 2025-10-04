import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Criar cliente com configurações de retry e timeout
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'ddplanner-web'
    }
  }
})

// Função helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '')
}

// Função helper para executar operações do Supabase com tratamento de erro
export const executeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback?: () => T,
  operationName = 'Operação Supabase'
): Promise<T | null> => {
  if (!isSupabaseConfigured()) {
    console.log(`⚠️ [SUPABASE] ${operationName}: Supabase não configurado, usando fallback`)
    return fallback ? fallback() : null
  }

  try {
    const result = await operation()
    return result
  } catch (error: any) {
    // Verificar se é erro de rede específico
    if (error?.message?.includes('Failed to fetch') || 
        error?.message?.includes('Network Error') ||
        error?.message?.includes('fetch is not defined') ||
        error?.code === 'NETWORK_ERROR') {
      console.log(`🌐 [SUPABASE] ${operationName}: Erro de rede detectado, usando fallback`)
      return fallback ? fallback() : null
    }

    // Para outros erros, logar mas não quebrar a aplicação
    console.error(`❌ [SUPABASE] ${operationName}: Erro não relacionado à rede:`, error)
    return fallback ? fallback() : null
  }
}