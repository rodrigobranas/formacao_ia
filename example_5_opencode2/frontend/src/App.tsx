import { useEffect, useState } from 'react'
import { WeatherPanel } from '@/components/WeatherPanel'

type ApiStatus = 'checking' | 'online' | 'offline'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`)
        setApiStatus(response.ok ? 'online' : 'offline')
      } catch {
        setApiStatus('offline')
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const statusConfig: Record<ApiStatus, { color: string; label: string }> = {
    checking: { color: 'bg-yellow-500', label: 'Verificando API' },
    online: { color: 'bg-green-500', label: 'API Online' },
    offline: { color: 'bg-red-500', label: 'API Offline' },
  }

  const { color, label } = statusConfig[apiStatus]

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col items-center justify-center gap-12">
        <header className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            IA para Devs
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Painel de clima em tempo real
          </p>
        </header>

        <WeatherPanel />

        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
          <div className={`h-2.5 w-2.5 rounded-full ${color} animate-pulse`} />
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
        </div>
      </div>
    </main>
  )
}

export default App
