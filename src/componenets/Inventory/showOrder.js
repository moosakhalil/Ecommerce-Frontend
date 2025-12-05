// ShowOrder.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Package,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

export default function ShowOrder() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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
        {/* Top Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">35. purchase order</h2>
          <div className="flex items-center gap-4">
            <Bell size={20} className="cursor-pointer" />
            <div className="w-8 h-8 bg-purple-500 rounded-full" />
          </div>
        </div>

        {/* Search + final link */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6">
          <div className="flex items-center w-full md:w-1/3">
            <Search className="absolute ml-3 text-gray-400" />
            <input
              type="text"
              placeholder="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border rounded"
            />
          </div>
          <button
            onClick={() => navigate("/final-and-make-order")}
            className="text-indigo-600 hover:underline text-sm"
          >
            final and make order
          </button>
        </div>

        {/* Supplier Details Card */}
        <div className="bg-white p-6 rounded-lg mb-6 shadow">
          <h3 className="font-medium mb-4">Supplier Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Supplier name</div>
              <div className="font-semibold">Jimmy and Co.</div>
              <div className="py-2 text-sm">
                <div>Order # 1234</div>
                <div>Order date: Jan 2, 2024</div>
                <div>Payment method: online transfer</div>
                <div className="mt-2">
                  <div className="inline font-medium">Warehouse Address:</div>{" "}
                  A987, Street 123 Indonessia
                </div>
                <div className="mt-1 text-sm">
                  bank account: 287381718
                  <br />
                  bank: bri
                </div>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div>Phone: xxxxx-xxxx</div>
              <div>WhatsApp: 00000-0000</div>
              <div>Email: sample@gmail.com</div>
            </div>
          </div>
        </div>

        {/* View Order Details Card */}
        <div className="bg-white p-6 rounded-lg mb-6 shadow">
          <h3 className="font-medium mb-4">View Order Details</h3>
          <div className="space-y-4 mb-6">
            {/* Item Row */}
            {[
              { name: "Lucky Cement", qty: "10 kg", price: "$50" },
              { name: "Golden screws", qty: "1 bag", price: "$50" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Package className="w-10 h-10 text-gray-500" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">Qty: {item.qty}</div>
                  </div>
                </div>
                <div className="text-lg font-semibold">{item.price}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="max-w-sm ml-auto space-y-2 text-sm text-gray-600">
            {[
              ["Sub total", "$100"],
              ["Shipping fees", "$10"],
              ["Tax. fees", "$00"],
              ["Discount", "$00"],
            ].map(([label, value], i) => (
              <div key={i} className="flex justify-between">
                <span>{label}</span>
                <span>{value}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>$110</span>
            </div>
          </div>
        </div>

        {/* Note Section */}
        <div className="bg-white p-6 rounded-lg mb-6 shadow relative">
          <label className="block text-sm font-medium mb-2">Note:</label>
          <textarea
            rows={4}
            className="w-full border-b focus:outline-none resize-none pb-8"
          />
          <Edit2
            className="absolute top-6 right-6 text-gray-500 cursor-pointer"
            size={24}
          />
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>our logo</div>
          <div>our information: chat boot boot company</div>
          <div>our phone number : 9209831919</div>
          <div>our address : aksdlkajslkdjlkjaskldjkajdhjyikajd</div>
          <div>bank account: 287381718</div>
          <div>bank : bri</div>
        </div>
      </div>
    </div>
  );
}
