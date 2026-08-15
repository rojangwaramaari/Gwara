import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpenCheck,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  FileBarChart,
  FileSpreadsheet,
  Gauge,
  HandCoins,
  LayoutDashboard,
  PencilLine,
  PieChart as PieChartIcon,
  ReceiptText,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";

type OperatingData = {
  roomsAvailable: number;
  roomsSold: number;
  guests: number;
  roomRevenue: number;
  foodRevenue: number;
  beverageRevenue: number;
  otherRevenue: number;
  miscIncome: number;
  roomsDeptExpense: number;
  foodCost: number;
  beverageCost: number;
  fbPayroll: number;
  fbOtherExpense: number;
  otherDeptExpense: number;
  adminGeneral: number;
  salesMarketing: number;
  informationSystems: number;
  propertyOperations: number;
  utilities: number;
  managementFees: number;
  nonOperating: number;
};

type Invoice = {
  account: string;
  reference: string;
  due: string;
  amount: number;
  bucket: "Current" | "1-30" | "31-60" | "61-90" | "90+";
  status: "On track" | "Follow up" | "At risk";
};

const DEMO_DATA: OperatingData = {
  roomsAvailable: 2160,
  roomsSold: 1652,
  guests: 2348,
  roomRevenue: 16842500,
  foodRevenue: 6480000,
  beverageRevenue: 2260000,
  otherRevenue: 1765000,
  miscIncome: 425000,
  roomsDeptExpense: 4210625,
  foodCost: 1944000,
  beverageCost: 632800,
  fbPayroll: 1520000,
  fbOtherExpense: 780000,
  otherDeptExpense: 820000,
  adminGeneral: 1540000,
  salesMarketing: 1110000,
  informationSystems: 540000,
  propertyOperations: 1240000,
  utilities: 940000,
  managementFees: 535000,
  nonOperating: 1225000,
};

const INVOICES: Invoice[] = [
  { account: "Himalayan Travels", reference: "INV-25124", due: "08 Jan 2026", amount: 820000, bucket: "Current", status: "On track" },
  { account: "Summit Airlines", reference: "INV-25118", due: "28 Dec 2025", amount: 645000, bucket: "1-30", status: "Follow up" },
  { account: "Embassy Events", reference: "INV-25096", due: "12 Dec 2025", amount: 480000, bucket: "1-30", status: "Follow up" },
  { account: "MICE Nepal", reference: "INV-25072", due: "21 Nov 2025", amount: 365000, bucket: "31-60", status: "At risk" },
];

const trendData = [
  { month: "Jul", revenue: 21.2, gop: 7.4, budget: 20.4 },
  { month: "Aug", revenue: 22.8, gop: 8.1, budget: 21.1 },
  { month: "Sep", revenue: 24.1, gop: 8.8, budget: 22.6 },
  { month: "Oct", revenue: 26.7, gop: 10.2, budget: 24.8 },
  { month: "Nov", revenue: 25.5, gop: 9.6, budget: 25.1 },
  { month: "Dec", revenue: 27.8, gop: 10.7, budget: 26.4 },
];

const packageData = [
  { name: "Rooms", value: 5320000, share: 66.7, method: "Stand-alone selling price", color: "#0a5c52" },
  { name: "Food", value: 1780000, share: 22.3, method: "Menu fair value", color: "#d09b46" },
  { name: "Beverage", value: 620000, share: 7.8, method: "Menu fair value", color: "#588f88" },
  { name: "Experiences", value: 260000, share: 3.2, method: "Direct allocation", color: "#a7b3b0" },
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard, target: "overview" },
  { label: "GRR & KPIs", icon: TrendingUp, target: "grr" },
  { label: "Expenses", icon: ReceiptText, target: "expenses" },
  { label: "Receivables", icon: WalletCards, target: "receivables" },
  { label: "Reports", icon: FileBarChart, target: "reports" },
];

