import { Wire, WireColor } from '../types/circuit';

export interface CircuitPreset {
  id: string;
  title: string;
  category: 'serie' | 'paralelo' | 'mixto';
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  description: string;
  wires: Wire[];
  expectedReq: number; // Ohms
  keyFeatures: string[];
  formulaExplanation: string;
}

function createPresetWires(connections: [string, string, WireColor, number?][]): Wire[] {
  return connections.map(([fromId, toId, color, layer], idx) => ({
    id: `preset-wire-${idx}-${Date.now().toString(36)}`,
    fromTerminalId: fromId,
    toTerminalId: toId,
    color,
    order: (layer || 1) - 1,
    layer: layer || 1
  }));
}

export const CIRCUIT_PRESETS: CircuitPreset[] = [
  {
    id: 'serie_3r',
    title: 'Circuito en Serie Puro (3 Resistencias)',
    category: 'serie',
    difficulty: 'Básico',
    description: 'Conexión en cadena continua con R1 (220Ω), R5 (220Ω) y R8 (1.5kΩ). La corriente es estrictamente idéntica a lo largo del lazo.',
    expectedReq: 1940,
    formulaExplanation: 'R_eq = R1 + R5 + R8 = 220 + 220 + 1500 = 1,940 Ω',
    keyFeatures: [
      'Corriente única en todos los componentes (I = V_in / R_eq)',
      'Divisor de voltaje proporcional al valor de cada resistencia',
      'Si se desconecta cualquier cable, el circuito entero se abre (I = 0)'
    ],
    wires: createPresetWires([
      ['POWER_POS', 'R1_T1', '#ef4444', 1],
      ['R1_T2', 'R5_T1', '#3b82f6', 1],
      ['R5_T2', 'R8_T1', '#eab308', 1],
      ['R8_T2', 'POWER_NEG', '#111827', 1]
    ])
  },
  {
    id: 'paralelo_3r',
    title: 'Circuito en Paralelo Puro (3 Ramas Centrales)',
    category: 'paralelo',
    difficulty: 'Intermedio',
    description: 'Conexión paralela de las tres resistencias verticales R3 (680Ω), R5 (220Ω) y R4 (680Ω) compartiendo directamente las dos barras de alimentación.',
    expectedReq: 133.57,
    formulaExplanation: '1/R_eq = 1/R3 + 1/R5 + 1/R4 = 1/680 + 1/220 + 1/680  ➔  R_eq ≈ 133.57 Ω',
    keyFeatures: [
      'Voltaje exactamente igual en las 3 resistencias (V_R3 = V_R5 = V_R4 = V_in)',
      'La corriente total se divide en 3 ramas de acuerdo a la conductancia (LCK)',
      'La resistencia equivalente siempre es menor que la menor de las ramas (< 220 Ω)'
    ],
    wires: createPresetWires([
      ['POWER_POS', 'R3_T1', '#ef4444', 1],
      ['R3_T1', 'R5_T1', '#ef4444', 2],
      ['R5_T1', 'R4_T1', '#ef4444', 3],
      ['R3_T2', 'POWER_NEG', '#111827', 1],
      ['R5_T2', 'POWER_NEG', '#111827', 2],
      ['R4_T2', 'POWER_NEG', '#111827', 3]
    ])
  },
  {
    id: 'mixto_basico',
    title: 'Circuito Mixto Básico (Serie + Paralelo Simétrico)',
    category: 'mixto',
    difficulty: 'Intermedio',
    description: 'El resistor R1 (220Ω) en serie alimenta una derivación en paralelo formada por R3 (680Ω) y R4 (680Ω).',
    expectedReq: 560,
    formulaExplanation: 'R_eq = R1 + (R3 ∥ R4) = 220 + (680 ∥ 680) = 220 + 340 = 560 Ω',
    keyFeatures: [
      'Demuestra reducción en dos pasos: primero el paralelo (340 Ω), luego suma en serie',
      'La corriente total fluye por R1 y luego se divide al 50% entre R3 y R4 por ser iguales',
      'El voltaje de la fuente se reparte entre la caída de R1 (V_R1) y la caída común del par R3-R4'
    ],
    wires: createPresetWires([
      ['POWER_POS', 'R1_T1', '#ef4444', 1],
      ['R1_T2', 'R3_T1', '#3b82f6', 1],
      ['R1_T2', 'R4_T1', '#3b82f6', 2],
      ['R3_T2', 'POWER_NEG', '#111827', 1],
      ['R4_T2', 'POWER_NEG', '#111827', 2]
    ])
  },
  {
    id: 'mixto_udb_guia',
    title: 'Circuito Mixto UDB Estándar (Guía Práctica)',
    category: 'mixto',
    difficulty: 'Avanzado',
    description: 'Topología clásica de laboratorio UDB: R1 (220Ω) en serie hacia el bloque en paralelo (R3 ∥ R5), que luego retorna a tierra a través de R9 (1.5kΩ) en serie.',
    expectedReq: 1886.22,
    formulaExplanation: 'R_eq = R1 + (R3 ∥ R5) + R9 = 220 + (680 ∥ 220) + 1500 = 220 + 166.22 + 1500 = 1,886.22 Ω',
    keyFeatures: [
      'Demostración canónica de las tres Leyes: Ohm, Corrientes de Kirchhoff en el nodo central y Voltajes en el lazo total',
      'R1 y R9 conducen el 100% de la corriente total de la fuente',
      'La rama de R5 conduce aproximadamente 3.09 veces más corriente que la rama de R3 (680Ω / 220Ω)'
    ],
    wires: createPresetWires([
      ['POWER_POS', 'R1_T1', '#ef4444', 1],
      ['R1_T2', 'R3_T1', '#3b82f6', 1],
      ['R1_T2', 'R5_T1', '#3b82f6', 2],
      ['R3_T2', 'R9_T1', '#eab308', 1],
      ['R5_T2', 'R9_T1', '#eab308', 2],
      ['R9_T2', 'POWER_NEG', '#111827', 1]
    ])
  },
  {
    id: 'mixto_complejo_doble',
    title: 'Circuito Mixto Complejo con Doble Divisor',
    category: 'mixto',
    difficulty: 'Avanzado',
    description: 'Par en paralelo superior (R1 ∥ R2) conectado en serie con la columna central R5 (220Ω), que finalmente descarga en un par en paralelo inferior (R6 ∥ R7).',
    expectedReq: 797.89,
    formulaExplanation: 'R_eq = (R1 ∥ R2) + R5 + (R6 ∥ R7) = 110 + 220 + 467.89 = 797.89 Ω',
    keyFeatures: [
      'Demuestra la adición serial de múltiples bancos en paralelo en diferentes etapas',
      'Doble nodo con división de corriente balanceada (R1/R2) y desbalanceada (R6 1.5kΩ / R7 680Ω)',
      'Excelente para probar la precisión de la relajación de Gauss-Seidel del motor MNA'
    ],
    wires: createPresetWires([
      ['POWER_POS', 'R1_T1', '#ef4444', 1],
      ['POWER_POS', 'R2_T1', '#ef4444', 2],
      ['R1_T2', 'R5_T1', '#3b82f6', 1],
      ['R2_T2', 'R5_T1', '#3b82f6', 2],
      ['R5_T2', 'R6_T1', '#eab308', 1],
      ['R5_T2', 'R7_T1', '#eab308', 2],
      ['R6_T2', 'POWER_NEG', '#111827', 1],
      ['R7_T2', 'POWER_NEG', '#111827', 2]
    ])
  }
];
