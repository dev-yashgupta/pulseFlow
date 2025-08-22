'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { numberUtils } from '@/lib/utils';
import type { CorrelationData } from '@/types';

interface ProductivityCorrelationChartProps {
  data: CorrelationData[];
  className?: string;
}

export default function ProductivityCorrelationChart({ data, className = '' }: ProductivityCorrelationChartProps) {
  // Calculate correlation coefficient
  const calculateCorrelation = (data: CorrelationData[]) => {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.wellbeing, 0);
    const sumY = data.reduce((sum, d) => sum + d.productivity, 0);
    const sumXY = data.reduce((sum, d) => sum + d.wellbeing * d.productivity, 0);
    const sumX2 = data.reduce((sum, d) => sum + d.wellbeing * d.wellbeing, 0);
    const sumY2 = data.reduce((sum, d) => sum + d.productivity * d.productivity, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlation = calculateCorrelation(data);
  const correlationStrength = Math.abs(correlation);
  
  const getCorrelationLabel = () => {
    if (correlationStrength < 0.3) return 'Weak';
    if (correlationStrength < 0.7) return 'Moderate';
    return 'Strong';
  };

  const getCorrelationColor = () => {
    if (correlation > 0.5) return 'text-green-600 bg-green-100';
    if (correlation > 0.2) return 'text-yellow-600 bg-yellow-100';
    if (correlation > -0.2) return 'text-gray-600 bg-gray-100';
    return 'text-red-600 bg-red-100';
  };

  // Transform data for scatter plot
  const scatterData = data.map((item, index) => ({
    wellbeing: item.wellbeing * 10, // Scale to 0-10
    productivity: item.productivity * 10, // Scale to 0-10
    date: item.date,
    index
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.date}</p>
          <p className="text-sm text-blue-600">
            Wellbeing: {numberUtils.formatDecimal(data.wellbeing, 1)}/10
          </p>
          <p className="text-sm text-green-600">
            Productivity: {numberUtils.formatDecimal(data.productivity, 1)}/10
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Wellbeing vs Productivity</h3>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-gray-500" />
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${getCorrelationColor()}`}>
            {getCorrelationLabel()} ({numberUtils.formatDecimal(correlation, 2)})
          </span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart data={scatterData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              type="number"
              dataKey="wellbeing"
              name="Wellbeing"
              domain={[0, 10]}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Wellbeing Score', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              type="number"
              dataKey="productivity"
              name="Productivity"
              domain={[0, 10]}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Productivity Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference lines for averages */}
            <ReferenceLine 
              x={scatterData.reduce((sum, d) => sum + d.wellbeing, 0) / scatterData.length} 
              stroke="#94a3b8" 
              strokeDasharray="5 5" 
            />
            <ReferenceLine 
              y={scatterData.reduce((sum, d) => sum + d.productivity, 0) / scatterData.length} 
              stroke="#94a3b8" 
              strokeDasharray="5 5" 
            />
            
            <Scatter 
              name="Data Points" 
              data={scatterData} 
              fill="#3b82f6"
              fillOpacity={0.7}
              stroke="#1d4ed8"
              strokeWidth={1}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">
            {numberUtils.formatDecimal(scatterData.reduce((sum, d) => sum + d.wellbeing, 0) / scatterData.length, 1)}
          </div>
          <div className="text-gray-600">Avg Wellbeing</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {numberUtils.formatDecimal(scatterData.reduce((sum, d) => sum + d.productivity, 0) / scatterData.length, 1)}
          </div>
          <div className="text-gray-600">Avg Productivity</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-semibold ${correlation > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {numberUtils.formatPercentage(Math.abs(correlation))}
          </div>
          <div className="text-gray-600">Correlation</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Insight:</strong> {correlation > 0.5 
            ? 'Strong positive correlation - higher wellbeing leads to better productivity'
            : correlation > 0.2 
            ? 'Moderate correlation between wellbeing and productivity'
            : correlation > -0.2
            ? 'Weak correlation - other factors may be influencing productivity'
            : 'Negative correlation - investigate potential burnout or workload issues'
          }
        </p>
      </div>
    </div>
  );
}
