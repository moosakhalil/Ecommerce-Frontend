import React, { useState } from "react";
import {
  Package,
  Users,
  Building,
  Truck,
  User,
  Phone,
  FileText,
  Navigation,
  CheckCircle,
} from "lucide-react";

// Import dashboard components
import OrderOverviewDashboard from "./OrderOverviewDashboard";
import PackingStaffDashboard from "./PackingStaffDashboard";
import DeliveryStorageOfficerDashboard from "./DeliveryStorageOfficerDashboard";
import DispatchOfficer1Dashboard from "./DispatchOfficer1Dashboard";
import DispatchOfficer2Dashboard from "./DispatchOfficer2";
import DriverDashboard from "./DriverDashboard";
import DriverOnDeliveryDashboard from "./Driverondelivery";
import ComplaintManagement from "./ComplainManagement";
import DeliveredOrdersDashboard from "./DeliveredOrdersDashboard";

const DeliveryManagementSystem = () => {
  const [selectedRole, setSelectedRole] = useState("Order Overview");

  const roleButtons = [
    {
      name: "Order Overview",
      icon: Package,
      active: true,
      color: "bg-gray-800 text-white",
    },
    {
      name: "Packing Staff",
      icon: Package,
      active: false,
      color: "bg-gray-100 text-gray-700",
    },
    {
      name: "Delivery Storage Officer",
      icon: Building,
      active: false,
      color: "bg-gray-100 text-gray-700",
    },
    {
      name: "Dispatch Officer 1",
      icon: User,
      active: false,
      color: "bg-gray-100 text-gray-700",
    },
    {
      name: "Dispatch Officer 2",
      icon: User,
      active: false,
      color: "bg-gray-100 text-gray-700",
    },
    {
      name: "Driver",
      icon: Truck,
      active: false,
      color: "bg-gray-100 text-gray-700",
    },
    {
      name: "Driver on Delivery",
      icon: Navigation,
      active: false,
      color: "bg-gray-100 text-gray-700",
    },
    {
      name: "Delivered Orders",
      icon: CheckCircle,
      active: false,
      color: "bg-gray-100 text-gray-700",
    },
  ];

  const secondRowRoles = [
    {
      name: "Complaint Manager on delivery (within 24 hours)",
      icon: Phone,
      active: false,
      color: "bg-gray-100 text-gray-700",
    },
    {
      name: "Complaint Manager after delivery (after 24 hours)",
      icon: FileText,
      active: false,
      color: "bg-gray-100 text-gray-700",
    },
  ];

  const renderDashboardContent = () => {
    switch (selectedRole) {
      case "Order Overview":
        return (
          <OrderOverviewDashboard
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        );
      case "Packing Staff":
        return (
          <PackingStaffDashboard
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        );
      case "Delivery Storage Officer":
        return (
          <DeliveryStorageOfficerDashboard
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        );
      case "Dispatch Officer 1":
        return (
          <DispatchOfficer1Dashboard
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        );
      case "Dispatch Officer 2":
        return (
          <DispatchOfficer2Dashboard
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        );
      case "Driver":
        return (
          <DriverDashboard
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        );
      case "Driver on Delivery":
        return (
          <DriverOnDeliveryDashboard
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        );
      case "Delivered Orders":
        return (
          <DeliveredOrdersDashboard
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        );
      case "Complaint Manager on delivery (within 24 hours)":
        return (
          <ComplaintManagement
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        );
      case "Complaint Manager after delivery (after 24 hours)":
        return (
          <ComplaintManagement
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        );
      default:
        return (
          <OrderOverviewDashboard
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            📦 Delivery Management System
          </h1>
          <p className="text-gray-600">
            Complete workflow management from packing to delivery confirmation
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Select Role
          </h2>
          <div className="space-y-3">
            {/* First Row - Main roles */}
            <div className="flex flex-wrap gap-3">
              {roleButtons.map((role, index) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={index}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      role.name === selectedRole
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedRole(role.name)}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{role.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Second Row - Complaint roles */}
            <div className="flex flex-wrap gap-3">
              {secondRowRoles.map((role, index) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={index}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      role.name === selectedRole
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedRole(role.name)}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{role.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default DeliveryManagementSystem;
