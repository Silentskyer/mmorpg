from __future__ import annotations

import json
import random
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LOCAL_DPG = ROOT / "tools" / "dearpygui"
if LOCAL_DPG.exists():
    sys.path.insert(0, str(LOCAL_DPG))
import dearpygui.dearpygui as dpg

SAVE_PATH = ROOT / "data" / "desktop_gui_saves.json"
BASE_STATS = {"max_hp": 100, "max_mp": 50, "attack": 10, "defense": 10, "magic": 10, "resistance": 10, "speed": 10, "luck": 10}
ELEMENT_ADVANTAGE = {"地": {"水"}, "水": {"火"}, "火": {"風"}, "風": {"地"}, "雷": {"地", "水", "火", "風"}, "日": {"月"}, "月": {"日"}}
RACES = {
    "human": {"name": "人族", "desc": "平衡泛用，適合初次冒險者。", "bonuses": {"max_hp": 10, "max_mp": 10, "attack": 2, "defense": 2, "magic": 2, "resistance": 2, "speed": 2, "luck": 2}},
    "elf": {"name": "精靈", "desc": "高魔法與高速度的法術種族。", "bonuses": {"max_mp": 25, "magic": 6, "speed": 5, "resistance": 3, "max_hp": -10, "defense": -2}},
    "orc": {"name": "獸人", "desc": "高生命與高物攻，適合正面壓制。", "bonuses": {"max_hp": 30, "attack": 7, "defense": 3, "speed": -2, "magic": -4}},
    "dwarf": {"name": "矮人", "desc": "高防禦與高抵抗的穩健防線。", "bonuses": {"max_hp": 20, "defense": 7, "resistance": 5, "speed": -3, "luck": 1}},
    "draconid": {"name": "龍人", "desc": "攻魔雙修，後期爆發出色。", "bonuses": {"max_hp": 15, "max_mp": 15, "attack": 5, "magic": 5, "resistance": 2}},
    "celestial": {"name": "天翼族", "desc": "高速敏捷，且對天法具有優勢。", "bonuses": {"max_mp": 15, "speed": 8, "resistance": 3, "luck": 3, "defense": -2}},
    "vampire": {"name": "吸血族", "desc": "持久作戰與吸血續航優秀。", "bonuses": {"max_hp": 10, "max_mp": 20, "magic": 4, "speed": 3, "luck": 2, "resistance": -2}},
}
CLASSES = {
    "warrior": {"name": "戰士", "armor": "重型裝甲", "desc": "穩定扛傷與近戰壓制", "bonuses": {"max_hp": 20, "attack": 5, "defense": 5, "resistance": 2, "speed": -1}},
    "martial": {"name": "武鬥家", "armor": "輕型裝甲", "desc": "高速連擊與單體爆發", "bonuses": {"max_hp": 10, "max_mp": 5, "attack": 4, "defense": 1, "resistance": 1, "speed": 5, "luck": 1}},
    "mage": {"name": "魔法師", "armor": "魔法裝甲", "desc": "多屬性魔法範圍輸出", "bonuses": {"max_hp": -5, "max_mp": 30, "defense": -2, "magic": 8, "resistance": 3, "speed": 1}},
    "monk": {"name": "僧侶", "armor": "輕型裝甲", "desc": "恢復、淨化與增幅支援", "bonuses": {"max_hp": 5, "max_mp": 25, "defense": 1, "magic": 5, "resistance": 6, "luck": 1}},
    "traveler": {"name": "旅行者", "armor": "一般裝甲", "desc": "平均泛用、玩法彈性大", "bonuses": {"max_hp": 5, "max_mp": 10, "attack": 2, "defense": 2, "magic": 2, "resistance": 2, "speed": 2, "luck": 2}},
    "rogue": {"name": "盜賊", "armor": "輕型裝甲", "desc": "高速暴擊與雙持", "bonuses": {"max_mp": 5, "attack": 3, "resistance": 1, "speed": 7, "luck": 4}},
}
CLASS_GROWTH = {
    "戰士": {"max_hp": 16, "max_mp": 4, "attack": 3, "defense": 3, "magic": 0, "resistance": 2, "speed": 1, "luck": 1},
    "武鬥家": {"max_hp": 12, "max_mp": 5, "attack": 3, "defense": 1, "magic": 1, "resistance": 1, "speed": 3, "luck": 1},
    "魔法師": {"max_hp": 8, "max_mp": 12, "attack": 0, "defense": 1, "magic": 4, "resistance": 2, "speed": 1, "luck": 1},
    "僧侶": {"max_hp": 10, "max_mp": 11, "attack": 1, "defense": 2, "magic": 3, "resistance": 3, "speed": 1, "luck": 1},
    "旅行者": {"max_hp": 11, "max_mp": 8, "attack": 2, "defense": 2, "magic": 2, "resistance": 2, "speed": 2, "luck": 2},
    "盜賊": {"max_hp": 10, "max_mp": 5, "attack": 3, "defense": 1, "magic": 1, "resistance": 1, "speed": 4, "luck": 2},
}
ITEMS = {
    "cloth_robe": {"name": "布衣", "slot": "身體", "type": "equipment", "armor_class": "一般裝甲", "bonuses": {"defense": 1}},
    "cloth_pants": {"name": "布褲", "slot": "腿", "type": "equipment", "armor_class": "一般裝甲", "bonuses": {"defense": 1}},
    "grass_shoes": {"name": "草鞋", "slot": "腳", "type": "equipment", "armor_class": "一般裝甲", "bonuses": {"speed": 1}},
    "wood_sword": {"name": "木劍", "slot": "主手", "type": "equipment", "weapon_type": "劍", "bonuses": {"attack": 5}},
    "wood_dagger": {"name": "木匕首", "slot": "主手", "type": "equipment", "weapon_type": "匕首", "bonuses": {"attack": 5, "speed": 1}},
    "wood_long_staff": {"name": "木長杖", "slot": "主手", "type": "equipment", "weapon_type": "長杖", "bonuses": {"magic": 5}},
    "wood_short_staff": {"name": "木短杖", "slot": "主手", "type": "equipment", "weapon_type": "短杖", "bonuses": {"magic": 3, "resistance": 2}},
    "wood_gauntlet": {"name": "木拳套", "slot": "主手", "type": "equipment", "weapon_type": "拳套", "bonuses": {"attack": 5, "speed": 1}},
    "potion_hp_s": {"name": "小型生命藥水", "type": "consumable", "heal_hp": 45, "price": 18},
    "potion_mp_s": {"name": "小型魔力藥水", "type": "consumable", "heal_mp": 30, "price": 20},
    "copper_sword": {"name": "銅劍", "slot": "主手", "type": "equipment", "weapon_type": "劍", "bonuses": {"attack": 10}, "price": 40},
    "mage_staff": {"name": "魔法師之杖", "slot": "主手", "type": "equipment", "weapon_type": "長杖", "bonuses": {"magic": 10}, "price": 45},
    "prayer_short_staff": {"name": "祈禱短杖", "slot": "主手", "type": "equipment", "weapon_type": "短杖", "bonuses": {"magic": 6, "resistance": 4}, "price": 45},
}
SHOP_ITEMS = ["potion_hp_s", "potion_mp_s", "copper_sword", "mage_staff", "prayer_short_staff"]
CLASS_SKILLS = {
    "戰士": [{"name": "重斬", "kind": "attack", "scale": "attack", "power": 1.75, "cost": 8}, {"name": "防禦姿態", "kind": "buffDefense", "cost": 6}],
    "武鬥家": [{"name": "三連擊", "kind": "attack", "scale": "attack", "power": 1.55, "cost": 9, "element": "風"}, {"name": "聚氣", "kind": "buffAttack", "cost": 6}],
    "魔法師": [
        {"name": "碎石波", "kind": "attack", "scale": "magic", "power": 1.45, "cost": 8, "element": "地"}, {"name": "岩刺", "kind": "attackDebuffDefense", "scale": "magic", "power": 1.6, "cost": 10, "element": "地", "duration": 3},
        {"name": "大地之槍", "kind": "attack", "scale": "magic", "power": 1.9, "cost": 12, "element": "地"}, {"name": "大地震", "kind": "attackStun", "scale": "magic", "power": 2.1, "cost": 16, "element": "地", "chance": 0.35, "duration": 1},
        {"name": "蓋亞之怒", "kind": "attackDebuffDefense", "scale": "magic", "power": 2.8, "cost": 22, "element": "地", "duration": 4}, {"name": "水槍", "kind": "attack", "scale": "magic", "power": 1.45, "cost": 8, "element": "水"},
        {"name": "酸雨", "kind": "attackDebuffResistance", "scale": "magic", "power": 1.55, "cost": 10, "element": "水", "duration": 3}, {"name": "吹雪", "kind": "attackFreeze", "scale": "magic", "power": 1.7, "cost": 12, "element": "水", "chance": 0.35, "duration": 2},
        {"name": "暴風雪", "kind": "attackFreeze", "scale": "magic", "power": 2.0, "cost": 14, "element": "水", "chance": 0.45, "duration": 2}, {"name": "霜天葬送", "kind": "attackFreeze", "scale": "magic", "power": 2.85, "cost": 22, "element": "水", "chance": 0.65, "duration": 3},
        {"name": "火球", "kind": "attack", "scale": "magic", "power": 1.8, "cost": 10, "element": "火"}, {"name": "豪火柱", "kind": "attack", "scale": "magic", "power": 1.95, "cost": 12, "element": "火"},
        {"name": "火焰之槍", "kind": "attack", "scale": "magic", "power": 2.05, "cost": 14, "element": "火"}, {"name": "焦土", "kind": "attackBurn", "scale": "magic", "power": 2.1, "cost": 14, "element": "火", "chance": 0.6, "duration": 3},
        {"name": "焚天神兵", "kind": "attackBurn", "scale": "magic", "power": 3.0, "cost": 24, "element": "火", "chance": 0.8, "duration": 4}, {"name": "風刃", "kind": "attack", "scale": "magic", "power": 1.45, "cost": 8, "element": "風"},
        {"name": "旋風", "kind": "attackDebuffSpeed", "scale": "magic", "power": 1.55, "cost": 10, "element": "風", "duration": 3}, {"name": "狂嵐", "kind": "attackDebuffAttack", "scale": "magic", "power": 1.8, "cost": 12, "element": "風", "duration": 3},
        {"name": "嵐天風暴", "kind": "attackDebuffSpeed", "scale": "magic", "power": 2.0, "cost": 14, "element": "風", "duration": 4}, {"name": "龍捲風", "kind": "attackStun", "scale": "magic", "power": 2.7, "cost": 22, "element": "風", "chance": 0.5, "duration": 1},
        {"name": "落雷", "kind": "attack", "scale": "magic", "power": 1.75, "cost": 10, "element": "雷"}, {"name": "雷電", "kind": "attackParalyze", "scale": "magic", "power": 1.95, "cost": 12, "element": "雷", "chance": 0.35, "duration": 2},
        {"name": "閃電球", "kind": "attack", "scale": "magic", "power": 2.05, "cost": 14, "element": "雷"}, {"name": "雷電牢獄", "kind": "attackParalyze", "scale": "magic", "power": 2.25, "cost": 18, "element": "雷", "chance": 0.55, "duration": 2},
        {"name": "神罰天雷", "kind": "attackParalyze", "scale": "magic", "power": 3.05, "cost": 26, "element": "雷", "chance": 0.75, "duration": 3}, {"name": "陽光射線", "kind": "attack", "scale": "magic", "power": 1.8, "cost": 10, "element": "日"},
        {"name": "日冕", "kind": "attackDebuffAttack", "scale": "magic", "power": 1.95, "cost": 12, "element": "日", "duration": 3}, {"name": "太陽球", "kind": "attack", "scale": "magic", "power": 2.05, "cost": 14, "element": "日"},
        {"name": "烈日恆天", "kind": "attackDebuffResistance", "scale": "magic", "power": 2.2, "cost": 18, "element": "日", "duration": 4}, {"name": "太陽風", "kind": "attackDebuffDefense", "scale": "magic", "power": 2.0, "cost": 16, "element": "日", "duration": 3},
        {"name": "太陽面爆發", "kind": "attackBurn", "scale": "magic", "power": 3.1, "cost": 26, "element": "日", "chance": 0.8, "duration": 4}, {"name": "新月", "kind": "attack", "scale": "magic", "power": 1.8, "cost": 10, "element": "月"},
        {"name": "上弦月", "kind": "attackDebuffDefense", "scale": "magic", "power": 1.95, "cost": 12, "element": "月", "duration": 3}, {"name": "下弦月", "kind": "attackDebuffAttack", "scale": "magic", "power": 1.95, "cost": 12, "element": "月", "duration": 3},
        {"name": "滿月", "kind": "attackDrain", "scale": "magic", "power": 2.15, "cost": 16, "element": "月"}, {"name": "無月", "kind": "attackDebuffResistance", "scale": "magic", "power": 2.2, "cost": 18, "element": "月", "duration": 4},
        {"name": "月亮追逐者", "kind": "attackBuffSpeed", "scale": "magic", "power": 2.85, "cost": 24, "element": "月"},
    ],
    "僧侶": [
        {"name": "治療", "kind": "heal", "scale": "magic", "power": 1.3, "cost": 8, "element": "日", "school": "天法"}, {"name": "祝福", "kind": "buffAttackDefense", "cost": 6, "element": "日", "school": "天法"},
        {"name": "大治療", "kind": "heal", "scale": "magic", "power": 2.0, "cost": 14, "element": "日", "school": "天法"}, {"name": "完全淨化", "kind": "cleanseAll", "cost": 14, "element": "日", "school": "天法"},
        {"name": "祝聖", "kind": "buffMagicResistance", "cost": 12, "element": "日", "school": "天法"}, {"name": "群體治療", "kind": "healAll", "scale": "magic", "power": 1.4, "cost": 18, "element": "日", "school": "天法"},
        {"name": "完全治療", "kind": "fullHeal", "cost": 20, "element": "日", "school": "天法"}, {"name": "奇蹟", "kind": "revive", "cost": 24, "element": "日", "school": "天法"},
        {"name": "物理強化", "kind": "buffAttackParty", "cost": 10, "school": "增幅"}, {"name": "魔法強化", "kind": "buffMagicResistance", "cost": 10, "school": "增幅"}, {"name": "疾走", "kind": "buffSpeedParty", "cost": 8, "school": "增幅"},
    ],
    "旅行者": [{"name": "急救", "kind": "heal", "scale": "magic", "power": 1.2, "cost": 8, "element": "日"}, {"name": "疾走", "kind": "evade", "cost": 6}],
    "盜賊": [{"name": "背刺", "kind": "attack", "scale": "attack", "power": 1.7, "cost": 8, "element": "月"}, {"name": "煙幕", "kind": "evade", "cost": 6}],
}
MONSTERS = [
    {"name": "草原史萊姆", "elements": ["水"], "hp": 55, "max_hp": 55, "attack": 8, "defense": 5, "magic": 6, "resistance": 6, "speed": 7, "exp": 20, "gold": 8, "note": "黏液衝擊"},
    {"name": "狂牙野狼", "elements": ["風"], "hp": 70, "max_hp": 70, "attack": 12, "defense": 7, "magic": 4, "resistance": 5, "speed": 12, "exp": 28, "gold": 12, "note": "撕裂撲擊"},
    {"name": "失控稻草人", "elements": ["地"], "hp": 80, "max_hp": 80, "attack": 11, "defense": 9, "magic": 3, "resistance": 6, "speed": 6, "exp": 30, "gold": 14, "note": "纏草束縛"},
]


