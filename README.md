# 文字 MMORPG

這個專案目前已收斂為「網頁版遊戲 + CSV/SQLite 資料工具」。

## 啟動方式

直接開啟 [index.html](./index.html)。

- 不需要 PowerShell、`cmd` 或桌面 GUI
- 遊戲主介面由 [app.js](./app.js) 與 [styles.css](./styles.css) 驅動
- 瀏覽器存檔使用本機儲存機制

## 主要結構

- `index.html`
  網頁版入口
- `app.js`
  遊戲主邏輯
- `styles.css`
  介面樣式
- `data/csv/`
  遊戲主資料表
- `schema.sql`
  對應 CSV 結構的 SQLite schema
- `tools/import_csv_to_sqlite.py`
  將 CSV 匯入 SQLite
- `tools/export_sqlite_to_csv.py`
  將 SQLite 匯出回 CSV

## SQLite 同步

匯入 CSV 到 SQLite：

```powershell
.\tools\python312\python.exe .\tools\import_csv_to_sqlite.py
```

匯出 SQLite 回 CSV：

```powershell
.\tools\python312\python.exe .\tools\export_sqlite_to_csv.py
```

預設資料庫檔案：

- [data/game_from_csv.db](./data/game_from_csv.db)

## 目前方向

- 以網頁版為唯一主線版本
- 遊戲資料優先維護於 `data/csv`
- 需要結構化查詢或備份時，再同步到 SQLite
