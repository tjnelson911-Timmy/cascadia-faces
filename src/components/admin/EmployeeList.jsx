import { useState } from 'react';
import Avatar from '../Avatar';
import FacilityBadge from '../FacilityBadge';

export default function EmployeeList({
  employees,
  onEdit,
  onDelete,
  onAdd,
  onCsvUpload,
  onReset,
  onLoadDummies,
  onResetPassword,
}) {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmPwReset, setConfirmPwReset] = useState(null);
  const [pwResetDone, setPwResetDone] = useState(null);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Employees ({employees.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-cascadia-600 text-white rounded-lg text-sm font-medium hover:bg-cascadia-700 transition-colors"
          >
            + Add Employee
          </button>
          <button
            onClick={onCsvUpload}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Import CSV
          </button>
          <button
            onClick={onLoadDummies}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Load Test Data
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 mb-4">No employees yet.</p>
          <button
            onClick={onAdd}
            className="text-cascadia-600 hover:text-cascadia-700 font-medium"
          >
            Add your first employee
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {[...employees].sort((a, b) => a.name.localeCompare(b.name)).map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <Avatar employee={emp} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {emp.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-gray-500 truncate">
                      {emp.role}
                    </span>
                    <FacilityBadge facility={emp.facility} />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {emp.photo && (
                    <span className="w-2 h-2 bg-forest-400 rounded-full" title="Has photo" />
                  )}
                  <button
                    onClick={() => onEdit(emp)}
                    className="px-3 py-1.5 text-sm text-cascadia-600 hover:bg-cascadia-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  {emp.email && (
                    <button
                      onClick={() => setConfirmPwReset(emp)}
                      className="px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      {pwResetDone === emp.id ? 'Reset!' : 'Reset PW'}
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDelete(emp.id)}
                    className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Employee?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently remove{' '}
              <strong>
                {employees.find((e) => e.id === confirmDelete)?.name}
              </strong>{' '}
              from the roster.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Reset to Defaults?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will replace all employees with the original seed data. Any
              changes you've made will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReset();
                  setConfirmReset(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmPwReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Reset Password?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Reset the password for{' '}
              <strong>{confirmPwReset.name}</strong>{' '}
              ({confirmPwReset.email}) to <strong>Cascadia1</strong>? They will
              be required to change it on next login.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmPwReset(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onResetPassword(confirmPwReset.email);
                  setPwResetDone(confirmPwReset.id);
                  setConfirmPwReset(null);
                  setTimeout(() => setPwResetDone(null), 2000);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
