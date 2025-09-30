export interface StudyPlanData {
  concurso: string
  cargo: string
  horasLiquidas: string
  disciplinasDificuldade: string[]
  plataformaEstudo: string
  tempoEstudo: string
}

export interface DayPlan {
  day: number
  weekDay: number // 1-7 (1 = Dia 1, 7 = Dia 7)
  date: string
  subjects: {
    subject1: string
    subject2: string
    time1: number // em minutos
    time2: number // em minutos
    topics1?: string[] // tópicos específicos do assunto 1
    topics2?: string[] // tópicos específicos do assunto 2
  }
  activities: {
    questions: {
      description: string
      time: number
      questionsCount: number
      link?: string
    }
    review: {
      description: string
      time: number
    }
    legalStudy: {
      description: string
      time: number
    }
  }
  isRestDay?: boolean
  isSpecialDay?: boolean
  specialInstructions?: string
  isReviewDay?: boolean
}

// Tópicos detalhados por disciplina para CAM DEP baseados na tabela oficial
const SUBJECT_TOPICS = {
  'LÍNGUA PORTUGUESA': [
    'Interpretação e compreensão de texto',
    'Organização estrutural dos textos',
    'Coesão, coerência, intertextualidade',
    'Modos de organização discursiva (descrição, narração, exposição, argumentação, injunção)',
    'Tipos textuais',
    'Estrutura da frase: classes de palavras',
    'Morfologia',
    'Sintaxe',
    'Ortografia e acentuação',
    'Pontuação',
    'Uso da crase',
    'Vocabulário: sinônimos, antônimos, neologismos, estrangeirismos',
    'Registro da linguagem',
    'Norma culta'
  ],
  'LÍNGUA INGLESA': [
    'Compreensão e interpretação de textos variados',
    'Vocabulário',
    'Estrutura da língua',
    'Ideias explícitas e implícitas',
    'Relações intra- e intertextuais',
    'Gramática relevante para compreensão de textos'
  ],
  'DIREITO CONSTITUCIONAL': [
    'Constituição de 1988: estrutura, princípios fundamentais',
    'Poder constituinte',
    'Direitos e garantias fundamentais',
    'Organização do Estado (União, Estados, Municípios, DF)',
    'Deveres, servidores públicos',
    'Estrutura do Poder Legislativo',
    'Competências do Congresso Nacional e das Casas legislativas',
    'Regime constitucional dos parlamentares',
    'Processo legislativo',
    'Fiscalização contábil, financeira e orçamentária'
  ],
  'REGIMENTO INTERNO DA CÂMARA DOS DEPUTADOS': [
    'Leitura e aplicação do Regimento da Câmara',
    'Normas regimentais relativas às sessões',
    'Comissões',
    'Tramitação de proposições',
    'Quóruns',
    'Prerrogativas parlamentares'
  ],
  'DIREITO ADMINISTRATIVO': [
    'Conceitos e princípios da administração pública',
    'Organização administrativa e entidades paraestatais',
    'Poderes públicos (hierárquico, disciplinar, regulamentar etc.)',
    'Atos administrativos (conceito, requisitos, espécies, extinção, nulidades, revogação)',
    'Agentes públicos',
    'Regime jurídico (Lei 8.112/1990 e regras aplicáveis)',
    'Processo administrativo',
    'Licitações e contratos públicos',
    'Controle da administração',
    'Responsabilidade civil do Estado',
    'Improbidade administrativa',
    'Lei de Acesso à Informação',
    'Lei Geral de Proteção de Dados'
  ],
  'RACIOCÍNIO LÓGICO': [
    'Lógica proposicional, conectivos e equivalências lógicas',
    'Quantificadores e predicados',
    'Operações com conjuntos',
    'Tipologias numéricas: inteiros, racionais, reais',
    'Porcentagem, juros',
    'Proporcionalidade direta e inversa',
    'Interpretação de dados em gráficos/tabelas',
    'Dedução de relações lógicas e raciocínio sequencial'
  ],
  'INFORMÁTICA E DADOS': [
    'Conceitos básicos de hardware e software',
    'Redes de computadores',
    'Sistema operacional Windows (10 e 11)',
    'Pacote Office / ferramentas de produtividade',
    'Internet/intranet',
    'Segurança da informação',
    'Dados: conceitos, atributos, métricas',
    'Transformação de dados',
    'Governança da informação',
    'Noções de ciência de dados'
  ],
  'REGIMENTO COMUM DO CONGRESSO NACIONAL': [
    'Resoluções aplicáveis ao Congresso',
    'Normas regimentais do Congresso',
    'Resolução histórica e atualizações',
    'Artigos/regulações relevantes do Regimento Comum'
  ],
  'CIÊNCIA POLÍTICA': [
    'Teoria política',
    'Regimes e formas de governo',
    'Representação política',
    'Partidos políticos',
    'Sistema político brasileiro',
    'Organização política',
    'Sistemas eleitorais',
    'Relações entre poderes',
    'História do Estado',
    'Formação do Estado brasileiro'
  ],
  'ADMINISTRAÇÃO GERAL': [
    'Fundamentos e evolução da administração',
    'Organização e métodos organizacionais',
    'Clima e cultura organizacional',
    'Qualidade, eficiência, eficácia, efetividade',
    'Planejamento e gestão de processos e projetos',
    'Liderança, motivação e satisfação no trabalho',
    'Gestão por competências',
    'Comunicação organizacional',
    'Redes organizacionais',
    'Reengenharia organizacional',
    'Sistemas de informação gerenciais',
    'Mudanças organizacionais'
  ],
  'ADMINISTRAÇÃO PÚBLICA': [
    'Diferenças entre administração pública e privada',
    'Modelos de administração',
    'Políticas públicas',
    'Ciclo de políticas públicas',
    'Planejamento público (missão, visão, valores, objetivos estratégicos)',
    'Governo eletrônico',
    'Transparência, accountability',
    'Controle social',
    'Gestão de pessoas, recrutamento, avaliação',
    'Princípios da governança pública'
  ],
  'ADMINISTRAÇÃO ORÇAMENTÁRIA E FINANCEIRA': [
    'Orçamento público: conceitos, princípios',
    'Plano plurianual, lei de diretrizes orçamentárias, lei orçamentária anual',
    'Processo orçamentário (elaboração, discussão, votação, execução e fiscalização)',
    'Classificações orçamentárias',
    'Receita pública',
    'Despesa',
    'Dívida ativa',
    'Restos a pagar',
    'Regime de adiantamento',
    'Execução financeira',
    'Fiscalização e controle'
  ],
  'TREINO DE DISCURSIVA': [
    'Estrutura da dissertação',
    'Introdução, desenvolvimento e conclusão',
    'Coesão e coerência textual',
    'Argumentação',
    'Linguagem formal',
    'Norma culta da língua portuguesa',
    'Clareza e objetividade',
    'Adequação ao tema proposto'
  ]
}

