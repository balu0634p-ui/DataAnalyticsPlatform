import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import "./App.css";

/* =========================================================
   API
========================================================= */

const API_URL =
  "http://127.0.0.1:8000/api/analytics/";

/* =========================================================
   FORMATTERS
========================================================= */

function money(value) {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 0,
    }
  )}`;
}

function number(value) {
  return Number(value || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 0,
    }
  );
}

function percent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

/* =========================================================
   SAFE HELPERS
========================================================= */

function getValue(
  obj,
  keys,
  fallback = 0
) {
  for (const key of keys) {
    if (
      obj &&
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== ""
    ) {
      return obj[key];
    }
  }

  return fallback;
}

function textValue(
  obj,
  keys,
  fallback = "—"
) {
  return String(
    getValue(obj, keys, fallback)
  );
}

function numberValue(
  obj,
  keys,
  fallback = 0
) {
  const value = Number(
    getValue(obj, keys, fallback)
  );

  return Number.isFinite(value)
    ? value
    : fallback;
}

/* =========================================================
   NORMALIZERS
========================================================= */

function normalizeRegion(item) {
  const revenue = numberValue(
    item,
    [
      "revenue",
      "sales",
      "total_revenue",
    ]
  );

  const profit = numberValue(
    item,
    [
      "profit",
      "total_profit",
    ]
  );

  const orders = numberValue(
    item,
    [
      "orders",
      "total_orders",
      "order_count",
    ]
  );

  const quantity = numberValue(
    item,
    [
      "quantity",
      "total_quantity",
    ]
  );

  let margin = numberValue(
    item,
    [
      "margin",
      "profit_margin",
      "profit_margin_percent",
    ]
  );

  if (
    margin === 0 &&
    revenue > 0
  ) {
    margin =
      (profit / revenue) * 100;
  }

  return {
    region: textValue(
      item,
      [
        "region",
        "name",
        "region_name",
      ]
    ),
    revenue,
    profit,
    orders,
    quantity,
    margin,
  };
}

function normalizeCategory(item) {
  const revenue = numberValue(
    item,
    [
      "revenue",
      "sales",
      "total_revenue",
    ]
  );

  const profit = numberValue(
    item,
    [
      "profit",
      "total_profit",
    ]
  );

  const orders = numberValue(
    item,
    [
      "orders",
      "total_orders",
      "order_count",
    ]
  );

  const quantity = numberValue(
    item,
    [
      "quantity",
      "total_quantity",
    ]
  );

  let margin = numberValue(
    item,
    [
      "margin",
      "profit_margin",
      "profit_margin_percent",
    ]
  );

  if (
    margin === 0 &&
    revenue > 0
  ) {
    margin =
      (profit / revenue) * 100;
  }

  return {
    category: textValue(
      item,
      [
        "category",
        "name",
        "category_name",
      ]
    ),
    revenue,
    profit,
    orders,
    quantity,
    margin,
  };
}

function normalizeProduct(item) {
  const revenue = numberValue(
    item,
    [
      "revenue",
      "sales",
      "total_revenue",
    ]
  );

  const profit = numberValue(
    item,
    [
      "profit",
      "total_profit",
    ]
  );

  const orders = numberValue(
    item,
    [
      "orders",
      "total_orders",
      "order_count",
    ]
  );

  const quantity = numberValue(
    item,
    [
      "quantity",
      "total_quantity",
    ]
  );

  let margin = numberValue(
    item,
    [
      "margin",
      "profit_margin",
      "profit_margin_percent",
    ]
  );

  if (
    margin === 0 &&
    revenue > 0
  ) {
    margin =
      (profit / revenue) * 100;
  }

  return {
    product: textValue(
      item,
      [
        "product",
        "name",
        "product_name",
      ]
    ),
    revenue,
    profit,
    orders,
    quantity,
    margin,
  };
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar() {
  function goToSection(id) {
    const element =
      document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-logo">
          DA
        </div>

        <div>
          <div className="brand-name">
            Sales Analytics Platform
          </div>

          <div className="brand-subtitle">
            Intelligence Platform
          </div>
        </div>

      </div>

      <div className="side-section-title">
        WORKSPACE
      </div>

      <nav className="nav">

        <button
          type="button"
          className="nav-item active"
          onClick={() =>
            goToSection("dashboard")
          }
        >
          <span className="nav-icon">
            ▣
          </span>

          <span>
            Dashboard
          </span>
        </button>

        <button
          type="button"
          className="nav-item"
          onClick={() =>
            goToSection("sales")
          }
        >
          <span className="nav-icon">
            ↗
          </span>

          <span>
            Sales Analytics
          </span>
        </button>

        <button
          type="button"
          className="nav-item"
          onClick={() =>
            goToSection("products")
          }
        >
          <span className="nav-icon">
            ◇
          </span>

          <span>
            Products
          </span>
        </button>

        <button
          type="button"
          className="nav-item"
          onClick={() =>
            goToSection("regions")
          }
        >
          <span className="nav-icon">
            ◉
          </span>

          <span>
            Regions
          </span>
        </button>

        <button
          type="button"
          className="nav-item"
          onClick={() =>
            goToSection("insights")
          }
        >
          <span className="nav-icon">
            ✦
          </span>

          <span>
            Insights
          </span>
        </button>

      </nav>

      <div className="side-section-title system-title">
        SYSTEM
      </div>

      <button
        type="button"
        className="nav-item"
      >
        <span className="nav-icon">
          ⚙
        </span>

        <span>
          Settings
        </span>
      </button>

      <div className="sidebar-bottom">

        <div className="api-status">

          <span className="status-dot"></span>

          <div>
            <strong>
              API Connected
            </strong>

            <small>
              Django backend online
            </small>
          </div>

        </div>

        <div className="platform-version">
          SALES ANALYTICS PLATFORM
          <br />
          v1.0.0
        </div>

      </div>

    </aside>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  icon,
  label,
  value,
  description,
  type,
}) {
  return (
    <div className="metric-card">

      <div
        className={`metric-icon ${
          type || ""
        }`}
      >
        {icon}
      </div>

      <div className="metric-label">
        {label}
      </div>

      <div className="metric-value">
        {value}
      </div>

      <div className="metric-description">
        {description}
      </div>

    </div>
  );
}

/* =========================================================
   FILTER
========================================================= */

function Filter({
  label,
  value,
  options,
  defaultText,
  onChange,
}) {
  return (
    <div className="field">

      <label>
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      >

        <option value="All">
          {defaultText}
        </option>

        {options.map((item) => (
          <option
            value={item}
            key={item}
          >
            {item}
          </option>
        ))}

      </select>

    </div>
  );
}

/* =========================================================
   REVENUE CHART
========================================================= */

function RevenueChart({
  data,
}) {
  if (!data.length) {
    return (
      <div className="empty-chart">
        No revenue trend data available
      </div>
    );
  }

  return (
    <div className="chart-wrapper">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 5,
            bottom: 10,
          }}
        >

          <defs>

            <linearGradient
              id="revenueGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >

              <stop
                offset="0%"
                stopColor="#2864e8"
                stopOpacity={0.25}
              />

              <stop
                offset="100%"
                stopColor="#2864e8"
                stopOpacity={0.02}
              />

            </linearGradient>

          </defs>

          <CartesianGrid
            stroke="#e9edf3"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="month"
            tick={{
              fontSize: 10,
              fill: "#7b879c",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fontSize: 10,
              fill: "#7b879c",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              value >= 100000
                ? `₹${Math.round(
                    value / 1000
                  )}K`
                : `₹${value}`
            }
          />

          <Tooltip
            formatter={(value) => [
              money(value),
              "Revenue",
            ]}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2864e8"
            strokeWidth={3}
            fill="url(#revenueGradient)"
            dot={{
              r: 4,
              strokeWidth: 2,
              fill: "#ffffff",
            }}
            activeDot={{
              r: 6,
            }}
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>
  );
}

/* =========================================================
   REGION CHART
========================================================= */

function RegionChart({
  data,
}) {
  if (!data.length) {
    return (
      <div className="empty-chart small">
        No regional data available
      </div>
    );
  }

  const prepared = data.map(
    (item) => ({
      region: item.region,
      revenue: item.revenue,
    })
  );

  return (
    <div className="chart-wrapper">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <BarChart
          data={prepared}
          layout="vertical"
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10,
          }}
        >

          <CartesianGrid
            stroke="#e9edf3"
            strokeDasharray="3 3"
            horizontal={false}
          />

          <XAxis
            type="number"
            tick={{
              fontSize: 9,
              fill: "#7b879c",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              value >= 100000
                ? `₹${Math.round(
                    value / 100000
                  )}L`
                : `₹${value}`
            }
          />

          <YAxis
            type="category"
            dataKey="region"
            width={65}
            tick={{
              fontSize: 10,
              fill: "#475467",
              fontWeight: 600,
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            formatter={(value) => [
              money(value),
              "Revenue",
            ]}
          />

          <Bar
            dataKey="revenue"
            fill="#2864e8"
            radius={[
              0,
              5,
              5,
              0,
            ]}
            barSize={24}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}

/* =========================================================
   REGIONAL TABLE
========================================================= */

function RegionalTable({
  data,
}) {
  if (!data.length) {
    return (
      <div className="table-empty">
        No regional data available
      </div>
    );
  }

  return (
    <div className="table-wrapper">

      <table>

        <thead>

          <tr>

            <th>REGION</th>
            <th>REVENUE</th>
            <th>PROFIT</th>
            <th>ORDERS</th>
            <th>QUANTITY</th>
            <th>MARGIN</th>

          </tr>

        </thead>

        <tbody>

          {data.map((item) => (

            <tr
              key={item.region}
            >

              <td>

                <div className="name-cell">

                  <span className="avatar-small">
                    {String(
                      item.region
                    ).charAt(0)}
                  </span>

                  <strong>
                    {item.region}
                  </strong>

                </div>

              </td>

              <td>
                {money(
                  item.revenue
                )}
              </td>

              <td className="profit-text">
                {money(
                  item.profit
                )}
              </td>

              <td>
                {number(
                  item.orders
                )}
              </td>

              <td>
                {number(
                  item.quantity
                )}
              </td>

              <td>

                <span className="margin-badge">
                  {percent(
                    item.margin
                  )}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

/* =========================================================
   CATEGORY TABLE
========================================================= */

function CategoryTable({
  data,
}) {
  if (!data.length) {
    return (
      <div className="table-empty">
        No category data available
      </div>
    );
  }

  return (
    <div className="table-wrapper">

      <table>

        <thead>

          <tr>

            <th>CATEGORY</th>
            <th>REVENUE</th>
            <th>PROFIT</th>
            <th>ORDERS</th>
            <th>QUANTITY</th>
            <th>MARGIN</th>

          </tr>

        </thead>

        <tbody>

          {data.map((item) => (

            <tr
              key={item.category}
            >

              <td>

                <div className="name-cell">

                  <span className="avatar-small">
                    {String(
                      item.category
                    ).charAt(0)}
                  </span>

                  <strong>
                    {item.category}
                  </strong>

                </div>

              </td>

              <td>
                {money(
                  item.revenue
                )}
              </td>

              <td className="profit-text">
                {money(
                  item.profit
                )}
              </td>

              <td>
                {number(
                  item.orders
                )}
              </td>

              <td>
                {number(
                  item.quantity
                )}
              </td>

              <td>

                <span className="margin-badge">
                  {percent(
                    item.margin
                  )}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

/* =========================================================
   TOP PRODUCTS
========================================================= */

function TopProducts({
  data,
}) {
  if (!data.length) {
    return (
      <div className="table-empty">
        No product data available
      </div>
    );
  }

  const maxRevenue =
    Math.max(
      ...data.map(
        (item) => item.revenue
      ),
      1
    );

  return (
    <div className="products-list">

      {data
        .slice(0, 5)
        .map(
          (item, index) => (

            <div
              className="product-row"
              key={item.product}
            >

              <div className="product-top">

                <div className="product-name">

                  <span className="product-rank">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <strong>
                    {item.product}
                  </strong>

                </div>

                <span className="product-value">
                  {money(
                    item.revenue
                  )}
                </span>

              </div>

              <div className="product-bar">

                <div
                  className="product-bar-fill"
                  style={{
                    width: `${
                      (
                        item.revenue /
                        maxRevenue
                      ) * 100
                    }%`,
                  }}
                />

              </div>

            </div>

          )
        )}

    </div>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {

  const [data, setData] =
    useState(null);

  const [filters, setFilters] =
    useState({
      region: "All",
      category: "All",
      product: "All",
      start_date: "",
      end_date: "",
    });

  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState({
    region: "All",
    category: "All",
    product: "All",
    start_date: "",
    end_date: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD ANALYTICS
  ======================================================= */

  async function loadAnalytics(
    currentFilters = appliedFilters
  ) {

    try {

      setLoading(true);
      setError("");

      if (
        currentFilters.start_date &&
        currentFilters.end_date &&
        currentFilters.start_date >
          currentFilters.end_date
      ) {
        throw new Error(
          "From Date cannot be later than To Date."
        );
      }

      const params =
        new URLSearchParams();

      if (
        currentFilters.region &&
        currentFilters.region !==
          "All"
      ) {

        params.append(
          "region",
          currentFilters.region
        );

      }

      if (
        currentFilters.category &&
        currentFilters.category !==
          "All"
      ) {

        params.append(
          "category",
          currentFilters.category
        );

      }

      if (
        currentFilters.product &&
        currentFilters.product !==
          "All"
      ) {

        params.append(
          "product",
          currentFilters.product
        );

      }

      if (
        currentFilters.start_date
      ) {

        params.append(
          "start_date",
          currentFilters.start_date
        );

      }

      if (
        currentFilters.end_date
      ) {

        params.append(
          "end_date",
          currentFilters.end_date
        );

      }

      const query =
        params.toString();

      const url = query
        ? `${API_URL}?${query}`
        : API_URL;

      console.log(
        "Analytics request:",
        url
      );

      const response =
        await fetch(url);

      if (!response.ok) {

        throw new Error(
          `API Error: ${response.status}`
        );

      }

      const result =
        await response.json();

      console.log(
        "Analytics response:",
        result
      );

      if (
        result.status ===
        "error"
      ) {

        throw new Error(
          result.message ||
            "Analytics request failed."
        );

      }

      setData(result);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
          "Unable to connect to Django backend."
      );

    } finally {

      setLoading(false);

    }
  }

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadAnalytics();
  }, []);

  /* =======================================================
     FILTER CHANGE
  ======================================================= */

  function handleFilterChange(
    event
  ) {

    const {
      name,
      value,
    } = event.target;

    setFilters(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  }

  /* =======================================================
     APPLY FILTERS
  ======================================================= */

  function applyFilters(event) {

    event.preventDefault();

    if (
      filters.start_date &&
      filters.end_date &&
      filters.start_date >
        filters.end_date
    ) {

      setError(
        "From Date cannot be later than To Date."
      );

      return;
    }

    const nextFilters = {
      ...filters,
    };

    setAppliedFilters(
      nextFilters
    );

    loadAnalytics(
      nextFilters
    );
  }

  /* =======================================================
     RESET
  ======================================================= */

  function resetFilters() {

    const reset = {
      region: "All",
      category: "All",
      product: "All",
      start_date: "",
      end_date: "",
    };

    setFilters(reset);
    setAppliedFilters(reset);
    setError("");

    loadAnalytics(reset);
  }

  /* =======================================================
     NORMALIZED DATA
  ======================================================= */

  const regions =
    useMemo(
      () =>
        (
          data?.region_performance ||
          []
        ).map(normalizeRegion),
      [data]
    );

  const categories =
    useMemo(
      () =>
        (
          data?.category_performance ||
          []
        ).map(normalizeCategory),
      [data]
    );

  const products =
    useMemo(
      () =>
        (
          data?.product_performance ||
          []
        ).map(normalizeProduct),
      [data]
    );

  const monthlySales =
    useMemo(
      () =>
        (
          data?.monthly_sales ||
          []
        ).map((item) => ({
          month: textValue(
            item,
            [
              "month",
              "period",
              "date",
              "name",
            ],
            "—"
          ),

          revenue: numberValue(
            item,
            [
              "sales",
              "revenue",
              "total_revenue",
              "value",
            ]
          ),
        })),
      [data]
    );

  const topProducts =
    useMemo(
      () =>
        [...products]
          .sort(
            (a, b) =>
              b.revenue -
              a.revenue
          )
          .slice(0, 5),
      [products]
    );

  const kpis =
    data?.kpis || {};

  const activeFilterCount =
    (appliedFilters.region !==
    "All"
      ? 1
      : 0) +
    (appliedFilters.category !==
    "All"
      ? 1
      : 0) +
    (appliedFilters.product !==
    "All"
      ? 1
      : 0) +
    (appliedFilters.start_date
      ? 1
      : 0) +
    (appliedFilters.end_date
      ? 1
      : 0);

  /* =======================================================
     AVAILABLE FILTER OPTIONS
  ======================================================= */

  const availableRegions =
    data?.available_filters
      ?.regions ||
    regions.map(
      (item) => item.region
    );

  const availableCategories =
    data?.available_filters
      ?.categories ||
    categories.map(
      (item) => item.category
    );

  const availableProducts =
    data?.available_filters
      ?.products ||
    products.map(
      (item) => item.product
    );

  /* =======================================================
     BEST MONTH
  ======================================================= */

  const bestMonth =
    useMemo(() => {

      if (!monthlySales.length) {
        return null;
      }

      return [...monthlySales]
        .sort(
          (a, b) =>
            b.revenue -
            a.revenue
        )[0];

    }, [monthlySales]);

  /* =======================================================
     EXPORT REPORT
  ======================================================= */

  function exportReport() {

    if (!data) {
      return;
    }

    const rows = [

      [
        "SALES ANALYTICS PLATFORM",
      ],

      [
        "Sales Performance Report",
      ],

      [],

      ["FILTERS"],

      [
        "Region",
        appliedFilters.region,
      ],

      [
        "Category",
        appliedFilters.category,
      ],

      [
        "Product",
        appliedFilters.product,
      ],

      [
        "From Date",
        appliedFilters.start_date ||
          "All",
      ],

      [
        "To Date",
        appliedFilters.end_date ||
          "All",
      ],

      [],

      [
        "KEY PERFORMANCE INDICATORS",
      ],

      [
        "Total Revenue",
        kpis.total_revenue,
      ],

      [
        "Total Profit",
        kpis.total_profit,
      ],

      [
        "Total Orders",
        kpis.total_orders,
      ],

      [
        "Total Quantity",
        kpis.total_quantity,
      ],

      [
        "Average Order Value",
        kpis.average_order_value,
      ],

      [
        "Profit Margin",
        kpis.profit_margin,
      ],

      [],

      [
        "REGIONAL PERFORMANCE",
      ],

      [
        "Region",
        "Revenue",
        "Profit",
        "Orders",
        "Quantity",
        "Margin",
      ],
    ];

    regions.forEach(
      (item) => {

        rows.push([
          item.region,
          item.revenue,
          item.profit,
          item.orders,
          item.quantity,
          item.margin,
        ]);

      }
    );

    rows.push([]);

    rows.push([
      "CATEGORY PERFORMANCE",
    ]);

    rows.push([
      "Category",
      "Revenue",
      "Profit",
      "Orders",
      "Quantity",
      "Margin",
    ]);

    categories.forEach(
      (item) => {

        rows.push([
          item.category,
          item.revenue,
          item.profit,
          item.orders,
          item.quantity,
          item.margin,
        ]);

      }
    );

    rows.push([]);

    rows.push([
      "PRODUCT PERFORMANCE",
    ]);

    rows.push([
      "Product",
      "Revenue",
      "Profit",
      "Orders",
      "Quantity",
      "Margin",
    ]);

    products.forEach(
      (item) => {

        rows.push([
          item.product,
          item.revenue,
          item.profit,
          item.orders,
          item.quantity,
          item.margin,
        ]);

      }
    );

    const csv =
      rows
        .map(
          (row) =>
            row
              .map(
                (cell) =>
                  `"${String(
                    cell ?? ""
                  ).replace(
                    /"/g,
                    '""'
                  )}"`
              )
              .join(",")
        )
        .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `sales_report_${
        new Date()
          .toISOString()
          .split("T")[0]
      }.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="app">

      <Sidebar />

      <main className="main">

        <div className="page">

          {/* =================================================
              TOP BAR
          ================================================= */}

          <header className="topbar">

            <div className="breadcrumbs">

              Workspace

              <span>/</span>

              Analytics

              <span>/</span>

              Dashboard

            </div>

            <div className="top-actions">

              <div className="live-pill">

                <span></span>

                Live

              </div>

              <div className="user-avatar">
                DA
              </div>

            </div>

          </header>

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section
            className="page-heading"
            id="dashboard"
          >

            <div>

              <div className="eyebrow">
                BUSINESS INTELLIGENCE
              </div>

              <h1>
                Sales Performance
              </h1>

              <p>
                A real-time overview
                of revenue,
                profitability and
                business performance.
              </p>

            </div>

            <div className="report-period">

              <small>
                REPORT PERIOD
              </small>

              <strong>

                {appliedFilters.start_date ||
                  "All"}

                {" → "}

                {appliedFilters.end_date ||
                  "All"}

              </strong>

            </div>

          </section>

          {/* =================================================
              FILTERS
          ================================================= */}

          <section className="card filter-card">

            <div className="filter-heading">

              <div>

                <h2>
                  Analysis Filters
                </h2>

                <p>
                  Refine the dashboard
                  using business
                  dimensions.
                </p>

              </div>

              <span>
                {activeFilterCount} active
              </span>

            </div>

            <div className="filter-grid">

              <div className="field">

                <label>
                  REGION
                </label>

                <select
                  name="region"
                  value={
                    filters.region
                  }
                  onChange={
                    handleFilterChange
                  }
                >

                  <option value="All">
                    All Regions
                  </option>

                  {availableRegions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="field">

                <label>
                  CATEGORY
                </label>

                <select
                  name="category"
                  value={
                    filters.category
                  }
                  onChange={
                    handleFilterChange
                  }
                >

                  <option value="All">
                    All Categories
                  </option>

                  {availableCategories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="field">

                <label>
                  PRODUCT
                </label>

                <select
                  name="product"
                  value={
                    filters.product
                  }
                  onChange={
                    handleFilterChange
                  }
                >

                  <option value="All">
                    All Products
                  </option>

                  {availableProducts.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="field">

                <label>
                  FROM DATE
                </label>

                <input
                  type="date"
                  name="start_date"
                  value={
                    filters.start_date
                  }
                  onChange={
                    handleFilterChange
                  }
                />

              </div>

              <div className="field">

                <label>
                  TO DATE
                </label>

                <input
                  type="date"
                  name="end_date"
                  value={
                    filters.end_date
                  }
                  onChange={
                    handleFilterChange
                  }
                />

              </div>

              <div className="filter-buttons">

                <button
                  className="reset-button"
                  onClick={
                    resetFilters
                  }
                >
                  Reset
                </button>

                <button
                  className="apply-button"
                  onClick={
                    applyFilters
                  }
                >
                  Apply Filters
                </button>

              </div>

            </div>

            <div className="active-filter-line">

              <strong>
                ACTIVE:
              </strong>

              {" "}

              Region:{" "}
              {appliedFilters.region}

              {" • "}

              Category:{" "}
              {appliedFilters.category}

              {" • "}

              Product:{" "}
              {appliedFilters.product}

            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="error-box">

              <strong>
                API Error:
              </strong>

              {" "}

              {error}

            </div>

          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="loading-box">
              Loading analytics...
            </div>

          )}

          {/* =================================================
              DASHBOARD CONTENT
          ================================================= */}

          {!loading && data && (

            <>

              {/* =================================================
                  EXECUTIVE OVERVIEW
              ================================================= */}

              <section>

                <div className="section-heading centered">

                  <h2>
                    Executive Overview
                  </h2>

                  <p>
                    Key performance
                    indicators
                  </p>

                </div>

                <div className="metrics-grid">

                  <MetricCard
                    icon="₹"
                    label="TOTAL REVENUE"
                    value={money(
                      kpis.total_revenue
                    )}
                    description="Gross sales generated"
                    type="blue"
                  />

                  <MetricCard
                    icon="↗"
                    label="TOTAL PROFIT"
                    value={money(
                      kpis.total_profit
                    )}
                    description="Net business profit"
                    type="green"
                  />

                  <MetricCard
                    icon="#"
                    label="TOTAL ORDERS"
                    value={number(
                      kpis.total_orders
                    )}
                    description="Completed transactions"
                    type="purple"
                  />

                  <MetricCard
                    icon="▦"
                    label="UNITS SOLD"
                    value={number(
                      kpis.total_quantity
                    )}
                    description="Products sold"
                    type="orange"
                  />

                  <MetricCard
                    icon="↔"
                    label="AVERAGE ORDER"
                    value={money(
                      kpis.average_order_value
                    )}
                    description="Revenue per order"
                    type="pink"
                  />

                  <MetricCard
                    icon="%"
                    label="PROFIT MARGIN"
                    value={percent(
                      kpis.profit_margin
                    )}
                    description="Overall profitability"
                    type="teal"
                  />

                </div>

              </section>

              {/* =================================================
                  SALES ANALYTICS
              ================================================= */}

              <section
                className="chart-grid"
                id="sales"
              >

                <div className="card chart-card large-chart">

                  <div className="card-heading">

                    <div>

                      <h2>
                        Revenue Trend
                      </h2>

                      <p>
                        Monthly revenue
                        performance
                      </p>

                    </div>

                    <div className="chart-total">

                      {money(
                        kpis.total_revenue
                      )}

                      <small>
                        total revenue
                      </small>

                    </div>

                  </div>

                  <RevenueChart
                    data={monthlySales}
                  />

                </div>

                <div className="card chart-card">

                  <div className="card-heading">

                    <div>

                      <h2>
                        Revenue by Region
                      </h2>

                      <p>
                        Regional sales
                        contribution
                      </p>

                    </div>

                    <span className="chart-tag">
                      REGION
                    </span>

                  </div>

                  <RegionChart
                    data={regions}
                  />

                </div>

              </section>

              {/* =================================================
                  REGIONS + PRODUCTS
              ================================================= */}

              <section className="content-grid">

                <div
                  className="card"
                  id="regions"
                >

                  <div className="card-heading">

                    <div>

                      <h2>
                        Regional Performance
                      </h2>

                      <p>
                        Revenue, profit and
                        operational metrics
                      </p>

                    </div>

                    <span className="count-badge">
                      {regions.length}
                      {" "}
                      regions
                    </span>

                  </div>

                  <RegionalTable
                    data={regions}
                  />

                </div>

                <div
                  className="card"
                  id="products"
                >

                  <div className="card-heading">

                    <div>

                      <h2>
                        Top Products
                      </h2>

                      <p>
                        Highest revenue
                        contributors
                      </p>

                    </div>

                    <span className="count-badge">
                      {products.length}
                      {" "}
                      products
                    </span>

                  </div>

                  <TopProducts
                    data={topProducts}
                  />

                </div>

              </section>

              {/* =================================================
                  CATEGORY
              ================================================= */}

              <section className="card">

                <div className="card-heading">

                  <div>

                    <h2>
                      Category Performance
                    </h2>

                    <p>
                      Business performance
                      across categories
                    </p>

                  </div>

                  <span className="count-badge">
                    {categories.length}
                    {" "}
                    categories
                  </span>

                </div>

                <CategoryTable
                  data={categories}
                />

              </section>

              {/* =================================================
                  INSIGHTS
              ================================================= */}

              <section
                className="bottom-grid"
                id="insights"
              >

                <div className="card insights-card">

                  <div className="card-heading">

                    <div>

                      <h2>
                        Business Insights
                      </h2>

                      <p>
                        Key observations
                        from current
                        analysis
                      </p>

                    </div>

                    <button
                      className="plus-button"
                      type="button"
                    >
                      +
                    </button>

                  </div>

                  <div className="insights-list">

                    {Array.isArray(
                      data.business_insights
                    ) &&
                    data.business_insights
                      .length > 0 ? (

                      data.business_insights.map(
                        (
                          insight,
                          index
                        ) => (

                          <div
                            className="insight"
                            key={index}
                          >

                            <span className="check">
                              ✓
                            </span>

                            <span>
                              {insight}
                            </span>

                          </div>

                        )
                      )

                    ) : regions.length >
                      0 ? (

                      <div className="insight">

                        <span className="check">
                          ✓
                        </span>

                        <span>

                          {
                            [...regions]
                              .sort(
                                (
                                  a,
                                  b
                                ) =>
                                  b.revenue -
                                  a.revenue
                              )[0]
                              .region
                          }

                          {" "}
                          is the
                          highest-performing
                          region.

                        </span>

                      </div>

                    ) : (

                      <div className="empty-insight">
                        No insights available.
                      </div>

                    )}

                  </div>

                </div>

                <div className="card best-month-card">

                  <div className="card-heading">

                    <div>

                      <h2>
                        Best Performing
                        Month
                      </h2>

                      <p>
                        Highest revenue
                        month
                      </p>

                    </div>

                  </div>

                  {bestMonth ? (

                    <div className="best-month-content">

                      <div className="star">
                        ★
                      </div>

                      <div className="best-label">
                        BEST MONTH
                      </div>

                      <div className="best-month-name">
                        {bestMonth.month}
                      </div>

                      <div className="best-revenue">
                        {money(
                          bestMonth.revenue
                        )}
                      </div>

                      <div className="best-caption">
                        Revenue generated
                      </div>

                    </div>

                  ) : (

                    <div className="table-empty">
                      No monthly data
                      available
                    </div>

                  )}

                </div>

              </section>

            </>

          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="footer">

            <span>
              Sales Analytics Platform
            </span>

            <span>
              React&nbsp; • &nbsp;
              Django&nbsp; • &nbsp;
              Pandas
            </span>

            <span>
              v1.0.0
            </span>

          </footer>

        </div>

      </main>

    </div>
  );
}