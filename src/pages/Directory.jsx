import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEmployees } from '../hooks/useEmployees';
import Avatar from '../components/Avatar';
import FacilityBadge from '../components/FacilityBadge';

export default function Directory() {
  const { employees } = useEmployees();
  const [search, setSearch] = useState('');
  const [facility, setFacility] = useState('All');
  const [selected, setSelected] = useState(null);

  const KNOWN_FACILITIES = [
    'Cascadia Services',
    'Libby Care Center',
    'Shaw Mountain of Cascadia',
    'Wellspring Health of Cascadia',
  ];

  const facilities = useMemo(() => {
    const fromData = employees.map((e) => e.facility).filter(Boolean);
    return [...new Set([...KNOWN_FACILITIES, ...fromData])].sort();
  }, [employees]);

  const filtered = employees
    .filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase());
      const matchFacility = facility === 'All' || e.facility === facility;
      return matchSearch && matchFacility;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  if (employees.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">No employees yet.</p>
        <Link
          to="/admin"
          className="text-cascadia-600 hover:text-cascadia-700 font-medium"
        >
          Add some in Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cascadia-900 mb-1">
          The Stars of Cascadia
        </h1>
        <p className="text-gray-500">
          Get to know your Cascadia Healthcare family &mdash; a Force for Good
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-cascadia-400 focus:border-transparent text-sm"
        />
        <select
          value={facility}
          onChange={(e) => setFacility(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-cascadia-400 focus:border-transparent text-sm"
        >
          <option value="All">All Facilities</option>
          {facilities.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => (
          <button
            key={emp.id}
            onClick={() => setSelected(emp)}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-cascadia-200 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <Avatar employee={emp} size="md" />
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {emp.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">{emp.role}</p>
                <FacilityBadge facility={emp.facility} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No employees match your search.
        </div>
      )}

      {selected && (
        <ProfileModal
          employee={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function ProfileModal({ employee, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            &times;
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <Avatar employee={employee} size="lg" />
            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              {employee.name}
            </h2>
            <p className="text-gray-500">{employee.role}</p>
            <FacilityBadge facility={employee.facility} />
          </div>

          <div className="space-y-4">
            {(employee.phone || employee.email || employee.dob) && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {employee.phone && (
                  <div>
                    <span className="text-gray-400">Phone: </span>
                    <a href={`tel:${employee.phone}`} className="text-cascadia-600 hover:underline">{employee.phone}</a>
                  </div>
                )}
                {employee.email && (
                  <div>
                    <span className="text-gray-400">Email: </span>
                    <a href={`mailto:${employee.email}`} className="text-cascadia-600 hover:underline">{employee.email}</a>
                  </div>
                )}
                {employee.dob && (
                  <div>
                    <span className="text-gray-400">Birthday: </span>
                    <span className="text-gray-600">{employee.dob}</span>
                  </div>
                )}
              </div>
            )}

            {employee.bio && (
              <div>
                <h3 className="text-sm font-semibold text-cascadia-700 uppercase tracking-wide mb-2">
                  About
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {employee.bio}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wide mb-2">
                Likes
              </h3>
              <div className="flex flex-wrap gap-2">
                {employee.likes.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-forest-50 text-forest-700 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
                Dislikes
              </h3>
              <div className="flex flex-wrap gap-2">
                {employee.dislikes.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
