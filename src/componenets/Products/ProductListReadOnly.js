import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  SearchIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ArrowLeftIcon,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../../utils/config";

const API_URL = API_BASE_URL;

// Helper function to get image src from different formats
const getImageSrc = (imageData) => {
  if (!imageData) return null;

  // If it's already a string (data URL or path)
  if (typeof imageData === "string") {
    if (imageData.startsWith("data:")) {
      return imageData; // Already a data URL
    }
    return `${API_URL}${imageData}`; // Path - prepend API URL
  }

  // If it's a Buffer object from MongoDB { data: { type: 'Buffer', data: [...] }, contentType: '...' }
  if (imageData.data && imageData.contentType) {
    try {
      // Handle when data is a Buffer-like object with data array
      const bufferData = imageData.data.data || imageData.data;

      if (Array.isArray(bufferData)) {
        // Convert byte array to base64
        const base64 = btoa(
          bufferData.reduce(
            (data, byte) => data + String.fromCharCode(byte),
            "",
          ),
        );
        return `data:${imageData.contentType};base64,${base64}`;
      } else if (typeof bufferData === "string") {
        // Already base64 encoded
        return `data:${imageData.contentType};base64,${bufferData}`;
      }
    } catch (e) {
      console.error("Error converting image:", e);
      return null;
    }
  }

  return null;
};

