import { useState, useEffect } from 'react';
import { CustomCircuit } from '../types/customCircuit';
import { Wire } from '../types/circuit';

const STORAGE_KEY = 'udb_circuits_storage';

export function useCustomCircuits() {
  const [circuits, setCircuits] = useState<CustomCircuit[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCircuits(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved circuits', e);
      }
    }
  }, []);

  const saveCircuitsToStorage = (newCircuits: CustomCircuit[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCircuits));
    setCircuits(newCircuits);
  };

  const saveCircuit = (name: string, wires: Wire[], vin: number = 12) => {
    const newCircuit: CustomCircuit = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      wires,
      vin
    };
    saveCircuitsToStorage([...circuits, newCircuit]);
  };

  const deleteCircuit = (id: string) => {
    saveCircuitsToStorage(circuits.filter(c => c.id !== id));
  };

  const duplicateCircuit = (id: string) => {
    const circuitToDuplicate = circuits.find(c => c.id === id);
    if (circuitToDuplicate) {
      const newCircuit: CustomCircuit = {
        ...circuitToDuplicate,
        id: crypto.randomUUID(),
        name: `${circuitToDuplicate.name} (Copia)`,
        createdAt: Date.now()
      };
      saveCircuitsToStorage([...circuits, newCircuit]);
    }
  };

  return {
    circuits,
    saveCircuit,
    deleteCircuit,
    duplicateCircuit
  };
}
