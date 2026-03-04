import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { normalizeName } from '../utils/employeeUtils';
import seedData from '../data/employees.json';

const STORAGE_KEY = 'cascadia-employees';

export function useEmployees() {
  const [rawEmployees, setEmployees] = useLocalStorage(STORAGE_KEY, seedData);

  // Normalize all names to "First Last" format
  const employees = useMemo(
    () => rawEmployees.map((e) => ({ ...e, name: normalizeName(e.name) })),
    [rawEmployees]
  );

  const nextId = () => Math.max(0, ...employees.map((e) => e.id)) + 1;

  const addEmployee = (employee) => {
    setEmployees((prev) => [...prev, { ...employee, id: nextId() }]);
  };

  const updateEmployee = (id, updates) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteEmployee = (id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const importEmployees = (newEmployees, mode = 'replace') => {
    if (mode === 'replace') {
      const withIds = newEmployees.map((e, i) => ({ ...e, id: i + 1 }));
      setEmployees(withIds);
    } else {
      const startId = nextId();
      const withIds = newEmployees.map((e, i) => ({
        ...e,
        id: startId + i,
      }));
      setEmployees((prev) => [...prev, ...withIds]);
    }
  };

  const resetToSeed = () => {
    setEmployees(seedData);
  };

  return {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    importEmployees,
    resetToSeed,
  };
}
