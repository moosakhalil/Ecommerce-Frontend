// ReferralVideos.js
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  X,
  Play,
  Grid,
  List,
  FileVideo,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { useNavigate } from "react-router-dom";

const TABS = [
  { key: "unverified", label: "150.A  Incoming unverified videos" },
  { key: "manager", label: " 150.B  Videos moved to manager" },
  { key: "verified", label: "150.C  Verified videos" },
  { key: "spam", label: "150.D  Videos moved to spam" },
];

// Status mapping for display
const STATUS_MAP = {
  unverified: {
    text: "Pending/unverified",
    classes: "bg-gray-200 text-gray-700",
  },
  manager: {
    text: "Moved to manager",
    classes: "bg-yellow-300 text-yellow-800",
  },
  verified: {
    text: "Verified",
    classes: "bg-green-200 text-green-800",
  },
  spam: {
    text: "Moved to spam",
    classes: "bg-red-200 text-red-800",
  },
};

// Helper function to create video data URL from base64
const createVideoDataURL = (base64Data, mimetype = "video/mp4") => {
  if (!base64Data) return null;

  try {
    // Remove data URL prefix if it exists
    const cleanBase64 = base64Data.replace(/^data:video\/[^;]+;base64,/, "");
    return `data:${mimetype};base64,${cleanBase64}`;
  } catch (error) {
    console.error("Error creating video data URL:", error);
    return null;
  }
};

// Helper function to format file size
const formatFileSize = (sizeInMB) => {
  if (!sizeInMB) return "Unknown size";
  if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
  return `${sizeInMB.toFixed(1)} MB`;
};

