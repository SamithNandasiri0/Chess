import React, { useState, useCallback, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { GameResultModal } from './GameResultModal';
import { UndoRedoControls } from './UndoRedoControls';

const pieceSymbols: { [key: string]: string } = {
  'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
  'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
};

interface ChessBoardProps {
  onGameEnd: (result: 'win' | 'lose' | 'draw') => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ onGameEnd }) => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { difficulty } = useGameStore();

  // Human plays white, AI plays black
  const isPlayerTurn = game.turn() === 'w';
  const isAITurn = game.turn() === 'b';

  const getDifficultyConfig = (diff: string) => {
    const configs = {
      novice: { depth: 2, randomness: 0.4, thinkingTime: 800 },
      intermediate: { depth: 3, randomness: 0.2, thinkingTime: 1200 },
      advanced: { depth: 4, randomness: 0.05, thinkingTime: 1800 },
      grandmaster: { depth: 5, randomness: 0, thinkingTime: 2500 }
    };
    return configs[diff as keyof typeof configs] || configs.novice;
  };

  const evaluatePosition = (chess: Chess): number => {
    if (chess.isCheckmate()) {
      return chess.turn() === 'b' ? -10000 : 10000;
    }
    if (chess.isDraw()) return 0;

    let score = 0;
    const pieceValues = { p: 100, r: 500, n: 320, b: 330, q: 900, k: 20000 };
    
    const pawnTable = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5, 5, 10, 25, 25, 10, 5, 5],
      [0, 0, 0, 20, 20, 0, 0, 0],
      [5, -5, -10, 0, 0, -10, -5, 5],
      [5, 10, 10, -20, -20, 10, 10, 5],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ];

    const knightTable = [
      [-50, -40, -30, -30, -30, -30, -40, -50],
      [-40, -20, 0, 0, 0, 0, -20, -40],
      [-30, 0, 10, 15, 15, 10, 0, -30],
      [-30, 5, 15, 20, 20, 15, 5, -30],
      [-30, 0, 15, 20, 20, 15, 0, -30],
      [-30, 5, 10, 15, 15, 10, 5, -30],
      [-40, -20, 0, 5, 5, 0, -20, -40],
      [-50, -40, -30, -30, -30, -30, -40, -50]
    ];

    const board = chess.board();
    board.forEach((row, rowIndex) => {
      row.forEach((square, colIndex) => {
        if (square) {
          const value = pieceValues[square.type as keyof typeof pieceValues];
          let positionalValue = 0;

          if (square.type === 'p') {
            positionalValue = pawnTable[square.color === 'w' ? 7 - rowIndex : rowIndex][colIndex];
          } else if (square.type === 'n') {
            positionalValue = knightTable[square.color === 'w' ? 7 - rowIndex : rowIndex][colIndex];
          }

          const totalValue = value + positionalValue;
          score += square.color === 'b' ? totalValue : -totalValue;
        }
      });
    });

    const moves = chess.moves();
    score += chess.turn() === 'b' ? moves.length * 5 : -moves.length * 5;

    if (chess.inCheck()) {
      score += chess.turn() === 'b' ? -50 : 50;
    }

    return score;
  };

  const minimax = (chess: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number => {
    if (depth === 0 || chess.isGameOver()) {
      return evaluatePosition(chess);
    }

    const moves = chess.moves();
    
    if (maximizing) {
      let maxEvaluation = -Infinity;
      for (const move of moves) {
        const tempGame = new Chess(chess.fen());
        tempGame.move(move);
        const evaluation = minimax(tempGame, depth - 1, alpha, beta, false);
        maxEvaluation = Math.max(maxEvaluation, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEvaluation;
    } else {
      let minEvaluation = Infinity;
      for (const move of moves) {
        const tempGame = new Chess(chess.fen());
        tempGame.move(move);
        const evaluation = minimax(tempGame, depth - 1, alpha, beta, true);
        minEvaluation = Math.min(minEvaluation, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEvaluation;
    }
  };

  const addToHistory = (fen: string) => {
    const newHistory = moveHistory.slice(0, historyIndex + 1);
    newHistory.push(fen);
    setMoveHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const makeAIMove = useCallback(async () => {
    if (game.isGameOver() || game.turn() !== 'b') return;

    setIsThinking(true);
    const config = getDifficultyConfig(difficulty);

    await new Promise(resolve => setTimeout(resolve, config.thinkingTime));

    const moves = game.moves();
    if (moves.length === 0) {
      setIsThinking(false);
      return;
    }

    let selectedMove;
    
    if (Math.random() < config.randomness) {
      selectedMove = moves[Math.floor(Math.random() * moves.length)];
    } else {
      let bestMove = moves[0];
      let bestValue = -Infinity;

      for (const move of moves) {
        const tempGame = new Chess(game.fen());
        tempGame.move(move);
        const value = minimax(tempGame, config.depth - 1, -Infinity, Infinity, false);
        
        if (value > bestValue) {
          bestValue = value;
          bestMove = move;
        }
      }
      selectedMove = bestMove;
    }

    try {
      const newGame = new Chess(game.fen());
      newGame.move(selectedMove);
      setGame(newGame);
      addToHistory(newGame.fen());
      
      if (newGame.isGameOver()) {
        const result = newGame.isCheckmate() ? 'lose' : 'draw';
        setGameResult(result);
        setShowResultModal(true);
        onGameEnd(result);
      }
    } catch (error) {
      console.error('AI move error:', error);
    }

    setIsThinking(false);
  }, [game, difficulty, onGameEnd, moveHistory, historyIndex]);

  useEffect(() => {
    if (isAITurn && !game.isGameOver() && !isThinking) {
      const timer = setTimeout(makeAIMove, 500);
      return () => clearTimeout(timer);
    }
  }, [isAITurn, game, isThinking, makeAIMove]);

  const handleSquareClick = (square: string) => {
    if (!isPlayerTurn || isThinking || game.isGameOver()) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    if (selectedSquare && possibleMoves.includes(square)) {
      try {
        const newGame = new Chess(game.fen());
        const move = newGame.move({
          from: selectedSquare as Square,
          to: square as Square,
          promotion: 'q'
        });

        if (move) {
          setGame(newGame);
          addToHistory(newGame.fen());
          setSelectedSquare(null);
          setPossibleMoves([]);

          if (newGame.isGameOver()) {
            const result = newGame.isCheckmate() ? 'win' : 'draw';
            setGameResult(result);
            setShowResultModal(true);
            onGameEnd(result);
          }
        }
      } catch (error) {
        console.error('Move error:', error);
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else {
      const piece = game.get(square as Square);
      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
        const moves = game.moves({ square: square as Square, verbose: true });
        setPossibleMoves(moves.map(move => move.to));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 2; // Go back 2 moves (player + AI)
      if (newIndex >= 0) {
        const fen = moveHistory[newIndex];
        setGame(new Chess(fen));
        setHistoryIndex(newIndex);
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < moveHistory.length - 2) {
      const newIndex = historyIndex + 2; // Go forward 2 moves
      const fen = moveHistory[newIndex];
      setGame(new Chess(fen));
      setHistoryIndex(newIndex);
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([newGame.fen()]);
    setHistoryIndex(0);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setGameResult(null);
    setShowResultModal(false);
  };

  const handlePlayAgain = () => {
    handleReset();
    setShowResultModal(false);
  };

  const handleHome = () => {
    setShowResultModal(false);
    // This would typically navigate to home - handled by parent
  };

  // Initialize history on first load
  useEffect(() => {
    if (moveHistory.length === 0) {
      setMoveHistory([game.fen()]);
      setHistoryIndex(0);
    }
  }, []);

  const renderSquare = (square: string, piece: any, isDark: boolean) => {
    const isSelected = selectedSquare === square;
    const isPossibleMove = possibleMoves.includes(square);
    const isInCheck = game.inCheck() && piece && piece.type === 'k' && piece.color === game.turn();

    return (
      <motion.div
        key={square}
        className={`
          relative aspect-square flex items-center justify-center text-5xl cursor-pointer
          transition-all duration-300 select-none border border-opacity-20
          ${isDark 
            ? 'bg-gradient-to-br from-amber-900 to-amber-800 border-amber-700' 
            : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300'
          }
          ${isSelected ? 'ring-4 ring-blue-400 shadow-2xl scale-105' : ''}
          ${isPossibleMove ? 'ring-2 ring-emerald-400 shadow-lg' : ''}
          ${isInCheck ? 'bg-gradient-to-br from-red-400 to-red-500 shadow-red-500/50 shadow-2xl animate-pulse' : ''}
          ${!isPlayerTurn ? 'cursor-not-allowed opacity-60' : 'hover:shadow-xl hover:scale-102'}
        `}
        onClick={() => handleSquareClick(square)}
        whileHover={isPlayerTurn ? { 
          scale: 1.02,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        } : {}}
        whileTap={isPlayerTurn ? { scale: 0.98 } : {}}
        style={{
          boxShadow: isDark 
            ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)' 
            : 'inset 0 2px 4px rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        {piece && (
          <motion.span
            className={`
              relative z-10 font-bold drop-shadow-lg
              ${piece.color === 'w' 
                ? 'text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' 
                : 'text-gray-900 filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]'
              }
            `}
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              delay: Math.random() * 0.1
            }}
            style={{
              textShadow: piece.color === 'w' 
                ? '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000' 
                : '1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff'
            }}
          >
            {pieceSymbols[piece.type.toUpperCase()] || ''}
          </motion.span>
        )}
        {isPossibleMove && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className={`
              ${piece 
                ? 'w-8 h-8 border-4 border-emerald-400 rounded-full bg-emerald-400/20' 
                : 'w-6 h-6 bg-emerald-400 rounded-full shadow-lg'
              }
            `} />
          </motion.div>
        )}
      </motion.div>
    );
  };

  const board = game.board();
  
  return (
    <div className="relative space-y-6">
      {/* Controls */}
      <div className="flex justify-center">
        <UndoRedoControls
          canUndo={historyIndex > 0}
          canRedo={historyIndex < moveHistory.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onReset={handleReset}
          moveCount={Math.floor(moveHistory.length / 2)}
        />
      </div>

      {/* AI Thinking Indicator */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-full shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              <span className="font-medium">AI is analyzing...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Turn Indicator */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        key={isPlayerTurn ? 'player' : 'ai'}
      >
        <div className={`
          inline-flex items-center gap-3 px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg
          ${isPlayerTurn 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
            : 'bg-gradient-to-r from-red-500 to-red-600'
          }
        `}>
          <span className="text-2xl">
            {isPlayerTurn ? '♔' : '♚'}
          </span>
          {isPlayerTurn ? 'Your Turn (White)' : 'AI Turn (Black)'}
        </div>
      </motion.div>

      {/* Chess Board */}
      <motion.div 
        className="grid grid-cols-8 gap-0 border-8 border-amber-900 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-amber-800 to-amber-900 p-2"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{
          transform: 'perspective(1000px) rotateX(5deg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const square = String.fromCharCode(97 + colIndex) + (8 - rowIndex);
            const isDark = (rowIndex + colIndex) % 2 === 1;
            return renderSquare(square, piece, isDark);
          })
        )}
      </motion.div>

      {/* Board Coordinates */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-around text-amber-700 font-bold text-sm pl-1">
        {[8, 7, 6, 5, 4, 3, 2, 1].map(num => (
          <div key={num} className="h-8 flex items-center">{num}</div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 w-full flex justify-around text-amber-700 font-bold text-sm pb-1">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
          <div key={letter} className="w-8 flex justify-center">{letter}</div>
        ))}
      </div>

      {/* Check Indicator */}
      {game.isCheck() && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-2xl"
        >
          ⚠️ CHECK!
        </motion.div>
      )}

      {/* Game Result Modal */}
      <GameResultModal
        isOpen={showResultModal}
        result={gameResult || 'draw'}
        onClose={() => setShowResultModal(false)}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
      />
    </div>
  );
};
