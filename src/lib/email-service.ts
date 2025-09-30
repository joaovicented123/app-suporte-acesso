import { EMAIL_CONFIG } from './email-config'

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

// Função principal de envio de email com Resend
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  console.log(`📧 Processando email para: ${emailData.to}`)
  console.log(`📧 Assunto: ${emailData.subject}`)
  console.log(`📧 Modo atual: ${EMAIL_CONFIG.getMode()}`)
  
  // Se estiver em desenvolvimento, simula o envio
  if (EMAIL_CONFIG.isDevelopment) {
    return sendEmailSimulation(emailData)
  }
  
  // Tenta enviar email real usando Resend
  try {
    return await sendEmailWithResend(emailData)
  } catch (error) {
    console.error('❌ Erro ao enviar email com Resend, usando simulação:', error)
    return sendEmailSimulation(emailData)
  }
}

// Envio real usando Resend (serviço gratuito e confiável)
export async function sendEmailWithResend(emailData: EmailData): Promise<boolean> {
  try {
    console.log('📧 Enviando email real com Resend...')
    
    const { Resend } = await import('resend')
    
    // Usar chave do Resend se disponível, senão usar modo simulação
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      console.log('⚠️ RESEND_API_KEY não configurada, usando simulação')
      return sendEmailSimulation(emailData)
    }
    
    const resend = new Resend(resendApiKey)
    
    const result = await resend.emails.send({
      from: 'DDPlanner <noreply@ddplanner.com.br>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    })
    
    if (result.error) {
      console.error('❌ Erro do Resend:', result.error)
      return sendEmailSimulation(emailData)
    }
    
    console.log('✅ Email enviado com sucesso via Resend:', result.data?.id)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar email com Resend:', error)
    throw error
  }
}

// Simulação de envio de email para desenvolvimento
export async function sendEmailSimulation(emailData: EmailData): Promise<boolean> {
  try {
    console.log('📧 ========== EMAIL SIMULADO ==========')
    console.log('📧 Para:', emailData.to)
    console.log('📧 Assunto:', emailData.subject)
    console.log('📧 Conteúdo HTML (primeiros 200 chars):', emailData.html.substring(0, 200) + '...')
    console.log('📧 ======================================')
    
    // Simula delay de envio
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Simula sucesso no envio
    console.log('✅ Email simulado enviado com sucesso!')
    return true
  } catch (error) {
    console.error('❌ Erro ao simular envio de email:', error)
    return false
  }
}

// Função para envio real em produção (fallback SMTP)
export async function sendEmailProduction(emailData: EmailData): Promise<boolean> {
  try {
    console.log('📧 Tentando envio real com SMTP...')
    
    const nodemailer = await import('nodemailer')
    const config = EMAIL_CONFIG.getConfig()
    
    console.log('📧 Configuração SMTP:', {
      host: config.host,
      port: config.port,
      user: config.user ? config.user.substring(0, 3) + '***' : 'não configurado',
      from: config.from
    })
    
    const transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: false,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })
    
    await transporter.sendMail({
      from: config.from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    })
    
    console.log('✅ Email enviado com sucesso em produção para:', emailData.to)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar email em produção:', error)
    throw error
  }
}

export function generateWelcomeEmailHTML(name: string, email: string, password: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo ao DDPlanner</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #06b6d4; margin: 20px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Bem-vindo ao DDPlanner!</h1>
          <p>Sua jornada rumo à aprovação começa agora</p>
        </div>
        
        <div class="content">
          <h2>Olá, ${name}!</h2>
          
          <p>Parabéns pela sua compra! Agora você tem acesso completo ao DDPlanner, a plataforma que vai revolucionar seus estudos para concursos.</p>
          
          <div class="credentials">
            <h3>🔐 Suas credenciais de acesso:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Senha:</strong> ${password}</p>
            <p><small>⚠️ Recomendamos alterar sua senha após o primeiro login</small></p>
          </div>
          
          <p>Com o DDPlanner você terá:</p>
          <ul>
            <li>✅ Planos de estudo personalizados com IA</li>
            <li>✅ Cronogramas adaptativos que se ajustam ao seu progresso</li>
            <li>✅ Métricas avançadas de performance</li>
            <li>✅ Integração com principais cursos preparatórios</li>
            <li>✅ Suporte prioritário</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="https://ddplanner.com.br/dashboard" class="button">
              🚀 Acessar Plataforma
            </a>
          </div>
          
          <p>Se você tiver qualquer dúvida, nossa equipe está pronta para ajudar. Responda este email ou entre em contato conosco.</p>
          
          <p><strong>Sucesso nos seus estudos!</strong><br>
          Equipe DDPlanner</p>
        </div>
        
        <div class="footer">
          <p>DDPlanner - Sua aprovação é nossa missão</p>
          <p>Este é um email automático, mas você pode responder se precisar de ajuda.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateSubscriptionCancelledEmailHTML(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Assinatura Cancelada - DDPlanner</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>😔 Assinatura Cancelada</h1>
        </div>
        
        <div class="content">
          <h2>Olá, ${name}</h2>
          
          <p>Recebemos a informação de que sua assinatura do DDPlanner foi cancelada.</p>
          
          <p><strong>O que isso significa:</strong></p>
          <ul>
            <li>Seu acesso à plataforma será mantido até o final do período já pago</li>
            <li>Você não será cobrado novamente</li>
            <li>Seus dados e progresso serão preservados</li>
          </ul>
          
          <p>Se você mudou de ideia ou o cancelamento foi um engano, você pode reativar sua assinatura a qualquer momento:</p>
          
          <div style="text-align: center;">
            <a href="https://ddplanner.com.br" class="button">
              🔄 Reativar Assinatura
            </a>
          </div>
          
          <p>Sentiremos sua falta! Se houver algo que possamos melhorar, por favor nos conte respondendo este email.</p>
          
          <p><strong>Obrigado por ter feito parte da nossa comunidade!</strong><br>
          Equipe DDPlanner</p>
        </div>
        
        <div class="footer">
          <p>DDPlanner - Sua aprovação é nossa missão</p>
        </div>
      </div>
    </body>
    </html>
  `
}