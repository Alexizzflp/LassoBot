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
import HelpTooltip from '@/components/HelpTooltip'

import Toast from '@/components/ui/Toast'
import ConfirmModal from '@/components/ui/ConfirmModal'
import EditModal from '@/components/ui/EditModal'
import EditCategoriaModal from '@/components/ui/EditCategoriaModal'
import ProgressBar from '@/components/ui/ProgressBar'

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

  // Asistencia
  const [catAsistencia, setCatAsistencia] = useState('')
  const [totalClases, setTotalClases] = useState('')
  const [clasesAsistidas, setClasesAsistidas] = useState('')

  // Modales & Toast
  const [toast, setToast] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'nota' | 'materia' | 'categoria'; id: string } | null>(null)
  const [editNota, setEditNota] = useState<{ id: string; puntos: number } | null>(null)
  const [editCategoria, setEditCategoria] = useState<{ id: string; nombre: string; peso: number } | null>(null)

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Submitting states
  const [isSubmittingMateria, setIsSubmittingMateria] = useState(false)
  const [isSubmittingCategoria, setIsSubmittingCategoria] = useState(false)
  const [isSubmittingNota, setIsSubmittingNota] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
  }, [])

  const cargarListaMaterias = async () => {
    setLoading(true)
    try {
      const lista = await obtenerMaterias()
      setMaterias(lista)
    } catch {
      showToast('⚠️ Error de conexión: Verifica si tu proyecto de Supabase está activo')
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
    } catch {
      showToast('⚠️ Error de conexión con la base de datos')
    } finally {
      setLoadingDatos(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarListaMaterias()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Handlers (con manejo de errores) ──
  const handleCrearMateria = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreMateria.trim() || isSubmittingMateria) return
    setIsSubmittingMateria(true)
    try {
      const nueva = await crearMateria(nombreMateria.trim(), esFundamental)
      setNombreMateria('')
      setEsFundamental(false)
      await cargarListaMaterias()
      seleccionarMateria(nueva)
      showToast('Materia creada')
    } catch { showToast('Error al crear materia') }
    finally { setIsSubmittingMateria(false) }
  }

  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!materiaSeleccionada?.id || !nombreCat.trim() || !pesoCat || isSubmittingCategoria) return
    const peso = Number(pesoCat)
    if (peso <= 0 || peso > 100) return
    if (pesoTotal + peso > 100) {
      showToast(`Solo quedan ${100 - pesoTotal}% disponibles`)
      return
    }
    setIsSubmittingCategoria(true)
    try {
      await crearCategoria(materiaSeleccionada.id, nombreCat.trim(), peso)
      setNombreCat('')
      setPesoCat('')
      await recargarDatos(materiaSeleccionada)
      showToast('Categoría agregada')
    } catch { showToast('Error al crear categoría') }
    finally { setIsSubmittingCategoria(false) }
  }

  const handleRegistrarNota = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catSeleccionada || !tituloNota.trim() || !puntosNota || isSubmittingNota) return
    const puntos = Number(puntosNota)
    if (puntos < 0 || puntos > 100) {
      showToast('La nota debe estar entre 0 y 100')
      return
    }
    setIsSubmittingNota(true)
    try {
      await registrarNota(catSeleccionada, tituloNota.trim(), puntos)
      setTituloNota('')
      setPuntosNota('')
      await recargarDatos(materiaSeleccionada!)
      showToast('Nota registrada')
    } catch { showToast('Error al registrar nota') }
    finally { setIsSubmittingNota(false) }
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete || isDeleting) return
    setIsDeleting(true)
    try {
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
    } catch { showToast('Error al eliminar') }
    finally {
      setIsDeleting(false)
      setConfirmDelete(null)
    }
  }

  const handleSaveEdit = async (nuevosPuntos: number) => {
    if (!editNota || isEditing) return
    if (nuevosPuntos < 0 || nuevosPuntos > 100) {
      showToast('La nota debe estar entre 0 y 100')
      return
    }
    setIsEditing(true)
    try {
      await actualizarNota(editNota.id, nuevosPuntos)
      await recargarDatos(materiaSeleccionada!)
      setEditNota(null)
      showToast('Nota actualizada')
    } catch { showToast('Error al actualizar nota') }
    finally { setIsEditing(false) }
  }

  const handleSaveEditCategoria = async (nombre: string, peso: number) => {
    if (!editCategoria || isEditing) return
    if (peso <= 0 || peso > 100) return
    setIsEditing(true)
    try {
      await actualizarCategoria(editCategoria.id, nombre.trim(), peso)
      await recargarDatos(materiaSeleccionada!)
      setEditCategoria(null)
      showToast('Categoría actualizada')
    } catch { showToast('Error al actualizar categoría') }
    finally { setIsEditing(false) }
  }

  const handleRegistrarAsistencia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catAsistencia || !totalClases || !clasesAsistidas) return
    const total = Number(totalClases)
    const asistidas = Number(clasesAsistidas)
    if (total <= 0 || asistidas < 0 || asistidas > total) {
      showToast('Verifica los datos de asistencia')
      return
    }
    const notaAsistencia = Math.round((asistidas / total) * 100)
    try {
      await registrarNota(catAsistencia, `Asistencia (${asistidas}/${total})`, notaAsistencia)
      setTotalClases('')
      setClasesAsistidas('')
      await recargarDatos(materiaSeleccionada!)
      showToast(`Asistencia registrada: ${notaAsistencia} pts`)
    } catch { showToast('Error al registrar asistencia') }
  }

  const asistenciaPreview = totalClases && clasesAsistidas && Number(totalClases) > 0
    ? Math.round((Number(clasesAsistidas) / Number(totalClases)) * 100)
    : null

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
          isSubmitting={isDeleting}
        />
      )}
      {editNota && (
        <EditModal
          currentValue={editNota.puntos}
          onSave={handleSaveEdit}
          onCancel={() => setEditNota(null)}
          isSubmitting={isEditing}
        />
      )}
      {editCategoria && (
        <EditCategoriaModal
          nombre={editCategoria.nombre}
          peso={editCategoria.peso}
          onSave={handleSaveEditCategoria}
          onCancel={() => setEditCategoria(null)}
          isSubmitting={isEditing}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 -ml-2 rounded-xl text-slate-400 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">Mis Materias</span>
          </button>
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

            <div className="relative z-10 w-80 max-w-[85vw] h-full md:h-auto bg-[#0a0f1a] md:bg-transparent overflow-y-auto md:overflow-visible p-4 md:p-0 border-r border-slate-800 md:border-none md:sticky md:top-24 md:max-h-[calc(100vh-120px)] flex flex-col">
              {/* Materias List */}
              <div className="bg-[#0f1525] border border-slate-800/80 shadow-xl shadow-black/20 rounded-2xl p-5 animate-slide-up">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-[15px] flex items-center gap-2 tracking-wide text-slate-100">
                    <span className="text-lg">📚</span> Mis Materias
                  </h3>
                  <span className="text-[11px] font-bold bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full">{materias.length}</span>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-shimmer" />
                    ))}
                  </div>
                ) : materias.length === 0 ? (
                  <div className="text-center py-10 bg-slate-900/30 rounded-xl border border-dashed border-slate-800/80">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
                      <span className="text-2xl">📭</span>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">No tienes materias aún</p>
                    <p className="text-slate-500 text-xs mt-1">Crea tu primera materia abajo ↓</p>
                  </div>
                ) : (
                  <div className="space-y-2 stagger-children overflow-y-auto max-h-[35vh] md:max-h-[45vh] p-1.5 -m-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {materias.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => seleccionarMateria(m)}
                        className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                          materiaSeleccionada?.id === m.id
                            ? 'border-sky-500/50 bg-sky-500/10 shadow-lg shadow-sky-500/5 hover:shadow-sky-500/10'
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
                      disabled={isSubmittingMateria || !nombreMateria.trim()}
                      className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/20 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmittingMateria ? 'Guardando...' : 'Guardar Materia'}
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
                        placeholder={`Peso % (disp: ${100 - pesoTotal}%)`}
                        value={pesoCat}
                        onChange={(e) => setPesoCat(e.target.value)}
                        min="1"
                        max={100 - pesoTotal}
                        className="w-36 bg-slate-800/60 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm placeholder:text-slate-600"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingCategoria || !nombreCat.trim() || !pesoCat || pesoTotal >= 100}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all text-sm cursor-pointer hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 disabled:hover:shadow-none flex items-center justify-center min-w-[100px]"
                      >
                        {isSubmittingCategoria ? '...' : '+ Agregar'}
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
                      <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                        <span className="text-3xl mb-2">⚙️</span>
                        <p className="text-slate-400 text-sm font-medium">Aún no hay categorías</p>
                        <p className="text-slate-500 text-xs mt-1 max-w-[200px]">Agrega las categorías de evaluación del profesor (ej: Parciales 30%)</p>
                      </div>
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
                          placeholder="0-100"
                          value={puntosNota}
                          onChange={(e) => setPuntosNota(e.target.value)}
                          min="0"
                          max="100"
                          className="w-20 bg-slate-800/60 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm placeholder:text-slate-600"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingNota || !catSeleccionada || !tituloNota.trim() || !puntosNota}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all text-sm cursor-pointer hover:shadow-lg hover:shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-sky-600 disabled:hover:shadow-none flex items-center justify-center min-w-[100px]"
                        >
                          {isSubmittingNota ? '...' : 'Guardar'}
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
                        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800/80">
                          <div className="w-14 h-14 mx-auto rounded-full bg-sky-900/20 text-sky-400 flex items-center justify-center mb-4">
                            <span className="text-2xl">📋</span>
                          </div>
                          <p className="text-slate-300 text-sm font-medium">Sin notas registradas</p>
                          <p className="text-slate-500 text-xs mt-1">Registra tu primera calificación en el formulario</p>
                        </div>
                      )}
                    </section>
                  )}

                  {/* ── Asistencia ── */}
                  {categorias.length > 0 && (
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '120ms' }}>
                      <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                        <span className="text-lg">📋</span> Calculadora de Asistencia
                      </h3>
                      <p className="text-slate-500 text-xs mb-4">
                        Selecciona la categoría de asistencia, ingresa las clases y el sistema calculará la nota automáticamente.
                      </p>

                      <form onSubmit={handleRegistrarAsistencia} className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[160px]">
                          <label className="text-xs text-slate-500 mb-1 block">Categoría</label>
                          <select
                            value={catAsistencia}
                            onChange={(e) => setCatAsistencia(e.target.value)}
                            className="w-full bg-slate-800/60 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 transition-all text-sm cursor-pointer"
                          >
                            <option value="">Seleccionar</option>
                            {categorias.map((c) => (
                              <option key={c.id} value={c.id}>{c.nombre} ({c.peso_porcentaje}%)</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-28">
                          <label className="text-xs text-slate-500 mb-1 block">Total clases</label>
                          <input
                            type="number"
                            placeholder="Ej: 16"
                            value={totalClases}
                            onChange={(e) => setTotalClases(e.target.value)}
                            min="1"
                            className="w-full bg-slate-800/60 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm placeholder:text-slate-600"
                          />
                        </div>
                        <div className="w-28">
                          <label className="text-xs text-slate-500 mb-1 block">Asistidas</label>
                          <input
                            type="number"
                            placeholder="Ej: 14"
                            value={clasesAsistidas}
                            onChange={(e) => setClasesAsistidas(e.target.value)}
                            min="0"
                            max={totalClases || undefined}
                            className="w-full bg-slate-800/60 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm placeholder:text-slate-600"
                          />
                        </div>

                        {/* Preview en vivo */}
                        {asistenciaPreview !== null && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                            <span className="text-xs text-slate-500">Nota:</span>
                            <span className={`text-lg font-bold ${
                              asistenciaPreview >= 91 ? 'text-emerald-400' :
                              asistenciaPreview >= 81 ? 'text-sky-400' :
                              asistenciaPreview >= 71 ? 'text-amber-400' :
                              'text-red-400'
                            }`}>
                              {asistenciaPreview}
                            </span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={!catAsistencia || !totalClases || !clasesAsistidas || Number(clasesAsistidas) > Number(totalClases)}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all text-sm cursor-pointer hover:shadow-lg hover:shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-sky-600 disabled:hover:shadow-none"
                        >
                          Guardar
                        </button>
                      </form>
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
                            <span className={`ml-auto text-xs px-3 py-1 rounded-full font-semibold ${
                              pronosticoReal.estado === 'aprobada'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : pronosticoReal.estado === 'reprobada'
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}>
                              {pronosticoReal.estado === 'aprobada' ? '✓ Aprobada' : pronosticoReal.estado === 'reprobada' ? '✗ A Repetir' : '● En Curso'}
                            </span>
                          </h3>

                          <div className="grid grid-cols-3 gap-3 mb-5">
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                              <p className="text-2xl font-bold text-sky-400">{pronosticoReal.puntos_actuales}</p>
                              <p className="text-xs text-slate-500 mt-1">Puntos</p>
                              <p className="text-xs mt-0.5 font-medium" style={{ color: pronosticoReal.puntos_actuales >= 91 ? '#34d399' : pronosticoReal.puntos_actuales >= 81 ? '#38bdf8' : pronosticoReal.puntos_actuales >= 71 ? '#fbbf24' : pronosticoReal.puntos_actuales >= 61 ? '#fb923c' : '#f87171' }}>
                                {pronosticoReal.porcentaje_acumulado > 0 ? (pronosticoReal.puntos_actuales >= 91 ? 'Letra A' : pronosticoReal.puntos_actuales >= 81 ? 'Letra B' : pronosticoReal.puntos_actuales >= 71 ? 'Letra C' : pronosticoReal.puntos_actuales >= 61 ? 'Letra D' : 'Letra F') : ''}
                              </p>
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

      {/* Tooltip de Ayuda */}
      <HelpTooltip 
        moduleId="calificaciones"
        title="Módulo de Calificaciones"
        description="Aquí puedes registrar tus materias, agregar las categorías de evaluación que indique tu profesor (ej: Parciales 30%, Proyecto 40%) y anotar tus calificaciones. El sistema calculará automáticamente qué nota necesitas en los siguientes trabajos para aprobar."
      />
    </div>
  )
}