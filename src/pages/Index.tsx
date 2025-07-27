
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Difficulty } from '../store/gameStore';
import { ChessBoard } from '../components/ChessBoard';
import { ChessBackground } from '../components/ChessBackground';
import { DifficultySelector } from '../components/DifficultySelector';
import { AdRewardModal } from '../components/AdRewardModal';
import { GameHUD } from '../components/GameHUD';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const {
    lives,
    score,
    gameState,
    difficulty,
    setGameState,
    setDifficulty,
    loseLife,
    addScore,
    checkLifeRegeneration
  } = useGameStore();

  const [showAdModal, setShowAdModal] = useState(false);

  useEffect(() => {
    checkLifeRegeneration();
    const interval = setInterval(checkLifeRegeneration, 60000);
    return () => clearInterval(interval);
  }, [checkLifeRegeneration]);

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    if (lives <= 0) {
      toast.error("No lives remaining! Watch an ad to continue.");
      setShowAdModal(true);
      return;
    }
    
    setDifficulty(selectedDifficulty);
    setGameState('playing');
    toast.success(`Starting ${selectedDifficulty} difficulty game!`);
  };

  const handleGameEnd = (result: 'win' | 'lose' | 'draw') => {
    const multipliers = { novice: 1, intermediate: 2, advanced: 3, grandmaster: 5 };
    const multiplier = multipliers[difficulty];

    if (result === 'win') {
      const points = 100 * multiplier;
      addScore(points);
      toast.success(`Victory! +${points} points`);
    } else if (result === 'lose') {
      loseLife();
      toast.error("Defeat! Lost a life");
    } else {
      addScore(25);
      toast("Draw! +25 points");
    }

    setGameState(lives > 1 || result !== 'lose' ? 'menu' : 'life-empty');
  };

  const handleHomeClick = () => {
    setGameState('menu');
  };

  const handleSettingsClick = () => {
    toast("Settings coming soon!");
  };

  return (
    <div className="min-h-screen relative">
      <ChessBackground />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* Main Menu */}
          {gameState === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center space-y-4">
                <motion.h1 
                  className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 100 }}
                >
                  ♔ Chess Master ♕
                </motion.h1>
                <motion.p 
                  className="text-xl text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Strategy Game with Life System
                </motion.p>
              </div>

              {/* Current Stats */}
              <motion.div 
                className="max-w-md mx-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <GameHUD onHomeClick={handleHomeClick} onSettingsClick={handleSettingsClick} />
              </motion.div>

              {/* Difficulty Selection */}
              <DifficultySelector onSelect={handleDifficultySelect} />

              {/* No Lives Warning */}
              {lives <= 0 && (
                <motion.div 
                  className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-6 text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3 className="text-lg font-bold text-red-700 mb-2">No Lives Remaining!</h3>
                  <p className="text-red-600 mb-4">Watch an ad or wait for life regeneration</p>
                  <Button 
                    onClick={() => setShowAdModal(true)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Watch Ad for Life
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Game Playing */}
          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="space-y-6"
            >
              <GameHUD onHomeClick={handleHomeClick} onSettingsClick={handleSettingsClick} />
              
              <div className="flex justify-center">
                <div className="max-w-2xl w-full">
                  <ChessBoard onGameEnd={handleGameEnd} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Life Empty State */}
          {gameState === 'life-empty' && (
            <motion.div
              key="life-empty"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-6"
            >
              <div className="text-center space-y-4">
                <motion.div 
                  className="text-8xl"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  💔
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-800">Out of Lives!</h2>
                <p className="text-xl text-gray-600 max-w-md">
                  You've run out of lives. Watch an ad to continue playing or wait for regeneration.
                </p>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowAdModal(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                  size="lg"
                >
                  Watch Ad for Life
                </Button>
                <Button 
                  onClick={handleHomeClick}
                  variant="outline"
                  size="lg"
                >
                  Back to Menu
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ad Modal */}
      <AdRewardModal 
        isOpen={showAdModal} 
        onClose={() => setShowAdModal(false)} 
      />
    </div>
  );
};

export default Index;
