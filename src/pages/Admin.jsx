import { useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../context/AuthContext';
import EmployeeList from '../components/admin/EmployeeList';
import EmployeeForm from '../components/admin/EmployeeForm';
import CsvUpload from '../components/admin/CsvUpload';
import { dummyEmployees } from '../data/dummyEmployees';
import { deriveInitials, assignColor } from '../utils/employeeUtils';

function buildDummies() {
  return dummyEmployees.map((emp) => ({
    ...emp,
    initials: deriveInitials(emp.name),
    color: assignColor(emp.name),
  }));
}

export default function Admin() {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    importEmployees,
    resetToSeed,
  } = useEmployees();

  const {
    resetPassword,
    ensureAccountForEmployee,
    ensureAccountsForEmployees,
    removeAccountForEmployee,
    rebuildAccountsForEmployees,
  } = useAuth();

  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);

  const handleEdit = (emp) => {
    setEditing(emp);
    setView('form');
  };

  const handleAdd = () => {
    setEditing(null);
    setView('form');
  };

  const handleFormDone = () => {
    setEditing(null);
    setView('list');
  };

  const handleSaveNew = (data) => {
    addEmployee(data);
    // After adding, find the new employee to get its id
    // The id is computed inside addEmployee, so we need to get it
    // We'll create the account with a slight delay to allow state to update
    if (data.email) {
      // Use a timeout to ensure the employee is added first
      setTimeout(() => {
        const stored = JSON.parse(localStorage.getItem('cascadia-employees') || '[]');
        const added = stored.find(
          (e) => e.email && e.email.toLowerCase() === data.email.toLowerCase()
        );
        if (added) ensureAccountForEmployee(added);
      }, 100);
    }
  };

  const handleSaveExisting = (data) => {
    updateEmployee(editing.id, data);
    if (data.email) {
      ensureAccountForEmployee({ ...data, id: editing.id });
    }
  };

  const handleDelete = (id) => {
    deleteEmployee(id);
    removeAccountForEmployee(id);
  };

  const handleImport = async (data, mode) => {
    importEmployees(data, mode);
    // Rebuild accounts after import
    setTimeout(async () => {
      const stored = JSON.parse(localStorage.getItem('cascadia-employees') || '[]');
      if (mode === 'replace') {
        await rebuildAccountsForEmployees(stored);
      } else {
        await ensureAccountsForEmployees(stored);
      }
    }, 100);
    setView('list');
  };

  const handleLoadDummies = async () => {
    const dummies = buildDummies();
    importEmployees(dummies, 'replace');
    setTimeout(async () => {
      const stored = JSON.parse(localStorage.getItem('cascadia-employees') || '[]');
      await rebuildAccountsForEmployees(stored);
    }, 100);
  };

  const handleReset = async () => {
    resetToSeed();
    setTimeout(async () => {
      const stored = JSON.parse(localStorage.getItem('cascadia-employees') || '[]');
      await rebuildAccountsForEmployees(stored);
    }, 100);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cascadia-900 mb-1">Admin</h1>
        <p className="text-gray-500">
          Manage the Stars of Cascadia &mdash; add employees, upload rosters,
          and configure profiles.
        </p>
      </div>

      {view === 'list' && (
        <EmployeeList
          employees={employees}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onCsvUpload={() => setView('csv')}
          onReset={handleReset}
          onLoadDummies={handleLoadDummies}
          onResetPassword={resetPassword}
        />
      )}

      {view === 'form' && (
        <EmployeeForm
          employee={editing}
          onSave={editing ? handleSaveExisting : handleSaveNew}
          onCancel={handleFormDone}
          onDone={handleFormDone}
        />
      )}

      {view === 'csv' && (
        <CsvUpload onImport={handleImport} onCancel={() => setView('list')} />
      )}
    </div>
  );
}
