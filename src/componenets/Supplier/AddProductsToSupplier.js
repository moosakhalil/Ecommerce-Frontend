import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/sidebar";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../utils/config";

const AddProductsToSupplier = () => {
  const [activeTab, setActiveTab] = useState("productsToSupplier");
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allRelationships, setAllRelationships] = useState([]);

  // Fetch suppliers
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all relationships when suppliers and products are loaded
  useEffect(() => {
    if (suppliers.length > 0 && products.length > 0) {
      fetchAllRelationships();
    }
  }, [suppliers, products]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/suppliers`);
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to fetch suppliers");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      if (data.success) {
        // Map the product data to ensure consistency
        const mappedProducts = (data.data || data.products || []).map(product => ({
          _id: product._id,
          name: product.productName || product.name || "Unknown Product",
          category: product.categories || product.category || "Uncategorized",
          productId: product.productId,
          Stock: product.Stock,
          NormalPrice: product.NormalPrice,
          selectedSupplierId: product.selectedSupplierId // Include supplier ID
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  // Delete a relationship
  const handleDeleteRelationship = async (supplierId, productId, supplierName, productName) => {
    if (!window.confirm(`Are you sure you want to remove the relationship between "${supplierName}" and "${productName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      // Step 1: Get the supplier and remove product from supplyProducts array
      const supplier = suppliers.find(s => s._id === supplierId);
      if (supplier && supplier.supplyProducts) {
        const updatedSupplyProducts = supplier.supplyProducts.filter(pid => pid !== productId);
        
        const formData = new FormData();
        formData.append('supplyProducts', JSON.stringify(updatedSupplyProducts));
        
        // Preserve all existing supplier data
        Object.keys(supplier).forEach(key => {
          if (key !== 'supplyProducts' && key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
            if (key === 'relatedPeople' || key === 'otherDocs') {
              formData.append(key, JSON.stringify(supplier[key]));
            } else if (typeof supplier[key] !== 'object') {
              formData.append(key, supplier[key]);
            }
          }
        });

        const supplierResponse = await fetch(
          `${API_BASE_URL}/api/suppliers/${supplierId}`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (!supplierResponse.ok) {
          throw new Error('Failed to update supplier');
        }
      }

      // Step 2: Clear the product's selectedSupplierId if it matches this supplier
      const product = products.find(p => p._id === productId);
      if (product && product.selectedSupplierId === supplierId) {
        const productResponse = await fetch(
          `${API_BASE_URL}/api/products/${productId}/supplier`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              selectedSupplierId: null,
              supplierName: null,
              supplierContact: null,
              supplierEmail: null,
              supplierAddress: null,
            }),
          }
        );

        if (!productResponse.ok) {
          throw new Error('Failed to update product');
        }
      }

      toast.success("Relationship deleted successfully");
      // Refresh data
      await fetchSuppliers();
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting relationship:", error);
      toast.error("Failed to delete relationship: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all supplier-product relationships
  const fetchAllRelationships = async () => {
    if (suppliers.length === 0 || products.length === 0) return;

    try {
      const relationships = [];
      const relationshipMap = new Map(); // To avoid duplicates

      // Method 1: Iterate through all suppliers and their products
      for (const supplier of suppliers) {
        if (supplier.supplyProducts && supplier.supplyProducts.length > 0) {
          supplier.supplyProducts.forEach((productId) => {
            const product = products.find((p) => p._id === productId);
            if (product) {
              const key = `${supplier._id}-${product._id}`;
              if (!relationshipMap.has(key)) {
                relationshipMap.set(key, {
                  id: key,
                  supplier: {
                    _id: supplier._id,
                    name: supplier.name,
                    phone: supplier.phone,
                    email: supplier.email,
                    address: supplier.address,
                  },
                  product: {
                    _id: product._id,
                    name: product.name,
                    category: product.category,
                    productId: product.productId,
                    Stock: product.Stock,
                    NormalPrice: product.NormalPrice,
                  },
                });
              }
            }
          });
        }
      }

      // Method 2: Iterate through all products and their selected suppliers
      for (const product of products) {
        if (product.selectedSupplierId) {
          const supplier = suppliers.find((s) => s._id === product.selectedSupplierId);
          if (supplier) {
            const key = `${supplier._id}-${product._id}`;
            if (!relationshipMap.has(key)) {
              relationshipMap.set(key, {
                id: key,
                supplier: {
                  _id: supplier._id,
                  name: supplier.name,
                  phone: supplier.phone,
                  email: supplier.email,
                  address: supplier.address,
                },
                product: {
                  _id: product._id,
                  name: product.name,
                  category: product.category,
                  productId: product.productId,
                  Stock: product.Stock,
                  NormalPrice: product.NormalPrice,
                },
              });
            }
          }
        }
      }

      // Convert map to array
      setAllRelationships(Array.from(relationshipMap.values()));
    } catch (error) {
      console.error("Error fetching relationships:", error);
    }
  };

  // Products to Supplier - Add products to a supplier
  const handleAddProductToSupplier = () => {
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    
    const product = products.find(p => p._id === selectedProduct);
    if (selectedProducts.find(p => p._id === selectedProduct)) {
      toast.error("Product already added");
      return;
    }
    
    setSelectedProducts([...selectedProducts, product]);
    setSelectedProduct("");
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
  };

  const handleSubmitProductsToSupplier = async () => {
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    setLoading(true);
    try {
      // Get current supplier data
      const supplier = suppliers.find(s => s._id === selectedSupplier);
      if (!supplier) {
        toast.error("Supplier not found");
        setLoading(false);
        return;
      }

      // Merge existing supplyProducts with new ones (avoid duplicates)
      const existingProducts = supplier.supplyProducts || [];
      const newProductIds = selectedProducts.map(p => p._id);
      const mergedProducts = [...new Set([...existingProducts, ...newProductIds])];

      const formData = new FormData();
      formData.append('supplyProducts', JSON.stringify(mergedProducts));
      
      // Preserve all existing supplier data
      Object.keys(supplier).forEach(key => {
        if (key !== 'supplyProducts' && key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
          if (key === 'relatedPeople' || key === 'otherDocs') {
            formData.append(key, JSON.stringify(supplier[key]));
          } else if (typeof supplier[key] !== 'object') {
            formData.append(key, supplier[key]);
          }
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/api/suppliers/${selectedSupplier}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Products added to supplier successfully");
        setSelectedProducts([]);
        setSelectedSupplier("");
        // Refresh relationships
        await fetchSuppliers();
        await fetchProducts();
      } else {
        toast.error(data.message || "Failed to add products to supplier");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add products to supplier: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Supplier to Products - Add suppliers to a product
  const handleAddSupplierToProduct = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }
    
    const supplier = suppliers.find(s => s._id === selectedSupplier);
    if (selectedSuppliers.find(s => s._id === selectedSupplier)) {
      toast.error("Supplier already added");
      return;
    }
    
    setSelectedSuppliers([...selectedSuppliers, supplier]);
    setSelectedSupplier("");
  };

  const handleRemoveSupplier = (supplierId) => {
    setSelectedSuppliers(selectedSuppliers.filter(s => s._id !== supplierId));
  };

  const handleSubmitSuppliersToProduct = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    if (selectedSuppliers.length === 0) {
      toast.error("Please add at least one supplier");
      return;
    }

    setLoading(true);
    try {
      const primarySupplier = selectedSuppliers[0];
      
      // Step 1: Update the product with supplier information
      const productResponse = await fetch(
        `${API_BASE_URL}/api/products/${selectedProduct}/supplier`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedSupplierId: primarySupplier._id,
            supplierName: primarySupplier.name,
            supplierContact: primarySupplier.phone,
            supplierEmail: primarySupplier.email,
            supplierAddress: primarySupplier.address,
          }),
        }
      );

      if (!productResponse.ok) {
        const errorData = await productResponse.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      // Step 2: Add product to supplier's supplyProducts array
      const supplier = suppliers.find(s => s._id === primarySupplier._id);
      if (supplier) {
        const existingProducts = supplier.supplyProducts || [];
        const mergedProducts = [...new Set([...existingProducts, selectedProduct])];

        const formData = new FormData();
        formData.append('supplyProducts', JSON.stringify(mergedProducts));
        
        // Preserve all existing supplier data
        Object.keys(supplier).forEach(key => {
          if (key !== 'supplyProducts' && key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
            if (key === 'relatedPeople' || key === 'otherDocs') {
              formData.append(key, JSON.stringify(supplier[key]));
            } else if (typeof supplier[key] !== 'object') {
              formData.append(key, supplier[key]);
            }
          }
        });

        const supplierResponse = await fetch(
          `${API_BASE_URL}/api/suppliers/${primarySupplier._id}`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (!supplierResponse.ok) {
          const errorData = await supplierResponse.json();
          throw new Error(errorData.message || "Failed to update supplier");
        }
      }

      toast.success("Supplier added to product successfully");
      setSelectedSuppliers([]);
      setSelectedProduct("");
      // Refresh relationships
      await fetchSuppliers();
      await fetchProducts();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add supplier to product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ml-80 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6 text-gray-800">
            Manage Product-Supplier Relationships
          </h1>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("productsToSupplier")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === "productsToSupplier"
                    ? "bg-blue-500 text-white border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Add Products to Supplier
              </button>
              <button
                onClick={() => setActiveTab("suppliersToProduct")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === "suppliersToProduct"
                    ? "bg-blue-500 text-white border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Add Suppliers to Product
              </button>
              <button
                onClick={() => setActiveTab("suppliersNoProducts")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === "suppliersNoProducts"
                    ? "bg-orange-500 text-white border-b-2 border-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Suppliers with No Products
              </button>
              <button
                onClick={() => setActiveTab("productsNoSupplier")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === "productsNoSupplier"
                    ? "bg-orange-500 text-white border-b-2 border-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Products with No Supplier
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow p-6">
            {activeTab === "productsToSupplier" ? (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Add Products to Supplier
                </h2>
                <p className="text-gray-600 mb-6">
                  Select a supplier and add products they supply
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Supplier Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Supplier <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a supplier...</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name} - {supplier.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Product <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Choose a product...</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name} - {product.category}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddProductToSupplier}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected Products List */}
                {selectedProducts.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-3">
                      Selected Products ({selectedProducts.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedProducts.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Category: {product.category}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveProduct(product._id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
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
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitProductsToSupplier}
                    disabled={loading || !selectedSupplier || selectedProducts.length === 0}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Saving..." : "Save Products to Supplier"}
                  </button>
                </div>

                {/* Products for Selected Supplier */}
                {selectedSupplier && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Products Already Assigned to This Supplier ({
                        allRelationships.filter(rel => rel.supplier._id === selectedSupplier).length
                      })
                    </h3>
                    {allRelationships.filter(rel => rel.supplier._id === selectedSupplier).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allRelationships
                          .filter(rel => rel.supplier._id === selectedSupplier)
                          .map((rel) => (
                        <div
                          key={rel.id}
                          className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 relative"
                        >
                          <button
                            onClick={() =>
                              handleDeleteRelationship(
                                rel.supplier._id,
                                rel.product._id,
                                rel.supplier.name,
                                rel.product.name
                              )
                            }
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors"
                            title="Delete relationship"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                          <div className="mb-3 pb-3 border-b border-purple-300">
                            <h4 className="font-semibold text-purple-900 mb-1">
                              {rel.supplier.name}
                            </h4>
                            <p className="text-sm text-gray-700">
                              📞 {rel.supplier.phone}
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-1">
                              {rel.product.name}
                            </h5>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p>
                                <span className="font-medium">Category:</span>{" "}
                                {rel.product.category}
                              </p>
                              {rel.product.Stock != null && (
                                <p>
                                  <span className="font-medium">Stock:</span>{" "}
                                  {rel.product.Stock}
                                </p>
                              )}
                              {rel.product.NormalPrice != null && (
                                <p>
                                  <span className="font-medium">Price:</span> Rp{" "}
                                  {rel.product.NormalPrice.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        No products have been assigned to this supplier yet.
                      </p>
                    </div>
                  )}
                </div>
                )}
              </div>
            ) : activeTab === "suppliersToProduct" ? (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Add Suppliers to Product
                </h2>
                <p className="text-gray-600 mb-6">
                  Select a product and add suppliers who can supply it
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Product <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a product...</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} - {product.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Supplier Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Supplier <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Choose a supplier...</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.name} - {supplier.phone}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddSupplierToProduct}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected Suppliers List */}
                {selectedSuppliers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-3">
                      Selected Suppliers ({selectedSuppliers.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedSuppliers.map((supplier) => (
                        <div
                          key={supplier._id}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {supplier.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Phone: {supplier.phone} | Email: {supplier.email || "N/A"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveSupplier(supplier._id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
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
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitSuppliersToProduct}
                    disabled={loading || !selectedProduct || selectedSuppliers.length === 0}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Saving..." : "Save Suppliers to Product"}
                  </button>
                </div>

                {/* Suppliers for Selected Product */}
                {selectedProduct && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Suppliers Already Assigned to This Product ({
                        allRelationships.filter(rel => rel.product._id === selectedProduct).length
                      })
                    </h3>
                    {allRelationships.filter(rel => rel.product._id === selectedProduct).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allRelationships
                          .filter(rel => rel.product._id === selectedProduct)
                          .map((rel) => (
                        <div
                          key={rel.id}
                          className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 relative"
                        >
                          <button
                            onClick={() =>
                              handleDeleteRelationship(
                                rel.supplier._id,
                                rel.product._id,
                                rel.supplier.name,
                                rel.product.name
                              )
                            }
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors"
                            title="Delete relationship"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                          <div className="mb-3 pb-3 border-b border-purple-300">
                            <h4 className="font-semibold text-purple-900 mb-1">
                              {rel.supplier.name}
                            </h4>
                            <p className="text-sm text-gray-700">
                              📞 {rel.supplier.phone}
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-1">
                              {rel.product.name}
                            </h5>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p>
                                <span className="font-medium">Category:</span>{" "}
                                {rel.product.category}
                              </p>
                              {rel.product.Stock != null && (
                                <p>
                                  <span className="font-medium">Stock:</span>{" "}
                                  {rel.product.Stock}
                                </p>
                              )}
                              {rel.product.NormalPrice != null && (
                                <p>
                                  <span className="font-medium">Price:</span> Rp{" "}
                                  {rel.product.NormalPrice.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        No suppliers have been assigned to this product yet.
                      </p>
                    </div>
                  )}
                </div>
                )}
              </div>
            ) : activeTab === "suppliersNoProducts" ? (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Suppliers with No Products
                </h2>
                <p className="text-gray-600 mb-6">
                  List of suppliers that have no products assigned
                </p>

                {(() => {
                  const suppliersWithNoProducts = suppliers.filter(supplier => {
                    // Check if supplier has no products in supplyProducts array
                    const hasSupplyProducts = supplier.supplyProducts && supplier.supplyProducts.length > 0;
                    
                    // Check if any product has this supplier as selectedSupplierId
                    const hasProductsReferencingSupplier = products.some(
                      product => product.selectedSupplierId === supplier._id
                    );
                    
                    // Supplier has no products if both conditions are false
                    return !hasSupplyProducts && !hasProductsReferencingSupplier;
                  });

                  return suppliersWithNoProducts.length > 0 ? (
                    <div>
                      <div className="mb-4 text-sm text-gray-600">
                        Found {suppliersWithNoProducts.length} supplier(s) with no products
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suppliersWithNoProducts.map((supplier) => (
                          <div
                            key={supplier._id}
                            className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:shadow-md transition-shadow"
                          >
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {supplier.name}
                            </h4>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p>
                                <span className="font-medium">📞 Phone:</span>{" "}
                                {supplier.phone}
                              </p>
                              {supplier.email && (
                                <p>
                                  <span className="font-medium">📧 Email:</span>{" "}
                                  {supplier.email}
                                </p>
                              )}
                              {supplier.address && (
                                <p>
                                  <span className="font-medium">📍 Address:</span>{" "}
                                  {supplier.address}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        All suppliers have products assigned.
                      </p>
                    </div>
                  );
                })()}
              </div>
            ) : activeTab === "productsNoSupplier" ? (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Products with No Supplier
                </h2>
                <p className="text-gray-600 mb-6">
                  List of products that have no supplier assigned
                </p>

                {(() => {
                  const productsWithNoSupplier = products.filter(product => {
                    // Check if product has selectedSupplierId
                    const hasSelectedSupplier = product.selectedSupplierId && product.selectedSupplierId !== "";
                    
                    // Check if any supplier has this product in their supplyProducts array
                    const hasSuppliersReferencingProduct = suppliers.some(
                      supplier => supplier.supplyProducts && supplier.supplyProducts.includes(product._id)
                    );
                    
                    // Product has no supplier if both conditions are false
                    return !hasSelectedSupplier && !hasSuppliersReferencingProduct;
                  });

                  return productsWithNoSupplier.length > 0 ? (
                    <div>
                      <div className="mb-4 text-sm text-gray-600">
                        Found {productsWithNoSupplier.length} product(s) with no supplier
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {productsWithNoSupplier.map((product) => (
                          <div
                            key={product._id}
                            className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:shadow-md transition-shadow"
                          >
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {product.name}
                            </h4>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p>
                                <span className="font-medium">Category:</span>{" "}
                                {product.category}
                              </p>
                              {product.productId && (
                                <p>
                                  <span className="font-medium">Product ID:</span>{" "}
                                  {product.productId}
                                </p>
                              )}
                              {product.Stock != null && (
                                <p>
                                  <span className="font-medium">Stock:</span>{" "}
                                  {product.Stock}
                                </p>
                              )}
                              {product.NormalPrice != null && (
                                <p>
                                  <span className="font-medium">Price:</span> Rp{" "}
                                  {product.NormalPrice.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        All products have suppliers assigned.
                      </p>
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductsToSupplier;
