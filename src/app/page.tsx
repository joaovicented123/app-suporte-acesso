'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoginDialog } from "@/components/auth/login-dialog"
import { RegisterDialog } from "@/components/auth/register-dialog"
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
  BarChart3
} from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)

  // URLs dos planos da Hotmart
  const HOTMART_MONTHLY_URL = "https://pay.hotmart.com/C102108518L?off=fshe1odk"
  const HOTMART_ANNUAL_URL = "https://pay.hotmart.com/C102108518L?off=kupajgzs"

  // Redirecionar para dashboard se já estiver logado
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Função para redirecionar para checkout da Hotmart
  const handleStartNow = (planType: 'monthly' | 'annual') => {
    const url = planType === 'monthly' ? HOTMART_MONTHLY_URL : HOTMART_ANNUAL_URL
    window.open(url, '_blank')
  }

  // Função para rolar para a seção de planos
  const scrollToPlans = () => {
    const plansSection = document.getElementById('plans-section')
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
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
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => setShowLoginDialog(true)}
            >
              Entrar
            </Button>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              onClick={scrollToPlans}
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-300 border-cyan-500/30">
            <Zap className="w-4 h-4 mr-2" />
            Planos Personalizados com IA
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Seu Plano de Estudos
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              {" "}Personalizado
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            A ferramenta inteligente que reúne metodologia científica comprovada e adequação ao seu perfil, prestando assessoria com planos de estudo inteligentes e acompanhamento personalizado.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-lg px-8 py-3"
              onClick={scrollToPlans}
            >
              Junte-se a milhares de concurseiros aprovados
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Não bateu a meta hoje?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Seu cronograma automáticamente será atualizado para cobrir o atraso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">IA Personalizada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Algoritmos inteligentes que analisam seu perfil e criam cronogramas otimizados para seu sucesso.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Foco no Objetivo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Planos direcionados para seu concurso específico, com disciplinas e pesos corretos.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Acompanhamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Métricas detalhadas do seu progresso, com insights para melhorar sua performance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Flexibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Adapte seu cronograma conforme sua rotina e disponibilidade de tempo.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            O que nossos usuários dizem
          </h2>
          <p className="text-xl text-gray-300">
            Depoimentos reais de quem conquistou a aprovação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "O DDPlanner revolucionou minha forma de estudar. Consegui organizar meu tempo e focar no que realmente importa. Aprovada em 6 meses!"
              </p>
              <div className="flex items-center">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face" 
                  alt="Maria Clara" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="text-white font-semibold">Maria Clara</p>
                  <p className="text-gray-400 text-sm">Aprovada TRT-SP</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "A personalização do plano foi fundamental. O algoritmo entendeu meu perfil e criou um cronograma perfeito para minha rotina."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" 
                  alt="Rafael Santos" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="text-white font-semibold">Rafael Santos</p>
                  <p className="text-gray-400 text-sm">Aprovado TCU</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Finalmente um app que entende concurseiro! O acompanhamento do progresso me manteve motivada até a aprovação."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" 
                  alt="Ana Luiza" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="text-white font-semibold">Ana Luiza</p>
                  <p className="text-gray-400 text-sm">Aprovada CGU</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">10k+</div>
            <p className="text-gray-300">Estudantes ativos</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">95%</div>
            <p className="text-gray-300">Taxa de satisfação</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">2.5k+</div>
            <p className="text-gray-300">Aprovações conquistadas</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">4.9</div>
            <p className="text-gray-300">Avaliação média</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="plans-section" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Planos que cabem no seu bolso
          </h2>
          <p className="text-xl text-gray-300">
            Escolha o plano ideal para sua jornada de estudos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Mensal */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">Mensal</CardTitle>
              <div className="text-3xl font-bold text-white">R$ 59</div>
              <p className="text-gray-300">por mês</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Planos ilimitados
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                IA personalizada
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Métricas avançadas
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Integração com cursos
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Suporte prioritário
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                onClick={() => handleStartNow('monthly')}
              >
                Começar agora
              </Button>
            </CardContent>
          </Card>

          {/* Plano Anual */}
          <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-600/10 border-cyan-500/30 backdrop-blur-sm relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                Mais Popular
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">Anual</CardTitle>
              <div className="text-3xl font-bold text-white">R$ 429</div>
              <p className="text-gray-300">por ano</p>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                38% de desconto
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Todos os recursos do plano mensal
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Economia de R$ 179/ano
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Acesso antecipado a novidades
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Consultoria mensal gratuita
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                Garantia de 30 dias
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                onClick={() => handleStartNow('annual')}
              >
                Começar agora
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border-cyan-500/20 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para conquistar sua aprovação?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de concurseiros que já estão usando o DDPlanner para conquistar seus objetivos.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-lg px-8 py-3"
              onClick={scrollToPlans}
            >
              Começar agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">DDPlanner</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 DDPlanner. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
        onSwitchToRegister={() => {
          setShowLoginDialog(false)
          setShowRegisterDialog(true)
        }}
      />
      <RegisterDialog 
        open={showRegisterDialog} 
        onOpenChange={setShowRegisterDialog}
        onSwitchToLogin={() => {
          setShowRegisterDialog(false)
          setShowLoginDialog(true)
        }}
      />
    </div>
  )
}