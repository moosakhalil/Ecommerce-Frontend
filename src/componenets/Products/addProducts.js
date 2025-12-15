import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import {
  PlusIcon,
  XCircleIcon,
  SearchIcon,
  Save,
  AlertCircle,
  Package,
  Bike,
  Truck,
} from "lucide-react";

import Sidebar from "../Sidebar/sidebar";
import { toast } from "react-hot-toast";

const API_URL = "http://localhost:5000";

const AddProduct = () => {
  // Product type state
  const [productType, setProductType] = useState("Normal");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [parentProducts, setParentProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingParents, setIsSearchingParents] = useState(false);
  
  // Supplier selection (optional)
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // ✅ NEW: Error state for displaying errors
  const [showError, setShowError] = useState(false);
  const [errorDetails, setErrorDetails] = useState({
    title: "",
    message: "",
    technicalDetails: "",
  });

  // near top of AddProduct()
  const [categoriesList, setCategoriesList] = useState([]);
  useEffect(() => {
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => setCategoriesList(res.data.data))
      .catch(console.error);
  }, []);

  // Form data state with complete fields from all screens
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    subtitle: "",
    brand: "",
    description: "",
    varianceName: "",
    subtitleDescription: "",

    specifications: [
      {
        height: "",
        length: "",
        width: "",
        depth: "",
        colours: "",
        weight: "",
        id: 0,
      },
    ],
    stock: "",
    minimumOrder: 1,
    highestValue: "",
    normalShelvesCount: "",
    AmountStockmintoReorder: "",
    safetyDays: "",
    safetyDaysStock: "",
    // reorder flags:
    useAmountStockmintoReorder: false,
    useSafetyDays: false,
    noReorder: false,
    // yellow fields now readOnly No info:
    deliveryDays: "",
    deliveryTime: "",
    highShelvesCount: "",
    deliveryTime: "",
    reOrderSetting: "2 days average",
    inventoryInDays: "5days",
    deliveryPeriod: "1 days",
    orderTimeBackupInventory: "",
    anyDiscount: "",
    NormalPrice: "",
    Stock: "",
    visibility: "Public",
    tags: [],
    categories: "",
    notes: "",
    parentProduct: "",
    globalTradeItemNumber: "",
    k3lNumber: "",
    sniNumber: "",
    AmountStockmintoReorder: "",
    safetyDays: "",
    deliveryDays: "",
    onceShare: false,
    noChildHideParent: false,
    subCategories: "",
    packageSize: "Large",
    selectedSupplierId: "", // Optional supplier allocation
  });

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  // Master images and more images state
  const [masterImages, setMasterImages] = useState([null]);
  const [moreImages, setMoreImages] = useState([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  // For the tag selection
  const [selectedTags, setSelectedTags] = useState([]);
  const availableTags = ["Popular", "Sale", "New"];

  // Refs for image upload
  const masterImageRef = useRef(null);
  const moreImageRefs = useRef([]);

  // ✅ NEW: Helper to show error
  const handleError = (title, message, technicalDetails = "") => {
    setErrorDetails({
      title,
      message,
      technicalDetails,
    });
    setShowError(true);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setShowError(false);
    }, 10000);
  };

  // New helper to toggle reorder mode:
  const handleReorderMode = (mode) => {
    setFormData((fd) => ({
      ...fd,
      useAmountStockmintoReorder: mode === "stock",
      useSafetyDays: mode === "safety",
    }));
  };

  // Fetch parent products and suppliers on component mount
  useEffect(() => {
    const fetchParentProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products/parents`);
        if (response.data && response.data.success) {
          setParentProducts(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching parent products:", error);
      }
    };

    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/suppliers`);
        if (response.data && response.data.success) {
          setSuppliers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchParentProducts();
    fetchSuppliers();
  }, []);

  // Close supplier dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.supplier-dropdown-container')) {
        setShowSupplierDropdown(false);
      }
    };

    if (showSupplierDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSupplierDropdown]);

  // Handle product type change
  const handleProductTypeChange = (type) => {
    setProductType(type);
    if (type === "Child") {
      setFormData((prev) => ({
        ...prev,
        parentProduct: "",
      }));
    }
  };

  // Add this function to handle success
  const handleSuccess = () => {
    setShowSuccess(true);

    // Auto-dismiss after 5 seconds and refresh page
    setTimeout(() => {
      setShowSuccess(false);
      window.location.reload();
    }, 5000);
  };

  // Update handleSpecChange to handle the new field structure
  const handleSpecChange = (index, field, value) => {
    const updatedSpecs = [...formData.specifications];
    updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
    setFormData((prev) => ({ ...prev, specifications: updatedSpecs }));
  };

  // Add new specification row
  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        {
          height: "",
          length: "",
          width: "",
          depth: "",
          colours: "",
          unit: "",
          id: prev.specifications.length,
        },
      ],
    }));
  };

  // Remove a specification
  const removeSpecification = (index) => {
    if (formData.specifications.length > 1) {
      const updatedSpecs = [...formData.specifications];
      updatedSpecs.splice(index, 1);
      setFormData((prev) => ({ ...prev, specifications: updatedSpecs }));
    }
  };

  // Handle tag selection
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }

    setFormData((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  // Handle master image upload
  const handleMasterImageUpload = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newMasterImages = [...masterImages];
      newMasterImages[index] = {
        file,
        preview: URL.createObjectURL(file),
      };
      setMasterImages(newMasterImages);
    }
  };

  // Handle more images upload
  const handleMoreImageUpload = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newMoreImages = [...moreImages];
      newMoreImages[index] = {
        file,
        preview: URL.createObjectURL(file),
      };
      setMoreImages(newMoreImages);
    }
  };

  // Remove master image
  const removeMasterImage = (index) => {
    const newMasterImages = [...masterImages];
    newMasterImages[index] = null;
    setMasterImages(newMasterImages);
  };

  // Remove more image
  const removeMoreImage = (index) => {
    const newMoreImages = [...moreImages];
    newMoreImages[index] = null;
    setMoreImages(newMoreImages);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };



      return updatedFormData;
    });
  };

  // Debounced search for parent products
  const searchParentProducts = useCallback(
    async (term) => {
      if (!term || term.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearchingParents(true);
      try {
        try {
          const response = await axios.get(
            `${API_URL}/api/products/parents/search`,
            {
              params: { term },
            }
          );

          if (response.data && response.data.success) {
            setSearchResults(response.data.data);
            setShowSearchResults(true);
            return;
          }
        } catch (apiError) {
          console.log("API endpoint not available, using local search");
        }

        const filtered = parentProducts.filter(
          (product) =>
            product.productName.toLowerCase().includes(term.toLowerCase()) ||
            product.productId?.toLowerCase().includes(term.toLowerCase())
        );

        setSearchResults(filtered);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Error searching parent products:", error);
        toast.error("Failed to search parent products");
      } finally {
        setIsSearchingParents(false);
      }
    },
    [parentProducts]
  );

  // Select parent product
  const selectParentProduct = (product) => {
    setFormData((prev) => ({
      ...prev,
      parentProduct: product.productId,
    }));
    setSearchTerm("");
    setShowSearchResults(false);
  };

  const validateForm = () => {
    const requiredFields = {
      Parent: [
        "productName",
        "brand",
        "description",
      ],
      Child: [
        "parentProduct",
        "varianceName",
        "subtitleDescription",
      ],
      Normal: [
        "productName",
        "brand",
        "description",
      ],
    };

    const additionalRequiredFields = ["categories"];

    if (productType !== "Parent") {
      additionalRequiredFields.push("globalTradeItemNumber");
    }

    const allRequiredFields = [
      ...requiredFields[productType],
      ...additionalRequiredFields,
    ];

    const missingFields = allRequiredFields.filter((field) => {
      const value = formData[field];
      return !value || value.trim() === "";
    });

    if (missingFields.length > 0) {
      console.log("❌ Validation failed. Missing fields:", missingFields);
      console.log("Current formData:", formData);
      const fieldLabels = {
        productName: "Product Name",
        brand: "Brand",
        description: "Description",
        parentProduct: "Parent Product",
        varianceName: "Variance Name",
        subtitleDescription: "Subtitle Description",
        categories: "Category",
        globalTradeItemNumber: "Global Trade Item Number (GTIN)"
      };
      const readableFields = missingFields.map(field => fieldLabels[field] || field);
      toast.error(`Please fill in required fields: ${readableFields.join(", ")}`);
      return false;
    }

    console.log("✅ All required fields present");
    return true;
  };

  // ✅ ENHANCED: Submit form with comprehensive error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔵 Form submitted - starting validation...");
    console.log("📋 Current formData:", formData);

    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }

    console.log("✅ Form validation passed");
    setIsLoading(true);

    try {
      // 1) Prepare payload object
      const payload = { ...formData, productType };
      console.log("📦 Preparing payload with formData:", {
        productType: payload.productType,
        productName: payload.productName,
        categories: payload.categories,
      });

      // 2) Convert masterImage File to Base64
      if (masterImages[0]?.file) {
        try {
          console.log("🖼️ Processing master image...");
          const dataUrl = await toBase64(masterImages[0].file);
          const [header, base64] = dataUrl.split(",");
          payload.masterImage = base64;
          payload.masterImageType = header.match(/data:(.*);base64/)[1];
          console.log("✅ Master image processed successfully");
        } catch (imgError) {
          console.error("❌ Master image processing failed:", imgError);
          handleError(
            "Image Processing Error",
            "Failed to process master image",
            imgError.message
          );
          setIsLoading(false);
          return;
        }
      }

      // 3) Convert moreImages if needed
      const moreBase64 = [];
      for (let i = 0; i < moreImages.length; i++) {
        if (moreImages[i]?.file) {
          try {
            const url = await toBase64(moreImages[i].file);
            const [hdr, b64] = url.split(",");
            moreBase64.push({
              data: b64,
              contentType: hdr.match(/data:(.*);base64/)[1],
            });
          } catch (imgError) {
            console.warn(`Failed to process image ${i}:`, imgError);
          }
        }
      }
      if (moreBase64.length) {
        payload.moreImages = moreBase64;
        console.log(`✅ Processed ${moreBase64.length} additional images`);
      }

      console.log("🚀 Sending POST request to:", `${API_URL}/api/products`);
      console.log("📤 Payload summary:", {
        productType: payload.productType,
        productName: payload.productName,
        categories: payload.categories,
        hasImages: !!payload.masterImage,
        moreImagesCount: payload.moreImages?.length || 0,
      });

      // 4) POST JSON to server
      const response = await axios.post(`${API_URL}/api/products`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Server response received:", response.data);

      if (response.data.success) {
        console.log("🎉 Product created successfully!");
        handleSuccess();
      } else {
        console.log("⚠️ Server returned success:false");
        // ✅ Handle server-side validation errors
        handleError(
          "Product Creation Failed",
          response.data.message || "Failed to create product",
          JSON.stringify(response.data, null, 2)
        );
      }
    } catch (error) {
      console.error("❌ Error creating product:", error);

      // ✅ Comprehensive error handling
      let errorTitle = "Product Creation Error";
      let errorMessage =
        "An unexpected error occurred while creating the product";
      let technicalDetails = "";

      if (error.response) {
        // Server responded with error
        console.error("❌ Server error response:", error.response);
        errorTitle = `Server Error (${error.response.status})`;
        errorMessage =
          error.response.data?.message || error.response.statusText;
        technicalDetails = JSON.stringify(error.response.data, null, 2);
      } else if (error.request) {
        // Request made but no response
        console.error("❌ No response from server:", error.request);
        errorTitle = "Network Error";
        errorMessage =
          "No response from server. Please check your internet connection.";
        technicalDetails = "The request was made but no response was received";
      } else {
        // Error in request setup
        console.error("❌ Request setup error:", error.message);
        errorMessage = error.message;
        technicalDetails = error.stack || "";
      }

      handleError(errorTitle, errorMessage, technicalDetails);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      console.log("🔵 Form submission complete");
    }
  };

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
        {/* Top navigation */}
        <div className="bg-purple-900 text-white p-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm">
              {productType === "Normal"
                ? "Create new product (stand alone normal product)"
                : productType === "Parent"
                ? "Create new product (parent)"
                : "Create new product (create another child)"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white bg-purple-700 px-2 py-1 rounded">
              {formData.parentProduct
                ? `Parent product: ${formData.parentProduct}`
                : ""}
            </span>
          </div>
        </div>

        {/* Form container */}
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            {/* Product type selector */}
            <div className="bg-white p-4 rounded shadow mb-4">
              <div className="mb-4">
                <p className="text-sm mb-2">This product is added as:</p>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleProductTypeChange("Parent")}
                    className={`px-4 py-1 text-sm border ${
                      productType === "Parent"
                        ? "bg-purple-100 border-purple-500"
                        : "border-gray-300"
                    }`}
                  >
                    Parent
                  </button>
                  <span>OR</span>
                  <button
                    type="button"
                    onClick={() => handleProductTypeChange("Child")}
                    className={`px-4 py-1 text-sm border ${
                      productType === "Child"
                        ? "bg-purple-100 border-purple-500"
                        : "border-gray-300"
                    }`}
                  >
                    Child
                  </button>
                  <span>OR</span>
                  <button
                    type="button"
                    onClick={() => handleProductTypeChange("Normal")}
                    className={`px-4 py-1 text-sm border ${
                      productType === "Normal"
                        ? "bg-purple-100 border-purple-500"
                        : "border-gray-300"
                    }`}
                  >
                    Be a normal product
                  </button>
                </div>
              </div>

              {formData.parentProduct && (
                <div className="flex justify-end">
                  <div className="bg-gray-200 text-gray-600 px-4 py-1 text-sm rounded">
                    Parent product: {formData.parentProduct}
                  </div>
                </div>
              )}
              {/* Product IDs section */}
              {productType === "Child" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Parent ID (auto-generated)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.parentProduct || ""}
                      className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Child ID (auto-generated)
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium">
                    Product ID (auto-generated)
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                  />
                </div>
              )}

              {/* Product type specific content */}
              {productType === "Parent" && (
                <div className="mt-4 space-y-4">
                  <label className="block text-sm font-medium">
                    Product Name/Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Product Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2 rounded"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              )}

              {productType === "Child" && (
                <div className="mt-4">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium">
                      In case of child option, parent for this product
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <input
                        type="text"
                        placeholder="Search parent number or keywords"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 p-1 text-sm flex-grow"
                      />
                      <button
                        type="button"
                        className="bg-purple-500 text-white px-2 py-1 text-sm"
                        onClick={() => {
                          if (searchTerm) {
                            searchParentProducts(searchTerm);
                          }
                        }}
                      >
                        <SearchIcon size={14} className="inline mr-1" />
                        Search
                      </button>
                    </div>

                    {/* Search results */}
                    {showSearchResults && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded">
                        <div className="p-2 text-sm font-medium border-b border-gray-200 grid grid-cols-3">
                          <div>Product name</div>
                          <div>SKU number</div>
                          <div>Brand</div>
                        </div>
                        {isSearchingParents ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            Searching...
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((product) => (
                            <div
                              key={product.productId}
                              className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 grid grid-cols-3"
                              onClick={() => selectParentProduct(product)}
                            >
                              <div className="text-sm font-medium">
                                {product.productName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.productId}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.brand || "N/A"}
                              </div>
                            </div>
                          ))
                        ) : searchTerm.length > 0 ? (
                          <div className="p-2 text-sm text-gray-500">
                            No parent products found for "{searchTerm}"
                          </div>
                        ) : (
                          <div className="p-2 text-sm text-gray-500">
                            Start typing to search for parent products
                          </div>
                        )}
                      </div>
                    )}

                    {/* Child-specific fields */}
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium">
                          Variance Name
                        </label>
                        <input
                          type="text"
                          name="varianceName"
                          value={formData.varianceName}
                          onChange={handleChange}
                          className="w-full border border-gray-300 p-2 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">
                          Subtitle Description
                        </label>
                        <textarea
                          name="subtitleDescription"
                          value={formData.subtitleDescription}
                          onChange={handleChange}
                          className="w-full border border-gray-300 p-2 rounded bg-gray-50"
                          rows="6"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {productType === "Normal" && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Product ID (generated automatically)
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Product Name/Title
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Product Subtitle
                      </label>
                      <input
                        type="text"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Product Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2 rounded"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            {/* Main content sections - only show for chosen product type */}
            {productType && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left and middle columns */}
                <div className="lg:col-span-2">
                  <div className="bg-white p-4 rounded shadow">
                    {productType === "Parent" ? (
                      <></>
                    ) : (
                      <>
                        {/* Global Trade Item Number - for non-Parent product types */}
                        <div className="mb-4 grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Global Trade Item Number (GTIN)
                            </label>
                            <input
                              type="text"
                              name="globalTradeItemNumber"
                              value={formData.globalTradeItemNumber}
                              onChange={handleChange}
                              className="w-full border border-gray-300 p-1 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              K3L NUMBER
                            </label>
                            <input
                              type="text"
                              name="k3lNumber"
                              value={formData.k3lNumber}
                              onChange={handleChange}
                              className="w-full border border-gray-300 p-1 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              SNI NUMBER
                            </label>
                            <input
                              type="text"
                              name="sniNumber"
                              value={formData.sniNumber || ""}
                              onChange={handleChange}
                              className="w-full border border-gray-300 p-1 rounded text-sm"
                            />
                          </div>
                        </div>
                        {/* Specifications */}
                        <div className="mb-4">
                          <h3 className="text-sm font-medium mb-2">
                            Specifications
                          </h3>
                          <div className="border border-gray-300 rounded-lg">
                            {/* Header row */}
                            <div className="grid grid-cols-5 gap-2 p-2 bg-gray-100 text-xs font-medium">
                              <div>Height</div>
                              <div>Length</div>
                              <div>Width</div>
                              <div>Weight (kg/unit)</div>
                              <div>Colour</div>
                            </div>

                            {/* Data rows */}
                            {formData.specifications.map((spec, i) => (
                              <div
                                key={spec.id}
                                className="grid grid-cols-5 gap-2 p-2 border-t border-gray-300 text-xs"
                              >
                                <input
                                  type="text"
                                  placeholder="Height"
                                  value={spec.height}
                                  onChange={(e) =>
                                    handleSpecChange(
                                      i,
                                      "height",
                                      e.target.value
                                    )
                                  }
                                  className="border border-gray-300 p-1 rounded"
                                />
                                <input
                                  type="text"
                                  placeholder="Length"
                                  value={spec.length}
                                  onChange={(e) =>
                                    handleSpecChange(
                                      i,
                                      "length",
                                      e.target.value
                                    )
                                  }
                                  className="border border-gray-300 p-1 rounded"
                                />
                                <input
                                  type="text"
                                  placeholder="Width"
                                  value={spec.width}
                                  onChange={(e) =>
                                    handleSpecChange(i, "width", e.target.value)
                                  }
                                  className="border border-gray-300 p-1 rounded"
                                />
                                <input
                                  type="text"
                                  placeholder="Weight"
                                  value={spec.weight}
                                  onChange={(e) =>
                                    handleSpecChange(
                                      i,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  className="border border-gray-300 p-1 rounded"
                                />
                                <input
                                  type="text"
                                  placeholder="Colour"
                                  value={spec.colours}
                                  onChange={(e) =>
                                    handleSpecChange(
                                      i,
                                      "colours",
                                      e.target.value
                                    )
                                  }
                                  className="border border-gray-300 p-1 rounded"
                                />
                              </div>
                            ))}

                            <div className="p-2 border-t border-gray-300">
                              <button
                                type="button"
                                onClick={addSpecification}
                                className="bg-red-500 text-white px-4 py-1 text-xs rounded flex items-center"
                              >
                                Add Specification Row
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Package Size Selection */}
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <h3 className="text-sm font-semibold mb-3 text-gray-800 flex items-center">
                            <Package className="w-4 h-4 mr-2 text-blue-600" />
                            Package Size
                          </h3>
                          <p className="text-xs text-gray-600 mb-3">
                            By default, products are large (truck delivery). Click below to mark as small package (scooter delivery).
                          </p>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, packageSize: formData.packageSize === "Small" ? "Large" : "Small" })}
                              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                                formData.packageSize === "Small"
                                  ? "border-green-500 bg-green-50 text-green-700 font-semibold shadow-md"
                                  : "border-gray-300 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50"
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                <Bike className="w-5 h-5 mr-2" />
                                <span>{formData.packageSize === "Small" ? "Small Package (Selected)" : "Mark as Small Package"}</span>
                              </div>
                              <div className="text-xs mt-1">(Scooter Delivery)</div>
                            </button>
                          </div>
                          {formData.packageSize === "Large" && (
                            <div className="mt-2 text-xs text-gray-500 flex items-center">
                              <Truck className="w-4 h-4 mr-1" />
                              <span>Currently set as Large Package (Truck Delivery)</span>
                            </div>
                          )}
                        </div>

                        {/* Inventory section - simplified layout */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-base font-bold">
                              When send alert massage to make reorder
                            </p>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({ ...formData, noReorder: true })
                                }
                                className="bg-black text-white px-2 py-1 rounded"
                              >
                                no reorder
                              </button>
                              <input
                                type="checkbox"
                                name="noReorder"
                                checked={formData.noReorder}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    noReorder: !formData.noReorder,
                                  })
                                }
                              />
                            </div>
                          </div>

                          {/* Amount section */}
                          <div className="mb-4 flex items-center">
                            <input
                              type="checkbox"
                              name="useAmountStockmintoReorder"
                              checked={formData.useAmountStockmintoReorder}
                              onChange={() => handleReorderMode("stock")}
                              className="mr-2"
                            />
                            <input
                              type="text"
                              name="AmountStockmintoReorder"
                              onChange={handleChange}
                              className="w-14 bg-white border border-black border-solid p-1 rounded text-sm mb-2"
                            />
                          </div>
                          <p className="text-xs mb-2 ml-6">
                            if arrive to amount above reorder
                          </p>

                          {/* OR divider */}
                          <div className="mb-4 text-red-600 text-start ml-7">
                            <span className="font-bold">or</span>
                          </div>

                          {/* Safety days section */}
                          <div className="mb-4">
                            <div className="flex items-center mb-2">
                              <input
                                type="text"
                                name="safetyDaysStock"
                                value={formData.safetyDaysStock}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    safetyDaysStock: e.target.value,
                                  }))
                                }
                                className="w-14 ml-6 bg-white border border-black border-solid p-1 rounded text-sm mb-2"
                              />
                            </div>
                            <input
                              type="text"
                              name="safetyDaysStock"
                              value="No info"
                              readOnly
                              className="w-14 bg-yellow-100 border p-1 rounded text-xs mb-2 ml-6"
                            />
                            <p className="text-xs ml-6">
                              safety stock in # of days that we wish to have as
                              safety stock
                            </p>
                          </div>

                          {/* Delivery time section */}
                          <div className="mb-20 mt-20">
                            <p className="text-xs mb-2 px-1">delivery days</p>
                            <p className="text-xs mb-2 px-1 ">
                              +
                              <input
                                type="text"
                                name="deliveryDays"
                                value="No info"
                                readOnly
                                className="w-14 bg-yellow-100 border border-yellow-100 p-1 rounded text-xs mb-2"
                              />
                            </p>
                          </div>
                        </div>

                        {/* System Calculation */}
                        <div className="mb-4">
                          <p className="text-xs mb-1">
                            At this moment system calculation
                          </p>
                          <p className="text-xs mb-1">
                            Average items per day sales
                          </p>
                          <div className="bg-yellow-100 h-6 w-36 mb-3 flex items-center justify-center text-xs">
                            No info
                          </div>

                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <p className="text-xs mb-1">
                                highest sales per day
                              </p>
                              <div className="bg-yellow-100 h-6 w-32 flex items-center justify-center text-xs">
                                No info
                              </div>
                            </div>
                            <div className="bg-red-500 text-white px-4 py-1 rounded text-xs">
                              sales data
                            </div>
                          </div>

                          <p className="text-xs mb-1">not normal situation</p>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs mb-1">
                                amount of high sales
                              </p>
                              <div className="flex flex-col gap-1">
                                <div className="bg-yellow-100 h-6 w-36 flex items-center justify-center text-xs">
                                  No info
                                </div>
                                <div className="bg-yellow-100 h-6 w-36 flex items-center justify-center text-xs">
                                  No info
                                </div>
                                <div className="bg-yellow-100 h-6 w-36 flex items-center justify-center text-xs">
                                  No info
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs mb-1">dates</p>
                              <div className="flex flex-col gap-1">
                                <div className="bg-yellow-100 h-6 w-36 flex items-center justify-center text-xs">
                                  No info
                                </div>
                                <div className="bg-yellow-100 h-6 w-36 flex items-center justify-center text-xs">
                                  No info
                                </div>
                                <div className="bg-yellow-100 h-6 w-36 flex items-center justify-center text-xs">
                                  No info
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price after discount */}
                        <div className="mb-4">
                          <h3 className="text-xs font-medium mb-1">
                            Normal Price without any discounts
                          </h3>
                          <input
                            type="text"
                            name="NormalPrice"
                            value={formData.NormalPrice}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-1 rounded text-sm"
                          />
                        </div>
                        <div className="mb-4">
                          <h3 className="text-xs font-medium mb-3 mt-5">
                            Initial Inventory
                          </h3>
                          <h3 className="text-xs font-medium mb-1">
                            Initial Stock
                          </h3>
                          <input
                            type="text"
                            name="Stock"
                            value={formData.Stock}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-1 rounded text-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right sidebar */}
                <div className="bg-white p-4 rounded shadow">
                  {/* Visibility */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Visibility</h3>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="public"
                          name="visibility"
                          value="Public"
                          checked={formData.visibility === "Public"}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <label htmlFor="public" className="text-sm">
                          Publicly visible
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="private"
                          name="visibility"
                          value="Private"
                          checked={formData.visibility === "Private"}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <label htmlFor="private" className="text-sm">
                          Hidden
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="once"
                          name="onceShare"
                          checked={formData.onceShare}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              onceShare: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <label htmlFor="once" className="text-xs text-gray-500">
                          Once there is less than 2 days automatically end make
                          visible when restocked/received
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="noChild"
                          name="noChildHideParent"
                          checked={formData.noChildHideParent}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              noChildHideParent: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor="noChild"
                          className="text-xs text-gray-500"
                        >
                          If no child, then parent hidden
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Category</h3>
                    <select
                      name="categories"
                      value={formData.categories}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    >
                      <option value="">-- Select category --</option>
                      {categoriesList.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategories */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Subcategory</h3>
                    <select
                      name="subCategories"
                      value={formData.subCategories}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      disabled={!formData.categories}
                    >
                      <option value="">-- Select subcategory --</option>
                      {categoriesList
                        .find((cat) => cat.name === formData.categories)
                        ?.subcategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={`tag-${tag}`}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-2 py-1 text-xs border rounded ${
                            selectedTags.includes(tag)
                              ? "bg-purple-100 border-purple-500"
                              : "border-gray-300"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Supplier Allocation */}
                  <div className="mb-4 supplier-dropdown-container">
                    <h3 className="text-sm font-medium mb-2 text-gray-700">
                      Allocate Supplier <span className="text-xs text-gray-500">(Optional)</span>
                    </h3>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search and select supplier..."
                        value={supplierSearchTerm}
                        onChange={(e) => {
                          setSupplierSearchTerm(e.target.value);
                          setShowSupplierDropdown(true);
                        }}
                        onFocus={() => setShowSupplierDropdown(true)}
                        className="w-full border p-2 rounded"
                      />
                      {selectedSupplier && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-medium">{selectedSupplier.name}</span>
                            <span className="text-gray-500 ml-2">{selectedSupplier.phone}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSupplier(null);
                              setSupplierSearchTerm("");
                              setFormData(fd => ({ ...fd, selectedSupplierId: "" }));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {showSupplierDropdown && !selectedSupplier && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                          {suppliers
                            .filter(s => 
                              s.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
                              s.phone.includes(supplierSearchTerm)
                            )
                            .slice(0, 10)
                            .map((supplier) => (
                              <div
                                key={supplier._id}
                                onClick={() => {
                                  setSelectedSupplier(supplier);
                                  setSupplierSearchTerm(supplier.name);
                                  setShowSupplierDropdown(false);
                                  setFormData(fd => ({ ...fd, selectedSupplierId: supplier._id }));
                                }}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                              >
                                <div className="font-medium text-sm">{supplier.name}</div>
                                <div className="text-xs text-gray-500">{supplier.phone}</div>
                              </div>
                            ))}
                          {suppliers.filter(s => 
                            s.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
                          ).length === 0 && (
                            <div className="p-3 text-sm text-gray-500 text-center">
                              No suppliers found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Master Image */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">
                      Upload Master Image
                    </h3>
                    <div className="border border-dashed border-gray-300 p-4 rounded flex items-center justify-center h-32">
                      {masterImages[0] ? (
                        <div className="relative w-full h-full">
                          <img
                            src={masterImages[0].preview}
                            alt="Master"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            onClick={() => removeMasterImage(0)}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                          onClick={() => masterImageRef.current.click()}
                        >
                          <PlusIcon className="w-8 h-8 text-gray-400" />
                          <input
                            type="file"
                            ref={masterImageRef}
                            onChange={(e) => handleMasterImageUpload(0, e)}
                            className="hidden"
                            accept="image/*"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload More Images */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">
                      Upload More Images
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {moreImages.map((img, index) => (
                        <div
                          key={`more-img-${index}`}
                          className="border border-dashed border-gray-300 p-2 rounded flex items-center justify-center h-16"
                        >
                          {img ? (
                            <div className="relative w-full h-full">
                              <img
                                src={img.preview}
                                alt={`More ${index}`}
                                className="w-full h-full object-contain"
                              />
                              <button
                                type="button"
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                onClick={() => removeMoreImage(index)}
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div
                              className="flex items-center justify-center cursor-pointer w-full h-full"
                              onClick={() => {
                                if (moreImageRefs.current[index]) {
                                  moreImageRefs.current[index].click();
                                }
                              }}
                            >
                              <PlusIcon className="w-5 h-5 text-gray-400" />
                              <input
                                type="file"
                                ref={(el) =>
                                  (moreImageRefs.current[index] = el)
                                }
                                onChange={(e) =>
                                  handleMoreImageUpload(index, e)
                                }
                                className="hidden"
                                accept="image/*"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Information about inventory - ONLY for Child and Normal products */}
                  {productType !== "Parent" && (
                    <div className="mb-4">
                      <p className="text-xs mb-2">
                        when we have left 2 days of stock
                      </p>

                      {/* Re-order settings */}
                      <div className="bg-orange-100 p-3 rounded mb-4 space-y-2">
                        <h3 className="text-sm font-medium">
                          re-order setting
                        </h3>
                        <h3 className="text-sm font-extrabold bg-red-500">
                          THis section is not correct for the moment
                        </h3>
                        <div>
                          <p className="text-sm font-semibold">
                            {formData.reOrderSetting}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs">amount of inventory in days</p>
                          <p className="text-sm font-semibold mb-1">
                            {formData.inventoryInDays}
                          </p>
                          <p className="text-xs text-gray-600">
                            (25 products/items)
                          </p>
                        </div>

                        <div>
                          <p className="text-xs">belived order period</p>
                          <p className="text-sm font-semibold">
                            {formData.deliveryPeriod}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs">
                            order time + backup inventory
                          </p>
                          <input
                            type="text"
                            name="orderTimeBackupInventory"
                            value={formData.orderTimeBackupInventory}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-1 rounded text-sm mt-1"
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">
                          Notes for us
                        </h3>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          className="w-full border border-gray-300 p-2 rounded"
                          rows="4"
                        ></textarea>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  isLoading
                    ? "bg-purple-400"
                    : "bg-purple-600 hover:bg-purple-700"
                } text-white px-6 py-2 rounded-full shadow-md flex items-center justify-center`}
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} className="mr-1" /> Save
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-6 transform transition-all animate-fadeIn">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  window.location.reload();
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-10 w-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Product Added Successfully!
              </h3>
              <p className="text-gray-500 mb-6">
                Your product has been added to the database and is now
                available.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none"
                >
                  Continue
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                This message will automatically close in 5 seconds
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ERROR MODAL - NEW */}
      {showError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 transform transition-all animate-fadeIn overflow-y-auto max-h-[90vh]">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setShowError(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>

              {/* Error Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {errorDetails.title || "Error Occurred"}
              </h3>

              {/* Error Message */}
              <p className="text-gray-700 mb-4 text-base">
                {errorDetails.message}
              </p>

              {/* Technical Details */}
              {errorDetails.technicalDetails && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-left">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Technical Details:
                  </h4>
                  <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap break-words">
                    {errorDetails.technicalDetails}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setShowError(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowError(false);
                    // Optionally scroll to top of form
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                >
                  Try Again
                </button>
              </div>

              {/* Auto-dismiss notice */}
              <div className="mt-4 text-sm text-gray-500">
                This message will automatically close in 10 seconds
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
