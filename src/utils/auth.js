// utils/auth.js
import { account, ID } from '../lib/appwrite';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
  }

  // Initialize auth state on page load
  async initializeAuth() {
    if (this.isInitialized) return;
    
    try {
      const user = await account.get();
      this.currentUser = user;
      localStorage.setItem('playloud_user', JSON.stringify(user));
      localStorage.setItem('playloud_auth', 'true');
    } catch (error) {
      // User is not logged in
      this.currentUser = null;
      localStorage.removeItem('playloud_user');
      localStorage.removeItem('playloud_auth');
    } finally {
      this.isInitialized = true;
    }
  }

  // Login method
  async login(email, password) {
    try {
      // Create email/password session
      await account.createEmailPasswordSession({
        email,
        password
      });

      // Get user data
      const user = await account.get();
      
      // Store user data
      this.currentUser = user;
      localStorage.setItem('playloud_user', JSON.stringify(user));
      localStorage.setItem('playloud_auth', 'true');

      // Dispatch auth change event
      window.dispatchEvent(new CustomEvent('authChange'));

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Signup method
  async signup({ email, password, name, username }) {
    try {
      // Create user account
      await account.create({
        userId: ID.unique(),
        email,
        password,
        name: name || username
      });

      // Automatically log in after signup
      return await this.login(email, password);
    } catch (error) {
      console.error('Signup failed:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Logout method
  async logout() {
    try {
      // Delete current session
      await account.deleteSession('current');
      
      // Clear local data
      this.currentUser = null;
      localStorage.removeItem('playloud_user');
      localStorage.removeItem('playloud_auth');

      // Dispatch auth change event
      window.dispatchEvent(new CustomEvent('authChange'));

      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails on server, clear local data
      this.currentUser = null;
      localStorage.removeItem('playloud_user');
      localStorage.removeItem('playloud_auth');
      window.dispatchEvent(new CustomEvent('authChange'));
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    return localStorage.getItem('playloud_auth') === 'true' && this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    const storedUser = localStorage.getItem('playloud_user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        return this.currentUser;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('playloud_user');
      }
    }
    
    return null;
  }

  // Update user profile
  async updateProfile(data) {
    try {
      const updatedUser = await account.updateName(data.name);
      this.currentUser = { ...this.currentUser, ...updatedUser };
      localStorage.setItem('playloud_user', JSON.stringify(this.currentUser));
      window.dispatchEvent(new CustomEvent('authChange'));
      return this.currentUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Update email
  async updateEmail(email, password) {
    try {
      await account.updateEmail(email, password);
      // Refresh user data
      const user = await account.get();
      this.currentUser = user;
      localStorage.setItem('playloud_user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('authChange'));
      return user;
    } catch (error) {
      console.error('Email update failed:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Update password
  async updatePassword(newPassword, currentPassword) {
    try {
      await account.updatePassword(newPassword, currentPassword);
      return true;
    } catch (error) {
      console.error('Password update failed:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Send password recovery email
  async forgotPassword(email) {
    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password` // Your reset password URL
      );
      return true;
    } catch (error) {
      console.error('Password recovery failed:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Complete password recovery
  async resetPassword(userId, secret, password) {
    try {
      await account.updateRecovery(userId, secret, password);
      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Get user sessions
  async getSessions() {
    try {
      return await account.listSessions();
    } catch (error) {
      console.error('Failed to get sessions:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Delete specific session
  async deleteSession(sessionId) {
    try {
      await account.deleteSession(sessionId);
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Convert Appwrite errors to user-friendly messages
  getErrorMessage(error) {
    const errorMessages = {
      'user_invalid_credentials': 'Invalid email or password',
      'user_not_found': 'No account found with this email',
      'user_already_exists': 'An account with this email already exists',
      'user_email_already_exists': 'This email is already registered',
      'user_password_mismatch': 'Current password is incorrect',
      'general_argument_invalid': 'Please check your input and try again',
      'general_rate_limit_exceeded': 'Too many requests. Please try again later',
      'user_session_not_found': 'Your session has expired. Please log in again',
    };

    const errorType = error?.type || error?.code;
    return errorMessages[errorType] || error?.message || 'An unexpected error occurred';
  }
}

// Create a single instance
const authService = new AuthService();
export default authService;