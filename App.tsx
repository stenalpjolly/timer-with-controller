import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerStatus, TimerConfig, PeerMessage } from './types';
import { SetupForm } from './components/SetupForm';
import { TimeDisplay } from './components/TimeDisplay';
import { SegmentDisplay } from './components/SegmentDisplay';
import { RemoteControl } from './components/RemoteControl';
import { LandingPage } from './components/LandingPage';
import { Maximize2, Minimize2, Pause, Play, RotateCcw, X, Wifi } from 'lucide-react';
import { Peer } from 'peerjs';

const App: React.FC = () => {
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const [config, setConfig] = useState<TimerConfig | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Remote Features
  const [pairingCode, setPairingCode] = useState('');
  const [viewMode, setViewMode] = useState<'LANDING' | 'HOST' | 'CLIENT'>('LANDING');
  const [connections, setConnections] = useState<any[]>([]);

  const peerRef = useRef<Peer | null>(null);

  // --- WAKE LOCK ---
  const wakeLockRef = React.useRef<WakeLockSentinel | null>(null);
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.warn(`Wake Lock error: ${err}`);
    }
  };
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === TimerStatus.RUNNING) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [status]);

  // --- PEER JS HOST SETUP ---
  useEffect(() => {
    // Generate random 4 letter code
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setPairingCode(code);

    const peer = new Peer(`ppt-timer-${code}`);
    peerRef.current = peer;

    peer.on('connection', (conn) => {
      setConnections(prev => [...prev, conn]);
      
      conn.on('data', (data: any) => {
        handleRemoteCommand(data as PeerMessage);
      });

      conn.on('close', () => {
        setConnections(prev => prev.filter(c => c !== conn));
      });
    });

    return () => {
      peer.destroy();
    };
  }, []);

  // Broadcast state to remotes
  const broadcastState = useCallback(() => {
    if (connections.length > 0) {
        const payload = {
          secondsRemaining,
          totalSeconds: config ? config.totalMinutes * 60 : 0,
          status,
          config
        };
        
        connections.forEach(conn => {
          if (conn.open) {
            conn.send({ type: 'SYNC_STATE', payload });
          }
        });
      }
  }, [connections, secondsRemaining, status, config]);

  useEffect(() => {
    broadcastState();
  }, [broadcastState]);

  const handleRemoteCommand = (msg: PeerMessage) => {
    switch (msg.type) {
      case 'GET_STATE':
        // The effect hook will handle sending the state because connections changed or we can force it
        // But to be explicit and immediate:
        // Note: We need to find the specific connection that asked, but for now broadcasting is fine as it's idempotent
        // Actually, let's just trigger the broadcast logic or rely on the interval/updates.
        // However, the useEffect only runs on state changes.
        // We can force a broadcast to the specific peer if we had reference, but for now let's rely on the fact
        // that a new connection is added to state, which triggers the broadcast effect!
        // Wait, the 'connection' event adds to state, which triggers the effect.
        // So simply connecting should have sent the state.
        // The issue might be that the state is sent before the client's .on('data') is ready?
        // Or maybe the 'connection' event fires on host before 'open' on client?
        // Let's allow a manual pull.
        broadcastState();
        break;
      case 'START':
        if (msg.payload) {
           handleStart(msg.payload);
        }
        break;
      case 'PAUSE_TOGGLE':
        handlePauseToggle();
        break;
      case 'RESET':
        handleReset();
        break;
      case 'RESTART':
        if (config) {
            setSecondsRemaining(config.totalMinutes * 60);
            setSecondsElapsed(0);
            setStatus(TimerStatus.PAUSED);
        }
        break;
      case 'ADD_MINUTE':
        setSecondsRemaining(prev => prev + 60);
        break;
      case 'SUB_MINUTE':
        setSecondsRemaining(prev => prev - 60);
        break;
    }
  };


  // --- TIMER LOGIC ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(e => console.error(e));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  useEffect(() => {
    let interval: number | undefined;

    if (status === TimerStatus.RUNNING) {
      interval = window.setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
      requestWakeLock();
    } else {
      window.clearInterval(interval);
      releaseWakeLock();
    }

    return () => {
      window.clearInterval(interval);
      releaseWakeLock();
    };
  }, [status]);

  const handleStart = (newConfig: TimerConfig) => {
    setConfig(newConfig);
    setSecondsRemaining(newConfig.totalMinutes * 60);
    setSecondsElapsed(0);
    setStatus(TimerStatus.RUNNING);
    if (!document.fullscreenElement) {
       document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handlePauseToggle = useCallback(() => {
    setStatus(prev => {
        if (prev === TimerStatus.RUNNING) return TimerStatus.PAUSED;
        if (prev === TimerStatus.PAUSED) return TimerStatus.RUNNING;
        return prev;
    });
  }, []);

  const handleReset = useCallback(() => {
    setStatus(TimerStatus.IDLE);
    setConfig(null);
    setSecondsRemaining(0);
    setSecondsElapsed(0);
    releaseWakeLock();
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
  }, []);

  // --- RENDER ---

  if (viewMode === 'CLIENT') {
    return <RemoteControl onBack={() => setViewMode('LANDING')} />;
  }

  if (viewMode === 'LANDING') {
      return <LandingPage onSelectHost={() => setViewMode('HOST')} onSelectClient={() => setViewMode('CLIENT')} />;
  }

  // If IDLE, check if we have connections. If so, act as Slave Display (Waiting).
  if (status === TimerStatus.IDLE) {
      if (connections.length > 0) {
          return (
              <div className="flex flex-col h-screen bg-slate-950 text-white items-center justify-center p-6 text-center relative">
                  <div className="bg-green-900/20 p-6 rounded-full mb-6 animate-pulse">
                      <Wifi size={48} className="text-green-400" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Connected</h1>
                  <p className="text-slate-400 text-lg">Waiting for remote command...</p>
                  
                  <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-500 uppercase font-bold mb-1">Room Code</div>
                      <div className="text-2xl font-mono font-bold text-indigo-400 tracking-widest">{pairingCode}</div>
                  </div>

                  <div className="absolute bottom-6 text-slate-600 text-sm">
                      {connections.length} Remote{connections.length !== 1 && 's'} Connected
                  </div>
              </div>
          );
      }

    return (
        <SetupForm
            onStart={handleStart}
            pairingCode={pairingCode}
            onJoinRemote={() => setViewMode('CLIENT')}
        />
    );
  }

  const isOvertime = secondsRemaining < 0;

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden flex flex-col items-center justify-center touch-none">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />

      {/* Main Display */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 pb-32">
        {config && (
            <TimeDisplay 
                secondsRemaining={secondsRemaining} 
                totalSeconds={config.totalMinutes * 60}
                isOvertime={isOvertime}
            />
        )}
      </div>

      {/* Segment Info (AI Feature) */}
      {config?.segments && status !== TimerStatus.IDLE && (
          <SegmentDisplay segments={config.segments} secondsElapsed={secondsElapsed} />
      )}

      {/* Persistent Touch-Friendly Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-50 p-4 md:p-6 flex items-center justify-center gap-3 md:gap-6 bg-slate-950/50 backdrop-blur-lg border-t border-slate-800">
         
         <button
            onClick={handlePauseToggle}
            className={`flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl transition-all shadow-lg active:scale-95 ${
                status === TimerStatus.RUNNING
                ? 'bg-slate-800 text-white hover:bg-slate-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
         >
            {status === TimerStatus.RUNNING ? (
                <>
                    <Pause size={24} fill="currentColor" className="md:w-7 md:h-7" />
                    PAUSE
                </>
            ) : (
                <>
                    <Play size={24} fill="currentColor" className="md:w-7 md:h-7" />
                    RESUME
                </>
            )}
         </button>
         
         <button
            onClick={() => {
                if(config) {
                    setSecondsRemaining(config.totalMinutes * 60);
                    setSecondsElapsed(0);
                    setStatus(TimerStatus.PAUSED);
                }
            }}
            className="p-3 md:p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl md:rounded-2xl transition-all shadow-lg border border-slate-700 active:scale-95"
            title="Restart Timer"
         >
            <RotateCcw size={24} className="md:w-7 md:h-7" />
         </button>

         <div className="w-px h-10 md:h-12 bg-slate-700 mx-1 md:mx-2" />

         <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 bg-red-900/50 hover:bg-red-900/80 text-red-200 hover:text-white rounded-xl md:rounded-2xl transition-all shadow-lg border border-red-900/50 active:scale-95 font-bold text-lg md:text-xl"
         >
            <X size={24} className="md:w-7 md:h-7" />
            <span className="hidden sm:inline">CLOSE</span>
            <span className="sm:hidden">EXIT</span>
         </button>
      </div>

      {/* Back to Home Button (Only visible when IDLE or explicitly wanted, but here we are in HOST mode) */}
      {status === TimerStatus.IDLE && (
          <div className="absolute top-6 left-6 z-50">
              <button onClick={() => setViewMode('LANDING')} className="text-slate-500 hover:text-white text-sm">
                  ← Home
              </button>
          </div>
      )}

      {/* Top Right Tools */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
         {/* Peer Status */}
         {connections.length > 0 && (
             <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                <Wifi size={14} />
                {connections.length} Remote{connections.length !== 1 && 's'}
             </div>
         )}
         
         <div className="bg-slate-800/50 text-slate-400 px-3 py-2 rounded-xl text-xs font-mono font-bold border border-slate-700/50 backdrop-blur-md">
            CODE: {pairingCode}
         </div>

         <button 
            onClick={toggleFullscreen}
            className="p-3 bg-slate-800/50 hover:bg-slate-700 text-white rounded-xl backdrop-blur-md transition-all active:scale-95"
            title="Toggle Fullscreen"
         >
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
         </button>
      </div>

    </div>
  );
};

export default App;