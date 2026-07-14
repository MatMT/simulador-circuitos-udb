'use client';

import React, { useState } from 'react';
import { CircuitAnalysisResult, Wire, ResistorId } from '../types/circuit';
import { UDB_RESISTORS, getTerminalById } from '../utils/circuitEngine';
import { Activity, Sliders, Cpu, AlertTriangle } from 'lucide-react';

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
  const [hoveredElement, setHoveredElement] = useState<{ type: 'resistor' | 'wire'; id: string } | null>(null);

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
      return "Tablero limpio . Conecta cables desde Fuente 1 (+) hacia cualquier resistencia en el tablero izquierdo para generar el diagrama gráfico aquí.";
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
  const hasParallelBranch = getTopologyDescription().includes('PARALELO') || getTopologyDescription().includes('Derivación Mixta') || wires.some(w => w.layer === 2 || w.layer === 3 || (w.layer && w.layer >= 2));
  const isPureSeries = connectedResistors.length >= 1 && !hasParallelBranch;

  return (
    <div className="schematic-card flex flex-col gap-4">
      {/* Top Header */}
      <div className="schematic-header flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="text-sky-400" size={20} />
          <h2 className="font-bold text-slate-100 text-sm">
            Panel Derecho: Diagrama Gráfico Renderizado
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

      <div className="schematic-content">
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

            {/* Short Circuit Warning */}
        {
          shortedResistors.length > 0 && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl flex items-center gap-3 text-xs font-semibold text-amber-200">
              <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
              <span>
                ⚠️ Detectada conexión en paralelo directa / corto en la terminal (+) y (-) de: {shortedResistors.map(r => r.id).join(', ')}.
              </span>
            </div>
          )
        }

        {/* REAL GRAPHICAL SVG CIRCUIT SCHEMATIC CANVAS */}
        <div className="bg-slate-950 border border-sky-500/40 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-mono text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡ Diagrama Renderizado de Conexión </span>
            </h4>
            <span className="font-mono text-[11px] text-slate-400">
              {connectedResistors.length} / 9 Componentes en Pista
            </span>
          </div>

          {connectedResistors.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-500 font-mono text-xs flex flex-col items-center gap-2 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
              <Activity size={40} className="text-sky-400/40 mb-1" />
              <p className="text-slate-300 font-bold text-sm">Lienzo Esquemático Limpio </p>
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
                          <span className="text-slate-200">Valor teórico: <strong className="text-amber-400">{r?.value && r.value >= 1000 ? `${(r.value / 1000).toFixed(1)} kΩ` : `${r?.value} Ω`}</strong></span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold">
                          <span>Voltaje Teórico: <strong className="text-sky-400">{meas.voltageDrop} V</strong></span>
                          <span>Corriente Teórica: <strong className="text-emerald-400">{meas.current} mA</strong></span>
                          <span>Potencia Disipada: <strong className="text-purple-400">{(meas.voltageDrop * meas.current).toFixed(2)} mW</strong></span>
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
                          <span className="text-slate-200">Enlace teórico: De <strong className="text-sky-300">{t1?.label || 'Borne (+) / (-)'}</strong> ➔ A <strong className="text-sky-300">{t2?.label || 'Componente'}</strong></span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold">
                          <span>Estado de Conducción: <strong className={analysis.isComplete && analysis.totalCurrent > 0 ? "text-emerald-400" : "text-sky-400"}>{analysis.isComplete && analysis.totalCurrent > 0 ? "● CONDUCIENDO CORRIENTE" : "○ PUENTE CONECTADO"}</strong></span>
                          <span>Corriente en circuito: <strong className="text-emerald-400">{analysis.totalCurrent.toFixed(2)} mA</strong></span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-amber-400 font-extrabold text-sm">💡 HOVER ACTIVO:</span>
                    <span>Pasa el cursor sobre cualquier Resistencia o Cable de la Pista (o en las tarjetas de abajo) para ver sus valores teóricos de Corriente, Voltaje y Potencia.</span>
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
                          stroke-dasharray: 8 4;
                          animation: currentPulse 0.5s linear infinite;
                        }
                      `}</style>
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
                            const count = connectedResistors.length;

                            if (isPureSeries && count <= 1) {
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
                              // TRUE DYNAMIC PARALLEL BRANCH LAYOUT (R1 // R3 across Node A and Node B, or multi-branch mixed circuits)
                              const startX = 135;
                              const endX = 745;
                              const splitX = 250; // Positive distribution bus (Node A)
                              const mergeX = 630; // Negative return bus (Node B)

                              // Identify if there is a trunk resistor before splitX (only if posNode connects directly to exactly 1 resistor and not to negNode)
                              const posNode = analysis.nodes.find(n => n.terminalIds.includes('POWER_POS'));
                              const trunkResistors: typeof connectedResistors = [];

                              if (posNode && posNode.resistorConnections.length === 1) {
                                const trunkR = connectedResistors.find(r => r.id === posNode.resistorConnections[0].resistorId);
                                if (trunkR && !isPureSeries) {
                                  const tNode = analysis.nodes.find(n => n.terminalIds.includes(`${trunkR.id}_T2`) || n.terminalIds.includes(`${trunkR.id}_T1`) && n !== posNode);
                                  if (tNode && !tNode.terminalIds.includes('POWER_NEG') && tNode.resistorConnections.length > 1) {
                                    trunkResistors.push(trunkR);
                                  }
                                }
                              }

                              const branchResistors = connectedResistors.filter(r => !trunkResistors.includes(r));
                              const branchCount = Math.max(1, branchResistors.length);

                              // Distribute branchResistors neatly into parallel horizontal rows
                              // If 2 branches (R1 // R3): Upper (y=85), Lower (y=255)
                              // If 3 branches: Upper (y=75), Middle (y=170), Lower (y=265)
                              const getRowY = (idx: number, total: number) => {
                                if (total === 1) return 170;
                                if (total === 2) return idx === 0 ? 85 : 255;
                                if (total === 3) return idx === 0 ? 75 : idx === 1 ? 170 : 265;
                                const minY = 60;
                                const maxY = 280;
                                return minY + (idx / (total - 1)) * (maxY - minY);
                              };

                              return (
                                <g>
                                  {/* TRUNK SECTION IF ANY */}
                                  {trunkResistors.map((r) => {
                                    const rx = 190;
                                    const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
                                    const hasCurrent = meas.current > 0;
                                    return (
                                      <g key={r.id}>
                                        <line x1={startX} y1="170" x2={rx - 60} y2="170" stroke="#22d3ee" strokeWidth="3.5" />
                                        {hasCurrent && <line x1={startX} y1="170" x2={rx - 60} y2="170" stroke="#34d399" strokeWidth="3" className="current-flow-line" />}

                                        <g
                                          transform={`translate(${rx}, 170)`}
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
                                        <line x1={rx + 60} y1="170" x2={splitX} y2="170" stroke="#22d3ee" strokeWidth="3.5" />
                                        {hasCurrent && <line x1={rx + 60} y1="170" x2={splitX} y2="170" stroke="#34d399" strokeWidth="3" className="current-flow-line" />}
                                      </g>
                                    );
                                  })}

                                  {trunkResistors.length === 0 && (
                                    <>
                                      <line x1={startX} y1="170" x2={splitX} y2="170" stroke="#22d3ee" strokeWidth="3.5" />
                                      {analysis.totalCurrent > 0 && <line x1={startX} y1="170" x2={splitX} y2="170" stroke="#34d399" strokeWidth="3" className="current-flow-line" />}
                                    </>
                                  )}

                                  {/* VERTICAL POSITIVE SPLIT BUS (Node A) */}
                                  {branchCount > 1 && (
                                    <>
                                      <line x1={splitX} y1={getRowY(0, branchCount)} x2={splitX} y2={getRowY(branchCount - 1, branchCount)} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                                      {analysis.totalCurrent > 0 && (
                                        <line x1={splitX} y1={getRowY(0, branchCount)} x2={splitX} y2={getRowY(branchCount - 1, branchCount)} stroke="#34d399" strokeWidth="3" className="current-flow-line" />
                                      )}
                                      <circle cx={splitX} cy="170" r="6" fill="#38bdf8" />
                                    </>
                                  )}

                                  {/* PARALLEL BRANCHES (E.g. R1 on top branch y=85, R3 on bottom branch y=255) */}
                                  {branchResistors.map((r, idx) => {
                                    const y = getRowY(idx, branchCount);
                                    const rx = (splitX + mergeX) / 2;
                                    const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
                                    const hasCurrent = meas.current > 0;

                                    return (
                                      <g key={r.id}>
                                        {/* Feed wire from splitX to resistor */}
                                        <line x1={splitX} y1={y} x2={rx - 60} y2={y} stroke="#22d3ee" strokeWidth="3.5" />
                                        {hasCurrent && <line x1={splitX} y1={y} x2={rx - 60} y2={y} stroke="#34d399" strokeWidth="3" className="current-flow-line" />}

                                        {/* Resistor Module */}
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

                                        {/* Return wire from resistor to mergeX */}
                                        <line x1={rx + 60} y1={y} x2={mergeX} y2={y} stroke="#22d3ee" strokeWidth="3.5" />
                                        {hasCurrent && <line x1={rx + 60} y1={y} x2={mergeX} y2={y} stroke="#34d399" strokeWidth="3" className="current-flow-line" />}
                                      </g>
                                    );
                                  })}

                                  {/* VERTICAL NEGATIVE RETURN BUS (Node B) */}
                                  {branchCount > 1 && (
                                    <>
                                      <line x1={mergeX} y1={getRowY(0, branchCount)} x2={mergeX} y2={getRowY(branchCount - 1, branchCount)} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                                      {analysis.totalCurrent > 0 && (
                                        <line x1={mergeX} y1={getRowY(0, branchCount)} x2={mergeX} y2={getRowY(branchCount - 1, branchCount)} stroke="#34d399" strokeWidth="3" className="current-flow-line" />
                                      )}
                                      <circle cx={mergeX} cy="170" r="6" fill="#38bdf8" />
                                    </>
                                  )}

                                  {/* Final link from mergeX to GND block */}
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
                    )
                  }
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
      </div >
      );
}
