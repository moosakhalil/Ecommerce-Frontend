// COMPLETE FIXED imports and component structure for SupportManagement.js

// FIXED IMPORTS - Replace your import statement with this:
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  MoreVertical,
  Phone,
  MessageSquare,
  Eye,
  Download,
  PlayCircle,
  Image as ImageIcon,
  Mic,
  FileText,
  Calendar,
  Clock,
  User,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  RefreshCw, // FIXED: Changed from 'Refresh' to 'RefreshCw'
  PhoneCall,
  Video,
  Camera,
  Headphones,
  Star,
  TrendingUp,
  Users,
  Ticket,
  MessageCircle,
  Activity,
  MapPin,
  Edit,
  Save,
  X,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import axios from "axios";

const SupportManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [loading, setLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState("");

  // Data states
  const [supportData, setSupportData] = useState({
    tickets: [],
    complaints: [],
    paymentIssues: [],
    addressChanges: [],
    faqInteractions: [],
    supportMedia: [],
    overview: {
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
      avgResolutionTime: "0h",
      customerSatisfaction: 4.5,
    },
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/support/dashboard"
      );
      setSupportData(response.data);
    } catch (error) {
      console.error("Error fetching support data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/support/tickets/${ticketId}/status`,
        {
          status: newStatus,
        }
      );
      fetchSupportData(); // Refresh data
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handlePriorityUpdate = async (ticketId, newPriority) => {
    try {
      await axios.put(
        `http://localhost:5000/api/support/tickets/${ticketId}/priority`,
        {
          priority: newPriority,
        }
      );
      fetchSupportData(); // Refresh data
    } catch (error) {
      console.error("Error updating ticket priority:", error);
    }
  };

  const handleCallCustomer = (phoneNumber) => {
    // Open WhatsApp with the customer's number
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDownloadMedia = async (mediaId, filename) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/support/media/${mediaId}/download`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || "media_file");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading media:", error);
    }
  };

  const handleAddressUpdate = async (
    orderId,
    customerId,
    currentAddress,
    newAddress
  ) => {
    try {
      await axios.put(
        `http://localhost:5000/api/support/address-changes/${orderId}/update`,
        {
          customerId: customerId,
          newAddress: newAddress,
          currentAddress: currentAddress,
        }
      );

      setEditingAddress(null);
      setNewAddress("");
      fetchSupportData(); // Refresh data

      alert("Address updated successfully!");
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Failed to update address. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "escalated":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getMediaIcon = (mediaType) => {
    switch (mediaType) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "image":
        return <Camera className="w-4 h-4" />;
      case "voice":
        return <Headphones className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // UPDATED: Format delivery address with proper locationDetails access
  const formatDeliveryAddress = (ticket) => {
    // Priority: contextData.locationDetails > deliveryLocation > deliveryAddress.fullAddress
    const address =
      ticket.customerLocationDetails ||
      ticket.deliveryLocation ||
      ticket.deliveryAddress?.fullAddress ||
      ticket.deliveryData?.currentAddress ||
      "Address not specified";

    return address.length > 50 ? address.substring(0, 50) + "..." : address;
  };

  const filteredTickets = supportData.tickets.filter((ticket) => {
    const matchesSearch =
      ticket.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || ticket.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // FIXED: Properly structure the renderPaymentIssues function
  const renderPaymentIssues = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Issues
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  International
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supportData.paymentIssues.map((issue) => (
                <tr key={issue.issueId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{issue.issueId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {issue.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {issue.payerName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {issue.orderId || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {issue.issueType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {issue.isInternationalTransfer ? (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        International
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Domestic
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        issue.status
                      )}`}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {issue.paymentScreenshot && (
                        <button
                          onClick={() =>
                            handleDownloadMedia(
                              issue.paymentScreenshot.mediaId,
                              "payment_screenshot"
                            )
                          }
                          className="text-blue-600 hover:text-blue-900"
                          title="View Screenshot"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleCallCustomer(issue.customerPhone)}
                        className="text-green-600 hover:text-green-900"
                        title="Call Customer"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // FIXED: Properly structure the renderComplaints function
  const renderComplaints = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Customer Complaints
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Related
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Media
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supportData.complaints.map((complaint) => (
                <tr key={complaint.complaintId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{complaint.complaintId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {complaint.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {complaint.customerPhone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {complaint.isOrderRelated
                        ? `Order #${complaint.orderId}`
                        : "General"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-700">
                          {complaint.customerLocationDetails ||
                            complaint.deliveryLocation ||
                            "Address not specified"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {complaint.mediaAttachments?.map((media, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            handleDownloadMedia(media.mediaId, media.filename)
                          }
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title={`Download ${media.mediaType}`}
                        >
                          {getMediaIcon(media.mediaType)}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        complaint.status
                      )}`}
                    >
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(complaint.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleCallCustomer(complaint.customerPhone)
                      }
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Call Customer"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </button>
                    <button
                      className="text-purple-600 hover:text-purple-900"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Continue with the rest of your component...
  // (renderOverview, renderTickets, renderAddressChanges, renderAnalytics, renderTicketDetails, return statement)

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {supportData.overview.totalTickets}
              </p>
            </div>
            <Ticket className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-red-600">
                {supportData.overview.openTickets}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {supportData.overview.resolvedTickets}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Resolution
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {supportData.overview.avgResolutionTime}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction</p>
              <p className="text-2xl font-bold text-yellow-600">
                {supportData.overview.customerSatisfaction}/5
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Support Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {supportData.tickets.slice(0, 5).map((ticket, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    New {ticket.type} ticket #{ticket.ticketId}
                  </p>
                  <p className="text-sm text-gray-500">
                    From {ticket.customerName} •{" "}
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    📍 {formatDeliveryAddress(ticket)}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Add the rest of your render functions here (renderTickets, renderAddressChanges, renderAnalytics, renderTicketDetails)
  // Make sure the header uses RefreshCw instead of Refresh:

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50`}
      >
        <header className="bg-purple-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <h1 className="text-xl font-semibold">Support Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Last Updated: {new Date().toLocaleTimeString()}
            </span>
            <button
              onClick={fetchSupportData}
              className="p-2 bg-purple-800 rounded-lg hover:bg-purple-700"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />{" "}
              {/* FIXED: Changed from Refresh to RefreshCw */}
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <nav className="flex space-x-8 px-4">
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "tickets", label: "Support Tickets", icon: Ticket },
              { id: "complaints", label: "Complaints", icon: MessageSquare },
              { id: "payments", label: "Payment Issues", icon: Mail },
              { id: "addresses", label: "Address Changes", icon: MapPin },
              { id: "analytics", label: "Analytics", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              {activeTab === "overview" && renderOverview()}
              {activeTab === "tickets" && <div>Tickets content here...</div>}
              {activeTab === "complaints" && renderComplaints()}
              {activeTab === "payments" && renderPaymentIssues()}
              {activeTab === "addresses" && (
                <div>Addresses content here...</div>
              )}
              {activeTab === "analytics" && (
                <div>Analytics content here...</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportManagement;
