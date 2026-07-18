import React, { useEffect } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { MultimeterMode } from '../types/instruments';

interface DigitalMultimeterProps {
  value: number;
  error?: 'OL' | 'FUSE_BLOWN';
}

export default function DigitalMultimeter({ value, error }: DigitalMultimeterProps) {
  const { components, setMultimeterMode, registerComponent } = useCircuitStore();
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
    </div>
  );
}
