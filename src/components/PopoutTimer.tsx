import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, X, Minimize2, Maximize2, Move } from 'lucide-react';
import { Task, TimerState } from '../types';

// Helper to format time with seconds
function formatTimeForTimerWithSeconds(seconds: number): string {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}h${m > 0 ? ` ${m}m` : ''}${s > 0 ? ` ${s}s` : ''}`;
  } else if (m > 0) {
    return `${m}m${s > 0 ? ` ${s}s` : ''}`;
  } else {
    return `${s}s`;
  }
}

interface PopoutTimerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTask: Task | null;
  timer: TimerState;
  onTimerStart: () => void;
  onTimerPause: () => void;
  onTimerStop: () => void;
  onTimerReset: () => void;
  currentSession?: { allocatedHours: number, sessionNumber?: number } | null;
}

const PopoutTimer: React.FC<PopoutTimerProps> = ({
  isOpen,
  onClose,
  currentTask,
  timer,
  onTimerStart,
  onTimerPause,
  onTimerStop,
  onTimerReset,
  currentSession
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timerRef.current) return;
    const rect = timerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep timer within viewport bounds
      const maxX = window.innerWidth - 300; // Timer width
      const maxY = window.innerHeight - (isMinimized ? 60 : 200); // Timer height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isMinimized]);

  if (!isOpen) return null;

  const progressPercentage = timer.totalTime > 0 ? ((timer.totalTime - timer.currentTime) / timer.totalTime) * 100 : 0;

  return (
    <div
      ref={timerRef}
      className={`fixed z-50 bg-white dark:bg-gray-900 border-2 border-blue-500 dark:border-blue-400 rounded-lg shadow-2xl transition-all duration-300 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${isMinimized ? 'w-72 h-16' : 'w-80 h-48'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Move size={16} />
          <span className="text-sm font-semibold truncate">
            {currentTask ? currentTask.title : 'Study Timer'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 space-y-3">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {formatTimeForTimerWithSeconds(timer.currentTime)}
            </div>
            {currentSession && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Session {currentSession.sessionNumber}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2">
            {!timer.isRunning ? (
              <button
                onClick={onTimerStart}
                className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors text-sm"
              >
                <Play size={14} />
                Start
              </button>
            ) : (
              <button
                onClick={onTimerPause}
                className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors text-sm"
              >
                <Pause size={14} />
                Pause
              </button>
            )}
            <button
              onClick={onTimerStop}
              className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors text-sm"
            >
              <Square size={14} />
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Minimized View */}
      {isMinimized && (
        <div className="flex items-center justify-between p-2 h-full">
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-gray-800 dark:text-white">
              {formatTimeForTimerWithSeconds(timer.currentTime)}
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex gap-1">
            {!timer.isRunning ? (
              <button
                onClick={onTimerStart}
                className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                title="Start"
              >
                <Play size={12} />
              </button>
            ) : (
              <button
                onClick={onTimerPause}
                className="p-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                title="Pause"
              >
                <Pause size={12} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PopoutTimer;
