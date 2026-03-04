import { useState, useEffect } from 'react';
import Avatar from '../Avatar';
import { deriveInitials, assignColor } from '../../utils/employeeUtils';

const COLOR_PALETTE = [
  '#0b7280', '#186e77', '#14b8a6', '#16a34a', '#15803d',
  '#7c3aed', '#4f46e5', '#0369a1', '#b45309', '#d97706',
  '#dc2626', '#e11d48',
];

function TagInput({ label, tags, onChange, placeholder }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
      />
      <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add</p>
    </div>
  );
}

function PhotoUpload({ photo, onChange }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 200;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        canvas.width = MAX;
        canvas.height = MAX;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, min, min, 0, 0, MAX, MAX);
        onChange(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Photo
      </label>
      <div className="flex items-center gap-4">
        {photo ? (
          <div className="relative">
            <img
              src={photo}
              alt="Employee"
              className="w-24 h-24 rounded-full object-cover shadow-md"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
            >
              &times;
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            No photo
          </div>
        )}
        <div>
          <label className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-400 mt-1">
            Auto-cropped to square, max 200x200
          </p>
        </div>
      </div>
    </div>
  );
}

const emptyForm = {
  name: '',
  facility: '',
  role: '',
  phone: '',
  dob: '',
  email: '',
  bio: '',
  likes: [],
  dislikes: [],
  initials: '',
  color: '#0b7280',
  photo: null,
};

export default function EmployeeForm({ employee, onSave, onCancel, onDone, mode = 'admin', showDoneMessage = false }) {
  const isSelf = mode === 'self';
  const isEditing = !!employee;
  const [form, setForm] = useState(employee || emptyForm);
  const [autoInitials, setAutoInitials] = useState(!isEditing);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (autoInitials && form.name) {
      setForm((f) => ({ ...f, initials: deriveInitials(f.name) }));
    }
  }, [form.name, autoInitials]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isSelf && (!form.name.trim() || !form.facility.trim() || !form.role.trim())) return;
    const data = {
      ...form,
      initials: form.initials || deriveInitials(form.name),
      color: form.color || assignColor(form.name),
    };
    onSave(data);
    if (showDoneMessage) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      onDone();
    }
  };

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {!isSelf && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <PhotoUpload photo={form.photo} onChange={(v) => update('photo', v)} />

        {!isSelf && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
                  placeholder="e.g. Maria Santos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role / Title *
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
                  placeholder="e.g. Registered Nurse"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility *
              </label>
              <input
                type="text"
                value={form.facility}
                onChange={(e) => update('facility', e.target.value)}
                required
                list="facilities"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
                placeholder="e.g. Shaw Mountain of Cascadia"
              />
              <datalist id="facilities">
                <option value="Cascadia Services" />
                <option value="Libby Care Center" />
                <option value="Shaw Mountain of Cascadia" />
                <option value="Wellspring Health of Cascadia" />
              </datalist>
            </div>
          </>
        )}

        {!isSelf && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={form.phone || ''}
                onChange={(e) => update('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
                placeholder="(208) 555-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dob || ''}
                onChange={(e) => update('dob', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Email
              </label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => update('email', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
                placeholder="name@cascadiahc.com"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400 resize-y"
            placeholder="A short bio about this person..."
          />
        </div>

        <TagInput
          label="Likes"
          tags={form.likes || []}
          onChange={(v) => update('likes', v)}
          placeholder="e.g. hiking, coffee, sushi"
        />

        <TagInput
          label="Dislikes"
          tags={form.dislikes || []}
          onChange={(v) => update('dislikes', v)}
          placeholder="e.g. cold weather, paperwork"
        />

        {!isSelf && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initials
              </label>
              <input
                type="text"
                value={form.initials}
                onChange={(e) => {
                  setAutoInitials(false);
                  update('initials', e.target.value.toUpperCase().slice(0, 3));
                }}
                maxLength={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-400"
                placeholder="Auto-computed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Auto-set from name. Edit to override.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar Color
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update('color', c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      form.color === c
                        ? 'border-gray-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Preview
          </p>
          <div className="flex items-center gap-4">
            <Avatar
              employee={{
                ...form,
                initials: form.initials || deriveInitials(form.name || '??'),
                color: form.color,
              }}
              size="md"
            />
            <div>
              <p className="font-medium text-gray-900">
                {form.name || 'Employee Name'}
              </p>
              <p className="text-sm text-gray-500">
                {form.role || 'Role'}
              </p>
              <p className="text-xs text-gray-400">
                {form.facility || 'Facility'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          type="submit"
          className="px-6 py-2.5 bg-cascadia-600 text-white rounded-lg font-medium hover:bg-cascadia-700 transition-colors"
        >
          {isSelf ? 'Save Profile' : isEditing ? 'Save Changes' : 'Add Employee'}
        </button>
        {!isSelf && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        {saved && (
          <span className="text-sm text-forest-600 font-medium">
            Saved!
          </span>
        )}
      </div>
    </form>
  );
}
