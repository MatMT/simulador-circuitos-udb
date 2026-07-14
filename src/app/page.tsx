'use client';

import React, { useState } from 'react';
import PhysicalBoard from '../components/PhysicalBoard';
import DynamicSchematic from '../components/DynamicSchematic';
import CircuitTestBenchModal from '../components/CircuitTestBenchModal';
import { Wire, WireColor } from '../types/circuit';
import { solveCircuit } from '../utils/circuitEngine';
import { Zap, RotateCcw, BookOpen } from 'lucide-react';

export default function Home() {
  // 0 ejemplos / 0 prearmado al inicio. Empieza 100% limpio.
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedColor, setSelectedColor] = useState<WireColor>('#ef4444');
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);
  const [vin, setVin] = useState<number>(12);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);

  const analysis = solveCircuit(wires, vin);

  const handleAddWire = (fromId: string, toId: string, color: WireColor, customLayer?: number) => {
    if (fromId === toId) return;

    const fromStack = wires.filter(w => w.fromTerminalId === fromId || w.toTerminalId === fromId).length;
    const toStack = wires.filter(w => w.fromTerminalId === toId || w.toTerminalId === toId).length;
    const dynamicLayer = customLayer || Math.max(fromStack, toStack) + 1;

    const newWire: Wire = {
      id: `wire-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fromTerminalId: fromId,
      toTerminalId: toId,
      color,
      order: dynamicLayer - 1,
      layer: dynamicLayer
    };

    setWires(prev => [...prev, newWire]);

    // Cambio procedimental y rotativo automático del color de cable tras cada conexión
    const proceduralSequence: WireColor[] = ['#ef4444', '#3b82f6', '#10b981', '#eab308', '#8b5cf6', '#f97316', '#111827'];
    const currentIdx = proceduralSequence.indexOf(color);
    const nextColor = currentIdx !== -1 ? proceduralSequence[(currentIdx + 1) % proceduralSequence.length] : proceduralSequence[0];
    setSelectedColor(nextColor);
  };

  const handleRemoveWire = (wireId: string) => {
    setWires(prev => prev.filter(w => w.id !== wireId));
  };

  const handleClearWires = () => {
    setWires([]);
    setActiveTerminalId(null);
  };

  const handleLoadPreset = (presetWires: Wire[], presetVin?: number) => {
    setWires(presetWires);
    setActiveTerminalId(null);
    if (presetVin) setVin(presetVin);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo">
            <Zap size={24} />
          </div>
          <div>
            <div className="header-title">
              <span>UNIVERSIDAD DON BOSCO</span>
              <span className="header-badge">Simulador Dinámico de Laboratorio</span>
            </div>
            <div className="header-subtitle">
              Módulo de 9 Resistencias — Leyes de Kirchhoff & Ohm
            </div>
          </div>
        </div>

        <div className="header-actions flex items-center gap-2.5 flex-wrap">
          <div className="status-pill">
            <span style={{ color: '#94a3b8' }}>Estado:</span>
            <span style={{ fontWeight: 700, color: analysis.isComplete ? '#10b981' : '#60a5fa' }}>
              {analysis.isComplete ? '● LAZO CERRADO & MEDIDO' : '● EN TABLERO ACRÍLICO'}
            </span>
          </div>

          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white shadow-lg shadow-sky-500/20 transition transform hover:scale-105 cursor-pointer border border-sky-400/30"
            title="Cargar circuitos completos y mixtos canónicos de prueba"
          >
            <BookOpen size={16} />
            <span>Banco de Pruebas (Presets)</span>
          </button>

          <button
            onClick={handleClearWires}
            className="btn btn-secondary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow cursor-pointer"
            title="Limpiar todos los cables del tablero"
          >
            <RotateCcw size={16} />
            <span>Limpiar Tablero</span>
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="main-grid">
        <div className="panel-left">
          <PhysicalBoard
            wires={wires}
            onAddWire={handleAddWire}
            onRemoveWire={handleRemoveWire}
            onClearWires={handleClearWires}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            activeTerminalId={activeTerminalId}
            setActiveTerminalId={setActiveTerminalId}
          />
        </div>

        <div className="panel-right">
          <DynamicSchematic
            wires={wires}
            analysis={analysis}
            vin={vin}
            setVin={setVin}
          />
        </div>
      </main>

      {/* Modal de Banco de Pruebas */}
      <CircuitTestBenchModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onLoadPreset={handleLoadPreset}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-stats">
          <span>Total Cables en Tablero: <strong style={{ color: '#f8fafc' }}>{wires.length}</strong></span>
          <span>Nodos Activos: <strong style={{ color: '#f8fafc' }}>{analysis.nodes.length}</strong></span>
          <span>Resistencia Equiv. (R_eq): <strong style={{ color: '#10b981' }}>{analysis.req !== null ? `${analysis.req} Ω` : 'Abierto (∞)'}</strong></span>
          <span>Corriente Total (I_T): <strong style={{ color: '#22d3ee' }}>{analysis.totalCurrent} mA</strong></span>
        </div>
        <div>
          Simulador Exacto UDB — MNA & Reducción Serie-Paralelo
        </div>
      </footer>
    </div>
  );
}
