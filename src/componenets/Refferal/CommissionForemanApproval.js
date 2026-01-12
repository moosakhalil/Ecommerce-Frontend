import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Shield,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";

export default function CommissionForemanApproval() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [activeTab]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Only fetch approved foremen
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers?status=approved_foreman`
      );
      const data = await response.json();
      if (data.success) {
        // Filter based on commission status
        let filtered = data.customers;
        if (activeTab === "pending") {
          filtered = data.customers.filter(c => !c.isCommissionEligible);
        } else if (activeTab === "approved") {
          filtered = data.customers.filter(c => c.isCommissionEligible);
        }
        setCustomers(filtered);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers/stats/overview`
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateCommissionEligibility = async (customerId, isEligible) => {
    try {
      setUpdating(true);
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers/update-commission-eligibility`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            isEligible,
            staffId: "ADMIN001",
            staffName: "Admin User",
            reason: `${isEligible ? "Approved" : "Revoked"} commission eligibility`,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchCustomers();
        await fetchStats();
        alert(
          `Customer ${isEligible ? "approved" : "revoked"} for commission eligibility`
        );
      } else {
        alert("Failed to update commission eligibility: " + data.message);
      }
    } catch (error) {
      console.error("Error updating commission eligibility:", error);
      alert("Error updating commission eligibility");
    } finally {
      setUpdating(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.phoneNumber?.includes(search) ||
      customer.referralCode?.toLowerCase().includes(search.toLowerCase())
  );

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      
      <div style={{ 
        flex: 1, 
        padding: '24px 32px', 
        marginLeft: '320px',
        backgroundColor: '#ffffff',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            💰 154. Approval Of Foreman With Commission
          </h1>
          <p style={{ color: '#6b7280' }}>
            Approve or revoke commission eligibility for approved foremen
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={cardStyle}>
            <Shield size={24} style={{ color: '#16a34a', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.approvedForeman || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Approved Foreman</div>
          </div>
          <div style={cardStyle}>
            <UserCheck size={24} style={{ color: '#f59e0b', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              {(stats.approvedForeman || 0) - (stats.commissionEligible || 0)}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Pending Commission</div>
          </div>
          <div style={cardStyle}>
            <ShieldCheck size={24} style={{ color: '#8b5cf6', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.commissionEligible || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Commission Eligible</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab("pending")}
            style={{
              padding: '10px 24px',
              backgroundColor: activeTab === "pending" ? '#8b5cf6' : '#f1f5f9',
              color: activeTab === "pending" ? '#ffffff' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <Shield size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Pending Commission
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            style={{
              padding: '10px 24px',
              backgroundColor: activeTab === "approved" ? '#8b5cf6' : '#f1f5f9',
              color: activeTab === "approved" ? '#ffffff' : '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <ShieldCheck size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Commission Approved
          </button>
        </div>

        {/* Info Box */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Shield size={20} style={{ color: '#d97706' }} />
          <span style={{ color: '#92400e', fontSize: '14px' }}>
            Only <strong>approved foremen</strong> are shown here. To approve a foreman, go to page 153.
          </span>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '400px' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or referral code..."
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              color: '#1f2937'
            }}
          />
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Foreman</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Foreman Since</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Commission Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Referrals</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    Loading foremen...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No foremen found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>{customer.name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>{customer.phoneNumber}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{customer.referralCode}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '13px' }}>
                      {customer.foremanApprovalDate 
                        ? new Date(customer.foremanApprovalDate).toLocaleDateString() 
                        : '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {customer.isCommissionEligible ? (
                        <span style={{ 
                          padding: '4px 12px', 
                          backgroundColor: '#ede9fe', 
                          color: '#7c3aed', 
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          ✓ Commission Eligible
                        </span>
                      ) : (
                        <span style={{ 
                          padding: '4px 12px', 
                          backgroundColor: '#fef3c7', 
                          color: '#d97706', 
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          Pending
                        </span>
                      )}
                      {customer.commissionEligibilityDate && (
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                          Since: {new Date(customer.commissionEligibilityDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1f2937' }}>
                        <UserCheck size={14} style={{ color: '#16a34a' }} />
                        {customer.successfulReferrals || 0} / {customer.totalReferrals || 0}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {!customer.isCommissionEligible ? (
                        <button
                          onClick={() => updateCommissionEligibility(customer._id, true)}
                          disabled={updating}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#8b5cf6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: updating ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            opacity: updating ? 0.6 : 1
                          }}
                        >
                          <CheckCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                          Approve Commission
                        </button>
                      ) : (
                        <button
                          onClick={() => updateCommissionEligibility(customer._id, false)}
                          disabled={updating}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: updating ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            opacity: updating ? 0.6 : 1
                          }}
                        >
                          <XCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                          Revoke Commission
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
