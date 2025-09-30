'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Target, 
  ExternalLink,
  Coffee,
  Trophy,
  Zap,
  ArrowRight,
  ArrowLeft,
  Home,
  Star,
  Sparkles,
  Award,
  List,
  ChevronDown,
  ChevronUp,
  Flame,
  Brain,
  AlertTriangle
} from "lucide-react"
import { DayPlan, formatTimeMinutes, getTotalDailyTime, getWeekProgress } from '@/lib/tj-ce-plan-generator'
import { StudyPlanStorage } from '@/lib/study-plan-storage'

interface StudyPlanViewProps {
  plans: DayPlan[]
  planId?: string
  onGoBack: () => void
  onGoHome: () => void
}

export default function StudyPlanView({ plans, planId, onGoBack, onGoHome }: StudyPlanViewProps) {
  const [currentWeek, setCurrentWeek] = useState(1)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  
  // Carregar tarefas completadas do localStorage se planId existir
  useEffect(() => {
    if (planId) {
      const storedPlan = StudyPlanStorage.getPlanById(planId)
      if (storedPlan) {
        setCompletedTasks(new Set(storedPlan.completedTasks))
      }
    }
  }, [planId])
  
  const totalWeeks = Math.ceil(plans.length / 7)
  const weekStart = (currentWeek - 1) * 7
  const weekEnd = Math.min(currentWeek * 7, plans.length)
  const currentWeekPlans = plans.slice(weekStart, weekEnd)
  
  const toggleTask = (taskId: string) => {
    console.log('🎯 [CHECKBOX] Toggling task:', taskId)
    
    const newCompleted = new Set(completedTasks)
    const wasCompleted = newCompleted.has(taskId)
    
    if (wasCompleted) {
      newCompleted.delete(taskId)
      console.log('🎯 [CHECKBOX] Desmarcando tarefa:', taskId)
      // Remover da lista de recentemente completadas
      setRecentlyCompleted(prev => {
        const updated = new Set(prev)
        updated.delete(taskId)
        return updated
      })
    } else {
      newCompleted.add(taskId)
      console.log('🎯 [CHECKBOX] Marcando tarefa como completa:', taskId)
      // Adicionar à lista de recentemente completadas
      setRecentlyCompleted(prev => new Set(prev).add(taskId))
      
      // Remover da lista de recentemente completadas após 3 segundos
      setTimeout(() => {
        setRecentlyCompleted(prev => {
          const updated = new Set(prev)
          updated.delete(taskId)
          return updated
        })
      }, 3000)
    }
    
    // Atualizar estado local imediatamente
    setCompletedTasks(newCompleted)
    
    // Salvar no storage de forma robusta
    if (planId) {
      const completedArray = Array.from(newCompleted)
      console.log('🎯 [CHECKBOX] Salvando no storage:', { planId, count: completedArray.length })
      
      // Salvar imediatamente
      const success = StudyPlanStorage.updateCompletedTasks(planId, completedArray)
      
      if (success) {
        console.log('🎯 [CHECKBOX] ✅ Tarefa salva com sucesso!')
      } else {
        console.error('🎯 [CHECKBOX] ❌ Erro ao salvar tarefa!')
        // Reverter estado em caso de erro
        setCompletedTasks(completedTasks)
      }
      
      // Verificação adicional após 1 segundo
      setTimeout(() => {
        const storedPlan = StudyPlanStorage.getPlanById(planId)
        if (storedPlan) {
          const storedCompleted = new Set(storedPlan.completedTasks)
          if (storedCompleted.has(taskId) !== newCompleted.has(taskId)) {
            console.warn('🎯 [CHECKBOX] ⚠️ Inconsistência detectada, tentando salvar novamente...')
            StudyPlanStorage.updateCompletedTasks(planId, Array.from(newCompleted))
          } else {
            console.log('🎯 [CHECKBOX] ✅ Verificação de consistência passou!')
          }
        }
      }, 1000)
    }
  }

  const toggleTopics = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }
  
  const getTaskId = (day: number, taskType: string) => `${day}-${taskType}`
  
  const getCompletionRate = () => {
    const totalTasks = plans.reduce((acc, plan) => {
      if (plan.isRestDay) return acc
      return acc + (plan.isSpecialDay ? 3 : 5) // 3 para dias especiais, 5 para dias normais
    }, 0)
    
    return totalTasks > 0 ? (completedTasks.size / totalTasks) * 100 : 0
  }

  // Função para verificar se é semana final
  const isFinalWeek = (dayNumber: number) => {
    return dayNumber > plans.length - 7
  }

  // Função para abrir questões sem causar problemas de navegação
  const handleQuestionsClick = (link: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    // Abrir em nova aba de forma mais segura
    const newWindow = window.open(link, '_blank', 'noopener,noreferrer')
    if (newWindow) {
      newWindow.focus()
    }
  }

  // Componente de Checkbox Gamificado
  const GamifiedCheckbox = ({ taskId, children, isCompleted, onToggle }: {
    taskId: string
    children: React.ReactNode
    isCompleted: boolean
    onToggle: () => void
  }) => {
    const isRecentlyCompleted = recentlyCompleted.has(taskId)
    
    return (
      <div 
        className={`
          flex items-center space-x-3 p-4 rounded-xl border transition-all duration-300 cursor-pointer
          ${isCompleted 
            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40 shadow-lg shadow-green-500/10' 
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }
          ${isRecentlyCompleted ? 'animate-pulse ring-2 ring-green-400/50' : ''}
        `}
        onClick={onToggle}
      >
        <div className="relative">
          <Checkbox 
            id={taskId}
            checked={isCompleted}
            onCheckedChange={onToggle}
            className={`
              w-6 h-6 transition-all duration-300
              ${isCompleted 
                ? 'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500' 
                : 'border-white/30 hover:border-white/50'
              }
            `}
          />
          {isCompleted && (
            <div className="absolute -top-1 -right-1">
              <div className={`
                w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center
                ${isRecentlyCompleted ? 'animate-bounce' : ''}
              `}>
                <Star className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          {children}
        </div>
        
        {isCompleted && (
          <div className="flex items-center space-x-1">
            <CheckCircle2 className={`
              w-5 h-5 text-green-400 
              ${isRecentlyCompleted ? 'animate-spin' : ''}
            `} />
            {isRecentlyCompleted && (
              <div className="flex items-center space-x-1 text-green-400 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">+10 XP</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Componente para mostrar tópicos de uma disciplina
  const TopicsSection = ({ topics, subjectName, day }: {
    topics: string[]
    subjectName: string
    day: number
  }) => {
    if (!topics || topics.length === 0) return null

    const topicId = `${day}-${subjectName}-topics`
    const isExpanded = expandedTopics.has(topicId)

    return (
      <div className="mt-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 p-2 h-auto"
          onClick={(e) => {
            e.stopPropagation()
            toggleTopics(topicId)
          }}
        >
          <List className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {topics.length} tópico{topics.length > 1 ? 's' : ''} para estudar
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </Button>
        
        {isExpanded && (
          <div className="mt-2 ml-4 space-y-2">
            {topics.map((topic, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-300 text-sm leading-relaxed">{topic}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  const renderDayCard = (dayPlan: DayPlan) => {
    const totalTime = getTotalDailyTime(dayPlan)
    const isToday = dayPlan.day === 1 // Simular que hoje é o primeiro dia
    const isInFinalWeek = isFinalWeek(dayPlan.day)
    const isReviewDay = dayPlan.isReviewDay
    
    if (dayPlan.isRestDay) {
      return (
        <Card key={dayPlan.day} className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center">
                <Coffee className="w-5 h-5 mr-2 text-green-400" />
                Dia {dayPlan.day}
              </CardTitle>
              <Badge variant="outline" className="border-green-500/50 text-green-300">
                Descanso
              </Badge>
            </div>
            <CardDescription className="text-gray-300">
              {dayPlan.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Dia de Descanso Total</h3>
              <p className="text-gray-300 text-sm">
                {dayPlan.specialInstructions}
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }
    
    // Calcular progresso do dia
    const dayTasks = [
      getTaskId(dayPlan.day, 'subject1'),
      getTaskId(dayPlan.day, 'subject2'),
      getTaskId(dayPlan.day, 'questions'),
      getTaskId(dayPlan.day, 'review'),
      getTaskId(dayPlan.day, 'legal')
    ]
    const completedDayTasks = dayTasks.filter(taskId => completedTasks.has(taskId)).length
    const dayProgress = (completedDayTasks / dayTasks.length) * 100
    
    // Definir estilo do card baseado no tipo de dia
    let cardClassName = 'bg-white/5 border-white/10'
    
    if (isToday) {
      cardClassName = 'ring-2 ring-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-purple-500/10'
    } else if (isReviewDay && isInFinalWeek) {
      cardClassName = 'ring-2 ring-red-500/50 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20'
    }
    
    return (
      <Card key={dayPlan.day} className={cardClassName}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
              Dia {dayPlan.day}
              {isToday && <Badge className="ml-2 bg-cyan-500">Hoje</Badge>}
              {isReviewDay && isInFinalWeek && (
                <Badge className="ml-2 bg-gradient-to-r from-red-500 to-orange-500 animate-pulse">
                  <Flame className="w-3 h-3 mr-1" />
                  REVISÃO INTENSIVA
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {dayPlan.isSpecialDay && !isReviewDay && (
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-300">
                  Especial
                </Badge>
              )}
              <Badge variant="outline" className="border-white/20 text-gray-300">
                <Clock className="w-3 h-3 mr-1" />
                {formatTimeMinutes(totalTime)}
              </Badge>
            </div>
          </div>
          <CardDescription className="text-gray-300">
            {dayPlan.date} • Semana {Math.ceil(dayPlan.day / 7)}
            {isInFinalWeek && (
              <span className="ml-2 text-red-300 font-semibold">
                • SEMANA FINAL
              </span>
            )}
          </CardDescription>
          
          {/* Progresso do Dia */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">Progresso do Dia</span>
              <span className="text-gray-300 text-xs">{Math.round(dayProgress)}%</span>
            </div>
            <Progress value={dayProgress} className="h-2" />
            {dayProgress === 100 && (
              <div className="flex items-center justify-center mt-2 text-green-400">
                <Award className="w-4 h-4 mr-1" />
                <span className="text-sm font-semibold">Dia Completo!</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Alerta para dias de revisão intensiva */}
          {isReviewDay && isInFinalWeek && (
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Brain className="w-6 h-6 text-red-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-red-300 font-semibold mb-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    REVISÃO INTENSIVA - SEMANA FINAL
                  </h4>
                  <p className="text-red-200 text-sm leading-relaxed">
                    Este é um dia de revisão intensiva dos assuntos mais importantes! 
                    Foque nos tópicos prioritários e faça mais questões para garantir maior assertividade na prova.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Disciplinas */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-purple-400" />
              Disciplinas do Dia
              {isReviewDay && isInFinalWeek && (
                <Badge className="ml-2 bg-red-500/20 text-red-300 border-red-500/30">
                  Revisão Prioritária
                </Badge>
              )}
            </h4>
            
            <div className="space-y-3">
              {/* Assunto 1 */}
              <GamifiedCheckbox
                taskId={getTaskId(dayPlan.day, 'subject1')}
                isCompleted={completedTasks.has(getTaskId(dayPlan.day, 'subject1'))}
                onToggle={() => toggleTask(getTaskId(dayPlan.day, 'subject1'))}
              >
                <div>
                  <p className={`font-medium ${isReviewDay && isInFinalWeek ? 'text-red-200' : 'text-white'}`}>
                    {dayPlan.subjects.subject1}
                    {isReviewDay && isInFinalWeek && (
                      <span className="ml-2 text-red-400 text-sm">(REVISÃO)</span>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">{formatTimeMinutes(dayPlan.subjects.time1)}</p>
                  <TopicsSection 
                    topics={dayPlan.subjects.topics1 || []} 
                    subjectName={dayPlan.subjects.subject1}
                    day={dayPlan.day}
                  />
                </div>
              </GamifiedCheckbox>
              
              {/* Assunto 2 */}
              <GamifiedCheckbox
                taskId={getTaskId(dayPlan.day, 'subject2')}
                isCompleted={completedTasks.has(getTaskId(dayPlan.day, 'subject2'))}
                onToggle={() => toggleTask(getTaskId(dayPlan.day, 'subject2'))}
              >
                <div>
                  <p className={`font-medium ${isReviewDay && isInFinalWeek ? 'text-red-200' : 'text-white'}`}>
                    {dayPlan.subjects.subject2}
                    {isReviewDay && isInFinalWeek && (
                      <span className="ml-2 text-red-400 text-sm">(REVISÃO)</span>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">{formatTimeMinutes(dayPlan.subjects.time2)}</p>
                  <TopicsSection 
                    topics={dayPlan.subjects.topics2 || []} 
                    subjectName={dayPlan.subjects.subject2}
                    day={dayPlan.day}
                  />
                </div>
              </GamifiedCheckbox>
            </div>
          </div>
          
          {/* Atividades */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center">
              <Target className="w-4 h-4 mr-2 text-orange-400" />
              Atividades Complementares
              {isReviewDay && isInFinalWeek && (
                <Badge className="ml-2 bg-orange-500/20 text-orange-300 border-orange-500/30">
                  Intensificadas
                </Badge>
              )}
            </h4>
            
            <div className="space-y-3">
              {/* Questões */}
              <GamifiedCheckbox
                taskId={getTaskId(dayPlan.day, 'questions')}
                isCompleted={completedTasks.has(getTaskId(dayPlan.day, 'questions'))}
                onToggle={() => toggleTask(getTaskId(dayPlan.day, 'questions'))}
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className={`font-medium ${isReviewDay && isInFinalWeek ? 'text-orange-200' : 'text-white'}`}>
                      {dayPlan.activities.questions.description}
                    </p>
                    <p className="text-gray-400 text-sm">{formatTimeMinutes(dayPlan.activities.questions.time)}</p>
                  </div>
                  {dayPlan.activities.questions.link && dayPlan.activities.questions.questionsCount > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 ml-2 ${
                        isReviewDay && isInFinalWeek ? 'animate-pulse border-orange-500/50 text-orange-300 hover:bg-orange-500/10' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuestionsClick(dayPlan.activities.questions.link!, e)
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Questões
                      {isReviewDay && isInFinalWeek && (
                        <Flame className="w-3 h-3 ml-1" />
                      )}
                    </Button>
                  )}
                </div>
              </GamifiedCheckbox>
              
              {/* Revisão */}
              <GamifiedCheckbox
                taskId={getTaskId(dayPlan.day, 'review')}
                isCompleted={completedTasks.has(getTaskId(dayPlan.day, 'review'))}
                onToggle={() => toggleTask(getTaskId(dayPlan.day, 'review'))}
              >
                <div>
                  <p className={`font-medium ${isReviewDay && isInFinalWeek ? 'text-orange-200' : 'text-white'}`}>
                    {dayPlan.activities.review.description}
                  </p>
                  <p className="text-gray-400 text-sm">{formatTimeMinutes(dayPlan.activities.review.time)}</p>
                </div>
              </GamifiedCheckbox>
              
              {/* Lei Seca */}
              <GamifiedCheckbox
                taskId={getTaskId(dayPlan.day, 'legal')}
                isCompleted={completedTasks.has(getTaskId(dayPlan.day, 'legal'))}
                onToggle={() => toggleTask(getTaskId(dayPlan.day, 'legal'))}
              >
                <div>
                  <p className={`font-medium ${isReviewDay && isInFinalWeek ? 'text-orange-200' : 'text-white'}`}>
                    {dayPlan.activities.legalStudy.description}
                  </p>
                  <p className="text-gray-400 text-sm">{formatTimeMinutes(dayPlan.activities.legalStudy.time)}</p>
                </div>
              </GamifiedCheckbox>
            </div>
          </div>
          
          {/* Instruções Especiais */}
          {dayPlan.specialInstructions && (
            <div className={`border rounded-lg p-3 ${
              isReviewDay && isInFinalWeek 
                ? 'bg-red-500/10 border-red-500/20' 
                : 'bg-yellow-500/10 border-yellow-500/20'
            }`}>
              <div className="flex items-start space-x-2">
                <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isReviewDay && isInFinalWeek ? 'text-red-400' : 'text-yellow-400'
                }`} />
                <p className={`text-sm ${
                  isReviewDay && isInFinalWeek ? 'text-red-200' : 'text-yellow-200'
                }`}>
                  {dayPlan.specialInstructions}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Seu Plano de Estudos</h1>
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600">
                TJ-CE
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-white/5"
                onClick={onGoBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-white/5"
                onClick={onGoHome}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
          
          {/* Mensagem Motivacional */}
          <div className="mt-4 mb-4">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-yellow-300 font-semibold">Dica de Ouro</span>
              </div>
              <p className="text-yellow-100 text-sm leading-relaxed">
                Siga o seu plano a risca para uma maior chance de aprovação, esse é o diferencial dos nossos alunos aprovados.
              </p>
            </div>
          </div>
          
          {/* Progress Global */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Progresso Geral</span>
              <span className="text-gray-300 text-sm">{Math.round(getCompletionRate())}% concluído</span>
            </div>
            <Progress value={getCompletionRate()} className="h-2" />
          </div>
        </div>
      </header>
      
      {/* Week Navigation */}
      <div className="bg-black/20 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-white font-semibold">Semana {currentWeek}</h2>
              <Badge variant="outline" className="border-white/20 text-gray-300">
                Dias {weekStart + 1} - {weekEnd}
              </Badge>
              {/* Indicador de semana final */}
              {currentWeekPlans.some(plan => isFinalWeek(plan.day)) && (
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 animate-pulse">
                  <Flame className="w-3 h-3 mr-1" />
                  SEMANA FINAL
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-white/5"
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek === 1}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-gray-300 text-sm px-2">
                {currentWeek} de {totalWeeks}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-white/5"
                onClick={() => setCurrentWeek(Math.min(totalWeeks, currentWeek + 1))}
                disabled={currentWeek === totalWeeks}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Study Plan Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentWeekPlans.map(renderDayCard)}
        </div>
        
        {/* Week Summary */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Resumo da Semana {currentWeek}
                {currentWeekPlans.some(plan => isFinalWeek(plan.day)) && (
                  <Badge className="ml-2 bg-gradient-to-r from-red-500 to-orange-500">
                    SEMANA FINAL
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-cyan-400">{currentWeekPlans.length}</p>
                  <p className="text-gray-300 text-sm">Dias</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">
                    {Math.round(currentWeekPlans.reduce((acc, plan) => acc + getTotalDailyTime(plan), 0) / 60)}h
                  </p>
                  <p className="text-gray-300 text-sm">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {currentWeekPlans.filter(plan => !plan.isRestDay && !plan.isSpecialDay).length}
                  </p>
                  <p className="text-gray-300 text-sm">Dias Normais</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {currentWeekPlans.filter(plan => plan.isSpecialDay || plan.isRestDay).length}
                  </p>
                  <p className="text-gray-300 text-sm">Dias Especiais</p>
                </div>
              </div>
              
              {/* Alerta especial para semana final */}
              {currentWeekPlans.some(plan => isFinalWeek(plan.day)) && (
                <div className="mt-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Brain className="w-5 h-5 text-red-400 mr-2" />
                    <span className="text-red-300 font-semibold">ATENÇÃO: Semana Final</span>
                  </div>
                  <p className="text-red-200 text-sm">
                    Esta é a semana final do seu plano! Foque na revisão intensiva dos assuntos mais importantes. 
                    Apenas os dois últimos dias são de descanso total.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* CSS personalizado para animações */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}