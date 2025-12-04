import React from 'react';
import { clsx } from 'clsx';

interface TimeDisplayProps {
  secondsRemaining: number;
  totalSeconds: number;
  isOvertime?: boolean;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ 
  secondsRemaining, 
  totalSeconds,
  isOvertime = false 
}) => {
  // Calculate display values
  const absSeconds = Math.abs(secondsRemaining);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;

  const paddedMins = mins.toString().padStart(2, '0');
  const paddedSecs = secs.toString().padStart(2, '0');

  // Determine color state
  const percentage = (secondsRemaining / totalSeconds) * 100;
  
  let textColor = 'text-white';
  if (isOvertime) {
    textColor = 'text-red-500 animate-pulse';
  } else if (secondsRemaining <= 60) {
    textColor = 'text-red-500';
  } else if (secondsRemaining <= 300 || percentage < 20) {
    textColor = 'text-yellow-400';
  }

  // Dynamic label text
  let labelText = "REMAINING";
  if (isOvertime) {
    labelText = "OVERTIME";
  } else if (mins >= 1) {
    labelText = `${mins} MINS REMAINING`;
  } else {
    labelText = `${secs} SECS REMAINING`;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className={clsx("text-[20vw] md:text-massive font-black tabular-nums tracking-tighter transition-colors duration-300 leading-none", textColor)}>
        {isOvertime && <span className="text-3xl md:text-6xl align-top font-bold block text-center mb-2 md:mb-4 text-red-500 tracking-normal">TIME UP</span>}
        {paddedMins}:{paddedSecs}
      </div>
      <div className={clsx("text-xl md:text-6xl font-bold opacity-80 uppercase tracking-widest mt-4 md:mt-6 text-center", textColor)}>
        {labelText}
      </div>
    </div>
  );
};