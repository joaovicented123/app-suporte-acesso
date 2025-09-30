// Configuração centralizada de email com Resend como prioridade
export const EMAIL_CONFIG = {
  // Modo de desenvolvimento
  isDevelopment: process.env.NODE_ENV !== 'production',
  
  // Configurações padrão para fallback
  defaults: {
    from: 'noreply@ddplanner.com.br',
    host: 'smtp.gmail.com',
    port: 587,
  },
  
  // Verifica se Resend está configurado (prioridade)
  isResendConfigured: () => {
    return !!process.env.RESEND_API_KEY
  },
  
  // Verifica se SMTP está configurado (fallback)
  isSMTPConfigured: () => {
    return !!( 
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
    )
  },
  
  // Verifica se qualquer método de email está configurado
  isConfigured: () => {
    return EMAIL_CONFIG.isResendConfigured() || EMAIL_CONFIG.isSMTPConfigured()
  },
  
  // Retorna as configurações atuais
  getConfig: () => ({
    host: process.env.SMTP_HOST || EMAIL_CONFIG.defaults.host,
    port: parseInt(process.env.SMTP_PORT || EMAIL_CONFIG.defaults.port.toString()),
    user: process.env.SMTP_USER || 'fallback@ddplanner.com.br',
    pass: process.env.SMTP_PASS || 'fallback-password',
    from: process.env.SMTP_FROM || EMAIL_CONFIG.defaults.from,
    resendApiKey: process.env.RESEND_API_KEY,
  }),

  // Modo de operação atual
  getMode: () => {
    if (EMAIL_CONFIG.isDevelopment) return 'development'
    if (EMAIL_CONFIG.isResendConfigured()) return 'resend'
    if (EMAIL_CONFIG.isSMTPConfigured()) return 'smtp'
    return 'simulation'
  }
}

// Instruções para configuração em produção
export const EMAIL_SETUP_INSTRUCTIONS = {
  resend: {
    name: 'Resend (Recomendado)',
    instructions: [
      '1. Acesse https://resend.com e crie uma conta gratuita',
      '2. Verifique seu domínio ou use o domínio de teste',
      '3. Gere uma API Key',
      '4. Configure RESEND_API_KEY com sua chave'
    ],
    envVars: ['RESEND_API_KEY'],
    benefits: ['Gratuito até 3.000 emails/mês', 'Configuração simples', 'Alta entregabilidade']
  },
  gmail: {
    name: 'Gmail',
    instructions: [
      '1. Acesse sua conta Google',
      '2. Ative a verificação em 2 etapas',
      '3. Gere uma senha de app específica',
      '4. Configure as variáveis SMTP'
    ],
    envVars: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'SMTP_PORT']
  },
  sendgrid: {
    name: 'SendGrid',
    instructions: [
      '1. Crie uma conta no SendGrid',
      '2. Gere uma API Key',
      '3. Use "apikey" como SMTP_USER',
      '4. Use a API Key como SMTP_PASS'
    ],
    envVars: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'SMTP_PORT']
  }
}

// Função para validar configuração de email
export function validateEmailConfig(): {
  isValid: boolean
  missing: string[]
  recommendations: string[]
  mode: string
  provider: string
} {
  const missing: string[] = []
  const recommendations: string[] = []
  const mode = EMAIL_CONFIG.getMode()
  let provider = 'none'
  
  if (EMAIL_CONFIG.isResendConfigured()) {
    provider = 'resend'
    recommendations.push('✅ Resend configurado - emails serão enviados via Resend')
  } else if (EMAIL_CONFIG.isSMTPConfigured()) {
    provider = 'smtp'
    recommendations.push('✅ SMTP configurado - emails serão enviados via SMTP')
  } else {
    // Verificar quais variáveis estão faltando
    if (!process.env.RESEND_API_KEY) missing.push('RESEND_API_KEY')
    
    if (mode === 'development') {
      recommendations.push('🔧 Modo desenvolvimento - emails simulados no console')
      recommendations.push('💡 Para emails reais, configure RESEND_API_KEY')
    } else {
      recommendations.push('⚠️ Nenhum provedor de email configurado')
      recommendations.push('🚀 Recomendado: Configure RESEND_API_KEY (gratuito até 3k emails/mês)')
      recommendations.push('📧 Alternativa: Configure SMTP (Gmail, SendGrid, etc.)')
    }
  }
  
  return {
    isValid: EMAIL_CONFIG.isConfigured(),
    missing,
    recommendations,
    mode,
    provider
  }
}