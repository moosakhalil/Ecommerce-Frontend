import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Search,
  UserPlus,
  KeyRound,
  UserCheck,
  UserX,
  Trash2,
  Loader,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
} from "lucide-react";

// API Configuration
const API_BASE_URL = "http://localhost:5000";

// Helper function to safely get display name
const getDisplayName = (nameField) => {
  if (!nameField) return "Unknown";
  if (typeof nameField === "string") {
    return nameField;
  }
  if (typeof nameField === "object" && nameField !== null) {
    return (
      nameField.displayName || nameField.name || nameField._name || "Unknown"
    );
  }
  return "Unknown";
};

// Helper function to safely get username
const getUsername = (usernameField) => {
  if (!usernameField) return "unknown";
  if (typeof usernameField === "string") {
    return usernameField;
  }
  if (typeof usernameField === "object" && usernameField !== null) {
    return (
      usernameField.username ||
      usernameField.name ||
      usernameField._username ||
      "unknown"
    );
  }
  return "unknown";
};

// DELETE USER MODAL COMPONENT
const DeleteUserModal = React.memo(
  ({ isOpen, onClose, onSubmit, loading, error, selectedUser }) => {
    const [formData, setFormData] = useState({
      password: "",
      confirmDelete: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
      if (isOpen) {
        setFormData({
          password: "",
          confirmDelete: "",
        });
        setShowPassword(false);
      }
    }, [isOpen]);

    const handleInputChange = useCallback((field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }, []);

    const handleSubmit = useCallback(
      (e) => {
        e.preventDefault();
        onSubmit(formData);
      },
      [formData, onSubmit]
    );

    if (!isOpen) return null;

    const username = String(
      getUsername(selectedUser?.username) || "Unknown User"
    );
    const isConfirmValid = formData.confirmDelete === username;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-red-200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-red-900">Delete User</h3>
              <p className="text-red-600 mt-1">This action cannot be undone</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Warning Section */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="text-red-800 font-semibold text-sm">
                  Warning: Permanent Deletion
                </h4>
                <p className="text-red-700 text-sm mt-1">
                  You are about to permanently delete user{" "}
                  <span className="font-bold">{username}</span>. This will
                  remove all their data and access.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type username to confirm:{" "}
                <span className="text-red-600">{username}</span>
              </label>
              <input
                type="text"
                value={formData.confirmDelete}
                onChange={(e) =>
                  handleInputChange("confirmDelete", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder={`Type "${username}" to confirm`}
                required
                autoComplete="off"
              />
              {formData.confirmDelete && !isConfirmValid && (
                <p className="text-red-500 text-xs mt-2">
                  Username does not match. Please type exactly: {username}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter your admin password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Required for security verification
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-sm text-red-800 font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !isConfirmValid || !formData.password}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all font-semibold shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DeleteUserModal.displayName = "DeleteUserModal";

// CREATE USER MODAL COMPONENT - FIXED INPUT FOCUS ISSUE
const CreateUserModal = React.memo(
  ({ isOpen, onClose, onSubmit, loading, error, apiCall }) => {
    const [formData, setFormData] = useState({
      username: "",
      email: "",
      password: "",
      name: "",
      roleId: "",
      permissions: [],
    });
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);

    // Fetch roles from API
    const fetchRoles = useCallback(async () => {
      try {
        setRolesLoading(true);
        console.log("Fetching roles for create user modal...");

        const response = await apiCall("/api/user-admin/roles");
        if (!response) {
          console.log("Fetch roles API call returned null");
          return;
        }

        const data = await response.json();
        if (response.ok) {
          console.log(
            "Roles fetched successfully:",
            data.roles?.length || 0,
            "roles"
          );
          setRoles(data.roles || []);

          // Set default role to first available role
          if (data.roles && data.roles.length > 0) {
            setFormData((prev) => ({ ...prev, roleId: data.roles[0]._id }));
          }
        } else {
          console.log("Fetch roles failed:", response.status, data.message);
        }
      } catch (err) {
        console.error("Fetch roles error:", err);
      } finally {
        setRolesLoading(false);
      }
    }, [apiCall]);

    // Reset form when modal opens and fetch roles
    useEffect(() => {
      if (isOpen) {
        setFormData({
          username: "",
          email: "",
          password: "",
          name: "",
          roleId: "",
          permissions: [],
        });
        setShowPassword(false);
        fetchRoles();
      }
    }, [isOpen, fetchRoles]);

    // FIXED: Individual input change handlers to prevent re-render issues
    const handleNameChange = useCallback((e) => {
      setFormData((prev) => ({ ...prev, name: e.target.value }));
    }, []);

    const handleUsernameChange = useCallback((e) => {
      setFormData((prev) => ({ ...prev, username: e.target.value }));
    }, []);

    const handleEmailChange = useCallback((e) => {
      setFormData((prev) => ({ ...prev, email: e.target.value }));
    }, []);

    const handlePasswordChange = useCallback((e) => {
      setFormData((prev) => ({ ...prev, password: e.target.value }));
    }, []);

    const handleRoleChange = useCallback((e) => {
      setFormData((prev) => ({ ...prev, roleId: e.target.value }));
    }, []);

    const handleSubmit = useCallback(
      (e) => {
        e.preventDefault();
        onSubmit(formData);
      },
      [formData, onSubmit]
    );

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Create New User
              </h3>
              <p className="text-gray-500 mt-1">
                Add a new team member to the system
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter full name"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={handleUsernameChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter username"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter email address"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Permission
              </label>
              {rolesLoading ? (
                <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 flex items-center gap-2">
                  <Loader className="animate-spin" size={16} />
                  <span className="text-gray-500">Loading roles...</span>
                </div>
              ) : (
                <select
                  value={formData.roleId}
                  onChange={handleRoleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  required
                >
                  <option value="">Select permission</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.displayName}{" "}
                      {role.userCount > 0 && `(${role.userCount} users)`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter password (min 6 characters)"
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Password must be at least 6 characters long
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-sm text-red-800 font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all font-semibold shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

CreateUserModal.displayName = "CreateUserModal";

// PASSWORD RESET MODAL COMPONENT
const PasswordResetModal = React.memo(
  ({ isOpen, onClose, onSubmit, loading, error, selectedUser }) => {
    const [formData, setFormData] = useState({
      newPassword: "",
      confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
      if (isOpen) {
        setFormData({
          newPassword: "",
          confirmPassword: "",
        });
        setShowPassword(false);
        setShowConfirmPassword(false);
      }
    }, [isOpen]);

    const handleNewPasswordChange = useCallback((e) => {
      setFormData((prev) => ({ ...prev, newPassword: e.target.value }));
    }, []);

    const handleConfirmPasswordChange = useCallback((e) => {
      setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
    }, []);

    const handleSubmit = useCallback(
      (e) => {
        e.preventDefault();
        onSubmit(formData);
      },
      [formData, onSubmit]
    );

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Reset Password
              </h3>
              <p className="text-gray-500 mt-1">
                For user:{" "}
                <span className="font-semibold">
                  {String(
                    getUsername(selectedUser?.username) || "Unknown User"
                  )}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleNewPasswordChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter new password"
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Confirm new password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-sm text-red-800 font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all font-semibold shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Resetting...
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Reset Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

PasswordResetModal.displayName = "PasswordResetModal";

// MAIN MANAGE USERS COMPONENT
const ManageUsers = ({ onNavigateBack, currentUser }) => {
  // State management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initialize component
  useEffect(() => {
    fetchUsers();
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.log("No refresh token found");
        window.location.href = "/";
        return null;
      }

      console.log("Attempting to refresh token...");
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Token refreshed successfully");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        return data.accessToken;
      } else {
        console.log("Token refresh failed:", response.status);
        window.location.href = "/";
        return null;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      window.location.href = "/";
      return null;
    }
  }, []);

  // API helper function with automatic token refresh
  const apiCall = useCallback(
    async (url, options = {}) => {
      let token = localStorage.getItem("accessToken");

      const makeRequest = async (authToken) => {
        return await fetch(`${API_BASE_URL}${url}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            ...options.headers,
          },
          ...options,
        });
      };

      // First attempt with current token
      let response = await makeRequest(token);

      // If token is expired (401) or forbidden (403), try to refresh
      if (response.status === 401 || response.status === 403) {
        console.log(
          `API call failed with ${response.status}, attempting token refresh...`
        );
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry the request with new token
          console.log("Retrying API call with new token...");
          response = await makeRequest(newToken);
        } else {
          // Refresh failed, user will be redirected
          return null;
        }
      }

      return response;
    },
    [refreshAccessToken]
  );

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching users...");
      const response = await apiCall("/api/user-admin/users");

      if (!response) {
        console.log("API call returned null, user logged out");
        return;
      }

      const data = await response.json();

      if (response.ok) {
        console.log(
          "Users fetched successfully:",
          data.users?.length || 0,
          "users"
        );

        // Sanitize user data to prevent object rendering issues
        const sanitizedUsers = (data.users || []).map((user) => ({
          _id: user._id || user.id,
          username: getUsername(user.username),
          name: getDisplayName(user.name),
          email: user.email || "No email",
          role: user.role, // Keep role object as is for displayName access
          status: user.status || "Unknown",
          lastLogin: user.lastLogin,
        }));

        setUsers(sanitizedUsers);
      } else {
        console.log("Fetch users failed:", response.status, data.message);
        setError(data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Network error while fetching users");
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Create new user
  const handleCreateUser = useCallback(
    async (formData) => {
      try {
        setLoading(true);
        setError("");

        // Validation
        if (
          !formData.username ||
          !formData.email ||
          !formData.password ||
          !formData.name ||
          !formData.roleId
        ) {
          setError("All fields are required");
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long");
          return;
        }

        console.log("Creating user:", String(formData?.username || "Unknown"));
        const response = await apiCall("/api/user-admin/users", {
          method: "POST",
          body: JSON.stringify(formData),
        });

        if (!response) {
          console.log("Create user API call returned null");
          return;
        }

        const data = await response.json();

        if (response.ok) {
          console.log(
            "User created successfully:",
            String(data?.user?.username || "Unknown")
          );
          setSuccess("User created successfully!");
          setShowCreateUserModal(false);
          fetchUsers(); // Refresh user list
        } else {
          console.log("Create user failed:", response.status, data.message);
          setError(data.message || "Failed to create user");
        }
      } catch (err) {
        console.error("Create user error:", err);
        setError("Network error while creating user");
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchUsers]
  );

  // Delete user
  const handleDeleteUser = useCallback(
    async (formData) => {
      try {
        setLoading(true);
        setError("");

        // Validation
        if (!formData.password) {
          setError("Admin password is required");
          return;
        }

        const username = String(
          getUsername(selectedUser?.username) || "Unknown User"
        );
        if (formData.confirmDelete !== username) {
          setError("Username confirmation does not match");
          return;
        }

        console.log("Deleting user:", username);
        const response = await apiCall(
          `/api/user-admin/users/${selectedUser?._id}`,
          {
            method: "DELETE",
            body: JSON.stringify({ password: formData.password }),
          }
        );

        if (!response) {
          console.log("Delete user API call returned null");
          return;
        }

        const data = await response.json();

        if (response.ok) {
          console.log("User deleted successfully:", username);
          setSuccess(`User ${username} deleted successfully!`);
          setShowDeleteUserModal(false);
          setSelectedUser(null);
          fetchUsers(); // Refresh user list
        } else {
          console.log("Delete user failed:", response.status, data.message);
          setError(data.message || "Failed to delete user");
        }
      } catch (err) {
        console.error("Delete user error:", err);
        setError("Network error while deleting user");
      } finally {
        setLoading(false);
      }
    },
    [apiCall, selectedUser, fetchUsers]
  );

  // Toggle user status
  const toggleUserStatus = useCallback(
    async (userId) => {
      try {
        setLoading(true);
        console.log("Toggling user status for:", userId);

        const response = await apiCall(
          `/api/user-admin/users/${userId}/toggle-status`,
          {
            method: "POST",
          }
        );

        if (!response) {
          console.log("Toggle status API call returned null");
          return;
        }

        const data = await response.json();

        if (response.ok) {
          console.log("User status toggled successfully");
          setSuccess(data.message);
          fetchUsers(); // Refresh user list
        } else {
          console.log("Toggle status failed:", response.status, data.message);
          setError(data.message || "Failed to toggle user status");
        }
      } catch (err) {
        console.error("Toggle status error:", err);
        setError("Network error while updating user status");
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchUsers]
  );

  // Reset user password
  const handleResetPassword = useCallback(
    async (formData) => {
      try {
        setLoading(true);
        setError("");

        if (!formData.newPassword || formData.newPassword.length < 6) {
          setError("Password must be at least 6 characters long");
          return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        console.log(
          "Resetting password for:",
          String(getUsername(selectedUser?.username) || "Unknown User")
        );
        const response = await apiCall(
          `/api/user-admin/users/${selectedUser?._id}/reset-password`,
          {
            method: "POST",
            body: JSON.stringify({ newPassword: formData.newPassword }),
          }
        );

        if (!response) {
          console.log("Reset password API call returned null");
          return;
        }

        const data = await response.json();

        if (response.ok) {
          console.log("Password reset successfully");
          setSuccess("Password reset successfully!");
          setShowPasswordModal(false);
          setSelectedUser(null);
        } else {
          console.log("Reset password failed:", response.status, data.message);
          setError(data.message || "Failed to reset password");
        }
      } catch (err) {
        console.error("Reset password error:", err);
        setError("Network error while resetting password");
      } finally {
        setLoading(false);
      }
    },
    [apiCall, selectedUser]
  );

  // Clear messages after timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const username = String(user?.username || "").toLowerCase();
      const email = String(user?.email || "").toLowerCase();
      const name = String(user?.name || "").toLowerCase();
      const roleDisplayName = String(
        user?.role?.displayName || user?.role?.name || ""
      ).toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      return (
        username.includes(searchLower) ||
        email.includes(searchLower) ||
        name.includes(searchLower) ||
        roleDisplayName.includes(searchLower)
      );
    });
  }, [users, searchTerm]);

  // Modal handlers
  const handleCloseCreateUserModal = useCallback(() => {
    setShowCreateUserModal(false);
    setError("");
  }, []);

  const handleClosePasswordModal = useCallback(() => {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setError("");
  }, []);

  const handleCloseDeleteUserModal = useCallback(() => {
    setShowDeleteUserModal(false);
    setSelectedUser(null);
    setError("");
  }, []);

  // Notification component
  const Notification = useCallback(
    ({ type, message, onClose }) => (
      <div
        className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          type === "success"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}
      >
        <div className="flex items-center gap-3">
          {type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateBack || (() => window.history.back())}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all font-medium"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    User Management
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage system users and permissions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">User Management</h1>
                <p className="text-blue-100 text-lg">
                  Manage system users and their permissions
                </p>
              </div>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all font-semibold backdrop-blur-sm border border-white/20"
              >
                <UserPlus size={20} />
                Create User
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                />
              </div>
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                <Users size={18} />
                <span className="font-semibold">
                  {filteredUsers.length} of {users.length} users
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader
                    className="animate-spin text-blue-600 mx-auto mb-4"
                    size={32}
                  />
                  <span className="text-gray-600 font-medium">
                    Loading users...
                  </span>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Permission
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Last Login
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((user, index) => {
                      // Extra safety: ensure all values are strings except role object
                      const safeUser = {
                        _id: user?._id || user?.id || index,
                        username: String(user?.username || "unknown"),
                        name: String(user?.name || "Unknown User"),
                        email: String(user?.email || "No email"),
                        role: user?.role, // Keep role object for displayName access
                        status: String(user?.status || "Unknown"),
                        lastLogin: user?.lastLogin,
                      };

                      const isSuperAdmin = user?.role?.name === "super_admin";
                      const isCurrentUser =
                        user?._id === currentUser?._id ||
                        user?.id === currentUser?.id;

                      return (
                        <tr
                          key={safeUser._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {safeUser.username.charAt(0).toUpperCase() ||
                                  "U"}
                              </div>
                              <div className="ml-4">
                                <div className="font-bold text-gray-900 text-lg">
                                  {safeUser.name}
                                </div>
                                <div className="text-gray-500 font-medium">
                                  @{safeUser.username}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {safeUser.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <span className="inline-flex px-3 py-2 text-sm font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl">
                              {user?.role?.displayName ||
                                user?.role?.name ||
                                String(user?.role || "Unknown Role")}
                            </span>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-2 text-sm font-bold rounded-xl ${
                                safeUser.status === "active"
                                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                                  : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800"
                              }`}
                            >
                              {safeUser.status}
                            </span>
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap text-gray-600 font-medium">
                            {safeUser.lastLogin
                              ? new Date(
                                  safeUser.lastLogin
                                ).toLocaleDateString()
                              : "Never"}
                          </td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {/* Toggle Status Button */}
                              <button
                                onClick={() =>
                                  toggleUserStatus(user?._id || user?.id)
                                }
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  safeUser.status === "active"
                                    ? "text-orange-600 hover:bg-orange-50 bg-orange-50/50 border border-orange-200"
                                    : "text-green-600 hover:bg-green-50 bg-green-50/50 border border-green-200"
                                }`}
                                title={
                                  safeUser.status === "active"
                                    ? "Deactivate User"
                                    : "Activate User"
                                }
                              >
                                {safeUser.status === "active" ? (
                                  <UserX size={16} />
                                ) : (
                                  <UserCheck size={16} />
                                )}
                              </button>

                              {/* Reset Password Button */}
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowPasswordModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 bg-blue-50/50 rounded-lg transition-all duration-200 border border-blue-200"
                                title="Reset Password"
                                disabled={isSuperAdmin && isCurrentUser}
                              >
                                <KeyRound size={16} />
                              </button>

                              {/* Delete User Button */}
                              <button
                                onClick={() => {
                                  if (!isSuperAdmin && !isCurrentUser) {
                                    setSelectedUser(user);
                                    setShowDeleteUserModal(true);
                                  }
                                }}
                                className={`p-2 rounded-lg transition-all duration-200 border ${
                                  isSuperAdmin || isCurrentUser
                                    ? "text-gray-400 bg-gray-50/50 border-gray-200 cursor-not-allowed opacity-50"
                                    : "text-red-600 hover:bg-red-50 bg-red-50/50 border-red-200 hover:border-red-300 hover:text-red-700"
                                }`}
                                title={
                                  isSuperAdmin
                                    ? "Cannot delete Super Admin"
                                    : isCurrentUser
                                    ? "Cannot delete your own account"
                                    : "Delete User"
                                }
                                disabled={isSuperAdmin || isCurrentUser}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={handleCloseCreateUserModal}
        onSubmit={handleCreateUser}
        loading={loading}
        error={error}
        apiCall={apiCall}
      />

      <PasswordResetModal
        isOpen={showPasswordModal}
        onClose={handleClosePasswordModal}
        onSubmit={handleResetPassword}
        loading={loading}
        error={error}
        selectedUser={selectedUser}
      />

      <DeleteUserModal
        isOpen={showDeleteUserModal}
        onClose={handleCloseDeleteUserModal}
        onSubmit={handleDeleteUser}
        loading={loading}
        error={error}
        selectedUser={selectedUser}
      />

      {/* Notifications */}
      {error && (
        <Notification
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}
      {success && (
        <Notification
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}
    </div>
  );
};

export default ManageUsers;
