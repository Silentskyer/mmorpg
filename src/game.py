from __future__ import annotations

import json
import math
import random
from typing import Any

from . import db
from .game_data import BASE_STATS, BRANCH_EFFECTS, CLASS_SKILLS, ELEMENT_ADVANTAGE


def _input_number(prompt: str, min_value: int, max_value: int) -> int:
    while True:
        choice = input(prompt).strip()
        if choice.isdigit():
            value = int(choice)
            if min_value <= value <= max_value:
                return value
        print("輸入無效，請重新選擇。")


class Game:
    def __init__(self) -> None:
        db.init_db()

    def run(self) -> None:
        while True:
            print("\n=== 艾斯雷恩：單機文字 MMORPG ===")
            print("1. 建立新角色")
            print("2. 讀取角色")
            print("3. 離開")
            choice = _input_number("請選擇：", 1, 3)
            if choice == 1:
                self.game_loop(self.create_character())
            elif choice == 2:
                player = self.load_character()
                if player:
                    self.game_loop(player)
            else:
                print("感謝遊玩。")
                return

    def create_character(self) -> dict[str, Any]:
        races = db.list_races()
        classes = db.list_classes()
        print("\n=== 建立角色 ===")
        name = ""
        while not name:
            name = input("輸入角色名字：").strip()
        print("\n選擇種族：")
        for index, race in enumerate(races, start=1):
            bonuses = json.loads(race["bonuses_json"])
            print(f"{index}. {race['name']} - {race['description']} | 加成: {self._format_bonuses(bonuses)}")
        race_choice = races[_input_number("種族編號：", 1, len(races)) - 1]
        print("\n選擇職業：")
        for index, cls in enumerate(classes, start=1):
            bonuses = json.loads(cls["bonuses_json"])
            print(f"{index}. {cls['name']} - {cls['description']} | 補正: {self._format_bonuses(bonuses)}")
        class_choice = classes[_input_number("職業編號：", 1, len(classes)) - 1]
        player = self._build_player(name, race_choice, class_choice)
        player_id = db.create_player(player, json.loads(class_choice["branches_json"]))
        loaded = db.load_player(player_id)
        print(f"\n角色 {name} 已建立完成。")
        return loaded

    def load_character(self) -> dict[str, Any] | None:
        players = db.list_players()
        if not players:
            print("\n目前沒有存檔角色。")
            return None
        print("\n=== 讀取角色 ===")
        for index, player in enumerate(players, start=1):
            print(f"{index}. {player['name']} | {player['race_name']} {player['class_name']} | Lv.{player['level']} / 職業 Lv.{player['class_level']}")
        pick = _input_number("選擇角色：", 1, len(players))
        return db.load_player(players[pick - 1]["id"])

    def game_loop(self, player: dict[str, Any]) -> None:
        while True:
            self._refresh_resources(player)
            print(f"\n=== {player['name']} 的冒險 ===")
            print("1. 查看狀態")
            print("2. 查看技能樹")
            print("3. 培養技能")
            print("4. 野外探索")
            print("5. 挑戰副本")
            print("6. 推進主線")
            print("7. 休息恢復")
            print("8. 存檔並返回主選單")
            choice = _input_number("請選擇：", 1, 8)
            if choice == 1:
                self.show_status(player)
            elif choice == 2:
                self.show_skill_tree(player)
            elif choice == 3:
                self.upgrade_branch(player)
            elif choice == 4:
                monster = db.fetch_random_monster("normal")
                if monster:
                    self.battle(player, monster, "野外")
            elif choice == 5:
                monster = db.fetch_random_monster("dungeon")
                if monster and self.battle(player, monster, "副本"):
                    player["dungeon_clears"] += 1
            elif choice == 6:
                monster = db.fetch_random_monster("story", player["story_stage"])
                if monster is None:
                    print("主線內容已暫時完成，後續章節待擴充。")
                elif self.battle(player, monster, "主線"):
                    player["story_stage"] += 1
            elif choice == 7:
                stats = self._effective_stats(player)
                player["hp"] = stats["max_hp"]
                player["mp"] = stats["max_mp"]
                print("你在營地休息完畢，HP / MP 已完全恢復。")
            else:
                db.save_player(player)
                print("進度已儲存。")
                return

    def show_status(self, player: dict[str, Any]) -> None:
        stats = self._effective_stats(player)
        print("\n=== 角色狀態 ===")
        print(f"名字：{player['name']}")
        print(f"種族 / 職業：{player['race_name']} / {player['class_name']}")
        print(f"等級：{player['level']} | 職業等級：{player['class_level']} | EXP：{player['exp']}")
        print(f"HP：{player['hp']}/{stats['max_hp']} | MP：{player['mp']}/{stats['max_mp']} | 技能點：{player['skill_points']} | 金幣：{player['gold']}")
        print(f"攻擊：{stats['attack']} 防禦：{stats['defense']} 魔法：{stats['magic']} 抵抗：{stats['resistance']} 速度：{stats['speed']} 運氣：{stats['luck']}")
        print(f"種族技能：{player['skill_name']}（{player['skill_type']}）- {player['skill_description']}")
        print("裝備：")
        for item in sorted(player["equipment"], key=lambda x: x["slot"]):
            element = f" [{item['element']}]" if item["element"] else ""
            print(f"- {item['slot']}：{item['name']}{element}")

    def show_skill_tree(self, player: dict[str, Any]) -> None:
        print("\n=== 技能樹 ===")
        for branch in player["branches"]:
            effect_stat, effect_value = BRANCH_EFFECTS.get(branch["name"], ("attack", 1))
            print(f"- {branch['name']} Lv.{branch['level']} | 每級加成：{effect_stat} +{effect_value}")
        print("\n目前可用技能：")
        for skill in CLASS_SKILLS[player["class_name"]]:
            element = skill["element"] or "無"
            print(f"- {skill['name']} | 消耗 MP {skill['cost']} | 屬性 {element} | {skill['note']}")

    def upgrade_branch(self, player: dict[str, Any]) -> None:
        if player["skill_points"] <= 0:
            print("目前沒有技能點。")
            return
        print("\n=== 培養技能樹 ===")
        for index, branch in enumerate(player["branches"], start=1):
            print(f"{index}. {branch['name']} Lv.{branch['level']}")
        print("0. 返回")
        pick = input("選擇要提升的分支：").strip()
        if pick == "0":
            return
        if not pick.isdigit():
            print("輸入無效。")
            return
        index = int(pick)
        if not (1 <= index <= len(player["branches"])):
            print("輸入無效。")
            return
        branch = player["branches"][index - 1]
        branch["level"] += 1
        player["skill_points"] -= 1
        effect_stat, effect_value = BRANCH_EFFECTS.get(branch["name"], ("attack", 1))
        if effect_stat in player:
            player[effect_stat] += effect_value
        elif effect_stat == "max_hp":
            player["max_hp"] += effect_value
            player["hp"] = min(player["hp"] + effect_value, player["max_hp"])
        elif effect_stat == "max_mp":
            player["max_mp"] += effect_value
            player["mp"] = min(player["mp"] + effect_value, player["max_mp"])
        print(f"{branch['name']} 提升至 Lv.{branch['level']}。")

    def battle(self, player: dict[str, Any], monster: dict[str, Any], battle_type: str) -> bool:
        print(f"\n=== {battle_type}戰鬥：{monster['name']} ===")
        state = {"turn": 1, "player_buffs": {"attack": 0, "defense": 0, "resistance": 0, "evade": 0.0, "dragon": 0}, "monster_hp": monster["hp"], "dwarf_guard_used": False}
        while player["hp"] > 0 and state["monster_hp"] > 0:
            pstats = self._battle_stats(player, state)
            print(f"\n回合 {state['turn']}")
            print(f"{player['name']} HP {player['hp']}/{pstats['max_hp']} MP {player['mp']}/{pstats['max_mp']}")
            print(f"{monster['name']} HP {state['monster_hp']}/{monster['hp']} | 屬性 {monster['element_primary']}")
            print("1. 普通攻擊  2. 使用職業技能  3. 使用種族技能  4. 防禦  5. 查看狀態  6. 逃跑")
            choice = _input_number("行動：", 1, 6)
            if choice == 5:
                self.show_status(player)
                continue
            if choice == 6 and battle_type == "野外" and random.random() < 0.65:
                print("你成功撤退。")
                return False
            monster_first = monster["speed"] > pstats["speed"] + random.randint(-2, 2)
            defend = choice == 4
            if monster_first:
                if self._monster_turn(player, monster, state, defend):
                    return False
                self._player_turn(choice, player, monster, state)
            else:
                self._player_turn(choice, player, monster, state)
                if state["monster_hp"] <= 0:
                    break
                if self._monster_turn(player, monster, state, defend):
                    return False
            self._tick_buffs(state)
            state["turn"] += 1
        if player["hp"] <= 0:
            print("你倒下了，這場戰鬥失敗。")
            player["hp"] = max(1, player["max_hp"] // 4)
            player["mp"] = max(0, player["max_mp"] // 4)
            return False
        print(f"你擊敗了 {monster['name']}！")
        self._grant_rewards(player, monster)
        return True

    def _player_turn(self, choice: int, player: dict[str, Any], monster: dict[str, Any], state: dict[str, Any]) -> None:
        if choice == 1:
            self._normal_attack(player, monster, state)
        elif choice == 2:
            self._use_class_skill(player, monster, state)
        elif choice == 3:
            self._use_race_skill(player, monster, state)
        elif choice == 4:
            print("你進入防禦姿態，準備承受攻擊。")

    def _monster_turn(self, player: dict[str, Any], monster: dict[str, Any], state: dict[str, Any], defend: bool) -> bool:
        pstats = self._battle_stats(player, state)
        evade_rate = min(0.35, 0.05 + max(0, pstats["speed"] - monster["speed"]) * 0.01 + state["player_buffs"]["evade"])
        if random.random() < evade_rate:
            print(f"{player['name']} 閃過了 {monster['name']} 的攻擊。")
            return False
        raw = max(1, monster["attack"] - pstats["defense"] // 2 + random.randint(0, 4))
        if defend:
            raw = math.floor(raw * 0.65)
        if player["race_name"] == "矮人" and not state["dwarf_guard_used"]:
            raw = math.floor(raw * 0.7)
            state["dwarf_guard_used"] = True
            print("鋼鐵體魄發動，首次重擊傷害被削減。")
        player["hp"] = max(0, player["hp"] - raw)
        print(f"{monster['name']} 使用 {monster['skill_note']}，造成 {raw} 點傷害。")
        return player["hp"] <= 0

    def _normal_attack(self, player: dict[str, Any], monster: dict[str, Any], state: dict[str, Any]) -> None:
        pstats = self._battle_stats(player, state)
        weapon = self._weapon_for_attack(player)
        element = weapon["element"] if weapon else None
        damage = self._deal_damage(
            source_name=player["name"],
            target_name=monster["name"],
            attack_value=pstats["attack"],
            defense_value=monster["defense"],
            power=1.0 + self._dual_wield_bonus(player),
            element=element,
            monster=monster,
        )
        state["monster_hp"] = max(0, state["monster_hp"] - damage)
        self._apply_lifesteal(player, damage)

    def _use_class_skill(self, player: dict[str, Any], monster: dict[str, Any], state: dict[str, Any]) -> None:
        skills = CLASS_SKILLS[player["class_name"]]
        print("\n選擇技能：")
        for index, skill in enumerate(skills, start=1):
            print(f"{index}. {skill['name']} | MP {skill['cost']} | {skill['note']}")
        pick = _input_number("技能編號：", 1, len(skills))
        skill = skills[pick - 1]
        real_cost = self._skill_cost(player, skill)
        if player["mp"] < real_cost:
            print("MP 不足。")
            return
        player["mp"] -= real_cost
        pstats = self._battle_stats(player, state)
        if skill["kind"] == "attack":
            attack_value = pstats[skill["stat"]]
            damage = self._deal_damage(
                source_name=player["name"],
                target_name=monster["name"],
                attack_value=attack_value,
                defense_value=monster["resistance"] if skill["stat"] == "magic" else monster["defense"],
                power=skill["power"],
                element=skill["element"],
                monster=monster,
            )
            state["monster_hp"] = max(0, state["monster_hp"] - damage)
            self._apply_lifesteal(player, damage)
        elif skill["kind"] == "heal":
            heal = int(pstats["magic"] * skill["power"] + random.randint(4, 10))
            if player["race_name"] == "天翼族":
                heal = math.floor(heal * 1.2)
            player["hp"] = min(pstats["max_hp"], player["hp"] + heal)
            print(f"{player['name']} 施放 {skill['name']}，回復 {heal} HP。")
        elif skill["kind"] == "buff_attack":
            state["player_buffs"]["attack"] = 3
            print(f"{player['name']} 施放 {skill['name']}，攻擊提升 3 回合。")
        elif skill["kind"] == "buff_defense":
            state["player_buffs"]["defense"] = 3
            print(f"{player['name']} 施放 {skill['name']}，防禦提升 3 回合。")
        elif skill["kind"] == "buff_resistance":
            state["player_buffs"]["resistance"] = 3
            print(f"{player['name']} 施放 {skill['name']}，抵抗提升 3 回合。")
        elif skill["kind"] == "evade":
            state["player_buffs"]["evade"] = 0.2
            print(f"{player['name']} 施放 {skill['name']}，閃避率大幅提高。")
        if player["race_name"] == "精靈" and skill["stat"] == "magic" and random.random() < 0.35:
            player["mp"] = min(pstats["max_mp"], player["mp"] + 5)
            print("自然共鳴發動，回復 5 MP。")

    def _use_race_skill(self, player: dict[str, Any], monster: dict[str, Any], state: dict[str, Any]) -> None:
        race = player["race_name"]
        if race == "龍人":
            if player["mp"] < 15:
                print("MP 不足。")
                return
            player["mp"] -= 15
            state["player_buffs"]["dragon"] = 3
            print("龍血覺醒發動，攻擊與魔法力提升 3 回合。")
        elif race == "天翼族":
            if player["mp"] < 10:
                print("MP 不足。")
                return
            player["mp"] -= 10
            state["player_buffs"]["evade"] = 0.35
            print("空域步法發動，本回合起閃避率大幅提高。")
        else:
            print("此種族技能為被動，會在戰鬥中自動生效。")

    def _deal_damage(self, source_name: str, target_name: str, attack_value: int, defense_value: int, power: float, element: str | None, monster: dict[str, Any]) -> int:
        base = max(1, int(attack_value * power - defense_value / 2 + random.randint(0, 5)))
        multiplier = self._element_multiplier(element, monster["element_primary"], monster["element_secondary"])
        damage = max(1, int(base * multiplier))
        suffix = f" [{element}]" if element else ""
        print(f"{source_name} 對 {target_name} 造成 {damage} 點傷害{suffix}。")
        return damage

    def _grant_rewards(self, player: dict[str, Any], monster: dict[str, Any]) -> None:
        player["exp"] += monster["exp_reward"]
        player["gold"] += monster["gold_reward"]
        print(f"獲得 EXP {monster['exp_reward']}、金幣 {monster['gold_reward']}。")
        leveled = False
        while player["exp"] >= self._next_level_exp(player["level"]):
            player["exp"] -= self._next_level_exp(player["level"])
            player["level"] += 1
            player["class_level"] += 1
            player["skill_points"] += 1
            player["max_hp"] += 12
            player["max_mp"] += 8
            player["attack"] += 2
            player["defense"] += 2
            player["magic"] += 2
            player["resistance"] += 2
            player["speed"] += 1
            player["luck"] += 1
            player["hp"] = player["max_hp"]
            player["mp"] = player["max_mp"]
            leveled = True
            print(f"升級了，現在是 Lv.{player['level']} / 職業 Lv.{player['class_level']}。")
        if not leveled:
            print(f"距離下次升級尚需 {self._next_level_exp(player['level']) - player['exp']} EXP。")

    def _element_multiplier(self, attack_element: str | None, primary: str | None, secondary: str | None) -> float:
        if not attack_element:
            return 1.0
        targets = {element for element in [primary, secondary] if element}
        if not targets:
            return 1.0
        if any(target in ELEMENT_ADVANTAGE.get(attack_element, set()) for target in targets):
            return 1.25
        if any(attack_element in ELEMENT_ADVANTAGE.get(target, set()) for target in targets):
            return 0.85
        return 1.0

    def _battle_stats(self, player: dict[str, Any], state: dict[str, Any]) -> dict[str, int]:
        stats = self._effective_stats(player)
        if player["race_name"] == "人族" and state["turn"] <= 3:
            for key in ["attack", "defense", "magic", "resistance", "speed", "luck"]:
                stats[key] += 2
        if player["race_name"] == "獸人" and player["hp"] <= stats["max_hp"] * 0.4:
            stats["attack"] += 5
        if state["player_buffs"]["attack"]:
            stats["attack"] += 5
        if state["player_buffs"]["defense"]:
            stats["defense"] += 5
        if state["player_buffs"]["resistance"]:
            stats["resistance"] += 5
        if state["player_buffs"]["dragon"]:
            stats["attack"] += 6
            stats["magic"] += 6
        return stats

    def _effective_stats(self, player: dict[str, Any]) -> dict[str, int]:
        stats = {key: player[key] for key in ["max_hp", "max_mp", "attack", "defense", "magic", "resistance", "speed", "luck"]}
        for item in player["equipment"]:
            for key, value in item["bonuses"].items():
                stats[key] = stats.get(key, 0) + value
        return stats

    def _build_player(self, name: str, race_row: Any, class_row: Any) -> dict[str, Any]:
        stats = dict(BASE_STATS)
        for source in (json.loads(race_row["bonuses_json"]), json.loads(class_row["bonuses_json"])):
            for key, value in source.items():
                stats[key] += value
        return {
            "name": name,
            "race_code": race_row["code"],
            "class_code": class_row["code"],
            "class_name": class_row["name"],
            "level": 1,
            "class_level": 1,
            "exp": 0,
            "skill_points": 1,
            "story_stage": 1,
            "dungeon_clears": 0,
            "hp": stats["max_hp"],
            "max_hp": stats["max_hp"],
            "mp": stats["max_mp"],
            "max_mp": stats["max_mp"],
            "attack": stats["attack"],
            "defense": stats["defense"],
            "magic": stats["magic"],
            "resistance": stats["resistance"],
            "speed": stats["speed"],
            "luck": stats["luck"],
            "gold": 30,
        }

    def _format_bonuses(self, bonuses: dict[str, int]) -> str:
        return ", ".join(f"{key}{value:+d}" for key, value in bonuses.items())

    def _next_level_exp(self, level: int) -> int:
        return 100 + (level - 1) * 40

    def _refresh_resources(self, player: dict[str, Any]) -> None:
        stats = self._effective_stats(player)
        player["hp"] = min(player["hp"], stats["max_hp"])
        player["mp"] = min(player["mp"], stats["max_mp"])

    def _tick_buffs(self, state: dict[str, Any]) -> None:
        for key in ["attack", "defense", "resistance", "dragon"]:
            if state["player_buffs"][key]:
                state["player_buffs"][key] -= 1
        if state["player_buffs"]["evade"]:
            state["player_buffs"]["evade"] = max(0.0, state["player_buffs"]["evade"] - 0.15)

    def _weapon_for_attack(self, player: dict[str, Any]) -> dict[str, Any] | None:
        for item in player["equipment"]:
            if item["slot"] == "主手武器":
                return item
        return None

    def _dual_wield_bonus(self, player: dict[str, Any]) -> float:
        return 0.2 if player["class_name"] == "盜賊" and any(item["slot"] == "副手" for item in player["equipment"]) else 0.0

    def _skill_cost(self, player: dict[str, Any], skill: dict[str, Any]) -> int:
        if player["race_name"] == "天翼族" and skill["kind"] in {"heal", "buff_resistance"} and skill["element"] == "日":
            return max(1, math.floor(skill["cost"] * 0.8))
        return skill["cost"]

    def _apply_lifesteal(self, player: dict[str, Any], damage: int) -> None:
        if player["race_name"] != "吸血族" or damage <= 0:
            return
        heal = max(1, damage // 5)
        player["hp"] = min(self._effective_stats(player)["max_hp"], player["hp"] + heal)
        print(f"鮮血汲取發動，回復 {heal} HP。")
