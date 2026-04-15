import { useState, useEffect } from 'react';

interface ProgressBarProps {
  progress?: number;
  showPercentage?: boolean;
  animated?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function ProgressBar({
  progress = 0,
  showPercentage = true,
  animated = true,
  color = 'blue',
  size = 'md',
  className = ''
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated]);

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-600',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-600',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const bgColorClasses: Record<string, string> = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
    purple: 'bg-purple-100',
    indigo: 'bg-indigo-100',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${bgColorClasses[color]} rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, displayProgress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {Math.round(displayProgress)}%
          </span>
          {displayProgress === 100 && (
            <span className="text-xs text-green-600 font-medium">Hoàn thành</span>
          )}
        </div>
      )}
    </div>
  );
}