class DesktopState:
    def __init__(self) -> None:
        self.player: dict | None = None
        self.battle: dict | None = None

    def load_saves(self) -> list[dict]:
        if not SAVE_PATH.exists():
            return []
        return json.loads(SAVE_PATH.read_text(encoding="utf-8"))

    def save_current(self) -> None:
        if not self.player:
            return
        SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)
        saves = self.load_saves()
        saves = [save for save in saves if save["name"] != self.player["name"]]
        saves.append(self.player)
        SAVE_PATH.write_text(json.dumps(saves, ensure_ascii=False, indent=2), encoding="utf-8")


STATE = DesktopState()


def create_monster_ailments() -> dict:
    return {"burn": 0, "freeze": 0, "paralyze": 0, "stun": 0, "attack_down": 0, "defense_down": 0, "resistance_down": 0, "speed_down": 0}


def starter_equipment(class_name: str) -> list[dict]:
    base = [deepcopy(ITEMS["cloth_robe"]), deepcopy(ITEMS["cloth_pants"]), deepcopy(ITEMS["grass_shoes"])]
    mapping = {"戰士": [deepcopy(ITEMS["wood_sword"])], "武鬥家": [deepcopy(ITEMS["wood_gauntlet"])], "魔法師": [deepcopy(ITEMS["wood_long_staff"])], "僧侶": [deepcopy(ITEMS["wood_short_staff"])], "旅行者": [deepcopy(ITEMS["wood_sword"])], "盜賊": [deepcopy(ITEMS["wood_dagger"])]}
    return base + mapping[class_name]


