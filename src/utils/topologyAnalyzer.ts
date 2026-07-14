import { Resistor, ResistorId, Wire, ElectricalNode } from '../types/circuit';
import { UDB_RESISTORS, buildNodes } from './circuitEngine';

export type TopologyType = 'SERIE' | 'PARALELO' | 'MIXTO' | 'CORTOCIRCUITO' | 'ABIERTO' | 'COMPLEJO';

export interface ReductionStep {
  stepIndex: number;
  type: 'serie' | 'paralelo';
  label: string; // e.g., "R_eq1 (R3 // R5)"
  componentIds: string[]; // e.g., ["R3", "R5"] or ["R1", "R_eq1"]
  formula: string; // e.g., "(1/680 + 1/220)^(-1)"
  resultOhms: number;
  explanation: string;
}

export interface TopologyAnalysisResult {
  type: TopologyType;
  summaryTitle: string;
  connectedResistors: Resistor[];
  shortedResistors: Resistor[];
  reductionSteps: ReductionStep[];
  theoreticalReq: number | null;
  description: string;
  branches: {
    branchId: string;
    resistorIds: ResistorId[];
    nodePair: [string, string];
    branchResistance: number;
  }[];
}

interface GraphEdge {
  id: string; // ResistorId or reduced id like "Req_1"
  label: string;
  node1: string; // Node unique ID
  node2: string; // Node unique ID
  resistance: number;
  originalResistors: ResistorId[];
}

/**
 * Analiza rigurosamente la topología del circuito basándose en la teoría de grafos eléctricos
 * (Algoritmo de reducción iterativa Serie-Paralelo) y genera el árbol de pasos y fórmulas exactas.
 */