// Padrão semanal de disciplinas para CAM DEP com mudanças por período
function getWeeklyPattern(weekNumber: number, totalDays: number): { [key: number]: { subject1: string, subject2: string } } {
  // Determinar qual período estamos baseado na semana
  if (weekNumber <= 8) {
    // Até semana 8
    return {
      1: { subject1: 'DIREITO CONSTITUCIONAL', subject2: 'LÍNGUA PORTUGUESA' },
      2: { subject1: 'LÍNGUA PORTUGUESA', subject2: 'DIREITO ADMINISTRATIVO' },
      3: { subject1: 'ADMINISTRAÇÃO GERAL', subject2: 'ADMINISTRAÇÃO ORÇAMENTÁRIA E FINANCEIRA' },
      4: { subject1: 'INFORMÁTICA E DADOS', subject2: 'ADMINISTRAÇÃO PÚBLICA' },
      5: { subject1: 'LÍNGUA INGLESA', subject2: 'RACIOCÍNIO LÓGICO' },
      6: { subject1: 'CIÊNCIA POLÍTICA', subject2: 'TREINO DE DISCURSIVA' },
      7: { subject1: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE OS ÚLTIMOS 7 DIAS', subject2: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE OS ÚLTIMOS 7 DIAS' }
    }
  } else if (weekNumber <= 11) {
    // Semanas 8 até 11
    return {
      1: { subject1: 'DIREITO CONSTITUCIONAL', subject2: 'LÍNGUA PORTUGUESA' },
      2: { subject1: 'LÍNGUA PORTUGUESA', subject2: 'DIREITO ADMINISTRATIVO' },
      3: { subject1: 'ADMINISTRAÇÃO GERAL', subject2: 'REGIMENTO COMUM DO CONGRESSO NACIONAL' },
      4: { subject1: 'INFORMÁTICA E DADOS', subject2: 'ADMINISTRAÇÃO PÚBLICA' },
      5: { subject1: 'REGIMENTO INTERNO DA CÂMARA DOS DEPUTADOS', subject2: 'RACIOCÍNIO LÓGICO' },
      6: { subject1: 'CIÊNCIA POLÍTICA', subject2: 'TREINO DE DISCURSIVA' },
      7: { subject1: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE OS ÚLTIMOS 7 DIAS', subject2: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE OS ÚLTIMOS 7 DIAS' }
    }
  } else {
    // Semana 12 em diante
    return {
      1: { subject1: 'DIREITO CONSTITUCIONAL', subject2: 'LÍNGUA PORTUGUESA' },
      2: { subject1: 'LÍNGUA PORTUGUESA', subject2: 'DIREITO ADMINISTRATIVO' },
      3: { subject1: 'DIREITO CONSTITUCIONAL', subject2: 'REGIMENTO INTERNO DA CÂMARA DOS DEPUTADOS' },
      4: { subject1: 'INFORMÁTICA E DADOS', subject2: 'ADMINISTRAÇÃO PÚBLICA' },
      5: { subject1: 'REGIMENTO INTERNO DA CÂMARA DOS DEPUTADOS', subject2: 'RACIOCÍNIO LÓGICO' },
      6: { subject1: 'CIÊNCIA POLÍTICA', subject2: 'TREINO DE DISCURSIVA' },
      7: { subject1: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE OS ÚLTIMOS 7 DIAS', subject2: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE OS ÚLTIMOS 7 DIAS' }
    }
  }
}

