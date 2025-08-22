// Global type declarations for PulseFlow

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      SLACK_BOT_TOKEN?: string;
      SLACK_SIGNING_SECRET?: string;
      SLACK_APP_TOKEN?: string;
      SALESFORCE_CLIENT_ID?: string;
      SALESFORCE_CLIENT_SECRET?: string;
      SALESFORCE_USERNAME?: string;
      SALESFORCE_PASSWORD?: string;
      SALESFORCE_SECURITY_TOKEN?: string;
      OPENAI_API_KEY?: string;
      NEXTAUTH_SECRET?: string;
      NEXTAUTH_URL?: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }

  // Extend Jest matchers
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any[]): R;
    }
  }

  // Window extensions for browser APIs
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Module declarations for packages without types
declare module '@slack/bolt' {
  export class App {
    constructor(options: any);
    command(pattern: string, handler: any): void;
    action(pattern: string, handler: any): void;
    view(pattern: string, handler: any): void;
    event(pattern: string, handler: any): void;
    start(): Promise<void>;
    stop(): Promise<void>;
  }

  export interface SlashCommand {
    command: string;
    text: string;
    user_id: string;
    trigger_id: string;
  }

  export interface BlockAction {
    actions: Array<{
      value: string;
      action_id: string;
    }>;
    user: {
      id: string;
    };
  }

  export interface ButtonAction extends BlockAction {}
}

declare module 'recharts' {
  export const LineChart: any;
  export const Line: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const ResponsiveContainer: any;
  export const AreaChart: any;
  export const Area: any;
  export const ScatterChart: any;
  export const Scatter: any;
  export const BarChart: any;
  export const Bar: any;
  export const PieChart: any;
  export const Pie: any;
  export const Cell: any;
  export const ReferenceLine: any;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Export empty object to make this a module
export {};
