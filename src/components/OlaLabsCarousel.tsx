'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles, Lightbulb, PenTool, Smartphone, Tag } from 'lucide-react';

interface CarouselSlide {
  id: number;
  brandCategory: 'APPLE' | 'SAMSUNG' | 'UNIVERSAL';
  subtitle: string;
  title: React.ReactNode;
  body: React.ReactNode;
  ctaText: string;
  ctaStyle: string;
  badgeStyle: string;
  auroraGlow: string;
  cardSurface: string;
  borderColor: string;
  isLight: boolean;
  navContainerStyle: string;
  navArrowStyle: string;
  activeDotColor: string;
  inactiveDotColor: string;
  dividerStyle: string;
  imageSrc?: string;
  imageAlt?: string;
}

const SLIDES: CarouselSlide[] = [
  {
    id: 1,
    brandCategory: 'APPLE',
    subtitle: 'Ecosistema Apple',
    title: (
      <span className="text-[#1d1d1f] font-black tracking-tight">
        Precisión para tu Apple Pencil.
      </span>
    ),
    body: (
      <span className="text-[#515154] font-medium">
        Puntas de alto rendimiento y fundas magnéticas diseñadas para tu flujo creativo universitario.
      </span>
    ),
    ctaText: 'Explorar Apple →',
    ctaStyle: 'bg-[#1d1d1f] text-white hover:bg-black font-sans font-bold rounded-full px-5 py-2.5 shadow-lg shadow-black/15 transition-all transform hover:scale-105 border border-[#1d1d1f]',
    badgeStyle: 'bg-[#FE326D]/15 border-[#FE326D]/40 text-[#FE326D]',
    auroraGlow: 'radial-gradient(circle at 15% 50%, rgba(254, 50, 109, 0.12) 0%, rgba(170, 161, 228, 0.1) 50%, transparent 80%)',
    cardSurface: 'bg-[#ffffff] text-[#1d1d1f]',
    borderColor: 'border-[#d2d2d7] hover:border-[#86868b]',
    isLight: true,
    navContainerStyle: 'bg-[#f5f5f7] border border-[#d2d2d7]',
    navArrowStyle: 'text-[#515154] hover:text-[#1d1d1f] hover:bg-[#e8e8ed]',
    activeDotColor: 'bg-[#FE326D] shadow-sm shadow-[#FE326D]/40',
    inactiveDotColor: 'bg-[#d2d2d7] hover:bg-[#86868b]',
    dividerStyle: 'border-[#d2d2d7]',
    imageSrc: '/Apple.png',
    imageAlt: 'Puntas y accesorios para Apple Pencil'
  },
  {
    id: 2,
    brandCategory: 'SAMSUNG',
    subtitle: 'Ecosistema Samsung',
    title: (
      <span className="bg-gradient-to-r from-[#2997ff] via-[#06b6d4] to-[#60a5fa] bg-clip-text text-transparent font-black tracking-tight">
        Fluidez para tu S-Pen.
      </span>
    ),
    body: (
      <span className="text-[#d2d2d7]">
        Repuestos de alta precisión y durabilidad sin interrupciones para Galaxy Tab & Ultra.
      </span>
    ),
    ctaText: 'Explorar Samsung →',
    ctaStyle: 'bg-[#0071e3] text-white hover:bg-[#2997ff] font-sans font-bold rounded-full px-5 py-2.5 shadow-lg shadow-[#0071e3]/40 transition-all transform hover:scale-105 border border-[#2997ff]/40',
    badgeStyle: 'bg-[#0071e3]/25 border-[#2997ff]/50 text-[#2997ff]',
    auroraGlow: 'radial-gradient(circle at 85% 50%, rgba(37, 99, 235, 0.35) 0%, rgba(6, 182, 212, 0.22) 50%, transparent 80%)',
    cardSurface: 'bg-[#000000] text-[#f5f5f7]',
    borderColor: 'border-[#2997ff]/40 hover:border-[#2997ff]/70',
    isLight: false,
    navContainerStyle: 'bg-[#09090b] border border-[#424245]/60',
    navArrowStyle: 'text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/10',
    activeDotColor: 'bg-[#2997ff] shadow-sm shadow-[#2997ff]/50',
    inactiveDotColor: 'bg-[#424245] hover:bg-[#86868b]',
    dividerStyle: 'border-[#424245]/60',
    imageSrc: '/Samsung.jpeg',
    imageAlt: 'Repuestos para estilete Samsung S-Pen'
  },
  {
    id: 3,
    brandCategory: 'UNIVERSAL',
    subtitle: '💡 Beneficio Estudiantes UDB · Catálogo Tech',
    title: (
      <span className="text-white font-black tracking-tight">
        Fundas para iPad, Wallets y Más.
      </span>
    ),
    body: (
      <span className="text-[#d2d2d7]">
        <strong className="text-[#FFCD8E] font-black tracking-wide bg-[#FFCD8E]/15 px-1.5 py-0.5 rounded border border-[#FFCD8E]/40 mr-1">$1 USD DE DESCUENTO</strong> en fundas para iPad, Wallets MagSafe y accesorios al mencionar el simulador.
      </span>
    ),
    ctaText: 'Ver Todo el Catálogo →',
    ctaStyle: 'bg-gradient-to-r from-[#0071e3] via-[#2997ff] to-[#0077ed] text-white font-sans font-extrabold rounded-full px-5 py-2.5 shadow-xl shadow-[#0071e3]/50 transition-all transform hover:scale-105 border border-[#2997ff]/50',
    badgeStyle: 'bg-[#FFCD8E]/15 border-[#FFCD8E]/40 text-[#FFCD8E]',
    auroraGlow: 'radial-gradient(circle at 50% 50%, rgba(0, 113, 227, 0.35) 0%, rgba(254, 154, 66, 0.22) 60%, transparent 90%)',
    cardSurface: 'bg-[#0a0e1a] text-white',
    borderColor: 'border-[#2997ff]/60 hover:border-[#FFCD8E]/60',
    isLight: false,
    navContainerStyle: 'bg-[#05070d] border border-[#424245]/60',
    navArrowStyle: 'text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/10',
    activeDotColor: 'bg-[#FFCD8E] shadow-sm shadow-[#FFCD8E]/50',
    inactiveDotColor: 'bg-[#424245] hover:bg-[#86868b]',
    dividerStyle: 'border-[#424245]/60',
    imageSrc: '/OlaLabsLogo.png',
    imageAlt: 'OlaLabs Studio Logo'
  }
];

