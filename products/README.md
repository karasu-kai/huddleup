# Peptide Product Catalog

Full LQ Lab Peptides product list. **All costs and RRP columns are per vial.**

## Files

| File | Purpose |
|------|---------|
| `data/catalog.csv` | Spreadsheet — open in Excel/Sheets |
| `data/catalog.json` | Structured source data |
| `scripts/build-catalog.py` | Regenerate CSV/JSON after edits |

## Columns

| Column | Description |
|--------|-------------|
| `usd_cost_per_vial` | LQ US-tier supplier cost (USD) |
| `aud_cost_per_vial` | USD × 1.4322 |
| `my_rrp_per_vial_aud` | Your retail price — fill in |
| `competitor_rrp_per_vial_aud` | Avg market RRP (AUD) |
| `benefits` | Brief research use descriptor |

## Regenerate

```bash
python3 products/scripts/build-catalog.py
```