def effective_stats(entity: dict) -> dict:
    stats = {k: entity[k] for k in BASE_STATS}
    for item in entity.get("equipment", []):
        for key, value in item.get("bonuses", {}).items():
            stats[key] += value
    return stats


def battle_stats(entity: dict, battle: dict, is_player: bool = False) -> dict:
    stats = effective_stats(entity) if is_player or entity.get("equipment") else {k: entity[k] for k in BASE_STATS}
    if is_player and entity["race_name"] == "人族" and battle["turn"] <= 3:
        for key in ["attack", "defense", "magic", "resistance", "speed", "luck"]:
            stats[key] += 2
    if is_player and entity["race_name"] == "獸人" and entity["hp"] <= stats["max_hp"] * 0.4:
        stats["attack"] += 5
    for key in ["attack", "defense", "magic", "resistance", "speed"]:
        if battle["buffs"][key] > 0:
            stats[key] += 5
    if battle["buffs"]["dragon"] > 0:
        stats["attack"] += 6
        stats["magic"] += 6
    return stats


def monster_stats(monster: dict, battle: dict) -> dict:
    a = battle["monster_ailments"]
    return {"attack": max(1, monster["attack"] - (5 if a["attack_down"] > 0 else 0)), "defense": max(0, monster["defense"] - (6 if a["defense_down"] > 0 else 0)), "magic": monster["magic"], "resistance": max(0, monster["resistance"] - (6 if a["resistance_down"] > 0 else 0)), "speed": max(1, monster["speed"] - (5 if a["speed_down"] > 0 else 0) - (4 if a["freeze"] > 0 else 0))}


def item_power(item: dict | None) -> int:
    if not item:
        return 0
    b = item.get("bonuses", {})
    return b.get("attack", 0) * 2 + b.get("defense", 0) * 2 + b.get("magic", 0) * 2 + b.get("resistance", 0) * 2 + b.get("speed", 0) * 2 + b.get("luck", 0) * 2 + b.get("max_hp", 0) // 6 + b.get("max_mp", 0) // 6


