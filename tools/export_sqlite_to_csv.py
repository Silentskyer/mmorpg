from __future__ import annotations

import argparse
import csv
import json
import sqlite3
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB = ROOT / "data" / "game_from_csv.db"
DEFAULT_CSV_DIR = ROOT / "data" / "csv"


TABLE_EXPORTS: list[tuple[str, str, list[str], str | None]] = [
    (
        "races",
        "races.csv",
        [
            "code",
            "name",
            "description",
            "advantage",
            "skill_name",
            "skill_type",
            "skill_description",
            "max_hp_bonus",
            "max_mp_bonus",
            "attack_bonus",
            "defense_bonus",
            "magic_bonus",
            "resistance_bonus",
            "speed_bonus",
            "luck_bonus",
        ],
        "SELECT code, name, description, advantage, skill_name, skill_type, skill_description, max_hp_bonus, max_mp_bonus, attack_bonus, defense_bonus, magic_bonus, resistance_bonus, speed_bonus, luck_bonus FROM races ORDER BY code",
    ),
    (
        "classes",
        "classes.csv",
        [
            "code",
            "name",
            "armor_type",
            "description",
            "advantage",
            "branches",
            "max_hp_bonus",
            "max_mp_bonus",
            "attack_bonus",
            "defense_bonus",
            "magic_bonus",
            "resistance_bonus",
            "speed_bonus",
            "luck_bonus",
        ],
        "SELECT code, name, armor_type, description, advantage, branches_csv AS branches, max_hp_bonus, max_mp_bonus, attack_bonus, defense_bonus, magic_bonus, resistance_bonus, speed_bonus, luck_bonus FROM classes ORDER BY code",
    ),
    (
        "branch_effects",
        "branch_effects.csv",
        ["branch_name", "stat_key", "value"],
        "SELECT branch_name, stat_key, value FROM branch_effects ORDER BY branch_name",
    ),
    (
        "class_growth",
        "class_growth.csv",
        ["class_name", "max_hp", "max_mp", "attack", "defense", "magic", "resistance", "speed", "luck"],
        "SELECT class_name, max_hp, max_mp, attack, defense, magic, resistance, speed, luck FROM class_growth ORDER BY class_name",
    ),
    (
        "skills",
        "skills.csv",
        ["class_name", "name", "cost", "power", "kind", "stat", "element", "chance", "duration", "hits", "school", "branch", "required_points", "image_path"],
        "SELECT class_name, name, cost, power, kind, stat, COALESCE(element, '') AS element, COALESCE(chance, '') AS chance, COALESCE(duration, '') AS duration, COALESCE(hits, '') AS hits, COALESCE(school, '') AS school, COALESCE(branch, '') AS branch, required_points, COALESCE(image_path, '') AS image_path FROM skills ORDER BY class_name, id",
    ),
    (
        "equipment",
        "equipment.csv",
        ["key", "name", "type", "slot", "weapon_type", "armor_class", "exclusive_classes", "element", "price", "max_hp_bonus", "max_mp_bonus", "attack_bonus", "defense_bonus", "magic_bonus", "resistance_bonus", "speed_bonus", "luck_bonus", "description", "image_path"],
        "SELECT key, name, type, slot, COALESCE(weapon_type, '') AS weapon_type, COALESCE(armor_class, '') AS armor_class, COALESCE(exclusive_classes_csv, '') AS exclusive_classes, COALESCE(element, '') AS element, price, max_hp_bonus, max_mp_bonus, attack_bonus, defense_bonus, magic_bonus, resistance_bonus, speed_bonus, luck_bonus, description, COALESCE(image_path, '') AS image_path FROM equipment ORDER BY key",
    ),
    (
        "consumables",
        "consumables.csv",
        ["key", "name", "type", "price", "heal_hp", "heal_mp", "description"],
        "SELECT key, name, type, price, heal_hp, heal_mp, description FROM consumables ORDER BY key",
    ),
    (
        "equip_rules",
        "equip_rules.csv",
        ["class_name", "weapon_types", "armor_classes"],
        "SELECT class_name, weapon_types_csv AS weapon_types, armor_classes_csv AS armor_classes FROM equip_rules ORDER BY class_name",
    ),
    (
        "shop_items",
        "shop_items.csv",
        ["pool_id", "item_key", "weight", "min_level", "max_level"],
        "SELECT pool_id, item_key, weight, min_level, max_level FROM shop_items ORDER BY pool_id, id",
    ),
    (
        "drop_tables",
        "drop_tables.csv",
        ["table_id", "item_key", "weight", "min_qty", "max_qty"],
        "SELECT table_id, COALESCE(item_key, '') AS item_key, weight, min_qty, max_qty FROM drop_tables ORDER BY table_id, id",
    ),
    (
        "areas",
        "areas.csv",
        ["area_id", "name", "category", "story_stage", "min_level", "recommended_level", "monster_codes", "shop_pool", "theme", "description"],
        "SELECT area_id, name, category, story_stage, min_level, recommended_level, monster_codes_csv AS monster_codes, COALESCE(shop_pool, '') AS shop_pool, theme, description FROM areas ORDER BY category, story_stage, area_id",
    ),
    (
        "story_chapters",
        "story_chapters.csv",
        ["chapter_id", "story_stage", "title", "area_id", "boss_code", "summary", "reward_gold", "reward_item"],
        "SELECT chapter_id, story_stage, title, area_id, boss_code, summary, reward_gold, COALESCE(reward_item, '') AS reward_item FROM story_chapters ORDER BY story_stage",
    ),
    (
        "quests",
        "quests.csv",
        ["quest_id", "story_stage", "chapter_id", "title", "objective_type", "target_code", "target_count", "description", "reward_exp", "reward_gold", "reward_item", "is_main"],
        "SELECT quest_id, story_stage, chapter_id, title, objective_type, target_code, target_count, description, reward_exp, reward_gold, COALESCE(reward_item, '') AS reward_item, is_main FROM quests ORDER BY story_stage, quest_id",
    ),
    (
        "monsters",
        "monsters.csv",
        ["code", "name", "category", "story_order", "level", "elements", "hp", "mp", "attack", "defense", "magic", "resistance", "speed", "luck", "exp", "gold", "note", "drop_table", "drops", "image_path"],
        "SELECT code, name, category, COALESCE(story_order, '') AS story_order, level, elements_csv AS elements, hp, mp, attack, defense, magic, resistance, speed, luck, exp, gold, note, COALESCE(drop_table, '') AS drop_table, COALESCE(drops_csv, '') AS drops, COALESCE(image_path, '') AS image_path FROM monsters ORDER BY category, story_order, code",
    ),
    (
        "monster_skills",
        "monster_skills.csv",
        ["monster_code", "name", "kind", "stat", "power", "element", "chance", "duration", "hits", "cost", "target_scope", "weight"],
        "SELECT monster_code, name, kind, stat, power, COALESCE(element, '') AS element, COALESCE(chance, '') AS chance, COALESCE(duration, '') AS duration, COALESCE(hits, '') AS hits, cost, target_scope, weight FROM monster_skills ORDER BY monster_code, id",
    ),
]


