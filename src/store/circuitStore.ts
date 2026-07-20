import { create } from 'zustand';
import { temporal } from 'zundo';
import { CircuitState, TerminalId, CableId, ComponentId, WireColor, Cable } from '../types/circuitState';
import { handleDisconnectCable, handleDisconnectSpecificCable, handleReconnectCable } from '../utils/cablesLogic';
import { Wire } from '../types/circuit';
import { Component, MultimeterMode } from '../types/instruments';

interface CircuitStoreState extends CircuitState {
  // Actions
  addCable: (startTerminalId: TerminalId, color: WireColor, layer: number, order: number) => void;
  connectFloatingCable: (newTerminalId: TerminalId) => void;
  disconnectCable: (terminalId: TerminalId) => void;
  removeCable: (cableId: CableId) => void;
  clearCables: () => void;
  setWattmeterRanges: (componentId: ComponentId, voltageRange: any, currentRange: any) => void;
  setMultimeterMode: (componentId: ComponentId, mode: MultimeterMode) => void;
  loadPreset: (wires: Wire[]) => void;
  registerComponent: (component: Component) => void;
  createAirJunction: (x: number, y: number) => void;
  updateAirJunction: (id: TerminalId, x: number, y: number) => void;
  removeAirJunction: (id: TerminalId) => void;
  disconnectSpecificCable: (cableId: CableId, terminalId: TerminalId) => void;
  updateCableLayers: (updates: { cableId: CableId; layer: number }[]) => void;
}

