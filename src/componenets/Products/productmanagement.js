import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  SearchIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  SaveIcon,
  XIcon,
  ArrowLeftIcon,
  UploadIcon,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { toast } from "react-hot-toast";

const API_URL = "http://localhost:5000";

const ProductManagement = () => {
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

  // Editing states
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState({
    masterImage: null,
    moreImages: [],
  });

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

  // Start editing product
  const startEditProduct = (product) => {
    setEditingProduct({
      ...product,
      specifications: product.specifications || [],
      tags: product.tags || [],
      moreImages: product.moreImages || [],
    });
    setImageFiles({
      masterImage: null,
      moreImages: Array(6).fill(null),
    });
    setShowDetails(false);
    setIsCreating(false);
  };

  // Start creating new product
  const startCreateProduct = () => {
    setEditingProduct({
      productType: "Parent",
      productName: "",
      description: "",
      varianceName: "",
      subtitleDescription: "",
      categories: "",
      subCategories: "",
      brand: "",
      globalTradeItemNumber: "",
      k3lNumber: "",
      sniNumber: "",
      specifications: [
        {
          height: "",
          length: "",
          width: "",
          unit: "",
          colours: "",
        },
      ],
      Stock: 0,
      minimumOrder: 0,
      useAmountStockmintoReorder: false,
      useSafetyDays: false,
      noReorder: false,
      AmountStockmintoReorder: 0,
      safetyDays: 0,
      safetyDaysStock: 0,
      deliveryDays: "",
      deliveryTime: "",
      reOrderSetting: "",
      inventoryInDays: "",
      deliveryPeriod: "",
      orderTimeBackupInventory: "",
      alternateSupplier: "",
      supplierName: "",
      supplierContact: "",
      supplierAddress: "",
      supplierEmail: "",
      supplierWebsite: "",
      supplierInformation: "",
      NormalPrice: 0,
      anyDiscount: 0,
      visibility: "Public",
      onceShare: false,
      noChildHideParent: false,
      tags: [],
      notes: "",
    });
    setImageFiles({
      masterImage: null,
      moreImages: Array(6).fill(null),
    });
    setIsCreating(true);
  };

  // Handle input changes for editing
  const handleEditChange = (field, value) => {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle specification changes
  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecifications = [...(editingProduct.specifications || [])];
    if (!updatedSpecifications[index]) {
      updatedSpecifications[index] = {};
    }
    updatedSpecifications[index][field] = value;
    handleEditChange("specifications", updatedSpecifications);
  };

  // Add new specification
  const addSpecification = () => {
    const newSpec = {
      height: "",
      length: "",
      width: "",
      unit: "",
      colours: "",
    };
    handleEditChange("specifications", [
      ...(editingProduct.specifications || []),
      newSpec,
    ]);
  };

  // Remove specification
  const removeSpecification = (index) => {
    const updatedSpecifications = editingProduct.specifications.filter(
      (_, i) => i !== index
    );
    handleEditChange("specifications", updatedSpecifications);
  };

  // Handle tag changes
  const handleTagChange = (index, value) => {
    const updatedTags = [...(editingProduct.tags || [])];
    updatedTags[index] = value;
    handleEditChange(
      "tags",
      updatedTags.filter((tag) => tag !== "")
    );
  };

  // Add new tag
  const addTag = () => {
    handleEditChange("tags", [...(editingProduct.tags || []), ""]);
  };

  // Remove tag
  const removeTag = (index) => {
    const updatedTags = editingProduct.tags.filter((_, i) => i !== index);
    handleEditChange("tags", updatedTags);
  };

  // Handle image file selection
  const handleImageFileSelect = (field, file, index = null) => {
    if (file) {
      if (field === "masterImage") {
        setImageFiles((prev) => ({
          ...prev,
          masterImage: file,
        }));

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          handleEditChange("masterImage", e.target.result);
        };
        reader.readAsDataURL(file);
      } else if (field === "moreImage" && index !== null) {
        const updatedMoreImages = [...imageFiles.moreImages];
        updatedMoreImages[index] = file;
        setImageFiles((prev) => ({
          ...prev,
          moreImages: updatedMoreImages,
        }));

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const updatedImagePreviews = [...(editingProduct.moreImages || [])];
          updatedImagePreviews[index] = e.target.result;
          handleEditChange("moreImages", updatedImagePreviews);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Save product (create or update)
  const saveProduct = async () => {
    try {
      setLoading(true);

      // Prepare form data
      const formData = new FormData();

      // Add all product fields to formData
      Object.keys(editingProduct).forEach((key) => {
        if (key === "specifications" || key === "tags") {
          formData.append(key, JSON.stringify(editingProduct[key]));
        } else if (
          key !== "masterImage" &&
          key !== "moreImages" &&
          key !== "_id"
        ) {
          formData.append(key, editingProduct[key]);
        }
      });

      // Handle master image upload
      if (imageFiles.masterImage) {
        formData.append("masterImage", imageFiles.masterImage);
      }

      // Handle more images upload
      imageFiles.moreImages.forEach((file, index) => {
        if (file) {
          formData.append(`moreImage${index}`, file);
        }
      });

      let response;
      if (isCreating) {
        // Create new product
        response = await axios.post(`${API_URL}/api/products`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Update existing product
        response = await axios.put(
          `${API_URL}/api/products/${editingProduct._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.data && response.data.success) {
        toast.success(
          `Product ${isCreating ? "created" : "updated"} successfully!`
        );
        setIsCreating(false);
        setEditingProduct(null);
        setImageFiles({
          masterImage: null,
          moreImages: Array(6).fill(null),
        });
        fetchProducts();
      } else {
        throw new Error(
          response.data.message ||
            `Failed to ${isCreating ? "create" : "update"} product`
        );
      }
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error(`Failed to save product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (productId, productName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${productName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `${API_URL}/api/products/${productId}`
      );

      if (response.data && response.data.success) {
        toast.success("Product deleted successfully!");
        fetchProducts();
        if (showDetails) {
          setShowDetails(false);
          setSelectedProduct(null);
        }
      } else {
        throw new Error(response.data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error(`Failed to delete product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingProduct(null);
    setIsCreating(false);
    setImageFiles({
      masterImage: null,
      moreImages: Array(6).fill(null),
    });
    if (selectedProduct) {
      setShowDetails(true);
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

  // Render editable field
  const renderEditableField = (
    label,
    value,
    field,
    type = "text",
    options = []
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value || ""}
          onChange={(e) => handleEditChange(field, e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
          rows="3"
        />
      ) : type === "select" ? (
        <select
          value={value || ""}
          onChange={(e) => handleEditChange(field, e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "checkbox" ? (
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => handleEditChange(field, e.target.checked)}
          className="h-4 w-4 text-purple-600 border-gray-300 rounded"
        />
      ) : type === "number" ? (
        <input
          type="number"
          value={value || 0}
          onChange={(e) =>
            handleEditChange(
              field,
              type === "number"
                ? parseFloat(e.target.value) || 0
                : e.target.value
            )
          }
          className="w-full border border-gray-300 p-2 rounded"
          step={type === "price" ? "0.01" : "1"}
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => handleEditChange(field, e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        />
      )}
    </div>
  );

  // Render image upload field
  const renderImageUpload = (label, field, currentImage, index = null) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="border border-gray-300 rounded-lg p-4">
        {currentImage ? (
          <div className="mb-2">
            <img
              src={
                typeof currentImage === "string" &&
                !currentImage.startsWith("data:")
                  ? `${API_URL}${currentImage}`
                  : currentImage
              }
              alt={label}
              className="h-32 object-contain mx-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/api/placeholder/300/200";
              }}
            />
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center bg-gray-100 rounded">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            handleImageFileSelect(field, e.target.files[0], index)
          }
          className="w-full mt-2"
        />
        {currentImage && (
          <button
            type="button"
            onClick={() => {
              if (field === "masterImage") {
                handleEditChange("masterImage", null);
                setImageFiles((prev) => ({ ...prev, masterImage: null }));
              } else if (field === "moreImage" && index !== null) {
                const updatedMoreImages = [
                  ...(editingProduct.moreImages || []),
                ];
                updatedMoreImages[index] = null;
                handleEditChange("moreImages", updatedMoreImages);

                const updatedImageFiles = [...imageFiles.moreImages];
                updatedImageFiles[index] = null;
                setImageFiles((prev) => ({
                  ...prev,
                  moreImages: updatedImageFiles,
                }));
              }
            }}
            className="text-red-600 hover:text-red-800 text-sm mt-2"
          >
            Remove Image
          </button>
        )}
      </div>
    </div>
  );

  // Render specification fields for editing
  const renderSpecificationFields = (spec, index) => (
    <div key={index} className="grid grid-cols-5 gap-2 mb-4 p-3 border rounded">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Height
        </label>
        <input
          type="text"
          value={spec.height || ""}
          onChange={(e) =>
            handleSpecificationChange(index, "height", e.target.value)
          }
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Height"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Length
        </label>
        <input
          type="text"
          value={spec.length || ""}
          onChange={(e) =>
            handleSpecificationChange(index, "length", e.target.value)
          }
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Length"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Width
        </label>
        <input
          type="text"
          value={spec.width || ""}
          onChange={(e) =>
            handleSpecificationChange(index, "width", e.target.value)
          }
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Width"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unit
        </label>
        <input
          type="text"
          value={spec.unit || ""}
          onChange={(e) =>
            handleSpecificationChange(index, "unit", e.target.value)
          }
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Unit"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Colour
        </label>
        <input
          type="text"
          value={spec.colours || ""}
          onChange={(e) =>
            handleSpecificationChange(index, "colours", e.target.value)
          }
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Colour"
        />
      </div>
      <div className="col-span-5">
        <button
          type="button"
          onClick={() => removeSpecification(index)}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Remove Specification
        </button>
      </div>
    </div>
  );

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
          <h1 className="text-xl font-medium">Product Management</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={startCreateProduct}
              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
            >
              <PlusIcon size={16} />
              <span>Add Product</span>
            </button>
            <span className="text-xs bg-purple-700 px-2 py-1 rounded">
              {totalItems} Products
            </span>
          </div>
        </div>

        {editingProduct ? (
          /* Edit/Create Product Form */
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {isCreating ? "Create New Product" : "Edit Product"}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={saveProduct}
                  disabled={loading}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  <SaveIcon size={16} />
                  <span>{loading ? "Saving..." : "Save"}</span>
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center space-x-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  <XIcon size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left and middle columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {renderEditableField(
                      "Product ID",
                      editingProduct.productId,
                      "productId"
                    )}
                    {renderEditableField(
                      "Product Type",
                      editingProduct.productType,
                      "productType",
                      "select",
                      [
                        { value: "Parent", label: "Parent" },
                        { value: "Child", label: "Child" },
                      ]
                    )}
                  </div>

                  {editingProduct.productType === "Child" ? (
                    <>
                      {renderEditableField(
                        "Variance Name",
                        editingProduct.varianceName,
                        "varianceName"
                      )}
                      {renderEditableField(
                        "Subtitle Description",
                        editingProduct.subtitleDescription,
                        "subtitleDescription",
                        "textarea"
                      )}
                    </>
                  ) : (
                    <>
                      {renderEditableField(
                        "Product Name",
                        editingProduct.productName,
                        "productName"
                      )}
                      {renderEditableField(
                        "Description",
                        editingProduct.description,
                        "description",
                        "textarea"
                      )}
                    </>
                  )}

                  {renderEditableField("Brand", editingProduct.brand, "brand")}

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {renderEditableField(
                      "GTIN",
                      editingProduct.globalTradeItemNumber,
                      "globalTradeItemNumber"
                    )}
                    {renderEditableField(
                      "K3L Number",
                      editingProduct.k3lNumber,
                      "k3lNumber"
                    )}
                    {renderEditableField(
                      "SNI Number",
                      editingProduct.sniNumber,
                      "sniNumber"
                    )}
                  </div>
                </div>

                {/* Specifications */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Specifications</h3>
                  {editingProduct.specifications?.map((spec, index) =>
                    renderSpecificationFields(spec, index)
                  )}
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Specification
                  </button>
                </div>

                {/* Inventory */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Inventory</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      {renderEditableField(
                        "Stock Amount",
                        editingProduct.Stock,
                        "Stock",
                        "number"
                      )}
                      {renderEditableField(
                        "Safety Days",
                        editingProduct.safetyDays,
                        "safetyDays",
                        "number"
                      )}
                      {renderEditableField(
                        "Safety Days Stock",
                        editingProduct.safetyDaysStock,
                        "safetyDaysStock",
                        "number"
                      )}
                    </div>
                    <div>
                      {renderEditableField(
                        "Delivery Days",
                        editingProduct.deliveryDays,
                        "deliveryDays"
                      )}
                      {renderEditableField(
                        "Delivery Time",
                        editingProduct.deliveryTime,
                        "deliveryTime"
                      )}
                      {renderEditableField(
                        "Reorder Setting",
                        editingProduct.reOrderSetting,
                        "reOrderSetting"
                      )}
                    </div>
                  </div>
                </div>

                {/* Supplier Information */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">
                    Supplier Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderEditableField(
                      "Supplier Name",
                      editingProduct.supplierName,
                      "supplierName"
                    )}
                    {renderEditableField(
                      "Supplier Contact",
                      editingProduct.supplierContact,
                      "supplierContact"
                    )}
                    {renderEditableField(
                      "Supplier Email",
                      editingProduct.supplierEmail,
                      "supplierEmail",
                      "email"
                    )}
                    {renderEditableField(
                      "Supplier Address",
                      editingProduct.supplierAddress,
                      "supplierAddress",
                      "textarea"
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Pricing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderEditableField(
                      "Retail Price",
                      editingProduct.NormalPrice,
                      "NormalPrice",
                      "number"
                    )}
                    {renderEditableField(
                      "Discount (%)",
                      editingProduct.anyDiscount,
                      "anyDiscount",
                      "number"
                    )}
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
                        checked={editingProduct.visibility === "Public"}
                        onChange={() =>
                          handleEditChange("visibility", "Public")
                        }
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Publicly visible
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={editingProduct.visibility === "Private"}
                        onChange={() =>
                          handleEditChange("visibility", "Private")
                        }
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Hidden
                      </label>
                    </div>
                    <div className="flex items-center mt-3">
                      {renderEditableField(
                        "",
                        editingProduct.onceShare,
                        "onceShare",
                        "checkbox"
                      )}
                      <label className="ml-2 block text-sm text-gray-500">
                        Once there is less than 2 days automatically end make
                        visible when restocked/received
                      </label>
                    </div>
                    <div className="flex items-center mt-1">
                      {renderEditableField(
                        "",
                        editingProduct.noChildHideParent,
                        "noChildHideParent",
                        "checkbox"
                      )}
                      <label className="ml-2 block text-sm text-gray-500">
                        If no child, then parent hidden
                      </label>
                    </div>
                  </div>
                </div>

                {/* Categories and Tags */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Categories</h3>
                  {renderEditableField(
                    "Category",
                    editingProduct.categories,
                    "categories"
                  )}
                  {renderEditableField(
                    "Sub-Category",
                    editingProduct.subCategories,
                    "subCategories"
                  )}

                  <h3 className="text-lg font-medium my-4">Tags</h3>
                  {editingProduct.tags?.map((tag, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        className="flex-1 border border-gray-300 p-2 rounded"
                        placeholder="Tag"
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTag}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Tag
                  </button>
                </div>

                {/* Images */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Images</h3>
                  {renderImageUpload(
                    "Master Image",
                    "masterImage",
                    editingProduct.masterImage
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Images
                    </label>
                    <div className="space-y-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <div key={index}>
                          {renderImageUpload(
                            `Image ${index + 1}`,
                            "moreImage",
                            editingProduct.moreImages?.[index],
                            index
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">Notes</h3>
                  {renderEditableField(
                    "",
                    editingProduct.notes,
                    "notes",
                    "textarea"
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : showDetails ? (
          /* Product Details View (Read-only) - Exact same as ViewProducts */
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
                <button
                  onClick={() => startEditProduct(selectedProduct)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                >
                  <EditIcon size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() =>
                    deleteProduct(
                      selectedProduct._id,
                      selectedProduct.productName
                    )
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-1"
                >
                  <TrashIcon size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* The rest of your existing ViewProducts detail view remains exactly the same */}
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

                  {/* Continue with the rest of your existing ViewProducts detail view... */}
                  {/* ... (Include all the other sections from your ViewProducts component) ... */}
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  {/* Include all the right column sections from your ViewProducts component */}
                  {/* ... */}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Unit
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
                            ${product.NormalPrice || "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.Stock || "0"}{" "}
                            {product.productType === "Parent" ? "" : "bags"}
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
                              <button
                                onClick={() => startEditProduct(product)}
                                className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                              >
                                <EditIcon size={16} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() =>
                                  deleteProduct(
                                    product._id,
                                    product.productName
                                  )
                                }
                                className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                              >
                                <TrashIcon size={16} />
                                <span>Delete</span>
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
    </div>
  );
};

export default ProductManagement;