export function analyzeTopology(wires: Wire[], vin: number = 12): TopologyAnalysisResult {
  const nodes = buildNodes(wires);
  const posNode = nodes.find(n => n.terminalIds.includes('POWER_POS'));
  const negNode = nodes.find(n => n.terminalIds.includes('POWER_NEG'));

  // 1. Encontrar resistores conectados
  const connectedResistors: Resistor[] = [];
  const shortedResistors: Resistor[] = [];

  UDB_RESISTORS.forEach(r => {
    const t1Node = nodes.find(n => n.terminalIds.includes(`${r.id}_T1`));
    const t2Node = nodes.find(n => n.terminalIds.includes(`${r.id}_T2`));

    if (t1Node && t2Node) {
      if (t1Node === t2Node) {
        shortedResistors.push(r);
        connectedResistors.push(r);
      } else {
        connectedResistors.push(r);
      }
    }
  });

  // Caso: Tablero limpio o sin conexiones activas
  if (connectedResistors.length === 0 || !posNode || !negNode) {
    return {
      type: 'ABIERTO',
      summaryTitle: 'Circuito Abierto / Sin Conexión Completa',
      connectedResistors: [],
      shortedResistors: [],
      reductionSteps: [],
      theoreticalReq: null,
      description: 'El circuito no presenta una trayectoria cerrada entre Fuente 1 (+) y Fuente 2 (-). Conecta cables jack para cerrar el lazo eléctrico.',
      branches: []
    };
  }

  // Caso: Cortocircuito en la fuente
  if (posNode === negNode) {
    return {
      type: 'CORTOCIRCUITO',
      summaryTitle: '⚠️ CORTOCIRCUITO DETECTADO EN LA FUENTE',
      connectedResistors,
      shortedResistors,
      reductionSteps: [],
      theoreticalReq: 0,
      description: 'La terminal positiva (+) de la fuente está conectada directamente con la terminal negativa (-) con una resistencia total de 0 Ω.',
      branches: []
    };
  }

  // Construir el grafo inicial con aristas activas (excluyendo cortocircuitados internamente)
  let edges: GraphEdge[] = connectedResistors
    .filter(r => !shortedResistors.includes(r))
    .map(r => {
      const n1 = nodes.find(n => n.terminalIds.includes(`${r.id}_T1`))!.id;
      const n2 = nodes.find(n => n.terminalIds.includes(`${r.id}_T2`))!.id;
      return {
        id: r.id,
        label: r.id,
        node1: n1,
        node2: n2,
        resistance: r.value,
        originalResistors: [r.id]
      };
    });

  if (edges.length === 0) {
    return {
      type: 'ABIERTO',
      summaryTitle: 'Componentes Cortocircuitados / Abierto',
      connectedResistors,
      shortedResistors,
      reductionSteps: [],
      theoreticalReq: null,
      description: 'Los componentes conectados se encuentran en cortocircuito entre sus propias terminales o no completan el lazo hacia la fuente.',
      branches: []
    };
  }

  const reductionSteps: ReductionStep[] = [];
  let stepIndex = 1;
  let hasParallelStep = false;
  let hasSeriesStep = false;

  // Algoritmo iterativo de reducción Serie-Paralelo
  let changed = true;
  while (changed && edges.length > 1) {
    changed = false;

    // Paso A: Buscar aristas en PARALELO (comparten exactamente el mismo par de nodos)
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        const e1 = edges[i];
        const e2 = edges[j];

        const sameNodes =
          (e1.node1 === e2.node1 && e1.node2 === e2.node2) ||
          (e1.node1 === e2.node2 && e1.node2 === e1.node1);

        if (sameNodes) {
          hasParallelStep = true;
          const reqP = 1.0 / (1.0 / e1.resistance + 1.0 / e2.resistance);
          const newId = `Req_${stepIndex}`;
          const label = `${e1.label} ∥ ${e2.label}`;
          const combinedResistors = Array.from(new Set([...e1.originalResistors, ...e2.originalResistors]));

          const formulaStr = `(1/${Number(e1.resistance.toFixed(1))} + 1/${Number(e2.resistance.toFixed(1))})⁻¹`;

          reductionSteps.push({
            stepIndex,
            type: 'paralelo',
            label: `Reducción Paralela (${newId})`,
            componentIds: [e1.label, e2.label],
            formula: formulaStr,
            resultOhms: Number(reqP.toFixed(2)),
            explanation: `Al estar conectados entre los mismos dos nodos eléctricos, ${e1.label} y ${e2.label} dividen la corriente manteniendo idéntico voltaje.`
          });

          // Reemplazar e1 y e2 por la arista combinada
          edges.splice(j, 1);
          edges.splice(i, 1);
          edges.push({
            id: newId,
            label: label,
            node1: e1.node1,
            node2: e1.node2,
            resistance: reqP,
            originalResistors: combinedResistors
          });

          stepIndex++;
          changed = true;
          break;
        }
      }
      if (changed) break;
    }

    if (changed) continue;

    // Paso B: Buscar aristas en SERIE (comparten un nodo interno exclusivo de grado 2)
    const nodeDegree: Record<string, GraphEdge[]> = {};
    edges.forEach(e => {
      if (!nodeDegree[e.node1]) nodeDegree[e.node1] = [];
      if (!nodeDegree[e.node2]) nodeDegree[e.node2] = [];
      nodeDegree[e.node1].push(e);
      nodeDegree[e.node2].push(e);
    });

    for (const [nodeId, incidentEdges] of Object.entries(nodeDegree)) {
      const isPowerPos = posNode.id === nodeId;
      const isPowerNeg = negNode.id === nodeId;

      if (incidentEdges.length === 2 && !isPowerPos && !isPowerNeg) {
        hasSeriesStep = true;
        const e1 = incidentEdges[0];
        const e2 = incidentEdges[1];

        const outerNode1 = e1.node1 === nodeId ? e1.node2 : e1.node1;
        const outerNode2 = e2.node1 === nodeId ? e2.node2 : e2.node1;

        const reqS = e1.resistance + e2.resistance;
        const newId = `Req_${stepIndex}`;
        const label = `(${e1.label} + ${e2.label})`;
        const combinedResistors = Array.from(new Set([...e1.originalResistors, ...e2.originalResistors]));

        const formulaStr = `${Number(e1.resistance.toFixed(2))} + ${Number(e2.resistance.toFixed(2))}`;

        reductionSteps.push({
          stepIndex,
          type: 'serie',
          label: `Reducción Serie (${newId})`,
          componentIds: [e1.label, e2.label],
          formula: formulaStr,
          resultOhms: Number(reqS.toFixed(2)),
          explanation: `Al compartir el nodo intermedio exclusivo sin derivaciones, la corriente que fluye por ${e1.label} y ${e2.label} es exactamente la misma.`
        });

        // Eliminar e1 y e2 y añadir arista combinada
        const idx1 = edges.indexOf(e1);
        const idx2 = edges.indexOf(e2);
        edges = edges.filter((_, idx) => idx !== idx1 && idx !== idx2);
        edges.push({
          id: newId,
          label: label,
          node1: outerNode1,
          node2: outerNode2,
          resistance: reqS,
          originalResistors: combinedResistors
        });

        stepIndex++;
        changed = true;
        break;
      }
    }
  }

  const finalEdge = edges.find(e =>
    (e.node1 === posNode.id && e.node2 === negNode.id) ||
    (e.node1 === negNode.id && e.node2 === posNode.id)
  );

  let topologyType: TopologyType = 'SERIE';
  let summaryTitle = 'Circuito en Serie Puro';
  let description = 'Todos los resistores están conectados uno tras otro en una trayectoria única, compartiendo exactamente la misma corriente (I).';

  if (connectedResistors.length === 1) {
    topologyType = 'SERIE';
    summaryTitle = `Circuito Simple de 1 Resistor (${connectedResistors[0].id})`;
    description = `Conexión directa del resistor ${connectedResistors[0].id} (${connectedResistors[0].value} Ω) entre los terminales de alimentación (+) y tierra (-).`;
  } else if (hasParallelStep && !hasSeriesStep) {
    topologyType = 'PARALELO';
    summaryTitle = 'Circuito en Paralelo Puro';
    description = 'Todos los resistores están conectados en ramas independientes entre los mismos dos nodos principales, recibiendo el mismo voltaje de la fuente (Vin).';
  } else if (hasParallelStep && hasSeriesStep) {
    topologyType = 'MIXTO';
    summaryTitle = 'Circuito Mixto (Combinación Serie - Paralelo)';
    description = 'El circuito presenta tanto derivaciones en paralelo (dividiendo la corriente) como secciones en serie. La reducción de la resistencia equivalente se obtiene paso a paso.';
  } else if (!hasParallelStep && hasSeriesStep) {
    topologyType = 'SERIE';
    summaryTitle = 'Circuito en Serie Puro';
    description = 'Los resistores forman un lazo continuo desde el polo positivo (+) hasta el polo negativo (-), por lo que la corriente es idéntica en todos ellos.';
  } else if (edges.length > 1 || !finalEdge) {
    topologyType = 'COMPLEJO';
    summaryTitle = 'Circuito Puente / Múltiples Ramas en Red Compleja';
    description = 'Topología de red interconectada resuelta mediante el método general nodal (MNA).';
  }

  const branches = edges.map(e => ({
    branchId: e.id,
    resistorIds: e.originalResistors,
    nodePair: [e.node1, e.node2] as [string, string],
    branchResistance: Number(e.resistance.toFixed(2))
  }));

  const theoreticalReq = finalEdge ? Number(finalEdge.resistance.toFixed(2)) : null;

  return {
    type: topologyType,
    summaryTitle,
    connectedResistors,
    shortedResistors,
    reductionSteps,
    theoreticalReq,
    description,
    branches
  };
}
