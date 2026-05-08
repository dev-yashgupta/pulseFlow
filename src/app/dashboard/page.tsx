'use client';

import { Activity, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { numberUtils } from '@/lib/utils';

// Mock data for demo
const mockMetrics = {
  wellbeing: 7.4,
  burnoutRisk: 0.28,
  productivity: 7.9,
};

const mockTeamMembers = [
  { id: '1', name: 'Sarah Chen', role: 'Senior Developer', status: 'healthy' },
  { id: '2', name: 'Mike Johnson', role: 'Product Manager', status: 'at-risk' },
  { id: '3', name: 'Emily Davis', role: 'Designer', status: 'healthy' },
];

export default function DashboardPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">PulseFlow</span>
            </div>
            <div className="text-sm text-gray-600">Demo Dashboard</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Wellbeing</p>
                <p className="text-3xl font-bold text-blue-600">{numberUtils.formatDecimal(mockMetrics.wellbeing, 1)}</p>
                <p className="text-xs text-gray-500 mt-1">out of 10</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Burnout Risk</p>
                <p className="text-3xl font-bold text-orange-600">{numberUtils.formatPercentage(mockMetrics.burnoutRisk)}</p>
                <p className="text-xs text-gray-500 mt-1">of team</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity</p>
                <p className="text-3xl font-bold text-green-600">{numberUtils.formatDecimal(mockMetrics.productivity, 1)}</p>
                <p className="text-xs text-gray-500 mt-1">out of 10</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">Team Overview</h2>
          <div className="space-y-3">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  member.status === 'healthy' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {member.status === 'healthy' ? 'Healthy' : 'At Risk'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
