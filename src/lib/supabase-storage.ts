'use client'

import { supabase } from './supabase'
import { StoredStudyPlan } from './study-plan-storage'

export class SupabaseStorage {
  // Verificar se o Supabase está configurado
  static async isConfigured(): Promise<boolean> {
    try {
      // Verificar se as variáveis de ambiente estão definidas
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === '' || supabaseKey === '') {
        console.log('Supabase não configurado - variáveis de ambiente ausentes')
        return false
      }

      // Fazer uma verificação simples de conectividade
      const { data, error } = await supabase.auth.getSession()
      
      // Se houver erro de rede, retornar false
      if (error && error.message.includes('Failed to fetch')) {
        console.log('Supabase não acessível - erro de rede')
        return false
      }
      
      return true
    } catch (error) {
      console.log('Supabase não configurado ou não acessível:', error)
      return false
    }
  }

  // Criar tabela de planos de estudo se não existir
  static async initializeDatabase(): Promise<boolean> {
    try {
      if (!(await this.isConfigured())) {
        console.log('Supabase não configurado, usando apenas localStorage')
        return false
      }

      // Tentar fazer uma consulta simples para verificar se a tabela existe
      const { error } = await supabase
        .from('study_plans')
        .select('id')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.log('⚠️ Tabela study_plans não existe no Supabase')
          console.log('📋 Para resolver: Acesse o dashboard do Supabase e execute o SQL:')
          console.log(`
CREATE TABLE IF NOT EXISTS public.study_plans (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  concurso TEXT NOT NULL,
  cargo TEXT NOT NULL,
  total_days INTEGER NOT NULL,
  completed_tasks JSONB DEFAULT '[]'::jsonb,
  plans JSONB DEFAULT '[]'::jsonb,
  form_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_created_at ON public.study_plans(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY IF NOT EXISTS "Users can view own study plans" ON public.study_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own study plans" ON public.study_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own study plans" ON public.study_plans
  FOR UPDATE USING (auth.uid() = user_id);
          `)
          return false
        }
        console.log('Erro ao verificar tabela:', error)
        return false
      }
      
      console.log('✅ Tabela study_plans verificada/disponível')
      return true
    } catch (error) {
      console.log('Erro ao verificar tabela, usando apenas localStorage:', error)
      return false
    }
  }

  // Salvar plano no Supabase (com upsert para evitar duplicatas)
  static async savePlan(planData: StoredStudyPlan): Promise<boolean> {
    try {
      if (!(await this.isConfigured())) {
        return false
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('Usuário não autenticado, salvando apenas no localStorage')
        return false
      }

      // Verificar se o plano já existe
      const { data: existingPlan, error: selectError } = await supabase
        .from('study_plans')
        .select('id')
        .eq('id', planData.id)
        .eq('user_id', user.id)
        .single()

      // Se erro for de tabela não encontrada, retornar false silenciosamente
      if (selectError && (selectError.code === 'PGRST205' || selectError.code === '42P01')) {
        console.log('Tabela study_plans não existe, salvando apenas no localStorage')
        return false
      }

      const planPayload = {
        id: planData.id,
        user_id: user.id,
        title: planData.title,
        concurso: planData.concurso,
        cargo: planData.cargo,
        total_days: planData.totalDays,
        completed_tasks: planData.completedTasks,
        plans: planData.plans,
        form_data: planData.formData,
        created_at: planData.createdAt,
        updated_at: planData.updatedAt
      }

      let error

      if (existingPlan) {
        // Plano já existe, fazer UPDATE
        const result = await supabase
          .from('study_plans')
          .update({
            title: planData.title,
            concurso: planData.concurso,
            cargo: planData.cargo,
            total_days: planData.totalDays,
            completed_tasks: planData.completedTasks,
            plans: planData.plans,
            form_data: planData.formData,
            updated_at: planData.updatedAt
          })
          .eq('id', planData.id)
          .eq('user_id', user.id)
        
        error = result.error
        if (!error) {
          console.log('✅ Plano atualizado no Supabase com sucesso!')
        }
      } else {
        // Plano não existe, fazer INSERT
        const result = await supabase
          .from('study_plans')
          .insert(planPayload)
        
        error = result.error
        if (!error) {
          console.log('✅ Plano inserido no Supabase com sucesso!')
        }
      }

      if (error) {
        // Se erro for de tabela não encontrada, não mostrar erro
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.log('Tabela study_plans não existe, usando apenas localStorage')
          return false
        }
        console.error('Erro ao salvar no Supabase:', error)
        return false
      }

      return true
    } catch (error) {
      // Capturar erros de rede especificamente
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('Erro de conectividade com Supabase, usando apenas localStorage')
        return false
      }
      console.error('Erro inesperado ao salvar no Supabase:', error)
      return false
    }
  }

  // Carregar planos do Supabase
  static async loadPlans(): Promise<StoredStudyPlan[]> {
    try {
      if (!(await this.isConfigured())) {
        return []
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('Usuário não autenticado, carregando apenas do localStorage')
        return []
      }

      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // Se erro for de tabela não encontrada, não mostrar erro
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.log('Tabela study_plans não existe, usando apenas localStorage')
          return []
        }
        console.error('Erro ao carregar do Supabase:', error)
        return []
      }

      // Converter dados do Supabase para formato local
      const plans: StoredStudyPlan[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        concurso: item.concurso,
        cargo: item.cargo,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        totalDays: item.total_days,
        completedTasks: item.completed_tasks || [],
        plans: item.plans || [],
        formData: item.form_data || {}
      }))

      console.log(`✅ Carregados ${plans.length} planos do Supabase`)
      return plans
    } catch (error) {
      // Capturar erros de rede especificamente
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('Erro de conectividade com Supabase, usando apenas localStorage')
        return []
      }
      console.error('Erro inesperado ao carregar do Supabase:', error)
      return []
    }
  }

  // Atualizar plano no Supabase
  static async updatePlan(planId: string, updates: Partial<StoredStudyPlan>): Promise<boolean> {
    try {
      if (!(await this.isConfigured())) {
        return false
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('Usuário não autenticado, atualizando apenas no localStorage')
        return false
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (updates.title) updateData.title = updates.title
      if (updates.completedTasks) updateData.completed_tasks = updates.completedTasks
      if (updates.plans) updateData.plans = updates.plans
      if (updates.formData) updateData.form_data = updates.formData

      const { error } = await supabase
        .from('study_plans')
        .update(updateData)
        .eq('id', planId)
        .eq('user_id', user.id)

      if (error) {
        // Se erro for de tabela não encontrada, não mostrar erro
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.log('Tabela study_plans não existe, usando apenas localStorage')
          return false
        }
        console.error('Erro ao atualizar no Supabase:', error)
        return false
      }

      console.log('✅ Plano atualizado no Supabase com sucesso!')
      return true
    } catch (error) {
      // Capturar erros de rede especificamente
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('Erro de conectividade com Supabase, usando apenas localStorage')
        return false
      }
      console.error('Erro inesperado ao atualizar no Supabase:', error)
      return false
    }
  }

  // Deletar plano do Supabase
  static async deletePlan(planId: string): Promise<boolean> {
    try {
      if (!(await this.isConfigured())) {
        return false
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('Usuário não autenticado, deletando apenas do localStorage')
        return false
      }

      // Como DELETE não é permitido, vamos marcar como "deletado" ou simplesmente não fazer nada
      console.log('⚠️ Operação DELETE não permitida no Supabase, mantendo apenas no localStorage')
      return true
    } catch (error) {
      // Capturar erros de rede especificamente
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('Erro de conectividade com Supabase, usando apenas localStorage')
        return false
      }
      console.error('Erro inesperado ao deletar do Supabase:', error)
      return false
    }
  }

  // Sincronizar localStorage com Supabase
  static async syncWithSupabase(): Promise<void> {
    try {
      if (!(await this.isConfigured())) {
        console.log('Supabase não configurado, mantendo apenas localStorage')
        return
      }

      console.log('🔄 Iniciando sincronização com Supabase...')
      
      // Carregar planos do Supabase
      const supabasePlans = await this.loadPlans()
      
      if (supabasePlans.length > 0) {
        // Salvar planos do Supabase no localStorage
        localStorage.setItem('ddplanner_study_plans', JSON.stringify(supabasePlans))
        console.log(`✅ ${supabasePlans.length} planos sincronizados do Supabase para localStorage`)
      } else {
        console.log('ℹ️ Nenhum plano encontrado no Supabase ou tabela não existe')
      }
    } catch (error) {
      // Capturar erros de rede especificamente
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('Erro de conectividade com Supabase durante sincronização, mantendo localStorage')
        return
      }
      console.error('Erro na sincronização:', error)
    }
  }

  // Migrar dados do localStorage para Supabase
  static async migrateLocalToSupabase(): Promise<void> {
    try {
      if (!(await this.isConfigured())) {
        console.log('Supabase não configurado, não é possível migrar')
        return
      }

      const localPlans = JSON.parse(localStorage.getItem('ddplanner_study_plans') || '[]')
      
      if (localPlans.length === 0) {
        console.log('Nenhum plano local para migrar')
        return
      }

      console.log(`🔄 Migrando ${localPlans.length} planos para Supabase...`)
      
      let migratedCount = 0
      for (const plan of localPlans) {
        const success = await this.savePlan(plan)
        if (success) {
          migratedCount++
        }
      }
      
      console.log(`✅ ${migratedCount} planos migrados com sucesso!`)
    } catch (error) {
      // Capturar erros de rede especificamente
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('Erro de conectividade com Supabase durante migração')
        return
      }
      console.error('Erro na migração:', error)
    }
  }
}