const inputFields: { key: keyof OperatingData; label: string; group: string }[] = [
  { key: "roomsAvailable", label: "Available room nights", group: "Operating volume" },
  { key: "roomsSold", label: "Occupied room nights", group: "Operating volume" },
  { key: "guests", label: "Guests in house", group: "Operating volume" },
  { key: "roomRevenue", label: "Rooms revenue", group: "Revenue (NPR)" },
  { key: "foodRevenue", label: "Food revenue", group: "Revenue (NPR)" },
  { key: "beverageRevenue", label: "Beverage revenue", group: "Revenue (NPR)" },
  { key: "otherRevenue", label: "Other operated revenue", group: "Revenue (NPR)" },
  { key: "miscIncome", label: "Miscellaneous income", group: "Revenue (NPR)" },
  { key: "roomsDeptExpense", label: "Rooms department expense", group: "Department expenses (NPR)" },
  { key: "foodCost", label: "Cost of food sales", group: "Department expenses (NPR)" },
  { key: "beverageCost", label: "Cost of beverage sales", group: "Department expenses (NPR)" },
  { key: "fbPayroll", label: "F&B payroll", group: "Department expenses (NPR)" },
  { key: "fbOtherExpense", label: "F&B other expense", group: "Department expenses (NPR)" },
  { key: "otherDeptExpense", label: "Other department expense", group: "Department expenses (NPR)" },
  { key: "adminGeneral", label: "Administrative & General", group: "Undistributed expenses (NPR)" },
  { key: "salesMarketing", label: "Sales & Marketing", group: "Undistributed expenses (NPR)" },
  { key: "informationSystems", label: "Information systems", group: "Undistributed expenses (NPR)" },
  { key: "propertyOperations", label: "Property operations", group: "Undistributed expenses (NPR)" },
  { key: "utilities", label: "Energy, water & waste", group: "Undistributed expenses (NPR)" },
  { key: "managementFees", label: "Management fees", group: "Below GOP (NPR)" },
  { key: "nonOperating", label: "Non-operating expenses", group: "Below GOP (NPR)" },
];

