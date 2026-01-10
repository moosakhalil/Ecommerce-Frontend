// ReferralVideos.js
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  X,
  Play,
  Grid,
  List,
  FileVideo,
  AlertCircle,
  Eye,
  Sparkles,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../utils/config";

const TABS = [
  { key: "unverified", label: "150.A  Incoming unverified videos" },
  { key: "manager", label: " 150.B  Videos moved to manager" },
  { key: "verified", label: "150.C  Verified videos" },
  { key: "not_passed", label: "150.D  Videos moved to video not passed" },
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
  not_passed: {
    text: "Not Passed",
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

// Helper function to get relative time (e.g., "2 days ago", "3 hours ago")
const getRelativeTime = (dateString) => {
  if (!dateString) return { date: "Unknown", time: "", isRecent: false };
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  // If within 23 hours - show ONLY hours/minutes in larger text (no date, no time)
  if (diffHours < 24) {
    let recentText = "";
    if (diffHours >= 1) {
      recentText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes >= 1) {
      recentText = `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      recentText = "Just now";
    }
    return { date: recentText, time: "", isRecent: true };
  }

  // 24+ hours - show exact date on top, time received on bottom
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  
  // Show the actual time received (e.g., 1:35 PM)
  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  return { date: dateStr, time: timeStr, isRecent: false };
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
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, video: null });
  const navigate = useNavigate();

  // Fetch videos on component mount and tab change
  useEffect(() => {
    fetchVideos();
  }, [activeTab]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/referral-videos?status=${activeTab}`
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
  const updateVideoStatus = async (customerId, videoId, newStatus, rejectionReason = null, note = null) => {
    try {
      setUpdating(true);
      const response = await fetch(
        `${API_BASE_URL}/api/referral-videos/update-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId,
            videoId,
            status: newStatus,
            ...(newStatus === "not_passed" && { rejectionReason, note }),
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

        // Close rejection modal if open
        setRejectionModal({ isOpen: false, video: null });

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
    } else if (action === "not_passed") {
      // Open rejection modal for "Video Not Passed"
      setRejectionModal({ isOpen: true, video });
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
                    View
                  </th>
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
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title="View Video"
                        >
                          <Eye className="text-blue-600 hover:text-blue-700" size={20} />
                        </button>
                      </td>
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
                            {activeTab !== "not_passed" && (
                              <button
                                onClick={() => handleAction(video, "not_passed")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                                disabled={updating}
                              >
                                Move to Video Not Passed
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
                      colSpan="10"
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

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <RejectionModal
          video={rejectionModal.video}
          onClose={() => setRejectionModal({ isOpen: false, video: null })}
          onSubmit={(reason, note) => {
            updateVideoStatus(
              rejectionModal.video.customerId,
              rejectionModal.video.imageId,
              "not_passed",
              reason,
              note
            );
          }}
          updating={updating}
        />
      )}
    </div>
  );
}

// Rejection Modal Component
function RejectionModal({ video, onClose, onSubmit, updating }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const REJECTION_REASONS = [
    { value: "vulgar", label: "Vulgar" },
    { value: "error", label: "Error" },
    { value: "spam", label: "Spam Content" },
    { value: "not_good_enough", label: "Not Good Enough" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) {
      alert("Please select a reason");
      return;
    }
    onSubmit(reason, note);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Video Not Passed
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Please select a reason for marking this video as not passed.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a reason...</option>
              {REJECTION_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={updating || !reason}
            >
              {updating ? "Processing..." : "Confirm"}
            </button>
          </div>
        </form>
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
  videos: initialVideos,
  activeTab,
  onBack,
  onStatusUpdate,
  sidebarOpen,
  toggleSidebar,
  updating,
}) {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false });
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'pending', 'manager', 'verified', 'not_passed'
  const videoListRef = useRef(null);

  // Filter videos based on selected tab
  const filteredVideos = filterTab === 'all' 
    ? allVideos 
    : filterTab === 'pending'
      ? allVideos.filter(v => v.status === 'unverified' || !v.status)
      : allVideos.filter(v => v.status === filterTab);

  // Scroll functions for video list navigation
  const scrollUp = () => {
    if (videoListRef.current) {
      videoListRef.current.scrollBy({ top: -200, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (videoListRef.current) {
      videoListRef.current.scrollBy({ top: 200, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    if (videoListRef.current) {
      videoListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (videoListRef.current) {
      videoListRef.current.scrollTo({ top: videoListRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  // Scroll to newest video (most recently added based on approvalDate)
  const scrollToNewest = () => {
    if (allVideos.length === 0) return;
    
    // Find the newest video
    const newestVideo = allVideos.reduce((newest, video) => {
      const newestDate = new Date(newest.approvalDate || 0);
      const videoDate = new Date(video.approvalDate || 0);
      return videoDate > newestDate ? video : newest;
    }, allVideos[0]);
    
    // Select it and scroll to top (newest should be first if sorted by date)
    setSelectedVideo(newestVideo);
    scrollToTop();
  };

  // Fetch ALL videos from all statuses on mount
  useEffect(() => {
    fetchAllVideos();
  }, []);

  const fetchAllVideos = async () => {
    try {
      setLoading(true);
      const statuses = ["unverified", "manager", "verified", "not_passed"];
      const allFetched = [];

      for (const status of statuses) {
        const response = await fetch(
          `${API_BASE_URL}/api/referral-videos?status=${status}`
        );
        const data = await response.json();
        if (data.success && data.videos) {
          allFetched.push(...data.videos);
        }
      }

      setAllVideos(allFetched);
      if (allFetched.length > 0 && !selectedVideo) {
        setSelectedVideo(allFetched[0]);
      }
    } catch (error) {
      console.error("Error fetching all videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const handleStatusUpdate = async (status, rejectionReason = null, note = null) => {
    if (!selectedVideo) return;

    if (
      window.confirm(`Are you sure you want to move this video to ${status}?`)
    ) {
      setProcessing(true);
      try {
        await onStatusUpdate(
          selectedVideo.customerId,
          selectedVideo.imageId,
          status,
          rejectionReason,
          note
        );
        // Close rejection modal
        setRejectionModal({ isOpen: false });
        // Refresh videos list to show updated status
        await fetchAllVideos();
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
            Bulk Video Management - All Videos
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Video List Sidebar */}
          <div className="col-span-4">
            <div className="bg-white rounded-lg shadow flex flex-col" style={{ maxHeight: 'calc(100vh - 150px)' }}>
              {/* Header */}
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg mb-3">
                  {filterTab === 'all' ? 'All Videos' : 
                   filterTab === 'pending' ? 'Pending Videos' :
                   filterTab === 'manager' ? 'Manager Videos' :
                   filterTab === 'verified' ? 'Verified Videos' :
                   'Not Passed Videos'} ({filteredVideos.length})
                </h3>
                {/* Filter Tabs */}
                <div className="flex gap-1 text-xs flex-wrap">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`px-3 py-1.5 rounded-full transition-colors ${
                      filterTab === 'all' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    All ({allVideos.length})
                  </button>
                  <button
                    onClick={() => setFilterTab('pending')}
                    className={`px-3 py-1.5 rounded-full transition-colors ${
                      filterTab === 'pending' 
                        ? 'bg-gray-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Pending ({allVideos.filter(v => v.status === 'unverified' || !v.status).length})
                  </button>
                  <button
                    onClick={() => setFilterTab('manager')}
                    className={`px-3 py-1.5 rounded-full transition-colors ${
                      filterTab === 'manager' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    Manager ({allVideos.filter(v => v.status === 'manager').length})
                  </button>
                  <button
                    onClick={() => setFilterTab('verified')}
                    className={`px-3 py-1.5 rounded-full transition-colors ${
                      filterTab === 'verified' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    Verified ({allVideos.filter(v => v.status === 'verified').length})
                  </button>
                  <button
                    onClick={() => setFilterTab('not_passed')}
                    className={`px-3 py-1.5 rounded-full transition-colors ${
                      filterTab === 'not_passed' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    Not Passed ({allVideos.filter(v => v.status === 'not_passed').length})
                  </button>
                </div>
              </div>
              {/* Scrollable video list */}
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading all videos...</p>
                </div>
              ) : (
              <>
                {/* Navigation Row with Newest Button and Scroll Up */}
                <div className="flex border-b">
                  <button
                    onClick={scrollToNewest}
                    className="flex-1 py-3 bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 transition-colors border-r"
                    title="Jump to Newest Video"
                  >
                    <Sparkles size={20} />
                    <span className="text-sm font-medium">Newest</span>
                  </button>
                  <button
                    onClick={scrollUp}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    title="Scroll Up"
                  >
                    <ChevronUp size={32} />
                  </button>
                </div>
                
                {/* Video List */}
                <div ref={videoListRef} className="divide-y overflow-y-auto flex-1">
                  {filteredVideos.map((video) => {
                    // Get background color based on video status
                    const getStatusBgColor = (status) => {
                      switch (status) {
                        case "not_passed":
                          return "bg-red-50 border-l-4 border-red-500";
                        case "manager":
                          return "bg-orange-50 border-l-4 border-orange-500";
                        case "verified":
                          return "bg-green-50 border-l-4 border-green-500";
                        default:
                          return ""; // unverified - no special color
                      }
                    };

                    return (
                      <div
                        key={video.imageId}
                        onClick={() => handleVideoSelect(video)}
                        className={`p-4 cursor-pointer hover:bg-gray-100 ${getStatusBgColor(video.status)} ${
                          selectedVideo?.imageId === video.imageId
                            ? "ring-2 ring-blue-500 ring-inset"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Date/Time on left */}
                          <div className="flex-shrink-0 w-20 text-center">
                            {(() => {
                              const relTime = getRelativeTime(video.approvalDate);
                              if (relTime.isRecent) {
                                // Within 23 hours - show only relative time in larger text
                                return (
                                  <p className="text-sm font-semibold text-gray-700">{relTime.date}</p>
                                );
                              } else {
                                // 24+ hours - show date on top, time received on bottom
                                return (
                                  <>
                                    <p className="text-xs font-medium text-gray-600">{relTime.date}</p>
                                    <p className="text-xs text-gray-400">{relTime.time}</p>
                                  </>
                                );
                              }
                            })()}
                          </div>
                          {/* Video icon */}
                          <div className="flex-shrink-0">
                            <FileVideo className={`h-8 w-8 ${
                              video.status === "not_passed" ? "text-red-400" :
                              video.status === "manager" ? "text-orange-400" :
                              video.status === "verified" ? "text-green-400" :
                              "text-gray-400"
                            }`} />
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
                            {/* Status badge */}
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                              video.status === "not_passed" ? "bg-red-200 text-red-800" :
                              video.status === "manager" ? "bg-orange-200 text-orange-800" :
                              video.status === "verified" ? "bg-green-200 text-green-800" :
                              "bg-gray-200 text-gray-700"
                            }`}>
                              {video.status === "not_passed" ? "Not Passed" :
                               video.status === "manager" ? "Manager" :
                               video.status === "verified" ? "Verified" :
                               "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Large Scroll Down Button */}
                <button
                  onClick={scrollDown}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors border-t"
                  title="Scroll Down"
                >
                  <ChevronDown size={32} />
                </button>
              </>
              )}
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
                    onClick={() => setRejectionModal({ isOpen: true })}
                    disabled={processing || updating}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {processing ? "Processing..." : "Move to Video Not Passed"}
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

      {/* Rejection Modal */}
      {rejectionModal.isOpen && selectedVideo && (
        <RejectionModal
          video={selectedVideo}
          onClose={() => setRejectionModal({ isOpen: false })}
          onSubmit={(reason, note) => {
            handleStatusUpdate("not_passed", reason, note);
          }}
          updating={processing || updating}
        />
      )}
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
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false });

  const handleStatusUpdate = (status, rejectionReason = null, note = null) => {
    if (
      window.confirm(`Are you sure you want to move this video to ${status}?`)
    ) {
      onStatusUpdate(video.customerId, video.imageId, status, rejectionReason, note);
      // Close rejection modal if open
      setRejectionModal({ isOpen: false });
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
              onClick={() => setRejectionModal({ isOpen: true })}
              disabled={updating}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
            >
              {updating ? "Updating..." : "Move to Video Not Passed"}
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

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <RejectionModal
          video={video}
          onClose={() => setRejectionModal({ isOpen: false })}
          onSubmit={(reason, note) => {
            handleStatusUpdate("not_passed", reason, note);
          }}
          updating={updating}
        />
      )}
    </div>
  );
}
