import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

export default function OrdersInCart() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
      status: "cart-not-paid",
      page: currentPage,
      limit: itemsPerPage,
    });
    if (searchQuery) params.set("search", searchQuery);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    fetch(`http://localhost:5000/api/orders?${params}`)
      .then((res) => res.json())
      .then(({ orders = [], total = 0 }) => {
        setOrders(orders);
        setTotal(total);
      })
      .catch(console.error);
  }, [searchQuery, currentPage, itemsPerPage, startDate, endDate]);

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="flex min-h-screen">
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
        <header className="bg-gray-700 text-white p-4">
          <h1 className="text-xl">1. Orders in Cart (not paid yet)</h1>
        </header>

        {/* Search + Date Range */}
        <div className="flex flex-wrap justify-between items-center my-6 space-y-2 md:space-y-0">
          {/* Order ID Search */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search by order id"
              className="w-full pl-3 pr-10 py-2 border rounded-md"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
          </div>

          {/* Date Range Pickers */}
          <div className="flex space-x-2">
            <input
              type="date"
              className="pl-3 pr-3 py-2 border rounded-md"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
            <input
              type="date"
              className="pl-3 pr-3 py-2 border rounded-md"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500 text-sm">
                <th className="py-3 px-4">ORDER ID</th>
                <th className="py-3 px-4">CREATED</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">TOTAL</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <React.Fragment key={o.orderId}>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{o.orderId}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(o.created).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">{o.customer}</td>
                    <td className="py-4 px-4 font-medium">{o.totalAmount}</td>
                    <td className="py-4 px-4">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm inline-flex items-center">
                        In the cart not paid yet
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        className="p-2 border rounded-md"
                        onClick={() =>
                          setExpandedOrder(
                            expandedOrder === o.orderId ? null : o.orderId
                          )
                        }
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>

                  {expandedOrder === o.orderId && (
                    <tr>
                      <td colSpan="6" className="px-4 py-4 bg-gray-50">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500">
                              <th className="py-2 px-4">#</th>
                              <th className="py-2 px-4">Product</th>
                              <th className="py-2 px-4">Qty</th>
                              <th className="py-2 px-4">Unit Price</th>
                              <th className="py-2 px-4">Line Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items.map((it, i) => (
                              <tr key={i} className="border-t">
                                <td className="py-2 px-4">{i + 1}</td>
                                <td>{it.productName}</td>
                                <td>{it.quantity}</td>
                                <td>{it.price}</td>
                                <td>{it.totalPrice}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 text-gray-600 text-sm">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1}–{" "}
            {Math.min(currentPage * itemsPerPage, total)} of {total}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-md"
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border rounded-md"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
