'use client';

import Link from 'next/link';
import HelpTooltip from '@/components/HelpTooltip';

export default function OratoriaPage() {
  return (
    <div className="bg-[#070b14] text-slate-50 font-[system-ui] flex-1 flex flex-col h-full">


      {/* Contenido Próximamente */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg mx-auto animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 flex items-center justify-center">
            <span className="text-5xl">🎙️</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Oratoria
          </h2>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-6">
            🚧 Próximamente
          </span>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Calculadora de oratoria UTP, generación de guiones por diapositiva y herramientas para preparar exposiciones universitarias. Este módulo estará disponible en una próxima actualización.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-sky-600/20 hover:from-sky-500 hover:to-cyan-500 transition-all"
          >
            <span>←</span> Volver a Calificaciones
          </Link>
        </div>
      </main>

      <HelpTooltip 
        moduleId="oratoria"
        title="Módulo de Oratoria"
        description="Aquí podrás preparar tus charlas universitarias. La IA generará el guion exacto de lo que debes decir en cada diapositiva."
      />
    </div>
  );
}
