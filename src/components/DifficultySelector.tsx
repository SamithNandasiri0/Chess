
import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, Difficulty } from '../store/gameStore';

const difficultyData = {
  novice: {
    name: 'Novice',
    description: 'Perfect for beginners',
    icon: '♟',
    color: 'bg-green-500',
    multiplier: '1x'
  },
  intermediate: {
    name: 'Intermediate',
    description: 'For developing players',
    icon: '♞',
    color: 'bg-blue-500',
    multiplier: '2x'
  },
  advanced: {
    name: 'Advanced',
    description: 'Challenging gameplay',
    icon: '♝',
    color: 'bg-purple-500',
    multiplier: '3x'
  },
  grandmaster: {
    name: 'Grandmaster',
    description: 'Ultimate challenge',
    icon: '♚',
    color: 'bg-red-500',
    multiplier: '5x'
  }
};

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect }) => {
  const { difficulty } = useGameStore();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Challenge</h2>
        <p className="text-gray-600">Select difficulty level to begin your chess journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        {(Object.keys(difficultyData) as Difficulty[]).map((level) => {
          const data = difficultyData[level];
          const isSelected = difficulty === level;

          return (
            <motion.div
              key={level}
              className={`
                relative p-6 rounded-xl cursor-pointer border-2 transition-all duration-300
                ${isSelected 
                  ? 'border-amber-400 shadow-xl scale-105' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }
                bg-white
              `}
              onClick={() => onSelect(level)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Object.keys(difficultyData).indexOf(level) * 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${data.color} flex items-center justify-center text-3xl text-white`}>
                  {data.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-800">{data.name}</h3>
                    <span className="text-sm font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                      {data.multiplier}
                    </span>
                  </div>
                  <p className="text-gray-600">{data.description}</p>
                </div>
              </div>

              {isSelected && (
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <span className="text-white text-sm">✓</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
