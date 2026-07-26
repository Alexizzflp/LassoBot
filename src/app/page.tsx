'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  crearMateria,
  crearCategoria,
  registrarNota,
  obtenerDatosMateria,
  obtenerMaterias,
  eliminarNota,
  actualizarNota,
  eliminarMateria,
  eliminarCategoria,
  actualizarCategoria
} from '@/lib/materias'
import { calcularPronostico } from '@/lib/calculadora'
import { Materia, CategoriaEvaluacion, Nota, Pronostico } from '@/types/grades'

// ── Toast Component ──
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-6 right-6 z-50 toast-enter">
      <div className="flex items-center gap-3 bg-emerald-900/90 border border-emerald-500/40 text-emerald-100 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm">
        <span className="text-lg">✓</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}

// ── Confirm Modal ──
function ConfirmModal({
  message,
  onConfirm,
  onCancel
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scale-in">
        <p className="text-slate-100 text-base mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors text-sm font-medium cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Modal ──
function EditModal({
  currentValue,
  onSave,
  onCancel
}: {
  currentValue: number
  onSave: (val: number) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(String(currentValue))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scale-in">
        <h4 className="text-slate-100 font-semibold mb-4">Editar calificación</h4>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all text-lg"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value && !isNaN(Number(value))) {
              onSave(Number(value))
            }
            if (e.key === 'Escape') onCancel()
          }}
        />
        <div className="flex gap-3 justify-end mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (value && !isNaN(Number(value))) onSave(Number(value))
            }}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors text-sm font-medium cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Categoria Modal ──
function EditCategoriaModal({
  nombre: initialNombre,
  peso: initialPeso,
  onSave,
  onCancel
}: {
  nombre: string
  peso: number
  onSave: (nombre: string, peso: number) => void
  onCancel: () => void
}) {
  const [nombre, setNombre] = useState(initialNombre)
  const [peso, setPeso] = useState(String(initialPeso))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scale-in">
        <h4 className="text-slate-100 font-semibold mb-4">Editar categoría</h4>
        <div className="space-y-3">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            autoFocus
            className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all text-sm"
          />
          <input
            type="number"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="Peso %"
            className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nombre && peso && !isNaN(Number(peso))) {
                onSave(nombre, Number(peso))
              }
              if (e.key === 'Escape') onCancel()
            }}
          />
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (nombre && peso && !isNaN(Number(peso))) onSave(nombre, Number(peso))
            }}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors text-sm font-medium cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Progress Bar ──
