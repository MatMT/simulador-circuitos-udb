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
  const [activeTab, setActiveTab] = useState<'live_mirror' | 'topology' | 'kirchhoff' | 'measurements'>('measurements');
  const [diagramEngine, setDiagramEngine] = useState<'reactflow' | 'blueprint'>('reactflow');
  const [hoveredElement, setHoveredElement] = useState<{ type: 'resistor' | 'wire'; id: string } | null>(null);

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
        <div className="w-full flex items-center justify-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shadow-md">
          <Sliders className="text-sky-400" size={16} />
          <span className="font-mono text-xs text-slate-400 font-bold whitespace-nowrap">Suministro (V):</span>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={vin}
            onChange={(e) => setVin(Number(e.target.value))}
            className="flex-1 w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-sky-400"
            title="Ajustar voltaje de fuente de 1V a 30V"
          />
          <span className="font-mono text-xs font-black text-sky-300 bg-sky-500/20 px-3 py-1 rounded-lg border border-sky-500/40 min-w-[56px] text-center">
            {vin} V
          </span>
        </div>
      </div>

      {/* Tab Selector Nav */}
      <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('measurements')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${activeTab === 'measurements'
            ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
        >
          <Sliders size={14} />
          <span>📊 Mediciones</span>
        </button>

        <button
          onClick={() => setActiveTab('topology')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${activeTab === 'topology'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
        >
          <Network size={14} />
          <span>🔗 Topología</span>
        </button>

        <button
          onClick={() => setActiveTab('kirchhoff')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${activeTab === 'kirchhoff'
            ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
        >
          <ShieldCheck size={14} />
          <span>📐 Kirchhoff</span>
        </button>

        {/* Oculto de momento por requerimiento del usuario: Tab de Diagrama ('live_mirror') */}
        {/*
        <button
          onClick={() => setActiveTab('live_mirror')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${activeTab === 'live_mirror'
            ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
        >
          <Activity size={14} />
          <span>⚡ Diagrama</span>
        </button>
        */}
      </div>

      <div className="schematic-content">
        {/* TAB 1: LIVE MIRROR SCHEMATIC DIAGRAM */}
        {activeTab === 'live_mirror' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Short Circuit Warning */}
            {shortedResistors.length > 0 && (
              <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl flex items-center gap-3 text-xs font-semibold text-amber-200">
                <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
                <span>
                  ⚠️ Detectada conexión en paralelo directa / corto en la terminal (+) y (-) de: {shortedResistors.map(r => r.id).join(', ')}.
                </span>
              </div>
            )}

            {/* REAL GRAPHICAL OR REACT FLOW SCHEMATIC CANVAS */}
            <div className="bg-slate-950 border border-sky-500/40 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡ Diagrama de Conexión ({topology.type})</span>
                  </h4>
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-inner">
                    <button
                      onClick={() => setDiagramEngine('reactflow')}
                      className={`px-3 py-1 rounded-md font-mono text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1.5 ${diagramEngine === 'reactflow'
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                      <span>⚡ React Flow Orgánico (@xyflow)</span>
                    </button>
                    <button
                      onClick={() => setDiagramEngine('blueprint')}
                      className={`px-3 py-1 rounded-md font-mono text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1.5 ${diagramEngine === 'blueprint'
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                      <span>📐 Blueprint 2D</span>
                    </button>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                  {topology.connectedResistors.length} / 9 Componentes en Pista
                </span>
              </div>

              {diagramEngine === 'reactflow' ? (
                <FlowSchematic
                  topology={topology}
                  analysis={analysis}
                  vin={vin}
                />
              ) : topology.connectedResistors.length === 0 ? (
                <div className="text-center py-12 px-4 text-slate-500 font-mono text-xs flex flex-col items-center gap-2 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                  <Activity size={40} className="text-sky-400/40 mb-1" />
                  <p className="text-slate-300 font-bold text-sm">Lienzo Esquemático Limpio</p>
                  <p className="max-w-sm text-[11px] text-slate-400">
                    Conecta cables desde la Fuente 1 (+) hacia cualquier resistencia en el tablero izquierdo para renderizar aquí el diagrama gráfico con pistas eléctricas.
                  </p>
                </div>
              ) : (
                <div className="w-full bg-[#050914] border border-slate-800 rounded-xl p-2 relative overflow-x-auto flex flex-col gap-2">
                  {/* Panel de Inspección Rápida en Vivo al Hover sobre Pistas o Componentes */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between text-xs font-mono transition-all min-h-[50px] shadow-lg">
                    {hoveredElement ? (
                      hoveredElement.type === 'resistor' ? (() => {
                        const r = UDB_RESISTORS.find(item => item.id === hoveredElement.id);
                        const meas = analysis.measurements[hoveredElement.id as ResistorId] || { voltageDrop: 0, current: 0, power: 0 };
                        return (
                          <div className="flex items-center justify-between w-full flex-wrap gap-3 animate-fade-in">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40">Resistencia {r?.id}</span>
                              <span className="text-slate-200">Valor nominal: <strong className="text-amber-400">{r?.value && r.value >= 1000 ? `${(r.value / 1000).toFixed(1)} kΩ` : `${r?.value} Ω`}</strong></span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold">
                              <span>Caída de Voltaje: <strong className="text-sky-400">{meas.voltageDrop} V</strong></span>
                              <span>Corriente: <strong className="text-emerald-400">{meas.current} mA</strong></span>
                              <span>Potencia: <strong className="text-purple-400">{(meas.voltageDrop * meas.current).toFixed(2)} mW</strong></span>
                            </div>
                          </div>
                        );
                      })() : (() => {
                        const w = wires.find(item => item.id === hoveredElement.id);
                        const t1 = getTerminalById(w?.fromTerminalId || '');
                        const t2 = getTerminalById(w?.toTerminalId || '');
                        return (
                          <div className="flex items-center justify-between w-full flex-wrap gap-3 animate-fade-in">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg font-bold text-slate-950 shadow border border-white/40" style={{ backgroundColor: w?.color || '#38bdf8' }}>Cable Jack</span>
                              <span className="text-slate-200">Enlace en tablero: De <strong className="text-sky-300">{t1?.label || 'Borne (+) / (-)'}</strong> ➔ A <strong className="text-sky-300">{t2?.label || 'Componente'}</strong></span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold">
                              <span>Estado: <strong className={analysis.isComplete && analysis.totalCurrent > 0 ? "text-emerald-400" : "text-sky-400"}>{analysis.isComplete && analysis.totalCurrent > 0 ? "● CONDUCIENDO CORRIENTE" : "○ PUENTE CONECTADO"}</strong></span>
                              <span>Corriente en circuito: <strong className="text-emerald-400">{analysis.totalCurrent.toFixed(2)} mA</strong></span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-amber-400 font-extrabold text-sm">💡 HOVER ACTIVO:</span>
                        <span>Pasa el cursor sobre cualquier Resistencia del gráfico o sobre los enlaces activos de abajo para ver mediciones instantáneas ($V, I, P$).</span>
                      </div>
                    )}
                  </div>

                  {/* SVG GRAPHICAL BLUEPRINT CANVAS WITH LIVE CURRENT FLOW ANIMATION */}
                  <svg viewBox="0 0 880 340" className="w-full min-w-[660px] h-auto max-h-[360px]" style={{ background: '#050914' }}>
                    <defs>
                      <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="1" />
                      </pattern>
                      <filter id="box-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.45" />
                      </filter>
                      <style>{`
                        @keyframes currentPulse {
                          0% { stroke-dashoffset: 24; }
                          100% { stroke-dashoffset: 0; }
                        }
                        .current-flow-line {
                          stroke-dasharray: 6 6;
                          animation: currentPulse 0.6s linear infinite;
                        }
                      `}</style>
                    </defs>

                    <rect width="100%" height="100%" fill="url(#blueprint-grid)" />

                    {/* LEFT POWER SOURCE BLOCK */}
                    <g transform="translate(15, 125)">
                      <rect width="80" height="90" rx="10" fill="#0c192c" stroke="#38bdf8" strokeWidth="2.5" />
                      <circle cx="40" cy="24" r="10" fill="#ef4444" />
                      <text x="40" y="28" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="monospace">+</text>
                      <text x="40" y="52" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="900" fontFamily="monospace">
                        {vin} V
                      </text>
                      <text x="40" y="72" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                        FUENTE 1
                      </text>
                    </g>
                    {/* Source positive line feeding out */}
                    <line x1="95" y1="170" x2="135" y2="170" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                    {analysis.totalCurrent > 0 && (
                      <line x1="95" y1="170" x2="135" y2="170" stroke="#34d399" strokeWidth="3" className="current-flow-line" />
                    )}
                    <circle cx="135" cy="170" r="5" fill="#ef4444" />

                    {/* RIGHT GROUND RETURN BLOCK */}
                    <g transform="translate(785, 125)">
                      <rect width="80" height="90" rx="10" fill="#032541" stroke="#38bdf8" strokeWidth="2.5" />
                      <circle cx="40" cy="24" r="10" fill="#38bdf8" />
                      <text x="40" y="28" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="monospace">-</text>
                      <text x="40" y="52" textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="900" fontFamily="monospace">
                        0 V
                      </text>
                      <text x="40" y="72" textAnchor="middle" fill="#bae6fd" fontSize="10" fontFamily="monospace">
                        ⏚ GND
                      </text>
                    </g>
                    {/* Return rail feeding into ground block */}
                    <line x1="745" y1="170" x2="785" y2="170" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                    {analysis.totalCurrent > 0 && (
                      <line x1="745" y1="170" x2="785" y2="170" stroke="#34d399" strokeWidth="3" className="current-flow-line" />
                    )}
                    <circle cx="745" cy="170" r="5" fill="#38bdf8" />

                    {/* RENDER SCHEMATIC SYMBOLS DYNAMICALLY: SERIES vs PARALLEL SPLIT */}
                    {(() => {
                      const connectedResistors = topology.connectedResistors;
                      const count = connectedResistors.length;
                      const isPureSeries = topology.type === 'SERIE';

                      if (isPureSeries || count <= 1) {
                        // HORIZONTAL SERIES CHAIN LAYOUT FOR PURE SERIES
                        const startX = 135;
                        const endX = 745;
                        const y = 170;
                        const spacing = (endX - startX) / (count + 1);

                        return (
                          <g>
                            {connectedResistors.map((r, idx) => {
                              const rx = startX + spacing * (idx + 1);
                              const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
                              const hasCurrent = meas.current > 0;
                              const nextX = idx === count - 1 ? endX : startX + spacing * (idx + 2);

                              return (
                                <g key={r.id}>
                                  {/* Resistor Box Symbol */}
                                  <g
                                    transform={`translate(${rx}, ${y})`}
                                    filter={hasCurrent || (hoveredElement?.type === 'resistor' && hoveredElement.id === r.id) ? "url(#box-glow)" : undefined}
                                    onMouseEnter={() => setHoveredElement({ type: 'resistor', id: r.id })}
                                    onMouseLeave={() => setHoveredElement(null)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <rect x="-60" y="-30" width="120" height="60" rx="10" fill="#0f172a" stroke={hasCurrent || (hoveredElement?.type === 'resistor' && hoveredElement.id === r.id) ? "#38bdf8" : "#475569"} strokeWidth="2.5" />
                                    <text x="0" y="-10" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="monospace">
                                      {r.id} ({r.value >= 1000 ? `${(r.value / 1000).toFixed(1)}k` : r.value}Ω)
                                    </text>
                                    <text x="0" y="8" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                      ⚡ {meas.voltageDrop} V
                                    </text>
                                    <text x="0" y="22" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                      I: {meas.current} mA
                                    </text>
                                  </g>

                                  {/* Connecting wire trace to next or GND */}
                                  <line x1={idx === 0 ? startX : rx - 60} y1={y} x2={rx - 60} y2={y} stroke="#22d3ee" strokeWidth="3.5" />
                                  {hasCurrent && <line x1={idx === 0 ? startX : rx - 60} y1={y} x2={rx - 60} y2={y} stroke="#34d399" strokeWidth="3" className="current-flow-line" />}

                                  <line x1={rx + 60} y1={y} x2={nextX - (idx === count - 1 ? 0 : 60)} y2={y} stroke={idx === count - 1 ? "#38bdf8" : "#22d3ee"} strokeWidth="3.5" />
                                  {hasCurrent && <line x1={rx + 60} y1={y} x2={nextX - (idx === count - 1 ? 0 : 60)} y2={y} stroke="#34d399" strokeWidth="3" className="current-flow-line" />}
                                </g>
                              );
                            })}
                          </g>
                        );
                      } else {
                        // TRUE DYNAMIC PARALLEL / MIXED BRANCH LAYOUT
                        const startX = 135;
                        const endX = 745;
                        const splitX = 250; // Positive distribution bus (Node A)
                        const mergeX = 630; // Negative return bus (Node B)

                        // Identify trunk resistors
                        const posNode = analysis.nodes.find(n => n.terminalIds.includes('POWER_POS'));
                        const trunkResistors: typeof connectedResistors = [];

                        if (posNode && posNode.resistorConnections.length === 1) {
                          const trunkR = connectedResistors.find(r => r.id === posNode.resistorConnections[0].resistorId);
                          if (trunkR && !isPureSeries) {
                            const tNode = analysis.nodes.find(n => (n.terminalIds.includes(`${trunkR.id}_T2`) || n.terminalIds.includes(`${trunkR.id}_T1`)) && n !== posNode);
                            if (tNode && !tNode.terminalIds.includes('POWER_NEG') && tNode.resistorConnections.length > 1) {
                              trunkResistors.push(trunkR);
                            }
                          }
                        }

                        const branchResistors = connectedResistors.filter(r => !trunkResistors.includes(r));
                        const branchCount = Math.max(1, branchResistors.length);

                        const getRowY = (idx: number, total: number) => {
                          if (total === 1) return 170;
                          if (total === 2) return idx === 0 ? 85 : 255;
                          if (total === 3) return idx === 0 ? 75 : idx === 1 ? 170 : 265;
                          const spacingY = 240 / (total - 1);
                          return 50 + idx * spacingY;
                        };

                        return (
                          <g>
                            {trunkResistors.map(r => {
                              const rx = (startX + splitX) / 2;
                              const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
                              const hasCurrent = meas.current > 0;
                              return (
                                <g key={r.id}>
                                  <line x1={startX} y1="170" x2={rx - 40} y2="170" stroke="#22d3ee" strokeWidth="3.5" />
                                  {hasCurrent && <line x1={startX} y1="170" x2={rx - 40} y2="170" stroke="#34d399" strokeWidth="3" className="current-flow-line" />}
                                  <g
                                    transform={`translate(${rx}, 170)`}
                                    filter={hasCurrent || (hoveredElement?.type === 'resistor' && hoveredElement.id === r.id) ? "url(#box-glow)" : undefined}
                                    onMouseEnter={() => setHoveredElement({ type: 'resistor', id: r.id })}
                                    onMouseLeave={() => setHoveredElement(null)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <rect x="-40" y="-22" width="80" height="44" rx="8" fill="#0f172a" stroke={hasCurrent ? "#38bdf8" : "#475569"} strokeWidth="2" />
                                    <text x="0" y="-4" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="monospace">{r.id}</text>
                                    <text x="0" y="12" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">⚡{meas.voltageDrop}V</text>
                                  </g>
                                  <line x1={rx + 40} y1="170" x2={splitX} y2="170" stroke="#22d3ee" strokeWidth="3.5" />
                                  {hasCurrent && <line x1={rx + 40} y1="170" x2={splitX} y2="170" stroke="#34d399" strokeWidth="3" className="current-flow-line" />}
                                </g>
                              );
                            })}

                            {trunkResistors.length === 0 && (
                              <>
                                <line x1={startX} y1="170" x2={splitX} y2="170" stroke="#22d3ee" strokeWidth="3.5" />
                                {analysis.totalCurrent > 0 && <line x1={startX} y1="170" x2={splitX} y2="170" stroke="#34d399" strokeWidth="3" className="current-flow-line" />}
                              </>
                            )}

                            {branchCount > 1 && (
                              <>
                                <line x1={splitX} y1={getRowY(0, branchCount)} x2={splitX} y2={getRowY(branchCount - 1, branchCount)} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                                {analysis.totalCurrent > 0 && (
                                  <line x1={splitX} y1={getRowY(0, branchCount)} x2={splitX} y2={getRowY(branchCount - 1, branchCount)} stroke="#34d399" strokeWidth="3" className="current-flow-line" />
                                )}
                                <circle cx={splitX} cy="170" r="6" fill="#38bdf8" />
                              </>
                            )}

                            {branchResistors.map((r, idx) => {
                              const y = getRowY(idx, branchCount);
                              const rx = (splitX + mergeX) / 2;
                              const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
                              const hasCurrent = meas.current > 0;

                              return (
                                <g key={r.id}>
                                  <line x1={splitX} y1={y} x2={rx - 60} y2={y} stroke="#22d3ee" strokeWidth="3.5" />
                                  {hasCurrent && <line x1={splitX} y1={y} x2={rx - 60} y2={y} stroke="#34d399" strokeWidth="3" className="current-flow-line" />}

                                  <g
                                    transform={`translate(${rx}, ${y})`}
                                    filter={hasCurrent || (hoveredElement?.type === 'resistor' && hoveredElement.id === r.id) ? "url(#box-glow)" : undefined}
                                    onMouseEnter={() => setHoveredElement({ type: 'resistor', id: r.id })}
                                    onMouseLeave={() => setHoveredElement(null)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <rect x="-60" y="-28" width="120" height="56" rx="10" fill="#0f172a" stroke={hasCurrent || (hoveredElement?.type === 'resistor' && hoveredElement.id === r.id) ? "#38bdf8" : "#475569"} strokeWidth="2.5" />
                                    <text x="0" y="-8" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="monospace">
                                      {r.id} ({r.value >= 1000 ? `${(r.value / 1000).toFixed(1)}k` : r.value}Ω)
                                    </text>
                                    <text x="0" y="10" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                      ⚡ {meas.voltageDrop} V
                                    </text>
                                    <text x="0" y="23" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                      I: {meas.current} mA
                                    </text>
                                  </g>

                                  <line x1={rx + 60} y1={y} x2={mergeX} y2={y} stroke="#22d3ee" strokeWidth="3.5" />
                                  {hasCurrent && <line x1={rx + 60} y1={y} x2={mergeX} y2={y} stroke="#34d399" strokeWidth="3" className="current-flow-line" />}
                                </g>
                              );
                            })}

                            {branchCount > 1 && (
                              <>
                                <line x1={mergeX} y1={getRowY(0, branchCount)} x2={mergeX} y2={getRowY(branchCount - 1, branchCount)} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                                {analysis.totalCurrent > 0 && (
                                  <line x1={mergeX} y1={getRowY(0, branchCount)} x2={mergeX} y2={getRowY(branchCount - 1, branchCount)} stroke="#34d399" strokeWidth="3" className="current-flow-line" />
                                )}
                                <circle cx={mergeX} cy="170" r="6" fill="#38bdf8" />
                              </>
                            )}

                            <line x1={mergeX} y1="170" x2={endX} y2="170" stroke="#38bdf8" strokeWidth="3.5" />
                            {analysis.totalCurrent > 0 && (
                              <line x1={mergeX} y1="170" x2={endX} y2="170" stroke="#34d399" strokeWidth="3" className="current-flow-line" />
                            )}
                          </g>
                        );
                      }
                    })()}
                  </svg>

                  {/* Tarjetas interactivas al Hover: Cables y Conexiones Jack */}
                  {wires && wires.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 font-bold">
                        <span>⚡ Enlaces Activos en Pista Espejo (Pasa el cursor por cada uno para mediciones instantáneas):</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {wires.map((w, idx) => {
                          const t1 = getTerminalById(w.fromTerminalId);
                          const t2 = getTerminalById(w.toTerminalId);
                          const isHovered = hoveredElement?.type === 'wire' && hoveredElement.id === w.id;
                          return (
                            <div
                              key={w.id}
                              onMouseEnter={() => setHoveredElement({ type: 'wire', id: w.id })}
                              onMouseLeave={() => setHoveredElement(null)}
                              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono cursor-pointer transition transform ${isHovered ? 'scale-105 bg-slate-800 border-sky-400 text-white shadow-lg shadow-sky-500/30 ring-1 ring-sky-400' : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-slate-500'}`}
                            >
                              <span className="w-3.5 h-3.5 rounded-full border border-white/60 shadow" style={{ backgroundColor: w.color }} />
                              <span>Cable #{idx + 1}: <strong className="text-sky-300 font-bold">{t1?.label || w.fromTerminalId}</strong> ➔ <strong className="text-sky-300 font-bold">{t2?.label || w.toTerminalId}</strong></span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
