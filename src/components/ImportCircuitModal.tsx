'use client';

import React, { useState } from 'react';
import { X, Download, AlertTriangle } from 'lucide-react';
import LZString from 'lz-string';

interface ImportCircuitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (wires: any[], vin?: number) => void;
}

export default function ImportCircuitModal({ isOpen, onClose, onImport }: ImportCircuitModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = () => {
    setError(null);
    let rawJsonStr = inputValue.trim();

    try {
      // 1. Try to parse as a URL
      if (rawJsonStr.startsWith('http')) {
        const url = new URL(rawJsonStr);
        const shareParam = url.searchParams.get('share');
        if (shareParam) {
          const decoded = LZString.decompressFromEncodedURIComponent(shareParam);
          if (decoded) {
            rawJsonStr = decoded;
          } else {
            throw new Error('URL inválida o corrupta.');
          }
        }
      }

      // 2. Try to parse as JSON
      const parsed = JSON.parse(rawJsonStr);
      
      if (!parsed || !Array.isArray(parsed.wires)) {
        throw new Error('El JSON no contiene un arreglo de "wires" válido.');
      }

      // 3. Success
      onImport(parsed.wires, parsed.vin);
      setInputValue('');
      onClose();
    } catch (e: any) {
      setError(e.message || 'El texto ingresado no es un JSON o Enlace válido.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-sky-500/40 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/40 text-sky-400">
              <Download size={24} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                Importar Circuito
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

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-slate-300">
            Pega a continuación el <strong>Enlace Compartido</strong> (URL) o directamente el código <strong>RAW JSON</strong> del circuito que deseas cargar.
          </p>

          <textarea
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            placeholder='Ejemplo: https://simulador.../?share=...  o  {"wires": [...], "vin": 12}'
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-slate-400 h-40 resize-none outline-none shadow-inner focus:border-sky-500/50 transition-colors"
          />

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={!inputValue.trim()}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition shadow-lg cursor-pointer flex items-center gap-2"
            >
              <Download size={18} />
              Importar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
