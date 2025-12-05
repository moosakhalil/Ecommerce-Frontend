const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem("accessToken");

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request
          config.headers.Authorization = `Bearer ${localStorage.getItem(
            "accessToken"
          )}`;
          return fetch(url, config).then((res) => res.json());
        } else {
          // Redirect to login
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
      }

      return response.json();
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  // Auth methods
  login(credentials) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // Admin methods
  getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/users?${query}`);
  }

  createUser(userData) {
    return this.request("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  updateUser(id, userData) {
    return this.request(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  resetUserPassword(id, newPassword) {
    return this.request(`/api/admin/users/${id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    });
  }

  toggleUserStatus(id) {
    return this.request(`/api/admin/users/${id}/toggle-status`, {
      method: "POST",
    });
  }
}

export const api = new ApiClient();
