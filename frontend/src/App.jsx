import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/* =========================================================
   PRODUCTION API
========================================================= */

const API_URL =
  "https://data-analytics-platform-backend.onrender.com/api/analytics/";
/* =========================================================
   FORMATTERS
========================================================= */

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const number = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

const percent = (value) =>
  `${Number(value || 0).toFixed(2)}%`;

/* =========================================================
   SAFE VALUE HELPER
========================================================= */

function getValue(obj, keys, fallback = 0) {
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

/* =========================================================
   DATA NORMALIZATION
========================================================= */

function normalizeData(raw) {
  const data = raw || {};

  const summary =
    data.summary ||
    data.overview ||
    data.metrics ||
    data;

  const totalRevenue = getValue(summary, [
    "total_revenue",
    "totalRevenue",
    "revenue",
    "sales",
  ]);

  const totalProfit = getValue(summary, [
    "total_profit",
    "totalProfit",
    "profit",
  ]);

  const totalOrders = getValue(summary, [
    "total_orders",
    "totalOrders",
    "orders",
  ]);

  const totalQuantity = getValue(summary, [
    "total_quantity",
    "totalQuantity",
    "quantity",
    "units_sold",
    "unitsSold",
  ]);

  const averageOrderValue = getValue(summary, [
    "average_order_value",
    "averageOrderValue",
    "avg_order_value",
    "average_order",
  ]);

  const profitMargin = getValue(summary, [
    "profit_margin",
    "profitMargin",
    "margin",
  ]);

  const monthly =
    data.monthly_sales ||
    data.monthlySales ||
    data.monthly ||
    data.sales_by_month ||
    [];

  const regions =
    data.regions ||
    data.region_performance ||
    data.regionPerformance ||
    data.sales_by_region ||
    [];

  const categories =
    data.categories ||
    data.category_performance ||
    data.categoryPerformance ||
    data.sales_by_category ||
    [];

  const products =
    data.products ||
    data.product_performance ||
    data.productPerformance ||
    data.top_products ||
    data.topProducts ||
    [];

  return {
    totalRevenue,
    totalProfit,
    totalOrders,
    totalQuantity,
    averageOrderValue,
    profitMargin,

    monthly: Array.isArray(monthly)
      ? monthly
      : [],

    regions: Array.isArray(regions)
      ? regions
      : [],

    categories: Array.isArray(categories)
      ? categories
      : [],

    products: Array.isArray(products)
      ? products
      : [],
  };
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar() {
  function goToSection(sectionId) {
    const element =
      document.getElementById(sectionId);

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
            Data Analytics
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
        onClick={() =>
          goToSection("dashboard")
        }
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
          DATA ANALYTICS PLATFORM
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
   REVENUE CHART
========================================================= */

function RevenueChart({ data }) {
  if (!data.length) {
    return (
      <div className="empty-chart">
        No revenue trend data available
      </div>
    );
  }

  const values = data.map((item) =>
    Number(
      getValue(item, [
        "revenue",
        "sales",
        "total_revenue",
        "totalRevenue",
        "value",
      ])
    )
  );

  const max = Math.max(...values, 1);

  const width = 800;
  const height = 300;
  const paddingX = 45;
  const paddingY = 30;

  const chartWidth =
    width - paddingX * 2;

  const chartHeight =
    height - paddingY * 2;

  const points = values.map(
    (value, index) => {
      const x =
        data.length === 1
          ? width / 2
          : paddingX +
            (index /
              (data.length - 1)) *
              chartWidth;

      const y =
        paddingY +
        chartHeight -
        (value / max) *
          chartHeight;

      return {
        x,
        y,
        value,
        ...data[index],
      };
    }
  );

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${
          point.x
        } ${point.y}`
    )
    .join(" ");

  const areaPath = `
    ${linePath}
    L ${points[points.length - 1].x} ${
    height - paddingY
  }
    L ${points[0].x} ${
    height - paddingY
  }
    Z
  `;

  return (
    <div className="chart-wrapper">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="revenue-svg"
        preserveAspectRatio="none"
      >

        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="#e5e7eb"
        />

        <line
          x1={paddingX}
          y1={paddingY}
          x2={paddingX}
          y2={height - paddingY}
          stroke="#e5e7eb"
        />

        <path
          d={areaPath}
          fill="rgba(40,100,232,0.08)"
          stroke="none"
        />

        <path
          d={linePath}
          fill="none"
          stroke="#2864e8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map(
          (point, index) => (
            <g key={index}>

              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#2864e8"
                stroke="white"
                strokeWidth="3"
              />

              <text
                x={point.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="12"
                fill="#667085"
              >
                {String(
                  getValue(point, [
                    "month",
                    "period",
                    "date",
                  ])
                )}
              </text>

            </g>
          )
        )}

      </svg>

    </div>
  );
}

/* =========================================================
   REGION CHART
========================================================= */

function RegionChart({ data }) {
  if (!data.length) {
    return (
      <div className="empty-chart">
        No regional data available
      </div>
    );
  }

  const values = data.map((item) =>
    Number(
      getValue(item, [
        "revenue",
        "sales",
        "total_revenue",
      ])
    )
  );

  const max = Math.max(...values, 1);

  return (
    <div className="region-bars">

      {data.map(
        (item, index) => {

          const name = String(
            getValue(item, [
              "region",
              "name",
              "region_name",
            ], "Region")
          );

          const revenue = Number(
            getValue(item, [
              "revenue",
              "sales",
              "total_revenue",
            ])
          );

          return (
            <div
              className="region-bar-row"
              key={index}
            >

              <div className="bar-label">
                {name}
              </div>

              <div className="bar-track">

                <div
                  className="bar-fill"
                  style={{
                    width: `${
                      Math.max(
                        3,
                        (revenue / max) *
                          100
                      )
                    }%`,
                  }}
                />

              </div>

              <div className="bar-value">
                {money(revenue)}
              </div>

            </div>
          );
        }
      )}

    </div>
  );
}

/* =========================================================
   REGIONAL TABLE
========================================================= */

function RegionalTable({ data }) {
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

          {data.map(
            (item, index) => {

              const region =
                String(
                  getValue(
                    item,
                    [
                      "region",
                      "name",
                      "region_name",
                    ],
                    `Region ${index + 1}`
                  )
                );

              return (
                <tr
                  key={region}
                >

                  <td>

                    <div className="name-cell">

                      <span className="avatar-small">
                        {region
                          .charAt(0)
                          .toUpperCase()}
                      </span>

                      <strong>
                        {region}
                      </strong>

                    </div>

                  </td>

                  <td>
                    {money(
                      getValue(item, [
                        "revenue",
                        "sales",
                        "total_revenue",
                      ])
                    )}
                  </td>

                  <td className="profit-text">
                    {money(
                      getValue(item, [
                        "profit",
                        "total_profit",
                      ])
                    )}
                  </td>

                  <td>
                    {number(
                      getValue(item, [
                        "orders",
                        "total_orders",
                      ])
                    )}
                  </td>

                  <td>
                    {number(
                      getValue(item, [
                        "quantity",
                        "total_quantity",
                      ])
                    )}
                  </td>

                  <td>

                    <span className="margin-badge">
                      {percent(
                        getValue(item, [
                          "margin",
                          "profit_margin",
                        ])
                      )}
                    </span>

                  </td>

                </tr>
              );
            }
          )}

        </tbody>

      </table>

    </div>
  );
}

/* =========================================================
   CATEGORY TABLE
========================================================= */

function CategoryTable({ data }) {
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

          {data.map(
            (item, index) => {

              const category =
                String(
                  getValue(
                    item,
                    [
                      "category",
                      "name",
                      "category_name",
                    ],
                    `Category ${index + 1}`
                  )
                );

              return (
                <tr
                  key={category}
                >

                  <td>

                    <div className="name-cell">

                      <span className="avatar-small">
                        {category
                          .charAt(0)
                          .toUpperCase()}
                      </span>

                      <strong>
                        {category}
                      </strong>

                    </div>

                  </td>

                  <td>
                    {money(
                      getValue(item, [
                        "revenue",
                        "sales",
                        "total_revenue",
                      ])
                    )}
                  </td>

                  <td className="profit-text">
                    {money(
                      getValue(item, [
                        "profit",
                        "total_profit",
                      ])
                    )}
                  </td>

                  <td>
                    {number(
                      getValue(item, [
                        "orders",
                        "total_orders",
                      ])
                    )}
                  </td>

                  <td>
                    {number(
                      getValue(item, [
                        "quantity",
                        "total_quantity",
                      ])
                    )}
                  </td>

                  <td>

                    <span className="margin-badge">
                      {percent(
                        getValue(item, [
                          "margin",
                          "profit_margin",
                        ])
                      )}
                    </span>

                  </td>

                </tr>
              );
            }
          )}

        </tbody>

      </table>

    </div>
  );
}

/* =========================================================
   TOP PRODUCTS
========================================================= */

function TopProducts({ data }) {
  if (!data.length) {
    return (
      <div className="table-empty">
        No product data available
      </div>
    );
  }

  const prepared =
    data
      .map((item) => ({
        product: String(
          getValue(
            item,
            [
              "product",
              "name",
              "product_name",
            ],
            "Product"
          )
        ),

        revenue: Number(
          getValue(item, [
            "revenue",
            "sales",
            "total_revenue",
          ])
        ),
      }))
      .sort(
        (a, b) =>
          b.revenue - a.revenue
      )
      .slice(0, 5);

  const maxRevenue =
    Math.max(
      ...prepared.map(
        (item) => item.revenue
      ),
      1
    );

  return (
    <div className="products-list">

      {prepared.map(
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
                  ).padStart(2, "0")}
                </span>

                <strong>
                  {item.product}
                </strong>

              </div>

              <span className="product-value">
                {money(item.revenue)}
              </span>

            </div>

            <div className="product-bar">

              <div
                className="product-bar-fill"
                style={{
                  width: `${
                    (item.revenue /
                      maxRevenue) *
                    100
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

      /* DATE VALIDATION */

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

      /* BUILD QUERY */

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

      const url =
        query
          ? `${API_URL}?${query}`
          : API_URL;

      console.log(
        "Analytics request:",
        url
      );

      /* API REQUEST */

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
        result.status === "error"
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

  function handleFilterChange(event) {

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
     RESET FILTERS
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
     DATA
  ======================================================= */

  const kpis =
    data?.kpis || {};

  const regions =
    useMemo(
      () =>
        (
          data?.region_performance ||
          []
        ).map((item) => ({
          region: String(
            getValue(item, [
              "region",
              "name",
              "region_name",
            ])
          ),

          revenue: Number(
            getValue(item, [
              "revenue",
              "sales",
              "total_revenue",
            ])
          ),

          profit: Number(
            getValue(item, [
              "profit",
              "total_profit",
            ])
          ),

          orders: Number(
            getValue(item, [
              "orders",
              "total_orders",
            ])
          ),

          quantity: Number(
            getValue(item, [
              "quantity",
              "total_quantity",
            ])
          ),

          margin: Number(
            getValue(item, [
              "margin",
              "profit_margin",
            ])
          ),
        })),
      [data]
    );

  const categories =
    useMemo(
      () =>
        (
          data?.category_performance ||
          []
        ).map((item) => ({
          category: String(
            getValue(item, [
              "category",
              "name",
              "category_name",
            ])
          ),

          revenue: Number(
            getValue(item, [
              "revenue",
              "sales",
              "total_revenue",
            ])
          ),

          profit: Number(
            getValue(item, [
              "profit",
              "total_profit",
            ])
          ),

          orders: Number(
            getValue(item, [
              "orders",
              "total_orders",
            ])
          ),

          quantity: Number(
            getValue(item, [
              "quantity",
              "total_quantity",
            ])
          ),

          margin: Number(
            getValue(item, [
              "margin",
              "profit_margin",
            ])
          ),
        })),
      [data]
    );

  const products =
    useMemo(
      () =>
        (
          data?.product_performance ||
          []
        ).map((item) => ({
          product: String(
            getValue(item, [
              "product",
              "name",
              "product_name",
            ])
          ),

          revenue: Number(
            getValue(item, [
              "revenue",
              "sales",
              "total_revenue",
            ])
          ),

          profit: Number(
            getValue(item, [
              "profit",
              "total_profit",
            ])
          ),

          orders: Number(
            getValue(item, [
              "orders",
              "total_orders",
            ])
          ),

          quantity: Number(
            getValue(item, [
              "quantity",
              "total_quantity",
            ])
          ),

          margin: Number(
            getValue(item, [
              "margin",
              "profit_margin",
            ])
          ),
        })),
      [data]
    );

  const monthlySales =
    useMemo(
      () =>
        (
          data?.monthly_sales ||
          []
        ).map((item) => ({
          month: String(
            getValue(item, [
              "month",
              "period",
              "date",
            ])
          ),

          revenue: Number(
            getValue(item, [
              "sales",
              "revenue",
              "total_revenue",
            ])
          ),
        })),
      [data]
    );

  const bestMonth =
    useMemo(() => {

      if (!monthlySales.length) {
        return null;
      }

      return [...monthlySales].sort(
        (a, b) =>
          b.revenue - a.revenue
      )[0];

    }, [monthlySales]);

  /* =======================================================
     INSIGHTS
  ======================================================= */

  const businessInsights =
    data?.business_insights || [];

  /* =======================================================
     EXPORT REPORT
  ======================================================= */

  function exportReport() {

    if (!data) return;

    const rows = [

      ["DATA ANALYTICS PLATFORM"],

      ["Sales Performance Report"],

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

      ["KEY PERFORMANCE INDICATORS"],

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

      ["REGIONAL PERFORMANCE"],

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
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `sales_report_${
        new Date()
          .toISOString()
          .split("T")[0]
      }.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
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

              <span>
                /
              </span>

              Analytics

              <span>
                /
              </span>

              Dashboard

            </div>

            <div className="topbar-actions">

              <div className="live-badge">

                <span></span>

                API Connected

              </div>

              <div className="user-avatar">
                DA
              </div>

            </div>

          </header>

          {/* =================================================
              HERO
          ================================================= */}

          <section
            className="hero"
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

              <div className="report-label">
                REPORT PERIOD
              </div>

              <div className="report-date">

                {appliedFilters.start_date ||
                  "All"}

                <span>
                  →
                </span>

                {appliedFilters.end_date ||
                  "All"}

              </div>

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
                  Refine the dashboard using
                  business dimensions.
                </p>

              </div>

              <button
                className="small-outline-button"
                onClick={resetFilters}
              >
                All data
              </button>

            </div>

            <form
              onSubmit={applyFilters}
              className="filter-grid"
            >

              <div className="field">

                <label>
                  REGION
                </label>

                <select
                  name="region"
                  value={filters.region}
                  onChange={
                    handleFilterChange
                  }
                >

                  <option value="All">
                    All Regions
                  </option>

                  {regions.map(
                    (item) => (
                      <option
                        key={item.region}
                        value={item.region}
                      >
                        {item.region}
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
                  value={filters.category}
                  onChange={
                    handleFilterChange
                  }
                >

                  <option value="All">
                    All Categories
                  </option>

                  {categories.map(
                    (item) => (
                      <option
                        key={item.category}
                        value={item.category}
                      >
                        {item.category}
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
                  value={filters.product}
                  onChange={
                    handleFilterChange
                  }
                >

                  <option value="All">
                    All Products
                  </option>

                  {products.map(
                    (item) => (
                      <option
                        key={item.product}
                        value={item.product}
                      >
                        {item.product}
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
                  type="button"
                  className="reset-button"
                  onClick={resetFilters}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="apply-button"
                >
                  Apply Filters
                </button>

              </div>

            </form>

            <div className="active-filter-line">

              <strong>
                ACTIVE:
              </strong>

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
              </strong>{" "}

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
              DASHBOARD
          ================================================= */}

          {!loading && data && (

            <>

              {/* =================================================
                  KPI
              ================================================= */}

              <section
                className="kpi-section"
              >

                <div className="section-heading centered">

                  <h2>
                    Executive Overview
                  </h2>

                  <p>
                    Key performance indicators
                  </p>

                </div>

                <div className="kpi-grid">

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
                        Monthly revenue performance
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
                        Regional sales contribution
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
                  REGIONS
              ================================================= */}

              <section
                className="three-column-grid"
                id="regions"
              >

                <div className="card table-card">

                  <div className="card-heading">

                    <div>

                      <h2>
                        Regional Performance
                      </h2>

                      <p>
                        Revenue and profitability
                        by region
                      </p>

                    </div>

                    <span className="count-badge">
                      {regions.length} regions
                    </span>

                  </div>

                  <RegionalTable
                    data={regions}
                  />

                </div>

                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <div
                  className="card table-card"
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

                  </div>

                  <TopProducts
                    data={products}
                  />

                </div>

                {/* =================================================
                    CATEGORY
                ================================================= */}

                <div className="card table-card">

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
                      {categories.length} categories
                    </span>

                  </div>

                  <CategoryTable
                    data={categories}
                  />

                </div>

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
                        Key observations from
                        current analytics
                      </p>

                    </div>

                  </div>

                  <div className="insights-list">

                    {businessInsights.length >
                    0 ? (

                      businessInsights.map(
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
                        Best Performing Month
                      </h2>

                      <p>
                        Highest revenue month
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
                      No monthly data available
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
              Data Analytics Platform
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