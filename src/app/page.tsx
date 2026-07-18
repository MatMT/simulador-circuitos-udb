'use client';

import React, { useState, useEffect } from 'react';
import PhysicalBoard from '../components/PhysicalBoard';
import DynamicSchematic from '../components/DynamicSchematic';
import CircuitTestBenchModal from '../components/CircuitTestBenchModal';
import ShareCircuitModal from '../components/ShareCircuitModal';
import OlaLabsCarousel from '../components/OlaLabsCarousel';
import OlaLabsFooter from '../components/OlaLabsFooter';
import { Wire, WireColor } from '../types/circuit';
import { solveCircuit } from '../utils/circuitEngine';
import { Zap, RotateCcw, BookOpen, Save } from 'lucide-react';
import { useCustomCircuits } from '../hooks/useCustomCircuits';
import LZString from 'lz-string';
import { CustomCircuit } from '../types/customCircuit';

export default function Home() {
  // 0 ejemplos / 0 prearmado al inicio. Empieza 100% limpio.
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedColor, setSelectedColor] = useState<WireColor>('#ef4444');
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);
  const [vin, setVin] = useState<number>(12);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  const { circuits, saveCircuit, deleteCircuit, duplicateCircuit } = useCustomCircuits();

  const analysis = solveCircuit(wires, vin);

  useEffect(() => {
    // Verificar si hay un circuito compartido en la URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shareData = urlParams.get('share');
      if (shareData) {
        try {
          const decoded = LZString.decompressFromEncodedURIComponent(shareData);
          if (decoded) {
            const parsed = JSON.parse(decoded);
            if (parsed && Array.isArray(parsed.wires)) {
              setWires(parsed.wires);
              if (parsed.vin) setVin(parsed.vin);
              
              // Limpiar la URL sin recargar la página
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        } catch (e) {
          console.error('Error loading shared circuit', e);
        }
      }
    }
  }, []);

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

  const handleSaveCircuit = () => {
    const name = window.prompt('Introduce un nombre para el circuito:', `Mi Circuito ${new Date().toLocaleDateString()}`);
    if (name) {
      saveCircuit(name, wires, vin);
      alert('Circuito guardado en tu Banco de Circuitos local.');
    }
  };

  const handleShareCustom = (circuit: CustomCircuit) => {
    const dataToShare = JSON.stringify({ wires: circuit.wires, vin: circuit.vin });
    const compressed = LZString.compressToEncodedURIComponent(dataToShare);
    const url = `${window.location.origin}${window.location.pathname}?share=${compressed}`;
    setShareUrl(url);
    setIsShareModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo">
            <Zap size={26} />
          </div>
          <div>
            <div className="header-title">
              <span>UNIVERSIDAD DON BOSCO</span>
              <span className="header-badge">BETA</span>
            </div>
            <div className="header-subtitle font-sans tracking-tight">
              Laboratorio de Circuitos · 9 Resistencias
            </div>
          </div>
        </div>

        <div className="header-actions flex items-center gap-2.5 flex-wrap font-sans">
          <div className="status-pill">
            <span style={{ color: '#94a3b8' }}>Estado:</span>
            <span style={{ fontWeight: 700, color: analysis.isComplete ? '#10b981' : '#60a5fa' }}>
              {analysis.isComplete ? '● Lazo Medido' : '● Tablero Acrílico'}
            </span>
          </div>

          <button
            onClick={handleSaveCircuit}
            disabled={wires.length === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition shadow cursor-pointer ${
              wires.length > 0 
                ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30' 
                : 'bg-slate-800/50 text-slate-500 border border-slate-800/50 cursor-not-allowed'
            }`}
            title="Guardar circuito actual en el banco local"
          >
            <Save size={16} />
            <span>Guardar</span>
          </button>

          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white shadow-lg shadow-sky-500/20 transition transform hover:scale-105 cursor-pointer border border-sky-400/30"
            title="Abrir Banco de Circuitos y Presets"
          >
            <BookOpen size={16} />
            <span>Banco de Circuitos</span>
          </button>

          <button
            onClick={handleClearWires}
            className="btn btn-secondary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow cursor-pointer"
            title="Limpiar todos los cables del tablero"
          >
            <RotateCcw size={16} />
            <span>Limpiar</span>
          </button>
        </div>
      </header>

      {/* Carrusel Interno de Patrocinio - OlaLabs */}
      <OlaLabsCarousel />

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
        customCircuits={circuits}
        onDeleteCustom={deleteCircuit}
        onDuplicateCustom={duplicateCircuit}
        onShareCustom={handleShareCustom}
      />

      <ShareCircuitModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />

      {/* Live Circuit Telemetry Status Ribbon */}
      <div className="bg-slate-950 border-t border-slate-900 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Cables: <strong className="text-white font-sans font-bold text-sm">{wires.length}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span>Nodos: <strong className="text-white font-sans font-bold text-sm">{analysis.nodes.length}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span>R_eq: <strong className="text-emerald-400 font-sans font-extrabold text-sm">{analysis.req !== null ? `${analysis.req} Ω` : '∞'}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span>I_T: <strong className="text-cyan-400 font-sans font-extrabold text-sm">{analysis.totalCurrent} mA</strong></span>
          </span>
        </div>
        <div className="text-[11px] text-slate-500 hidden xl:block font-sans font-medium tracking-tight">
          ⚡ Motor MNA en Tiempo Real
        </div>
      </div>

      {/* Footer Principal Espacioso de Atribución, Beta y Feedback - OlaLabs */}
      <OlaLabsFooter />
    </div>
  );
}
