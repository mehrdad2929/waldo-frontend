const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

export const authAPI = {
  signup: (username, email, password) =>
    request('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (username, password) =>
    request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getProfile: () => request('/api/profile'),
};

export const scoreAPI = {
  submitScore: (levelId, timeMs) =>
    request('/api/score/' + levelId, {
      method: 'PUT',
      body: JSON.stringify({ levelId, timeMs }),
    }),

  getLeaderboard: (levelId) => request('/api/leaderboard/' + levelId),

  getMyScores: () => request('/api/my-scores'),
};

export const tokenService = {
  getToken,
  setToken,
  removeToken,
  isAuthenticated: () => !!getToken(),
};
