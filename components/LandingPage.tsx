import React from 'react';
import { Monitor, Smartphone, Users } from 'lucide-react';

interface LandingPageProps {
  onSelectHost: () => void;
  onSelectClient: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectHost, onSelectClient }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl w-full text-center space-y-12">
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            ProPresenter Timer
          </h1>
          <p className="text-slate-400 text-lg md:text-xl">
            Select your role to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto">
          {/* Host Option */}
          <button 
            onClick={onSelectHost}
            className="group relative flex flex-col items-center p-8 bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 hover:border-indigo-500 rounded-3xl transition-all duration-300 text-left active:scale-95"
          >
            <div className="bg-indigo-600/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
               <Monitor size={48} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Presenter View</h2>
            <p className="text-slate-400 text-center text-sm">
              The main display screen. Create a room and wait for a remote or set time manually.
            </p>
          </button>

          {/* Client Option */}
          <button
            onClick={onSelectClient}
            className="group relative flex flex-col items-center p-8 bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 hover:border-green-500 rounded-3xl transition-all duration-300 text-left active:scale-95"
          >
             <div className="bg-green-600/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
               <Smartphone size={48} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Remote Controller</h2>
            <p className="text-slate-400 text-center text-sm">
              Connect to a Presenter View to set the timer and control playback.
            </p>
          </button>
        </div>

        <div className="text-slate-600 text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
             <Users size={16} />
             <span>Multi-device sync enabled</span>
          </div>
        </div>

      </div>
    </div>
  );
};