
import React from 'react';
import { CarType } from '../types';

interface CarProps {
  type: CarType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isAnimated?: boolean;
}

const Car: React.FC<CarProps> = ({ type, size = 'md', className = '', isAnimated = false }) => {
  const colors: Record<CarType, string> = {
    red: '🔴',
    blue: '🔵',
    yellow: '🟡',
    green: '🟢',
    pink: '💖',
  };

  const carIcons: Record<CarType, string> = {
    red: '🏎️',
    blue: '🚙',
    yellow: '🚖',
    green: '🚜',
    pink: '🛸',
  };

  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  return (
    <div className={`${sizes[size]} ${isAnimated ? 'animate-bounce-slow' : ''} ${className} flex flex-col items-center justify-center`}>
      <div className="drop-shadow-lg">{carIcons[type]}</div>
    </div>
  );
};

export default Car;
