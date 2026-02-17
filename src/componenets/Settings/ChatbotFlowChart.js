import React, { useState, useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import Sidebar from "../Sidebar/sidebar";
import { Network, Search } from "lucide-react";

const ChatbotFlowChart = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");

  const moduleColors = {
    0: { bg: "#64748b", border: "#475569", label: "Main Menu" },
    10: { bg: "#3b82f6", border: "#2563eb", label: "Shopping" },
    20: { bg: "#eab308", border: "#ca8a04", label: "Cart" },
    30: { bg: "#f59e0b", border: "#d97706", label: "Discounts" },
    40: { bg: "#8b5cf6", border: "#7c3aed", label: "Checkout" },
    50: { bg: "#14b8a6", border: "#0d9488", label: "Pickup" },
    60: { bg: "#f97316", border: "#ea580c", label: "Support" },
    70: { bg: "#6366f1", border: "#4f46e5", label: "Profile" },
    80: { bg: "#10b981", border: "#059669", label: "Order History" },
    90: { bg: "#a855f7", border: "#9333ea", label: "Referral" },
  };

  const getModule = (code) => {
    const num = parseInt(code);
    if (code === "00") return "0";
    if (num === 0) return "0";
    if (num >= 10 && num <= 19) return "10";
    if (num >= 20 && num <= 29) return "20";
    if (num >= 30 && num <= 39) return "30";
    if (num >= 40 && num <= 49) return "40";
    if (num >= 50 && num <= 59) return "50";
    if (num >= 60 && num <= 69) return "60";
    if (num >= 70 && num <= 79) return "70";
    if (num >= 80 && num <= 89) return "80";
    if (num >= 90 && num <= 99) return "90";
    return "0";
  };

  const flowData = {
    nodes: [
      {
        id: "start",
        code: "START",
        label: "🚀 Customer Starts WhatsApp Chat",
        module: "0",
        x: 600,
        y: 0,
      },
      {
        id: "00",
        code: "00",
        label: "👋 greeting\\n'Hi [name],\\nhow can I assist you?'",
        module: "0",
        x: 600,
        y: 140,
      },
      {
        id: "0",
        code: "0",
        label:
          "📋 main_menu\\n'🏷 Get 10% discount on first order 💰'\\n'Main Menu:\\n1. Explore materials for shopping\\n2. My orders/History\\n3. Avail discounts\\n4. Learn about referral program\\n5. Support\\n6. My profile\\n7. Go to my cart\\n---Type number of choice'",
        module: "0",
        x: 600,
        y: 360,
      },
      {
        id: "10",
        code: "10",
        label:
          "🛍️ shopping_categories\\n'What are you looking for?\\nThis is the main shopping list'\\n[Lists all categories]\\n'Type 0 for main menu or\\nView cart to view your cart'",
        module: "10",
        x: 150,
        y: 680,
      },
      {
        id: "11",
        code: "11",
        label:
          "📂 subcategory_list\\n'You selected category: [name]'\\n'Product divisions under category'\\n[Lists subcategories]\\n'Type 0 or View cart'",
        module: "10",
        x: 150,
        y: 920,
      },
      {
        id: "12",
        code: "12",
        label:
          "📦 product_list\\n[Lists all products in subcategory]\\n'Select product number'\\n'Type 0 or View cart'",
        module: "10",
        x: 150,
        y: 1160,
      },
      {
        id: "13",
        code: "13",
        label:
          "📸 product_details\\n[Shows product details + images]\\n'1- Add to cart\\n2- Back to subcategories\\n3- Back to categories\\n0- Main menu'",
        module: "10",
        x: 150,
        y: 1400,
      },
      {
        id: "14",
        code: "14",
        label:
          "⚖️ select_weight\\n'Pick weight option for [product]:'\\n[Lists specifications]\\n'You chose [weight] at Rp [price]. Great choice!'",
        module: "10",
        x: 150,
        y: 1640,
      },
      {
        id: "15",
        code: "15",
        label:
          "🔢 quantity_input\\n'How many [product]\\nwould you like to order?\\n(Enter a number)'",
        module: "10",
        x: 150,
        y: 1880,
      },
      {
        id: "16",
        code: "16",
        label:
          "✅ post_add_to_cart\\n'added to your cart:\\n[product]\\n[quantity] bags\\nfor [price]'\\n\\n'What next?\\n1- View cart\\n2- Proceed to pay\\n3- Shop more\\n0- Main menu'",
        module: "10",
        x: 150,
        y: 2120,
      },
      {
        id: "20",
        code: "20",
        label:
          "🛒 cart_view\\n'Your Shopping Cart'\\n[Shows all cart items with details]\\n\\n'Options:\\nA- Delete an item\\nB- Empty cart fully\\nC- Proceed to payment\\nD- Go back to menu\\nE- View product details'",
        module: "20",
        x: 500,
        y: 2360,
      },
      {
        id: "21",
        code: "21",
        label:
          "🗑️ delete_item\\n'Which item to remove from cart?'\\n[Lists cart items with numbers]\\n'Enter item number to delete'",
        module: "20",
        x: 300,
        y: 2600,
      },
      {
        id: "22",
        code: "22",
        label:
          "⚠️ empty_cart_confirm\\n'Are you sure you want to\\nempty your cart?\\n\\n1. Yes, empty my cart\\n2. No, keep my items'",
        module: "20",
        x: 700,
        y: 2600,
      },
      {
        id: "30",
        code: "30",
        label:
          "💰 batch_discount_menu\\n'🎁 Special Discounts Available! 🎁'\\n'Here are all our current\\ndiscounted products'\\n[Shows discount products with prices]\\n[Lists eligible categories]\\n'Select product number\\nor type 0 for main menu'",
        module: "30",
        x: 1100,
        y: 680,
      },
      {
        id: "31",
        code: "31",
        label:
          "📁 batch_category_selected\\n[Shows all products in\\ndiscount category]\\n'Select product to view details'",
        module: "30",
        x: 1100,
        y: 920,
      },
      {
        id: "32",
        code: "32",
        label:
          "🏷️ discount_product_selected\\n[Shows discount product\\nfull details]\\n[Price comparison shown]\\n'Add to cart option'",
        module: "30",
        x: 1100,
        y: 1160,
      },
      {
        id: "33",
        code: "33",
        label:
          "📋 discount_products_list\\n'📋 Discounted Products:'\\n[Each product shows:]\\n'💰 Price: Rp [X]\\n(% OFF! Was: Rp [Y])'\\n'📦 Stock: [N] available'",
        module: "30",
        x: 1350,
        y: 920,
      },
      {
        id: "34",
        code: "34",
        label:
          "🔍 discount_product_details\\n[Full product information]\\n[Discount percentage shown]\\n[Savings highlighted]",
        module: "30",
        x: 1350,
        y: 1160,
      },
      {
        id: "35",
        code: "35",
        label:
          "⚖️ discount_weight_select\\n'Select weight for discount item'\\n[Weight options with\\ndiscounted prices]",
        module: "30",
        x: 1100,
        y: 1400,
      },
      {
        id: "36",
        code: "36",
        label:
          "🔢 discount_quantity_input\\n'Enter quantity for discount item'\\n[Quantity validation]",
        module: "30",
        x: 1100,
        y: 1640,
      },
      {
        id: "40",
        code: "40",
        label:
          "🚚 checkout_delivery_type\\n'Select delivery method:\\n1. Truck Delivery\\n2. Scooter Delivery\\n3. Self Pickup'",
        module: "40",
        x: 500,
        y: 2840,
      },
      {
        id: "41",
        code: "41",
        label:
          "🗺️ select_regency\\n'Select a regency:'\\n[Lists all available regencies]\\n'Type number to select'",
        module: "40",
        x: 300,
        y: 3080,
      },
      {
        id: "42",
        code: "42",
        label:
          "📍 checkout_location\\n'📍 [Regency Name]'\\n'Select an area:'\\n[Lists areas in regency]\\n'You selected [area].'\\n'Additional charge of Rp [X]\\nwill be applied'\\nor 'Free delivery to this area'",
        module: "40",
        x: 500,
        y: 3320,
      },
      {
        id: "43",
        code: "43",
        label:
          "🏠 select_saved_address\\n'Select one of your saved addresses:'\\n[Lists all addresses with:]\\n'[N]. [Nickname]: [FullAddress] ([Area])'\\n'Type address number to use'",
        module: "40",
        x: 300,
        y: 3560,
      },
      {
        id: "44",
        code: "44",
        label:
          "📸 wait_receipt\\n'Please upload your\\npayment receipt'\\n[Waits for image upload]\\n[Processes payment confirmation]",
        module: "40",
        x: 700,
        y: 3800,
      },
      {
        id: "45",
        code: "45",
        label:
          "📋 order_summary\\n'Order Review:'\\n[Complete order details:]\\n- Items\\n- Delivery address\\n- Total amount\\n\\n'Options:\\n1- Proceed Payment\\n2- Modify Cart\\n3- Change Address\\n4- Cancel Order'",
        module: "40",
        x: 500,
        y: 4040,
      },
      {
        id: "46",
        code: "46",
        label:
          "🏦 select_saved_bank\\n'Select bank for payment:'\\n[Shows available bank options]\\n[Bank account details]",
        module: "40",
        x: 700,
        y: 4280,
      },
      {
        id: "50",
        code: "50",
        label:
          "📅 pickup_date_select\\n'Choose pickup date:\\n\\n1. Today\\n2. Tomorrow\\n3. Later (13-day calendar)'",
        module: "50",
        x: 900,
        y: 3080,
      },
      {
        id: "51",
        code: "51",
        label:
          "✅ pickup_date_confirm\\n'📅 Select a pickup date\\n(from the next 13 days):'\\n'--------------------------------------------'\\n'1. Today'\\n'2. Tomorrow'\\n'3. [Date] (Mon)'\\n'4. [Date] (Tue)'\\n...[continues through day 13]\\n'Select number (1-13)'",
        module: "50",
        x: 900,
        y: 3320,
      },
      {
        id: "52",
        code: "52",
        label:
          "🕒 pickup_time_slot\\n'✅ Got it! Picking up on [date]'\\n'🕒 Select preferred pickup time slot:\\n\\n1. 6 AM – 9 AM\\n2. 9 AM – 12 PM\\n3. 12 PM – 3 PM\\n4. 3 PM – 6 PM\\n5. 6 PM – 9 PM'",
        module: "50",
        x: 900,
        y: 3560,
      },
      {
        id: "60",
        code: "60",
        label:
          "📞 support_menu\\n'Support Options:\\n\\n1. Product/Delivery Issue\\n2. Check Delivery Status\\n3. Payment Problem\\n4. Speak to Agent\\n5. Submit Complaint'",
        module: "60",
        x: 1650,
        y: 680,
      },
      {
        id: "61",
        code: "61",
        label:
          "📝 support_delivery_product\\n'Describe your issue'\\n[Customer describes problem]\\n[Issue logged to system]\\n'Issue Logged - Support will contact you'",
        module: "60",
        x: 1850,
        y: 920,
      },
      {
        id: "62",
        code: "62",
        label:
          "🚚 check_delivery\\n[Tracks order in system]\\n[Shows order tracking status]\\n'Your order is [status]'\\n[Expected delivery time shown]",
        module: "60",
        x: 1650,
        y: 920,
      },
      {
        id: "63",
        code: "63",
        label:
          "💳 payment_problem\\n[Collects billing issue details]\\n[Logs payment problem]\\n'Billing help will be provided'\\n'Support will contact you shortly'",
        module: "60",
        x: 1850,
        y: 1160,
      },
      {
        id: "64",
        code: "64",
        label:
          "👤 speak_to_agent\\n'Connecting you to a human agent...'\\n[Routes to live support]\\n'Human support will respond soon'\\n[Escalates to agent queue]",
        module: "60",
        x: 1650,
        y: 1160,
      },
      {
        id: "65",
        code: "65",
        label:
          "📨 submit_complaint\\n'Submit formal complaint'\\n[Formal complaint form]\\n[Collects details: nature, description, priority]\\n'Complaint submitted successfully'",
        module: "60",
        x: 1850,
        y: 1400,
      },
      {
        id: "70",
        code: "70",
        label:
          "👤 profile_menu\\n'Profile Options:\\n\\n1. Update Name\\n2. Update Email\\n3. Manage Addresses'",
        module: "70",
        x: 2000,
        y: 680,
      },
      {
        id: "71",
        code: "71",
        label:
          "✏️ update_name\\n'Enter your new name'\\n[Customer enters name]\\n[Updates in database]\\n'Name updated successfully'",
        module: "70",
        x: 2000,
        y: 920,
      },
      {
        id: "72",
        code: "72",
        label:
          "📧 update_email\\n'Enter your new email address'\\n[Customer enters email]\\n[Validates format]\\n[Updates in system]\\n'Email updated successfully'",
        module: "70",
        x: 2200,
        y: 920,
      },
      {
        id: "73",
        code: "73",
        label:
          "🏠 manage_addresses\\n'Address Book'\\n[Shows all saved addresses]\\n[Options to:]\\n- Add new address\\n- Edit existing\\n- Delete address\\n- Set default",
        module: "70",
        x: 2000,
        y: 1160,
      },
      {
        id: "80",
        code: "80",
        label:
          "📋 order_history\\n'Your Order History:'\\n[Lists all previous orders with:]\\n- Order ID\\n- Date\\n- Items\\n- Total amount\\n- Status\\n\\nor\\n\\n'No orders yet.\\nStart shopping to create\\nyour first order!'",
        module: "80",
        x: 600,
        y: 680,
      },
      {
        id: "90",
        code: "90",
        label:
          "🎁 referral_program\\n'Learn about our Referral Program'\\n[Explains referral benefits]\\n[Shows reward structure]\\n[Commission details]\\n[How to refer instructions]",
        module: "90",
        x: 2400,
        y: 680,
      },
      {
        id: "91",
        code: "91",
        label:
          "🎥 upload_referral_video\\n'Upload your referral video'\\n[Video upload instructions]\\n[File size limits]\\n[Format requirements]\\n[Processes video upload]",
        module: "90",
        x: 2400,
        y: 920,
      },
      {
        id: "success",
        code: "SUCCESS",
        label:
          "✅ ORDER SUCCESS\\n'✅ Your order is in progress\\nand will be confirmed once\\npayment is verified!'\\n\\n'🧾 Order ID: #[OrderID]'\\n'📦 We'll expect you on [date]\\nbetween [timeSlot].'\\n\\n'Thank you for shopping with us! 😊'",
        module: "40",
        x: 500,
        y: 4580,
      },
    ],
    edges: [
      { from: "start", to: "00", label: "🆕 New Customer" },
      { from: "00", to: "0", label: "Provides Name" },
      { from: "0", to: "10", label: "Option 1: Explore Shopping" },
      { from: "0", to: "80", label: "Option 2: My Orders" },
      { from: "0", to: "30", label: "Option 3: Avail Discounts" },
      { from: "0", to: "90", label: "Option 4: Referral Program" },
      { from: "0", to: "60", label: "Option 5: Support" },
      { from: "0", to: "70", label: "Option 6: My Profile" },
      { from: "0", to: "20", label: "Option 7: Go to Cart" },
      { from: "10", to: "11", label: "Choose Category" },
      { from: "11", to: "12", label: "Choose Subcategory" },
      { from: "12", to: "13", label: "Select Product" },
      { from: "13", to: "14", label: "Option 1: Add to Cart" },
      { from: "13", to: "11", label: "Option 2: Back to Subcategories" },
      { from: "13", to: "10", label: "Option 3: Back to Categories" },
      { from: "14", to: "15", label: "Select Weight" },
      { from: "15", to: "16", label: "Enter Quantity" },
      { from: "16", to: "10", label: "Option 1: Continue Shopping" },
      { from: "16", to: "20", label: "Option 2: View Cart" },
      { from: "16", to: "40", label: "Option 3: Checkout" },
      { from: "30", to: "31", label: "Select Category" },
      { from: "30", to: "33", label: "Browse All Discounts" },
      { from: "31", to: "32", label: "Choose Product" },
      { from: "33", to: "34", label: "Select Product" },
      { from: "32", to: "35", label: "Add to Cart" },
      { from: "34", to: "35", label: "Add to Cart" },
      { from: "35", to: "36", label: "Select Weight" },
      { from: "36", to: "20", label: "Added to Cart" },
      { from: "20", to: "21", label: "Option A: Delete Item" },
      { from: "20", to: "22", label: "Option B: Empty Cart" },
      { from: "20", to: "40", label: "Option C: Checkout" },
      { from: "20", to: "0", label: "Option D: Main Menu" },
      { from: "21", to: "20", label: "Item Deleted" },
      { from: "22", to: "0", label: "Cart Cleared" },
      { from: "40", to: "41", label: "Choice 1 or 2: Delivery" },
      { from: "40", to: "50", label: "Choice 3: Self Pickup" },
      { from: "41", to: "42", label: "Select Regency" },
      { from: "42", to: "43", label: "Option: Saved Address" },
      { from: "42", to: "45", label: "New Address Entered" },
      { from: "43", to: "45", label: "Address Selected" },
      { from: "45", to: "44", label: "Option 1: Proceed Payment" },
      { from: "45", to: "20", label: "Option 2: Modify Cart" },
      { from: "44", to: "46", label: "Upload Receipt" },
      { from: "46", to: "success", label: "Bank Selected" },
      { from: "50", to: "51", label: "Option 3: Later (Extended Calendar)" },
      { from: "50", to: "52", label: "Option 1 or 2: Today/Tomorrow" },
      { from: "51", to: "52", label: "Date Selected (1-13)" },
      { from: "52", to: "success", label: "Time Slot Selected" },
      { from: "60", to: "61", label: "Option 1: Product Issue" },
      { from: "60", to: "62", label: "Option 2: Check Delivery" },
      { from: "60", to: "63", label: "Option 3: Payment Problem" },
      { from: "60", to: "64", label: "Option 4: Speak to Agent" },
      { from: "60", to: "65", label: "Option 5: Submit Complaint" },
      { from: "61", to: "0", label: "Issue Logged" },
      { from: "62", to: "0", label: "Status Shown" },
      { from: "63", to: "0", label: "Help Provided" },
      { from: "64", to: "0", label: "Agent Contacted" },
      { from: "65", to: "0", label: "Complaint Submitted" },
      { from: "70", to: "71", label: "Option 1: Update Name" },
      { from: "70", to: "72", label: "Option 2: Update Email" },
      { from: "70", to: "73", label: "Option 3: Manage Addresses" },
      { from: "71", to: "0", label: "Name Updated" },
      { from: "72", to: "0", label: "Email Updated" },
      { from: "73", to: "0", label: "Addresses Saved" },
      { from: "80", to: "0", label: "View Orders Complete" },
      { from: "90", to: "91", label: "Upload Video" },
      { from: "91", to: "0", label: "Video Uploaded" },
      { from: "90", to: "0", label: "Learn Complete" },
      { from: "10", to: "0", label: "Type: 0 → Main Menu", style: "dashed" },
      { from: "11", to: "0", label: "Type: 0 → Main Menu", style: "dashed" },
      { from: "12", to: "0", label: "Type: 0 → Main Menu", style: "dashed" },
      { from: "13", to: "0", label: "Type: 0 → Main Menu", style: "dashed" },
      { from: "20", to: "0", label: "Type: 0 → Main Menu", style: "dashed" },
      { from: "30", to: "0", label: "Type: 0 → Main Menu", style: "dashed" },
      { from: "40", to: "0", label: "Type: 0 → Main Menu", style: "dashed" },
      { from: "60", to: "0", label: "Type: 0 → Main Menu", style: "dashed" },
      { from: "70", to: "0", label: "Type: 0 → Main Menu", style: "dashed" },
      { from: "success", to: "0", label: "Place New Order", style: "dashed" },
    ],
  };

  const initialNodes = useMemo(() => {
    return flowData.nodes.map((node) => {
      const moduleKey = getModule(node.code);
      const colors = moduleColors[moduleKey] || moduleColors["0"];
      return {
        id: node.id,
        type: "default",
        position: { x: node.x, y: node.y },
        data: {
          label: (
            <div className="text-center">
              <div className="font-bold text-xs mb-1">{node.code}</div>
              <div className="text-xs whitespace-pre-line font-mono">
                {node.label.replace(/\\n/g, "\n")}
              </div>
            </div>
          ),
        },
        style: {
          background:
            node.code === "START"
              ? "#10b981"
              : node.code === "SUCCESS"
                ? "#22c55e"
                : colors.bg,
          color: "white",
          border: `2px solid ${node.code === "START" ? "#059669" : node.code === "SUCCESS" ? "#16a34a" : colors.border}`,
          borderRadius: "12px",
          padding: "14px 18px",
          fontSize: "10px",
          minWidth: "220px",
          maxWidth: "280px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
        },
      };
    });
  }, []);

  const initialEdges = useMemo(() => {
    return flowData.edges.map((edge, idx) => ({
      id: `${edge.from}-${edge.to}-${idx}`,
      source: edge.from,
      target: edge.to,
      label: edge.label,
      type: "smoothstep",
      animated: edge.style === "dashed",
      style: {
        stroke: edge.style === "dashed" ? "#94a3b8" : "#64748b",
        strokeWidth: 2,
        strokeDasharray: edge.style === "dashed" ? "5,5" : "0",
      },
      labelStyle: {
        fill: "#475569",
        fontSize: "9px",
        fontWeight: "600",
      },
      labelBgStyle: {
        fill: "white",
        fillOpacity: 0.9,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.style === "dashed" ? "#94a3b8" : "#64748b",
      },
    }));
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const filteredNodes = useMemo(() => {
    let filtered = [...nodes];
    if (searchTerm) {
      filtered = filtered.filter((node) =>
        node.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (selectedModule !== "all") {
      filtered = filtered.filter((node) => {
        const nodeData = flowData.nodes.find((n) => n.id === node.id);
        return nodeData && getModule(nodeData.code) === selectedModule;
      });
    }
    return filtered;
  }, [nodes, searchTerm, selectedModule]);

  const filteredEdges = useMemo(() => {
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter(
      (edge) =>
        filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
    );
  }, [edges, filteredNodes]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-80" : ""}`}
      >
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Network className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                <strong>116.</strong> Chatbot Flow Visualization Analysis
              </h1>
              <p className="text-sm text-gray-500">
                Complete flowchart with ACTUAL messages from chatbot router -
                all conversation states visualized
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[300px]">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by code or state name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Modules</option>
              {Object.entries(moduleColors).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(moduleColors).map(([key, value]) => (
              <button
                key={key}
                onClick={() =>
                  setSelectedModule(selectedModule === key ? "all" : key)
                }
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: value.bg, color: "white" }}
              >
                {value.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[calc(100vh-220px)]">
          <ReactFlow
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            minZoom={0.05}
            maxZoom={1.5}
          >
            <Background color="#e2e8f0" gap={16} />
            <Controls />
            <MiniMap maskColor="rgba(0, 0, 0, 0.1)" />
          </ReactFlow>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span>
                <strong>{flowData.nodes.length}</strong> Conversation States
              </span>
              <span>
                <strong>{flowData.edges.length}</strong> Message Flows
              </span>
              <span>
                <strong>10</strong> Modules
              </span>
              <span className="text-xs text-green-600">
                ✅ Actual Messages from Chatbot Router
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Scroll to Zoom • Drag to Pan • Click Node to View Full Message
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotFlowChart;
