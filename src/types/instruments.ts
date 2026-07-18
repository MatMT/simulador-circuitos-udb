export type VoltageRange = 3 | 10 | 30 | 100 | 300 | 1000;
export type CurrentRange = 0.1 | 0.3 | 1 | 3 | 10 | 30;

export type ComponentType = 'Resistor' | 'VoltageSource' | 'Multimeter' | 'Wattmeter';

export type MultimeterMode = 'V' | 'A' | 'OHMS';

export interface Component {
  id: string;
  type: ComponentType;
  value?: number;
  terminals: Record<string, string>; // { pinName: terminalId }
}

export interface WattmeterComponent extends Component {
  type: 'Wattmeter';
  selectedVoltageRange: VoltageRange;
  selectedCurrentRange: CurrentRange;
}

export interface MultimeterComponent extends Component {
  type: 'Multimeter';
  mode: MultimeterMode;
}
