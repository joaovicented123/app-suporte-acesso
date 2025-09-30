// Configurações padrão para variáveis de ambiente
// Este arquivo garante que o sistema funcione mesmo sem configuração manual

export const ENV_DEFAULTS = {
  // Configuração de ambiente
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Configurações SMTP com fallback inteligente
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER || 'noreply@ddplanner.com.br',
  SMTP_PASS: process.env.SMTP_PASS || 'fallback-password',
  SMTP_FROM: process.env.SMTP_FROM || 'DDPlanner <noreply@ddplanner.com.br>',
}

// Função para verificar se as variáveis críticas estão configuradas
export function checkCriticalEnvVars(): {
  isConfigured: boolean
  missing: string[]
  mode: 'production' | 'development' | 'fallback'
} {
  const missing: string[] = []
  
  // Verificar variáveis SMTP
  if (!process.env.SMTP_HOST) missing.push('SMTP_HOST')
  if (!process.env.SMTP_USER) missing.push('SMTP_USER')
  if (!process.env.SMTP_PASS) missing.push('SMTP_PASS')
  if (!process.env.SMTP_FROM) missing.push('SMTP_FROM')
  
  const isConfigured = missing.length === 0
  const isDevelopment = ENV_DEFAULTS.NODE_ENV === 'development'
  
  let mode: 'production' | 'development' | 'fallback'
  if (isDevelopment) {
    mode = 'development'
  } else if (isConfigured) {
    mode = 'production'
  } else {
    mode = 'fallback'
  }
  
  return {
    isConfigured,
    missing,
    mode
  }
}

// Função para obter configurações com fallback
export function getEnvConfig() {
  const check = checkCriticalEnvVars()
  
  return {
    ...ENV_DEFAULTS,
    mode: check.mode,
    isConfigured: check.isConfigured,
    missing: check.missing
  }
}

// Log de inicialização do sistema
export function logSystemStatus() {
  const config = getEnvConfig()
  
  console.log('🚀 DDPlanner - Status do Sistema:')
  console.log(`📊 Modo: ${config.mode}`)
  console.log(`⚙️ NODE_ENV: ${config.NODE_ENV}`)
  
  if (config.mode === 'development') {
    console.log('🔧 Modo desenvolvimento - Emails serão simulados')
  } else if (config.mode === 'fallback') {
    console.log('⚠️ Modo fallback - Algumas variáveis não configuradas:')
    config.missing.forEach(env => console.log(`   - ${env}`))
    console.log('📧 Emails serão simulados até configuração completa')
  } else {
    console.log('✅ Modo produção - Sistema totalmente configurado')
  }
}