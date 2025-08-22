'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { colorUtils, dateUtils, numberUtils } from '@/lib/utils';
import type { WellbeingMetric } from '@/types';

interface WellbeingChartProps {
  data: WellbeingMetric[];
  metric: 'stressLevel' | 'energyLevel' | 'workLifeBalance' | 'jobSatisfaction' | 'burnoutRisk';
  title: string;
  className?: string;
}

export default function WellbeingChart({ data, metric, title, className = '' }: WellbeingChartProps) {
  const chartData = data.map(item => ({
    date: dateUtils.formatDate(new Date(item.date)),
    value: metric === 'burnoutRisk' ? item[metric] * 100 : item[metric],
    rawValue: item[metric]
  }));

  const latestValue = chartData[chartData.length - 1]?.rawValue || 0;
  const previousValue = chartData[chartData.length - 2]?.rawValue || latestValue;
  const trend = latestValue - previousValue;
  
  const getTrendIcon = () => {
    if (Math.abs(trend) < 0.1) return <Minus className="h-4 w-4 text-gray-500" />;
    if (metric === 'stressLevel' || metric === 'burnoutRisk') {
      return trend > 0 ? <TrendingUp className="h-4 w-4 text-red-500" /> : <TrendingDown className="h-4 w-4 text-green-500" />;
    } else {
      return trend > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getValueColor = (value: number) => {
    if (metric === 'burnoutRisk') {
      return colorUtils.getBurnoutRiskColor(value);
    } else if (metric === 'stressLevel') {
      return colorUtils.getWellbeingColor(10 - value); // Invert for stress
    } else {
      return colorUtils.getWellbeingColor(value);
    }
  };

  const formatValue = (value: number) => {
    if (metric === 'burnoutRisk') {
      return numberUtils.formatPercentage(value);
    }
    return numberUtils.formatDecimal(value, 1);
  };

  const getChartColor = () => {
    if (metric === 'burnoutRisk' && latestValue > 0.6) return '#ef4444';
    if (metric === 'stressLevel' && latestValue > 7) return '#ef4444';
    if (metric === 'energyLevel' && latestValue < 4) return '#ef4444';
    if (latestValue < 5) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${getValueColor(latestValue)}`}>
            {formatValue(latestValue)}
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={getChartColor()} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={metric === 'burnoutRisk' ? [0, 100] : [1, 10]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [formatValue(metric === 'burnoutRisk' ? value / 100 : value), title]}
              labelStyle={{ color: '#374151' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={getChartColor()}
              strokeWidth={2}
              fill={`url(#gradient-${metric})`}
              dot={{ fill: getChartColor(), strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: getChartColor(), strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Last 30 days</span>
        <span className="flex items-center space-x-1">
          <span>Trend:</span>
          <span className={trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-600'}>
            {trend > 0 ? '+' : ''}{numberUtils.formatDecimal(trend, 1)}
          </span>
        </span>
      </div>
    </div>
  );
}
