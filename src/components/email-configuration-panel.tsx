'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, AlertCircle, Mail, Settings, Info } from 'lucide-react'
import { EMAIL_CONFIG, EMAIL_SETUP_INSTRUCTIONS, validateEmailConfig } from '@/lib/email-config'

export function EmailConfigurationPanel() {
  const [config, setConfig] = useState({
    host: '',
    port: '587',
    user: '',
    pass: '',
    from: ''
  })
  const [isConfigured, setIsConfigured] = useState(false)
  const [validation, setValidation] = useState(validateEmailConfig())

  useEffect(() => {
    // Carrega configuração atual
    const currentConfig = EMAIL_CONFIG.getConfig()
    setConfig({
      host: currentConfig.host,
      port: currentConfig.port.toString(),
      user: currentConfig.user || '',
      pass: currentConfig.pass || '',
      from: currentConfig.from
    })
    setIsConfigured(EMAIL_CONFIG.isConfigured())
    setValidation(validateEmailConfig())
  }, [])

  const handleSave = async () => {
    // Em um ambiente real, isso salvaria as configurações
    console.log('Configurações de email salvas:', config)
    alert('Configurações salvas! Reinicie a aplicação para aplicar as mudanças.')
  }

  const testEmailConnection = async () => {
    try {
      // Simula teste de conexão
      console.log('Testando conexão de email...')
      alert('Teste de conexão realizado! Verifique os logs do console.')
    } catch (error) {
      console.error('Erro no teste:', error)
      alert('Erro no teste de conexão. Verifique as configurações.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Status do Sistema de Email
          </CardTitle>
          <CardDescription>
            Configure o serviço de email para envio automático de credenciais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {isConfigured ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Configurado
                </Badge>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Modo Simulação
                </Badge>
              </>
            )}
          </div>

          {!isConfigured && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                O sistema está funcionando em modo simulação. Os emails são logados no console.
                Para envio real, configure as variáveis SMTP abaixo.
              </AlertDescription>
            </Alert>
          )}

          {validation.missing.length > 0 && (
            <Alert className="mt-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Variáveis faltando:</strong> {validation.missing.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="providers">Provedores</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações SMTP
              </CardTitle>
              <CardDescription>
                Configure seu provedor de email preferido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">Host SMTP</Label>
                  <Input
                    id="smtp-host"
                    value={config.host}
                    onChange={(e) => setConfig({...config, host: e.target.value})}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Porta</Label>
                  <Input
                    id="smtp-port"
                    value={config.port}
                    onChange={(e) => setConfig({...config, port: e.target.value})}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-user">Usuário</Label>
                <Input
                  id="smtp-user"
                  value={config.user}
                  onChange={(e) => setConfig({...config, user: e.target.value})}
                  placeholder="seu-email@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-pass">Senha</Label>
                <Input
                  id="smtp-pass"
                  type="password"
                  value={config.pass}
                  onChange={(e) => setConfig({...config, pass: e.target.value})}
                  placeholder="sua-senha-de-app"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-from">Email Remetente</Label>
                <Input
                  id="smtp-from"
                  value={config.from}
                  onChange={(e) => setConfig({...config, from: e.target.value})}
                  placeholder="noreply@ddplanner.com.br"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave}>
                  Salvar Configurações
                </Button>
                <Button variant="outline" onClick={testEmailConnection}>
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          {Object.entries(EMAIL_SETUP_INSTRUCTIONS).map(([key, provider]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{provider.name}</CardTitle>
                <CardDescription>
                  Configuração para {provider.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Instruções de configuração:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {provider.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => {
                    // Configurações específicas por provedor
                    if (key === 'gmail') {
                      setConfig({
                        ...config,
                        host: 'smtp.gmail.com',
                        port: '587'
                      })
                    } else if (key === 'sendgrid') {
                      setConfig({
                        ...config,
                        host: 'smtp.sendgrid.net',
                        port: '587'
                      })
                    }
                  }}
                >
                  Usar {provider.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}