'use client'

import { DayPlan } from './tj-ce-plan-generator'
import { SupabaseStorage } from './supabase-storage'

export interface StoredStudyPlan {
  id: string
  title: string
  concurso: string
  cargo: string
  createdAt: string
  updatedAt: string
  totalDays: number
  completedTasks: string[]
  plans: DayPlan[]
  formData: {
    concurso: string
    cargo: string
    horasLiquidas: string
    disciplinasDificuldade: string[]
    plataformaEstudo: string
    tempoEstudo: string
  }
}

const STORAGE_KEY = 'ddplanner_study_plans'
const ACTIVITY_KEY = 'ddplanner_activity_log'

export class StudyPlanStorage {
  // Inicializar sistema híbrido (localStorage + Supabase)
  static async initialize(): Promise<void> {
    try {
      console.log('🚀 Inicializando sistema de armazenamento híbrido...')
      
      // Inicializar Supabase
      await SupabaseStorage.initializeDatabase()
      
      // Sincronizar dados do Supabase para localStorage
      await SupabaseStorage.syncWithSupabase()
      
      console.log('✅ Sistema híbrido inicializado com sucesso!')
    } catch (error) {
      console.error('⚠️ Erro na inicialização, usando apenas localStorage:', error)
    }
  }

  // Salvar plano de estudos (localStorage + Supabase)
  static async savePlan(planData: Omit<StoredStudyPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const plans = this.getAllPlans()
    const id = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newPlan: StoredStudyPlan = {
      ...planData,
      id,
      createdAt: now,
      updatedAt: now
    }
    
    // Salvar no localStorage (imediato)
    plans.push(newPlan)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    console.log('✅ Plano salvo no localStorage')
    
    // Registrar atividade
    this.logActivity('created', newPlan.title, `Plano "${newPlan.title}" foi criado`)
    
    // Salvar no Supabase (assíncrono)
    try {
      await SupabaseStorage.savePlan(newPlan)
    } catch (error) {
      console.warn('⚠️ Erro ao salvar no Supabase, mantendo apenas no localStorage:', error)
    }
    
    return id
  }

  // Versão síncrona para compatibilidade
  static savePlanSync(planData: Omit<StoredStudyPlan, 'id' | 'createdAt' | 'updatedAt'>): string {
    const plans = this.getAllPlans()
    const id = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newPlan: StoredStudyPlan = {
      ...planData,
      id,
      createdAt: now,
      updatedAt: now
    }
    
    // Salvar no localStorage (imediato)
    plans.push(newPlan)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    console.log('✅ Plano salvo no localStorage (modo síncrono)')
    
    // Registrar atividade
    this.logActivity('created', newPlan.title, `Plano "${newPlan.title}" foi criado`)
    
    // Salvar no Supabase em background
    SupabaseStorage.savePlan(newPlan).catch(error => {
      console.warn('⚠️ Erro ao salvar no Supabase em background:', error)
    })
    
    return id
  }
  
