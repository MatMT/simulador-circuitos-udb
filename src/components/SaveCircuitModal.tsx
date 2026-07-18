'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { X, Copy, Check, Save, Share2, CheckCircle2 } from 'lucide-react';
import { Wire } from '../types/circuit';
import LZString from 'lz-string';

interface SaveCircuitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  wires: Wire[];
  vin: number;
}

export default function SaveCircuitModal({ isOpen, onClose, onSave, wires, vin }: SaveCircuitModalProps) {
  const [name, setName] = useState(`Mi Circuito ${new Date().toLocaleDateString()}`);
  const [isSaved, setIsSaved] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(`Mi Circuito ${new Date().toLocaleDateString()}`);
      setIsSaved(false);
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name);
    
    const dataToShare = JSON.stringify({ wires, vin });
    const compressed = LZString.compressToEncodedURIComponent(dataToShare);
    setShareUrl(`${window.location.origin}${window.location.pathname}?share=${compressed}`);
    
    setIsSaved(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-sky-500/40 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isSaved ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-sky-500/15 border-sky-500/40 text-sky-400'} border`}>
              {isSaved ? <CheckCircle2 size={24} /> : <Save size={24} />}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                {isSaved ? '¡Circuito Guardado!' : 'Guardar Circuito'}
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
        <div className="p-6 flex flex-col gap-6">
          {!isSaved ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-300">
                Dale un nombre a tu circuito actual para guardarlo en tu Banco de Circuitos local.
              </p>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase">Nombre del Circuito</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-sky-500 transition font-sans"
                  placeholder="Ej: Divisor de Voltaje"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-sky-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar Ahora
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-fade-in">
              {/* Resumen del circuito guardado */}
              <div className="w-full bg-slate-950/50 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-emerald-400 font-bold">{name}</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    {wires.length} cables conectados · Fuente: {vin}V
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-inner shadow-slate-900/50">
                <QRCode value={shareUrl} size={180} />
              </div>

              <p className="text-xs text-slate-400 text-center font-mono max-w-sm">
                Tu circuito está guardado. Escanea este QR para compartirlo, o copia el enlace directo.
              </p>

              <div className="w-full flex items-center gap-2">
                <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
                  {shareUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className={`p-2.5 rounded-xl text-white font-bold transition flex items-center gap-2 cursor-pointer ${
                    copied ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-600 hover:bg-sky-500'
                  }`}
                  title="Copiar Enlace"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
