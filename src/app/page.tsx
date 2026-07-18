'use client';

import React, { useState, useEffect, useMemo } from 'react';
import PhysicalBoard from '../components/PhysicalBoard';
import DynamicSchematic from '../components/DynamicSchematic';
import CircuitTestBenchModal from '../components/CircuitTestBenchModal';
import ShareCircuitModal from '../components/ShareCircuitModal';
import SaveCircuitModal from '../components/SaveCircuitModal';
import OlaLabsCarousel from '../components/OlaLabsCarousel';
import OlaLabsFooter from '../components/OlaLabsFooter';
import { WireColor, Wire } from '../types/circuit';
import { solveCircuit } from '../utils/circuitEngine';
import { Zap, RotateCcw, BookOpen, Save, Activity, Wrench, Cpu, Sliders, Info, X, Share2 } from 'lucide-react';
import { useCustomCircuits } from '../hooks/useCustomCircuits';
import LZString from 'lz-string';
import { CustomCircuit } from '../types/customCircuit';
import { useCircuitStore, selectWiresForMNA } from '../store/circuitStore';
import AnalogWattmeter from '../components/AnalogWattmeter';
import DigitalMultimeter from '../components/DigitalMultimeter';

export default function Home() {
  const { clearCables, loadPreset, cables } = useCircuitStore();
  const wiresForMNA = useMemo(() => selectWiresForMNA({ cables } as any), [cables]);
  const multimeter = useCircuitStore(state => (state as any).components?.['M1']);
  const multimeterMode = (multimeter?.mode as any) || 'V';
  const [selectedColor, setSelectedColor] = useState<WireColor | 'eraser'>('#ef4444');
  const [vin, setVin] = useState<number>(12);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [useStrictSigns, setUseStrictSigns] = useState<boolean>(true); // Siempre activado por defecto
  const [shareUrl, setShareUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'datos' | 'instrumentos'>('datos');
  const [activeInstrumentTab, setActiveInstrumentTab] = useState<'wattmeter' | 'multimeter'>('wattmeter');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  useEffect(() => {
    const savedTab = localStorage.getItem('udb_main_tab');
    if (savedTab) setActiveTab(savedTab as any);
    const savedInstTab = localStorage.getItem('udb_inst_tab');
    if (savedInstTab) setActiveInstrumentTab(savedInstTab as any);
  }, []);

  const handleMainTabChange = (tab: 'datos' | 'instrumentos') => {
    setActiveTab(tab);
    localStorage.setItem('udb_main_tab', tab);
  };

  const handleInstTabChange = (tab: 'wattmeter' | 'multimeter') => {
    setActiveInstrumentTab(tab);
    localStorage.setItem('udb_inst_tab', tab);
  };

  const { circuits, saveCircuit, deleteCircuit, duplicateCircuit } = useCustomCircuits();

  const analysis = useMemo(() => {
    return solveCircuit(wiresForMNA, vin, useStrictSigns, multimeterMode);
  }, [wiresForMNA, vin, useStrictSigns, multimeterMode]);

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
              loadPreset(parsed.wires);
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
  }, [loadPreset]);

  const handleClearWires = () => {
    clearCables();
  };

  const handleLoadPreset = (presetWires: Wire[], presetVin?: number) => {
    loadPreset(presetWires);
    if (presetVin) setVin(presetVin);
  };

  const handleSaveCircuit = () => {
    setIsSaveModalOpen(true);
  };

  const handleShareCustom = (circuit: CustomCircuit) => {
    const dataToShare = JSON.stringify({ wires: circuit.wires, vin: circuit.vin });
    const compressed = LZString.compressToEncodedURIComponent(dataToShare);
    const url = `${window.location.origin}${window.location.pathname}?share=${compressed}`;
    setShareUrl(url);
    setIsShareModalOpen(true);
  };

  const handleShareCurrent = () => {
    const dataToShare = JSON.stringify({ wires: wiresForMNA, vin });
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
            onClick={handleShareCurrent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow cursor-pointer"
            title="Compartir circuito actual"
          >
            <Share2 size={16} />
            <span>Compartir</span>
          </button>

          <button
            onClick={handleSaveCircuit}
            disabled={wiresForMNA.length === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition shadow cursor-pointer ${
              wiresForMNA.length > 0 
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
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
        </div>

        <div className="panel-right flex flex-col h-full bg-[#0f172a] rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl">
          {/* Top Header con Control de Voltaje Integrado (Rediseño limpio sin bloques redundantes) */}
          <div className="schematic-header flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3 p-4 bg-slate-900/50">
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
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-800">
                <button
                  onClick={() => setIsInfoModalOpen(true)}
                  className="p-1 rounded-full text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition cursor-pointer"
                  title="Información sobre Signos Algebraicos"
                >
                  <Info size={16} />
                </button>
                <label className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 cursor-pointer uppercase">
                  <span>Signos (+/-)</span>
                  <input
                    type="checkbox"
                    checked={useStrictSigns}
                    onChange={(e) => setUseStrictSigns(e.target.checked)}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex border-b border-slate-800/80 bg-slate-900/50">
            <button 
              onClick={() => handleMainTabChange('datos')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all cursor-pointer ${activeTab === 'datos' ? 'bg-slate-800/80 text-sky-400 border-b-[3px] border-sky-400 shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-b-[3px] border-transparent'}`}
            >
              <Activity size={18} />
              Datos y Cálculos
            </button>
            <button 
              onClick={() => handleMainTabChange('instrumentos')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all cursor-pointer ${activeTab === 'instrumentos' ? 'bg-slate-800/80 text-amber-400 border-b-[3px] border-amber-400 shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-b-[3px] border-transparent'}`}
            >
              <Wrench size={18} />
              Banco de Instrumentos
            </button>
          </div>
          
          <div className="flex-1 overflow-auto h-full w-full">
            {activeTab === 'datos' ? (
              <DynamicSchematic
                wires={wiresForMNA}
                analysis={analysis}
                vin={vin}
                setVin={setVin}
                useStrictSigns={useStrictSigns}
                setUseStrictSigns={setUseStrictSigns}
              />
            ) : (
              <div className="flex flex-col h-full bg-slate-900 overflow-y-auto">
                {/* Inner Instrument Tabs */}
                <div className="flex w-full bg-slate-950 border-b border-slate-800 shrink-0">
                  <button
                    onClick={() => handleInstTabChange('wattmeter')}
                    className={`flex-1 py-3.5 px-4 text-sm font-extrabold uppercase tracking-widest transition-colors cursor-pointer ${activeInstrumentTab === 'wattmeter' ? 'bg-slate-900 text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
                  >
                    Vatímetro Analógico
                  </button>
                  <button
                    onClick={() => handleInstTabChange('multimeter')}
                    className={`flex-1 py-3.5 px-4 text-sm font-extrabold uppercase tracking-widest transition-colors cursor-pointer ${activeInstrumentTab === 'multimeter' ? 'bg-slate-900 text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
                  >
                    Multímetro Digital
                  </button>
                </div>
                
                <div className="p-8 flex flex-col flex-1 items-center justify-center animate-fade-in">
                  <div className="w-full max-w-lg transition-all duration-300 scale-105 origin-center">
                    {activeInstrumentTab === 'wattmeter' ? (
                      <AnalogWattmeter realPower={analysis.isComplete ? (analysis.wattmeterPower || 0) : 0} />
                    ) : (
                      <DigitalMultimeter 
                        value={analysis.multimeterResult?.value || 0} 
                        error={analysis.multimeterResult?.error} 
                      />
                    )}
                  </div>
                  
                  <div className="text-center mt-12 shrink-0">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-400 text-xs font-mono font-medium shadow-inner">
                       <Zap size={16} className="text-sky-400" />
                       Motor MNA: Instrumentos Analógicos Conectados
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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

      <SaveCircuitModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={(name) => saveCircuit(name, wiresForMNA, vin)}
        wires={wiresForMNA}
        vin={vin}
      />

      <ShareCircuitModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />

      {/* Info Modal para Signos Algebraicos */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-sky-500/40 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl relative">
            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="p-6 flex flex-col gap-4">
              <h3 className="text-xl font-black text-sky-400 flex items-center gap-2">
                <Info size={24} /> Convención de Signos Pasiva
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Este simulador permite activar o desactivar los <strong>Signos Algebraicos Estrictos</strong>.
              </p>
              <ul className="text-sm text-slate-300 list-disc list-inside space-y-2">
                <li>
                  <strong className="text-emerald-400">Desactivado (Magnitud Absoluta):</strong> Verás las mediciones siempre positivas. Ideal para conocer la cantidad física real de voltaje o corriente disipada.
                </li>
                <li>
                  <strong className="text-purple-400">Activado (Algebraico Estricto):</strong> Sigue la convención pasiva de signos de las guías de laboratorio. Si inyectas la polaridad inversa (p. ej. la corriente entra por el terminal negativo de referencia de una resistencia), las lecturas de Voltaje y Corriente serán <strong>negativas</strong>.
                </li>
              </ul>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="w-full mt-2 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Circuit Telemetry Status Ribbon */}
      <div className="bg-slate-950 border-t border-slate-900 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Cables MNA: <strong className="text-white font-sans font-bold text-sm">{wiresForMNA.length}</strong></span>
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

      <OlaLabsFooter />
    </div>
  );
}
