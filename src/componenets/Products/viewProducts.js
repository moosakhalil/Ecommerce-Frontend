import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  SearchIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { toast } from "react-hot-toast";

// Updated API URL to connect to your backend server
const API_URL = "http://localhost:5000";

const ViewProducts = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products with search, filter, and pagination
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Build the URL with query parameters
      let url = `${API_URL}/api/products`;

      // Add query parameters for search, filters, pagination
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (dateFilter) params.append("date", dateFilter);
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log(`Fetching products from: ${url}`);
      const response = await axios.get(url);

      if (response.data && response.data.success) {
        console.log("Products fetched successfully:", response.data);
        setProducts(response.data.data);
        setTotalItems(response.data.count || response.data.data.length);
      } else {
        console.error("Failed to fetch products:", response.data);
        setError(
          "Failed to fetch products: " +
            (response.data.message || "Unknown error")
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

  // Fetch products on mount and when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    fetchProducts();
  };

  // Handle status filter change
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page
  };

  // Handle date filter change
  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setCurrentPage(1); // Reset to first page
  };

  // View product details
  const viewProductDetails = async (productId) => {
    try {
      setLoading(true);
      console.log(`Fetching details for product ID: ${productId}`);

      const response = await axios.get(`${API_URL}/api/products/${productId}`);

      if (response.data && response.data.success) {
        console.log(
          "Product details fetched successfully:",
          response.data.data
        );
        setSelectedProduct(response.data.data);
        setShowDetails(true);
      } else {
        console.error("Failed to fetch product details:", response.data);
        toast.error(
          "Failed to load product details: " +
            (response.data.message || "Unknown error")
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
          <h1 className="text-xl font-medium">Product List</h1>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-purple-700 px-2 py-1 rounded">
              {totalItems} Products
            </span>
          </div>
        </div>

        {!showDetails ? (
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
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price/Unit
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Stock
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Sold
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Out of Stock Alert
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-700"></div>
                            <span>Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-6 py-4 text-center text-red-500"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-4 text-center">
                          No products found
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.productId || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.productName || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.categories || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${product.suggestedRetailPrice || "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.stock || "0"}{" "}
                            {product.productType === "Parent" ? "" : "bags"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {/* Sold field is empty for now */}-
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                            {/* Out of Stock Alert field is empty for now */}-
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => viewProductDetails(product._id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Product Details
                            </button>
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
        ) : (
          /* Product Details View */
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
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Edit
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>

            {/* Product details form view */}
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

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Height
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Length
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Width
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unit
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Colour
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedProduct.specifications &&
                          selectedProduct.specifications.length > 0 ? (
                            selectedProduct.specifications.map(
                              (spec, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {spec.height || "-"}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {spec.length || "-"}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {spec.width || "-"}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {spec.unit || "-"}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {spec.colours || "-"}
                                  </td>
                                </tr>
                              )
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan="5"
                                className="px-4 py-2 text-center text-sm text-gray-500"
                              >
                                No specifications available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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
                            value={selectedProduct.stockAmount || "0"}
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
                            value={selectedProduct.safetyDays || "0"}
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
                            value={selectedProduct.safetyDaysStock || "0"}
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
                            value={selectedProduct.deliveryDays || "0"}
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
                            value={selectedProduct.deliveryTime || "0"}
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

                  {/* Supplier Information */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">
                      Supplier Information
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier Name
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.supplierName || ""}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier Contact
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.supplierContact || ""}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier Email
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.supplierEmail || ""}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier Address
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.supplierAddress || ""}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Pricing</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Suggested Retail Price
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.suggestedRetailPrice || "0.00"}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.anyDiscount || "0%"}
                          readOnly
                          className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price After Discount
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.NormalPrice || "0.00"}
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
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="public"
                          checked={selectedProduct.visibility === "Public"}
                          readOnly
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="public"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Publicly visible
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="private"
                          checked={selectedProduct.visibility === "Private"}
                          readOnly
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="private"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Hidden
                        </label>
                      </div>

                      <div className="flex items-center mt-3">
                        <input
                          type="checkbox"
                          id="onceShare"
                          checked={selectedProduct.onceShare || false}
                          readOnly
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="onceShare"
                          className="ml-2 block text-sm text-gray-500"
                        >
                          Once there is less than 2 days automatically end make
                          visible when restocked/received
                        </label>
                      </div>

                      <div className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          id="noChildHideParent"
                          checked={selectedProduct.noChildHideParent || false}
                          readOnly
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="noChildHideParent"
                          className="ml-2 block text-sm text-gray-500"
                        >
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

                    <h3 className="text-lg font-medium my-4">Tags</h3>

                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags &&
                      selectedProduct.tags.length > 0 ? (
                        selectedProduct.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No tags</span>
                      )}
                    </div>
                  </div>

                  {/* Images */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Images</h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Master Image
                      </label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden h-48">
                        {selectedProduct.masterImage ? (
                          <img
                            src={`${API_URL}${selectedProduct.masterImage}`}
                            alt="Product Master"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/api/placeholder/400/320";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400">
                              No image available
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Images
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedProduct.moreImages &&
                        selectedProduct.moreImages.length > 0 ? (
                          selectedProduct.moreImages.map((imgSrc, index) => (
                            <div
                              key={index}
                              className="border border-gray-300 rounded-lg overflow-hidden h-24"
                            >
                              <img
                                src={`${API_URL}${imgSrc}`}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/api/placeholder/150/120";
                                }}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="col-span-3 border border-gray-300 rounded-lg h-24 flex items-center justify-center">
                            <span className="text-gray-400">
                              No additional images
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Notes</h3>

                    <textarea
                      readOnly
                      value={selectedProduct.notes || ""}
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
        )}
      </div>
    </div>
  );
};

export default ViewProducts;