// Assuntos prioritários para revisão intensiva na semana final
const PRIORITY_SUBJECTS_FOR_FINAL_WEEK = [
  'DIREITO CONSTITUCIONAL',
  'LÍNGUA PORTUGUESA',
  'DIREITO ADMINISTRATIVO',
  'REGIMENTO INTERNO DA CÂMARA DOS DEPUTADOS',
  'ADMINISTRAÇÃO GERAL'
]

// Links das plataformas de questões
const PLATFORM_LINKS = {
  'Qconcursos': 'https://www.qconcursos.com/questoes-de-concursos',
  'TecConcursos': 'https://www.tecconcursos.com.br/questoes'
}

// Função para distribuir tópicos proporcionalmente ao longo dos dias
function distributeTopics(subject: string, totalDays: number, studyDays: number): string[][] {
  const topics = SUBJECT_TOPICS[subject as keyof typeof SUBJECT_TOPICS] || []
  if (topics.length === 0) return []
  
  // Calcular quantos dias essa disciplina aparece no plano
  const subjectDays = Math.floor(studyDays / 7) * getSubjectFrequencyPerWeek(subject, totalDays) + 
                     getSubjectFrequencyInPartialWeek(subject, studyDays % 7, totalDays)
  
  if (subjectDays === 0) return []
  
  // Distribuir tópicos proporcionalmente
  const topicsPerDay = Math.ceil(topics.length / subjectDays)
  const distributedTopics: string[][] = []
  
  for (let i = 0; i < subjectDays; i++) {
    const startIndex = i * topicsPerDay
    const endIndex = Math.min(startIndex + topicsPerDay, topics.length)
    distributedTopics.push(topics.slice(startIndex, endIndex))
  }
  
  return distributedTopics
}

