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

// Tópicos específicos por disciplina
const SUBJECT_TOPICS = {
  'LÍNGUA PORTUGUESA': [
    'Reconhecimento de tipos e gêneros textuais',
    'Compreensão e interpretação de textos de gêneros variados',
    'Domínio da ortografia oficial',
    'Domínio dos mecanismos de coesão textual',
    'Domínio da estrutura morfossintática do período',
    'Emprego dos sinais de pontuação',
    'Concordância verbal e nominal',
    'Reescritura de frases e parágrafos do texto',
    'Colocação dos pronomes átonos',
    'Emprego do sinal indicativo de crase'
  ],
  'DIREITO CONSTITUCIONAL': [
    'Constituição da República Federativa do Brasil de 1988, Princípios fundamentais',
    'Direitos e garantias fundamentais',
    'Organização político-administrativa',
    'Administração pública',
    'Poder Legislativo',
    'Poder Executivo',
    'Poder Judiciário',
    'Funções essenciais à justiça'
  ],
  'DIREITO ADMINISTRATIVO': [
    'Noções de organização administrativa',
    'Administração direta e indireta, centralizada e descentralizada',
    'Ato administrativo',
    'Processo administrativo',
    'Agentes públicos',
    'Poderes administrativos',
    'Nova lei de licitações',
    'Controle e responsabilização da administração'
  ],
  'DIREITO PROCESSUAL CIVIL': [
    'Princípios do processo',
    'Jurisdição',
    'Ação',
    'Competência',
    'Da Cooperação internacional',
    'Competência (disposições gerais, modificação, incompetência)',
    'Ação (condições e classificação)',
    'Pressupostos processuais',
    'Preclusão',
    'Sujeitos do processo',
    'Intervenção de terceiros',
    'Do Juiz e dos Auxiliares da Justiça',
    'Ministério Público, Advocacia Pública e Defensoria Pública',
    'Atos processuais',
    'Tutela provisória',
    'Formação, suspensão e extinção de processo',
    'Processo de conhecimento e do cumprimento da sentença',
    'Dos recursos',
    'Controle judicial dos atos administrativos'
  ],
  'ÉTICA NO SERVIÇO PÚBLICO': [
    'Ética e moral',
    'Ética, princípios e valores',
    'Ética e democracia: exercício da cidadania',
    'Ética e função pública',
    'Lei nº 8.429/1992 e suas alterações',
    'Lei nº 12.846/2013 e suas alterações'
  ],
  'LEGISLAÇÃO ESPECIAL': [
    'Lei Estadual nº 6.956/2015',
    'Decreto-Lei nº 220/1975 e suas alterações',
    'Decreto nº 2.479/1979 e suas alterações',
    'Lei Estadual nº 4.620/2005 e suas alterações',
    'Consolidação Normativa da Corregedoria Geral da Justiça, parte judicial: Livro I – Parte Geral',
    'Regimento Interno do TJRJ',
    'Resolução Órgão Especial nº 03/2021'
  ],
  'DIREITO PROCESSUAL PENAL': [
    'Disposições preliminares do Código de Processo Penal',
    'Inquérito policial',
    'Ação penal',
    'Do juiz, do ministério público, do acusado e defensor, dos assistentes e auxiliares da justiça, dos peritos e intérpretes',
    'Das citações e intimações, Da sentença',
    'Do processo comum',
    'Do processo comum',
    'Do processo comum',
    'Do processo comum',
    'Prisão e liberdade provisória',
    'Processo e julgamento dos crimes de responsabilidade do funcionários públicos',
    'habeas corpus e seu processo',
    'Disposições constitucionais aplicáveis ao direito processual penal'
  ],
  'DIREITOS DAS PESSOAS COM DEFICIÊNCIA': [
    'Inclusão, direitos e garantias legais e constitucionais das pessoas com deficiência (Lei nº 13.146/2015)',
    'Normas gerais e critérios básicos para a promoção da acessibilidade das pessoas com deficiência ou com mobilidade reduzida (Lei nº 10.098/2000)',
    'Prioridade de atendimento às pessoas com deficiência (Lei nº10.048/2000)'
  ],
  'LEGISLAÇÃO': [
    'Código de Normas da Corregedoria Geral da Justiça do Estado do Rio de Janeiro, Parte Geral (disposições gerais, serviços judiciais, cartórios)',
    'Código de Normas da Corregedoria Geral da Justiça do Estado do Rio de Janeiro, Foro Judicial',
    'Código de Normas da Corregedoria Geral da Justiça do Estado do Rio de Janeiro, Foro Judicial',
    'Código de Normas da Corregedoria Geral da Justiça do Estado do Rio de Janeiro, Das Centrais de Audiência de Custódia',
    'Lei Federal nº 9.099/1995 e suas alterações',
    'Lei Federal nº 12.153/2009 (Juizados da Fazenda Pública)'
  ]
}

