import React, { useState, useRef, useEffect } from "react";

// Icon components
const Upload = () => <span>📁</span>;
const Play = () => <span>▶️</span>;
const Pause = () => <span>⏸️</span>;
const Delete = () => <span>🗑️</span>;
const Edit = () => <span>✏️</span>;
const Save = () => <span>💾</span>;
const Cancel = () => <span>❌</span>;
const Video = () => <span>🎥</span>;
const Target = () => <span>🎯</span>;
const Eye = () => <span>👁️</span>;
const Settings = () => <span>⚙️</span>;
const Plus = () => <span>➕</span>;
const Check = () => <span>✅</span>;

const VideoManagementSystem = () => {
  const [videos, setVideos] = useState([
    {
      id: 1,
      name: "Welcome Tutorial",
      file: null,
      url: "https://www.w3schools.com/html/mov_bbb.mp4", // Sample video
      duration: "2:30",
      size: "15.2 MB",
      uploadDate: "2024-01-15",
      assignedComponents: ["1", "3", "admin-lower"],
      description: "Introduction video for new users",
      thumbnail: null,
      isActive: true,
    },
    {
      id: 2,
      name: "Order Processing Guide",
      file: null,
      url: "https://www.w3schools.com/html/movie.mp4", // Sample video
      duration: "5:45",
      size: "32.1 MB",
      uploadDate: "2024-01-14",
      assignedComponents: ["2", "4"],
      description: "How to process orders efficiently",
      thumbnail: null,
      isActive: true,
    },
  ]);

  const [sidebarComponents] = useState([
    // From your sidebar structure
    {
      id: "1",
      name: "Orders to cart not ordered yet ( everyone )",
      category: "OUR OPERATION",
    },
    {
      id: "2",
      name: "Transaction control... paid / or not",
      category: "OUR OPERATION",
    },
    { id: "3", name: "All Orders ( emp office )", category: "OUR OPERATION" },
    { id: "4", name: "Order management delivery", category: "OUR OPERATION" },
    {
      id: "5",
      name: "Delivery ( driver and office emp )",
      category: "OUR OPERATION",
    },
    {
      id: "6",
      name: "Non-delivered orders or issues",
      category: "OUR OPERATION",
    },
    { id: "7", name: "Refund / complain", category: "OUR OPERATION" },
    { id: "8", name: "History orders", category: "OUR OPERATION" },
    { id: "9", name: "Delivery system", category: "OUR OPERATION" },
    { id: "15", name: "Vendor Dashboard", category: "VENDOR MANAGEMENT" },
    {
      id: "16",
      name: "Vendor outsource Dashboard",
      category: "VENDOR MANAGEMENT",
    },
    { id: "28", name: "Product list everyone", category: "STOCK" },
    { id: "33", name: "Inventory check", category: "STOCK" },
    { id: "35", name: "Out of Stock...order stock", category: "STOCK" },
    { id: "61", name: "Create a new product", category: "STOCK 2" },
    { id: "54", name: "Fill inventory", category: "STOCK 2" },
    { id: "71", name: "Create discount", category: "DISCOUNT" },
    { id: "72", name: "All Discount list", category: "DISCOUNT" },
    { id: "81", name: "Suppliers", category: "SUPPLIER EMP, CUSTOMER" },
    { id: "82", name: "Employees", category: "SUPPLIER EMP, CUSTOMER" },
    { id: "83", name: "Customers", category: "SUPPLIER EMP, CUSTOMER" },
    { id: "101", name: "Finances", category: "FINANCE" },
    { id: "105", name: "Analytics", category: "FINANCE" },
    { id: "admin-lower", name: "Lower Admin", category: "ADMIN" },
    { id: "admin-drivers", name: "Truck Drivers", category: "ADMIN" },
    { id: "admin-employee", name: "Employee Management", category: "ADMIN" },
    { id: "150", name: "Referrals video verification", category: "REFERRAL" },
    { id: "151", name: "Referrals data", category: "REFERRAL" },
  ]);

  const [activeTab, setActiveTab] = useState("videos");
  const [isUploading, setIsUploading] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [componentAssignments, setComponentAssignments] = useState({});
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const fileInputRef = useRef(null);
  const videoRefs = useRef({});

  // Group components by category
  const groupedComponents = sidebarComponents.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {});

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      if (file.type.startsWith("video/")) {
        setIsUploading(true);

        // Create video URL for preview
        const videoUrl = URL.createObjectURL(file);

        // Create new video object
        const newVideo = {
          id: Date.now() + Math.random(),
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          file: file,
          url: videoUrl,
          duration: "Calculating...",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split("T")[0],
          assignedComponents: [],
          description: "",
          thumbnail: null,
          isActive: true,
        };

        // Get video duration
        const video = document.createElement("video");
        video.src = videoUrl;
        video.onloadedmetadata = () => {
          const duration = Math.floor(video.duration);
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          newVideo.duration = `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;

          setVideos((prev) => [...prev, newVideo]);
          setIsUploading(false);
        };
      }
    });

    // Reset file input
    event.target.value = "";
  };

  const deleteVideo = (videoId) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    if (selectedVideo && selectedVideo.id === videoId) {
      setSelectedVideo(null);
    }
  };

  const toggleVideoAssignment = (videoId, componentId) => {
    setVideos((prev) =>
      prev.map((video) => {
        if (video.id === videoId) {
          const assignedComponents = video.assignedComponents.includes(
            componentId
          )
            ? video.assignedComponents.filter((id) => id !== componentId)
            : [...video.assignedComponents, componentId];

          return { ...video, assignedComponents };
        }
        return video;
      })
    );
  };

  const saveVideoEdit = () => {
    if (editingVideo) {
      setVideos((prev) =>
        prev.map((video) =>
          video.id === editingVideo.id ? editingVideo : video
        )
      );
      setEditingVideo(null);
    }
  };

  const playVideo = (videoId) => {
    // Pause all other videos
    Object.values(videoRefs.current).forEach((video) => {
      if (video && !video.paused) {
        video.pause();
      }
    });

    setCurrentlyPlaying(videoId);
    const video = videoRefs.current[videoId];
    if (video) {
      video.play();
    }
  };

  const pauseVideo = (videoId) => {
    setCurrentlyPlaying(null);
    const video = videoRefs.current[videoId];
    if (video) {
      video.pause();
    }
  };

  const getComponentsForVideo = (videoId) => {
    const video = videos.find((v) => v.id === videoId);
    return video
      ? video.assignedComponents
          .map((id) => sidebarComponents.find((comp) => comp.id === id))
          .filter(Boolean)
      : [];
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Video /> Video Management System
              </h1>
              <p className="text-gray-600 mt-2">
                Upload and assign videos to different dashboard components
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Upload /> {isUploading ? "Uploading..." : "Upload Videos"}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("videos")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "videos"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Video /> All Videos ({videos.length})
              </button>
              <button
                onClick={() => setActiveTab("assignments")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "assignments"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Target /> Component Assignments
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "preview"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Eye /> Live Preview
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "videos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Video Preview */}
                <div className="relative bg-black aspect-video">
                  <video
                    ref={(el) => (videoRefs.current[video.id] = el)}
                    src={video.url}
                    className="w-full h-full object-cover"
                    onEnded={() => setCurrentlyPlaying(null)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button
                      onClick={() =>
                        currentlyPlaying === video.id
                          ? pauseVideo(video.id)
                          : playVideo(video.id)
                      }
                      className="bg-white bg-opacity-80 hover:bg-opacity-100 text-black p-3 rounded-full transition-all"
                    >
                      {currentlyPlaying === video.id ? <Pause /> : <Play />}
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  {editingVideo && editingVideo.id === video.id ? (
                    <div className="space-y-3">
                      <input
                        value={editingVideo.name}
                        onChange={(e) =>
                          setEditingVideo({
                            ...editingVideo,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Video name"
                      />
                      <textarea
                        value={editingVideo.description}
                        onChange={(e) =>
                          setEditingVideo({
                            ...editingVideo,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Description"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveVideoEdit}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1"
                        >
                          <Save /> Save
                        </button>
                        <button
                          onClick={() => setEditingVideo(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded flex items-center gap-1"
                        >
                          <Cancel /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg mb-2 truncate">
                        {video.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {video.description || "No description"}
                      </p>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div>Size: {video.size}</div>
                        <div>Uploaded: {video.uploadDate}</div>
                        <div>
                          Assigned to: {video.assignedComponents.length}{" "}
                          components
                        </div>
                      </div>

                      {/* Assigned Components Preview */}
                      {video.assignedComponents.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-1">
                            Assigned to:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {getComponentsForVideo(video.id)
                              .slice(0, 3)
                              .map((comp) => (
                                <span
                                  key={comp.id}
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                >
                                  {comp.name.substring(0, 20)}...
                                </span>
                              ))}
                            {video.assignedComponents.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                +{video.assignedComponents.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setEditingVideo(video)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                        >
                          <Edit /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVideo(video);
                            setShowComponentSelector(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                        >
                          <Target /> Assign
                        </button>
                        <button
                          onClick={() => deleteVideo(video.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                        >
                          <Delete /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {videos.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Video />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No videos uploaded
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload your first video to get started
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Upload Videos
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                Component Video Assignments
              </h2>
              <p className="text-gray-600 mt-1">
                Manage which videos appear on each dashboard component
              </p>
            </div>

            <div className="p-6">
              {Object.entries(groupedComponents).map(
                ([category, components]) => (
                  <div key={category} className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 uppercase">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {components.map((component) => {
                        const assignedVideos = videos.filter((video) =>
                          video.assignedComponents.includes(component.id)
                        );

                        return (
                          <div
                            key={component.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900 truncate">
                                {component.name}
                              </h4>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {assignedVideos.length} videos
                              </span>
                            </div>

                            {assignedVideos.length > 0 ? (
                              <div className="space-y-2">
                                {assignedVideos.map((video) => (
                                  <div
                                    key={video.id}
                                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                  >
                                    <span className="text-sm truncate">
                                      {video.name}
                                    </span>
                                    <button
                                      onClick={() =>
                                        toggleVideoAssignment(
                                          video.id,
                                          component.id
                                        )
                                      }
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Delete />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                No videos assigned
                              </p>
                            )}

                            <button
                              onClick={() => {
                                setComponentAssignments({
                                  componentId: component.id,
                                });
                                setShowComponentSelector(true);
                              }}
                              className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded flex items-center justify-center gap-2"
                            >
                              <Plus /> Assign Video
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-4">
                This shows how videos will appear when users navigate to
                components with assigned videos.
              </p>

              {videos.some((v) => v.assignedComponents.length > 0) ? (
                <div className="space-y-6">
                  {Object.entries(groupedComponents).map(
                    ([category, components]) => {
                      const componentsWithVideos = components.filter((comp) =>
                        videos.some((video) =>
                          video.assignedComponents.includes(comp.id)
                        )
                      );

                      if (componentsWithVideos.length === 0) return null;

                      return (
                        <div key={category}>
                          <h3 className="font-medium text-gray-900 mb-3">
                            {category}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {componentsWithVideos.map((component) => {
                              const assignedVideos = videos.filter((video) =>
                                video.assignedComponents.includes(component.id)
                              );

                              return (
                                <div
                                  key={component.id}
                                  className="border border-gray-200 rounded-lg p-4"
                                >
                                  <h4 className="font-medium mb-2">
                                    {component.name}
                                  </h4>
                                  {assignedVideos.map((video) => (
                                    <div key={video.id} className="mb-3">
                                      <div className="bg-black rounded aspect-video mb-2">
                                        <video
                                          src={video.url}
                                          controls
                                          className="w-full h-full object-cover rounded"
                                        />
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        {video.name}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No video assignments
                  </h3>
                  <p className="text-gray-600">
                    Assign videos to components to see them in preview
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Component Selector Modal */}
        {showComponentSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  {selectedVideo
                    ? `Assign "${selectedVideo.name}"`
                    : "Assign Video to Component"}
                </h3>
                <p className="text-gray-600">
                  Select components where this video should appear
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {selectedVideo ? (
                  Object.entries(groupedComponents).map(
                    ([category, components]) => (
                      <div key={category} className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {components.map((component) => (
                            <label
                              key={component.id}
                              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedVideo.assignedComponents.includes(
                                  component.id
                                )}
                                onChange={() =>
                                  toggleVideoAssignment(
                                    selectedVideo.id,
                                    component.id
                                  )
                                }
                                className="form-checkbox h-4 w-4 text-blue-600"
                              />
                              <span className="text-sm text-gray-900 truncate">
                                {component.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <h4 className="font-medium mb-2">{video.name}</h4>
                        <button
                          onClick={() => {
                            if (componentAssignments.componentId) {
                              toggleVideoAssignment(
                                video.id,
                                componentAssignments.componentId
                              );
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                        >
                          Assign to Component
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowComponentSelector(false);
                    setSelectedVideo(null);
                    setComponentAssignments({});
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default VideoManagementSystem;
