'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario realmente llegó aquí a través de un link de recuperación válido
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Enlace inválido o expirado. Por favor, intenta de nuevo.')
      }
    })
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setMessage('¡Contraseña actualizada con éxito!')
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 selection:bg-sky-500/30">
      <div className="w-full max-w-[360px] animate-fade-in">
        <div className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Actualizar Contraseña
            </h1>
            <p className="text-slate-400 text-sm mt-2">Ingresa tu nueva clave de acceso</p>
          </div>

          {(error || message) && (
            <div className={`p-3 rounded-xl mb-5 text-sm font-medium flex items-center gap-2 ${
              error 
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              <span className="text-lg">{error ? '⚠️' : '✓'}</span>
              <p className="leading-relaxed">{error || message}</p>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-slate-300 text-xs font-medium ml-1">Nueva Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 mt-2 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transform hover:-translate-y-0.5 disabled:transform-none text-sm"
            >
              {loading ? 'Actualizando...' : 'Guardar y Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => router.push('/login')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
