'use client';

import React, { useState } from 'react';
import { CIRCUIT_PRESETS, CircuitPreset } from '../utils/circuitPresets';
import { Wire } from '../types/circuit';
import { BookOpen, Zap, X, ArrowRight, Layers, CheckCircle, ShieldCheck } from 'lucide-react';

interface CircuitTestBenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPreset: (wires: Wire[], vin?: number) => void;
}

export default function CircuitTestBenchModal({
  isOpen,
  onClose,
  onLoadPreset
}: CircuitTestBenchModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'serie' | 'paralelo' | 'mixto'>('all');
  const [selectedPreset, setSelectedPreset] = useState<CircuitPreset | null>(CIRCUIT_PRESETS[3]); // Mixto UDB Guía por defecto

  if (!isOpen) return null;

  const filteredPresets = selectedCategory === 'all'
    ? CIRCUIT_PRESETS
    : CIRCUIT_PRESETS.filter(p => p.category === selectedCategory);

  const getCategoryBadge = (cat: 'serie' | 'paralelo' | 'mixto') => {
    switch (cat) {
      case 'serie':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'paralelo':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/50';
      case 'mixto':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Básico': return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
      case 'Intermedio': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Avanzado': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-slate-400 border-slate-700 bg-slate-800';
    }
  };

  const handleLoad = (preset: CircuitPreset) => {
    onLoadPreset(preset.wires, 12);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-sky-500/40 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/40 text-sky-400">
              <BookOpen size={24} />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-sky-400 block">
                Universidad Don Bosco — Banco de Pruebas Canónicas
              </span>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-100 flex items-center gap-2">
                <span>Laboratorio de Pruebas: Circuitos Completos & Mixtos</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* Categorías Filter */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold text-slate-400 mr-1">Filtrar por Topología:</span>
          
          {(['all', 'serie', 'paralelo', 'mixto'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? '🌟 Todos los Circuitos (5)' : cat === 'serie' ? '⚡ Serie Puro' : cat === 'paralelo' ? '⚡ Paralelo Puro' : '⚡ Circuitos Mixtos UDB'}
            </button>
          ))}
        </div>

        {/* Contenido Principal (Lista Izquierda + Detalle Derecha) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[460px]">
          
          {/* Lista de Presets */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-800 p-4 overflow-y-auto flex flex-col gap-2.5 bg-slate-950/30">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPreset?.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-sky-500 shadow-lg shadow-sky-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase border ${getCategoryBadge(preset.category)}`}>
                      {preset.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getDifficultyColor(preset.difficulty)}`}>
                      {preset.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-sm">{preset.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{preset.description}</p>

                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-800/60 text-xs font-mono">
                    <span className="text-slate-400">R<sub>eq</sub> Esperada:</span>
                    <strong className="text-emerald-400 font-extrabold">{preset.expectedReq} Ω</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel de Detalle & Carga de Preset Seleccionado */}
          <div className="md:col-span-7 p-6 overflow-y-auto flex flex-col justify-between gap-6 bg-slate-900/40">
            {selectedPreset ? (
              <div className="flex flex-col gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase border ${getCategoryBadge(selectedPreset.category)}`}>
                      ⚡ Topología: {selectedPreset.category}
                    </span>
                    <span className={`px-3 py-1 rounded text-xs font-mono font-bold border ${getDifficultyColor(selectedPreset.difficulty)}`}>
                      Nivel: {selectedPreset.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-100 mb-2">
                    {selectedPreset.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    {selectedPreset.description}
                  </p>
                </div>

                {/* Fórmula Teórica */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                    Sustentación Teórica (Ley de Kirchhoff & Reducción):
                  </span>
                  <div className="text-sm font-mono font-black text-amber-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    {selectedPreset.formulaExplanation}
                  </div>
                </div>

                {/* Características clave */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span>Puntos Clave de Evaluación en Simulación:</span>
                  </span>
                  <ul className="flex flex-col gap-2">
                    {selectedPreset.keyFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 font-sans">
                        <CheckCircle size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resumen cables jack instalados */}
                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-sky-400" />
                    <span className="text-slate-300">Cables Jack preconfigurados en tablero:</span>
                  </div>
                  <strong className="text-sky-300 bg-sky-500/15 px-3 py-1 rounded-lg border border-sky-500/30">
                    {selectedPreset.wires.length} Conexiones Jack
                  </strong>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Selecciona un circuito a la izquierda para ver su detalle teórico y cargarlo en el tablero acrílico.
              </div>
            )}

            {/* Acción Cargar */}
            {selectedPreset && (
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleLoad(selectedPreset)}
                  className="px-6 py-3 rounded-xl font-mono text-sm font-extrabold text-white bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 shadow-lg shadow-sky-500/25 flex items-center gap-2 transition transform hover:scale-[1.02] cursor-pointer"
                >
                  <Zap size={18} />
                  <span>⚡ Cargar y Probar en Tablero ({selectedPreset.expectedReq} Ω)</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
