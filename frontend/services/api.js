/**
 * EmpowerHer Skills Portal - Frontend API Service Layer
 * Clean 8-Table Architecture: Node.js + Express + Supabase PostgreSQL
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Helper to check if a JWT token is expired on the client side
function isTokenExpired(token) {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    // Current time in seconds with 5-second grace buffer
    return payload.exp <= Math.floor(Date.now() / 1000) + 5;
  } catch (e) {
    return true;
  }
}

// Token and User session management helpers
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('empowerher_token');
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return null;
  }
  // Proactively invalidate and purge expired tokens
  if (isTokenExpired(token)) {
    clearAuth();
    return null;
  }
  return token;
};

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token && token !== 'undefined' && token !== 'null') {
    localStorage.setItem('empowerher_token', token);
  } else {
    localStorage.removeItem('empowerher_token');
  }
  window.dispatchEvent(new Event('empowerher_auth_changed'));
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('empowerher_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('empowerher_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('empowerher_user');
  }
  window.dispatchEvent(new Event('empowerher_auth_changed'));
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('empowerher_token');
  localStorage.removeItem('empowerher_user');
  window.dispatchEvent(new Event('empowerher_auth_changed'));
};

/**
 * Standardized Request Handler
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { success: res.ok, message: text };
    }

    if (!res.ok) {
      // Automatically purge stale or expired token credentials on 401 Unauthorized
      if (res.status === 401) {
        clearAuth();
      }
      const errorMsg = data?.message || data?.error || `HTTP error! Status: ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const connErr = new Error('Cannot connect to backend server. Ensure backend is running at http://localhost:5000');
      connErr.isNetworkError = true;
      throw connErr;
    }
    throw error;
  }
}

export const api = {
  // Authentication (Strictly supports 'woman', 'training_provider', 'admin')
  auth: {
    login: async (credentials) => {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (res.data?.token) {
        setAuthToken(res.data.token);
        setStoredUser(res.data.user);
      }
      return res;
    },
    register: async (userData) => {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (res.data?.token) {
        setAuthToken(res.data.token);
        setStoredUser(res.data.user);
      }
      return res;
    },
    getMe: async () => {
      return apiRequest('/auth/me');
    },
    logout: () => {
      clearAuth();
    },
  },

  // Candidate / Women Profiles
  women: {
    getMyProfile: () => apiRequest('/women/me'),
    updateMyProfile: (data) =>
      apiRequest('/women/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    addSkill: ({ skillId, proficiencyLevel, yearsExperience }) =>
      apiRequest('/women/me/skills', {
        method: 'POST',
        body: JSON.stringify({ skillId, proficiencyLevel, yearsExperience }),
      }),
    removeSkill: (skillId) =>
      apiRequest(`/women/me/skills/${skillId}`, {
        method: 'DELETE',
      }),
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/women${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiRequest(`/women/${id}`),
  },

  // Skills Taxonomy
  skills: {
    getAll: () => apiRequest('/skills'),
    getById: (id) => apiRequest(`/skills/${id}`),
    create: (data) =>
      apiRequest('/skills', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiRequest(`/skills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      apiRequest(`/skills/${id}`, {
        method: 'DELETE',
      }),
  },

  // Training Programs
  training: {
    listPrograms: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/training/programs${query ? `?${query}` : ''}`);
    },
    getProgram: (id) => apiRequest(`/training/programs/${id}`),
    createProgram: (data) =>
      apiRequest('/training/programs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateProgram: (id, data) =>
      apiRequest(`/training/programs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteProgram: (id) =>
      apiRequest(`/training/programs/${id}`, {
        method: 'DELETE',
      }),
    enroll: (programId) =>
      apiRequest(`/training/programs/${programId}/enroll`, {
        method: 'POST',
      }),
    getMyEnrollments: () => apiRequest('/training/enrollments/me'),
  },

  // Enrollments Management (Training Provider & Admin)
  enrollments: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/enrollments${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiRequest(`/enrollments/${id}`),
    updateStatus: (id, { completionStatus, score, assessmentScore, completionDate }) =>
      apiRequest(`/enrollments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completionStatus, score, assessmentScore, completionDate }),
      }),
  },

  // Job Postings (Admin managed; Candidate browses & applies)
  jobs: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/jobs${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiRequest(`/jobs/${id}`),
    create: (data) =>
      apiRequest('/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiRequest(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      apiRequest(`/jobs/${id}`, {
        method: 'DELETE',
      }),
    apply: (id, coverNote) =>
      apiRequest(`/jobs/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify({ coverNote }),
      }),
    getApplicationsForJob: (id) => apiRequest(`/jobs/${id}/applications`),
  },

  // Job Applications (Candidate & Admin)
  applications: {
    getMyApplications: () => apiRequest('/applications/me'),
    listAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/applications${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiRequest(`/applications/${id}`),
    updateStatus: (id, status) =>
      apiRequest(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Admin Console
  admin: {
    getStatistics: () => apiRequest('/admin/statistics'),
    listUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
    },
    updateUserRole: (id, role) =>
      apiRequest(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
  },
};

export default api;
