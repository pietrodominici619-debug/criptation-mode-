import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EntropyChart = ({ data }) => {
  return (
    <div className="w-full h-48 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorEntropy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', fontSize: '12px' }}
            itemStyle={{ color: '#e5e7eb' }}
          />
          <Area type="monotone" dataKey="entropia" stroke="#818cf8" fillOpacity={1} fill="url(#colorEntropy)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export function renderChart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  const root = createRoot(container);
  
  return {
    update: (data) => {
      root.render(<EntropyChart data={data} />);
    }
  };
}
