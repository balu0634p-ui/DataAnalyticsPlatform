import pandas as pd


def prepare_dataset(df):
    """
    Clean and prepare the sales dataset for analytics.

    Returns:
        cleaned_df, cleaning_summary
    """

    original_rows = len(df)

    # -----------------------------------------
    # 1. Clean column names
    # -----------------------------------------
    df.columns = (
        df.columns
        .str.strip()
        .str.replace(" ", "_")
        .str.lower()
    )

    # -----------------------------------------
    # 2. Remove completely empty rows
    # -----------------------------------------
    df = df.dropna(how="all")

    # -----------------------------------------
    # 3. Remove duplicate rows
    # -----------------------------------------
    df = df.drop_duplicates()

    # -----------------------------------------
    # 4. Convert date column
    # -----------------------------------------
    if "date" in df.columns:
        df["date"] = pd.to_datetime(
            df["date"],
            errors="coerce"
        )

    # -----------------------------------------
    # 5. Convert numeric columns
    # -----------------------------------------
    numeric_columns = [
        "revenue",
        "profit",
        "quantity",
        "sales",
        "cost",
        "amount",
    ]

    for column in numeric_columns:
        if column in df.columns:
            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

    # -----------------------------------------
    # 6. Clean text columns
    # -----------------------------------------
    text_columns = [
        "region",
        "category",
        "product",
        "customer",
        "order_id",
    ]

    for column in text_columns:
        if column in df.columns:
            df[column] = (
                df[column]
                .astype(str)
                .str.strip()
            )

    # -----------------------------------------
    # 7. Remove rows with invalid essential data
    # -----------------------------------------
    required_columns = []

    if "date" in df.columns:
        required_columns.append("date")

    if "revenue" in df.columns:
        required_columns.append("revenue")

    if required_columns:
        df = df.dropna(
            subset=required_columns
        )

    # -----------------------------------------
    # 8. Remove invalid revenue values
    # -----------------------------------------
    if "revenue" in df.columns:
        df = df[df["revenue"] >= 0]

    # -----------------------------------------
    # 9. Remove invalid quantity values
    # -----------------------------------------
    if "quantity" in df.columns:
        df = df[df["quantity"] >= 0]

    # -----------------------------------------
    # 10. Reset index
    # -----------------------------------------
    df = df.reset_index(drop=True)

    cleaned_rows = len(df)

    # -----------------------------------------
    # Cleaning summary
    # -----------------------------------------
    cleaning_summary = {
        "original_rows": int(original_rows),
        "cleaned_rows": int(cleaned_rows),
        "rows_removed": int(
            original_rows - cleaned_rows
        ),
    }

    return df, cleaning_summary