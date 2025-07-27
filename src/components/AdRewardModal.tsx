
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Heart } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface AdRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdRewardModal: React.FC<AdRewardModalProps> = ({ isOpen, onClose }) => {
  const [adState, setAdState] = useState<'preview' | 'playing' | 'completed'>('preview');
  const [countdown, setCountdown] = useState(5);
  const { watchAd, canWatchAd } = useGameStore();

  useEffect(() => {
    if (adState === 'playing' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (adState === 'playing' && countdown === 0) {
      setAdState('completed');
    }
  }, [adState, countdown]);

  const handleWatchAd = () => {
    setAdState('playing');
    setCountdown(5);
  };

  const handleClaimReward = () => {
    watchAd();
    setAdState('preview');
    setCountdown(5);
    onClose();
  };

  const handleSkip = () => {
    if (countdown === 0) {
      setAdState('completed');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Get a Life!</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {adState === 'preview' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full mx-auto flex items-center justify-center">
                <Heart className="w-10 h-10 text-white fill-white" />
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-600">Watch a short ad to get an extra life!</p>
                <p className="text-sm text-gray-500">
                  {canWatchAd() ? 'Ad available now' : 'Ad cooldown active'}
                </p>
              </div>

              <motion.button
                onClick={handleWatchAd}
                disabled={!canWatchAd()}
                className={`
                  w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2
                  ${canWatchAd() 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                  }
                  transition-all duration-200
                `}
                whileHover={canWatchAd() ? { scale: 1.02 } : {}}
                whileTap={canWatchAd() ? { scale: 0.98 } : {}}
              >
                <Play className="w-5 h-5" />
                {canWatchAd() ? 'Watch Ad' : 'Ad on Cooldown'}
              </motion.button>
            </div>
          )}

          {adState === 'playing' && (
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-full h-48 bg-gray-800 rounded-lg flex flex-col items-center justify-center text-white">
                  <div className="text-4xl mb-4">📺</div>
                  <div className="text-lg font-bold">Mock Advertisement</div>
                  <div className="text-sm opacity-75">This is a simulated ad</div>
                </div>
                
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {countdown}s
                </div>
              </div>

              <motion.button
                onClick={handleSkip}
                className={`
                  px-6 py-2 rounded-lg text-sm transition-all duration-200
                  ${countdown === 0 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
                disabled={countdown > 0}
                whileHover={countdown === 0 ? { scale: 1.05 } : {}}
              >
                {countdown === 0 ? 'Skip Ad' : `Skip in ${countdown}s`}
              </motion.button>
            </div>
          )}

          {adState === 'completed' && (
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center"
              >
                <Heart className="w-10 h-10 text-white fill-white" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800">Reward Earned!</h3>
                <p className="text-gray-600">You've earned one extra life</p>
              </div>

              <motion.button
                onClick={handleClaimReward}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Claim Life
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
