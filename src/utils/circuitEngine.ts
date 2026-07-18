import { Resistor, ResistorId, Terminal, Wire, CircuitAnalysisResult, ElectricalNode, ResistorMeasurement } from '../types/circuit';

// 1. EXACT BOARD RESISTORS (As requested in input_file_0.png)
// Bloque 1: R1 (top horiz), R3 (left vert), R4 (right vert), R8 (bottom horiz)
// Columna Central: R5 (center vert)
// Bloque 2: R2 (top horiz), R6 (left vert), R7 (right vert), R9 (bottom horiz)
export const UDB_RESISTORS: Resistor[] = [
  // ================= BLOQUE 1 (Izquierda: R1, R3, R4, R8) =================
  { id: 'R1', label: 'R1 (220Ω)', value: 220, x: 25, y: 24, width: 14, height: 7, orientation: 'horizontal', terminals: ['R1_T1', 'R1_T2'] },
  { id: 'R3', label: 'R3 (680Ω)', value: 680, x: 12, y: 50, width: 7, height: 16, orientation: 'vertical', terminals: ['R3_T1', 'R3_T2'] },
  { id: 'R4', label: 'R4 (680Ω)', value: 680, x: 38, y: 50, width: 7, height: 16, orientation: 'vertical', terminals: ['R4_T1', 'R4_T2'] },
  { id: 'R8', label: 'R8 (1.5kΩ)', value: 1500, x: 25, y: 76, width: 14, height: 7, orientation: 'horizontal', terminals: ['R8_T1', 'R8_T2'] },

  // ================= COLUMNA CENTRAL (R5) =================
  { id: 'R5', label: 'R5 (220Ω)', value: 220, x: 50, y: 50, width: 7, height: 18, orientation: 'vertical', terminals: ['R5_T1', 'R5_T2'] },

  // ================= BLOQUE 2 (Derecha: R2, R6, R7, R9) =================
  { id: 'R2', label: 'R2 (220Ω)', value: 220, x: 75, y: 24, width: 14, height: 7, orientation: 'horizontal', terminals: ['R2_T1', 'R2_T2'] },
  { id: 'R6', label: 'R6 (1.5kΩ)', value: 1500, x: 62, y: 50, width: 7, height: 16, orientation: 'vertical', terminals: ['R6_T1', 'R6_T2'] },
  { id: 'R7', label: 'R7 (680Ω)', value: 680, x: 88, y: 50, width: 7, height: 16, orientation: 'vertical', terminals: ['R7_T1', 'R7_T2'] },
  { id: 'R9', label: 'R9 (1.5kΩ)', value: 1500, x: 75, y: 76, width: 14, height: 7, orientation: 'horizontal', terminals: ['R9_T1', 'R9_T2'] }
];

// 2. EXACT SOCKETS/TERMINALS (Banana Jack positions cleanly aligned with (+ / -) convention)
// For Horizontal: (+) is Left (T1), (-) is Right (T2)
// For Vertical: (+) is Top (T1), (-) is Bottom (T2)
export const UDB_TERMINALS: Terminal[] = [
  // Power Supply Red (+) & Black (-) inputs
  { id: 'POWER_POS', label: 'Fuente 1 (+)', type: 'power_pos', x: 8, y: 10 },
  { id: 'POWER_NEG', label: 'Fuente 2 (-)', type: 'power_neg', x: 92, y: 10 },

  // Bloque 1 Terminals
  { id: 'R1_T1', resistorId: 'R1', label: 'R1 (+)', type: 'resistor', x: 17, y: 24 },
  { id: 'R1_T2', resistorId: 'R1', label: 'R1 (-)', type: 'resistor', x: 33, y: 24 },
  { id: 'R3_T1', resistorId: 'R3', label: 'R3 (+)', type: 'resistor', x: 12, y: 38 },
  { id: 'R3_T2', resistorId: 'R3', label: 'R3 (-)', type: 'resistor', x: 12, y: 62 },
  { id: 'R4_T1', resistorId: 'R4', label: 'R4 (+)', type: 'resistor', x: 38, y: 38 },
  { id: 'R4_T2', resistorId: 'R4', label: 'R4 (-)', type: 'resistor', x: 38, y: 62 },
  { id: 'R8_T1', resistorId: 'R8', label: 'R8 (+)', type: 'resistor', x: 17, y: 76 },
  { id: 'R8_T2', resistorId: 'R8', label: 'R8 (-)', type: 'resistor', x: 33, y: 76 },

  // Columna Central Terminals
  { id: 'R5_T1', resistorId: 'R5', label: 'R5 (+)', type: 'resistor', x: 50, y: 36 },
  { id: 'R5_T2', resistorId: 'R5', label: 'R5 (-)', type: 'resistor', x: 50, y: 64 },

  // Bloque 2 Terminals
  { id: 'R2_T1', resistorId: 'R2', label: 'R2 (+)', type: 'resistor', x: 67, y: 24 },
  { id: 'R2_T2', resistorId: 'R2', label: 'R2 (-)', type: 'resistor', x: 83, y: 24 },
  { id: 'R6_T1', resistorId: 'R6', label: 'R6 (+)', type: 'resistor', x: 62, y: 38 },
  { id: 'R6_T2', resistorId: 'R6', label: 'R6 (-)', type: 'resistor', x: 62, y: 62 },
  { id: 'R7_T1', resistorId: 'R7', label: 'R7 (+)', type: 'resistor', x: 88, y: 38 },
  { id: 'R7_T2', resistorId: 'R7', label: 'R7 (-)', type: 'resistor', x: 88, y: 62 },
  { id: 'R9_T1', resistorId: 'R9', label: 'R9 (+)', type: 'resistor', x: 67, y: 76 },
  { id: 'R9_T2', resistorId: 'R9', label: 'R9 (-)', type: 'resistor', x: 83, y: 76 }
];

