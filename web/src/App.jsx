import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import GamePage from './pages/GamePage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function NavBar() {
  const location = useLocation();
  const isGame = location.pathname === '/';

  // Hide nav on game page when playing (to save space)
  if (isGame) return null;

  return null;
}

function BottomNav() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Play', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { to: '/leaderboard', label: 'Rankings', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { to: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {links.map(link => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`
                flex flex-col items-center py-2 px-4 text-[10px] font-medium transition-colors
                ${active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="pb-16">
        <NavBar />
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