def item_summary(item: dict) -> str:
    bonuses = " / ".join(f"{key}+{value}" for key, value in item.get("bonuses", {}).items()) or "無數值"
    parts = [item["name"], f"強度 {item_power(item)}", bonuses]
    if item.get("weapon_type"):
        parts.append(f"武器 {item['weapon_type']}")
    if item.get("armor_class"):
        parts.append(f"裝甲 {item['armor_class']}")
    return " | ".join(parts)


def can_equip(class_name: str, item: dict) -> bool:
    weapon_rules = {"戰士": {"劍"}, "武鬥家": {"拳套"}, "魔法師": {"長杖"}, "僧侶": {"短杖"}, "旅行者": {"劍", "短杖"}, "盜賊": {"匕首"}}
    armor_rules = {"戰士": {"重型裝甲", "一般裝甲"}, "武鬥家": {"輕型裝甲", "一般裝甲"}, "魔法師": {"魔法裝甲", "一般裝甲"}, "僧侶": {"輕型裝甲", "魔法裝甲", "一般裝甲"}, "旅行者": {"重型裝甲", "輕型裝甲", "魔法裝甲", "一般裝甲"}, "盜賊": {"輕型裝甲", "一般裝甲"}}
    if item.get("weapon_type"):
        return item["weapon_type"] in weapon_rules.get(class_name, set())
    if item.get("armor_class"):
        return item["armor_class"] in armor_rules.get(class_name, set())
    return True


def build_player(name: str, race_key: str, class_key: str) -> dict:
    race = RACES[race_key]
    job = CLASSES[class_key]
    stats = deepcopy(BASE_STATS)
    for src in [race["bonuses"], job["bonuses"]]:
        for key, value in src.items():
            stats[key] += value
    return {"name": name, "race_key": race_key, "race_name": race["name"], "class_key": class_key, "class_name": job["name"], "level": 1, "class_level": 1, "exp": 0, "gold": 30, **stats, "hp": stats["max_hp"], "mp": stats["max_mp"], "inventory": [{"key": "potion_hp_s", "qty": 2}, {"key": "potion_mp_s", "qty": 1}], "equipment": starter_equipment(job["name"]), "companions": []}


def class_growth_up(target: dict, class_name: str) -> None:
    for key, value in CLASS_GROWTH[class_name].items():
        target[key] += value
    target["hp"] = target["max_hp"]
    target["mp"] = target["max_mp"]


def next_level_exp(level: int) -> int:
    return 100 + (level - 1) * 40


def element_multiplier(attack_element: str | None, monster_elements: list[str]) -> float:
    if not attack_element:
        return 1.0
    if any(e in ELEMENT_ADVANTAGE.get(attack_element, set()) for e in monster_elements):
        return 1.25
    if any(attack_element in ELEMENT_ADVANTAGE.get(e, set()) for e in monster_elements):
        return 0.85
    return 1.0


def deal_damage(attack_value: int, defense_value: int, power: float, element: str | None, monster: dict) -> int:
    base = max(1, int(attack_value * power - defense_value / 2 + random.randint(0, 5)))
    return max(1, int(base * element_multiplier(element, monster.get("elements", []))))


def holy_heal_amount(player: dict, skill: dict, stats: dict, power: float, bonus_min: int, bonus_max: int) -> int:
    heal = int(stats["magic"] * power + random.randint(bonus_min, bonus_max))
    if player["race_name"] == "天翼族" and skill.get("school") == "天法":
        heal = int(heal * 1.2)
    return heal


def skill_cost(player: dict, skill: dict) -> int:
    if player["race_name"] == "天翼族" and skill.get("school") == "天法":
        return max(1, int(skill["cost"] * 0.8))
    return skill["cost"]