// Função auxiliar para contar frequência da disciplina por semana
function getSubjectFrequencyPerWeek(subject: string, totalDays: number): number {
  // Usar padrão da primeira semana como referência
  const pattern = getWeeklyPattern(1, totalDays)
  let count = 0
  for (let day = 1; day <= 7; day++) {
    const dayPattern = pattern[day]
    if (dayPattern && (dayPattern.subject1 === subject || dayPattern.subject2 === subject)) {
      count++
    }
  }
  return count
}

// Função auxiliar para contar frequência da disciplina em semana parcial
function getSubjectFrequencyInPartialWeek(subject: string, days: number, totalDays: number): number {
  const pattern = getWeeklyPattern(1, totalDays)
  let count = 0
  for (let day = 1; day <= days; day++) {
    const dayPattern = pattern[day]
    if (dayPattern && (dayPattern.subject1 === subject || dayPattern.subject2 === subject)) {
      count++
    }
  }
  return count
}

// Função para gerar padrão de revisão intensiva para semana final
function getFinalWeekReviewPattern(dayInWeek: number): { subject1: string, subject2: string } {
  const patterns = [
    { subject1: 'DIREITO CONSTITUCIONAL', subject2: 'LÍNGUA PORTUGUESA' }, // Dia 1
    { subject1: 'DIREITO ADMINISTRATIVO', subject2: 'REGIMENTO INTERNO DA CÂMARA DOS DEPUTADOS' }, // Dia 2
    { subject1: 'ADMINISTRAÇÃO GERAL', subject2: 'RACIOCÍNIO LÓGICO' }, // Dia 3
    { subject1: 'LÍNGUA PORTUGUESA', subject2: 'DIREITO CONSTITUCIONAL' }, // Dia 4
    { subject1: 'CIÊNCIA POLÍTICA', subject2: 'INFORMÁTICA E DADOS' } // Dia 5
  ]
  
  return patterns[(dayInWeek - 1) % patterns.length]
}