export const useCircuitStore = create<CircuitStoreState>()(temporal((set, get) => ({
  cables: {},
  terminals: {},
  airJunctions: {},
  components: {},
  floatingCableId: null,

  addCable: (startTerminalId, color, layer, order) => set((state) => {
    if (state.floatingCableId) {
      // If there's already a floating cable, we could delete it, but for simplicity let's just ignore
      return state;
    }

    const newCableId = `cable-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const terminal = state.terminals[startTerminalId] || {
      id: startTerminalId,
      componentId: 'unknown',
      pin: startTerminalId,
      connectedCableId: null
    };

    return {
      cables: {
        ...state.cables,
        [newCableId]: {
          id: newCableId,
          startTerminalId,
          endTerminalId: null,
          mnaNodeId: null,
          color,
          order,
          layer
        }
      },
      terminals: {
        ...state.terminals,
        [startTerminalId]: {
          ...terminal,
          connectedCableId: newCableId
        }
      },
      floatingCableId: newCableId
    };
  }),

  createAirJunction: (x, y) => {
    const state = get();
    const { floatingCableId } = state;
    if (!floatingCableId) return;

    const newJunctionId = `air-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Almacenar el empalme
    set({
      airJunctions: {
        ...state.airJunctions,
        [newJunctionId]: { id: newJunctionId, x, y }
      }
    });

    // Usar la lógica existente para conectar el cable flotante a este nuevo id
    get().connectFloatingCable(newJunctionId);
  },

  updateAirJunction: (id, x, y) => set((state) => {
    if (!state.airJunctions[id]) return state;
    return {
      airJunctions: {
        ...state.airJunctions,
        [id]: { ...state.airJunctions[id], x, y }
      }
    };
  }),

  removeAirJunction: (id) => set((state) => {
    const newAirJunctions = { ...state.airJunctions };
    delete newAirJunctions[id];
    return { airJunctions: newAirJunctions };
  }),

  connectFloatingCable: (newTerminalId) => set((state) => {
    const { floatingCableId } = state;
    if (!floatingCableId) return state;

    const newTerminal = state.terminals[newTerminalId] || {
      id: newTerminalId,
      componentId: 'unknown',
      pin: newTerminalId,
      connectedCableId: null
    };

    // Permitir cables múltiples, no bloquear por connectedCableId

    const stateWithNewTerminal = {
      ...state,
      terminals: {
        ...state.terminals,
        [newTerminalId]: newTerminal
      }
    };

    return handleReconnectCable(stateWithNewTerminal, floatingCableId, newTerminalId);
  }),

  disconnectCable: (terminalId) => set((state) => {
    const newState = handleDisconnectCable(state, terminalId);

    // Auto-cleanup: Si terminalId era un AirJunction, revisamos si quedó con 0 cables
    if (terminalId.startsWith('air-')) {
      // Contar cables usando startTerminalId y endTerminalId
      const connectedCount = Object.values(newState.cables).filter(
        c => c.startTerminalId === terminalId || c.endTerminalId === terminalId
      ).length;

      if (connectedCount === 0) {
        const newAirJunctions = { ...newState.airJunctions };
        delete newAirJunctions[terminalId];
        return { ...newState, airJunctions: newAirJunctions };
      }
    }
    return newState;
  }),

  disconnectSpecificCable: (cableId, terminalId) => set((state) => {
    const newState = handleDisconnectSpecificCable(state, cableId, terminalId);
    
    // Auto-cleanup: Si terminalId era un AirJunction, revisamos si quedó con 0 cables
    if (terminalId.startsWith('air-')) {
      const connectedCount = Object.values(newState.cables).filter(
        c => c.startTerminalId === terminalId || c.endTerminalId === terminalId
      ).length;
      
      if (connectedCount === 0) {
        const newAirJunctions = { ...newState.airJunctions };
        delete newAirJunctions[terminalId];
        return { ...newState, airJunctions: newAirJunctions };
      }
    }
    return newState;
  }),

  removeCable: (cableId) => set((state) => {
    const cable = state.cables[cableId];
    if (!cable) return state;

    const newTerminals = { ...state.terminals };
    if (cable.startTerminalId && newTerminals[cable.startTerminalId]) {
      newTerminals[cable.startTerminalId] = { ...newTerminals[cable.startTerminalId], connectedCableId: null };
    }
    if (cable.endTerminalId && newTerminals[cable.endTerminalId]) {
      newTerminals[cable.endTerminalId] = { ...newTerminals[cable.endTerminalId], connectedCableId: null };
    }

    const newCables = { ...state.cables };
    delete newCables[cableId];

    // Auto-cleanup de AirJunctions huérfanos
    const newAirJunctions = { ...state.airJunctions };
    [cable.startTerminalId, cable.endTerminalId].forEach(tId => {
      if (tId && tId.startsWith('air-')) {
        const count = Object.values(newCables).filter(
          c => c.startTerminalId === tId || c.endTerminalId === tId
        ).length;
        if (count === 0) {
          delete newAirJunctions[tId];
        }
      }
    });

    return {
      cables: newCables,
      terminals: newTerminals,
      airJunctions: newAirJunctions,
      floatingCableId: state.floatingCableId === cableId ? null : state.floatingCableId
    };
  }),

  clearCables: () => set((state) => {
    // We only clear cables and their connections on terminals, but keep components
    const newTerminals = { ...state.terminals };
    Object.keys(newTerminals).forEach(k => {
      newTerminals[k] = { ...newTerminals[k], connectedCableId: null };
    });
    return { cables: {}, floatingCableId: null, terminals: newTerminals, airJunctions: {} };
  }),

  updateCableLayers: (updates) => set((state) => {
    const newCables = { ...state.cables };
    updates.forEach(({ cableId, layer }) => {
      if (newCables[cableId]) {
        newCables[cableId] = { ...newCables[cableId], layer };
      }
    });
    return { cables: newCables };
  }),

  setWattmeterRanges: (componentId, voltageRange, currentRange) => set((state) => {
    const comp = state.components[componentId];
    if (!comp || comp.type !== 'Wattmeter') return state;
    return {
      components: {
        ...state.components,
        [componentId]: {
          ...comp,
          selectedVoltageRange: voltageRange,
          selectedCurrentRange: currentRange
        }
      }
    };
  }),

  setMultimeterMode: (componentId, mode) => set((state) => {
    const comp = state.components[componentId];
    if (!comp || comp.type !== 'Multimeter') return state;
    return {
      components: {
        ...state.components,
        [componentId]: {
          ...comp,
          mode
        }
      }
    };
  }),

  loadPreset: (wires: Wire[]) => set((state) => {
    const newCables: Record<CableId, Cable> = {};
    const newTerminals: Record<TerminalId, any> = { ...state.terminals };

    wires.forEach(w => {
      newCables[w.id] = {
        id: w.id,
        startTerminalId: w.fromTerminalId,
        endTerminalId: w.toTerminalId,
        mnaNodeId: null,
        color: w.color,
        layer: w.layer || 1,
        order: w.order
      };

      if (!newTerminals[w.fromTerminalId]) {
        newTerminals[w.fromTerminalId] = { id: w.fromTerminalId, componentId: 'unknown', pin: w.fromTerminalId, connectedCableId: w.id };
      } else {
        newTerminals[w.fromTerminalId] = { ...newTerminals[w.fromTerminalId], connectedCableId: w.id };
      }
      if (!newTerminals[w.toTerminalId]) {
        newTerminals[w.toTerminalId] = { id: w.toTerminalId, componentId: 'unknown', pin: w.toTerminalId, connectedCableId: w.id };
      } else {
        newTerminals[w.toTerminalId] = { ...newTerminals[w.toTerminalId], connectedCableId: w.id };
      }
    });

    return {
      cables: newCables,
      terminals: newTerminals,
      floatingCableId: null
    };
  }),

  registerComponent: (component) => set((state) => {
    return {
      components: {
        ...state.components,
        [component.id]: component
      }
    };
  })
}), {
  partialize: (state) => {
    // Solo guardamos en el historial las conexiones y el estado de componentes
    // Ignoramos floatingCableId para evitar historial sucio al arrastrar cables
    return {
      cables: state.cables,
      terminals: state.terminals,
      airJunctions: state.airJunctions,
      components: state.components
    };
  }
}));

// Adapter selector for MNA engine
export const selectWiresForMNA = (state: CircuitStoreState): Wire[] => {
  return Object.values(state.cables)
    .filter(cable => cable.endTerminalId !== null) // Only fully connected cables
    .map(cable => ({
      id: cable.id,
      fromTerminalId: cable.startTerminalId,
      toTerminalId: cable.endTerminalId as string,
      color: cable.color as WireColor,
      order: cable.order,
      layer: cable.layer
    }));
};
