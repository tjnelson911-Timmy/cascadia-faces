import { useAuth } from '../context/AuthContext';
import { useEmployees } from '../hooks/useEmployees';
import EmployeeForm from '../components/admin/EmployeeForm';

export default function MyProfile() {
  const { user } = useAuth();
  const { employees, updateEmployee } = useEmployees();

  const myEmployee = employees.find((e) => e.id === user?.employeeId);

  if (!myEmployee) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">
          No employee profile is linked to your account.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Ask your admin to add you with your work email.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cascadia-900 mb-1">
          My Profile
        </h1>
        <p className="text-gray-500">
          Update your photo, bio, and preferences.
        </p>
      </div>

      <EmployeeForm
        employee={myEmployee}
        mode="self"
        onSave={(data) => updateEmployee(myEmployee.id, data)}
        onCancel={() => {}}
        onDone={() => {}}
        showDoneMessage
      />
    </div>
  );
}
