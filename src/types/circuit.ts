export type ResistorId = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'R8' | 'R9';

export interface Resistor {
  id: ResistorId;
  label: string;
  value: number; // in Ohms
  x: number; // X position percentage on board
  y: number; // Y position percentage on board
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical';
  terminals: [string, string]; // [t1_id, t2_id]
}

export interface Terminal {
  id: string;
  resistorId?: ResistorId;
  label: string;
  type: 'resistor' | 'power_pos' | 'power_neg';
  x: number; // X coordinate percentage on board
  y: number; // Y coordinate percentage on board
}

export type WireColor = '#ef4444' | '#3b82f6' | '#10b981' | '#eab308' | '#8b5cf6' | '#f97316' | '#111827';

export interface Wire {
  id: string;
  fromTerminalId: string;
  toTerminalId: string;
  color: WireColor;
  label?: string;
  order: number; // For rendering multiple stacked banana plugs cleanly
  layer?: number; // Nivel de Altura / Capa Z del Cable dinámico según cables apilados en el borne
}

export interface ElectricalNode {
  id: string; // e.g. "Nodo #1", "Nodo #2", etc.
  terminalIds: string[];
  resistorConnections: { resistorId: ResistorId; terminalIndex: 0 | 1 }[];
  voltage: number; // calculated node voltage with respect to ground (POWER_NEG)
}

export interface ResistorMeasurement {
  resistorId: ResistorId;
  voltageDrop: number; // Volts
  current: number; // Milliamperes (mA)
  power: number; // Milliwatts (mW)
}

export interface CircuitAnalysisResult {
  nodes: ElectricalNode[];
  req: number | null; // Equivalent resistance across power terminals in Ohms
  totalCurrent: number; // Total current supplied by power source in mA
  measurements: Record<ResistorId, ResistorMeasurement>;
  isComplete: boolean;
  hasShortCircuit: boolean;
  paso4Status: {
    isCorrect: boolean;
    nodeDetails: {
      nodeName: string;
      expectedResistors: string[];
      actualResistors: string[];
      status: 'correct' | 'missing' | 'extra';
      message: string;
    }[];
    generalFeedback: string;
  };
}
