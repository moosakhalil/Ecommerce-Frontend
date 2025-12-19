import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../Sidebar/sidebar";
import {
  Shield,
  Users,
  Package,
  CreditCard,
  Settings,
  ShoppingCart,
  Archive,
  AlertCircle,
  CheckCircle,
  History,
  Tag,
  Percent,
  Home,
  LogOut,
  User,
  Search,
  ChevronRight,
  Bell,
  Menu,
  X,
  Loader,
  Zap,
  TrendingUp,
} from "lucide-react";

// Import the separate ManageUsers component
import ManageUsers from "../Home/userManagement";
import { API_BASE_URL } from "../../utils/config";


// Role definitions - keep for backward compatibility but not used for access control
const ROLES = {
  SUPER_ADMIN: "super_admin",
  OPERATIONS_MANAGER: "operations_manager",
  INVENTORY_CONTROLLER: "inventory_controller",
  STOCK_MANAGER: "stock_manager",
  FINANCE_MANAGER: "finance_manager",
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.OPERATIONS_MANAGER]: "Operations Manager",
  [ROLES.INVENTORY_CONTROLLER]: "Inventory Controller",
  [ROLES.STOCK_MANAGER]: "Stock Manager",
  [ROLES.FINANCE_MANAGER]: "Finance Manager",
};

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

