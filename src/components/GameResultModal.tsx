
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameResultModalProps {
  isOpen: boolean;
  result: 'win' | 'lose' | 'draw';
  onClose: () => void;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  result,
  onClose,
  onPlayAgain,
  onHome
}) => {
  const getResultConfig = () => {
    switch (result) {
      case 'win':
        return {
          title: 'Victory! 🏆',
          subtitle: 'Checkmate! You won!',
          icon: '👑',
          gradient: 'from-yellow-400 via-orange-500 to-red-500',
          bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
          textColor: 'text-yellow-800',
          animation: { rotate: [0, -10, 10, -10, 0] }
        };
      case 'lose':
        return {
          title: 'Defeat 😔',
          subtitle: 'Checkmate! AI won this time.',
          icon: '💔',
          gradient: 'from-gray-600 via-gray-700 to-gray-800',
          bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
          textColor: 'text-gray-800',
          animation: { scale: [1, 0.9, 1] }
        };
      case 'draw':
        return {
          title: 'Draw 🤝',
          subtitle: 'Great game! It ended in a draw.',
          icon: '⚖️',
          gradient: 'from-blue-500 via-purple-500 to-indigo-600',
          bgColor: 'bg-gradient-to-br from-blue-50 to-purple-50',
          textColor: 'text-blue-800',
          animation: { y: [0, -10, 0] }
        };
      default:
        return {
          title: '',
          subtitle: '',
          icon: '',
          gradient: '',
          bgColor: '',
          textColor: '',
          animation: {}
        };
    }
  };

  const config = getResultConfig();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`${config.bgColor} rounded-3xl shadow-2xl p-8 text-center max-w-md w-full border border-white/20`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Result Icon */}
            <motion.div
              className="text-8xl mb-6"
              animate={config.animation}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              {config.icon}
            </motion.div>

            {/* Title */}
            <motion.h1
              className={`text-4xl font-bold mb-4 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {config.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className={`text-lg ${config.textColor} mb-8`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {config.subtitle}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={onPlayAgain}
                className={`bg-gradient-to-r ${config.gradient} text-white hover:shadow-lg transition-all duration-300`}
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              
              <Button
                onClick={onHome}
                variant="outline"
                size="lg"
                className="border-gray-300 hover:bg-gray-50"
              >
                <Home className="w-5 h-5 mr-2" />
                Home
              </Button>
            </motion.div>

            {/* Confetti for win */}
            {result === 'win' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded"
                    initial={{ 
                      x: Math.random() * 400,
                      y: -20,
                      rotate: 0,
                      scale: 0
                    }}
                    animate={{
                      y: 500,
                      rotate: 360,
                      scale: [0, 1, 0],
                      x: Math.random() * 400
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
