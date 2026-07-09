const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  return parseResponse(response);
}

export const api = {
  getJobs: (params = {}) => {
    const query = new URLSearchParams(params);
    const qs = query.toString();
    return request(`/jobs${qs ? `?${qs}` : ""}`);
  },

  getJobById: (jobId) => request(`/jobs/${jobId}`),

  getDashboard: () => request("/dashboard"),

  login: ({ email, password }) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: ({ name, email, password, role }) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    }),

  getApplications: () => request("/applications"),

  applyToJob: (jobId) =>
    request("/applications", {
      method: "POST",
      body: JSON.stringify({ jobId }),
    }),

  getSavedJobs: () => request("/saved-jobs"),

  saveJob: (jobId) =>
    request("/saved-jobs", {
      method: "POST",
      body: JSON.stringify({ jobId }),
    }),

  unsaveJob: (jobId) =>
    request(`/saved-jobs/${jobId}`, {
      method: "DELETE",
      headers: {},
    }),

  uploadCv: async (file) => {
    const formData = new FormData();
    formData.append("cv", file);

    const response = await fetch(`${API_BASE}/upload-cv`, {
      method: "POST",
      body: formData,
    });

    return parseResponse(response);
  },
};
