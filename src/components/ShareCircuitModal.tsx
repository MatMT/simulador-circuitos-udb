'use client';

import React, { useState, useMemo } from 'react';
import QRCode from 'react-qr-code';
import LZString from 'lz-string';
import { X, Copy, Check, QrCode } from 'lucide-react';

interface ShareCircuitModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export default function ShareCircuitModal({ isOpen, onClose, shareUrl }: ShareCircuitModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const rawData = useMemo(() => {
    try {
      const url = new URL(shareUrl);
      const shareParam = url.searchParams.get('share');
      if (shareParam) {
        return LZString.decompressFromEncodedURIComponent(shareParam);
      }
    } catch (e) {
      return null;
    }
    return null;
  }, [shareUrl]);

  if (!isOpen) return null;

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
            <div className="p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/40 text-sky-400">
              <QrCode size={24} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                Compartir Circuito
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
        <div className="p-6 flex flex-col items-center gap-6">
          <p className="text-sm text-slate-300 text-center">
            Escanea este código QR desde tu dispositivo móvil o copia el enlace para abrir este circuito directamente.
          </p>

          <div className="p-4 bg-white rounded-2xl shadow-inner shadow-slate-900/50">
            <QRCode value={shareUrl} size={200} />
          </div>

          <div className="w-full flex items-center gap-2">
            <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
              {shareUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`p-2.5 rounded-xl text-white font-bold transition flex items-center gap-2 cursor-pointer ${
                copied ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-600 hover:bg-sky-500'
              }`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          {rawData && (
            <div className="w-full flex flex-col gap-2 mt-2 border-t border-slate-800/80 pt-4">
              <label className="text-xs font-bold text-slate-400 uppercase">
                Datos RAW JSON (Para IAs)
              </label>
              <div className="w-full flex items-start gap-2">
                <textarea
                  readOnly
                  value={rawData}
                  className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-400 h-24 resize-none outline-none shadow-inner"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(rawData);
                    setCopiedRaw(true);
                    setTimeout(() => setCopiedRaw(false), 2000);
                  }}
                  className={`p-2.5 rounded-xl text-white font-bold transition flex items-center justify-center cursor-pointer shrink-0 ${
                    copiedRaw ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  title="Copiar JSON"
                >
                  {copiedRaw ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
