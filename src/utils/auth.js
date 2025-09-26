// utils/auth.js
const MOCK_USERS = JSON.parse(import.meta.env.VITE_MOCK_USERS || '[]');
const MOCK_ADMIN = JSON.parse(import.meta.env.VITE_MOCK_ADMIN || '{}');

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.loadFromStorage();
  }

  loadFromStorage() {
    const storedUser = localStorage.getItem('playloud_user');
    const storedAuth = localStorage.getItem('playloud_auth');

    if (storedUser && storedAuth === 'true') {
      this.currentUser = JSON.parse(storedUser);
      this.isAuthenticated = true;
    }
  }

  saveToStorage() {
    if (this.currentUser) {
      localStorage.setItem('playloud_user', JSON.stringify(this.currentUser));
      localStorage.setItem('playloud_auth', 'true');
    } else {
      localStorage.removeItem('playloud_user');
      localStorage.removeItem('playloud_auth');
    }

    // Dispatch custom event to notify other components of auth state change
    window.dispatchEvent(new CustomEvent('authChange'));
  }

  async login(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check admin credentials first
    if (MOCK_ADMIN.email === email && MOCK_ADMIN.password === password) {
      if (!MOCK_ADMIN.isActive) {
        throw new Error('Account is deactivated');
      }

      this.currentUser = {
        id: MOCK_ADMIN.id,
        username: MOCK_ADMIN.username,
        email: MOCK_ADMIN.email,
        name: MOCK_ADMIN.name,
        avatar: MOCK_ADMIN.avatar,
        role: MOCK_ADMIN.role,
        createdAt: MOCK_ADMIN.createdAt
      };

      this.isAuthenticated = true;
      this.saveToStorage();

      return this.currentUser;
    }

    // Find regular user by email
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    this.currentUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    this.isAuthenticated = true;
    this.saveToStorage();

    return this.currentUser;
  }

  async signup(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === userData.email || u.username === userData.username);
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Create new user
    const newUser = {
      id: Math.max(...MOCK_USERS.map(u => u.id), 0) + 1,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    MOCK_USERS.push(newUser);

    this.currentUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt
    };

    this.isAuthenticated = true;
    this.saveToStorage();

    return this.currentUser;
  }

  async forgotPassword(email) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user exists
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      throw new Error('No account found with this email address');
    }

    // In a real app, this would send a reset email
    console.log(`Password reset link sent to ${email}`);
    return { success: true, message: 'Password reset link sent to your email' };
  }

  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('playloud_user');
    localStorage.removeItem('playloud_auth');
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }

  // Admin check
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;