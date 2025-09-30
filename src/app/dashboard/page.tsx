'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Target, 
  Calendar, 
  BookOpen, 
  Trophy, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Users,
  TrendingUp,
  Award,
  Star,
  Clock,
  BarChart3,
  LogOut,
  Settings,
  User,
  Plus,
  Play
} from "lucide-react"
import { StudyPlanStorage, StoredStudyPlan } from '@/lib/study-plan-storage'
import { PersistenceTest } from '@/lib/persistence-test'

export default function Dashboard() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [studyPlans, setStudyPlans] = useState<StoredStudyPlan[]>([])
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalHoursStudied: 0,
    totalSubjects: 0,
    averageProgress: 0
  })
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string
    type: 'created' | 'updated' | 'completed_task'
    planTitle: string
    timestamp: string
    description: string
  }>>([])

  // Função para recarregar todos os dados
  const reloadData = async () => {
    console.log('🔄 [DASHBOARD] Recarregando todos os dados...')
    if (typeof window !== 'undefined') {
      try {
        // Tentar carregar do Supabase primeiro
        const supabasePlans = await StudyPlanStorage.loadFromSupabase()
        const plans = supabasePlans.length > 0 ? supabasePlans : StudyPlanStorage.getAllPlans()
        
        const planStats = StudyPlanStorage.getStats()
        const activity = StudyPlanStorage.getRecentActivity()
        
        console.log('🔄 [DASHBOARD] Dados carregados:', {
          planos: plans.length,
          fonte: supabasePlans.length > 0 ? 'Supabase' : 'localStorage',
          stats: planStats,
          atividades: activity.length
        })
        
        setStudyPlans(plans)
        setStats(planStats)
        setRecentActivity(activity)
      } catch (error) {
        console.error('❌ [DASHBOARD] Erro ao carregar dados:', error)
        // Fallback para localStorage
        const plans = StudyPlanStorage.getAllPlans()
        const planStats = StudyPlanStorage.getStats()
        const activity = StudyPlanStorage.getRecentActivity()
        
        setStudyPlans(plans)
        setStats(planStats)
        setRecentActivity(activity)
      }
    }
  }

  // Sincronização automática em background
  const autoSync = async () => {
    try {
      console.log('🔄 [DASHBOARD] Iniciando sincronização automática...')
      await StudyPlanStorage.syncData()
      console.log('✅ [DASHBOARD] Sincronização automática concluída')
    } catch (error) {
      console.log('⚠️ [DASHBOARD] Sincronização automática falhou (normal se Supabase não configurado):', error)
    }
  }

  // Carregar dados do localStorage e inicializar sistema híbrido
  useEffect(() => {
    const initializeAndLoadData = async () => {
      try {
        // Inicializar sistema híbrido (localStorage + Supabase)
        await StudyPlanStorage.initialize()
        
        // Verificar integridade dos dados
        const isIntegrityOk = StudyPlanStorage.verifyDataIntegrity()
        if (!isIntegrityOk) {
          console.warn('⚠️ [DASHBOARD] Problemas de integridade detectados nos dados')
        }
        
        // Executar testes de persistência
        const testsOk = PersistenceTest.runAllTests()
        if (!testsOk) {
          console.warn('⚠️ [DASHBOARD] Alguns testes de persistência falharam')
        }
        
        // Sincronização automática em background
        autoSync()
        
        // Recarregar dados após inicialização
        await reloadData()
      } catch (error) {
        console.error('❌ [DASHBOARD] Erro na inicialização:', error)
        // Fallback para dados locais
        reloadData()
      }
    }
    
    initializeAndLoadData()
  }, [])

  // Sincronização automática periódica (a cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      autoSync()
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [])

  // Redirecionar para home se não estiver logado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleViewPlan = (planId: string) => {
    router.push(`/plano/${planId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return formatDate(dateString)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null // Será redirecionado pelo useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DDPlanner</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white hidden sm:block">Olá, {user.user_metadata?.name || user.email}</span>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Bem-vindo ao seu Dashboard!
          </h1>
          <p className="text-gray-300 text-base sm:text-lg">
            Gerencie seus planos de estudo e acompanhe seu progresso
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => router.push('/novo-plano')}>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Criar Novo Plano</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Comece um novo plano de estudos personalizado</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => {
                  // Scroll para a seção de estatísticas
                  document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' })
                }}>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Ver Progresso</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Acompanhe suas métricas e evolução</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer sm:col-span-2 md:col-span-1"
                onClick={() => {
                  // Scroll para a seção de configurações (perfil)
                  document.getElementById('profile-section')?.scrollIntoView({ behavior: 'smooth' })
                }}>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Configurações</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Personalize sua experiência</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div id="stats-section" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">Planos Ativos</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.totalPlans}</p>
                </div>
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">Horas Estudadas</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.totalHoursStudied}h</p>
                </div>
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">Disciplinas</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.totalSubjects}</p>
                </div>
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs sm:text-sm">Progresso</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.averageProgress}%</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Study Plans */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Planos de Estudo</CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                Seus planos ativos e recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studyPlans.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4 text-sm sm:text-base">Nenhum plano criado ainda</p>
                  <Button 
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-sm sm:text-base"
                    onClick={() => router.push('/novo-plano')}
                  >
                    Criar Primeiro Plano
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {studyPlans.map((plan) => (
                    <div key={plan.id} className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-white font-semibold text-sm sm:text-base leading-tight break-words">
                            {plan.title}
                          </h4>
                          <p className="text-gray-400 text-xs sm:text-sm mt-1">
                            Criado em {formatDate(plan.createdAt)} • {plan.totalDays} dias
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="border-cyan-500/50 text-cyan-300 text-xs">
                            {plan.concurso}
                          </Badge>
                          <Badge variant="outline" className="border-purple-500/50 text-purple-300 text-xs break-all">
                            {plan.cargo}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-xs sm:text-sm"
                            onClick={() => handleViewPlan(plan.id)}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Continuar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Atividade Recente</CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                Suas últimas ações no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-sm sm:text-base">Nenhuma atividade registrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        activity.type === 'created' ? 'bg-green-400' :
                        activity.type === 'updated' ? 'bg-blue-400' :
                        'bg-yellow-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm break-words">{activity.description}</p>
                        <p className="text-gray-400 text-xs">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Section */}
        <div id="profile-section" className="mt-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                <User className="w-5 h-5 mr-2" />
                Perfil do Usuário
              </CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                Informações da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-gray-300 text-sm">Nome</label>
                  <p className="text-white font-semibold text-sm sm:text-base break-words">{user.user_metadata?.name || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Email</label>
                  <p className="text-white font-semibold text-sm sm:text-base break-all">{user.email}</p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Membro desde</label>
                  <p className="text-white font-semibold text-sm sm:text-base">
                    {formatDate(user.created_at || new Date().toISOString())}
                  </p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Status</label>
                  <div className="mt-1">
                    <Badge className="bg-green-500 text-xs">Ativo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        {studyPlans.length === 0 && (
          <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border-cyan-500/20 backdrop-blur-sm mt-8">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mr-2" />
                <h3 className="text-lg sm:text-xl font-bold text-white">Primeiros Passos</h3>
              </div>
              <p className="text-gray-300 mb-6 text-sm sm:text-base">
                Comece sua jornada de estudos criando seu primeiro plano personalizado com nossa IA.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-sm sm:text-base"
                  onClick={() => router.push('/novo-plano')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Plano de Estudos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auto-sync Info */}
        <div className="mt-8">
          <Card className="bg-blue-500/10 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start sm:items-center">
                <CheckCircle className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="text-blue-300 font-semibold text-sm">Sistema de Persistência Ativo</p>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    Seus planos e progresso são salvos automaticamente no localStorage e sincronizados com o Supabase quando disponível. 
                    Todos os checkboxes marcados ficam permanentemente salvos na sua conta.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}