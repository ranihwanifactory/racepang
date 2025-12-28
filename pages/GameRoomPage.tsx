
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, set, update, get, remove } from 'firebase/database';
import { auth, database } from '../firebase';
import { Room, Player, CarType } from '../types';
import Car from '../components/Car';
import { Share2, ArrowLeft, Send } from 'lucide-react';

const GameRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sound effects
  const playSound = (type: 'click' | 'start' | 'win') => {
    const urls = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      start: 'https://assets.mixkit.co/active_storage/sfx/2016/2016-preview.mp3',
      win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'
    };
    const audio = new Audio(urls[type]);
    audio.play().catch(e => console.log('Sound error', e));
  };

  useEffect(() => {
    if (!roomId || !auth.currentUser) return;

    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        navigate('/');
        return;
      }
      setRoom({ ...data, id: roomId });
      
      const currentPlayer = data.players?.[auth.currentUser!.uid];
      if (currentPlayer) {
        setLocalPlayer(currentPlayer);
      } else if (data.status === 'waiting' && Object.keys(data.players || {}).length < 5) {
        // Join if not already in players
        const joinPlayer: Player = {
          uid: auth.currentUser!.uid,
          name: auth.currentUser!.displayName || '이름없음',
          car: 'red',
          progress: 0,
          isReady: false
        };
        update(ref(database, `rooms/${roomId}/players`), {
          [auth.currentUser!.uid]: joinPlayer
        });
      }
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

  const selectCar = (carType: CarType) => {
    if (!roomId || !auth.currentUser) return;
    playSound('click');
    update(ref(database, `rooms/${roomId}/players/${auth.currentUser.uid}`), { car: carType });
  };

  const toggleReady = () => {
    if (!roomId || !auth.currentUser || !localPlayer) return;
    playSound('click');
    update(ref(database, `rooms/${roomId}/players/${auth.currentUser.uid}`), { isReady: !localPlayer.isReady });
  };

  const startRace = async () => {
    if (!roomId) return;
    // Fixed: cast Object.values to Player[] to resolve 'unknown' type errors
    const playersArr = Object.values(room?.players || {}) as Player[];
    if (playersArr.length < 2) {
      alert('최소 2명이 있어야 시작할 수 있어요!');
      return;
    }
    const allReady = playersArr.every(p => p.isReady);
    if (!allReady) {
      alert('모든 선수가 준비완료 상태여야 해요!');
      return;
    }

    playSound('start');
    await update(ref(database, `rooms/${roomId}`), { status: 'racing', startTime: Date.now() });
  };

  const handleTap = () => {
    if (!roomId || !auth.currentUser || !room || room.status !== 'racing') return;
    
    const newProgress = Math.min((localPlayer?.progress || 0) + 2, 100);
    
    // Check for win locally for immediate feedback
    if (newProgress >= 100 && room.status === 'racing') {
      playSound('win');
      finishRace(auth.currentUser.uid);
    }

    update(ref(database, `rooms/${roomId}/players/${auth.currentUser.uid}`), { progress: newProgress });
  };

  const finishRace = async (winnerUid: string) => {
    if (!roomId || !room) return;
    const winner = room.players[winnerUid];
    
    await update(ref(database, `rooms/${roomId}`), { 
      status: 'finished', 
      winnerName: winner.name 
    });

    // Update global stats
    // Fixed: cast Object.values to Player[] to resolve 'unknown' type errors
    const playersArr = Object.values(room.players) as Player[];
    for (const p of playersArr) {
      const statsRef = ref(database, `stats/${p.uid}`);
      const statsSnap = await get(statsRef);
      const currentStats = statsSnap.val() || { wins: 0, totalGames: 0, name: p.name };
      
      const newWins = p.uid === winnerUid ? currentStats.wins + 1 : currentStats.wins;
      const newTotal = currentStats.totalGames + 1;
      
      await set(statsRef, {
        ...currentStats,
        wins: newWins,
        totalGames: newTotal,
        winRate: Math.round((newWins / newTotal) * 100)
      });
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#/room/${roomId}`;
    navigator.clipboard.writeText(link);
    alert('초대 링크가 복사되었습니다! 친구에게 보내보세요.');
  };

  if (!room || !localPlayer) return null;

  // Fixed: cast Object.values to Player[] to resolve 'unknown' type errors in the rest of the file
  const players = Object.values(room.players) as Player[];

  return (
    <div className="flex flex-col h-full bg-blue-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-4 border-b-2 border-blue-100 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-gray-500 flex items-center gap-1">
          <ArrowLeft size={20} /> 나가기
        </button>
        <div className="text-center">
          <h2 className="font-bold text-lg text-blue-600">
            {room.status === 'waiting' && '대기 중...'}
            {room.status === 'racing' && '달려 달려! 🏃💨'}
            {room.status === 'finished' && '경기 종료! 🎉'}
          </h2>
        </div>
        <button onClick={copyInviteLink} className="text-blue-500 bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1 font-bold">
          <Share2 size={16} /> 초대
        </button>
      </div>

      <div className="flex-1 p-4 relative overflow-y-auto">
        {room.status === 'waiting' ? (
          <div className="flex flex-col gap-6 items-center">
            {/* Car Selection */}
            <div className="w-full bg-white p-6 rounded-3xl shadow-lg border-2 border-yellow-200">
              <h3 className="text-center font-bold text-yellow-600 mb-4 text-xl">내 자동차 고르기</h3>
              <div className="flex justify-around gap-2">
                {(['red', 'blue', 'yellow', 'green', 'pink'] as CarType[]).map(type => (
                  <button 
                    key={type}
                    onClick={() => selectCar(type)}
                    className={`p-4 rounded-2xl transition-all ${localPlayer.car === type ? 'bg-yellow-100 ring-4 ring-yellow-400 scale-110' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <Car type={type} size="md" />
                  </button>
                ))}
              </div>
            </div>

            {/* Players List */}
            <div className="w-full space-y-3">
              <h3 className="font-bold text-gray-700 ml-2">참가 선수 ({players.length}/5)</h3>
              {players.map(p => (
                <div key={p.uid} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <Car type={p.car} size="sm" />
                    <span className="font-bold text-gray-800">{p.name} {p.uid === auth.currentUser?.uid && '(나)'}</span>
                  </div>
                  <div className={`px-4 py-1 rounded-full text-sm font-bold ${p.isReady ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {p.isReady ? '준비완료!' : '준비 중...'}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="w-full mt-4 space-y-4">
              <button 
                onClick={toggleReady}
                className={`w-full py-4 rounded-2xl text-2xl font-bold border-b-8 transition-all active:translate-y-2 active:border-b-0 ${
                  localPlayer.isReady 
                    ? 'bg-red-400 border-red-600 text-white' 
                    : 'bg-green-400 border-green-600 text-white'
                }`}
              >
                {localPlayer.isReady ? '준비 취소 ✋' : '나도 준비! 👍'}
              </button>

              {room.creatorId === auth.currentUser?.uid && (
                <button 
                  onClick={startRace}
                  className="w-full bg-yellow-400 border-yellow-600 border-b-8 text-white py-4 rounded-2xl text-2xl font-bold active:translate-y-2 active:border-b-0"
                >
                  경기 시작! 🏁
                </button>
              )}
            </div>
          </div>
        ) : room.status === 'racing' ? (
          <div className="h-full flex flex-col">
            {/* Track */}
            <div className="flex-1 bg-gray-100 rounded-3xl p-4 flex flex-col justify-around gap-4 relative overflow-hidden">
               {/* Finish Line UI */}
               <div className="absolute right-12 top-0 bottom-0 w-2 bg-white flex flex-col border-x-2 border-gray-300">
                  {Array.from({length: 20}).map((_, i) => (
                    <div key={i} className={`h-4 w-full ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`}></div>
                  ))}
               </div>

              {players.map(p => (
                <div key={p.uid} className="relative h-16 w-full flex items-center border-b border-gray-200">
                  <div 
                    className="absolute transition-all duration-300 ease-out flex items-center gap-2"
                    style={{ left: `${p.progress * 0.8}%` }}
                  >
                    <div className="bg-white/80 px-2 py-1 rounded-lg text-xs font-bold border border-gray-200 -mt-10 whitespace-nowrap">
                      {p.name}
                    </div>
                    <Car type={p.car} size="md" />
                  </div>
                </div>
              ))}
            </div>

            {/* Tap Area */}
            <div className="h-64 mt-4 relative">
              <button 
                onMouseDown={handleTap}
                className="w-full h-full bg-yellow-400 active:bg-yellow-500 rounded-3xl border-b-[12px] border-yellow-600 active:border-b-0 active:translate-y-2 transition-all shadow-xl flex flex-col items-center justify-center gap-4 group"
              >
                <div className="text-6xl group-active:scale-125 transition-transform">🔥</div>
                <div className="text-3xl font-black text-white drop-shadow-lg">빨리 터치하세요!!!</div>
                <div className="text-white opacity-80 text-lg">파바바박!! 파바바박!!</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 bg-white rounded-3xl shadow-xl border-4 border-yellow-400">
            <h2 className="text-4xl font-bold text-yellow-600 mb-2">경기 결과!</h2>
            <div className="text-8xl mb-6">🏆</div>
            <p className="text-3xl font-bold text-blue-600 mb-8">
              <span className="text-yellow-500">[{room.winnerName}]</span> 님이 우승했어요!
            </p>
            
            <div className="w-full space-y-4 mb-8">
              {players.sort((a,b) => b.progress - a.progress).map((p, idx) => (
                <div key={p.uid} className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-blue-400">#{idx + 1}</span>
                    <Car type={p.car} size="sm" />
                    <span className="font-bold">{p.name}</span>
                  </div>
                  <span className="text-gray-500">{p.progress}% 완주</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/')}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white py-4 rounded-2xl text-2xl font-bold border-b-8 border-blue-600 active:translate-y-1 active:border-b-0"
            >
              대기실로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoomPage;
