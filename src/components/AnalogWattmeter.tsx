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
      <div className="relative w-72 h-36 bg-[#fdfdfd] rounded-t-full border-[6px] border-slate-800 overflow-hidden shadow-inner flex justify-center items-end mt-2">
        {/* Scale Background */}
        <div className="absolute inset-0 opacity-10">
           {/* Grid lines for aesthetics could go here */}
        </div>
        
        {/* Aguja */}
        <div 
          className={`absolute w-2 h-32 bg-[#e11d48] origin-bottom rounded-t-full transition-transform duration-300 ease-out shadow-md z-20 ${deflection.isClippingHigh ? 'animate-bounce' : ''}`}
          style={{ bottom: '0px', transform: `rotate(${deflection.cssRotationDegrees}deg)` }}
        />
        
        {/* Base Aguja */}
        <div className="absolute w-8 h-8 bg-slate-950 rounded-full bottom-[-16px] z-30 shadow-lg border-2 border-slate-700" />
        
        {/* Escala Superior (0-10) */}
        <div className="absolute inset-0 pointer-events-none z-10 flex justify-center items-end">
          {Array.from({ length: 51 }).map((_, i) => {
            const angle = -45 + (i / 50) * 90;
            const isMajor = i % 10 === 0;
            const isMedium = i % 5 === 0 && !isMajor;
            const num = (i / 10) * 2;
            return (
              <div 
                key={`top-${i}`} 
                className="absolute origin-bottom h-[128px] flex flex-col items-center justify-start"
                style={{ transform: `rotate(${angle}deg)`, bottom: '0px' }}
              >
                <div className={`bg-slate-800 ${isMajor ? 'w-[2px] h-3' : isMedium ? 'w-[1.5px] h-2' : 'w-px h-1.5'}`} />
                {isMajor && (
                  <span 
                    className="text-[10px] font-bold text-slate-800 mt-1 leading-none" 
                    style={{ transform: `rotate(${-angle}deg)` }}
                  >
                    {num}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Escala Inferior (0-3) */}
        <div className="absolute inset-0 pointer-events-none z-10 flex justify-center items-end">
          {Array.from({ length: 31 }).map((_, i) => {
            const angle = -45 + (i / 30) * 90;
            const isMajor = i % 10 === 0;
            const isMedium = i % 5 === 0 && !isMajor;
            const num = i / 10;
            return (
              <div 
                key={`bottom-${i}`} 
                className="absolute origin-bottom h-[96px] flex flex-col items-center justify-start"
                style={{ transform: `rotate(${angle}deg)`, bottom: '0px' }}
              >
                <div className={`bg-slate-800 ${isMajor ? 'w-[2px] h-3' : isMedium ? 'w-[1.5px] h-2' : 'w-px h-1.5'}`} />
                {isMajor && (
                  <span 
                    className="text-[10px] font-bold text-slate-800 mt-1 leading-none" 
                    style={{ transform: `rotate(${-angle}deg)` }}
                  >
                    {num}
                  </span>
                )}
              </div>
            );
          })}
        </div>
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

      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 w-full shadow-inner flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <div className="text-xs text-amber-400 font-mono font-black flex flex-col">
            <span>Factor: x{factors.recommendedFactor}</span>
            <span className="text-[9px] text-slate-500 font-normal">Escala: 0-{factors.recommendedScale}</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-mono">Max: {pMax} W</div>
            <div className="text-xs text-slate-300 font-bold font-mono">Lectura: {realPower.toFixed(2)} W</div>
          </div>
        </div>

        {/* Reference Table */}
        <div className="mt-2 border border-slate-700 bg-slate-900 overflow-hidden text-[9px] font-mono select-none">
          <div className="flex border-b border-slate-700">
          <div className="w-8 flex-shrink-0 border-r border-slate-700 flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-0.5">
            <span>U/V</span><span>I/A</span>
          </div>
          {[3, 10, 30, 100, 300, 1000].map(v => (
            <div key={`header-${v}`} className={`flex-1 text-center py-1 border-r border-slate-700 last:border-0 ${v === vRange ? 'bg-sky-900/40 text-sky-300 font-bold' : 'text-slate-400'}`}>
              {v}
            </div>
          ))}
        </div>
        {[0.1, 0.3, 1, 3, 10, 30].map((i, r) => (
          <div key={i} className="flex border-b border-slate-700 last:border-0">
            <div className={`w-8 flex-shrink-0 border-r border-slate-700 text-center py-1 ${i === iRange ? 'bg-sky-900/40 text-sky-300 font-bold' : 'bg-slate-800 text-slate-400'}`}>
              {i}
            </div>
            {[3, 10, 30, 100, 300, 1000].map((v, c) => {
              const exponent = Math.floor((c + (r % 2)) / 2) + Math.floor(r / 2) - 1;
              const displayFactor = Math.pow(10, exponent).toString();
              
              const isScale10 = (r + c) % 2 !== 0;
              const isSelected = v === vRange && i === iRange;
              
              return (
                <div 
                  key={`${i}-${v}`} 
                  className={`flex-1 flex items-center justify-center border-r border-slate-700 last:border-0 relative ${isScale10 ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-900'} ${isSelected ? 'ring-2 ring-inset ring-sky-500 z-10' : ''}`}
                >
                  <span className="font-bold tracking-tighter">{displayFactor}</span>
                </div>
              );
            })}
          </div>
        ))}
          <div className="flex bg-slate-950 p-2 text-[10px] gap-4 items-center justify-center border-t border-slate-700 text-slate-400">
            <div className="flex items-center gap-1.5"><div className="w-4 h-3 bg-slate-950 border border-slate-700"></div> SKALA 0-10</div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-3 bg-slate-100 border border-slate-400"></div> SKALA 0-3</div>
          </div>
        </div>
      </div>
    </div>
  );
}
