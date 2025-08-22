'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building, Users, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { numberUtils, colorUtils } from '@/lib/utils';

interface OrganizationMetrics {
  totalEmployees: number;
  averageWellbeing: number;
  averageProductivity: number;
  turnoverRate: number;
  engagementScore: number;
  burnoutRisk: number;
  costSavings: number;
  roiPercentage: number;
}

interface DepartmentData {
  name: string;
  employees: number;
  wellbeing: number;
  productivity: number;
  burnoutRisk: number;
  turnover: number;
}

interface OrganizationHealthMetricsProps {
  metrics: OrganizationMetrics;
  departmentData: DepartmentData[];
  className?: string;
}

export default function OrganizationHealthMetrics({ 
  metrics, 
  departmentData, 
  className = '' 
}: OrganizationHealthMetricsProps) {
  
  const riskDistribution = [
    { name: 'Low Risk', value: 65, color: '#10b981' },
    { name: 'Medium Risk', value: 25, color: '#f59e0b' },
    { name: 'High Risk', value: 8, color: '#ef4444' },
    { name: 'Critical Risk', value: 2, color: '#dc2626' }
  ];

  const getMetricTrend = (current: number, benchmark: number) => {
    const diff = current - benchmark;
    return {
      value: Math.abs(diff),
      isPositive: diff > 0,
      icon: diff > 0 ? TrendingUp : TrendingDown,
      color: diff > 0 ? 'text-green-600' : 'text-red-600'
    };
  };

  const wellbeingTrend = getMetricTrend(metrics.averageWellbeing, 7.0);
  const productivityTrend = getMetricTrend(metrics.averageProductivity, 7.5);
  const turnoverTrend = getMetricTrend(5.2, metrics.turnoverRate); // Lower turnover is better

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalEmployees}</p>
              <p className="text-sm text-gray-500 mt-1">Across all departments</p>
            </div>
            <Building className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Wellbeing</p>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-bold text-blue-600">
                  {numberUtils.formatDecimal(metrics.averageWellbeing, 1)}
                </p>
                <div className={`flex items-center ${wellbeingTrend.color}`}>
                  <wellbeingTrend.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {numberUtils.formatDecimal(wellbeingTrend.value, 1)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Out of 10</p>
            </div>
            <Users className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Turnover Rate</p>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-bold text-orange-600">
                  {numberUtils.formatPercentage(metrics.turnoverRate / 100)}
                </p>
                <div className={`flex items-center ${turnoverTrend.color}`}>
                  <turnoverTrend.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {numberUtils.formatDecimal(turnoverTrend.value, 1)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Annual rate</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI</p>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-bold text-green-600">
                  {numberUtils.formatPercentage(metrics.roiPercentage / 100)}
                </p>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                ${numberUtils.formatLargeNumber(metrics.costSavings)} saved
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Department Performance and Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
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
                  domain={[0, 10]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="wellbeing" fill="#3b82f6" name="Wellbeing" radius={[2, 2, 0, 0]} />
                <Bar dataKey="productivity" fill="#10b981" name="Productivity" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Burnout Risk Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Employees']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {riskDistribution.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Details Table */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wellbeing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productivity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Burnout Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnover
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentData.map((dept, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.employees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorUtils.getWellbeingColor(dept.wellbeing)}`}>
                      {numberUtils.formatDecimal(dept.wellbeing, 1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorUtils.getWellbeingColor(dept.productivity)}`}>
                      {numberUtils.formatDecimal(dept.productivity, 1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorUtils.getBurnoutRiskColor(dept.burnoutRisk)}`}>
                      {numberUtils.formatPercentage(dept.burnoutRisk)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {numberUtils.formatPercentage(dept.turnover / 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
