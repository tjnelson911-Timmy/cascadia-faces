const PALETTE = [
  '#0b7280', '#16a34a', '#7c3aed', '#b45309',
  '#dc2626', '#186e77', '#0369a1', '#c026d3',
  '#059669', '#d97706', '#4f46e5', '#e11d48',
];

export function deriveInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function assignColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function generatePlaceholderPhoto(initials, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="${color}"/>
    <text x="100" y="115" text-anchor="middle" fill="white" font-size="80" font-family="system-ui">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function parseCsv(text) {
  const rows = [];
  let fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current || fields.length) {
        fields.push(current);
        rows.push(fields);
        fields = [];
        current = '';
      }
      if (ch === '\r' && text[i + 1] === '\n') i++;
    } else {
      current += ch;
    }
  }
  if (current || fields.length) {
    fields.push(current);
    rows.push(fields);
  }

  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (row[i] || '').trim();
    });
    return obj;
  });
}

// Convert "Last, First" or "Last, First Middle" to "First Last" / "First Middle Last"
export function normalizeName(raw) {
  const trimmed = (raw || '').trim();
  if (trimmed.includes(',')) {
    const [last, ...rest] = trimmed.split(',');
    const first = rest.join(',').trim();
    if (first && last.trim()) return `${first} ${last.trim()}`;
  }
  return trimmed;
}

export function csvRowToEmployee(row) {
  const name = normalizeName(row.name);
  const initials = deriveInitials(name);
  const color = assignColor(name);
  return {
    name,
    facility: row.facility || row.location || row.site || '',
    role: row.role || row.title || '',
    phone: row.phone || row['mobile number'] || row.mobile || '',
    dob: row.dob || row['date of birth'] || row.birthday || '',
    email: row.email || row['work email'] || '',
    bio: row.bio || '',
    likes: row.likes
      ? row.likes.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    dislikes: row.dislikes
      ? row.dislikes.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    initials,
    color,
    photo: null,
  };
}
