from __future__ import annotations

import argparse
import csv
import json
import subprocess
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SCHEMA = ROOT / "schema.sql"
DEFAULT_CSV_DIR = ROOT / "data" / "csv"
DEFAULT_OUTPUT = ROOT / "data" / "game_from_csv.db"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def read_skills_csv(path: Path) -> list[dict[str, str]]:
    rows = read_csv(path)
    normalized: list[dict[str, str]] = []
    for row in rows:
        fixed = dict(row)
        extras = fixed.pop(None, None)
        if extras and fixed.get("kind") == "multiHit" and not fixed.get("branch"):
            fixed["hits"] = str(fixed.get("school", "")).strip()
            fixed["school"] = ""
            fixed["branch"] = fixed.get("required_points", "")
            fixed["required_points"] = str(extras[0]).strip()
        normalized.append(fixed)
    return normalized


def to_int(value: str | None, default: int = 0) -> int:
    if value is None:
        return default
    if str(value).strip() == "":
        return default
    return int(float(value))


def to_float(value: str | None, default: float | None = None) -> float | None:
    if value is None:
        return default
    if str(value).strip() == "":
        return default
    return float(value)


def json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


def maybe_json(value: str | None) -> list[Any]:
    if not value or not str(value).strip():
        return []
    return json.loads(value)


class RawSql:
    def __init__(self, sql: str) -> None:
        self.sql = sql


def item_type_for_key(item_key: str, equipment_keys: set[str], consumable_keys: set[str]) -> str:
    if item_key in equipment_keys:
        return "equipment"
    if item_key in consumable_keys:
        return "consumable"
    return "equipment"


def resolve_item_key(entry: dict[str, Any], by_name: dict[str, str], fallback_key: str | None = None) -> str:
    raw_key = entry.get("key") or fallback_key
    if raw_key:
        return str(raw_key)
    name = entry.get("name")
    if name and name in by_name:
        return by_name[name]
    raise ValueError(f"無法為物品解析 key: {entry}")


