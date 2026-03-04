const facilityColors = {
  'Shaw Mountain of Cascadia': 'bg-cascadia-100 text-cascadia-900',
  'Wellspring Health of Cascadia': 'bg-forest-100 text-forest-800',
  'Libby Care Center': 'bg-amber-100 text-amber-800',
};

export default function FacilityBadge({ facility }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${facilityColors[facility] || 'bg-gray-100 text-gray-800'}`}>
      {facility}
    </span>
  );
}
