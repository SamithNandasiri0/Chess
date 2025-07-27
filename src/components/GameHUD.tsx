
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Settings, Home } from 'lucide-react';
import { LifeSystem } from './LifeSystem';
import { useGameStore } from '../store/gameStore';

interface GameHUDProps {
  onHomeClick: () => void;
  onSettingsClick: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ onHomeClick, onSettingsClick }) => {
  const { score, difficulty } = useGameStore();

  const getDifficultyColor = (diff: string) => {
    const colors = {
      novice: 'text-green-600',
      intermediate: 'text-blue-600',
      advanced: 'text-purple-600',
      grandmaster: 'text-red-600'
    };
    return colors[diff as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-lg">
      <div className="flex items-center gap-6">
        <LifeSystem />
        
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <div className="text-lg font-bold text-gray-800">
            {score.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`font-bold capitalize ${getDifficultyColor(difficulty)}`}>
          {difficulty} Mode
        </div>
        
        <div className="flex gap-2">
          <motion.button
            onClick={onSettingsClick}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={onHomeClick}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Home className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
