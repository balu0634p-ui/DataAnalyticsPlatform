import os

import pandas as pd
from django.http import JsonResponse

from .analytics_engine import prepare_dataset


def analytics_api(request):
    """
    Sales Analytics API

    Supported filters:
        ?region=South
        ?category=Technology
        ?product=Laptop
        ?start_date=2026-01-01
        ?end_date=2026-04-30
    """

    try:
        # =====================================================
        # FIND CSV
        # =====================================================

        backend_dir = os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )

        csv_path = os.path.abspath(
            os.path.join(
                backend_dir,
                "..",
                "data",
                "sales_data.csv",
            )
        )

        if not os.path.exists(csv_path):
            return JsonResponse(
                {
                    "status": "error",
                    "message": f"CSV file not found: {csv_path}",
                },
                status=404,
            )

        # =====================================================
        # READ DATA
        # =====================================================

        df = pd.read_csv(csv_path)

        # =====================================================
        # CLEAN DATA
        # =====================================================

        df, cleaning_summary = prepare_dataset(df)

        # =====================================================
        # NORMALIZE COLUMN NAMES
        # =====================================================

        df.columns = (
            df.columns
            .str.strip()
            .str.lower()
            .str.replace(" ", "_")
        )

        # =====================================================
        # MAKE SURE DATE COLUMN IS DATETIME
        # =====================================================

        if "date" in df.columns:
            df["date"] = pd.to_datetime(
                df["date"],
                errors="coerce",
            )

        # =====================================================
        # GET FILTERS
        # =====================================================

        region = request.GET.get(
            "region",
            "All",
        ).strip()

        category = request.GET.get(
            "category",
            "All",
        ).strip()

        product = request.GET.get(
            "product",
            "All",
        ).strip()

        start_date = request.GET.get(
            "start_date",
            "",
        ).strip()

        end_date = request.GET.get(
            "end_date",
            "",
        ).strip()

        # =====================================================
        # DATE FILTER
        # =====================================================

        if start_date and "date" in df.columns:

            start = pd.to_datetime(
                start_date,
                errors="coerce",
            )

            if pd.notna(start):
                df = df[
                    df["date"] >= start
                ]

        if end_date and "date" in df.columns:

            end = pd.to_datetime(
                end_date,
                errors="coerce",
            )

            if pd.notna(end):
                # Include the complete selected day
                end = end + pd.Timedelta(days=1)

                df = df[
                    df["date"] < end
                ]

        # =====================================================
        # REGION FILTER
        # =====================================================

        if (
            region
            and region.lower() != "all"
            and "region" in df.columns
        ):

            df = df[
                df["region"]
                .astype(str)
                .str.strip()
                .str.lower()
                == region.lower()
            ]

        # =====================================================
        # CATEGORY FILTER
        # =====================================================

        if (
            category
            and category.lower() != "all"
            and "category" in df.columns
        ):

            df = df[
                df["category"]
                .astype(str)
                .str.strip()
                .str.lower()
                == category.lower()
            ]

        # =====================================================
        # PRODUCT FILTER
        # =====================================================

        if (
            product
            and product.lower() != "all"
            and "product" in df.columns
        ):

            df = df[
                df["product"]
                .astype(str)
                .str.strip()
                .str.lower()
                == product.lower()
            ]

        # =====================================================
        # EMPTY RESULT
        # =====================================================

        if df.empty:

            return JsonResponse(
                {
                    "status": "success",
                    "message": "No data found for selected filters",

                    "cleaning_summary": cleaning_summary,

                    "filters": {
                        "region": region,
                        "category": category,
                        "product": product,
                        "start_date": start_date,
                        "end_date": end_date,
                    },

                    "kpis": {
                        "total_revenue": 0,
                        "total_profit": 0,
                        "total_orders": 0,
                        "total_quantity": 0,
                        "average_order_value": 0,
                        "profit_margin": 0,
                    },

                    "region_performance": [],
                    "category_performance": [],
                    "product_performance": [],
                    "monthly_sales": [],
                    "best_sales_month": None,
                    "business_insights": [],
                }
            )

        # =====================================================
        # NUMERIC COLUMNS
        # =====================================================

        for column in [
            "revenue",
            "profit",
            "quantity",
        ]:

            if column in df.columns:

                df[column] = pd.to_numeric(
                    df[column],
                    errors="coerce",
                ).fillna(0)

        # =====================================================
        # KPI
        # =====================================================

        total_revenue = float(
            df["revenue"].sum()
        ) if "revenue" in df.columns else 0

        total_profit = float(
            df["profit"].sum()
        ) if "profit" in df.columns else 0

        total_orders = int(
            len(df)
        )

        total_quantity = int(
            df["quantity"].sum()
        ) if "quantity" in df.columns else 0

        average_order_value = (
            total_revenue / total_orders
            if total_orders > 0
            else 0
        )

        profit_margin = (
            (total_profit / total_revenue) * 100
            if total_revenue > 0
            else 0
        )

        # =====================================================
        # REGION PERFORMANCE
        # =====================================================

        region_performance = []

        if "region" in df.columns:

            grouped = (
                df.groupby("region")
                .agg(
                    sales=(
                        "revenue",
                        "sum",
                    ),
                    profit=(
                        "profit",
                        "sum",
                    ),
                    quantity=(
                        "quantity",
                        "sum",
                    ),
                )
                .reset_index()
                .sort_values(
                    "sales",
                    ascending=False,
                )
            )

            for _, row in grouped.iterrows():

                sales = float(
                    row["sales"]
                )

                profit = float(
                    row["profit"]
                )

                margin = (
                    (profit / sales) * 100
                    if sales > 0
                    else 0
                )

                region_performance.append(
                    {
                        "region": str(
                            row["region"]
                        ),
                        "sales": sales,
                        "profit": profit,
                        "orders": 0,
                        "quantity": int(
                            row["quantity"]
                        ),
                        "margin": round(
                            margin,
                            2,
                        ),
                    }
                )

            # Calculate actual orders per region
            order_counts = (
                df.groupby("region")
                .size()
                .to_dict()
            )

            for item in region_performance:
                item["orders"] = int(
                    order_counts.get(
                        item["region"],
                        0,
                    )
                )

        # =====================================================
        # CATEGORY PERFORMANCE
        # =====================================================

        category_performance = []

        if "category" in df.columns:

            grouped = (
                df.groupby("category")
                .agg(
                    sales=(
                        "revenue",
                        "sum",
                    ),
                    profit=(
                        "profit",
                        "sum",
                    ),
                    quantity=(
                        "quantity",
                        "sum",
                    ),
                )
                .reset_index()
                .sort_values(
                    "sales",
                    ascending=False,
                )
            )

            order_counts = (
                df.groupby("category")
                .size()
                .to_dict()
            )

            for _, row in grouped.iterrows():

                sales = float(
                    row["sales"]
                )

                profit = float(
                    row["profit"]
                )

                margin = (
                    (profit / sales) * 100
                    if sales > 0
                    else 0
                )

                name = str(
                    row["category"]
                )

                category_performance.append(
                    {
                        "category": name,
                        "sales": sales,
                        "profit": profit,
                        "orders": int(
                            order_counts.get(
                                name,
                                0,
                            )
                        ),
                        "quantity": int(
                            row["quantity"]
                        ),
                        "margin": round(
                            margin,
                            2,
                        ),
                    }
                )

        # =====================================================
        # PRODUCT PERFORMANCE
        # =====================================================

        product_performance = []

        if "product" in df.columns:

            grouped = (
                df.groupby("product")
                .agg(
                    sales=(
                        "revenue",
                        "sum",
                    ),
                    profit=(
                        "profit",
                        "sum",
                    ),
                    quantity=(
                        "quantity",
                        "sum",
                    ),
                )
                .reset_index()
                .sort_values(
                    "sales",
                    ascending=False,
                )
            )

            order_counts = (
                df.groupby("product")
                .size()
                .to_dict()
            )

            for _, row in grouped.iterrows():

                sales = float(
                    row["sales"]
                )

                profit = float(
                    row["profit"]
                )

                margin = (
                    (profit / sales) * 100
                    if sales > 0
                    else 0
                )

                name = str(
                    row["product"]
                )

                product_performance.append(
                    {
                        "product": name,
                        "sales": sales,
                        "profit": profit,
                        "orders": int(
                            order_counts.get(
                                name,
                                0,
                            )
                        ),
                        "quantity": int(
                            row["quantity"]
                        ),
                        "margin": round(
                            margin,
                            2,
                        ),
                    }
                )

        # =====================================================
        # MONTHLY SALES
        # =====================================================

        monthly_sales = []

        if (
            "date" in df.columns
            and "revenue" in df.columns
        ):

            monthly = (
                df.dropna(
                    subset=["date"]
                )
                .assign(
                    month=lambda x:
                        x["date"].dt.to_period("M")
                )
                .groupby("month")["revenue"]
                .sum()
                .reset_index()
                .sort_values("month")
            )

            for _, row in monthly.iterrows():

                monthly_sales.append(
                    {
                        "month": str(
                            row["month"]
                        ),
                        "sales": float(
                            row["revenue"]
                        ),
                    }
                )

        # =====================================================
        # BEST MONTH
        # =====================================================

        best_sales_month = None

        if monthly_sales:

            best = max(
                monthly_sales,
                key=lambda x: x["sales"],
            )

            best_sales_month = {
                "month": best["month"],
                "sales": best["sales"],
            }

        # =====================================================
        # BUSINESS INSIGHTS
        # =====================================================

        business_insights = []

        if region_performance:

            business_insights.append(
                f"{region_performance[0]['region']} is the highest-performing region."
            )

        if category_performance:

            business_insights.append(
                f"{category_performance[0]['category']} is the highest-performing category."
            )

        if product_performance:

            business_insights.append(
                f"{product_performance[0]['product']} generates the highest sales."
            )

        # =====================================================
        # RESPONSE
        # =====================================================

        return JsonResponse(
            {
                "status": "success",

                "message": "Analytics generated successfully",

                "cleaning_summary": cleaning_summary,

                "filters": {
                    "region": region,
                    "category": category,
                    "product": product,
                    "start_date": start_date,
                    "end_date": end_date,
                },

                "kpis": {
                    "total_revenue": round(
                        total_revenue,
                        2,
                    ),
                    "total_profit": round(
                        total_profit,
                        2,
                    ),
                    "total_orders": total_orders,
                    "total_quantity": total_quantity,
                    "average_order_value": round(
                        average_order_value,
                        2,
                    ),
                    "profit_margin": round(
                        profit_margin,
                        2,
                    ),
                },

                "region_performance":
                    region_performance,

                "category_performance":
                    category_performance,

                "product_performance":
                    product_performance,

                "monthly_sales":
                    monthly_sales,

                "best_sales_month":
                    best_sales_month,

                "business_insights":
                    business_insights,
            }
        )

    except Exception as exc:

        return JsonResponse(
            {
                "status": "error",
                "message": str(exc),
            },
            status=500,
        )