// Tópicos que devem ser repetidos 2 ou 3 vezes consecutivamente
const REPEATED_TOPICS = {
  'LÍNGUA PORTUGUESA': [
    'Domínio da ortografia oficial',
    'Domínio dos mecanismos de coesão textual'
  ],
  'DIREITO CONSTITUCIONAL': [
    'Constituição da República Federativa do Brasil de 1988, Princípios fundamentais',
    'Direitos e garantias fundamentais'
  ],
  'DIREITO ADMINISTRATIVO': [
    'Ato administrativo',
    'Processo administrativo',
    'Poderes administrativos'
  ],
  'DIREITO PROCESSUAL CIVIL': [
    'Competência',
    'Ação',
    'Atos processuais'
  ],
  'DIREITO PROCESSUAL PENAL': [
    'Inquérito policial',
    'Ação penal'
  ],
  'ÉTICA NO SERVIÇO PÚBLICO': [
    'Ética e moral',
    'Ética e função pública'
  ],
  'LEGISLAÇÃO ESPECIAL': [
    'Lei Estadual nº 6.956/2015',
    'Decreto-Lei nº 220/1975 e suas alterações',
    'Decreto nº 2.479/1979 e suas alterações'
  ],
  'LEGISLAÇÃO': [
    'Código de Normas da Corregedoria Geral da Justiça do Estado do Rio de Janeiro, Parte Geral (disposições gerais, serviços judiciais, cartórios)',
    'Regimento Interno do TJRJ'
  ],
  'DIREITOS DAS PESSOAS COM DEFICIÊNCIA': [
    'Inclusão, direitos e garantias legais e constitucionais das pessoas com deficiência (Lei nº 13.146/2015)',
    'Normas gerais e critérios básicos para a promoção da acessibilidade das pessoas com deficiência ou com mobilidade reduzida (Lei nº 10.098/2000)'
  ]
}

// Função para obter tópicos de uma disciplina com sistema de repetição inteligente
function getTopicsForSubject(subject: string, dayIndex: number, totalDays: number): string[] {
  const allTopics = SUBJECT_TOPICS[subject as keyof typeof SUBJECT_TOPICS] || []
  const repeatedTopics = REPEATED_TOPICS[subject as keyof typeof REPEATED_TOPICS] || []
  
  if (allTopics.length === 0) return []
  
  // Calcular quantas vezes cada tópico repetido deve aparecer (2 ou 3 vezes)
  const totalRepeatedSlots = repeatedTopics.length * 2.5 // média entre 2 e 3
  const regularTopics = allTopics.filter(topic => !repeatedTopics.includes(topic))
  const availableSlots = Math.max(1, Math.floor(totalDays / 7)) // aproximadamente quantos dias esta disciplina aparece
  
  // Decidir se repete 2 ou 3 vezes baseado na simetria
  const repetitions = availableSlots >= totalRepeatedSlots * 1.2 ? 3 : 2
  
  // Criar sequência de tópicos respeitando a ordem original
  const topicSequence: string[] = []
  
  // Para cada tópico na ordem original, verificar se deve ser repetido
  allTopics.forEach(topic => {
    if (repeatedTopics.includes(topic)) {
      // Adicionar o tópico repetido o número de vezes necessário
      for (let i = 0; i < repetitions; i++) {
        topicSequence.push(topic)
      }
    } else {
      // Adicionar tópico regular apenas uma vez
      topicSequence.push(topic)
    }
  })
  
  // Se ainda precisar de mais tópicos, repetir a sequência completa
  const remainingSlots = Math.max(availableSlots - topicSequence.length, 0)
  if (remainingSlots > 0) {
    const regularCycles = Math.ceil(remainingSlots / allTopics.length)
    for (let cycle = 0; cycle < regularCycles; cycle++) {
      allTopics.forEach(topic => {
        topicSequence.push(topic)
      })
    }
  }
  
  // Retornar o tópico baseado no índice do dia
  const topicIndex = dayIndex % topicSequence.length
  return [topicSequence[topicIndex]]
}

