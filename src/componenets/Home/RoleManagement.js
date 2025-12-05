import React, { useState, useEffect, useCallback, useMemo } from "react";

// Simple icon replacements for lucide-react
const Shield = () => <span>🛡️</span>;
const Users = () => <span>👥</span>;
const Package = () => <span>📦</span>;
const Plus = () => <span>➕</span>;
const Edit = () => <span>✏️</span>;
const Trash2 = () => <span>🗑️</span>;
const Lock = () => <span>🔒</span>;
const X = () => <span>✕</span>;
const Crown = () => <span>👑</span>;
const Key = () => <span>🔑</span>;
const AlertCircle = () => <span>⚠️</span>;
const CheckCircle = () => <span>✅</span>;
const Loader = () => <span>⏳</span>;
const Search = () => <span>🔍</span>;
const Eye = () => <span>👁️</span>;
const ArrowLeft = () => <span>←</span>;

const PermissionsManager = ({ onNavigateBack, currentUser }) => {
  // State management
  const [activeTab, setActiveTab] = useState("permissions");
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [components, setComponents] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showCreatePermissionModal, setShowCreatePermissionModal] =
    useState(false);
  const [showEditPermissionModal, setShowEditPermissionModal] = useState(false);
  const [showDeletePermissionModal, setShowDeletePermissionModal] =
    useState(false);
  const [showUserPermissionModal, setShowUserPermissionModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showResetPermissionsModal, setShowResetPermissionsModal] =
    useState(false);
  const [showForceResetOption, setShowForceResetOption] = useState(false);

  // Password verification modal
  const [showPasswordVerificationModal, setShowPasswordVerificationModal] =
    useState(false);

  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Password verification states
  const [verificationPassword, setVerificationPassword] = useState("");
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [verificationAction, setVerificationAction] = useState(null);

  // Search and filter states
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedPermissionFilter, setSelectedPermissionFilter] = useState("");

  // Form states
  const [permissionFormData, setPermissionFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    components: [],
    categories: [],
    priority: 0,
  });

  const API_BASE_URL = "http://localhost:5000";

  // API helper function - matching login component structure
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      console.log(`Making API call to: ${url}`);
      const response = await fetch(url, config);
      return response;
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }, []);

  // Get current user data for debugging
  const getCurrentUser = useCallback(() => {
    // Try to get user from localStorage if not passed as prop
    if (!currentUser) {
      try {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.error("Error parsing stored user:", error);
        return null;
      }
    }
    return currentUser;
  }, [currentUser]);

  // Handle password verification - simplified since backend now handles verification
  const handlePasswordVerification = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const user = getCurrentUser();
      if (!user?.username) {
        throw new Error(
          "Current user information not available. Please log in again."
        );
      }

      console.log(
        "Proceeding with verified password for action:",
        verificationAction
      );

      setShowPasswordVerificationModal(false);
      setPasswordAttempts(0);

      if (verificationAction === "delete-permission") {
        await handleDeletePermission(
          selectedPermission._id,
          verificationPassword
        );
      } else if (verificationAction === "bulk-delete") {
        await handleBulkDeletePermissions(verificationPassword);
      } else if (verificationAction === "reset-permissions") {
        await handleResetPermissions(verificationPassword);
      }

      setVerificationPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    getCurrentUser,
    verificationPassword,
    verificationAction,
    selectedPermission,
    selectedPermissions,
  ]);

  // Fetch data functions
  const fetchPermissions = useCallback(async () => {
    try {
      const response = await apiCall("/api/user-admin/roles");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch permissions");
      }

      setPermissions(data.roles || []);
    } catch (err) {
      setError("Failed to fetch permissions");
      console.error(err);
    }
  }, [apiCall]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await apiCall("/api/user-admin/users");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    }
  }, [apiCall]);

  const fetchComponents = useCallback(async () => {
    try {
      const response = await apiCall("/api/user-admin/components");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch components");
      }

      setComponents(data.components || {});
    } catch (err) {
      setError("Failed to fetch components");
      console.error(err);
    }
  }, [apiCall]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPermissions(),
          fetchUsers(),
          fetchComponents(),
        ]);
      } catch (err) {
        setError("Failed to initialize data");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [fetchPermissions, fetchUsers, fetchComponents]);

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

  // Create permission
  const handleCreatePermission = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall("/api/user-admin/roles", {
        method: "POST",
        body: JSON.stringify(permissionFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create permission group");
      }

      setSuccess("Permission group created successfully!");
      setShowCreatePermissionModal(false);
      await fetchPermissions();
      setPermissionFormData({
        name: "",
        displayName: "",
        description: "",
        components: [],
        categories: [],
        priority: 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiCall, fetchPermissions, permissionFormData]);

  // Update permission
  const handleUpdatePermission = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall(
        `/api/user-admin/roles/${selectedPermission._id}`,
        {
          method: "PUT",
          body: JSON.stringify(permissionFormData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update permission group");
      }

      setSuccess("Permission group updated successfully!");
      setShowEditPermissionModal(false);
      await fetchPermissions();
      setSelectedPermission(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiCall, fetchPermissions, permissionFormData, selectedPermission]);

  // Delete permission (with password verification handled by backend)
  const handleDeletePermission = useCallback(
    async (permissionId, password = null) => {
      try {
        setLoading(true);

        const permission = permissions.find((p) => p._id === permissionId);

        if (permission?.name === "super_admin") {
          throw new Error("Cannot delete the super_admin permission group");
        }

        // If no password provided, show verification modal
        if (!password) {
          console.log("No password provided, showing verification modal");
          setSelectedPermission(permission);
          setVerificationAction("delete-permission");
          setShowPasswordVerificationModal(true);
          return;
        }

        console.log("Deleting permission group with password verification");

        // Send delete request with password to backend
        const response = await apiCall(
          `/api/user-admin/roles/${permissionId}`,
          {
            method: "DELETE",
            body: JSON.stringify({ password }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete permission group");
        }

        setSuccess("Permission group deleted successfully!");
        setShowDeletePermissionModal(false);
        await fetchPermissions();
        setSelectedPermission(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchPermissions, permissions]
  );

  // Individual input change handlers to prevent focus loss - THIS IS THE KEY FIX
  const handleDisplayNameChange = useCallback((e) => {
    const displayName = e.target.value;
    setPermissionFormData((prev) => ({
      ...prev,
      displayName: displayName,
      name: displayName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, ""),
    }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setPermissionFormData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  }, []);

  const handlePriorityChange = useCallback((e) => {
    setPermissionFormData((prev) => ({
      ...prev,
      priority: parseInt(e.target.value),
    }));
  }, []);

  // Bulk delete permissions (with password verification handled by backend)
  const handleBulkDeletePermissions = useCallback(
    async (password = null) => {
      try {
        setLoading(true);

        // Filter out protected permissions (super_admin and system permissions)
        const eligiblePermissions = selectedPermissions.filter(
          (permissionId) => {
            const permission = permissions.find((p) => p._id === permissionId);
            return (
              permission &&
              !permission.isSystemRole &&
              permission.name !== "super_admin"
            );
          }
        );

        if (eligiblePermissions.length === 0) {
          throw new Error(
            "No eligible permission groups selected for deletion. Cannot delete super_admin or system permission groups."
          );
        }

        if (eligiblePermissions.length !== selectedPermissions.length) {
          const skippedCount =
            selectedPermissions.length - eligiblePermissions.length;
          console.warn(
            `Skipping ${skippedCount} protected permission groups from bulk delete`
          );
        }

        if (!password) {
          setVerificationAction("bulk-delete");
          setShowPasswordVerificationModal(true);
          setShowBulkDeleteModal(false);
          return;
        }

        console.log(
          `Bulk deleting ${eligiblePermissions.length} permission groups with password verification`
        );

        // Send bulk delete request with password to backend
        const response = await apiCall("/api/user-admin/roles/bulk-delete", {
          method: "POST",
          body: JSON.stringify({
            roleIds: eligiblePermissions,
            password: password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle specific error cases
          if (data.affectedUsers > 0) {
            const permissionUsageText = Object.entries(data.roleUsage || {})
              .map(([permission, count]) => `${permission}: ${count} users`)
              .join(", ");
            throw new Error(
              `Cannot delete permission groups with assigned users:\n${permissionUsageText}\n\nPlease reassign users to other permission groups first.`
            );
          } else if (data.protectedRoles && data.protectedRoles.length > 0) {
            const protectedText = data.protectedRoles
              .map((p) => `${p.displayName} (${p.reason})`)
              .join(", ");
            throw new Error(
              `Cannot delete protected permission groups: ${protectedText}`
            );
          }
          throw new Error(data.message || "Failed to delete permission groups");
        }

        // Success message with details
        const deletedCount = data.deletedCount || eligiblePermissions.length;
        const skippedCount = selectedPermissions.length - deletedCount;

        let successMessage = `Successfully deleted ${deletedCount} permission group(s)!`;
        if (skippedCount > 0) {
          successMessage += ` (${skippedCount} protected permission groups were skipped)`;
        }

        setSuccess(successMessage);
        setSelectedPermissions([]);
        setShowBulkDeleteModal(false);
        await fetchPermissions();
      } catch (err) {
        setError(err.message);
        setShowBulkDeleteModal(false);
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchPermissions, selectedPermissions, permissions]
  );

  // Reset permissions (with password verification handled by backend)
  const handleResetPermissions = useCallback(
    async (password = null) => {
      try {
        setLoading(true);

        if (!password) {
          setVerificationAction("reset-permissions");
          setShowPasswordVerificationModal(true);
          return;
        }

        console.log("Resetting permission groups with password verification");

        const response = await apiCall("/api/user-admin/roles/reset", {
          method: "POST",
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to reset permission groups");
        }

        setSuccess(data.message);
        setShowResetPermissionsModal(false);
        await fetchPermissions();
      } catch (err) {
        if (err.message.includes("assigned to custom roles")) {
          setError(
            `${err.message}. Would you like to reassign users and force reset?`
          );
          setShowForceResetOption(true);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchPermissions]
  );

  // Force reset permissions (reassigns users automatically)
  const handleForceResetPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiCall("/api/user-admin/roles/force-reset", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to force reset permission groups"
        );
      }

      setSuccess(data.message);
      setShowResetPermissionsModal(false);
      setShowForceResetOption(false);
      await fetchPermissions();
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiCall, fetchPermissions, fetchUsers]);

  // Toggle permission selection for bulk operations
  const togglePermissionSelection = useCallback(
    (permissionId) => {
      const permission = permissions.find((p) => p._id === permissionId);
      if (permission?.name === "super_admin") return; // Can't select super_admin

      setSelectedPermissions((prev) =>
        prev.includes(permissionId)
          ? prev.filter((id) => id !== permissionId)
          : [...prev, permissionId]
      );
    },
    [permissions]
  );

  // Select all non-super_admin permissions
  const selectAllPermissions = useCallback(() => {
    const selectablePermissionIds = permissions
      .filter((permission) => permission.name !== "super_admin")
      .map((permission) => permission._id);
    setSelectedPermissions(selectablePermissionIds);
  }, [permissions]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedPermissions([]);
  }, []);

  // Update user permission
  const handleUpdateUserPermission = useCallback(
    async (userId, permissionId) => {
      try {
        setLoading(true);
        const response = await apiCall(`/api/user-admin/users/${userId}/role`, {
          method: "PUT",
          body: JSON.stringify({ roleId: permissionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update user permissions");
        }

        setSuccess("User permissions updated successfully!");
        setShowUserPermissionModal(false);
        await fetchUsers();
        setSelectedUser(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchUsers]
  );

  // Component assignment helpers
  const toggleComponent = useCallback((componentId, categoryKey) => {
    setPermissionFormData((prev) => {
      const newComponents = prev.components.includes(componentId)
        ? prev.components.filter((id) => id !== componentId)
        : [...prev.components, componentId];

      const newCategories = prev.categories.includes(categoryKey)
        ? prev.categories
        : [...prev.categories, categoryKey];

      return {
        ...prev,
        components: newComponents,
        categories: newCategories,
      };
    });
  }, []);

  const toggleCategory = useCallback(
    (categoryKey) => {
      setPermissionFormData((prev) => {
        const categoryComponents =
          components[categoryKey]?.components?.map((c) => c.id) || [];
        const hasAllComponents = categoryComponents.every((id) =>
          prev.components.includes(id)
        );

        let newComponents;
        let newCategories;

        if (hasAllComponents) {
          // Remove all components from this category
          newComponents = prev.components.filter(
            (id) => !categoryComponents.includes(id)
          );
          newCategories = prev.categories.filter((cat) => cat !== categoryKey);
        } else {
          // Add all components from this category
          newComponents = [
            ...new Set([...prev.components, ...categoryComponents]),
          ];
          newCategories = prev.categories.includes(categoryKey)
            ? prev.categories
            : [...prev.categories, categoryKey];
        }

        return {
          ...prev,
          components: newComponents,
          categories: newCategories,
        };
      });
    },
    [components]
  );

  // Filtered data
  const filteredPermissions = useMemo(() => {
    return permissions.filter(
      (permission) =>
        permission.displayName
          .toLowerCase()
          .includes(permissionSearchTerm.toLowerCase()) ||
        permission.name
          .toLowerCase()
          .includes(permissionSearchTerm.toLowerCase()) ||
        permission.description
          .toLowerCase()
          .includes(permissionSearchTerm.toLowerCase())
    );
  }, [permissions, permissionSearchTerm]);

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    if (selectedPermissionFilter) {
      filtered = filtered.filter(
        (user) => user.role._id === selectedPermissionFilter
      );
    }

    return filtered;
  }, [users, userSearchTerm, selectedPermissionFilter]);

  // Separate super_admin from other permissions
  const superAdminPermission = useMemo(
    () =>
      filteredPermissions.find(
        (permission) => permission.name === "super_admin"
      ),
    [filteredPermissions]
  );
  const otherPermissions = useMemo(
    () =>
      filteredPermissions.filter(
        (permission) => permission.name !== "super_admin"
      ),
    [filteredPermissions]
  );

  // Simple Modal Component
  const SimpleModal = ({
    isOpen,
    onClose,
    title,
    children,
    onSave,
    saveText = "Save",
    showSave = true,
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Footer */}
          {showSave && (
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader />}
                {saveText}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Password Verification Modal
  const PasswordVerificationModal = () => {
    const user = getCurrentUser();

    return (
      <SimpleModal
        isOpen={showPasswordVerificationModal}
        onClose={() => {
          setShowPasswordVerificationModal(false);
          setVerificationPassword("");
          setPasswordAttempts(0);
          setError("");
        }}
        title="Admin Password Verification Required"
        onSave={handlePasswordVerification}
        saveText="Verify & Continue"
      >
        <div className="text-center">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Lock />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {verificationAction === "delete-permission"
              ? "Permission Group Deletion"
              : verificationAction === "bulk-delete"
              ? "Bulk Permission Group Deletion"
              : "Reset Permission Groups"}
          </h3>
          <p className="text-gray-600 mb-6">
            This action requires admin password verification for security.
            {user?.username && (
              <>
                <br />
                Verifying as: <strong>{user.username}</strong>
              </>
            )}
          </p>

          {!user?.username && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">
                ⚠️ Current user information not available. Please refresh the
                page and log in again.
              </p>
            </div>
          )}

          {passwordAttempts > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">
                Invalid password. {3 - passwordAttempts} attempt(s) remaining.
                {passwordAttempts >= 2 &&
                  " (You will be locked out after next failed attempt)"}
              </p>
            </div>
          )}

          <div className="text-left mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password {user?.username && `(${user.username})`}
            </label>
            <input
              type="password"
              value={verificationPassword}
              onChange={(e) => {
                setVerificationPassword(e.target.value);
                setError(""); // Clear error when user types
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your admin password"
              autoFocus
              disabled={!user?.username}
              onKeyPress={(e) => {
                if (e.key === "Enter" && user?.username) {
                  handlePasswordVerification();
                }
              }}
            />
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-800">
              <h4 className="font-medium mb-2">⚠️ Warning:</h4>
              <p>
                {verificationAction === "delete-permission"
                  ? `You are about to delete permission group "${selectedPermission?.displayName}". This action cannot be undone.`
                  : verificationAction === "bulk-delete"
                  ? `You are about to delete ${selectedPermissions.length} permission group(s). This action cannot be undone.`
                  : "You are about to reset all permission groups (except super_admin). This action cannot be undone."}
              </p>
            </div>
          </div>
        </div>
      </SimpleModal>
    );
  };

  // Permission Card Component
  const PermissionCard = ({ permission, isSuperAdmin = false }) => (
    <div
      key={permission._id}
      className={`border-2 rounded-lg p-4 transition-all ${
        selectedPermissions.includes(permission._id)
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {/* Selection Checkbox */}
          {!isSuperAdmin && (
            <input
              type="checkbox"
              checked={selectedPermissions.includes(permission._id)}
              onChange={() => togglePermissionSelection(permission._id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          )}
          <div
            className={`p-2 rounded ${
              isSuperAdmin
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {isSuperAdmin ? <Lock /> : <Key />}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {permission.displayName}
            </h3>
            <p className="text-sm text-gray-500">@{permission.name}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              permission.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {permission.isActive ? "Active" : "Inactive"}
          </span>
          {isSuperAdmin && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
              Super Admin
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-600 mb-3 text-sm">{permission.description}</p>

      <div className="flex justify-between text-sm text-gray-500 mb-3 bg-gray-50 rounded p-2">
        <span>{permission.userCount} users</span>
        <span>{permission.components?.length || 0} components</span>
        <span>Priority: {permission.priority}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setSelectedPermission(permission);
            setShowEditPermissionModal(true);
          }}
          className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium text-sm flex items-center justify-center gap-1"
        >
          <Edit />
          Edit
        </button>
        {isSuperAdmin ? (
          <button
            disabled
            className="px-3 py-2 bg-gray-100 text-gray-500 rounded font-medium text-sm cursor-not-allowed"
          >
            Cannot Delete
          </button>
        ) : (
          <button
            onClick={() => handleDeletePermission(permission._id)}
            className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium text-sm flex items-center gap-1"
          >
            <Trash2 />
            Delete
          </button>
        )}
      </div>
    </div>
  );

  // Initialize form data when modals open
  useEffect(() => {
    if (showCreatePermissionModal) {
      setPermissionFormData({
        name: "",
        displayName: "",
        description: "",
        components: [],
        categories: [],
        priority: 0,
      });
    }
  }, [showCreatePermissionModal]);

  useEffect(() => {
    if (showEditPermissionModal && selectedPermission) {
      setPermissionFormData({
        name: selectedPermission.name || "",
        displayName: selectedPermission.displayName || "",
        description: selectedPermission.description || "",
        components: selectedPermission.components || [],
        categories: selectedPermission.categories || [],
        priority: selectedPermission.priority || 0,
      });
    }
  }, [showEditPermissionModal, selectedPermission]);

  // Debug current user
  useEffect(() => {
    const user = getCurrentUser();
    console.log("PermissionsManager currentUser prop:", currentUser);
    console.log("PermissionsManager effective user:", user);
    console.log("User username:", user?.username);
    console.log("User from localStorage:", localStorage.getItem("user"));
  }, [currentUser, getCurrentUser]);

  // Main Render
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
                <ArrowLeft />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Shield />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Access Control & Permissions
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage system access permissions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-1 mb-6">
          <div className="flex">
            {[
              {
                id: "permissions",
                label: "Permission Groups",
                icon: <Crown />,
              },
              {
                id: "users",
                label: "User Assignments",
                icon: <Users />,
              },
              { id: "overview", label: "Overview", icon: <Eye /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "permissions" && (
          <div className="space-y-6">
            {/* Super Admin Permission Section */}
            {superAdminPermission && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Lock />
                      Super Admin Permissions
                    </h2>
                    <p className="text-gray-600">
                      Core system permissions with full administrative access
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PermissionCard
                    key={superAdminPermission._id}
                    permission={superAdminPermission}
                    isSuperAdmin={true}
                  />
                </div>
              </div>
            )}

            {/* All Other Permissions Section */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Key />
                    Custom Permission Groups
                  </h2>
                  <p className="text-gray-600">
                    User-defined permission groups and access levels
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreatePermissionModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                  >
                    <Plus />
                    Create Permission Group
                  </button>
                  <button
                    onClick={() => setShowResetPermissionsModal(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
                  >
                    <Trash2 />
                    Reset All
                  </button>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {selectedPermissions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedPermissions.length} permission group(s)
                        selected
                      </span>
                      <button
                        onClick={clearSelection}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear selection
                      </button>
                    </div>
                    <button
                      onClick={() => handleBulkDeletePermissions()}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 text-sm"
                    >
                      <Trash2 />
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-4 flex justify-between items-center">
                <div className="relative max-w-md">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search permission groups..."
                    value={permissionSearchTerm}
                    onChange={(e) => setPermissionSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllPermissions}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {otherPermissions.map((permission) => (
                  <PermissionCard
                    key={permission._id}
                    permission={permission}
                    isSuperAdmin={false}
                  />
                ))}
              </div>

              {/* Empty State */}
              {otherPermissions.length === 0 && (
                <div className="text-center py-12">
                  <Crown />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No permission groups found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {permissionSearchTerm
                      ? "No permission groups match your search."
                      : "Get started by creating your first permission group."}
                  </p>
                  {!permissionSearchTerm && (
                    <button
                      onClick={() => setShowCreatePermissionModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 mx-auto"
                    >
                      <Plus />
                      Create First Permission Group
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              User Permission Assignments
            </h2>

            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedPermissionFilter}
                onChange={(e) => setSelectedPermissionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Permission Groups</option>
                {permissions.map((permission) => (
                  <option key={permission._id} value={permission._id}>
                    {permission.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Permission Group
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {user.role?.displayName || "No Permissions"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserPermissionModal(true);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium text-sm"
                        >
                          Change Permissions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Crown />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Permission Groups
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {permissions.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Total Users
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      {users.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Package />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Components
                    </h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {Object.values(components).reduce(
                        (total, category) =>
                          total + (category.components?.length || 0),
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Permission Group Distribution
              </h3>
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div
                    key={permission._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded ${
                          permission.name === "super_admin"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {permission.name === "super_admin" ? <Lock /> : <Key />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {permission.displayName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {permission.components?.length || 0} components
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {permission.userCount}
                      </div>
                      <div className="text-sm text-gray-500">users</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <PasswordVerificationModal />

      {/* Create Permission Modal */}
      <SimpleModal
        isOpen={showCreatePermissionModal}
        onClose={() => setShowCreatePermissionModal(false)}
        title="Create New Permission Group"
        onSave={handleCreatePermission}
        saveText="Create Permission Group"
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={permissionFormData.displayName}
                  onChange={handleDisplayNameChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Operations Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Name
                </label>
                <input
                  type="text"
                  value={permissionFormData.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={permissionFormData.description}
                onChange={handleDescriptionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the permission group's access level"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level
              </label>
              <select
                value={permissionFormData.priority}
                onChange={handlePriorityChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Basic (0)</option>
                <option value={100}>Low (100)</option>
                <option value={300}>Standard (300)</option>
                <option value={500}>High (500)</option>
                <option value={700}>Manager (700)</option>
                <option value={900}>Executive (900)</option>
              </select>
            </div>
          </div>

          {/* Component Assignment */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Component Access ({permissionFormData.components.length} selected)
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded p-4">
              {Object.entries(components).map(([categoryKey, category]) => {
                const categoryComponents =
                  category.components?.map((c) => c.id) || [];
                const hasAllComponents = categoryComponents.every((id) =>
                  permissionFormData.components.includes(id)
                );
                const hasSomeComponents = categoryComponents.some((id) =>
                  permissionFormData.components.includes(id)
                );

                return (
                  <div
                    key={categoryKey}
                    className="border border-gray-200 rounded p-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hasAllComponents}
                          ref={(input) => {
                            if (input)
                              input.indeterminate =
                                hasSomeComponents && !hasAllComponents;
                          }}
                          onChange={() => toggleCategory(categoryKey)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="font-medium text-gray-900">
                          {category.title}
                        </label>
                      </div>
                      <span className="text-sm text-gray-500">
                        {
                          categoryComponents.filter((id) =>
                            permissionFormData.components.includes(id)
                          ).length
                        }
                        /{categoryComponents.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                      {category.components?.map((component) => (
                        <label
                          key={component.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={permissionFormData.components.includes(
                              component.id
                            )}
                            onChange={() =>
                              toggleComponent(component.id, categoryKey)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {component.number && `${component.number} `}
                              {component.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {component.path}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center">
                <AlertCircle />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}
        </div>
      </SimpleModal>

      {/* Edit Permission Modal */}
      <SimpleModal
        isOpen={showEditPermissionModal}
        onClose={() => setShowEditPermissionModal(false)}
        title="Edit Permission Group"
        onSave={handleUpdatePermission}
        saveText="Update Permission Group"
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={permissionFormData.displayName}
                  onChange={handleDisplayNameChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Operations Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Name
                </label>
                <input
                  type="text"
                  value={permissionFormData.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={permissionFormData.description}
                onChange={handleDescriptionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the permission group's access level"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level
              </label>
              <select
                value={permissionFormData.priority}
                onChange={handlePriorityChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Basic (0)</option>
                <option value={100}>Low (100)</option>
                <option value={300}>Standard (300)</option>
                <option value={500}>High (500)</option>
                <option value={700}>Manager (700)</option>
                <option value={900}>Executive (900)</option>
              </select>
            </div>
          </div>

          {/* Component Assignment */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Component Access ({permissionFormData.components.length} selected)
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded p-4">
              {Object.entries(components).map(([categoryKey, category]) => {
                const categoryComponents =
                  category.components?.map((c) => c.id) || [];
                const hasAllComponents = categoryComponents.every((id) =>
                  permissionFormData.components.includes(id)
                );
                const hasSomeComponents = categoryComponents.some((id) =>
                  permissionFormData.components.includes(id)
                );

                return (
                  <div
                    key={categoryKey}
                    className="border border-gray-200 rounded p-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hasAllComponents}
                          ref={(input) => {
                            if (input)
                              input.indeterminate =
                                hasSomeComponents && !hasAllComponents;
                          }}
                          onChange={() => toggleCategory(categoryKey)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="font-medium text-gray-900">
                          {category.title}
                        </label>
                      </div>
                      <span className="text-sm text-gray-500">
                        {
                          categoryComponents.filter((id) =>
                            permissionFormData.components.includes(id)
                          ).length
                        }
                        /{categoryComponents.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                      {category.components?.map((component) => (
                        <label
                          key={component.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={permissionFormData.components.includes(
                              component.id
                            )}
                            onChange={() =>
                              toggleComponent(component.id, categoryKey)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {component.number && `${component.number} `}
                              {component.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {component.path}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SimpleModal>

      {/* User Permission Assignment Modal */}
      <SimpleModal
        isOpen={showUserPermissionModal}
        onClose={() => setShowUserPermissionModal(false)}
        title="Change User Permissions"
        showSave={false}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {selectedUser.name}
              </h3>
              <p className="text-gray-600">@{selectedUser.username}</p>
              <p className="text-sm text-gray-500 mt-2">
                Current: {selectedUser.role?.displayName || "No Permissions"}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Select New Permission Group:
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {permissions.map((permission) => (
                  <button
                    key={permission._id}
                    onClick={() =>
                      handleUpdateUserPermission(
                        selectedUser._id,
                        permission._id
                      )
                    }
                    disabled={loading}
                    className={`w-full text-left p-3 border rounded-lg transition-all hover:bg-gray-50 ${
                      selectedUser.role?._id === permission._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {permission.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {permission.description}
                        </div>
                      </div>
                      {selectedUser.role?._id === permission._id && (
                        <CheckCircle />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </SimpleModal>

      {/* Notifications */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 p-4 rounded shadow-lg z-50 max-w-md">
          <div className="flex items-start gap-2">
            <AlertCircle />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800 ml-auto flex-shrink-0"
            >
              <X />
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 p-4 rounded shadow-lg z-50 max-w-md">
          <div className="flex items-start gap-2">
            <CheckCircle />
            <span className="text-sm">{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="text-green-600 hover:text-green-800 ml-auto flex-shrink-0"
            >
              <X />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsManager;
