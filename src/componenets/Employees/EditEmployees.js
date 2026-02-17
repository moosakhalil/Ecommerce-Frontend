import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Search,
  ChevronDown,
  Bell,
  Edit,
  Trash2,
  X,
  Upload,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import ModeToggle from "../Shared/ModeToggle";
import { API_BASE_URL } from "../../utils/config";

const EditEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeType, setEmployeeType] = useState("All employees");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState(["All employees"]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [contacts, setContacts] = useState([
    { name: "", relation: "", phoneNumber: "", note: "", employeeId: "" },
  ]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [roles, setRoles] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: "",
  });

  const closeSuccessModal = () => {
    setSuccessModal({ isOpen: false, message: "" });
  };

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

  // For image previews
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

  // Component mapping for permissions - matching sidebar names
  const allComponents = [
    { id: 1, name: "Orders to cart not ordered yet ( everyone )" },
    {
      id: 2,
      name: "Transaction control... paid / or not ( articial emp finance )",
    },
    { id: 3, name: "All Orders ( emp office ) ( everyone allows )" },
    {
      id: 4,
      name: "Order management delivery ( driver and emp on filing delivery )",
    },
    {
      id: 6,
      name: "Non-delivered orders or issues ( office...complain office )",
    },
    { id: 7, name: "Refund / complain ( office...complain office )" },
    { id: 8, name: "History orders same # 3" },
    { id: 9, name: "Delivery system" },
    { id: 10, name: "Videos Management" },
    { id: 11, name: "Add a new vehicle" },
    { id: 12, name: "View vehicles" },
    { id: 15, name: "Vendor Dashboard" },
    { id: 16, name: "Vendor outsource Dashboard" },
    { id: 28, name: "Product list everyone ( View can only check )" },
    {
      id: 33,
      name: "Inventory check ( just controlling staff to double check and corret )",
    },
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

  // Role/Permission options for editing employee permissions
  const roleOptions = [
    "Packing Staff",
    "Storage Officer",
    "Dispatch Officer 1",
    "Dispatch Officer 2",
    "Driver",
    "Driver On Delivery",
    "Complaint Manager",
  ];

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);

        // Default system roles
        const defaultRoles = [
          {
            _id: "packing-staff",
            name: "Packing Staff",
            isSystem: true,
            permissions: [],
          },
          {
            _id: "storage-officer",
            name: "Storage Officer",
            isSystem: true,
            permissions: [],
          },
          {
            _id: "dispatch-officer-1",
            name: "Dispatch Officer 1",
            isSystem: true,
            permissions: [],
          },
          {
            _id: "dispatch-officer-2",
            name: "Dispatch Officer 2",
            isSystem: true,
            permissions: [],
          },
          { _id: "driver", name: "Driver", isSystem: true, permissions: [] },
          {
            _id: "driver-on-delivery",
            name: "Driver on Delivery",
            isSystem: true,
            permissions: [],
          },
          {
            _id: "complaint-manager",
            name: "Complaint Manager",
            isSystem: true,
            permissions: [],
          },
        ];

        const response = await axios.get(`${API_BASE_URL}/employee-roles`);
        const customRoles = response.data.roles || [];

        // Combine default roles with custom roles from database
        setAvailableRoles([...defaultRoles, ...customRoles]);
        console.log("Fetched roles:", [...defaultRoles, ...customRoles]);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setAvailableRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Auto-select all permissions when roles change in edit mode
  useEffect(() => {
    if (editFormData.roles?.length > 0 && availableRoles.length > 0) {
      const rolePermissions = availableRoles
        .filter((role) => editFormData.roles?.includes(role._id))
        .flatMap((role) => role.permissions || []);
      const uniquePermissions = [...new Set(rolePermissions)];

      // Only update if permissions have changed to avoid infinite loop
      const currentPerms = editFormData.permissions || [];
      if (
        JSON.stringify(currentPerms.sort()) !==
        JSON.stringify(uniquePermissions.sort())
      ) {
        setEditFormData((prev) => ({
          ...prev,
          permissions: uniquePermissions,
        }));
      }
    }
  }, [editFormData.roles, availableRoles]);

  // Fetch roles data
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/employee-roles`);
        setRoles(response.data.roles || []);

        // Also fetch available roles for the dropdown
        setAvailableRoles(response.data.roles || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/employees`);
        setEmployees(response.data.employees);
        setTotalItems(response.data.total);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("Failed to fetch employees. Please try again.");
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Update category options when roles change
  useEffect(() => {
    if (roles.length > 0) {
      const systemRoles = [
        { _id: "packing-staff", name: "Packing Staff" },
        { _id: "storage-officer", name: "Storage Officer" },
        { _id: "dispatch-officer-1", name: "Dispatch Officer 1" },
        { _id: "dispatch-officer-2", name: "Dispatch Officer 2" },
        { _id: "driver", name: "Driver" },
        { _id: "driver-on-delivery", name: "Driver on Delivery" },
        { _id: "complaint-manager", name: "Complaint Manager" },
      ];

      const allRoleNames = [
        "All employees",
        ...systemRoles.map((r) => r.name),
        ...roles.map((r) => r.name),
      ];

      setCategoryOptions(allRoleNames);
    }
  }, [roles]);

  // Map role IDs to display names
  const getRoleDisplayName = (roleId) => {
    // First check if it's a custom role (ObjectId)
    const customRole = roles.find((role) => role._id === roleId);
    if (customRole) {
      return customRole.name;
    }

    // If not found in custom roles, use default mapping
    const roleMap = {
      "packing-staff": "Packing Staff",
      "storage-officer": "Storage Officer",
      "dispatch-officer-1": "Dispatch Officer 1",
      "dispatch-officer-2": "Dispatch Officer 2",
      driver: "Driver",
      "driver-on-delivery": "Driver on Delivery",
      "complaint-manager": "Complaint Manager",
      "add-products": "Add product",
      "product-list": "Product List",
      finance: "Finance",
      orders: "Orders",
      "customer-service": "Customer Service",
      "truck-driver": "Truck Driver",
    };

    return roleMap[roleId] || roleId;
  };

  // Filter employees based on search term and selected employee type
  const filteredEmployees = (employees || []).filter((employee) => {
    // Search filter
    const matchesSearch =
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    let matchesRole = true;
    if (employeeType !== "All employees") {
      // Check if employee has any role that matches the selected role name
      matchesRole = (employee.roles || []).some((roleId) => {
        return getRoleDisplayName(roleId) === employeeType;
      });
    }

    return matchesSearch && matchesRole;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Handle page changes
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Format date to be displayed in a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString("default", {
      month: "long",
    })}, ${date.getFullYear()}`;
  };

  // Get badge color based on role
  const getRoleBadgeColor = (role) => {
    const colorMap = {
      "add-products": "bg-blue-600 text-white",
      "product-list": "bg-pink-500 text-white",
      finance: "bg-green-600 text-white",
      orders: "bg-indigo-500 text-white",
      "customer-service": "bg-purple-500 text-white",
      "truck-driver": "bg-amber-500 text-white",
      categories: "bg-pink-500 text-white",
    };

    return colorMap[role] || "bg-gray-500 text-white";
  };

  // Handle search input change with immediate filtering
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle employee type filter change
  const handleEmployeeTypeChange = (e) => {
    setEmployeeType(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Open edit modal and initialize form data
  const handleEditClick = (employee) => {
    setCurrentEmployee(employee);
    setEditFormData({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      address: employee.address || "",
      emergencyContact: employee.emergencyContact || "",
      homeLocation: employee.homeLocation || "",
      roles: employee.roles || [],
      addedOn: employee.addedOn
        ? new Date(employee.addedOn).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      isActivated:
        employee.isActivated !== undefined ? employee.isActivated : true,
      isBlocked: employee.isBlocked !== undefined ? employee.isBlocked : false,
    });

    // Initialize contacts
    if (employee.contacts && employee.contacts.length > 0) {
      setContacts(
        employee.contacts.map((contact) => ({
          name: contact.name || "",
          relation: contact.relation || "",
          phoneNumber: contact.phoneNumber || "",
          note: contact.note || "",
          employeeId: contact.employeeId || "",
        })),
      );
    } else if (employee.contactName && employee.contactRelation) {
      // For backward compatibility with old data format
      setContacts([
        {
          name: employee.contactName || "",
          relation: employee.contactRelation || "",
          phoneNumber: "",
          note: "",
          employeeId: "",
        },
      ]);
    } else {
      setContacts([
        { name: "", relation: "", phoneNumber: "", note: "", employeeId: "" },
      ]);
    }

    // Initialize preview URLs with full URLs for images
    const buildFileUrl = (filePath) => {
      if (!filePath) return null;
      // If the path already starts with http, return as is
      if (filePath.startsWith("http")) return filePath;
      // Otherwise construct the full URL
      // Remove leading slash if present to avoid double slashes
      const cleanPath = filePath.startsWith("/")
        ? filePath.substring(1)
        : filePath;
      return `${API_BASE_URL}/${cleanPath}`;
    };

    setPreviewUrls({
      profilePicture: buildFileUrl(employee.profilePicture),
      idCardFront: buildFileUrl(employee.idCardFront),
      idCardBack: buildFileUrl(employee.idCardBack),
      passportFront: buildFileUrl(employee.passportFront),
      passportBack: buildFileUrl(employee.passportBack),
      contractPdf: buildFileUrl(employee.contractPdf),
      otherDoc1: buildFileUrl(employee.otherDoc1),
      otherDoc2: buildFileUrl(employee.otherDoc2),
      otherDoc3: buildFileUrl(employee.otherDoc3),
      otherDoc4: buildFileUrl(employee.otherDoc4),
    });

    setShowEditModal(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (employee) => {
    setCurrentEmployee(employee);
    setShowDeleteConfirm(true);
  };

  // Handle input change in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle contact field changes
  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...contacts];
    updatedContacts[index][field] = value;
    setContacts(updatedContacts);
  };

  // Add new contact
  const addContact = () => {
    setContacts([
      ...contacts,
      { name: "", relation: "", phoneNumber: "", note: "", employeeId: "" },
    ]);
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

  // Remove contact
  const removeContact = (index) => {
    if (contacts.length > 1) {
      const updatedContacts = contacts.filter((_, i) => i !== index);
      setContacts(updatedContacts);
    }
  };

  // Handle role toggle in edit form
  const handleRoleToggle = (roleId) => {
    setEditFormData((prevData) => {
      const isRoleSelected = prevData.roles.includes(roleId);

      if (isRoleSelected) {
        // Unchecking role - remove its permissions
        const role = availableRoles.find((r) => r._id === roleId);
        const rolePermissions = role?.permissions || [];

        return {
          ...prevData,
          roles: prevData.roles.filter((id) => id !== roleId),
          permissions: (prevData.permissions || []).filter(
            (permId) => !rolePermissions.includes(permId),
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

  // Handle file change in edit form
  const handleFileChange = (e, setter, previewKey) => {
    const file = e.target.files[0];
    if (file) {
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

  // Trigger file input click
  const triggerFileInput = (ref) => {
    ref.current.click();
  };

  // Helper function to check if file is a PDF
  const isPDF = (url) => {
    if (!url) return false;
    return (
      url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf")
    );
  };

  // Helper function to render file preview (handles both images and PDFs)
  const renderFilePreview = (url, altText) => {
    if (!url) return null;

    if (isPDF(url)) {
      return (
        <div className="flex items-center justify-center flex-col gap-2 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-600"
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
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View PDF
          </a>
        </div>
      );
    }

    return (
      <img
        src={url}
        alt={altText}
        className="w-full h-full object-contain"
        onError={(e) => {
          console.error("Image load error:", url);
          e.target.style.display = "none";
          e.target.parentElement.innerHTML = `<div class="text-center p-2"><p class="text-xs text-red-500">Failed to load</p></div>`;
        }}
      />
    );
  };

  // Validate identification documents
  const validateIdentification = () => {
    if (!previewUrls.idCardFront && !previewUrls.passportFront) {
      setValidationError(
        "Please upload either an ID card or passport for identification",
      );
      return false;
    }
    if (!previewUrls.contractPdf) {
      setValidationError("Contract PDF is required");
      return false;
    }
    return true;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Validate identification documents
    if (!validateIdentification()) {
      return;
    }

    try {
      // Create form data for files
      const formData = new FormData();

      // Append all form fields
      Object.keys(editFormData).forEach((key) => {
        if (key === "roles") {
          // Don't stringify - backend expects it as a field that can be parsed
          editFormData[key].forEach((role) => {
            formData.append("roles[]", role);
          });
        } else if (key !== "permissions") {
          formData.append(key, editFormData[key]);
        }
      });

      // Append contacts as JSON
      console.log("Contacts being sent in update:", contacts);
      formData.append("contacts", JSON.stringify(contacts));

      // Append files if they were changed
      if (profilePictureRef.current.files[0]) {
        formData.append("profilePicture", profilePictureRef.current.files[0]);
      }
      if (idCardFrontRef.current.files[0]) {
        formData.append("idCardFront", idCardFrontRef.current.files[0]);
      }
      if (idCardBackRef.current.files[0]) {
        formData.append("idCardBack", idCardBackRef.current.files[0]);
      }
      if (passportFrontRef.current.files[0]) {
        formData.append("passportFront", passportFrontRef.current.files[0]);
      }
      if (passportBackRef.current.files[0]) {
        formData.append("passportBack", passportBackRef.current.files[0]);
      }
      if (contractPdfRef.current.files[0]) {
        formData.append("contractPdf", contractPdfRef.current.files[0]);
      }
      if (otherDoc1Ref.current.files[0]) {
        formData.append("otherDoc1", otherDoc1Ref.current.files[0]);
      }
      if (otherDoc2Ref.current.files[0]) {
        formData.append("otherDoc2", otherDoc2Ref.current.files[0]);
      }
      if (otherDoc3Ref.current.files[0]) {
        formData.append("otherDoc3", otherDoc3Ref.current.files[0]);
      }
      if (otherDoc4Ref.current.files[0]) {
        formData.append("otherDoc4", otherDoc4Ref.current.files[0]);
      }

      // Send PUT request to update employee
      const response = await axios.put(
        `${API_BASE_URL}/api/employees/${currentEmployee._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200) {
        // Update employees list with edited employee
        setEmployees(
          employees.map((emp) =>
            emp._id === currentEmployee._id ? response.data.employee : emp,
          ),
        );
        // Show success modal
        setSuccessModal({
          isOpen: true,
          message: "Employee details updated successfully!",
        });

        // Hide edit modal
        setShowEditModal(false);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      setValidationError(
        error.response?.data?.message || "Failed to update employee details",
      );
    }
  };

  // Delete employee
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/employees/${currentEmployee._id}`,
      );

      if (response.status === 200) {
        // Remove deleted employee from list
        setEmployees(
          employees.filter((emp) => emp._id !== currentEmployee._id),
        );

        // Close modal and show success message
        setShowDeleteConfirm(false);
        setSuccessMessage("Employee deleted successfully");
        setShowSuccessMessage(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      setError("Failed to delete employee. Please try again.");
      setShowDeleteConfirm(false);
    }
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
        {/* Main content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Edit Employees
              </h1>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Bell className="h-6 w-6 cursor-pointer text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full h-4 w-4 flex items-center justify-center">
                    2
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <span className="font-bold">JM</span>
                </div>
              </div>
            </div>

            {/* Success message */}
            {showSuccessMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> {successMessage}</span>
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

            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <svg
                    onClick={() => setError(null)}
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

            {/* Search and filter */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                </div>
                <div className="md:w-64">
                  <label className="block text-sm text-gray-500 mb-1">
                    Filter by role
                  </label>
                  <div className="relative">
                    <select
                      className="appearance-none w-full pl-4 pr-10 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={employeeType}
                      onChange={handleEmployeeTypeChange}
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-400 h-5 w-5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Employees Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 pl-2 pr-4">ID</th>
                      <th className="pb-3 px-4">NAME</th>
                      <th className="pb-3 px-4">Date Added</th>
                      <th className="pb-3 px-4">Last Edited</th>
                      <th className="pb-3 px-4">ROLES</th>
                      <th className="pb-3 px-4">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="py-4 text-center">
                          Loading employees...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-4 text-center text-red-500"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-4 text-center">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((employee, index) => (
                        <tr
                          key={employee._id || index}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-4 pl-2 pr-4 text-gray-800">
                            #{employee.employeeId?.split("-")[1] || "5089"}
                          </td>
                          <td className="py-4 px-4 text-gray-800">
                            {employee.name || "Joseph Wheeler"}
                          </td>
                          <td className="py-4 px-4 text-gray-800">
                            {formatDate(employee.createdAt) || "6 April, 2023"}
                          </td>
                          <td className="py-4 px-4 text-gray-800">
                            {formatDate(employee.updatedAt) || "-"}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-2">
                              {employee.roles && employee.roles.length > 0 ? (
                                employee.roles.map((role, index) => (
                                  <span
                                    key={index}
                                    className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(
                                      role,
                                    )}`}
                                  >
                                    {getRoleDisplayName(role)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  No roles assigned
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditClick(employee)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(employee)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-4">
                <div className="flex items-center mb-4 md:mb-0">
                  <span className="text-sm text-gray-500 mr-2">Showing</span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-sm text-gray-500 ml-2">
                    of {filteredEmployees.length}
                  </span>
                </div>

                <div className="flex">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    &lt;
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, i) => {
                      // Calculate page numbers to show
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`px-3 py-1 mx-1 rounded ${
                            currentPage === pageNum
                              ? "bg-amber-500 text-white"
                              : "border text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Employee Details
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Validation error */}
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

              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                        value={currentEmployee.employeeId || ""}
                        disabled
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={editFormData.address || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location of home
                      </label>
                      <input
                        type="text"
                        name="homeLocation"
                        value={editFormData.homeLocation || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact in case of emergency
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={editFormData.emergencyContact || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
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
                        className="border border-gray-300 rounded h-48 flex items-center justify-center overflow-hidden relative"
                        onClick={() => triggerFileInput(profilePictureRef)}
                      >
                        {previewUrls.profilePicture ? (
                          <img
                            src={previewUrls.profilePicture}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4 cursor-pointer">
                            <Upload
                              size={32}
                              className="mx-auto text-gray-400"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                              Click to upload image
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={profilePictureRef}
                          onChange={(e) =>
                            handleFileChange(e, null, "profilePicture")
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
                            value={contact.name || ""}
                            onChange={(e) =>
                              handleContactChange(index, "name", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                          />
                        </div>

                        <div className="w-full md:w-[calc(25%-12px)]">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relation <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={contact.relation || ""}
                              onChange={(e) =>
                                handleContactChange(
                                  index,
                                  "relation",
                                  e.target.value,
                                )
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
                            value={contact.phoneNumber || ""}
                            onChange={(e) =>
                              handleContactChange(
                                index,
                                "phoneNumber",
                                e.target.value,
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded"
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
                                e.target.value,
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded"
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
                    <div className="text-sm text-gray-500">
                      Loading roles...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {availableRoles.map((role) => (
                          <div key={role._id}>
                            <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                              <input
                                type="checkbox"
                                checked={editFormData.roles?.includes(role._id)}
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
                    Permissions from selected roles are automatically checked.
                    Unchecking a role's permission will deselect that role.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {allComponents.map((component) => {
                      // Check which roles have this permission
                      const rolesWithThisPermission = availableRoles.filter(
                        (role) =>
                          editFormData.roles?.includes(role._id) &&
                          role.permissions?.includes(component.id),
                      );

                      const isFromSelectedRole =
                        rolesWithThisPermission.length > 0;

                      return (
                        <label
                          key={component.id}
                          className={`flex items-center space-x-2 p-2 border rounded cursor-pointer transition ${
                            isFromSelectedRole
                              ? "border-blue-300 bg-blue-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={editFormData.permissions?.includes(
                              component.id,
                            )}
                            onChange={(e) => {
                              const permissions =
                                editFormData.permissions || [];
                              if (e.target.checked) {
                                setEditFormData({
                                  ...editFormData,
                                  permissions: [...permissions, component.id],
                                });
                              } else {
                                // Remove only this permission
                                const newPermissions = permissions.filter(
                                  (id) => id !== component.id,
                                );

                                setEditFormData({
                                  ...editFormData,
                                  permissions: newPermissions,
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

                <div className="border-t border-b py-6 my-6 id-docs-section">
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
                              !previewUrls.idCardFront &&
                              !previewUrls.passportFront
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            } rounded h-32 flex items-center justify-center overflow-hidden relative`}
                            onClick={() => triggerFileInput(idCardFrontRef)}
                          >
                            {previewUrls.idCardFront ? (
                              renderFilePreview(
                                previewUrls.idCardFront,
                                "ID Card Front",
                              )
                            ) : (
                              <div className="text-center p-4 cursor-pointer">
                                <Upload
                                  size={24}
                                  className="mx-auto text-gray-400"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Upload
                                </p>
                              </div>
                            )}
                            <input
                              type="file"
                              ref={idCardFrontRef}
                              onChange={(e) =>
                                handleFileChange(e, null, "idCardFront")
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
                            className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative"
                            onClick={() => triggerFileInput(idCardBackRef)}
                          >
                            {previewUrls.idCardBack ? (
                              renderFilePreview(
                                previewUrls.idCardBack,
                                "ID Card Back",
                              )
                            ) : (
                              <div className="text-center p-4 cursor-pointer">
                                <Upload
                                  size={24}
                                  className="mx-auto text-gray-400"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Upload
                                </p>
                              </div>
                            )}
                            <input
                              type="file"
                              ref={idCardBackRef}
                              onChange={(e) =>
                                handleFileChange(e, null, "idCardBack")
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
                              validationError &&
                              !previewUrls.idCardFront &&
                              !previewUrls.passportFront
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            } rounded h-32 flex items-center justify-center overflow-hidden relative`}
                            onClick={() => triggerFileInput(passportFrontRef)}
                          >
                            {previewUrls.passportFront ? (
                              renderFilePreview(
                                previewUrls.passportFront,
                                "Passport Front",
                              )
                            ) : (
                              <div className="text-center p-4 cursor-pointer">
                                <Upload
                                  size={24}
                                  className="mx-auto text-gray-400"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Upload
                                </p>
                              </div>
                            )}
                            <input
                              type="file"
                              ref={passportFrontRef}
                              onChange={(e) =>
                                handleFileChange(e, null, "passportFront")
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
                            className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative"
                            onClick={() => triggerFileInput(passportBackRef)}
                          >
                            {previewUrls.passportBack ? (
                              renderFilePreview(
                                previewUrls.passportBack,
                                "Passport Back",
                              )
                            ) : (
                              <div className="text-center p-4 cursor-pointer">
                                <Upload
                                  size={24}
                                  className="mx-auto text-gray-400"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Upload
                                </p>
                              </div>
                            )}
                            <input
                              type="file"
                              ref={passportBackRef}
                              onChange={(e) =>
                                handleFileChange(e, null, "passportBack")
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
                    <span className="text-red-500">*</span> Please upload at
                    least one form of identification (either ID card or
                    passport)
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
                        validationError && !previewUrls.contractPdf
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
                          handleFileChange(e, null, "contractPdf")
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
                        className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative"
                        onClick={() => triggerFileInput(otherDoc1Ref)}
                      >
                        {previewUrls.otherDoc1 ? (
                          renderFilePreview(
                            previewUrls.otherDoc1,
                            "Other Document 1",
                          )
                        ) : (
                          <div className="text-center p-4 cursor-pointer">
                            <Upload
                              size={24}
                              className="mx-auto text-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Upload other doc 1
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={otherDoc1Ref}
                          onChange={(e) =>
                            handleFileChange(e, null, "otherDoc1")
                          }
                          className="hidden"
                          accept="image/*,.pdf"
                        />
                      </div>

                      <div
                        className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative"
                        onClick={() => triggerFileInput(otherDoc2Ref)}
                      >
                        {previewUrls.otherDoc2 ? (
                          renderFilePreview(
                            previewUrls.otherDoc2,
                            "Other Document 2",
                          )
                        ) : (
                          <div className="text-center p-4 cursor-pointer">
                            <Upload
                              size={24}
                              className="mx-auto text-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Upload other doc 2
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={otherDoc2Ref}
                          onChange={(e) =>
                            handleFileChange(e, null, "otherDoc2")
                          }
                          className="hidden"
                          accept="image/*,.pdf"
                        />
                      </div>

                      <div
                        className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative"
                        onClick={() => triggerFileInput(otherDoc3Ref)}
                      >
                        {previewUrls.otherDoc3 ? (
                          renderFilePreview(
                            previewUrls.otherDoc3,
                            "Other Document 3",
                          )
                        ) : (
                          <div className="text-center p-4 cursor-pointer">
                            <Upload
                              size={24}
                              className="mx-auto text-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Upload other doc 3
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={otherDoc3Ref}
                          onChange={(e) =>
                            handleFileChange(e, null, "otherDoc3")
                          }
                          className="hidden"
                          accept="image/*,.pdf"
                        />
                      </div>

                      <div
                        className="border border-gray-300 rounded h-32 flex items-center justify-center overflow-hidden relative"
                        onClick={() => triggerFileInput(otherDoc4Ref)}
                      >
                        {previewUrls.otherDoc4 ? (
                          renderFilePreview(
                            previewUrls.otherDoc4,
                            "Other Document 4",
                          )
                        ) : (
                          <div className="text-center p-4 cursor-pointer">
                            <Upload
                              size={24}
                              className="mx-auto text-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Upload other doc 4
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={otherDoc4Ref}
                          onChange={(e) =>
                            handleFileChange(e, null, "otherDoc4")
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
                        onClick={() =>
                          setEditFormData({
                            ...editFormData,
                            isBlocked: !editFormData.isBlocked,
                          })
                        }
                        className={`px-4 py-2 rounded ${
                          editFormData.isBlocked
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        Block
                      </button>
                      <div className="mt-4 p-3 bg-gray-100 border rounded">
                        <p className="text-sm text-gray-700">
                          {editFormData.isBlocked
                            ? "Blocked"
                            : "Not blocked yet"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditFormData({
                              ...editFormData,
                              isActivated: true,
                            })
                          }
                          className={`px-4 py-2 rounded ${
                            editFormData.isActivated
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          ✓ Activated
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditFormData({
                              ...editFormData,
                              isActivated: false,
                            })
                          }
                          className={`px-4 py-2 rounded ${
                            !editFormData.isActivated
                              ? "bg-gray-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          Deactivate
                        </button>
                      </div>
                      <div className="mt-4 p-3 bg-gray-100 border rounded">
                        <p className="text-sm text-gray-700">
                          {editFormData.isActivated
                            ? "Activated"
                            : "Deactivated"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded mr-2 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete {currentEmployee.name}? This
              action cannot be undone.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded mr-2 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEmployees;
