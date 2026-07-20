import { CircuitState, TerminalId, CableId } from '../types/circuitState';

export const handleDisconnectCable = (
  state: CircuitState,
  terminalIdToDisconnect: TerminalId
): CircuitState => {
  const terminal = state.terminals[terminalIdToDisconnect];
  
  if (!terminal || !terminal.connectedCableId) return state;

  const cableId = terminal.connectedCableId;
  const cable = state.cables[cableId];
  if (!cable) return state;

  const isStart = cable.startTerminalId === terminalIdToDisconnect;
  const remainingTerminalId = isStart ? (cable.endTerminalId as TerminalId) : cable.startTerminalId;

  let newLayer = cable.layer || 1;
  if (remainingTerminalId) {
    const remainingStackCount = Object.values(state.cables).filter(
      (c) => (c.startTerminalId === remainingTerminalId || c.endTerminalId === remainingTerminalId) && c.id !== cableId
    ).length;
    newLayer = remainingStackCount + 1;
  }

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
        startTerminalId: remainingTerminalId,
        endTerminalId: null,
        layer: newLayer,
      },
    },
    floatingCableId: cableId,
  };
};

export const handleDisconnectSpecificCable = (
  state: CircuitState,
  cableId: CableId,
  terminalIdToDisconnect: TerminalId
): CircuitState => {
  const terminal = state.terminals[terminalIdToDisconnect];
  const cable = state.cables[cableId];
  if (!terminal || !cable) return state;

  const isStart = cable.startTerminalId === terminalIdToDisconnect;
  const remainingTerminalId = isStart ? (cable.endTerminalId as TerminalId) : cable.startTerminalId;

  let newLayer = cable.layer || 1;
  if (remainingTerminalId) {
    const remainingStackCount = Object.values(state.cables).filter(
      (c) => (c.startTerminalId === remainingTerminalId || c.endTerminalId === remainingTerminalId) && c.id !== cableId
    ).length;
    newLayer = remainingStackCount + 1;
  }

  const newTerminals = { ...state.terminals };
  if (terminal.connectedCableId === cableId) {
    newTerminals[terminalIdToDisconnect] = { ...terminal, connectedCableId: null };
  }

  return {
    ...state,
    terminals: newTerminals,
    cables: {
      ...state.cables,
      [cableId]: {
        ...cable,
        startTerminalId: remainingTerminalId,
        endTerminalId: null,
        layer: newLayer,
      },
    },
    floatingCableId: cableId,
  };
};

export const handleReconnectCable = (
  state: CircuitState,
  cableId: CableId,
  newTerminalId: TerminalId
): CircuitState => {
  const newTerminal = state.terminals[newTerminalId];
  const cable = state.cables[cableId];

  if (!newTerminal || !cable) return state;

  if (cable.startTerminalId === newTerminalId) {
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

  const startStackCount = Object.values(state.cables).filter(
    (c) => (c.startTerminalId === cable.startTerminalId || c.endTerminalId === cable.startTerminalId) && c.id !== cableId
  ).length;

  const endStackCount = Object.values(state.cables).filter(
    (c) => (c.startTerminalId === newTerminalId || c.endTerminalId === newTerminalId) && c.id !== cableId
  ).length;

  const newLayer = Math.max(startStackCount, endStackCount) + 1;

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
        endTerminalId: newTerminalId,
        layer: newLayer,
      },
    },
    floatingCableId: null,
  };
};
