'use client';

import React, { useState } from 'react';
import { CIRCUIT_PRESETS, CircuitPreset } from '../utils/circuitPresets';
import { Wire } from '../types/circuit';
import { CustomCircuit } from '../types/customCircuit';
import { BookOpen, Zap, X, ArrowRight, Layers, CheckCircle, ShieldCheck, Trash2, Copy, Share2, FolderOpen, QrCode, Link as LinkIcon, Scan } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import LZString from 'lz-string';

interface CircuitTestBenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPreset: (wires: Wire[], vin?: number) => void;
  customCircuits: CustomCircuit[];
  onDeleteCustom: (id: string) => void;
  onDuplicateCustom: (id: string) => void;
  onShareCustom: (circuit: CustomCircuit) => void;
}

export default function CircuitTestBenchModal({
  isOpen,
  onClose,
  onLoadPreset,
  customCircuits,
  onDeleteCustom,
  onDuplicateCustom,
  onShareCustom
}: CircuitTestBenchModalProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'import'>('presets');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'serie' | 'paralelo' | 'mixto'>('all');
  const [selectedPreset, setSelectedPreset] = useState<CircuitPreset | null>(CIRCUIT_PRESETS[3]);
  const [selectedCustom, setSelectedCustom] = useState<CustomCircuit | null>(null);
  
  // Import state
  const [importUrl, setImportUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [importError, setImportError] = useState('');

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

  const handleLoadPreset = (preset: CircuitPreset) => {
    onLoadPreset(preset.wires, 12);
    onClose();
  };

  const handleLoadCustom = (circuit: CustomCircuit) => {
    onLoadPreset(circuit.wires, circuit.vin || 12);
    onClose();
  };

  const handleProcessImport = (urlToProcess: string) => {
    setImportError('');
    try {
      let dataStr = urlToProcess;
      if (urlToProcess.includes('?share=')) {
        dataStr = urlToProcess.split('?share=')[1].split('&')[0];
      }
      
      const decoded = LZString.decompressFromEncodedURIComponent(dataStr);
      if (!decoded) throw new Error('No se pudo decodificar el enlace');
      
      const parsed = JSON.parse(decoded);
      if (parsed && Array.isArray(parsed.wires)) {
        onLoadPreset(parsed.wires, parsed.vin || 12);
        onClose();
      } else {
        throw new Error('Formato de circuito inválido');
      }
    } catch (e) {
      setImportError('Enlace inválido o corrupto. Verifica que sea un enlace de OlaLabs correcto.');
    }
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
                Universidad Don Bosco
              </span>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-100 flex items-center gap-2">
                <span>Banco de Circuitos</span>
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

        {/* Tabs */}
        <div className="px-6 pt-4 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-bold text-sm transition ${
              activeTab === 'presets' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={18} />
            Presets Oficiales
          </button>
          
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-bold text-sm transition ${
              activeTab === 'custom' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen size={18} />
            Mis Circuitos
          </button>
          
          <button
            onClick={() => {
              setActiveTab('import');
              setIsScanning(false);
            }}
            className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-bold text-sm transition ${
              activeTab === 'import' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode size={18} />
            Importar
          </button>
        </div>

        {activeTab === 'presets' && (
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
        )}

        {/* Contenido Principal */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[460px]">
          
          {/* Lista Izquierda */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-800 p-4 overflow-y-auto flex flex-col gap-2.5 bg-slate-950/30">
            {activeTab === 'presets' ? (
              filteredPresets.map((preset) => {
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
              })
            ) : (
              customCircuits.length > 0 ? customCircuits.map((circuit) => {
                const isSelected = selectedCustom?.id === circuit.id;
                return (
                  <div
                    key={circuit.id}
                    onClick={() => setSelectedCustom(circuit)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase border bg-slate-800 text-slate-300 border-slate-700">
                        {new Date(circuit.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm">{circuit.name}</h4>
                    <p className="text-xs text-slate-400">{circuit.wires.length} cables conectados</p>
                  </div>
                );
              }) : (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  No hay circuitos guardados aún.
                </div>
              )
            )}
          </div>

          {/* Panel de Detalle Derecha */}
          <div className="md:col-span-7 p-6 overflow-y-auto flex flex-col justify-between gap-6 bg-slate-900/40">
            {activeTab === 'presets' ? (
              selectedPreset ? (
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
                    <h3 className="text-xl font-extrabold text-slate-100 mb-2">{selectedPreset.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">{selectedPreset.description}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                      Sustentación Teórica:
                    </span>
                    <div className="text-sm font-mono font-black text-amber-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      {selectedPreset.formulaExplanation}
                    </div>
                  </div>
                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-sky-400" />
                      <span className="text-slate-300">Cables Jack preconfigurados:</span>
                    </div>
                    <strong className="text-sky-300 bg-sky-500/15 px-3 py-1 rounded-lg border border-sky-500/30">
                      {selectedPreset.wires.length} Conexiones Jack
                    </strong>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer">
                      Cancelar
                    </button>
                    <button onClick={() => handleLoadPreset(selectedPreset)} className="px-6 py-3 rounded-xl font-mono text-sm font-extrabold text-white bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 shadow-lg shadow-sky-500/25 flex items-center gap-2 transition transform hover:scale-[1.02] cursor-pointer">
                      <Zap size={18} />
                      <span>⚡ Cargar y Probar ({selectedPreset.expectedReq} Ω)</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">Selecciona un circuito de la lista.</div>
              )
            ) : (
              selectedCustom ? (
                <div className="flex flex-col gap-5 h-full">
                  <div>
                    <h3 className="text-2xl font-extrabold text-emerald-400 mb-2 flex items-center gap-3">
                      <FolderOpen size={24} /> {selectedCustom.name}
                    </h3>
                    <p className="text-sm text-slate-400 font-mono">
                      Creado el: {new Date(selectedCustom.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm font-mono border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400">Total de Conexiones (Cables):</span>
                      <strong className="text-slate-200">{selectedCustom.wires.length}</strong>
                    </div>
                    <div className="flex items-center justify-between text-sm font-mono">
                      <span className="text-slate-400">Voltaje Vin:</span>
                      <strong className="text-amber-400">{selectedCustom.vin || 12}V</strong>
                    </div>
                  </div>

                  <div className="flex-1"></div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => onDuplicateCustom(selectedCustom.id)}
                      className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Copy size={16} /> Duplicar
                    </button>
                    <button
                      onClick={() => onShareCustom(selectedCustom)}
                      className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold text-sky-300 bg-sky-900/40 hover:bg-sky-900/80 border border-sky-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Share2 size={16} /> Compartir (QR)
                    </button>
                    <button
                      onClick={() => {
                        onDeleteCustom(selectedCustom.id);
                        setSelectedCustom(null);
                      }}
                      className="col-span-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={16} /> Eliminar Circuito
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer">
                      Cancelar
                    </button>
                    <button onClick={() => handleLoadCustom(selectedCustom)} className="px-6 py-3 rounded-xl font-mono text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition transform hover:scale-[1.02] cursor-pointer">
                      <Zap size={18} />
                      <span>Cargar en Tablero</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">Selecciona un circuito de la lista.</div>
              )
            )}

            {activeTab === 'import' && (
              <div className="flex flex-col gap-6 p-6 max-w-lg mx-auto w-full animate-fade-in">
                <div className="text-center">
                  <h3 className="text-2xl font-extrabold text-purple-400 mb-2 flex items-center justify-center gap-3">
                    <QrCode size={28} /> Importar Circuito
                  </h3>
                  <p className="text-sm text-slate-400 font-mono">
                    Pega un enlace de OlaLabs o escanea un código QR desde la cámara de tu dispositivo.
                  </p>
                </div>

                {importError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-xs font-mono font-bold text-center">
                    {importError}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-2">
                    <LinkIcon size={14} /> Enlace de OlaLabs
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-purple-500 transition font-mono text-xs"
                    />
                    <button
                      onClick={() => handleProcessImport(importUrl)}
                      disabled={!importUrl.trim()}
                      className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-lg shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      Cargar
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center py-2">
                  <div className="border-t border-slate-800 absolute w-full"></div>
                  <span className="bg-slate-900 px-3 text-xs font-mono text-slate-500 relative z-10">O</span>
                </div>

                {!isScanning ? (
                  <button
                    onClick={() => setIsScanning(true)}
                    className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-300 transition cursor-pointer"
                  >
                    <Scan size={32} className="text-sky-400" />
                    <span className="font-bold">Iniciar Escáner QR</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-3 bg-black rounded-2xl overflow-hidden border border-slate-800">
                    <Scanner
                      onScan={(result) => {
                        if (result && result.length > 0 && result[0].rawValue) {
                          setIsScanning(false);
                          handleProcessImport(result[0].rawValue);
                        }
                      }}
                      onError={(err) => console.error(err)}
                      styles={{ container: { width: '100%', paddingBottom: '100%' } }}
                    />
                    <button
                      onClick={() => setIsScanning(false)}
                      className="p-3 bg-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/30 transition text-center cursor-pointer"
                    >
                      Detener Escáner
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