const ProductListReadOnly = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModeToggle, setShowModeToggle] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // View states
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/products`;

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (dateFilter) params.append("date", dateFilter);
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);

      if (response.data && response.data.success) {
        setProducts(response.data.data);
        setTotalItems(response.data.count || response.data.data.length);
      } else {
        setError(
          "Failed to fetch products: " +
            (response.data.message || "Unknown error"),
        );
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(`Failed to load products: ${err.message}`);
      toast.error(`Failed to load products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  // Handle status filter change
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle date filter change
  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setCurrentPage(1);
  };

  // View product details
  const viewProductDetails = async (productId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products/${productId}`);

      if (response.data && response.data.success) {
        setSelectedProduct(response.data.data);
        setShowDetails(true);
      } else {
        toast.error(
          "Failed to load product details: " +
            (response.data.message || "Unknown error"),
        );
      }
    } catch (err) {
      console.error("Error fetching product details:", err);
      toast.error(`Failed to load product details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Close product details
  const closeProductDetails = () => {
    setShowDetails(false);
    setSelectedProduct(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationArray = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationArray.push(i);
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50 p-4`}
      >
        {/* Header */}
        <div className="bg-purple-900 text-white p-3 flex justify-between items-center mb-4">
          <h1 className="text-xl font-medium">
            <strong>32.</strong> Product List (View Only)
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowModeToggle(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1.5"
            >
              <span>🚀</span>
              <span>Advanced</span>
            </button>
            <button
              onClick={() => setShowModeToggle(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1.5"
            >
              <span>🤖</span>
              <span>AI</span>
            </button>
            <span className="text-xs bg-purple-700 px-2 py-1 rounded">
              {totalItems} Products
            </span>
          </div>
        </div>

        {showDetails ? (
          /* Product Details View (Read-only) */
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={closeProductDetails}
                  className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <ArrowLeftIcon size={18} />
                  <span className="ml-1">Back to list</span>
                </button>
                <h2 className="text-xl font-semibold">Product Details</h2>
              </div>
            </div>

            {/* Product Details Content */}
            {selectedProduct ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left and middle columns */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product ID
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.productId || ""}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Type
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.productType || ""}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name/Title
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.productName || ""}
                        readOnly
                        className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.brand || ""}
                        readOnly
                        className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        readOnly
                        value={selectedProduct.description || ""}
                        className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        rows="4"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GTIN
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.globalTradeItemNumber || ""}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          K3L Number
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.k3lNumber || ""}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SNI Number
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.sniNumber || ""}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Specifications</h3>
                    {selectedProduct.specifications?.map((spec, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-5 gap-2 mb-4 p-3 border rounded bg-gray-50"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Height
                          </label>
                          <input
                            type="text"
                            value={spec.height || ""}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Length
                          </label>
                          <input
                            type="text"
                            value={spec.length || ""}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Width
                          </label>
                          <input
                            type="text"
                            value={spec.width || ""}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            value={spec.unit || ""}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Colour
                          </label>
                          <input
                            type="text"
                            value={spec.colours || ""}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Inventory */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Inventory</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock Amount
                          </label>
                          <input
                            type="text"
                            value={selectedProduct.Stock || 0}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Safety Days
                          </label>
                          <input
                            type="text"
                            value={selectedProduct.safetyDays || 0}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Safety Days Stock
                          </label>
                          <input
                            type="text"
                            value={selectedProduct.safetyDaysStock || 0}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Days
                          </label>
                          <input
                            type="text"
                            value={selectedProduct.deliveryDays || ""}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Time
                          </label>
                          <input
                            type="text"
                            value={selectedProduct.deliveryTime || ""}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reorder Setting
                          </label>
                          <input
                            type="text"
                            value={selectedProduct.reOrderSetting || ""}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Net Total Final Payment
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.NormalPrice || 0}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount (%)
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.anyDiscount || 0}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  {/* Visibility */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Visibility</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.visibility || ""}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>
                      <div className="flex items-center mt-3">
                        <input
                          type="checkbox"
                          checked={selectedProduct.onceShare || false}
                          readOnly
                          disabled
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-500">
                          Once there is less than 2 days automatically end make
                          visible when restocked/received
                        </label>
                      </div>
                      <div className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          checked={selectedProduct.noChildHideParent || false}
                          readOnly
                          disabled
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-500">
                          If no child, then parent hidden
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Categories and Tags */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Categories</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.categories || ""}
                        readOnly
                        className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub-Category
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.subCategories || ""}
                        readOnly
                        className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                      />
                    </div>

                    {/* Additional Categories for Child Products */}
                    {selectedProduct.productType === "Child" &&
                      selectedProduct.additionalCategories &&
                      selectedProduct.additionalCategories.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">
                            Additional Categories
                          </h4>
                          <div className="space-y-2">
                            {selectedProduct.additionalCategories.map(
                              (addCat, idx) => (
                                <div key={idx} className="flex gap-2 text-sm">
                                  <span className="bg-white px-2 py-1 rounded border">
                                    {addCat.category}
                                  </span>
                                  <span className="text-gray-400">/</span>
                                  <span className="bg-white px-2 py-1 rounded border">
                                    {addCat.subcategory}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    <h3 className="text-lg font-medium my-4">Tags</h3>
                    <div className="space-y-2">
                      {selectedProduct.tags?.map((tag, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tag}
                            readOnly
                            className="flex-1 border border-gray-300 p-2 rounded bg-gray-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Images</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Master Image
                      </label>
                      {selectedProduct.masterImage ? (
                        <img
                          src={getImageSrc(selectedProduct.masterImage)}
                          alt="Master"
                          className="h-32 object-contain mx-auto border rounded p-2"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/api/placeholder/300/200";
                          }}
                        />
                      ) : (
                        <div className="h-32 flex items-center justify-center bg-gray-100 rounded">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Images
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.moreImages?.map((image, index) => (
                          <div key={index}>
                            {image ? (
                              <img
                                src={getImageSrc(image)}
                                alt={`Additional ${index + 1}`}
                                className="h-24 w-full object-contain border rounded p-2"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/api/placeholder/300/200";
                                }}
                              />
                            ) : (
                              <div className="h-24 flex items-center justify-center bg-gray-100 rounded">
                                <span className="text-gray-400 text-xs">
                                  No image
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Notes</h3>
                    <textarea
                      value={selectedProduct.notes || ""}
                      readOnly
                      className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center p-12">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700 mb-4"></div>
                  <p>Loading product details...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Product List View */
          <>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
              <div className="flex">
                <form onSubmit={handleSearch} className="relative w-64">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-l pl-3 pr-10 py-2 focus:outline-none"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center"
                  >
                    <SearchIcon size={18} className="text-gray-500" />
                  </button>
                </form>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="border border-gray-300 rounded-r h-full px-3 py-2 appearance-none focus:outline-none"
                  >
                    <option value="All">Status : All</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                  <ChevronDownIcon
                    size={18}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  className="border border-gray-300 rounded h-full px-3 py-2 appearance-none focus:outline-none"
                >
                  <option value="">Filter by date range</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <ChevronDownIcon
                  size={18}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        BID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Additional Categories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Total Final Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Out of Stock Alert
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="12" className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-700"></div>
                            <span>Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan="12"
                          className="px-6 py-4 text-center text-red-500"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="px-6 py-4 text-center">
                          No products found
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          {/* NID - Normal ID */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.productType === "Normal" ? (
                              <span className="font-medium text-green-600">
                                {product.productId}
                              </span>
                            ) : product.productType === "Child" &&
                              product.normalId ? (
                              <span className="font-medium text-green-600">
                                {product.normalId}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          {/* CID - Child ID */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.productType === "Child" ? (
                              <span className="font-medium text-blue-600">
                                {product.productId}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          {/* PID - Parent ID */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.productType === "Parent" ? (
                              <span className="font-medium text-purple-600">
                                {product.productId}
                              </span>
                            ) : product.productType === "Child" &&
                              product.parentProduct ? (
                              <span className="font-medium text-purple-400">
                                {product.parentProduct}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          {/* BID - Batch ID */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.batchDiscounts &&
                            product.batchDiscounts.length > 0 ? (
                              <span className="font-medium text-orange-600">
                                {product.batchDiscounts[0].batchNumber}
                                {product.batchDiscounts.length > 1 && (
                                  <span className="text-xs text-gray-400">
                                    {" "}
                                    +{product.batchDiscounts.length - 1}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.productName || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.categories || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {product.productType === "Child" &&
                            product.additionalCategories &&
                            product.additionalCategories.length > 0 ? (
                              <div className="space-y-1">
                                {product.additionalCategories.map(
                                  (addCat, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs bg-blue-50 px-2 py-1 rounded inline-block mr-1"
                                    >
                                      {addCat.category} / {addCat.subcategory}
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${product.NormalPrice || "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.Stock || "0"}{" "}
                            {product.productType === "Parent" ? "" : "items"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            -
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                            -
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => viewProductDetails(product._id)}
                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                              >
                                <EyeIcon size={16} />
                                <span>View</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">
                    Showing
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="mx-1 border border-gray-300 rounded px-1"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    of {totalItems}
                  </span>
                </div>
                <div className="flex justify-between">
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {paginationArray.map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-purple-600 border-purple-600 text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronRightIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showModeToggle && (
        <ModeToggle
          componentName="Product List Management (View Only)"
          onClose={() => setShowModeToggle(false)}
        />
      )}
    </div>
  );
};

export default ProductListReadOnly;
