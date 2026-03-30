from __future__ import annotations

BASE_STATS = {
    "max_hp": 100,
    "max_mp": 50,
    "attack": 10,
    "defense": 10,
    "magic": 10,
    "resistance": 10,
    "speed": 10,
    "luck": 10,
}

ELEMENT_ADVANTAGE = {
    "地": {"水"},
    "水": {"火"},
    "火": {"風"},
    "風": {"地"},
    "雷": {"地", "水", "火", "風"},
    "日": {"月"},
    "月": {"日"},
}

RACES = [
    {"code": "human", "name": "人族", "description": "平衡泛用，適合初次冒險者。", "bonuses": {"max_hp": 10, "max_mp": 10, "attack": 2, "defense": 2, "magic": 2, "resistance": 2, "speed": 2, "luck": 2}, "skill_name": "適應力", "skill_type": "被動", "skill_description": "戰鬥前 3 回合全能力小幅提升。"},
    {"code": "elf", "name": "精靈", "description": "高魔法與高速度的法術種族。", "bonuses": {"max_mp": 25, "magic": 6, "speed": 5, "resistance": 3, "max_hp": -10, "defense": -2}, "skill_name": "自然共鳴", "skill_type": "被動", "skill_description": "施放法術後有機率回復少量 MP。"},
    {"code": "orc", "name": "獸人", "description": "高生命與高物攻，適合正面壓制。", "bonuses": {"max_hp": 30, "attack": 7, "defense": 3, "speed": -2, "magic": -4}, "skill_name": "狂戰之血", "skill_type": "被動", "skill_description": "HP 低於 40% 時攻擊力提升。"},
    {"code": "dwarf", "name": "矮人", "description": "高防禦與高抵抗的穩健防線。", "bonuses": {"max_hp": 20, "defense": 7, "resistance": 5, "speed": -3, "luck": 1}, "skill_name": "鋼鐵體魄", "skill_type": "被動", "skill_description": "每場戰鬥第一次受重擊時減傷。"},
    {"code": "draconid", "name": "龍人", "description": "攻魔雙修，後期爆發出色。", "bonuses": {"max_hp": 15, "max_mp": 15, "attack": 5, "magic": 5, "resistance": 2}, "skill_name": "龍血覺醒", "skill_type": "主動", "skill_description": "消耗 MP 強化 3 回合攻擊力與魔法力。"},
    {"code": "celestial", "name": "天翼族", "description": "高速敏捷，且對天法具有優勢。", "bonuses": {"max_mp": 15, "speed": 8, "resistance": 3, "luck": 3, "defense": -2}, "skill_name": "空域步法", "skill_type": "主動", "skill_description": "提高閃避率並取得先手優勢。"},
    {"code": "vampire", "name": "吸血族", "description": "持久作戰與吸血續航優秀。", "bonuses": {"max_hp": 10, "max_mp": 20, "magic": 4, "speed": 3, "luck": 2, "resistance": -2}, "skill_name": "鮮血汲取", "skill_type": "被動", "skill_description": "造成傷害時吸收部分生命。"},
]

CLASSES = [
    {"code": "warrior", "name": "戰士", "description": "高生存近戰，擅長承受傷害。", "bonuses": {"max_hp": 20, "attack": 5, "defense": 5, "resistance": 2, "speed": -1}, "branches": ["守護系", "斬擊系", "反擊系"]},
    {"code": "martial", "name": "武鬥家", "description": "高速連擊與單體爆發。", "bonuses": {"max_hp": 10, "max_mp": 5, "attack": 4, "defense": 1, "resistance": 1, "speed": 5, "luck": 1}, "branches": ["拳擊系", "氣功系", "連段系"]},
    {"code": "mage", "name": "魔法師", "description": "火焰、寒冰、大地三系法術專家。", "bonuses": {"max_hp": -5, "max_mp": 30, "defense": -2, "magic": 8, "resistance": 3, "speed": 1}, "branches": ["火焰系", "寒冰系", "大地系"]},
    {"code": "monk", "name": "僧侶", "description": "恢復、祈禱、聖護與天法專精。", "bonuses": {"max_hp": 5, "max_mp": 25, "defense": 1, "magic": 5, "resistance": 6, "luck": 1}, "branches": ["天法系", "祈禱系", "聖護系"]},
    {"code": "traveler", "name": "旅行者", "description": "平均泛用，兼具探索與輔助。", "bonuses": {"max_hp": 5, "max_mp": 10, "attack": 2, "defense": 2, "magic": 2, "resistance": 2, "speed": 2, "luck": 2}, "branches": ["求生系", "輔助系", "探索系"]},
    {"code": "rogue", "name": "盜賊", "description": "高速暴擊與雙匕首靈活戰鬥。", "bonuses": {"max_mp": 5, "attack": 3, "resistance": 1, "speed": 7, "luck": 4}, "branches": ["暗殺系", "影步系", "詭計系"]},
]

