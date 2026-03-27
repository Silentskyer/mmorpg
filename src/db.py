from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

from .game_data import CLASSES, EQUIPMENT, MONSTERS, RACES, STARTING_EQUIPMENT

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "game.db"
SCHEMA_PATH = ROOT / "schema.sql"
SQLITE_EXE = ROOT / "tools" / "sqlite" / "sqlite3.exe"


def _quote(value: Any) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def _run_sql(sql: str, json_mode: bool = False) -> str:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    command = [str(SQLITE_EXE)]
    if json_mode:
        command.append("-json")
    command.extend([str(DB_PATH), sql])
    result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8", check=True)
    return result.stdout.strip()


def _query(sql: str) -> list[dict[str, Any]]:
    output = _run_sql(sql, json_mode=True)
    if not output:
        return []
    return json.loads(output)


def init_db() -> None:
    _run_sql(f'.read "{SCHEMA_PATH.as_posix()}"')
    _seed_races()
    _seed_classes()
    _seed_equipment()
    _seed_monsters()


def _seed_races() -> None:
    for race in RACES:
        _run_sql(
            "INSERT OR REPLACE INTO races (code, name, description, bonuses_json, skill_name, skill_type, skill_description) "
            f"VALUES ({_quote(race['code'])}, {_quote(race['name'])}, {_quote(race['description'])}, "
            f"{_quote(json.dumps(race['bonuses'], ensure_ascii=False))}, {_quote(race['skill_name'])}, "
            f"{_quote(race['skill_type'])}, {_quote(race['skill_description'])});"
        )


def _seed_classes() -> None:
    for cls in CLASSES:
        _run_sql(
            "INSERT OR REPLACE INTO classes (code, name, description, bonuses_json, branches_json) "
            f"VALUES ({_quote(cls['code'])}, {_quote(cls['name'])}, {_quote(cls['description'])}, "
            f"{_quote(json.dumps(cls['bonuses'], ensure_ascii=False))}, {_quote(json.dumps(cls['branches'], ensure_ascii=False))});"
        )


def _seed_equipment() -> None:
    for item in EQUIPMENT:
        _run_sql(
            "INSERT OR REPLACE INTO equipment_templates (code, name, slot, rarity, element, bonuses_json, allowed_classes_json) "
            f"VALUES ({_quote(item['code'])}, {_quote(item['name'])}, {_quote(item['slot'])}, {_quote(item['rarity'])}, "
            f"{_quote(item['element'])}, {_quote(json.dumps(item['bonuses'], ensure_ascii=False))}, {_quote(json.dumps(item['allowed_classes'], ensure_ascii=False))});"
        )


def _seed_monsters() -> None:
    for monster in MONSTERS:
        _run_sql(
            "INSERT OR REPLACE INTO monsters (code, name, category, level, element_primary, element_secondary, hp, mp, attack, defense, magic, resistance, speed, luck, exp_reward, gold_reward, skill_note, story_order) "
            f"VALUES ({_quote(monster['code'])}, {_quote(monster['name'])}, {_quote(monster['category'])}, {_quote(monster['level'])}, "
            f"{_quote(monster['element_primary'])}, {_quote(monster['element_secondary'])}, {_quote(monster['hp'])}, {_quote(monster['mp'])}, {_quote(monster['attack'])}, "
            f"{_quote(monster['defense'])}, {_quote(monster['magic'])}, {_quote(monster['resistance'])}, {_quote(monster['speed'])}, {_quote(monster['luck'])}, "
            f"{_quote(monster['exp_reward'])}, {_quote(monster['gold_reward'])}, {_quote(monster['skill_note'])}, {_quote(monster.get('story_order', 0))});"
        )


def list_races() -> list[dict[str, Any]]:
    return _query("SELECT * FROM races ORDER BY code;")


def list_classes() -> list[dict[str, Any]]:
    return _query("SELECT * FROM classes ORDER BY code;")


def list_players() -> list[dict[str, Any]]:
    return _query(
        """
        SELECT p.id, p.name, r.name AS race_name, c.name AS class_name, p.level, p.class_level
        FROM players p
        JOIN races r ON r.code = p.race_code
        JOIN classes c ON c.code = p.class_code
        ORDER BY p.updated_at DESC, p.id DESC;
        """
    )


