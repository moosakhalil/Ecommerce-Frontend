import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Settings,
  TrendingUp,
  Home,
  LogOut,
  ArrowLeft,
  Package,
  Zap,
  Menu,
  X,
  User,
  ArrowRight,
  Check,
  MoreVertical,
} from "lucide-react";

// Role definitions (should match your admin dashboard)
const ROLES = {
  SUPER_ADMIN: "super_admin",
  OPERATIONS_MANAGER: "operations_manager",
  INVENTORY_CONTROLLER: "inventory_controller",
  STOCK_MANAGER: "stock_manager",
  FINANCE_MANAGER: "finance_manager",
  DELIVERY_MANAGER: "delivery_manager",
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.OPERATIONS_MANAGER]: "Operations Manager",
  [ROLES.INVENTORY_CONTROLLER]: "Inventory Controller",
  [ROLES.STOCK_MANAGER]: "Stock Manager",
  [ROLES.FINANCE_MANAGER]: "Finance Manager",
  [ROLES.DELIVERY_MANAGER]: "Delivery Manager",
};

export default function AllDeliveryComplaints() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");

    if (storedUser && accessToken) {
      const userData = JSON.parse(storedUser);
      setCurrentUser(userData);

      // Check if user has access to this component
      const allowedRoles = [
        ROLES.SUPER_ADMIN,
        ROLES.DELIVERY_MANAGER,
        ROLES.OPERATIONS_MANAGER,
      ];
      if (!allowedRoles.includes(userData.role)) {
        // Redirect to dashboard if no access
        window.location.href = "/dashboard";
        return;
      }
    } else {
      // No stored user or token, redirect to login
      window.location.href = "/";
      return;
    }
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // Navigate back to dashboard
  const navigateToDashboard = () => {
    window.location.href = "/dashboard";
  };

  // Fetch complaints from API
  const fetchComplaints = async () => {
    try {
      setLoading(true);

      // Try different possible API endpoints
      const possibleEndpoints = [
        "/api/complaints",
        "/api/complaint",
        "http://localhost:5000/api/complaints",
        "http://localhost:3001/api/complaints",
        "http://localhost:8000/api/complaints",
      ];

      let response;
      let workingEndpoint = null;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint);

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              workingEndpoint = endpoint;
              break;
            }
          }
        } catch (endpointError) {
          console.log(`Failed to reach ${endpoint}:`, endpointError.message);
          continue;
        }
      }

      if (!workingEndpoint) {
        // Fallback: Simulate data for development
        console.log("API not available, simulating data...");
        const simulatedComplaints = [
          {
            _id: "1",
            orderId: "ORD-1001",
            complaint: {
              status: "pending",
              reportedBy: {
                driverId: "DRV-001",
                name: "John Doe",
              },
              reportedAt: new Date().toISOString(),
              customerRequestDetails: "Package was damaged during delivery",
              additionalDetails:
                "Customer reported that the box was crushed on one side and contents were damaged.",
            },
            items: [
              {
                productName: "Premium Glassware Set",
                quantity: 1,
                weight: "2.5kg",
              },
            ],
          },
          {
            _id: "2",
            orderId: "ORD-1002",
            complaint: {
              status: "resolved",
              reportedBy: {
                driverId: "DRV-002",
                name: "Jane Smith",
              },
              reportedAt: new Date(Date.now() - 86400000).toISOString(),
              customerRequestDetails: "Wrong item delivered",
              additionalDetails:
                "Customer received item A instead of ordered item B. Replacement sent.",
            },
            items: [
              {
                productName: "Wireless Headphones",
                quantity: 1,
                weight: "0.5kg",
              },
            ],
          },
        ];
        setComplaints(simulatedComplaints);
        setError("API not connected - Using simulated data");
        return;
      }

      const data = await response.json();
      if (data.success || data.complaints) {
        setComplaints(data.complaints || data.data);
        setError("");
      } else {
        setError(data.message || "Failed to fetch complaints");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Error fetching complaints: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch drivers from API
  const fetchDrivers = async () => {
    try {
      // Try different possible API endpoints
      const possibleEndpoints = [
        "/api/employees?employeeCategory=Driver",
        "/api/employee?category=Driver",
        "http://localhost:5000/api/employees?employeeCategory=Driver",
        "http://localhost:3001/api/employees?employeeCategory=Driver",
        "http://localhost:8000/api/employees?employeeCategory=Driver",
      ];

      let response;
      let workingEndpoint = null;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint);

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              workingEndpoint = endpoint;
              break;
            }
          }
        } catch (endpointError) {
          console.log(`Failed to reach ${endpoint}:`, endpointError.message);
          continue;
        }
      }

      if (!workingEndpoint) {
        // Fallback: Simulate data for development
        console.log("API not available, simulating driver data...");
        const simulatedDrivers = [
          { _id: "DRV-001", name: "John Doe" },
          { _id: "DRV-002", name: "Jane Smith" },
          { _id: "DRV-003", name: "Mike Johnson" },
        ];
        setDrivers(simulatedDrivers);
        return;
      }

      const data = await response.json();
      if (data.success || data.data) {
        setDrivers(data.data || data.employees);
      }
    } catch (err) {
      console.error("Fetch drivers error:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchComplaints();
      fetchDrivers();
    }
  }, [currentUser]);

  // Filter complaints based on search term
  const filteredComplaints = complaints.filter(
    (complaint) =>
      complaint.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint?.reportedBy?.driverId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getDriverName(complaint.complaint?.reportedBy?.driverId)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Paginate filtered complaints
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getDriverName = (driverId) => {
    const driver = drivers.find((d) => d._id === driverId);
    return driver ? driver.name : driverId;
  };

  const handleComplainResolve = async (orderId) => {
    try {
      // Try different possible API endpoints
      const possibleEndpoints = [
        `/api/complaints/${orderId}/resolve`,
        `/api/complaint/${orderId}/resolve`,
        `http://localhost:5000/api/complaints/${orderId}/resolve`,
        `http://localhost:3001/api/complaints/${orderId}/resolve`,
        `http://localhost:8000/api/complaints/${orderId}/resolve`,
      ];

      let response;
      let workingEndpoint = null;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "resolved" }),
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              workingEndpoint = endpoint;
              break;
            }
          }
        } catch (endpointError) {
          console.log(`Failed to reach ${endpoint}:`, endpointError.message);
          continue;
        }
      }

      if (!workingEndpoint) {
        // Fallback: Simulate successful update for development
        console.log("API not available, simulating complaint resolution...");
        setComplaints((prev) =>
          prev.map((c) =>
            c.orderId === orderId
              ? {
                  ...c,
                  complaint: {
                    ...c.complaint,
                    status: "resolved",
                  },
                }
              : c
          )
        );
        setSuccessMessage(
          `Complaint for order ${orderId} marked as resolved (Simulated - API not connected)`
        );
        setTimeout(() => setSuccessMessage(""), 5000);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setComplaints((prev) =>
          prev.map((c) => (c._id === data.data._id ? data.data : c))
        );
        setSuccessMessage(
          `Complaint for order ${orderId} successfully resolved`
        );
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setError(data.message || "Failed to resolve complaint");
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      console.error("Resolve error:", err);
      setError("Error resolving complaint: " + err.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "resolved":
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          icon: CheckCircle,
        };
      case "pending":
        return {
          color: "text-orange-600",
          bg: "bg-orange-50",
          icon: AlertCircle,
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          icon: MoreVertical,
        };
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-blue-600 mx-auto mb-4 w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <Package size={24} />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Delivery Complaints
                  </span>
                  <div className="text-xs text-gray-500 font-medium">
                    Customer Issue Management
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
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

        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin text-blue-600 mx-auto mb-4 w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-gray-600 font-medium">
              Loading complaints...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Package size={24} />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Delivery Complaints
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  Customer Issue Management
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={navigateToDashboard}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-2"
              >
                <Home size={16} />
                Dashboard
              </button>
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

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-sm">
          <div className="px-4 py-2 space-y-1">
            <button
              onClick={() => {
                navigateToDashboard();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <Home size={16} />
              Dashboard
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <div className="flex items-center gap-6 mb-4">
                    <button
                      onClick={navigateToDashboard}
                      className="flex items-center gap-3 text-white/80 hover:text-white transition-colors bg-white/10 rounded-xl px-6 py-3 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                    >
                      <ArrowLeft size={20} />
                      <span className="font-semibold">Back to Dashboard</span>
                    </button>
                  </div>
                  <h1 className="text-4xl font-bold mb-2">
                    Delivery Complaints
                  </h1>
                  <p className="text-purple-100 text-lg">
                    {ROLE_LABELS[currentUser?.role] || currentUser?.role} •
                    Customer Issue Resolution
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                      <AlertCircle className="text-yellow-400" size={16} />
                      <span className="text-sm font-medium">
                        Active Issues Tracking
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                      <TrendingUp className="text-blue-400" size={16} />
                      <span className="text-sm font-medium">
                        {filteredComplaints.length} Complaints
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button className="relative p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                    <Bell className="text-white" size={20} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </button>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {currentUser?.username?.charAt(0)?.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl flex items-center">
              <CheckCircle className="mr-3 flex-shrink-0" size={20} />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center">
              <AlertCircle className="mr-3 flex-shrink-0" size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 max-w-md items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by order ID, driver ID or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                  />
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                <Package size={18} />
                <span className="font-semibold">
                  Showing {filteredComplaints.length} of {complaints.length}{" "}
                  complaints
                </span>
              </div>
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {paginatedComplaints.length > 0 ? (
              paginatedComplaints.map((complaint) => {
                const statusInfo = getStatusInfo(complaint.complaint?.status);
                const driverName = getDriverName(
                  complaint.complaint?.reportedBy?.driverId
                );
                const reportedDate = new Date(
                  complaint.complaint?.reportedAt || new Date()
                ).toLocaleString();

                return (
                  <div
                    key={complaint._id || complaint.orderId}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-100 p-3 rounded-xl">
                            <User className="text-gray-600" size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                Order #{complaint.orderId}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}
                              >
                                {complaint.complaint?.status || "unknown"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Reported by: {driverName || "Unknown Driver"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Reported on: {reportedDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleComplainResolve(complaint.orderId)
                            }
                            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                              complaint.complaint?.status === "resolved"
                                ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600 text-white shadow-lg"
                            }`}
                            disabled={
                              complaint.complaint?.status === "resolved"
                            }
                          >
                            {complaint.complaint?.status === "resolved"
                              ? "Resolved"
                              : "Mark as Resolved"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Complaint Details:
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-800 font-medium">
                            {complaint.complaint?.customerRequestDetails ||
                              "No specific details provided"}
                          </p>
                          {complaint.complaint?.additionalDetails && (
                            <p className="text-gray-600 mt-2 text-sm">
                              {complaint.complaint.additionalDetails}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Affected Items:
                        </h4>
                        <div className="space-y-2">
                          {complaint.items?.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Package className="text-gray-400" size={20} />
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {item.productName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Qty: {item.quantity} • {item.weight}
                                  </p>
                                </div>
                              </div>
                              <span className="text-red-500 font-semibold">
                                COMPLAINT
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <Package className="mx-auto text-gray-400" size={48} />
                <h3 className="text-xl font-bold text-gray-700 mt-4">
                  No complaints found
                </h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm
                    ? "Try a different search term"
                    : "All complaints have been resolved"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredComplaints.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gray-50 border-t text-sm text-gray-600">
              <div className="flex items-center mb-2 md:mb-0">
                <span>Showing</span>
                <select
                  className="mx-2 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[5, 10, 20, 30].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>of {filteredComplaints.length} complaints</span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                {[
                  ...Array(Math.ceil(filteredComplaints.length / itemsPerPage)),
                ].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all ${
                      currentPage === i + 1
                        ? "bg-indigo-500 text-white"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(filteredComplaints.length / itemsPerPage)
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(filteredComplaints.length / itemsPerPage)
                  }
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
