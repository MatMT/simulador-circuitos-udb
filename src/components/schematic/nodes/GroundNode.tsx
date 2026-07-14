'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function GroundNode({ data }: { data: { label?: string; current: number } }) {
  const isConduction = data.current > 0;

  return (
    <div className={`px-4 py-3 rounded-2xl bg-gradient-to-br from-slate-900 via-[#032541] to-slate-900 border-2 transition-all duration-300 shadow-xl flex flex-col items-center gap-1 min-w-[130px] ${
      isConduction ? 'border-sky-400 shadow-sky-500/25 scale-105' : 'border-sky-500/50 shadow-slate-950'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        id="neg"
        style={{
          background: '#38bdf8',
          width: 14,
          height: 14,
          border: '3px solid #0f172a',
          left: -8
        }}
      />

      <div className="flex items-center gap-1.5 text-sky-400 font-mono text-xs font-black uppercase tracking-wider">
        <span>⏚ Retorno GND</span>
      </div>

      <div className="text-2xl font-black font-mono text-white tracking-tight my-0.5">
        0 <span className="text-sky-400 text-sm">V</span>
      </div>

      <div className="px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-200 text-[10px] font-mono font-bold">
        {isConduction ? `Retorno: ${data.current.toFixed(2)} mA` : 'Tierra / Común (-)'}
      </div>
    </div>
  );
}
