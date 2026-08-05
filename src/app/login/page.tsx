'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Autocompletamos el correo institucional detrás de escena
    const email = `${username.trim()}@utp.ac.pa`

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (authError) throw authError
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (authError) throw authError
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : 'Ocurrió un error inesperado'
      let errorMsg = rawMsg
      if (rawMsg.includes('Invalid login credentials')) {
        errorMsg = 'Usuario o contraseña incorrectos. Verifica tus datos.'
      } else if (rawMsg.includes('User already registered')) {
        errorMsg = 'Este usuario ya está registrado. Inicia sesión.'
      }
      setError(errorMsg)
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!username) {
      setError('Por favor, ingresa tu Usuario UTP primero.')
      return
    }
    setLoading(true)
    setError(null)
    const email = `${username.trim()}@utp.ac.pa`
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
      // Show success message without error styling
      setError('¡Enlace enviado! Revisa tu correo institucional.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el enlace.')
    } finally {
      setLoading(false)
    }
  }

  // Función para entrar sin registro (Anónimo)
  const handleGuestLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInAnonymously()
      if (authError) throw authError

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión como invitado. Verifica la configuración de Supabase.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#030509] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Botón flotante de información */}
      <div className="absolute top-6 right-6 z-50 group">
        <button className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-400 flex items-center justify-center hover:bg-sky-500/20 hover:text-sky-400 hover:border-sky-500/50 transition-all backdrop-blur-md shadow-lg cursor-help">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        {/* Nube explicativa (Tooltip gigante) */}
        <div className="absolute top-14 right-0 w-[320px] sm:w-[380px] max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 transform origin-top-right">
          <h3 className="text-sky-400 font-bold mb-1 text-base flex items-center gap-2">
            Sobre LassoBot 🤠
          </h3>
          <p className="text-slate-300 text-[13px] leading-relaxed mb-3">
            Tu asistente académico inteligente, creado para organizar y optimizar tu vida universitaria en la UTP.
          </p>

          <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-2 border-b border-slate-700/80 pb-1.5">✨ Ya Disponible</h4>
          <ul className="text-slate-400 text-xs space-y-2 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0">✓</span>
              <span><strong>Pronósticos exactos:</strong> Calcula al instante la nota mínima que necesitas para aprobar.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0">✓</span>
              <span><strong>Reglas UTP:</strong> Diferencia automáticamente entre materias Fundamentales (mín. 71) y Regulares (mín. 61).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0">✓</span>
              <span><strong>Nube Segura:</strong> Tus datos sincronizados siempre en cualquier dispositivo.</span>
            </li>
          </ul>

          <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-2 border-b border-slate-700/80 pb-1.5">🚀 Próximamente (Impulsado por IA)</h4>
          <ul className="text-slate-400 text-xs space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-sky-400 shrink-0">🤖</span>
              <span><strong>Generación de Docs:</strong> Creación automática de Word, PowerPoint, investigaciones y guiones de charla.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400 shrink-0">📂</span>
              <span><strong>Portafolios Virtuales:</strong> Estructuración y redacción inteligente de tus evidencias académicas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400 shrink-0">🧠</span>
              <span><strong>Asistente IA Integral:</strong> Automatización de tareas repetitivas para que enfoques tu tiempo en aprender.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full max-w-[440px] bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 sm:p-8 rounded-3xl shadow-2xl relative z-10 overflow-hidden">

        {/* Adorno visual superior (la línea azul) */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400"></div>

        <div className="mb-5 text-center flex flex-col items-center">
          {/* Logo con brillo natural */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-3 flex items-center justify-center group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_login2.png?v=2"
              alt="LassoBot Logo"
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(56,189,248,0.7)] group-hover:scale-105 transition-all duration-500"
            />
          </div>
          
          <div className="w-2/3 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent my-4"></div>
          
          <p className="text-sky-400 text-xs font-semibold tracking-wide uppercase">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-sm mb-4 flex items-start gap-2 animate-fade-in">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-slate-300 text-xs font-medium ml-1">Usuario UTP</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Ej: alexis.morales10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl pl-9 py-2.5 pr-[95px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all hover:border-slate-600 text-sm"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-medium pointer-events-none select-none">
                @utp.ac.pa
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300 text-xs font-medium ml-1">Contraseña</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl pl-9 py-2.5 pr-10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all hover:border-slate-600 tracking-wide text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 focus:outline-none rounded-lg hover:bg-slate-800 transition-colors"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-1.581c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-[11px] text-slate-400 hover:text-sky-400 transition-colors focus:outline-none"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username || password.length < 6}
            className="w-full relative overflow-hidden bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transform hover:-translate-y-0.5 disabled:transform-none flex justify-center items-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="mt-3 flex flex-col gap-2.5">
          {/* Botón de Invitado */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full relative overflow-hidden bg-slate-800/50 hover:bg-slate-700/80 text-slate-300 font-medium py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/50 flex justify-center items-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Entrar como Invitado
          </button>

          <div className="text-center border-t border-slate-700/50 pt-5">
            <p className="text-slate-400 text-xs sm:text-[13px]">
              {isLogin ? '¿Primera vez en LassoBot?' : '¿Ya tienes una bóveda?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                  setPassword('')
                }}
                className="ml-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors focus:outline-none focus:underline"
              >
                {isLogin ? 'Crea tu cuenta' : 'Inicia Sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer minimalista adaptado y siempre visible */}
      <div className="mt-6 text-slate-500 text-xs font-medium tracking-wide z-10 relative">
        <p>Una herramienta diseñada para estudiantes de la UTP.</p>
      </div>
    </div>
  )
}
