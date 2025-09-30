import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'
import { sendEmail, generateWelcomeEmailHTML, generateSubscriptionCancelledEmailHTML } from '@/lib/email-service'
import { 
  hashPassword, 
  generateRandomPassword, 
  calculateSubscriptionEndDate, 
  mapHotmartStatus, 
  determinePlanType,
  validateHotmartWebhook
} from '@/lib/auth-utils'
import { HotmartWebhookData } from '@/lib/types'
import { logSystemStatus } from '@/lib/env-defaults'

export async function POST(request: NextRequest) {
  try {
    // Log do status do sistema na inicialização
    logSystemStatus()
    
    const body = await request.json()
    
    // Log do webhook recebido
    console.log('🔗 Webhook recebido da Hotmart:', JSON.stringify(body, null, 2))
    
    // Validar estrutura do webhook
    if (!validateHotmartWebhook(body)) {
      console.error('❌ Webhook inválido:', body)
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }

    const webhookData: HotmartWebhookData = body
    const { event, data } = webhookData
    const { buyer, purchase, product } = data

    // Criar log do webhook
    const webhookLog = await DatabaseService.createWebhookLog({
      event_type: event,
      transaction_id: purchase.transaction,
      subscriber_code: purchase.subscription?.subscriber_code,
      status: purchase.status,
      raw_data: body,
      processed: false
    })

    try {
      // Processar diferentes tipos de eventos
      switch (event) {
        case 'PURCHASE_APPROVED':
        case 'PURCHASE_COMPLETE':
          await handlePurchaseApproved(webhookData)
          break
          
        case 'PURCHASE_CANCELLED':
        case 'PURCHASE_REFUNDED':
        case 'PURCHASE_CHARGEBACK':
          await handlePurchaseCancelled(webhookData)
          break
          
        case 'SUBSCRIPTION_CANCELLATION':
          await handleSubscriptionCancellation(webhookData)
          break
          
        default:
          console.log(`ℹ️ Evento não processado: ${event}`)
      }

      // Marcar webhook como processado
      if (webhookLog) {
        await DatabaseService.markWebhookLogAsProcessed(webhookLog.id)
      }

      return NextResponse.json({ success: true, message: 'Webhook processed successfully' })

    } catch (processingError) {
      console.error('❌ Erro ao processar webhook:', processingError)
      
      // Marcar webhook como erro
      if (webhookLog) {
        await DatabaseService.markWebhookLogAsProcessed(
          webhookLog.id, 
          processingError instanceof Error ? processingError.message : 'Unknown error'
        )
      }

      return NextResponse.json({ error: 'Processing error' }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handlePurchaseApproved(webhookData: HotmartWebhookData) {
  const { data } = webhookData
  const { buyer, purchase } = data

  console.log('✅ Processando compra aprovada:', purchase.transaction)

  // Verificar se já existe uma assinatura para esta transação
  const existingSubscription = await DatabaseService.getSubscriptionByTransactionId(purchase.transaction)
  if (existingSubscription) {
    console.log('ℹ️ Assinatura já existe para esta transação:', purchase.transaction)
    return
  }

  // Verificar se usuário já existe
  let user = await DatabaseService.getUserByEmail(buyer.email)
  let password = ''
  let isNewUser = false

  if (!user) {
    // Criar novo usuário
    password = generateRandomPassword()
    const passwordHash = await hashPassword(password)
    
    user = await DatabaseService.createUser(buyer.email, passwordHash, buyer.name)
    if (!user) {
      throw new Error('Falha ao criar usuário')
    }
    isNewUser = true
    console.log('👤 Novo usuário criado:', user.email)
  } else {
    console.log('👤 Usuário existente encontrado:', user.email)
  }

  // Determinar tipo de plano
  const planType = determinePlanType(purchase.offer.code)
  const startDate = new Date()
  const endDate = calculateSubscriptionEndDate(planType, startDate)

  // Criar assinatura
  const subscription = await DatabaseService.createSubscription({
    user_id: user.id,
    hotmart_transaction_id: purchase.transaction,
    hotmart_subscriber_code: purchase.subscription?.subscriber_code,
    plan_type: planType,
    status: 'active',
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    amount: purchase.price.value,
    currency: purchase.price.currency_code,
    hotmart_data: webhookData
  })

  if (!subscription) {
    throw new Error('Falha ao criar assinatura')
  }

  console.log('📋 Assinatura criada:', subscription.id)

  // Enviar email de boas-vindas apenas para novos usuários
  if (isNewUser && password) {
    console.log('📧 Enviando email de boas-vindas...')
    const emailHTML = generateWelcomeEmailHTML(user.name, user.email, password)
    const emailSent = await sendEmail({
      to: user.email,
      subject: '🎉 Bem-vindo ao DDPlanner - Suas credenciais de acesso',
      html: emailHTML
    })

    if (emailSent) {
      console.log('✅ Email de boas-vindas processado para:', user.email)
    } else {
      console.error('❌ Falha ao processar email de boas-vindas para:', user.email)
    }
  }
}

async function handlePurchaseCancelled(webhookData: HotmartWebhookData) {
  const { data } = webhookData
  const { purchase } = data

  console.log('❌ Processando cancelamento/reembolso:', purchase.transaction)

  // Atualizar status da assinatura
  const status = mapHotmartStatus(purchase.status)
  const updated = await DatabaseService.updateSubscriptionStatus(
    purchase.transaction,
    status,
    new Date().toISOString() // Definir data de fim como agora
  )

  if (updated) {
    console.log(`📋 Assinatura ${purchase.transaction} atualizada para status: ${status}`)
    
    // Buscar usuário para enviar email
    const subscription = await DatabaseService.getSubscriptionByTransactionId(purchase.transaction)
    if (subscription) {
      const user = await DatabaseService.getUserById(subscription.user_id)
      if (user) {
        console.log('📧 Enviando email de cancelamento...')
        const emailHTML = generateSubscriptionCancelledEmailHTML(user.name)
        const emailSent = await sendEmail({
          to: user.email,
          subject: '😔 Assinatura Cancelada - DDPlanner',
          html: emailHTML
        })
        
        if (emailSent) {
          console.log('✅ Email de cancelamento processado para:', user.email)
        }
      }
    }
  } else {
    console.error('❌ Falha ao atualizar status da assinatura:', purchase.transaction)
  }
}

async function handleSubscriptionCancellation(webhookData: HotmartWebhookData) {
  const { data } = webhookData
  const { purchase } = data

  console.log('🔄 Processando cancelamento de assinatura:', purchase.subscription?.subscriber_code)

  // Para cancelamentos de assinatura, mantemos o acesso até o fim do período pago
  // Apenas marcamos como cancelada, mas não alteramos a data de fim
  const updated = await DatabaseService.updateSubscriptionStatus(
    purchase.transaction,
    'cancelled'
    // Não passamos endDate para manter o acesso até o fim do período
  )

  if (updated) {
    console.log(`📋 Assinatura ${purchase.transaction} marcada como cancelada`)
    
    // Enviar email de cancelamento
    const subscription = await DatabaseService.getSubscriptionByTransactionId(purchase.transaction)
    if (subscription) {
      const user = await DatabaseService.getUserById(subscription.user_id)
      if (user) {
        console.log('📧 Enviando email de cancelamento...')
        const emailHTML = generateSubscriptionCancelledEmailHTML(user.name)
        const emailSent = await sendEmail({
          to: user.email,
          subject: '😔 Assinatura Cancelada - DDPlanner',
          html: emailHTML
        })
        
        if (emailSent) {
          console.log('✅ Email de cancelamento processado para:', user.email)
        }
      }
    }
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}