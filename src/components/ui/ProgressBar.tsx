'use client'

export default function ProgressBar({ value, max, color, label }: { value: number | string; max: number; color: string; label: string }) {
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
