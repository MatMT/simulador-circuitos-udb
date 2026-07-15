'use client';

import React from 'react';
import { Rocket, Sparkles, Heart, ExternalLink, ShieldCheck } from 'lucide-react';

const InstagramIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const GithubIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function OlaLabsFooter() {
  return (
    <footer className="w-full bg-[#03050a] border-t border-slate-800/80 py-10 px-6 md:px-12 flex-shrink-0 text-slate-400 select-none relative overflow-hidden">
      {/* Luz ambiental difusa de fondo */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-8 relative z-10">
        {/* Sección Principal en 3 Columnas Distribuidas y Espaciadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-between">

          {/* Columna 1: Brand & Créditos de Desarrollo */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-sky-500/20">
                ~
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight font-sans">
                OlaLabs
              </span>
              <span className="text-[10px] font-mono font-bold bg-sky-500/15 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30">
                PRO
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm">
              Una plataforma académica y tecnológica desarrollada por <strong className="text-slate-200">OlaLabs</strong> para potenciar el aprendizaje experimental en la <strong className="text-slate-200">Universidad Don Bosco</strong>.
            </p>

            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 mt-1">
              <span>Diseñada & programada por <strong className="text-white font-bold underline decoration-sky-500/50 underline-offset-4">Mateo Elías</strong></span>
              <Heart size={13} className="text-rose-500 fill-rose-500/30 inline" />
            </div>
          </div>

          {/* Columna 2: Tarjeta Beta y Solicitud de Feedback */}
          <div className="flex flex-col items-center justify-center w-full">
            <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 max-w-md w-full text-center flex flex-col gap-2 group">
              <div className="flex items-center justify-center gap-2">
                <Rocket size={16} className="text-amber-400 transform group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-xs font-mono font-extrabold text-amber-300 tracking-wider uppercase">
                  Estamos en Versión Beta 🚀
                </span>
              </div>
              <p className="text-xs text-slate-300/90 font-sans leading-normal">
                Tu feedback es fundamental para perfeccionar y expandir las capacidades de esta herramienta de simulación.
              </p>
            </div>
          </div>

          {/* Columna 3: Enlaces Sociales & Conexión minimalista */}
          <div className="flex flex-col items-center md:items-end gap-3 w-full">
            <span className="text-xs font-mono text-slate-400 font-semibold tracking-wider uppercase">
              Dudas, sugerencias o errores aquí:
            </span>

            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/byelias._"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-950/60 to-pink-950/60 hover:from-purple-900/80 hover:to-pink-900/80 text-white border border-pink-500/30 hover:border-pink-400 transition-all duration-200 shadow-lg shadow-pink-500/10 group cursor-pointer"
                title="Sigue a @byelias._ en Instagram"
              >
                <InstagramIcon size={16} className="text-pink-400 group-hover:scale-110 transition-transform" />
                <span className="font-sans font-bold text-xs">@byelias._</span>
                <ExternalLink size={12} className="text-pink-300/70" />
              </a>

              <a
                href="https://github.com/MatMT"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-500 transition-all duration-200 shadow-md group cursor-pointer"
                title="Ver repositorio en GitHub @MatMT"
              >
                <GithubIcon size={16} className="text-slate-300 group-hover:scale-110 transition-transform" />
                <span className="font-sans font-bold text-xs">GitHub</span>
                <ExternalLink size={12} className="text-slate-400" />
              </a>
            </div>
          </div>

        </div>

        {/* Línea Divisoria Inferior y Copyright / Detalles de Precisión */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500/70" />
            <span>Simulador Exacto UDB — Motor MNA & Leyes de Kirchhoff</span>
          </div>

          <div>
            © {new Date().getFullYear()} <strong className="text-slate-400 font-semibold">OlaLabs</strong> · Mateo Elías. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