def import_master_tables(conn: sqlite3.Connection, csv_dir: Path) -> tuple[set[str], set[str], dict[str, str]]:
    cur = conn.cursor()

    races = read_csv(csv_dir / "races.csv")
    cur.executemany(
        """
        INSERT INTO races (
            code, name, description, advantage, skill_name, skill_type, skill_description,
            max_hp_bonus, max_mp_bonus, attack_bonus, defense_bonus, magic_bonus,
            resistance_bonus, speed_bonus, luck_bonus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["code"],
                row["name"],
                row["description"],
                row["advantage"],
                row["skill_name"],
                row["skill_type"],
                row["skill_description"],
                to_int(row["max_hp_bonus"]),
                to_int(row["max_mp_bonus"]),
                to_int(row["attack_bonus"]),
                to_int(row["defense_bonus"]),
                to_int(row["magic_bonus"]),
                to_int(row["resistance_bonus"]),
                to_int(row["speed_bonus"]),
                to_int(row["luck_bonus"]),
            )
            for row in races
        ],
    )

    classes = read_csv(csv_dir / "classes.csv")
    cur.executemany(
        """
        INSERT INTO classes (
            code, name, armor_type, description, advantage, branches_csv,
            max_hp_bonus, max_mp_bonus, attack_bonus, defense_bonus,
            magic_bonus, resistance_bonus, speed_bonus, luck_bonus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["code"],
                row["name"],
                row["armor_type"],
                row["description"],
                row["advantage"],
                row["branches"],
                to_int(row["max_hp_bonus"]),
                to_int(row["max_mp_bonus"]),
                to_int(row["attack_bonus"]),
                to_int(row["defense_bonus"]),
                to_int(row["magic_bonus"]),
                to_int(row["resistance_bonus"]),
                to_int(row["speed_bonus"]),
                to_int(row["luck_bonus"]),
            )
            for row in classes
        ],
    )

    branch_effects = read_csv(csv_dir / "branch_effects.csv")
    cur.executemany(
        "INSERT INTO branch_effects (branch_name, stat_key, value) VALUES (?, ?, ?)",
        [(row["branch_name"], row["stat_key"], to_int(row["value"])) for row in branch_effects],
    )

    class_growth = read_csv(csv_dir / "class_growth.csv")
    cur.executemany(
        """
        INSERT INTO class_growth (
            class_name, max_hp, max_mp, attack, defense, magic, resistance, speed, luck
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["class_name"],
                to_int(row["max_hp"]),
                to_int(row["max_mp"]),
                to_int(row["attack"]),
                to_int(row["defense"]),
                to_int(row["magic"]),
                to_int(row["resistance"]),
                to_int(row["speed"]),
                to_int(row["luck"]),
            )
            for row in class_growth
        ],
    )

    skills = read_skills_csv(csv_dir / "skills.csv")
    cur.executemany(
        """
        INSERT INTO skills (
            class_name, name, cost, power, kind, stat, element,
            chance, duration, hits, school, branch, required_points
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["class_name"],
                row["name"],
                to_int(row["cost"]),
                to_float(row["power"], 0.0),
                row["kind"],
                row["stat"],
                row["element"] or None,
                to_float(row["chance"]),
                to_int(row["duration"]) if row["duration"] else None,
                to_int(row["hits"]) if row["hits"] else None,
                row["school"] or None,
                row["branch"] or None,
                to_int(row["required_points"]),
            )
            for row in skills
        ],
    )

    equipment = read_csv(csv_dir / "equipment.csv")
    cur.executemany(
        """
        INSERT INTO equipment (
            key, name, type, slot, weapon_type, armor_class, element, price,
            max_hp_bonus, max_mp_bonus, attack_bonus, defense_bonus,
            magic_bonus, resistance_bonus, speed_bonus, luck_bonus, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["key"],
                row["name"],
                row["type"],
                row["slot"],
                row["weapon_type"] or None,
                row["armor_class"] or None,
                row["element"] or None,
                to_int(row["price"]),
                to_int(row["max_hp_bonus"]),
                to_int(row["max_mp_bonus"]),
                to_int(row["attack_bonus"]),
                to_int(row["defense_bonus"]),
                to_int(row["magic_bonus"]),
                to_int(row["resistance_bonus"]),
                to_int(row["speed_bonus"]),
                to_int(row["luck_bonus"]),
                row["description"],
            )
            for row in equipment
        ],
    )

    consumables = read_csv(csv_dir / "consumables.csv")
    cur.executemany(
        """
        INSERT INTO consumables (
            key, name, type, price, heal_hp, heal_mp, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["key"],
                row["name"],
                row["type"],
                to_int(row["price"]),
                to_int(row["heal_hp"]),
                to_int(row["heal_mp"]),
                row["description"],
            )
            for row in consumables
        ],
    )

    equip_rules = read_csv(csv_dir / "equip_rules.csv")
    cur.executemany(
        "INSERT INTO equip_rules (class_name, weapon_types_csv, armor_classes_csv) VALUES (?, ?, ?)",
        [(row["class_name"], row["weapon_types"], row["armor_classes"]) for row in equip_rules],
    )

    shop_items = read_csv(csv_dir / "shop_items.csv")
    cur.executemany(
        "INSERT INTO shop_items (pool_id, item_key, weight, min_level, max_level) VALUES (?, ?, ?, ?, ?)",
        [
            (
                row["pool_id"],
                row["item_key"],
                to_int(row["weight"]),
                to_int(row["min_level"], 1),
                to_int(row["max_level"], 999),
            )
            for row in shop_items
        ],
    )

    drop_tables = read_csv(csv_dir / "drop_tables.csv")
    cur.executemany(
        "INSERT INTO drop_tables (table_id, item_key, weight, min_qty, max_qty) VALUES (?, ?, ?, ?, ?)",
        [
            (
                row["table_id"],
                row["item_key"] or None,
                to_int(row["weight"]),
                to_int(row["min_qty"], 1),
                to_int(row["max_qty"], 1),
            )
            for row in drop_tables
        ],
    )

    areas = read_csv(csv_dir / "areas.csv")
    cur.executemany(
        """
        INSERT INTO areas (
            area_id, name, category, story_stage, min_level, recommended_level,
            monster_codes_csv, shop_pool, theme, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["area_id"],
                row["name"],
                row["category"],
                to_int(row["story_stage"]),
                to_int(row["min_level"], 1),
                to_int(row["recommended_level"], 1),
                row["monster_codes"],
                row["shop_pool"] or None,
                row.get("theme") or "meadow",
                row["description"],
            )
            for row in areas
        ],
    )

    story_chapters = read_csv(csv_dir / "story_chapters.csv")
    cur.executemany(
        """
        INSERT INTO story_chapters (
            chapter_id, story_stage, title, area_id, boss_code, summary, reward_gold, reward_item
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["chapter_id"],
                to_int(row["story_stage"]),
                row["title"],
                row["area_id"],
                row["boss_code"],
                row["summary"],
                to_int(row["reward_gold"]),
                row["reward_item"] or None,
            )
            for row in story_chapters
        ],
    )

    quests = read_csv(csv_dir / "quests.csv")
    cur.executemany(
        """
        INSERT INTO quests (
            quest_id, story_stage, chapter_id, title, objective_type, target_code,
            target_count, description, reward_exp, reward_gold, reward_item, is_main
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["quest_id"],
                to_int(row["story_stage"]),
                row["chapter_id"],
                row["title"],
                row["objective_type"],
                row["target_code"],
                to_int(row["target_count"], 1),
                row["description"],
                to_int(row["reward_exp"]),
                to_int(row["reward_gold"]),
                row["reward_item"] or None,
                to_int(row["is_main"], 1),
            )
            for row in quests
        ],
    )

    monsters = read_csv(csv_dir / "monsters.csv")
    cur.executemany(
        """
        INSERT INTO monsters (
            code, name, category, story_order, level, elements_csv,
            hp, mp, attack, defense, magic, resistance, speed, luck,
            exp, gold, note, drop_table, drops_csv
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["code"],
                row["name"],
                row["category"],
                to_int(row["story_order"]),
                to_int(row["level"]),
                row["elements"],
                to_int(row["hp"]),
                to_int(row["mp"]),
                to_int(row["attack"]),
                to_int(row["defense"]),
                to_int(row["magic"]),
                to_int(row["resistance"]),
                to_int(row["speed"]),
                to_int(row["luck"]),
                to_int(row["exp"]),
                to_int(row["gold"]),
                row["note"],
                row["drop_table"] or None,
                row["drops"] or None,
            )
            for row in monsters
        ],
    )

    monster_skills = read_csv(csv_dir / "monster_skills.csv")
    cur.executemany(
        """
        INSERT INTO monster_skills (
            monster_code, name, kind, stat, power, element, chance,
            duration, hits, cost, target_scope, weight
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["monster_code"],
                row["name"],
                row["kind"],
                row["stat"],
                to_float(row["power"], 0.0),
                row["element"] or None,
                to_float(row["chance"]),
                to_int(row["duration"]) if row["duration"] else None,
                to_int(row["hits"]) if row["hits"] else None,
                to_int(row["cost"]),
                row["target_scope"] or "single",
                to_int(row["weight"], 1),
            )
            for row in monster_skills
        ],
    )

    conn.commit()
    equipment_keys = {row["key"] for row in equipment}
    consumable_keys = {row["key"] for row in consumables}
    by_name = {row["name"]: row["key"] for row in equipment + consumables}
    return equipment_keys, consumable_keys, by_name


def import_players(
    conn: Any,
    csv_dir: Path,
    equipment_keys: set[str],
    consumable_keys: set[str],
    by_name: dict[str, str],
) -> int:
    players = read_csv(csv_dir / "players.csv")
    cur = conn.cursor()
    count = 0

    for row in players:
        cur.execute(
            """
            INSERT INTO players (
                name, race_code, race_name, class_code, class_name,
                level, class_level, exp, gold, hp, mp, max_hp, max_mp,
                attack, defense, magic, resistance, speed, luck,
                skill_points, story_stage, dungeon_clears
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                row["name"],
                row["race_key"],
                row["race_name"],
                row["class_key"],
                row["class_name"],
                to_int(row["level"], 1),
                to_int(row["class_level"], 1),
                to_int(row["exp"]),
                to_int(row["gold"]),
                to_int(row["hp"]),
                to_int(row["mp"]),
                to_int(row["max_hp"]),
                to_int(row["max_mp"]),
                to_int(row["attack"]),
                to_int(row["defense"]),
                to_int(row["magic"]),
                to_int(row["resistance"]),
                to_int(row["speed"]),
                to_int(row["luck"]),
                to_int(row["skill_points"], 1),
                to_int(row.get("story_stage"), 1),
                to_int(row.get("dungeon_clears")),
            ),
        )
        player_id = cur.lastrowid

        for entry in maybe_json(row.get("inventory")):
            item_key = resolve_item_key(entry, by_name)
            cur.execute(
                """
                INSERT INTO player_inventory (
                    player_id, item_key, item_type, quantity, slot_override, item_snapshot_json
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    player_id,
                    item_key,
                    item_type_for_key(item_key, equipment_keys, consumable_keys),
                    to_int(entry.get("qty") or entry.get("quantity"), 1),
                    entry.get("slot"),
                    json_text(entry),
                ),
            )

        for entry in maybe_json(row.get("equipment")):
            item_key = resolve_item_key(entry, by_name)
            cur.execute(
                """
                INSERT INTO player_equipment (
                    player_id, slot, item_key, item_type, item_snapshot_json
                ) VALUES (?, ?, ?, 'equipment', ?)
                """,
                (
                    player_id,
                    entry.get("slot") or "未知",
                    item_key,
                    json_text(entry),
                ),
            )

        for entry in maybe_json(row.get("branches")):
            cur.execute(
                """
                INSERT INTO player_skill_branches (
                    player_id, branch_name, branch_level
                ) VALUES (?, ?, ?)
                """,
                (
                    player_id,
                    entry.get("name") or entry.get("branch_name") or "未知分支",
                    to_int(entry.get("level") or entry.get("branch_level")),
                ),
            )

        for companion in maybe_json(row.get("companions")):
            cur.execute(
                """
                INSERT INTO companions (
                    player_id, name, class_code, class_name, level, class_level,
                    hp, mp, max_hp, max_mp, attack, defense, magic, resistance, speed, luck
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    player_id,
                    companion.get("name"),
                    companion.get("classCode") or companion.get("class_code"),
                    companion.get("className") or companion.get("class_name"),
                    to_int(companion.get("level"), 1),
                    to_int(companion.get("classLevel") or companion.get("class_level"), 1),
                    to_int(companion.get("hp")),
                    to_int(companion.get("mp")),
                    to_int(companion.get("maxHp") or companion.get("max_hp")),
                    to_int(companion.get("maxMp") or companion.get("max_mp")),
                    to_int(companion.get("attack")),
                    to_int(companion.get("defense")),
                    to_int(companion.get("magic")),
                    to_int(companion.get("resistance")),
                    to_int(companion.get("speed")),
                    to_int(companion.get("luck")),
                ),
            )
        count += 1

    conn.commit()
    return count


