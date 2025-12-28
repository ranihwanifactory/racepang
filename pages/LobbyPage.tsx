
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, set, onValue, get } from 'firebase/database';
import { auth, database } from '../firebase';
import { Plus, Info } from 'lucide-react';
import { Room, Player } from '../types';

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // 초등학생들이 읽기 쉽도록 혼동되는 문자(I, 1, O, 0)를 제외한 4글자 코드 생성
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  useEffect(() => {
    const roomsRef = ref(database, 'rooms');
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomList = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })).filter(room => (room as Room).status !== 'finished') as Room[];
        setRooms(roomList);
      } else {
        setRooms([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const createRoom = async () => {
    const user = auth.currentUser;
    if (!user) return;

    let roomId = generateRoomCode();
    
    // 중복 확인 (간단하게 1회 확인)
    const existingRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(existingRef);
    if (snapshot.exists()) {
      roomId = generateRoomCode(); // 중복 시 한 번 더 생성
    }

    const initialRoom: Partial<Room> = {
      creatorId: user.uid,
      status: 'waiting',
      players: {
        [user.uid]: {
          uid: user.uid,
          name: user.displayName || '이름없음',
          car: 'red_race',
          progress: 0,
          isReady: false
        }
      }
    };

    await set(ref(database, `rooms/${roomId}`), initialRoom);
    navigate(`/room/${roomId}`);
  };

  const joinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="p-6 h-full bg-blue-50">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-blue-600">레이싱 대기실</h2>
        <button 
          onClick={createRoom}
          className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 border-b-4 border-green-600 active:translate-y-1 active:border-b-0 transition-all font-bold"
        >
          <Plus size={20} /> 방 만들기
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <p className="text-center text-blue-400 py-10">방 목록 불러오는 중...</p>
        ) : rooms.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border-2 border-dashed border-blue-200">
            <p className="text-gray-500 mb-4">현재 열린 방이 없어요.</p>
            <p className="text-blue-500 font-bold">새로운 방을 만들어 친구들을 초대해보세요! 🚀</p>
          </div>
        ) : (
          rooms.map(room => (
            <div key={room.id} className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-blue-200 flex items-center justify-between hover:scale-[1.02] transition-transform">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  🏎️ {room.players ? (Object.values(room.players) as Player[])[0]?.name : '비공개'}의 레이싱룸
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold border border-yellow-200">
                    코드: {room.id}
                  </span>
                  <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-lg">
                    {Object.keys(room.players || {}).length}명 대기중
                  </span>
                </div>
              </div>
              <button 
                onClick={() => joinRoom(room.id)}
                disabled={room.status === 'racing'}
                className={`px-6 py-2 rounded-xl font-bold border-b-4 transition-all ${
                  room.status === 'waiting' 
                    ? 'bg-blue-400 text-white border-blue-600 hover:bg-blue-500 active:translate-y-1 active:border-b-0' 
                    : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                }`}
              >
                {room.status === 'waiting' ? '입장하기' : '경기 중'}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 bg-white/60 p-4 rounded-xl flex items-start gap-3">
        <Info className="text-blue-500 flex-shrink-0" size={20} />
        <p className="text-sm text-blue-700">
          초대 링크를 친구에게 공유하거나, 4글자 코드를 알려주면 바로 게임에 들어올 수 있어요!
        </p>
      </div>
    </div>
  );
};

export default LobbyPage;
