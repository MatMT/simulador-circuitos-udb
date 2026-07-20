import React, { useEffect, useState } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { MultimeterMode } from '../types/instruments';
import { Save, History, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface DigitalMultimeterProps {
  value: number;
  error?: 'OL' | 'FUSE_BLOWN';
}

interface Measurement {
  id: string;
  timestamp: Date;
  mode: string;
  value: string;
  unit: string;
}

export default function DigitalMultimeter({ value, error }: DigitalMultimeterProps) {
  const { components, setMultimeterMode, registerComponent } = useCircuitStore();
  const [history, setHistory] = useState<Measurement[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const multimeterId = 'M1';
  const multimeter = components[multimeterId];

  useEffect(() => {
    if (!multimeter) {
      registerComponent({
        id: multimeterId,
        type: 'Multimeter',
        mode: 'V',
        terminals: {
          'COM': 'M1_COM',
          'V_OHMS': 'M1_V_OHMS',
          'A': 'M1_A'
        }
      } as any);
    }
  }, [multimeter, registerComponent]);

  const mode = ((multimeter as any)?.mode as MultimeterMode) || 'V';

  let displayValue = '0.000';
  let unit = '';

  if (error === 'OL') {
    displayValue = 'O.L';
    unit = '';
  } else if (error === 'FUSE_BLOWN') {
    displayValue = 'FUSE';
    unit = 'ERR';
  } else {
    // Format value based on mode
    if (mode === 'V') {
      unit = 'V';
      displayValue = value.toFixed(3);
    } else if (mode === 'A') {
      unit = 'mA';
      displayValue = value.toFixed(2);
    } else if (mode === 'OHMS') {
      if (value >= 1000) {
        displayValue = (value / 1000).toFixed(3);
        unit = 'kΩ';
      } else {
        displayValue = value.toFixed(1);
        unit = 'Ω';
      }
    }
  }

  const handleSaveMeasurement = () => {
    if (error === 'OL' || error === 'FUSE_BLOWN') return;
    setHistory(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      mode,
      value: displayValue,
      unit
    }, ...prev]);
    setIsHistoryOpen(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col items-center gap-5 shadow-2xl relative w-full">
      <div className="absolute top-3 left-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Activo</span>
      </div>
      <div className="text-slate-200 font-black text-sm tracking-tight mt-1">MULTÍMETRO DIGITAL</div>
      
      {/* Display LCD */}
      <div className="relative w-full h-24 bg-[#9ba784] rounded border-[4px] border-slate-800 shadow-inner flex flex-col justify-center items-end px-4 mt-2">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />
        
        <div className="flex items-baseline gap-2 z-10 text-slate-800" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.3)' }}>
          <span className={`font-mono text-4xl font-bold tracking-widest ${error ? 'text-red-600' : ''}`}>
            {displayValue}
          </span>
          <span className="font-mono text-xl font-bold">{unit}</span>
        </div>
        
        {/* Active Mode Indicator on LCD */}
        <div className="absolute top-2 left-3 z-10 flex gap-3 text-[10px] font-mono font-bold text-slate-700/60">
           <span className={mode === 'V' ? 'text-slate-900' : ''}>DC V</span>
           <span className={mode === 'A' ? 'text-slate-900' : ''}>DC A</span>
           <span className={mode === 'OHMS' ? 'text-slate-900' : ''}>OHM</span>
        </div>

        {/* Botón Guardar */}
        <button 
          onClick={handleSaveMeasurement}
          disabled={error === 'OL' || error === 'FUSE_BLOWN'}
          className="absolute bottom-2 left-2 z-20 bg-slate-800 text-sky-400 hover:text-sky-300 hover:bg-slate-700 p-1.5 rounded-lg border border-slate-700 shadow flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Guardar medición actual"
        >
          <Save size={14} />
          <span className="text-[10px] font-bold">GUARDAR</span>
        </button>
      </div>

      {/* Mode Selector Knob */}
      <div className="flex flex-col w-full items-center gap-3 mt-2">
        <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Selector de Modo</label>
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shadow-inner w-full justify-between">
          <button 
            onClick={() => setMultimeterMode(multimeterId, 'V')}
            className={`flex-1 py-2 text-xs font-bold rounded transition-all cursor-pointer ${mode === 'V' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50 shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            VOLT (V)
          </button>
          <button 
            onClick={() => setMultimeterMode(multimeterId, 'A')}
            className={`flex-1 py-2 text-xs font-bold rounded transition-all cursor-pointer ${mode === 'A' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            AMP (A)
          </button>
          <button 
            onClick={() => setMultimeterMode(multimeterId, 'OHMS')}
            className={`flex-1 py-2 text-xs font-bold rounded transition-all cursor-pointer ${mode === 'OHMS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            OHM (Ω)
          </button>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 w-full text-center shadow-inner mt-1">
        <div className="text-[10px] text-slate-500 font-mono flex flex-col gap-1">
          {mode === 'V' && <span>Conecta bornes: <strong className="text-sky-400">COM</strong> y <strong className="text-red-400">V/Ω</strong> en paralelo</span>}
          {mode === 'A' && <span>Conecta bornes: <strong className="text-sky-400">COM</strong> y <strong className="text-amber-400">A</strong> en serie</span>}
          {mode === 'OHMS' && <span>Conecta bornes: <strong className="text-sky-400">COM</strong> y <strong className="text-red-400">V/Ω</strong> (Sin Energía)</span>}
        </div>
      </div>

      {/* Panel de Historial */}
      <div className="w-full mt-2">
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full flex items-center justify-between p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer text-slate-300"
        >
          <div className="flex items-center gap-2 text-xs font-bold font-mono">
            <History size={16} className="text-sky-400" />
            <span>HISTORIAL DE MEDICIONES ({history.length})</span>
          </div>
          {isHistoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isHistoryOpen && (
          <div className="mt-2 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
            {history.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono italic">
                No hay lecturas guardadas.
              </div>
            ) : (
              <>
                <div className="max-h-48 overflow-y-auto">
                  {history.map((item, idx) => (
                    <div key={item.id} className={`flex items-center justify-between p-2.5 text-xs font-mono border-b border-slate-800/50 ${idx === 0 ? 'bg-sky-900/10' : ''}`}>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-[10px]">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                        <span className="font-bold text-slate-200">
                          {item.mode}: <span className="text-sky-300">{item.value} {item.unit}</span>
                        </span>
                      </div>
                      <button 
                        onClick={() => setHistory(h => h.filter(x => x.id !== item.id))}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Eliminar lectura"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-slate-900 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setHistory([])}
                    className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    Borrar Todo
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