export function generateCAMDEPPlan(data: StudyPlanData): DayPlan[] {
  const totalDays = parseInt(data.tempoEstudo.split(' ')[0]) // 90 ou 120
  const dailyHours = parseInt(data.horasLiquidas.split(' ')[0]) // 3, 4 ou 6
  const platform = data.plataformaEstudo
  
  // Calcular tempos proporcionais baseado nas horas diárias
  const baseHours = 3
  const multiplier = dailyHours / baseHours
  
  const studyTimePerSubject = Math.round(60 * multiplier) // 60min base * multiplicador
  const questionsTime = Math.round(30 * multiplier) // 30min base * multiplicador
  const reviewTime = Math.round(15 * multiplier) // 15min base * multiplicador
  const legalStudyTime = Math.round(15 * multiplier) // 15min base * multiplicador
  const questionsCount = Math.round(20 * multiplier) // 20 questões base * multiplicador
  
  const plan: DayPlan[] = []
  const startDate = new Date()
  
  // Apenas os últimos 2 dias serão descanso total
  const finalRestDays = 2
  const studyDays = totalDays - finalRestDays
  
  // Pré-calcular distribuição de tópicos para cada disciplina
  const topicsDistribution: { [subject: string]: string[][] } = {}
  const subjectCounters: { [subject: string]: number } = {}
  
  // Inicializar contadores e distribuições
  Object.keys(SUBJECT_TOPICS).forEach(subject => {
    topicsDistribution[subject] = distributeTopics(subject, totalDays, studyDays)
    subjectCounters[subject] = 0
  })
  
  for (let day = 1; day <= totalDays; day++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + (day - 1))
    
    const weekDay = ((day - 1) % 7) + 1 // 1-7
    const weekNumber = Math.ceil(day / 7)
    const pattern = getWeeklyPattern(weekNumber, totalDays)[weekDay]
    
    // Apenas os últimos 2 dias = descanso total
    if (day > totalDays - finalRestDays) {
      plan.push({
        day,
        weekDay,
        date: currentDate.toLocaleDateString('pt-BR'),
        subjects: {
          subject1: 'DESCANSO TOTAL',
          subject2: 'DESCANSO TOTAL',
          time1: 0,
          time2: 0
        },
        activities: {
          questions: {
            description: 'Dia de descanso - sem questões',
            time: 0,
            questionsCount: 0
          },
          review: {
            description: 'Dia de descanso - sem revisão',
            time: 0
          },
          legalStudy: {
            description: 'Dia de descanso - sem lei seca',
            time: 0
          }
        },
        isRestDay: true,
        specialInstructions: 'Reserve este dia para descanso total. Você merece!'
      })
      continue
    }
    
    // Semana final (últimos 7 dias) com revisão intensiva dos assuntos prioritários
    const isInFinalWeek = day > totalDays - 7
    
    if (isInFinalWeek && day <= totalDays - finalRestDays) {
      const dayInFinalWeek = day - (totalDays - 7)
      const finalWeekPattern = getFinalWeekReviewPattern(dayInFinalWeek)
      
      // Obter tópicos mais importantes para revisão
      const subject1Topics = SUBJECT_TOPICS[finalWeekPattern.subject1 as keyof typeof SUBJECT_TOPICS]?.slice(0, 3) || []
      const subject2Topics = SUBJECT_TOPICS[finalWeekPattern.subject2 as keyof typeof SUBJECT_TOPICS]?.slice(0, 3) || []
      
      plan.push({
        day,
        weekDay,
        date: currentDate.toLocaleDateString('pt-BR'),
        subjects: {
          subject1: finalWeekPattern.subject1,
          subject2: finalWeekPattern.subject2,
          time1: studyTimePerSubject,
          time2: studyTimePerSubject,
          topics1: subject1Topics,
          topics2: subject2Topics
        },
        activities: {
          questions: {
            description: `REVISÃO INTENSIVA - Responder ${Math.round(questionsCount * 1.5)} questões dos assuntos mais importantes`,
            time: Math.round(questionsTime * 1.2),
            questionsCount: Math.round(questionsCount * 1.5),
            link: PLATFORM_LINKS[platform as keyof typeof PLATFORM_LINKS]
          },
          review: {
            description: 'Revisão focada nos pontos mais cobrados em prova',
            time: Math.round(reviewTime * 1.3)
          },
          legalStudy: {
            description: 'Lei seca dos artigos mais importantes e recorrentes',
            time: Math.round(legalStudyTime * 1.2)
          }
        },
        isReviewDay: true,
        isSpecialDay: true,
        specialInstructions: `SEMANA FINAL - REVISÃO INTENSIVA! Foque nos tópicos mais importantes de ${finalWeekPattern.subject1} e ${finalWeekPattern.subject2}. Priorize questões recentes e pontos mais cobrados.`
      })
      continue
    }
    
    // Dia 6 da semana - Especial (colocar em dia os atrasos)
    if (weekDay === 6) {
      plan.push({
        day,
        weekDay,
        date: currentDate.toLocaleDateString('pt-BR'),
        subjects: {
          subject1: pattern.subject1,
          subject2: pattern.subject2,
          time1: studyTimePerSubject,
          time2: studyTimePerSubject
        },
        activities: {
          questions: {
            description: 'COLOCAR EM DIA OS ATRASOS',
            time: questionsTime + reviewTime + legalStudyTime,
            questionsCount: 0
          },
          review: {
            description: 'COLOCAR EM DIA OS ATRASOS',
            time: 0
          },
          legalStudy: {
            description: 'COLOCAR EM DIA OS ATRASOS',
            time: 0
          }
        },
        isSpecialDay: true,
        specialInstructions: 'Dia para colocar em dia tudo que não foi marcado como feito durante a semana.'
      })
      continue
    }
    
    // Dia 7 da semana - Revisão semanal
    if (weekDay === 7) {
      plan.push({
        day,
        weekDay,
        date: currentDate.toLocaleDateString('pt-BR'),
        subjects: {
          subject1: pattern.subject1,
          subject2: pattern.subject2,
          time1: studyTimePerSubject,
          time2: studyTimePerSubject
        },
        activities: {
          questions: {
            description: 'Reserve um momento para descanso',
            time: questionsTime + reviewTime + legalStudyTime,
            questionsCount: 0
          },
          review: {
            description: 'Reserve um momento para descanso',
            time: 0
          },
          legalStudy: {
            description: 'Reserve um momento para descanso',
            time: 0
          }
        },
        isSpecialDay: true,
        specialInstructions: 'Dica: Fazer um mini simulado - RESPONDER 10 QUESTÕES DE CADA ASSUNTO ESTUDADO DURANTE A SEMANA.'
      })
      continue
    }
    
    // Obter tópicos para os assuntos do dia
    const subject1Topics = getTopicsForSubject(pattern.subject1, subjectCounters, topicsDistribution)
    const subject2Topics = getTopicsForSubject(pattern.subject2, subjectCounters, topicsDistribution)
    
    // Dias normais (1-5)
    plan.push({
      day,
      weekDay,
      date: currentDate.toLocaleDateString('pt-BR'),
      subjects: {
        subject1: pattern.subject1,
        subject2: pattern.subject2,
        time1: studyTimePerSubject,
        time2: studyTimePerSubject,
        topics1: subject1Topics,
        topics2: subject2Topics
      },
      activities: {
        questions: {
          description: `Responder ${questionsCount} questões sobre os assuntos estudados`,
          time: questionsTime,
          questionsCount: questionsCount,
          link: PLATFORM_LINKS[platform as keyof typeof PLATFORM_LINKS]
        },
        review: {
          description: 'Revisão do assunto estudado no dia anterior',
          time: reviewTime
        },
        legalStudy: {
          description: 'Estudo de Lei seca referente aos assuntos estudados no dia',
          time: legalStudyTime
        }
      }
    })
  }
  
  return plan
}

