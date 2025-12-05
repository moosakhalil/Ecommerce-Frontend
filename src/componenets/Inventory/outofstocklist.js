import React, { useState, useEffect } from "react";
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit,
  AlertTriangle,
  Package,
  Plus,
  Minus,
  Check,
  X,
  Truck,
  User,
  Phone,
  MapPin,
  List,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

const OutOfStockList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Navigation function
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
    window.location.href = path;
  };

  // ✅ Calculate suggested order quantity using AmountStockmintoReorder
  const calculateOrderQuantity = (product, reorderThreshold) => {
    const currentStock = product.Stock || 0;
    const threshold = reorderThreshold || product.AmountStockmintoReorder || 5;
    const minimumOrder = product.minimumOrder || 1;

    // Order enough to get to 2x threshold, but at least minimum order
    const suggestedQty = Math.max(threshold * 2 - currentStock, minimumOrder);
    return Math.max(suggestedQty, 1);
  };

  // ✅ Get order status info with proper status checking
  const getOrderStatusInfo = (product) => {
    console.log(
      `Product ${product.productId} stockOrderStatus: ${product.stockOrderStatus}`
    );

    // ✅ Check if product has active orders in orderStock array
    const hasActiveOrders =
      product.orderStock &&
      product.orderStock.some((order) =>
        ["order_placed", "order_confirmed"].includes(order.status)
      );

    // ✅ Check for confirmed orders specifically
    const hasConfirmedOrders =
      product.orderStock &&
      product.orderStock.some((order) => order.status === "order_confirmed");

    // ✅ Use stockOrderStatus if available, otherwise check orderStock array
    let status = product.stockOrderStatus;

    // If no explicit stockOrderStatus, determine from orderStock array
    if (!status) {
      if (hasConfirmedOrders) {
        status = "order_confirmed";
      } else if (hasActiveOrders) {
        status = "order_placed";
      } else {
        status = "needs_reorder";
      }
    }

    console.log(
      `📊 Final determined status for ${product.productId}: ${status}`
    );

    switch (status) {
      case "order_placed":
        return {
          status: "In Order List",
          color: "text-blue-600",
          bg: "bg-blue-100",
          details: product.totalPendingOrderQuantity
            ? `Qty: ${product.totalPendingOrderQuantity}`
            : `Ready for confirmation`,
          date: product.lastOrderDate
            ? new Date(product.lastOrderDate).toLocaleDateString()
            : "",
          canMoveToOrder: false,
          canRemoveFromOrder: true,
        };
      case "order_confirmed":
        return {
          status: "Order Confirmed",
          color: "text-green-600",
          bg: "bg-green-100",
          details: "Confirmed & Processing",
          date: product.lastOrderDate
            ? new Date(product.lastOrderDate).toLocaleDateString()
            : "",
          canMoveToOrder: false,
          canRemoveFromOrder: false,
        };
      case "delivered":
        return {
          status: "Order Delivered",
          color: "text-purple-600",
          bg: "bg-purple-100",
          details: "Completed",
          date: product.lastOrderDate
            ? new Date(product.lastOrderDate).toLocaleDateString()
            : "",
          canMoveToOrder: false,
          canRemoveFromOrder: false,
        };
      case "needs_reorder":
      default:
        return {
          status: "Needs Reorder",
          color: "text-orange-600",
          bg: "bg-orange-100",
          details: "Ready to order",
          date: "",
          canMoveToOrder: true,
          canRemoveFromOrder: false,
        };
    }
  };

  // ✅ Get stock status using AmountStockmintoReorder as threshold
  const getStockStatus = (currentStock, threshold) => {
    if (currentStock === 0)
      return {
        status: "out_of_stock",
        color: "text-red-600",
        bg: "bg-red-100",
      };
    if (currentStock <= Math.ceil(threshold * 0.5))
      return { status: "critical", color: "text-red-500", bg: "bg-red-50" };
    if (currentStock <= threshold)
      return {
        status: "low_stock",
        color: "text-orange-500",
        bg: "bg-orange-50",
      };
    return { status: "in_stock", color: "text-green-600", bg: "bg-green-50" };
  };

  // ✅ FIXED: Fetch ALL products first, then filter and manage orders locally
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching all products...");

      // Fetch ALL products using the basic endpoint
      const response = await fetch(
        "http://localhost:5000/api/products"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      if (data.success) {
        console.log(`📦 Found ${data.data.length} total products`);

        // Transform ALL products and add local management properties
        const transformedProducts = data.data.map((product) => {
          const currentStock = product.Stock || 0;
          // ✅ Use AmountStockmintoReorder field directly as threshold
          const reorderThreshold = product.AmountStockmintoReorder || 5; // Default to 5 if not set

          return {
            ...product,
            reorderThreshold,
            currentQty: currentStock,
            orderQuantity: calculateOrderQuantity(product, reorderThreshold),
            approvedSupplier: product.supplierName || "Not Set",
            selectedSupplierId: null,
            notes: product.notes || "",
            // ✅ Use the actual stockOrderStatus from database
            orderStatus: getOrderStatusInfo(product),
            // Add flags for easy filtering
            needsReorder: currentStock <= reorderThreshold,
            isOutOfStock: currentStock === 0,
            isLowStock: currentStock > 0 && currentStock <= reorderThreshold,
          };
        });

        // You can filter here if you want to show only products that need reordering
        // For now, let's show ALL products so you can see everything
        setProducts(transformedProducts);
        setError("");

        console.log(`✅ Processed ${transformedProducts.length} products`);
        console.log(
          `🔴 Out of stock: ${
            transformedProducts.filter((p) => p.isOutOfStock).length
          }`
        );
        console.log(
          `🟡 Low stock: ${
            transformedProducts.filter((p) => p.isLowStock).length
          }`
        );
        console.log(
          `🟢 In stock: ${
            transformedProducts.filter((p) => !p.needsReorder).length
          }`
        );
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(`Error fetching products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/suppliers"
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuppliers(
            data.data.filter(
              (supplier) =>
                supplier.status === "unblocked" &&
                supplier.activeInactive === "active"
            )
          );
          console.log(`👥 Found ${data.data.length} suppliers`);
        }
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  // ✅ NEW: Refresh product data to get updated statuses
  const refreshProductData = async () => {
    try {
      console.log("🔄 Refreshing product data to get updated statuses...");
      const response = await fetch(
        "http://localhost:5000/api/products"
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update products with fresh data from database
          const updatedProducts = products.map((currentProduct) => {
            const freshProduct = data.data.find(
              (p) => p._id === currentProduct._id
            );
            if (freshProduct) {
              const currentStock = freshProduct.Stock || 0;
              const reorderThreshold =
                freshProduct.AmountStockmintoReorder || 5;

              return {
                ...currentProduct, // Keep local changes like orderQuantity
                ...freshProduct, // Update with fresh database data
                reorderThreshold,
                currentQty: currentStock,
                orderStatus: getOrderStatusInfo(freshProduct), // Recalculate status
                needsReorder: currentStock <= reorderThreshold,
                isOutOfStock: currentStock === 0,
                isLowStock:
                  currentStock > 0 && currentStock <= reorderThreshold,
              };
            }
            return currentProduct;
          });

          setProducts(updatedProducts);
          console.log("✅ Product data refreshed successfully");
        }
      }
    } catch (err) {
      console.error("⚠️ Failed to refresh product data:", err);
    }
  };

  // Update order quantity
  const updateOrderQuantity = (productId, quantity) => {
    const qty = Math.max(1, parseInt(quantity) || 1);
    setProducts((prev) =>
      prev.map((product) =>
        product._id === productId ? { ...product, orderQuantity: qty } : product
      )
    );
  };

  // Show supplier selection modal
  const showSupplierSelection = () => {
    setShowSupplierModal(true);
    setActiveActionMenu(null);
  };

  // Select supplier for all products
  const selectSupplier = (supplier) => {
    setProducts((prev) =>
      prev.map((product) => ({
        ...product,
        approvedSupplier: supplier.name,
        selectedSupplierId: supplier._id,
        supplierEmail: supplier.email,
        supplierPhone: supplier.phone,
        supplierAddress: supplier.address,
      }))
    );
    setShowSupplierModal(false);
    setSuccessMessage(`Supplier "${supplier.name}" selected for all products`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // ✅ FIXED: Move single product to order list with proper status handling
  const moveProductToOrderList = async (product) => {
    // Check if already in order list
    if (!product.orderStatus.canMoveToOrder) {
      setError(
        `${product.productName} cannot be moved to order list in current status: ${product.orderStatus.status}`
      );
      setTimeout(() => setError(""), 3000);
      setActiveActionMenu(null);
      return;
    }

    try {
      console.log(`🔄 Moving product ${product.productId} to order list...`);

      const orderData = {
        orderQuantity: product.orderQuantity,
        approvedSupplier: product.approvedSupplier || "Not Set",
        selectedSupplierId: product.selectedSupplierId || null,
        supplierEmail: product.supplierEmail || "",
        supplierPhone: product.supplierPhone || "",
        supplierAddress: product.supplierAddress || "",
        currentStock: product.currentQty,
        reorderThreshold: product.reorderThreshold,
        estimatedCost: (product.NormalPrice || 0) * product.orderQuantity,
        notes: product.notes || "",
        requestedBy: "Admin",
        priority: "medium",
      };

      console.log("📤 Sending order data:", orderData);

      const response = await fetch(
        `http://localhost:5000/api/products/${product._id}/add-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("📥 Response data:", result);

        if (result.success) {
          // ✅ Update the product status in local state
          setProducts((prev) =>
            prev.map((p) =>
              p._id === product._id
                ? {
                    ...p,
                    stockOrderStatus: "order_placed",
                    orderStatus: getOrderStatusInfo({
                      ...p,
                      stockOrderStatus: "order_placed",
                    }),
                  }
                : p
            )
          );
          setActiveActionMenu(null);
          setSuccessMessage(
            `✅ ${product.productName} moved to order list successfully!`
          );
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          setError(result.message || "Failed to move product to order list");
          setTimeout(() => setError(""), 3000);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save order");
      }
    } catch (err) {
      console.error("❌ Error moving product to order list:", err);
      setError(`❌ Error: ${err.message}`);
      setTimeout(() => setError(""), 3000);
    }
  };

  // ✅ FIXED: Remove product from order list
  const removeProductFromOrderList = async (product) => {
    if (!product.orderStatus.canRemoveFromOrder) {
      setError(
        `${product.productName} cannot be removed from order list in current status: ${product.orderStatus.status}`
      );
      setTimeout(() => setError(""), 3000);
      setActiveActionMenu(null);
      return;
    }

    try {
      console.log(`🗑️ Removing product ${product.productId} from order list`);

      const response = await fetch(
        `http://localhost:5000/api/products/${product._id}/remove-from-order`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("📥 Remove response data:", result);

        if (result.success) {
          // ✅ Update the product status in local state back to needs_reorder
          setProducts((prev) =>
            prev.map((p) =>
              p._id === product._id
                ? {
                    ...p,
                    stockOrderStatus: "needs_reorder",
                    orderStatus: getOrderStatusInfo({
                      ...p,
                      stockOrderStatus: "needs_reorder",
                    }),
                  }
                : p
            )
          );
          setActiveActionMenu(null);
          setSuccessMessage(
            `✅ ${product.productName} removed from order list successfully!`
          );
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          setError(
            result.message || "Failed to remove product from order list"
          );
          setTimeout(() => setError(""), 3000);
        }
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to remove from order list"
        );
      }
    } catch (err) {
      console.error("❌ Error removing product from order list:", err);
      setError(`❌ Error: ${err.message}`);
      setTimeout(() => setError(""), 3000);
    }
  };

  // ✅ FIXED: Move all products that need reordering to order list
  const moveAllToOrderList = async () => {
    // Filter products that need reordering AND can be moved to order list
    const productsNeedingReorder = products.filter(
      (product) =>
        product.needsReorder && // Below threshold
        product.orderStatus.canMoveToOrder && // Can be moved (needs_reorder status)
        (product.stockOrderStatus === "needs_reorder" ||
          !product.stockOrderStatus)
    );

    if (productsNeedingReorder.length === 0) {
      setError(
        "No products need reordering or are available to move to order list!"
      );
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;
      let failCount = 0;

      console.log(
        `🔄 Moving ${productsNeedingReorder.length} products that need reordering to order list...`
      );

      for (const product of productsNeedingReorder) {
        try {
          const orderData = {
            orderQuantity: product.orderQuantity,
            approvedSupplier: product.approvedSupplier || "Not Set",
            selectedSupplierId: product.selectedSupplierId || null,
            supplierEmail: product.supplierEmail || "",
            supplierPhone: product.supplierPhone || "",
            supplierAddress: product.supplierAddress || "",
            currentStock: product.currentQty,
            reorderThreshold: product.reorderThreshold,
            estimatedCost: (product.NormalPrice || 0) * product.orderQuantity,
            notes: product.notes || "",
            requestedBy: "Admin",
            priority: product.isOutOfStock
              ? "high"
              : product.isLowStock
              ? "medium"
              : "low",
          };

          const response = await fetch(
            `http://localhost:5000/api/products/${product._id}/add-order`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(orderData),
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              successCount++;
              console.log(
                `✅ Successfully moved ${product.productId} to order list`
              );
            } else {
              failCount++;
              console.log(
                `❌ Failed to move ${product.productId}: ${result.message}`
              );
            }
          } else {
            failCount++;
            console.log(
              `❌ HTTP error for ${product.productId}: ${response.status}`
            );
          }
        } catch (err) {
          console.error(`❌ Error processing product ${product._id}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        // ✅ Update local state for successful moves to order_placed
        setProducts((prev) =>
          prev.map((p) => {
            const wasProcessed = productsNeedingReorder.find(
              (ap) => ap._id === p._id
            );
            if (wasProcessed) {
              return {
                ...p,
                stockOrderStatus: "order_placed",
                orderStatus: getOrderStatusInfo({
                  ...p,
                  stockOrderStatus: "order_placed",
                }),
              };
            }
            return p;
          })
        );

        setSuccessMessage(
          `✅ Successfully moved ${successCount} products that need reordering to order list${
            failCount > 0 ? `, ${failCount} failed` : ""
          }`
        );
      } else {
        setError("❌ Failed to move products to order list");
      }

      setTimeout(() => {
        setSuccessMessage("");
        setError("");
      }, 5000);
    } catch (err) {
      console.error("❌ Error moving products:", err);
      setError(`❌ Error: ${err.message}`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (productId) => {
    setActiveActionMenu(activeActionMenu === productId ? null : productId);
  };

  // useEffect hooks
  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  // ✅ Auto-refresh every 30 seconds to catch status changes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshProductData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [products]);

  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categories?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen ? "lg:ml-80" : ""
          } flex-1 flex items-center justify-center`}
        >
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">
              Loading products...
            </h2>
            <p className="text-sm text-gray-500">Checking stock levels...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Count products that need reordering and can be ordered
  const availableForOrderCount = products.filter(
    (p) =>
      p.needsReorder && // Below threshold
      p.orderStatus.canMoveToOrder && // Can be moved
      (p.stockOrderStatus === "needs_reorder" || !p.stockOrderStatus)
  ).length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full p-4`}
      >
        <div className="bg-white rounded shadow">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  Product Stock Management (All Products)
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredProducts.length} products total •{" "}
                  {products.filter((p) => p.needsReorder).length} need
                  reordering • {availableForOrderCount} can be ordered
                </p>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mx-4 mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded flex items-center">
              <Check className="mr-2 h-4 w-4" />
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded flex items-center">
              <X className="mr-2 h-4 w-4" />
              {error}
            </div>
          )}

          {/* Search and Action Bar */}
          <div className="p-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="w-full md:w-96">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border rounded p-2 pl-3 pr-10"
                />
                <Search
                  className="absolute right-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={showSupplierSelection}
                className="bg-blue-500 text-white border rounded px-4 py-2 hover:bg-blue-600 transition-colors flex items-center"
              >
                <User className="mr-2 h-4 w-4" />
                Show Supplier List
              </button>
              <button
                onClick={moveAllToOrderList}
                disabled={availableForOrderCount === 0}
                className={`border rounded px-4 py-2 transition-colors flex items-center ${
                  availableForOrderCount > 0
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Place Orders for Products Needing Reorder (
                {
                  products.filter(
                    (p) => p.needsReorder && p.orderStatus.canMoveToOrder
                  ).length
                }
                )
              </button>
              <button
                onClick={() => navigate("/order-list")}
                className="bg-purple-500 text-white border rounded px-4 py-2 hover:bg-purple-600 transition-colors flex items-center"
              >
                <List className="mr-2 h-4 w-4" />
                Order List
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-orange-300">
                  <th className="py-3 px-4 text-left">Product ID</th>
                  <th className="py-3 px-4 text-left">Product Name</th>
                  <th className="py-3 px-4 text-left">Current Qty</th>
                  <th className="py-3 px-4 text-left">Stock Status</th>
                  <th className="py-3 px-4 text-left">Order Qty</th>
                  <th className="py-3 px-4 text-left">Approved Supplier</th>
                  <th className="py-3 px-4 text-left">Order Status</th>
                  <th className="py-3 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">
                        Try adjusting your search criteria or check if products
                        exist.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => {
                    const stockStatus = getStockStatus(
                      product.currentQty,
                      product.reorderThreshold
                    );

                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {product.productId}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {product.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.categories}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div
                            className={`text-sm font-medium ${stockStatus.color}`}
                          >
                            {product.currentQty}
                          </div>
                          <div className="text-xs text-gray-500">
                            Threshold: {product.reorderThreshold}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}
                          >
                            {stockStatus.status === "out_of_stock" &&
                              "Out of Stock"}
                            {stockStatus.status === "critical" &&
                              "Critical Low"}
                            {stockStatus.status === "low_stock" && "Low Stock"}
                            {stockStatus.status === "in_stock" && "In Stock"}
                          </span>
                          {/* ✅ Add reorder needed indicator */}
                          {product.needsReorder && (
                            <div className="text-xs text-orange-600 mt-1 font-medium">
                              ⚠️ Needs Reorder
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {editingQuantity === product._id ? (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() =>
                                    updateOrderQuantity(
                                      product._id,
                                      product.orderQuantity - 1
                                    )
                                  }
                                  className="bg-gray-200 text-gray-600 rounded px-2 py-1 hover:bg-gray-300"
                                >
                                  <Minus size={12} />
                                </button>
                                <input
                                  type="number"
                                  value={product.orderQuantity}
                                  onChange={(e) =>
                                    updateOrderQuantity(
                                      product._id,
                                      e.target.value
                                    )
                                  }
                                  className="w-16 text-center border rounded px-1 py-1 text-sm"
                                  min="1"
                                />
                                <button
                                  onClick={() =>
                                    updateOrderQuantity(
                                      product._id,
                                      product.orderQuantity + 1
                                    )
                                  }
                                  className="bg-gray-200 text-gray-600 rounded px-2 py-1 hover:bg-gray-300"
                                >
                                  <Plus size={12} />
                                </button>
                                <button
                                  onClick={() => setEditingQuantity(null)}
                                  className="bg-green-500 text-white rounded px-2 py-1 hover:bg-green-600"
                                >
                                  <Check size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {product.orderQuantity}
                                </span>
                                <button
                                  onClick={() =>
                                    setEditingQuantity(product._id)
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Edit size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-blue-500 text-sm">
                            {product.approvedSupplier}
                            {product.approvedSupplier === "Not Set" && (
                              <span className="text-gray-400 ml-1">(None)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${product.orderStatus.bg} ${product.orderStatus.color} mb-1 inline-block max-w-fit`}
                            >
                              {product.orderStatus.status}
                            </span>
                            {product.orderStatus.details && (
                              <span className="text-xs text-gray-500">
                                {product.orderStatus.details}
                              </span>
                            )}
                            {product.orderStatus.date && (
                              <span className="text-xs text-gray-400">
                                {product.orderStatus.date}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 relative">
                          <button
                            onClick={() => handleActionClick(product._id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <MoreVertical size={20} />
                          </button>

                          {activeActionMenu === product._id && (
                            <div className="absolute right-12 mt-0 bg-white shadow-lg rounded-md border z-10 w-56">
                              {/* ✅ Dynamic button based on stockOrderStatus */}
                              {product.orderStatus.canMoveToOrder && (
                                <button
                                  onClick={() =>
                                    moveProductToOrderList(product)
                                  }
                                  className="w-full text-left px-4 py-2 hover:bg-orange-50 text-orange-600 flex items-center"
                                >
                                  <Truck className="mr-2 h-4 w-4" />
                                  Move to Order List
                                </button>
                              )}

                              {/* ✅ Remove from Order List Action */}
                              {product.orderStatus.canRemoveFromOrder && (
                                <button
                                  onClick={() =>
                                    removeProductFromOrderList(product)
                                  }
                                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove from Order List
                                </button>
                              )}

                              {/* No action available */}
                              {!product.orderStatus.canMoveToOrder &&
                                !product.orderStatus.canRemoveFromOrder && (
                                  <div className="px-4 py-2 text-gray-400 text-sm">
                                    No actions available for current status:{" "}
                                    {product.orderStatus.status}
                                  </div>
                                )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProducts.length > itemsPerPage && (
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)}{" "}
                of {filteredProducts.length} products
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Supplier Selection Modal */}
        {showSupplierModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Select Supplier</h3>
                  <button
                    onClick={() => setShowSupplierModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto">
                {suppliers.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <User className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No active suppliers found</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {suppliers.map((supplier) => (
                      <div
                        key={supplier._id}
                        onClick={() => selectSupplier(supplier)}
                        className="p-3 border rounded hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {supplier.name}
                            </h4>
                            <div className="text-sm text-gray-600 flex items-center mt-1">
                              <Phone className="mr-1 h-3 w-3" />
                              {supplier.phone}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {supplier.address}
                            </div>
                          </div>
                          <div className="text-blue-500">Select</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Summary */}
        {products.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Stock Status Summary (All Products)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {products.length}
                </div>
                <div className="text-sm text-gray-700">Total Products</div>
                <div className="text-xs text-gray-600 mt-1">
                  All products in system
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {products.filter((p) => p.isOutOfStock).length}
                </div>
                <div className="text-sm text-red-700">Out of Stock</div>
                <div className="text-xs text-red-600 mt-1">Zero inventory</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {products.filter((p) => p.isLowStock).length}
                </div>
                <div className="text-sm text-orange-700">Low Stock</div>
                <div className="text-xs text-orange-600 mt-1">
                  Below threshold
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    products.filter(
                      (p) => p.stockOrderStatus === "order_placed"
                    ).length
                  }
                </div>
                <div className="text-sm text-blue-700">In Order List</div>
                <div className="text-xs text-blue-600 mt-1">Orders placed</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {
                    products.filter(
                      (p) => p.needsReorder && p.orderStatus.canMoveToOrder
                    ).length
                  }
                </div>
                <div className="text-sm text-green-700">Need Reordering</div>
                <div className="text-xs text-green-600 mt-1">
                  Ready to order
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>📊 Current Status:</strong>{" "}
                {products.filter((p) => p.needsReorder).length} products need
                reordering out of {products.length} total products.{" "}
                {availableForOrderCount} products are ready to be moved to order
                list.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutOfStockList;
