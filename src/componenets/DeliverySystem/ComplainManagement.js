import React, { useState, useEffect } from "react";
import {
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  Upload,
  Plus,
  ChevronLeft,
  AlertTriangle,
  Eye,
  Filter,
  Download,
  Search,
  Calendar,
  User,
  Package,
  FileText,
  Camera,
  Play,
  ExternalLink,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const ComplaintManagement = () => {
  const [view, setView] = useState("list"); // 'list' or 'detail'
  const [activeTab, setActiveTab] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "",
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
  });
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, [filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status !== "all")
        queryParams.append("status", filters.status);
      if (filters.priority) queryParams.append("priority", filters.priority);
      if (filters.dateFrom) queryParams.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) queryParams.append("dateTo", filters.dateTo);

      const response = await fetch(
        `${API_BASE_URL}/api/complaints/management?${queryParams}`
      );
      const data = await response.json();

      if (data.success) {
        let filteredComplaints = data.complaints;

        // Apply search filter on frontend
        if (filters.searchTerm) {
          filteredComplaints = filteredComplaints.filter(
            (complaint) =>
              complaint.orderId
                .toLowerCase()
                .includes(filters.searchTerm.toLowerCase()) ||
              complaint.customerName
                .toLowerCase()
                .includes(filters.searchTerm.toLowerCase()) ||
              complaint.driverInfo?.driverName
                .toLowerCase()
                .includes(filters.searchTerm.toLowerCase())
          );
        }

        setComplaints(filteredComplaints);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/complaints/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleViewDetails = async (complaint) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/complaints/${complaint.complaintId}`
      );
      const data = await response.json();

      if (data.success) {
        setSelectedComplaint(data.complaint);
        setView("detail");
      }
    } catch (error) {
      console.error("Error fetching complaint details:", error);
    }
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedComplaint(null);
  };

  const updateComplaintStatus = async (newStatus, notes = "") => {
    if (!selectedComplaint) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/complaints/${selectedComplaint.complaintId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            staffInfo: {
              staffId: "CM_001",
              staffName: "Complaint Manager",
            },
            notes,
          }),
        }
      );

      if (response.ok) {
        alert(`Complaint status updated to ${newStatus}`);
        fetchComplaints();
        fetchStats();

        // Update current complaint details
        setSelectedComplaint((prev) => ({
          ...prev,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
        }));
      }
    } catch (error) {
      console.error("Error updating complaint status:", error);
      alert("Failed to update status");
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedComplaint) return;

    setAddingNote(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/complaints/${selectedComplaint.complaintId}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            note: newNote,
            staffInfo: {
              staffId: "CM_001",
              staffName: "Complaint Manager",
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedComplaint(data.complaint);
        setNewNote("");
        alert("Note added successfully");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "submitted":
        return <Clock className="h-4 w-4 inline mr-1 text-orange-600" />;
      case "under_review":
        return <Eye className="h-4 w-4 inline mr-1 text-blue-600" />;
      case "in_progress":
        return <MessageSquare className="h-4 w-4 inline mr-1 text-blue-600" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 inline mr-1 text-green-600" />;
      case "closed":
        return <CheckCircle className="h-4 w-4 inline mr-1 text-gray-600" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    if (activeTab === "All") return true;
    return complaint.status === activeTab.toLowerCase().replace(" ", "_");
  });

  if (view === "detail" && selectedComplaint) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Complaint Details
                </h1>
                <p className="text-gray-600">
                  {selectedComplaint.complaintId} • Order:{" "}
                  {selectedComplaint.orderId}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                    selectedComplaint.priority
                  )}`}
                >
                  {selectedComplaint.priority.toUpperCase()}
                </span>
                <span className="flex items-center text-sm text-gray-600">
                  {getStatusIcon(selectedComplaint.status)}
                  {selectedComplaint.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => updateComplaintStatus("under_review")}
              disabled={selectedComplaint.status !== "submitted"}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Eye className="h-4 w-4 mr-2" />
              Start Review
            </button>
            <button
              onClick={() => updateComplaintStatus("in_progress")}
              disabled={
                !["submitted", "under_review"].includes(
                  selectedComplaint.status
                )
              }
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Mark In Progress
            </button>
            <button
              onClick={() => updateComplaintStatus("resolved")}
              disabled={selectedComplaint.status === "resolved"}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Resolved
            </button>
            <button
              onClick={() =>
                window.open(
                  `tel:${selectedComplaint.driverInfo?.driverPhone}`,
                  "_self"
                )
              }
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Driver
            </button>
            <button
              onClick={() =>
                window.open(`tel:${selectedComplaint.customerPhone}`, "_self")
              }
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Customer
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Complaint Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Complaint Overview
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Submitted
                    </h3>
                    <p className="text-gray-900">
                      {new Date(selectedComplaint.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Order Value
                    </h3>
                    <p className="text-gray-900">
                      ${selectedComplaint.orderValue || 0}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Problem Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedComplaint.problemTypes?.map((type, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                      >
                        {type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedComplaint.customerWantsToDo?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Customer Wants To
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {selectedComplaint.customerWantsToDo.map(
                        (action, index) => (
                          <li key={index}>
                            {action
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {selectedComplaint.itemReturn && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Item Return Status
                    </h3>
                    <p className="text-sm text-gray-700">
                      {selectedComplaint.itemReturn
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                  </div>
                )}

                {selectedComplaint.solutionCustomerAskingFor?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Requested Solutions
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {selectedComplaint.solutionCustomerAskingFor.map(
                        (solution, index) => (
                          <li key={index}>
                            {solution
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {selectedComplaint.additionalNotes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Additional Notes
                    </h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedComplaint.additionalNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Media Attachments */}
              {selectedComplaint.mediaAttachments?.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Media Attachments (
                    {selectedComplaint.mediaAttachments.length})
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedComplaint.mediaAttachments.map((media, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-center h-16 bg-gray-50 rounded mb-2">
                          {media.mediaType === "image" ? (
                            <Camera className="h-8 w-8 text-gray-400" />
                          ) : (
                            <Play className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {media.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(media.fileSize / 1024 / 1024).toFixed(1)} MB
                        </p>
                        <button className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manager Notes */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Manager Notes ({selectedComplaint.managerNotes?.length || 0})
                </h2>

                {selectedComplaint.managerNotes?.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {selectedComplaint.managerNotes.map((note, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded border-l-4 border-blue-500"
                      >
                        <p className="text-sm text-gray-700">{note.note}</p>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span>{note.addedBy?.staffName || "Unknown"}</span>
                          <span>{new Date(note.addedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                    <p className="text-gray-500">No notes added yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Add notes to document your investigation
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Add Note
                  </h3>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    rows="3"
                    placeholder="Enter your notes here..."
                  />
                  <button
                    onClick={addNote}
                    disabled={!newNote.trim() || addingNote}
                    className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 text-sm"
                  >
                    {addingNote ? "Adding..." : "Add Note"}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Customer
                    </h4>
                    <p className="text-gray-900">
                      {selectedComplaint.customerName}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {selectedComplaint.customerPhone}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Driver
                    </h4>
                    <p className="text-gray-900">
                      {selectedComplaint.driverInfo?.driverName}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {selectedComplaint.driverInfo?.driverPhone}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {selectedComplaint.driverInfo?.vehicleName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Delivery Information
                </h3>

                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Area</h4>
                    <p className="text-gray-900">
                      {selectedComplaint.deliveryLocation?.area || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Address
                    </h4>
                    <p className="text-gray-900 text-sm">
                      {selectedComplaint.deliveryLocation?.fullAddress || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Workflow Progress */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Workflow Progress
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      status: "submitted",
                      label: "Submitted",
                      desc: "Complaint received",
                    },
                    {
                      status: "under_review",
                      label: "Under Review",
                      desc: "Investigation started",
                    },
                    {
                      status: "in_progress",
                      label: "In Progress",
                      desc: "Working on resolution",
                    },
                    {
                      status: "resolved",
                      label: "Resolved",
                      desc: "Issue completed",
                    },
                  ].map((step, index) => {
                    const isActive = selectedComplaint.status === step.status;
                    const isCompleted =
                      [
                        "under_review",
                        "in_progress",
                        "resolved",
                        "closed",
                      ].indexOf(selectedComplaint.status) >
                      [
                        "submitted",
                        "under_review",
                        "in_progress",
                        "resolved",
                      ].indexOf(step.status);

                    return (
                      <div key={step.status} className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${
                            isActive
                              ? "bg-blue-600"
                              : isCompleted
                              ? "bg-green-600"
                              : "bg-gray-300"
                          }`}
                        />
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              isActive
                                ? "text-blue-600"
                                : isCompleted
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-500">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resolution Details */}
              {selectedComplaint.resolution?.resolutionDetails && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Resolution
                  </h3>
                  <p className="text-sm text-gray-700">
                    {selectedComplaint.resolution.resolutionDetails}
                  </p>
                  {selectedComplaint.resolution.resolvedBy && (
                    <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                      Resolved by{" "}
                      {selectedComplaint.resolution.resolvedBy.staffName} on{" "}
                      {new Date(
                        selectedComplaint.resolution.resolutionDate
                      ).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={handleBackToList}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Complaints
            </button>
            <div className="text-gray-500 text-sm">
              Last updated:{" "}
              {new Date(selectedComplaint.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Complaint Management
          </h1>
          <p className="text-gray-600">
            Manage delivery complaints and customer issues
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.submitted}
            </div>
            <div className="text-sm text-gray-600">Submitted</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.under_review}
            </div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.in_progress}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-600">
              {stats.closed}
            </div>
            <div className="text-sm text-gray-600">Closed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Order ID, Customer, Driver..."
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters({ ...filters, searchTerm: e.target.value })
                  }
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                "All",
                "Submitted",
                "Under Review",
                "In Progress",
                "Resolved",
                "Closed",
              ].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === tab
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No complaints found
              </h3>
              <p className="text-gray-600">
                No complaints match your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complaint ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Problem Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
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
                  {filteredComplaints.map((complaint) => (
                    <tr
                      key={complaint.complaintId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {complaint.complaintId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {complaint.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{complaint.customerName}</div>
                        <div className="text-gray-500">
                          {complaint.customerPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{complaint.driverInfo?.driverName}</div>
                        <div className="text-gray-500">
                          {complaint.driverInfo?.vehicleName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          {complaint.problemTypes
                            ?.slice(0, 2)
                            .map((type, index) => (
                              <div
                                key={index}
                                className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                              >
                                {type.replace(/_/g, " ")}
                              </div>
                            ))}
                          {complaint.problemTypes?.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{complaint.problemTypes.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            complaint.priority
                          )}`}
                        >
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="flex items-center">
                          {getStatusIcon(complaint.status)}
                          {complaint.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(complaint.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleViewDetails(complaint)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintManagement;
