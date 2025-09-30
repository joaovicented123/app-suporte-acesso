'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import StudyPlanView from '@/components/study-plan-view'
import { StudyPlanStorage, StoredStudyPlan } from '@/lib/study-plan-storage'

export default function PlanPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useAuth()
  const [plan, setPlan] = useState<StoredStudyPlan | null>(null)
  const [planLoading, setPlanLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (params.id && typeof params.id === 'string') {
      const storedPlan = StudyPlanStorage.getPlanById(params.id)
      setPlan(storedPlan)
      setPlanLoading(false)
    }
  }, [params.id, user, loading, router])

  if (loading || planLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando plano...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Plano não encontrado</h1>
          <p className="text-gray-300 mb-6">O plano que você está procurando não existe ou foi removido.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <StudyPlanView
      plans={plan.plans}
      planId={plan.id}
      onGoBack={() => router.push('/dashboard')}
      onGoHome={() => router.push('/dashboard')}
    />
  )
}