
import React, { useState, useEffect } from 'react';
import { ref, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import { database } from '../firebase';
import { UserStats } from '../types';
import { Trophy, Medal, Star } from 'lucide-react';

const LeaderboardPage: React.FC = () => {
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const statsRef = ref(database, 'stats');
    const q = query(statsRef, orderByChild('winRate'), limitToLast(10));
    
    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const statsList = Object.keys(data).map(key => ({
          ...data[key],
          uid: key
        }));
        // Since limitToLast gives us ascending order, we reverse it
        setStats(statsList.sort((a, b) => b.winRate - a.winRate));
      } else {
        setStats([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 h-full bg-gradient-to-b from-yellow-50 to-orange-100">
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
          <Trophy size={48} className="text-yellow-500" />
        </div>
        <h2 className="text-4xl font-bold text-yellow-700">전설의 레이서</h2>
        <p className="text-yellow-600 font-medium italic">누가 최고의 터치 실력을 가지고 있을까요?</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-yellow-200">
        <div className="bg-yellow-400 p-4 text-white font-bold flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="w-8">순위</span>
            <span>선수 이름</span>
          </div>
          <div className="flex items-center gap-12 mr-4">
            <span>승률</span>
            <span>승리</span>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 italic">랭킹 집계 중...</div>
        ) : stats.length === 0 ? (
          <div className="p-10 text-center text-gray-400 italic">아직 등록된 기록이 없어요!</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.map((stat, index) => (
              <div key={stat.uid} className={`p-4 flex items-center justify-between transition-colors ${index === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-8">
                  <div className="w-8 flex justify-center">
                    {index === 0 && <Medal className="text-yellow-500" />}
                    {index === 1 && <Medal className="text-gray-400" />}
                    {index === 2 && <Medal className="text-orange-400" />}
                    {index > 2 && <span className="font-bold text-gray-400">{index + 1}</span>}
                  </div>
                  <span className={`font-bold ${index === 0 ? 'text-2xl text-yellow-700' : 'text-lg text-gray-700'}`}>
                    {stat.name}
                  </span>
                </div>
                <div className="flex items-center gap-12 font-bold">
                  <span className="text-blue-500 w-12 text-right">{stat.winRate}%</span>
                  <span className="text-gray-400 w-12 text-right">{stat.wins}승</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-yellow-100 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-500"><Star size={20} /></div>
          <p className="text-xs text-gray-500">실시간 대결을 통해 승점을 획득하세요!</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-yellow-100 flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg text-pink-500"><Star size={20} /></div>
          <p className="text-xs text-gray-500">승률은 최소 5경기 이상 참여해야 정확해요!</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