PLAYER_HEADERS = [
    "name",
    "race_key",
    "race_name",
    "class_key",
    "class_name",
    "level",
    "class_level",
    "exp",
    "gold",
    "hp",
    "mp",
    "max_hp",
    "max_mp",
    "attack",
    "defense",
    "magic",
    "resistance",
    "speed",
    "luck",
    "skill_points",
    "inventory",
    "equipment",
    "branches",
    "companions",
]


def csv_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value)


def json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(", ", ": "))


def write_csv(path: Path, headers: list[str], rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow({header: csv_text(row.get(header, "")) for header in headers})


def export_simple_table(conn: sqlite3.Connection, csv_dir: Path, filename: str, headers: list[str], query: str) -> None:
    cur = conn.execute(query)
    rows = [dict(row) for row in cur.fetchall()]
    write_csv(csv_dir / filename, headers, rows)


def parse_snapshot(raw: str | None) -> dict[str, Any]:
    if not raw:
        return {}
    try:
        value = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return value if isinstance(value, dict) else {}


def export_players(conn: sqlite3.Connection, csv_dir: Path) -> None:
    players = conn.execute(
        """
        SELECT id, name, race_code, race_name, class_code, class_name,
               level, class_level, exp, gold, hp, mp, max_hp, max_mp,
               attack, defense, magic, resistance, speed, luck, skill_points
        FROM players
        ORDER BY id
        """
    ).fetchall()

    inventory_rows = conn.execute(
        """
        SELECT player_id, item_key, quantity, slot_override, item_snapshot_json
        FROM player_inventory
        ORDER BY player_id, id
        """
    ).fetchall()
    equipment_rows = conn.execute(
        """
        SELECT player_id, slot, item_key, item_snapshot_json
        FROM player_equipment
        ORDER BY player_id, slot
        """
    ).fetchall()
    branch_rows = conn.execute(
        """
        SELECT player_id, branch_name, branch_level
        FROM player_skill_branches
        ORDER BY player_id, branch_name
        """
    ).fetchall()
    companion_rows = conn.execute(
        """
        SELECT player_id, name, class_code, class_name, level, class_level,
               hp, mp, max_hp, max_mp, attack, defense, magic, resistance, speed, luck
        FROM companions
        ORDER BY player_id, id
        """
    ).fetchall()

    inventory_by_player: dict[int, list[dict[str, Any]]] = {}
    for row in inventory_rows:
        snapshot = parse_snapshot(row["item_snapshot_json"])
        entry = snapshot if snapshot else {"key": row["item_key"], "qty": row["quantity"]}
        if "key" not in entry:
            entry["key"] = row["item_key"]
        if "qty" not in entry and "quantity" not in entry:
            entry["qty"] = row["quantity"]
        if row["slot_override"] and "slot" not in entry:
            entry["slot"] = row["slot_override"]
        inventory_by_player.setdefault(row["player_id"], []).append(entry)

    equipment_by_player: dict[int, list[dict[str, Any]]] = {}
    for row in equipment_rows:
        snapshot = parse_snapshot(row["item_snapshot_json"])
        entry = snapshot if snapshot else {"key": row["item_key"], "slot": row["slot"], "type": "equipment"}
        if "slot" not in entry:
            entry["slot"] = row["slot"]
        if "key" not in entry:
            entry["key"] = row["item_key"]
        if "type" not in entry:
            entry["type"] = "equipment"
        equipment_by_player.setdefault(row["player_id"], []).append(entry)

    branches_by_player: dict[int, list[dict[str, Any]]] = {}
    for row in branch_rows:
        branches_by_player.setdefault(row["player_id"], []).append(
            {"name": row["branch_name"], "level": row["branch_level"]}
        )

    companions_by_player: dict[int, list[dict[str, Any]]] = {}
    for row in companion_rows:
        companions_by_player.setdefault(row["player_id"], []).append(
            {
                "name": row["name"],
                "classCode": row["class_code"],
                "className": row["class_name"],
                "level": row["level"],
                "classLevel": row["class_level"],
                "hp": row["hp"],
                "mp": row["mp"],
                "maxHp": row["max_hp"],
                "maxMp": row["max_mp"],
                "attack": row["attack"],
                "defense": row["defense"],
                "magic": row["magic"],
                "resistance": row["resistance"],
                "speed": row["speed"],
                "luck": row["luck"],
            }
        )

    output_rows: list[dict[str, Any]] = []
    for player in players:
        output_rows.append(
            {
                "name": player["name"],
                "race_key": player["race_code"],
                "race_name": player["race_name"],
                "class_key": player["class_code"],
                "class_name": player["class_name"],
                "level": player["level"],
                "class_level": player["class_level"],
                "exp": player["exp"],
                "gold": player["gold"],
                "hp": player["hp"],
                "mp": player["mp"],
                "max_hp": player["max_hp"],
                "max_mp": player["max_mp"],
                "attack": player["attack"],
                "defense": player["defense"],
                "magic": player["magic"],
                "resistance": player["resistance"],
                "speed": player["speed"],
                "luck": player["luck"],
                "skill_points": player["skill_points"],
                "inventory": json_text(inventory_by_player.get(player["id"], [])),
                "equipment": json_text(equipment_by_player.get(player["id"], [])),
                "branches": json_text(branches_by_player.get(player["id"], [])),
                "companions": json_text(companions_by_player.get(player["id"], [])),
            }
        )

    write_csv(csv_dir / "players.csv", PLAYER_HEADERS, output_rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Export SQLite database back to CSV files.")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    parser.add_argument("--csv-dir", type=Path, default=DEFAULT_CSV_DIR)
    args = parser.parse_args()

    db_path = args.db.resolve()
    csv_dir = args.csv_dir.resolve()

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        for _, filename, headers, query in TABLE_EXPORTS:
            if query is not None:
                export_simple_table(conn, csv_dir, filename, headers, query)
        export_players(conn, csv_dir)
    finally:
        conn.close()

    print(f"Exported SQLite database: {db_path}")
    print(f"Updated CSV directory: {csv_dir}")


if __name__ == "__main__":
    main()