EQUIPMENT = [
    {"code": "bronze_sword", "name": "青銅劍", "slot": "主手武器", "rarity": "普通", "element": None, "bonuses": {"attack": 4}, "allowed_classes": ["戰士", "旅行者"]},
    {"code": "oak_staff", "name": "橡木長杖", "slot": "主手武器", "rarity": "普通", "element": "火", "bonuses": {"magic": 5, "max_mp": 10}, "allowed_classes": ["魔法師"]},
    {"code": "prayer_rod", "name": "祈禱短杖", "slot": "主手武器", "rarity": "普通", "element": "日", "bonuses": {"magic": 3, "resistance": 2, "max_mp": 8}, "allowed_classes": ["僧侶", "旅行者"]},
    {"code": "initiate_mace", "name": "修道鎚", "slot": "主手武器", "rarity": "普通", "element": "日", "bonuses": {"attack": 3, "resistance": 2}, "allowed_classes": ["僧侶"]},
    {"code": "wind_dagger", "name": "疾風匕首", "slot": "主手武器", "rarity": "普通", "element": "風", "bonuses": {"attack": 3, "speed": 3, "luck": 1}, "allowed_classes": ["盜賊"]},
    {"code": "shadow_dagger", "name": "影襲副匕", "slot": "副手", "rarity": "普通", "element": "月", "bonuses": {"attack": 2, "speed": 2}, "allowed_classes": ["盜賊"]},
    {"code": "traveler_cloak", "name": "旅者披風", "slot": "身體", "rarity": "普通", "element": None, "bonuses": {"defense": 2, "resistance": 1}, "allowed_classes": ["旅行者", "盜賊"]},
    {"code": "iron_helm", "name": "鐵盔", "slot": "頭", "rarity": "普通", "element": None, "bonuses": {"defense": 2}, "allowed_classes": ["戰士", "僧侶"]},
    {"code": "leather_boots", "name": "輕皮靴", "slot": "腳", "rarity": "普通", "element": None, "bonuses": {"speed": 2}, "allowed_classes": ["武鬥家", "盜賊", "旅行者"]},
]

MONSTERS = [
    {"code": "slime", "name": "草原史萊姆", "category": "normal", "level": 1, "element_primary": "水", "element_secondary": None, "hp": 55, "mp": 10, "attack": 8, "defense": 5, "magic": 6, "resistance": 6, "speed": 7, "luck": 4, "exp_reward": 20, "gold_reward": 8, "skill_note": "黏液衝擊"},
    {"code": "wolf", "name": "狂牙野狼", "category": "normal", "level": 2, "element_primary": "風", "element_secondary": None, "hp": 70, "mp": 10, "attack": 12, "defense": 7, "magic": 4, "resistance": 5, "speed": 12, "luck": 5, "exp_reward": 28, "gold_reward": 12, "skill_note": "撕裂撲擊"},
    {"code": "scarecrow", "name": "失控稻草人", "category": "normal", "level": 2, "element_primary": "地", "element_secondary": None, "hp": 80, "mp": 5, "attack": 11, "defense": 9, "magic": 3, "resistance": 6, "speed": 6, "luck": 3, "exp_reward": 30, "gold_reward": 14, "skill_note": "纏草束縛"},
    {"code": "mine_beast", "name": "礦坑吞岩獸", "category": "dungeon", "level": 4, "element_primary": "地", "element_secondary": None, "hp": 140, "mp": 15, "attack": 18, "defense": 14, "magic": 6, "resistance": 10, "speed": 8, "luck": 4, "exp_reward": 75, "gold_reward": 40, "skill_note": "碎岩重踏"},
    {"code": "moon_king", "name": "月咒妖精王", "category": "dungeon", "level": 7, "element_primary": "月", "element_secondary": "風", "hp": 190, "mp": 45, "attack": 20, "defense": 13, "magic": 24, "resistance": 18, "speed": 18, "luck": 10, "exp_reward": 120, "gold_reward": 65, "skill_note": "月影詛咒"},
    {"code": "wolf_king", "name": "裂口巨狼王", "category": "story", "level": 3, "element_primary": "風", "element_secondary": None, "hp": 120, "mp": 10, "attack": 17, "defense": 10, "magic": 4, "resistance": 8, "speed": 16, "luck": 6, "exp_reward": 60, "gold_reward": 35, "skill_note": "狂亂咬殺", "story_order": 1},
    {"code": "tree_spirit", "name": "腐化樹靈", "category": "story", "level": 5, "element_primary": "地", "element_secondary": "月", "hp": 165, "mp": 25, "attack": 16, "defense": 16, "magic": 18, "resistance": 15, "speed": 9, "luck": 5, "exp_reward": 95, "gold_reward": 55, "skill_note": "腐根纏縛", "story_order": 2},
]

