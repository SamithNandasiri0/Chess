
import React from 'react';
import { motion } from 'framer-motion';

export const ChessBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100" />
      
      {/* Animated Chess Pattern */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(8)].map((_, row) =>
          [...Array(8)].map((_, col) => (
            <motion.div
              key={`${row}-${col}`}
              className={`absolute w-16 h-16 ${
                (row + col) % 2 === 0 ? 'bg-amber-800' : 'bg-amber-200'
              }`}
              style={{
                left: `${col * 8}%`,
                top: `${row * 12.5}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{
                delay: (row + col) * 0.1,
                duration: 0.8,
                repeat: Infinity,
                repeatType: 'reverse',
                repeatDelay: 3
              }}
            />
          ))
        )}
      </div>

      {/* Floating Chess Pieces */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-6xl text-amber-300/20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100,
            rotate: Math.random() * 360,
          }}
          animate={{
            y: -100,
            rotate: 360,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 3,
          }}
        >
          {['♔', '♕', '♖', '♗', '♘', '♙'][i]}
        </motion.div>
      ))}

      {/* Subtle Grid Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-amber-800" />
      </svg>
    </div>
  );
};
