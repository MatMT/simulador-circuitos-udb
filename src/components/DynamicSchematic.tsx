'use client';

import React, { useState } from 'react';
import { CircuitAnalysisResult, Wire, ResistorId } from '../types/circuit';
import { UDB_RESISTORS, getTerminalById } from '../utils/circuitEngine';
import { analyzeTopology } from '../utils/topologyAnalyzer';
import { verifyKirchhoffAndOhm } from '../utils/kirchhoffAnalyzer';
import TopologyStatusPanel from './analysis/TopologyStatusPanel';
import KirchhoffLawsPanel from './analysis/KirchhoffLawsPanel';
import FlowSchematic from './schematic/FlowSchematic';
import { Activity, Sliders, Cpu, AlertTriangle, Network, ShieldCheck } from 'lucide-react';

interface DynamicSchematicProps {
  wires?: Wire[];
  analysis: CircuitAnalysisResult;
  vin: number;
  setVin: (v: number) => void;
}

export default function DynamicSchematic({
  wires = [],
  analysis,
  vin,
  setVin
}: DynamicSchematicProps) {
  const [activeTab, setActiveTab] = useState<'live_mirror' | 'topology' | 'kirchhoff' | 'measurements'>('live_mirror');

  const topology = analyzeTopology(wires, vin);
  const kirchhoff = verifyKirchhoffAndOhm(analysis, vin);
  const shortedResistors = topology.shortedResistors;

  return (
    <div className="schematic-card flex flex-col gap-4">
      {/* Top Header con Control de Voltaje Integrado (Rediseño limpio sin bloques redundantes) */}
      <div className="schematic-header flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Cpu size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 block">
              Simulación Dinámica de Circuitos
            </span>
            <h2 className="font-bold text-slate-100 text-sm md:text-base flex items-center gap-2">
              <span>Panel de Análisis & Diagrama Orgánico</span>
            </h2>
          </div>
        </div>

        {/* Compact Floating Voltage Controller */}
        <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-md">
          <Sliders className="text-sky-400" size={15} />
          <span className="font-mono text-xs text-slate-400 font-bold">Suministro (V_in):</span>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={vin}
            onChange={(e) => setVin(Number(e.target.value))}
            className="w-28 h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-sky-400"
            title="Ajustar voltaje de fuente de 1V a 24V"
          />
          <span className="font-mono text-xs font-black text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-lg border border-sky-500/40 min-w-[48px] text-center">
            {vin} V
          </span>
        </div>
      </div>

      {/* Tab Selector Nav */}
      <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('live_mirror')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
            activeTab === 'live_mirror'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity size={14} />
          <span>⚡ Diagrama Orgánico</span>
        </button>

        <button
          onClick={() => setActiveTab('topology')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
            activeTab === 'topology'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Network size={14} />
          <span>🔗 Topología (R_eq)</span>
        </button>

        <button
          onClick={() => setActiveTab('kirchhoff')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
            activeTab === 'kirchhoff'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldCheck size={14} />
          <span>📐 Leyes de Kirchhoff</span>
        </button>

        <button
          onClick={() => setActiveTab('measurements')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
            activeTab === 'measurements'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders size={14} />
          <span>📊 Mediciones (V, I, P)</span>
        </button>
      </div>

      <div className="schematic-content">
        {/* TAB 1: REACT FLOW ORGANIC SCHEMATIC */}
        {activeTab === 'live_mirror' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            {shortedResistors.length > 0 && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center gap-3 text-xs font-mono text-amber-200 shadow-md">
                <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
                <span>
                  ⚠️ Componentes ignorados por cortocircuito entre sus terminales (+) y (-): {shortedResistors.map(r => r.id).join(', ')}.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-xs font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡ Lienzo de Conectividad ({topology.type})</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                {topology.connectedResistors.length} / 9 Resistencias en Pista
              </span>
            </div>

            {/* REACT FLOW DIAGRAM */}
            <FlowSchematic
              topology={topology}
              analysis={analysis}
              vin={vin}
            />
          </div>
        )}

        {/* TAB 2: TOPOLOGY STATUS PANEL */}
        {activeTab === 'topology' && (
          <TopologyStatusPanel
            topology={topology}
            simulatedReq={analysis.req}
          />
        )}

        {/* TAB 3: KIRCHHOFF LAWS AUDIT */}
        {activeTab === 'kirchhoff' && (
          <KirchhoffLawsPanel
            kirchhoff={kirchhoff}
            vin={vin}
          />
        )}

        {/* TAB 4: MEASUREMENTS TABLE */}
        {activeTab === 'measurements' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-slate-400 uppercase">Resistencia Equiv. (R_eq)</span>
                  <span className="text-xl font-black font-mono text-emerald-400 mt-1">
                    {analysis.req !== null ? `${analysis.req} Ω` : 'Circuito Abierto'}
                  </span>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-slate-400 uppercase">Corriente Total (I_T)</span>
                  <span className="text-xl font-black font-mono text-cyan-400 mt-1">
                    {analysis.totalCurrent} mA
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-3 bg-slate-950 border-b border-slate-800 font-mono text-xs font-bold text-slate-200 flex justify-between">
                <span>📊 Tabla de Mediciones del Solver MNA Exacto (V, I, P)</span>
                <span className="text-slate-500">Espejo en Vivo</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                      <th className="py-2.5 px-3">Componente</th>
                      <th className="py-2.5 px-3">Valor Nominal</th>
                      <th className="py-2.5 px-3">Caída (V)</th>
                      <th className="py-2.5 px-3">Corriente (I)</th>
                      <th className="py-2.5 px-3">Potencia Disipada (P)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {UDB_RESISTORS.map(r => {
                      const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
                      const isConn = topology.connectedResistors.some(item => item.id === r.id);
                      return (
                        <tr key={r.id} className={`hover:bg-slate-800/40 transition ${isConn ? 'bg-slate-800/25 text-slate-100 font-bold' : 'text-slate-500 opacity-60'}`}>
                          <td className="py-2.5 px-3 flex items-center gap-1.5">{r.id} {isConn && <span className="text-sky-400">●</span>}</td>
                          <td className="py-2.5 px-3 text-amber-400">{r.value} Ω</td>
                          <td className="py-2.5 px-3 text-sky-400">{meas.voltageDrop} V</td>
                          <td className="py-2.5 px-3 text-emerald-400">{meas.current} mA</td>
                          <td className="py-2.5 px-3 text-purple-400">{meas.power} mW</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
