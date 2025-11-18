import React, { useState, useCallback } from 'react';
import HeatSimulation from './components/HeatSimulation';
import ControlPanel from './components/ControlPanel';
import StatsChart from './components/StatsChart';
import { SimulationConfig, SimulationStats, ColorMap } from './types';
import { DEFAULT_CONFIG, MAX_HISTORY_LENGTH } from './constants';
import { FlameKindling } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [statsHistory, setStatsHistory] = useState<SimulationStats[]>([]);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [colorMap, setColorMap] = useState<ColorMap>(ColorMap.Magma);

  const handleReset = () => {
    setResetTrigger(prev => prev + 1);
    setStatsHistory([]);
  };

  const handleStatsUpdate = useCallback((newStats: SimulationStats) => {
    setStatsHistory(prev => {
      const updated = [...prev, newStats];
      if (updated.length > MAX_HISTORY_LENGTH) {
        return updated.slice(updated.length - MAX_HISTORY_LENGTH);
      }
      return updated;
    });
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-y-auto">
        
        {/* Top Bar */}
        <header className="p-6 pb-2 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-orange-500 to-pink-600 p-2 rounded-xl shadow-lg shadow-orange-500/20">
               <FlameKindling className="w-6 h-6 text-white" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                  ThermoFlow
                </h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Interactive Heat Equation Solver</p>
             </div>
          </div>
        </header>

        {/* Simulation Viewport */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
          
          {/* Simulation Container */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-1000 blur-lg"></div>
            <HeatSimulation
              isRunning={isRunning}
              config={config}
              colorMap={colorMap}
              onStatsUpdate={handleStatsUpdate}
              resetTrigger={resetTrigger}
            />
          </div>

          {/* Real-time Graph */}
          <div className="w-full max-w-[600px]">
            <StatsChart data={statsHistory} />
          </div>

        </main>
      </div>

      {/* Sidebar Controls */}
      <aside className="lg:h-full">
        <ControlPanel
          config={config}
          setConfig={setConfig}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          handleReset={handleReset}
          colorMap={colorMap}
          setColorMap={setColorMap}
        />
      </aside>

    </div>
  );
};

export default App;