'use client'

import { StudyPlanStorage } from './study-plan-storage'

export class PersistenceTest {
  // Testar se os planos estão sendo salvos corretamente
  static testPlanPersistence(): boolean {
    try {
      console.log('🧪 [TEST] Iniciando teste de persistência de planos...')
      
      const plans = StudyPlanStorage.getAllPlans()
      console.log('🧪 [TEST] Planos encontrados:', plans.length)
      
      // Verificar se cada plano tem estrutura válida
      for (const plan of plans) {
        if (!plan.id || !plan.title || !plan.createdAt || !Array.isArray(plan.completedTasks)) {
          console.error('🧪 [TEST] ❌ Plano com estrutura inválida:', plan.id)
          return false
        }
      }
      
      console.log('🧪 [TEST] ✅ Teste de persistência de planos passou!')
      return true
    } catch (error) {
      console.error('🧪 [TEST] ❌ Erro no teste de persistência:', error)
      return false
    }
  }

  // Testar se as tarefas completadas estão sendo salvas
  static testTaskPersistence(planId: string): boolean {
    try {
      console.log('🧪 [TEST] Testando persistência de tarefas para plano:', planId)
      
      const plan = StudyPlanStorage.getPlanById(planId)
      if (!plan) {
        console.error('🧪 [TEST] ❌ Plano não encontrado:', planId)
        return false
      }
      
      console.log('🧪 [TEST] Tarefas completadas encontradas:', plan.completedTasks.length)
      
      // Verificar se completedTasks é um array válido
      if (!Array.isArray(plan.completedTasks)) {
        console.error('🧪 [TEST] ❌ completedTasks não é um array válido')
        return false
      }
      
      console.log('🧪 [TEST] ✅ Teste de persistência de tarefas passou!')
      return true
    } catch (error) {
      console.error('🧪 [TEST] ❌ Erro no teste de tarefas:', error)
      return false
    }
  }

  // Testar se as estatísticas estão sendo calculadas corretamente
  static testStatsCalculation(): boolean {
    try {
      console.log('🧪 [TEST] Testando cálculo de estatísticas...')
      
      const stats = StudyPlanStorage.getStats()
      console.log('🧪 [TEST] Estatísticas calculadas:', stats)
      
      // Verificar se as estatísticas têm valores válidos
      if (typeof stats.totalPlans !== 'number' || 
          typeof stats.totalHoursStudied !== 'number' ||
          typeof stats.totalSubjects !== 'number' ||
          typeof stats.averageProgress !== 'number') {
        console.error('🧪 [TEST] ❌ Estatísticas com tipos inválidos')
        return false
      }
      
      console.log('🧪 [TEST] ✅ Teste de estatísticas passou!')
      return true
    } catch (error) {
      console.error('🧪 [TEST] ❌ Erro no teste de estatísticas:', error)
      return false
    }
  }

  // Testar se as atividades recentes estão sendo registradas
  static testActivityLog(): boolean {
    try {
      console.log('🧪 [TEST] Testando log de atividades...')
      
      const activities = StudyPlanStorage.getRecentActivity()
      console.log('🧪 [TEST] Atividades encontradas:', activities.length)
      
      // Verificar se as atividades têm estrutura válida
      for (const activity of activities) {
        if (!activity.id || !activity.type || !activity.timestamp || !activity.description) {
          console.error('🧪 [TEST] ❌ Atividade com estrutura inválida:', activity.id)
          return false
        }
      }
      
      console.log('🧪 [TEST] ✅ Teste de log de atividades passou!')
      return true
    } catch (error) {
      console.error('🧪 [TEST] ❌ Erro no teste de atividades:', error)
      return false
    }
  }

  // Executar todos os testes
  static runAllTests(planId?: string): boolean {
    console.log('🧪 [TEST] === INICIANDO BATERIA DE TESTES DE PERSISTÊNCIA ===')
    
    const results = {
      plans: this.testPlanPersistence(),
      tasks: planId ? this.testTaskPersistence(planId) : true,
      stats: this.testStatsCalculation(),
      activities: this.testActivityLog()
    }
    
    const allPassed = Object.values(results).every(result => result === true)
    
    console.log('🧪 [TEST] === RESULTADOS DOS TESTES ===')
    console.log('🧪 [TEST] Planos:', results.plans ? '✅' : '❌')
    console.log('🧪 [TEST] Tarefas:', results.tasks ? '✅' : '❌')
    console.log('🧪 [TEST] Estatísticas:', results.stats ? '✅' : '❌')
    console.log('🧪 [TEST] Atividades:', results.activities ? '✅' : '❌')
    console.log('🧪 [TEST] === RESULTADO GERAL:', allPassed ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM', '===')
    
    return allPassed
  }

  // Simular uso da aplicação para testar persistência
  static simulateUsage(): void {
    console.log('🧪 [SIMULATION] Simulando uso da aplicação...')
    
    const plans = StudyPlanStorage.getAllPlans()
    if (plans.length === 0) {
      console.log('🧪 [SIMULATION] Nenhum plano encontrado para simular')
      return
    }
    
    const firstPlan = plans[0]
    console.log('🧪 [SIMULATION] Simulando marcação de tarefa no plano:', firstPlan.title)
    
    // Simular marcação de uma tarefa
    const testTaskId = `test_task_${Date.now()}`
    const currentTasks = [...firstPlan.completedTasks, testTaskId]
    
    const success = StudyPlanStorage.updateCompletedTasks(firstPlan.id, currentTasks)
    
    if (success) {
      console.log('🧪 [SIMULATION] ✅ Simulação de marcação de tarefa bem-sucedida!')
      
      // Verificar se foi salvo corretamente
      setTimeout(() => {
        const updatedPlan = StudyPlanStorage.getPlanById(firstPlan.id)
        if (updatedPlan && updatedPlan.completedTasks.includes(testTaskId)) {
          console.log('🧪 [SIMULATION] ✅ Tarefa persistida com sucesso!')
          
          // Remover a tarefa de teste
          const cleanTasks = updatedPlan.completedTasks.filter(task => task !== testTaskId)
          StudyPlanStorage.updateCompletedTasks(firstPlan.id, cleanTasks)
          console.log('🧪 [SIMULATION] 🧹 Tarefa de teste removida')
        } else {
          console.error('🧪 [SIMULATION] ❌ Tarefa não foi persistida!')
        }
      }, 1000)
    } else {
      console.error('🧪 [SIMULATION] ❌ Falha na simulação de marcação de tarefa!')
    }
  }
}