def apply_lifesteal(player: dict, damage: int) -> None:
    if player["race_name"] != "吸血族" or damage <= 0:
        return
    heal = max(1, damage // 5)
    player["hp"] = min(effective_stats(player)["max_hp"], player["hp"] + heal)
    STATE.battle["log"].append(f"鮮血汲取發動，回復 {heal} HP。")


def try_elf_restore(player: dict, skill: dict) -> None:
    if player["race_name"] == "精靈" and skill.get("scale") == "magic" and random.random() < 0.35:
        player["mp"] = min(effective_stats(player)["max_mp"], player["mp"] + 5)
        STATE.battle["log"].append("自然共鳴發動，回復 5 MP。")


def apply_ailment(key: str, duration: int, message: str) -> None:
    battle = STATE.battle
    battle["monster_ailments"][key] = max(battle["monster_ailments"][key], duration)
    battle["log"].append(message)


def try_apply_chance_ailment(key: str, skill: dict, message: str) -> None:
    if random.random() < skill.get("chance", 0):
        apply_ailment(key, skill.get("duration", 2), message)


def cast_attack_skill(player: dict, skill: dict, stats: dict) -> int:
    monster = STATE.battle["monster"]
    mstats = monster_stats(monster, STATE.battle)
    defense = mstats["resistance"] if skill.get("scale") == "magic" else mstats["defense"]
    damage = deal_damage(stats[skill["scale"]], defense, skill["power"], skill.get("element"), monster)
    monster["hp"] -= damage
    STATE.battle["log"].append(f"{player['name']} 使用 {skill['name']}，造成 {damage} 點傷害。")
    apply_lifesteal(player, damage)
    try_elf_restore(player, skill)
    return damage


def alive_companions() -> list[dict]:
    return [comp for comp in STATE.battle["companions"] if comp["hp"] > 0]


def living_party() -> list[dict]:
    pool = []
    if STATE.player["hp"] > 0:
        pool.append(STATE.player)
    pool.extend(alive_companions())
    return pool


def lowest_hp_party_member() -> dict | None:
    pool = living_party()
    return min(pool, key=lambda m: m["hp"] / max(1, m["max_hp"])) if pool else None


def format_ailments(ailments: dict) -> str:
    labels = {"burn": "灼燒", "freeze": "冰凍", "paralyze": "麻痺", "stun": "暈眩", "attack_down": "攻擊下降", "defense_down": "防禦下降", "resistance_down": "抗性下降", "speed_down": "速度下降"}
    active = [f"{labels[key]} {value}" for key, value in ailments.items() if value > 0]
    return " / ".join(active) if active else "無"


def compare_item_text(player: dict, item: dict) -> str:
    current = next((gear for gear in player["equipment"] if gear["slot"] == item["slot"]), None)
    return "目前該部位空缺" if not current else f"對比 {current['name']} {item_power(item) - item_power(current):+d}"


def set_status(text: str) -> None:
    dpg.set_value("status_text", text)


def clear_content() -> None:
    dpg.delete_item("content", children_only=True)


def add_nav() -> None:
    with dpg.group(horizontal=True, parent="content"):
        dpg.add_button(label="首頁", callback=lambda: render_hub())
        dpg.add_button(label="狀態", callback=render_status)
        dpg.add_button(label="裝備", callback=render_equipment)
        dpg.add_button(label="背包", callback=render_inventory)
        dpg.add_button(label="商店", callback=render_shop)
        dpg.add_button(label="同伴", callback=render_companions)
        dpg.add_button(label="戰鬥", callback=start_battle)
    dpg.add_separator(parent="content")


def render_home() -> None:
    clear_content()
    with dpg.group(parent="content"):
        dpg.add_text("桌面 GUI 版 MMORPG", color=(220, 180, 120))
        dpg.add_text("桌面版已同步主要戰鬥規則與完整魔法清單。")
        dpg.add_button(label="建立角色", callback=render_create)
        dpg.add_button(label="讀取角色", callback=render_load)


def render_create() -> None:
    clear_content()
    with dpg.group(parent="content"):
        dpg.add_text("建立角色")
        dpg.add_input_text(label="名字", tag="create_name")
        dpg.add_combo([race["name"] for race in RACES.values()], label="種族", default_value="人族", tag="create_race_name")
        dpg.add_combo([job["name"] for job in CLASSES.values()], label="職業", default_value="戰士", tag="create_class_name")
        dpg.add_button(label="建立角色", callback=create_player_callback)


def create_player_callback() -> None:
    name = dpg.get_value("create_name").strip()
    race_name = dpg.get_value("create_race_name")
    class_name = dpg.get_value("create_class_name")
    if not name:
        return set_status("請輸入角色名字。")
    race_key = next(key for key, race in RACES.items() if race["name"] == race_name)
    class_key = next(key for key, job in CLASSES.items() if job["name"] == class_name)
    STATE.player = build_player(name, race_key, class_key)
    STATE.save_current()
    render_hub("桌面版角色建立完成。")


def render_load() -> None:
    clear_content()
    saves = STATE.load_saves()
    with dpg.group(parent="content"):
        dpg.add_text("讀取角色")
        if not saves:
            dpg.add_text("目前沒有存檔角色。")
            return
        for save in saves:
            with dpg.group(horizontal=True):
                dpg.add_text(f"{save['name']} | {save['race_name']} / {save['class_name']} | Lv.{save['level']}")
                dpg.add_button(label="讀取", callback=lambda s, a, u=save: load_player(u))


def load_player(save: dict) -> None:
    STATE.player = save
    render_hub("桌面版角色已讀取。")


def render_hub(message: str = "") -> None:
    clear_content()
    if not STATE.player:
        return render_home()
    player = STATE.player
    stats = effective_stats(player)
    with dpg.group(parent="content"):
        dpg.add_text(f"{player['name']} | {player['race_name']} / {player['class_name']}")
        dpg.add_text(f"Lv.{player['level']} | 職業 Lv.{player['class_level']} / 100")
        dpg.add_text(f"HP {player['hp']}/{stats['max_hp']} | MP {player['mp']}/{stats['max_mp']} | 金幣 {player['gold']}")
        if message:
            dpg.add_text(message, color=(120, 220, 140))
    add_nav()
    dpg.add_text("桌面版已同步完整技能與異常狀態戰鬥。", parent="content")


def render_status() -> None:
    clear_content()
    player = STATE.player
    stats = effective_stats(player)
    add_nav()
    with dpg.group(parent="content"):
        dpg.add_text(f"{player['name']} 狀態")
        dpg.add_text(f"EXP {player['exp']} / {next_level_exp(player['level'])}")
        for label, key in [("HP", "max_hp"), ("MP", "max_mp"), ("攻擊", "attack"), ("防禦", "defense"), ("魔法", "magic"), ("抵抗", "resistance"), ("速度", "speed"), ("運氣", "luck")]:
            dpg.add_text(f"{label}：{stats[key]}")


def render_equipment() -> None:
    clear_content()
    add_nav()
    with dpg.group(parent="content"):
        dpg.add_text("裝備頁")
        for idx, item in enumerate(STATE.player["equipment"]):
            with dpg.group(horizontal=True):
                dpg.add_text(f"{item['slot']}：{item_summary(item)}")
                dpg.add_button(label="卸下", callback=lambda s, a, u=idx: unequip_item(u))


def render_inventory() -> None:
    clear_content()
    player = STATE.player
    add_nav()
    with dpg.group(parent="content"):
        dpg.add_text("背包")
        if not player["inventory"]:
            dpg.add_text("背包是空的。")
        for index, entry in enumerate(player["inventory"]):
            item = ITEMS[entry["key"]]
            text = f"{item['name']} x{entry.get('qty', 1)}"
            if item["type"] == "equipment":
                text += f" | {item_summary(item)} | {compare_item_text(player, item)}"
            with dpg.group(horizontal=True):
                dpg.add_text(text)
                if item["type"] == "consumable":
                    dpg.add_button(label="使用", callback=lambda s, a, u=index: use_item(u))
                else:
                    dpg.add_button(label="裝備", callback=lambda s, a, u=index: equip_item(u))


def render_shop() -> None:
    clear_content()
    player = STATE.player
    add_nav()
    with dpg.group(parent="content"):
        dpg.add_text(f"商店 | 金幣 {player['gold']}")
        for key in SHOP_ITEMS:
            item = ITEMS[key]
            text = f"{item['name']} | {item.get('price', 0)} 金幣"
            if item["type"] == "equipment":
                text += f" | {item_summary(item)} | {compare_item_text(player, item)}"
            with dpg.group(horizontal=True):
                dpg.add_text(text)
                dpg.add_button(label="購買", callback=lambda s, a, u=key: buy_item(u))


def render_companions() -> None:
    clear_content()
    player = STATE.player
    add_nav()
    with dpg.group(parent="content"):
        dpg.add_text(f"同伴（最多 3 位，目前 {len(player['companions'])} 位）")
        for idx, comp in enumerate(player["companions"]):
            with dpg.group(horizontal=True):
                dpg.add_text(f"{comp['name']} | {comp['class_name']} | Lv.{comp['level']} | HP {comp['hp']}/{comp['max_hp']}")
                dpg.add_button(label="離隊", callback=lambda s, a, u=idx: dismiss_companion(u))
        dpg.add_input_text(label="同伴名字", tag="comp_name")
        dpg.add_combo([job["name"] for job in CLASSES.values()], label="同伴職業", default_value="戰士", tag="comp_class")
        dpg.add_button(label="招募", callback=recruit_companion)


def recruit_companion() -> None:
    player = STATE.player
    if len(player["companions"]) >= 3:
        return set_status("最多只能擁有三位同伴。")
    name = dpg.get_value("comp_name").strip()
    if not name:
        return set_status("請輸入同伴名字。")
    class_name = dpg.get_value("comp_class")
    class_key = next(key for key, job in CLASSES.items() if job["name"] == class_name)
    player["companions"].append(build_player(name, "human", class_key))
    STATE.save_current()
    render_companions()
    set_status(f"{name} 已加入隊伍。")


def dismiss_companion(index: int) -> None:
    comp = STATE.player["companions"].pop(index)
    STATE.save_current()
    render_companions()
    set_status(f"{comp['name']} 已離隊。")


def buy_item(item_key: str) -> None:
    player = STATE.player
    item = ITEMS[item_key]
    if player["gold"] < item.get("price", 0):
        return set_status("金幣不足。")
    player["gold"] -= item["price"]
    existing = next((i for i in player["inventory"] if i["key"] == item_key and item["type"] == "consumable"), None)
    if existing:
        existing["qty"] += 1
    else:
        player["inventory"].append({"key": item_key, "qty": 1})
    STATE.save_current()
    render_shop()
    set_status(f"已購買 {item['name']}。")


def use_item(index: int) -> None:
    player = STATE.player
    entry = player["inventory"][index]
    item = ITEMS[entry["key"]]
    stats = effective_stats(player)
    if "heal_hp" in item:
        player["hp"] = min(stats["max_hp"], player["hp"] + item["heal_hp"])
    if "heal_mp" in item:
        player["mp"] = min(stats["max_mp"], player["mp"] + item["heal_mp"])
    entry["qty"] -= 1
    if entry["qty"] <= 0:
        player["inventory"].pop(index)
    STATE.save_current()
    render_inventory()
    set_status(f"已使用 {item['name']}。")


def lookup_item_key(name: str) -> str:
    return next((key for key, item in ITEMS.items() if item["name"] == name), "potion_hp_s")


def equip_item(index: int) -> None:
    player = STATE.player
    entry = player["inventory"][index]
    item = deepcopy(ITEMS[entry["key"]])
    if item["type"] != "equipment":
        return
    if not can_equip(player["class_name"], item):
        return set_status(f"{player['class_name']} 無法裝備 {item['name']}。")
    existing = next((gear for gear in player["equipment"] if gear["slot"] == item["slot"]), None)
    if existing:
        player["inventory"].append({"key": lookup_item_key(existing["name"]), "qty": 1})
        player["equipment"] = [gear for gear in player["equipment"] if gear["slot"] != item["slot"]]
    player["equipment"].append(item)
    player["inventory"].pop(index)
    STATE.save_current()
    render_inventory()
    set_status(f"已裝備 {item['name']}。")


def unequip_item(index: int) -> None:
    player = STATE.player
    item = player["equipment"].pop(index)
    player["inventory"].append({"key": lookup_item_key(item["name"]), "qty": 1})
    STATE.save_current()
    render_equipment()
    set_status(f"已卸下 {item['name']}。")


def start_battle() -> None:
    monster = deepcopy(random.choice(MONSTERS))
    STATE.battle = {"monster": monster, "companions": [deepcopy(comp) for comp in STATE.player["companions"]], "turn": 1, "log": [f"遭遇 {monster['name']}！"], "buffs": {"attack": 0, "defense": 0, "magic": 0, "resistance": 0, "speed": 0, "evade": 0.0, "dragon": 0}, "monster_ailments": create_monster_ailments(), "dwarf_guard_used": False}
    render_battle()
    set_status("戰鬥開始。")


def render_battle() -> None:
    clear_content()
    player = STATE.player
    battle = STATE.battle
    monster = battle["monster"]
    stats = battle_stats(player, battle, is_player=True)
    add_nav()
    with dpg.group(parent="content"):
        dpg.add_text(f"遭遇 {monster['name']}")
        dpg.add_text(f"玩家 HP {player['hp']}/{stats['max_hp']} | MP {player['mp']}/{stats['max_mp']} | 魔物 HP {max(0, monster['hp'])}/{monster['max_hp']}")
        dpg.add_text(f"屬性 {' / '.join(monster['elements'])} | 狀態 {format_ailments(battle['monster_ailments'])}")
        for comp in battle["companions"]:
            dpg.add_text(f"同伴 {comp['name']} | {comp['class_name']} | HP {comp['hp']}/{comp['max_hp']} | MP {comp['mp']}/{comp['max_mp']}")
        with dpg.group(horizontal=True):
            dpg.add_button(label="普通攻擊", callback=attack_monster)
            dpg.add_button(label="防禦", callback=defend_turn)
            if player["race_name"] in {"龍人", "天翼族"}:
                dpg.add_button(label="種族技能", callback=use_race_skill)
        with dpg.child_window(height=180, width=-1):
            for skill in CLASS_SKILLS[player["class_name"]]:
                dpg.add_button(label=f"{skill['name']}  MP {skill_cost(player, skill)}", callback=lambda s, a, u=skill: cast_skill(u))
        dpg.add_separator()
        for line in battle["log"][-15:]:
            dpg.add_text(line)


def attack_monster() -> None:
    player = STATE.player
    battle = STATE.battle
    monster = battle["monster"]
    stats = battle_stats(player, battle, is_player=True)
    mstats = monster_stats(monster, battle)
    damage = deal_damage(stats["attack"], mstats["defense"], 1.0, None, monster)
    monster["hp"] -= damage
    battle["log"].append(f"{player['name']} 普通攻擊造成 {damage} 點傷害。")
    apply_lifesteal(player, damage)
    post_player_action()


def defend_turn() -> None:
    STATE.battle["log"].append("你擺出防禦姿態。")
    post_player_action(defending=True)


def use_race_skill() -> None:
    player = STATE.player
    battle = STATE.battle
    if player["race_name"] == "龍人":
        if player["mp"] < 15:
            battle["log"].append("MP 不足，無法發動龍血覺醒。")
            return render_battle()
        player["mp"] -= 15
        battle["buffs"]["dragon"] = max(battle["buffs"]["dragon"], 3)
        battle["log"].append("龍血覺醒發動，攻擊與魔法力提升 3 回合。")
        return post_player_action()
    if player["race_name"] == "天翼族":
        if player["mp"] < 10:
            battle["log"].append("MP 不足，無法發動空域步法。")
            return render_battle()
        player["mp"] -= 10
        battle["buffs"]["evade"] = max(battle["buffs"]["evade"], 0.35)
        battle["log"].append("空域步法發動，閃避率大幅提升。")
        return post_player_action()
    render_battle()


def cast_skill(skill: dict) -> None:
    player = STATE.player
    battle = STATE.battle
    cost = skill_cost(player, skill)
    if player["mp"] < cost:
        battle["log"].append("MP 不足。")
        return render_battle()
    player["mp"] -= cost
    stats = battle_stats(player, battle, is_player=True)
    kind = skill["kind"]
    if kind == "attack":
        cast_attack_skill(player, skill, stats)
    elif kind == "attackDebuffDefense":
        cast_attack_skill(player, skill, stats); apply_ailment("defense_down", skill.get("duration", 3), f"{battle['monster']['name']} 的防禦被削弱。")
    elif kind == "attackDebuffAttack":
        cast_attack_skill(player, skill, stats); apply_ailment("attack_down", skill.get("duration", 3), f"{battle['monster']['name']} 的攻擊被壓制。")
    elif kind == "attackDebuffResistance":
        cast_attack_skill(player, skill, stats); apply_ailment("resistance_down", skill.get("duration", 3), f"{battle['monster']['name']} 的魔法抗性下降。")
    elif kind == "attackDebuffSpeed":
        cast_attack_skill(player, skill, stats); apply_ailment("speed_down", skill.get("duration", 3), f"{battle['monster']['name']} 的行動變慢了。")
    elif kind == "attackStun":
        cast_attack_skill(player, skill, stats); try_apply_chance_ailment("stun", skill, f"{battle['monster']['name']} 被震得暈頭轉向。")
    elif kind == "attackFreeze":
        cast_attack_skill(player, skill, stats); try_apply_chance_ailment("freeze", skill, f"{battle['monster']['name']} 被寒氣凍結。")
    elif kind == "attackBurn":
        cast_attack_skill(player, skill, stats); try_apply_chance_ailment("burn", skill, f"{battle['monster']['name']} 陷入灼燒。")
    elif kind == "attackParalyze":
        cast_attack_skill(player, skill, stats); try_apply_chance_ailment("paralyze", skill, f"{battle['monster']['name']} 陷入麻痺。")
    elif kind == "attackDrain":
        damage = cast_attack_skill(player, skill, stats); heal = max(1, int(damage * 0.35)); player["hp"] = min(stats["max_hp"], player["hp"] + heal); battle["log"].append(f"{skill['name']} 吸收月力，回復 {heal} HP。")
    elif kind == "attackBuffSpeed":
        cast_attack_skill(player, skill, stats); battle["buffs"]["speed"] = max(battle["buffs"]["speed"], 3); battle["buffs"]["evade"] = max(battle["buffs"]["evade"], 0.1); battle["log"].append("你的步調變得更加輕盈。")
    elif kind == "heal":
        heal = holy_heal_amount(player, skill, stats, skill["power"], 4, 10); player["hp"] = min(stats["max_hp"], player["hp"] + heal); battle["log"].append(f"{player['name']} 使用 {skill['name']}，回復 {heal} HP。")
    elif kind == "cleanseAll":
        heal = holy_heal_amount(player, skill, stats, 0.55, 2, 6)
        for member in [player] + battle["companions"]:
            member["hp"] = min(member["max_hp"], member["hp"] + heal)
        battle["log"].append(f"{player['name']} 使用 {skill['name']}，淨化全隊並回復 {heal} HP。")
    elif kind == "healAll":
        heal = holy_heal_amount(player, skill, stats, skill["power"], 6, 12)
        for member in [player] + battle["companions"]:
            member["hp"] = min(member["max_hp"], member["hp"] + heal)
        battle["log"].append(f"{player['name']} 使用 {skill['name']}，全隊回復 {heal} HP。")
    elif kind == "fullHeal":
        for member in [player] + battle["companions"]:
            member["hp"] = member["max_hp"]
        player["mp"] = min(stats["max_mp"], player["mp"] + stats["max_mp"] // 4)
        battle["log"].append(f"{player['name']} 使用 {skill['name']}，全隊恢復到最佳狀態。")
    elif kind == "buffAttack":
        battle["buffs"]["attack"] = max(battle["buffs"]["attack"], 3); battle["log"].append("攻擊提升 3 回合。")
    elif kind == "buffDefense":
        battle["buffs"]["defense"] = max(battle["buffs"]["defense"], 3); battle["log"].append("防禦提升 3 回合。")
    elif kind == "buffAttackParty":
        battle["buffs"]["attack"] = max(battle["buffs"]["attack"], 3); battle["log"].append("全隊攻擊上升。")
    elif kind == "buffAttackDefense":
        battle["buffs"]["attack"] = max(battle["buffs"]["attack"], 3); battle["buffs"]["defense"] = max(battle["buffs"]["defense"], 3); battle["log"].append("攻擊與防禦同步提升。")
    elif kind == "buffMagicResistance":
        battle["buffs"]["magic"] = max(battle["buffs"]["magic"], 3); battle["buffs"]["resistance"] = max(battle["buffs"]["resistance"], 3); battle["log"].append("魔法與抵抗同步提升。")
    elif kind == "buffSpeedParty":
        battle["buffs"]["speed"] = max(battle["buffs"]["speed"], 3); battle["buffs"]["evade"] = max(battle["buffs"]["evade"], 0.2); battle["log"].append("全隊的動作變得更輕快。")
    elif kind == "revive":
        fallen = [member for member in [player] + battle["companions"] if member["hp"] <= 0]
        if not fallen:
            battle["log"].append("目前沒有可復活的對象。")
            return render_battle()
        for member in fallen:
            member["hp"] = max(1, int(member["max_hp"] * 0.45)); member["mp"] = int(member["max_mp"] * 0.35)
        battle["log"].append("倒下的同伴重新站起來了。")
    elif kind == "evade":
        battle["buffs"]["speed"] = max(battle["buffs"]["speed"], 2); battle["buffs"]["evade"] = max(battle["buffs"]["evade"], 0.2); battle["log"].append("閃避率大幅提高。")
    post_player_action()


def companion_turn() -> None:
    monster = STATE.battle["monster"]
    for comp in alive_companions():
        if monster["hp"] <= 0:
            return
        skill = CLASS_SKILLS.get(comp["class_name"], [{}])[0]
        cstats = battle_stats(comp, STATE.battle)
        if skill and skill.get("kind") == "heal" and skill_cost(comp, skill) <= comp["mp"] and random.random() < 0.35:
            comp["mp"] -= skill_cost(comp, skill)
            target = lowest_hp_party_member()
            if target:
                heal = max(8, int(cstats["magic"] * skill["power"]))
                target["hp"] = min(target["max_hp"], target["hp"] + heal)
                STATE.battle["log"].append(f"{comp['name']} 使用 {skill['name']}，替 {target['name']} 回復 {heal} HP。")
        elif skill and skill.get("kind") == "attack" and skill_cost(comp, skill) <= comp["mp"] and random.random() < 0.45:
            comp["mp"] -= skill_cost(comp, skill)
            mstats = monster_stats(monster, STATE.battle)
            defense = mstats["resistance"] if skill.get("scale") == "magic" else mstats["defense"]
            damage = deal_damage(cstats[skill["scale"]], defense, skill["power"], skill.get("element"), monster)
            monster["hp"] -= damage
            STATE.battle["log"].append(f"{comp['name']} 使用 {skill['name']}，造成 {damage} 點傷害。")
        else:
            mstats = monster_stats(monster, STATE.battle)
            damage = max(1, int(cstats["attack"] - mstats["defense"] / 2 + random.randint(0, 4)))
            monster["hp"] -= damage
            STATE.battle["log"].append(f"{comp['name']} 協力攻擊造成 {damage} 點傷害。")


def process_monster_ailments() -> str:
    battle = STATE.battle
    monster = battle["monster"]
    ailments = battle["monster_ailments"]
    if ailments["burn"] > 0:
        damage = max(4, int(monster["max_hp"] * 0.06) + random.randint(1, 4))
        monster["hp"] -= damage
        battle["log"].append(f"{monster['name']} 受到灼燒傷害 {damage} 點。")
        if monster["hp"] <= 0:
            return "defeated"
    if ailments["stun"] > 0:
        battle["log"].append(f"{monster['name']} 仍在暈眩中，行動失敗。")
        return "skip"
    if ailments["freeze"] > 0 and random.random() < 0.55:
        battle["log"].append(f"{monster['name']} 被冰封牽制，無法順利出手。")
        return "skip"
    if ailments["paralyze"] > 0 and random.random() < 0.4:
        battle["log"].append(f"{monster['name']} 因麻痺而動作停滯。")
        return "skip"
    return "act"


def tick_turn_end() -> None:
    battle = STATE.battle
    for key in ["attack", "defense", "magic", "resistance", "speed", "dragon"]:
        if battle["buffs"][key] > 0:
            battle["buffs"][key] -= 1
    battle["buffs"]["evade"] = max(0.0, battle["buffs"]["evade"] - 0.15)
    for key in battle["monster_ailments"]:
        if battle["monster_ailments"][key] > 0:
            battle["monster_ailments"][key] -= 1
    battle["turn"] += 1


def post_player_action(defending: bool = False) -> None:
    player = STATE.player
    battle = STATE.battle
    monster = battle["monster"]
    if monster["hp"] <= 0:
        return finish_battle(True)
    companion_turn()
    if monster["hp"] <= 0:
        return finish_battle(True)
    result = process_monster_ailments()
    if result == "defeated":
        return finish_battle(True)
    if result != "skip":
        targets = living_party()
        if targets:
            target = random.choice(targets)
            tstats = battle_stats(target, battle, is_player=target is player)
            mstats = monster_stats(monster, battle)
            evade = min(0.5, 0.05 + max(0, tstats["speed"] - mstats["speed"]) * 0.01 + battle["buffs"]["evade"])
            if random.random() < evade:
                battle["log"].append(f"{target['name']} 閃過了 {monster['name']} 的攻擊。")
            else:
                damage = max(1, mstats["attack"] - tstats["defense"] // 2 + random.randint(0, 4))
                if defending and target is player:
                    damage = int(damage * 0.65)
                if target is player and player["race_name"] == "矮人" and not battle["dwarf_guard_used"]:
                    damage = int(damage * 0.7)
                    battle["dwarf_guard_used"] = True
                    battle["log"].append("鋼鐵體魄發動，首次重擊傷害被削減。")
                target["hp"] = max(0, target["hp"] - damage)
                battle["log"].append(f"{monster['name']} 對 {target['name']} 使用 {monster['note']}，造成 {damage} 點傷害。")
    if player["hp"] <= 0 and not alive_companions():
        return finish_battle(False)
    tick_turn_end()
    sync_companions_back()
    STATE.save_current()
    render_battle()


def finish_battle(victory: bool) -> None:
    player = STATE.player
    battle = STATE.battle
    monster = battle["monster"]
    if victory:
        player["exp"] += monster["exp"]
        player["gold"] += monster["gold"]
        battle["log"].append(f"獲勝，獲得 EXP {monster['exp']} / 金幣 {monster['gold']}。")
        while player["exp"] >= next_level_exp(player["level"]):
            player["exp"] -= next_level_exp(player["level"])
            player["level"] += 1
            player["class_level"] = min(100, player["class_level"] + 1)
            class_growth_up(player, player["class_name"])
            for comp in player["companions"]:
                comp["level"] += 1
                comp["class_level"] = min(100, comp["class_level"] + 1)
                class_growth_up(comp, comp["class_name"])
            battle["log"].append(f"升級至 Lv.{player['level']}。")
    else:
        player["hp"] = max(1, player["max_hp"] // 4)
        player["mp"] = max(0, player["max_mp"] // 4)
        battle["log"].append("全隊倒下，戰鬥失敗。")
    sync_companions_back()
    STATE.save_current()
    render_battle()


def sync_companions_back() -> None:
    if STATE.battle:
        STATE.player["companions"] = STATE.battle["companions"]


dpg.create_context()
dpg.create_viewport(title="艾斯雷恩桌面版 MMORPG", width=1180, height=780)
with dpg.window(label="main", tag="main_window", width=1160, height=740, no_close=True, no_resize=True):
    with dpg.group(horizontal=True):
        with dpg.child_window(width=240, height=700):
            dpg.add_text("桌面版選單")
            dpg.add_separator()
            dpg.add_button(label="標題頁", callback=render_home)
            dpg.add_button(label="建立角色", callback=render_create)
            dpg.add_button(label="讀取角色", callback=render_load)
            dpg.add_separator()
            dpg.add_text("", tag="status_text", wrap=220)
        with dpg.child_window(tag="content", width=890, height=700):
            pass
render_home()
dpg.setup_dearpygui()
dpg.show_viewport()
dpg.set_primary_window("main_window", True)
dpg.start_dearpygui()
dpg.destroy_context()
