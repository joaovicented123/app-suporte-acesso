'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Target, 
  BookOpen, 
  Trophy, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Zap,
  Clock,
  Award,
  Gamepad2,
  Rocket,
  Shield,
  Calendar,
  Sparkles,
  Cpu,
  Loader2
} from "lucide-react"
import { generateTJCEPlan, StudyPlanData, DayPlan } from '@/lib/tj-ce-plan-generator'
import { generateCAMDEPPlan } from '@/lib/cam-dep-plan-generator'
import { generateMPSEPlan } from '@/lib/mp-se-plan-generator'
import { generateTJRJPlan } from '@/lib/tj-rj-plan-generator'
import { StudyPlanStorage } from '@/lib/study-plan-storage'
import StudyPlanView from '@/components/study-plan-view'

export default function NovoPlano() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [step, setStep] = useState(0) // Começar com 0 para a tela de boas-vindas
  const [generatedPlan, setGeneratedPlan] = useState<DayPlan[] | null>(null)
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false) // Estado para tela de carregamento
  const [formData, setFormData] = useState<StudyPlanData>({
    concurso: '',
    cargo: '',
    horasLiquidas: '',
    disciplinasDificuldade: [] as string[],
    plataformaEstudo: '',
    tempoEstudo: ''
  })

  // Redirecionar para home se não estiver logado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Se o plano foi gerado, mostrar a visualização do plano
  if (generatedPlan) {
    return (
      <StudyPlanView 
        plans={generatedPlan}
        planId={currentPlanId || undefined}
        onGoBack={() => {
          setGeneratedPlan(null)
          setCurrentPlanId(null)
        }}
        onGoHome={() => router.push('/dashboard')}
      />
    )
  }

  // Tela de carregamento personalizada
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-600/10 border-cyan-500/20 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center animate-spin">
                    <Cpu className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Criando Seu Plano Épico!
              </CardTitle>
              <CardDescription className="text-lg text-gray-200 leading-relaxed">
                Nossa IA está analisando suas respostas e criando um plano de estudos 100% personalizado para você.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-cyan-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Processando suas preferências...</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-purple-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Otimizando cronograma...</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Finalizando detalhes...</span>
                </div>
              </div>
              
              <div className="mt-8 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Brain className="w-5 h-5 text-cyan-400 mr-2" />
                  <span className="text-cyan-300 font-semibold">IA Trabalhando</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Aguarde alguns segundos enquanto criamos algo incrível para você!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Configurações específicas por concurso
  const concursosConfig = {
    'TJ-CE': {
      cargos: ['Técnico Judiciário'],
      disciplinas: [
        'Língua Portuguesa',
        'Noções de Informática',
        'Raciocínio Lógico',
        'Noções de Direito Constitucional',
        'Noções de Direito Administrativo',
        'Noções de Direito Processual Civil',
        'Legislação Civil e Processual Civil',
        'Noções de Direito Processual Penal',
        'Legislação Penal e Processual Penal'
      ]
    },
    'CAM DEP / 2023': {
      cargos: ['Analista Legislativo - Processo Legislativo e Gestão'],
      disciplinas: [
        'Língua Portuguesa',
        'Língua Inglesa',
        'Direito Constitucional',
        'Direito Administrativo',
        'Raciocínio Lógico',
        'Informática e Dados',
        'Regimento Interno da Câmara dos Deputados',
        'Regimento Comum do Congresso Nacional',
        'Ciência Política',
        'Administração Geral / Administração Pública',
        'Administração Financeira e Orçamentária'
      ]
    },
    'MP-SE': {
      cargos: ['Técnico Ministerial'],
      disciplinas: [
        'Língua Portuguesa',
        'Direito Constitucional',
        'Direito Administrativo',
        'Matemática/Raciocínio Lógico',
        'Noções de Informática',
        'Noções de administração pública',
        'Lei orgânica'
      ]
    },
    'TJ-RJ': {
      cargos: ['Analista Judiciário - Nível Superior'],
      disciplinas: [
        'Língua Portuguesa',
        'Direito Constitucional',
        'Direito Administrativo',
        'Direito Civil',
        'Direito Penal',
        'Direito Processual Civil',
        'Direito Processual Penal',
        'Ética no Serviço Público',
        'Legislação Especial',
        'Legislação',
        'Noções dos Direitos das Pessoas com Deficiência'
      ]
    }
  }

  const horasOptions = ['3 horas', '4 horas', '6 horas']
  const plataformasOptions = ['Qconcursos', 'TecConcursos']
  const tempoEstudoOptions = ['90 dias', '120 dias']

  const handleDisciplinaToggle = (disciplina: string) => {
    setFormData(prev => ({
      ...prev,
      disciplinasDificuldade: prev.disciplinasDificuldade.includes(disciplina)
        ? prev.disciplinasDificuldade.filter(d => d !== disciplina)
        : [...prev.disciplinasDificuldade, disciplina]
    }))
  }

  const handleSubmit = async () => {
    // Mostrar tela de carregamento
    setIsGenerating(true)
    
    // Simular processamento (2-3 segundos para dar sensação de personalização)
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    let plan: DayPlan[]
    
    // Gerar o plano de estudos baseado no concurso selecionado
    if (formData.concurso === 'TJ-CE') {
      plan = generateTJCEPlan(formData)
    } else if (formData.concurso === 'CAM DEP / 2023') {
      plan = generateCAMDEPPlan(formData)
    } else if (formData.concurso === 'MP-SE') {
      plan = generateMPSEPlan(formData)
    } else if (formData.concurso === 'TJ-RJ') {
      plan = generateTJRJPlan(formData)
    } else {
      // Fallback para outros concursos
      setIsGenerating(false)
      router.push('/dashboard')
      return
    }
    
    // Salvar o plano no localStorage com dados completos
    const planId = await StudyPlanStorage.savePlan({
      title: `Plano ${formData.concurso} - ${formData.cargo}`,
      concurso: formData.concurso,
      cargo: formData.cargo,
      totalDays: plan.length,
      completedTasks: [],
      plans: plan,
      formData: formData
    })
    
    console.log('Plano salvo com ID:', planId) // Debug
    
    // Verificar se foi salvo corretamente
    const savedPlan = StudyPlanStorage.getPlanById(planId)
    console.log('Plano recuperado:', savedPlan) // Debug
    
    setCurrentPlanId(planId)
    setGeneratedPlan(plan)
    
    // Esconder tela de carregamento
    setIsGenerating(false)
  }

  const handleGoBack = () => {
    router.push('/dashboard')
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-600/10 border-cyan-500/20 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Bem-vindo!
              </CardTitle>
              <CardDescription className="text-lg text-gray-200 leading-relaxed">
                Sou o <span className="text-cyan-400 font-semibold">DDPlanner</span>, seu assessor pessoal nessa jornada. 
                <br />Conte comigo! 
                <br /><br />
                Mas antes, preciso de algumas respostas para lhe entregar o melhor.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Análise IA</p>
                  <p className="text-gray-400 text-xs">Personalizado</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Foco Total</p>
                  <p className="text-gray-400 text-xs">Otimizado</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Aprovação</p>
                  <p className="text-gray-400 text-xs">Garantida</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Gamepad2 className="w-5 h-5 text-cyan-400 mr-2" />
                  <span className="text-cyan-300 font-semibold">Sistema Gamificado</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Transforme seus estudos em uma jornada épica rumo à aprovação!
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 1:
        return (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-cyan-400" />
                Para qual concurso será o plano de estudos?
              </CardTitle>
              <CardDescription className="text-gray-300">
                Selecione o concurso que você está focando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select value={formData.concurso} onValueChange={(value) => setFormData(prev => ({ ...prev, concurso: value, cargo: '' }))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-14">
                  <SelectValue placeholder="Escolha seu concurso alvo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TJ-CE">TJ-CE - Tribunal de Justiça do Ceará</SelectItem>
                  <SelectItem value="CAM DEP / 2023">CAM DEP / 2023 - Câmara dos Deputados</SelectItem>
                  <SelectItem value="MP-SE">MP-SE - Ministério Público de Sergipe</SelectItem>
                  <SelectItem value="TJ-RJ">TJ-RJ - Tribunal de Justiça do Rio de Janeiro</SelectItem>
                </SelectContent>
              </Select>

              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Rocket className="w-4 h-4 text-cyan-400 mr-2" />
                  <span className="text-cyan-300 font-semibold">Missão Iniciada</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Primeiro passo concluído! Vamos personalizar seu plano para maximizar suas chances de aprovação.
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="w-5 h-5 mr-2 text-purple-400" />
                Para qual cargo será o seu foco?
              </CardTitle>
              <CardDescription className="text-gray-300">
                Defina sua especialização dentro do concurso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select 
                value={formData.cargo} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, cargo: value }))}
                disabled={!formData.concurso}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-14">
                  <SelectValue placeholder={formData.concurso ? "Selecione o cargo" : "Primeiro selecione um concurso"} />
                </SelectTrigger>
                <SelectContent>
                  {formData.concurso && concursosConfig[formData.concurso as keyof typeof concursosConfig]?.cargos.map((cargo) => (
                    <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Shield className="w-4 h-4 text-purple-400 mr-2" />
                  <span className="text-purple-300 font-semibold">Especialização Definida</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Perfeito! Agora posso ajustar o plano para as especificidades do seu cargo alvo.
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-400" />
                Quantas horas líquidas tem para estudos no dia?
              </CardTitle>
              <CardDescription className="text-gray-300">
                Tempo dedicado exclusivamente aos estudos (sem distrações)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {horasOptions.map((opcao) => (
                  <div
                    key={opcao}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.horasLiquidas === opcao
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, horasLiquidas: opcao }))}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">{opcao}</span>
                      {formData.horasLiquidas === opcao && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Zap className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-green-300 font-semibold">Otimização Temporal</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Vou criar um cronograma que maximiza cada minuto do seu tempo disponível!
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-red-400" />
                Quais disciplinas você tem mais dificuldade?
              </CardTitle>
              <CardDescription className="text-gray-300">
                Selecione as matérias que precisam de mais atenção (pode escolher várias)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.concurso && concursosConfig[formData.concurso as keyof typeof concursosConfig]?.disciplinas.map((disciplina) => (
                  <Badge
                    key={disciplina}
                    variant={formData.disciplinasDificuldade.includes(disciplina) ? "default" : "outline"}
                    className={`cursor-pointer p-4 text-center justify-center transition-all text-sm ${
                      formData.disciplinasDificuldade.includes(disciplina)
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                        : 'border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                    onClick={() => handleDisciplinaToggle(disciplina)}
                  >
                    {disciplina}
                  </Badge>
                ))}
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Target className="w-4 h-4 text-red-400 mr-2" />
                  <span className="text-red-300 font-semibold">Foco Estratégico</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Identificando seus pontos fracos para criar um plano de ataque personalizado!
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 5:
        return (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Gamepad2 className="w-5 h-5 mr-2 text-blue-400" />
                Qual sua plataforma de estudo?
              </CardTitle>
              <CardDescription className="text-gray-300">
                Escolha a plataforma onde você fará suas questões e videoaulas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {plataformasOptions.map((plataforma) => (
                  <div
                    key={plataforma}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.plataformaEstudo === plataforma
                        ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/50'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, plataformaEstudo: plataforma }))}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">{plataforma}</span>
                      {formData.plataformaEstudo === plataforma && (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Gamepad2 className="w-4 h-4 text-blue-400 mr-2" />
                  <span className="text-blue-300 font-semibold">Plataforma Selecionada</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Perfeito! Vou integrar sua plataforma favorita ao plano de estudos.
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 6:
        return (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-400" />
                Em quanto tempo você quer ter estudado 100% das disciplinas?
              </CardTitle>
              <CardDescription className="text-gray-300">
                Defina o prazo para completar todo o conteúdo programático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {tempoEstudoOptions.map((tempo) => (
                  <div
                    key={tempo}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.tempoEstudo === tempo
                        ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/50'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, tempoEstudo: tempo }))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-semibold">{tempo}</span>
                        <p className="text-gray-400 text-sm mt-1">
                          {tempo === '90 dias' ? 'Ritmo intensivo - Máximo foco' : 'Ritmo equilibrado - Mais tempo para revisão'}
                        </p>
                      </div>
                      {formData.tempoEstudo === tempo && (
                        <CheckCircle className="w-5 h-5 text-orange-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumo Final */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Resumo da Sua Missão
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300"><span className="text-cyan-400">🎯 Concurso:</span> {formData.concurso || 'Não selecionado'}</p>
                  <p className="text-gray-300"><span className="text-purple-400">🏆 Cargo:</span> {formData.cargo || 'Não selecionado'}</p>
                  <p className="text-gray-300"><span className="text-green-400">⏰ Horas Diárias:</span> {formData.horasLiquidas || 'Não selecionado'}</p>
                  <p className="text-gray-300"><span className="text-red-400">📚 Disciplinas Difíceis:</span> {formData.disciplinasDificuldade.length} selecionadas</p>
                  <p className="text-gray-300"><span className="text-blue-400">🎮 Plataforma:</span> {formData.plataformaEstudo || 'Não selecionada'}</p>
                  <p className="text-gray-300"><span className="text-orange-400">📅 Prazo Total:</span> {formData.tempoEstudo || 'Não selecionado'}</p>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 text-orange-400 mr-2" />
                  <span className="text-orange-300 font-semibold">Cronograma Definido</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Excelente! Com esse prazo, posso criar um cronograma detalhado e realista para sua aprovação.
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Rocket className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="text-yellow-300 font-semibold">Pronto para Decolar!</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Todos os dados coletados! Agora vou criar seu plano de estudos personalizado com IA.
                </p>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (step) {
      case 0: return true
      case 1: return formData.concurso !== ''
      case 2: return formData.cargo !== ''
      case 3: return formData.horasLiquidas !== ''
      case 4: return formData.disciplinasDificuldade.length > 0
      case 5: return formData.plataformaEstudo !== ''
      case 6: return formData.tempoEstudo !== ''
      default: return false
    }
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
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 border border-white/20 bg-white/5"
            onClick={handleGoBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      {step > 0 && (
        <div className="bg-black/20 border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Configurando Seu Plano Épico</span>
              <span className="text-gray-300 text-sm">Etapa {step} de 6</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-white/5"
              onClick={() => {
                if (step === 0) {
                  handleGoBack()
                } else {
                  setStep(Math.max(0, step - 1))
                }
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {step === 0 ? 'Voltar' : 'Anterior'}
            </Button>

            {step < 6 ? (
              <Button
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                onClick={() => setStep(Math.min(6, step + 1))}
                disabled={!canProceed()}
              >
                {step === 0 ? 'Começar Jornada' : 'Próximo'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                onClick={handleSubmit}
                disabled={!canProceed()}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Criar Plano Épico!
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}