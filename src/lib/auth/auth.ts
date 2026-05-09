import { createBrowserSupabaseClient, createServerSupabaseClient } from '@/lib/database/supabase';
import { userService } from '@/lib/database/services';
import type { User } from '@/types';

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    role?: string;
    department?: string;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  department: string;
  role?: 'employee' | 'manager' | 'executive' | 'admin';
  managerId?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Client-side auth functions
export const authClient = {
  async signUp(data: SignUpData) {
    const supabase = createBrowserSupabaseClient();
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role || 'employee',
          department: data.department,
          manager_id: data.managerId
        }
      }
    });

    if (authError) throw authError;

    // Create user profile in our users table
    if (authData.user) {
      try {
        await userService.createUser({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: data.role || 'employee',
          department: data.department,
          managerId: data.managerId || undefined
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    }

    return authData;
  },

  async signIn(data: SignInData) {
    const supabase = createBrowserSupabaseClient();
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (error) throw error;
    return authData;
  },

  async signOut() {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user as AuthUser;
  },

  async getUserProfile(userId: string): Promise<User | null> {
    return await userService.getUser(userId);
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const supabase = createBrowserSupabaseClient();
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user as AuthUser || null);
    });
  },

  async resetPassword(email: string) {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    if (error) throw error;
  },

  async confirmPasswordReset(password: string) {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }
};

// Server-side auth functions
export const authServer = {
  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user as AuthUser;
  },

  async getUserProfile(userId: string): Promise<User | null> {
    return await userService.getUser(userId);
  },

  async requireAuth(): Promise<AuthUser> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }
    return user;
  },

  async requireRole(allowedRoles: string[]): Promise<User> {
    const authUser = await this.requireAuth();
    const userProfile = await this.getUserProfile(authUser.id);
    
    if (!userProfile || !allowedRoles.includes(userProfile.role)) {
      throw new Error('Insufficient permissions');
    }
    
    return userProfile;
  }
};

// Role-based access control
export const rbac = {
  canViewUserData(currentUser: User, targetUserId: string): boolean {
    // Users can view their own data
    if (currentUser.id === targetUserId) return true;
    
    // Managers can view their team members' data
    if (currentUser.role === 'manager') {
      // This would need to check if targetUserId is in currentUser's team
      return true; // Simplified for now
    }
    
    // Executives and admins can view all data
    if (currentUser.role === 'executive' || currentUser.role === 'admin') {
      return true;
    }
    
    return false;
  },

  canManageUser(currentUser: User, targetUserId: string): boolean {
    // Only managers, executives, and admins can manage users
    if (!['manager', 'executive', 'admin'].includes(currentUser.role)) {
      return false;
    }
    
    // Managers can only manage their direct reports
    if (currentUser.role === 'manager') {
      // This would need to check if targetUserId is a direct report
      return true; // Simplified for now
    }
    
    // Executives and admins can manage all users
    return true;
  },

  canViewTeamData(currentUser: User, teamId: string): boolean {
    // Team managers can view their team data
    if (currentUser.role === 'manager') {
      // This would need to check if currentUser manages this team
      return true; // Simplified for now
    }
    
    // Executives and admins can view all team data
    if (currentUser.role === 'executive' || currentUser.role === 'admin') {
      return true;
    }
    
    return false;
  },

  canViewOrganizationData(currentUser: User): boolean {
    return ['executive', 'admin'].includes(currentUser.role);
  },

  canManageIntegrations(currentUser: User): boolean {
    return currentUser.role === 'admin';
  }
};

// Auth middleware for API routes
export function withAuth(handler: Function, requiredRoles?: string[]) {
  return async (req: any, res: any) => {
    try {
      const user = await authServer.getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (requiredRoles) {
        const userProfile = await authServer.getUserProfile(user.id);
        if (!userProfile || !requiredRoles.includes(userProfile.role)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        req.user = userProfile;
      } else {
        req.user = user;
      }

      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Password validation
export const passwordValidation = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,

  validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.minLength) {
      errors.push(`Password must be at least ${this.minLength} characters long`);
    }

    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
