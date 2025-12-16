import React from "react";
import Sidebar from "../Sidebar/sidebar";
import { BarChart3 } from "lucide-react";

const ProductSalesInfo = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-purple-700 text-white p-4 rounded-lg mb-6 shadow-md">
            <div className="flex items-center gap-3">
              <BarChart3 size={28} />
              <h1 className="text-2xl font-bold">256. Product Sales Info</h1>
            </div>
          </div>

          {/* Coming Soon Placeholder */}
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <BarChart3 size={80} className="mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Coming Soon</h2>
            <p className="text-gray-500">
              This page will display detailed product sales information and analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSalesInfo;
