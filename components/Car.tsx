
import React from 'react';
import { CarType } from '../types';

interface CarProps {
  type: CarType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isAnimated?: boolean;
}

const Car: React.FC<CarProps> = ({ type, size = 'md', className = '', isAnimated = false }) => {
  const carIcons: Record<CarType, string> = {
    red_race: '🏎️',
    blue_suv: '🚙',
    yellow_taxi: '🚕',
    green_tractor: '🚜',
    pink_ufo: '🛸',
    police: '🚓',
    ambulance: '🚑',
    firetruck: '🚒',
    monster_truck: '🚚',
    bus: '🚌',
    sport_white: '⚪',
    delivery_van: '📦',
    kart: '🏁',
    classic_blue: '💎',
  };

  // Improved visuals using layered emojis or specific mappings
  const carVisuals: Record<CarType, React.ReactNode> = {
    red_race: <span>🏎️</span>,
    blue_suv: <span>🚙</span>,
    yellow_taxi: <span>🚕</span>,
    green_tractor: <span>🚜</span>,
    pink_ufo: <span>🛸</span>,
    police: <span>🚓</span>,
    ambulance: <span>🚑</span>,
    firetruck: <span>🚒</span>,
    monster_truck: <span>🚛</span>,
    bus: <span>🚌</span>,
    sport_white: <span className="relative">🏎️<span className="absolute -top-1 -right-1 text-[10px]">⚪</span></span>,
    delivery_van: <span>🚚</span>,
    kart: <span className="relative">🏎️<span className="absolute -top-1 -right-1 text-[10px]">⭐</span></span>,
    classic_blue: <span>🚗</span>,
  };

  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  return (
    <div className={`${sizes[size]} ${isAnimated ? 'animate-bounce-slow' : ''} ${className} flex flex-col items-center justify-center`}>
      <div className="drop-shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer">
        {carVisuals[type]}
      </div>
    </div>
  );
};

export default Car;
