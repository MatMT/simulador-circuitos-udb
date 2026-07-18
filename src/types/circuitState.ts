import { Component } from './instruments';

export type TerminalId = string;
export type CableId = string;
export type ComponentId = string;
export type NodeId = number; // Node ID in the MNA matrix

export interface Terminal {
  id: TerminalId;
  componentId: ComponentId;
  pin: string; // E.g., 'O', 'I', 'U' for wattmeter; 'COM', 'V/mA' for multimeter
  connectedCableId: CableId | null; // Null if free
}

export type WireColor = '#ef4444' | '#3b82f6' | '#10b981' | '#eab308' | '#8b5cf6' | '#f97316' | '#111827';

export interface Cable {
  id: CableId;
  startTerminalId: TerminalId;
  endTerminalId: TerminalId | null; // Null si está desconectado/flotando en un extremo
  mnaNodeId: NodeId | null; // Nodo asignado en el MNA
  color: WireColor;
  order: number; // For rendering multiple stacked banana plugs cleanly
  layer?: number; // Nivel de Altura / Capa Z del Cable dinámico
}

export interface AirJunction {
  id: TerminalId; // Prefix like 'air-'
  x: number; // Percentage
  y: number; // Percentage
}

export interface CircuitState {
  cables: Record<CableId, Cable>;
  terminals: Record<TerminalId, Terminal>;
  airJunctions: Record<TerminalId, AirJunction>;
  components: Record<ComponentId, Component>;
  floatingCableId: CableId | null; // ID of the cable the user is holding
}
