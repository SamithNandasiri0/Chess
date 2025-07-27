
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Difficulty = 'novice' | 'intermediate' | 'advanced' | 'grandmaster';
export type GameState = 'menu' | 'playing' | 'game-over' | 'life-empty' | 'settings';

interface GameStore {
  lives: number;
  maxLives: number;
  score: number;
  difficulty: Difficulty;
  gameState: GameState;
  lastLossTime: number | null;
  adCooldown: number;
  
  // Actions
  loseLife: () => void;
  gainLife: () => void;
  addScore: (points: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setGameState: (state: GameState) => void;
  checkLifeRegeneration: () => void;
  canWatchAd: () => boolean;
  watchAd: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      lives: 5,
      maxLives: 5,
      score: 0,
      difficulty: 'novice',
      gameState: 'menu',
      lastLossTime: null,
      adCooldown: 0,

      loseLife: () => set((state) => ({
        lives: Math.max(0, state.lives - 1),
        lastLossTime: Date.now(),
        gameState: state.lives <= 1 ? 'life-empty' : state.gameState
      })),

      gainLife: () => set((state) => ({
        lives: Math.min(state.maxLives, state.lives + 1)
      })),

      addScore: (points) => set((state) => ({
        score: state.score + points
      })),

      setDifficulty: (difficulty) => set({ difficulty }),
      
      setGameState: (gameState) => set({ gameState }),

      checkLifeRegeneration: () => {
        const state = get();
        if (state.lives < state.maxLives && state.lastLossTime) {
          const elapsed = Date.now() - state.lastLossTime;
          const regenTime = 30 * 60 * 1000; // 30 minutes
          
          if (elapsed >= regenTime) {
            set({
              lives: Math.min(state.maxLives, state.lives + 1),
              lastLossTime: state.lives + 1 >= state.maxLives ? null : state.lastLossTime
            });
          }
        }
      },

      canWatchAd: () => {
        const state = get();
        return state.lives < state.maxLives && Date.now() > state.adCooldown;
      },

      watchAd: () => {
        const state = get();
        if (state.canWatchAd()) {
          set({
            lives: Math.min(state.maxLives, state.lives + 1),
            adCooldown: Date.now() + 5 * 60 * 1000, // 5 minute cooldown
            gameState: state.lives + 1 > 0 ? 'menu' : state.gameState
          });
        }
      }
    }),
    {
      name: 'chess-game-storage'
    }
  )
);
