import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Phone,
  Check,
  MapPin,
  Clock,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Package,
  RefreshCw,
  Settings,
  MoreVertical,
  Search,
  DollarSign,
  X,
  ShoppingCart,
  Users,
  MapPinIcon,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const VendorManagementDashboard = () => {
  // State Management
  const [activeTab, setActiveTab] = useState("Vendor Management");
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [productTypeFilter, setProductTypeFilter] = useState("All");
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSubCategory, setProductSubCategory] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const searchInputRef = useRef(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    subCategories: [],
    brands: [],
  });

  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [stats, setStats] = useState({
    activeVendors: 0,
    offlineVendors: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [filters, setFilters] = useState({
    status: "All Statuses",
    sortBy: "name",
    order: "asc",
    search: "",
    page: 1,
    limit: 20,
  });

  // Add Vendor Modal States
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [addingVendor, setAddingVendor] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    phone: "",
    email: "",
    location: {
      city: "",
      area: "",
      fullAddress: "",
    },
    availableProducts: [],
    status: "Available",
    preorderSettings: {
      enabled: false,
      preorderTime: 6,
      preorderDiscount: 0,
    },
    bankDetails: {
      accountHolder: "",
      accountNumber: "",
      bankName: "",
    },
    workingHours: {
      monday: { start: "09:00", end: "18:00", isOpen: true },
      tuesday: { start: "09:00", end: "18:00", isOpen: true },
      wednesday: { start: "09:00", end: "18:00", isOpen: true },
      thursday: { start: "09:00", end: "18:00", isOpen: true },
      friday: { start: "09:00", end: "18:00", isOpen: true },
      saturday: { start: "09:00", end: "18:00", isOpen: true },
      sunday: { start: "09:00", end: "18:00", isOpen: false },
    },
  });

  // Product Selection Modal States for Add Vendor
  const [showAddVendorProductModal, setShowAddVendorProductModal] =
    useState(false);
  const [selectedVendorProducts, setSelectedVendorProducts] = useState([]);

  // Edit vendor states
  const [showEditVendorModal, setShowEditVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [updatingVendor, setUpdatingVendor] = useState(false);

  // Bulk operations states
  const [bulkOperating, setBulkOperating] = useState(false);

  // Fetch functions
  const fetchProducts = useCallback(async () => {
    try {
      console.log("Fetching products from:", `${API_BASE_URL}/api/products`);

      const response = await fetch(`${API_BASE_URL}/api/products`);

      if (response.ok) {
        const data = await response.json();
        console.log("Products API response:", data);

        const productsArray = data.data || data.products || [];

        const transformedProducts = productsArray.map((product) => ({
          _id: product._id,
          productId: product.productId,
          name: product.productName,
          category:
            product.categories?.[0] ||
            product.categories ||
            "Construction Material",
          price: product.suggestedRetailPrice || product.NormalPrice || 0,
          preorderPrice:
            product.NormalPrice || product.suggestedRetailPrice * 0.9 || 0,
          stock: product.stockAmount || product.Stock || 0,
          subCategories: product.subCategories || [],
          brand: product.brand || "",
          visibility: product.visibility || "Public",
        }));

        setProducts(transformedProducts);
        console.log("Transformed products:", transformedProducts);
      } else {
        console.error("Failed to fetch products, status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  }, []);

  const fetchVendorData = useCallback(async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      if (selectedProducts.length > 0) {
        queryParams.append("productId", selectedProducts[0].productId);
      }
      if (filters.status !== "All Statuses") {
        queryParams.append("status", filters.status);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }
      queryParams.append("sortBy", filters.sortBy);
      queryParams.append("order", filters.order);
      queryParams.append("page", filters.page);
      queryParams.append("limit", filters.limit);

      console.log("Fetching vendors with params:", queryParams.toString());
      const response = await fetch(
        `${API_BASE_URL}/api/vendors?${queryParams}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Vendors API response:", data);
        setVendors(data.vendors || []);
      } else {
        console.error("Failed to fetch vendors");
        setVendors([]);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProducts, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const [vendorStatsResponse, orderStatsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/vendors/stats`),
        fetch(`${API_BASE_URL}/api/vendors/orders/stats`),
      ]);

      if (vendorStatsResponse.ok) {
        const vendorData = await vendorStatsResponse.json();
        if (orderStatsResponse.ok) {
          const orderData = await orderStatsResponse.json();
          setStats({
            activeVendors: vendorData.stats?.overview?.activeVendors || 0,
            offlineVendors: vendorData.stats?.overview?.offlineVendors || 0,
            totalOrders: orderData.stats?.total || 0,
            pendingOrders: orderData.stats?.pending || 0,
            activeOrders: orderData.stats?.active || 0,
            deliveredOrders: orderData.stats?.delivered || 0,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    if (showProductSelector && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showProductSelector]);

  useEffect(() => {
    fetchProducts();
    fetchVendorData();
    fetchStats();
  }, [fetchProducts, fetchVendorData, fetchStats]);

  // Update the handleProductSelect function
  const handleProductSelect = (productId) => {
    const product =
      filteredProducts.find((p) => p._id === productId) ||
      products.find((p) => p._id === productId);
    if (product && !selectedProducts.find((p) => p._id === productId)) {
      setSelectedProducts((prev) => [...prev, product]);
    }
  };

  const removeSelectedProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  // Updated handleVendorProductSelect with pricing fields
  const handleVendorProductSelect = (product) => {
    setSelectedVendorProducts((prev) => {
      const exists = prev.find((p) => p.productId === product.productId);
      if (exists) {
        // Don't remove it, just return the current state
        return prev;
      } else {
        const newProduct = {
          productId: product.productId,
          productName: product.name,
          isActive: true,
          pricing: {
            supplierPrice: 0,
            commission: 8, // Default 8% commission
            salePrice: 0,
          },
          availability: {
            inStock: true,
            estimatedDeliveryDays: 1,
            minimumOrderQuantity: 1,
          },
          specifications: {
            quality: "",
            origin: "",
            customNotes: "",
          },
        };
        return [...prev, newProduct];
      }
    });
  };

  // Update product pricing in the selected products list
  const updateProductPricing = (productId, field, value) => {
    setSelectedVendorProducts((prev) => {
      return prev.map((product) => {
        if (product.productId === productId) {
          const updatedProduct = { ...product };

          if (field === "supplierPrice") {
            updatedProduct.pricing.supplierPrice = parseFloat(value) || 0;
            // Calculate sale price = supplier price + (supplier price * commission / 100)
            const commissionAmount =
              (updatedProduct.pricing.supplierPrice *
                updatedProduct.pricing.commission) /
              100;
            updatedProduct.pricing.salePrice =
              updatedProduct.pricing.supplierPrice + commissionAmount;
          } else if (field === "commission") {
            updatedProduct.pricing.commission = parseFloat(value) || 0;
            // Recalculate sale price
            const commissionAmount =
              (updatedProduct.pricing.supplierPrice *
                updatedProduct.pricing.commission) /
              100;
            updatedProduct.pricing.salePrice =
              updatedProduct.pricing.supplierPrice + commissionAmount;
          }

          return updatedProduct;
        }
        return product;
      });
    });
  };

  const addSelectedProductsToNewVendor = () => {
    setNewVendor((prev) => ({
      ...prev,
      availableProducts: selectedVendorProducts,
    }));
    setShowAddVendorProductModal(false);
  };

  const submitNewVendor = async () => {
    if (!newVendor.name || !newVendor.phone) {
      alert("Name and phone are required fields");
      return;
    }

    if (newVendor.availableProducts.length === 0) {
      alert("Please select at least one product for the vendor");
      return;
    }

    setAddingVendor(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVendor),
      });

      if (response.ok) {
        alert("Vendor added successfully!");
        setShowAddVendorModal(false);
        resetNewVendorForm();
        fetchVendorData();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to add vendor: ${error.error}`);
      }
    } catch (error) {
      console.error("Error adding vendor:", error);
      alert("Failed to add vendor. Please try again.");
    } finally {
      setAddingVendor(false);
    }
  };

  const resetNewVendorForm = () => {
    setNewVendor({
      name: "",
      phone: "",
      email: "",
      location: {
        city: "",
        area: "",
        fullAddress: "",
      },
      availableProducts: [],
      status: "Available",
      preorderSettings: {
        enabled: false,
        preorderTime: 6,
        preorderDiscount: 0,
      },
      bankDetails: {
        accountHolder: "",
        accountNumber: "",
        bankName: "",
      },
      workingHours: {
        monday: { start: "09:00", end: "18:00", isOpen: true },
        tuesday: { start: "09:00", end: "18:00", isOpen: true },
        wednesday: { start: "09:00", end: "18:00", isOpen: true },
        thursday: { start: "09:00", end: "18:00", isOpen: true },
        friday: { start: "09:00", end: "18:00", isOpen: true },
        saturday: { start: "09:00", end: "18:00", isOpen: true },
        sunday: { start: "09:00", end: "18:00", isOpen: false },
      },
    });
    setSelectedVendorProducts([]);
  };

  // Vendor operations
  const handleVendorSelect = (vendorId) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVendors.length === vendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(vendors.map((v) => v._id));
    }
  };

  const deleteVendor = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors/${vendorId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Vendor deleted successfully!");
        fetchVendorData();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to delete vendor: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
      alert("Failed to delete vendor. Please try again.");
    }
  };

  const toggleVendorStatus = async (vendorId, currentStatus) => {
    const newStatus = currentStatus === "Available" ? "Offline" : "Available";

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/vendors/${vendorId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        alert(`Vendor status updated to ${newStatus}!`);
        fetchVendorData();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to update vendor status: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating vendor status:", error);
      alert("Failed to update vendor status. Please try again.");
    }
  };

  // Add this useEffect to fetch products when filters change
  useEffect(() => {
    if (showProductSelector) {
      fetchFilteredProducts();
    }
  }, [
    productTypeFilter,
    productSearch,
    productCategory,
    productSubCategory,
    productBrand,
    inStockOnly,
    showProductSelector,
  ]);

  // Add these new functions
  const fetchFilteredProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        productType: productTypeFilter,
        search: productSearch,
        category: productCategory,
        subCategory: productSubCategory,
        brand: productBrand,
        inStock: inStockOnly,
        page: 1,
        limit: 100,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/vendors/products/by-type?${queryParams}`
      );

      if (response.ok) {
        const data = await response.json();
        setFilteredProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching filtered products:", error);
    }
  };

  const fetchFilterOptions = async (type) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/vendors/products/filter-options?productType=${type}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableFilters({
          categories: data.categories || [],
          subCategories: data.subCategories || [],
          brands: data.brands || [],
        });
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const handleProductTypeChange = (type) => {
    setProductTypeFilter(type);
    setProductCategory("");
    setProductSubCategory("");
    setProductBrand("");
    setProductSearch("");
    fetchFilterOptions(type);
  };

  const clearAllFilters = () => {
    setProductTypeFilter("All");
    setProductSearch("");
    setProductCategory("");
    setProductSubCategory("");
    setProductBrand("");
    setInStockOnly(false);
  };

  const submitEditVendor = async () => {
    if (!editingVendor.name || !editingVendor.phone) {
      alert("Name and phone are required fields");
      return;
    }

    setUpdatingVendor(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/vendors/${editingVendor.vendorId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingVendor),
        }
      );

      if (response.ok) {
        alert("Vendor updated successfully!");
        setShowEditVendorModal(false);
        setEditingVendor(null);
        fetchVendorData();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to update vendor: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
      alert("Failed to update vendor. Please try again.");
    } finally {
      setUpdatingVendor(false);
    }
  };

  const openEditVendor = (vendor) => {
    setEditingVendor({ ...vendor });
    setShowEditVendorModal(true);
  };

  // Bulk operations
  const handleBulkStatusUpdate = async (status) => {
    if (selectedVendors.length === 0) {
      alert("Please select vendors first");
      return;
    }

    setBulkOperating(true);
    try {
      const vendorIds = selectedVendors
        .map((id) => vendors.find((v) => v._id === id)?.vendorId)
        .filter(Boolean);

      const response = await fetch(`${API_BASE_URL}/api/vendors/bulk-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorIds,
          updateData: { status },
          operation: "status",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.modifiedCount} vendors updated successfully!`);
        setSelectedVendors([]);
        fetchVendorData();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to update vendors: ${error.error}`);
      }
    } catch (error) {
      console.error("Error in bulk update:", error);
      alert("Failed to update vendors. Please try again.");
    } finally {
      setBulkOperating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVendors.length === 0) {
      alert("Please select vendors first");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedVendors.length} vendors?`
      )
    ) {
      return;
    }

    setBulkOperating(true);
    try {
      const vendorIds = selectedVendors
        .map((id) => vendors.find((v) => v._id === id)?.vendorId)
        .filter(Boolean);

      const response = await fetch(`${API_BASE_URL}/api/vendors/bulk-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorIds,
          operation: "delete",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.modifiedCount} vendors deleted successfully!`);
        setSelectedVendors([]);
        fetchVendorData();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to delete vendors: ${error.error}`);
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      alert("Failed to delete vendors. Please try again.");
    } finally {
      setBulkOperating(false);
    }
  };

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-600 text-white";
      case "Offline":
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Navigation handlers
  const navigateToAllOrders = () => {
    window.location.href = "/vendor-orders";
  };

  // Render functions
  const renderVendorCard = (vendor) => (
    <div
      key={vendor._id}
      className="bg-white border border-gray-200 rounded-lg p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedVendors.includes(vendor._id)}
            onChange={() => handleVendorSelect(vendor._id)}
            className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Phone className="h-3 w-3 mr-1" />
              {vendor.phone}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
              vendor.status
            )}`}
          >
            {vendor.status}
          </span>
          <div className="relative">
            <button
              onClick={() => {
                const dropdown = document.getElementById(
                  `dropdown-${vendor._id}`
                );
                dropdown.classList.toggle("hidden");
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            <div
              id={`dropdown-${vendor._id}`}
              className="hidden absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
            >
              <button
                onClick={() => openEditVendor(vendor)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Vendor
              </button>
              <button
                onClick={() =>
                  toggleVendorStatus(vendor.vendorId, vendor.status)
                }
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Toggle Status
              </button>
              <button
                onClick={() => deleteVendor(vendor.vendorId)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Vendor
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          {vendor.location?.city}, {vendor.location?.area}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-xs">avg response time</span>
            </div>
            <div className="font-medium">
              {vendor.responseMetrics?.averageResponseTime || 0} min avg
            </div>
          </div>

          {vendor.responseMetrics?.rating && (
            <div>
              <div className="flex items-center text-gray-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">
                  {vendor.responseMetrics.rating} rating
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center">
            <Package className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-sm font-medium">
              {vendor.availableProducts?.length || 0} products
            </span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-sm font-medium">
              {vendor.availableProducts?.[0]?.pricing?.commission || 8}%
              commission
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Update the ProductSelectorModal component
  const ProductSelectorModal = () => {
    if (!showProductSelector) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Select Products
            </h2>
            <button
              onClick={() => {
                setShowProductSelector(false);
                clearAllFilters();
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Product Type Tabs */}
          <div className="flex border-b border-gray-200">
            {["All", "Parent", "Child", "Normal"].map((type) => (
              <button
                key={type}
                onClick={() => handleProductTypeChange(type)}
                className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
                  productTypeFilter === type
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {type} Products
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              {/* Search Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search by ID only
                </label>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Enter product ID or name..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {availableFilters.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  value={productBrand}
                  onChange={(e) => setProductBrand(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Brands</option>
                  {availableFilters.brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Sub-Category Filter (only for Parent/Child) */}
              {(productTypeFilter === "Parent" ||
                productTypeFilter === "Child") && (
                <div className="flex-1 mr-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-Category
                  </label>
                  <select
                    value={productSubCategory}
                    onChange={(e) => setProductSubCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Sub-Categories</option>
                    {availableFilters.subCategories.map((subCat) => (
                      <option key={subCat} value={subCat}>
                        {subCat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* In Stock Filter */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">In Stock Only</span>
              </label>

              {/* Clear Filters Button */}
              <button
                onClick={clearAllFilters}
                className="ml-4 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Products List */}
          <div className="p-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2" />
                <p>No products found matching your criteria.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => {
                      handleProductSelect(product._id);
                      setShowProductSelector(false);
                      clearAllFilters();
                    }}
                    className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {product.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {product.productId} | Type: {product.productType}
                        </div>
                        {product.parentProduct && (
                          <div className="text-xs text-gray-400">
                            Parent: {product.parentProduct}
                          </div>
                        )}
                        {product.varianceName && (
                          <div className="text-xs text-gray-400">
                            Variance: {product.varianceName}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${product.NormalPrice || 0}
                        </div>
                        <div
                          className={`text-xs ${
                            product.Stock > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Stock: {product.Stock || 0}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {product.categories && `Category: ${product.categories}`}
                      {product.subCategories &&
                        ` | Sub: ${product.subCategories}`}
                      {product.brand && ` | Brand: ${product.brand}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Updated Add Vendor Product Selection Modal with pricing fields
  // Add Vendor Product Selection Modal
  const AddVendorProductSelectionModal = () => {
    if (!showAddVendorProductModal) return null;

    // Function to update product pricing and auto-calculate sale price
    const updateProductPricing = (productId, field, value) => {
      setSelectedVendorProducts((prev) =>
        prev.map((product) => {
          if (product.productId === productId) {
            const updatedProduct = {
              ...product,
              pricing: {
                ...product.pricing,
                [field]: parseFloat(value) || 0,
              },
            };

            // Auto-calculate sale price: supplier price + commission (in AED)
            const supplierPrice =
              field === "supplierPrice"
                ? parseFloat(value) || 0
                : product.pricing.supplierPrice;
            const commission =
              field === "commission"
                ? parseFloat(value) || 0
                : product.pricing.commission;

            updatedProduct.pricing.salePrice = supplierPrice + commission;

            return updatedProduct;
          }
          return product;
        })
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Products for Vendor
            </h2>
            <button
              onClick={() => setShowAddVendorProductModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Search and Filters */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Products
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by product name or ID..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option value="">All Categories</option>
                    <option value="construction">Construction</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option value="">All Brands</option>
                    <option value="bosch">Bosch</option>
                    <option value="makita">Makita</option>
                    <option value="dewalt">DeWalt</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-600">In Stock Only</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      Pre-Order Items
                    </span>
                  </label>
                </div>

                <button className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto mb-6">
              {products.map((product) => {
                const isSelected = selectedVendorProducts.find(
                  (p) => p.productId === product.productId
                );
                return (
                  <div
                    key={product.productId}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleVendorProductSelect(product)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {product.name}
                      </h3>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>ID: {product.productId}</div>
                      <div>Category: {product.category}</div>
                      <div>Price: ${product.price || 0}</div>
                      <div
                        className={
                          product.stock > 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        Stock: {product.stock || 0}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Products with Pricing */}
            {selectedVendorProducts.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">
                  Selected Products ({selectedVendorProducts.length}) - Set
                  Pricing
                </h4>
                <div className="space-y-4">
                  {selectedVendorProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">
                          {product.productName}
                        </h5>
                        <span className="text-xs text-gray-500">
                          ID: {product.productId}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Supplier Price */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Supplier Price (AED)
                          </label>
                          <input
                            type="number"
                            value={product.pricing.supplierPrice || ""}
                            onChange={(e) =>
                              updateProductPricing(
                                product.productId,
                                "supplierPrice",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="200.00"
                            step="0.01"
                            min="0"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            Base cost from supplier
                          </div>
                        </div>

                        {/* Commission in AED */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Commission (AED)
                          </label>
                          <input
                            type="number"
                            value={product.pricing.commission || ""}
                            onChange={(e) =>
                              updateProductPricing(
                                product.productId,
                                "commission",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="50.00"
                            step="0.01"
                            min="0"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            Your profit margin in AED
                          </div>
                        </div>

                        {/* Sale Price - Auto Calculated */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Sale Price (AED)
                          </label>
                          <div className="w-full border border-gray-200 bg-green-50 rounded-md px-2 py-1 text-sm font-medium text-green-700 flex items-center justify-between">
                            <span>
                              {(product.pricing.salePrice || 0).toFixed(2)}
                            </span>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                              Auto
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Supplier Price + Commission
                          </div>
                        </div>
                      </div>

                      {/* Pricing Formula Display */}
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="text-xs text-blue-800">
                          <strong>Pricing Formula:</strong>{" "}
                          {(product.pricing.supplierPrice || 0).toFixed(2)} +{" "}
                          {(product.pricing.commission || 0).toFixed(2)} ={" "}
                          <strong>
                            {(product.pricing.salePrice || 0).toFixed(2)} AED
                          </strong>
                        </div>
                        {product.pricing.supplierPrice > 0 &&
                          product.pricing.commission > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              Profit Margin:{" "}
                              {(
                                (product.pricing.commission /
                                  product.pricing.salePrice) *
                                100
                              ).toFixed(1)}
                              %
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bulk Pricing Actions */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="text-sm font-medium text-yellow-800 mb-3">
                    Bulk Pricing Actions
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-yellow-700 mb-1">
                        Set Commission for All (AED)
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          placeholder="50.00"
                          className="flex-1 border border-yellow-300 rounded-l-md px-2 py-1 text-sm"
                          step="0.01"
                          min="0"
                          id="bulkCommission"
                        />
                        <button
                          onClick={() => {
                            const bulkCommission =
                              document.getElementById("bulkCommission").value;
                            if (bulkCommission) {
                              selectedVendorProducts.forEach((product) => {
                                updateProductPricing(
                                  product.productId,
                                  "commission",
                                  bulkCommission
                                );
                              });
                            }
                          }}
                          className="px-3 py-1 bg-yellow-600 text-white rounded-r-md hover:bg-yellow-700 text-xs"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-yellow-700 mb-1">
                        Add Fixed Amount to All (AED)
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          placeholder="25.00"
                          className="flex-1 border border-yellow-300 rounded-l-md px-2 py-1 text-sm"
                          step="0.01"
                          min="0"
                          id="bulkAdd"
                        />
                        <button
                          onClick={() => {
                            const bulkAdd =
                              document.getElementById("bulkAdd").value;
                            if (bulkAdd) {
                              selectedVendorProducts.forEach((product) => {
                                const currentCommission =
                                  product.pricing.commission || 0;
                                updateProductPricing(
                                  product.productId,
                                  "commission",
                                  currentCommission + parseFloat(bulkAdd)
                                );
                              });
                            }
                          }}
                          className="px-3 py-1 bg-yellow-600 text-white rounded-r-md hover:bg-yellow-700 text-xs"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-yellow-700 mb-1">
                        Quick Actions
                      </label>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            selectedVendorProducts.forEach((product) => {
                              updateProductPricing(
                                product.productId,
                                "commission",
                                30
                              );
                            });
                          }}
                          className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                        >
                          30 AED
                        </button>
                        <button
                          onClick={() => {
                            selectedVendorProducts.forEach((product) => {
                              updateProductPricing(
                                product.productId,
                                "commission",
                                50
                              );
                            });
                          }}
                          className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                        >
                          50 AED
                        </button>
                        <button
                          onClick={() => {
                            selectedVendorProducts.forEach((product) => {
                              updateProductPricing(
                                product.productId,
                                "commission",
                                100
                              );
                            });
                          }}
                          className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                        >
                          100 AED
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {selectedVendorProducts.length > 0 && (
                <div>
                  Total Products: {selectedVendorProducts.length} | Total Value:{" "}
                  {selectedVendorProducts
                    .reduce((sum, p) => sum + (p.pricing.salePrice || 0), 0)
                    .toFixed(2)}{" "}
                  AED
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddVendorProductModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addSelectedProductsToNewVendor}
                disabled={selectedVendorProducts.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Add {selectedVendorProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Updated Add Vendor Modal to display products with pricing
  const AddVendorModal = () => {
    if (!showAddVendorModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Add New Vendor
            </h2>
            <button
              onClick={() => {
                setShowAddVendorModal(false);
                resetNewVendorForm();
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newVendor.name}
                    onChange={(e) => {
                      setNewVendor((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newVendor.phone}
                    onChange={(e) => {
                      setNewVendor((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+971-XX-XXX-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => {
                      setNewVendor((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="vendor@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newVendor.status}
                    onChange={(e) => {
                      setNewVendor((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Offline">Offline</option>
                    <option value="Busy">Busy</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newVendor.location.city}
                    onChange={(e) => {
                      setNewVendor((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          city: e.target.value,
                        },
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Dubai, Abu Dhabi, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area
                  </label>
                  <input
                    type="text"
                    value={newVendor.location.area}
                    onChange={(e) => {
                      setNewVendor((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          area: e.target.value,
                        },
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sharjah, Ajman, etc."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    value={newVendor.location.fullAddress}
                    onChange={(e) => {
                      setNewVendor((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          fullAddress: e.target.value,
                        },
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Complete address with landmarks"
                  />
                </div>
              </div>
            </div>

            {/* Available Products with Pricing */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Available Products
                </h3>
                <button
                  onClick={() => setShowAddVendorProductModal(true)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Products
                </button>
              </div>

              {newVendor.availableProducts.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No products selected</p>
                  <p className="text-sm text-gray-500">
                    Click "Select Products" to add products
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newVendor.availableProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {product.productName}
                        </h4>
                        <span className="text-xs text-gray-500">
                          ID: {product.productId}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Supplier:</span>
                          <span className="ml-1 font-medium">
                            AED {product.pricing.supplierPrice}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Commission:</span>
                          <span className="ml-1 font-medium">
                            {product.pricing.commission}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Commission AED:</span>
                          <span className="ml-1 font-medium">
                            {(
                              (product.pricing.supplierPrice *
                                product.pricing.commission) /
                              100
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Sale Price:</span>
                          <span className="ml-1 font-medium text-green-600">
                            AED {product.pricing.salePrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setShowAddVendorModal(false);
                resetNewVendorForm();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submitNewVendor}
              disabled={
                addingVendor ||
                !newVendor.name ||
                !newVendor.phone ||
                newVendor.availableProducts.length === 0
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {addingVendor ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Vendor...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Edit Vendor Modal remains the same
  const EditVendorModal = () => {
    if (!showEditVendorModal || !editingVendor) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Edit Vendor</h2>
            <button
              onClick={() => {
                setShowEditVendorModal(false);
                setEditingVendor(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingVendor.name}
                    onChange={(e) => {
                      setEditingVendor((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingVendor.phone}
                    onChange={(e) => {
                      setEditingVendor((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+971-XX-XXX-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingVendor.email || ""}
                    onChange={(e) => {
                      setEditingVendor((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="vendor@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingVendor.status}
                    onChange={(e) => {
                      setEditingVendor((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setShowEditVendorModal(false);
                setEditingVendor(null);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submitEditVendor}
              disabled={
                updatingVendor || !editingVendor.name || !editingVendor.phone
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {updatingVendor ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Vendor...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Vendor
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Vendor Management Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage vendors and orders for construction materials
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mb-6">
          <div className="flex space-x-1">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === "Vendor Management"
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("Vendor Management")}
            >
              <Users className="h-4 w-4 mr-2 inline" />
              Vendor Management
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              onClick={() => setShowAddVendorModal(true)}
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Add New Vendor
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              onClick={navigateToAllOrders}
            >
              <ShoppingCart className="h-4 w-4 mr-2 inline" />
              All Orders
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              onClick={() => (window.location.href = "/assign-vendor-areas")}
            >
              <MapPinIcon className="h-4 w-4 mr-2 inline" />
              Assign Areas to Vendors
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* Management Only Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="text-center">
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium inline-block mb-2">
                  Management Only
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setShowProductSelector(true)}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Products */}
            <div className="bg-gray-100 rounded-lg p-1 mb-4">
              {selectedProducts.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No products selected
                </div>
              ) : (
                selectedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white text-gray-900 shadow-sm w-full text-center py-2 px-3 text-sm font-medium rounded mb-1 last:mb-0 flex items-center justify-between"
                  >
                    <span>{product.name}</span>
                    <button
                      onClick={() => removeSelectedProduct(product._id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                Vendors ({vendors.length})
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Offline">Offline</option>
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="responseTime">Sort by Response Time</option>
                  <option value="createdAt">Sort by Date</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Bulk Actions */}
            {selectedVendors.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {selectedVendors.length} vendor(s) selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkStatusUpdate("Available")}
                      disabled={bulkOperating}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Make Available
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate("Offline")}
                      disabled={bulkOperating}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:bg-gray-400"
                    >
                      Make Offline
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkOperating}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Vendor Selection Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    selectedVendors.length === vendors.length &&
                    vendors.length > 0
                  }
                  onChange={handleSelectAll}
                  className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">
                  Select All Available (
                  {vendors.filter((v) => v.status === "Available").length})
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchVendorData}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Vendor List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading vendors...</p>
                </div>
              ) : vendors.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No vendors found
                  </h3>
                  <p className="text-gray-600">
                    {filters.search
                      ? "No vendors match your search criteria"
                      : "No vendors available"}
                  </p>
                  <button
                    onClick={() => setShowAddVendorModal(true)}
                    className="mt-4 flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Vendor
                  </button>
                </div>
              ) : (
                vendors.map(renderVendorCard)
              )}
            </div>
          </div>

          {/* Right Sidebar - System Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                System Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.activeVendors}
                  </div>
                  <div className="text-sm text-gray-600">Active Vendors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-400">
                    {stats.offlineVendors}
                  </div>
                  <div className="text-sm text-gray-600">Offline Vendors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.totalOrders}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-600">
                    {stats.pendingOrders}
                  </div>
                  <div className="text-sm text-gray-600">Pending Orders</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ProductSelectorModal />
        <EditVendorModal />
        <AddVendorModal />
        <AddVendorProductSelectionModal />
      </div>
    </div>
  );
};

export default VendorManagementDashboard;
