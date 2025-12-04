import React, { useState } from 'react';
import { TimerConfig } from '../types';
import { Play, Maximize2, Smartphone, Monitor } from 'lucide-react';

interface SetupFormProps {
  onStart: (config: TimerConfig) => void;
  pairingCode: string;
  onJoinRemote: () => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onStart, pairingCode, onJoinRemote }) => {
  const [minutes, setMinutes] = useState<number>(15);
  const [topic, setTopic] = useState<string>('');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ totalMinutes: minutes, topic });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 md:p-12 relative">
      <div className="absolute top-6 right-6">
        <button 
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors font-medium"
        >
            <Maximize2 size={20} />
            Full Screen
        </button>
      </div>
      
      {/* Remote Pairing Info */}
      <div className="absolute top-6 left-6 hidden md:block">
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-lg"><Monitor className="text-white" size={20} /></div>
            <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remote Code</div>
                <div className="text-xl font-black text-white tracking-widest">{pairingCode}</div>
            </div>
        </div>
      </div>

      <div className="w-full max-w-xl bg-slate-800 rounded-3xl md:rounded-[2.5rem] p-5 md:p-12 shadow-2xl border border-slate-700 mt-14 md:mt-0">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight text-center pt-2 md:pt-0">Presenter Timer</h1>
        <p className="text-slate-400 mb-6 md:mb-8 text-center text-base md:text-lg">Set the stage time or connect a remote.</p>

        <form onSubmit={handleStart} className="space-y-6 md:space-y-8">
          
          <div>
            <div className="flex items-center gap-3 md:gap-4 mb-6">
               <button
                  type="button"
                  onClick={() => setMinutes(Math.max(1, minutes - 1))}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-700 text-white text-xl md:text-2xl font-bold flex items-center justify-center hover:bg-slate-600 active:scale-95 transition-all"
               >
                  -
               </button>
               <input
                type="number"
                min="1"
                max="999"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="flex-1 bg-slate-900 text-white text-5xl md:text-7xl font-black p-2 md:p-6 rounded-2xl border-4 border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors text-center tabular-nums min-w-0"
              />
               <button
                  type="button"
                  onClick={() => setMinutes(minutes + 1)}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-700 text-white text-xl md:text-2xl font-bold flex items-center justify-center hover:bg-slate-600 active:scale-95 transition-all"
               >
                  +
               </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 md:gap-3">
                {[5, 10, 15, 20, 30, 45, 60].map(m => (
                    <button 
                        key={m}
                        type="button"
                        onClick={() => setMinutes(m)}
                        className={`py-3 rounded-xl font-bold transition-all active:scale-95 ${minutes === m ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 scale-105' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        {m}m
                    </button>
                ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700">
             <div className="mb-4">
                 <label className="text-slate-300 font-bold uppercase text-xs md:text-sm tracking-wider block mb-2">
                     Topic (Optional)
                 </label>
                 <input
                     type="text"
                     value={topic}
                     onChange={(e) => setTopic(e.target.value)}
                     placeholder="E.g. Quarterly Review..."
                     className="w-full bg-slate-900 text-white p-4 md:p-5 rounded-2xl border border-slate-700 focus:border-indigo-500 focus:outline-none text-base md:text-lg"
                 />
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white hover:bg-indigo-50 text-indigo-950 text-xl md:text-2xl font-black p-6 md:p-8 rounded-2xl md:rounded-3xl transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3 md:gap-4 shadow-xl shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play fill="currentColor" size={24} className="md:w-8 md:h-8" />
            START TIMER
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
             {/* Mobile only pairing code display */}
             <div className="md:hidden bg-slate-900/50 p-3 rounded-xl inline-block">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Display Code</div>
                <div className="text-xl font-mono font-bold text-indigo-400 tracking-widest">{pairingCode}</div>
             </div>
        </div>
      </div>
    </div>
  );
};