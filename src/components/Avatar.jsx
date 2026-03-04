export default function Avatar({ employee, size = 'md' }) {
  const sizes = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-xl',
    lg: 'w-32 h-32 text-4xl',
    xl: 'w-40 h-40 text-5xl',
  };

  if (employee.photo) {
    return (
      <img
        src={employee.photo}
        alt={employee.name}
        className={`${sizes[size]} rounded-full object-cover shrink-0 shadow-md`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-md`}
      style={{ backgroundColor: employee.color }}
    >
      {employee.initials}
    </div>
  );
}
