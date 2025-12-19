import React, { useState, useEffect, useRef } from "react";
import {
  Package,
  Truck,
  Phone,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Camera,
  Video,
  Upload,
  X,
  Star,
  AlertCircle,
} from "lucide-react";
import Sidebar from '../Sidebar/sidebar';
import { API_BASE_URL } from '../../utils/config';


const DriverOnDeliveryDashboard = ({ selectedRole, setSelectedRole }) => {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [deliveryStep, setDeliveryStep] = useState("list"); // list, details, media-upload, confirmation
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completed: 0,
    inProgress: 0,
    todayDeliveries: 0,
  });

  // Media files
  const [deliveryVideo, setDeliveryVideo] = useState(null);
  const [complaintVideo, setComplaintVideo] = useState(null);
  const [entrancePhoto, setEntrancePhoto] = useState(null);
  const [receiptInHandPhoto, setReceiptInHandPhoto] = useState(null);
  const [receiptCloseUpPhoto, setReceiptCloseUpPhoto] = useState(null);
  const [receiptNextToFacePhoto, setReceiptNextToFacePhoto] = useState(null);

  // Media previews
  const [deliveryVideoPreview, setDeliveryVideoPreview] = useState(null);
  const [complaintVideoPreview, setComplaintVideoPreview] = useState(null);
  const [entrancePhotoPreview, setEntrancePhotoPreview] = useState(null);
  const [receiptInHandPreview, setReceiptInHandPreview] = useState(null);
  const [receiptCloseUpPreview, setReceiptCloseUpPreview] = useState(null);
  const [receiptNextToFacePreview, setReceiptNextToFacePreview] =
    useState(null);

  // Upload status tracking
  const [uploadStatus, setUploadStatus] = useState({
    deliveryVideo: false,
    complaintVideo: false,
    entrancePhoto: false,
    receiptInHand: false,
    receiptCloseUp: false,
    receiptNextToFace: false,
  });

  // Complaint flag
  const [hasCustomerComplaints, setHasCustomerComplaints] = useState(false);
  const [complaintDescription, setComplaintDescription] = useState("");

  // Final confirmation
  const [customerConfirmed, setCustomerConfirmed] = useState(false);
  const [customerSatisfaction, setCustomerSatisfaction] = useState(5);
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingItem, setUploadingItem] = useState("");

  useEffect(() => {
    fetchActiveDeliveries();
    fetchStats();
    const interval = setInterval(() => {
      fetchActiveDeliveries();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveDeliveries = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/driver-on-delivery/active-deliveries`
      );
      const data = await response.json();
      setActiveDeliveries(data);
    } catch (error) {
      console.error("Error fetching active deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/driver-on-delivery/stats`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleMarkArrived = async () => {
    if (!currentDelivery) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/driver-on-delivery/mark-arrived/${currentDelivery.orderId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driverId: "DR_001",
            driverName: "Driver",
            location: {
              address: currentDelivery.deliveryAddress?.fullAddress || "",
            },
          }),
        }
      );

      if (response.ok) {
        alert("✅ Marked as arrived");
        setDeliveryStep("media-upload");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error marking as arrived:", error);
      alert("Failed to mark as arrived");
    }
  };

  // File selection handlers
  const handleFileSelect = (file, type, setFile, setPreview) => {
    if (!file) return;

    const maxSize = type === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(
        `File size must be less than ${type === "video" ? "50MB" : "10MB"}`
      );
      return;
    }

    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload functions
  const uploadDeliveryVideo = async () => {
    if (!deliveryVideo) {
      alert("Please select a video first");
      return;
    }

    setIsUploading(true);
    setUploadingItem("Delivery Video");

    try {
      const formData = new FormData();
      formData.append("deliveryVideo", deliveryVideo);
      formData.append("driverId", "DR_001");
      formData.append("driverName", "Driver");

      const response = await fetch(
        `${API_BASE_URL}/api/driver-on-delivery/upload-delivery-video/${currentDelivery.orderId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setUploadStatus((prev) => ({ ...prev, deliveryVideo: true }));
        alert("✅ Delivery video uploaded successfully!");
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error uploading delivery video:", error);
      alert("Failed to upload delivery video");
    } finally {
      setIsUploading(false);
      setUploadingItem("");
    }
  };

  const uploadComplaintVideo = async () => {
    if (!complaintVideo) {
      alert("Please select a video first");
      return;
    }

    setIsUploading(true);
    setUploadingItem("Complaint Video");

    try {
      const formData = new FormData();
      formData.append("complaintVideo", complaintVideo);
      formData.append("driverId", "DR_001");
      formData.append("driverName", "Driver");
      formData.append(
        "complaintDetails",
        JSON.stringify({ description: complaintDescription })
      );

      const response = await fetch(
        `${API_BASE_URL}/api/driver-on-delivery/upload-complaint-video/${currentDelivery.orderId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setUploadStatus((prev) => ({ ...prev, complaintVideo: true }));
        alert("✅ Complaint video uploaded successfully!");
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error uploading complaint video:", error);
      alert("Failed to upload complaint video");
    } finally {
      setIsUploading(false);
      setUploadingItem("");
    }
  };

  const uploadEntrancePhoto = async () => {
    if (!entrancePhoto) {
      alert("Please select a photo first");
      return;
    }

    setIsUploading(true);
    setUploadingItem("Entrance Photo");

    try {
      const formData = new FormData();
      formData.append("entrancePhoto", entrancePhoto);
      formData.append("driverId", "DR_001");
      formData.append("driverName", "Driver");

      const response = await fetch(
        `${API_BASE_URL}/api/driver-on-delivery/upload-entrance-photo/${currentDelivery.orderId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setUploadStatus((prev) => ({ ...prev, entrancePhoto: true }));
        alert("✅ Entrance photo uploaded successfully!");
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error uploading entrance photo:", error);
      alert("Failed to upload entrance photo");
    } finally {
      setIsUploading(false);
      setUploadingItem("");
    }
  };

  const uploadReceiptInHand = async () => {
    if (!receiptInHandPhoto) {
      alert("Please select a photo first");
      return;
    }

    setIsUploading(true);
    setUploadingItem("Receipt in Hand Photo");

    try {
      const formData = new FormData();
      formData.append("receiptInHandPhoto", receiptInHandPhoto);
      formData.append("driverId", "DR_001");
      formData.append("driverName", "Driver");

      const response = await fetch(
        `${API_BASE_URL}/api/driver-on-delivery/upload-receipt-in-hand/${currentDelivery.orderId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setUploadStatus((prev) => ({ ...prev, receiptInHand: true }));
        alert("✅ Receipt in hand photo uploaded successfully!");
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error uploading receipt in hand photo:", error);
      alert("Failed to upload receipt in hand photo");
    } finally {
      setIsUploading(false);
      setUploadingItem("");
    }
  };

  const uploadReceiptCloseUp = async () => {
    if (!receiptCloseUpPhoto) {
      alert("Please select a photo first");
      return;
    }

    setIsUploading(true);
    setUploadingItem("Receipt Close-Up Photo");

    try {
      const formData = new FormData();
      formData.append("receiptCloseUpPhoto", receiptCloseUpPhoto);
      formData.append("driverId", "DR_001");
      formData.append("driverName", "Driver");

      const response = await fetch(
        `${API_BASE_URL}/api/driver-on-delivery/upload-receipt-closeup/${currentDelivery.orderId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setUploadStatus((prev) => ({ ...prev, receiptCloseUp: true }));
        alert("✅ Receipt close-up photo uploaded successfully!");
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error uploading receipt close-up photo:", error);
      alert("Failed to upload receipt close-up photo");
    } finally {
      setIsUploading(false);
      setUploadingItem("");
    }
  };

  const uploadReceiptNextToFace = async () => {
    if (!receiptNextToFacePhoto) {
      alert("Please select a photo first");
      return;
    }

    setIsUploading(true);
    setUploadingItem("Receipt Next to Face Photo");

    try {
      const formData = new FormData();
      formData.append("receiptNextToFacePhoto", receiptNextToFacePhoto);
      formData.append("driverId", "DR_001");
      formData.append("driverName", "Driver");

      const response = await fetch(
        `${API_BASE_URL}/api/driver-on-delivery/upload-receipt-next-to-face/${currentDelivery.orderId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setUploadStatus((prev) => ({ ...prev, receiptNextToFace: true }));
        alert("✅ Receipt next to face photo uploaded successfully!");
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error uploading receipt next to face photo:", error);
      alert("Failed to upload receipt next to face photo");
    } finally {
      setIsUploading(false);
      setUploadingItem("");
    }
  };

  const markHasComplaints = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/driver-on-delivery/mark-has-complaints/${currentDelivery.orderId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hasComplaints: hasCustomerComplaints,
            complaintDescription: complaintDescription,
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Complaint status updated");
      }
    } catch (error) {
      console.error("Error marking complaints:", error);
    }
  };

  const allRequiredMediaUploaded = () => {
    const basicChecks =
      uploadStatus.deliveryVideo &&
      uploadStatus.entrancePhoto &&
      uploadStatus.receiptInHand &&
      uploadStatus.receiptCloseUp &&
      uploadStatus.receiptNextToFace;

    if (hasCustomerComplaints) {
      return basicChecks && uploadStatus.complaintVideo;
    }

    return basicChecks;
  };

  const handleCompleteDelivery = async () => {
    if (!allRequiredMediaUploaded()) {
      alert("❌ All required media must be uploaded first!");
      return;
    }

    if (!customerConfirmed) {
      alert("❌ Customer must confirm receipt of delivery!");
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/driver-on-delivery/complete-delivery/${currentDelivery.orderId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driverId: "DR_001",
            driverName: "Driver",
            customerConfirmed: true,
            deliveryNotes: deliveryNotes,
            customerSatisfaction: customerSatisfaction,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          `🎉 DELIVERY COMPLETED!\n\nOrder: ${currentDelivery.orderId}\nStatus: ${result.newStatus}`
        );

        resetDeliveryState();
        setDeliveryStep("list");
        fetchActiveDeliveries();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`❌ ${error.error}\n\n${error.details || ""}`);
      }
    } catch (error) {
      console.error("Error completing delivery:", error);
      alert("Failed to complete delivery");
    } finally {
      setIsUploading(false);
    }
  };

  const resetDeliveryState = () => {
    setCurrentDelivery(null);
    setDeliveryVideo(null);
    setComplaintVideo(null);
    setEntrancePhoto(null);
    setReceiptInHandPhoto(null);
    setReceiptCloseUpPhoto(null);
    setReceiptNextToFacePhoto(null);
    setDeliveryVideoPreview(null);
    setComplaintVideoPreview(null);
    setEntrancePhotoPreview(null);
    setReceiptInHandPreview(null);
    setReceiptCloseUpPreview(null);
    setReceiptNextToFacePreview(null);
    setUploadStatus({
      deliveryVideo: false,
      complaintVideo: false,
      entrancePhoto: false,
      receiptInHand: false,
      receiptCloseUp: false,
      receiptNextToFace: false,
    });
    setHasCustomerComplaints(false);
    setComplaintDescription("");
    setCustomerConfirmed(false);
    setCustomerSatisfaction(5);
    setDeliveryNotes("");
  };

  const goBack = () => {
    if (deliveryStep === "confirmation") {
      setDeliveryStep("media-upload");
    } else if (deliveryStep === "media-upload") {
      setDeliveryStep("details");
    } else if (deliveryStep === "details") {
      setCurrentDelivery(null);
      setDeliveryStep("list");
    }
  };

  // Media Upload Card Component
  const MediaUploadCard = ({
    title,
    type,
    instructions,
    file,
    preview,
    uploaded,
    onFileSelect,
    onUpload,
    mandatory,
  }) => (
    <div
      className={`border-2 rounded-lg p-6 transition-all ${
        uploaded ? "border-green-300 bg-green-50" : "border-gray-300 bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h4 className="font-bold text-gray-900">{title}</h4>
          {mandatory && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
              MANDATORY
            </span>
          )}
        </div>
        {uploaded && <CheckCircle className="h-6 w-6 text-green-600" />}
      </div>

      {instructions && (
        <ul className="text-sm text-gray-700 mb-4 space-y-1">
          {instructions.map((inst, i) => (
            <li key={i} className="flex items-start">
              <span className="mr-2">✓</span>
              <span>{inst}</span>
            </li>
          ))}
        </ul>
      )}

      {!preview ? (
        <label className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold cursor-pointer hover:bg-blue-700 transition text-center">
          {type === "video" ? "📹" : "📸"} Choose{" "}
          {type === "video" ? "Video" : "Photo"}
          <input
            type="file"
            accept={type === "video" ? "video/*" : "image/*"}
            onChange={(e) => onFileSelect(e.target.files[0])}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-3">
          {type === "video" ? (
            <video
              src={preview}
              controls
              className="w-full max-h-64 rounded-lg border-2 border-gray-300"
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded-lg border-2 border-gray-300"
            />
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => {
                onFileSelect(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
            >
              Change
            </button>
            <button
              onClick={onUpload}
              disabled={isUploading || uploaded}
              className={`flex-1 px-4 py-2 text-white rounded-lg font-bold transition flex items-center justify-center ${
                uploaded
                  ? "bg-green-600 cursor-not-allowed"
                  : isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {uploaded ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Uploaded
                </>
              ) : isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Driver on Delivery Dashboard
          </h2>
          <p className="text-gray-600">Fetching your active deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚗 Driver on Delivery
          </h1>
          <p className="text-gray-600">
            Complete deliveries with photo and video verification
          </p>
        </div>

        {/* Delivery List View */}
        {deliveryStep === "list" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {stats.totalDeliveries}
                </div>
                <div className="text-sm text-gray-600">Total Today</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.completed}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.inProgress}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {stats.todayDeliveries}
                </div>
                <div className="text-sm text-gray-600">Assigned Today</div>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-8 w-8 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-red-900 mb-3">
                    🔒 STOP! READ THIS CAREFULLY BEFORE STARTING
                  </h3>
                  <p className="text-red-800 mb-4 font-semibold">
                    Your delivery will NOT be approved and you will NOT get paid
                    unless you upload ALL required photos and videos CORRECTLY.
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-red-900 mb-2">
                      📋 WHAT YOU MUST UPLOAD:
                    </h4>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li className="flex items-start">
                        <span className="font-bold mr-2">1.</span>
                        <span>
                          <strong>DELIVERY VIDEO</strong> - Show yourself,
                          customer, all items, and customer saying "order
                          received"
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">2.</span>
                        <span>
                          <strong>COMPLAINT VIDEO</strong> - ONLY if customer
                          has problems (make separate video showing the
                          problems)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">3.</span>
                        <span>
                          <strong>ENTRANCE PHOTO</strong> - Photo of the
                          delivery location entrance
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">4.</span>
                        <span>
                          <strong>RECEIPT IN HAND</strong> - Customer holding
                          receipt with their face visible
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">5.</span>
                        <span>
                          <strong>RECEIPT CLOSE-UP</strong> - Clear photo of
                          receipt alone (all text readable)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">6.</span>
                        <span>
                          <strong>RECEIPT NEXT TO FACE</strong> - Receipt next
                          to customer's face (final proof)
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-yellow-100 border border-yellow-400 rounded p-3">
                    <p className="text-sm text-yellow-900 font-semibold">
                      ⚠️ IMPORTANT: Read the detailed instructions for EACH
                      upload below. Follow them EXACTLY or your delivery will be
                      REJECTED.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deliveries List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Active Deliveries ({activeDeliveries.length})
                </h2>
              </div>

              {activeDeliveries.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Active Deliveries
                  </h3>
                  <p className="text-gray-600">
                    All your deliveries have been completed. Great work! 🎉
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {activeDeliveries.map((delivery, index) => (
                    <div
                      key={index}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setCurrentDelivery(delivery);
                        setDeliveryStep("details");
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {delivery.orderId}
                          </h3>
                          <p className="text-gray-600">
                            {delivery.customerName}
                          </p>
                        </div>
                        <div>
                          {delivery.isArrived ? (
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                              ✓ Arrived
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                              En Route
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {delivery.deliveryAddress?.area}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {delivery.customerPhone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="h-4 w-4 mr-2" />
                          {delivery.totalItems} items
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {new Date(delivery.deliveryDate).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Delivery Details View */}
        {deliveryStep === "details" && currentDelivery && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={goBack}
              className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deliveries
            </button>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {currentDelivery.orderId}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Customer
                  </h3>
                  <p className="text-lg font-medium text-gray-900">
                    {currentDelivery.customerName}
                  </p>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Phone className="h-4 w-4 mr-2" />
                    {currentDelivery.customerPhone}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Delivery Address
                  </h3>
                  <p className="text-lg font-medium text-gray-900">
                    {currentDelivery.deliveryAddress?.area}
                  </p>
                  <p className="text-gray-600 flex items-start mt-1">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{currentDelivery.deliveryAddress?.fullAddress}</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Items ({currentDelivery.totalItems})
                </h3>
                <div className="space-y-2">
                  {currentDelivery.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-gray-900">{item.productName}</span>
                      <span className="text-gray-600">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!currentDelivery.isArrived ? (
              <button
                onClick={handleMarkArrived}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Mark as Arrived
              </button>
            ) : (
              <button
                onClick={() => setDeliveryStep("media-upload")}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center"
              >
                <Camera className="h-5 w-5 mr-2" />
                Continue to Media Upload
              </button>
            )}
          </div>
        )}

        {/* Media Upload View */}
        {deliveryStep === "media-upload" && currentDelivery && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={goBack}
              className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Details
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📸 Upload Required Media - {currentDelivery.orderId}
            </h2>

            {/* Helpful Tips Section */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                <AlertCircle className="h-6 w-6 mr-2" />
                💡 HELPFUL TIPS - READ THIS FIRST
              </h3>
              <div className="space-y-3 text-sm text-blue-900">
                <div className="bg-white rounded p-3">
                  <p className="font-semibold mb-1">📱 Phone Settings:</p>
                  <p>
                    • Make sure your phone has enough battery and storage space
                  </p>
                  <p>• Turn on your phone's flashlight if it's dark</p>
                  <p>• Clean your camera lens before taking photos/videos</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="font-semibold mb-1">🎬 Video Tips:</p>
                  <p>• Hold your phone HORIZONTAL (sideways) for videos</p>
                  <p>• Speak LOUDLY and CLEARLY - we must hear everything</p>
                  <p>
                    • Don't rush - take your time to show everything properly
                  </p>
                  <p>
                    • Keep recording - DON'T stop until you've shown everything
                  </p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="font-semibold mb-1">📸 Photo Tips:</p>
                  <p>• Hold phone steady - no shaking or blurry photos</p>
                  <p>• Get close enough but not too close</p>
                  <p>• Make sure there's good light - use flash if needed</p>
                  <p>
                    • Check each photo BEFORE uploading - can you see everything
                    clearly?
                  </p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="font-semibold mb-1">✅ Before Uploading:</p>
                  <p>• Review each photo/video - is it clear?</p>
                  <p>• Can you see faces clearly?</p>
                  <p>• Can you read the receipt text?</p>
                  <p>• If not clear - RETAKE it before uploading</p>
                </div>
              </div>
            </div>

            {/* Customer Complaint Check */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">
                ⚠️ Does Customer Have Any Complaints?
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="complaints"
                      checked={!hasCustomerComplaints}
                      onChange={() => {
                        setHasCustomerComplaints(false);
                        setComplaintDescription("");
                        markHasComplaints();
                      }}
                      className="h-4 w-4"
                    />
                    <span className="ml-2 font-medium text-gray-900">
                      No complaints - Everything is fine
                    </span>
                  </label>
                </div>
                <div className="flex items-start cursor-pointer">
                  <label className="flex items-start cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="complaints"
                      checked={hasCustomerComplaints}
                      onChange={() => {
                        setHasCustomerComplaints(true);
                        markHasComplaints();
                      }}
                      className="h-4 w-4 mt-1"
                    />
                    <div className="ml-2 flex-1">
                      <span className="font-medium text-gray-900 block mb-2">
                        Yes, customer has complaints
                      </span>
                      {hasCustomerComplaints && (
                        <textarea
                          value={complaintDescription}
                          onChange={(e) => {
                            setComplaintDescription(e.target.value);
                            markHasComplaints();
                          }}
                          placeholder="Describe the complaint..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          rows="3"
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* 1. Delivery Video */}
              <MediaUploadCard
                title="1. Delivery Video - MAIN DELIVERY PROOF"
                type="video"
                instructions={[
                  "STEP 1: Start the video by showing YOUR FACE clearly - say your name and the order ID",
                  "STEP 2: Turn the camera to show the CUSTOMER'S FACE clearly - make sure they are visible",
                  "STEP 3: Ask the customer to say 'ORDER RECEIVED' or 'I RECEIVED MY ORDER' - record this clearly",
                  "STEP 4: Show EACH ITEM one by one - count them out loud (Item 1, Item 2, Item 3...)",
                  "STEP 5: Show the customer CHECKING the items - let them look at everything",
                  "STEP 6: Ask the customer 'Is everything correct? Any problems?' - record their answer",
                  "STEP 7: If customer says YES to problems - record what they say about the issues",
                  "STEP 8: Show the RECEIPT in the video before ending",
                  "⚠️ IMPORTANT: Keep recording continuously - do NOT stop the video until all steps are done",
                  "⚠️ Make sure audio is clear - we must hear both you and the customer speaking",
                  "⏱️ Video should be at least 1-2 minutes long to show everything properly",
                ]}
                file={deliveryVideo}
                preview={deliveryVideoPreview}
                uploaded={uploadStatus.deliveryVideo}
                onFileSelect={(file) =>
                  handleFileSelect(
                    file,
                    "video",
                    setDeliveryVideo,
                    setDeliveryVideoPreview
                  )
                }
                onUpload={uploadDeliveryVideo}
                mandatory={true}
              />

              {/* 2. Complaint Video (if needed) */}
              {hasCustomerComplaints && (
                <MediaUploadCard
                  title="2. Complaint Video - PROBLEM DOCUMENTATION"
                  type="video"
                  instructions={[
                    "⚠️ THIS VIDEO IS ONLY FOR PROBLEMS - Make a separate video showing ONLY the issues",
                    "STEP 1: Start by saying 'This is the complaint video for order [Order ID]'",
                    "STEP 2: Clearly state what the problem is - speak slowly and clearly",
                    "STEP 3: SHOW THE PROBLEM with the camera - get very close so it's visible",
                    "STEP 4: If item is damaged - show the damage from multiple angles",
                    "STEP 5: If item is wrong - show what was ordered vs what was delivered",
                    "STEP 6: If item is missing - show the receipt and count what's there",
                    "STEP 7: Let the customer SPEAK about the problem - record what they say",
                    "STEP 8: Ask customer 'What would you like us to do about this?' - record answer",
                    "STEP 9: Show any packaging or labels that are relevant to the problem",
                    "⚠️ IMPORTANT: Focus camera on the problem - make sure it's CLEARLY visible",
                    "⚠️ Get close enough so we can see details - zoom in if needed",
                    "⏱️ Take your time - show everything related to the complaint",
                  ]}
                  file={complaintVideo}
                  preview={complaintVideoPreview}
                  uploaded={uploadStatus.complaintVideo}
                  onFileSelect={(file) =>
                    handleFileSelect(
                      file,
                      "video",
                      setComplaintVideo,
                      setComplaintVideoPreview
                    )
                  }
                  onUpload={uploadComplaintVideo}
                  mandatory={true}
                />
              )}

              {/* 3. Entrance Photo */}
              <MediaUploadCard
                title="3. Entrance Photo - DELIVERY LOCATION PROOF"
                type="photo"
                instructions={[
                  "📸 Take a photo of the MAIN ENTRANCE where you delivered the order",
                  "STEP 1: Stand back far enough to show the WHOLE entrance/door",
                  "STEP 2: Make sure the door number or house number is VISIBLE in the photo",
                  "STEP 3: Include any landmarks - gate, mailbox, sign, building name",
                  "STEP 4: Take the photo in GOOD LIGHT - not too dark, not too bright",
                  "STEP 5: Hold your phone steady - photo should not be blurry",
                  "✓ GOOD: We can clearly see this is the delivery address",
                  "✓ GOOD: Door/gate number is readable in the photo",
                  "✗ BAD: Photo is too close - we can't see the entrance properly",
                  "✗ BAD: Photo is blurry or too dark to see clearly",
                ]}
                file={entrancePhoto}
                preview={entrancePhotoPreview}
                uploaded={uploadStatus.entrancePhoto}
                onFileSelect={(file) =>
                  handleFileSelect(
                    file,
                    "photo",
                    setEntrancePhoto,
                    setEntrancePhotoPreview
                  )
                }
                onUpload={uploadEntrancePhoto}
                mandatory={true}
              />

              {/* 4. Receipt in Hand Photo */}
              <MediaUploadCard
                title="4. Photo of Customer Holding Receipt - CUSTOMER PROOF"
                type="photo"
                instructions={[
                  "📸 Take a photo of the CUSTOMER holding the RECEIPT",
                  "STEP 1: Ask customer to hold the receipt with BOTH HANDS in front of them",
                  "STEP 2: Make sure the receipt is FLAT and OPEN - not folded or crumpled",
                  "STEP 3: Customer should hold it at CHEST HEIGHT - not too high, not too low",
                  "STEP 4: Stand about 3-4 feet away from the customer",
                  "STEP 5: Make sure CUSTOMER'S FACE is clearly visible - they should look at camera",
                  "STEP 6: Make sure RECEIPT TEXT is visible - we should be able to read it",
                  "STEP 7: Take the photo in good light - use flash if it's dark",
                  "STEP 8: Check the photo BEFORE moving on - make sure both face and receipt are clear",
                  "✓ GOOD: We can see customer's full face clearly",
                  "✓ GOOD: We can see the receipt and read the text on it",
                  "✓ GOOD: Customer is holding receipt steady and flat",
                  "✗ BAD: Face is blurry or cut off",
                  "✗ BAD: Receipt is folded or we can't read it",
                  "✗ BAD: Photo is too far away - we can't see details",
                ]}
                file={receiptInHandPhoto}
                preview={receiptInHandPreview}
                uploaded={uploadStatus.receiptInHand}
                onFileSelect={(file) =>
                  handleFileSelect(
                    file,
                    "photo",
                    setReceiptInHandPhoto,
                    setReceiptInHandPreview
                  )
                }
                onUpload={uploadReceiptInHand}
                mandatory={true}
              />

              {/* 5. Receipt Close-Up Photo */}
              <MediaUploadCard
                title="5. Photo of Receipt Alone - RECEIPT DETAILS"
                type="photo"
                instructions={[
                  "📸 Take a close-up photo of ONLY THE RECEIPT - no person in this photo",
                  "STEP 1: Lay the receipt FLAT on a table or hard surface",
                  "STEP 2: Make sure receipt is COMPLETELY FLAT - no wrinkles or folds",
                  "STEP 3: Take the photo from DIRECTLY ABOVE the receipt - hold phone parallel to receipt",
                  "STEP 4: Get CLOSE enough so receipt fills most of the photo",
                  "STEP 5: Make sure ALL TEXT on receipt is visible - top to bottom",
                  "STEP 6: Check that we can READ the text clearly - not blurry",
                  "STEP 7: Take photo in BRIGHT LIGHT - we need to read all details",
                  "STEP 8: Include: Order ID, items, prices, total amount, date/time",
                  "⚠️ VERY IMPORTANT: Every word on the receipt must be READABLE",
                  "✓ GOOD: Receipt is flat and centered in photo",
                  "✓ GOOD: All text is sharp and readable",
                  "✓ GOOD: Good lighting - no shadows on the receipt",
                  "✗ BAD: Receipt is folded or crumpled",
                  "✗ BAD: Text is blurry - we can't read it",
                  "✗ BAD: Photo is too far - text is too small to read",
                  "✗ BAD: Shadows or bad lighting - can't see clearly",
                ]}
                file={receiptCloseUpPhoto}
                preview={receiptCloseUpPreview}
                uploaded={uploadStatus.receiptCloseUp}
                onFileSelect={(file) =>
                  handleFileSelect(
                    file,
                    "photo",
                    setReceiptCloseUpPhoto,
                    setReceiptCloseUpPreview
                  )
                }
                onUpload={uploadReceiptCloseUp}
                mandatory={true}
              />

              {/* 6. Receipt Next to Face Photo */}
              <MediaUploadCard
                title="6. Receipt Next to Customer's Face - FINAL VERIFICATION"
                type="photo"
                instructions={[
                  "📸 Take a photo with receipt NEXT TO customer's face - both in one photo",
                  "STEP 1: Ask customer to hold receipt NEXT TO THEIR FACE (beside their cheek)",
                  "STEP 2: Receipt should be FLAT and at the SAME LEVEL as their face",
                  "STEP 3: Customer should hold receipt with ONE HAND on the side of their face",
                  "STEP 4: Stand about 2-3 feet away from the customer",
                  "STEP 5: Make sure BOTH the face AND receipt are in the photo",
                  "STEP 6: Customer's FULL FACE must be visible and clear",
                  "STEP 7: Receipt TEXT must be readable in the photo",
                  "STEP 8: Take the photo in GOOD LIGHT - both face and receipt should be clear",
                  "STEP 9: Customer should look at the camera",
                  "STEP 10: Check the photo before moving - make sure you can see both clearly",
                  "⚠️ THIS IS THE FINAL PROOF - Take your time to get it right",
                  "✓ GOOD: Customer's face is clear and recognizable",
                  "✓ GOOD: Receipt is next to face and we can read the text",
                  "✓ GOOD: Both face and receipt are in focus",
                  "✓ GOOD: Good lighting on both face and receipt",
                  "✗ BAD: Receipt is covering the face",
                  "✗ BAD: Receipt text is not readable",
                  "✗ BAD: Face is not clear or recognizable",
                  "✗ BAD: Photo is blurry or too dark",
                  "💡 TIP: This photo proves the person received the receipt - make it clear!",
                ]}
                file={receiptNextToFacePhoto}
                preview={receiptNextToFacePreview}
                uploaded={uploadStatus.receiptNextToFace}
                onFileSelect={(file) =>
                  handleFileSelect(
                    file,
                    "photo",
                    setReceiptNextToFacePhoto,
                    setReceiptNextToFacePreview
                  )
                }
                onUpload={uploadReceiptNextToFace}
                mandatory={true}
              />
            </div>

            {/* Progress Summary */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-blue-900 mb-4">Upload Progress</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Delivery Video</span>
                  {uploadStatus.deliveryVideo ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                {hasCustomerComplaints && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Complaint Video</span>
                    {uploadStatus.complaintVideo ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Entrance Photo</span>
                  {uploadStatus.entrancePhoto ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Receipt in Hand</span>
                  {uploadStatus.receiptInHand ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Receipt Close-Up</span>
                  {uploadStatus.receiptCloseUp ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Receipt Next to Face</span>
                  {uploadStatus.receiptNextToFace ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Proceed Button */}
            {allRequiredMediaUploaded() ? (
              <button
                onClick={() => setDeliveryStep("confirmation")}
                className="w-full mt-6 py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition flex items-center justify-center"
              >
                <CheckCircle className="h-6 w-6 mr-2" />
                All Media Uploaded - Proceed to Confirmation
              </button>
            ) : (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium text-center">
                  ⚠️ Upload all required media to proceed
                </p>
              </div>
            )}
          </div>
        )}

        {/* Confirmation View */}
        {deliveryStep === "confirmation" && currentDelivery && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={goBack}
              className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Media Upload
            </button>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ✅ Delivery Confirmation
              </h2>

              {/* Media Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-green-900 mb-3">
                  ✓ All Required Media Uploaded
                </h3>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Delivery Video</span>
                  </div>
                  {hasCustomerComplaints && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Complaint Video</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Entrance Photo</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Receipt in Hand Photo</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Receipt Close-Up Photo</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Receipt Next to Face Photo</span>
                  </div>
                </div>
              </div>

              {/* Customer Confirmation */}
              <div className="mb-6">
                <label className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:border-green-500 transition">
                  <input
                    type="checkbox"
                    checked={customerConfirmed}
                    onChange={(e) => setCustomerConfirmed(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  <span className="text-base font-medium text-gray-900">
                    ✓ Customer has received the delivery and confirmed all items
                  </span>
                </label>
              </div>

              {/* Satisfaction Rating */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Customer Satisfaction (1-5 stars)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setCustomerSatisfaction(rating)}
                      className={`p-2 rounded transition ${
                        rating <= customerSatisfaction
                          ? "text-yellow-400 bg-yellow-50"
                          : "text-gray-300 bg-gray-50 hover:text-yellow-300"
                      }`}
                    >
                      <Star className="h-8 w-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Any additional notes about the delivery..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
            </div>

            {/* Complete Delivery Button */}
            <button
              onClick={handleCompleteDelivery}
              disabled={!customerConfirmed || isUploading}
              className={`w-full py-4 text-white font-bold text-lg rounded-lg transition flex items-center justify-center ${
                customerConfirmed && !isUploading
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Completing Delivery...
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Complete Delivery
                </>
              )}
            </button>

            {!customerConfirmed && (
              <p className="text-center text-sm text-gray-600 mt-4">
                Please confirm customer receipt to complete delivery
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverOnDeliveryDashboard;
