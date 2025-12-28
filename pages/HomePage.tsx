
import React from 'react';
import { Link } from 'react-router-dom';
import Car from '../components/Car';

const HomePage: React.FC = () => {
  return (
    <div className="p-6 text-center h-full flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-blue-50 to-blue-200">
      <div className="relative">
        <div className="absolute -top-10 -left-10 animate-bounce">🎈</div>
        <div className="absolute -top-10 -right-10 animate-bounce delay-100">✨</div>
        <h1 className="text-5xl font-bold text-blue-600 mb-2 drop-shadow-xl">슈퍼 태피 레이싱!</h1>
        <p className="text-xl text-blue-800 font-medium">손가락으로 달리는 세상에서 가장 귀여운 경주!</p>
      </div>

      <div className="flex gap-4 justify-center items-end py-8">
        <Car type="red" size="lg" isAnimated />
        <Car type="yellow" size="md" className="opacity-80" isAnimated />
        <Car type="blue" size="md" className="opacity-80" isAnimated />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link 
          to="/login" 
          className="bg-yellow-400 hover:bg-yellow-500 text-white text-2xl py-4 rounded-2xl border-b-8 border-yellow-600 active:border-b-0 active:translate-y-2 transition-all font-bold"
        >
          게임 시작하기 🏁
        </Link>
        <Link 
          to="/leaderboard" 
          className="bg-white hover:bg-gray-100 text-blue-500 text-xl py-3 rounded-2xl border-b-8 border-gray-300 active:border-b-0 active:translate-y-2 transition-all font-bold"
        >
          명예의 전당 🏆
        </Link>
      </div>

      <div className="mt-8 p-4 bg-white/50 rounded-xl text-blue-700 text-sm italic">
        "친구들과 실시간으로 터치 대결을 벌여보세요!"
      </div>
    </div>
  );
};

export default HomePage;