const formatNPR = (value: number, compact = true) => {
  if (compact && Math.abs(value) >= 10000000) return `NPR ${(value / 10000000).toFixed(2)} Cr`;
  if (compact && Math.abs(value) >= 100000) return `NPR ${(value / 100000).toFixed(2)} L`;
  return `NPR ${Math.round(value).toLocaleString("en-IN")}`;
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

function MetricCard({
  label,
  value,
  change,
  detail,
  icon: Icon,
  tone = "green",
}: {
  label: string;
  value: string;
  change: number;
  detail: string;
  icon: typeof Gauge;
  tone?: "green" | "gold";
}) {
  const positive = change >= 0;
  return (
    <div className="metric-card group">
      <div className={`metric-icon ${tone === "gold" ? "metric-icon-gold" : ""}`}>
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="metric-label">{label}</p>
        <p className="metric-value">{value}</p>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span className={positive ? "change-positive" : "change-negative"}>
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="truncate text-slate-400">{detail}</span>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function App() {
  const [activeNav, setActiveNav] = useState("overview");
  const [period, setPeriod] = useState("December 2025");
  const [now, setNow] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<OperatingData>(DEMO_DATA);
  const [draft, setDraft] = useState<OperatingData>(DEMO_DATA);
  const [showEditor, setShowEditor] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const metrics = useMemo(() => {
    const grossRevenue = data.roomRevenue + data.foodRevenue + data.beverageRevenue + data.otherRevenue + data.miscIncome;
    const fbExpense = data.foodCost + data.beverageCost + data.fbPayroll + data.fbOtherExpense;
    const departmentalExpenses = data.roomsDeptExpense + fbExpense + data.otherDeptExpense;
    const undistributedExpenses = data.adminGeneral + data.salesMarketing + data.informationSystems + data.propertyOperations + data.utilities;
    const gop = grossRevenue - departmentalExpenses - undistributedExpenses;
    const adjustedOperatingProfit = gop - data.managementFees - data.nonOperating;
    const totalExpenses = departmentalExpenses + undistributedExpenses + data.managementFees + data.nonOperating;
    return {
      grossRevenue,
      fbExpense,
      departmentalExpenses,
      undistributedExpenses,
      gop,
      adjustedOperatingProfit,
      totalExpenses,
      occupancy: data.roomsAvailable ? (data.roomsSold / data.roomsAvailable) * 100 : 0,
      adr: data.roomsSold ? data.roomRevenue / data.roomsSold : 0,
      revpar: data.roomsAvailable ? data.roomRevenue / data.roomsAvailable : 0,
      trevpar: data.roomsAvailable ? grossRevenue / data.roomsAvailable : 0,
      goppar: data.roomsAvailable ? gop / data.roomsAvailable : 0,
      cpor: data.roomsSold ? data.roomsDeptExpense / data.roomsSold : 0,
      gopMargin: grossRevenue ? (gop / grossRevenue) * 100 : 0,
      expenseRatio: grossRevenue ? (totalExpenses / grossRevenue) * 100 : 0,
      foodCostPercent: data.foodRevenue ? (data.foodCost / data.foodRevenue) * 100 : 0,
      beverageCostPercent: data.beverageRevenue ? (data.beverageCost / data.beverageRevenue) * 100 : 0,
      avgSpendPerGuest: data.guests ? (data.foodRevenue + data.beverageRevenue) / data.guests : 0,
      guestsPerRoom: data.roomsSold ? data.guests / data.roomsSold : 0,
    };
  }, [data]);

  const departmentRows = useMemo(
    () => [
      { department: "Rooms", schedule: "Schedule 1", revenue: data.roomRevenue, expense: data.roomsDeptExpense },
      { department: "Food & Beverage", schedule: "Schedule 2", revenue: data.foodRevenue + data.beverageRevenue, expense: metrics.fbExpense },
      { department: "Other Operated", schedule: "Schedule 3", revenue: data.otherRevenue, expense: data.otherDeptExpense },
      { department: "Miscellaneous Income", schedule: "Schedule 4", revenue: data.miscIncome, expense: 0 },
    ],
    [data, metrics.fbExpense],
  );

  const expenseRows = useMemo(
    () => [
      { name: "Departmental expenses", schedule: "Schedules 1-3", actual: metrics.departmentalExpenses, budget: 10420000 },
      { name: "Administrative & General", schedule: "Schedule 5", actual: data.adminGeneral, budget: 1480000 },
      { name: "Information systems", schedule: "Schedule 6", actual: data.informationSystems, budget: 560000 },
      { name: "Sales & Marketing", schedule: "Schedule 7", actual: data.salesMarketing, budget: 1180000 },
      { name: "Property operations", schedule: "Schedule 8", actual: data.propertyOperations, budget: 1260000 },
      { name: "Energy, water & waste", schedule: "Schedule 9", actual: data.utilities, budget: 980000 },
      { name: "Management fees", schedule: "Schedule 10", actual: data.managementFees, budget: 540000 },
      { name: "Non-operating", schedule: "Schedule 11", actual: data.nonOperating, budget: 1190000 },
    ],
    [data, metrics.departmentalExpenses],
  );

  const arAging = [
    { label: "Current", value: 1960000, color: "#0a5c52" },
    { label: "1-30 days", value: 1180000, color: "#5f958e" },
    { label: "31-60 days", value: 650000, color: "#d09b46" },
    { label: "61-90 days", value: 310000, color: "#c66f50" },
    { label: "90+ days", value: 180000, color: "#a94d48" },
  ];
  const arTotal = arAging.reduce((sum, row) => sum + row.value, 0);

  const kathmanduDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(now);
  const kathmanduTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  const scrollTo = (target: string) => {
    setActiveNav(target);
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const runSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;
    const destinations = [
      { target: "grr", terms: "grr revenue room occupancy adr revpar trevpar goppar package" },
      { target: "expenses", terms: "expense food beverage cost payroll utilities energy waste" },
      { target: "receivables", terms: "ar receivable aging invoice collection account" },
      { target: "reports", terms: "report download excel export workbook" },
      { target: "standards", terms: "usali standard mapping compliance schedule" },
    ];
    const destination = destinations.find((item) => item.terms.includes(query));
    if (destination) {
      scrollTo(destination.target);
      setToast(`Showing results for ${searchQuery}`);
      searchRef.current?.blur();
    } else {
      setToast(`No report matched ${searchQuery}`);
    }
  };

  const openEditor = () => {
    setDraft(data);
    setShowEditor(true);
  };

  const saveInputs = () => {
    setData(draft);
    setShowEditor(false);
    setToast("Operating report recalculated");
  };

  const buildWorkbook = () => {
    const workbook = XLSX.utils.book_new();
    const summary = [
      ["GWARA FIN - GROSS REVENUE REPORT"],
      ["Property", "Gwara Heritage Hotel, Kathmandu"],
      ["Reporting period", period],
      ["Standard", "USALI 12th Revised Edition management presentation"],
      ["Generated", `${kathmanduDate} ${kathmanduTime} NPT`],
      [],
      ["Measure", "Value"],
      ["Gross Operating Revenue", metrics.grossRevenue],
      ["Departmental Expenses", metrics.departmentalExpenses],
      ["Undistributed Operating Expenses", metrics.undistributedExpenses],
      ["Gross Operating Profit (GOP)", metrics.gop],
      ["Management Fees", data.managementFees],
      ["Non-operating Expenses", data.nonOperating],
      ["Adjusted Operating Result", metrics.adjustedOperatingProfit],
    ];
    const kpis = [
      ["USALI / Operating Metric", "Value"],
      ["Available Room Nights", data.roomsAvailable],
      ["Occupied Room Nights", data.roomsSold],
      ["Guests in House", data.guests],
      ["Occupancy %", metrics.occupancy],
      ["ADR", metrics.adr],
      ["RevPAR", metrics.revpar],
      ["TRevPAR", metrics.trevpar],
      ["GOPPAR", metrics.goppar],
      ["CPOR", metrics.cpor],
      ["GOP Margin %", metrics.gopMargin],
      ["Food Cost %", metrics.foodCostPercent],
      ["Beverage Cost %", metrics.beverageCostPercent],
      ["Average F&B Spend / Guest", metrics.avgSpendPerGuest],
    ];
    const departments = [
      ["Department", "USALI Schedule", "Revenue", "Expense", "Department Profit", "Profit Margin %"],
      ...departmentRows.map((row) => [
        row.department,
        row.schedule,
        row.revenue,
        row.expense,
        row.revenue - row.expense,
        row.revenue ? ((row.revenue - row.expense) / row.revenue) * 100 : 0,
      ]),
    ];
    const packages = [
      ["Package Component", "Allocation", "Share %", "Allocation Basis"],
      ...packageData.map((row) => [row.name, row.value, row.share, row.method]),
      ["Total Package Revenue", packageData.reduce((sum, row) => sum + row.value, 0), 100, ""],
    ];
    const expenses = [
      ["Expense Category", "USALI Schedule", "Actual", "Budget", "Variance"],
      ...expenseRows.map((row) => [row.name, row.schedule, row.actual, row.budget, row.budget - row.actual]),
    ];
    const receivables = [
      ["AR Aging Bucket", "Outstanding"],
      ...arAging.map((row) => [row.label, row.value]),
      ["Total Accounts Receivable", arTotal],
      [],
      ["Account", "Invoice", "Due Date", "Outstanding", "Aging", "Status"],
      ...INVOICES.map((invoice) => [invoice.account, invoice.reference, invoice.due, invoice.amount, invoice.bucket, invoice.status]),
    ];

    const sheets = [
      ["GRR Summary", summary],
      ["USALI Metrics", kpis],
      ["Department P&L", departments],
      ["Package Allocation", packages],
      ["Expense Schedule", expenses],
      ["AR Aging", receivables],
    ] as const;

    sheets.forEach(([name, rows]) => {
      const sheet = XLSX.utils.aoa_to_sheet(rows as unknown[][]);
      sheet["!cols"] = rows[0].map((_, index) => ({ wch: index === 0 ? 31 : 22 }));
      XLSX.utils.book_append_sheet(workbook, sheet, name);
    });
    return workbook;
  };

  const exportWorkbook = () => {
    XLSX.writeFile(buildWorkbook(), `Gwara-Fin-GRR-${period.replace(/ /g, "-")}.xlsx`);
    setToast("Excel workbook downloaded");
  };

  const exportSingleSheet = (name: string) => {
    const fullWorkbook = buildWorkbook();
    const workbook = XLSX.utils.book_new();
    const sheet = fullWorkbook.Sheets[name];
    if (!sheet) return;
    XLSX.utils.book_append_sheet(workbook, sheet, name);
    XLSX.writeFile(workbook, `Gwara-Fin-${name.replace(/ /g, "-")}-${period.replace(/ /g, "-")}.xlsx`);
    setToast(`${name} downloaded`);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <div className="brand-mark"><span>G</span></div>
          <div>
            <div className="brand-name">Gwara Fin</div>
            <div className="brand-subtitle">Hotel accounting</div>
          </div>
        </div>

        <div className="property-switcher">
          <div className="property-icon"><Building2 size={17} /></div>
          <div className="min-w-0 flex-1">
            <p>Active property</p>
            <strong>Gwara Heritage</strong>
          </div>
          <ChevronDown size={15} className="text-white/40" />
        </div>

        <nav className="side-nav" aria-label="Primary navigation">
          <p className="side-label">Workspace</p>
          {navItems.map((item) => (
            <button key={item.target} className={activeNav === item.target ? "active" : ""} onClick={() => scrollTo(item.target)}>
              <item.icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
              {item.target === "receivables" && <span className="nav-count">4</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={() => scrollTo("standards")}><BookOpenCheck size={18} /> USALI mapping</button>
          <button onClick={openEditor}><Settings2 size={18} /> Report settings</button>
          <div className="standard-badge">
            <ShieldCheck size={18} />
            <div><strong>12th Edition</strong><span>Reporting structure active</span></div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-mark"><span>G</span></div>
            <strong>Gwara Fin</strong>
          </div>
          <div className="search-box">
            <Search size={17} />
            <input ref={searchRef} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && runSearch()} aria-label="Search reports" placeholder="Search reports, invoices..." />
            <kbd>Cmd K</kbd>
          </div>
          <div className="topbar-right">
            <div className="kathmandu-clock" aria-label="Current time in Kathmandu">
              <Clock3 size={16} />
              <div><strong>{kathmanduTime}</strong><span>{kathmanduDate} | Kathmandu</span></div>
            </div>
            <div className="notification-wrap">
              <button className="icon-button" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={18} />
                <span className="notification-dot" />
              </button>
              {showNotifications && (
                <div className="notification-menu">
                  <strong>Finance alerts</strong>
                  <p><span className="alert-dot gold" />2 AR accounts require follow up</p>
                  <p><span className="alert-dot green" />December GRR is reconciled</p>
                </div>
              )}
            </div>
            <div className="avatar">AS</div>
          </div>
        </header>

        <div className="content-wrap">
          <section id="overview" className="scroll-section page-intro">
            <div>
              <p className="eyebrow">Financial command centre</p>
              <h1>Executive overview</h1>
              <p>One clear view of revenue, profitability, cost controls and collections.</p>
            </div>
            <div className="intro-actions">
              <label className="period-select">
                <CalendarDays size={16} />
                <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Reporting period">
                  <option>December 2025</option>
                  <option>November 2025</option>
                  <option>FY 2025</option>
                </select>
                <ChevronDown size={14} />
              </label>
              <button className="button-secondary" onClick={openEditor}><PencilLine size={16} /> Update inputs</button>
              <button className="button-primary" onClick={exportWorkbook}><Download size={16} /> Export all</button>
            </div>
          </section>

          <section className="metric-grid" aria-label="Executive metrics">
            <MetricCard label="Gross operating revenue" value={formatNPR(metrics.grossRevenue)} change={5.2} detail="vs budget" icon={CircleDollarSign} />
            <MetricCard label="Gross operating profit" value={formatNPR(metrics.gop)} change={8.4} detail={`${formatPercent(metrics.gopMargin)} margin`} icon={TrendingUp} />
            <MetricCard label="Occupancy" value={formatPercent(metrics.occupancy)} change={2.8} detail="vs last month" icon={Building2} tone="gold" />
            <MetricCard label="RevPAR" value={formatNPR(metrics.revpar, false)} change={6.1} detail={`ADR ${formatNPR(metrics.adr, false)}`} icon={Gauge} />
          </section>

          <section className="dashboard-grid dashboard-grid-top">
            <div className="panel revenue-panel">
              <div className="panel-header">
                <div><p className="eyebrow">Performance</p><h3>Revenue and GOP trend</h3></div>
                <div className="chart-legend"><span><i className="legend-revenue" /> Revenue</span><span><i className="legend-gop" /> GOP</span><span><i className="legend-budget" /> Budget</span></div>
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 12, right: 4, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0a5c52" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#0a5c52" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#e7ecea" strokeDasharray="3 5" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#7b8a86", fontSize: 12 }} dy={9} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#7b8a86", fontSize: 11 }} tickFormatter={(value) => `${value}M`} />
                    <Tooltip contentStyle={{ border: "1px solid #dfe6e3", borderRadius: 10, boxShadow: "0 12px 30px rgba(12,35,31,.1)", fontSize: 12 }} formatter={(value) => [`NPR ${Number(value).toFixed(1)}M`]} />
                    <Area type="monotone" dataKey="revenue" stroke="#0a5c52" strokeWidth={2.5} fill="url(#revenueFill)" activeDot={{ r: 4, fill: "#0a5c52", stroke: "white", strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="gop" stroke="#d09b46" strokeWidth={2.2} fill="transparent" activeDot={{ r: 4 }} />
                    <Area type="monotone" dataKey="budget" stroke="#9da9a6" strokeWidth={1.5} strokeDasharray="5 5" fill="transparent" activeDot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel earnings-panel">
              <div className="panel-header">
                <div><p className="eyebrow">Profitability</p><h3>Earnings vs expenses</h3></div>
                <span className="status-tag"><Check size={12} /> Reconciled</span>
              </div>
              <div className="earnings-amount">
                <div><span>Adjusted operating result</span><strong>{formatNPR(metrics.adjustedOperatingProfit)}</strong></div>
                <span className="change-positive"><ArrowUpRight size={13} /> 9.2%</span>
              </div>
              <div className="profit-bridge">
                <div><span style={{ width: "100%" }} /><label>Gross revenue <b>{formatNPR(metrics.grossRevenue)}</b></label></div>
                <div><span className="bar-expenses" style={{ width: `${Math.min((metrics.totalExpenses / metrics.grossRevenue) * 100, 100)}%` }} /><label>Total expenses <b>{formatNPR(metrics.totalExpenses)}</b></label></div>
                <div><span className="bar-profit" style={{ width: `${Math.max((metrics.adjustedOperatingProfit / metrics.grossRevenue) * 100, 0)}%` }} /><label>Operating result <b>{formatNPR(metrics.adjustedOperatingProfit)}</b></label></div>
              </div>
              <div className="profit-footer"><span>Expense ratio <strong>{formatPercent(metrics.expenseRatio)}</strong></span><span>GOP margin <strong>{formatPercent(metrics.gopMargin)}</strong></span></div>
            </div>
          </section>

          <section id="grr" className="scroll-section content-section">
            <SectionHeading
              eyebrow="Gross Revenue Report"
              title="GRR and departmental performance"
              description="Revenue and direct expenses mapped to USALI operating schedules."
              action={<button className="text-button" onClick={() => exportSingleSheet("Department P&L")}><FileSpreadsheet size={15} /> Export department P&L</button>}
            />
            <div className="panel table-panel">
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Department</th><th>Revenue</th><th>Dept. expenses</th><th>Dept. profit</th><th>Profit margin</th><th>Mix</th></tr></thead>
                  <tbody>
                    {departmentRows.map((row) => {
                      const profit = row.revenue - row.expense;
                      const margin = row.revenue ? (profit / row.revenue) * 100 : 100;
                      return (
                        <tr key={row.department}>
                          <td><strong>{row.department}</strong><span>{row.schedule}</span></td>
                          <td>{formatNPR(row.revenue)}</td>
                          <td>{formatNPR(row.expense)}</td>
                          <td className="profit-cell">{formatNPR(profit)}</td>
                          <td><strong>{formatPercent(margin)}</strong></td>
                          <td><div className="mix-bar"><span style={{ width: `${(row.revenue / metrics.grossRevenue) * 100}%` }} /></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot><tr><td>Gross operating revenue</td><td>{formatNPR(metrics.grossRevenue)}</td><td>{formatNPR(metrics.departmentalExpenses)}</td><td>{formatNPR(metrics.grossRevenue - metrics.departmentalExpenses)}</td><td>{formatPercent(((metrics.grossRevenue - metrics.departmentalExpenses) / metrics.grossRevenue) * 100)}</td><td /></tr></tfoot>
                </table>
              </div>
            </div>

            <div className="ratio-strip" aria-label="Calculated hotel performance ratios">
              {[
                ["ADR", formatNPR(metrics.adr, false), "Room revenue / rooms sold"],
                ["TRevPAR", formatNPR(metrics.trevpar, false), "Total revenue / rooms available"],
                ["GOPPAR", formatNPR(metrics.goppar, false), "GOP / rooms available"],
                ["CPOR", formatNPR(metrics.cpor, false), "Rooms expense / rooms sold"],
                ["Guests / room", metrics.guestsPerRoom.toFixed(2), "Total guests / rooms sold"],
              ].map(([label, value, info]) => <div key={label}><span>{label}</span><strong>{value}</strong><small>{info}</small></div>)}
            </div>
          </section>

          <section className="content-section">
            <SectionHeading eyebrow="All-inclusive reporting" title="Package segregation" description="Package consideration allocated by relative stand-alone selling value before departmental recognition." />
            <div className="dashboard-grid package-grid">
              <div className="panel package-visual">
                <div className="donut-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={packageData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={91} paddingAngle={2} stroke="none">
                        {packageData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value) => formatNPR(Number(value))} contentStyle={{ border: "1px solid #dfe6e3", borderRadius: 10, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-label"><span>Package revenue</span><strong>{formatNPR(7980000)}</strong><small>100% allocated</small></div>
                </div>
                <div className="package-legend">
                  {packageData.map((row) => <div key={row.name}><span><i style={{ background: row.color }} />{row.name}</span><strong>{row.share}%</strong></div>)}
                </div>
              </div>
              <div className="panel allocation-table">
                <div className="allocation-head"><span>Component</span><span>Allocation</span><span>Basis</span></div>
                {packageData.map((row) => <div className="allocation-row" key={row.name}><span><i style={{ background: row.color }} />{row.name}<small>{row.share}% of package</small></span><strong>{formatNPR(row.value)}</strong><em>{row.method}</em></div>)}
                <div className="allocation-total"><span><Check size={15} /> Allocation check</span><strong>NPR 0 variance</strong></div>
              </div>
            </div>
          </section>

          <section id="expenses" className="scroll-section content-section">
            <SectionHeading
              eyebrow="Cost control"
              title="Expenses and operating costs"
              description="Departmental, undistributed and below-GOP expense visibility against budget."
              action={<button className="text-button" onClick={() => exportSingleSheet("Expense Schedule")}><Download size={15} /> Expense schedule</button>}
            />
            <div className="dashboard-grid expenses-grid">
              <div className="panel table-panel expense-table-panel">
                <div className="table-scroll">
                  <table className="expense-table">
                    <thead><tr><th>Expense schedule</th><th>Actual</th><th>Budget</th><th>Variance</th></tr></thead>
                    <tbody>{expenseRows.map((row) => {
                      const variance = row.budget - row.actual;
                      return <tr key={row.name}><td><strong>{row.name}</strong><span>{row.schedule}</span></td><td>{formatNPR(row.actual)}</td><td>{formatNPR(row.budget)}</td><td className={variance >= 0 ? "favorable" : "unfavorable"}>{variance >= 0 ? "+" : ""}{formatNPR(variance)}<small>{variance >= 0 ? "Favorable" : "Unfavorable"}</small></td></tr>;
                    })}</tbody>
                  </table>
                </div>
              </div>
              <div className="cost-column">
                <div className="panel cost-card food-cost">
                  <div className="cost-card-top"><div><p>Food cost</p><strong>{formatPercent(metrics.foodCostPercent)}</strong></div><span className="target-ok"><Check size={13} /> Within target</span></div>
                  <div className="target-line"><span style={{ width: `${Math.min(metrics.foodCostPercent * 2.5, 100)}%` }} /><i style={{ left: "80%" }} /></div>
                  <div className="cost-details"><span>COGS {formatNPR(data.foodCost)}</span><span>Target &lt;= 32.0%</span></div>
                </div>
                <div className="panel cost-card beverage-cost">
                  <div className="cost-card-top"><div><p>Beverage cost</p><strong>{formatPercent(metrics.beverageCostPercent)}</strong></div><span className="target-watch"><ArrowUpRight size={13} /> 1.0% over</span></div>
                  <div className="target-line"><span style={{ width: `${Math.min(metrics.beverageCostPercent * 2.8, 100)}%` }} /><i style={{ left: "75%" }} /></div>
                  <div className="cost-details"><span>COGS {formatNPR(data.beverageCost)}</span><span>Target &lt;= 27.0%</span></div>
                </div>
                <div className="panel guest-spend">
                  <div className="guest-icon"><UsersRound size={19} /></div>
                  <div><p>Average F&B spend / guest</p><strong>{formatNPR(metrics.avgSpendPerGuest, false)}</strong></div>
                  <span className="change-positive"><ArrowUpRight size={12} /> 4.6%</span>
                </div>
              </div>
            </div>
          </section>

          <section id="receivables" className="scroll-section content-section">
            <SectionHeading
              eyebrow="Accounts receivable"
              title="AR aging and collections"
              description="Corporate and travel-agent balances prioritized by collection risk."
              action={<button className="text-button" onClick={() => exportSingleSheet("AR Aging")}><Download size={15} /> AR aging report</button>}
            />
            <div className="ar-overview">
              <div><span>Total receivables</span><strong>{formatNPR(arTotal)}</strong><small>14.8% of gross revenue</small></div>
              <div><span>Current</span><strong>{formatNPR(1960000)}</strong><small>45.8% of total AR</small></div>
              <div><span>Over 60 days</span><strong className="risk-text">{formatNPR(490000)}</strong><small>11.4% requires action</small></div>
              <div><span>Collection rate</span><strong>86.4%</strong><small>+3.2% vs last month</small></div>
            </div>
            <div className="dashboard-grid ar-grid">
              <div className="panel aging-panel">
                <div className="panel-header"><div><p className="eyebrow">Outstanding balance</p><h3>AR aging distribution</h3></div></div>
                <div className="aging-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={arAging} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 8 }}>
                      <CartesianGrid horizontal={false} stroke="#edf1ef" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#8a9894" }} tickFormatter={(value) => `${value / 100000}L`} />
                      <YAxis type="category" dataKey="label" width={76} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#53635f" }} />
                      <Tooltip formatter={(value) => formatNPR(Number(value))} cursor={{ fill: "#f3f6f5" }} contentStyle={{ border: "1px solid #dfe6e3", borderRadius: 10, fontSize: 12 }} />
                      <Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={15}>{arAging.map((entry) => <Cell key={entry.label} fill={entry.color} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="panel invoice-panel">
                <div className="panel-header"><div><p className="eyebrow">Collection queue</p><h3>Priority accounts</h3></div><button className="plain-link" onClick={() => setToast("Collection queue is up to date")}>Review all</button></div>
                <div className="invoice-list">
                  {INVOICES.map((invoice) => <div className="invoice-row" key={invoice.reference}>
                    <div className="account-initial">{invoice.account.slice(0, 2).toUpperCase()}</div>
                    <div className="invoice-name"><strong>{invoice.account}</strong><span>{invoice.reference} | Due {invoice.due}</span></div>
                    <div className="invoice-amount"><strong>{formatNPR(invoice.amount)}</strong><span className={`invoice-status ${invoice.status === "At risk" ? "at-risk" : invoice.status === "Follow up" ? "follow-up" : ""}`}>{invoice.status}</span></div>
                  </div>)}
                </div>
              </div>
            </div>
          </section>

          <section id="standards" className="scroll-section content-section">
            <div className="standards-band">
              <div className="standards-copy">
                <div className="standards-icon"><BookOpenCheck size={22} /></div>
                <div><p className="eyebrow">Controls and classification</p><h2>USALI 12th Edition mapping</h2><p>Management presentation includes current departmental schedules and new operating disclosures effective 1 January 2026.</p></div>
              </div>
              <div className="standards-list">
                <span><Check size={14} /> Executive lounge costs</span>
                <span><Check size={14} /> Energy, water & waste</span>
                <span><Check size={14} /> Payroll FTE schedule</span>
                <span><Check size={14} /> All-inclusive allocation</span>
              </div>
            </div>
          </section>

          <section id="reports" className="scroll-section content-section reports-section">
            <SectionHeading eyebrow="Reporting centre" title="Download-ready finance reports" description="Each workbook is formatted as a separate reporting schedule for review and reconciliation." />
            <div className="report-list">
              {[
                { name: "GRR Summary", description: "Gross revenue, GOP and adjusted operating result", icon: FileBarChart },
                { name: "USALI Metrics", description: "Occupancy, ADR, RevPAR, TRevPAR, GOPPAR and CPOR", icon: Gauge },
                { name: "Department P&L", description: "Schedules 1 to 4 departmental profitability", icon: PieChartIcon },
                { name: "Package Allocation", description: "Rooms, food, beverage and experience segregation", icon: ReceiptText },
                { name: "Expense Schedule", description: "Actual, budget and favorable variance by schedule", icon: HandCoins },
                { name: "AR Aging", description: "Aging summary and open customer invoice detail", icon: WalletCards },
              ].map((report) => <div className="report-row" key={report.name}>
                <div className="report-icon"><report.icon size={19} /></div>
                <div><strong>{report.name}</strong><span>{report.description}</span></div>
                <span className="report-period">{period}</span>
                <button onClick={() => exportSingleSheet(report.name)} aria-label={`Download ${report.name}`}><Download size={17} /></button>
              </div>)}
            </div>
            <div className="download-all-band">
              <div><FileSpreadsheet size={24} /><div><strong>Complete Gwara Fin finance workbook</strong><span>All six schedules in one reconciled Excel file</span></div></div>
              <button className="button-primary" onClick={exportWorkbook}><Download size={16} /> Download .xlsx</button>
            </div>
          </section>

          <footer><span>Gwara Fin | Hotel Finance Intelligence</span><span>Management reporting only. Final statutory treatment should be reviewed by a qualified accountant.</span></footer>
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => <button key={item.target} className={activeNav === item.target ? "active" : ""} onClick={() => scrollTo(item.target)}><item.icon size={18} /><span>{item.label === "GRR & KPIs" ? "GRR" : item.label}</span></button>)}
      </nav>

      {showEditor && (
        <div className="editor-overlay" role="dialog" aria-modal="true" aria-labelledby="editor-title">
          <button className="overlay-close" aria-label="Close data editor" onClick={() => setShowEditor(false)} />
          <div className="editor-panel">
            <div className="editor-header">
              <div><p className="eyebrow">Live calculator</p><h2 id="editor-title">Update operating inputs</h2><span>All KPIs and reports recalculate automatically.</span></div>
              <button className="icon-button" onClick={() => setShowEditor(false)}><X size={19} /></button>
            </div>
            <div className="editor-body">
              {[...new Set(inputFields.map((field) => field.group))].map((group) => <fieldset key={group}>
                <legend>{group}</legend>
                <div className="editor-grid">
                  {inputFields.filter((field) => field.group === group).map((field) => <label key={field.key}><span>{field.label}</span><input type="number" min="0" value={draft[field.key]} onChange={(event) => setDraft({ ...draft, [field.key]: Number(event.target.value) })} /></label>)}
                </div>
              </fieldset>)}
            </div>
            <div className="editor-footer">
              <button className="button-secondary" onClick={() => setDraft(DEMO_DATA)}><RefreshCw size={15} /> Reset demo</button>
              <button className="button-primary" onClick={saveInputs}><Check size={16} /> Save and recalculate</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </div>
  );
}

export default App;