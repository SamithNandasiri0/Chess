
import React from 'react';
import { motion } from 'framer-motion';
import { Undo, Redo, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  moveCount: number;
}

export const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  moveCount
}) => {
  return (
    <motion.div
      className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Moves:</span>
        <span className="text-lg font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg min-w-8 text-center">
          {moveCount}
        </span>
      </div>

      <div className="w-px h-6 bg-gray-300" />

      <div className="flex gap-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onUndo}
            disabled={!canUndo}
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 border-gray-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40"
          >
            <Undo className="w-4 h-4 text-blue-600" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onRedo}
            disabled={!canRedo}
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 border-gray-200 hover:bg-green-50 hover:border-green-300 disabled:opacity-40"
          >
            <Redo className="w-4 h-4 text-green-600" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 border-gray-200 hover:bg-red-50 hover:border-red-300"
          >
            <RotateCcw className="w-4 h-4 text-red-600" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