def create_player(player: dict[str, Any], branch_names: list[str]) -> int:
    _run_sql(
        """
        INSERT INTO players
        (name, race_code, class_code, level, class_level, exp, skill_points, story_stage, dungeon_clears, hp, max_hp, mp, max_mp, attack, defense, magic, resistance, speed, luck, gold, updated_at)
        VALUES
        ({name}, {race_code}, {class_code}, {level}, {class_level}, {exp}, {skill_points}, {story_stage}, {dungeon_clears}, {hp}, {max_hp}, {mp}, {max_mp}, {attack}, {defense}, {magic}, {resistance}, {speed}, {luck}, {gold}, CURRENT_TIMESTAMP);
        """.format(**{key: _quote(value) for key, value in player.items()})
    )
    player_id = int(_query("SELECT id FROM players WHERE name = {name};".format(name=_quote(player["name"])))[0]["id"])
    for branch_name in branch_names:
        _run_sql(
            "INSERT INTO player_skill_branches (player_id, branch_key, branch_name, branch_level) "
            f"VALUES ({player_id}, {_quote(branch_name)}, {_quote(branch_name)}, 0);"
        )
    for item_code in STARTING_EQUIPMENT.get(player["class_name"], []):
        rows = _query(f"SELECT slot FROM equipment_templates WHERE code = {_quote(item_code)};")
        if rows:
            _run_sql(
                "INSERT OR REPLACE INTO player_equipment (player_id, slot, equipment_code) "
                f"VALUES ({player_id}, {_quote(rows[0]['slot'])}, {_quote(item_code)});"
            )
    return player_id


def load_player(player_id: int) -> dict[str, Any] | None:
    rows = _query(
        """
        SELECT p.*, r.name AS race_name, r.skill_name, r.skill_type, r.skill_description, c.name AS class_name
        FROM players p
        JOIN races r ON r.code = p.race_code
        JOIN classes c ON c.code = p.class_code
        WHERE p.id = {player_id};
        """.format(player_id=_quote(player_id))
    )
    if not rows:
        return None
    player = rows[0]
    equipment = _query(
        """
        SELECT pe.slot, et.code, et.name, et.element, et.bonuses_json
        FROM player_equipment pe
        JOIN equipment_templates et ON et.code = pe.equipment_code
        WHERE pe.player_id = {player_id};
        """.format(player_id=_quote(player_id))
    )
    branches = _query(
        "SELECT branch_name, branch_level FROM player_skill_branches WHERE player_id = {player_id} ORDER BY branch_name;".format(player_id=_quote(player_id))
    )
    player["equipment"] = [
        {"slot": item["slot"], "code": item["code"], "name": item["name"], "element": item["element"], "bonuses": json.loads(item["bonuses_json"])}
        for item in equipment
    ]
    player["branches"] = [{"name": branch["branch_name"], "level": branch["branch_level"]} for branch in branches]
    return player


def save_player(player: dict[str, Any]) -> None:
    _run_sql(
        """
        UPDATE players
        SET level = {level}, class_level = {class_level}, exp = {exp}, skill_points = {skill_points},
            story_stage = {story_stage}, dungeon_clears = {dungeon_clears}, hp = {hp}, max_hp = {max_hp},
            mp = {mp}, max_mp = {max_mp}, attack = {attack}, defense = {defense}, magic = {magic},
            resistance = {resistance}, speed = {speed}, luck = {luck}, gold = {gold}, updated_at = CURRENT_TIMESTAMP
        WHERE id = {id};
        """.format(**{key: _quote(value) for key, value in player.items() if key in {
            "level", "class_level", "exp", "skill_points", "story_stage", "dungeon_clears", "hp", "max_hp", "mp", "max_mp",
            "attack", "defense", "magic", "resistance", "speed", "luck", "gold", "id"
        }})
    )
    for branch in player["branches"]:
        _run_sql(
            "UPDATE player_skill_branches SET branch_level = {level} WHERE player_id = {player_id} AND branch_name = {name};".format(
                level=_quote(branch["level"]), player_id=_quote(player["id"]), name=_quote(branch["name"])
            )
        )


def fetch_random_monster(category: str, story_stage: int = 1) -> dict[str, Any] | None:
    if category == "story":
        rows = _query(
            "SELECT * FROM monsters WHERE category = 'story' AND story_order = {stage} LIMIT 1;".format(stage=_quote(story_stage))
        )
    else:
        rows = _query("SELECT * FROM monsters WHERE category = {category} ORDER BY random() LIMIT 1;".format(category=_quote(category)))
    return rows[0] if rows else None
