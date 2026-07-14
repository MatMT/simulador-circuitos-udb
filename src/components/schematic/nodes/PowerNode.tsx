'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export default function PowerNode({ data }: { data: { vin: number; current: number } }) {
  const isConduction = data.current > 0;

  return (
    <div className={`px-4 py-3 rounded-2xl bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 border-2 transition-all duration-300 shadow-xl flex flex-col items-center gap-1 min-w-[140px] ${
      isConduction ? 'border-red-500 shadow-red-500/25 scale-105' : 'border-red-500/50 shadow-slate-950'
    }`}>
      <div className="flex items-center gap-1.5 text-red-400 font-mono text-xs font-black uppercase tracking-wider">
        <Zap size={15} className={isConduction ? 'animate-pulse text-red-400' : 'text-red-500/60'} />
        <span>Fuente 1 (+)</span>
      </div>

      <div className="text-2xl font-black font-mono text-white tracking-tight my-0.5">
        {data.vin} <span className="text-red-400 text-sm">V</span>
      </div>

      <div className="px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-200 text-[10px] font-mono font-bold">
        {isConduction ? `Suministro: ${data.current.toFixed(2)} mA` : 'En Espera / Abierto'}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="pos"
        style={{
          background: '#ef4444',
          width: 14,
          height: 14,
          border: '3px solid #0f172a',
          right: -8
        }}
      />
    </div>
  );
}
