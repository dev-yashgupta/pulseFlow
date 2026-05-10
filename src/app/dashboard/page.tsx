'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Brain, Users, TrendingUp, AlertTriangle, Bell } from 'lucide-react';
import WellbeingChart from '@/components/dashboard/WellbeingChart';
import ProductivityCorrelationChart from '@/components/dashboard/ProductivityCorrelationChart';
import TeamHealthHeatmap from '@/components/dashboard/TeamHealthHeatmap';
import { dataUtils, numberUtils } from '@/lib/utils';
import { createBrowserSupabaseClient } from '@/lib/database/supabase';
import type { WellbeingMetric, CorrelationData } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [wellbeingData, setWellbeingData] = useState<WellbeingMetric[]>([]);
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Check authentication and get session token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get the current session from Supabase client
        const supabase = createBrowserSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session || !session.access_token) {
          router.push('/auth/login');
          return;
        }

        setSessionToken(session.access_token);

        // Verify with server
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          router.push('/auth/login');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated || !sessionToken) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const authHeaders = {
          'Authorization': `Bearer ${sessionToken}`
        };

        // Fetch wellbeing metrics from API
        const wellbeingRes = await fetch('/api/wellbeing?days=30', {
          headers: authHeaders
        });
        if (!wellbeingRes.ok) throw new Error('Failed to fetch wellbeing data');
        const wellbeingJson = await wellbeingRes.json();
        setWellbeingData(wellbeingJson.data || []);
        
        // Fetch correlation data from API
        const correlationRes = await fetch('/api/correlation?days=30', {
          headers: authHeaders
        });
        if (!correlationRes.ok) throw new Error('Failed to fetch correlation data');
        const correlationJson = await correlationRes.json();
        setCorrelationData(correlationJson.data || []);
        
        // Fetch team data from API
        const teamRes = await fetch('/api/team', {
          headers: authHeaders
        });
        if (!teamRes.ok) throw new Error('Failed to fetch team data');
        const teamJson = await teamRes.json();
        setTeamData(teamJson.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please ensure database is configured.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, sessionToken]);

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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <button 
              onClick={() => router.push('/auth/login')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Avg Wellbeing</p>
            <p className="text-3xl font-bold text-gray-900">{(avgWellbeing / 2).toFixed(1)}/5</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Team Size</p>
            <p className="text-3xl font-bold text-gray-900">{teamData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">At Risk</p>
            <p className="text-3xl font-bold text-red-600">{highRiskCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Data Points</p>
            <p className="text-3xl font-bold text-gray-900">{wellbeingData.length}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Stress Levels</h2>
            {wellbeingData.length > 0 ? (
              <WellbeingChart data={wellbeingData} metric="stressLevel" title="Stress Level Trend" />
            ) : (
              <p className="text-gray-600">No data available</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Energy Levels</h2>
            {wellbeingData.length > 0 ? (
              <WellbeingChart data={wellbeingData} metric="energyLevel" title="Energy Level Trend" />
            ) : (
              <p className="text-gray-600">No data available</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Burnout Risk</h2>
            {wellbeingData.length > 0 ? (
              <WellbeingChart data={wellbeingData} metric="burnoutRisk" title="Burnout Risk Trend" />
            ) : (
              <p className="text-gray-600">No data available</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Work-Life Balance</h2>
            {wellbeingData.length > 0 ? (
              <WellbeingChart data={wellbeingData} metric="workLifeBalance" title="Work-Life Balance Trend" />
            ) : (
              <p className="text-gray-600">No data available</p>
            )}
          </div>
        </div>

        {/* Team Health */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Health</h2>
          {teamData.length > 0 ? (
            <TeamHealthHeatmap teamMembers={teamData} teamName="Engineering Team" />
          ) : (
            <p className="text-gray-600">No team data available</p>
          )}
        </div>
      </main>
    </div>
  );
}
