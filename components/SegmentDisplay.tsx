import React from 'react';
import { AgendaSegment } from '../types';

interface SegmentDisplayProps {
  segments: AgendaSegment[];
  secondsElapsed: number;
}

export const SegmentDisplay: React.FC<SegmentDisplayProps> = ({ segments, secondsElapsed }) => {
  if (!segments || segments.length === 0) return null;

  let accumulatedTime = 0;
  let currentSegment: AgendaSegment | undefined;
  let nextSegment: AgendaSegment | undefined;

  for (let i = 0; i < segments.length; i++) {
    const segmentDurationSeconds = segments[i].durationMinutes * 60;
    if (secondsElapsed < accumulatedTime + segmentDurationSeconds) {
      currentSegment = segments[i];
      nextSegment = segments[i + 1];
      break;
    }
    accumulatedTime += segmentDurationSeconds;
  }

  // If finished all segments
  if (!currentSegment && secondsElapsed >= accumulatedTime) {
    currentSegment = { title: "Wrap Up", durationMinutes: 0 };
  }

  return (
    <div className="absolute bottom-32 left-0 right-0 px-8 text-center pointer-events-none z-20">
      <div className="inline-block bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-2xl">
        <div className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Current Topic</div>
        <div className="text-3xl md:text-5xl font-bold text-white mb-2">
          {currentSegment?.title || "Unknown"}
        </div>
        {nextSegment && (
           <div className="text-slate-500 text-lg md:text-xl font-medium mt-2 flex items-center justify-center gap-2">
             <span>Next: {nextSegment.title}</span>
           </div>
        )}
      </div>
    </div>
  );
};