function ProgressBar({ value, max, color, label }: { value: number | string; max: number; color: string; label: string }) {
  const numValue = typeof value === 'number' ? value : 0
  const isSpecial = typeof value === 'string'
  const percentage = isSpecial ? 0 : Math.min((numValue / max) * 100, 100)
  const isImpossible = value === 'Imposible alcanzarla'
  const isSecured = value === '¡Ya asegurada!'

  const colorMap: Record<string, string> = {
    green: 'bg-emerald-500',
    blue: 'bg-sky-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-400',
  }

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-slate-300">{label}</span>
        <span className={`text-sm font-bold ${isImpossible ? 'text-red-400' : isSecured ? 'text-emerald-400' : 'text-slate-100'}`}>
          {isSpecial ? String(value) : `${numValue} pts promedio`}
        </span>
      </div>
      <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full animate-progress-fill transition-all ${isImpossible ? 'bg-red-500/30' : isSecured ? 'bg-emerald-500' : colorMap[color] || 'bg-sky-500'}`}
          style={{ width: isSecured ? '100%' : `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

// ── Main Page ──
export default function Home() {
  const [materias, setMaterias] = useState<Materia[]>([])
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<Materia | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDatos, setLoadingDatos] = useState(false)

  // Formularios
  const [nombreMateria, setNombreMateria] = useState('')
  const [esFundamental, setEsFundamental] = useState(false)
  const [nombreCat, setNombreCat] = useState('')
  const [pesoCat, setPesoCat] = useState('')
  const [catSeleccionada, setCatSeleccionada] = useState('')
  const [tituloNota, setTituloNota] = useState('')
  const [puntosNota, setPuntosNota] = useState('')

  // Datos reales
  const [categorias, setCategorias] = useState<CategoriaEvaluacion[]>([])
  const [notas, setNotas] = useState<Nota[]>([])
  const [pronosticoReal, setPronosticoReal] = useState<Pronostico | null>(null)

  // Modales & Toast
  const [toast, setToast] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'nota' | 'materia' | 'categoria'; id: string } | null>(null)
  const [editNota, setEditNota] = useState<{ id: string; puntos: number } | null>(null)
  const [editCategoria, setEditCategoria] = useState<{ id: string; nombre: string; peso: number } | null>(null)

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
  }, [])

  useEffect(() => {
    cargarListaMaterias()
  }, [])

  const cargarListaMaterias = async () => {
    setLoading(true)
    try {
      const lista = await obtenerMaterias()
      setMaterias(lista)
    } finally {
      setLoading(false)
    }
  }

  const seleccionarMateria = async (mat: Materia) => {
    setMateriaSeleccionada(mat)
    setSidebarOpen(false)
    await recargarDatos(mat)
  }

  const recargarDatos = async (mat: Materia) => {
    if (!mat.id) return
    setLoadingDatos(true)
    try {
      const { categorias: cats, notas: nts } = await obtenerDatosMateria(mat.id)
      setCategorias(cats)
      setNotas(nts)
      const pron = calcularPronostico(cats, nts, mat.es_fundamental)
      setPronosticoReal(pron)
    } finally {
      setLoadingDatos(false)
    }
  }

  // ── Handlers ──
  const handleCrearMateria = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreMateria) return
    const nueva = await crearMateria(nombreMateria, esFundamental)
    setNombreMateria('')
    setEsFundamental(false)
    await cargarListaMaterias()
    seleccionarMateria(nueva)
    showToast('Materia creada')
  }

  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!materiaSeleccionada?.id || !nombreCat || !pesoCat) return
    await crearCategoria(materiaSeleccionada.id, nombreCat, Number(pesoCat))
    setNombreCat('')
    setPesoCat('')
    await recargarDatos(materiaSeleccionada)
    showToast('Categoría agregada')
  }

  const handleRegistrarNota = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catSeleccionada || !tituloNota || !puntosNota) return
    await registrarNota(catSeleccionada, tituloNota, Number(puntosNota))
    setTituloNota('')
    setPuntosNota('')
    await recargarDatos(materiaSeleccionada!)
    showToast('Nota registrada')
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return
    if (confirmDelete.type === 'nota') {
      await eliminarNota(confirmDelete.id)
      await recargarDatos(materiaSeleccionada!)
      showToast('Nota eliminada')
    } else if (confirmDelete.type === 'categoria') {
      await eliminarCategoria(confirmDelete.id)
      await recargarDatos(materiaSeleccionada!)
      showToast('Categoría eliminada')
    } else {
      await eliminarMateria(confirmDelete.id)
      setMateriaSeleccionada(null)
      await cargarListaMaterias()
      showToast('Materia eliminada')
    }
    setConfirmDelete(null)
  }

  const handleSaveEdit = async (nuevosPuntos: number) => {
    if (!editNota) return
    await actualizarNota(editNota.id, nuevosPuntos)
    await recargarDatos(materiaSeleccionada!)
    setEditNota(null)
    showToast('Nota actualizada')
  }

  const handleSaveEditCategoria = async (nombre: string, peso: number) => {
    if (!editCategoria) return
    await actualizarCategoria(editCategoria.id, nombre, peso)
    await recargarDatos(materiaSeleccionada!)
    setEditCategoria(null)
    showToast('Categoría actualizada')
  }

  // ── Peso total de categorías ──
  const pesoTotal = categorias.reduce((s, c) => s + c.peso_porcentaje, 0)

  return (
    <div className="bg-[#070b14] text-slate-50 min-h-screen font-[system-ui]">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Modales */}
      {confirmDelete && (
        <ConfirmModal
          message={
            confirmDelete.type === 'materia'
              ? '¿Eliminar esta materia y todas sus notas?'
              : confirmDelete.type === 'categoria'
              ? '¿Eliminar esta categoría y todas sus notas asociadas?'
              : '¿Eliminar esta nota?'
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {editNota && (
        <EditModal
          currentValue={editNota.puntos}
          onSave={handleSaveEdit}
          onCancel={() => setEditNota(null)}
        />
      )}
      {editCategoria && (
        <EditCategoriaModal
          nombre={editCategoria.nombre}
          peso={editCategoria.peso}
          onSave={handleSaveEditCategoria}
          onCancel={() => setEditCategoria(null)}
        />
      )}

      {/* Header */}
      <header className="border-b border-slate-800/60 bg-[#0a0f1a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                Lazzobot
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Pronóstico de Calificaciones UTP 🇵🇦</p>
            </div>
          </div>
          {materiaSeleccionada && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                materiaSeleccionada.es_fundamental
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
              }`}>
                {materiaSeleccionada.es_fundamental ? 'Fundamental · Mín. 71' : 'No Fundamental · Mín. 61'}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* ── Sidebar ── */}
          <aside className={`
            fixed md:relative inset-0 z-30 md:z-auto
            ${sidebarOpen ? 'block' : 'hidden'} md:block
            w-full md:w-80 md:min-w-[320px] md:flex-shrink-0
          `}>
            {/* Overlay for mobile */}
            <div
              className="fixed inset-0 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="relative z-10 w-80 max-w-[85vw] h-full md:h-auto bg-[#0c1120] md:bg-transparent overflow-y-auto md:overflow-visible p-4 md:p-0">
              {/* Materias List */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span className="text-lg">📚</span> Mis Materias
                  </h3>
                  <span className="text-xs text-slate-500">{materias.length} total</span>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-shimmer" />
                    ))}
                  </div>
                ) : materias.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-slate-500 text-sm">No tienes materias aún</p>
                    <p className="text-slate-600 text-xs mt-1">Crea tu primera materia abajo ↓</p>
                  </div>
                ) : (
                  <div className="space-y-2 stagger-children">
                    {materias.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => seleccionarMateria(m)}
                        className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                          materiaSeleccionada?.id === m.id
                            ? 'border-sky-500/50 bg-sky-500/10 shadow-lg shadow-sky-500/5'
                            : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{m.nombre}</p>
                          <p className={`text-xs mt-0.5 ${m.es_fundamental ? 'text-rose-400' : 'text-sky-400'}`}>
                            {m.es_fundamental ? 'Fundamental' : 'No Fundamental'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'materia', id: m.id! }) }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Crear Materia */}
                <div className="mt-5 pt-5 border-t border-slate-700/50">
                  <form onSubmit={handleCrearMateria} className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                      <span>+</span> Nueva Materia
                    </h4>
                    <input
                      type="text"
                      placeholder="Nombre de la materia"
                      value={nombreMateria}
                      onChange={(e) => setNombreMateria(e.target.value)}
                      className="w-full bg-slate-800/60 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm placeholder:text-slate-600"
                    />
                    <label className="flex items-center gap-2.5 text-sm text-slate-400 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={esFundamental}
                        onChange={(e) => setEsFundamental(e.target.checked)}
                        className="rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500/30"
                      />
                      <span className="group-hover:text-slate-300 transition-colors">Es Fundamental (Requiere C)</span>
                    </label>
                    <button
                      type="submit"
                      className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/20 text-sm cursor-pointer"
                    >
                      Guardar Materia
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0 space-y-5">
            {materiaSeleccionada ? (
              loadingDatos ? (
                <div className="space-y-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-slate-900/50 border border-slate-800 rounded-2xl animate-shimmer" />
                  ))}
                </div>
              ) : (
                <>
                  {/* ── Reglas del Profesor ── */}
                  <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 animate-slide-up">
                    <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                      <span className="text-lg">⚙️</span>
                      Reglas del Profesor
                      <span className="text-xs text-slate-500 ml-auto font-normal">
                        {materiaSeleccionada.nombre}
                      </span>
                    </h3>

                    <form onSubmit={handleCrearCategoria} className="flex flex-wrap gap-3 mb-4">
                      <input
                        type="text"
                        placeholder="Categoría (Ej: Parciales)"
                        value={nombreCat}
                        onChange={(e) => setNombreCat(e.target.value)}
                        className="flex-1 min-w-[180px] bg-slate-800/60 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm placeholder:text-slate-600"
                      />
                      <input
                        type="number"
                        placeholder="Peso %"
                        value={pesoCat}
                        onChange={(e) => setPesoCat(e.target.value)}
                        className="w-24 bg-slate-800/60 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm placeholder:text-slate-600"
                      />
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all text-sm cursor-pointer hover:shadow-lg hover:shadow-emerald-500/20"
                      >
                        + Agregar
                      </button>
                    </form>

                    {categorias.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {categorias.map((c) => (
                          <span
                            key={c.id}
                            className="group bg-slate-800/80 border border-slate-700/50 px-3.5 py-1.5 rounded-full text-sm text-slate-300 flex items-center gap-1.5 transition-all hover:border-slate-600"
                          >
                            {c.nombre}
                            <span className="text-sky-400 font-semibold">{c.peso_porcentaje}%</span>
                            <button
                              onClick={() => setEditCategoria({ id: c.id!, nombre: c.nombre, peso: c.peso_porcentaje })}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-all cursor-pointer ml-0.5"
                              title="Editar"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ type: 'categoria', id: c.id! })}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                              title="Eliminar"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                        <span className={`px-3.5 py-1.5 rounded-full text-sm font-medium ${
                          pesoTotal === 100
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          Total: {pesoTotal}%
                          {pesoTotal === 100 ? ' ✓' : ' ⚠'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-slate-600 text-sm">Agrega las categorías de evaluación del profesor</p>
                    )}
                  </section>

                  {/* ── Calificaciones ── */}
                  {categorias.length > 0 && (
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '80ms' }}>
                      <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                        <span className="text-lg">📝</span> Calificaciones
                      </h3>

                      <form onSubmit={handleRegistrarNota} className="flex flex-wrap gap-3 mb-5">
                        <select
                          value={catSeleccionada}
                          onChange={(e) => setCatSeleccionada(e.target.value)}
                          className="flex-1 min-w-[160px] bg-slate-800/60 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 transition-all text-sm cursor-pointer"
                        >
                          <option value="">Categoría</option>
                          {categorias.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre} ({c.peso_porcentaje}%)</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Título (Ej: Parcial 1)"
                          value={tituloNota}
                          onChange={(e) => setTituloNota(e.target.value)}
                          className="flex-1 min-w-[140px] bg-slate-800/60 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm placeholder:text-slate-600"
                        />
                        <input
                          type="number"
                          placeholder="Nota"
                          value={puntosNota}
                          onChange={(e) => setPuntosNota(e.target.value)}
                          className="w-20 bg-slate-800/60 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm placeholder:text-slate-600"
                        />
                        <button
                          type="submit"
                          className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all text-sm cursor-pointer hover:shadow-lg hover:shadow-sky-500/20"
                        >
                          Guardar
                        </button>
                      </form>

                      {notas.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-700/50 bg-slate-800/40">
                                <th className="text-left px-4 py-3 text-slate-400 font-medium">Categoría</th>
                                <th className="text-left px-4 py-3 text-slate-400 font-medium">Título</th>
                                <th className="text-left px-4 py-3 text-slate-400 font-medium">Nota</th>
                                <th className="text-right px-4 py-3 text-slate-400 font-medium">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="stagger-children">
                              {notas.map((n) => {
                                const cat = categorias.find((c) => c.id === n.categoria_id)
                                return (
                                  <tr key={n.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="px-4 py-3 text-slate-400">{cat?.nombre}</td>
                                    <td className="px-4 py-3">{n.titulo}</td>
                                    <td className="px-4 py-3">
                                      <span className={`font-bold ${
                                        n.puntos_obtenidos >= 91 ? 'text-emerald-400' :
                                        n.puntos_obtenidos >= 81 ? 'text-sky-400' :
                                        n.puntos_obtenidos >= 71 ? 'text-amber-400' :
                                        'text-red-400'
                                      }`}>
                                        {n.puntos_obtenidos}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex gap-1.5 justify-end">
                                        <button
                                          onClick={() => setEditNota({ id: n.id!, puntos: n.puntos_obtenidos })}
                                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-all cursor-pointer"
                                          title="Editar"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() => setConfirmDelete({ type: 'nota', id: n.id! })}
                                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                                          title="Eliminar"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-3xl mb-2">📋</div>
                          <p className="text-slate-500 text-sm">Sin notas registradas</p>
                          <p className="text-slate-600 text-xs mt-1">Registra tu primera calificación arriba</p>
                        </div>
                      )}
                    </section>
                  )}

                  {/* ── Dashboard Pronóstico ── */}
                  {pronosticoReal && (
                    <section className="animate-slide-up" style={{ animationDelay: '160ms' }}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Estado Actual */}
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-sky-500/20 rounded-2xl p-5 shadow-lg shadow-sky-500/5">
                          <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                            <span className="text-lg">📊</span> Estado Actual
                          </h3>

                          <div className="grid grid-cols-3 gap-3 mb-5">
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                              <p className="text-2xl font-bold text-sky-400">{pronosticoReal.puntos_actuales}</p>
                              <p className="text-xs text-slate-500 mt-1">Puntos</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                              <p className="text-2xl font-bold text-emerald-400">{pronosticoReal.porcentaje_acumulado}%</p>
                              <p className="text-xs text-slate-500 mt-1">Evaluado</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                              <p className="text-2xl font-bold text-amber-400">{pronosticoReal.porcentaje_restante}%</p>
                              <p className="text-xs text-slate-500 mt-1">Falta</p>
                            </div>
                          </div>

                          {/* Progress bar del semestre */}
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>Progreso del semestre</span>
                              <span>{pronosticoReal.porcentaje_acumulado}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 animate-progress-fill"
                                style={{ width: `${pronosticoReal.porcentaje_acumulado}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Lo que necesitas */}
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-700/50 rounded-2xl p-5">
                          <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                            <span className="text-lg">🎯</span> Lo que necesitas
                          </h3>

                          <ProgressBar
                            value={pronosticoReal.para_pasar_materia}
                            max={100}
                            color="cyan"
                            label={`Aprobar (${pronosticoReal.nota_minima_aprobar} pts)`}
                          />
                          <ProgressBar
                            value={pronosticoReal.para_A}
                            max={100}
                            color="green"
                            label="Para A (91 pts)"
                          />
                          <ProgressBar
                            value={pronosticoReal.para_B}
                            max={100}
                            color="blue"
                            label="Para B (81 pts)"
                          />
                          <ProgressBar
                            value={pronosticoReal.para_C}
                            max={100}
                            color="yellow"
                            label="Para C (71 pts)"
                          />
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )
            ) : (
              /* ── Empty State ── */
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="text-6xl mb-5">📖</div>
                <h2 className="text-xl font-semibold text-slate-200 mb-2">Selecciona una materia</h2>
                <p className="text-slate-500 text-sm text-center max-w-xs">
                  Elige una materia del panel lateral o crea una nueva para comenzar a registrar tus calificaciones.
                </p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="mt-6 md:hidden bg-sky-600 hover:bg-sky-500 text-white font-medium px-6 py-2.5 rounded-xl transition-all text-sm cursor-pointer"
                >
                  Ver materias
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}