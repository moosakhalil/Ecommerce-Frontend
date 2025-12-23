import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLogin from "./componenets/Login/Login";
import Sidebar from "./componenets/Sidebar/sidebar";
import DeliveryManagementDashboard from "./componenets/Delivery&complaints/DeliveryTypes";
import AllOrders from "./componenets/Orders/allOrders";
import AddProduct from "./componenets/Products/addProducts";

import AllEmployees from "./componenets/Employees/allEmployees";
import AddEmployee from "./componenets/Employees/addEmployee";
import EditEmployees from "./componenets/Employees/EditEmployees";
import HomePage from "./componenets/Home/home";
import SupplierProfile from "./componenets/Supplier/AddSupplier";
import { Home } from "lucide-react";
import SuppliersList from "./componenets/Supplier/EditSupplier";
import SupplierViewOnly from "./componenets/Supplier/ViewSuppliers";
import AddProductsToSupplier from "./componenets/Supplier/AddProductsToSupplier";
import ViewProducts from "./componenets/Products/viewProducts";
import AddCategory from "./componenets/Products/addProductCategory";
import OrdersInCart from "./componenets/Orders/ordersIncart";

import TransactionControlView from "./componenets/Transactions/transactioncontrol";
import VerificationView from "./componenets/Transactions/transaction-verification";
import BankAccountView from "./componenets/Transactions/BankAccountview";
import OrderManagementDelivery from "./componenets/Order-management/delivery-orders";
import OrderManagementPickup from "./componenets/Order-management/pickup-orders";
import OrderDetails from "./componenets/Order-management/orderdetails";
import DeliveryMain from "./componenets/Delivery&complaints/Delivery";
import AllDeliveryComplaints from "./componenets/Delivery&complaints/Allcomplaints";
import NonDeliveredOrders from "./componenets/Orders/Non-delivered-orders";
import Driverchat from "./componenets/Order-management/drivers-chat";
import RefundComplain from "./componenets/Orders/Refunds";
import InventoryCheck from "./componenets/Inventory/InverntoryCheck";
import OutOfStockList from "./componenets/Inventory/outofstocklist";
import OrderListApprovedStock from "./componenets/Inventory/orderlist";
import ShowOrder from "./componenets/Inventory/showOrder";
import FillingInventory from "./componenets/Inventory/FillIinventory";
import InventoryControlCheck from "./componenets/Inventory/InventoryControl";
import CreateDiscount from "./componenets/Discounts/createDiscounts";
import AllDiscounts from "./componenets/Discounts/allDiscounts";
import DiscountedProductsInvA from "./componenets/Discounts/DiscountedInventory";
import InventoryControlCheckDiscount from "./componenets/Discounts/Inventorycontrol(discounts)";

