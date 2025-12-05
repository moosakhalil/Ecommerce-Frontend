// src/components/Driverchat.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ChevronDown,
  MoreVertical,
  ArrowRight,
  Check,
  Bell,
  User,
  Package,
  
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

const Driverchat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50`}
      >
        {/* Header */}
        <header className="bg-purple-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center"></div>
          <div className="flex items-center gap-4"></div>
        </header>

        <div className="p-4">
          {/* Title / Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Home className="w-5 h-5 text-gray-600" />
            <h1 className="text-xl font-bold text-gray-800">6. Driver chat</h1>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                day window
              </label>
              <div className="relative">
                <select className="w-full p-2 border border-gray-300 rounded bg-white pr-10 appearance-none">
                  <option>WITHIN 24 HOURS</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 pointer-events-none text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                which driver
              </label>
              <div className="relative">
                <select className="w-full p-2 border border-gray-300 rounded bg-white pr-10 appearance-none">
                  <option></option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 pointer-events-none text-gray-500" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              type of complaint
            </label>
            <div className="relative">
              <select className="w-full p-2 border border-gray-300 rounded bg-white pr-10 appearance-none">
                <option>Cash back</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 pointer-events-none text-gray-500" />
            </div>
          </div>

          {/* Complaint Cards */}
          <div className="space-y-6">
            {/* Complaint 1 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-4 flex">
                <div className="mr-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-700">Driver Id: 12</div>
                      <div className="text-blue-500">Order Id#123434</div>
                    </div>
                    <div className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm">
                      Not resolved yet
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Issue reported on 2 Dec 2025 at 9:00 PM
                  </div>
                  <div className="mt-1 text-gray-800">
                    Customer is returning the parcel
                  </div>

                  {/* Notes Text Box */}
                  <div className="bg-gray-200 h-24 mt-3 p-2 rounded" />

                  {/* View Details */}
                  <div className="text-right mt-2">
                    <button className="text-blue-500 flex items-center justify-end text-sm">
                      View details <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Orders Section */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-2">
                  order on the truck{" "}
                  <span className="italic">
                    (orders after allocation appears here)
                  </span>
                </div>

                <div className="border border-gray-300 rounded">
                  <div className="p-3 border-b border-gray-200">
                    <div className="font-medium text-gray-700">
                      Order 1 of 1234
                    </div>
                    <div className="text-xs text-gray-500">Fully allocated</div>
                  </div>

                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <Package className="w-10 h-10 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-800">
                          Lucky Cement
                        </div>
                        <div className="text-xs text-gray-500">Qty: 1 kg</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MoreVertical className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-orange-100 border border-orange-400 rounded flex items-center justify-center mr-2">
                          <Check className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="font-medium text-gray-700">
                          delivered
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <Package className="w-10 h-10 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-800">
                          Golden screws
                        </div>
                        <div className="text-xs text-gray-500">Qty: 1 bag</div>
                      </div>
                    </div>
                    <div className="text-red-500 font-bold">COMPLAIN</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaint 2 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-4 flex">
                <div className="mr-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-700">Driver Id: 11</div>
                      <div className="text-blue-500">Order Id#123434</div>
                    </div>
                    <div className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm">
                      Not resolved yet
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Issue reported on 2 Dec 2025 at 9:00 PM
                  </div>
                  <div className="mt-1 text-gray-800">
                    Customer is returning the parcel
                  </div>

                  {/* Notes Text Box */}
                  <div className="bg-gray-200 h-24 mt-3 p-2 rounded" />

                  {/* View Details */}
                  <div className="text-right mt-2">
                    <button className="text-blue-500 flex items-center justify-end text-sm">
                      View details <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Orders Section */}
              <div className="p-4 border-t border-gray-200">
                <div className="border border-gray-300 rounded">
                  <div className="p-3 border-b border-gray-200">
                    <div className="font-medium text-gray-700">
                      Order2 of 1234
                    </div>
                    <div className="text-xs text-gray-500">Fully allocated</div>
                  </div>

                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <Package className="w-10 h-10 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-800">
                          Lucky Cement
                        </div>
                        <div className="text-xs text-gray-500">Qty: 1 kg</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MoreVertical className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-orange-100 border border-orange-400 rounded flex items-center justify-center mr-2">
                          <Check className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="font-medium text-gray-700">
                          delivered
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <Package className="w-10 h-10 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-800">
                          Golden screws
                        </div>
                        <div className="text-xs text-gray-500">Qty: 1 bag</div>
                      </div>
                    </div>
                    <div className="text-red-500 font-bold">COMPLAIN</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaint 3 (Resolved) */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-4 flex">
                <div className="mr-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-700">Driver Id: 11</div>
                      <div className="text-blue-500">Order Id#123434</div>
                    </div>
                    <div className="bg-green-100 text-green-600 px-3 py-1 rounded text-sm">
                      resolved
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Issue reported on 2 Dec 2025 at 9:00 PM
                  </div>
                  <div className="mt-1 text-gray-800">
                    Customer is returning the parcel
                  </div>

                  {/* View Details */}
                  <div className="text-right mt-2">
                    <button className="text-blue-500 flex items-center justify-end text-sm">
                      View details <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Delivery Button */}
          <div className="flex justify-center mt-8">
            <button
              className="bg-blue-500 text-white rounded px-6 py-2 hover:bg-blue-600"
              onClick={() => navigate("/Delivery")}
            >
              Back to Delivery
            </button>
            <button
              className="bg-orange-300 text-white rounded px-6 py-2 ml-10"
              onClick={() => navigate("/order-details")}
            >
              Back to order-details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Driverchat;
