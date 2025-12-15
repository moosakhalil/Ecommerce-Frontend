import React from "react";
import Sidebar from "../Sidebar/sidebar";
import OrderOverviewDashboard from "./OrderOverviewDashboard";

const OrderOverviewPage = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ml-80">
        <OrderOverviewDashboard />
      </div>
    </div>
  );
};

export default OrderOverviewPage;
