import React from 'react';

interface AudioLevelIndicatorProps {
  level: number; // 0-100
  isActive: boolean;
}

export const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({
  level,
  isActive,
}) => {
  const bars = 10;
  const activeBars = Math.round((level / 100) * bars);

  return (
    <div className="flex items-center space-x-1 h-16">
      {Array.from({ length: bars }, (_, i) => {
        const isBarActive = i < activeBars && isActive;
        const barHeight = ((i + 1) / bars) * 100;
        
        return (
          <div
            key={i}
            className={`
              w-2 rounded-full transition-all duration-100
              ${isBarActive 
                ? i < bars * 0.6 
                  ? 'bg-green-500' 
                  : i < bars * 0.85 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                : 'bg-gray-600'
              }
            `}
            style={{
              height: `${barHeight}%`,
              opacity: isBarActive ? 1 : 0.3,
            }}
          />
        );
      })}
    </div>
  );
};