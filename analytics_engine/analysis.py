import pandas as pd

# =========================================================
# DATA VALIDATION
# =========================================================


def validate_dataset(df):
    required_columns = [
        "Order_ID",
        "Date",
        "Customer",
        "Product",
        "Category",
        "Region",
        "Quantity",
        "Sales",
        "Profit",
    ]

    missing_columns = [
        column for column in required_columns if column not in df.columns
    ]

    if missing_columns:
        return False, missing_columns

    return True, []


# =========================================================
# DATA CLEANING
# =========================================================


def clean_dataset(df):
    original_rows = len(df)

    df = df.copy()

    # Remove completely empty rows
    df = df.dropna(how="all")

    # Remove duplicate rows
    df = df.drop_duplicates()

    # Required columns for analysis
    critical_columns = ["Order_ID", "Date", "Product", "Quantity", "Sales", "Profit"]

    # Remove rows with missing critical values
    df = df.dropna(subset=critical_columns)

    cleaned_rows = len(df)

    rows_removed = original_rows - cleaned_rows

    cleaning_summary = {
        "original_rows": original_rows,
        "cleaned_rows": cleaned_rows,
        "rows_removed": rows_removed,
    }

    return df, cleaning_summary


# =========================================================
# DATA PREPARATION
# =========================================================


def prepare_dataset(df):

    # Validate dataset structure
    is_valid, missing_columns = validate_dataset(df)

    if not is_valid:
        raise ValueError(f"Missing required columns: {missing_columns}")

    df = df.copy()

    # Convert Date column
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

    # Remove invalid dates
    df = df.dropna(subset=["Date"])

    # Clean dataset
    df, cleaning_summary = clean_dataset(df)

    return df, cleaning_summary


# =========================================================
# KPI ANALYSIS
# =========================================================


def calculate_kpis(df):

    total_revenue = df["Sales"].sum()

    total_profit = df["Profit"].sum()

    total_orders = df["Order_ID"].nunique()

    total_quantity = df["Quantity"].sum()

    average_order_value = total_revenue / total_orders if total_orders > 0 else 0

    profit_margin = (total_profit / total_revenue) * 100 if total_revenue > 0 else 0

    return {
        "total_revenue": total_revenue,
        "total_profit": total_profit,
        "total_orders": total_orders,
        "total_quantity": total_quantity,
        "average_order_value": average_order_value,
        "profit_margin": profit_margin,
    }


# =========================================================
# REGION ANALYSIS
# =========================================================


def analyze_regions(df):

    region_performance = df.groupby("Region")[["Sales", "Profit"]].sum()

    region_performance = region_performance.sort_values(by="Sales", ascending=False)

    return region_performance


# =========================================================
# PRODUCT ANALYSIS
# =========================================================


def analyze_products(df):

    product_performance = df.groupby("Product")[["Sales", "Profit"]].sum()

    product_performance["Profit_Margin"] = (
        product_performance["Profit"] / product_performance["Sales"]
    ) * 100

    product_performance = product_performance.sort_values(by="Sales", ascending=False)

    return product_performance


# =========================================================
# CATEGORY ANALYSIS
# =========================================================


def analyze_categories(df):

    category_performance = df.groupby("Category")[["Sales", "Profit"]].sum()

    category_performance["Profit_Margin"] = (
        category_performance["Profit"] / category_performance["Sales"]
    ) * 100

    category_performance = category_performance.sort_values(by="Sales", ascending=False)

    return category_performance


# =========================================================
# MONTHLY SALES
# =========================================================


def analyze_monthly_sales(df):

    monthly_sales = df.groupby(df["Date"].dt.to_period("M"))["Sales"].sum()

    return monthly_sales


# =========================================================
# BEST SALES MONTH
# =========================================================


def best_sales_month(df):

    monthly_sales = analyze_monthly_sales(df)

    if monthly_sales.empty:
        return None, 0

    best_month = monthly_sales.idxmax()

    highest_sales = monthly_sales.max()

    return best_month, highest_sales


# =========================================================
# TOP PRODUCTS
# =========================================================


def top_products(df, n=5):

    product_sales = df.groupby("Product")["Sales"].sum()

    return product_sales.sort_values(ascending=False).head(n)


# =========================================================
# TOP PROFIT PRODUCTS
# =========================================================


def top_profit_products(df, n=5):

    product_profit = df.groupby("Product")["Profit"].sum()

    return product_profit.sort_values(ascending=False).head(n)


# =========================================================
# AUTOMATIC BUSINESS INSIGHTS
# =========================================================


def generate_insights(df):

    insights = []

    # Best region
    region_sales = df.groupby("Region")["Sales"].sum()

    if not region_sales.empty:
        best_region = region_sales.idxmax()
        best_region_sales = region_sales.max()

        insights.append(
            f"{best_region} is the highest-performing region "
            f"with sales of ₹{best_region_sales:,.0f}."
        )

    # Best product
    product_sales = df.groupby("Product")["Sales"].sum()

    if not product_sales.empty:
        best_product = product_sales.idxmax()
        best_product_sales = product_sales.max()

        insights.append(
            f"{best_product} is the top-selling product "
            f"with sales of ₹{best_product_sales:,.0f}."
        )

    # Best category
    category_sales = df.groupby("Category")["Sales"].sum()

    if not category_sales.empty:
        best_category = category_sales.idxmax()
        best_category_sales = category_sales.max()

        insights.append(
            f"{best_category} is the highest-revenue category "
            f"with sales of ₹{best_category_sales:,.0f}."
        )

    # Profit margin
    total_sales = df["Sales"].sum()
    total_profit = df["Profit"].sum()

    if total_sales > 0:
        profit_margin = (total_profit / total_sales) * 100

        insights.append(f"The overall profit margin is " f"{profit_margin:.2f}%.")

    return insights


# =========================================================
# COMPLETE ANALYSIS REPORT
# =========================================================


def generate_report(df):

    report = {
        "kpis": calculate_kpis(df),
        "regions": analyze_regions(df),
        "products": analyze_products(df),
        "categories": analyze_categories(df),
        "monthly_sales": analyze_monthly_sales(df),
        "best_month": best_sales_month(df),
        "top_products": top_products(df),
        "top_profit_products": top_profit_products(df),
        "insights": generate_insights(df),
    }

    return report
