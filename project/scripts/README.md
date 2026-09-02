# Editable backend workflow

The map/app now shows **500 plots** (up from 174), and there's a separate
Excel file — `owner-land-loan-backend.xlsx` — that holds all the editable
details for every plot: owner info, land info, loan info, and disputes.

## How it's wired together

```
owner-land-loan-backend.xlsx  --(sync script)-->  data/plots-data.json  --(imported by)-->  lib/plots.ts  --(used by)-->  the app
```

- `data/plots-data.json` is the actual data the app reads (map, plot detail
  pages, search — everything).
- `owner-land-loan-backend.xlsx` is a spreadsheet mirror of that same data,
  organized into four sheets: **Owners**, **Land Info**, **Loans**, **Disputes**.
- Every row is linked to a plot by its **Plot ID** (e.g. `NGP-DHR-014`) —
  the same ID shown on the map and on each plot's detail page.

## To change an owner's name (or any other detail)

1. Open `owner-land-loan-backend.xlsx`.
2. Go to the **Owners** sheet.
3. Find the row for the plot (search by Plot ID or by the current name).
4. Delete the name in **Current Owner Name** and type the new one.
5. Save the file.
6. From the project root, run:
   ```
   python3 scripts/sync_excel_to_json.py
   ```
7. Rebuild/redeploy the app (`npm run build`). The new name now shows up
   everywhere that plot appears.

The same process works for land details (Land Info sheet), loan details
(Loans sheet), and dispute details (Disputes sheet) — edit the yellow
columns, save, run the sync script.

**Don't edit the "Plot ID" column** — that's what keeps a spreadsheet row
tied to the correct plot on the map. Everything else (yellow-highlighted) is
safe to change freely.

## Regenerating the dataset from scratch

If you ever want to regenerate all 500 plots (e.g. to change the total count
again), the generator lives in `scripts/generate-data.mjs`. Running it will
overwrite `data/plots-data.json` with a brand-new synthetic dataset — so only
do this before you've made manual edits you want to keep, or re-export the
Excel file afterward with `scripts/make_excel.py`.