import ReferralProfit from "./componenets/Refferal/referralProfits";
import ScooterDelivery from "./componenets/Order-management/ScooterDelivery";
import SalesData from "./componenets/Sales/salesdata";
import EmployeePermission from "./componenets/Admin/EmployeePermission";
import EmployeeRoles from "./componenets/Admin/EmployeeRoles";
import TruckDrivers from "./componenets/Admin/TruckDrivers";
import ReferralData from "./componenets/Refferal/referaldata";
import CalendarComponent from "./componenets/Settings/Calendar";
import CustomerPage from "./componenets/Customers/viewCustomers";
import CustomerDetail from "./componenets/Customers/customerDetails";
import LostStockManagement from "./componenets/Inventory/Loststock";
import CustomerChatView from "./componenets/Customers/viewChat";
import ReferralVideos from "./componenets/Refferal/referralDashboard";
import ForemanReferrals from "./componenets/Refferal/Foremanprofits";
import RolePermissionsManager from "./componenets/Home/RoleManagement";
import ManageUsers from "./componenets/Home/userManagement";
import ReferralVideoSending from "./componenets/Refferal/referraldemovideo";
import ReferralVideoManager from "./componenets/Refferal/referraldemovideo";
import IntroductionVideoManagement159B from "./componenets/Refferal/IntroductionVideos";
import SupportManagement from "./componenets/Support/supportManagemnt";
import AreasManagement from "./componenets/Delivery&complaints/DeliveryAreas";
import DeliveryManagementSystem from "./componenets/DeliverySystem/maindeliverysystem";
import OrderOverviewPage from "./componenets/DeliverySystem/OrderOverviewPage";
import PackingStaffPage from "./componenets/DeliverySystem/PackingStaffPage";
import DeliveryStorageOfficerPage from "./componenets/DeliverySystem/DeliveryStorageOfficerPage";
import DispatchOfficer1Page from "./componenets/DeliverySystem/DispatchOfficer1Page";
import DispatchOfficer2Page from "./componenets/DeliverySystem/DispatchOfficer2Page";
import DriverPage from "./componenets/DeliverySystem/DriverPage";
import DriverOnDeliveryPage from "./componenets/DeliverySystem/DriverOnDeliveryPage";
import DeliveredOrdersPage from "./componenets/DeliverySystem/DeliveredOrdersPage";
import ComplaintWithin24Page from "./componenets/DeliverySystem/ComplaintWithin24Page";
import ComplaintAfter24Page from "./componenets/DeliverySystem/ComplaintAfter24Page";
import VendorManagementDashboard from "./componenets/VendorManagement/VendorManagemet";
import AllOrdersComponent from "./componenets/VendorManagement/ordersDashboard";
import AssignAreasToVendors from "./componenets/VendorManagement/assignAreas";
import VendorPreOrderDashboard from "./componenets/VendorPreorder/vendor-preorder-main";
import AssignPreOrderVendorAreas from "./componenets/VendorPreorder/assignpreordersareas";
import AllpreOrdersComponent from "./componenets/VendorPreorder/allpreorder";
import VideoManagementSystem from "./componenets/VideosManagement/videomanagement";
import ProductManagement from "./componenets/Products/productmanagement";
import ProductListReadOnly from "./componenets/Products/ProductListReadOnly";
import AddVehicle from "./componenets/Vehicles/AddVehicle";
import AddVehicleStep1 from "./componenets/Vehicles/AddVehicleStep1";
import AddVehicleStep2 from "./componenets/Vehicles/AddVehicleStep2";
import SelectVehicle from "./componenets/Vehicles/SelectVehicle";
import ViewVehicles from "./componenets/Vehicles/ViewVehicles";
import EditVehicle from "./componenets/Vehicles/EditVehicle";
import ViewVehicle from "./componenets/Vehicles/ViewVehicle";
import Competitors from "./componenets/Finance/Competitors";
import ProductSalesInfo from "./componenets/Finance/ProductSalesInfo";
import AreaManagementB from "./componenets/Settings/AreaManagementB";
import SupplierOrderList from "./componenets/SupplyStockArrival/SupplierOrderList";
import OrderDetailsPage from "./componenets/SupplyStockArrival/OrderDetailsPage";
import DeliveryFees from "./componenets/DeliveryFees/DeliveryFees";
import FinanceSalesData from "./componenets/Finance/SalesData";
import BillManagement from "./componenets/Finance/BillManagement";

// Product Tracking System - IDs 301-308
import TrackingDashboard from "./componenets/ProductTracking/TrackingDashboard";
import ScanTrack from "./componenets/ProductTracking/ScanTrack";
import AdvancedSearch from "./componenets/ProductTracking/AdvancedSearch";
import BatchManagement from "./componenets/ProductTracking/BatchManagement";
import LocationManagement from "./componenets/ProductTracking/LocationManagement";
import QualityControl from "./componenets/ProductTracking/QualityControl";
import ReportsAnalytics from "./componenets/ProductTracking/ReportsAnalytics";
import TrackingSettings from "./componenets/ProductTracking/TrackingSettings";

