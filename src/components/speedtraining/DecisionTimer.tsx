import { useEffect, useState } from 'react';

interface DecisionTimerProps {
  timeLimit: number; // Total time in milliseconds
  startTime: number | null; // Timestamp when decision started
  onTimeout: () => void;
  isActive: boolean;
}

export function DecisionTimer({ timeLimit, startTime, onTimeout, isActive }: DecisionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  useEffect(() => {
    if (!isActive || startTime === null) {
      setTimeRemaining(timeLimit);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        onTimeout();
      }
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [isActive, startTime, timeLimit, onTimeout]);

  if (!isActive || startTime === null) {
    return null;
  }

  const percentage = (timeRemaining / timeLimit) * 100;
  const seconds = (timeRemaining / 1000).toFixed(1);

  // Color transitions: green -> yellow -> red
  let colorClass = 'bg-green-500';
  let textColorClass = 'text-green-600';
  if (percentage < 50) {
    colorClass = 'bg-yellow-500';
    textColorClass = 'text-yellow-600';
  }
  if (percentage < 25) {
    colorClass = 'bg-red-500';
    textColorClass = 'text-red-600';
  }

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${textColorClass}`}>
          Decision Timer
        </span>
        <span className={`text-lg font-bold ${textColorClass}`}>
          {seconds}s
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Warning message when time is running out */}
      {percentage < 25 && (
        <div className="text-center mt-2 text-red-500 text-sm font-semibold animate-pulse">
          ⚠️ Time running out!
        </div>
      )}
    </div>
  );
}
