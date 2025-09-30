export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  hotmart_transaction_id?: string
  hotmart_subscriber_code?: string
  plan_type: 'monthly' | 'annual'
  status: 'active' | 'cancelled' | 'expired' | 'refunded'
  start_date: string
  end_date?: string
  amount?: number
  currency: string
  hotmart_data?: any
  created_at: string
  updated_at: string
}

export interface WebhookLog {
  id: string
  event_type: string
  transaction_id?: string
  subscriber_code?: string
  status?: string
  raw_data: any
  processed: boolean
  error_message?: string
  created_at: string
}

export interface HotmartWebhookData {
  event: string
  version: string
  data: {
    product: {
      id: number
      name: string
    }
    buyer: {
      email: string
      name: string
      checkout_phone?: string
    }
    purchase: {
      transaction: string
      status: string
      approved_date?: number
      price: {
        value: number
        currency_code: string
      }
      offer: {
        code: string
      }
      subscription?: {
        subscriber_code: string
        plan: {
          name: string
          id: number
        }
        status: string
        date_next_charge?: number
        charge_type: string
      }
    }
  }
}

export interface AuthContextType {
  user: User | null
  subscription: Subscription | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  checkSubscription: () => Promise<void>
}