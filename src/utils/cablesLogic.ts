import { CircuitState, TerminalId, CableId } from '../types/circuitState';

/**
 * Desconecta un extremo de un cable de una terminal. 
 * El otro extremo se mantiene en su lugar, permitiendo la mecánica "flotante".
 */
export const handleDisconnectCable = (
  state: CircuitState,
  terminalIdToDisconnect: TerminalId
): CircuitState => {
  const terminal = state.terminals[terminalIdToDisconnect];
  
  if (!terminal || !terminal.connectedCableId) return state;

  const cableId = terminal.connectedCableId;
  const cable = state.cables[cableId];
  const isStart = cable.startTerminalId === terminalIdToDisconnect;

  return {
    ...state,
    terminals: {
      ...state.terminals,
      [terminalIdToDisconnect]: { ...terminal, connectedCableId: null },
    },
    cables: {
      ...state.cables,
      [cableId]: {
        ...cable,
        // Por convención, movemos el terminal fijo a "start" y el "end" es el flotante (null)
        startTerminalId: isStart ? (cable.endTerminalId as TerminalId) : cable.startTerminalId,
        endTerminalId: null, 
      },
    },
    floatingCableId: cableId,
  };
};

/**
 * Conecta el cable que está "flotando" a una terminal nueva libre.
 */
export const handleReconnectCable = (
  state: CircuitState,
  cableId: CableId,
  newTerminalId: TerminalId
): CircuitState => {
  const newTerminal = state.terminals[newTerminalId];
  const cable = state.cables[cableId];

  // Falla si la terminal no existe o el cable no existe. Se permite sobreescribir para cables multiples.
  if (!newTerminal || !cable) return state;

  // Prevenir que un cable se conecte a sí mismo (bucle en el mismo borne)
  if (cable.startTerminalId === newTerminalId) {
    // Si lo conectan al mismo origen, simplemente eliminamos el cable (como si lo devolvieran)
    const newCables = { ...state.cables };
    delete newCables[cableId];
    
    const newTerminals = { ...state.terminals };
    if (newTerminals[cable.startTerminalId] && newTerminals[cable.startTerminalId].connectedCableId === cableId) {
      newTerminals[cable.startTerminalId] = { ...newTerminals[cable.startTerminalId], connectedCableId: null };
    }

    return {
      ...state,
      terminals: newTerminals,
      cables: newCables,
      floatingCableId: null,
    };
  }

  return {
    ...state,
    terminals: {
      ...state.terminals,
      [newTerminalId]: { ...newTerminal, connectedCableId: cableId },
    },
    cables: {
      ...state.cables,
      [cableId]: {
        ...cable,
        endTerminalId: newTerminalId, // Sella la conexión
      },
    },
    floatingCableId: null,
  };
};
