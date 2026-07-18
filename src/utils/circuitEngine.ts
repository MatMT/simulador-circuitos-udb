import { Resistor, ResistorId, Terminal, Wire, CircuitAnalysisResult, ElectricalNode, ResistorMeasurement } from '../types/circuit';
import { MultimeterMode } from '../types/instruments';

// 1. EXACT BOARD RESISTORS (As requested in input_file_0.png)
export const UDB_RESISTORS: Resistor[] = [
  // ================= BLOQUE 1 (Izquierda: R1, R3, R4, R8) =================
  { id: 'R1', label: 'R1 (220Ω)', value: 220, x: 25, y: 21, width: 14, height: 7, orientation: 'horizontal', terminals: ['R1_T1', 'R1_T2'] },
  { id: 'R3', label: 'R3 (680Ω)', value: 680, x: 12, y: 47, width: 7, height: 16, orientation: 'vertical', terminals: ['R3_T1', 'R3_T2'] },
  { id: 'R4', label: 'R4 (680Ω)', value: 680, x: 38, y: 47, width: 7, height: 16, orientation: 'vertical', terminals: ['R4_T1', 'R4_T2'] },
  { id: 'R8', label: 'R8 (1.5kΩ)', value: 1500, x: 25, y: 73, width: 14, height: 7, orientation: 'horizontal', terminals: ['R8_T1', 'R8_T2'] },

  // ================= COLUMNA CENTRAL (R5) =================
  { id: 'R5', label: 'R5 (220Ω)', value: 220, x: 50, y: 47, width: 7, height: 18, orientation: 'vertical', terminals: ['R5_T1', 'R5_T2'] },

  // ================= BLOQUE 2 (Derecha: R2, R6, R7, R9) =================
  { id: 'R2', label: 'R2 (220Ω)', value: 220, x: 75, y: 21, width: 14, height: 7, orientation: 'horizontal', terminals: ['R2_T1', 'R2_T2'] },
  { id: 'R6', label: 'R6 (1.5kΩ)', value: 1500, x: 62, y: 47, width: 7, height: 16, orientation: 'vertical', terminals: ['R6_T1', 'R6_T2'] },
  { id: 'R7', label: 'R7 (680Ω)', value: 680, x: 88, y: 47, width: 7, height: 16, orientation: 'vertical', terminals: ['R7_T1', 'R7_T2'] },
  { id: 'R9', label: 'R9 (1.5kΩ)', value: 1500, x: 75, y: 73, width: 14, height: 7, orientation: 'horizontal', terminals: ['R9_T1', 'R9_T2'] }
];

// 2. EXACT SOCKETS/TERMINALS
export const UDB_TERMINALS: Terminal[] = [
  // Power Supply Red (+) & Black (-) inputs
  { id: 'POWER_POS', label: 'Fuente 1 (+)', type: 'power_pos', x: 8, y: 7 },
  { id: 'POWER_NEG', label: 'Fuente 2 (-)', type: 'power_neg', x: 92, y: 7 },

  // Bloque 1 Terminals
  { id: 'R1_T1', resistorId: 'R1', label: 'R1 (+)', type: 'resistor', x: 17, y: 21 },
  { id: 'R1_T2', resistorId: 'R1', label: 'R1 (-)', type: 'resistor', x: 33, y: 21 },
  { id: 'R3_T1', resistorId: 'R3', label: 'R3 (+)', type: 'resistor', x: 12, y: 35 },
  { id: 'R3_T2', resistorId: 'R3', label: 'R3 (-)', type: 'resistor', x: 12, y: 59 },
  { id: 'R4_T1', resistorId: 'R4', label: 'R4 (+)', type: 'resistor', x: 38, y: 35 },
  { id: 'R4_T2', resistorId: 'R4', label: 'R4 (-)', type: 'resistor', x: 38, y: 59 },
  { id: 'R8_T1', resistorId: 'R8', label: 'R8 (+)', type: 'resistor', x: 17, y: 73 },
  { id: 'R8_T2', resistorId: 'R8', label: 'R8 (-)', type: 'resistor', x: 33, y: 73 },

  // Columna Central Terminals
  { id: 'R5_T1', resistorId: 'R5', label: 'R5 (+)', type: 'resistor', x: 50, y: 33 },
  { id: 'R5_T2', resistorId: 'R5', label: 'R5 (-)', type: 'resistor', x: 50, y: 61 },

  // Bloque 2 Terminals
  { id: 'R2_T1', resistorId: 'R2', label: 'R2 (+)', type: 'resistor', x: 67, y: 21 },
  { id: 'R2_T2', resistorId: 'R2', label: 'R2 (-)', type: 'resistor', x: 83, y: 21 },
  { id: 'R6_T1', resistorId: 'R6', label: 'R6 (+)', type: 'resistor', x: 62, y: 35 },
  { id: 'R6_T2', resistorId: 'R6', label: 'R6 (-)', type: 'resistor', x: 62, y: 59 },
  { id: 'R7_T1', resistorId: 'R7', label: 'R7 (+)', type: 'resistor', x: 88, y: 35 },
  { id: 'R7_T2', resistorId: 'R7', label: 'R7 (-)', type: 'resistor', x: 88, y: 59 },
  { id: 'R9_T1', resistorId: 'R9', label: 'R9 (+)', type: 'resistor', x: 67, y: 73 },
  { id: 'R9_T2', resistorId: 'R9', label: 'R9 (-)', type: 'resistor', x: 83, y: 73 },

  // Wattmeter W1 Terminals
  { id: 'W1_O', label: 'W1 (O)', type: 'resistor', x: 17, y: 92 },
  { id: 'W1_I', label: 'W1 (I)', type: 'resistor', x: 25, y: 92 },
  { id: 'W1_U', label: 'W1 (U)', type: 'resistor', x: 33, y: 92 },

  // Multimeter M1 Terminals
  { id: 'M1_A', label: 'A', type: 'resistor', x: 67, y: 92 },
  { id: 'M1_COM', label: 'COM', type: 'resistor', x: 75, y: 92 },
  { id: 'M1_V_OHMS', label: 'V/Ω', type: 'resistor', x: 83, y: 92 }
];

