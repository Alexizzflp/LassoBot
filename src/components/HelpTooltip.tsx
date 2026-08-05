'use client';

import { useState, useEffect } from 'react';

interface HelpTooltipProps {
  moduleId: string;
  title: string;
  description: string;
}

export default function HelpTooltip({ moduleId, title, description }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState(true); // Default to true to prevent hydration mismatch, check in useEffect

  useEffect(() => {
    // Check localStorage after mount
    const seenKey = `lazzobot_help_seen_${moduleId}`;
    const seen = localStorage.getItem(seenKey);
    
    if (!seen) {
      setTimeout(() => {
        setHasSeen(false);
        setIsOpen(true);
      }, 0);
      // We don't set it to seen immediately, we wait until they close it
    }
  }, [moduleId]);

  const handleClose = () => {
    setIsOpen(false);
    if (!hasSeen) {
      localStorage.setItem(`lazzobot_help_seen_${moduleId}`, 'true');
      setHasSeen(true);
    }
  };

  const handleToggle = () => {
    if (!isOpen && !hasSeen) {
      localStorage.setItem(`lazzobot_help_seen_${moduleId}`, 'true');
      setHasSeen(true);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Tooltip Content */}
      <div 
        className={`mb-4 max-w-xs bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-2xl shadow-black/50 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-sky-400 text-sm flex items-center gap-1.5">
            <span>💡</span> {title}
          </h4>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? 'bg-slate-700 text-white border border-slate-600' 
            : 'bg-sky-600 text-white shadow-sky-600/30 hover:shadow-sky-600/50'
        } ${!hasSeen ? 'animate-pulse-glow' : ''}`}
        title="Ayuda del módulo"
      >
        <span className="text-xl font-bold">?</span>
      </button>
    </div>
  );
}
