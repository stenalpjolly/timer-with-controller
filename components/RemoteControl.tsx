import React, { useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';
import { PeerMessage, TimerStatus, SyncStatePayload } from '../types';
import { Play, Pause, RotateCcw, Plus, Minus, Wifi, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface RemoteControlProps {
  onBack: () => void;
}

export const RemoteControl: React.FC<RemoteControlProps> = ({ onBack }) => {
  const [pairingCode, setPairingCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  
  // Synced State
  const [syncedState, setSyncedState] = useState<SyncStatePayload | null>(null);
  
  // New Timer State
  const [newTimerDuration, setNewTimerDuration] = useState(15);
  const [newTimerTopic, setNewTimerTopic] = useState('');

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Peer (Client side doesn't need a specific ID)
    const peer = new Peer();
    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingCode || pairingCode.length < 4) return;
    
    setIsConnecting(true);
    setError('');

    const hostId = `ppt-timer-${pairingCode.toUpperCase()}`;
    
    if (!peerRef.current) return;

    const conn = peerRef.current.connect(hostId);

    conn.on('open', () => {
      setIsConnected(true);
      setIsConnecting(false);
      connRef.current = conn;
      // Request initial state immediately upon connection
      conn.send({ type: 'GET_STATE' });
    });

    conn.on('data', (data: any) => {
      const msg = data as PeerMessage;
      if (msg.type === 'SYNC_STATE') {
        setSyncedState(msg.payload);
      }
    });

    conn.on('close', () => {
      setIsConnected(false);
      setIsConnecting(false);
      setSyncedState(null);
    });

    conn.on('error', (err) => {
      console.error(err);
      setError('Connection failed. Check code.');
      setIsConnecting(false);
    });

    // Timeout safety
    setTimeout(() => {
        if (!conn.open && isConnecting) {
            setIsConnecting(false);
            setError('Connection timed out');
        }
    }, 5000);
  };

  const sendCommand = (type: PeerMessage['type'], payload?: any) => {
    if (connRef.current && isConnected) {
      connRef.current.send({ type, payload });
    }
  };

  // Render Connection Screen
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 md:p-6">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-slate-400 hover:text-white text-sm md:text-base">← Back</button>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Wifi size={20} /> Remote Connect
            </h2>
          </div>
          
          <p className="text-slate-400 mb-6 text-sm md:text-base">Enter the 4-letter code displayed on the main screen.</p>

          <form onSubmit={handleConnect} className="space-y-4">
            <input
              type="text"
              maxLength={4}
              value={pairingCode}
              onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              className="w-full bg-slate-950 text-white text-4xl md:text-5xl font-black p-4 md:p-6 rounded-xl md:rounded-2xl border-4 border-slate-700 focus:border-indigo-500 focus:outline-none text-center tracking-widest uppercase placeholder:text-slate-800"
              autoFocus
            />
            
            {error && <div className="text-red-400 text-center font-medium text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isConnecting || pairingCode.length < 4}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 md:py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
              {isConnecting ? <Loader2 className="animate-spin" /> : 'Connect'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Control Screen
  const minutes = syncedState ? Math.floor(Math.abs(syncedState.secondsRemaining) / 60) : 0;
  const seconds = syncedState ? Math.abs(syncedState.secondsRemaining) % 60 : 0;
  const isOvertime = syncedState ? syncedState.secondsRemaining < 0 : false;
  const isRunning = syncedState?.status === TimerStatus.RUNNING;
  // If state is not yet synced, default to Idle (Setup Screen) so user can start timer
  const isIdle = !syncedState || syncedState.status === TimerStatus.IDLE;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="p-3 md:p-4 bg-slate-900 flex justify-between items-center border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2 text-green-400 font-bold text-xs md:text-sm">
          <Wifi size={14} /> <span className="hidden sm:inline">Connected to</span> {pairingCode}
        </div>
        <button onClick={() => { connRef.current?.close(); setIsConnected(false); }} className="text-slate-500 hover:text-white text-xs md:text-sm px-2 py-1 rounded border border-slate-800 hover:border-slate-600">
          Disconnect
        </button>
      </div>

      {/* Content - Time Display Always Visible */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className={clsx("text-6xl md:text-8xl font-black tabular-nums tracking-tighter transition-colors mb-2",
              isOvertime ? "text-red-500 animate-pulse" :
              (syncedState?.secondsRemaining || 0) <= 60 && !isIdle ? "text-red-500" : "text-white"
          )}>
            {isOvertime && "-"}
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-slate-500 font-bold tracking-widest uppercase text-sm md:text-lg">
              {isOvertime ? "OVERTIME" : "REMAINING"}
          </div>
          {syncedState?.config?.topic && (
              <div className="mt-4 text-indigo-300 font-medium px-4 py-1 bg-indigo-900/30 rounded-full border border-indigo-500/30">
                  {syncedState.config.topic}
              </div>
          )}
      </div>

      {/* Controls Area */}
      <div className="bg-slate-900 p-6 pb-12 rounded-t-3xl border-t border-slate-800 space-y-6 shrink-0 max-h-[60vh] overflow-y-auto">
        
        {isIdle ? (
            <div className="space-y-4">
                 <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Start New Timer</h3>
                 
                 <div>
                    <div className="flex items-center gap-3">
                        <button
                           onClick={() => setNewTimerDuration(Math.max(1, newTimerDuration - 1))}
                           className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-xl flex items-center justify-center text-xl font-bold hover:bg-slate-700 active:scale-95"
                        >
                            -
                        </button>
                        <div className="flex-1 bg-slate-950 p-2 md:p-3 rounded-xl border border-slate-700 text-center text-3xl font-black">
                            {newTimerDuration}<span className="text-base font-normal text-slate-500 ml-1">m</span>
                        </div>
                        <button
                           onClick={() => setNewTimerDuration(newTimerDuration + 1)}
                           className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-xl flex items-center justify-center text-xl font-bold hover:bg-slate-700 active:scale-95"
                        >
                            +
                        </button>
                    </div>
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2 no-scrollbar mask-linear-fade">
                        {[5, 10, 15, 20, 30, 45, 60].map(m => (
                            <button
                                key={m}
                                onClick={() => setNewTimerDuration(m)}
                                className={clsx("px-4 py-3 rounded-lg font-bold text-sm whitespace-nowrap transition-colors min-w-[3.5rem]",
                                    newTimerDuration === m ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
                                )}
                            >
                                {m}m
                            </button>
                        ))}
                    </div>
                 </div>

                 <div>
                    <input
                        type="text"
                        value={newTimerTopic}
                        onChange={(e) => setNewTimerTopic(e.target.value)}
                        placeholder="Topic (Optional)"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500"
                    />
                 </div>

                 <button
                    onClick={() => sendCommand('START', { totalMinutes: newTimerDuration, topic: newTimerTopic })}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xl shadow-lg shadow-indigo-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    <Play fill="currentColor" /> START
                 </button>
            </div>
        ) : (
            <>
            {/* Main Transport */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => sendCommand('PAUSE_TOGGLE')}
                    className={clsx("col-span-2 py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg",
                        isRunning ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-green-600 hover:bg-green-500 text-white"
                    )}
                >
                    {isRunning ? <><Pause fill="currentColor" /> PAUSE</> : <><Play fill="currentColor" /> RESUME</>}
                </button>

                <button
                    onClick={() => sendCommand('RESTART')}
                    className="py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 border border-slate-700"
                >
                    <RotateCcw /> RESTART
                </button>

                <button
                    onClick={() => { if(confirm('Reset Timer?')) sendCommand('RESET'); }}
                    className="py-6 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 border border-red-900/30"
                >
                    <RotateCcw className="rotate-180" /> STOP/RESET
                </button>
            </div>

            {/* Adjustments */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => sendCommand('SUB_MINUTE')}
                    className="py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95"
                >
                    <Minus size={20} /> 1 Min
                </button>
                <button
                    onClick={() => sendCommand('ADD_MINUTE')}
                    className="py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus size={20} /> 1 Min
                </button>
            </div>
            </>
        )}

      </div>
    </div>
  );
};