import { Link } from 'react-router-dom';
import LeaderboardView from '../components/LeaderboardView.jsx';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Leaderboard</h1>
        </div>
        <LeaderboardView />
      </div>
    </div>
  );
}
