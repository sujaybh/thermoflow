import React from 'react';
import { Play, Pause, RotateCcw, ThermometerSun, Activity, Palette } from 'lucide-react';
import { SimulationConfig, ColorMap } from '../types';

interface ControlPanelProps {
  config: SimulationConfig;
  setConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  handleReset: () => void;
  colorMap: ColorMap;
  setColorMap: (v: ColorMap) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  setConfig,
  isRunning,
  setIsRunning,
  handleReset,
  colorMap,
  setColorMap
}) => {
  const handleChange = (key: keyof SimulationConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-slate-800 border-l border-slate-700 p-6 w-full lg:w-80 h-full overflow-y-auto flex flex-col gap-6 shadow-xl z-10">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Controls</h2>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
            isRunning 
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/50' 
              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50'
          }`}
        >
          {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Run</>}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-all"
        >
          <RotateCcw size={18} /> Reset
        </button>
      </div>

      <hr className="border-slate-700" />

      {/* Physics Params */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold">Physics</h3>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Diffusivity (Alpha)</span>
            <span className="font-mono text-indigo-400">{config.alpha.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.24"
            step="0.01"
            value={config.alpha}
            onChange={(e) => handleChange('alpha', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Speed (Steps/Frame)</span>
            <span className="font-mono text-indigo-400">{config.iterationsPerFrame}</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={config.iterationsPerFrame}
            onChange={(e) => handleChange('iterationsPerFrame', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Damping (Energy Loss)</span>
            <span className="font-mono text-indigo-400">{config.damping.toFixed(3)}</span>
          </div>
           <input
            type="range"
            min="0.950"
            max="1.000"
            step="0.001"
            value={config.damping}
            onChange={(e) => handleChange('damping', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      <hr className="border-slate-700" />

      {/* Interaction Params */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold">Interaction</h3>
        
        <div className="space-y-1">
           <div className="flex justify-between text-sm">
            <span className="text-slate-300">Brush Size</span>
            <span className="font-mono text-pink-400">{config.brushSize}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={config.brushSize}
            onChange={(e) => handleChange('brushSize', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>

         <div className="space-y-1">
           <div className="flex justify-between text-sm">
            <span className="text-slate-300">Heat Intensity</span>
            <span className="font-mono text-pink-400">{config.brushIntensity.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={config.brushIntensity}
            onChange={(e) => handleChange('brushIntensity', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>
      </div>

      <hr className="border-slate-700" />

      {/* Visualization Params */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
          <Palette size={14} /> Visualization
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(ColorMap).map((mapName) => (
            <button
              key={mapName}
              onClick={() => setColorMap(mapName)}
              className={`px-3 py-2 text-sm rounded-md border transition-all ${
                colorMap === mapName
                  ? 'bg-slate-600 border-indigo-400 text-white ring-1 ring-indigo-400'
                  : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {mapName}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-auto pt-6 text-xs text-slate-500 leading-relaxed">
        <p><strong>Instructions:</strong> Click or drag on the canvas to inject heat. Watch it diffuse according to the Heat Equation.</p>
      </div>
    </div>
  );
};

export default ControlPanel;