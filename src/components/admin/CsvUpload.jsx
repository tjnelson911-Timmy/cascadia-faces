import { useState } from 'react';
import * as XLSX from 'xlsx';
import { parseCsv, csvRowToEmployee } from '../../utils/employeeUtils';

function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rows.map((row) => {
    // Normalize header keys to lowercase
    const normalized = {};
    for (const key of Object.keys(row)) {
      normalized[key.toLowerCase().trim()] = String(row[key]).trim();
    }
    return csvRowToEmployee(normalized);
  });
}

export default function CsvUpload({ onImport, onCancel }) {
  const [parsed, setParsed] = useState(null);
  const [mode, setMode] = useState('replace');
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);

  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const ext = file.name.split('.').pop().toLowerCase();
    const isExcel = ['xlsx', 'xls', 'xlsb'].includes(ext);

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const employees = parseExcel(data);
          if (employees.length === 0) {
            setError('No data rows found in the spreadsheet.');
            setParsed(null);
            return;
          }
          setParsed(employees);
          setError(null);
        } catch (err) {
          setError('Failed to parse Excel file: ' + err.message);
          setParsed(null);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const rows = parseCsv(event.target.result);
          if (rows.length === 0) {
            setError(
              'No data rows found. Make sure the file has a header row and at least one data row.'
            );
            setParsed(null);
            return;
          }
          setParsed(rows.map(csvRowToEmployee));
          setError(null);
        } catch (err) {
          setError('Failed to parse CSV: ' + err.message);
          setParsed(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFile = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Import Roster</h2>
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Accepted Formats
          </h3>
          <div className="flex gap-2 mb-3">
            <span className="px-2.5 py-1 bg-forest-50 text-forest-700 rounded-lg text-xs font-medium">
              .xlsx
            </span>
            <span className="px-2.5 py-1 bg-forest-50 text-forest-700 rounded-lg text-xs font-medium">
              .xls
            </span>
            <span className="px-2.5 py-1 bg-cascadia-50 text-cascadia-700 rounded-lg text-xs font-medium">
              .csv
            </span>
          </div>
          <code className="block bg-gray-50 rounded-lg p-3 text-xs text-gray-600 overflow-x-auto">
            name, facility, role, mobile number, date of birth, work email
          </code>
          <p className="text-xs text-gray-400 mt-2">
            Column headers should include at least <strong>name</strong>. Other
            recognized columns: facility, role (or title), mobile number (or
            phone), date of birth (or dob), work email (or email), bio, likes,
            dislikes.
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragOver
              ? 'border-cascadia-400 bg-cascadia-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <p className="text-gray-500 mb-3">
            Drag &amp; drop an Excel or CSV file here, or
          </p>
          <label className="px-4 py-2 bg-cascadia-600 text-white rounded-lg text-sm font-medium hover:bg-cascadia-700 transition-colors cursor-pointer">
            Choose File
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.xlsb,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFile}
              className="hidden"
            />
          </label>
          {fileName && (
            <p className="text-xs text-gray-400 mt-3">
              Loaded: {fileName}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {parsed && (
          <>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Preview ({parsed.length} employees)
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-3 py-2 font-medium text-gray-600">
                        Name
                      </th>
                      <th className="px-3 py-2 font-medium text-gray-600">
                        Facility
                      </th>
                      <th className="px-3 py-2 font-medium text-gray-600">
                        Role
                      </th>
                      <th className="px-3 py-2 font-medium text-gray-600">
                        Phone
                      </th>
                      <th className="px-3 py-2 font-medium text-gray-600">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsed.map((emp, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-gray-900">{emp.name}</td>
                        <td className="px-3 py-2 text-gray-500">
                          {emp.facility}
                        </td>
                        <td className="px-3 py-2 text-gray-500">{emp.role}</td>
                        <td className="px-3 py-2 text-gray-500">
                          {emp.phone}
                        </td>
                        <td className="px-3 py-2 text-gray-500">
                          {emp.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Import Mode
              </h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="replace"
                    checked={mode === 'replace'}
                    onChange={() => setMode('replace')}
                    className="accent-cascadia-600"
                  />
                  <span className="text-sm text-gray-700">
                    Replace all employees
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="append"
                    checked={mode === 'append'}
                    onChange={() => setMode('append')}
                    className="accent-cascadia-600"
                  />
                  <span className="text-sm text-gray-700">
                    Append to existing
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onImport(parsed, mode)}
                className="px-6 py-2.5 bg-cascadia-600 text-white rounded-lg font-medium hover:bg-cascadia-700 transition-colors"
              >
                Import {parsed.length} Employees
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
