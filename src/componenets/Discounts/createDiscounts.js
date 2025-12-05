import React, { useState, useEffect } from "react";
import {
  Lock,
  Search,
  ChevronDown,
  Bell,
  DollarSign,
  Percent,
  Calendar,
  Tag,
  Users,
  Package,
} from "lucide-react";

const discountTypes = [
  "clearance",
  "new product",
  "general discount",
  "discount specific amount",
  "above amount (discount)",
  "above amount (for free delivery)",
];

const forWhoOptions = [
  "public",
  "public referral",
  "forman",
  "forman referral",
  "forman earnings mlm",
];

export default function CreateDiscount() {
  // State management
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    discountType: "",
    forWho: "",
    originalPrice: "",
    oldPrice: "",
    newPrice: "",
    startDate: "",
    endDate: "",
    amount: "",
    discountTitle: "",
    description: "",
    status: "Enabled",
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [calculatedDiscount, setCalculatedDiscount] = useState({
    amount: 0,
    percentage: 0,
  });

  // Check if discount type is "above amount" type
  const isAboveAmountType = (type) => {
    return type.includes("above amount");
  };

  // Search for products
  const searchProducts = async (query) => {
    if (!query.trim()) {
      setProducts([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Try multiple possible endpoints
      const possibleEndpoints = [
        `http://localhost:5000/api/products`,
      ];

      let response;
      let data;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log("Trying endpoint:", endpoint);
          response = await fetch(endpoint);
          if (response.ok) {
            data = await response.json();
            console.log("Success with endpoint:", endpoint, data);
            break;
          }
        } catch (err) {
          console.log("Failed endpoint:", endpoint, err.message);
          continue;
        }
      }

      if (data && data.success) {
        // Handle different response formats
        let products = [];
        if (data.data && Array.isArray(data.data)) {
          products = data.data.map((product) => ({
            id: product._id,
            productId: product.productId,
            productName: product.productName,
            categories: product.categories,
            normalPrice: product.NormalPrice || 0,
            stock: product.Stock || 0,
            hasDiscount: !!product.discountConfig,
            displayText: `${product.productName} (#${product.productId}) - ${
              product.NormalPrice || 0
            }`,
            currentDiscountPrice: product.hasActiveDiscount
              ? product.discountConfig?.newPrice
              : null,
          }));
        }

        setProducts(products);
        setShowResults(true);
      } else {
        throw new Error("No valid endpoint found or invalid response");
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setProducts([]);
      // Show user-friendly error
      setErrorMessage(
        `Unable to load products. Please check if the server is running on port 5000. Error: ${error.message}`
      );
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchTerm(product.displayText);
    setShowResults(false);

    // Pre-fill original price from product data
    setFormData((prev) => ({
      ...prev,
      originalPrice: product.normalPrice.toString() || "",
      oldPrice: product.normalPrice.toString() || "",
    }));
  };

  // Calculate discount when prices change
  useEffect(() => {
    const { originalPrice, newPrice } = formData;
    if (originalPrice && newPrice) {
      const original = parseFloat(originalPrice);
      const discounted = parseFloat(newPrice);

      if (original > 0 && discounted >= 0 && discounted < original) {
        const amount = original - discounted;
        const percentage = ((amount / original) * 100).toFixed(2);

        setCalculatedDiscount({
          amount: amount.toFixed(2),
          percentage: parseFloat(percentage),
        });
      } else {
        setCalculatedDiscount({ amount: 0, percentage: 0 });
      }
    }
  }, [formData.originalPrice, formData.newPrice]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const required = [
      "discountType",
      "forWho",
      "originalPrice",
      "newPrice",
      "startDate",
      "discountTitle",
    ];

    for (const field of required) {
      if (!formData[field]) {
        throw new Error(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        );
      }
    }

    if (!selectedProduct) {
      throw new Error("Please select a product");
    }

    const originalPrice = parseFloat(formData.originalPrice);
    const newPrice = parseFloat(formData.newPrice);

    if (isNaN(originalPrice) || originalPrice <= 0) {
      throw new Error("Original price must be a valid positive number");
    }

    if (isNaN(newPrice) || newPrice < 0) {
      throw new Error("New price must be a valid non-negative number");
    }

    if (newPrice >= originalPrice) {
      throw new Error("New price must be less than original price");
    }

    if (formData.endDate && formData.endDate <= formData.startDate) {
      throw new Error("End date must be after start date");
    }
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      // Validate form
      validateForm();

      // Try multiple possible endpoints for creating discount
      const possibleEndpoints = [
        `http://localhost:5000/api/products/${selectedProduct.id}/discount`,
        `http://localhost:5000/api/products/${selectedProduct.id}`, // Fallback to regular update
      ];

      let response;
      let data;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log("Trying to save discount at:", endpoint);
          response = await fetch(endpoint, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          if (response.ok) {
            data = await response.json();
            console.log("Success saving discount:", data);
            break;
          }
        } catch (err) {
          console.log("Failed to save at:", endpoint, err.message);
          continue;
        }
      }

      if (data && data.success) {
        setSuccessMessage(`✅ Discount created successfully for ${selectedProduct.productName}! 
          Price: ${formData.originalPrice} → ${formData.newPrice} 
          (${calculatedDiscount.percentage}% off, saving ${calculatedDiscount.amount})`);

        // Reset form
        resetForm();
      } else {
        throw new Error(
          data?.message ||
            "Failed to create discount - API endpoint not available"
        );
      }
    } catch (error) {
      console.error("Save error:", error);
      setErrorMessage(
        `❌ Error: ${error.message}. Please ensure the discount API routes are added to your products router.`
      );
    } finally {
      setLoading(false);
      // Clear messages after 6 seconds
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 6000);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      discountType: "",
      forWho: "",
      originalPrice: "",
      oldPrice: "",
      newPrice: "",
      startDate: "",
      endDate: "",
      amount: "",
      discountTitle: "",
      description: "",
      status: "Enabled",
    });
    setSelectedProduct(null);
    setSearchTerm("");
    setCalculatedDiscount({ amount: 0, percentage: 0 });
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && !selectedProduct) {
        searchProducts(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedProduct]);

  return (
    <div>
      {/* Main Content */}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 p-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-white space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Lock size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                71 Create Discount (discount is applied to one product at a
                time)
              </h1>
              <p className="text-purple-100 text-sm">
                Apply discounts to products for different customer groups
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Bell
              className="text-white cursor-pointer hover:text-purple-200"
              size={20}
            />
            <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              JM
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <DollarSign size={16} />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg shadow-sm">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg shadow-sm">
            {errorMessage}
          </div>
        )}

        {/* Product Selection */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="text-purple-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">
              Select Product
            </h2>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search products by name, ID, or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedProduct) {
                  setSelectedProduct(null);
                }
              }}
              className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 -mt-2">
              {isSearching ? (
                <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              ) : (
                <Search className="text-gray-400" size={16} />
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && products.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-800">
                          {product.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {product.productId} | Category:{" "}
                          {product.categories || "N/A"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-purple-600">
                          ${product.normalPrice}
                        </div>
                        <div className="text-xs text-gray-500">
                          Stock: {product.stock}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Product Display */}
          {selectedProduct && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-800">
                    {selectedProduct.productName}
                  </h3>
                  <p className="text-sm text-purple-600">
                    Product ID: {selectedProduct.productId} | Category:{" "}
                    {selectedProduct.categories || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-800">
                    ${selectedProduct.normalPrice}
                  </div>
                  <div className="text-sm text-purple-600">Current Price</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Discount Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Discount Type & Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Discount Types */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="text-purple-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Discount Type
                  </h3>
                </div>
                <div className="space-y-3">
                  {discountTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center group cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="discountType"
                        value={type}
                        checked={formData.discountType === type}
                        onChange={(e) =>
                          handleInputChange("discountType", e.target.value)
                        }
                        className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span
                        className={`group-hover:text-purple-700 transition-colors capitalize ${
                          isAboveAmountType(type)
                            ? "text-red-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="text-purple-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Target Audience
                  </h3>
                </div>
                <div className="space-y-3">
                  {forWhoOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center group cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="forWho"
                        value={option}
                        checked={formData.forWho === option}
                        onChange={(e) =>
                          handleInputChange("forWho", e.target.value)
                        }
                        className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 group-hover:text-purple-700 transition-colors capitalize">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <DollarSign className="text-purple-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">
                  Pricing Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      handleInputChange("originalPrice", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Old Price (Display)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={(e) =>
                      handleInputChange("oldPrice", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.newPrice}
                    onChange={(e) =>
                      handleInputChange("newPrice", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Discount Calculation Display */}
              {calculatedDiscount.amount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Percent className="text-green-600" size={16} />
                      <span className="text-green-800 font-medium">
                        Discount Calculation
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-800 font-bold">
                        {calculatedDiscount.percentage}% OFF
                      </div>
                      <div className="text-green-600 text-sm">
                        Save ${calculatedDiscount.amount}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Schedule Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <Calendar className="text-purple-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">
                  Schedule
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            </div>

            {/* Discount Details */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Discount Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Title *
                  </label>
                  <input
                    type="text"
                    value={formData.discountTitle}
                    onChange={(e) =>
                      handleInputChange("discountTitle", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Summer Sale 2024, New Product Launch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Brief description of the discount offer..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status & Summary */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Status
              </h3>
              <div className="space-y-3">
                {["Enabled", "Disabled"].map((status) => (
                  <label
                    key={status}
                    className="flex items-center group cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span
                      className={`group-hover:text-purple-700 transition-colors ${
                        status === "Enabled"
                          ? "text-green-700 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Discount Summary */}
            {selectedProduct && formData.originalPrice && formData.newPrice && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">
                  Discount Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Product:</span>
                    <span className="font-medium text-gray-800">
                      {selectedProduct.productName}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-700">Original Price:</span>
                    <span className="font-medium text-gray-800">
                      ${formData.originalPrice}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-700">New Price:</span>
                    <span className="font-bold text-green-600">
                      ${formData.newPrice}
                    </span>
                  </div>

                  <hr className="border-purple-200" />

                  <div className="flex justify-between">
                    <span className="text-gray-700">You Save:</span>
                    <span className="font-bold text-green-600">
                      ${calculatedDiscount.amount}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-700">Discount:</span>
                    <span className="font-bold text-green-600">
                      {calculatedDiscount.percentage}%
                    </span>
                  </div>

                  {formData.discountType && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Type:</span>
                      <span
                        className={`font-medium capitalize ${
                          isAboveAmountType(formData.discountType)
                            ? "text-red-600"
                            : "text-purple-700"
                        }`}
                      >
                        {formData.discountType}
                      </span>
                    </div>
                  )}

                  {formData.forWho && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">For:</span>
                      <span className="font-medium text-purple-700 capitalize">
                        {formData.forWho}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={resetForm}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Reset Form
              </button>

              <button
                onClick={handleSave}
                disabled={loading || !selectedProduct}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Discount..." : "Create Discount"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
