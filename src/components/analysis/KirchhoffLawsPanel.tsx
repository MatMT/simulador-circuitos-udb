'use client';

import React, { useState } from 'react';
import { KirchhoffVerificationResult } from '../../utils/kirchhoffAnalyzer';
import { CheckCircle2, ShieldCheck, Zap, Activity, GitFork, RefreshCw } from 'lucide-react';

interface KirchhoffLawsPanelProps {
  kirchhoff: KirchhoffVerificationResult;
  vin: number;
}

export default function KirchhoffLawsPanel({
  kirchhoff,
  vin
}: KirchhoffLawsPanelProps) {
  const [activeTab, setActiveTab] = useState<'ohm' | 'kcl' | 'kvl'>('ohm');

  const { ohmAudits, kclAudits, kvlAudits, isFullyCompliant } = kirchhoff;

  if (ohmAudits.length === 0) {
    return (
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 font-mono text-xs flex flex-col items-center gap-3">
        <ShieldCheck size={36} className="text-slate-600" />
        <p className="text-slate-200 font-bold text-sm">Verificación Matemática Pendiente</p>
        <p className="max-w-md text-slate-400">
          Completa un circuito cerrado o carga un Banco de Pruebas (Presets) para realizar la auditoría en tiempo real de la Ley de Ohm y las Leyes de Kirchhoff (LCK y LVK).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4.5 shadow-xl flex flex-col gap-4">
      {/* Cabecera general y Status de Cumplimiento */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 block">
              Sustentación Teórica & Rigor Matemático
            </span>
            <h3 className="font-bold text-slate-100 text-sm md:text-base flex items-center gap-2">
              <span>Auditoría de Ley de Ohm y Leyes de Kirchhoff</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFullyCompliant ? (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>100% CUMPLE LEYES MATEMÁTICAS</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/50">
              ⚡ En Auditoría Activa
            </span>
          )}
        </div>
      </div>

      {/* Selector de Pestañas de las 3 Leyes */}
      <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('ohm')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
            activeTab === 'ohm'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Zap size={14} />
          <span>1. Ley de Ohm (V = I × R)</span>
        </button>

        <button
          onClick={() => setActiveTab('kcl')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
            activeTab === 'kcl'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <GitFork size={14} />
          <span>2. LCK (Corrientes en Nodos)</span>
        </button>

        <button
          onClick={() => setActiveTab('kvl')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
            activeTab === 'kvl'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <RefreshCw size={14} />
          <span>3. LVK (Caídas en Mallas)</span>
        </button>
      </div>

      {/* CONTENIDO PESTAÑA 1: LEY DE OHM */}
      {activeTab === 'ohm' && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span>
              <strong>Enunciado:</strong> En todo conductor lineal, la corriente eléctrica ($I$) es directamente proporcional a la diferencia de potencial ($V$) e inversamente proporcional a la resistencia ($R$).
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Resistor</th>
                  <th className="py-2.5 px-3">Resistencia ($R$)</th>
                  <th className="py-2.5 px-3">Voltaje Caída ($V$)</th>
                  <th className="py-2.5 px-3">Corriente ($I$)</th>
                  <th className="py-2.5 px-3">Potencia ($P$)</th>
                  <th className="py-2.5 px-3">Verificación $I = V/R$</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {ohmAudits.map((item) => (
                  <tr key={item.resistorId} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-sky-300">{item.label}</td>
                    <td className="py-2.5 px-3 text-amber-400">{item.resistance} Ω</td>
                    <td className="py-2.5 px-3 text-sky-400 font-bold">{item.voltageDrop} V</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{item.current_mA} mA</td>
                    <td className="py-2.5 px-3 text-purple-400">{item.power_mW} mW</td>
                    <td className="py-2.5 px-3 text-slate-300 font-bold">{item.formulaStr}</td>
                    <td className="py-2.5 px-3">
                      {item.isConsistent ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                          ✓ EXACTO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px]">
                          ~ REDONDEO
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 2: LCK (LEY DE CORRIENTES DE KIRCHHOFF) */}
      {activeTab === 'kcl' && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span>
              <strong>Enunciado (LCK / KCL):</strong> En cualquier nodo de un circuito, la suma algebraica de las corrientes que entran es estrictamente igual a la suma de las corrientes que salen (∑I_entrante = ∑I_saliente).
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {kclAudits.map((nodeAudit) => (
              <div
                key={nodeAudit.nodeId}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-md"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                      {nodeAudit.nodeId}
                    </span>
                    {nodeAudit.isPowerPos && (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-[10px] font-bold">
                        BORNE ALIMENTACIÓN (+)
                      </span>
                    )}
                    {nodeAudit.isPowerNeg && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono text-[10px] font-bold">
                        BORNE RETORNO TIERRA (-)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {nodeAudit.isBalanced ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-extrabold">
                        ✓ LCK BALANCEADO (Δ = {nodeAudit.difference} mA)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                        ~ MARGEN DESVIACIÓN
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Corrientes Entrantes */}
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 flex flex-col gap-1.5">
                    <span className="text-[11px] text-sky-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>➔ Corrientes Entrantes al Nodo:</span>
                      <span className="text-sky-300 font-black">{nodeAudit.sumIncoming} mA</span>
                    </span>
                    <ul className="divide-y divide-slate-800/40 text-slate-300 pl-1">
                      {nodeAudit.incomingCurrents.map((item, i) => (
                        <li key={i} className="py-1 flex items-center justify-between">
                          <span>{item.label}</span>
                          <strong className="text-sky-400">+{item.current_mA} mA</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Corrientes Salientes */}
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 flex flex-col gap-1.5">
                    <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>➔ Corrientes Salientes del Nodo:</span>
                      <span className="text-emerald-300 font-black">{nodeAudit.sumOutgoing} mA</span>
                    </span>
                    <ul className="divide-y divide-slate-800/40 text-slate-300 pl-1">
                      {nodeAudit.outgoingCurrents.map((item, i) => (
                        <li key={i} className="py-1 flex items-center justify-between">
                          <span>{item.label}</span>
                          <strong className="text-emerald-400">-{item.current_mA} mA</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Ecuación de Conservación de Carga:</span>
                  <span className="font-bold text-amber-300">
                    ∑ I_in - ∑ I_out = {nodeAudit.sumIncoming} - {nodeAudit.sumOutgoing} = {Number((nodeAudit.sumIncoming - nodeAudit.sumOutgoing).toFixed(2))} mA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 3: LVK (LEY DE VOLTAJES DE KIRCHHOFF) */}
      {activeTab === 'kvl' && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span>
              <strong>Enunciado (LVK / KVL):</strong> En cualquier malla o trayectoria cerrada independiente de un circuito, la suma algebraica de las caídas de voltaje en las resistencias es igual al voltaje suministrado por la fuente (∑V_caída = V_in).
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {kvlAudits.map((loopAudit) => (
              <div
                key={loopAudit.loopId}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-md"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-2">
                  <span className="font-mono text-xs font-bold text-purple-300">
                    ⚡ {loopAudit.loopId}
                  </span>

                  {loopAudit.isValid ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-extrabold">
                      ✓ LVK BALANCEADO (Δ = {loopAudit.difference} V)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                      ~ DESVIACIÓN REDONDEO
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 flex flex-col gap-1.5">
                    <span className="text-[11px] text-purple-400 font-bold uppercase">Suministro de la Fuente (Vin):</span>
                    <span className="text-lg font-black text-white">{loopAudit.sourceVoltage} V</span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 flex flex-col gap-1.5">
                    <span className="text-[11px] text-sky-400 font-bold uppercase flex items-center justify-between">
                      <span>Suma Total Caídas (∑V_R):</span>
                      <span className="text-sky-300 font-black">{loopAudit.sumDrops} V</span>
                    </span>
                    <ul className="divide-y divide-slate-800/40 text-slate-300 pl-1 text-[11px]">
                      {loopAudit.voltageDrops.map((drop, i) => (
                        <li key={i} className="py-1 flex items-center justify-between">
                          <span>{drop.label}</span>
                          <strong className="text-sky-300">{drop.voltage} V</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Verificación LVK del Lazo:</span>
                  <span className="font-bold text-emerald-400">
                    {loopAudit.formulaStr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
