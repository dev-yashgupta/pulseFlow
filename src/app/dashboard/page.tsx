'use client';

import { useState, useEffect } from 'react';
import { Activity, Brain, Users, TrendingUp, AlertTriangle, Bell } from 'lucide-react';
import WellbeingChart from '@/components/dashboard/WellbeingChart';
import ProductivityCorrelationChart from '@/components/dashboard/ProductivityCorrelationChart';
import TeamHealthHeatmap from '@/components/dashboard/TeamHealthHeatmap';
import { dataUtils, numberUtils } from '@/lib/utils';
import type { WellbeingMetric, CorrelationData } from '@/types';

export default function DashboardPage() {
  const [wellbeingData, setWellbeingData] = useState<WellbeingMetric[]>([]);
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch real data from database
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch wellbeing metrics from API
        const wellbeingRes = await fetch('/api/wellbeing?days=30');
        if (!wellbeingRes.ok) throw new Error('Failed to fetch wellbeing data');
        const wellbeingJson = await wellbeingRes.json();
        setWellbeingData(wellbeingJson.data || []);
        
        // Fetch correlation data from API
        const correlationRes = await fetch('/api/correlation?days=30');
        if (!correlationRes.ok) throw new Error('Failed to fetch correlation data');
        const correlationJson = await correlationRes.json();
        setCorrelationData(correlationJson.data || []);
        
        // Fetch team data from API
        const teamRes = await fetch('/api/team');
        if (!teamRes.ok) throw new Error('Failed to fetch team data');
        const teamJson = await teamRes.json();
        setTeamData(teamJson.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please ensure you have database configured.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error Loading Dashboard</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const latestWellbeing = wellbeingData[wellbeingData.length - 1];
  const avgWellbeing = wellbeingData.length > 0 
    ? dataUtils.calculateAverage(wellbeingData.map(w => (w.stressLevel + w.energyLevel + w.workLifeBalance + w.jobSatisfaction) / 4))
    : 0;

  const highRiskCount = teamData.filter(member => member.burnoutRisk > 0.6).length;

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
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
                {highRiskCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {highRiskCount}
                  </span>
                )}
              </button>
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-medium">Demo User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Wellbeing</p>
                <p className="text-2xl font-bold text-blue-600">
                  {numberUtils.formatDecimal(avgWellbeing, 1)}/10
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Burnout Risk</p>
                <p className="text-2xl font-bold text-orange-600">
                  {latestWellbeing ? numberUtils.formatPercentage(latestWellbeing.burnoutRisk) : '0%'}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Health</p>
                <p className="text-2xl font-bold text-green-600">
                  {numberUtils.formatDecimal(dataUtils.calculateAverage(teamData.map(t => t.wellbeingScore)), 1)}/10
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {numberUtils.formatDecimal(dataUtils.calculateAverage(teamData.map(t => t.productivityScore)), 1)}/10
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WellbeingChart 
            data={wellbeingData}
            metric="stressLevel"
            title="Stress Level"
          />
          <WellbeingChart 
            data={wellbeingData}
            metric="energyLevel"
            title="Energy Level"
          />
          <WellbeingChart 
            data={wellbeingData}
            metric="burnoutRisk"
            title="Burnout Risk"
          />
          <WellbeingChart 
            data={wellbeingData}
            metric="workLifeBalance"
            title="Work-Life Balance"
          />
        </div>

        {/* Correlation and Team Health */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <ProductivityCorrelationChart data={correlationData} />
          <TeamHealthHeatmap 
            teamMembers={teamData}
            teamName="Engineering Team"
          />
        </div>

        {/* Alerts and Recommendations */}
        {highRiskCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">Immediate Attention Required</h3>
            </div>
            <p className="text-red-700 mb-4">
              {highRiskCount} team member{highRiskCount > 1 ? 's are' : ' is'} showing high burnout risk. 
              Consider immediate intervention.
            </p>
            <div className="flex space-x-3">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                Schedule Check-ins
              </button>
              <button className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50">
                View Details
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
