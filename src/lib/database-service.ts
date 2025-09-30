import { createClient } from '@supabase/supabase-js'
import { User, Subscription, WebhookLog } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export class DatabaseService {
  // Usuários
  static async createUser(email: string, passwordHash: string, name: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          name
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar usuário:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      return null
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) return null
      return data
    } catch (error) {
      return null
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) return null
      return data
    } catch (error) {
      return null
    }
  }

  static async getUserWithPassword(email: string): Promise<(User & { password_hash: string }) | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*, password_hash')
        .eq('email', email)
        .single()

      if (error) return null
      return data
    } catch (error) {
      return null
    }
  }

  // Assinaturas
  static async createSubscription(subscriptionData: Partial<Subscription>): Promise<Subscription | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar assinatura:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao criar assinatura:', error)
      return null
    }
  }

  static async getActiveSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) return null
      return data
    } catch (error) {
      return null
    }
  }

  static async getSubscriptionByTransactionId(transactionId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('hotmart_transaction_id', transactionId)
        .single()

      if (error) return null
      return data
    } catch (error) {
      return null
    }
  }

  static async updateSubscriptionStatus(
    transactionId: string, 
    status: Subscription['status'],
    endDate?: string
  ): Promise<boolean> {
    try {
      const updateData: any = { status }
      if (endDate) updateData.end_date = endDate

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update(updateData)
        .eq('hotmart_transaction_id', transactionId)

      return !error
    } catch (error) {
      console.error('Erro ao atualizar status da assinatura:', error)
      return false
    }
  }

  static async getExpiredSubscriptions(): Promise<Subscription[]> {
    try {
      const now = new Date().toISOString()
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')
        .lt('end_date', now)

      if (error) return []
      return data || []
    } catch (error) {
      return []
    }
  }

  // Webhook Logs
  static async createWebhookLog(logData: Partial<WebhookLog>): Promise<WebhookLog | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('webhook_logs')
        .insert(logData)
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar log de webhook:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao criar log de webhook:', error)
      return null
    }
  }

  static async markWebhookLogAsProcessed(id: string, errorMessage?: string): Promise<boolean> {
    try {
      const updateData: any = { processed: true }
      if (errorMessage) updateData.error_message = errorMessage

      const { error } = await supabaseAdmin
        .from('webhook_logs')
        .update(updateData)
        .eq('id', id)

      return !error
    } catch (error) {
      console.error('Erro ao marcar log como processado:', error)
      return false
    }
  }

  // Limpeza e manutenção
  static async expireOldSubscriptions(): Promise<number> {
    try {
      const expiredSubscriptions = await this.getExpiredSubscriptions()
      
      for (const subscription of expiredSubscriptions) {
        await this.updateSubscriptionStatus(
          subscription.hotmart_transaction_id!,
          'expired'
        )
      }

      return expiredSubscriptions.length
    } catch (error) {
      console.error('Erro ao expirar assinaturas antigas:', error)
      return 0
    }
  }
}