// Helper to find terminal by ID
export function getTerminalById(id: string): Terminal | undefined {
  return UDB_TERMINALS.find(t => t.id === id);
}

// Helper to find resistor by ID
export function getResistorById(id: ResistorId): Resistor {
  return UDB_RESISTORS.find(r => r.id === id)!;
}

// Union-Find algorithm to cluster connected terminals into electrical nodes with GUARANTEED UNIQUE KEYS
export function buildNodes(wires: Wire[]): ElectricalNode[] {
  const parent: Record<string, string> = {};

  UDB_TERMINALS.forEach(t => {
    parent[t.id] = t.id;
  });

  function find(i: string): string {
    if (parent[i] === i) return i;
    parent[i] = find(parent[i]);
    return parent[i];
  }

  function union(i: string, j: string) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
    }
  }

  wires.forEach(w => {
    if (parent[w.fromTerminalId] && parent[w.toTerminalId]) {
      union(w.fromTerminalId, w.toTerminalId);
    }
  });

  // Group terminals by root
  const groups: Record<string, string[]> = {};
  UDB_TERMINALS.forEach(t => {
    const root = find(t.id);
    if (!groups[root]) groups[root] = [];
    groups[root].push(t.id);
  });

  // Filter out standalone unconnected resistor terminals so we focus on active electrical nodes or show all uniquely
  const activeRoots = Object.values(groups).filter(tIds => {
    return tIds.length > 1 || tIds.includes('POWER_POS') || tIds.includes('POWER_NEG');
  });

  const nodes: ElectricalNode[] = activeRoots.map((tIds, idx) => {
    const prefix = `Nodo #${idx + 1}`;
    let summary = "";
    if (tIds.includes('POWER_POS')) {
      summary = "Alimentación (+)";
    } else if (tIds.includes('POWER_NEG')) {
      summary = "Retorno Tierra (-)";
    } else {
      const labels = tIds.map(tid => {
        const termObj = getTerminalById(tid);
        return termObj ? termObj.label : tid;
      }).join(' ➔ ');
      summary = labels.length > 32 ? labels.substring(0, 30) + '...' : labels;
    }

    const uniqueId = `${prefix} (${summary})`;

    const resistorConnections: { resistorId: ResistorId; terminalIndex: 0 | 1 }[] = [];
    tIds.forEach(tid => {
      const term = getTerminalById(tid);
      if (term && term.resistorId) {
        const idxTerm = term.id.endsWith('_T1') ? 0 : 1;
        resistorConnections.push({ resistorId: term.resistorId, terminalIndex: idxTerm });
      }
    });

    return {
      id: uniqueId,
      terminalIds: tIds,
      resistorConnections,
      voltage: 0
    };
  });

  return nodes;
}

