/**
 * EmpowerHer Skills Portal - Frontend API Service Layer
 * Reuses existing backend endpoints: Node.js + Express + Supabase PostgreSQL
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Token and User session management helpers
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('empowerher_token');
};

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('empowerher_token', token);
  } else {
    localStorage.removeItem('empowerher_token');
  }
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
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('empowerher_token');
  localStorage.removeItem('empowerher_user');
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
      const errorMsg = data?.message || data?.error || `HTTP error! Status: ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    // If backend is unreachable or CORS fails, format gracefully
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const connErr = new Error('Cannot connect to backend server. Ensure backend is running at http://localhost:5000');
      connErr.isNetworkError = true;
      throw connErr;
    }
    throw error;
  }
}

export const api = {
  // Authentication
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

  // Candidate / Women
  women: {
    getMyProfile: () => apiRequest('/women/me'),
    updateMyProfile: (data) =>
      apiRequest('/women/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    addSkill: ({ skillId, proficiencyLevel }) =>
      apiRequest('/women/me/skills', {
        method: 'POST',
        body: JSON.stringify({ skillId, proficiencyLevel }),
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

  // Skills
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

  // Training Programs & Enrollments
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
    enroll: (programId) =>
      apiRequest(`/training/programs/${programId}/enroll`, {
        method: 'POST',
      }),
    getMyEnrollments: () => apiRequest('/training/enrollments/me'),
  },

  // Enrollments Management (Training Provider & Admin)
  enrollments: {
    list: () => apiRequest('/enrollments'),
    getById: (id) => apiRequest(`/enrollments/${id}`),
    updateStatus: (id, { completionStatus, score }) =>
      apiRequest(`/enrollments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completionStatus, score }),
      }),
  },

  // Jobs
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
    apply: (id) =>
      apiRequest(`/jobs/${id}/apply`, {
        method: 'POST',
      }),
    getApplicationsForJob: (id) => apiRequest(`/jobs/${id}/applications`),
  },

  // Applications (Candidate & Employer)
  applications: {
    getMyApplications: () => apiRequest('/applications/me'),
    getById: (id) => apiRequest(`/applications/${id}`),
    updateStatus: (id, status) =>
      apiRequest(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    scheduleInterview: (id, interviewData) =>
      apiRequest(`/applications/${id}/interviews`, {
        method: 'POST',
        body: JSON.stringify(interviewData),
      }),
  },

  // Interviews
  interviews: {
    getMyInterviews: () => apiRequest('/interviews/me'),
    getById: (id) => apiRequest(`/interviews/${id}`),
    update: (id, data) =>
      apiRequest(`/interviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  // Certifications
  certifications: {
    getMyCertificates: () => apiRequest('/certifications/me'),
    getById: (id) => apiRequest(`/certifications/${id}`),
    record: (data) =>
      apiRequest('/certifications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Employment Records
  employment: {
    getMyEmployment: () => apiRequest('/employment/me'),
    getById: (id) => apiRequest(`/employment/${id}`),
    recordPlacement: (data) =>
      apiRequest('/employment', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id, employmentStatus) =>
      apiRequest(`/employment/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ employmentStatus }),
      }),
  },

  // Employers
  employers: {
    getMyProfile: () => apiRequest('/employers/me'),
    updateMyProfile: (data) =>
      apiRequest('/employers/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    list: () => apiRequest('/employers'),
    getById: (id) => apiRequest(`/employers/${id}`),
  },

  // Admin Portal
  admin: {
    getStatistics: () => apiRequest('/admin/statistics'),
    listUsers: () => apiRequest('/admin/users'),
    updateUserRole: (id, role) =>
      apiRequest(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
  },
};

export default api;
