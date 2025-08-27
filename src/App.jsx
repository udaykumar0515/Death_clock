import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Minimize2, 
  X, 
  Pin, 
  PinOff, 
  Settings, 
  Calendar,
  Clock,
  MoreVertical
} from 'lucide-react';
import './index.css';

const DeathClockWidget = () => {
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('23:59');
  const [timeRemaining, setTimeRemaining] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef(null);

  // Set default date to next year
  useEffect(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setTargetDate(nextYear.toISOString().split('T')[0]);
  }, []);

  // Calculate time remaining
  const calculateTimeRemaining = (target) => {
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((difference % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { years, months, days, hours, minutes, seconds };
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused && targetDate) {
      const target = new Date(`${targetDate}T${targetTime}`).getTime();

      intervalRef.current = setInterval(() => {
        const remaining = calculateTimeRemaining(target);
        setTimeRemaining(remaining);

        // Check if countdown is complete
        const total = Object.values(remaining).reduce((sum, val) => sum + val, 0);
        if (total === 0) {
          setIsCompleted(true);
          setIsRunning(false);
          clearInterval(intervalRef.current);
        }
      }, 1000);

      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [isRunning, isPaused, targetDate, targetTime]);

  // Electron API listeners
  useEffect(() => {
    if (window.electronAPI) {
      const cleanupToggle = window.electronAPI.onTimerToggle(() => {
        handleStartPause();
      });

      const cleanupReset = window.electronAPI.onTimerReset(() => {
        handleReset();
      });

      const cleanupView = window.electronAPI.onToggleView(() => {
        setIsExpanded(prev => !prev);
      });

      const cleanupAlwaysOnTop = window.electronAPI.onAlwaysOnTopChanged((_, value) => {
        setIsAlwaysOnTop(value);
      });

      return () => {
        cleanupToggle();
        cleanupReset();
        cleanupView();
        cleanupAlwaysOnTop();
      };
    }
  }, []);

  const handleStartPause = () => {
    if (!targetDate) return;

    if (isCompleted) {
      handleReset();
      return;
    }

    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    clearInterval(intervalRef.current);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    setTimeRemaining({});
    clearInterval(intervalRef.current);
  };

  const handleWindowControl = async (action) => {
    if (window.electronAPI) {
      if (action === 'toggle-always-on-top') {
        const newState = await window.electronAPI.windowControls(action);
        setIsAlwaysOnTop(newState);
      } else {
        window.electronAPI.windowControls(action);
      }
    }
  };

  const formatCountdown = () => {
    if (!timeRemaining || Object.keys(timeRemaining).length === 0) {
      return 'Set your target date below';
    }

    if (isCompleted) {
      return "⚰️ Time's Up! ⚰️";
    }

    const { years, months, days, hours, minutes, seconds } = timeRemaining;
    const parts = [];

    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}mo`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
  };

  const getStatusColor = () => {
    if (isCompleted) return 'text-red-400';
    if (isRunning && !isPaused) return 'text-green-400';
    if (isPaused) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Complete';
    if (isRunning && !isPaused) return 'Running';
    if (isPaused) return 'Paused';
    return 'Stopped';
  };

  const containerVariants = {
    expanded: { 
      width: 400, 
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    minimized: { 
      width: 220, 
      height: 80,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  const contentVariants = {
    expanded: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2, delay: 0.1 }
    },
    minimized: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.1 }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 flex items-center justify-center font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        variants={containerVariants}
        animate={isExpanded ? 'expanded' : 'minimized'}
        className="bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden relative drag-region"
        style={{ backdropFilter: 'blur(10px)' }}
      >
        {/* Title Bar - only when expanded */}
        {isExpanded && (
          <div className="bg-gray-900/80 px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-red-400 text-lg">⚰️</div>
              <h1 className="text-white font-semibold text-sm">Death Clock</h1>
              <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor()} bg-gray-800/50`}>
                {getStatusText()}
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleWindowControl('toggle-always-on-top')}
                className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                title={isAlwaysOnTop ? 'Disable Always on Top' : 'Enable Always on Top'}
                style={{ WebkitAppRegion: 'no-drag' }}
              >
                {isAlwaysOnTop ? <Pin size={14} /> : <PinOff size={14} />}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                title={isExpanded ? 'Minimize Widget' : 'Expand Widget'}
                style={{ WebkitAppRegion: 'no-drag' }}
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={() => handleWindowControl('minimize')}
                className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                title="Minimize to Taskbar"
                style={{ WebkitAppRegion: 'no-drag' }}
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={() => handleWindowControl('close')}
                className="p-1.5 rounded-lg hover:bg-red-600/50 text-gray-400 hover:text-red-400 transition-colors"
                title="Close Application"
                style={{ WebkitAppRegion: 'no-drag' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Compact three-dots button when minimized */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="absolute top-2 right-2 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
            aria-label="Expand"
            style={{ WebkitAppRegion: 'no-drag' }}
          >
            <MoreVertical size={16} />
          </button>
        )}

        {/* Countdown Display */}
        <div className="p-6" onDoubleClick={() => setIsExpanded(prev => !prev)}>
          <motion.div
            className={`text-center ${isExpanded ? 'mb-6' : ''} ${isCompleted ? 'animate-pulse' : ''}`}
            animate={isCompleted ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: isCompleted ? Infinity : 0 }}
          >
            <div className={`${isExpanded ? 'text-2xl' : 'text-xl'} font-bold ${isCompleted ? 'text-red-400' : 'text-cyan-400'} font-mono tracking-wider`}>
              {formatCountdown()}
            </div>
            {isExpanded && !isCompleted && targetDate && (
              <div className="text-xs text-gray-500">
                Target: {new Date(`${targetDate}T${targetTime}`).toLocaleString()}
              </div>
            )}
          </motion.div>

          {/* Controls - Only when expanded */}
          {isExpanded && (
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartPause}
              disabled={!targetDate}
              className={`p-3 rounded-xl text-white font-medium transition-all ${
                !targetDate
                  ? 'bg-gray-700 cursor-not-allowed opacity-50'
                  : isRunning && !isPaused
                  ? 'bg-yellow-600 hover:bg-yellow-500'
                  : 'bg-green-600 hover:bg-green-500'
              }`}
              style={{ WebkitAppRegion: 'no-drag' }}
            >
              {isRunning && !isPaused ? <Pause size={16} /> : <Play size={16} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStop}
              disabled={!isRunning}
              className={`p-3 rounded-xl text-white font-medium transition-all ${
                !isRunning
                  ? 'bg-gray-700 cursor-not-allowed opacity-50'
                  : 'bg-red-600 hover:bg-red-500'
              }`}
              style={{ WebkitAppRegion: 'no-drag' }}
            >
              <Square size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="p-3 rounded-xl bg-gray-600 hover:bg-gray-500 text-white font-medium transition-all"
              style={{ WebkitAppRegion: 'no-drag' }}
            >
              <Settings size={16} />
            </motion.button>
          </div>
          )}

          {/* Input Section - Only when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={contentVariants}
                initial="minimized"
                animate="expanded"
                exit="minimized"
                className="space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                    <Calendar size={16} />
                    <span>Set Target Date & Time</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 block">Date</label>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 block">Time</label>
                      <input
                        type="time"
                        value={targetTime}
                        onChange={(e) => setTargetTime(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">Quick Presets</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '1 Hour', hours: 1 },
                      { label: '1 Day', days: 1 },
                      { label: '1 Week', days: 7 },
                      { label: '1 Month', days: 30 },
                      { label: '1 Year', days: 365 }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          const now = new Date();
                          if (preset.hours) now.setHours(now.getHours() + preset.hours);
                          if (preset.days) now.setDate(now.getDate() + preset.days);
                          setTargetDate(now.toISOString().split('T')[0]);
                          setTargetTime(now.toTimeString().slice(0, 5));
                        }}
                        className="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-md transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyboard shortcuts help */}
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-700/50">
                  <div className="mb-1">Shortcuts:</div>
                  <div className="space-y-1">
                    <div>Space: Start/Pause • Ctrl+R: Reset • Ctrl+E: Toggle View</div>
                    <div>Ctrl+T: Always on Top • Ctrl+Alt+D: Show/Hide Widget</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeathClockWidget;
