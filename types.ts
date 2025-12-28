
export type CarType = 
  | 'red_race' | 'blue_suv' | 'yellow_taxi' | 'green_tractor' | 'pink_ufo' 
  | 'police' | 'ambulance' | 'firetruck' | 'monster_truck' | 'bus' 
  | 'sport_white' | 'delivery_van' | 'kart' | 'classic_blue';

export interface Player {
  uid: string;
  name: string;
  car: CarType;
  progress: number;
  isReady: boolean;
  isWinner?: boolean;
}

export type RoomStatus = 'waiting' | 'racing' | 'finished';

export interface Room {
  id: string;
  creatorId: string;
  status: RoomStatus;
  players: Record<string, Player>;
  startTime?: number;
  winnerName?: string;
}

export interface UserStats {
  uid: string;
  name: string;
  wins: number;
  totalGames: number;
  winRate: number;
}
