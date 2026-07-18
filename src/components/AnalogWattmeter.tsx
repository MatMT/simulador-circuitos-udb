import React, { useEffect } from 'react';
import { useAnalogWattmeter } from '../hooks/useAnalogWattmeter';
import { useCircuitStore } from '../store/circuitStore';
import { VoltageRange, CurrentRange, WattmeterComponent } from '../types/instruments';

interface AnalogWattmeterProps {
  realPower: number; // calculated by MNA
}

export default function AnalogWattmeter({ realPower }: AnalogWattmeterProps) {
  const { components, setWattmeterRanges, registerComponent } = useCircuitStore();
  const wattmeterId = 'W1';
  const wattmeter = components[wattmeterId];

  useEffect(() => {
    if (!wattmeter) {
      registerComponent({
        id: wattmeterId,
        type: 'Wattmeter',
        selectedVoltageRange: 100,
        selectedCurrentRange: 1,
        terminals: {
          'O': 'W1_O',
          'I': 'W1_I',
          'U': 'W1_U'
        }
      } as any);
    }
  }, [wattmeter, registerComponent]);

  const wattmeterComp = wattmeter as WattmeterComponent | undefined;
  const vRange = wattmeterComp?.selectedVoltageRange || 100;
  const iRange = wattmeterComp?.selectedCurrentRange || 1;

  const { pMax, factors, deflection } = useAnalogWattmeter({
    realPower,
    voltageRange: vRange,
    currentRange: iRange,
    maxDeflectionDegrees: 90
  });

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col items-center gap-5 shadow-2xl relative w-full">
      <div className="absolute top-3 left-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Activo</span>
      </div>
      <div className="text-slate-200 font-black text-sm tracking-tight mt-1">VATÍMETRO SO5127-1R6</div>
      
      {/* Display Analógico */}
      <div className="relative w-56 h-28 bg-[#fdfdfd] rounded-t-full border-[6px] border-slate-800 overflow-hidden shadow-inner flex justify-center items-end mt-2">
        {/* Scale Background */}
        <div className="absolute inset-0 opacity-10">
           {/* Grid lines for aesthetics could go here */}
        </div>
        
        {/* Aguja */}
        <div 
          className={`w-1.5 h-24 bg-[#e11d48] origin-bottom rounded-t-full transition-transform duration-300 ease-out shadow-md z-20 ${deflection.isClippingHigh ? 'animate-bounce' : ''}`}
          style={{ transform: `rotate(${deflection.cssRotationDegrees}deg)` }}
        />
        
        {/* Base Aguja */}
        <div className="absolute w-6 h-6 bg-slate-950 rounded-full bottom-[-10px] z-30 shadow-lg border-2 border-slate-700" />
      </div>

      <div className="flex gap-4 w-full justify-between mt-2">
        <div className="flex flex-col flex-1">
          <label className="text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Rango Voltaje (U)</label>
          <select 
            className="bg-slate-950 text-sky-400 border border-slate-700 rounded-lg p-2 text-sm font-bold shadow-inner cursor-pointer"
            value={vRange}
            onChange={(e) => setWattmeterRanges(wattmeterId, Number(e.target.value), iRange)}
          >
            <option value="3">3 V</option>
            <option value="10">10 V</option>
            <option value="30">30 V</option>
            <option value="100">100 V</option>
            <option value="300">300 V</option>
            <option value="1000">1000 V</option>
          </select>
        </div>

        <div className="flex flex-col flex-1">
          <label className="text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">Rango Corriente (I)</label>
          <select 
            className="bg-slate-950 text-sky-400 border border-slate-700 rounded-lg p-2 text-sm font-bold shadow-inner cursor-pointer"
            value={iRange}
            onChange={(e) => setWattmeterRanges(wattmeterId, vRange, Number(e.target.value))}
          >
            <option value="0.1">0.1 A</option>
            <option value="0.3">0.3 A</option>
            <option value="1">1 A</option>
            <option value="3">3 A</option>
            <option value="10">10 A</option>
            <option value="30">30 A</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 w-full text-center shadow-inner">
        <div className="text-xs text-amber-400 font-mono font-black">
          Factor de Escala: x{factors.recommendedFactor} <span className="text-slate-500 font-normal">({factors.recommendedScale})</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-1.5 flex justify-between px-2">
          <span>Max: {pMax} W</span>
          <span>Lectura: <span className="text-slate-300 font-bold">{realPower.toFixed(2)} W</span></span>
        </div>
      </div>
    </div>
  );
}
