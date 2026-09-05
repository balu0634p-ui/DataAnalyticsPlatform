import pandas as pd

from analysis import prepare_dataset, generate_report

# =========================================================
# LOAD DATA
# =========================================================

df = pd.read_csv("data/sales_data.csv")


# =========================================================
# PREPARE DATA
# =========================================================

df, cleaning_summary = prepare_dataset(df)


# =========================================================
# CLEANING SUMMARY
# =========================================================

print("===== CLEANING SUMMARY =====")

print("Original rows:", cleaning_summary["original_rows"])

print("Rows after cleaning:", cleaning_summary["cleaned_rows"])

print("Rows removed:", cleaning_summary["rows_removed"])


# =========================================================
# GENERATE REPORT
# =========================================================

report = generate_report(df)


# =========================================================
# KPIs
# =========================================================

print("\n===== SALES KPIs =====")

for key, value in report["kpis"].items():
    print(f"{key}: {value}")


# =========================================================
# REGION PERFORMANCE
# =========================================================

print("\n===== REGION PERFORMANCE =====")

print(report["regions"])


# =========================================================
# PRODUCT PERFORMANCE
# =========================================================

print("\n===== PRODUCT PERFORMANCE =====")

print(report["products"])


# =========================================================
# CATEGORY PERFORMANCE
# =========================================================

print("\n===== CATEGORY PERFORMANCE =====")

print(report["categories"])


# =========================================================
# MONTHLY SALES
# =========================================================

print("\n===== MONTHLY SALES =====")

print(report["monthly_sales"])


# =========================================================
# BEST SALES MONTH
# =========================================================

print("\n===== BEST SALES MONTH =====")

print("Best Month:", report["best_month"][0])

print("Sales:", report["best_month"][1])


# =========================================================
# TOP 5 PRODUCTS
# =========================================================

print("\n===== TOP 5 PRODUCTS =====")

print(report["top_products"])


# =========================================================
# TOP 5 PROFIT PRODUCTS
# =========================================================

print("\n===== TOP 5 PROFIT PRODUCTS =====")

print(report["top_profit_products"])


# =========================================================
# BUSINESS INSIGHTS
# =========================================================

print("\n===== BUSINESS INSIGHTS =====")

for insight in report["insights"]:
    print("•", insight)
