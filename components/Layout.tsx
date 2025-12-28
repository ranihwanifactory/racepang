
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Trophy, Home, LogOut, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto shadow-2xl bg-white border-x-4 border-yellow-400">
      <header className="bg-yellow-400 p-4 sticky top-0 z-50 flex items-center justify-between border-b-4 border-yellow-500">
        <Link to="/" className="text-2xl font-bold text-white drop-shadow-md flex items-center gap-2">
          <span>🏎️</span> 슈퍼 태피 레이싱
        </Link>
        <div className="flex gap-4">
          <Link to="/leaderboard" className="p-2 bg-white rounded-full text-yellow-500 hover:scale-110 transition-transform">
            <Trophy size={20} />
          </Link>
          {user ? (
            <button onClick={handleLogout} className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform">
              <LogOut size={20} />
            </button>
          ) : (
            <Link to="/login" className="p-2 bg-white rounded-full text-blue-500 hover:scale-110 transition-transform">
              <UserIcon size={20} />
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>

      <footer className="bg-green-100 p-4 text-center text-sm text-green-700 border-t-2 border-green-200">
        &copy; 2024 Super Tappy Racing - 친구들과 함께 달려요!
      </footer>
    </div>
  );
};

export default Layout;
