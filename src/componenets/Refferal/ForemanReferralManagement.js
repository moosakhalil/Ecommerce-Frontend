import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  User,
  DollarSign,
  Users,
  Calendar,
  Phone,
  CreditCard,
  TrendingUp,
  UserCheck,
  Shield,
  ShieldCheck,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
} from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { API_BASE_URL } from "../../utils/config";

// New Customer Only Rule Info Component
const FiveDayRuleInfo = () => (
  <div style={{
    backgroundColor: '#e0f2fe',
    border: '1px solid #0ea5e9',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }}>
    <Info size={24} style={{ color: '#0369a1' }} />
    <div>
      <strong style={{ color: '#0369a1' }}>Referral Policy</strong>
      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#475569' }}>
        <strong>Only NEW customers</strong> can be referred.<br/>
        <strong>Existing customers</strong> already in the system cannot be referred.
      </p>
    </div>
  </div>
);

// Banking Style Ledger Table
const CommissionLedgerTable = ({ ledger, title }) => {
  if (!ledger || ledger.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
        No commission transactions yet
      </div>
    );
  }

  const thStyle = {
    padding: '12px 8px',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '2px solid #e2e8f0',
    color: '#374151'
  };

  const tdStyle = {
    padding: '10px 8px',
    verticalAlign: 'top',
    color: '#1f2937'
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <h4 style={{ marginBottom: '12px', color: '#1f2937' }}>{title}</h4>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        fontSize: '14px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9' }}>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Bill No.</th>
            <th style={thStyle}>From Customer</th>
            <th style={{...thStyle, color: '#16a34a'}}>+ (Credit)</th>
            <th style={{...thStyle, color: '#dc2626'}}>- (Debit)</th>
            <th style={thStyle}>Balance</th>
            <th style={thStyle}>Note</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((entry, idx) => (
            <tr key={entry.transactionId || idx} style={{ 
              borderBottom: '1px solid #e2e8f0' 
            }}>
              <td style={tdStyle}>
                {new Date(entry.date).toLocaleDateString()}<br/>
                <small style={{ color: '#6b7280' }}>{new Date(entry.date).toLocaleTimeString()}</small>
              </td>
              <td style={tdStyle}>{entry.billNumber || '-'}</td>
              <td style={tdStyle}>
                {entry.fromReferredCustomer?.customerName || '-'}
                {entry.fromReferredCustomer?.phoneNumber && (
                  <><br/><small style={{ color: '#6b7280' }}>{entry.fromReferredCustomer.phoneNumber}</small></>
                )}
              </td>
              <td style={{...tdStyle, color: '#16a34a', fontWeight: 'bold'}}>
                {entry.credit > 0 ? `Rs. ${entry.credit.toFixed(2)}` : '-'}
              </td>
              <td style={{...tdStyle, color: '#dc2626', fontWeight: 'bold'}}>
                {entry.debit > 0 ? `Rs. ${entry.debit.toFixed(2)}` : '-'}
              </td>
              <td style={{...tdStyle, fontWeight: 'bold', color: '#2563eb'}}>
                Rs. {entry.balanceAfter?.toFixed(2) || '0.00'}
              </td>
              <td style={tdStyle}>{entry.note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Commission Wallet Section
const CommissionWalletSection = ({ customerId }) => {
  const [walletData, setWalletData] = useState(null);
  const [showFullList, setShowFullList] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, [customerId]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers/${customerId}/commission-ledger`
      );
      const data = await response.json();
      if (data.success) {
        setWalletData(data);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#6b7280', padding: '20px' }}>Loading commission wallet...</div>;
  if (!walletData) return <div style={{ color: '#6b7280', padding: '20px' }}>No wallet data</div>;

  const summaryCardStyle = {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    border: '1px solid #e2e8f0'
  };

  return (
    <div>
      {/* Wallet Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={summaryCardStyle}>
          <span style={{ color: '#16a34a' }}>Total Earned</span>
          <strong style={{ fontSize: '20px', color: '#1f2937' }}>Rs. {walletData.totalCredits?.toFixed(2) || '0.00'}</strong>
        </div>
        <div style={summaryCardStyle}>
          <span style={{ color: '#dc2626' }}>Total Used</span>
          <strong style={{ fontSize: '20px', color: '#1f2937' }}>Rs. {walletData.totalDebits?.toFixed(2) || '0.00'}</strong>
        </div>
        <div style={summaryCardStyle}>
          <span style={{ color: '#2563eb' }}>Available Balance</span>
          <strong style={{ fontSize: '20px', color: '#1f2937' }}>Rs. {walletData.currentBalance?.toFixed(2) || '0.00'}</strong>
        </div>
      </div>

      {/* Latest 5 Bills */}
      <CommissionLedgerTable 
        ledger={walletData.latest5} 
        title="📊 Latest 5 Commission Transactions" 
      />

      {/* Full List Toggle */}
      <div 
        onClick={() => setShowFullList(!showFullList)}
        style={{
          padding: '12px',
          backgroundColor: '#f1f5f9',
          borderRadius: '8px',
          marginTop: '16px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#1f2937',
          border: '1px solid #e2e8f0'
        }}
      >
        <span>📋 Full Transaction History ({walletData.total} entries)</span>
        <span>{showFullList ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
      </div>

      {/* Full List */}
      {showFullList && (
        <div style={{ marginTop: '16px' }}>
          <CommissionLedgerTable 
            ledger={walletData.allEntries} 
            title="Full Commission History" 
          />
        </div>
      )}
    </div>
  );
};

// Referral Validation Form
const ReferralValidationForm = ({ onSuccess }) => {
  const [customerPhone, setCustomerPhone] = useState("");
  const [referrerPhone, setReferrerPhone] = useState("");
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleValidate = async () => {
    if (!customerPhone || !referrerPhone) {
      alert("Please enter both phone numbers");
      return;
    }

    setValidating(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers/validate-referral`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerPhone, referrerPhone })
        }
      );
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error validating:", error);
      setResult({ success: false, reason: "Error connecting to server" });
    } finally {
      setValidating(false);
    }
  };

  const handleCreateReferral = async () => {
    setCreating(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/foreman-customers/create-referral`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            customerPhone, 
            referrerPhone,
            customerName: result?.customerName || "Customer" 
          })
        }
      );
      const data = await response.json();
      
      if (data.success) {
        alert("Referral created successfully!");
        setCustomerPhone("");
        setReferrerPhone("");
        setResult(null);
        if (onSuccess) onSuccess();
      } else {
        alert("Failed to create referral: " + data.message);
      }
    } catch (error) {
      console.error("Error creating referral:", error);
      alert("Error creating referral");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '24px',
      border: '1px solid #e2e8f0'
    }}>
      <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>
        <UserCheck size={20} style={{ marginRight: '8px' }} />
        Create New Referral
      </h3>
      
      <FiveDayRuleInfo />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>
            Customer Phone Number (to be referred)
          </label>
          <input
            type="text"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="e.g., 923001234567"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#1f2937'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>
            Referrer Phone Number (who is referring)
          </label>
          <input
            type="text"
            value={referrerPhone}
            onChange={(e) => setReferrerPhone(e.target.value)}
            placeholder="e.g., 923009876543"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#1f2937'
            }}
          />
        </div>
        <button
          onClick={handleValidate}
          disabled={validating}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: validating ? 'not-allowed' : 'pointer',
            opacity: validating ? 0.7 : 1
          }}
        >
          {validating ? "Checking..." : "Validate"}
        </button>
      </div>

      {/* Validation Result */}
      {result && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: result.canRefer ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${result.canRefer ? '#16a34a' : '#dc2626'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {result.canRefer ? (
              <CheckCircle size={24} style={{ color: '#16a34a' }} />
            ) : (
              <XCircle size={24} style={{ color: '#dc2626' }} />
            )}
            <div>
              <strong style={{ color: result.canRefer ? '#16a34a' : '#dc2626' }}>
                {result.canRefer ? "✅ Can Be Referred" : "❌ Cannot Be Referred"}
              </strong>
              <p style={{ margin: '4px 0 0 0', color: '#1f2937' }}>{result.reason}</p>
              {result.referrerName && (
                <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                  Referrer: {result.referrerName}
                </p>
              )}
            </div>
          </div>
          
          {result.canRefer && (
            <button
              onClick={handleCreateReferral}
              disabled={creating}
              style={{
                marginTop: '12px',
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.7 : 1
              }}
            >
              {creating ? "Creating..." : "Create Referral Link"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Main Component
export default function ForemanReferralManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("referrals");
  const [search, setSearch] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchReferrals();
    fetchStats();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/foreman-customers/referrals/all`);
      const data = await response.json();

      if (data.success) {
        setReferrals(data.referrals);
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/foreman-customers/stats/overview`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const filteredReferrals = referrals.filter(
    (ref) =>
      ref.referrerName?.toLowerCase().includes(search.toLowerCase()) ||
      ref.referredCustomerName?.toLowerCase().includes(search.toLowerCase()) ||
      ref.referrerPhone?.includes(search) ||
      ref.referredCustomerPhone?.includes(search)
  );

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
            👥 Foreman Referral Management
          </h1>
          <p style={{ color: '#6b7280' }}>
            Manage customer referrals with 5-day rule validation and commission tracking
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={cardStyle}>
            <Users size={24} style={{ color: '#2563eb', marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.totalReferrals || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Referrals</div>
          </div>
          <div style={cardStyle}>
            <UserCheck size={24} style={{ color: '#16a34a', marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.successfulReferrals || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Successful</div>
          </div>
          <div style={cardStyle}>
            <Shield size={24} style={{ color: '#f59e0b', marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.approvedForeman || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Approved Foremen</div>
          </div>
          <div style={cardStyle}>
            <ShieldCheck size={24} style={{ color: '#8b5cf6', marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.commissionEligible || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Commission Eligible</div>
          </div>
          <div style={cardStyle}>
            <DollarSign size={24} style={{ color: '#16a34a', marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              Rs. {(stats.totalCommissionEarned || 0).toFixed(0)}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Commission</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '16px'
        }}>
          <button
            onClick={() => setActiveTab("referrals")}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === "referrals" ? '#2563eb' : '#f1f5f9',
              color: activeTab === "referrals" ? '#ffffff' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            All Referrals
          </button>
          <button
            onClick={() => setActiveTab("create")}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === "create" ? '#2563eb' : '#f1f5f9',
              color: activeTab === "create" ? '#ffffff' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Create Referral
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === "wallet" ? '#2563eb' : '#f1f5f9',
              color: activeTab === "wallet" ? '#ffffff' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Commission Wallet
          </button>
        </div>

        {/* Create Referral Tab */}
        {activeTab === "create" && (
          <ReferralValidationForm onSuccess={fetchReferrals} />
        )}

        {/* Wallet Tab */}
        {activeTab === "wallet" && (
          <div>
            <FiveDayRuleInfo />
            {selectedCustomer ? (
              <div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  style={{
                    marginBottom: '16px',
                    padding: '8px 16px',
                    backgroundColor: '#f1f5f9',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to List
                </button>
                <h3 style={{ color: '#1f2937', marginBottom: '16px' }}>
                  Commission Wallet: {selectedCustomer.name}
                </h3>
                <CommissionWalletSection customerId={selectedCustomer._id} />
              </div>
            ) : (
              <div style={{ color: '#6b7280', padding: '20px', textAlign: 'center' }}>
                Select a customer from the referrals list to view their commission wallet
              </div>
            )}
          </div>
        )}

        {/* Referrals List Tab */}
        {activeTab === "referrals" && (
          <div>
            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or phone..."
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 40px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#1f2937'
                  }}
                />
              </div>
            </div>

            {/* Referrals Table */}
            {loading ? (
              <div style={{ color: '#6b7280', padding: '40px', textAlign: 'center' }}>
                Loading referrals...
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div style={{ color: '#6b7280', padding: '40px', textAlign: 'center' }}>
                No referrals found
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left', color: '#374151', borderBottom: '2px solid #e2e8f0', fontWeight: '600' }}>
                        Referrer
                      </th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', color: '#374151', borderBottom: '2px solid #e2e8f0', fontWeight: '600' }}>
                        Referred Customer
                      </th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', color: '#374151', borderBottom: '2px solid #e2e8f0', fontWeight: '600' }}>
                        Date
                      </th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', color: '#374151', borderBottom: '2px solid #e2e8f0', fontWeight: '600' }}>
                        Status
                      </th>
                      <th style={{ padding: '12px 8px', textAlign: 'right', color: '#374151', borderBottom: '2px solid #e2e8f0', fontWeight: '600' }}>
                        Orders
                      </th>
                      <th style={{ padding: '12px 8px', textAlign: 'right', color: '#374151', borderBottom: '2px solid #e2e8f0', fontWeight: '600' }}>
                        Commission
                      </th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', color: '#374151', borderBottom: '2px solid #e2e8f0', fontWeight: '600' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferrals.map((ref, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 8px', color: '#1f2937' }}>
                          <div style={{ fontWeight: '500' }}>{ref.referrerName}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{ref.referrerPhone}</div>
                          <div style={{ marginTop: '4px' }}>
                            {ref.isForemanApproved && (
                              <span style={{ 
                                padding: '2px 6px', 
                                backgroundColor: '#dcfce7', 
                                color: '#16a34a', 
                                borderRadius: '4px', 
                                fontSize: '11px',
                                marginRight: '4px'
                              }}>
                                Foreman
                              </span>
                            )}
                            {ref.isCommissionEligible && (
                              <span style={{ 
                                padding: '2px 6px', 
                                backgroundColor: '#ede9fe', 
                                color: '#7c3aed', 
                                borderRadius: '4px', 
                                fontSize: '11px' 
                              }}>
                                Commission ✓
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px', color: '#1f2937' }}>
                          <div style={{ fontWeight: '500' }}>{ref.referredCustomerName}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{ref.referredCustomerPhone}</div>
                        </td>
                        <td style={{ padding: '12px 8px', color: '#6b7280' }}>
                          {ref.referralDate ? new Date(ref.referralDate).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          {ref.hasPlacedOrder ? (
                            <span style={{ 
                              padding: '4px 8px', 
                              backgroundColor: '#dcfce7', 
                              color: '#16a34a', 
                              borderRadius: '4px', 
                              fontSize: '12px' 
                            }}>
                              ✓ Ordered
                            </span>
                          ) : (
                            <span style={{ 
                              padding: '4px 8px', 
                              backgroundColor: '#fef3c7', 
                              color: '#d97706', 
                              borderRadius: '4px', 
                              fontSize: '12px' 
                            }}>
                              Pending
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#1f2937' }}>
                          {ref.totalOrdersCount || 0}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#16a34a', fontWeight: '500' }}>
                          Rs. {(ref.commissionGenerated || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setSelectedCustomer({ _id: ref.referrerId, name: ref.referrerName });
                              setActiveTab("wallet");
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #2563eb',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            <Eye size={14} style={{ marginRight: '4px' }} />
                            Wallet
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
