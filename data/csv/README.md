# CSV 資料庫說明

`data/csv` 是目前網頁版遊戲的主資料來源。

## 主要資料表

- `races.csv`
  種族資料
- `classes.csv`
  職業資料
- `branch_effects.csv`
  技能樹分支效果
- `class_growth.csv`
  職業升級成長
- `skills.csv`
  技能資料
- `equipment.csv`
  武器、防具、副手、飾品
- `consumables.csv`
  消耗品
- `equip_rules.csv`
  職業可裝備限制
- `shop_items.csv`
  商店商品池
- `drop_tables.csv`
  掉落權重表
- `areas.csv`
  區域與地圖資料
- `story_chapters.csv`
  主線章節資料
- `quests.csv`
  任務資料
- `monster_skills.csv`
  怪物技能與魔法資料
- `monsters.csv`
  怪物資料
- `players.csv`
  玩家匯出資料

## 欄位格式

- `elements`
  多屬性使用 `|` 分隔，例如 `地|月`
- `drops`
  多掉落使用 `|` 分隔
- `inventory / equipment / branches / companions`
  這四欄在 `players.csv` 中使用 JSON 字串保存
- `weapon_types / armor_classes`
  多個可裝備類型使用 `|` 分隔

## 與 SQLite 同步

匯入 CSV 到 SQLite：

```powershell
.\tools\python312\python.exe .\tools\import_csv_to_sqlite.py
```

匯出 SQLite 回 CSV：

```powershell
.\tools\python312\python.exe .\tools\export_sqlite_to_csv.py
```

預設 SQLite 檔案：

- `data/game_from_csv.db`
