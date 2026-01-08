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
import { API_BASE_URL } from "../../utils/config";

const API_URL = API_BASE_URL;


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
  
  // Parent product details for child products
  const [parentProductDetails, setParentProductDetails] = useState(null);
  const [additionalCategories, setAdditionalCategories] = useState([]);
  
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

  // ✅ NEW: Batch Discount Allocation state
  const [showBatchSection, setShowBatchSection] = useState(false);
  const [batchNumber, setBatchNumber] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [batchDiscountPrice, setBatchDiscountPrice] = useState("");
  const [batchDiscountPercentage, setBatchDiscountPercentage] = useState("");

  // Discount category options
  const discountCategories = [
    { id: 'foremen', name: 'Foremen', color: 'bg-blue-100 border-blue-400' },
    { id: 'foremen_commission', name: 'Foremen+', color: 'bg-blue-200 border-blue-500' },
    { id: 'referral_3_days', name: 'Referral 3', color: 'bg-green-100 border-green-400' },
    { id: 'new_customer_referred', name: 'New Cust Ref', color: 'bg-yellow-100 border-yellow-400' },
    { id: 'new_customer', name: 'New Cust', color: 'bg-orange-100 border-orange-400' },
    { id: 'shopping_30m', name: 'VIP 30M', color: 'bg-purple-100 border-purple-400' },
    { id: 'shopping_100m_60d', name: 'Valued 100M', color: 'bg-pink-100 border-pink-400' },
    { id: 'everyone', name: 'Everyone', color: 'bg-gray-100 border-gray-400' },
  ];

  // Generate batch number on component mount
  useEffect(() => {
    const year = new Date().getFullYear();
    const randomNum = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    setBatchNumber(`BATCH-${year}-${randomNum}`);
  }, []);

  // Calculate discount percentage when discount price changes
  const handleBatchDiscountPriceChange = (value) => {
    setBatchDiscountPrice(value);
    const price = parseFloat(value);
    const originalPrice = parseFloat(formData.NormalPrice);
    if (originalPrice && originalPrice > 0 && price > 0) {
      const percentage = ((originalPrice - price) / originalPrice) * 100;
      setBatchDiscountPercentage(Math.round(percentage * 100) / 100);
    } else {
      setBatchDiscountPercentage("");
    }
  };

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  // near top of AddProduct()
  const [categoriesList, setCategoriesList] = useState([]);
  const [taxBrackets, setTaxBrackets] = useState([]);
  
  useEffect(() => {
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => setCategoriesList(res.data.data))
      .catch(console.error);
    
    // Fetch tax brackets
    axios
      .get(`${API_URL}/api/tax-brackets/active`)
      .then((res) => {
        if (res.data.success) {
          setTaxBrackets(res.data.data);
        }
      })
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
    lowInventoryCalculation: false,
    dontReorder: false,
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
    taxBracketId: "", // Tax bracket selection
    taxBracketCode: "",
    taxPercentage: 0,
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

  // Compute best supplier by delivery days
  const getBestSupplierByDelivery = () => {
    const suppliersWithDelivery = suppliers.filter(
      (s) => s.manualAverageDeliveryTime && !isNaN(parseInt(s.manualAverageDeliveryTime))
    );
    if (suppliersWithDelivery.length === 0) return null;
    return suppliersWithDelivery.reduce((best, current) => {
      const bestDays = parseInt(best.manualAverageDeliveryTime);
      const currentDays = parseInt(current.manualAverageDeliveryTime);
      return currentDays < bestDays ? current : best;
    });
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

  // Select parent product and fetch its details
  const selectParentProduct = async (product) => {
    setFormData((prev) => ({
      ...prev,
      parentProduct: product.productId,
    }));
    setSearchTerm("");
    setShowSearchResults(false);
    
    // Fetch full parent product details
    await fetchParentProductDetails(product.productId);
  };

  // Fetch parent product details including categories
  const fetchParentProductDetails = async (productId) => {
    try {
      const response = await axios.get(`${API_URL}/api/products/by-product-id/${productId}`);
      if (response.data && response.data.success) {
        setParentProductDetails(response.data.data);
      } else {
        toast.error("Parent product details not found");
      }
    } catch (error) {
      console.error("Error fetching parent product details:", error);
      toast.error("Failed to load parent product details");
    }
  };

  // Add additional category/subcategory pair
  const addAdditionalCategory = () => {
    setAdditionalCategories([...additionalCategories, {
      category: '',
      subcategory: ''
    }]);
  };

  // Update additional category
  const updateAdditionalCategory = (index, field, value) => {
    const updated = [...additionalCategories];
    updated[index][field] = value;
    setAdditionalCategories(updated);
  };

  // Remove additional category
  const removeAdditionalCategory = (index) => {
    setAdditionalCategories(additionalCategories.filter((_, i) => i !== index));
  };


  const validateForm = () => {
    const requiredFields = {
      Parent: [
        "productName",
        "brand",
        "description",
        "categories", // Parent needs categories
      ],
      Child: [
        "parentProduct",
        "varianceName",
        "subtitleDescription",
        // Categories NOT required - inherited from parent
      ],
      Normal: [
        "productName",
        "brand",
        "description",
        "categories", // Normal needs categories
      ],
    };

    // ✅ GTIN is required only for Child and Normal products (hidden for Parent)
    const additionalRequiredFields = 
      productType === "Parent" ? [] : ["globalTradeItemNumber"];

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
      
      // For child products, include parent's categories and any additional categories
      if (productType === "Child" && parentProductDetails) {
        // Set parent's category and subcategory as the main ones
        payload.categories = parentProductDetails.categories;
        payload.subCategories = parentProductDetails.subCategories;
        
        // Add additional categories if any were added
        if (additionalCategories.length > 0) {
          payload.additionalCategories = additionalCategories.filter(
            cat => cat.category && cat.subcategory
          );
        }
      }

      // ✅ Add batch discount data if any categories are selected
      if (showBatchSection && selectedCategories.length > 0 && batchDiscountPrice) {
        payload.batchDiscounts = selectedCategories.map(category => ({
          category: category,
          batchNumber: batchNumber,
          discountPrice: parseFloat(batchDiscountPrice),
          discountPercentage: parseFloat(batchDiscountPercentage) || 0,
          originalPriceAtCreation: parseFloat(formData.NormalPrice) || 0,
          isActive: true
        }));
        console.log("🏷️ Batch discounts added to payload:", payload.batchDiscounts);
      }
      
      console.log("📦 Preparing payload with formData:", {
        productType: payload.productType,
        productName: payload.productName,
        categories: payload.categories,
        subCategories: payload.subCategories,
        additionalCategories: payload.additionalCategories,
        batchDiscounts: payload.batchDiscounts,
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
                    <label className="block text-sm font-medium">Brand <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Product Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2 rounded"
                      rows="4"
                      required
                    ></textarea>
                  </div>
                </div>
              )}

              {productType === "Child" && (
                <div className="mt-4">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium mb-3">
                      In case of child option, parent for this product <span className="text-red-500">*</span>
                    </p>
                    <div className="w-full">
                      <input
                        type="text"
                        placeholder="Search parent number or keywords (start typing to search...)"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          // Auto-search as user types
                          if (e.target.value.length >= 2) {
                            searchParentProducts(e.target.value);
                          } else {
                            setShowSearchResults(false);
                          }
                        }}
                        className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
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
                          Variance Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="varianceName"
                          value={formData.varianceName}
                          onChange={handleChange}
                          className="w-full border border-gray-300 p-2 rounded"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">
                          Subtitle Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="subtitleDescription"
                          value={formData.subtitleDescription}
                          onChange={handleChange}
                          className="w-full border border-gray-300 p-2 rounded bg-gray-50"
                          rows="6"
                          required
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
                    <label className="block text-sm font-medium">Brand <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Product Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2 rounded"
                      rows="4"
                      required
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
                    {/* GTIN to Sales Statistics - Hidden for Parent products */}
                    {productType !== "Parent" && (
                      <>
                    {/* Global Trade Item Number - for Child and Normal product types */}
                    <div className="mb-4 grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Global Trade Item Number (GTIN) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="globalTradeItemNumber"
                          value={formData.globalTradeItemNumber}
                          onChange={handleChange}
                          className="w-full border border-gray-300 p-1 rounded text-sm"
                          required
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
                    {/* Specifications - Single Row Only */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">
                        Specifications
                      </h3>
                          <div className="border border-gray-300 rounded-lg">
                            {/* Header row */}
                            <div className="grid grid-cols-5 gap-2 p-2 bg-gray-100 text-xs font-medium">
                              <div>Height <span className="text-red-500">*</span></div>
                              <div>Length <span className="text-red-500">*</span></div>
                              <div>Width <span className="text-red-500">*</span></div>
                              <div>Weight (kg/unit) <span className="text-red-500">*</span></div>
                              <div>Colour</div>
                            </div>

                            {/* Single data row - only first specification */}
                            <div className="grid grid-cols-5 gap-2 p-2 border-t border-gray-300 text-xs">
                              <input
                                type="text"
                                placeholder="Height"
                                value={formData.specifications[0]?.height || ''}
                                onChange={(e) => handleSpecChange(0, "height", e.target.value)}
                                className="border border-gray-300 p-1 rounded"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Length"
                                value={formData.specifications[0]?.length || ''}
                                onChange={(e) => handleSpecChange(0, "length", e.target.value)}
                                className="border border-gray-300 p-1 rounded"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Width"
                                value={formData.specifications[0]?.width || ''}
                                onChange={(e) => handleSpecChange(0, "width", e.target.value)}
                                className="border border-gray-300 p-1 rounded"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Weight"
                                value={formData.specifications[0]?.weight || ''}
                                onChange={(e) => handleSpecChange(0, "weight", e.target.value)}
                                className="border border-gray-300 p-1 rounded"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Colour (Optional)"
                                value={formData.specifications[0]?.colours || ''}
                                onChange={(e) => handleSpecChange(0, "colours", e.target.value)}
                                className="border border-gray-300 p-1 rounded"
                              />
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

                          {/* Low Inventory Calculation Section */}
                          <div className="mb-4 mt-6 p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-start mb-3">
                              <input
                                type="checkbox"
                                name="lowInventoryCalculation"
                                checked={formData.lowInventoryCalculation}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    lowInventoryCalculation: !formData.lowInventoryCalculation,
                                  })
                                }
                                className="mr-2 mt-1"
                              />
                              <label className="text-xs text-gray-700">
                                This product can't show correct statistics or reorder mechanism for sales as it has too low inventory calculation.
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                className="bg-blue-500 text-white px-4 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                              >
                                Sales Data
                              </button>
                              
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  name="dontReorder"
                                  checked={formData.dontReorder}
                                  onChange={() =>
                                    setFormData({
                                      ...formData,
                                      dontReorder: !formData.dontReorder,
                                    })
                                  }
                                  className="mr-2"
                                />
                                <label className="text-xs text-gray-700">
                                  Don't reorder
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price after discount */}
                        <div className="mb-4">
                          <h3 className="text-xs font-medium mb-1">
                            Net Total Final Payment <span className="text-red-500">*</span>
                          </h3>
                          <input
                            type="number"
                            name="NormalPrice"
                            value={formData.NormalPrice}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-1 rounded text-sm"
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="mb-4">
                          <h3 className="text-xs font-medium mb-3 mt-5">
                            Initial Inventory
                          </h3>
                          <h3 className="text-xs font-medium mb-1">
                            Initial Stock <span className="text-red-500">*</span>
                          </h3>
                          <input
                            type="number"
                            name="Stock"
                            value={formData.Stock}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-1 rounded text-sm"
                            required
                            min="0"
                          />
                        </div>

                        {/* Supplier Delivery Info Section */}
                        <div className="mb-4 mt-6 p-3 bg-blue-50 rounded border border-blue-200">
                          <h3 className="text-sm font-medium mb-3 text-blue-800">
                            Supplier Delivery Information
                          </h3>
                          
                          {/* Allocated Supplier Delivery Time */}
                          {selectedSupplier ? (
                            <p className="text-xs text-gray-700 mb-3">
                              The Manual Average Delivery time for supplier{" "}
                              <span className="font-semibold">{selectedSupplier.name}</span> is{" "}
                              <span className="font-semibold">
                                {selectedSupplier.manualAverageDeliveryTime || "N/A"} days
                              </span>
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 mb-3 italic">
                              No supplier allocated yet
                            </p>
                          )}

                          <hr className="border-blue-200 my-3" />

                          {/* Backup Supplier Section */}
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              Backup Supplier
                            </p>
                            {(() => {
                              const bestSupplier = getBestSupplierByDelivery();
                              return bestSupplier ? (
                                <p className="text-xs text-gray-700">
                                  Best supplier according to delivery days (from all suppliers):{" "}
                                  <span className="font-semibold">{bestSupplier.name}</span>{" "}
                                  <span className="text-green-600">
                                    ({bestSupplier.manualAverageDeliveryTime} days)
                                  </span>
                                </p>
                              ) : (
                                <p className="text-xs text-gray-500 italic">
                                  No suppliers with delivery time data available
                                </p>
                              );
                            })()}
                          </div>
                        </div>

                        {/* General Stock Reorder Time Section */}
                        <div className="mb-4 mt-6 p-3 bg-green-50 rounded border border-green-200">
                          <h3 className="text-sm font-medium mb-3 text-green-800">
                            General Stock Reorder Time
                          </h3>
                          
                          <div className="text-xs text-gray-700">
                            <p className="mb-2">
                              <span className="font-medium">Minimum stock to be held</span> = Safety Stock + Delivery Time (in days)
                            </p>
                            
                            {(() => {
                              const safetyStock = parseInt(formData.safetyDaysStock) || 0;
                              const deliveryDays = selectedSupplier 
                                ? parseInt(selectedSupplier.manualAverageDeliveryTime) || 0 
                                : 0;
                              const minimumStock = safetyStock + deliveryDays;
                              
                              return (
                                <div className="mt-3 p-2 bg-white rounded border border-green-300">
                                  <div className="flex items-center justify-between mb-2">
                                    <span>Safety Stock:</span>
                                    <span className="font-semibold">{safetyStock} units</span>
                                  </div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span>Supplier Delivery Time:</span>
                                    <span className="font-semibold">
                                      {selectedSupplier 
                                        ? `${deliveryDays} days` 
                                        : "N/A (no supplier selected)"}
                                    </span>
                                  </div>
                                  <hr className="my-2 border-green-200" />
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-green-800">Minimum Stock:</span>
                                    <span className="font-bold text-green-700 text-base">
                                      {minimumStock} units
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Sales Statistics Section */}
                        <div className="mb-4 mt-6 p-3 bg-yellow-50 rounded border border-yellow-200">
                          <h3 className="text-sm font-medium mb-3 text-yellow-800">
                            Sales Statistics
                          </h3>
                          
                          <div className="space-y-3">
                            {/* Last 48h sales /2 */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700 font-bold">Last 48h sales /2</span>
                              <div className="bg-yellow-100 px-3 py-1 rounded text-xs">
                                No info
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 italic ml-2">(coming from sales data)</p>

                            {/* Average sales last 10 days */}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-700 font-bold">Average sales last 10 days</span>
                              <div className="bg-yellow-100 px-3 py-1 rounded text-xs">
                                No info
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 italic ml-2">(coming from sales data)</p>

                            {/* Average sales in general last 60 days */}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-700 font-bold">Average sales in general last 60 days</span>
                              <div className="bg-yellow-100 px-3 py-1 rounded text-xs">
                                No info
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 italic ml-2">(coming from sales data)</p>

                            {/* Not Normal Situation - Highest Sales Per Day */}
                            <div className="mt-4 pt-3 border-t border-yellow-200">
                              <p className="text-xs font-bold mb-2">Not normal situation</p>
                              <div className="space-y-2">
                                {/* Row 1 */}
                                <div className="flex items-center gap-8">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs">highest sales per day</span>
                                    <div className="bg-yellow-100 h-6 w-24 flex items-center justify-center text-xs">
                                      No info
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs">Date</span>
                                    <div className="bg-yellow-100 h-6 w-24 flex items-center justify-center text-xs">
                                      No info
                                    </div>
                                  </div>
                                </div>
                                {/* Row 2 */}
                                <div className="flex items-center gap-8">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs">highest sales per day</span>
                                    <div className="bg-yellow-100 h-6 w-24 flex items-center justify-center text-xs">
                                      No info
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs">Date</span>
                                    <div className="bg-yellow-100 h-6 w-24 flex items-center justify-center text-xs">
                                      No info
                                    </div>
                                  </div>
                                </div>
                                {/* Row 3 */}
                                <div className="flex items-center gap-8">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs">highest sales per day</span>
                                    <div className="bg-yellow-100 h-6 w-24 flex items-center justify-center text-xs">
                                      No info
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs">Date</span>
                                    <div className="bg-yellow-100 h-6 w-24 flex items-center justify-center text-xs">
                                      No info
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
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

                  {/* Parent Product Categories (Child Products Only) */}
                  {productType === "Child" && parentProductDetails && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="text-sm font-semibold mb-3 text-blue-900">
                        Parent Product Categories
                      </h3>
                      
                      {/* Parent Product Name */}
                      <div className="mb-3 p-3 bg-white rounded border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">Parent Product:</div>
                        <div className="font-medium text-gray-800">{parentProductDetails.productName}</div>
                      </div>

                      {/* Parent Category & Subcategory */}
                      <div className="mb-3 p-3 bg-white rounded border border-blue-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Category:</div>
                            <div className="font-medium text-gray-800">{parentProductDetails.categories || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Subcategory:</div>
                            <div className="font-medium text-gray-800">{parentProductDetails.subCategories || 'N/A'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Categories */}
                      {additionalCategories.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-700 mb-2">Additional Categories:</div>
                          {additionalCategories.map((addCat, index) => (
                            <div key={index} className="mb-2 p-3 bg-white rounded border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500">Category #{index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeAdditionalCategory(index)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={addCat.category}
                                  onChange={(e) => updateAdditionalCategory(index, 'category', e.target.value)}
                                  className="w-full border p-2 rounded text-sm"
                                >
                                  <option value="">-- Select category --</option>
                                  {categoriesList.map((cat) => (
                                    <option key={cat._id} value={cat.name}>
                                      {cat.name}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={addCat.subcategory}
                                  onChange={(e) => updateAdditionalCategory(index, 'subcategory', e.target.value)}
                                  className="w-full border p-2 rounded text-sm"
                                  disabled={!addCat.category}
                                >
                                  <option value="">-- Select subcategory --</option>
                                  {categoriesList
                                    .find((cat) => cat.name === addCat.category)
                                    ?.subcategories.map((sub) => (
                                      <option key={sub} value={sub}>
                                        {sub}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Another Category Button */}
                      <button
                        type="button"
                        onClick={addAdditionalCategory}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Another Category/Subcategory
                      </button>
                      
                      {/* Info Note */}
                      <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-xs text-blue-800">
                        ℹ️ Additional categories will be saved automatically when you submit the form
                      </div>
                    </div>
                  )}

                  {/* Categories - Hidden for Child products, shown for Normal/Parent */}
                  {productType !== "Child" && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Category <span className="text-red-500">*</span></h3>
                      <select
                        name="categories"
                        value={formData.categories}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                      >
                        <option value="">-- Select category --</option>
                        {categoriesList.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Subcategories - Hidden for Child products, shown for Normal/Parent */}
                  {productType !== "Child" && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Subcategory <span className="text-red-500">*</span></h3>
                      <select
                        name="subCategories"
                        value={formData.subCategories}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        disabled={!formData.categories}
                        required
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
                  )}

                  {/* Tax Bracket Selection */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Tax Bracket</h3>
                    <select
                      name="taxBracketId"
                      value={formData.taxBracketId}
                      onChange={(e) => {
                        const selectedBracket = taxBrackets.find(b => b._id === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          taxBracketId: e.target.value,
                          taxBracketCode: selectedBracket?.bracketCode || '',
                          taxPercentage: selectedBracket?.taxPercentage || 0
                        }));
                      }}
                      className="w-full border p-2 rounded"
                    >
                      <option value="">-- Select Tax Bracket --</option>
                      {taxBrackets.map((bracket) => (
                        <option key={bracket._id} value={bracket._id}>
                          {bracket.bracketName} - {bracket.taxPercentage}%
                        </option>
                      ))}
                    </select>
                    {formData.taxBracketId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Tax Rate: {formData.taxPercentage}% ({formData.taxBracketCode})
                      </p>
                    )}
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
                      Upload Master Image <span className="text-red-500">*</span>
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

                      {/* ✅ BATCH ALLOCATION SECTION */}
                      <div className="mb-4 border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium flex items-center">
                            🏷️ Batch Allocation
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowBatchSection(!showBatchSection)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                              showBatchSection
                                ? "bg-orange-500 text-white"
                                : "bg-purple-600 text-white hover:bg-purple-700"
                            }`}
                          >
                            {showBatchSection ? "− Close" : "+ Batch"}
                          </button>
                        </div>

                        {showBatchSection && (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            {/* Batch Number */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Batch Allocation Product Number:
                              </label>
                              <input
                                type="text"
                                value={batchNumber}
                                onChange={(e) => setBatchNumber(e.target.value)}
                                className="w-full border border-gray-300 p-2 rounded text-sm bg-white"
                                placeholder="BATCH-2026-0001"
                              />
                            </div>

                            {/* Category Selection */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-2">
                                Select Discount Categories (min 1):
                              </label>
                              <div className="grid grid-cols-4 gap-2">
                                {discountCategories.map((cat) => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`px-2 py-3 text-xs font-medium rounded-lg border-2 transition-all ${
                                      selectedCategories.includes(cat.id)
                                        ? "bg-purple-500 text-white border-purple-600 shadow-md"
                                        : `${cat.color} text-gray-700 hover:shadow-sm`
                                    }`}
                                  >
                                    {selectedCategories.includes(cat.id) && "✓ "}
                                    {cat.name}
                                  </button>
                                ))}
                              </div>
                              {selectedCategories.length > 0 && (
                                <p className="text-xs text-green-600 mt-2">
                                  ✓ {selectedCategories.length} category(ies) selected
                                </p>
                              )}
                            </div>

                            {/* Discount Fields */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Discount % (Auto-calculated)
                                </label>
                                <input
                                  type="number"
                                  value={batchDiscountPercentage}
                                  readOnly
                                  className="w-full border border-gray-300 p-2 rounded text-sm bg-gray-100"
                                  placeholder="Auto-calculated"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Discount Price (Manual)
                                </label>
                                <input
                                  type="number"
                                  value={batchDiscountPrice}
                                  onChange={(e) => handleBatchDiscountPriceChange(e.target.value)}
                                  className="w-full border border-gray-300 p-2 rounded text-sm"
                                  placeholder="Enter discount price"
                                />
                              </div>
                            </div>

                            {/* Original Price Display */}
                            <div className="text-xs text-gray-500 bg-white p-2 rounded border">
                              <span className="font-medium">Original Price:</span> Rp {formData.NormalPrice ? parseFloat(formData.NormalPrice).toLocaleString() : "0"}
                              {batchDiscountPercentage && (
                                <span className="ml-2 text-green-600 font-medium">
                                  → {batchDiscountPercentage}% off
                                </span>
                              )}
                            </div>

                            {/* Info Note */}
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded flex items-start">
                              <span className="mr-1">💡</span>
                              <span>
                                Enter the discount price manually. The discount percentage will be calculated automatically based on the original price.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
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
