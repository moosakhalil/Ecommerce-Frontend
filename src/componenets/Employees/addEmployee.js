import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Upload, PlusCircle, X, AlertCircle } from "lucide-react";
import Sidebar from "../Sidebar/sidebar";

// Base URL for API requests
const API_BASE_URL = "http://localhost:5000/api";

const AddEmployee = ({ employeeId }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    homeLocation: "",
    addedOn: new Date().toISOString().slice(0, 10),
    roles: [],
  });

  // Separate state for contacts
  const [contacts, setContacts] = useState([
    { name: "", relation: "", phoneNumber: "", note: "", employeeId: "" },
  ]);

  const [profilePicture, setProfilePicture] = useState(null);
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [passportFront, setPassportFront] = useState(null);
  const [passportBack, setPassportBack] = useState(null);
  const [contractPdf, setContractPdf] = useState(null);
  const [otherDoc1, setOtherDoc1] = useState(null);
  const [otherDoc2, setOtherDoc2] = useState(null);
  const [otherDoc3, setOtherDoc3] = useState(null);
  const [otherDoc4, setOtherDoc4] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [validationError, setValidationError] = useState("");

  const [previewUrls, setPreviewUrls] = useState({
    profilePicture: null,
    idCardFront: null,
    idCardBack: null,
    passportFront: null,
    passportBack: null,
    contractPdf: null,
    otherDoc1: null,
    otherDoc2: null,
    otherDoc3: null,
    otherDoc4: null,
  });

  const [isActivated, setIsActivated] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const closeSuccessModal = () => {
    setSuccessModal({ isOpen: false, message: "" });
  };

  // Auto-close success modal after delay
  useEffect(() => {
    let timer;
    if (successModal.isOpen) {
      timer = setTimeout(() => {
        closeSuccessModal();
      }, 5000); // 5 seconds
    }
    return () => clearTimeout(timer);
  }, [successModal.isOpen]);

  // Refs for file inputs
  const profilePictureRef = useRef(null);
  const idCardFrontRef = useRef(null);
  const idCardBackRef = useRef(null);
  const passportFrontRef = useRef(null);
  const passportBackRef = useRef(null);
  const contractPdfRef = useRef(null);
  const otherDoc1Ref = useRef(null);
  const otherDoc2Ref = useRef(null);
  const otherDoc3Ref = useRef(null);
  const otherDoc4Ref = useRef(null);

  // Component mapping for permissions - matching sidebar names
  const allComponents = [
    { id: 1, name: "Orders to cart not ordered yet ( everyone )" },
    { id: 2, name: "Transaction control... paid / or not ( articial emp finance )" },
    { id: 3, name: "All Orders ( emp office ) ( everyone allows )" },
    { id: 4, name: "Order management delivery ( driver and emp on filing delivery )" },
    { id: 6, name: "Non-delivered orders or issues ( office...complain office )" },
    { id: 7, name: "Refund / complain ( office...complain office )" },
    { id: 8, name: "History orders same # 3" },
    { id: 9, name: "Delivery system" },
    { id: 10, name: "Videos Management" },
    { id: 11, name: "Add a new vehicle" },
    { id: 12, name: "View vehicles" },
    { id: 15, name: "Vendor Dashboard" },
    { id: 16, name: "Vendor outsource Dashboard" },
    { id: 28, name: "Product list everyone ( View can only check )" },
    { id: 33, name: "Inventory check ( just controlling staff to double check and corret )" },
    { id: 35, name: "Out of Stock...order stock" },
    { id: 36, name: "Sales data for products" },
    { id: 37, name: "Lost Stock Management" },
    { id: 61, name: "Create a new product (articial emp)" },
    { id: 54, name: "Fill inventory (articial emp)" },
    { id: 55, name: "Inventory control (articial emp)" },
    { id: 56, name: "Categories" },
    { id: 71, name: "Create discount (articial emp)" },
    { id: 72, name: "All Discount list, everyone )" },
    { id: 73, name: "Discounted product inventory" },
    { id: 74, name: "Discount policies action (articial emp)" },
    { id: 81, name: "Suppliers (articial emp)" },
    { id: 82, name: "employees (articial emp)" },
    { id: 83, name: "Customers ( articial emp )" },
    { id: 90, name: "History orders supplier (Admin office)" },
    { id: 101, name: "Finances (articial emp)" },
    { id: 105, name: "ANALYTICS" },
    { id: 100, name: "Admin" },
    { id: 102, name: "Truck Drivers" },
    { id: 106, name: "Products" },
    { id: 107, name: "Delivery Areas" },
    { id: 108, name: "Delivery Types" },
    { id: 109, name: "Employee Permission" },
    { id: 110, name: "Employee Roles" },
    { id: 150, name: "Referrals video verification" },
    { id: 151, name: "Referrals data" },
    { id: 155, name: "Referrals foreman income" },
    { id: 159, name: "Referral demo video" },
    { id: 160, name: "Introduction videos Management" },
  ];

  // Fetch available roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        
        // Default system roles
        const defaultRoles = [
          { _id: "packing-staff", name: "Packing Staff", isSystem: true, permissions: [] },
          { _id: "storage-officer", name: "Storage Officer", isSystem: true, permissions: [] },
          { _id: "dispatch-officer-1", name: "Dispatch Officer 1", isSystem: true, permissions: [] },
          { _id: "dispatch-officer-2", name: "Dispatch Officer 2", isSystem: true, permissions: [] },
          { _id: "driver", name: "Driver", isSystem: true, permissions: [] },
          { _id: "driver-on-delivery", name: "Driver on Delivery", isSystem: true, permissions: [] },
          { _id: "complaint-manager", name: "Complaint Manager", isSystem: true, permissions: [] },
        ];
        
        const response = await axios.get(`${API_BASE_URL}/employee-roles`);
        const customRoles = response.data.roles || [];
        
        // Combine default roles with custom roles from database
        setAvailableRoles([...defaultRoles, ...customRoles]);
        console.log('Fetched roles:', [...defaultRoles, ...customRoles]);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setAvailableRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Auto-select all permissions when roles change
  useEffect(() => {
    if (formData.roles.length > 0 && availableRoles.length > 0) {
      const rolePermissions = availableRoles
        .filter((role) => formData.roles.includes(role._id))
        .flatMap((role) => role.permissions || []);
      const uniquePermissions = [...new Set(rolePermissions)];
      
      // Only update if permissions have changed to avoid infinite loop
      const currentPerms = formData.permissions || [];
      if (JSON.stringify(currentPerms.sort()) !== JSON.stringify(uniquePermissions.sort())) {
        setFormData((prev) => ({
          ...prev,
          permissions: uniquePermissions,
        }));
      }
    } else if (formData.roles.length === 0) {
      // Clear permissions if no roles selected
      if (formData.permissions && formData.permissions.length > 0) {
        setFormData((prev) => ({
          ...prev,
          permissions: [],
        }));
      }
    }
  }, [formData.roles, availableRoles]);

  // Relation options
  const relationOptions = [
    "Parent",
    "Sibling",
    "Spouse",
    "Child",
    "Friend",
    "Relative",
    "Other",
  ];

  // Check if we're in edit mode and fetch employee data if so
  useEffect(() => {
    if (employeeId) {
      setIsEditMode(true);
      fetchEmployeeData(employeeId);
    }
  }, [employeeId]);

  const fetchEmployeeData = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/${id}`);
      const employeeData = response.data.employee;

      // Set form data
      setFormData({
        name: employeeData.name || "",
        email: employeeData.email || "",
        phone: Array.isArray(employeeData.phone)
          ? employeeData.phone[0]
          : employeeData.phone || "",
        address: employeeData.address || "",
        emergencyContact: employeeData.emergencyContact || "",
        homeLocation: employeeData.homeLocation || "",
        addedOn: employeeData.addedOn
          ? employeeData.addedOn.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        employeeCategory: employeeData.employeeCategory || "",
        roles: employeeData.roles || [],
      });

      // Set contacts
      if (employeeData.contacts && employeeData.contacts.length > 0) {
        setContacts(employeeData.contacts);
      }

      // Set activation and block status
      setIsActivated(employeeData.isActivated !== false);
      setIsBlocked(employeeData.isBlocked === true);

      // Set preview URLs for existing images
      const updatedPreviewUrls = { ...previewUrls };

      // Helper function to set preview URL if image exists
      const setPreviewIfExists = (fieldName, imageUrl) => {
        if (imageUrl) {
          const fullUrl = imageUrl.startsWith("http")
            ? imageUrl
            : `${API_BASE_URL}${
                imageUrl.startsWith("/") ? "" : "/"
              }${imageUrl}`;

          updatedPreviewUrls[fieldName] = fullUrl;
        }
      };

      // Set preview URLs for all image fields
      setPreviewIfExists("profilePicture", employeeData.profilePicture);
      setPreviewIfExists("idCardFront", employeeData.idCardFront);
      setPreviewIfExists("idCardBack", employeeData.idCardBack);
      setPreviewIfExists("passportFront", employeeData.passportFront);
      setPreviewIfExists("passportBack", employeeData.passportBack);
      setPreviewIfExists("contractPdf", employeeData.contractPdf);
      setPreviewIfExists("otherDoc1", employeeData.otherDoc1);
      setPreviewIfExists("otherDoc2", employeeData.otherDoc2);
      setPreviewIfExists("otherDoc3", employeeData.otherDoc3);
      setPreviewIfExists("otherDoc4", employeeData.otherDoc4);

      setPreviewUrls(updatedPreviewUrls);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setErrorMessage("Failed to load employee data. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...contacts];
    updatedContacts[index][field] = value;
    setContacts(updatedContacts);
  };

  const addContact = () => {
    setContacts([...contacts, { name: "", relation: "", phoneNumber: "", note: "", employeeId: "" }]);
  };

  const removeContact = (index) => {
    if (contacts.length > 1) {
      const updatedContacts = contacts.filter((_, i) => i !== index);
      setContacts(updatedContacts);
    }
  };

  const handleRoleToggle = (roleId) => {
    setFormData((prevData) => {
      const isRoleSelected = prevData.roles.includes(roleId);
      
      if (isRoleSelected) {
        // Unchecking role - remove its permissions
        const role = availableRoles.find((r) => r._id === roleId);
        const rolePermissions = role?.permissions || [];
        
        return {
          ...prevData,
          roles: prevData.roles.filter((id) => id !== roleId),
          permissions: (prevData.permissions || []).filter(
            (permId) => !rolePermissions.includes(permId)
          ),
        };
      } else {
        // Checking role - permissions will be added by useEffect
        return {
          ...prevData,
          roles: [...prevData.roles, roleId],
        };
      }
    });
  };

  const handleFileChange = (e, setter, previewKey) => {
    const file = e.target.files[0];
    if (file) {
      setter(file);

      // If this is an ID or passport upload, clear any validation error
      if (["idCardFront", "passportFront"].includes(previewKey)) {
        setValidationError("");
      }

      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrls((prev) => ({
          ...prev,
          [previewKey]: fileReader.result,
        }));
      };
      fileReader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (ref) => {
    ref.current.click();
  };

  // Validate that either ID card or passport is uploaded
  const validateIdentification = () => {
    // In edit mode, if we already have preview URLs, we don't need new uploads
    if (isEditMode && (previewUrls.idCardFront || previewUrls.passportFront)) {
      return true;
    }

    if (
      !idCardFront &&
      !passportFront &&
      !previewUrls.idCardFront &&
      !previewUrls.passportFront
    ) {
      setValidationError(
        "Please upload either an ID card or passport for identification"
      );
      return false;
    }
    return true;
  };

  const validateContacts = () => {
    for (const contact of contacts) {
      if (!contact.name || !contact.relation) {
        setValidationError("Contact name and relation are required.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setValidationError("");

    // Validate contacts before proceeding
    if (!validateContacts()) {
      return;
    }

    // Validate identification documents
    if (!validateIdentification()) {
      window.scrollTo({
        top: document.querySelector(".id-docs-section").offsetTop - 100,
        behavior: "smooth",
      });
      return;
    }

    // Validate required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.emergencyContact ||
      !formData.homeLocation ||
      !formData.employeeCategory
    ) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    // Create form data to send files
    const submitData = new FormData();

    // Append all form fields
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("phone", formData.phone);
    submitData.append("address", formData.address);
    submitData.append("emergencyContact", formData.emergencyContact);
    submitData.append("homeLocation", formData.homeLocation);
    submitData.append("addedOn", formData.addedOn);
    submitData.append("employeeCategory", formData.employeeCategory);
    submitData.append("roles", JSON.stringify(formData.roles));
    
    // Log contacts before sending
    console.log("Contacts being sent:", contacts);
    submitData.append("contacts", JSON.stringify(contacts));
    
    submitData.append("isActivated", isActivated);
    submitData.append("isBlocked", isBlocked);

    // Validate Contract PDF is uploaded (mandatory)
    if (!contractPdf && !previewUrls.contractPdf) {
      setValidationError("Contract PDF is required");
      window.scrollTo({
        top: document.querySelector(".id-docs-section").offsetTop - 100,
        behavior: "smooth",
      });
      return;
    }

    // Append files if they exist
    if (profilePicture) submitData.append("profilePicture", profilePicture);
    if (idCardFront) submitData.append("idCardFront", idCardFront);
    if (idCardBack) submitData.append("idCardBack", idCardBack);
    if (passportFront) submitData.append("passportFront", passportFront);
    if (passportBack) submitData.append("passportBack", passportBack);
    if (contractPdf) submitData.append("contractPdf", contractPdf);
    if (otherDoc1) submitData.append("otherDoc1", otherDoc1);
    if (otherDoc2) submitData.append("otherDoc2", otherDoc2);
    if (otherDoc3) submitData.append("otherDoc3", otherDoc3);
    if (otherDoc4) submitData.append("otherDoc4", otherDoc4);

    try {
      let response;
      const url = isEditMode
        ? `${API_BASE_URL}/employees/${employeeId}`
        : `${API_BASE_URL}/employees`;

      if (isEditMode) {
        response = await axios.put(url, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axios.post(url, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        setSuccessModal({
          isOpen: true,
          message: `Employee has been ${
            isEditMode ? "updated" : "added"
          } successfully!`,
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      setErrorMessage(
        error.response?.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "add"
          } employee. Please try again.`
      );
    }
  };

  // Success Modal Component
  const SuccessModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-4 text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-center mb-2">Success!</h3>
          <p className="text-center text-gray-600">{message}</p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={closeSuccessModal}
        message={successModal.message}
      />
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main content area with proper margin */}
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          isSidebarOpen ? "lg:ml-80" : "ml-0"
        }`}
      >
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-sm rounded-lg my-6">
          {showSuccessMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline">
                {" "}
                Employee {isEditMode ? "updated" : "added"} successfully.
                Refreshing...
              </span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg
                  onClick={() => setShowSuccessMessage(false)}
                  className="fill-current h-6 w-6 text-green-500"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </span>
            </div>
          )}

          {errorMessage && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {errorMessage}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg
                  onClick={() => setErrorMessage("")}
                  className="fill-current h-6 w-6 text-red-500"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </span>
            </div>
          )}

          <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
            {isEditMode ? "EDIT EMPLOYEE DETAILS" : "ADD EMPLOYEE DETAILS"}
          </h1>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID Automatically generated
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    disabled
                    placeholder={
                      isEditMode ? employeeId : "Will be auto-generated"
                    }
                    value={isEditMode ? employeeId : ""}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    autoComplete="new-email"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    autoComplete="new-address"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location of home <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="homeLocation"
                    value={formData.homeLocation}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="col-span-1">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    autoComplete="new-name"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    autoComplete="new-phone"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact in case of emergency{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="col-span-1">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture
                  </label>
                  <div
                    className="border border-gray-300 rounded h-48 flex items-center justify-center overflow-hidden relative cursor-pointer"
                    onClick={() => triggerFileInput(profilePictureRef)}
                  >
                    {previewUrls.profilePicture ? (
                      <img
                        src={previewUrls.profilePicture}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload size={32} className="mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">
                          Click to upload image
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={profilePictureRef}
                      onChange={(e) =>
                        handleFileChange(e, setProfilePicture, "profilePicture")
                      }
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Friend/Family Contacts Section */}
            <div className="border-t border-b py-6 my-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Friends/Family Contacts
                </h3>
                <button
                  type="button"
                  onClick={addContact}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <PlusCircle size={18} className="mr-1" /> Add Contact
                </button>
              </div>

              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="mb-4 pb-4 border-b border-gray-100 relative"
                >
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="w-full md:w-[calc(25%-12px)]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) =>
                          handleContactChange(index, "name", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="w-full md:w-[calc(25%-12px)]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relation <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={contact.relation}
                          onChange={(e) =>
                            handleContactChange(index, "relation", e.target.value)
                          }
                          className="appearance-none w-full p-2 border border-gray-300 rounded pr-8"
                          required
                        >
                          <option value="">Select relation</option>
                          {relationOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-[calc(25%-12px)]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={contact.phoneNumber}
                        onChange={(e) =>
                          handleContactChange(
                            index,
                            "phoneNumber",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="w-full md:w-[calc(25%-12px)]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={contact.employeeId || ""}
                        onChange={(e) =>
                          handleContactChange(
                            index,
                            "employeeId",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={contact.note || ""}
                      onChange={(e) =>
                        handleContactChange(index, "note", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                      autoComplete="off"
                      rows="2"
                      required
                    />
                  </div>

                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                      aria-label="Remove contact"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-b py-6 my-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Employee Roles (Select multiple)
              </label>
              {loadingRoles ? (
                <div className="text-sm text-gray-500">Loading roles...</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableRoles.map((role) => (
                      <div key={role._id}>
                        <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                          <input
                            type="checkbox"
                            checked={formData.roles.includes(role._id)}
                            onChange={() => handleRoleToggle(role._id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {role.name}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Individual Permissions Section */}
            <div className="border-t border-b py-6 my-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Individual Permissions
              </label>
              <p className="text-xs text-gray-500 mb-4">
                Permissions from selected roles are automatically checked. Unchecking a role's permission will deselect that role.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {allComponents.map((component) => {
                  // Check which roles have this permission
                  const rolesWithThisPermission = availableRoles
                    .filter((role) => 
                      formData.roles.includes(role._id) && 
                      role.permissions?.includes(component.id)
                    );
                  
                  const isFromSelectedRole = rolesWithThisPermission.length > 0;
                  
                  return (
                    <label
                      key={component.id}
                      className={`flex items-center space-x-2 p-2 border rounded cursor-pointer transition ${
                        isFromSelectedRole 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions?.includes(component.id)}
                        onChange={(e) => {
                          const permissions = formData.permissions || [];
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              permissions: [...permissions, component.id],
                            });
                          } else {
                            // Remove the permission
                            const newPermissions = permissions.filter((id) => id !== component.id);
                            
                            // Check if this permission belongs to any selected role
                            const rolesToDeselect = availableRoles
                              .filter((role) => 
                                formData.roles.includes(role._id) && 
                                role.permissions?.includes(component.id)
                              )
                              .map((role) => role._id);
                            
                            // Remove those roles
                            const newRoles = formData.roles.filter(
                              (roleId) => !rolesToDeselect.includes(roleId)
                            );
                            
                            setFormData({
                              ...formData,
                              permissions: newPermissions,
                              roles: newRoles,
                            });
                          }
                        }}
                        className="w-3 h-3 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">
                        {component.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Added on
              </label>
              <input
                type="date"
                name="addedOn"
                value={formData.addedOn}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                autoComplete="off"
              />
            </div>

            <div className="border-t border-b py-6 my-6 id-docs-section">
              {/* Validation error message */}
              {validationError && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        {validationError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    ID Card
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID card front
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div
                        className={`border ${
                          validationError &&
                          !idCardFront &&
                          !passportFront &&
                          !previewUrls.idCardFront &&
                          !previewUrls.passportFront
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        } rounded h-32 flex items-center justify-center overflow-hidden relative cursor-pointer`}
                        onClick={() => triggerFileInput(idCardFrontRef)}
                      >
                        {previewUrls.idCardFront ? (
                          <img
                            src={previewUrls.idCardFront}
                            alt="ID Card Front"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Upload
                              size={24}
                              className="mx-auto text-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload</p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={idCardFrontRef}
                          onChange={(e) =>
                            handleFileChange(e, setIdCardFront, "idCardFront")
                          }
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID card back
                      </label>
                      <div
                        className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative cursor-pointer"
                        onClick={() => triggerFileInput(idCardBackRef)}
                      >
                        {previewUrls.idCardBack ? (
                          <img
                            src={previewUrls.idCardBack}
                            alt="ID Card Back"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Upload
                              size={24}
                              className="mx-auto text-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload</p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={idCardBackRef}
                          onChange={(e) =>
                            handleFileChange(e, setIdCardBack, "idCardBack")
                          }
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Passport
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passport front
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div
                        className={`border ${
                          validationError && !idCardFront && !passportFront
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        } rounded h-32 flex items-center justify-center overflow-hidden relative cursor-pointer`}
                        onClick={() => triggerFileInput(passportFrontRef)}
                      >
                        {previewUrls.passportFront ? (
                          <img
                            src={previewUrls.passportFront}
                            alt="Passport Front"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Upload
                              size={24}
                              className="mx-auto text-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload</p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={passportFrontRef}
                          onChange={(e) =>
                            handleFileChange(
                              e,
                              setPassportFront,
                              "passportFront"
                            )
                          }
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passport back
                      </label>
                      <div
                        className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative cursor-pointer"
                        onClick={() => triggerFileInput(passportBackRef)}
                      >
                        {previewUrls.passportBack ? (
                          <img
                            src={previewUrls.passportBack}
                            alt="Passport Back"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Upload
                              size={24}
                              className="mx-auto text-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload</p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={passportBackRef}
                          onChange={(e) =>
                            handleFileChange(e, setPassportBack, "passportBack")
                          }
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                <span className="text-red-500">*</span> Please upload at least
                one form of identification (either ID card or passport)
              </p>

              {/* Contract PDF Section - Mandatory */}
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract PDF <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Upload the employee contract document (PDF only, required)
                </p>
                <div
                  className={`border-2 border-dashed ${
                    validationError && !contractPdf && !previewUrls.contractPdf
                      ? "border-red-400 bg-red-50"
                      : "border-blue-300 bg-white"
                  } rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors`}
                  onClick={() => triggerFileInput(contractPdfRef)}
                >
                  {previewUrls.contractPdf ? (
                    <div className="flex items-center gap-3">
                      <div className="text-red-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Contract PDF Uploaded
                        </p>
                        <p className="text-xs text-gray-500">
                          Click to replace
                        </p>
                      </div>
                      <a
                        href={previewUrls.contractPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View PDF
                      </a>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-blue-600 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload Contract PDF
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF files only (Required)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={contractPdfRef}
                    onChange={(e) =>
                      handleFileChange(e, setContractPdf, "contractPdf")
                    }
                    className="hidden"
                    accept=".pdf,application/pdf"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Any other doc
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative cursor-pointer"
                    onClick={() => triggerFileInput(otherDoc1Ref)}
                  >
                    {previewUrls.otherDoc1 ? (
                      <img
                        src={previewUrls.otherDoc1}
                        alt="Other Document 1"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload size={24} className="mx-auto text-gray-400" />
                        <p className="text-xs text-gray-500 mt-1">Upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={otherDoc1Ref}
                      onChange={(e) =>
                        handleFileChange(e, setOtherDoc1, "otherDoc1")
                      }
                      className="hidden"
                      accept="image/*,.pdf"
                    />
                  </div>

                  <div
                    className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative cursor-pointer"
                    onClick={() => triggerFileInput(otherDoc2Ref)}
                  >
                    {previewUrls.otherDoc2 ? (
                      <img
                        src={previewUrls.otherDoc2}
                        alt="Other Document 2"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload size={24} className="mx-auto text-gray-400" />
                        <p className="text-xs text-gray-500 mt-1">Upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={otherDoc2Ref}
                      onChange={(e) =>
                        handleFileChange(e, setOtherDoc2, "otherDoc2")
                      }
                      className="hidden"
                      accept="image/*,.pdf"
                    />
                  </div>

                  <div
                    className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative cursor-pointer"
                    onClick={() => triggerFileInput(otherDoc3Ref)}
                  >
                    {previewUrls.otherDoc3 ? (
                      <img
                        src={previewUrls.otherDoc3}
                        alt="Other Document 3"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload size={24} className="mx-auto text-gray-400" />
                        <p className="text-xs text-gray-500 mt-1">Upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={otherDoc3Ref}
                      onChange={(e) =>
                        handleFileChange(e, setOtherDoc3, "otherDoc3")
                      }
                      className="hidden"
                      accept="image/*,.pdf"
                    />
                  </div>

                  <div
                    className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative cursor-pointer"
                    onClick={() => triggerFileInput(otherDoc4Ref)}
                  >
                    {previewUrls.otherDoc4 ? (
                      <img
                        src={previewUrls.otherDoc4}
                        alt="Other Document 4"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload size={24} className="mx-auto text-gray-400" />
                        <p className="text-xs text-gray-500 mt-1">Upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={otherDoc4Ref}
                      onChange={(e) =>
                        handleFileChange(e, setOtherDoc4, "otherDoc4")
                      }
                      className="hidden"
                      accept="image/*,.pdf"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t py-6 my-6">
              <div className="flex flex-col md:flex-row justify-start gap-8">
                <div>
                  <button
                    type="button"
                    onClick={() => setIsBlocked(!isBlocked)}
                    className={`px-4 py-2 rounded ${
                      isBlocked
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    Block
                  </button>
                  <div className="mt-4 p-3 bg-gray-100 border rounded">
                    <p className="text-sm text-gray-700">
                      {isBlocked ? "Blocked" : "Not blocked yet"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsActivated(true)}
                      className={`px-4 py-2 rounded ${
                        isActivated
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      ✓ Activated
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsActivated(false)}
                      className={`px-4 py-2 rounded ${
                        !isActivated
                          ? "bg-gray-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      Deactivate
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-gray-100 border rounded">
                    <p className="text-sm text-gray-700">
                      {isActivated ? "Activated" : "Deactivated"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
