export default function ScoreBadge({ correct, total, label = 'Score' }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const color =
    pct >= 80 ? 'text-forest-600 bg-forest-50 border-forest-200'
    : pct >= 50 ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
    : 'text-red-600 bg-red-50 border-red-200';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${color}`}>
      <span>{label}:</span>
      <span>{correct}/{total}</span>
      {total > 0 && <span className="opacity-70">({pct}%)</span>}
    </div>
  );
}
