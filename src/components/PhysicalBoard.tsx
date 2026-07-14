'use client';

import React, { useState } from 'react';
import { Terminal, Wire, WireColor } from '../types/circuit';
import { UDB_RESISTORS, UDB_TERMINALS, getTerminalById } from '../utils/circuitEngine';
import { RotateCcw, Plug, Trash2, X, Info } from 'lucide-react';

interface PhysicalBoardProps {
  wires: Wire[];
  onAddWire: (fromId: string, toId: string, color: WireColor, layer?: number) => void;
  onRemoveWire: (wireId: string) => void;
  onClearWires: () => void;
  selectedColor: WireColor;
  onSelectColor: (color: WireColor) => void;
  activeTerminalId: string | null;
  setActiveTerminalId: (id: string | null) => void;
  onToggleWireLayer?: (wireId: string) => void;
}

const WIRE_COLORS: { color: WireColor; label: string; name: string }[] = [
  { color: '#ef4444', label: 'Rojo', name: 'Alimentación (+)' },
  { color: '#3b82f6', label: 'Azul', name: 'Lazo Superior' },
  { color: '#10b981', label: 'Verde', name: 'Derivación Paralela' },
  { color: '#eab308', label: 'Amarillo', name: 'Puente Central' },
  { color: '#8b5cf6', label: 'Morado', name: 'Lazo Inferior' },
  { color: '#f97316', label: 'Naranja', name: 'Conexión Auxiliar' },
  { color: '#111827', label: 'Negro', name: 'Tierra / Retorno (-)' }
];

