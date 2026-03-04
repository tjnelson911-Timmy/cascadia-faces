import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Directory', icon: '👥' },
  { to: '/flashcards', label: 'Flashcards', icon: '🃏' },
  { to: '/lineup', label: 'Lineup', icon: '🔍' },
  { to: '/quiz', label: 'Quiz', icon: '❓' },
];

export default function Nav() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  // Hide nav on login page
  if (location.pathname === '/login') return null;
  if (!user) return null;

  return (
    <nav className="bg-cascadia-900 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-3 shrink-0">
            <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
              <circle cx="16" cy="16" r="16" fill="#14b8a6" />
              <text
                x="16"
                y="21"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                &#9733;
              </text>
            </svg>
            <div className="hidden sm:block">
              <span className="font-bold text-white text-sm leading-none block">
                The Stars of Cascadia
              </span>
              <span className="text-cascadia-300 text-xs">
                Cascadia Healthcare
              </span>
            </div>
          </NavLink>
          <div className="flex gap-1 items-center">
            {links.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cascadia-700 text-white'
                      : 'text-cascadia-200 hover:bg-cascadia-800 hover:text-white'
                  }`
                }
              >
                <span className="sm:hidden">{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
            <span className="w-px h-6 bg-cascadia-700 mx-1 hidden sm:block" />
            {isAdmin ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cascadia-700 text-white'
                      : 'text-cascadia-200 hover:bg-cascadia-800 hover:text-white'
                  }`
                }
              >
                <span className="sm:hidden">&#9881;</span>
                <span className="hidden sm:inline">Admin</span>
              </NavLink>
            ) : (
              <NavLink
                to="/my-profile"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cascadia-700 text-white'
                      : 'text-cascadia-200 hover:bg-cascadia-800 hover:text-white'
                  }`
                }
              >
                <span className="sm:hidden">👤</span>
                <span className="hidden sm:inline">My Profile</span>
              </NavLink>
            )}
            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg text-sm font-medium text-cascadia-300 hover:bg-cascadia-800 hover:text-white transition-colors"
              title={user.email}
            >
              <span className="sm:hidden">&#x2192;</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
