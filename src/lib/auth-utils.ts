import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto-js'

// Configurações
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key-32-chars-long'

// Hash de senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Gerar JWT token
export function generateJWT(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Verificar JWT token
export function verifyJWT(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
  } catch {
    return null
  }
}

// Gerar senha aleatória
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// Criptografar dados sensíveis
export function encrypt(text: string): string {
  return crypto.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

// Descriptografar dados sensíveis
export function decrypt(encryptedText: string): string {
  const bytes = crypto.AES.decrypt(encryptedText, ENCRYPTION_KEY)
  return bytes.toString(crypto.enc.Utf8)
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Calcular data de expiração da assinatura
export function calculateSubscriptionEndDate(planType: 'monthly' | 'annual', startDate: Date = new Date()): Date {
  const endDate = new Date(startDate)
  if (planType === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1)
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1)
  }
  return endDate
}

// Verificar se assinatura está ativa
export function isSubscriptionActive(subscription: any): boolean {
  if (!subscription) return false
  if (subscription.status !== 'active') return false
  if (!subscription.end_date) return true // Assinatura sem data de fim (vitalícia)
  
  const now = new Date()
  const endDate = new Date(subscription.end_date)
  return now <= endDate
}

// Mapear status da Hotmart para nosso sistema
export function mapHotmartStatus(hotmartStatus: string): 'active' | 'cancelled' | 'expired' | 'refunded' {
  switch (hotmartStatus.toLowerCase()) {
    case 'approved':
    case 'complete':
    case 'active':
      return 'active'
    case 'cancelled':
    case 'canceled':
      return 'cancelled'
    case 'refunded':
    case 'chargeback':
      return 'refunded'
    case 'expired':
      return 'expired'
    default:
      return 'active'
  }
}

// Determinar tipo de plano baseado no código da oferta
export function determinePlanType(offerCode: string): 'monthly' | 'annual' {
  // fshe1odk = mensal, kupajgzs = anual
  if (offerCode === 'kupajgzs') return 'annual'
  return 'monthly'
}

// Formatar moeda brasileira
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

// Validar dados do webhook Hotmart
export function validateHotmartWebhook(data: any): boolean {
  return !!(
    data &&
    data.event &&
    data.data &&
    data.data.buyer &&
    data.data.buyer.email &&
    data.data.purchase &&
    data.data.purchase.transaction
  )
}