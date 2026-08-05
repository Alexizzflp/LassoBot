'use client'

import { useState } from 'react'

export default function EditModal({
  currentValue,
  onSave,
  onCancel,
  isSubmitting
}: {
  currentValue: number
  onSave: (val: number) => void
  onCancel: () => void
  isSubmitting: boolean
}) {
  const [value, setValue] = useState(String(currentValue))
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    const num = Number(value)
    if (!value || isNaN(num)) {
      setError('Por favor ingresa un número válido')
      return
    }
    if (num < 0 || num > 100) {
      setError('La calificación debe estar entre 0 y 100')
      return
    }
    setError(null)
    onSave(num)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scale-in">
        <h4 className="text-slate-100 font-semibold mb-4">Editar calificación</h4>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          autoFocus
          className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all text-lg"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') onCancel()
          }}
        />
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <div className="flex gap-3 justify-end mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || !value || isNaN(Number(value))}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
          >
            {isSubmitting ? '...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
