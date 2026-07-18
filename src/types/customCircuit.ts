import { Wire } from './circuit';

export interface CustomCircuit {
  id: string;
  name: string;
  createdAt: number;
  wires: Wire[];
  vin?: number;
}
