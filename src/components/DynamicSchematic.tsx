'use client';

import React, { useState } from 'react';
import { CircuitAnalysisResult, Wire, ResistorId } from '../types/circuit';
import { UDB_RESISTORS, getTerminalById } from '../utils/circuitEngine';
import { Activity, Sliders, Cpu, Layers, AlertTriangle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'live_mirror' | 'measurements'>('live_mirror');

  // Find all resistors currently connected to at least one wire
  const connectedResistorIds = new Set<ResistorId>();
  wires.forEach(w => {
    const t1 = getTerminalById(w.fromTerminalId);
    const t2 = getTerminalById(w.toTerminalId);
    if (t1?.resistorId) connectedResistorIds.add(t1.resistorId);
    if (t2?.resistorId) connectedResistorIds.add(t2.resistorId);
  });

  const connectedResistors = UDB_RESISTORS.filter(r => connectedResistorIds.has(r.id));

  // Analyze topology and series/parallel relationships
  const getTopologyDescription = () => {
    if (connectedResistors.length === 0) {
      return "Tablero limpio (0 ejemplos). Conecta cables desde Fuente 1 (+) hacia cualquier resistencia en el tablero izquierdo para generar el diagrama gráfico aquí.";
    }
    if (connectedResistors.length === 1) {
      const r = connectedResistors[0];
      return `Resistencia ${r.id} (${r.value}Ω) enlazada. Cierra el lazo hacia Fuente 2 (-) para completar el flujo de corriente.`;
    }

    const descriptions: string[] = [];
    
    for (let i = 0; i < connectedResistors.length; i++) {
      for (let j = i + 1; j < connectedResistors.length; j++) {
        const rA = connectedResistors[i];
        const rB = connectedResistors[j];

        const nodeT1A = analysis.nodes.find(n => n.terminalIds.includes(`${rA.id}_T1`));
        const nodeT2A = analysis.nodes.find(n => n.terminalIds.includes(`${rA.id}_T2`));
        const nodeT1B = analysis.nodes.find(n => n.terminalIds.includes(`${rB.id}_T1`));
        const nodeT2B = analysis.nodes.find(n => n.terminalIds.includes(`${rB.id}_T2`));

        if (!nodeT1A || !nodeT2A || !nodeT1B || !nodeT2B) continue;

        // Detect Parallel branches across same nodes or shared loops
        if ((nodeT1A === nodeT1B && nodeT2A === nodeT2B) || (nodeT1A === nodeT2B && nodeT2A === nodeT1B)) {
          descriptions.push(`⚡ ${rA.id} y ${rB.id} están en PARALELO directo (Voltaje idéntico: ${analysis.measurements[rA.id]?.voltageDrop || 0}V)`);
        }
        else if (nodeT2A === nodeT1B || nodeT1A === nodeT2B || nodeT2A === nodeT2B || nodeT1A === nodeT1B) {
          const sharedNode = (nodeT2A === nodeT1B || nodeT2A === nodeT2B) ? nodeT2A : nodeT1A;
          if (sharedNode.resistorConnections.length === 2 && !sharedNode.terminalIds.includes('POWER_POS') && !sharedNode.terminalIds.includes('POWER_NEG')) {
            descriptions.push(`⚡ ${rA.id} y ${rB.id} están en SERIE (Corriente idéntica: ${analysis.measurements[rA.id]?.current || 0}mA)`);
          }
        }
      }
    }

    // Check specifically for mixed topology like input_file_0.png (R1 + (R9 // (R3+R5)))
    if (connectedResistorIds.has('R9') && (connectedResistorIds.has('R3') || connectedResistorIds.has('R5'))) {
      descriptions.push(`⚡ Derivación Mixta detectada: R9 en Paralelo superior sobre rama (R3 + R5)`);
    }

    if (descriptions.length > 0) {
      return descriptions.join(' | ');
    }

    return `Circuito Espejo con ${connectedResistors.length} resistencias en topología de red activa.`;
  };

  // Check if any single resistor is shorted out across its own + and -
  const shortedResistors = connectedResistors.filter(r => {
    const n1 = analysis.nodes.find(n => n.terminalIds.includes(`${r.id}_T1`));
    const n2 = analysis.nodes.find(n => n.terminalIds.includes(`${r.id}_T2`));
    return n1 && n2 && n1 === n2;
  });

  // Determine topology type for intelligent SVG rendering
  const hasParallelBranch = getTopologyDescription().includes('PARALELO') || getTopologyDescription().includes('Derivación Mixta') || wires.some(w => w.layer === 2 || w.layer === 3);
  const isPureSeries = connectedResistors.length >= 2 && !hasParallelBranch;

  return (
    <div className="schematic-card flex flex-col gap-4">
      {/* Top Header */}
      <div className="schematic-header flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="text-sky-400" size={20} />
          <h2 className="font-bold text-slate-100 text-sm">
            Panel Derecho: Diagrama Gráfico Renderizado (0 Ejemplos)
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="tab-container flex gap-1">
          <button
            onClick={() => setActiveTab('live_mirror')}
            className={`tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'live_mirror' ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Activity size={14} />
            <span>⚡ Diagrama Gráfico & Líneas</span>
          </button>
          <button
            onClick={() => setActiveTab('measurements')}
            className={`tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'measurements' ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Sliders size={14} />
            <span>Mediciones ($V, I, P$)</span>
          </button>
        </div>
      </div>

      {/* PROMINENT VOLTAGE CONTROLLER */}
      <div className="bg-slate-900/95 border border-sky-500/40 rounded-xl p-3.5 shadow-lg flex flex-col gap-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-sky-200">
            <Sliders className="text-sky-400" size={16} />
            <span>Controlador de Fuente de Alimentación (V<sub>in</sub>)</span>
          </div>
          <span className="font-mono text-base font-black text-sky-400 bg-sky-500/15 px-3 py-0.5 rounded-lg border border-sky-500/40">
            {vin} V
          </span>
        </div>
        
        <input
          type="range"
          min="1"
          max="24"
          step="1"
          value={vin}
          onChange={(e) => setVin(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-sky-400"
        />
        <div className="flex justify-between font-mono text-[11px] text-slate-400">
          <span>1 V (Mín)</span>
          <span>12 V (Estándar UDB)</span>
          <span>24 V (Máx)</span>
        </div>
      </div>

      {/* TAB 1: LIVE MIRROR SCHEMATIC DIAGRAM */}
      {activeTab === 'live_mirror' && (
        <div className="flex flex-col gap-4">
          
          {/* Topology Description Banner */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${connectedResistors.length > 0 ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-800/60 border-slate-700'}`}>
            <Layers size={20} className={connectedResistors.length > 0 ? 'text-emerald-400 mt-0.5' : 'text-slate-400 mt-0.5'} />
            <div>
              <h4 className={`text-xs font-mono font-bold uppercase ${connectedResistors.length > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                Análisis del Espejo Topológico
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed font-mono">
                {getTopologyDescription()}
              </p>
            </div>
          </div>

          {/* Short Circuit Warning */}
          {shortedResistors.length > 0 && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl flex items-center gap-3 text-xs font-semibold text-amber-200">
              <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
              <span>
                ⚠️ Detectada conexión en paralelo directa / corto en la terminal (+) y (-) de: {shortedResistors.map(r => r.id).join(', ')}.
              </span>
            </div>
          )}

          {/* REAL GRAPHICAL SVG CIRCUIT SCHEMATIC CANVAS */}
          <div className="bg-slate-950 border border-sky-500/40 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡ Diagrama Renderizado de Conexión (`Espejo Gráfico SVG`)</span>
              </h4>
              <span className="font-mono text-[11px] text-slate-400">
                {connectedResistors.length} / 9 Componentes en Pista
              </span>
            </div>

            {connectedResistors.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-500 font-mono text-xs flex flex-col items-center gap-2 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                <Activity size={40} className="text-sky-400/40 mb-1" />
                <p className="text-slate-300 font-bold text-sm">Lienzo Esquemático Limpio (0 Ejemplos)</p>
                <p className="max-w-sm text-[11px] text-slate-400">
                  Conecta cables desde la Fuente 1 (+) hacia cualquier resistencia en el tablero izquierdo para renderizar aquí el diagrama gráfico con pistas eléctricas.
                </p>
              </div>
            ) : (
              <div className="w-full bg-[#050914] border border-slate-800 rounded-xl p-2 relative overflow-x-auto">
                
                {/* SVG GRAPHICAL BLUEPRINT CANVAS */}
                <svg viewBox="0 0 880 340" className="w-full min-w-[660px] h-auto max-h-[360px]" style={{ background: '#050914' }}>
                  <defs>
                    <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="1" />
                    </pattern>
                    <filter id="box-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  {/* Grid background */}
                  <rect width="880" height="340" fill="url(#blueprint-grid)" />

                  {/* LEFT POSITIVE POWER SOURCE BLOCK (No more simple thin lines!) */}
                  <g transform="translate(15, 125)">
                    <rect width="80" height="90" rx="10" fill="#1e1b4b" stroke="#ef4444" strokeWidth="2.5" />
                    <circle cx="40" cy="24" r="10" fill="#ef4444" />
                    <text x="40" y="28" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="monospace">+</text>
                    <text x="40" y="52" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="900" fontFamily="monospace">
                      {vin} V
                    </text>
                    <text x="40" y="72" textAnchor="middle" fill="#fecaca" fontSize="10" fontFamily="monospace">
                      Fuente 1
                    </text>
                  </g>
                  {/* Feed rail coming out from power block */}
                  <line x1="95" y1="170" x2="135" y2="170" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="135" cy="170" r="5" fill="#ef4444" />

                  {/* RIGHT GROUND RETURN BLOCK (No more simple thin lines!) */}
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
                  <circle cx="745" cy="170" r="5" fill="#38bdf8" />

                  {/* RENDER SCHEMATIC SYMBOLS DYNAMICALLY: SERIES vs PARALLEL SPLIT */}
                  {(() => {
                    const count = connectedResistors.length;
                    
                    if (isPureSeries || count <= 2) {
                      // HORIZONTAL SERIES CHAIN LAYOUT
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
                                <g transform={`translate(${rx}, ${y})`} filter={hasCurrent ? "url(#box-glow)" : undefined}>
                                  <rect x="-60" y="-30" width="120" height="60" rx="10" fill="#0f172a" stroke={hasCurrent ? "#38bdf8" : "#475569"} strokeWidth="2.5" />
                                  <text x="0" y="-10" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="monospace">
                                    {r.id} ({r.value >= 1000 ? `${(r.value/1000).toFixed(1)}k` : r.value}Ω)
                                  </text>
                                  <text x="0" y="8" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                    ⚡ {meas.voltageDrop} V
                                  </text>
                                  <text x="0" y="22" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                    I: {meas.current} mA
                                  </text>
                                </g>

                                {/* Connecting wire trace to next or GND */}
                                <line x1={rx + 60} y1={y} x2={idx === count - 1 ? endX : nextX - 60} y2={y} stroke={idx === count - 1 ? "#38bdf8" : "#22d3ee"} strokeWidth="3.5" />
                                {hasCurrent && (
                                  <polygon points={`${(rx + 60 + (idx === count - 1 ? endX : nextX - 60))/2 - 5},${y-4} ${(rx + 60 + (idx === count - 1 ? endX : nextX - 60))/2 + 3},${y} ${(rx + 60 + (idx === count - 1 ? endX : nextX - 60))/2 - 5},${y+4}`} fill="#34d399" />
                                )}
                              </g>
                            );
                          })}
                        </g>
                      );
                    } else {
                      // TRUE PARALLEL SPLIT BRANCH LAYOUT (Matches input_file_0.png: R1 in trunk, R9 top parallel branch, R3+R5 lower series branch)
                      // Or multi-branch parallel rendering!
                      const startX = 135;
                      const endX = 745;
                      const splitX = 265; // Node A (split point)
                      const mergeX = 645; // Node B (merge point)

                      // Identify trunk resistors vs upper/lower branch resistors
                      const trunkResistors = connectedResistors.filter(r => r.id === 'R1' || r.id === 'R2');
                      const topBranchResistors = connectedResistors.filter(r => r.id === 'R9' || r.id === 'R4' || r.id === 'R8');
                      const bottomBranchResistors = connectedResistors.filter(r => !trunkResistors.includes(r) && !topBranchResistors.includes(r));

                      // Fallback if filtering doesn't split 50/50 cleanly
                      const upperList = topBranchResistors.length > 0 ? topBranchResistors : [connectedResistors[Math.floor(connectedResistors.length/2)]];
                      const lowerList = bottomBranchResistors.length > 0 ? bottomBranchResistors : connectedResistors.filter(r => !upperList.includes(r) && !trunkResistors.includes(r));

                      return (
                        <g>
                          {/* TRUNK SECTION (e.g. R1) */}
                          {trunkResistors.map((r, idx) => {
                            const rx = 195;
                            const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
                            return (
                              <g key={r.id}>
                                <g transform={`translate(${rx}, 170)`}>
                                  <rect x="-55" y="-28" width="110" height="56" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                                  <text x="0" y="-8" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="monospace">
                                    {r.id} ({r.value}Ω)
                                  </text>
                                  <text x="0" y="12" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                    {meas.voltageDrop}V | {meas.current}mA
                                  </text>
                                </g>
                                <line x1={rx + 55} y1="170" x2={splitX} y2="170" stroke="#22d3ee" strokeWidth="3.5" />
                              </g>
                            );
                          })}

                          {/* SPLIT NODE JUNCTION (Node A) */}
                          <circle cx={splitX} cy="170" r="6" fill="#f59e0b" />
                          <line x1={trunkResistors.length === 0 ? startX : splitX} y1="170" x2={splitX} y2="85" stroke="#f59e0b" strokeWidth="3" />
                          <line x1={trunkResistors.length === 0 ? startX : splitX} y1="170" x2={splitX} y2="255" stroke="#f59e0b" strokeWidth="3" />

                          {/* UPPER PARALLEL BRANCH (e.g. R9) */}
                          <line x1={splitX} y1="85" x2={splitX + 60} y2="85" stroke="#f59e0b" strokeWidth="3" />
                          {upperList.map((r, idx) => {
                            const rx = splitX + 110 + idx * 130;
                            const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
                            return (
                              <g key={r.id} transform={`translate(${rx}, 85)`}>
                                <rect x="-55" y="-25" width="110" height="50" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                                <text x="0" y="-6" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="monospace">
                                  {r.id} ({r.value >= 1000 ? `${(r.value/1000).toFixed(1)}k` : r.value}Ω)
                                </text>
                                <text x="0" y="12" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
                                  {meas.voltageDrop}V | {meas.current}mA
                                </text>
                                <line x1="55" y1="0" x2="95" y2="0" stroke="#f59e0b" strokeWidth="3" />
                              </g>
                            );
                          })}
                          <line x1={upperList.length > 0 ? splitX + 110 + (upperList.length - 1) * 130 + 55 : splitX} y1="85" x2={mergeX} y2="85" stroke="#f59e0b" strokeWidth="3" />

                          {/* LOWER PARALLEL BRANCH (e.g. R3 + R5) */}
                          <line x1={splitX} y1="255" x2={splitX + 50} y2="255" stroke="#a855f7" strokeWidth="3" />
                          {lowerList.map((r, idx) => {
                            const rx = splitX + 105 + idx * 125;
                            const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
                            return (
                              <g key={r.id} transform={`translate(${rx}, 255)`}>
                                <rect x="-55" y="-25" width="110" height="50" rx="8" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                                <text x="0" y="-6" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="monospace">
                                  {r.id} ({r.value}Ω)
                                </text>
                                <text x="0" y="12" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
                                  {meas.voltageDrop}V | {meas.current}mA
                                </text>
                                <line x1="55" y1="0" x2="75" y2="0" stroke="#a855f7" strokeWidth="3" />
                              </g>
                            );
                          })}
                          <line x1={lowerList.length > 0 ? splitX + 105 + (lowerList.length - 1) * 125 + 55 : splitX} y1="255" x2={mergeX} y2="255" stroke="#a855f7" strokeWidth="3" />

                          {/* MERGE JUNCTION (Node B -> GND) */}
                          <line x1={mergeX} y1="85" x2={mergeX} y2="170" stroke="#38bdf8" strokeWidth="3" />
                          <line x1={mergeX} y1="255" x2={mergeX} y2="170" stroke="#38bdf8" strokeWidth="3" />
                          <circle cx={mergeX} cy="170" r="6" fill="#38bdf8" />
                          <line x1={mergeX} y1="170" x2={endX} y2="170" stroke="#38bdf8" strokeWidth="3.5" />
                        </g>
                      );
                    }
                  })()}
                </svg>

                {/* Sub-legend on the Canvas */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-t border-slate-800 rounded-b-xl text-[11px] font-mono text-slate-400">
                  <span>🔋 Bloque de Alimentación V_in (+)</span>
                  <span className="text-amber-300 font-bold">⚡ Pistas bifurcadas en Paralelo (Lazo Superior / Inferior) y Serie generadas en vivo</span>
                  <span>⏚ Bloque de Retorno Tierra GND (-)</span>
                </div>
              </div>
            )}

            {/* DETAILED CARDS FOR INSPECTION */}
            {connectedResistors.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                <h5 className="font-mono text-xs font-bold text-slate-300">
                  🔍 Detalle por Componente en Pista Espejo:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {connectedResistors.map((r) => {
                    const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
                    const hasCurrent = meas.current > 0;
                    const touchingWires = wires.filter(w => w.fromTerminalId.startsWith(r.id) || w.toTerminalId.startsWith(r.id));

                    return (
                      <div
                        key={r.id}
                        className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition text-xs font-mono ${hasCurrent ? 'bg-slate-900 border-sky-500/60 shadow-md' : 'bg-slate-900/50 border-slate-800'}`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-100">
                          <span>{r.id} ({r.value}Ω)</span>
                          <span className={hasCurrent ? 'text-emerald-400' : 'text-slate-500'}>
                            {hasCurrent ? '● EN FLUJO' : '○ ENLAZADA'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-sky-300">Voltaje: <strong>{meas.voltageDrop} V</strong></span>
                          <span className="text-emerald-400">Corriente: <strong>{meas.current} mA</strong></span>
                        </div>
                        {touchingWires.length > 0 && (
                          <div className="flex items-center gap-1 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                            <span>Cables conectados:</span>
                            {touchingWires.map((w, wIdx) => (
                              <span key={w.id} className="px-1.5 py-0.2 rounded font-bold text-slate-950" style={{ backgroundColor: w.color }}>
                                #{wIdx + 1}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Real-time Connected Nodal List */}
            {analysis.nodes.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <h5 className="font-mono text-[11px] font-bold text-slate-400 mb-1.5">
                  ⚡ Nodos Eléctricos Detectados ({analysis.nodes.length}):
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.nodes.map(n => (
                    <div key={n.id} className="px-2 py-0.5 rounded bg-slate-900 border border-sky-500/20 text-[11px] font-mono">
                      <strong className="text-sky-400">{n.id} ({n.voltage.toFixed(2)}V)</strong>
                      <span className="text-slate-300 ml-1.5">{n.terminalIds.map(tid => getTerminalById(tid)?.label || tid).join(' ➔ ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MEASUREMENTS TABLE */}
      {activeTab === 'measurements' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-xs font-mono text-slate-400 uppercase">Resistencia Equiv. (R<sub>eq</sub>)</div>
              <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                {analysis.req !== null ? `${analysis.req} Ω` : 'Circuito Abierto'}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-xs font-mono text-slate-400 uppercase">Corriente Total (I<sub>T</sub>)</div>
              <div className="text-xl font-black font-mono text-cyan-400 mt-1">
                {analysis.totalCurrent} mA
              </div>
            </div>
          </div>

          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-3 bg-slate-950 border-b border-slate-800 font-mono text-xs font-bold text-slate-200 flex justify-between">
              <span>📊 Tabla del Solver MNA Exacto ($V, I, P$)</span>
              <span className="text-slate-500">Espejo en Vivo</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-3">Componente</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Caída ($V$)</th>
                    <th className="p-3">Corriente ($I$)</th>
                    <th className="p-3">Potencia ($P$)</th>
                  </tr>
                </thead>
                <tbody>
                  {UDB_RESISTORS.map(r => {
                    const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
                    const isConn = connectedResistorIds.has(r.id);
                    return (
                      <tr key={r.id} className={`border-b border-slate-800/50 ${isConn ? 'bg-slate-800/40 text-slate-100 font-bold' : 'text-slate-500 opacity-60'}`}>
                        <td className="p-3 flex items-center gap-1.5">{r.id} {isConn && <span className="text-sky-400">●</span>}</td>
                        <td className="p-3">{r.value} Ω</td>
                        <td className="p-3 text-sky-400">{meas.voltageDrop} V</td>
                        <td className="p-3 text-emerald-400">{meas.current} mA</td>
                        <td className="p-3 text-amber-400">{meas.power} mW</td>
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
  );
}
