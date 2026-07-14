'use client';

import React from 'react';
import { TopologyAnalysisResult } from '../../utils/topologyAnalyzer';
import { Network, ArrowRight, CheckCircle2, AlertTriangle, Layers, BookOpen } from 'lucide-react';

interface TopologyStatusPanelProps {
  topology: TopologyAnalysisResult;
  simulatedReq: number | null;
}

export default function TopologyStatusPanel({
  topology,
  simulatedReq
}: TopologyStatusPanelProps) {
  const getBadgeColor = () => {
    switch (topology.type) {
      case 'SERIE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/20';
      case 'PARALELO':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sky-500/20';
      case 'MIXTO':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20';
      case 'CORTOCIRCUITO':
        return 'bg-red-500/20 text-red-300 border-red-500/50 shadow-red-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4.5 shadow-xl flex flex-col gap-4">
      {/* Cabecera y Clasificación Topológica */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sky-400">
            <Network size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 block">
              Análisis Estructural de Red
            </span>
            <h3 className="font-bold text-slate-100 text-sm md:text-base">
              {topology.summaryTitle}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold border shadow-md ${getBadgeColor()}`}>
            ⚡ TOPOLOGÍA: {topology.type}
          </span>
        </div>
      </div>

      {/* Explicación estructural */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-sans">
        {topology.description}
      </p>

      {/* Comparativa de Resistencia Equivalente (Teórica por Reducción vs Simulación MNA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-slate-400">R<sub>eq</sub> Teórica (Reducción S-P)</span>
            <span className="text-base font-mono font-extrabold text-amber-400">
              {topology.theoreticalReq !== null ? `${topology.theoreticalReq} Ω` : 'N/A (MNA / Abierto)'}
            </span>
          </div>
          <BookOpen size={20} className="text-amber-400/60" />
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-slate-400">R<sub>eq</sub> Simulada (Matriz MNA)</span>
            <span className="text-base font-mono font-extrabold text-emerald-400">
              {simulatedReq !== null ? `${simulatedReq} Ω` : '∞ Ω (Abierto)'}
            </span>
          </div>
          <CheckCircle2 size={20} className="text-emerald-400/60" />
        </div>
      </div>

      {/* Árbol de Reducción Paso a Paso para Circuitos Mixtos o Paralelos */}
      {topology.reductionSteps.length > 0 && (
        <div className="flex flex-col gap-2.5 mt-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
            <Layers size={15} />
            <span>Árbol de Reducción Paso a Paso (Leyes de Red de Kirchhoff)</span>
          </div>

          <div className="flex flex-col gap-2">
            {topology.reductionSteps.map((step) => (
              <div
                key={step.stepIndex}
                className="bg-slate-950/90 border border-slate-800 hover:border-sky-500/40 rounded-xl p-3 transition flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono text-xs font-bold flex items-center justify-center">
                      #{step.stepIndex}
                    </span>
                    <span className="font-bold text-xs text-slate-200">
                      {step.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${step.type === 'paralelo' ? 'bg-sky-500/15 text-sky-400' : 'bg-purple-500/15 text-purple-400'}`}>
                      {step.type === 'paralelo' ? 'Derivación en Paralelo' : 'Suma en Serie'}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                    = {step.resultOhms} Ω
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-amber-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Fórmula de Reducción:</span>
                  <strong className="tracking-wide">{step.formula}</strong>
                </div>

                <p className="text-[11px] text-slate-400 font-sans pl-1">
                  {step.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen de Ramas Activas */}
      {topology.branches.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Ramas Conductoras Activas ({topology.branches.length}):
          </span>
          <div className="flex flex-wrap gap-2">
            {topology.branches.map((b) => (
              <div
                key={b.branchId}
                className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center gap-2"
              >
                <span className="text-sky-300 font-bold">{b.resistorIds.join(' + ')}</span>
                <ArrowRight size={12} className="text-slate-600" />
                <span className="text-emerald-400 font-extrabold">{b.branchResistance} Ω</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aviso si está cortocircuitado */}
      {topology.shortedResistors.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <span>
            Componentes ignorados por cortocircuito entre sus terminales: {topology.shortedResistors.map(r => r.id).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}
