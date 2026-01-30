import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";
import {
  Settings,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

const API_URL = API_BASE_URL;

const DiscountPolicies = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [windowConfigs, setWindowConfigs] = useState({});
  const [expandedWindows, setExpandedWindows] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [infoModal, setInfoModal] = useState(null);

  // Window metadata with icons, colors and eligibility info
  const windowMetadata = {
    foremen: {
      id: "foremen",
      name: "Foremen",
      icon: "👷",
      color: "bg-blue-500",
      borderColor: "border-blue-500",
      lightBg: "bg-blue-50",
      description: "Active for all verified foremen",
      eligibility: {
        title: "Foremen Discount",
        whoGetsIt: "All customers registered as Foremen in the system",
        howToQualify: [
          "Customer must be approved as a Foreman by admin",
          "Foreman status must be active (not pending or rejected)",
        ],
        duration: "24/7 - Always available as long as Foreman status is active",
      },
      hasConfig: false, // No configurable fields
    },
    foremen_commission: {
      id: "foremen_commission",
      name: "Foremen + Commission",
      icon: "👷‍♂️",
      color: "bg-blue-600",
      borderColor: "border-blue-600",
      lightBg: "bg-blue-50",
      description: "Active for foremen with commission rights",
      eligibility: {
        title: "Foremen+ (Commission) Discount",
        whoGetsIt: "Foremen who have earned commission eligibility",
        howToQualify: [
          "Must be an approved Foreman first",
          "Must have commission rights enabled",
          "Commission rights are granted based on referral performance",
        ],
        duration: "24/7 - Always available as long as commission rights are active",
      },
      hasConfig: false,
    },
    referral_3_days: {
      id: "referral_3_days",
      name: "Referred Customers",
      icon: "🔗",
      color: "bg-green-500",
      borderColor: "border-green-500",
      lightBg: "bg-green-50",
      description: "For customers who successfully referred others",
      eligibility: {
        title: "Referral Reward Discount",
        whoGetsIt: "Customers who have successfully referred 3+ new customers",
        howToQualify: [
          "Refer at least 3 new customers who make purchases",
          "Referrals must be valid customers",
          "Each referral must be a unique new customer",
        ],
        duration: "Days × referrals (configurable below)",
      },
      hasConfig: true,
      fields: [
        {
          key: "daysPerReferral",
          label: "Days per Referral",
          type: "dropdown",
          min: 1,
          max: 10,
          unit: "days",
          helpText: "Days of access granted for each referral",
        },
      ],
    },
    new_customer_referred: {
      id: "new_customer_referred",
      name: "New Customer Referred",
      icon: "🆕",
      color: "bg-yellow-500",
      borderColor: "border-yellow-500",
      lightBg: "bg-yellow-50",
      description: "Multiple sub-sections for referred new customers",
      eligibility: {
        title: "Referred New Customer Discount",
        whoGetsIt: "New customers who signed up via referral",
        howToQualify: ["Must be referred by existing customer", "Various criteria for sub-sections"],
        duration: "Configurable per sub-section",
      },
      hasConfig: true,
      sections: [
        {
          title: "Unsuccessful Referrals",
          subtitle: "When referred but didn't become customer yet",
          fields: [
            { key: "unsuccessfulReferralOfferDays", label: "Offer Duration", type: "dropdown", min: 1, max: 100, unit: "days" },
            { key: "unsuccessfulReferralCooldown", label: "Cooldown Period", type: "dropdown", min: 1, max: 100, unit: "days" },
          ],
        },
        {
          title: "Thank You for Becoming Customer",
          subtitle: "When referred and made first purchase",
          fields: [
            { key: "thankYouCustomerOfferDays", label: "Offer Duration", type: "dropdown", min: 1, max: 100, unit: "days" },
          ],
        },
        {
          title: "Inactive Buying Customers",
          subtitle: "When referred, bought, but now inactive",
          fields: [
            { key: "inactiveBuyerOfferDays", label: "Offer Duration", type: "dropdown", min: 1, max: 100, unit: "days" },
            { key: "inactiveBuyerThresholdDays", label: "Inactivity Threshold", type: "dropdown", min: 1, max: 100, unit: "days" },
            { key: "inactiveLastSeenDays", label: "Last Seen Threshold", type: "dropdown", min: 45, max: 100, unit: "days" },
            { key: "inactiveLastRepliedDays", label: "Last Replied Threshold", type: "dropdown", min: 45, max: 100, unit: "days" },
            { key: "inactiveLastPurchaseDays", label: "Last Purchase Threshold", type: "dropdown", min: 45, max: 200, unit: "days" },
          ],
        },
      ],
    },
    new_customer: {
      id: "new_customer",
      name: "New Customer",
      icon: "👋",
      color: "bg-orange-500",
      borderColor: "border-orange-500",
      lightBg: "bg-orange-50",
      description: "For brand new customers and returning customers",
      eligibility: {
        title: "New Customer Welcome Discount",
        whoGetsIt: "All new customers",
        howToQualify: ["New account creation", "Or returning after long inactivity"],
        duration: "Configurable below",
      },
      hasConfig: true,
      sections: [
        {
          title: "New Customer",
          subtitle: "Account not older than X days",
          fields: [
            { key: "newCustomerMaxAgeDays", label: "Max Account Age", type: "dropdown", min: 1, max: 100, unit: "days" },
          ],
        },
        {
          title: "New Returning Customer",
          subtitle: "Existing customer not bought for X days",
          fields: [
            { key: "returningCustomerInactiveDays", label: "Inactive Period", type: "dropdown", min: 200, max: 400, unit: "days" },
          ],
        },
      ],
    },
    shopping_30m: {
      id: "shopping_30m",
      name: "Shopping 30M Bill",
      icon: "💎",
      color: "bg-purple-500",
      borderColor: "border-purple-500",
      lightBg: "bg-purple-50",
      description: "VIP discount for high-value purchases",
      eligibility: {
        title: "VIP Single Purchase Discount",
        whoGetsIt: "Customers who made a single purchase of Rp 30,000,000+",
        howToQualify: ["Make a single order totaling at least Rp 30M", "Must be in one transaction"],
        duration: "Configurable below",
      },
      hasConfig: true,
      fields: [
        { key: "shopping30mBillSize", label: "Bill Size (Rp)", type: "fixed", value: 30000000, format: "currency" },
        { key: "shopping30mOfferDays", label: "Offer Duration", type: "dropdown", min: 1, max: 100, unit: "days" },
      ],
    },
    shopping_100m_60d: {
      id: "shopping_100m_60d",
      name: "Shopping 100M Last 60d",
      icon: "🏆",
      color: "bg-pink-500",
      borderColor: "border-pink-500",
      lightBg: "bg-pink-50",
      description: "Valued customer loyalty discount",
      eligibility: {
        title: "Valued Customer Loyalty Discount",
        whoGetsIt: "Customers who spent Rp 100M+ in the last 60 days",
        howToQualify: ["Cumulative spending of at least Rp 100M", "Within the last 60 days"],
        duration: "Always active while criteria met",
      },
      hasConfig: true,
      fields: [
        { key: "shopping100mBillSize", label: "Bill Size (Rp)", type: "fixed", value: 100000000, format: "currency" },
        { key: "shopping100mPeriodDays", label: "Time Period", type: "fixed", value: 60, unit: "days" },
      ],
    },
    everyone: {
      id: "everyone",
      name: "Everyone",
      icon: "🏷️",
      color: "bg-gray-500",
      borderColor: "border-gray-500",
      lightBg: "bg-gray-50",
      description: "Available to all customers",
      eligibility: {
        title: "General Discount",
        whoGetsIt: "All customers - no restrictions",
        howToQualify: ["No special requirements", "Available to everyone"],
        duration: "24/7 - Always available",
      },
      hasConfig: false,
    },
  };

  const windowOrder = [
    "foremen",
    "foremen_commission",
    "referral_3_days",
    "new_customer_referred",
    "new_customer",
    "shopping_30m",
    "shopping_100m_60d",
    "everyone",
  ];

  // Fetch all window configs
  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/discount-window-config`);
      if (response.data.success) {
        const configs = {};
        response.data.data.forEach((config) => {
          configs[config.windowId] = config;
        });
        setWindowConfigs(configs);
      }
    } catch (err) {
      console.error("Error fetching window configs:", err);
      toast.error("Failed to load window configurations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // Toggle window expansion
  const toggleExpand = (windowId) => {
    setExpandedWindows((prev) => ({
      ...prev,
      [windowId]: !prev[windowId],
    }));
  };

  // Handle toggle active/inactive
  const handleToggleActive = async (windowId) => {
    try {
      setSaving((prev) => ({ ...prev, [windowId]: true }));
      const response = await axios.patch(`${API_URL}/api/discount-window-config/${windowId}/toggle`);
      if (response.data.success) {
        setWindowConfigs((prev) => ({
          ...prev,
          [windowId]: response.data.data,
        }));
        toast.success(`${windowMetadata[windowId].name} is now ${response.data.data.isActive ? "active" : "inactive"}`);
      }
    } catch (err) {
      console.error("Error toggling window:", err);
      toast.error("Failed to toggle window status");
    } finally {
      setSaving((prev) => ({ ...prev, [windowId]: false }));
    }
  };

  // Handle field value change
  const handleFieldChange = (windowId, fieldKey, value) => {
    setWindowConfigs((prev) => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        [fieldKey]: parseInt(value, 10),
      },
    }));
    setUnsavedChanges((prev) => ({
      ...prev,
      [windowId]: true,
    }));
  };

  // Save window config
  const saveWindowConfig = async (windowId) => {
    try {
      setSaving((prev) => ({ ...prev, [windowId]: true }));
      const configToSave = windowConfigs[windowId];
      const response = await axios.put(`${API_URL}/api/discount-window-config/${windowId}`, configToSave);
      if (response.data.success) {
        setWindowConfigs((prev) => ({
          ...prev,
          [windowId]: response.data.data,
        }));
        setUnsavedChanges((prev) => ({
          ...prev,
          [windowId]: false,
        }));
        toast.success(`${windowMetadata[windowId].name} settings saved!`);
      }
    } catch (err) {
      console.error("Error saving window config:", err);
      toast.error("Failed to save settings");
    } finally {
      setSaving((prev) => ({ ...prev, [windowId]: false }));
    }
  };

  // Reset window to defaults
  const resetWindowConfig = async (windowId) => {
    try {
      setSaving((prev) => ({ ...prev, [windowId]: true }));
      const response = await axios.post(`${API_URL}/api/discount-window-config/${windowId}/reset`);
      if (response.data.success) {
        setWindowConfigs((prev) => ({
          ...prev,
          [windowId]: response.data.data,
        }));
        setUnsavedChanges((prev) => ({
          ...prev,
          [windowId]: false,
        }));
        toast.success(`${windowMetadata[windowId].name} reset to defaults`);
      }
    } catch (err) {
      console.error("Error resetting window:", err);
      toast.error("Failed to reset settings");
    } finally {
      setSaving((prev) => ({ ...prev, [windowId]: false }));
    }
  };

  // Generate dropdown options
  const generateOptions = (min, max) => {
    const options = [];
    for (let i = min; i <= max; i++) {
      options.push(i);
    }
    return options;
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Render a dropdown field
  const renderDropdownField = (windowId, field, value) => {
    const options = generateOptions(field.min, field.max);
    return (
      <div key={field.key} className="flex items-center justify-between py-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          {field.label}
          {field.helpText && (
            <span className="ml-1 text-gray-400 cursor-help" title={field.helpText}>
              <HelpCircle className="w-3 h-3" />
            </span>
          )}
        </label>
        <div className="flex items-center gap-2">
          <select
            value={value || field.min}
            onChange={(e) => handleFieldChange(windowId, field.key, e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-[100px]"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{field.unit}</span>
        </div>
      </div>
    );
  };

  // Render a fixed field
  const renderFixedField = (field) => {
    const displayValue = field.format === "currency" ? formatCurrency(field.value) : `${field.value} ${field.unit || ""}`;
    return (
      <div key={field.key} className="flex items-center justify-between py-2">
        <label className="text-sm font-medium text-gray-700">{field.label}</label>
        <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">{displayValue}</div>
      </div>
    );
  };

  // Render window panel
  const renderWindowPanel = (windowId) => {
    const meta = windowMetadata[windowId];
    const config = windowConfigs[windowId] || {};
    const isExpanded = expandedWindows[windowId];
    const hasUnsaved = unsavedChanges[windowId];
    const isSaving = saving[windowId];
    const isActive = config.isActive !== undefined ? config.isActive : true;

    return (
      <div
        key={windowId}
        className={`bg-white rounded-2xl shadow-sm border-2 ${meta.borderColor} overflow-hidden transition-all duration-300 ${
          !isActive ? "opacity-60" : ""
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between cursor-pointer ${meta.lightBg} hover:brightness-95 transition-all`}
          onClick={() => meta.hasConfig && toggleExpand(windowId)}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                {meta.name}
                {hasUnsaved && <span className="text-xs text-orange-500 font-normal">• Unsaved changes</span>}
              </h3>
              <p className="text-xs text-gray-500">{meta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Info button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setInfoModal(windowId);
              }}
              className="p-1.5 hover:bg-white/50 rounded-full transition-colors"
              title="View eligibility info"
            >
              <HelpCircle className="w-4 h-4 text-gray-500" />
            </button>

            {/* Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleActive(windowId);
              }}
              disabled={isSaving}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {isActive ? "Active" : "Inactive"}
            </button>

            {/* Expand arrow for configurable windows */}
            {meta.hasConfig && (isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />)}
          </div>
        </div>

        {/* Expanded content */}
        {meta.hasConfig && isExpanded && (
          <div className="px-5 py-4 border-t border-gray-100">
            {/* If has sections */}
            {meta.sections ? (
              <div className="space-y-4">
                {meta.sections.map((section, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-800">{section.title}</h4>
                      {section.subtitle && <p className="text-xs text-gray-500">{section.subtitle}</p>}
                    </div>
                    <div className="space-y-1">
                      {section.fields.map((field) =>
                        field.type === "dropdown"
                          ? renderDropdownField(windowId, field, config[field.key])
                          : renderFixedField(field)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Simple fields */
              <div className="space-y-1">
                {meta.fields?.map((field) =>
                  field.type === "dropdown" ? renderDropdownField(windowId, field, config[field.key]) : renderFixedField(field)
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => resetWindowConfig(windowId)}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
                Reset
              </button>
              <button
                onClick={() => saveWindowConfig(windowId)}
                disabled={isSaving || !hasUnsaved}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg transition-all ${
                  hasUnsaved
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render info modal
  const renderInfoModal = () => {
    if (!infoModal) return null;
    const meta = windowMetadata[infoModal];
    if (!meta) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setInfoModal(null)}>
        <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className={`px-6 py-4 ${meta.color} text-white flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{meta.icon}</span>
              <h3 className="font-semibold">{meta.eligibility?.title || meta.name}</h3>
            </div>
            <button onClick={() => setInfoModal(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                <Users className="w-4 h-4" /> Who gets it?
              </h4>
              <p className="text-sm text-gray-800 mt-1">{meta.eligibility?.whoGetsIt}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> How to qualify
              </h4>
              <ul className="mt-1 space-y-1">
                {meta.eligibility?.howToQualify?.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Duration
              </h4>
              <p className="text-sm text-gray-800 mt-1">{meta.eligibility?.duration}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onToggle={(isOpen) => setIsSidebarOpen(isOpen)} />

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-80" : "ml-0"} overflow-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Settings className="w-7 h-7 mr-3 text-purple-600" />
              Discount Policies
            </h1>
            <p className="text-gray-500 mt-1">Configure eligibility criteria and duration for each discount window</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">Total Windows</div>
              <div className="text-2xl font-bold text-gray-800">8</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
              <div className="text-sm text-gray-500">Active</div>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(windowConfigs).filter((c) => c.isActive !== false).length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
              <div className="text-sm text-gray-500">Configurable</div>
              <div className="text-2xl font-bold text-orange-600">5</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
              <div className="text-sm text-gray-500">Always On</div>
              <div className="text-2xl font-bold text-purple-600">3</div>
            </div>
          </div>

          {/* Windows Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-500">Loading configurations...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{windowOrder.map((windowId) => renderWindowPanel(windowId))}</div>
          )}
        </div>
      </div>

      {/* Info Modal */}
      {renderInfoModal()}
    </div>
  );
};

export default DiscountPolicies;
