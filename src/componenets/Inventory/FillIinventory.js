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
} from "lucide-react";

// Role definitions (should match your admin dashboard)
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

export default function FillingInventory() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fillingQuantities, setFillingQuantities] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmationDialog, setConfirmationDialog] = useState({
    show: false,
    productId: null,
    productName: "",
    quantity: 0,
  });

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
        ROLES.INVENTORY_CONTROLLER,
        ROLES.STOCK_MANAGER,
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

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Try different possible API endpoints
      const possibleEndpoints = [
        "/api/products",
        "/api/product",
        "http://localhost:5000/api/products",
        "http://localhost:3001/api/products",
        "http://localhost:8000/api/products",
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
        setError("API not connected - Please check your server connection");
        setProducts([]);
        return;
      }

      console.log(`Using endpoint: ${workingEndpoint}`);
      const data = await response.json();

      if (data.success) {
        // Transform data to include threshold calculations
        const transformedProducts = data.data.map((product) => {
          // Calculate the effective reorder threshold for this product
          let reorderThreshold = 5; // Default fallback
          let thresholdSource = "default";

          if (
            product.useAmountStockmintoReorder &&
            product.AmountStockmintoReorder
          ) {
            reorderThreshold = product.AmountStockmintoReorder;
            thresholdSource = "custom";
          } else if (product.AmountStockmintoReorder) {
            reorderThreshold = product.AmountStockmintoReorder;
            thresholdSource = "minimum";
          }

          return {
            ...product,
            reorderThreshold,
            thresholdSource,
          };
        });

        setProducts(transformedProducts);
        setTotalProducts(transformedProducts.length);

        // Initialize filling quantities
        const initialQuantities = {};
        transformedProducts.forEach((product) => {
          initialQuantities[product._id] = 0;
        });
        setFillingQuantities(initialQuantities);
        setError(""); // Clear any previous errors
      } else {
        setError(data.message || "Failed to fetch products");
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Error fetching products: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser]);

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categories?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate filtered products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle quantity changes
  const increaseQuantity = (productId) => {
    setFillingQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const decreaseQuantity = (productId) => {
    setFillingQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 0) - 1, 0),
    }));
  };

  const handleQuantityInputChange = (productId, value) => {
    const numValue = parseInt(value) || 0;
    setFillingQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(numValue, 0),
    }));
  };

  // Show confirmation dialog
  const showConfirmation = (productId, productName) => {
    const quantity = fillingQuantities[productId] || 0;
    if (quantity > 0) {
      setConfirmationDialog({
        show: true,
        productId,
        productName,
        quantity,
      });
    }
  };

  // Update inventory
  const updateInventory = async () => {
    const { productId, quantity } = confirmationDialog;

    try {
      // Try different possible API endpoints for inventory update
      const possibleEndpoints = [
        `/api/products/fill-inventory/${productId}`,
        `/api/product/fill-inventory/${productId}`,
        `http://localhost:5000/api/products/fill-inventory/${productId}`,
        `http://localhost:3001/api/products/fill-inventory/${productId}`,
        `http://localhost:8000/api/products/fill-inventory/${productId}`,
      ];

      let response;
      let workingEndpoint = null;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying update endpoint: ${endpoint}`);
          response = await fetch(endpoint, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fillQuantity: quantity }),
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
        console.log("API not available, simulating update...");

        // Update the product in local state (simulation)
        setProducts((prev) =>
          prev.map((product) =>
            product._id === productId
              ? { ...product, Stock: (product.Stock || 0) + quantity }
              : product
          )
        );

        // Reset filling quantity for this product
        setFillingQuantities((prev) => ({
          ...prev,
          [productId]: 0,
        }));

        // Show success message
        const productName = confirmationDialog.productName;
        const newStock =
          (products.find((p) => p._id === productId)?.Stock || 0) + quantity;
        setSuccessMessage(
          `Successfully filled ${quantity} units for ${productName}. New Stock: ${newStock} (Simulated - API not connected)`
        );
        setTimeout(() => setSuccessMessage(""), 5000);

        setConfirmationDialog({
          show: false,
          productId: null,
          productName: "",
          quantity: 0,
        });
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Update the product in local state
        setProducts((prev) =>
          prev.map((product) =>
            product._id === productId
              ? { ...product, Stock: data.data.Stock }
              : product
          )
        );

        // Reset filling quantity for this product
        setFillingQuantities((prev) => ({
          ...prev,
          [productId]: 0,
        }));

        // Show success message
        setSuccessMessage(
          `Successfully filled ${quantity} units for ${confirmationDialog.productName}. New Stock: ${data.data.Stock}`
        );
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setError(data.message || "Failed to update inventory");
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Error updating inventory: " + err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setConfirmationDialog({
        show: false,
        productId: null,
        productName: "",
        quantity: 0,
      });
    }
  };

  // Calculate Stock after fill
  const getStockAfterFill = (productId, currentStock) => {
    const fillingQuantity = fillingQuantities[productId] || 0;
    return (currentStock || 0) + fillingQuantity;
  };

  // Check if product is low on Stock using reorderThreshold
  const getStockStatus = (product) => {
    const currentStock = product.Stock || 0;
    const reorderThreshold = product.reorderThreshold || 5;
    const criticalThreshold = Math.ceil(reorderThreshold * 0.5);

    if (currentStock === 0) {
      return {
        status: "Out of Stock",
        color: "text-red-700",
        bg: "bg-red-100",
        priority: "critical",
        icon: AlertCircle,
      };
    }

    if (currentStock <= criticalThreshold) {
      return {
        status: "Critical Low",
        color: "text-red-600",
        bg: "bg-red-50",
        priority: "critical",
        icon: AlertCircle,
      };
    }

    if (currentStock <= reorderThreshold) {
      return {
        status: "Low Stock",
        color: "text-orange-600",
        bg: "bg-orange-50",
        priority: "warning",
        icon: AlertCircle,
      };
    }

    return {
      status: "Good Stock",
      color: "text-green-600",
      bg: "bg-green-50",
      priority: "good",
      icon: CheckCircle,
    };
  };

  // Get fill recommendation based on threshold
  const getFillRecommendation = (product) => {
    const currentStock = product.Stock || 0;
    const reorderThreshold = product.reorderThreshold || 5;
    const idealStock = reorderThreshold * 2;

    if (currentStock < reorderThreshold) {
      const recommended = Math.max(idealStock - currentStock, reorderThreshold);
      return {
        recommended,
        message: `Recommended: ${recommended} units`,
        urgency: currentStock === 0 ? "critical" : "warning",
      };
    }

    return {
      recommended: 0,
      message: "Stock adequate",
      urgency: "good",
    };
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
                    Fill Inventory
                  </span>
                  <div className="text-xs text-gray-500 font-medium">
                    Stock Management System
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
              Loading products...
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
                  Fill Inventory
                </span>
                <div className="text-xs text-gray-500 font-medium">
                  Stock Management System
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
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 rounded-3xl p-8 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20"></div>
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
                  <h1 className="text-4xl font-bold mb-2">Fill Inventory</h1>
                  <p className="text-emerald-100 text-lg">
                    {ROLE_LABELS[currentUser?.role] || currentUser?.role} •
                    Smart Stock Management
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                      <Zap className="text-yellow-400" size={16} />
                      <span className="text-sm font-medium">
                        Smart Thresholds Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                      <TrendingUp className="text-green-400" size={16} />
                      <span className="text-sm font-medium">
                        {totalProducts} Products
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button className="relative p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                    <Bell className="text-white" size={20} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </button>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
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
                    placeholder="Search by ID, name, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
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
                  Showing {filteredProducts.length} of {totalProducts} products
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Product ID",
                      "Product Name",
                      "Category",
                      "Price/Unit",
                      "Current Stock",
                      "Reorder Threshold",
                      "Filling Stock",
                      "Stock After Fill",
                      "Stock Status",
                      "Fill Recommendation",
                      "Action",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-gray-50">
                      Fill Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedProducts.map((product) => {
                    const currentStock = product.Stock || 0;
                    const fillingStock = fillingQuantities[product._id] || 0;
                    const stockAfterFill = getStockAfterFill(
                      product._id,
                      currentStock
                    );
                    const stockStatus = getStockStatus(product);
                    const fillRec = getFillRecommendation(product);
                    const reorderThreshold = product.reorderThreshold || 5;

                    return (
                      <tr
                        key={product._id}
                        className={`hover:bg-gray-50/50 transition-colors ${stockStatus.bg}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          <div className="flex items-center gap-2">
                            {product.productId || "N/A"}
                            {product.thresholdSource === "custom" && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          {product.productName || "Unnamed Product"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {product.categories || "Uncategorized"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          ${(product.NormalPrice || 0).toLocaleString()}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${stockStatus.color}`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{currentStock} units</span>
                            {stockStatus.priority === "critical" && (
                              <AlertCircle
                                size={14}
                                className="text-red-500 animate-pulse"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                          <div className="flex items-center gap-1">
                            <Settings size={12} />
                            <span>{reorderThreshold}</span>
                            <span className="text-xs text-gray-500">
                              (
                              {product.thresholdSource === "custom"
                                ? "Custom"
                                : "Default"}
                              )
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                          <div className="flex items-center gap-1">
                            <TrendingUp size={14} />+{fillingStock} units
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                          {stockAfterFill} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <stockStatus.icon
                              size={16}
                              className={stockStatus.color}
                            />
                            <span
                              className={`${stockStatus.color} font-medium`}
                            >
                              {stockStatus.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div
                            className={`font-medium ${
                              fillRec.urgency === "critical"
                                ? "text-red-600"
                                : fillRec.urgency === "warning"
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {fillRec.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() =>
                              showConfirmation(product._id, product.productName)
                            }
                            disabled={fillingStock === 0}
                            className={`px-4 py-2 rounded-xl text-white font-semibold transition-all ${
                              fillingStock > 0
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                                : "bg-gray-300 cursor-not-allowed"
                            }`}
                          >
                            Fill Stock
                          </button>
                        </td>

                        {/* Sticky Quantity Column */}
                        <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white border-l border-gray-200">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => decreaseQuantity(product._id)}
                                className="w-8 h-8 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center font-bold transition-all"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={fillingQuantities[product._id] || 0}
                                onChange={(e) =>
                                  handleQuantityInputChange(
                                    product._id,
                                    e.target.value
                                  )
                                }
                                className="w-16 text-center border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              />
                              <button
                                onClick={() => increaseQuantity(product._id)}
                                className="w-8 h-8 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center font-bold transition-all"
                              >
                                +
                              </button>
                            </div>
                            {fillRec.recommended > 0 && (
                              <button
                                onClick={() =>
                                  setFillingQuantities((prev) => ({
                                    ...prev,
                                    [product._id]: fillRec.recommended,
                                  }))
                                }
                                className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-all font-medium"
                              >
                                Use Recommended
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gray-50 border-t text-sm text-gray-600">
              <div className="flex items-center mb-2 md:mb-0">
                <span>Showing</span>
                <select
                  className="mx-2 border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[10, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>of {filteredProducts.length} filtered products</span>
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
                  ...Array(Math.ceil(filteredProducts.length / itemsPerPage)),
                ].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all ${
                      currentPage === i + 1
                        ? "bg-emerald-500 text-white"
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
                        Math.ceil(filteredProducts.length / itemsPerPage)
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(filteredProducts.length / itemsPerPage)
                  }
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      {confirmationDialog.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-orange-100 rounded-xl mr-4">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Confirm Inventory Fill
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4 font-medium">
                Are you sure you want to fill inventory for:
              </p>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">Product:</span>
                  <span className="text-gray-900 font-semibold">
                    {confirmationDialog.productName}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Fill Quantity:
                  </span>
                  <span className="text-blue-600 font-bold">
                    +{confirmationDialog.quantity} units
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Current Stock:
                  </span>
                  <span className="text-gray-900 font-semibold">
                    {products.find(
                      (p) => p._id === confirmationDialog.productId
                    )?.Stock || 0}{" "}
                    units
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">New Stock:</span>
                  <span className="text-green-600 font-bold">
                    {(products.find(
                      (p) => p._id === confirmationDialog.productId
                    )?.Stock || 0) + confirmationDialog.quantity}{" "}
                    units
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Reorder Threshold:
                  </span>
                  <span className="text-purple-600 font-semibold">
                    {products.find(
                      (p) => p._id === confirmationDialog.productId
                    )?.reorderThreshold || 5}{" "}
                    units
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() =>
                  setConfirmationDialog({
                    show: false,
                    productId: null,
                    productName: "",
                    quantity: 0,
                  })
                }
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={updateInventory}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-semibold shadow-lg"
              >
                Confirm Fill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
