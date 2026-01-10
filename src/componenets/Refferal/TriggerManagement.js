// TriggerManagement.js - View and Edit Triggers (No Delete/Create)
import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  CheckCircle,
  Edit,
  ToggleLeft,
  ToggleRight,
  Info,
  X,
  TrendingUp,
  MessageSquare,
  Zap,
  Save,
  AlertTriangle,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/config";

// Trigger type explanations (same as before)
const TRIGGER_EXPLANATIONS = {
  referral_threshold: {
    title: "Referral Threshold Trigger",
    description: "Automatically sends a message when a customer has been referred by multiple people.",
    howItWorks: "When a potential customer receives referrals from 5+ different people (configurable), the system sends them an encouraging message to make their first purchase. This leverages social proof to increase conversion.",
    example: "Sarah has been referred by 5 friends. System sends: 'Hi Sarah, you've been recommended by 5 friends! Use code SARAH123 for 10% off your first order.'",
    benefits: ["Increases conversion from referred customers", "Leverages social proof", "Automated timing"],
  },
  purchase_conversion: {
    title: "Purchase Conversion Trigger",
    description: "Automatically stops referral messages once a customer makes their first purchase.",
    howItWorks: "When a referred customer completes their first order, this trigger automatically disables referral encouragement messages for them to prevent message fatigue.",
    example: "John completes his first order → System automatically sets referralMessagesEnabled = false → No more referral messages sent to John.",
    benefits: ["Prevents customer annoyance", "Reduces message spam", "Improves brand perception"],
  },
  inactive_customer: {
    title: "Inactive Customer Trigger",
    description: "Re-engages customers who haven't purchased in a while.",
    howItWorks: "Monitors days since last purchase. When a customer exceeds the threshold (default: 30 days), sends a re-engagement message with a special offer.",
    example: "Mike's last order was 45 days ago → System sends: 'Hi Mike, we miss you! Here's 15% off your next purchase to welcome you back.'",
    benefits: ["Recovers lapsed customers", "Increases customer lifetime value", "Reduces churn"],
  },
  dormant_customer: {
    title: "Dormant Customer Trigger",
    description: "Targets customers with no activity (messages, cart updates, browsing) for an extended period.",
    howItWorks: "Tracks lastInteraction timestamp. When no activity for 60+ days (configurable), sends a stronger re-engagement message with higher incentive.",
    example: "Lisa hasn't interacted in 75 days → System sends: 'Hi Lisa, we'd love to have you back! Here's 20% off, valid for 7 days.'",
    benefits: ["Last-chance customer recovery", "Identifies truly inactive customers", "Stronger incentives for dormant users"],
  },
  abandoned_cart: {
    title: "Abandoned Cart Trigger (NEW)",
    description: "Reminds customers about items left in their cart.",
    howItWorks: "Monitors cart status. After 24 hours with items in 'cart-not-paid' status, sends reminder with optional incentive.",
    example: "Emma added $85 to cart yesterday → System sends: 'Hi Emma, you left items in your cart! Complete your order now for free delivery.'",
    benefits: ["15-25% cart recovery rate", "Significant revenue recovery", "Automated follow-up"],
    isNew: true,
  },
  first_order_completion: {
    title: "First Order Completion Trigger (NEW)",
    description: "Thanks new customers and encourages referrals while satisfaction is high.",
    howItWorks: "Detects first order completion. Sends thank you message 2 hours after delivery with referral code reminder.",
    example: "David receives first order → System sends: 'Thank you David! Share your experience with friends using code DAVID789 and earn rewards!'",
    benefits: ["Increases referral generation", "Strengthens customer relationship", "Capitalizes on positive emotions"],
    isNew: true,
  },
  repeat_customer_milestone: {
    title: "Repeat Customer Milestone Trigger (NEW)",
    description: "Rewards loyal customers at order milestones.",
    howItWorks: "Tracks total completed orders. At configured milestones (5th, 10th, 20th order), sends congratulations with reward.",
    example: "Emma places 10th order → System sends: 'Congratulations Emma! Here's $20 credit for your loyalty!'",
    benefits: ["Increased retention", "Higher lifetime value", "Emotional connection through recognition"],
    isNew: true,
  },
  high_value_customer: {
    title: "High-Value Customer Trigger (NEW)",
    description: "Upgrades customers to VIP status when spending exceeds threshold.",
    howItWorks: "Calculates total spending. When crossing $500/$1000/$2000 thresholds, grants VIP status with exclusive benefits.",
    example: "Robert spends $750 → System sends: 'You're now a VIP! Enjoy priority service, early access to products, and 5% discount on all orders.'",
    benefits: ["Stronger loyalty from top customers", "Increased average order value", "Word-of-mouth from VIPs"],
    isNew: true,
  },
  referral_success: {
    title: "Referral Success Trigger (NEW)",
    description: "Notifies referrers when their referrals make purchases.",
    howItWorks: "Monitors referred customer purchases. When a referral completes first order, notifies original referrer with commission details.",
    example: "Your friend Mike makes first purchase → System sends: 'Great news! Mike just purchased. You've earned $5 commission!'",
    benefits: ["Motivated referrers", "Viral growth", "Transparent reward system"],
    isNew: true,
  },
  video_upload_reminder: {
    title: "Video Upload Reminder Trigger (NEW)",
    description: "Encourages customers to create referral videos.",
    howItWorks: "Identifies customers with referral codes but no videos. After 7 days, sends reminder with instructions.",
    example: "You got referral code 10 days ago, no video → System sends: 'Create your 2-minute referral video and start earning rewards!'",
    benefits: ["Increased video creation", "More referral content", "Higher program participation"],
    isNew: true,
  },
  seasonal_promotion: {
    title: "Seasonal Promotion Trigger (NEW)",
    description: "Sends promotional messages during specific date ranges.",
    howItWorks: "Administrator configures date range and target audience. System sends promotional message to all eligible customers at scheduled time.",
    example: "Holiday week → System sends to all active customers: 'Holiday Sale! 25% off everything this week only!'",
    benefits: ["Coordinated marketing campaigns", "Increased seasonal sales", "Efficient bulk messaging"],
    isNew: true,
  },
  payment_pending: {
    title: "Payment Pending Trigger (NEW)",
    description: "Reminds customers to upload payment receipts.",
    howItWorks: "Monitors orders in 'order-made-not-paid' status. After 2 hours, sends payment reminder with instructions.",
    example: "Order created 3 hours ago, no payment → System sends: 'Please upload your payment receipt to confirm your order.'",
    benefits: ["Reduced abandoned orders", "Faster payment confirmation", "Better cash flow"],
    isNew: true,
  },
  delivery_scheduled: {
    title: "Delivery Scheduled Trigger (NEW)",
    description: "Reminds customers about upcoming deliveries.",
    howItWorks: "Checks orders with delivery date = tomorrow. Sends reminder 12-18 hours before with driver details and time slot.",
    example: "Delivery tomorrow 2-4 PM → System sends tonight: 'Your order will be delivered tomorrow 2-4 PM. Driver: Ahmed (555-1234).'",
    benefits: ["Fewer failed deliveries", "Better customer experience", "Reduced driver time wasted"],
    isNew: true,
  },
  post_delivery_feedback: {
    title: "Post-Delivery Feedback Trigger (NEW)",
    description: "Collects customer feedback after delivery.",
    howItWorks: "Waits 24 hours after delivery completion. Sends feedback request with simple rating interface.",
    example: "Order delivered yesterday → System sends: 'How was your delivery? Rate your experience: ⭐⭐⭐⭐⭐'",
    benefits: ["Valuable feedback data", "Early problem detection", "Improved satisfaction"],
    isNew: true,
  },
};

