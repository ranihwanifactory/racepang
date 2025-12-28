
import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Mail, Lock, User } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        // User profile update could be added here if needed
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col justify-center items-center bg-yellow-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border-4 border-yellow-400">
        <h2 className="text-3xl font-bold text-yellow-600 mb-6 text-center">
          {isSignUp ? '선수 등록하기' : '로그인'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" placeholder="이름 (닉네임)" value={name} onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl transition-colors border-b-4 border-yellow-600"
          >
            {isSignUp ? '가입 완료' : '로그인 하기'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4 text-gray-400">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span>또는</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mb-4"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="google" />
          구글로 계속하기
        </button>

        <p className="text-center text-gray-600">
          {isSignUp ? '이미 계정이 있나요?' : '처음 오셨나요?'}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-yellow-600 font-bold underline"
          >
            {isSignUp ? '로그인' : '가입하기'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
