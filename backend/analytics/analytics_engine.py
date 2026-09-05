import pandas as pd


def prepare_dataset(df):
    """
    Clean and standardize the sales dataset.
    """

    original_rows = len(df)

    # --------------------------------------------------
    # CLEAN COLUMN NAMES
    # --------------------------------------------------

    df.columns = (
        df.columns
        .astype(str)
        .str.strip()
        .str.lower()
        .str.replace(r"[^a-z0-9]+", "_", regex=True)
        .str.strip("_")
    )

    # --------------------------------------------------
    # COLUMN ALIASES
    # --------------------------------------------------

    aliases = {
        "sales": "revenue",
        "sale": "revenue",
        "total_sales": "revenue",
        "sales_amount": "revenue",
        "amount": "revenue",

        "order": "order_id",
        "orderid": "order_id",
        "order_number": "order_id",

        "qty": "quantity",
        "units": "quantity",

        "item": "product",
        "product_name": "product",

        "region_name": "region",

        "category_name": "category",

        "order_date": "date",
        "sales_date": "date",
    }

    for old_name, new_name in aliases.items():
        if old_name in df.columns and new_name not in df.columns:
            df = df.rename(
                columns={old_name: new_name}
            )

    # --------------------------------------------------
    # REMOVE EMPTY ROWS / DUPLICATES
    # --------------------------------------------------

    df = df.dropna(how="all")
    df = df.drop_duplicates()

    # --------------------------------------------------
    # DATE
    # --------------------------------------------------

    if "date" in df.columns:
        df["date"] = pd.to_datetime(
            df["date"],
            errors="coerce"
        )

    # --------------------------------------------------
    # NUMERIC COLUMNS
    # --------------------------------------------------

    numeric_columns = [
        "revenue",
        "profit",
        "quantity",
        "cost"
    ]

    for column in numeric_columns:

        if column in df.columns:

            df[column] = (
                df[column]
                .astype(str)
                .str.replace(",", "", regex=False)
                .str.replace("₹", "", regex=False)
                .str.replace("$", "", regex=False)
                .str.replace(" ", "", regex=False)
            )

            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

            # Always use float for financial values
            if column in [
                "revenue",
                "profit",
                "cost"
            ]:
                df[column] = df[column].astype(float)

    # --------------------------------------------------
    # TEXT COLUMNS
    # --------------------------------------------------

    text_columns = [
        "region",
        "category",
        "product",
        "customer",
        "order_id"
    ]

    for column in text_columns:

        if column in df.columns:

            df[column] = (
                df[column]
                .astype("string")
                .str.strip()
            )

    # --------------------------------------------------
    # REMOVE INVALID ROWS
    # --------------------------------------------------

    required_columns = []

    if "date" in df.columns:
        required_columns.append("date")

    if "revenue" in df.columns:
        required_columns.append("revenue")

    if required_columns:

        df = df.dropna(
            subset=required_columns
        )

    # Revenue cannot be negative
    if "revenue" in df.columns:

        df = df[
            df["revenue"] >= 0
        ]

    # Quantity cannot be negative
    if "quantity" in df.columns:

        df = df[
            df["quantity"] >= 0
        ]

    # --------------------------------------------------
    # RESET INDEX
    # --------------------------------------------------

    df = df.reset_index(drop=True)

    cleaned_rows = len(df)

    cleaning_summary = {
        "original_rows": int(original_rows),
        "cleaned_rows": int(cleaned_rows),
        "rows_removed": int(
            original_rows - cleaned_rows
        )
    }

    return df, cleaning_summary