// Component categories with elegant color scheme - UPDATED: removed roles array, will use component ID checking
const COMPONENT_CATEGORIES = {
  operations: {
    title: "Operations Management",
    icon: <ShoppingCart size={24} />,
    gradient: "from-indigo-600 to-purple-600",
    bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    components: [
      {
        id: "1",
        number: "1.",
        name: "Orders to cart not ordered yet ( everyone )",
        path: "/ordersINcart",
      },
      {
        id: "2",
        number: "2.",
        name: "Transaction control... paid / or not ( articial emp finance )",
        path: "/Transactions-control",
      },
      {
        id: "3",
        number: "3.",
        name: "All Orders ( emp office ) ( everyone allows )",
        path: "/all-orders",
      },
      {
        id: "4",
        number: "4.",
        name: "Order management delivery ( driver and emp on filing delivery )",
        path: "/delivery-orders",
      },
      {
        id: "5",
        number: "5.",
        name: "Delivery ( driver and office emp )",
        path: "/Delivery",
      },
      {
        id: "6",
        number: "6.",
        name: "Non-delivered orders or issues ( office...complain office )",
        path: "/non-delivered-orders",
      },
      {
        id: "7",
        number: "7.",
        name: "Refund / complain ( office...complain office )",
        path: "/view-refunds",
      },
      {
        id: "8",
        number: "8.",
        name: "History orders same # 3",
        path: "/all-orders",
      },
    ],
  },
  inventory: {
    title: "Stock & Inventory",
    icon: <Archive size={24} />,
    gradient: "from-emerald-600 to-teal-600",
    bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    components: [
      {
        id: "28",
        number: "31.",
        name: "Product list everyone ( View can only check )",
        path: "/admin/Products",
      },
      {
        id: "33",
        number: "33.",
        name: "Inventory check ( just controlling staff to double check and corret )",
        path: "/inventory-check",
      },
      {
        id: "35",
        number: "35.",
        name: "Out of Stock...order stock",
        path: "/out-of-stock",
      },
      {
        id: "36",
        number: "36.",
        name: "Sales data for products",
        path: "/sales-data",
      },
      {
        id: "37",
        number: "37.",
        name: "Lost Stock Management",
        path: "/lost-stock",
      },
    ],
  },
  stock2: {
    title: "Stock Management 2",
    icon: <Package size={24} />,
    gradient: "from-violet-600 to-indigo-600",
    bgColor: "bg-gradient-to-br from-violet-50 to-indigo-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    components: [
      {
        id: "61",
        number: "51.",
        name: "Create a new product (articial emp)",
        path: "/add-product",
      },
      {
        id: "54",
        number: "54.",
        name: "Fill inventory (articial emp)",
        path: "/Fill-inventory",
      },
      {
        id: "55",
        number: "55.",
        name: "Inventory control (articial emp)",
        path: "/inventory-control",
      },
      {
        id: "56",
        number: "56.",
        name: "Categories",
        path: "/add-category",
      },
    ],
  },
  discount: {
    title: "Discount Management",
    icon: <Percent size={24} />,
    gradient: "from-amber-600 to-orange-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    components: [
      {
        id: "71",
        number: "71.",
        name: "Create discount (articial emp)",
        path: "/create-discount",
      },
      {
        id: "72",
        number: "72.",
        name: "All Discount list, everyone )",
        path: "/all-discounts",
      },
      {
        id: "73",
        number: "73.",
        name: "Discounted product inventory",
        path: "/discount-inventory",
      },
      {
        id: "74",
        number: "74.",
        name: "Discount policies action (articial emp)",
        path: "/discount-policies",
      },
    ],
  },
  suppliers: {
    title: "Suppliers, Employees & Customers",
    icon: <Users size={24} />,
    gradient: "from-cyan-600 to-blue-600",
    bgColor: "bg-gradient-to-br from-cyan-50 to-blue-50",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    components: [
      {
        id: "81",
        number: "81.",
        name: "Suppliers (articial emp)",
        path: "/view-suppliers",
      },
      {
        id: "82",
        number: "82.",
        name: "employees (articial emp)",
        path: "/all-employees",
      },
      {
        id: "83",
        number: "83.",
        name: "Customers ( articial emp )",
        path: "/customers",
      },
    ],
  },
  history: {
    title: "History",
    icon: <History size={24} />,
    gradient: "from-slate-600 to-gray-600",
    bgColor: "bg-gradient-to-br from-slate-50 to-gray-50",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    components: [
      {
        id: "90",
        number: "90.",
        name: "History orders supplier (Admin office)",
        path: "/supplier-history",
      },
    ],
  },
  finance: {
    title: "Finance & Analytics",
    icon: <CreditCard size={24} />,
    gradient: "from-rose-600 to-pink-600",
    bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    components: [
      {
        id: "101",
        number: "101.",
        name: "Finances (articial emp)",
        path: "/finances",
      },
      {
        id: "105",
        number: "105.",
        name: "ANALYTICS",
        path: "/analytics",
      },
    ],
  },
  admin: {
    title: "Lower Admin",
    icon: <Shield size={24} />,
    gradient: "from-red-600 to-rose-600",
    bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    components: [
      {
        id: "admin-lower",
        number: "1.",
        name: "lower admin",
        path: "/admin/lower",
      },
      {
        id: "admin-drivers",
        number: "2.",
        name: "truck drivers",
        path: "/admin/drivers",
      },
      {
        id: "admin-employee-add",
        number: "3a.",
        name: "employee - add",
        path: "/admin/employee/add",
      },
      {
        id: "admin-employee-edit",
        number: "3b.",
        name: "employee - edit",
        path: "/admin/employee/edit",
      },
      {
        id: "admin-supplier-add",
        number: "4a.",
        name: "supplier - add",
        path: "/admin/supplier/add",
      },
      {
        id: "admin-supplier-edit",
        number: "4b.",
        name: "supplier - edit",
        path: "/admin/supplier/edit",
      },
      {
        id: "admin-customer-edit",
        number: "5a.",
        name: "customer - edit",
        path: "/admin/customer/edit",
      },
      {
        id: "admin-products",
        number: "6.",
        name: "Products",
        path: "/admin/Products",
      },
    ],
  },
  referrals: {
    title: "Referrals",
    icon: <Tag size={24} />,
    gradient: "from-fuchsia-600 to-purple-600",
    bgColor: "bg-gradient-to-br from-fuchsia-50 to-purple-50",
    iconBg: "bg-fuchsia-100",
    iconColor: "text-fuchsia-600",
    components: [
      {
        id: "150",
        number: "150.",
        name: "Referrals video verification",
        path: "/referrals",
      },
      {
        id: "151",
        number: "151.",
        name: "Referrals data",
        path: "/referrals-data",
      },
      {
        id: "155",
        number: "155.",
        name: "Referrals foreman income",
        path: "/referals-foreman",
      },

      {
        id: "159",
        number: "159.",
        name: "Video sending",
        path: "/referral-demovideo",
      },
    ],
  },
  foreman: {
    title: "Foreman",
    icon: <User size={24} />,
    gradient: "from-blue-600 to-indigo-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    components: [
      {
        id: "160",
        number: "160.",
        name: "from human earning structure",
        path: "/foreman-earnings",
      },
    ],
  },
  settings: {
    title: "Settings & Support",
    icon: <Settings size={24} />,
    gradient: "from-gray-600 to-slate-600",
    bgColor: "bg-gradient-to-br from-gray-50 to-slate-50",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    components: [
      {
        id: "calendar",
        number: "",
        name: "Calendar",
        path: "/calendar",
      },
      {
        id: "support",
        number: "",
        name: "Support",
        path: "/support",
      },
    ],
  },
};