// Solve electrical circuit using Modified Nodal Analysis (MNA) or Nodal relaxation
export function solveCircuit(wires: Wire[], vin: number = 12, useStrictSigns: boolean = true): CircuitAnalysisResult {
  const nodes = buildNodes(wires);
  const posNode = nodes.find(n => n.terminalIds.includes('POWER_POS'));
  const negNode = nodes.find(n => n.terminalIds.includes('POWER_NEG'));

  const measurements: Record<ResistorId, ResistorMeasurement> = {} as Record<ResistorId, ResistorMeasurement>;
  UDB_RESISTORS.forEach(r => {
    measurements[r.id] = { resistorId: r.id, voltageDrop: 0, current: 0, power: 0 };
  });

  const emptyStatus = {
    isCorrect: false,
    nodeDetails: [],
    generalFeedback: wires.length === 0 ? 'Circuito completamente limpio . Conecta componentes para iniciar la simulación.' : 'Analizando conexiones del circuito...'
  };

  if (!posNode || !negNode) {
    return {
      nodes,
      req: null,
      totalCurrent: 0,
      measurements,
      isComplete: false,
      hasShortCircuit: false,
      paso4Status: emptyStatus
    };
  }

  if (posNode === negNode) {
    return {
      nodes,
      req: 0,
      totalCurrent: 9999,
      measurements,
      isComplete: false,
      hasShortCircuit: true,
      paso4Status: {
        ...emptyStatus,
        generalFeedback: '⚠️ CORTOCIRCUITO DETECTADO: Fuente 1 (+) conectada directamente a Fuente 2 (-) sin carga.'
      }
    };
  }

  const numNodes = nodes.length;
  const voltages = new Array(numNodes).fill(0);
  const negIdx = nodes.indexOf(negNode);
  const posIdx = nodes.indexOf(posNode);

  voltages[posIdx] = vin;
  voltages[negIdx] = 0;

  // Gauss-Seidel relaxation to solve exact DC voltages
  for (let iter = 0; iter < 6000; iter++) {
    let maxDiff = 0;
    for (let i = 0; i < numNodes; i++) {
      if (i === posIdx || i === negIdx) continue;

      let sumCond = 0;
      let sumCondVolt = 0;

      const node_i = nodes[i];
      node_i.resistorConnections.forEach(conn => {
        const r = getResistorById(conn.resistorId);
        const cond = 1.0 / r.value;

        const oppTermId = conn.terminalIndex === 0 ? `${r.id}_T2` : `${r.id}_T1`;
        const oppNode = nodes.find(n => n.terminalIds.includes(oppTermId));
        if (oppNode) {
          const oppIdx = nodes.indexOf(oppNode);
          sumCond += cond;
          sumCondVolt += cond * voltages[oppIdx];
        }
      });

      if (sumCond > 0) {
        const newV = sumCondVolt / sumCond;
        maxDiff = Math.max(maxDiff, Math.abs(newV - voltages[i]));
        voltages[i] = newV;
      }
    }
    if (maxDiff < 1e-9) break;
  }

  nodes.forEach((n, idx) => {
    n.voltage = voltages[idx];
  });

  let totalCurrent = 0;

  UDB_RESISTORS.forEach(r => {
    const t1Node = nodes.find(n => n.terminalIds.includes(`${r.id}_T1`));
    const t2Node = nodes.find(n => n.terminalIds.includes(`${r.id}_T2`));

    if (t1Node && t2Node && t1Node !== t2Node) {
      let vDrop = t1Node.voltage - t2Node.voltage;
      if (!useStrictSigns) {
        vDrop = Math.abs(vDrop);
      }
      const current_mA = (vDrop / r.value) * 1000;
      const power_mW = Math.abs(vDrop * current_mA);

      measurements[r.id] = {
        resistorId: r.id,
        voltageDrop: Number(vDrop.toFixed(3)),
        current: Number(current_mA.toFixed(3)),
        power: Number(power_mW.toFixed(3))
      };

      if (t1Node === posNode || t2Node === posNode) {
        totalCurrent += Math.abs(current_mA);
      }
    }
  });

  const req = totalCurrent > 0 ? (vin / (totalCurrent / 1000)) : null;

  return {
    nodes,
    req: req ? Number(req.toFixed(2)) : null,
    totalCurrent: Number(totalCurrent.toFixed(2)),
    measurements,
    isComplete: totalCurrent > 0 && req !== null,
    hasShortCircuit: false,
    paso4Status: emptyStatus
  };
}
