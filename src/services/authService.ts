// src/services/authService.ts
export const authService = {
  async login(credentials: { email: string; password: string }) {
    const response = await fetch('https://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return data;
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
  }) {
    const response = await fetch('https://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  }
};