// MAIN ADMIN DASHBOARD COMPONENT
const AdminDashboard = () => {
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initialize user from localStorage - simplified approach
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");

    if (storedUser && accessToken) {
      const userData = JSON.parse(storedUser);

      // Enhanced logging for debugging component access
      console.log("🔍 DASHBOARD INITIALIZATION:");
      console.log("   Stored user data:", userData);
      console.log("   User role:", userData.role);
      console.log("   User components:", userData.components);
      console.log("   User categories:", userData.categories);

      setCurrentUser(userData);
    } else {
      // No stored user or token, redirect to login
      logout();
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.log("No refresh token found");
        logout();
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

        // Update user data with fresh component access
        if (data.user) {
          console.log("🔄 UPDATING USER DATA FROM TOKEN REFRESH:");
          console.log("   Fresh user data:", data.user);
          console.log("   Fresh components:", data.user.components);
          console.log("   Fresh categories:", data.user.categories);

          localStorage.setItem("user", JSON.stringify(data.user));
          setCurrentUser(data.user);
        }

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        return data.accessToken;
      } else {
        console.log("Token refresh failed:", response.status);
        logout();
        return null;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
      return null;
    }
  }, [logout]);

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
          // Refresh failed, user will be logged out by refreshAccessToken()
          return null;
        }
      }

      return response;
    },
    [refreshAccessToken]
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

  // 🔥 FIXED: Check if user has access to a component based on their component array
  const hasAccess = useCallback(
    (component) => {
      if (!currentUser) {
        console.log("❌ hasAccess: No current user");
        return false;
      }

      // Super admin has access to everything
      if (
        currentUser.role === ROLES.SUPER_ADMIN ||
        currentUser.roleName === "super_admin"
      ) {
        console.log(
          `✅ hasAccess: Super admin accessing component ${component.id}`
        );
        return true;
      }

      // Check if user's components array includes this component ID
      const userComponents = currentUser.components || [];
      const hasComponentAccess = userComponents.includes(component.id);

      console.log(`🔍 hasAccess Check for component ${component.id}:`);
      console.log(`   User: ${currentUser.username}`);
      console.log(`   User components: [${userComponents.join(", ")}]`);
      console.log(`   Component ID: ${component.id}`);
      console.log(`   Has access: ${hasComponentAccess}`);

      return hasComponentAccess;
    },
    [currentUser]
  );

  // 🔥 FIXED: Get accessible components for current user based on their component array
  const getAccessibleComponents = useCallback(() => {
    if (!currentUser) {
      console.log("❌ getAccessibleComponents: No current user");
      return {};
    }

    console.log("🔍 GETTING ACCESSIBLE COMPONENTS:");
    console.log(`   User: ${currentUser.username}`);
    console.log(
      `   User components: [${(currentUser.components || []).join(", ")}]`
    );
    console.log(
      `   User categories: [${(currentUser.categories || []).join(", ")}]`
    );

    const accessible = {};
    Object.keys(COMPONENT_CATEGORIES).forEach((categoryKey) => {
      const category = COMPONENT_CATEGORIES[categoryKey];
      const accessibleComponents = category.components.filter(hasAccess);

      console.log(
        `   Category ${categoryKey}: ${accessibleComponents.length}/${category.components.length} components accessible`
      );

      if (accessibleComponents.length > 0) {
        accessible[categoryKey] = {
          ...category,
          components: accessibleComponents,
        };
      }
    });

    console.log(
      `✅ Total accessible categories: ${Object.keys(accessible).length}`
    );
    return accessible;
  }, [currentUser, hasAccess]);

  // Dashboard view with cards - UPDATED with better debugging
  const DashboardView = useMemo(() => {
    const accessibleCategories = getAccessibleComponents();

    console.log("🎯 DASHBOARD VIEW RENDER:");
    console.log(`   Current user: ${currentUser?.username}`);
    console.log(
      `   Accessible categories: ${Object.keys(accessibleCategories).length}`
    );

    return (
      <div className="flex">
        <div className="flex-1">
          <div className="space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back,{" "}
                  {String(getUsername(currentUser?.username) || "User")}
                </h1>
                <p className="text-blue-100 text-lg">
                  {String(
                    currentUser?.roleDisplayName ||
                      currentUser?.role?.displayName ||
                      currentUser?.role?.name ||
                      currentUser?.role ||
                      "Unknown Role"
                  )}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Zap className="text-yellow-400" size={16} />
                    <span className="text-sm font-medium">System Online</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <TrendingUp className="text-green-400" size={16} />
                    <span className="text-sm font-medium">
                      {Object.keys(accessibleCategories).length} Categories
                      Available
                    </span>
                  </div>
                  {/* DEBUG INFO */}
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Package className="text-blue-400" size={16} />
                    <span className="text-sm font-medium">
                      {(currentUser?.components || []).length} Components
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <button className="relative p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                  <Bell className="text-white" size={20} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {String(getUsername(currentUser?.username) || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {Object.keys(accessibleCategories).length === 0 ? (
          <div className="text-center py-16">
            <div className="p-8 bg-gray-100 rounded-2xl max-w-md mx-auto">
              <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Components Available
              </h3>
              <p className="text-gray-600 mb-4">
                You don't have access to any components yet. Contact your
                administrator to assign you a role with component access.
              </p>
              <div className="text-sm text-gray-500 bg-gray-200 rounded p-3">
                <p>
                  <strong>Your role:</strong>{" "}
                  {currentUser?.roleDisplayName ||
                    currentUser?.role ||
                    "Unknown"}
                </p>
                <p>
                  <strong>Components assigned:</strong>{" "}
                  {(currentUser?.components || []).length}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(accessibleCategories).map(([key, category]) => (
              <div
                key={key}
                className={`group relative overflow-hidden ${category.bgColor} rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Header */}
                <div
                  className={`bg-gradient-to-r ${category.gradient} p-6 text-white relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{category.title}</h3>
                      <p className="text-white/80 text-sm">
                        {category.components.length} components
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  {category.components.slice(0, 4).map((component) => (
                    <button
                      key={component.id}
                      onClick={() => (window.location.href = component.path)}
                      className="w-full text-left p-4 rounded-xl hover:bg-white/60 transition-all group/item border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 ${category.iconBg} ${category.iconColor} rounded-lg flex items-center justify-center text-sm font-bold`}
                          >
                            {component.number.replace(".", "")}
                          </span>
                          <span className="text-gray-700 font-medium group-hover/item:text-gray-900 transition-colors">
                            {component.name}
                          </span>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-gray-400 group-hover/item:text-gray-600 transition-colors"
                        />
                      </div>
                    </button>
                  ))}
                  {category.components.length > 4 && (
                    <button
                      onClick={() => setActiveView(key)}
                      className={`w-full text-center p-4 bg-gradient-to-r ${category.gradient} text-white rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg`}
                    >
                      View all {category.components.length} components
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Super Admin Controls */}
        {(currentUser?.role === ROLES.SUPER_ADMIN ||
          currentUser?.roleName === "super_admin") && (
          <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Shield size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Super Admin Controls</h3>
                  <p className="text-white/80">
                    Advanced system management tools
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <button
                  onClick={() => setActiveView("users")}
                  className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl transition-all backdrop-blur-sm border border-white/20 group"
                >
                  <Users size={24} className="mb-4 text-white" />
                  <div className="text-left">
                    <div className="font-bold text-lg">Manage Users</div>
                    <div className="text-white/80 text-sm mt-1">
                      User management system
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => (window.location.href = "/user-permissions")}
                  className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl transition-all backdrop-blur-sm border border-white/20"
                >
                  <Shield size={24} className="mb-4 text-white" />
                  <div className="text-left">
                    <div className="font-bold text-lg"> Permissions</div>
                    <div className="text-white/80 text-sm mt-1">
                      Manage access control
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveView("settings")}
                  className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl transition-all backdrop-blur-sm border border-white/20"
                >
                  <Settings size={24} className="mb-4 text-white" />
                  <div className="text-left">
                    <div className="font-bold text-lg">System Settings</div>
                    <div className="text-white/80 text-sm mt-1">
                      Configuration
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      </div>
    );
  }, [currentUser, getAccessibleComponents]);

  // Category view showing all components
  const CategoryView = useCallback(
    ({ categoryKey }) => {
      const category = COMPONENT_CATEGORIES[categoryKey];
      const accessibleComponents = category.components.filter(hasAccess);

      return (
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveView("dashboard")}
              className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors bg-white rounded-xl px-6 py-3 shadow-md hover:shadow-lg"
            >
              <ChevronRight size={20} className="rotate-180" />
              <span className="font-semibold">Back to Dashboard</span>
            </button>
          </div>

          <div
            className={`bg-gradient-to-r ${category.gradient} rounded-3xl p-8 text-white shadow-2xl`}
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                {category.icon}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{category.title}</h1>
                <p className="text-white/80 text-lg mt-2">
                  {accessibleComponents.length} available components
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibleComponents.map((component) => (
              <button
                key={component.id}
                onClick={() => (window.location.href = component.path)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-8 text-left border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`w-12 h-12 ${category.iconBg} ${category.iconColor} rounded-xl flex items-center justify-center font-bold text-lg`}
                  >
                    {component.number.replace(".", "")}
                  </span>
                  <ChevronRight
                    size={20}
                    className="text-gray-400 group-hover:text-gray-600 transition-colors"
                  />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg leading-tight">
                  {component.name}
                </h3>
              </button>
            ))}
          </div>
        </div>
      );
    },
    [hasAccess]
  );

  // Main navigation
  const Navigation = useMemo(
    () => (
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Home size={24} />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  Professional Management System
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setActiveView("dashboard")}
                className={`px-3 py-2 text-sm font-medium ${
                  activeView === "dashboard"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Dashboard
              </button>
              {(currentUser?.role === ROLES.SUPER_ADMIN ||
                currentUser?.roleName === "super_admin") && (
                <button
                  onClick={() => setActiveView("users")}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeView === "users"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Users
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    ),
    [activeView, currentUser, isMobileMenuOpen, logout]
  );

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

  // Render current view
  const renderCurrentView = useCallback(() => {
    switch (activeView) {
      case "dashboard":
        return DashboardView;
      case "users":
        return currentUser?.role === ROLES.SUPER_ADMIN ||
          currentUser?.roleName === "super_admin" ? (
          <ManageUsers
            onNavigateBack={() => setActiveView("dashboard")}
            currentUser={currentUser}
          />
        ) : (
          DashboardView
        );
      default:
        if (COMPONENT_CATEGORIES[activeView]) {
          return <CategoryView categoryKey={activeView} />;
        }
        return DashboardView;
    }
  }, [activeView, currentUser, DashboardView, CategoryView]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader
            className="animate-spin text-blue-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {activeView !== "users" && Navigation}

      {/* Mobile menu */}
      {isMobileMenuOpen && activeView !== "users" && (
        <div className="md:hidden bg-white border-b shadow-sm">
          <div className="px-4 py-2 space-y-1">
            <button
              onClick={() => {
                setActiveView("dashboard");
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Dashboard
            </button>
            {(currentUser?.role === ROLES.SUPER_ADMIN ||
              currentUser?.roleName === "super_admin") && (
              <button
                onClick={() => {
                  setActiveView("users");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Users
              </button>
            )}
          </div>
        </div>
      )}

      {activeView !== "users" ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderCurrentView()}
        </main>
      ) : (
        renderCurrentView()
      )}

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

export default AdminDashboard;
