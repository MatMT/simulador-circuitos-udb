'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Cpu } from 'lucide-react';

export default function ResistorNode({
  data
}: {
  data: {
    id: string;
    label: string;
    value: number;
    voltageDrop: number;
    current: number;
    power: number;
  };
}) {
  const isConduction = data.current > 0;
  const formattedVal = data.value >= 1000 ? `${(data.value / 1000).toFixed(1)} kΩ` : `${data.value} Ω`;

  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-slate-900 border-2 transition-all duration-300 shadow-xl flex flex-col items-center gap-2 min-w-[170px] ${
        isConduction
          ? 'border-sky-400 shadow-sky-500/25 bg-gradient-to-b from-slate-900 to-[#0c192c]'
          : 'border-slate-700/80 shadow-slate-950 opacity-85 hover:opacity-100'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          background: isConduction ? '#38bdf8' : '#64748b',
          width: 14,
          height: 14,
          border: '3px solid #0f172a',
          left: -8
        }}
      />

      {/* Cabecera del Resistor */}
      <div className="flex items-center justify-between w-full gap-2 border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-1.5 font-mono text-xs font-black text-sky-400">
          <Cpu size={14} />
          <span>{data.id}</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-black">
          {formattedVal}
        </span>
      </div>

      {/* Símbolo central de Resistencia IEEE */}
      <div className="w-full flex items-center justify-center py-1">
        <div className={`w-28 h-7 rounded-lg border-2 flex items-center justify-center font-mono text-[11px] font-bold ${
          isConduction ? 'bg-sky-500/10 border-sky-400 text-sky-200' : 'bg-slate-950 border-slate-700 text-slate-400'
        }`}>
          {isConduction ? `⚡ ${data.voltageDrop} V` : '0.00 V'}
        </div>
      </div>

      {/* Footer con Corriente e Disipación */}
      <div className="grid grid-cols-2 gap-1.5 w-full text-[10px] font-mono">
        <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800 flex flex-col items-center">
          <span className="text-slate-400">Corriente (I)</span>
          <strong className={isConduction ? 'text-emerald-400 font-extrabold' : 'text-slate-500'}>
            {data.current} mA
          </strong>
        </div>
        <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800 flex flex-col items-center">
          <span className="text-slate-400">Potencia (P)</span>
          <strong className={isConduction ? 'text-purple-400 font-extrabold' : 'text-slate-500'}>
            {data.power} mW
          </strong>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{
          background: isConduction ? '#34d399' : '#64748b',
          width: 14,
          height: 14,
          border: '3px solid #0f172a',
          right: -8
        }}
      />
    </div>
  );
}
