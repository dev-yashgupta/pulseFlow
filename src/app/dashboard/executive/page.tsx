'use client';

import { useState } from 'react';
import { Activity, Building, TrendingUp, Users, DollarSign, Calendar, Download } from 'lucide-react';
import OrganizationHealthMetrics from '@/components/executive/OrganizationHealthMetrics';
import { numberUtils } from '@/lib/utils';

// Mock data for executive dashboard
const mockOrganizationMetrics = {
  totalEmployees: 1247,
  averageWellbeing: 7.2,
  averageProductivity: 7.8,
  turnoverRate: 8.5,
  engagementScore: 8.1,
  burnoutRisk: 0.15,
  costSavings: 2400000,
  roiPercentage: 340
};

const mockDepartmentData = [
  { name: 'Engineering', employees: 342, wellbeing: 7.1, productivity: 8.2, burnoutRisk: 0.18, turnover: 6.2 },
  { name: 'Sales', employees: 156, wellbeing: 6.8, productivity: 7.9, burnoutRisk: 0.22, turnover: 12.1 },
  { name: 'Marketing', employees: 89, wellbeing: 7.8, productivity: 7.6, burnoutRisk: 0.12, turnover: 5.8 },
  { name: 'Support', employees: 124, wellbeing: 6.9, productivity: 7.4, burnoutRisk: 0.25, turnover: 15.3 },
  { name: 'HR', employees: 45, wellbeing: 8.2, productivity: 7.8, burnoutRisk: 0.08, turnover: 3.2 },
  { name: 'Finance', employees: 67, wellbeing: 7.5, productivity: 8.0, burnoutRisk: 0.14, turnover: 4.1 }
];

const mockPredictiveData = [
  { month: 'Jan', predictedTurnover: 8.2, actualTurnover: 8.5, wellbeingInvestment: 45000 },
  { month: 'Feb', predictedTurnover: 7.8, actualTurnover: 7.9, wellbeingInvestment: 52000 },
  { month: 'Mar', predictedTurnover: 7.2, actualTurnover: 7.1, wellbeingInvestment: 48000 },
  { month: 'Apr', predictedTurnover: 6.8, actualTurnover: null, wellbeingInvestment: 55000 },
  { month: 'May', predictedTurnover: 6.5, actualTurnover: null, wellbeingInvestment: 58000 },
  { month: 'Jun', predictedTurnover: 6.2, actualTurnover: null, wellbeingInvestment: 60000 }
];

export default function ExecutiveDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('quarter');

  const calculateROI = () => {
    const totalInvestment = mockPredictiveData.reduce((sum, month) => sum + month.wellbeingInvestment, 0);
    const savings = mockOrganizationMetrics.costSavings;
    return ((savings - totalInvestment) / totalInvestment) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">PulseFlow</span>
              <span className="text-lg text-gray-500">Executive Command Center</span>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Organization Health</p>
                <p className="text-3xl font-bold">
                  {numberUtils.formatDecimal(mockOrganizationMetrics.averageWellbeing, 1)}/10
                </p>
                <p className="text-blue-100 text-sm mt-1">+0.3 from last quarter</p>
              </div>
              <Building className="h-10 w-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Productivity Index</p>
                <p className="text-3xl font-bold">
                  {numberUtils.formatDecimal(mockOrganizationMetrics.averageProductivity, 1)}/10
                </p>
                <p className="text-green-100 text-sm mt-1">+0.5 from last quarter</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Employee Retention</p>
                <p className="text-3xl font-bold">
                  {numberUtils.formatPercentage((100 - mockOrganizationMetrics.turnoverRate) / 100)}
                </p>
                <p className="text-purple-100 text-sm mt-1">+2.1% from last quarter</p>
              </div>
              <Users className="h-10 w-10 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Cost Savings</p>
                <p className="text-3xl font-bold">
                  ${numberUtils.formatLargeNumber(mockOrganizationMetrics.costSavings)}
                </p>
                <p className="text-orange-100 text-sm mt-1">This year</p>
              </div>
              <DollarSign className="h-10 w-10 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">ROI</p>
                <p className="text-3xl font-bold">
                  {numberUtils.formatPercentage(calculateROI() / 100)}
                </p>
                <p className="text-indigo-100 text-sm mt-1">On wellbeing programs</p>
              </div>
              <Calendar className="h-10 w-10 text-indigo-200" />
            </div>
          </div>
        </div>

        {/* Organization Health Metrics */}
        <OrganizationHealthMetrics 
          metrics={mockOrganizationMetrics}
          departmentData={mockDepartmentData}
          className="mb-8"
        />

        {/* Predictive Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Workforce Planning</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Projected Turnover Reduction</p>
                  <p className="text-sm text-blue-700">Next 6 months</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">-2.3%</p>
                  <p className="text-sm text-blue-700">vs current rate</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Estimated Cost Savings</p>
                  <p className="text-sm text-green-700">From reduced turnover</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">$1.2M</p>
                  <p className="text-sm text-green-700">Next 12 months</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">Productivity Increase</p>
                  <p className="text-sm text-purple-700">From wellbeing programs</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">+12%</p>
                  <p className="text-sm text-purple-700">Expected improvement</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment vs Returns</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Wellbeing Program Investment</span>
                  <span className="text-sm text-gray-500">$318K YTD</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Cost Savings Realized</span>
                  <span className="text-sm text-gray-500">$2.4M YTD</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Net ROI</span>
                  <span className="text-2xl font-bold text-green-600">
                    {numberUtils.formatPercentage(calculateROI() / 100)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Every $1 invested returns ${numberUtils.formatDecimal(calculateROI() / 100 + 1, 2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Support Team Focus</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Support department shows highest burnout risk (25%) and turnover (15.3%).
              </p>
              <button className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">
                View Action Plan
              </button>
            </div>

            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Scale HR Success</h4>
              <p className="text-sm text-green-700 mb-3">
                HR department shows excellent metrics. Consider applying their practices company-wide.
              </p>
              <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                Learn More
              </button>
            </div>

            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Expand Investment</h4>
              <p className="text-sm text-blue-700 mb-3">
                Current ROI of 340% suggests opportunity to increase wellbeing program investment.
              </p>
              <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                Budget Proposal
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