STARTING_EQUIPMENT = {
    "戰士": ["bronze_sword", "iron_helm"],
    "武鬥家": ["leather_boots"],
    "魔法師": ["oak_staff"],
    "僧侶": ["prayer_rod", "iron_helm"],
    "旅行者": ["bronze_sword", "traveler_cloak"],
    "盜賊": ["wind_dagger", "shadow_dagger", "traveler_cloak", "leather_boots"],
}

CLASS_SKILLS = {
    "戰士": [{"name": "重斬", "cost": 8, "power": 1.75, "kind": "attack", "stat": "attack", "element": None, "note": "厚重的一擊。"}, {"name": "防禦姿態", "cost": 6, "power": 0, "kind": "buff_defense", "stat": "defense", "element": None, "note": "提升防禦 3 回合。"}],
    "武鬥家": [{"name": "三連擊", "cost": 9, "power": 1.55, "kind": "attack", "stat": "attack", "element": "風", "note": "高速連續攻擊。"}, {"name": "聚氣", "cost": 6, "power": 0, "kind": "buff_attack", "stat": "attack", "element": None, "note": "提升攻擊 3 回合。"}],
    "魔法師": [{"name": "火球術", "cost": 10, "power": 1.8, "kind": "attack", "stat": "magic", "element": "火", "note": "火焰屬性攻擊。"}, {"name": "石槍術", "cost": 10, "power": 1.8, "kind": "attack", "stat": "magic", "element": "地", "note": "大地屬性攻擊。"}],
    "僧侶": [{"name": "治癒術", "cost": 10, "power": 1.6, "kind": "heal", "stat": "magic", "element": "日", "note": "基礎天法回復。"}, {"name": "聖盾", "cost": 8, "power": 0, "kind": "buff_resistance", "stat": "resistance", "element": "日", "note": "提升抵抗 3 回合。"}],
    "旅行者": [{"name": "急救", "cost": 8, "power": 1.2, "kind": "heal", "stat": "magic", "element": "日", "note": "緊急包紮回復。"}, {"name": "鼓舞", "cost": 6, "power": 0, "kind": "buff_attack", "stat": "attack", "element": None, "note": "提升攻擊與士氣。"}],
    "盜賊": [{"name": "背刺", "cost": 8, "power": 1.7, "kind": "attack", "stat": "attack", "element": "月", "note": "高暴擊率先手技能。"}, {"name": "煙幕", "cost": 6, "power": 0, "kind": "evade", "stat": "speed", "element": None, "note": "短時間大幅提升閃避。"}],
}

BRANCH_EFFECTS = {
    "守護系": ("defense", 2),
    "斬擊系": ("attack", 2),
    "反擊系": ("luck", 1),
    "拳擊系": ("attack", 2),
    "氣功系": ("magic", 2),
    "連段系": ("speed", 2),
    "火焰系": ("magic", 2),
    "寒冰系": ("resistance", 2),
    "大地系": ("defense", 2),
    "天法系": ("magic", 2),
    "祈禱系": ("max_mp", 5),
    "聖護系": ("resistance", 2),
    "求生系": ("max_hp", 5),
    "輔助系": ("resistance", 1),
    "探索系": ("luck", 2),
    "暗殺系": ("attack", 2),
    "影步系": ("speed", 2),
    "詭計系": ("luck", 2),
}