const TRIGGER_TYPES = [
  { value: "referral_threshold", label: "Referral Threshold" },
  { value: "purchase_conversion", label: "Purchase Conversion" },
  { value: "inactive_customer", label: "Inactive Customer" },
  { value: "dormant_customer", label: "Dormant Customer" },
  { value: "abandoned_cart", label: "Abandoned Cart (NEW)" },
  { value: "first_order_completion", label: "First Order Completion (NEW)" },
  { value: "repeat_customer_milestone", label: "Repeat Customer Milestone (NEW)" },
  { value: "high_value_customer", label: "High-Value Customer (NEW)" },
  { value: "referral_success", label: "Referral Success (NEW)" },
  { value: "video_upload_reminder", label: "Video Upload Reminder (NEW)" },
  { value: "seasonal_promotion", label: "Seasonal Promotion (NEW)" },
  { value: "payment_pending", label: "Payment Pending (NEW)" },
  { value: "delivery_scheduled", label: "Delivery Scheduled (NEW)" },
  { value: "post_delivery_feedback", label: "Post-Delivery Feedback (NEW)" },
];

// Explanation Modal Component
function ExplanationModal({ triggerType, onClose }) {
  const explanation = TRIGGER_EXPLANATIONS[triggerType];
  if (!explanation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center">
            <Info className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">
              {explanation.title}
              {explanation.isNew && (
                <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">NEW</span>
              )}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h4>
            <p className="text-gray-700">{explanation.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">How It Works</h4>
            <p className="text-gray-700">{explanation.howItWorks}</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Example</h4>
            <p className="text-blue-800 italic">{explanation.example}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Benefits</h4>
            <ul className="space-y-2">
              {explanation.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

// Create/Edit Modal Component
function TriggerModal({ trigger, onClose, onSave }) {
  const [formData, setFormData] = useState({
    triggerName: trigger?.triggerName || "",
    triggerType: trigger?.triggerType || "",
    description: trigger?.description || "",
    isNew: trigger?.isNew || false,
    configuration: {
      thresholdCount: trigger?.configuration?.thresholdCount || 5,
      daysPeriod: trigger?.configuration?.daysPeriod || 30,
      spendThreshold: trigger?.configuration?.spendThreshold || 500,
      messageTemplate: trigger?.configuration?.messageTemplate || "",
      cooldownDays: trigger?.configuration?.cooldownDays || 30,
      executionSchedule: trigger?.configuration?.executionSchedule || "hourly",
    },
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {trigger ? "Edit Trigger" : "Create New Trigger"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trigger Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Name *
            </label>
            <input
              type="text"
              required
              value={formData.triggerName}
              onChange={(e) => setFormData({ ...formData, triggerName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 30-Day Inactive Reminder"
            />
          </div>

          {/* Trigger Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Type *
            </label>
            <select
              required
              value={formData.triggerType}
              onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={!!trigger} // Can't change type when editing
            >
              <option value="">Select trigger type...</option>
              {TRIGGER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="3"
              placeholder="Brief description of what this trigger does..."
            />
          </div>

          {/* Configuration based on trigger type */}
          {formData.triggerType && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h4 className="font-semibold text-gray-900">Configuration</h4>

              {/* Threshold Count (for referral_threshold) */}
              {formData.triggerType === "referral_threshold" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Threshold Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.configuration.thresholdCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        configuration: {
                          ...formData.configuration,
                          thresholdCount: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {/* Days Period (for time-based triggers) */}
              {["inactive_customer", "dormant_customer", "abandoned_cart", "video_upload_reminder"].includes(
                formData.triggerType
              ) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days Period
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.configuration.daysPeriod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        configuration: {
                          ...formData.configuration,
                          daysPeriod: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {/* Spend Threshold (for high_value_customer) */}
              {formData.triggerType === "high_value_customer" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spend Threshold ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.configuration.spendThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        configuration: {
                          ...formData.configuration,
                          spendThreshold: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {/* Message Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Template *
                </label>
                <textarea
                  required
                  value={formData.configuration.messageTemplate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      configuration: {
                        ...formData.configuration,
                        messageTemplate: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="Use {name}, {count}, {referralCode} as placeholders..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available placeholders: {"{name}"}, {"{count}"}, {"{referralCode}"}
                </p>
              </div>

              {/* Execution Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Execution Schedule
                </label>
                <select
                  value={formData.configuration.executionSchedule}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      configuration: {
                        ...formData.configuration,
                        executionSchedule: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {trigger ? "Update Trigger" : "Create Trigger"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Horizontal Trigger Row Component
function TriggerRow({ trigger, onToggle, onEdit, onViewExplanation }) {
  const getTypeColor = (type) => {
    const colors = {
      referral_threshold: "blue",
      purchase_conversion: "green",
      inactive_customer: "orange",
      dormant_customer: "purple",
      abandoned_cart: "pink",
      first_order_completion: "indigo",
      repeat_customer_milestone: "yellow",
      high_value_customer: "red",
      referral_success: "teal",
      video_upload_reminder: "cyan",
      seasonal_promotion: "lime",
      payment_pending: "amber",
      delivery_scheduled: "emerald",
      post_delivery_feedback: "violet",
    };
    return colors[type] || "gray";
  };

  const color = getTypeColor(trigger.triggerType);
  const borderColor = trigger.isActive ? `border-l-4 border-l-${color}-500` : "border-l-4 border-l-gray-300";

  return (
    <div className={`bg-white ${borderColor} rounded-lg p-4 hover:shadow-md transition-all mb-2`}>
      <div className="flex items-center">
        {/* Toggle */}
        <button 
          onClick={() => onToggle(trigger._id)} 
          title={trigger.isActive ? "Deactivate" : "Activate"}
          className="flex-shrink-0 mr-4"
        >
          {trigger.isActive ? (
            <ToggleRight className="h-8 w-8 text-green-500" />
          ) : (
            <ToggleLeft className="h-8 w-8 text-gray-400" />
          )}
        </button>

        {/* Name & Description - Fixed width */}
        <div className="w-96 flex-shrink-0 mr-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 truncate">{trigger.triggerName}</h3>
            {trigger.isNew && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">NEW</span>
            )}
            <button
              onClick={() => onViewExplanation(trigger.triggerType)}
              className="text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0"
              title="Learn more"
            >
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm text-gray-600 truncate">{trigger.description}</p>
        </div>

        {/* Stats - Inline */}
        <div className="flex items-center gap-6 flex-shrink-0 mr-4">
          <div className="text-center w-20">
            <p className="text-xl font-bold text-gray-900">{trigger.executionStats?.totalExecutions || 0}</p>
            <p className="text-xs text-gray-500">Executions</p>
          </div>
          <div className="text-center w-16">
            <p className="text-xl font-bold text-green-600">{trigger.successRate || 0}%</p>
            <p className="text-xs text-gray-500">Success</p>
          </div>
          <div className="text-center w-20">
            <p className="text-sm text-gray-600">
              {trigger.executionStats?.lastExecutedAt
                ? new Date(trigger.executionStats.lastExecutedAt).toLocaleDateString()
                : "Never"}
            </p>
            <p className="text-xs text-gray-500">Last Run</p>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => onEdit(trigger)}
          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition flex-shrink-0"
          title="Edit"
        >
          <Edit size={18} />
        </button>
      </div>
    </div>
  );
}

export default function TriggerManagement() {
  const [triggers, setTriggers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null);
  const [showExplanation, setShowExplanation] = useState(null);

  useEffect(() => {
    fetchTriggers();
    fetchStats();
  }, []);

  const fetchTriggers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/triggers`);
      const data = await response.json();
      if (data.success) {
        setTriggers(data.data);
      }
    } catch (error) {
      console.error("Error fetching triggers:", error);
      alert("Failed to load triggers");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/triggers/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/triggers/${id}/toggle`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        fetchTriggers();
        fetchStats();
      }
    } catch (error) {
      console.error("Error toggling trigger:", error);
      alert("Failed to toggle trigger");
    }
  };

  const handleSave = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/triggers/${editingTrigger._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Trigger updated successfully!");
        setShowModal(false);
        setEditingTrigger(null);
        fetchTriggers();
        fetchStats();
      } else {
        alert(data.message || "Failed to save trigger");
      }
    } catch (error) {
      console.error("Error saving trigger:", error);
      alert("Failed to save trigger");
    }
  };

  const handleEdit = (trigger) => {
    setEditingTrigger(trigger);
    setShowModal(true);
  };

  // Filter triggers
  const filteredTriggers = triggers.filter((trigger) => {
    const matchesSearch =
      trigger.triggerName.toLowerCase().includes(search.toLowerCase()) ||
      trigger.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && trigger.isActive) ||
      (filterStatus === "inactive" && !trigger.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="mr-3 text-purple-500" size={28} />
            Trigger Management
          </h2>
          <p className="text-gray-600 mt-1">View and configure automated customer engagement triggers</p>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Triggers</p>
                <p className="text-3xl font-bold mt-1">{stats.totalTriggers}</p>
              </div>
              <Zap className="h-10 w-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Triggers</p>
                <p className="text-3xl font-bold mt-1">{stats.activeTriggers}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Messages Sent</p>
                <p className="text-3xl font-bold mt-1">{stats.totalExecutions}</p>
              </div>
              <MessageSquare className="h-10 w-10 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold mt-1">{stats.successRate}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-200" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -mt-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search triggers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Triggers List (Horizontal) */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
          <p className="mt-4 text-gray-500">Loading triggers...</p>
        </div>
      ) : filteredTriggers.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Triggers ({filteredTriggers.length})
          </h3>
          <div className="space-y-3">
            {filteredTriggers.map((trigger) => (
              <TriggerRow
                key={trigger._id}
                trigger={trigger}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onViewExplanation={(type) => setShowExplanation(type)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No triggers found</p>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <TriggerModal
          trigger={editingTrigger}
          onClose={() => {
            setShowModal(false);
            setEditingTrigger(null);
          }}
          onSave={handleSave}
        />
      )}

      {showExplanation && (
        <ExplanationModal
          triggerType={showExplanation}
          onClose={() => setShowExplanation(null)}
        />
      )}
    </div>
  );
}