export default function PhysicalBoard({
  wires,
  onAddWire,
  onRemoveWire,
  onClearWires,
  selectedColor,
  onSelectColor,
  activeTerminalId,
  setActiveTerminalId
}: PhysicalBoardProps) {
  const [hoveredWireId, setHoveredWireId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [inspectTerminalId, setInspectTerminalId] = useState<string | null>(null);
  const [activeLayerFilter] = useState<number>(0);
  const [localWires, setLocalWires] = useState<Record<string, number>>({});

  const handleTerminalClick = (terminalId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const stackCount = wires.filter(w => w.fromTerminalId === terminalId || w.toTerminalId === terminalId).length;

    if (!activeTerminalId && stackCount >= 2 && (e.target as HTMLElement).closest('.stack-badge')) {
      setInspectTerminalId(terminalId);
      return;
    }

    if (!activeTerminalId) {
      setActiveTerminalId(terminalId);
    } else if (activeTerminalId === terminalId) {
      setActiveTerminalId(null);
    } else {
      onAddWire(activeTerminalId, terminalId, selectedColor);
      setActiveTerminalId(null);
    }
  };

  const getWirePath = (t1: Terminal, t2: Terminal, orderIndex: number = 0, totalOrders: number = 1, layer: number = 1) => {
    const stackOffset = (orderIndex * 6) - ((totalOrders - 1) * 3);

    const x1 = t1.x;
    const y1 = t1.y;
    const x2 = t2.x;
    const y2 = t2.y;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let sag = Math.min(24, dist * 0.25) + Math.abs(stackOffset);
    if (layer === 2) {
      sag = -Math.min(38, dist * 0.38) - Math.abs(stackOffset);
    } else if (layer === 3) {
      sag = Math.min(48, dist * 0.48) + Math.abs(stackOffset);
    } else if (layer >= 4) {
      const isEven = layer % 2 === 0;
      const step = Math.floor(layer / 2) * 16;
      sag = isEven
        ? -Math.min(38 + step, dist * (0.38 + step * 0.005)) - Math.abs(stackOffset)
        : Math.min(24 + step, dist * (0.25 + step * 0.005)) + Math.abs(stackOffset);
    }

    const cx1 = x1 + dx * 0.25;
    const cy1 = y1 + dy * 0.25 + sag;
    const cx2 = x1 + dx * 0.75;
    const cy2 = y1 + dy * 0.75 + sag;

    return {
      path: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
      midX: (x1 + x2) / 2,
      midY: (y1 + y2) / 2 + sag * 0.65
    };
  };

  const terminalStackCounts: Record<string, number> = {};
  wires.forEach(w => {
    terminalStackCounts[w.fromTerminalId] = (terminalStackCounts[w.fromTerminalId] || 0) + 1;
    terminalStackCounts[w.toTerminalId] = (terminalStackCounts[w.toTerminalId] || 0) + 1;
  });

  const inspectedTerminal = inspectTerminalId ? getTerminalById(inspectTerminalId) : null;
  const inspectedWires = inspectTerminalId ? wires.filter(w => w.fromTerminalId === inspectTerminalId || w.toTerminalId === inspectTerminalId) : [];

  const toggleWireLayerLocal = (wireId: string, currentLayer: number) => {
    const nextLayer = currentLayer + 1;
    setLocalWires(prev => ({ ...prev, [wireId]: nextLayer }));
  };

  return (
    <div className="board-card relative flex flex-col gap-3">
      {/* Sleek Unified Header Pill: Cable Color & Connection Status (Rediseño orgánico sin barras duplicadas) */}
      <div className="mx-4 mt-3 bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-xl">
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
          <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Plug size={16} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Cable Jack Banana</span>
            <span className="text-slate-100 font-sans">Selecciona Color:</span>
          </div>

          {/* Active Terminal Pulse Notification */}
          {activeTerminalId && (
            <span className="ml-2 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse text-xs font-mono font-bold flex items-center gap-1.5">
              <span>⚡ Origen: {getTerminalById(activeTerminalId)?.label}</span>
              <span className="text-slate-400 font-sans font-normal">➔ Clic en destino</span>
            </span>
          )}
        </div>

        {/* Color Swatch Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {WIRE_COLORS.map(c => {
            const isSelected = selectedColor === c.color;
            return (
              <button
                key={c.color}
                onClick={() => onSelectColor(c.color)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold transition-all duration-200 cursor-pointer ${isSelected
                    ? 'ring-2 ring-sky-400 scale-105 shadow-lg shadow-sky-500/25'
                    : 'opacity-80 hover:opacity-100 bg-slate-950/80'
                  }`}
                style={{
                  backgroundColor: isSelected ? c.color : undefined,
                  color: isSelected
                    ? (c.color === '#eab308' || c.color === '#10b981' ? '#0f172a' : '#ffffff')
                    : c.color,
                  border: isSelected ? '1px solid rgba(255,255,255,0.4)' : `1px solid ${c.color}60`
                }}
                title={`Seleccionar cable ${c.label}`}
              >
                <span
                  className="w-3 h-3 rounded-full shadow-inner inline-block border border-white/40"
                  style={{ backgroundColor: c.color }}
                />
                <span>{c.label} {isSelected && '✓'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Board Viewport */}
      <div
        className="board-viewport mx-4 mb-4 rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl relative flex-1 min-h-[480px]"
        onMouseMove={(e) => {
          if (activeTerminalId) {
            const plate = e.currentTarget.querySelector('.acrylic-plate');
            if (plate) {
              const pRect = plate.getBoundingClientRect();
              setMousePos({
                x: ((e.clientX - pRect.left) / pRect.width) * 100,
                y: ((e.clientY - pRect.top) / pRect.height) * 100
              });
            }
          }
        }}
      >
        <div className="acrylic-plate">
          {/* SVG Wires Layer */}
          <svg className="board-svg-layer" style={{ zIndex: 20, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="wire-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0.4" dy="0.8" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.5" />
              </filter>
            </defs>

            {wires.map((wire) => {
              const t1 = getTerminalById(wire.fromTerminalId);
              const t2 = getTerminalById(wire.toTerminalId);
              if (!t1 || !t2) return null;

              const effectiveLayer = localWires[wire.id] || wire.layer || 1;
              if (activeLayerFilter !== 0 && effectiveLayer !== activeLayerFilter) {
                return (
                  <g key={wire.id} style={{ opacity: 0.15 }}>
                    <path
                      d={getWirePath(t1, t2, wire.order, terminalStackCounts[wire.fromTerminalId] || 1, effectiveLayer).path}
                      fill="none"
                      stroke={wire.color}
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </g>
                );
              }

              const pathData = getWirePath(t1, t2, wire.order, terminalStackCounts[wire.fromTerminalId] || 1, effectiveLayer);
              const isHovered = hoveredWireId === wire.id;

              return (
                <g
                  key={wire.id}
                  style={{ pointerEvents: 'stroke', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setHoveredWireId(wire.id)}
                  onMouseLeave={() => setHoveredWireId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveWire(wire.id);
                  }}
                >
                  <path
                    d={pathData.path}
                    fill="none"
                    stroke="#000000"
                    strokeWidth={isHovered ? "2.6" : "2"}
                    strokeOpacity="0.65"
                    strokeLinecap="round"
                  />
                  <path
                    d={pathData.path}
                    fill="none"
                    stroke={wire.color}
                    strokeWidth={isHovered ? "1.9" : "1.5"}
                    strokeLinecap="round"
                    filter="url(#wire-shadow)"
                  />
                  <path
                    d={pathData.path}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={isHovered ? "0.6" : "0.35"}
                    strokeOpacity="0.6"
                    strokeDasharray="1.5 3"
                    strokeLinecap="round"
                  />
                  {isHovered && (
                    <g transform={`translate(${pathData.midX}, ${pathData.midY})`}>
                      <circle cx="0" cy="0" r="2.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.5" />
                    </g>
                  )}
                </g>
              );
            })}

            {activeTerminalId && mousePos && (() => {
              const startT = getTerminalById(activeTerminalId);
              if (!startT) return null;
              return (
                <path
                  d={`M ${startT.x} ${startT.y} L ${mousePos.x} ${mousePos.y}`}
                  fill="none"
                  stroke={selectedColor}
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  strokeOpacity="0.85"
                />
              );
            })()}
          </svg>

          {/* SYMMETRIC BLOCK GUIDE BACKGROUND LABELS */}
          <div style={{ position: 'absolute', left: '10%', top: '20%', width: '30%', height: '64%', border: '1px dashed rgba(59, 130, 246, 0.25)', borderRadius: '14px', pointerEvents: 'none' }}>
            <span style={{ position: 'absolute', top: '-18px', left: '0', right: '0', textAnchor: 'middle', textAlign: 'center', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#60a5fa', fontWeight: 800 }}>
              ▪ BLOQUE 1 (R1, R3, R4, R8) ▪
            </span>
          </div>
          <div style={{ position: 'absolute', left: '45%', top: '32%', width: '10%', height: '40%', border: '1px dashed rgba(234, 179, 8, 0.28)', borderRadius: '12px', pointerEvents: 'none' }}>
            <span style={{ position: 'absolute', top: '-18px', left: '0', right: '0', textAnchor: 'middle', textAlign: 'center', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#eab308', fontWeight: 800 }}>
              ▪ COL. 5 ▪
            </span>
          </div>
          <div style={{ position: 'absolute', left: '60%', top: '20%', width: '30%', height: '64%', border: '1px dashed rgba(168, 85, 247, 0.25)', borderRadius: '14px', pointerEvents: 'none' }}>
            <span style={{ position: 'absolute', top: '-18px', left: '0', right: '0', textAnchor: 'middle', textAlign: 'center', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#c084fc', fontWeight: 800 }}>
              ▪ BLOQUE 2 (R2, R6, R7, R9) ▪
            </span>
          </div>

          {/* Resistors Physical Components Layer */}
          <div className="resistor-layer" style={{ zIndex: 10 }}>
            {UDB_RESISTORS.map(resistor => {
              return (
                <div
                  key={resistor.id}
                  className="resistor-item"
                  style={{
                    left: `${resistor.x}%`,
                    top: `${resistor.y}%`,
                    width: `${resistor.width}%`,
                    height: `${resistor.height}%`
                  }}
                >
                  <div
                    className="w-full h-full flex flex-col items-center justify-center pointer-events-none select-none"
                    style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#292929ff', letterSpacing: '0.05em', lineHeight: '1.2' }}>
                      {resistor.id}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#04658fff', fontFamily: 'monospace', lineHeight: '1.2' }}>
                      {resistor.value >= 1000 ? `${(resistor.value / 1000).toFixed(1)} kΩ` : `${resistor.value} Ω`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terminal Banana Posts / Sockets Layer (Z-index 40 on TOP) */}
          <div className="terminal-layer" style={{ zIndex: 40 }}>
            {UDB_TERMINALS.map(term => {
              const isActive = activeTerminalId === term.id;
              const stackCount = terminalStackCounts[term.id] || 0;
              const isPower = term.type === 'power_pos' || term.type === 'power_neg';
              const isPos = term.label.includes('(+)');

              return (
                <div
                  key={term.id}
                  className="terminal-item"
                  style={{
                    left: `${term.x}%`,
                    top: `${term.y}%`,
                    cursor: 'pointer'
                  }}
                  onClick={(e) => handleTerminalClick(term.id, e)}
                  title={`Borne: ${term.label}. Clic para conectar. ${stackCount >= 2 ? 'Haz clic en el indicador ×' + stackCount + ' para abrir modal y gestionar cables.' : ''}`}
                >
                  <div className={`terminal-socket ${isActive ? 'active' : ''} ${isPower ? (term.type === 'power_pos' ? 'power-pos' : 'power-neg') : ''}`}>
                    <div className="socket-hole">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    </div>

                    {stackCount > 0 && (
                      <div
                        className={`stack-badge ${stackCount >= 2 ? 'hover:scale-125 transition cursor-pointer bg-amber-500 text-slate-950 font-black' : ''}`}
                        style={{ zIndex: 50 }}
                        onClick={(e) => {
                          if (stackCount >= 2) {
                            e.stopPropagation();
                            setInspectTerminalId(term.id);
                          }
                        }}
                      >
                        <span>🔌×{stackCount}</span>
                      </div>
                    )}

                    <div className="terminal-label" style={{
                      color: isPos ? '#fca5a5' : '#93c5fd',
                      background: isPos ? 'rgba(127, 29, 29, 0.92)' : 'rgba(30, 58, 138, 0.92)',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      fontWeight: 800,
                      letterSpacing: '0.03em'
                    }}>
                      {term.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stacked Wires Inspection Modal */}
      {inspectTerminalId && inspectedTerminal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setInspectTerminalId(null)}>
          <div className="bg-slate-900 border border-sky-500/40 rounded-3xl p-6 max-w-lg w-full flex flex-col gap-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Info className="text-sky-400" size={20} />
                <h3 className="font-bold text-slate-100 text-sm">
                  Gestión de Conexiones del Borne: <span className="text-sky-400 font-mono">{inspectedTerminal.label}</span>
                </h3>
              </div>
              <button
                onClick={() => setInspectTerminalId(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Hay <strong className="text-amber-400">{inspectedWires.length} cables</strong> apilados en esta terminal. Selecciona cuál deseas desconectar o cambiar de capa:
            </p>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {inspectedWires.map((wire, idx) => {
                const tFrom = getTerminalById(wire.fromTerminalId);
                const tTo = getTerminalById(wire.toTerminalId);
                const isOpposite = wire.fromTerminalId === inspectTerminalId ? tTo : tFrom;
                const effLayer = localWires[wire.id] || wire.layer || 1;

                return (
                  <div key={wire.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-white/60 shadow" style={{ backgroundColor: wire.color }} />
                      <div className="flex flex-col">
                        <span className="text-slate-100 font-bold">
                          Cable #{idx + 1} ➔ Hacia: <strong className="text-sky-300">{isOpposite?.label || 'Borne externo'}</strong>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Capa actual: Capa #{effLayer} ({effLayer === 1 ? 'Conexión Base Directa' : `Apilada en Paralelo ×${effLayer}`})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleWireLayerLocal(wire.id, effLayer)}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-bold cursor-pointer"
                        title="Cambiar altura Z del arco en paralelo"
                      >
                        Capa {effLayer} ➔
                      </button>
                      <button
                        onClick={() => {
                          onRemoveWire(wire.id);
                          if (inspectedWires.length <= 1) {
                            setInspectTerminalId(null);
                          }
                        }}
                        className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg transition font-sans font-bold flex items-center gap-1 border border-red-500/40 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setInspectTerminalId(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Cerrar Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
