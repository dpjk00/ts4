class AuthService {
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';

  async login(token: string): Promise<void> {
    const response = await fetch('/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem(this.tokenKey, data.token);
      localStorage.setItem(this.refreshTokenKey, data.refreshToken);
    } else {
      throw new Error(data.message || 'Invalid login');
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem(this.tokenKey, data.token);
    } else {
      throw new Error(data.message || 'Failed to refresh token');
    }
  }
}

const authService = new AuthService();
export default authService;