function App() {
  return (
    <Router>
      <Routes>
        {/* Hero Section Route */}
        <Route
          path="/"
          element={
            <>
              <AdminLogin />
            </>
          }
        />
        <Route
          path="/all-orders"
          element={
            <>
              <AllOrders />
            </>
          }
        />
        <Route
          path="/videos-management"
          element={
            <>
              <VideoManagementSystem />
            </>
          }
        />
        <Route
          path="/admin/vehicles"
          element={
            <>
              <ViewVehicles />
            </>
          }
        />
        <Route
          path="/admin/vehicles/add"
          element={
            <>
              <AddVehicleStep1 />
            </>
          }
        />
        <Route
          path="/admin/vehicles/select"
          element={
            <>
              <SelectVehicle />
            </>
          }
        />
        <Route
          path="/admin/vehicles/add/details/:id"
          element={
            <>
              <AddVehicleStep2 />
            </>
          }
        />
        <Route
          path="/admin/vehicles/edit/:id"
          element={
            <>
              <EditVehicle />
            </>
          }
        />
        <Route
          path="/admin/vehicles/view/:id"
          element={
            <>
              <ViewVehicle />
            </>
          }
        />
        <Route
          path="/add-product"
          element={
            <>
              <AddProduct />
            </>
          }
        />
        <Route
          path="/add-category"
          element={
            <>
              <AddCategory />
            </>
          }
        />
        <Route
          path="/delivery-orders"
          element={
            <>
              <OrderManagementDelivery />
            </>
          }
        />
        <Route
          path="/pickup-orders"
          element={
            <>
              <OrderManagementPickup />
            </>
          }
        />
        <Route
          path="/admin/Products/edit"
          element={
            <>
              <ProductManagement />
            </>
          }
        />
        <Route
          path="/all-employees"
          element={
            <>
              <AllEmployees />
            </>
          }
        />
        <Route
          path="/lost-stock"
          element={
            <>
              <LostStockManagement />
            </>
          }
        />
        <Route
          path="/customers/:id/chat"
          element={
            <>
              <CustomerChatView />
            </>
          }
        />
        <Route
          path="/admin/supplier/add"
          element={
            <>
              <SupplierProfile />
            </>
          }
        />
        <Route path="/" element={<Navigate to="/transactions" replace />} />
        <Route
          path="/Transactions-control"
          element={<TransactionControlView />}
        />
        <Route path="/verification/:orderId" element={<VerificationView />} />
        <Route path="/bank-view/:orderId" element={<BankAccountView />} />
        <Route
          path="/order-details/:orderId"
          element={
            <>
              <OrderDetails />
            </>
          }
        />
        <Route
          path="/admin/delivery-areas"
          element={
            <>
              <AreasManagement />
            </>
          }
        />
        <Route
          path="/admin/delivery-types"
          element={
            <>
              <DeliveryManagementDashboard />
            </>
          }
        />
        <Route
          path="/admin/employee-permission"
          element={
            <>
              <EmployeePermission />
            </>
          }
        />
        <Route
          path="/admin/employee-roles"
          element={
            <>
              <EmployeeRoles />
            </>
          }
        />
        <Route
          path="/admin/drivers"
          element={
            <>
              <TruckDrivers />
            </>
          }
        />
        <Route
          path="/Delivery"
          element={
            <>
              <DeliveryMain />
            </>
          }
        />
        <Route
          path="/support"
          element={
            <>
              <SupportManagement />
            </>
          }
        />
        <Route
          path="/referrals-data"
          element={
            <>
              <ReferralData />
            </>
          }
        />
        <Route
          path="/referals-foreman"
          element={
            <>
              <ForemanReferrals />
            </>
          }
        />
        <Route
          path="/delivery-system"
          element={
            <>
              <DeliveryManagementSystem />
            </>
          }
        />
        <Route
          path="/delivery/order-overview"
          element={<OrderOverviewPage />}
        />
        <Route
          path="/delivery/packing-staff"
          element={<PackingStaffPage />}
        />
        <Route
          path="/delivery/storage-officer"
          element={<DeliveryStorageOfficerPage />}
        />
        <Route
          path="/delivery/dispatch-officer-1"
          element={<DispatchOfficer1Page />}
        />
        <Route
          path="/delivery/dispatch-officer-2"
          element={<DispatchOfficer2Page />}
        />
        <Route
          path="/delivery/driver"
          element={<DriverPage />}
        />
        <Route
          path="/delivery/driver-on-delivery"
          element={<DriverOnDeliveryPage />}
        />
        <Route
          path="/delivery/delivered-orders"
          element={<DeliveredOrdersPage />}
        />
        <Route
          path="/delivery/complaint-within-24"
          element={<ComplaintWithin24Page />}
        />
        <Route
          path="/delivery/complaint-after-24"
          element={<ComplaintAfter24Page />}
        />
        <Route
          path="/vendor-dashboard"
          element={
            <>
              <VendorManagementDashboard />
            </>
          }
        />
        <Route
          path="/vendor-orders"
          element={
            <>
              <AllOrdersComponent />
            </>
          }
        />
        <Route
          path="/assign-preorder-areas"
          element={
            <>
              <AssignPreOrderVendorAreas />
            </>
          }
        />
        <Route
          path="/assign-vendor-areas"
          element={
            <>
              <AssignAreasToVendors />
            </>
          }
        />
        <Route
          path="/vendor-preorders"
          element={
            <>
              <AllpreOrdersComponent />
            </>
          }
        />
        <Route
          path="/vendor-preorder-dashboard"
          element={
            <>
              <VendorPreOrderDashboard />
            </>
          }
        />

        <Route
          path="/Driver-chat"
          element={
            <>
              <Driverchat />
            </>
          }
        />
        <Route
          path="/view-refunds"
          element={
            <>
              <RefundComplain />
            </>
          }
        />
        <Route
          path="/Complaints"
          element={
            <>
              <AllDeliveryComplaints />
            </>
          }
        />
        <Route
          path="/user-permissions"
          element={
            <>
              <RolePermissionsManager />
            </>
          }
        />
        <Route
          path="/ManageUsers"
          element={
            <>
              <ManageUsers />
            </>
          }
        />
        <Route
          path="/referral-demovideo"
          element={
            <>
              <ReferralVideoManager />
            </>
          }
        />
        <Route
          path="/intro-videos"
          element={
            <>
              <IntroductionVideoManagement159B />
            </>
          }
        />

        <Route
          path="/non-delivered-orders"
          element={
            <>
              <NonDeliveredOrders />
            </>
          }
        />
        <Route
          path="/ordersINcart"
          element={
            <>
              <OrdersInCart />
            </>
          }
        />
        <Route
          path="/inventory-check"
          element={
            <>
              <InventoryCheck />
            </>
          }
        />
        <Route
          path="/out-of-stock"
          element={
            <>
              <OutOfStockList />
            </>
          }
        />
        <Route
          path="/order-list"
          element={
            <>
              <OrderListApprovedStock />
            </>
          }
        />
        <Route
          path="/show-order"
          element={
            <>
              <ShowOrder />
            </>
          }
        />
        <Route
          path="/Fill-inventory"
          element={
            <>
              <FillingInventory />
            </>
          }
        />
        <Route
          path="/inventory-control"
          element={
            <>
              <InventoryControlCheck />
            </>
          }
        />
        <Route
          path="/create-discount"
          element={
            <>
              <CreateDiscount />
            </>
          }
        />
        <Route
          path="/all-discounts"
          element={
            <>
              <AllDiscounts />
            </>
          }
        />
        <Route
          path="/discount-inventory"
          element={
            <>
              <DiscountedProductsInvA />
            </>
          }
        />
        <Route
          path="/discount-inventory-check"
          element={
            <>
              <InventoryControlCheckDiscount />
            </>
          }
        />
        <Route
          path="/referrals"
          element={
            <>
              <ReferralVideos />
            </>
          }
        />
        <Route
          path="/referral-profits"
          element={
            <>
              <ReferralProfit />
            </>
          }
        />
        <Route
          path="/scooter-delivery"
          element={
            <>
              <ScooterDelivery />
            </>
          }
        />
        <Route
          path="/sales-data"
          element={
            <>
              <SalesData />
            </>
          }
        />
        <Route
          path="/calendar"
          element={
            <>
              <CalendarComponent />
            </>
          }
        />
        <Route
          path="/customers"
          element={
            <>
              <CustomerPage />
            </>
          }
        />
        {/* detail view for a given customer ID */}
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route
          path="/add-products-to-supplier"
          element={<AddProductsToSupplier />}
        />
        <Route
          path="admin/supplier/edit"
          element={
            <>
              <SuppliersList />
            </>
          }
        />
        <Route
          path="view-suppliers"
          element={
            <>
              <SupplierViewOnly />
            </>
          }
        />
        <Route
          path="/admin/employee/edit"
          element={
            <>
              <EditEmployees />
            </>
          }
        />
        <Route
          path="/admin/employee/add"
          element={
            <>
              <AddEmployee />
            </>
          }
        />
        <Route
          path="/admin/Products"
          element={
            <>
              <ViewProducts />
            </>
          }
        />
        <Route
          path="/admin/Products/view"
          element={
            <>
              <ProductListReadOnly />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <HomePage />
            </>
          }
        />
        <Route
          path="/competitors"
          element={
            <>
              <Competitors />
            </>
          }
        />
        <Route
          path="/product-sales-info"
          element={
            <>
              <ProductSalesInfo />
            </>
          }
        />
        <Route
          path="/area-management-b"
          element={
            <>
              <AreaManagementB />
            </>
          }
        />
        <Route
          path="/supply-stock-arrival"
          element={
            <>
              <SupplierOrderList />
            </>
          }
        />
        <Route
          path="/supply-stock-arrival/:orderId"
          element={
            <>
              <OrderDetailsPage />
            </>
          }
        />
        <Route
          path="/delivery-fees"
          element={
            <>
              <DeliveryFees />
            </>
          }
        />
        <Route
          path="/finance/sales-data"
          element={
            <>
              <FinanceSalesData />
            </>
          }
        />
        <Route
          path="/finance/bills"
          element={
            <>
              <BillManagement />
            </>
          }
        />

        {/* Product Tracking Routes - IDs 301-308 */}
        <Route path="/tracking/dashboard" element={<TrackingDashboard />} />
        <Route path="/tracking/scan" element={<ScanTrack />} />
        <Route path="/tracking/search" element={<AdvancedSearch />} />
        <Route path="/tracking/batches" element={<BatchManagement />} />
        <Route path="/tracking/locations" element={<LocationManagement />} />
        <Route path="/tracking/quality" element={<QualityControl />} />
        <Route path="/tracking/reports" element={<ReportsAnalytics />} />
        <Route path="/tracking/settings" element={<TrackingSettings />} />
        
      </Routes>

      {/* Footer */}
    </Router>
  );
}

export default App;
