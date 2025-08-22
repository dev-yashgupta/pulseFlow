import React from 'react';
import { render, screen } from '@testing-library/react';
import WellbeingChart from '@/components/dashboard/WellbeingChart';
import type { WellbeingMetric } from '@/types';

// Mock data
const mockWellbeingData: WellbeingMetric[] = [
  {
    id: '1',
    userId: 'user1',
    date: new Date('2024-01-01'),
    stressLevel: 6,
    energyLevel: 7,
    workloadSatisfaction: 8,
    workLifeBalance: 7,
    jobSatisfaction: 8,
    burnoutRisk: 0.3,
    sentimentScore: 0.2,
    source: 'survey'
  },
  {
    id: '2',
    userId: 'user1',
    date: new Date('2024-01-02'),
    stressLevel: 5,
    energyLevel: 8,
    workloadSatisfaction: 8,
    workLifeBalance: 8,
    jobSatisfaction: 9,
    burnoutRisk: 0.2,
    sentimentScore: 0.4,
    source: 'survey'
  }
];

describe('WellbeingChart', () => {
  it('renders chart title correctly', () => {
    render(
      <WellbeingChart
        data={mockWellbeingData}
        metric="stressLevel"
        title="Stress Level"
      />
    );

    expect(screen.getByText('Stress Level')).toBeInTheDocument();
  });

  it('displays current value with appropriate styling', () => {
    render(
      <WellbeingChart
        data={mockWellbeingData}
        metric="energyLevel"
        title="Energy Level"
      />
    );

    // Should show the latest value (8)
    expect(screen.getByText('8.0')).toBeInTheDocument();
  });

  it('shows trend indicator', () => {
    render(
      <WellbeingChart
        data={mockWellbeingData}
        metric="energyLevel"
        title="Energy Level"
      />
    );

    // Should show trend information
    expect(screen.getByText('Trend:')).toBeInTheDocument();
  });

  it('renders chart components', () => {
    render(
      <WellbeingChart
        data={mockWellbeingData}
        metric="stressLevel"
        title="Stress Level"
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('handles burnout risk metric correctly', () => {
    render(
      <WellbeingChart
        data={mockWellbeingData}
        metric="burnoutRisk"
        title="Burnout Risk"
      />
    );

    // Should show percentage for burnout risk
    expect(screen.getByText('20%')).toBeInTheDocument(); // Latest value 0.2 = 20%
  });

  it('displays time range information', () => {
    render(
      <WellbeingChart
        data={mockWellbeingData}
        metric="stressLevel"
        title="Stress Level"
      />
    );

    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(
      <WellbeingChart
        data={[]}
        metric="stressLevel"
        title="Stress Level"
      />
    );

    expect(screen.getByText('Stress Level')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const customClass = 'custom-chart-class';
    render(
      <WellbeingChart
        data={mockWellbeingData}
        metric="stressLevel"
        title="Stress Level"
        className={customClass}
      />
    );

    const chartContainer = screen.getByText('Stress Level').closest('div');
    expect(chartContainer).toHaveClass(customClass);
  });

  describe('metric-specific behavior', () => {
    it('handles stress level with inverted color logic', () => {
      render(
        <WellbeingChart
          data={[{
            ...mockWellbeingData[0],
            stressLevel: 9 // High stress
          }]}
          metric="stressLevel"
          title="Stress Level"
        />
      );

      expect(screen.getByText('9.0')).toBeInTheDocument();
    });

    it('handles energy level correctly', () => {
      render(
        <WellbeingChart
          data={[{
            ...mockWellbeingData[0],
            energyLevel: 3 // Low energy
          }]}
          metric="energyLevel"
          title="Energy Level"
        />
      );

      expect(screen.getByText('3.0')).toBeInTheDocument();
    });

    it('handles work-life balance correctly', () => {
      render(
        <WellbeingChart
          data={mockWellbeingData}
          metric="workLifeBalance"
          title="Work-Life Balance"
        />
      );

      expect(screen.getByText('Work-Life Balance')).toBeInTheDocument();
      expect(screen.getByText('8.0')).toBeInTheDocument(); // Latest value
    });

    it('handles job satisfaction correctly', () => {
      render(
        <WellbeingChart
          data={mockWellbeingData}
          metric="jobSatisfaction"
          title="Job Satisfaction"
        />
      );

      expect(screen.getByText('Job Satisfaction')).toBeInTheDocument();
      expect(screen.getByText('9.0')).toBeInTheDocument(); // Latest value
    });
  });
});
