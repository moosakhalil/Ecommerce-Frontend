import React, { useState } from 'react';
import { Book, Code, Server, Workflow, Search, ChevronDown, ChevronRight, ExternalLink, FileCode, Database, Globe, Layers } from 'lucide-react';
import Sidebar from "../Sidebar/sidebar";

const ProjectInfo = () => {
  const [activeTab, setActiveTab] = useState('sidebar');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Tab configuration
  const tabs = [
    { id: 'sidebar', name: 'Sidebar Page Numbers', icon: <Book className="w-4 h-4" /> },
    { id: 'system', name: 'System Overview', icon: <Globe className="w-4 h-4" /> },
    { id: 'components', name: 'Components & Workflows', icon: <Layers className="w-4 h-4" /> },
    { id: 'apis', name: 'APIs', icon: <Server className="w-4 h-4" /> },
    { id: 'business', name: 'Business Logic', icon: <Workflow className="w-4 h-4" /> },
  ];

  // ============================================================================
  // SIDEBAR PAGES DATA
  // ============================================================================
  const sidebarPages = [
    {
      section: 'OUR OPERATION',
      pages: [
        { number: '1', name: 'Orders to cart not ordered yet', description: 'View customers with items in cart but not yet purchased. Includes abandoned cart tracking.' },
        { number: '2', name: 'Transaction control', description: 'Verify and approve/reject customer payment transactions. Finance team approval required.' },
        { number: '3', name: 'All Orders', description: 'Comprehensive order listing with 20+ status filters. Track orders from cart to delivery.' },
        { number: '4', name: 'Order management delivery', description: 'Manage orders ready for delivery. Assign drivers and track delivery status.' },
        { number: '6', name: 'Non-delivered orders or issues', description: 'Handle failed deliveries, customer complaints, and order issues requiring resolution.' },
        { number: '7', name: 'Refund / complain', description: 'Process customer refunds and manage complaint tickets. Track resolution status.' },
        { number: '8', name: 'History orders', description: 'View historical order data. Same as All Orders with focus on completed orders.' },
        { number: '10', name: 'Videos Management', description: 'Manage product videos and promotional content for the platform.' },
      ]
    },
    {
      section: 'VENDOR MANAGEMENT',
      pages: [
        { number: '15', name: 'Vendor Dashboard', description: 'Main vendor management interface. View vendor performance and orders.' },
        { number: '16', name: 'Vendor outsource Dashboard', description: 'Manage outsourced vendor operations and pre-orders.' },
      ]
    },
    {
      section: 'STOCK',
      pages: [
        { number: '31', name: 'Product list everyone (View can only check)', description: 'Full product management with editing capabilities. Admin-level access.' },
        { number: '32', name: 'Product List everyone (only view)', description: 'Read-only product list for warehouse staff and limited-access employees.' },
        { number: '33', name: 'Inventory check', description: 'Physical inventory verification. Record stock counts and corrections.' },
        { number: '35', name: 'Out of Stock...order stock', description: 'Monitor low/zero stock products. Create supplier orders for restocking.' },
        { number: '37', name: 'Lost Stock Management', description: 'Record and track inventory losses: damage, theft, expiry, etc.' },
        { number: '38', name: 'Supply/Stock Arrival from supplier', description: 'Process incoming stock from suppliers. Update inventory on arrival.' },
      ]
    },
    {
      section: 'STOCK 2',
      pages: [
        { number: '51', name: 'Create a new product', description: 'Add new products with images, variants, pricing, and batch discounts.' },
        { number: '54', name: 'Fill inventory', description: 'Bulk inventory updates. Fill stock levels for multiple products.' },
        { number: '55', name: 'Inventory control', description: 'Advanced inventory management and control features.' },
        { number: '56', name: 'Categories', description: 'Manage product categories and subcategories.' },
      ]
    },
    {
      section: 'DISCOUNT',
      pages: [
        { number: '71', name: 'Create discount', description: 'Create product-level discounts with validity periods.' },
        { number: '72', name: 'All Discount list', description: 'View all active and inactive discounts across products.' },
        { number: '73', name: 'Discounted product inventory', description: 'Inventory view filtered to show only discounted products.' },
        { number: '74', name: 'Discount policies action', description: 'Configure discount rules and automation triggers.' },
        { number: '75', name: 'Discount Page Info (Batch Discounts)', description: 'Manage 8 batch discount categories for customer segments (Foremen, VIP, etc.).' },
      ]
    },
    {
      section: 'SUPPLIER, EMP, CUSTOMER',
      pages: [
        { number: '81', name: 'Suppliers', description: 'View and manage supplier accounts and product associations.' },
        { number: '82', name: 'Employees', description: 'View all employee accounts and their details.' },
        { number: '83', name: 'Customers', description: 'View customer accounts, chat history, orders, and referral data.' },
        { number: '84', name: 'Add Products to Supplier', description: 'Associate products with specific suppliers for ordering.' },
      ]
    },
    {
      section: 'HISTORY',
      pages: [
        { number: '90', name: 'History orders supplier', description: 'View historical supplier order transactions and deliveries.' },
      ]
    },
    {
      section: 'LOWER ADMIN',
      pages: [
        { number: '100', name: 'Admin', description: 'Main admin control panel and system overview.' },
        { number: '101', name: 'Lower Admin', description: 'Reduced admin privileges for department managers.' },
        { number: '102', name: 'Assign Driver to Vehicles', description: 'Link drivers to company vehicles for delivery assignments.' },
        { number: '103', name: 'Employee (add/edit)', description: 'Create and modify employee accounts.' },
        { number: '104', name: 'Supplier (add/edit)', description: 'Create and modify supplier accounts.' },
        { number: '105', name: 'Customer (edit)', description: 'Edit customer account details.' },
        { number: '106', name: 'Products (edit)', description: 'Edit existing product information and specifications.' },
        { number: '108', name: 'Delivery Types', description: 'Configure delivery methods and options.' },
        { number: '109', name: 'Employee Permission', description: 'Assign component access rights to employees.' },
        { number: '110', name: 'Employee Roles', description: 'Define role templates with preset permissions.' },
        { number: '111', name: 'Add new Vehicle', description: 'Register new vehicles for the delivery fleet.' },
        { number: '112', name: 'View vehicle', description: 'View and manage existing vehicles.' },
        { number: '113', name: 'Area Management B', description: 'Manage delivery areas and zones.' },
        { number: '114', name: 'Delivery Fees', description: 'Configure delivery fees by area and order value.' },
      ]
    },
    {
      section: 'REFERRAL',
      pages: [
        { number: '150', name: 'Referrals video verification', description: 'Verify customer referral videos for discount eligibility.' },
        { number: '151', name: 'Referrals data', description: 'Analytics and data for the referral program.' },
        { number: '153', name: 'Approval Of Foreman', description: 'Review and approve customers for foreman status.' },
        { number: '154', name: 'Approval Of Foreman With Commission', description: 'Approve foremen for commission earning eligibility.' },
        { number: '155', name: 'Referrals foreman income', description: 'Track foreman earnings from referral commissions.' },
        { number: '156', name: 'Pay Commission', description: 'Process commission payments to eligible foremen.' },
        { number: '159A', name: 'Referral Video Management', description: 'Manage referral demo videos sent to customers.' },
        { number: '159B', name: 'Introduction Video Management', description: 'Manage introduction/onboarding videos for new customers.' },
      ]
    },
    {
      section: 'DELIVERY SYSTEM',
      pages: [
        { number: '201', name: 'Order Overview', description: 'Dashboard overview of all orders in the delivery pipeline.' },
        { number: '202', name: 'Packing Staff', description: 'Interface for packing staff to process orders.' },
        { number: '203', name: 'Delivery Storage Officer', description: 'Manage order storage before dispatch.' },
        { number: '204', name: 'Dispatch Officer 1', description: 'First-stage order picking and preparation.' },
        { number: '205', name: 'Dispatch Officer 2', description: 'Final dispatch and driver assignment.' },
        { number: '206', name: 'Driver', description: 'Driver interface for viewing assigned deliveries.' },
        { number: '207', name: 'Driver On Delivery', description: 'Track active deliveries in progress.' },
        { number: '208', name: 'Delivered Orders', description: 'View completed deliveries history.' },
        { number: '209', name: 'Complaint Manager (within 24 hours)', description: 'Handle complaints filed within 24 hours.' },
        { number: '210', name: 'Complaint Manager (after 24 hours)', description: 'Handle complaints filed after 24 hours.' },
      ]
    },
    {
      section: 'FINANCE',
      pages: [
        { number: '251', name: 'Finances', description: 'Main finance dashboard with revenue and expense tracking.' },
        { number: '255', name: 'ANALYTICS', description: 'Business analytics and performance metrics.' },
        { number: '256', name: 'Product Sales Info', description: 'Sales data and analytics by product.' },
        { number: '257', name: 'Competitors', description: 'Competitor pricing and market analysis.' },
        { number: '258', name: 'Sales data for products', description: 'Detailed sales reports by product category.' },
        { number: '259', name: 'Sales Data', description: 'Comprehensive sales data and reporting.' },
        { number: '260', name: 'Bill Management & History', description: 'Manage bills and view billing history.' },
        { number: '261', name: 'Tax Brackets', description: 'Configure tax brackets and rates.' },
        { number: '265', name: 'Wallet Management', description: 'Manage customer wallet balances and transactions.' },
        { number: '266', name: 'Fee Control Management', description: 'Configure platform fees and charges.' },
      ]
    },
    {
      section: 'PRODUCT TRACKING',
      pages: [
        { number: '301', name: 'Tracking Dashboard', description: 'Overview of product tracking across the system.' },
        { number: '302', name: 'Scan & Track', description: 'Barcode/QR scanning for product tracking.' },
        { number: '303', name: 'Advanced Search', description: 'Advanced product search with multiple filters.' },
        { number: '304', name: 'Batch Management', description: 'Manage product batches and expiry dates.' },
        { number: '305', name: 'Location Management', description: 'Track product locations in warehouse.' },
        { number: '306', name: 'Quality Control', description: 'Quality control checks and reporting.' },
        { number: '307', name: 'Reports & Analytics', description: 'Tracking reports and analytics.' },
        { number: '308', name: 'Tracking Settings', description: 'Configure tracking system settings.' },
      ]
    },
    {
      section: 'SETTINGS',
      pages: [
        { number: '115', name: 'Control Chatbot', description: 'Monitor and control the WhatsApp chatbot. View conversations and manage settings.' },
      ]
    },
    {
      section: 'SUPPORT',
      pages: [
        { number: 'support', name: 'Support', description: 'Customer support ticket management system.' },
      ]
    },
    {
      section: 'PROJECT DOCUMENTATION',
      pages: [
        { number: '5000', name: 'Project Info', description: 'This page - Complete system documentation with workflows, components, APIs, and business logic.' },
      ]
    },
  ];

  // ============================================================================
  // SYSTEM OVERVIEW DATA
  // ============================================================================
  const systemOverview = {
    techStack: [
      { name: 'Frontend', tech: 'React.js', version: '18.x', description: 'Component-based UI library' },
      { name: 'Backend', tech: 'Node.js + Express', version: '20.x / 4.x', description: 'RESTful API server' },
      { name: 'Database', tech: 'MongoDB', version: '7.x', description: 'NoSQL document database' },
      { name: 'Communication', tech: 'WhatsApp (Ultramsg)', version: 'API v1', description: 'Customer chatbot integration' },
      { name: 'Styling', tech: 'Tailwind CSS', version: '3.x', description: 'Utility-first CSS framework' },
    ],
    folderStructure: {
      frontend: [
        { path: 'src/componenets/', description: 'All React components organized by feature' },
        { path: 'src/App.js', description: 'Main app with routing configuration' },
        { path: 'src/index.js', description: 'React DOM entry point' },
        { path: 'public/', description: 'Static assets and index.html' },
      ],
      backend: [
        { path: 'routes/', description: 'API route handlers (43 files)' },
        { path: 'models/', description: 'MongoDB Mongoose schemas' },
        { path: 'server.js', description: 'Express server entry point' },
        { path: 'referral_images/', description: 'Uploaded referral media storage' },
      ]
    }
  };

  // ============================================================================
  // COMPONENTS DATA
  // ============================================================================
  const componentsData = [
    {
      category: 'Order Management',
      components: [
        {
          name: 'Orders in Cart',
          location: 'frontend/src/componenets/Orders/OrdersInCart.js',
          purpose: 'Display orders in cart state (not yet purchased)',
          workflow: 'Shows all customers with cart items → Admin can view/remind customers → Integrates with chatbot timer for abandoned carts',
          businessLogic: 'Orders in "cart-not-paid" status are displayed. 24-hour timer triggers reminder. Abandoned carts cleared after timeout.'
        },
        {
          name: 'All Orders',
          location: 'frontend/src/componenets/Order-management/allOrders.js',
          purpose: 'Comprehensive order listing with filters and status management',
          workflow: 'Fetches all orders → Filters by status/date/driver → Status update triggers → Integrates with delivery system',
          businessLogic: 'Orders flow through 20+ statuses from cart-not-paid to order-complete. Each status change is tracked with timestamps.'
        },
        {
          name: 'Delivery Orders',
          location: 'frontend/src/componenets/DeliverySystem/DeliveryOrders.js',
          purpose: 'Manage orders ready for delivery allocation',
          workflow: 'Shows confirmed orders → Assign drivers → Track delivery status → Update to on-way/delivered',
          businessLogic: 'Orders with "order-confirmed" status appear here. Driver assignment creates delivery route. GPS tracking available.'
        },
        {
          name: 'Non-Delivered Orders',
          location: 'frontend/src/componenets/Delivery&complaints/non-delivered.js',
          purpose: 'Handle failed deliveries and customer issues',
          workflow: 'Lists problematic orders → Document issues → Reschedule or refund → Track resolution',
          businessLogic: 'Orders marked as "issue-customer" or "order-not-pickedup" appear here for resolution.'
        }
      ]
    },
    {
      category: 'Product Management',
      components: [
        {
          name: 'Add Products',
          location: 'frontend/src/componenets/Products/addProducts.js',
          purpose: 'Create new products with all specifications',
          workflow: 'Enter product details → Upload images → Set pricing → Configure variants (weights) → Assign batch discounts → Save to database',
          businessLogic: 'Products can be Parent (has variants), Child (variant of parent), or Normal (standalone). Batch discounts apply to 8 categories.'
        },
        {
          name: 'Product List (Admin)',
          location: 'frontend/src/componenets/Products/ProductList.js',
          purpose: 'View and manage all products with full control',
          workflow: 'List all products → Filter/search → Edit details → Manage stock → View sales data',
          businessLogic: 'Stock levels trigger reorder alerts. Price history tracked. Multiple images supported.'
        },
        {
          name: 'Product List (View Only)',
          location: 'frontend/src/componenets/Products/ProductListView.js',
          purpose: 'Read-only product viewing for limited-access employees',
          workflow: 'View products → Check stock → View specifications (no editing)',
          businessLogic: 'Same data as admin view but without edit capabilities. Used by warehouse staff.'
        }
      ]
    },
    {
      category: 'Inventory & Stock',
      components: [
        {
          name: 'Inventory Check',
          location: 'frontend/src/componenets/Inventory/InventoryCheck.js',
          purpose: 'Physical inventory verification and correction',
          workflow: 'Select product → Enter actual count → System calculates difference → Record correction with reason',
          businessLogic: 'Discrepancies logged for audit. Lost stock tracked separately. History maintained for all corrections.'
        },
        {
          name: 'Out of Stock',
          location: 'frontend/src/componenets/Inventory/OutOfStock.js',
          purpose: 'Monitor low/zero stock products for reordering',
          workflow: 'Auto-detects low stock → Shows reorder threshold → Create supplier order → Track incoming stock',
          businessLogic: 'Reorder threshold configurable per product. Alerts when stock < threshold. Supplier order integration.'
        },
        {
          name: 'Supply Stock Arrival',
          location: 'frontend/src/componenets/SupplyStockArrival/SupplyStockArrival.js',
          purpose: 'Process incoming stock from suppliers',
          workflow: 'Receive shipment → Verify quantities → Update inventory → Mark order complete',
          businessLogic: 'Stock additions logged with supplier reference. Quality check optional. Cost price tracked.'
        },
        {
          name: 'Lost Stock Management',
          location: 'frontend/src/componenets/Inventory/LostStock.js',
          purpose: 'Track and manage inventory losses',
          workflow: 'Record loss → Categorize reason → Deduct from available stock → Generate reports',
          businessLogic: 'Lost stock reduces available inventory. Categories: damage, theft, expiry, other. Financial impact calculated.'
        }
      ]
    },
    {
      category: 'Discount System',
      components: [
        {
          name: 'Create Discount',
          location: 'frontend/src/componenets/Discounts/CreateDiscount.js',
          purpose: 'Create product-level discounts',
          workflow: 'Select products → Set discount amount/percentage → Define validity period → Activate',
          businessLogic: 'Discount applies to product price. Time-limited or permanent. Stacks with batch discounts.'
        },
        {
          name: 'Discount Page Info (Batch)',
          location: 'frontend/src/componenets/Discounts/DiscountPageInfo.js',
          purpose: 'Manage 8 batch discount categories for customer segments',
          workflow: 'View all 8 categories → See eligible customers → View products in each batch → Monitor usage',
          businessLogic: `8 Categories:
            1. Foremen - For registered foremen (24/7)
            2. Foremen+ Commission - Foremen with commission rights (24/7)
            3. Referral 3 Days - Referred 3+ people (3 days + 1 day/extra)
            4. New Customer Referred - New + referred + 100k spend (3 days)
            5. New Customer - Account < 10 days (10 days)
            6. VIP 30M - Single purchase 30M+ (10 days)
            7. Valued 100M/60d - 100M cumulative in 60 days (10 days)
            8. Everyone - All customers (24/7)`
        },
        {
          name: 'Discount Policies',
          location: 'frontend/src/componenets/Discounts/DiscountPolicies.js',
          purpose: 'Configure discount rules and automation',
          workflow: 'Set discount rules → Configure triggers → Define eligibility → Automate application',
          businessLogic: 'Rules engine for automatic discount application based on customer behavior and order value.'
        }
      ]
    },
    {
      category: 'Customer & Referral',
      components: [
        {
          name: 'Customers',
          location: 'frontend/src/componenets/Customers/Customers.js',
          purpose: 'View and manage all customer accounts',
          workflow: 'List customers → View chat history → See order history → Update details → Track referrals',
          businessLogic: 'Customer data synced with WhatsApp chatbot. Cart, orders, and referrals linked to customer record.'
        },
        {
          name: 'Referral Video Verification',
          location: 'frontend/src/componenets/Refferal/Referrals.js',
          purpose: 'Verify customer referral videos for discount eligibility',
          workflow: 'View pending videos → Play and verify → Approve/reject → Award referral credits',
          businessLogic: 'Customers submit video watching proof. Verified videos unlock referral rewards. Invalid videos rejected.'
        },
        {
          name: 'Referral Analytics',
          location: 'frontend/src/componenets/Refferal/ReferralsAnalytics.js',
          purpose: 'Analyze referral program performance',
          workflow: 'View referral metrics → Track conversion rates → Monitor rewards distribution',
          businessLogic: 'Tracks referrer → referee relationships. Calculates conversion rates. Shows revenue from referrals.'
        },
        {
          name: 'Foreman Approval',
          location: 'frontend/src/componenets/Refferal/ForemanApproval.js',
          purpose: 'Approve customers as foremen for special discounts',
          workflow: 'View pending applications → Review customer history → Approve/reject → Grant foreman status',
          businessLogic: 'Foreman status unlocks special discount categories. Separate commission eligibility approval.'
        }
      ]
    },
    {
      category: 'Transactions & Finance',
      components: [
        {
          name: 'Transaction Verification',
          location: 'frontend/src/componenets/Transactions/transaction-verification.js',
          purpose: 'Verify customer payment transactions',
          workflow: 'View pending payments → Check bank receipts → Verify amount → Approve/reject → Update order status',
          businessLogic: 'Customers upload payment proof. Finance team verifies. Approved = order-confirmed. Rejected = notification sent.'
        },
        {
          name: 'Finance Dashboard',
          location: 'frontend/src/componenets/Finance/Finances.js',
          purpose: 'Overview of financial metrics and reports',
          workflow: 'View revenue → Track expenses → Monitor profit margins → Generate reports',
          businessLogic: 'Aggregates order data for financial reporting. Daily/weekly/monthly views. Export capabilities.'
        },
        {
          name: 'Wallet Management',
          location: 'frontend/src/componenets/Finance/WalletManagement.js',
          purpose: 'Manage customer wallet balances',
          workflow: 'View wallets → Add/deduct balance → Track transactions → Refund to wallet',
          businessLogic: 'Wallet balance can be used for purchases. Refunds added to wallet. History maintained.'
        }
      ]
    },
    {
      category: 'Delivery System',
      components: [
        {
          name: 'Dispatch Officer 1',
          location: 'frontend/src/componenets/DeliverySystem/DispatchOfficer1.js',
          purpose: 'First-stage order picking and preparation',
          workflow: 'View picking orders → Process items → Confirm ready → Pass to dispatch 2',
          businessLogic: 'Orders in "picking-order" status. Picker confirms items collected. Updates to next stage.'
        },
        {
          name: 'Dispatch Officer 2',
          location: 'frontend/src/componenets/DeliverySystem/DispatchOfficer2.js',
          purpose: 'Final dispatch and driver assignment',
          workflow: 'Receive picked orders → Assign to vehicles/drivers → Dispatch → Track',
          businessLogic: 'Allocates orders to delivery routes. Considers area, vehicle capacity, and driver availability.'
        },
        {
          name: 'Driver On Delivery',
          location: 'frontend/src/componenets/DeliverySystem/DriverOnDelivery.js',
          purpose: 'Track active deliveries in progress',
          workflow: 'View assigned orders → Update status → Confirm delivery → Report issues',
          businessLogic: 'Real-time delivery tracking. Customer notifications on status change. Issue reporting.'
        },
        {
          name: 'Delivered Orders',
          location: 'frontend/src/componenets/DeliverySystem/DeliveredOrders.js',
          purpose: 'View completed deliveries history',
          workflow: 'List completed deliveries → View details → Track driver performance',
          businessLogic: 'Orders with "order-complete" status. Used for performance metrics and customer history.'
        }
      ]
    },
    {
      category: 'Admin & Settings',
      components: [
        {
          name: 'Admin Dashboard',
          location: 'frontend/src/componenets/Admin/AdminDashboard.js',
          purpose: 'Main admin control panel',
          workflow: 'Overview metrics → Quick actions → Navigation hub',
          businessLogic: 'Role-based access control. Super admin sees all. Employees see assigned components only.'
        },
        {
          name: 'Employee Permission',
          location: 'frontend/src/componenets/Admin/EmployeePermission.js',
          purpose: 'Configure employee access rights',
          workflow: 'Select employee → Assign components → Set categories → Save permissions',
          businessLogic: 'Component-based permission system. Employees can only access assigned page IDs.'
        },
        {
          name: 'Employee Roles',
          location: 'frontend/src/componenets/Settings/EmployeeRoles.js',
          purpose: 'Define and manage employee role templates',
          workflow: 'Create roles → Define permissions → Assign to employees',
          businessLogic: 'Role templates simplify permission assignment. Roles can have preset component access.'
        },
        {
          name: 'Chatbot Control',
          location: 'frontend/src/componenets/Settings/ChatbotControl.js',
          purpose: 'Monitor and control WhatsApp chatbot',
          workflow: 'View conversations → Monitor activity → Manage settings',
          businessLogic: 'Chatbot handles customer orders, support, and referrals. All interactions logged.'
        }
      ]
    },
    {
      category: 'Supplier Management',
      components: [
        {
          name: 'View Suppliers',
          location: 'frontend/src/componenets/Supplier/ViewSuppliers.js',
          purpose: 'List and manage supplier accounts',
          workflow: 'View suppliers → Edit details → Track orders → Monitor performance',
          businessLogic: 'Suppliers linked to products. Order history and pricing tracked. Payment terms stored.'
        },
        {
          name: 'Supplier Orders',
          location: 'frontend/src/componenets/Supplier/SupplierOrders.js',
          purpose: 'Create and track orders to suppliers',
          workflow: 'Select products → Specify quantities → Create PO → Track shipment → Receive stock',
          businessLogic: 'Purchase orders created based on reorder needs. Arrival updates inventory automatically.'
        },
        {
          name: 'Supplier History',
          location: 'frontend/src/componenets/Supplier/SupplierHistory.js',
          purpose: 'View historical supplier transactions',
          workflow: 'Filter by date/supplier → View order details → Analyze patterns',
          businessLogic: 'Complete audit trail of all supplier transactions. Used for supplier evaluation.'
        }
      ]
    },
    {
      category: 'Vehicle Management',
      components: [
        {
          name: 'Vehicle List',
          location: 'frontend/src/componenets/Vehicles/VehicleList.js',
          purpose: 'Manage company delivery vehicles',
          workflow: 'View vehicles → Assign drivers → Track status → Manage maintenance',
          businessLogic: 'Vehicles have types, capacities, and assigned drivers. Used for delivery allocation.'
        },
        {
          name: 'Driver Assignment',
          location: 'frontend/src/componenets/Vehicles/DriverAssignment.js',
          purpose: 'Assign drivers to vehicles',
          workflow: 'Select vehicle → Assign driver → Set availability',
          businessLogic: 'Drivers linked to vehicles. Multiple drivers can share vehicles on shifts.'
        }
      ]
    }
  ];

  // ============================================================================
  // API ROUTES DATA
  // ============================================================================
  const apiRoutes = [
    {
      category: 'Order Management',
      file: 'backend/routes/orders.js',
      endpoints: [
        { method: 'GET', path: '/api/orders', description: 'List all orders with filters (status, date, driver, area)' },
        { method: 'GET', path: '/api/orders/:orderId', description: 'Get single order details with payment info' },
        { method: 'PUT', path: '/api/orders/:orderId/status', description: 'Update order status (triggers workflow)' },
      ]
    },
    {
      category: 'Products',
      file: 'backend/routes/productRoutes.js',
      endpoints: [
        { method: 'GET', path: '/api/products', description: 'List all products with pagination' },
        { method: 'GET', path: '/api/products/:id', description: 'Get single product details' },
        { method: 'POST', path: '/api/products', description: 'Create new product with images and variants' },
        { method: 'PUT', path: '/api/products/:id', description: 'Update product details' },
        { method: 'DELETE', path: '/api/products/:id', description: 'Delete product (soft delete)' },
        { method: 'PUT', path: '/api/products/:id/stock', description: 'Update stock quantity' },
        { method: 'PUT', path: '/api/products/:id/lost-stock', description: 'Record lost stock' },
        { method: 'GET', path: '/api/products/low-stock', description: 'Get products below reorder threshold' },
        { method: 'GET', path: '/api/products/out-of-stock', description: 'Get zero-stock products' },
      ]
    },
    {
      category: 'Customers',
      file: 'backend/routes/customers.js',
      endpoints: [
        { method: 'GET', path: '/api/customers', description: 'List all customers with search/filter' },
        { method: 'GET', path: '/api/customers/:id', description: 'Get customer with full history' },
        { method: 'PUT', path: '/api/customers/:id', description: 'Update customer information' },
        { method: 'GET', path: '/api/customers/:id/orders', description: 'Get customer order history' },
        { method: 'GET', path: '/api/customers/:id/cart', description: 'Get customer current cart' },
      ]
    },
    {
      category: 'Batch Discounts',
      file: 'backend/routes/batchDiscountRoutes.js',
      endpoints: [
        { method: 'GET', path: '/api/batch-discounts', description: 'Get all batch discounts' },
        { method: 'GET', path: '/api/batch-discounts/category/:category', description: 'Get discounts by category' },
        { method: 'POST', path: '/api/batch-discounts', description: 'Create new batch discount' },
        { method: 'PUT', path: '/api/batch-discounts/:id', description: 'Update batch discount' },
        { method: 'GET', path: '/api/batch-discounts/eligible/:customerId', description: 'Get discounts eligible for customer' },
        { method: 'GET', path: '/api/batch-discounts/analytics', description: 'Get batch discount analytics' },
      ]
    },
    {
      category: 'Referrals',
      file: 'backend/routes/referralData.js',
      endpoints: [
        { method: 'GET', path: '/api/referrals', description: 'List all referral relationships' },
        { method: 'GET', path: '/api/referrals/pending-videos', description: 'Get videos pending verification' },
        { method: 'PUT', path: '/api/referrals/verify/:id', description: 'Approve/reject referral video' },
        { method: 'GET', path: '/api/referrals/analytics', description: 'Get referral program analytics' },
        { method: 'GET', path: '/api/referrals/tree/:customerId', description: 'Get referral tree for customer' },
      ]
    },
    {
      category: 'Foreman Management',
      file: 'backend/routes/foremanCustomers.js',
      endpoints: [
        { method: 'GET', path: '/api/foreman/pending', description: 'Get pending foreman applications' },
        { method: 'PUT', path: '/api/foreman/approve/:id', description: 'Approve foreman status' },
        { method: 'PUT', path: '/api/foreman/revoke/:id', description: 'Revoke foreman status' },
        { method: 'GET', path: '/api/foreman/commission-eligible', description: 'Get commission-eligible foremen' },
        { method: 'PUT', path: '/api/foreman/commission/:id', description: 'Update commission eligibility' },
      ]
    },
    {
      category: 'Delivery System',
      file: 'backend/routes/deliveryRoutes.js',
      endpoints: [
        { method: 'GET', path: '/api/delivery/pending', description: 'Get orders pending delivery' },
        { method: 'PUT', path: '/api/delivery/assign', description: 'Assign driver to order' },
        { method: 'PUT', path: '/api/delivery/status/:orderId', description: 'Update delivery status' },
        { method: 'GET', path: '/api/delivery/active', description: 'Get active deliveries' },
        { method: 'GET', path: '/api/delivery/completed', description: 'Get completed deliveries' },
      ]
    },
    {
      category: 'Dispatch Officers',
      file: 'backend/routes/dispatchOfficer1Routes.js & dispatchOfficer2Routes.js',
      endpoints: [
        { method: 'GET', path: '/api/dispatch1/orders', description: 'Get orders for picking' },
        { method: 'PUT', path: '/api/dispatch1/pick/:orderId', description: 'Mark order as picked' },
        { method: 'GET', path: '/api/dispatch2/orders', description: 'Get picked orders for dispatch' },
        { method: 'PUT', path: '/api/dispatch2/dispatch/:orderId', description: 'Dispatch order to driver' },
      ]
    },
    {
      category: 'Driver Routes',
      file: 'backend/routes/driverRoutes.js',
      endpoints: [
        { method: 'GET', path: '/api/drivers', description: 'List all drivers' },
        { method: 'GET', path: '/api/drivers/:id/deliveries', description: 'Get driver assigned deliveries' },
        { method: 'PUT', path: '/api/drivers/:id/status', description: 'Update driver availability status' },
        { method: 'GET', path: '/api/drivers/on-delivery', description: 'Get drivers currently on delivery' },
      ]
    },
    {
      category: 'Suppliers',
      file: 'backend/routes/supplierRoutes.js',
      endpoints: [
        { method: 'GET', path: '/api/suppliers', description: 'List all suppliers' },
        { method: 'POST', path: '/api/suppliers', description: 'Create new supplier' },
        { method: 'PUT', path: '/api/suppliers/:id', description: 'Update supplier details' },
        { method: 'GET', path: '/api/suppliers/:id/products', description: 'Get products from supplier' },
      ]
    },
    {
      category: 'Supplier Orders',
      file: 'backend/routes/supplierOrderRoutes.js',
      endpoints: [
        { method: 'GET', path: '/api/supplier-orders', description: 'List all purchase orders' },
        { method: 'POST', path: '/api/supplier-orders', description: 'Create purchase order' },
        { method: 'PUT', path: '/api/supplier-orders/:id/receive', description: 'Mark order as received (updates stock)' },
        { method: 'GET', path: '/api/supplier-orders/pending', description: 'Get pending supplier orders' },
      ]
    },
    {
      category: 'Employees',
      file: 'backend/routes/employeeRoutes.js',
      endpoints: [
        { method: 'GET', path: '/api/employees', description: 'List all employees' },
        { method: 'POST', path: '/api/employees', description: 'Create new employee account' },
        { method: 'PUT', path: '/api/employees/:id', description: 'Update employee details' },
        { method: 'PUT', path: '/api/employees/:id/permissions', description: 'Update employee component access' },
      ]
    },
    {
      category: 'Vehicles',
      file: 'backend/routes/vehicleRoutes.js',
      endpoints: [
        { method: 'GET', path: '/api/vehicles', description: 'List all vehicles' },
        { method: 'POST', path: '/api/vehicles', description: 'Add new vehicle' },
        { method: 'PUT', path: '/api/vehicles/:id', description: 'Update vehicle details' },
        { method: 'PUT', path: '/api/vehicles/:id/assign-driver', description: 'Assign driver to vehicle' },
      ]
    },
    {
      category: 'Finance',
      file: 'backend/routes/walletRoutes.js & taxBracketRoutes.js',
      endpoints: [
        { method: 'GET', path: '/api/wallet/:customerId', description: 'Get customer wallet balance' },
        { method: 'PUT', path: '/api/wallet/:customerId/add', description: 'Add to wallet balance' },
        { method: 'PUT', path: '/api/wallet/:customerId/deduct', description: 'Deduct from wallet' },
        { method: 'GET', path: '/api/tax-brackets', description: 'Get tax bracket configuration' },
        { method: 'PUT', path: '/api/tax-brackets', description: 'Update tax brackets' },
      ]
    },
    {
      category: 'Area Management',
      file: 'backend/routes/areaManagementRoutes.js',
      endpoints: [
        { method: 'GET', path: '/api/areas', description: 'List all delivery areas' },
        { method: 'POST', path: '/api/areas', description: 'Create new delivery area' },
        { method: 'PUT', path: '/api/areas/:id', description: 'Update area details and fees' },
        { method: 'GET', path: '/api/areas/:id/delivery-fee', description: 'Get delivery fee for area' },
      ]
    },
    {
      category: 'WhatsApp Chatbot',
      file: 'backend/routes/chatbot-router.js',
      endpoints: [
        { method: 'POST', path: '/api/chatbot/webhook', description: 'Ultramsg webhook receiver' },
        { method: 'GET', path: '/api/chatbot/conversations', description: 'Get all chatbot conversations' },
        { method: 'POST', path: '/api/chatbot/send', description: 'Send message to customer' },
      ]
    },
    {
      category: 'Support',
      file: 'backend/routes/support.js',
      endpoints: [
        { method: 'GET', path: '/api/support/tickets', description: 'List support tickets' },
        { method: 'POST', path: '/api/support/tickets', description: 'Create support ticket' },
        { method: 'PUT', path: '/api/support/tickets/:id', description: 'Update ticket status' },
        { method: 'GET', path: '/api/support/tickets/:id/messages', description: 'Get ticket messages' },
      ]
    },
    {
      category: 'Complaints',
      file: 'backend/routes/complaints.js',
      endpoints: [
        { method: 'GET', path: '/api/complaints', description: 'List all complaints' },
        { method: 'POST', path: '/api/complaints', description: 'Create complaint' },
        { method: 'PUT', path: '/api/complaints/:id/resolve', description: 'Resolve complaint' },
        { method: 'GET', path: '/api/complaints/within-24', description: 'Get complaints within 24 hours' },
        { method: 'GET', path: '/api/complaints/after-24', description: 'Get complaints after 24 hours' },
      ]
    },
    {
      category: 'Admin & Auth',
      file: 'backend/routes/admin.js & auth.js',
      endpoints: [
        { method: 'POST', path: '/api/auth/login', description: 'Employee/admin login' },
        { method: 'POST', path: '/api/auth/logout', description: 'Logout and invalidate token' },
        { method: 'GET', path: '/api/admin/dashboard', description: 'Get dashboard metrics' },
        { method: 'PUT', path: '/api/admin/employee/:id/components', description: 'Update employee component access' },
      ]
    },
    {
      category: 'Videos',
      file: 'backend/routes/videos.js & referralVideos.js',
      endpoints: [
        { method: 'GET', path: '/api/videos', description: 'List all videos' },
        { method: 'POST', path: '/api/videos/upload', description: 'Upload new video' },
        { method: 'GET', path: '/api/referral-videos/pending', description: 'Get pending referral videos' },
        { method: 'PUT', path: '/api/referral-videos/:id/verify', description: 'Verify referral video' },
      ]
    },
  ];

  // ============================================================================
  // BUSINESS LOGIC DATA
  // ============================================================================
  const businessLogic = [
    {
      name: 'Order Flow',
      description: 'Complete order lifecycle from cart to delivery',
      location: 'backend/routes/orders.js, chatbot-router.js',
      steps: [
        { step: '1. Cart Creation', detail: 'Customer adds products via chatbot → cart-not-paid status → 24hr timer starts' },
        { step: '2. Order Placement', detail: 'Customer confirms order → order-made-not-paid → awaiting payment' },
        { step: '3. Payment Upload', detail: 'Customer uploads bank receipt → pay-not-confirmed → awaiting verification' },
        { step: '4. Payment Verification', detail: 'Finance team verifies → order-confirmed OR rejected' },
        { step: '5. Order Picking', detail: 'Dispatch Officer 1 picks items → picking-order → items collected' },
        { step: '6. Driver Assignment', detail: 'Dispatch Officer 2 assigns driver/vehicle → allocated-driver' },
        { step: '7. Ready for Pickup', detail: 'Order loaded onto vehicle → ready-to-pickup' },
        { step: '8. Delivery', detail: 'Driver confirms pickup → order-pickuped-up → on-way' },
        { step: '9. Completion', detail: 'Customer receives order → driver-confirmed → order-complete' },
      ],
      notes: 'Each status change is timestamped. Customer receives WhatsApp notifications at key points. Issues can occur at any stage, redirecting to complaint flow.'
    },
    {
      name: 'Payment Verification Flow',
      description: 'How payments are verified before order processing',
      location: 'frontend/src/componenets/Transactions/transaction-verification.js',
      steps: [
        { step: '1. Receipt Upload', detail: 'Customer sends bank transfer receipt image via WhatsApp' },
        { step: '2. Auto-Detection', detail: 'Chatbot receives image, attaches to order as paymentReceipt' },
        { step: '3. Queue for Review', detail: 'Order appears in Transaction Verification page (status: pay-not-confirmed)' },
        { step: '4. Manual Review', detail: 'Finance team checks: amount matches, bank name, transaction ID' },
        { step: '5. Approval/Rejection', detail: 'Approved → order-confirmed + customer notified. Rejected → customer asked to resend' },
      ],
      notes: 'Payment verification is manual to ensure accuracy. Bank names and holder names stored for records.'
    },
    {
      name: 'Batch Discount System',
      description: '8 customer segment-based discount categories',
      location: 'backend/routes/batchDiscountRoutes.js, models/BatchDiscount.js',
      steps: [
        { step: '1. Category Assignment', detail: 'Admin assigns products to discount categories during creation' },
        { step: '2. Customer Eligibility', detail: 'System checks customer status (foreman, referrals, purchase history)' },
        { step: '3. Discount Display', detail: 'Eligible discounts shown to customer in chatbot product browsing' },
        { step: '4. Cart Application', detail: 'Discount price applied when adding to cart' },
        { step: '5. Time Limits', detail: 'Some categories have time windows (3-10 days), checked at purchase time' },
      ],
      notes: `Categories and durations:
        • Foremen / Foremen+: 24/7 availability
        • Referral 3 Days: Base 3 days + 1 day per additional referral
        • New Customer Referred: 3 days after first 100k purchase
        • New Customer: First 10 days after account creation
        • VIP 30M: 10 days after 30M single purchase
        • Valued 100M/60d: 10 days after reaching threshold
        • Everyone: Always available`
    },
    {
      name: 'Referral Program Flow',
      description: 'How customers refer others and earn rewards',
      location: 'backend/routes/referralData.js, referralVideos.js',
      steps: [
        { step: '1. Referral Link', detail: 'Customer gets unique referral link from chatbot' },
        { step: '2. New Customer Signs Up', detail: 'Referred customer registers, link recorded' },
        { step: '3. Video Submission', detail: 'Referrer submits video watching intro content as proof' },
        { step: '4. Video Verification', detail: 'Admin reviews and approves/rejects video' },
        { step: '5. Reward Grant', detail: 'Approved → Referrer gets discount eligibility (3+ referrals = 3-day window)' },
        { step: '6. Foreman Track', detail: 'High performers can apply for Foreman status (special discounts)' },
      ],
      notes: 'Referral chain is tracked. Invalid phone numbers (RU/IN) are rejected. Video verification ensures genuine engagement.'
    },
    {
      name: 'Stock Management Flow',
      description: 'How inventory is tracked and replenished',
      location: 'backend/routes/productRoutes.js, supplierOrderRoutes.js',
      steps: [
        { step: '1. Initial Stock', detail: 'Products created with initial stock quantity' },
        { step: '2. Order Deduction', detail: '⚠️ NOTE: Currently stock is NOT auto-decremented on order! Manual process needed.' },
        { step: '3. Low Stock Alert', detail: 'When stock < reorder threshold, product appears in Out of Stock page' },
        { step: '4. Supplier Order', detail: 'Admin creates purchase order to supplier' },
        { step: '5. Stock Arrival', detail: 'When shipment arrives, stock is updated via Supply Stock Arrival' },
        { step: '6. Lost Stock', detail: 'Damages/theft recorded via Lost Stock Management, deducted from available' },
        { step: '7. Corrections', detail: 'Physical count differences corrected via Inventory Check with reason logging' },
      ],
      notes: '⚠️ IMPORTANT: Stock is NOT automatically decremented when orders are completed. This is a known gap in the current system.'
    },
    {
      name: 'Foreman System',
      description: 'Special customer status with privileges',
      location: 'backend/routes/foremanCustomers.js',
      steps: [
        { step: '1. Regular Customer', detail: 'Customer starts as normal user' },
        { step: '2. Referral Activity', detail: 'Customer refers multiple people successfully' },
        { step: '3. Foreman Application', detail: 'Customer reaches threshold or applies for foreman status' },
        { step: '4. Admin Approval', detail: 'Admin reviews application in Foreman Approval page' },
        { step: '5. Foreman Status', detail: 'Approved → Customer gets "Foremen" batch discount access' },
        { step: '6. Commission Eligibility', detail: 'Separate approval → Customer gets "Foremen+" access + earns commission' },
      ],
      notes: 'Foreman status is permanent once granted. Commission eligibility is separate and can be revoked.'
    },
    {
      name: 'Delivery Allocation Flow',
      description: 'How orders are assigned to drivers',
      location: 'backend/routes/driverRoutes.js, deliveryRoutes.js',
      steps: [
        { step: '1. Order Confirmed', detail: 'Payment verified, order enters picking queue' },
        { step: '2. Dispatch 1 - Picking', detail: 'Warehouse staff picks items, confirms ready' },
        { step: '3. Dispatch 2 - Routing', detail: 'Dispatcher assigns to vehicle based on area + capacity' },
        { step: '4. Driver Assignment', detail: 'Specific driver assigned to delivery' },
        { step: '5. Vehicle Loading', detail: 'Orders loaded, driver confirms pickup' },
        { step: '6. Delivery Route', detail: 'Driver follows route, updates status at each stop' },
        { step: '7. Completion/Issues', detail: 'Successful delivery → complete. Issues → complaint flow' },
      ],
      notes: 'Vehicles have capacity limits. Areas determine base delivery fees. Drivers see only their assigned orders.'
    },
    {
      name: 'Customer Support Flow',
      description: 'How support tickets are handled',
      location: 'backend/routes/support.js, complaints.js',
      steps: [
        { step: '1. Issue Report', detail: 'Customer reports issue via chatbot (product, delivery, payment)' },
        { step: '2. Ticket Creation', detail: 'System creates support ticket with category and details' },
        { step: '3. Media Attachment', detail: 'Customer can attach photos/videos as evidence' },
        { step: '4. Agent Assignment', detail: 'Ticket routed to appropriate support team' },
        { step: '5. Resolution', detail: 'Agent resolves: refund, replacement, or explanation' },
        { step: '6. Closure', detail: 'Ticket closed, customer satisfaction tracked' },
      ],
      notes: 'Complaints have 24-hour SLA. Products issues require video evidence. Refunds go to wallet balance.'
    }
  ];

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderSidebarPages = () => {
    const filteredPages = sidebarPages
      .map(section => ({
        ...section,
        pages: section.pages.filter(page =>
          page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.number.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(section => section.pages.length > 0);

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Sidebar Navigation Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{sidebarPages.length}</div>
              <div className="text-sm opacity-80">Sections</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{sidebarPages.reduce((acc, s) => acc + s.pages.length, 0)}</div>
              <div className="text-sm opacity-80">Total Pages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1-5000</div>
              <div className="text-sm opacity-80">Page Range</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">componentId</div>
              <div className="text-sm opacity-80">Permission Key</div>
            </div>
          </div>
        </div>

        {/* Search for this tab */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search pages by number, name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Pages by Section */}
        {filteredPages.map((section, sectionIdx) => (
          <div key={sectionIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-800 to-purple-800 p-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleSection(`sidebar-${sectionIdx}`)}
            >
              <div className="flex items-center gap-3">
                <Book className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold text-white">{section.section}</h3>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {section.pages.length} pages
                </span>
              </div>
              {expandedSections[`sidebar-${sectionIdx}`] ? (
                <ChevronDown className="w-5 h-5 text-white" />
              ) : (
                <ChevronRight className="w-5 h-5 text-white" />
              )}
            </div>

            {expandedSections[`sidebar-${sectionIdx}`] && (
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 w-24">Page #</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 w-64">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.pages.map((page, pageIdx) => (
                        <tr key={pageIdx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-lg text-sm">
                              {page.number}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900">{page.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600 text-sm">{page.description}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSystemOverview = () => (
    <div className="space-y-8">
      {/* Tech Stack */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          Technology Stack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemOverview.techStack.map((tech, idx) => (
            <div key={idx} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900">{tech.name}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{tech.version}</span>
              </div>
              <div className="text-sm font-semibold text-blue-600 mb-1">{tech.tech}</div>
              <p className="text-xs text-gray-500">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Folder Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-green-600" />
            Frontend Structure
          </h3>
          <div className="space-y-3">
            {systemOverview.folderStructure.frontend.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <code className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono">{item.path}</code>
                <span className="text-sm text-gray-600">{item.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-600" />
            Backend Structure
          </h3>
          <div className="space-y-3">
            {systemOverview.folderStructure.backend.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <code className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono">{item.path}</code>
                <span className="text-sm text-gray-600">{item.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">System Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">28</div>
            <div className="text-sm opacity-80">Component Folders</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">43</div>
            <div className="text-sm opacity-80">API Route Files</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">200+</div>
            <div className="text-sm opacity-80">API Endpoints</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">20+</div>
            <div className="text-sm opacity-80">Order Statuses</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComponents = () => {
    const filteredComponents = componentsData
      .map(category => ({
        ...category,
        components: category.components.filter(comp =>
          comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comp.purpose.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(category => category.components.length > 0);

    return (
      <div className="space-y-6">
        {filteredComponents.map((category, catIdx) => (
          <div key={catIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleSection(`comp-${catIdx}`)}
            >
              <h3 className="text-lg font-semibold text-white">{category.category}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                  {category.components.length} components
                </span>
                {expandedSections[`comp-${catIdx}`] ? (
                  <ChevronDown className="w-5 h-5 text-white" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            {expandedSections[`comp-${catIdx}`] && (
              <div className="p-4 space-y-4">
                {category.components.map((comp, compIdx) => (
                  <div key={compIdx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900">{comp.name}</h4>
                    </div>
                    
                    <div className="mb-3 p-2 bg-gray-50 rounded border-l-4 border-blue-500">
                      <span className="text-xs text-gray-500">📁 Location: </span>
                      <code className="text-xs text-blue-600 font-mono">{comp.location}</code>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Purpose: </span>
                        <span className="text-gray-600">{comp.purpose}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Workflow: </span>
                        <span className="text-gray-600">{comp.workflow}</span>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <span className="font-medium text-yellow-800">Business Logic: </span>
                        <span className="text-yellow-700 whitespace-pre-line">{comp.businessLogic}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAPIs = () => {
    const filteredAPIs = apiRoutes
      .map(category => ({
        ...category,
        endpoints: category.endpoints.filter(ep =>
          ep.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ep.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(category => category.endpoints.length > 0);

    return (
      <div className="space-y-4">
        {filteredAPIs.map((category, catIdx) => (
          <div key={catIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleSection(`api-${catIdx}`)}
            >
              <div>
                <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                <code className="text-xs text-indigo-200">{category.file}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                  {category.endpoints.length} endpoints
                </span>
                {expandedSections[`api-${catIdx}`] ? (
                  <ChevronDown className="w-5 h-5 text-white" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            {expandedSections[`api-${catIdx}`] && (
              <div className="divide-y divide-gray-100">
                {category.endpoints.map((ep, epIdx) => (
                  <div key={epIdx} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        ep.method === 'GET' ? 'bg-green-100 text-green-700' :
                        ep.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                        ep.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {ep.method}
                      </span>
                      <code className="text-sm font-mono text-gray-800">{ep.path}</code>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 ml-12">{ep.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBusinessLogic = () => (
    <div className="space-y-6">
      {businessLogic.map((flow, flowIdx) => (
        <div key={flowIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 cursor-pointer flex justify-between items-center"
            onClick={() => toggleSection(`biz-${flowIdx}`)}
          >
            <div>
              <h3 className="text-lg font-semibold text-white">{flow.name}</h3>
              <p className="text-sm text-emerald-100">{flow.description}</p>
            </div>
            {expandedSections[`biz-${flowIdx}`] ? (
              <ChevronDown className="w-5 h-5 text-white" />
            ) : (
              <ChevronRight className="w-5 h-5 text-white" />
            )}
          </div>

          {expandedSections[`biz-${flowIdx}`] && (
            <div className="p-6">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-teal-500">
                <span className="text-xs text-gray-500">📁 Location: </span>
                <code className="text-xs text-teal-600 font-mono">{flow.location}</code>
              </div>

              <div className="space-y-3 mb-6">
                {flow.steps.map((step, stepIdx) => (
                  <div key={stepIdx} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {stepIdx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{step.step}</div>
                      <div className="text-sm text-gray-600">{step.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {flow.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="font-medium text-amber-800 mb-1">📝 Notes:</div>
                  <p className="text-sm text-amber-700 whitespace-pre-line">{flow.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-80">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Book className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Project Documentation</h1>
            </div>
            <p className="text-gray-300">Complete system reference guide with workflows, components, APIs, and business logic</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          {/* Search - For Components and APIs */}
          {(activeTab === 'components' || activeTab === 'apis') && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'components' ? 'components' : 'API endpoints'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'sidebar' && renderSidebarPages()}
          {activeTab === 'system' && renderSystemOverview()}
          {activeTab === 'components' && renderComponents()}
          {activeTab === 'apis' && renderAPIs()}
          {activeTab === 'business' && renderBusinessLogic()}
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