def sql_literal(value: Any) -> str:
    if isinstance(value, RawSql):
        return value.sql
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def append_insert(lines: list[str], table: str, columns: list[str], values: tuple[Any, ...]) -> None:
    cols = ", ".join(columns)
    vals = ", ".join(sql_literal(value) for value in values)
    lines.append(f"INSERT INTO {table} ({cols}) VALUES ({vals});")


def find_sqlite_cli() -> Path:
    cli = ROOT / "tools" / "sqlite" / "sqlite3.exe"
    if cli.exists():
        return cli
    raise FileNotFoundError("找不到 tools/sqlite/sqlite3.exe，且目前 Python 也無 sqlite3 模組。")


def import_with_sqlite_cli(schema_path: Path, csv_dir: Path, output: Path) -> int:
    equipment_rows = read_csv(csv_dir / "equipment.csv")
    consumable_rows = read_csv(csv_dir / "consumables.csv")
    equipment_keys = {row["key"] for row in equipment_rows}
    consumable_keys = {row["key"] for row in consumable_rows}
    by_name = {row["name"]: row["key"] for row in equipment_rows + consumable_rows}
    player_rows = read_csv(csv_dir / "players.csv")

    lines = [schema_path.read_text(encoding="utf-8")]

    for row in read_csv(csv_dir / "races.csv"):
        append_insert(lines, "races",
            ["code", "name", "description", "advantage", "skill_name", "skill_type", "skill_description", "max_hp_bonus", "max_mp_bonus", "attack_bonus", "defense_bonus", "magic_bonus", "resistance_bonus", "speed_bonus", "luck_bonus"],
            (row["code"], row["name"], row["description"], row["advantage"], row["skill_name"], row["skill_type"], row["skill_description"], to_int(row["max_hp_bonus"]), to_int(row["max_mp_bonus"]), to_int(row["attack_bonus"]), to_int(row["defense_bonus"]), to_int(row["magic_bonus"]), to_int(row["resistance_bonus"]), to_int(row["speed_bonus"]), to_int(row["luck_bonus"])))

    for row in read_csv(csv_dir / "classes.csv"):
        append_insert(lines, "classes",
            ["code", "name", "armor_type", "description", "advantage", "branches_csv", "max_hp_bonus", "max_mp_bonus", "attack_bonus", "defense_bonus", "magic_bonus", "resistance_bonus", "speed_bonus", "luck_bonus"],
            (row["code"], row["name"], row["armor_type"], row["description"], row["advantage"], row["branches"], to_int(row["max_hp_bonus"]), to_int(row["max_mp_bonus"]), to_int(row["attack_bonus"]), to_int(row["defense_bonus"]), to_int(row["magic_bonus"]), to_int(row["resistance_bonus"]), to_int(row["speed_bonus"]), to_int(row["luck_bonus"])))

    for row in read_csv(csv_dir / "branch_effects.csv"):
        append_insert(lines, "branch_effects", ["branch_name", "stat_key", "value"], (row["branch_name"], row["stat_key"], to_int(row["value"])))

    for row in read_csv(csv_dir / "class_growth.csv"):
        append_insert(lines, "class_growth", ["class_name", "max_hp", "max_mp", "attack", "defense", "magic", "resistance", "speed", "luck"], (row["class_name"], to_int(row["max_hp"]), to_int(row["max_mp"]), to_int(row["attack"]), to_int(row["defense"]), to_int(row["magic"]), to_int(row["resistance"]), to_int(row["speed"]), to_int(row["luck"])))

    for row in read_skills_csv(csv_dir / "skills.csv"):
        append_insert(lines, "skills", ["class_name", "name", "cost", "power", "kind", "stat", "element", "chance", "duration", "hits", "school", "branch", "required_points"], (row["class_name"], row["name"], to_int(row["cost"]), to_float(row["power"], 0.0), row["kind"], row["stat"], row["element"] or None, to_float(row["chance"]), to_int(row["duration"]) if row["duration"] else None, to_int(row["hits"]) if row["hits"] else None, row["school"] or None, row["branch"] or None, to_int(row["required_points"])))

    for row in equipment_rows:
        append_insert(lines, "equipment", ["key", "name", "type", "slot", "weapon_type", "armor_class", "element", "price", "max_hp_bonus", "max_mp_bonus", "attack_bonus", "defense_bonus", "magic_bonus", "resistance_bonus", "speed_bonus", "luck_bonus", "description"], (row["key"], row["name"], row["type"], row["slot"], row["weapon_type"] or None, row["armor_class"] or None, row["element"] or None, to_int(row["price"]), to_int(row["max_hp_bonus"]), to_int(row["max_mp_bonus"]), to_int(row["attack_bonus"]), to_int(row["defense_bonus"]), to_int(row["magic_bonus"]), to_int(row["resistance_bonus"]), to_int(row["speed_bonus"]), to_int(row["luck_bonus"]), row["description"]))

    for row in consumable_rows:
        append_insert(lines, "consumables", ["key", "name", "type", "price", "heal_hp", "heal_mp", "description"], (row["key"], row["name"], row["type"], to_int(row["price"]), to_int(row["heal_hp"]), to_int(row["heal_mp"]), row["description"]))

    for row in read_csv(csv_dir / "equip_rules.csv"):
        append_insert(lines, "equip_rules", ["class_name", "weapon_types_csv", "armor_classes_csv"], (row["class_name"], row["weapon_types"], row["armor_classes"]))

    for row in read_csv(csv_dir / "shop_items.csv"):
        append_insert(lines, "shop_items", ["pool_id", "item_key", "weight", "min_level", "max_level"], (row["pool_id"], row["item_key"], to_int(row["weight"]), to_int(row["min_level"], 1), to_int(row["max_level"], 999)))

    for row in read_csv(csv_dir / "drop_tables.csv"):
        append_insert(lines, "drop_tables", ["table_id", "item_key", "weight", "min_qty", "max_qty"], (row["table_id"], row["item_key"] or None, to_int(row["weight"]), to_int(row["min_qty"], 1), to_int(row["max_qty"], 1)))

    for row in read_csv(csv_dir / "areas.csv"):
        append_insert(lines, "areas", ["area_id", "name", "category", "story_stage", "min_level", "recommended_level", "monster_codes_csv", "shop_pool", "theme", "description"], (row["area_id"], row["name"], row["category"], to_int(row["story_stage"]), to_int(row["min_level"], 1), to_int(row["recommended_level"], 1), row["monster_codes"], row["shop_pool"] or None, row.get("theme") or "meadow", row["description"]))

    for row in read_csv(csv_dir / "story_chapters.csv"):
        append_insert(lines, "story_chapters", ["chapter_id", "story_stage", "title", "area_id", "boss_code", "summary", "reward_gold", "reward_item"], (row["chapter_id"], to_int(row["story_stage"]), row["title"], row["area_id"], row["boss_code"], row["summary"], to_int(row["reward_gold"]), row["reward_item"] or None))

    for row in read_csv(csv_dir / "quests.csv"):
        append_insert(lines, "quests", ["quest_id", "story_stage", "chapter_id", "title", "objective_type", "target_code", "target_count", "description", "reward_exp", "reward_gold", "reward_item", "is_main"], (row["quest_id"], to_int(row["story_stage"]), row["chapter_id"], row["title"], row["objective_type"], row["target_code"], to_int(row["target_count"], 1), row["description"], to_int(row["reward_exp"]), to_int(row["reward_gold"]), row["reward_item"] or None, to_int(row["is_main"], 1)))

    for row in read_csv(csv_dir / "monsters.csv"):
        append_insert(lines, "monsters", ["code", "name", "category", "story_order", "level", "elements_csv", "hp", "mp", "attack", "defense", "magic", "resistance", "speed", "luck", "exp", "gold", "note", "drop_table", "drops_csv"], (row["code"], row["name"], row["category"], to_int(row["story_order"]), to_int(row["level"]), row["elements"], to_int(row["hp"]), to_int(row["mp"]), to_int(row["attack"]), to_int(row["defense"]), to_int(row["magic"]), to_int(row["resistance"]), to_int(row["speed"]), to_int(row["luck"]), to_int(row["exp"]), to_int(row["gold"]), row["note"], row["drop_table"] or None, row["drops"] or None))

    for row in read_csv(csv_dir / "monster_skills.csv"):
        append_insert(lines, "monster_skills", ["monster_code", "name", "kind", "stat", "power", "element", "chance", "duration", "hits", "cost", "target_scope", "weight"], (row["monster_code"], row["name"], row["kind"], row["stat"], to_float(row["power"], 0.0), row["element"] or None, to_float(row["chance"]), to_int(row["duration"]) if row["duration"] else None, to_int(row["hits"]) if row["hits"] else None, to_int(row["cost"]), row["target_scope"] or "single", to_int(row["weight"], 1)))

    for row in player_rows:
        append_insert(lines, "players", ["name", "race_code", "race_name", "class_code", "class_name", "level", "class_level", "exp", "gold", "hp", "mp", "max_hp", "max_mp", "attack", "defense", "magic", "resistance", "speed", "luck", "skill_points", "story_stage", "dungeon_clears"], (row["name"], row["race_key"], row["race_name"], row["class_key"], row["class_name"], to_int(row["level"], 1), to_int(row["class_level"], 1), to_int(row["exp"]), to_int(row["gold"]), to_int(row["hp"]), to_int(row["mp"]), to_int(row["max_hp"]), to_int(row["max_mp"]), to_int(row["attack"]), to_int(row["defense"]), to_int(row["magic"]), to_int(row["resistance"]), to_int(row["speed"]), to_int(row["luck"]), to_int(row["skill_points"], 1), to_int(row.get("story_stage"), 1), to_int(row.get("dungeon_clears"))))
        player_name = row["name"].replace("'", "''")
        player_id_sql = f"(SELECT id FROM players WHERE name = '{player_name}')"

        for entry in maybe_json(row.get("inventory")):
            item_key = resolve_item_key(entry, by_name)
            append_insert(lines, "player_inventory", ["player_id", "item_key", "item_type", "quantity", "slot_override", "item_snapshot_json"], (RawSql(player_id_sql), item_key, item_type_for_key(item_key, equipment_keys, consumable_keys), to_int(entry.get("qty") or entry.get("quantity"), 1), entry.get("slot"), json_text(entry)))

        for entry in maybe_json(row.get("equipment")):
            item_key = resolve_item_key(entry, by_name)
            append_insert(lines, "player_equipment", ["player_id", "slot", "item_key", "item_type", "item_snapshot_json"], (RawSql(player_id_sql), entry.get("slot") or "未知", item_key, "equipment", json_text(entry)))

        for entry in maybe_json(row.get("branches")):
            append_insert(lines, "player_skill_branches", ["player_id", "branch_name", "branch_level"], (RawSql(player_id_sql), entry.get("name") or entry.get("branch_name") or "未知分支", to_int(entry.get("level") or entry.get("branch_level"))))

        for companion in maybe_json(row.get("companions")):
            append_insert(lines, "companions", ["player_id", "name", "class_code", "class_name", "level", "class_level", "hp", "mp", "max_hp", "max_mp", "attack", "defense", "magic", "resistance", "speed", "luck"], (RawSql(player_id_sql), companion.get("name"), companion.get("classCode") or companion.get("class_code"), companion.get("className") or companion.get("class_name"), to_int(companion.get("level"), 1), to_int(companion.get("classLevel") or companion.get("class_level"), 1), to_int(companion.get("hp")), to_int(companion.get("mp")), to_int(companion.get("maxHp") or companion.get("max_hp")), to_int(companion.get("maxMp") or companion.get("max_mp")), to_int(companion.get("attack")), to_int(companion.get("defense")), to_int(companion.get("magic")), to_int(companion.get("resistance")), to_int(companion.get("speed")), to_int(companion.get("luck"))))

    sql_text = "\n".join(lines)
    cli = find_sqlite_cli()
    subprocess.run([str(cli), str(output)], input=sql_text, text=True, encoding="utf-8", check=True, shell=False)
    return len(player_rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="將 data/csv 匯入 SQLite 資料庫")
    parser.add_argument("--schema", type=Path, default=DEFAULT_SCHEMA)
    parser.add_argument("--csv-dir", type=Path, default=DEFAULT_CSV_DIR)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    schema_path = args.schema.resolve()
    csv_dir = args.csv_dir.resolve()
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        output.unlink()
    try:
        import sqlite3  # type: ignore

        conn = sqlite3.connect(output)
        try:
            conn.executescript(schema_path.read_text(encoding="utf-8"))
            equipment_keys, consumable_keys, by_name = import_master_tables(conn, csv_dir)
            player_count = import_players(conn, csv_dir, equipment_keys, consumable_keys, by_name)
        finally:
            conn.close()
    except ModuleNotFoundError:
        player_count = import_with_sqlite_cli(schema_path, csv_dir, output)

    print(f"Created SQLite database: {output}")
    print(f"Imported players: {player_count}")


if __name__ == "__main__":
    main()