const OLA_STUDIO_URL = 'https://ola-studio-tan.vercel.app';

export default function OlaLabsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlide(prev => (prev + 1) % SLIDES.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const getRedirectUrl = (slideId: number) => {
    if (slideId === 1) return `${OLA_STUDIO_URL}/apple`;
    if (slideId === 2) return `${OLA_STUDIO_URL}/samsung`;
    return OLA_STUDIO_URL;
  };

  const handleSlideClick = (slideId: number) => {
    window.open(getRedirectUrl(slideId), '_blank', 'noopener,noreferrer');
  };

  const handleCtaClick = (e: React.MouseEvent, slideId: number) => {
    e.stopPropagation();
    window.open(getRedirectUrl(slideId), '_blank', 'noopener,noreferrer');
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="w-full px-6 pt-3 pb-2 flex-shrink-0 select-none">
      <div
        className={`relative w-full rounded-2xl p-5 md:px-7 md:py-5 ${slide.cardSurface} border ${slide.borderColor} shadow-2xl transition-all duration-700 ease-out group overflow-hidden cursor-pointer`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => handleSlideClick(slide.id)}
        style={{
          backgroundImage: slide.auroraGlow
        }}
      >
        {/* Etiqueta superior del patrocinador */}
        <div className={`flex items-center justify-between pb-3 mb-3 border-b ${slide.dividerStyle} text-xs font-sans transition-colors duration-500`}>
          <div className="flex items-center gap-2">
            <span className={`inline-block rounded-full h-2 w-2 ${slide.isLight ? 'bg-[#FE326D]' : 'bg-[#2997ff]'}`} />
            <span className={`font-extrabold tracking-tight ${slide.isLight ? 'text-[#1d1d1f]' : 'text-[#f5f5f7]'}`}>
              OlaStudio
            </span>
            <span className={slide.isLight ? 'text-[#86868b] hidden sm:inline' : 'text-[#86868b] hidden sm:inline'}>|</span>
            <span className={`${slide.isLight ? 'text-[#515154]' : 'text-[#86868b]'} hidden sm:inline font-medium`}>
              Patrocinador Oficial
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-2.5">
            {/* Esquina / Badge permanente de Descuento de $1 USD en cada tab */}
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-extrabold tracking-tight bg-gradient-to-r from-[#FFCD8E] via-[#FE9A42] to-[#FF7B00] text-slate-950 shadow-sm border border-amber-300/60">
              <span>🎁 -$1 USD OFF</span>
            </span>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${slide.badgeStyle}`}>
              {slide.brandCategory}
            </span>
          </div>
        </div>

        {/* Cuerpo del Slide */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-5 z-10">

          {/* Columna Izquierda: Imagen de Producto y/o Ícono + Titular y Texto */}
          <div className="flex items-center gap-5 min-w-0 flex-1">
            {/* Si el slide cuenta con imagen de producto real (Apple.png / Samsung.jpeg / OlaLabsLogo.png) */}
            {slide.imageSrc ? (
              <div className={`hidden sm:block relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border transition-all duration-500 group-hover:scale-105 ${slide.isLight
                ? 'border-[#d2d2d7] bg-[#f5f5f7] shadow-black/10'
                : slide.id === 3
                  ? 'border-white/20 bg-slate-950/95 shadow-blue-500/25 p-1.5'
                  : 'border-[#2997ff]/40 bg-[#0a0e1a] shadow-blue-500/15'
                }`}>
                <img
                  src={slide.imageSrc}
                  alt={slide.imageAlt || slide.brandCategory}
                  className={`w-full h-full transform group-hover:scale-110 transition-transform duration-700 ${slide.id === 3 ? 'object-contain' : 'object-cover object-center'
                    }`}
                />
                <div className="absolute top-1.5 right-1.5 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold text-white uppercase tracking-wider border border-white/10 shadow">
                  {slide.brandCategory}
                </div>
              </div>
            ) : (
              /* Logo Oficial de OlaLabs Studio (Fallback cuando no hay imageSrc) */
              <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0071e3] via-[#2997ff] to-[#06b6d4] items-center justify-center flex-shrink-0 shadow-2xl shadow-[#0071e3]/40 border border-white/20 transition-all duration-500 group-hover:scale-105">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-white font-extrabold text-2xl leading-none font-mono tracking-tighter shadow-sm">
                    ~
                  </span>
                  <span className="text-[7.5px] font-mono font-black text-white/95 tracking-widest mt-0.5 uppercase">
                    OLALABS
                  </span>
                </div>
              </div>
            )}

            {/* Titular y Cuerpo */}
            <div className="min-w-0 flex-1 font-sans">
              <span className={`text-xs font-semibold block mb-1 tracking-wide uppercase ${slide.isLight ? 'text-[#86868b]' : 'text-[#86868b]'}`}>
                {slide.subtitle}
              </span>

              <h3 className="text-base md:text-lg tracking-tight leading-snug">
                {slide.title}
              </h3>

              <div className="text-xs md:text-sm mt-1 line-clamp-2 md:line-clamp-1 leading-relaxed">
                {slide.body}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Botón de Acción y Controles de Navegación */}
          <div className={`flex items-center justify-between md:justify-end gap-4 w-full md:w-auto flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 font-sans transition-colors duration-500 ${slide.dividerStyle}`}>
            <button
              onClick={e => handleCtaClick(e, slide.id)}
              className={`flex items-center gap-2 text-xs md:text-sm transition-all duration-200 cursor-pointer flex-shrink-0 ${slide.ctaStyle}`}
              title="Ir a la categoría en la tienda oficial de OlaStudio"
            >
              <span>{slide.ctaText}</span>
              <ExternalLink size={14} className="opacity-90" />
            </button>

            {/* Flechas e Indicadores OlaStudio */}
            <div className={`flex items-center gap-2 p-1.5 rounded-xl transition-colors duration-500 ${slide.navContainerStyle}`} onClick={e => e.stopPropagation()}>
              <button
                onClick={prevSlide}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${slide.navArrowStyle}`}
                title="Slide anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5 px-1">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${currentSlide === idx
                      ? `w-6 ${slide.activeDotColor}`
                      : `w-1.5 ${slide.inactiveDotColor}`
                      }`}
                    title={`Ver slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${slide.navArrowStyle}`}
                title="Siguiente slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
