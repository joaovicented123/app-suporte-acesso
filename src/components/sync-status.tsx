'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Download,
  Settings
} from "lucide-react"
import { StudyPlanStorage } from '@/lib/study-plan-storage'
import { SupabaseStorage } from '@/lib/supabase-storage'

interface SyncStatusProps {
  onSyncComplete?: () => void
}

export default function SyncStatus({ onSyncComplete }: SyncStatusProps) {
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [localPlansCount, setLocalPlansCount] = useState(0)
  const [supabasePlansCount, setSupabasePlansCount] = useState(0)

  // Verificar status do Supabase
  const checkSupabaseStatus = async () => {
    try {
      const connected = await SupabaseStorage.isConfigured()
      setIsSupabaseConnected(connected)
      
      if (connected) {
        const supabasePlans = await SupabaseStorage.loadPlans()
        setSupabasePlansCount(supabasePlans.length)
      }
    } catch (error) {
      console.error('Erro ao verificar status do Supabase:', error)
      setIsSupabaseConnected(false)
    }
  }

  // Contar planos locais
  const countLocalPlans = () => {
    const plans = StudyPlanStorage.getAllPlans()
    setLocalPlansCount(plans.length)
  }

  // Sincronizar dados
  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await StudyPlanStorage.syncData()
      setLastSyncTime(new Date().toLocaleString('pt-BR'))
      
      // Atualizar contadores
      await checkSupabaseStatus()
      countLocalPlans()
      
      if (onSyncComplete) {
        onSyncComplete()
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Migrar dados locais para Supabase
  const handleMigrate = async () => {
    setIsSyncing(true)
    try {
      await SupabaseStorage.migrateLocalToSupabase()
      await handleSync() // Sincronizar após migração
    } catch (error) {
      console.error('Erro na migração:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    checkSupabaseStatus()
    countLocalPlans()
  }, [])

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Status de Sincronização
        </CardTitle>
        <CardDescription className="text-gray-300">
          Gerencie a sincronização dos seus planos de estudo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Conexão */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-3">
            {isSupabaseConnected ? (
              <Cloud className="w-5 h-5 text-green-400" />
            ) : (
              <CloudOff className="w-5 h-5 text-red-400" />
            )}
            <div>
              <p className="text-white font-semibold">
                {isSupabaseConnected ? 'Conectado ao Supabase' : 'Supabase Desconectado'}
              </p>
              <p className="text-gray-400 text-sm">
                {isSupabaseConnected 
                  ? 'Seus dados estão sendo sincronizados na nuvem' 
                  : 'Dados salvos apenas localmente'
                }
              </p>
            </div>
          </div>
          <Badge 
            className={isSupabaseConnected 
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border-red-500/30'
            }
          >
            {isSupabaseConnected ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Contadores de Planos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
            <div className="flex items-center justify-center mb-2">
              <Database className="w-4 h-4 text-blue-400 mr-1" />
              <span className="text-blue-300 text-sm">Local</span>
            </div>
            <p className="text-white text-xl font-bold">{localPlansCount}</p>
            <p className="text-gray-400 text-xs">planos salvos</p>
          </div>
          
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
            <div className="flex items-center justify-center mb-2">
              <Cloud className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-300 text-sm">Nuvem</span>
            </div>
            <p className="text-white text-xl font-bold">{supabasePlansCount}</p>
            <p className="text-gray-400 text-xs">planos na nuvem</p>
          </div>
        </div>

        {/* Última Sincronização */}
        {lastSyncTime && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center mb-1">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-green-300 font-semibold text-sm">Última Sincronização</span>
            </div>
            <p className="text-gray-300 text-sm">{lastSyncTime}</p>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-2">
          {isSupabaseConnected ? (
            <>
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
              </Button>
              
              {localPlansCount > supabasePlansCount && (
                <Button
                  onClick={handleMigrate}
                  disabled={isSyncing}
                  variant="outline"
                  className="w-full border-orange-500/50 text-orange-300 hover:bg-orange-500/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Migrar Dados Locais para Nuvem
                </Button>
              )}
            </>
          ) : (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-yellow-300 font-semibold text-sm">Configuração Necessária</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Para sincronizar seus planos na nuvem, conecte sua conta Supabase.
              </p>
              <Button
                onClick={() => {
                  // Redirecionar para configurações ou mostrar instruções
                  alert('Vá em Configurações do Projeto → Integrações → Conectar Supabase')
                }}
                variant="outline"
                className="w-full border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar Supabase
              </Button>
            </div>
          )}
        </div>

        {/* Informações Importantes */}
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <div className="flex items-center mb-2">
            <Database className="w-4 h-4 text-cyan-400 mr-2" />
            <span className="text-cyan-300 font-semibold text-sm">Como Funciona</span>
          </div>
          <ul className="text-gray-300 text-xs space-y-1">
            <li>• Dados são salvos localmente para acesso rápido</li>
            <li>• Com Supabase conectado, dados são sincronizados na nuvem</li>
            <li>• Seus planos ficam seguros mesmo se o app for reiniciado</li>
            <li>• Sincronização automática a cada login</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}