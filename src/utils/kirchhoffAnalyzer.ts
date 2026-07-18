import { ResistorId, CircuitAnalysisResult, ElectricalNode } from '../types/circuit';
import { UDB_RESISTORS } from './circuitEngine';

export interface OhmAuditItem {
  resistorId: ResistorId;
  label: string;
  resistance: number; // Ohms
  voltageDrop: number; // Volts
  current_mA: number; // mA
  power_mW: number; // mW
  calculatedCurrent_mA: number; // mA by V/R
  isConsistent: boolean;
  formulaStr: string;
}

export interface KCLNodeAudit {
  nodeId: string;
  isPowerPos: boolean;
  isPowerNeg: boolean;
  incomingCurrents: { label: string; current_mA: number }[];
  outgoingCurrents: { label: string; current_mA: number }[];
  sumIncoming: number;
  sumOutgoing: number;
  difference: number;
  isBalanced: boolean;
}

export interface KVLLoopAudit {
  loopId: string;
  pathComponentIds: string[];
  voltageDrops: { componentId: string; label: string; voltage: number }[];
  sumDrops: number;
  sourceVoltage: number;
  difference: number;
  isValid: boolean;
  formulaStr: string;
}

export interface KirchhoffVerificationResult {
  ohmAudits: OhmAuditItem[];
  kclAudits: KCLNodeAudit[];
  kvlAudits: KVLLoopAudit[];
  isFullyCompliant: boolean;
}

/**
 * Realiza una auditoría matemática exhaustiva del circuito calculando y demostrando
 * el cumplimiento de la Ley de Ohm, la Ley de Corrientes (LCK) y la Ley de Voltajes (LVK) de Kirchhoff.
 */
