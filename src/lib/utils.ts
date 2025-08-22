import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export const dateUtils = {
  formatDate: (date: Date) => format(date, "MMM dd, yyyy"),
  formatDateTime: (date: Date) => format(date, "MMM dd, yyyy HH:mm"),
  formatTime: (date: Date) => format(date, "HH:mm"),
  
  getDateRange: (period: 'week' | 'month' | 'quarter' | 'year') => {
    const now = new Date();
    switch (period) {
      case 'week':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        return {
          start: quarterStart,
          end: quarterEnd
        };
      case 'year':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31)
        };
      default:
        return {
          start: subDays(now, 7),
          end: now
        };
    }
  },
  
  getLast30Days: () => {
    const end = new Date();
    const start = subDays(end, 30);
    return { start, end };
  }
};

// Number utilities
export const numberUtils = {
  formatPercentage: (value: number) => `${Math.round(value * 100)}%`,
  formatDecimal: (value: number, decimals: number = 1) => value.toFixed(decimals),
  formatLargeNumber: (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }
};

// Color utilities for charts and indicators
export const colorUtils = {
  getWellbeingColor: (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 6) return "text-yellow-600 bg-yellow-100";
    if (score >= 4) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  },
  
  getBurnoutRiskColor: (risk: number) => {
    if (risk <= 0.3) return "text-green-600 bg-green-100";
    if (risk <= 0.6) return "text-yellow-600 bg-yellow-100";
    if (risk <= 0.8) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  },
  
  getAlertSeverityColor: (severity: string) => {
    switch (severity) {
      case 'low': return "text-blue-600 bg-blue-100";
      case 'medium': return "text-yellow-600 bg-yellow-100";
      case 'high': return "text-orange-600 bg-orange-100";
      case 'critical': return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  }
};

// Data processing utilities
export const dataUtils = {
  calculateAverage: (values: number[]) => {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  },
  
  calculateTrend: (values: number[]) => {
    if (values.length < 2) return 0;
    const recent = values.slice(-7).reduce((sum, val) => sum + val, 0) / Math.min(7, values.length);
    const previous = values.slice(-14, -7).reduce((sum, val) => sum + val, 0) / Math.min(7, values.slice(-14, -7).length);
    return recent - previous;
  },
  
  normalizeScore: (value: number, min: number, max: number) => {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  },
  
  generateMockData: (days: number, baseValue: number, variance: number) => {
    return Array.from({ length: days }, (_, i) => ({
      date: format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd'),
      value: baseValue + (Math.random() - 0.5) * variance
    }));
  }
};

// Validation utilities
export const validationUtils = {
  isValidEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  isValidScore: (score: number, min: number = 0, max: number = 10) => {
    return score >= min && score <= max;
  },
  
  sanitizeInput: (input: string) => {
    return input.trim().replace(/[<>]/g, '');
  }
};

// Local storage utilities
export const storageUtils = {
  setItem: (key: string, value: unknown) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
  
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  },
  
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};
