'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const NAV_LINKS = [
  { href: '/', label: 'Calificaciones', icon: '📊' },
  { href: '/investigaciones', label: 'Investigaciones', icon: '📑' },
  { href: '/oratoria', label: 'Oratoria', icon: '🎙️' },
  { href: '/portafolios', label: 'Portafolios', icon: '📁' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };



  useEffect(() => {
    if (!navRef.current) return;
    
    const activeIndex = NAV_LINKS.findIndex(link => link.href === pathname);
    
    const updatePill = () => {
      if (activeIndex !== -1 && navRef.current) {
        const linkElements = Array.from(navRef.current.querySelectorAll('a'));
        const activeElement = linkElements[activeIndex];
        
        if (activeElement) {
          setPillStyle({
            left: activeElement.offsetLeft,
            width: activeElement.offsetWidth,
            opacity: 1
          });
        }
      } else {
        setPillStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    // Ejecutamos inicial para setear posición
    updatePill();
    
    // Usamos un pequeño timeout para asegurar que las fuentes/iconos hayan renderizado bien los anchos
    const timeoutId = setTimeout(updatePill, 50);

    window.addEventListener('resize', updatePill);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePill);
    };
  }, [pathname]);

  if (pathname === '/login' || pathname === '/update-password') {
    return null;
  }

  return (
    <header className="border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        {/* Lado Izquierdo: Logo */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <Link href="/" className="flex items-center group select-none transition-opacity" title="Inicio">
            {/* Contenedor de tamaño normal para no afectar la barra */}
            <div className="relative flex items-center justify-center h-10 sm:h-12 w-auto">
              {/* La imagen usa scale para verse más grande sin ocupar más espacio físico en el layout */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Logo Oficial Lazzobot"
                className="object-contain h-10 sm:h-12 w-auto scale-[1.7] sm:scale-[2.3] origin-left drop-shadow-xl transition-transform duration-300 hover:scale-[1.75] sm:hover:scale-[2.4] hover:opacity-90"
              />
              {/* Espaciador invisible para que la imagen escalada no pise otros elementos a su derecha */}
              <div className="w-[50px] sm:w-[120px]"></div>
            </div>
          </Link>
        </div>

        {/* Lado Derecho: Navegación de Módulos Animada (Tipo Gota) */}
        <nav 
          ref={navRef}
          className="relative flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto w-full sm:w-auto"
        >
          {/* Pastilla animada que se desliza por debajo de los textos */}
          <div 
            className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 shadow-md transition-all duration-300 ease-out z-0 pointer-events-none"
            style={{ 
              left: `${pillStyle.left}px`, 
              width: `${pillStyle.width}px`, 
              opacity: pillStyle.opacity 
            }}
          />

          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative z-10 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{link.icon}</span> {link.label}
              </Link>
            );
          })}
          
          {/* Botón de Cerrar Sesión */}
          <button
            onClick={handleSignOut}
            title="Cerrar sesión"
            className="relative z-10 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 ml-2"
          >
            <span>🚪</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