// Padrão semanal de disciplinas para TJ-RJ com mudanças por período
function getWeeklyPattern(weekNumber: number): { [key: number]: { subject1: string, subject2: string } } {
  // Até a semana 11
  if (weekNumber <= 11) {
    return {
      1: { subject1: 'DIREITO CONSTITUCIONAL', subject2: 'LÍNGUA PORTUGUESA' },
      2: { subject1: 'LÍNGUA PORTUGUESA', subject2: 'DIREITO ADMINISTRATIVO' },
      3: { subject1: 'ÉTICA NO SERVIÇO PÚBLICO', subject2: 'DIREITO PROCESSUAL CIVIL' },
      4: { subject1: 'DIREITO PROCESSUAL CIVIL', subject2: 'LEGISLAÇÃO ESPECIAL' },
      5: { subject1: 'LEGISLAÇÃO ESPECIAL', subject2: 'DIREITO PROCESSUAL PENAL' },
      6: { subject1: 'DIREITOS DAS PESSOAS COM DEFICIÊNCIA', subject2: 'TREINO DE DISCURSIVA' },
      7: { subject1: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE A SEMANA', subject2: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE A SEMANA' }
    }
  }
  // Semana 12 (especial)
  else if (weekNumber === 12) {
    return {
      1: { subject1: 'DIREITO CONSTITUCIONAL', subject2: 'LEGISLAÇÃO' },
      2: { subject1: 'LEGISLAÇÃO', subject2: 'DIREITO ADMINISTRATIVO' },
      3: { subject1: 'LEGISLAÇÃO', subject2: 'DIREITO PROCESSUAL CIVIL' },
      4: { subject1: 'DIREITO PROCESSUAL CIVIL', subject2: 'LEGISLAÇÃO ESPECIAL' },
      5: { subject1: 'LEGISLAÇÃO ESPECIAL', subject2: 'DIREITO PROCESSUAL PENAL' },
      6: { subject1: 'LEGISLAÇÃO ESPECIAL', subject2: 'TREINO DE DISCURSIVA' },
      7: { subject1: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE A SEMANA', subject2: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE A SEMANA' }
    }
  }
  // A partir da semana 13
  else {
    return {
      1: { subject1: 'DIREITO CONSTITUCIONAL', subject2: 'LEGISLAÇÃO' },
      2: { subject1: 'LEGISLAÇÃO', subject2: 'DIREITO ADMINISTRATIVO' },
      3: { subject1: 'ÉTICA NO SERVIÇO PÚBLICO', subject2: 'DIREITO PROCESSUAL CIVIL' },
      4: { subject1: 'DIREITO PROCESSUAL CIVIL', subject2: 'LEGISLAÇÃO' },
      5: { subject1: 'LEGISLAÇÃO ESPECIAL', subject2: 'DIREITO PROCESSUAL PENAL' },
      6: { subject1: 'LEGISLAÇÃO ESPECIAL', subject2: 'TREINO DE DISCURSIVA' },
      7: { subject1: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE A SEMANA', subject2: 'REVISAR OS ASSUNTOS ESTUDADOS DURANTE A SEMANA' }
    }
  }
}

// Ajuste especial para semanas até 7 no dia 6
function getWeeklyPatternWithSpecialDay6(weekNumber: number): { [key: number]: { subject1: string, subject2: string } } {
  const basePattern = getWeeklyPattern(weekNumber)
  
  // Até a semana 7: DIREITOS DAS PESSOAS COM DEFICIÊNCIA e Treino de discursiva
  if (weekNumber <= 7) {
    basePattern[6] = { subject1: 'DIREITOS DAS PESSOAS COM DEFICIÊNCIA', subject2: 'TREINO DE DISCURSIVA' }
  }
  // A partir da semana 8: LEGISLAÇÃO ESPECIAL e Treino de discursiva
  else {
    basePattern[6] = { subject1: 'LEGISLAÇÃO ESPECIAL', subject2: 'TREINO DE DISCURSIVA' }
  }
  
  return basePattern
}

// Assuntos prioritários para revisão intensiva na semana final
const PRIORITY_SUBJECTS_FOR_FINAL_WEEK = [
  'DIREITO CONSTITUCIONAL',
  'LÍNGUA PORTUGUESA',
  'DIREITO ADMINISTRATIVO',
  'DIREITO PROCESSUAL CIVIL',
  'DIREITO PROCESSUAL PENAL'
]

// Links das plataformas de questões
const PLATFORM_LINKS = {
  'Qconcursos': 'https://www.qconcursos.com/questoes-de-concursos',
  'TecConcursos': 'https://www.tecconcursos.com.br/questoes'
}

// Função para gerar padrão de revisão intensiva para semana final
function getFinalWeekReviewPattern(dayInWeek: number): { subject1: string, subject2: string } {
  const patterns = [
    { subject1: 'DIREITO CONSTITUCIONAL', subject2: 'LÍNGUA PORTUGUESA' }, // Dia 1
    { subject1: 'DIREITO ADMINISTRATIVO', subject2: 'DIREITO PROCESSUAL CIVIL' }, // Dia 2
    { subject1: 'DIREITO PROCESSUAL PENAL', subject2: 'ÉTICA NO SERVIÇO PÚBLICO' }, // Dia 3
    { subject1: 'LEGISLAÇÃO', subject2: 'LEGISLAÇÃO ESPECIAL' }, // Dia 4
    { subject1: 'DIREITOS DAS PESSOAS COM DEFICIÊNCIA', subject2: 'DIREITO CONSTITUCIONAL' } // Dia 5
  ]
  
  return patterns[(dayInWeek - 1) % patterns.length]
}

export function generateTJRJPlan(data: StudyPlanData): DayPlan[] {
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
  
  // Contadores para distribuição de tópicos
  const subjectCounters: { [key: string]: number } = {}
  
  for (let day = 1; day <= totalDays; day++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + (day - 1))
    
    const weekDay = ((day - 1) % 7) + 1 // 1-7
    const weekNumber = Math.ceil(day / 7)
    const pattern = getWeeklyPatternWithSpecialDay6(weekNumber)[weekDay]
    
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
      
      // Obter tópicos para revisão final
      const topics1 = getTopicsForSubject(finalWeekPattern.subject1, subjectCounters[finalWeekPattern.subject1] || 0, totalDays)
      const topics2 = getTopicsForSubject(finalWeekPattern.subject2, subjectCounters[finalWeekPattern.subject2] || 0, totalDays)
      
      // Incrementar contadores
      subjectCounters[finalWeekPattern.subject1] = (subjectCounters[finalWeekPattern.subject1] || 0) + 1
      subjectCounters[finalWeekPattern.subject2] = (subjectCounters[finalWeekPattern.subject2] || 0) + 1
      
      plan.push({
        day,
        weekDay,
        date: currentDate.toLocaleDateString('pt-BR'),
        subjects: {
          subject1: finalWeekPattern.subject1,
          subject2: finalWeekPattern.subject2,
          time1: studyTimePerSubject,
          time2: studyTimePerSubject,
          topics1: topics1,
          topics2: topics2
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
            description: 'FAZER UM MINI SIMULADO',
            time: questionsTime + reviewTime + legalStudyTime,
            questionsCount: 0
          },
          review: {
            description: 'FAZER UM MINI SIMULADO',
            time: 0
          },
          legalStudy: {
            description: 'FAZER UM MINI SIMULADO',
            time: 0
          }
        },
        isSpecialDay: true,
        specialInstructions: 'DICA - FAZER UM MINI SIMULADO dos assuntos estudados durante a semana.'
      })
      continue
    }
    
    // Obter tópicos para os assuntos do dia
    const topics1 = getTopicsForSubject(pattern.subject1, subjectCounters[pattern.subject1] || 0, totalDays)
    const topics2 = getTopicsForSubject(pattern.subject2, subjectCounters[pattern.subject2] || 0, totalDays)
    
    // Incrementar contadores apenas para disciplinas que têm tópicos
    if (topics1.length > 0) {
      subjectCounters[pattern.subject1] = (subjectCounters[pattern.subject1] || 0) + 1
    }
    if (topics2.length > 0) {
      subjectCounters[pattern.subject2] = (subjectCounters[pattern.subject2] || 0) + 1
    }
    
    // Dias normais (1-6)
    plan.push({
      day,
      weekDay,
      date: currentDate.toLocaleDateString('pt-BR'),
      subjects: {
        subject1: pattern.subject1,
        subject2: pattern.subject2,
        time1: studyTimePerSubject,
        time2: studyTimePerSubject,
        topics1: topics1,
        topics2: topics2
      },
      activities: {
        questions: {
          description: `Responder ${questionsCount} questões sobre os assuntos estudados`,
          time: questionsTime,
          questionsCount: questionsCount,
          link: PLATFORM_LINKS[platform as keyof typeof PLATFORM_LINKS]
        },
        review: {
          description: 'Revisão do conteúdo estudado no dia anterior',
          time: reviewTime
        },
        legalStudy: {
          description: 'Lei Seca referente aos assuntos estudados no dia',
          time: legalStudyTime
        }
      }
    })
  }
  
  return plan
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