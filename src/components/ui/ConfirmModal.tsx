'use client'

export default function ConfirmModal({ message, onConfirm, onCancel, isSubmitting }: { message: string; onConfirm: () => void; onCancel: () => void; isSubmitting: boolean }) {
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
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
          >
            {isSubmitting ? '...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