export function verifyKirchhoffAndOhm(
  analysis: CircuitAnalysisResult,
  vin: number = 12
): KirchhoffVerificationResult {
  const { nodes, measurements, isComplete, totalCurrent } = analysis;

  if (!isComplete || totalCurrent <= 0) {
    return {
      ohmAudits: [],
      kclAudits: [],
      kvlAudits: [],
      isFullyCompliant: false
    };
  }

  // 1. Auditoría de la Ley de Ohm por cada resistor que conduce corriente
  const ohmAudits: OhmAuditItem[] = [];
  let ohmAllValid = true;

  UDB_RESISTORS.forEach(r => {
    const meas = measurements[r.id];
    if (meas && meas.current > 0.001) {
      const calcI_mA = (meas.voltageDrop / r.value) * 1000;
      const diff = Math.abs(meas.current - calcI_mA);
      const isConsistent = diff < 0.1; // Margen de tolerancia por redondeo flotante
      if (!isConsistent) ohmAllValid = false;

      ohmAudits.push({
        resistorId: r.id,
        label: r.label,
        resistance: r.value,
        voltageDrop: meas.voltageDrop,
        current_mA: meas.current,
        power_mW: meas.power,
        calculatedCurrent_mA: Number(calcI_mA.toFixed(3)),
        isConsistent,
        formulaStr: `${meas.voltageDrop} V / ${r.value} Ω = ${calcI_mA.toFixed(2)} mA`
      });
    }
  });

  // 2. Auditoría de la Ley de Corrientes de Kirchhoff (LCK / KCL) por cada nodo eléctrico activo
  const kclAudits: KCLNodeAudit[] = [];
  let kclAllValid = true;

  nodes.forEach(node => {
    const isPowerPos = node.terminalIds.includes('POWER_POS');
    const isPowerNeg = node.terminalIds.includes('POWER_NEG');

    const incomingCurrents: { label: string; current_mA: number }[] = [];
    const outgoingCurrents: { label: string; current_mA: number }[] = [];

    // Si es el nodo de alimentación (+), entra la corriente total I_T de la fuente
    if (isPowerPos && totalCurrent > 0) {
      incomingCurrents.push({ label: `Fuente 1 (+) V_in=${vin}V`, current_mA: totalCurrent });
    }

    // Comprobar las corrientes de los resistores conectados a este nodo
    node.resistorConnections.forEach(conn => {
      const r = UDB_RESISTORS.find(item => item.id === conn.resistorId);
      const meas = measurements[conn.resistorId];
      if (!r || !meas || meas.current <= 0.001) return;

      // Buscar el nodo en la terminal opuesta
      const oppTermId = conn.terminalIndex === 0 ? `${r.id}_T2` : `${r.id}_T1`;
      const oppNode = nodes.find(n => n.terminalIds.includes(oppTermId));
      if (!oppNode) return;

      // Determinar la dirección por diferencia de potencial de nodo
      if (oppNode.voltage > node.voltage + 1e-4) {
        // La corriente entra desde el nodo opuesto hacia este nodo
        incomingCurrents.push({ label: `Entra por ${r.id}`, current_mA: meas.current });
      } else if (oppNode.voltage < node.voltage - 1e-4) {
        // La corriente sale de este nodo hacia el nodo opuesto
        outgoingCurrents.push({ label: `Sale hacia ${r.id}`, current_mA: meas.current });
      }
    });

    // Si es el nodo de tierra (-), sale la corriente total I_T de retorno hacia la fuente
    if (isPowerNeg && totalCurrent > 0) {
      outgoingCurrents.push({ label: 'Retorno a Fuente 2 (-)', current_mA: totalCurrent });
    }

    // Solo auditar nodos que tengan corriente fluyendo
    if (incomingCurrents.length > 0 || outgoingCurrents.length > 0) {
      const sumIncoming = Number(incomingCurrents.reduce((acc, curr) => acc + curr.current_mA, 0).toFixed(2));
      const sumOutgoing = Number(outgoingCurrents.reduce((acc, curr) => acc + curr.current_mA, 0).toFixed(2));
      const difference = Number(Math.abs(sumIncoming - sumOutgoing).toFixed(3));
      const isBalanced = difference < 0.1;
      if (!isBalanced) kclAllValid = false;

      kclAudits.push({
        nodeId: node.id,
        isPowerPos,
        isPowerNeg,
        incomingCurrents,
        outgoingCurrents,
        sumIncoming,
        sumOutgoing,
        difference,
        isBalanced
      });
    }
  });

  // 3. Auditoría de la Ley de Voltajes de Kirchhoff (LVK / KVL) por trayectorias / lazos desde (+) a (-)
  const kvlAudits: KVLLoopAudit[] = [];
  let kvlAllValid = true;

  const posNode = nodes.find(n => n.terminalIds.includes('POWER_POS'));
  const negNode = nodes.find(n => n.terminalIds.includes('POWER_NEG'));

  if (posNode && negNode) {
    // DFS para encontrar todos los caminos de conducción independientes desde posNode a negNode
    const paths: { resistors: ResistorId[] }[] = [];

    function findPaths(currNode: ElectricalNode, currentPath: ResistorId[], visitedNodes: Set<ElectricalNode>) {
      if (currNode === negNode) {
        if (currentPath.length > 0) {
          paths.push({ resistors: [...currentPath] });
        }
        return;
      }

      visitedNodes.add(currNode);

      currNode.resistorConnections.forEach(conn => {
        const meas = measurements[conn.resistorId];
        if (!meas || Math.abs(meas.current) <= 0.001) return;

        const oppTermId = conn.terminalIndex === 0 ? `${conn.resistorId}_T2` : `${conn.resistorId}_T1`;
        const nextNode = nodes.find(n => n.terminalIds.includes(oppTermId));

        // Solo avanzar hacia nodos con menor potencial (flujo de corriente positivo)
        if (nextNode && nextNode.voltage < currNode.voltage - 1e-4 && !visitedNodes.has(nextNode)) {
          currentPath.push(conn.resistorId);
          findPaths(nextNode, currentPath, visitedNodes);
          currentPath.pop();
        }
      });

      visitedNodes.delete(currNode);
    }

    findPaths(posNode, [], new Set());

    // Limitar hasta las primeras 6 trayectorias independientes para evitar explosión combinatoria
    paths.slice(0, 6).forEach((path, idx) => {
      const voltageDrops: { componentId: string; label: string; voltage: number }[] = [];
      let sumDrops = 0;

      path.resistors.forEach(rid => {
        const r = UDB_RESISTORS.find(item => item.id === rid)!;
        const vDrop = Math.abs(measurements[rid].voltageDrop);
        sumDrops += vDrop;
        voltageDrops.push({
          componentId: rid,
          label: r.label,
          voltage: vDrop
        });
      });

      const difference = Number(Math.abs(vin - sumDrops).toFixed(3));
      const isValid = difference < 0.1;
      if (!isValid) kvlAllValid = false;

      const dropsStr = voltageDrops.map(d => `${d.voltage.toFixed(2)}V (${d.componentId})`).join(' + ');
      const formulaStr = `${vin} V (Fuente) = ${dropsStr}  ➔  Diferencia: ${difference} V`;

      kvlAudits.push({
        loopId: `Trayectoria #${idx + 1}: ${path.resistors.join(' ➔ ')}`,
        pathComponentIds: path.resistors,
        voltageDrops,
        sumDrops: Number(sumDrops.toFixed(2)),
        sourceVoltage: vin,
        difference,
        isValid,
        formulaStr
      });
    });
  }

  const isFullyCompliant = ohmAllValid && kclAllValid && kvlAllValid && (ohmAudits.length > 0);

  return {
    ohmAudits,
    kclAudits,
    kvlAudits,
    isFullyCompliant
  };
}
