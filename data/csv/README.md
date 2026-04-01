# CSV 資料庫說明

`data/csv` 目錄存放目前網頁版遊戲使用的主要資料表。

## 主要資料表
- `races.csv`
  種族資料。
- `classes.csv`
  職業資料。
- `branch_effects.csv`
  技能樹分支加成資料。
- `class_growth.csv`
  職業升級成長資料。
- `skills.csv`
  技能資料。
- `equipment.csv`
  武器、防具、副手、飾品資料。
- `consumables.csv`
  消耗品資料。
- `equip_rules.csv`
  職業裝備限制資料。
- `shop_items.csv`
  商店商品池資料。
- `drop_tables.csv`
  掉落權重資料。
- `areas.csv`
  區域與地圖資料。
- `story_chapters.csv`
  主線章節資料。
- `quests.csv`
  任務資料。
- `monster_skills.csv`
  怪物技能配置資料。
- `monsters.csv`
  怪物資料。
- `players.csv`
  玩家存檔匯出資料。

## 欄位格式提示
- `elements`
  多屬性時使用 `|` 分隔，例如 `地|月`。
- `drops`
  多個掉落物使用 `|` 分隔。
- `inventory / equipment / branches / companions`
  這些在 `players.csv` 內以 JSON 字串保存。
- `weapon_types / armor_classes`
  多個可用值以 `|` 分隔。

## 與 SQLite 同步
將 CSV 匯入 SQLite：
```powershell
.\tools\python312\python.exe .\tools\import_csv_to_sqlite.py
```

將 SQLite 匯出回 CSV：
```powershell
.\tools\python312\python.exe .\tools\export_sqlite_to_csv.py
```

目前預設輸出的 SQLite 檔案：
- `data/game_from_csv.db`