export default function ReferralVideos() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("unverified");
  const [menuOpen, setMenuOpen] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const navigate = useNavigate();

  // Fetch videos on component mount and tab change
  useEffect(() => {
    fetchVideos();
  }, [activeTab]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/referral-videos?status=${activeTab}`
      );
      const data = await response.json();

      if (data.success) {
        setVideos(data.videos);
      } else {
        console.error("Failed to fetch videos:", data.message);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update video status
  const updateVideoStatus = async (customerId, videoId, newStatus) => {
    try {
      setUpdating(true);
      const response = await fetch(
        "http://localhost:5000/api/referral-videos/update-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId,
            videoId,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Refresh the videos list
        await fetchVideos();

        // Close detail view if open
        if (selectedVideo) {
          setSelectedVideo(null);
        }

        alert(`Video successfully moved to ${newStatus}`);
      } else {
        alert("Failed to update video status: " + data.message);
      }
    } catch (error) {
      console.error("Error updating video status:", error);
      alert("Error updating video status");
    } finally {
      setUpdating(false);
    }
  };

  // Filter videos based on search
  const filteredVideos = videos.filter(
    (video) =>
      video.imageId.toLowerCase().includes(search.toLowerCase()) ||
      video.customerName.toLowerCase().includes(search.toLowerCase())
  );

  // Handle actions from dropdown menu
  const handleAction = (video, action) => {
    setMenuOpen(null);

    if (action === "view") {
      setSelectedVideo(video);
    } else {
      updateVideoStatus(video.customerId, video.imageId, action);
    }
  };

  // If user is viewing a video detail
  if (selectedVideo && !bulkMode) {
    return (
      <VideoDetailView
        video={selectedVideo}
        onBack={() => setSelectedVideo(null)}
        onStatusUpdate={updateVideoStatus}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        updating={updating}
      />
    );
  }

  // If user is in bulk video management mode
  if (bulkMode) {
    return (
      <BulkVideoManagement
        videos={filteredVideos}
        activeTab={activeTab}
        onBack={() => setBulkMode(false)}
        onStatusUpdate={updateVideoStatus}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        updating={updating}
      />
    );
  }

  const { text: statusText, classes: statusClasses } = STATUS_MAP[activeTab];

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50 p-6`}
      >
        {/* Title */}
        <h1 className="text-2xl font-semibold mb-4">
          150 .Referral Video Management
        </h1>

        {/* Search and Bulk Mode Button */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by Video ID or Customer Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded p-2 pr-10"
            />
            <Search className="absolute right-3 top-1/2 -mt-2 text-gray-400" />
          </div>
          <button
            onClick={() => setBulkMode(true)}
            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center"
          >
            <Grid className="mr-2" size={16} />
            Bulk Management
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg overflow-hidden mb-4 shadow">
          <div className="grid grid-cols-4">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 text-center font-medium ${
                  activeTab === tab.key
                    ? "bg-green-100 text-gray-900 border-b-4 border-green-500"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Loading videos...</p>
          </div>
        )}

        {/* Videos Table */}
        {!loading && (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Video ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    # success Referral
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Amount phone number given (referred)
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Referral Code
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Video created on
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    File Size
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Video status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((video, idx) => (
                    <tr
                      key={video.imageId}
                      className={idx % 2 ? "bg-gray-50" : ""}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center">
                          <FileVideo className="mr-2 text-gray-400" size={16} />
                          {video.imageId}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {video.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600">
                        {video.sharedCount} people
                      </td>
                      <td className="px-6 py-4 text-sm text-purple-600 font-medium">
                        {video.totalContactsReferred || 0} contacts
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {video.referralCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(video.approvalDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatFileSize(video.fileSize)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusClasses}`}
                        >
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 relative">
                        <MoreVertical
                          className="cursor-pointer hover:text-gray-600"
                          onClick={() =>
                            setMenuOpen(menuOpen === idx ? null : idx)
                          }
                        />
                        {menuOpen === idx && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                            <button
                              onClick={() => handleAction(video, "view")}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                              View Video
                            </button>
                            {activeTab !== "verified" && (
                              <button
                                onClick={() => handleAction(video, "verified")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-green-600"
                                disabled={updating}
                              >
                                Mark as Verified
                              </button>
                            )}
                            {activeTab !== "manager" && (
                              <button
                                onClick={() => handleAction(video, "manager")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-yellow-600"
                                disabled={updating}
                              >
                                Move to Manager
                              </button>
                            )}
                            {activeTab !== "spam" && (
                              <button
                                onClick={() => handleAction(video, "spam")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                                disabled={updating}
                              >
                                Move to Spam
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No videos found for "{activeTab}" status
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="p-4 text-right text-sm text-gray-600">
              {filteredVideos.length} out of {videos.length} videos
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Video Player Component with error handling
function VideoPlayer({ video, className = "", ...props }) {
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);

  const videoDataURL = createVideoDataURL(video.base64Data, video.mimetype);

  const handleLoadStart = () => {
    setLoading(true);
    setVideoError(false);
  };

  const handleLoadedData = () => {
    setLoading(false);
  };

  const handleError = (e) => {
    setLoading(false);
    setVideoError(true);
    console.error("Video loading error:", e);
  };

  if (!videoDataURL) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
      >
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-2" />
          <p>Video data not available</p>
        </div>
      </div>
    );
  }

  if (videoError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
      >
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-2" />
          <p>Error loading video</p>
          <p className="text-sm">File size: {formatFileSize(video.fileSize)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p className="text-sm text-gray-600">Loading video...</p>
          </div>
        </div>
      )}
      <video
        {...props}
        key={video.imageId}
        src={videoDataURL}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        onError={handleError}
        preload="metadata"
        className="w-full h-auto"
      />
    </div>
  );
}

// Bulk Video Management Component
function BulkVideoManagement({
  videos,
  activeTab,
  onBack,
  onStatusUpdate,
  sidebarOpen,
  toggleSidebar,
  updating,
}) {
  const [selectedVideo, setSelectedVideo] = useState(videos[0] || null);
  const [processing, setProcessing] = useState(false);

  // Update selected video when videos change
  useEffect(() => {
    if (videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
    }
  }, [videos, selectedVideo]);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedVideo) return;

    if (
      window.confirm(`Are you sure you want to move this video to ${status}?`)
    ) {
      setProcessing(true);
      try {
        await onStatusUpdate(
          selectedVideo.customerId,
          selectedVideo.imageId,
          status
        );
        // Remove the updated video from the list or refresh
        const updatedVideos = videos.filter(
          (v) => v.imageId !== selectedVideo.imageId
        );
        if (updatedVideos.length > 0) {
          setSelectedVideo(updatedVideos[0]);
        } else {
          onBack(); // Go back if no more videos
        }
      } catch (error) {
        console.error("Error updating video:", error);
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50 p-6`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <ChevronLeft size={20} className="mr-2" />
            Back to List View
          </button>
          <h1 className="text-2xl font-semibold">
            Bulk Video Management -{" "}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Video List Sidebar */}
          <div className="col-span-4">
            <div className="bg-white rounded-lg shadow max-h-screen overflow-y-auto">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">
                  Videos ({videos.length})
                </h3>
              </div>
              <div className="divide-y">
                {videos.map((video) => (
                  <div
                    key={video.imageId}
                    onClick={() => handleVideoSelect(video)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedVideo?.imageId === video.imageId
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <FileVideo className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {video.customerName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          ID: {video.imageId}
                        </p>
                        <p className="text-xs text-gray-400">
                          {video.sharedCount} shares •{" "}
                          {formatFileSize(video.fileSize)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {video.totalContactsReferred || 0} referred
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Video Area */}
          <div className="col-span-8">
            {selectedVideo ? (
              <div className="bg-white rounded-lg shadow p-6">
                {/* Video Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      {selectedVideo.customerName}
                    </h2>
                    <p>
                      <strong>Video ID:</strong> {selectedVideo.imageId}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedVideo.customerPhone}
                    </p>
                    <p>
                      <strong>Referral Code:</strong>{" "}
                      {selectedVideo.referralCode}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Shared With:</strong> {selectedVideo.sharedCount}{" "}
                      people
                    </p>
                    <p>
                      <strong>Total Referred:</strong>{" "}
                      {selectedVideo.totalContactsReferred || 0} contacts
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(
                        selectedVideo.approvalDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>File Size:</strong>{" "}
                      {formatFileSize(selectedVideo.fileSize)}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${STATUS_MAP[activeTab].classes}`}
                      >
                        {STATUS_MAP[activeTab].text}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Video Player */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Video Preview</h3>
                  <div
                    className="relative bg-black rounded-lg overflow-hidden"
                    style={{ maxHeight: "400px" }}
                  >
                    <VideoPlayer
                      video={selectedVideo}
                      controls
                      className="w-full"
                      style={{ maxHeight: "400px" }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleStatusUpdate("spam")}
                    disabled={processing || updating}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {processing ? "Processing..." : "Move to Spam"}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("verified")}
                    disabled={processing || updating}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {processing ? "Processing..." : "Mark as Verified"}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("manager")}
                    disabled={processing || updating}
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {processing ? "Processing..." : "Move to Manager"}
                  </button>
                </div>

                {/* Shared With Details */}
                {selectedVideo.sharedWith &&
                  selectedVideo.sharedWith.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-3">
                        Shared With Details
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Contact
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Phone
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Date Shared
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedVideo.sharedWith.map((contact, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {contact.name}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {contact.phoneNumber}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {new Date(
                                    contact.dateShared
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      contact.status === "sent"
                                        ? "bg-green-100 text-green-800"
                                        : contact.status === "failed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {contact.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">No videos available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Video Detail View Component (Original single video view)
function VideoDetailView({
  video,
  onBack,
  onStatusUpdate,
  sidebarOpen,
  toggleSidebar,
  updating,
}) {
  const handleStatusUpdate = (status) => {
    if (
      window.confirm(`Are you sure you want to move this video to ${status}?`)
    ) {
      onStatusUpdate(video.customerId, video.imageId, status);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-80" : ""
        } w-full bg-gray-50 p-6`}
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-gray-700 mb-4 hover:text-gray-900"
        >
          <ChevronLeft size={20} className="mr-2" /> Back to Videos List
        </button>

        {/* Video Information */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-2xl font-semibold mb-4">Video Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p>
                <strong>Video ID:</strong> {video.imageId}
              </p>
              <p>
                <strong>Customer:</strong> {video.customerName}
              </p>
              <p>
                <strong>Phone:</strong> {video.customerPhone}
              </p>
            </div>
            <div>
              <p>
                <strong>Referral Code:</strong> {video.referralCode}
              </p>
              <p>
                <strong>Shared With:</strong> {video.sharedCount} people
              </p>
              <p>
                <strong>Total Referred:</strong>{" "}
                {video.totalContactsReferred || 0} contacts
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(video.approvalDate).toLocaleString()}
              </p>
              <p>
                <strong>File Size:</strong> {formatFileSize(video.fileSize)}
              </p>
            </div>
          </div>

          {/* Video Player */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Referral Video</h3>
            <div
              className="relative bg-black rounded-lg overflow-hidden"
              style={{ maxWidth: "600px" }}
            >
              <VideoPlayer
                video={video}
                controls
                className="w-full"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>

          {/* Shared With Details */}
          {video.sharedWith && video.sharedWith.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Shared With</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Contact
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Date Shared
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {video.sharedWith.map((contact, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {contact.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {contact.phoneNumber}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(contact.dateShared).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              contact.status === "sent"
                                ? "bg-green-100 text-green-800"
                                : contact.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {contact.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Status Legend */}
          <div className="border rounded-lg p-4 max-w-xs mb-6">
            <h4 className="font-medium mb-2">Status Color Codes</h4>
            {Object.entries(STATUS_MAP).map(([key, { text, classes }]) => (
              <div key={key} className="flex items-center mb-1">
                <span
                  className={`w-3 h-3 rounded-full mr-2 ${
                    classes.split(" ")[0]
                  }`}
                ></span>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => handleStatusUpdate("spam")}
              disabled={updating}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
            >
              {updating ? "Updating..." : "Move to Spam"}
            </button>
            <button
              onClick={() => handleStatusUpdate("verified")}
              disabled={updating}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
            >
              {updating ? "Updating..." : "Mark as Verified"}
            </button>
            <button
              onClick={() => handleStatusUpdate("manager")}
              disabled={updating}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded disabled:opacity-50"
            >
              {updating ? "Updating..." : "Move to Manager"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
