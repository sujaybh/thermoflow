import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { SimulationStats } from '../types';

interface StatsChartProps {
  data: SimulationStats[];
}

const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  return (
    <div className="w-full h-48 bg-slate-800/50 rounded-lg p-2 border border-slate-700">
      <p className="text-xs text-slate-400 font-semibold mb-2 pl-2">System Metrics (Last 100 Frames)</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="iteration" 
            hide={true} 
            domain={['auto', 'auto']}
          />
          <YAxis 
            yAxisId="left" 
            domain={[0, 1]} 
            tick={{fontSize: 10, fill: '#94a3b8'}} 
            width={30}
            stroke="#94a3b8"
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{fontSize: 10, fill: '#64748b'}} 
            width={30}
            stroke="#64748b"
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: '12px' }}
            itemStyle={{ color: '#e2e8f0' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="maxTemp"
            stroke="#f43f5e"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Max Temp"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalEnergy"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Total Energy"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;