export function getTerminalById(id: string): Terminal | undefined {
  return UDB_TERMINALS.find(t => t.id === id);
}

export function getResistorById(id: ResistorId): Resistor {
  return UDB_RESISTORS.find(r => r.id === id)!;
}

export function buildNodes(wires: Wire[], multimeterMode: MultimeterMode = 'V'): ElectricalNode[] {
  const parent: Record<string, string> = {};

  UDB_TERMINALS.forEach(t => {
    parent[t.id] = t.id;
  });

  // Inject dynamic terminals (AirJunctions)
  wires.forEach(w => {
    if (!parent[w.fromTerminalId]) parent[w.fromTerminalId] = w.fromTerminalId;
    if (!parent[w.toTerminalId]) parent[w.toTerminalId] = w.toTerminalId;
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
    union(w.fromTerminalId, w.toTerminalId);
  });

  // INTERNAL WATTMETER SHORT: Ammeter between O and I is a 0V source
  if (parent['W1_O'] && parent['W1_I']) {
    union('W1_O', 'W1_I');
  }

  // INTERNAL MULTIMETER SHORT: Ammeter between A and COM is a 0V source
  if (multimeterMode === 'A' && parent['M1_A'] && parent['M1_COM']) {
    union('M1_A', 'M1_COM');
  }

  const groups: Record<string, string[]> = {};
  Object.keys(parent).forEach(tid => {
    const root = find(tid);
    if (!groups[root]) groups[root] = [];
    groups[root].push(tid);
  });

  const activeRoots = Object.values(groups).filter(tIds => {
    return tIds.length > 1 || tIds.includes('POWER_POS') || tIds.includes('POWER_NEG');
  });

  const nodes: ElectricalNode[] = activeRoots.map((tIds, idx) => {
    const prefix = `Nodo #${idx + 1}`;
    let summary = "";
    if (tIds.includes('POWER_POS')) summary = "Alimentación (+)";
    else if (tIds.includes('POWER_NEG')) summary = "Retorno Tierra (-)";
    else {
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

// Helper to solve voltages via Gauss-Seidel
function solveVoltages(nodes: ElectricalNode[], posIdx: number, negIdx: number, sourceVoltage: number): number[] {
  const numNodes = nodes.length;
  const voltages = new Array(numNodes).fill(0);
  
  if (posIdx !== -1) voltages[posIdx] = sourceVoltage;
  if (negIdx !== -1) voltages[negIdx] = 0;

  if (posIdx === -1 || negIdx === -1) return voltages;

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
  return voltages;
}

// Helper to calculate current leaving a specific cluster of terminals
function getClusterLeavingCurrent(clusterRootId: string, wires: Wire[], nodes: ElectricalNode[], totalMainCurrent: number): number {
  const cluster = new Set<string>([clusterRootId]);
  let changed = true;
  while(changed) {
    changed = false;
    wires.forEach(w => {
      if (cluster.has(w.fromTerminalId) && !cluster.has(w.toTerminalId)) { cluster.add(w.toTerminalId); changed = true; }
      if (cluster.has(w.toTerminalId) && !cluster.has(w.fromTerminalId)) { cluster.add(w.fromTerminalId); changed = true; }
    });
  }

  let I_leaving_mA = 0;
  cluster.forEach(tid => {
    const term = getTerminalById(tid);
    if (term && term.resistorId) {
      const r = getResistorById(term.resistorId);
      const isT1 = tid.endsWith('_T1');
      const oppTermId = isT1 ? `${r.id}_T2` : `${r.id}_T1`;
      
      const nodeThis = nodes.find(n => n.terminalIds.includes(tid));
      const nodeOpp = nodes.find(n => n.terminalIds.includes(oppTermId));
      
      if (nodeThis && nodeOpp) {
        const vDrop = nodeThis.voltage - nodeOpp.voltage;
        const current_mA = (vDrop / r.value) * 1000;
        if (!cluster.has(oppTermId)) {
           I_leaving_mA += current_mA;
        }
      }
    }
    
    if (tid === 'POWER_POS') I_leaving_mA += (-totalMainCurrent);
    if (tid === 'POWER_NEG') I_leaving_mA += (totalMainCurrent);
  });
  return I_leaving_mA;
}

export function solveCircuit(wires: Wire[], vin: number = 12, useStrictSigns: boolean = true, multimeterMode: MultimeterMode = 'V'): CircuitAnalysisResult {
  const nodes = buildNodes(wires, multimeterMode);
  const posNode = nodes.find(n => n.terminalIds.includes('POWER_POS'));
  const negNode = nodes.find(n => n.terminalIds.includes('POWER_NEG'));

  const measurements: Record<ResistorId, ResistorMeasurement> = {} as Record<ResistorId, ResistorMeasurement>;
  UDB_RESISTORS.forEach(r => {
    measurements[r.id] = { resistorId: r.id, voltageDrop: 0, current: 0, power: 0 };
  });

  const emptyStatus = {
    isCorrect: false,
    nodeDetails: [],
    generalFeedback: wires.length === 0 ? 'Circuito limpio. Conecta componentes para iniciar la simulación.' : 'Analizando conexiones...'
  };

  const baseResult: CircuitAnalysisResult = {
    nodes,
    req: null,
    totalCurrent: 0,
    measurements,
    isComplete: false,
    hasShortCircuit: false,
    paso4Status: emptyStatus,
    wattmeterPower: 0,
    multimeterResult: { value: 0 }
  };

  // 1. Detección de Cortocircuito Principal
  if (posNode && negNode && posNode === negNode) {
    let multErr: 'OL' | 'FUSE_BLOWN' | undefined = undefined;
    let msg = '⚠️ CORTOCIRCUITO DETECTADO: Fuente 1 (+) conectada directamente a Fuente 2 (-) sin carga.';
    
    // Check if Ammeter caused the short
    if (multimeterMode === 'A') {
      const m1aNode = nodes.find(n => n.terminalIds.includes('M1_A'));
      const m1comNode = nodes.find(n => n.terminalIds.includes('M1_COM'));
      if (m1aNode && m1comNode && m1aNode === m1comNode && m1aNode === posNode) {
        multErr = 'FUSE_BLOWN';
        msg = '⚠️ FUSIBLE QUEMADO: El amperímetro fue conectado en paralelo a la fuente.';
      }
    }

    return {
      ...baseResult,
      req: 0,
      totalCurrent: 9999,
      hasShortCircuit: true,
      multimeterResult: { value: 0, error: multErr },
      paso4Status: { ...emptyStatus, generalFeedback: msg }
    };
  }

  // 1.5 Detección de Amperímetro en Paralelo con componente (Cortocircuito Local)
  if (multimeterMode === 'A') {
    const m1aNode = nodes.find(n => n.terminalIds.includes('M1_A'));
    if (m1aNode) {
      let shortedByAmmeter = false;
      for (const r of UDB_RESISTORS) {
        if (m1aNode.terminalIds.includes(`${r.id}_T1`) && m1aNode.terminalIds.includes(`${r.id}_T2`)) {
          shortedByAmmeter = true;
          break;
        }
      }

      if (shortedByAmmeter) {
        return {
          ...baseResult,
          req: 0,
          totalCurrent: 9999,
          hasShortCircuit: true,
          multimeterResult: { value: 0, error: 'FUSE_BLOWN' },
          paso4Status: { ...emptyStatus, generalFeedback: '⚠️ FUSIBLE QUEMADO: El amperímetro se conectó en paralelo con un componente. Los amperímetros siempre se conectan en serie, de lo contrario provocan un cortocircuito.' }
        };
      }
    }
  }

  // 2. Solve main voltages
  const posIdx = posNode ? nodes.indexOf(posNode) : -1;
  const negIdx = negNode ? nodes.indexOf(negNode) : -1;

  const mainVoltages = solveVoltages(nodes, posIdx, negIdx, vin);
  nodes.forEach((n, idx) => n.voltage = mainVoltages[idx]);

  // 3. Compute Main Measurements
  let totalCurrent = 0;
  UDB_RESISTORS.forEach(r => {
    const t1Node = nodes.find(n => n.terminalIds.includes(`${r.id}_T1`));
    const t2Node = nodes.find(n => n.terminalIds.includes(`${r.id}_T2`));

    if (t1Node && t2Node && t1Node !== t2Node) {
      let vDrop = t1Node.voltage - t2Node.voltage;
      if (!useStrictSigns) vDrop = Math.abs(vDrop);
      const current_mA = (vDrop / r.value) * 1000;
      const power_mW = Math.abs(vDrop * current_mA);

      measurements[r.id] = {
        resistorId: r.id,
        voltageDrop: Number(vDrop.toFixed(3)),
        current: Number(current_mA.toFixed(3)),
        power: Number(power_mW.toFixed(3))
      };

      if (posNode && (t1Node === posNode || t2Node === posNode)) {
        totalCurrent += Math.abs(current_mA);
      }
    }
  });

  const req = totalCurrent > 0 ? (vin / (totalCurrent / 1000)) : null;

  // 4. Wattmeter Logic
  const Iw_mA = getClusterLeavingCurrent('W1_I', wires, nodes, totalCurrent);
  const nodeO = nodes.find(n => n.terminalIds.includes('W1_O'));
  const nodeU = nodes.find(n => n.terminalIds.includes('W1_U'));
  const voltageO = nodeO ? nodeO.voltage : 0;
  const voltageU = nodeU ? nodeU.voltage : 0;
  const wattmeterPower = (voltageO - voltageU) * (Iw_mA / 1000);

  // 5. Multimeter Logic
  const multResult: { value: number; error?: 'OL' | 'FUSE_BLOWN' } = { value: 0 };
  
  if (multimeterMode === 'V') {
    const nodeV = nodes.find(n => n.terminalIds.includes('M1_V_OHMS'));
    const nodeCOM = nodes.find(n => n.terminalIds.includes('M1_COM'));
    
    // Si alguna de las dos puntas está al aire, no hay circuito cerrado para medir voltaje
    if (!nodeV || !nodeCOM) {
      multResult.value = 0;
    } else {
      multResult.value = nodeV.voltage - nodeCOM.voltage;
    }
  }
  else if (multimeterMode === 'A') {
    multResult.value = -getClusterLeavingCurrent('M1_A', wires, nodes, totalCurrent);
  }
  else if (multimeterMode === 'OHMS') {
    const nV = nodes.find(n => n.terminalIds.includes('M1_V_OHMS'))?.voltage || 0;
    const nCOM = nodes.find(n => n.terminalIds.includes('M1_COM'))?.voltage || 0;
    
    if (Math.abs(nV - nCOM) > 0.01) {
      multResult.error = 'OL'; // Energized circuit protection
    } else {
      const ohmPosNode = nodes.find(n => n.terminalIds.includes('M1_V_OHMS'));
      const ohmNegNode = nodes.find(n => n.terminalIds.includes('M1_COM'));
      
      if (ohmPosNode && ohmNegNode && ohmPosNode !== ohmNegNode) {
        const oPIdx = nodes.indexOf(ohmPosNode);
        const oNIdx = nodes.indexOf(ohmNegNode);
        
        // RE-RUN SOLVER to measure Resistance with 1V injected
        const ohmVoltages = solveVoltages(nodes, oPIdx, oNIdx, 1.0);
        
        // Sum current leaving ohmPosNode (the 1V source)
        let ohmCurrent_mA = 0;
        ohmPosNode.resistorConnections.forEach(conn => {
          const r = getResistorById(conn.resistorId);
          const oppTermId = conn.terminalIndex === 0 ? `${r.id}_T2` : `${r.id}_T1`;
          const oppNode = nodes.find(n => n.terminalIds.includes(oppTermId));
          if (oppNode) {
            const vDrop = ohmVoltages[oPIdx] - ohmVoltages[nodes.indexOf(oppNode)];
            ohmCurrent_mA += (vDrop / r.value) * 1000;
          }
        });

        if (ohmCurrent_mA > 0) {
          multResult.value = 1.0 / (ohmCurrent_mA / 1000); // R = V / I
        } else {
          multResult.error = 'OL'; // Infinity / Open
        }
      } else {
        multResult.error = 'OL'; // Open Circuit
      }
    }
  }

  return {
    nodes,
    req: req ? Number(req.toFixed(2)) : null,
    totalCurrent: Number(totalCurrent.toFixed(2)),
    measurements,
    wattmeterPower: Number(wattmeterPower.toFixed(4)),
    multimeterResult: multResult,
    isComplete: totalCurrent > 0 && req !== null,
    hasShortCircuit: false,
    paso4Status: emptyStatus
  };
}
