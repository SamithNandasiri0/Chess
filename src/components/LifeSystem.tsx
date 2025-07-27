
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const LifeSystem: React.FC = () => {
  const { lives, maxLives, lastLossTime, checkLifeRegeneration } = useGameStore();

  useEffect(() => {
    const interval = setInterval(checkLifeRegeneration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkLifeRegeneration]);

  const getTimeUntilNextLife = (): string => {
    if (!lastLossTime || lives >= maxLives) return '';
    
    const elapsed = Date.now() - lastLossTime;
    const regenTime = 30 * 60 * 1000; // 30 minutes
    const remaining = Math.max(0, regenTime - elapsed);
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: maxLives }, (_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Heart
              className={`w-8 h-8 transition-colors duration-300 ${
                index < lives
                  ? 'text-red-500 fill-red-500'
                  : 'text-gray-300 fill-gray-300'
              }`}
            />
          </motion.div>
        ))}
      </div>
      
      {lives < maxLives && lastLossTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 font-mono"
        >
          Next life in: {getTimeUntilNextLife()}
        </motion.div>
      )}
      
      <div className="text-lg font-bold text-gray-800">
        {lives}/{maxLives} Lives
      </div>
    </div>
  );
};
