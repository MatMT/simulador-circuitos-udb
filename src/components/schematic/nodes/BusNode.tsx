'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitFork } from 'lucide-react';

export default function BusNode({ data }: { data: { label: string; type: 'split' | 'merge'; current: number } }) {
  const isConduction = data.current > 0;

  return (
    <div className={`px-3.5 py-2 rounded-xl bg-slate-900 border-2 transition-all duration-300 shadow-md flex items-center gap-2 font-mono text-xs ${
      isConduction
        ? data.type === 'split' ? 'border-amber-400 text-amber-300 shadow-amber-500/20' : 'border-emerald-400 text-emerald-300 shadow-emerald-500/20'
        : 'border-slate-700 text-slate-400'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          background: isConduction ? (data.type === 'split' ? '#fbbf24' : '#34d399') : '#64748b',
          width: 12,
          height: 12,
          border: '2px solid #0f172a',
          left: -7
        }}
      />

      <GitFork size={15} className={isConduction ? (data.type === 'split' ? 'text-amber-400' : 'text-emerald-400') : 'text-slate-600'} />
      <span className="font-bold tracking-tight">{data.label}</span>

      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{
          background: isConduction ? (data.type === 'split' ? '#fbbf24' : '#34d399') : '#64748b',
          width: 12,
          height: 12,
          border: '2px solid #0f172a',
          right: -7
        }}
      />
    </div>
  );
}
