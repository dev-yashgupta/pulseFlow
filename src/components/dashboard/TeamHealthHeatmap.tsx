'use client';

import { Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { colorUtils, numberUtils } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  wellbeingScore: number;
  burnoutRisk: number;
  productivityScore: number;
  lastActive: Date;
}

interface TeamHealthHeatmapProps {
  teamMembers: TeamMember[];
  teamName: string;
  className?: string;
}

export default function TeamHealthHeatmap({ teamMembers, teamName, className = '' }: TeamHealthHeatmapProps) {
  const getHealthColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 0.3) return 'bg-green-100 text-green-800';
    if (risk <= 0.6) return 'bg-yellow-100 text-yellow-800';
    if (risk <= 0.8) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const teamAvgWellbeing = teamMembers.reduce((sum, member) => sum + member.wellbeingScore, 0) / teamMembers.length;
  const teamAvgProductivity = teamMembers.reduce((sum, member) => sum + member.productivityScore, 0) / teamMembers.length;
  const highRiskMembers = teamMembers.filter(member => member.burnoutRisk > 0.6).length;

  const sortedMembers = [...teamMembers].sort((a, b) => b.burnoutRisk - a.burnoutRisk);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{teamName} Health Overview</h3>
        </div>
        {highRiskMembers > 0 && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{highRiskMembers} at risk</span>
          </div>
        )}
      </div>

      {/* Team Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {numberUtils.formatDecimal(teamAvgWellbeing, 1)}
          </div>
          <div className="text-sm text-blue-800">Avg Wellbeing</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {numberUtils.formatDecimal(teamAvgProductivity, 1)}
          </div>
          <div className="text-sm text-green-800">Avg Productivity</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {teamMembers.length}
          </div>
          <div className="text-sm text-gray-800">Team Members</div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Team Members</h4>
        {sortedMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getHealthColor(member.wellbeingScore)}`} />
              <div>
                <div className="font-medium text-gray-900">{member.name}</div>
                <div className="text-sm text-gray-500">{member.role}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Wellbeing Score */}
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {numberUtils.formatDecimal(member.wellbeingScore, 1)}
                </div>
                <div className="text-xs text-gray-500">Wellbeing</div>
              </div>
              
              {/* Productivity Score */}
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {numberUtils.formatDecimal(member.productivityScore, 1)}
                </div>
                <div className="text-xs text-gray-500">Productivity</div>
              </div>
              
              {/* Burnout Risk */}
              <div className="text-center">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(member.burnoutRisk)}`}>
                  {numberUtils.formatPercentage(member.burnoutRisk)}
                </span>
                <div className="text-xs text-gray-500 mt-1">Risk</div>
              </div>
              
              {/* Trend Indicator */}
              <div className="text-center">
                {member.wellbeingScore > 7 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                ) : member.wellbeingScore < 5 ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />
                ) : (
                  <div className="h-4 w-4 bg-gray-300 rounded-full mx-auto" />
                )}
                <div className="text-xs text-gray-500 mt-1">Trend</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Distribution */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Distribution</h4>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {teamMembers.filter(m => m.burnoutRisk <= 0.3).length}
            </div>
            <div className="text-xs text-gray-600">Low Risk</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-600">
              {teamMembers.filter(m => m.burnoutRisk > 0.3 && m.burnoutRisk <= 0.6).length}
            </div>
            <div className="text-xs text-gray-600">Medium Risk</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">
              {teamMembers.filter(m => m.burnoutRisk > 0.6 && m.burnoutRisk <= 0.8).length}
            </div>
            <div className="text-xs text-gray-600">High Risk</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {teamMembers.filter(m => m.burnoutRisk > 0.8).length}
            </div>
            <div className="text-xs text-gray-600">Critical</div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      {highRiskMembers > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Immediate Action Required</span>
          </div>
          <p className="text-sm text-red-700">
            {highRiskMembers} team member{highRiskMembers > 1 ? 's' : ''} showing high burnout risk. 
            Consider scheduling check-ins and workload adjustments.
          </p>
        </div>
      )}
    </div>
  );
}
