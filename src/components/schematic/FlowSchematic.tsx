'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PowerNode from './nodes/PowerNode';
import ResistorNode from './nodes/ResistorNode';
import GroundNode from './nodes/GroundNode';
import BusNode from './nodes/BusNode';
import { CircuitAnalysisResult } from '../../types/circuit';
import { TopologyAnalysisResult } from '../../utils/topologyAnalyzer';
import { Activity } from 'lucide-react';

const nodeTypes = {
  power: PowerNode,
  resistor: ResistorNode,
  ground: GroundNode,
  bus: BusNode
};

interface FlowSchematicProps {
  topology: TopologyAnalysisResult;
  analysis: CircuitAnalysisResult;
  vin: number;
}

export default function FlowSchematic({
  topology,
  analysis,
  vin
}: FlowSchematicProps) {
  const { nodes, edges } = useMemo(() => {
    const connectedResistors = topology.connectedResistors;
    const isConduction = analysis.totalCurrent > 0;

    if (connectedResistors.length === 0) {
      return { nodes: [], edges: [] };
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // NODO FUENTE 1 (+)
    newNodes.push({
      id: 'source-pos',
      type: 'power',
      position: { x: 30, y: 150 },
      data: { vin, current: analysis.totalCurrent },
      draggable: true
    });

    if (topology.type === 'SERIE') {
      // ESTRICTAMENTE SERIE HORIZONTAL (De 1 a N resistencias en cadena)
      let prevId = 'source-pos';
      const spacingX = 250;

      connectedResistors.forEach((r, idx) => {
        const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
        newNodes.push({
          id: r.id,
          type: 'resistor',
          position: { x: 230 + idx * spacingX, y: 150 },
          data: {
            id: r.id,
            label: r.id,
            value: r.value,
            voltageDrop: meas.voltageDrop,
            current: meas.current,
            power: meas.power
          },
          draggable: true
        });

        newEdges.push({
          id: `e-${prevId}-${r.id}`,
          source: prevId,
          target: r.id,
          animated: isConduction && meas.current > 0,
          style: {
            stroke: isConduction && meas.current > 0 ? '#22d3ee' : '#475569',
            strokeWidth: 3.5
          }
        });

        prevId = r.id;
      });

      // NODO GND RETORNO (-)
      newNodes.push({
        id: 'source-neg',
        type: 'ground',
        position: { x: 230 + connectedResistors.length * spacingX, y: 150 },
        data: { current: analysis.totalCurrent },
        draggable: true
      });

      newEdges.push({
        id: `e-${prevId}-source-neg`,
        source: prevId,
        target: 'source-neg',
        animated: isConduction,
        style: {
          stroke: isConduction ? '#34d399' : '#475569',
          strokeWidth: 3.5
        }
      });
    } else if (topology.type === 'PARALELO') {
      // ESTRICTAMENTE PARALELO PURO (Bus A -> Ramas -> Bus B)
      const busSplitId = 'bus-split';
      const busMergeId = 'bus-merge';

      newNodes.push({
        id: busSplitId,
        type: 'bus',
        position: { x: 240, y: 160 },
        data: { label: 'Bus Divisor (+)', type: 'split', current: analysis.totalCurrent },
        draggable: true
      });

      newEdges.push({
        id: 'e-pos-bus-split',
        source: 'source-pos',
        target: busSplitId,
        animated: isConduction,
        style: { stroke: isConduction ? '#22d3ee' : '#475569', strokeWidth: 3.5 }
      });

      const count = connectedResistors.length;
      const startY = 40;
      const rowHeight = 140;

      connectedResistors.forEach((r, idx) => {
        const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
        const yPos = count === 1 ? 150 : startY + idx * rowHeight;

        newNodes.push({
          id: r.id,
          type: 'resistor',
          position: { x: 450, y: yPos },
          data: {
            id: r.id,
            label: r.id,
            value: r.value,
            voltageDrop: meas.voltageDrop,
            current: meas.current,
            power: meas.power
          },
          draggable: true
        });

        newEdges.push({
          id: `e-${busSplitId}-${r.id}`,
          source: busSplitId,
          target: r.id,
          animated: isConduction && meas.current > 0,
          style: { stroke: isConduction && meas.current > 0 ? '#22d3ee' : '#475569', strokeWidth: 3 }
        });

        newEdges.push({
          id: `e-${r.id}-${busMergeId}`,
          source: r.id,
          target: busMergeId,
          animated: isConduction && meas.current > 0,
          style: { stroke: isConduction && meas.current > 0 ? '#34d399' : '#475569', strokeWidth: 3 }
        });
      });

      const avgY = count === 1 ? 160 : startY + ((count - 1) * rowHeight) / 2;

      newNodes.push({
        id: busMergeId,
        type: 'bus',
        position: { x: 700, y: Math.max(80, avgY) },
        data: { label: 'Bus Unión (-)', type: 'merge', current: analysis.totalCurrent },
        draggable: true
      });

      newNodes.push({
        id: 'source-neg',
        type: 'ground',
        position: { x: 910, y: Math.max(80, avgY) },
        data: { current: analysis.totalCurrent },
        draggable: true
      });

      newEdges.push({
        id: `e-${busMergeId}-source-neg`,
        source: busMergeId,
        target: 'source-neg',
        animated: isConduction,
        style: { stroke: isConduction ? '#34d399' : '#475569', strokeWidth: 3.5 }
      });
    } else {
      // CIRCUITOS MIXTOS / COMPLEJOS (Trunk inicial -> Bus Split -> Ramas Paralelas -> Bus Merge -> Tail -> GND)
      const posNode = analysis.nodes.find(n => n.terminalIds.includes('POWER_POS'));
      const negNode = analysis.nodes.find(n => n.terminalIds.includes('POWER_NEG'));

      const trunkResistors: typeof connectedResistors = [];
      const tailResistors: typeof connectedResistors = [];

      if (posNode && posNode.resistorConnections.length === 1) {
        const trunkR = connectedResistors.find(r => r.id === posNode.resistorConnections[0].resistorId);
        if (trunkR) trunkResistors.push(trunkR);
      }

      if (negNode && negNode.resistorConnections.length === 1) {
        const tailR = connectedResistors.find(r => r.id === negNode.resistorConnections[0].resistorId);
        if (tailR && !trunkResistors.includes(tailR)) tailResistors.push(tailR);
      }

      const branchResistors = connectedResistors.filter(r => !trunkResistors.includes(r) && !tailResistors.includes(r));

      let currentX = 220;
      let prevId = 'source-pos';

      // 1. Trunk Resistors
      trunkResistors.forEach((r) => {
        const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
        newNodes.push({
          id: r.id,
          type: 'resistor',
          position: { x: currentX, y: 150 },
          data: {
            id: r.id,
            label: r.id,
            value: r.value,
            voltageDrop: meas.voltageDrop,
            current: meas.current,
            power: meas.power
          },
          draggable: true
        });

        newEdges.push({
          id: `e-${prevId}-${r.id}`,
          source: prevId,
          target: r.id,
          animated: isConduction && meas.current > 0,
          style: { stroke: isConduction && meas.current > 0 ? '#22d3ee' : '#475569', strokeWidth: 3.5 }
        });

        prevId = r.id;
        currentX += 240;
      });

      // 2. Branch Resistors y buses si hay > 0 ramas
      if (branchResistors.length > 0) {
        const busSplitId = 'bus-split';
        const busMergeId = 'bus-merge';

        newNodes.push({
          id: busSplitId,
          type: 'bus',
          position: { x: currentX, y: 160 },
          data: { label: 'Divisor (+)', type: 'split', current: analysis.totalCurrent },
          draggable: true
        });

        newEdges.push({
          id: `e-${prevId}-${busSplitId}`,
          source: prevId,
          target: busSplitId,
          animated: isConduction,
          style: { stroke: isConduction ? '#22d3ee' : '#475569', strokeWidth: 3.5 }
        });

        currentX += 190;
        const count = branchResistors.length;
        const startY = 40;
        const rowHeight = 140;

        branchResistors.forEach((r, idx) => {
          const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
          const yPos = count === 1 ? 150 : startY + idx * rowHeight;

          newNodes.push({
            id: r.id,
            type: 'resistor',
            position: { x: currentX, y: yPos },
            data: {
              id: r.id,
              label: r.id,
              value: r.value,
              voltageDrop: meas.voltageDrop,
              current: meas.current,
              power: meas.power
            },
            draggable: true
          });

          newEdges.push({
            id: `e-${busSplitId}-${r.id}`,
            source: busSplitId,
            target: r.id,
            animated: isConduction && meas.current > 0,
            style: { stroke: isConduction && meas.current > 0 ? '#22d3ee' : '#475569', strokeWidth: 3 }
          });

          newEdges.push({
            id: `e-${r.id}-${busMergeId}`,
            source: r.id,
            target: busMergeId,
            animated: isConduction && meas.current > 0,
            style: { stroke: isConduction && meas.current > 0 ? '#34d399' : '#475569', strokeWidth: 3 }
          });
        });

        currentX += 230;
        const avgY = count === 1 ? 160 : startY + ((count - 1) * rowHeight) / 2;

        newNodes.push({
          id: busMergeId,
          type: 'bus',
          position: { x: currentX, y: Math.max(80, avgY) },
          data: { label: 'Unión (-)', type: 'merge', current: analysis.totalCurrent },
          draggable: true
        });

        prevId = busMergeId;
        currentX += 190;
      }

      // 3. Tail Resistors
      tailResistors.forEach((r) => {
        const meas = analysis.measurements[r.id] || { voltageDrop: 0, current: 0, power: 0 };
        newNodes.push({
          id: r.id,
          type: 'resistor',
          position: { x: currentX, y: 150 },
          data: {
            id: r.id,
            label: r.id,
            value: r.value,
            voltageDrop: meas.voltageDrop,
            current: meas.current,
            power: meas.power
          },
          draggable: true
        });

        newEdges.push({
          id: `e-${prevId}-${r.id}`,
          source: prevId,
          target: r.id,
          animated: isConduction && meas.current > 0,
          style: { stroke: isConduction && meas.current > 0 ? '#34d399' : '#475569', strokeWidth: 3.5 }
        });

        prevId = r.id;
        currentX += 240;
      });

      // 4. GND Node final
      newNodes.push({
        id: 'source-neg',
        type: 'ground',
        position: { x: currentX, y: 150 },
        data: { current: analysis.totalCurrent },
        draggable: true
      });

      newEdges.push({
        id: `e-${prevId}-source-neg`,
        source: prevId,
        target: 'source-neg',
        animated: isConduction,
        style: { stroke: isConduction ? '#34d399' : '#475569', strokeWidth: 3.5 }
      });
    }

    return { nodes: newNodes, edges: newEdges };
  }, [topology, analysis, vin]);

  if (nodes.length === 0) {
    return (
      <div className="text-center py-16 px-4 text-slate-500 font-mono text-xs flex flex-col items-center gap-3 bg-slate-950 rounded-2xl border border-dashed border-slate-800">
        <Activity size={44} className="text-sky-400/40 mb-1 animate-pulse" />
        <p className="text-slate-200 font-bold text-sm">Lienzo Esquemático Orgánico Limpio</p>
        <p className="max-w-md text-xs text-slate-400 font-sans leading-relaxed">
          Conecta cables desde la Fuente 1 (+) hacia las resistencias en el tablero izquierdo o carga un Preset para renderizar aquí el diagrama esquemático interactivo (React Flow) con nodos arrastrables y animación en vivo del flujo de electrones.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] bg-[#050914] border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.3}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1.5} color="#1e293b" />
        <Controls
          className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg fill-sky-400 text-sky-400"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'power': return '#ef4444';
              case 'resistor': return '#38bdf8';
              case 'ground': return '#0284c7';
              default: return '#64748b';
            }
          }}
          maskColor="rgba(5, 9, 20, 0.7)"
          className="bg-slate-950 border border-slate-800 rounded-xl shadow-lg"
        />
      </ReactFlow>

      {/* Floating status badge inside canvas */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2.5 font-mono text-[11px] shadow-lg">
        <span className="text-slate-400">Motor:</span>
        <strong className="text-sky-400">React Flow Organic</strong>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">Nodos activos:</span>
        <strong className="text-emerald-400">{nodes.length}</strong>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">Arrastra para reorganizar o haz zoom</span>
      </div>
    </div>
  );
}