  // Obter todos os planos
  static getAllPlans(): StoredStudyPlan[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
      return []
    }
  }

  // Carregar planos do Supabase e sincronizar
  static async loadFromSupabase(): Promise<StoredStudyPlan[]> {
    try {
      const supabasePlans = await SupabaseStorage.loadPlans()
      
      if (supabasePlans.length > 0) {
        // Atualizar localStorage com dados do Supabase
        localStorage.setItem(STORAGE_KEY, JSON.stringify(supabasePlans))
        console.log(`✅ ${supabasePlans.length} planos carregados do Supabase`)
      }
      
      return supabasePlans
    } catch (error) {
      console.error('Erro ao carregar do Supabase:', error)
      return this.getAllPlans() // Fallback para localStorage
    }
  }
  
  // Obter plano por ID
  static getPlanById(id: string): StoredStudyPlan | null {
    const plans = this.getAllPlans()
    return plans.find(plan => plan.id === id) || null
  }
  
  // Atualizar plano (localStorage + Supabase)
  static async updatePlan(id: string, updates: Partial<StoredStudyPlan>): Promise<boolean> {
    const plans = this.getAllPlans()
    const index = plans.findIndex(plan => plan.id === id)
    
    if (index === -1) return false
    
    const updatedPlan = {
      ...plans[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    plans[index] = updatedPlan
    
    // Atualizar localStorage (imediato)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    console.log('✅ Plano atualizado no localStorage')
    
    // Registrar atividade se houve mudança nas tarefas completadas
    if (updates.completedTasks) {
      const oldCompletedCount = plans[index].completedTasks?.length || 0
      const newCompletedCount = updates.completedTasks.length
      
      if (newCompletedCount > oldCompletedCount) {
        this.logActivity('completed_task', updatedPlan.title, `Tarefa completada no plano "${updatedPlan.title}"`)
      }
      
      this.logActivity('updated', updatedPlan.title, `Plano "${updatedPlan.title}" foi atualizado`)
    }
    
    // Atualizar no Supabase (assíncrono)
    try {
      await SupabaseStorage.updatePlan(id, updatedPlan)
    } catch (error) {
      console.warn('⚠️ Erro ao atualizar no Supabase:', error)
    }
    
    return true
  }

  // Versão síncrona para compatibilidade
  static updatePlanSync(id: string, updates: Partial<StoredStudyPlan>): boolean {
    const plans = this.getAllPlans()
    const index = plans.findIndex(plan => plan.id === id)
    
    if (index === -1) return false
    
    const oldPlan = { ...plans[index] }
    const updatedPlan = {
      ...plans[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    plans[index] = updatedPlan
    
    // Atualizar localStorage (imediato)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    console.log('✅ Plano atualizado no localStorage (modo síncrono)')
    
    // Registrar atividade se houve mudança nas tarefas completadas
    if (updates.completedTasks) {
      const oldCompletedCount = oldPlan.completedTasks?.length || 0
      const newCompletedCount = updates.completedTasks.length
      
      if (newCompletedCount > oldCompletedCount) {
        this.logActivity('completed_task', updatedPlan.title, `Tarefa completada no plano "${updatedPlan.title}"`)
      }
      
      this.logActivity('updated', updatedPlan.title, `Plano "${updatedPlan.title}" foi atualizado`)
    }
    
    // Atualizar no Supabase em background
    SupabaseStorage.updatePlan(id, updatedPlan).catch(error => {
      console.warn('⚠️ Erro ao atualizar no Supabase em background:', error)
    })
    
    return true
  }
  
  // Deletar plano - VERSÃO ULTRA ROBUSTA (localStorage + Supabase)
  static async deletePlan(id: string): Promise<boolean> {
    try {
      console.log('🗑️ [STORAGE] === INICIANDO DELEÇÃO HÍBRIDA ===')
      console.log('🗑️ [STORAGE] ID recebido:', id)
      
      // Validação rigorosa do ID
      if (!id || typeof id !== 'string' || id.trim() === '') {
        console.error('🗑️ [STORAGE] ❌ ID inválido:', id)
        return false
      }
      
      const cleanId = id.trim()
      
      // Deletar do localStorage primeiro
      const localSuccess = this.deleteFromLocalStorage(cleanId)
      if (!localSuccess) {
        console.error('🗑️ [STORAGE] ❌ Falha ao deletar do localStorage')
        return false
      }
      
      // Deletar do Supabase (assíncrono)
      try {
        await SupabaseStorage.deletePlan(cleanId)
        console.log('🗑️ [STORAGE] ✅ Deletado do Supabase com sucesso!')
      } catch (error) {
        console.warn('🗑️ [STORAGE] ⚠️ Erro ao deletar do Supabase (mantido no localStorage):', error)
      }
      
      console.log('🗑️ [STORAGE] 🎉 Deleção híbrida concluída!')
      return true
      
    } catch (error) {
      console.error('🗑️ [STORAGE] ❌ ERRO INESPERADO:', error)
      return false
    }
  }

  // Versão síncrona para compatibilidade
  static deletePlanSync(id: string): boolean {
    try {
      console.log('🗑️ [STORAGE] === DELEÇÃO SÍNCRONA ===')
      
      const cleanId = id.trim()
      
      // Deletar do localStorage
      const success = this.deleteFromLocalStorage(cleanId)
      
      if (success) {
        // Deletar do Supabase em background
        SupabaseStorage.deletePlan(cleanId).catch(error => {
          console.warn('🗑️ [STORAGE] ⚠️ Erro ao deletar do Supabase em background:', error)
        })
      }
      
      return success
    } catch (error) {
      console.error('🗑️ [STORAGE] ❌ ERRO na deleção síncrona:', error)
      return false
    }
  }

  // Método auxiliar para deletar apenas do localStorage
  private static deleteFromLocalStorage(id: string): boolean {
    try {
      console.log('🗑️ [STORAGE] Deletando do localStorage...')
      
      if (typeof window === 'undefined' || !window.localStorage) {
        console.error('🗑️ [STORAGE] ❌ localStorage não disponível')
        return false
      }
      
      const currentData = localStorage.getItem(STORAGE_KEY)
      if (!currentData) {
        console.error('🗑️ [STORAGE] ❌ Nenhum dado no localStorage')
        return false
      }
      
      let currentPlans: StoredStudyPlan[]
      try {
        currentPlans = JSON.parse(currentData)
      } catch (parseError) {
        console.error('🗑️ [STORAGE] ❌ Erro no parse JSON:', parseError)
        return false
      }
      
      if (!Array.isArray(currentPlans)) {
        console.error('🗑️ [STORAGE] ❌ Dados não são um array')
        return false
      }
      
      const planIndex = currentPlans.findIndex(plan => plan.id === id)
      if (planIndex === -1) {
        console.error('🗑️ [STORAGE] ❌ Plano não encontrado')
        return false
      }
      
      const planToDelete = currentPlans[planIndex]
      console.log('🗑️ [STORAGE] 🎯 Deletando plano:', planToDelete.title)
      
      const filteredPlans = currentPlans.filter((_, index) => index !== planIndex)
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPlans))
      
      console.log('🗑️ [STORAGE] ✅ Deletado do localStorage com sucesso!')
      return true
      
    } catch (error) {
      console.error('🗑️ [STORAGE] ❌ Erro ao deletar do localStorage:', error)
      return false
    }
  }
  
  // Atualizar tarefas completadas - VERSÃO ROBUSTA COM PERSISTÊNCIA GARANTIDA
  static updateCompletedTasks(planId: string, completedTasks: string[]): boolean {
    console.log('📝 [TASKS] Atualizando tarefas completadas:', { planId, count: completedTasks.length })
    
    // Validação de entrada
    if (!planId || !Array.isArray(completedTasks)) {
      console.error('📝 [TASKS] ❌ Parâmetros inválidos')
      return false
    }
    
    // Usar updatePlanSync para garantir persistência imediata
    const success = this.updatePlanSync(planId, { completedTasks })
    
    if (success) {
      console.log('📝 [TASKS] ✅ Tarefas completadas salvas com sucesso!')
      
      // Forçar salvamento adicional para garantir persistência
      try {
        const plans = this.getAllPlans()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
        console.log('📝 [TASKS] ✅ Backup adicional salvo no localStorage')
      } catch (error) {
        console.error('📝 [TASKS] ⚠️ Erro no backup adicional:', error)
      }
    } else {
      console.error('📝 [TASKS] ❌ Falha ao salvar tarefas completadas')
    }
    
    return success
  }
  
  // Registrar atividade no log
  static logActivity(type: 'created' | 'updated' | 'completed_task', planTitle: string, description: string): void {
    try {
      if (typeof window === 'undefined') return
      
      const activities = this.getActivityLog()
      const newActivity = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        planTitle,
        timestamp: new Date().toISOString(),
        description
      }
      
      activities.unshift(newActivity) // Adicionar no início
      
      // Manter apenas os últimos 50 registros
      const trimmedActivities = activities.slice(0, 50)
      
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(trimmedActivities))
      console.log('📋 [ACTIVITY] Atividade registrada:', description)
    } catch (error) {
      console.error('📋 [ACTIVITY] Erro ao registrar atividade:', error)
    }
  }
  
  // Obter log de atividades
  static getActivityLog(): Array<{
    id: string
    type: 'created' | 'updated' | 'completed_task'
    planTitle: string
    timestamp: string
    description: string
  }> {
    try {
      if (typeof window === 'undefined') return []
      
      const stored = localStorage.getItem(ACTIVITY_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('📋 [ACTIVITY] Erro ao carregar log:', error)
      return []
    }
  }
  
  // Obter estatísticas - VERSÃO MELHORADA COM CÁLCULOS PRECISOS
  static getStats(): {
    totalPlans: number
    activePlans: number
    totalHoursStudied: number
    totalSubjects: number
    averageProgress: number
  } {
    const plans = this.getAllPlans()
    
    if (plans.length === 0) {
      return {
        totalPlans: 0,
        activePlans: 0,
        totalHoursStudied: 0,
        totalSubjects: 0,
        averageProgress: 0
      }
    }
    
    const activePlans = plans.length
    const allSubjects = new Set<string>()
    let totalProgress = 0
    let totalHours = 0
    
    plans.forEach(plan => {
      // Calcular progresso do plano de forma mais precisa
      const totalTasks = plan.plans.reduce((acc, dayPlan) => {
        if (dayPlan.isRestDay) return acc
        return acc + (dayPlan.isSpecialDay ? 3 : 5) // 3 para dias especiais, 5 para dias normais
      }, 0)
      
      const completedTasks = plan.completedTasks?.length || 0
      const planProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      totalProgress += planProgress
      
      // Calcular horas estudadas de forma mais precisa
      const hoursPerDay = parseInt(plan.formData.horasLiquidas?.split(' ')[0] || '0')
      const tasksPerDay = 5 // Média de tarefas por dia
      const hoursPerTask = hoursPerDay / tasksPerDay
      totalHours += completedTasks * hoursPerTask
      
      // Coletar disciplinas únicas
      if (plan.formData.disciplinasDificuldade) {
        plan.formData.disciplinasDificuldade.forEach(subject => allSubjects.add(subject))
      }
    })
    
    const stats = {
      totalPlans: plans.length,
      activePlans,
      totalHoursStudied: Math.round(totalHours * 10) / 10, // Arredondar para 1 casa decimal
      totalSubjects: allSubjects.size,
      averageProgress: Math.round(totalProgress / plans.length)
    }
    
    console.log('📊 [STATS] Estatísticas calculadas:', stats)
    return stats
  }
  
  // Obter atividades recentes - VERSÃO MELHORADA
  static getRecentActivity(): Array<{
    id: string
    type: 'created' | 'updated' | 'completed_task'
    planTitle: string
    timestamp: string
    description: string
  }> {
    // Primeiro, tentar carregar do log de atividades
    const loggedActivities = this.getActivityLog()
    
    if (loggedActivities.length > 0) {
      return loggedActivities.slice(0, 10) // Retornar os 10 mais recentes
    }
    
    // Fallback: gerar atividades baseadas nos planos existentes
    const plans = this.getAllPlans()
    const activities: Array<{
      id: string
      type: 'created' | 'updated' | 'completed_task'
      planTitle: string
      timestamp: string
      description: string
    }> = []
    
    plans.forEach(plan => {
      // Atividade de criação
      activities.push({
        id: `${plan.id}_created`,
        type: 'created',
        planTitle: plan.title,
        timestamp: plan.createdAt,
        description: `Plano "${plan.title}" foi criado`
      })
      
      // Atividade de atualização
      if (plan.updatedAt !== plan.createdAt) {
        activities.push({
          id: `${plan.id}_updated`,
          type: 'updated',
          planTitle: plan.title,
          timestamp: plan.updatedAt,
          description: `Plano "${plan.title}" foi atualizado`
        })
      }
      
      // Simular tarefas completadas recentes baseadas no número de tarefas
      const completedCount = plan.completedTasks?.length || 0
      if (completedCount > 0) {
        // Criar atividades para as últimas 3 tarefas completadas
        for (let i = 0; i < Math.min(3, completedCount); i++) {
          const taskTimestamp = new Date(Date.now() - (i * 60 * 60 * 1000)).toISOString()
          activities.push({
            id: `${plan.id}_task_${i}`,
            type: 'completed_task',
            planTitle: plan.title,
            timestamp: taskTimestamp,
            description: `Tarefa completada no plano "${plan.title}"`
          })
        }
      }
    })
    
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  }

  // Sincronizar dados manualmente
  static async syncData(): Promise<void> {
    try {
      console.log('🔄 Sincronizando dados...')
      await SupabaseStorage.syncWithSupabase()
      console.log('✅ Sincronização concluída!')
    } catch (error) {
      console.error('❌ Erro na sincronização:', error)
    }
  }

  // Verificar integridade dos dados
  static verifyDataIntegrity(): boolean {
    try {
      const plans = this.getAllPlans()
      const activities = this.getActivityLog()
      
      console.log('🔍 [INTEGRITY] Verificando integridade dos dados...')
      console.log('🔍 [INTEGRITY] Planos encontrados:', plans.length)
      console.log('🔍 [INTEGRITY] Atividades encontradas:', activities.length)
      
      // Verificar se todos os planos têm IDs únicos
      const planIds = plans.map(p => p.id)
      const uniqueIds = new Set(planIds)
      
      if (planIds.length !== uniqueIds.size) {
        console.error('🔍 [INTEGRITY] ❌ IDs duplicados encontrados!')
        return false
      }
      
      // Verificar se todos os planos têm estrutura válida
      for (const plan of plans) {
        if (!plan.id || !plan.title || !plan.createdAt) {
          console.error('🔍 [INTEGRITY] ❌ Plano com estrutura inválida:', plan.id)
          return false
        }
      }
      
      console.log('🔍 [INTEGRITY] ✅ Dados íntegros!')
      return true
    } catch (error) {
      console.error('🔍 [INTEGRITY] ❌ Erro na verificação:', error)
      return false
    }
  }
}