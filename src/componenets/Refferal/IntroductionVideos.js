import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Upload,
  Trash2,
  Check,
  X,
  Loader2,
  Play,
  Star,
  Calendar,
  Clock,
  Save,
  MessageSquare,
  Eye,
  EyeOff,
  Video,
  FileText,
  Users,
  PlayCircle,
  Award,
  CheckCircle,
  UserCheck,
  Edit3,
  Heart,
  Handshake,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";

const IntroductionVideoManagement159B = () => {
  const [videos, setVideos] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Modal states
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [tempTitle, setTempTitle] = useState("");
  const [editingTextBox, setEditingTextBox] = useState(null);

  // Form states
  const [activationForm, setActivationForm] = useState({
    startDate: "",
    endDate: "",
    isIndefinite: true,
  });

  const [textBoxForm, setTextBoxForm] = useState({
    content: "",
    isActive: false,
  });

  const API_BASE =
    `${API_BASE_URL}/api/videos/introduction`;

  // State for lazy-loaded video URLs - videos are loaded on-demand when user clicks play
  const [videoUrls, setVideoUrls] = useState({});
  const [loadingVideoId, setLoadingVideoId] = useState(null);

  // Fetch videos (metadata only - no base64 data for fast loading)
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(API_BASE);
        setVideos(response.data);
      } catch (err) {
        setError("Failed to load introduction videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();

    // Auto-refresh every 30 seconds to check for expired videos
    const interval = setInterval(fetchVideos, 30000);
    return () => clearInterval(interval);
  }, []);

  // Lazy load video data when user wants to play
  const loadVideoData = async (videoId) => {
    if (videoUrls[videoId]) return; // Already loaded
    
    try {
      setLoadingVideoId(videoId);
      const response = await axios.get(`${API_BASE_URL}/api/videos/data/${videoId}`);
      const { base64Data, mimetype } = response.data;
      
      if (base64Data && mimetype) {
        setVideoUrls(prev => ({
          ...prev,
          [videoId]: `data:${mimetype};base64,${base64Data}`
        }));
      }
    } catch (err) {
      console.error("Failed to load video data:", err);
      setError("Failed to load video");
    } finally {
      setLoadingVideoId(null);
    }
  };

  // Get video URL - returns cached URL or null if not loaded
  const getVideoUrl = (videoId) => {
    return videoUrls[videoId] || null;
  };

  // Start editing title
  const startEditingTitle = (video) => {
    setEditingTitle(video._id);
    setTempTitle(video.title);
  };

  // Save title to database
  const saveTitle = async (videoId) => {
    try {
      await axios.patch(`${API_BASE}/${videoId}`, { title: tempTitle });
      setVideos(
        videos.map((v) => (v._id === videoId ? { ...v, title: tempTitle } : v))
      );
      setEditingTitle(null);
      setSuccess("Title updated!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update title");
    }
  };

  // Cancel title editing
  const cancelTitleEdit = () => {
    setEditingTitle(null);
    setTempTitle("");
  };

  // Handle file upload
  const handleUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", file.name);

      const response = await axios.post(API_BASE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setVideos([...videos, response.data]);
      setSuccess("Introduction video uploaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleUpload(file);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  // Open activation modal
  const openActivateModal = (video) => {
    setSelectedVideo(video);
    setActivationForm({
      startDate: video.activeSchedule?.startDate
        ? new Date(video.activeSchedule.startDate).toISOString().slice(0, 16)
        : "",
      endDate: video.activeSchedule?.endDate
        ? new Date(video.activeSchedule.endDate).toISOString().slice(0, 16)
        : "",
      isIndefinite: video.activeSchedule?.isIndefinite ?? true,
    });
    setShowActivateModal(true);
  };

  // Activate video with schedule
  const activateVideo = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/${selectedVideo._id}/activate`,
        {
          startDate: activationForm.startDate || null,
          endDate: activationForm.isIndefinite ? null : activationForm.endDate,
          isIndefinite: activationForm.isIndefinite,
        }
      );

      setVideos(
        videos.map((v) => ({
          ...v,
          isActive: v._id === selectedVideo._id,
          activeSchedule:
            v._id === selectedVideo._id
              ? response.data.activeSchedule
              : v.activeSchedule,
          isCurrentlyActive:
            v._id === selectedVideo._id
              ? response.data.isCurrentlyActive
              : false,
        }))
      );

      setSuccess("Introduction video activated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setShowActivateModal(false);
    } catch (err) {
      setError("Failed to activate video");
    }
  };

  // Deactivate video
  const deactivateVideo = async (id) => {
    try {
      await axios.patch(`${API_BASE}/${id}/deactivate`);
      setVideos(
        videos.map((v) => ({
          ...v,
          isActive: v._id === id ? false : v.isActive,
          isCurrentlyActive: v._id === id ? false : v.isCurrentlyActive,
        }))
      );
      setSuccess("Introduction video deactivated!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to deactivate video");
    }
  };

  // Start editing text box
  const startEditingTextBox = (video) => {
    setEditingTextBox(video._id);
    setTextBoxForm({
      content: video.textBox?.content || "",
      isActive: video.textBox?.isActive || false,
    });
  };

  // Handle text box form changes
  const handleTextBoxChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setTextBoxForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // If checkbox is toggled, automatically save
    if (type === "checkbox" && name === "isActive") {
      const updatedForm = {
        ...textBoxForm,
        [name]: newValue,
      };

      try {
        await axios.patch(`${API_BASE}/${editingTextBox}/textbox`, updatedForm);
        setVideos(
          videos.map((v) =>
            v._id === editingTextBox
              ? {
                  ...v,
                  textBox: {
                    content: updatedForm.content,
                    isActive: updatedForm.isActive,
                  },
                }
              : v
          )
        );
        setSuccess(
          newValue
            ? "Message activated! This will be sent with the video to new clients."
            : "Message deactivated! Video will be sent without caption."
        );
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError("Failed to save message");
        // Revert checkbox if save failed
        setTextBoxForm((prev) => ({
          ...prev,
          [name]: !newValue,
        }));
      }
    }
  };

  // Save text box message
  const saveTextBox = async (id) => {
    try {
      await axios.patch(`${API_BASE}/${id}/textbox`, textBoxForm);
      setVideos(
        videos.map((v) =>
          v._id === id
            ? {
                ...v,
                textBox: {
                  content: textBoxForm.content,
                  isActive: textBoxForm.isActive,
                },
              }
            : v
        )
      );
      setEditingTextBox(null);
      setSuccess(
        "Message saved! This will be sent with the video to new clients."
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to save message");
    }
  };

  // Delete video
  const deleteVideo = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this introduction video?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/${id}`);
      setVideos(videos.filter((v) => v._id !== id));
      setSuccess("Introduction video deleted!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete video");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
          <p className="mt-4 text-slate-700 text-lg">
            Loading introduction videos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex min-h-screen w-full">
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-6 lg:ml-8" : "ml-0"
          }`}
        >
          <div className="min-h-screen ml-80">
            <div className="container mx-auto px-6 lg:px-8 py-8 max-w-7xl">
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20 mb-6">
                  <UserCheck className="h-8 w-8 text-purple-600" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    159B
                  </span>
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-4">
                  Introduction Video Management
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  This is for the person who have been referred
                </p>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Who we are & who refered you
                </p>
              </div>

              {/* Upload Section */}
              <div className="mb-12">
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    dragOver
                      ? "border-purple-400 bg-purple-50/80 backdrop-blur-sm scale-105"
                      : "border-slate-300 hover:border-purple-400 hover:bg-white/50 backdrop-blur-sm bg-white/30"
                  } shadow-lg`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                    />

                    <div className="space-y-6">
                      {uploading ? (
                        <>
                          <Loader2 className="h-16 w-16 animate-spin mx-auto text-purple-600" />
                          <div>
                            <p className="text-2xl font-semibold text-slate-700">
                              Uploading...
                            </p>
                            <p className="text-slate-500 text-lg">
                              Please wait while your introduction video is being
                              uploaded
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="h-16 w-16 mx-auto text-purple-500" />
                          <div>
                            <p className="text-2xl font-semibold text-slate-700">
                              Drop your introduction video here or click to
                              browse
                            </p>
                            <p className="text-slate-500 text-lg">
                              Supports all video formats • Max 15MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Video Count & Stats */}
              {videos.length > 0 && (
                <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex flex-wrap gap-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-100 rounded-xl">
                        <Video className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <span className="text-sm text-slate-500 block">
                          Total Videos
                        </span>
                        <p className="text-2xl font-bold text-slate-800">
                          {videos.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm text-slate-500 block">
                          Active
                        </span>
                        <p className="text-2xl font-bold text-green-600">
                          {videos.filter((v) => v.isCurrentlyActive).length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-sm text-slate-500 block">
                          Scheduled
                        </span>
                        <p className="text-2xl font-bold text-purple-600">
                          {
                            videos.filter(
                              (v) => v.isActive && !v.isCurrentlyActive
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Grid */}
              {videos.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {videos.map((video) => (
                    <div
                      key={video._id}
                      className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                        video.isCurrentlyActive
                          ? "ring-2 ring-green-500 shadow-2xl bg-gradient-to-br from-green-50 to-white"
                          : video.isActive
                          ? "ring-2 ring-purple-500 shadow-2xl bg-gradient-to-br from-purple-50 to-white"
                          : "border-white/20 hover:border-purple-200"
                      }`}
                    >
                      {/* Status Badge */}
                      <div className="absolute -top-3 -right-3 z-10">
                        {video.isCurrentlyActive ? (
                          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                            <Star className="h-4 w-4" />
                            Live
                          </div>
                        ) : video.isActive ? (
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                            <Clock className="h-4 w-4" />
                            Scheduled
                          </div>
                        ) : null}
                      </div>

                      {/* Video Player - Lazy Loading */}
                      <div className="relative aspect-video bg-slate-100 rounded-t-2xl overflow-hidden">
                        {getVideoUrl(video._id) ? (
                          <video
                            controls
                            className="w-full h-full object-cover"
                            preload="metadata"
                            autoPlay
                          >
                            <source
                              src={getVideoUrl(video._id)}
                              type={video.mimetype}
                            />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div 
                            className="flex items-center justify-center h-full cursor-pointer hover:bg-slate-200 transition-colors"
                            onClick={() => loadVideoData(video._id)}
                          >
                            <div className="text-center">
                              {loadingVideoId === video._id ? (
                                <>
                                  <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-purple-500" />
                                  <span className="text-lg text-slate-600">Loading video...</span>
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="h-16 w-16 mx-auto mb-3 text-purple-500 hover:text-purple-600 transition-colors" />
                                  <span className="text-lg text-slate-600">Click to play</span>
                                  <p className="text-sm text-slate-400 mt-1">{video.filename}</p>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Title Section - Editable */}
                        <div className="mb-4">
                          {editingTitle === video._id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-lg font-bold focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter video title..."
                                autoFocus
                              />
                              <button
                                onClick={() => saveTitle(video._id)}
                                className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-all duration-200"
                                title="Save title"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelTitleEdit}
                                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <h3
                                className="text-xl font-bold text-slate-800 truncate"
                                title={video.title}
                              >
                                {video.title || "Untitled Video"}
                              </h3>
                              <button
                                onClick={() => startEditingTitle(video)}
                                className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded-lg transition-all duration-200"
                                title="Edit title"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                          {/* Filename - Non-editable */}
                          <div className="mt-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                            <span className="font-medium">File:</span>{" "}
                            {video.filename}
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="flex items-center justify-between text-sm text-slate-500 mb-4 bg-slate-50 rounded-lg px-3 py-2">
                          <span className="font-medium">
                            {formatFileSize(video.fileSize)}
                          </span>
                          <span>{formatDateTime(video.uploadDate)}</span>
                        </div>

                        {/* Schedule Info */}
                        {video.isActive && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-purple-600" />
                              <span className="font-semibold text-purple-800">
                                Schedule
                              </span>
                            </div>
                            <div className="text-sm text-slate-700 space-y-1">
                              <div>
                                Start:{" "}
                                {formatDateTime(
                                  video.activeSchedule?.startDate
                                )}
                              </div>
                              <div>
                                End:{" "}
                                {video.activeSchedule?.isIndefinite
                                  ? "Indefinite"
                                  : formatDateTime(
                                      video.activeSchedule?.endDate
                                    )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Text Box Section */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <MessageSquare className="h-5 w-5 text-purple-600" />
                              Welcome Message
                              {video.textBox?.isActive && (
                                <Eye className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <button
                              onClick={() => startEditingTextBox(video)}
                              className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded-lg transition-all duration-200"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          </div>

                          {editingTextBox === video._id ? (
                            <div className="space-y-3">
                              <textarea
                                name="content"
                                value={textBoxForm.content}
                                onChange={handleTextBoxChange}
                                placeholder="Enter welcome message to be sent with this video to new clients..."
                                className="w-full text-sm border border-slate-200 rounded-xl p-4 resize-none h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              <div className="flex items-center justify-between">
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={textBoxForm.isActive}
                                    onChange={handleTextBoxChange}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                  />
                                  <span className="font-medium text-slate-700">
                                    Include welcome message
                                  </span>
                                </label>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveTextBox(video._id)}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm hover:from-green-600 hover:to-green-700 flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                                  >
                                    <Save className="h-4 w-4" />
                                    Save Message
                                  </button>
                                  <button
                                    onClick={() => setEditingTextBox(null)}
                                    className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-600 transition-all duration-200"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 min-h-[3rem] border border-slate-200">
                              {video.textBox?.content ||
                                "No welcome message set - video will be sent without caption"}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          {video.isActive ? (
                            <button
                              onClick={() => deactivateVideo(video._id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <X className="h-4 w-4" />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => openActivateModal(video)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <Check className="h-4 w-4" />
                              Activate
                            </button>
                          )}

                          <button
                            onClick={() => deleteVideo(video._id)}
                            className="px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 border border-red-200 hover:border-red-300"
                            title="Delete video"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <Upload className="h-12 w-12 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                    No introduction videos uploaded
                  </h3>
                  <p className="text-slate-500 text-lg">
                    Upload your first introduction video to welcome new referred
                    clients
                  </p>
                </div>
              )}

              {/* Activation Modal */}
              {showActivateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
                    <h3 className="text-2xl font-semibold mb-6 text-slate-800">
                      Schedule Video Activation
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Start Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={activationForm.startDate}
                          onChange={(e) =>
                            setActivationForm({
                              ...activationForm,
                              startDate: e.target.value,
                            })
                          }
                          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={activationForm.isIndefinite}
                          onChange={(e) =>
                            setActivationForm({
                              ...activationForm,
                              isIndefinite: e.target.checked,
                            })
                          }
                          id="indefinite"
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <label
                          htmlFor="indefinite"
                          className="text-sm font-semibold text-slate-700 cursor-pointer"
                        >
                          Run indefinitely
                        </label>
                      </div>

                      {!activationForm.isIndefinite && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            End Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={activationForm.endDate}
                            onChange={(e) =>
                              setActivationForm({
                                ...activationForm,
                                endDate: e.target.value,
                              })
                            }
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={activateVideo}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Activate Video
                      </button>
                      <button
                        onClick={() => setShowActivateModal(false)}
                        className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 font-semibold transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {error && (
                <div className="fixed bottom-6 right-6 max-w-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-2 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <X className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-600 p-1 hover:bg-red-100 rounded-lg transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {success && (
                <div className="fixed bottom-6 right-6 max-w-sm bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-2 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Success</p>
                      <p className="text-sm">{success}</p>
                    </div>
                    <button
                      onClick={() => setSuccess(null)}
                      className="text-green-400 hover:text-green-600 p-1 hover:bg-green-100 rounded-lg transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionVideoManagement159B;