// Função auxiliar para obter tópicos de uma disciplina específica
function getTopicsForSubject(
  subject: string, 
  counters: { [subject: string]: number }, 
  distributions: { [subject: string]: string[][] }
): string[] {
  if (!distributions[subject] || distributions[subject].length === 0) {
    return []
  }
  
  const currentIndex = counters[subject] || 0
  const topics = distributions[subject][currentIndex] || []
  
  // Incrementar contador para próxima vez
  counters[subject] = (currentIndex + 1) % distributions[subject].length
  
  return topics
}

export function formatTimeMinutes(minutes: number): string {
  if (minutes === 0) return '0min'
  if (minutes < 60) return `${minutes}min`
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h${remainingMinutes}min`
}

export function getTotalDailyTime(dayPlan: DayPlan): number {
  if (dayPlan.isRestDay) return 0
  
  return dayPlan.subjects.time1 + 
         dayPlan.subjects.time2 + 
         dayPlan.activities.questions.time + 
         dayPlan.activities.review.time + 
         dayPlan.activities.legalStudy.time
}

export function getWeekProgress(plans: DayPlan[], currentDay: number): {
  weekNumber: number
  dayInWeek: number
  weekStart: number
  weekEnd: number
} {
  const weekNumber = Math.ceil(currentDay / 7)
  const dayInWeek = ((currentDay - 1) % 7) + 1
  const weekStart = (weekNumber - 1) * 7 + 1
  const weekEnd = Math.min(weekNumber * 7, plans.length)
  
  return { weekNumber, dayInWeek, weekStart, weekEnd }
}