const app = document.querySelector("#app");
const menu = document.querySelector("#menu");
const heroActions = document.querySelector("#hero-actions");

const baseStats = { maxHp: 100, maxMp: 50, attack: 10, defense: 10, magic: 10, resistance: 10, speed: 10, luck: 10 };

const elementAdvantage = {
  "地": ["水"],
  "水": ["火"],
  "火": ["風"],
  "風": ["地"],
  "雷": ["地", "水", "火", "風"],
  "日": ["月"],
  "月": ["日"],
};

const data = {
  races: [
    { code: "human", name: "人族", description: "平衡泛用，適合初次冒險者。", advantage: "優勢：全方位穩定，前期容易上手。", bonuses: { maxHp: 10, maxMp: 10, attack: 2, defense: 2, magic: 2, resistance: 2, speed: 2, luck: 2 }, skillName: "適應力", skillType: "被動", skillDescription: "戰鬥前 3 回合全能力小幅提升。" },
    { code: "elf", name: "精靈", description: "高魔法與高速度的法術種族。", advantage: "優勢：法術輸出與魔力續航出色。", bonuses: { maxMp: 25, magic: 6, speed: 5, resistance: 3, maxHp: -10, defense: -2 }, skillName: "自然共鳴", skillType: "被動", skillDescription: "施放法術後有機率回復少量 MP。" },
    { code: "orc", name: "獸人", description: "高生命與高物攻，適合正面壓制。", advantage: "優勢：近戰壓制強，殘血時更兇猛。", bonuses: { maxHp: 30, attack: 7, defense: 3, speed: -2, magic: -4 }, skillName: "狂戰之血", skillType: "被動", skillDescription: "HP 低於 40% 時攻擊力提升。" },
    { code: "dwarf", name: "矮人", description: "高防禦與高抵抗的穩健防線。", advantage: "優勢：生存穩定，適合坦型玩法。", bonuses: { maxHp: 20, defense: 7, resistance: 5, speed: -3, luck: 1 }, skillName: "鋼鐵體魄", skillType: "被動", skillDescription: "每場戰鬥第一次受重擊時減傷。" },
    { code: "draconid", name: "龍人", description: "攻魔雙修，後期爆發出色。", advantage: "優勢：攻魔雙修，爆發上限高。", bonuses: { maxHp: 15, maxMp: 15, attack: 5, magic: 5, resistance: 2 }, skillName: "龍血覺醒", skillType: "主動", skillDescription: "消耗 MP 強化 3 回合攻擊力與魔法力。" },
    { code: "celestial", name: "天翼族", description: "高速敏捷，且對天法具有優勢。", advantage: "優勢：速度快，天法表現更佳。", bonuses: { maxMp: 15, speed: 8, resistance: 3, luck: 3, defense: -2 }, skillName: "空域步法", skillType: "主動", skillDescription: "提高閃避率並取得先手優勢。" },
    { code: "vampire", name: "吸血族", description: "持久作戰與吸血續航優秀。", advantage: "優勢：續戰與自我回復能力強。", bonuses: { maxHp: 10, maxMp: 20, magic: 4, speed: 3, luck: 2, resistance: -2 }, skillName: "鮮血汲取", skillType: "被動", skillDescription: "造成傷害時吸收部分生命。" },
  ],
  classes: [
    { code: "warrior", name: "戰士", armorType: "重型裝甲", description: "高生存近戰，擅長承受傷害。", advantage: "優勢：穩定扛傷，適合正面作戰。", bonuses: { maxHp: 20, attack: 5, defense: 5, resistance: 2, speed: -1 }, branches: ["守護系", "斬擊系", "反擊系"] },
    { code: "martial", name: "武鬥家", armorType: "輕型裝甲", description: "高速連擊與單體爆發。", advantage: "優勢：手感俐落，單體連打很強。", bonuses: { maxHp: 10, maxMp: 5, attack: 4, defense: 1, resistance: 1, speed: 5, luck: 1 }, branches: ["拳擊系", "氣功系", "連段系"] },
    { code: "mage", name: "魔法師", armorType: "魔法裝甲", description: "操控火焰、冰水與增幅魔法的法術專家。", advantage: "優勢：元素輸出穩定，還能用增幅法術強化節奏。", bonuses: { maxHp: -5, maxMp: 30, defense: -2, magic: 8, resistance: 3, speed: 1 }, branches: ["火焰系", "冰水系", "增幅系"] },
    { code: "monk", name: "僧侶", armorType: "輕型裝甲", description: "恢復、祈禱與增幅的支援核心。", advantage: "優勢：恢復與淨化能力最穩定。", bonuses: { maxHp: 5, maxMp: 25, defense: 1, magic: 5, resistance: 6, luck: 1 }, branches: ["天法系", "增幅系", "聖護系"] },
    { code: "traveler", name: "旅行者", armorType: "一般裝甲", description: "平均泛用，兼具求生、斬擊與狂風技巧。", advantage: "優勢：生存彈性高，也能兼顧近戰與風屬性輸出。", bonuses: { maxHp: 5, maxMp: 10, attack: 2, defense: 2, magic: 2, resistance: 2, speed: 2, luck: 2 }, branches: ["求生系", "斬擊系", "狂風系"] },
    { code: "rogue", name: "盜賊", armorType: "輕型裝甲", description: "高速暴擊與異常控制的靈活刺客。", advantage: "優勢：狀態妨害多，能靠影步與詭計掌控節奏。", bonuses: { maxMp: 5, attack: 3, resistance: 1, speed: 7, luck: 4 }, branches: ["異常系", "影步系", "詭計系"] },
  ],
  branchEffects: {
    "守護系": ["defense", 2], "斬擊系": ["attack", 2], "反擊系": ["luck", 1],
    "拳擊系": ["attack", 2], "氣功系": ["magic", 2], "連段系": ["speed", 2],
    "火焰系": ["magic", 2], "冰水系": ["resistance", 2], "天法系": ["magic", 2], "增幅系": ["maxMp", 5], "聖護系": ["resistance", 2],
    "求生系": ["maxHp", 5], "斬擊系": ["attack", 2], "狂風系": ["speed", 2],
    "異常系": ["luck", 2], "影步系": ["speed", 2], "詭計系": ["luck", 2],
  },
  classSkills: {
    "戰士": [
      { name: "護盾", cost: 5, power: 0, kind: "guardShield", stat: "defense", element: null },
      { name: "防禦姿態", cost: 6, power: 0, kind: "buffDefense", stat: "defense", element: null },
      { name: "群體嘲諷", cost: 8, power: 0, kind: "taunt", stat: "defense", element: null },
      { name: "重斬", cost: 8, power: 1.75, kind: "attack", stat: "attack", element: null },
      { name: "火焰斬", cost: 10, power: 1.9, kind: "attackBurn", stat: "attack", element: "火", chance: 0.3, duration: 2 },
      { name: "旋風斬", cost: 12, power: 1.85, kind: "attack", stat: "attack", element: "風" },
      { name: "隼斬", cost: 14, power: 0.95, kind: "multiHit", stat: "attack", hits: 2, element: null },
      { name: "格擋反擊", cost: 8, power: 0, kind: "counterStance", stat: "defense", element: null },
      { name: "戰意回復", cost: 10, power: 0.2, kind: "healPercent", stat: "attack", element: null },
      { name: "決死反攻", cost: 0, power: 0, kind: "passiveDesperation", stat: "attack", element: null }
    ],
    "武鬥家": [
      { name: "直拳", cost: 6, power: 1.45, kind: "attack", stat: "attack", element: null },
      { name: "碎骨拳", cost: 9, power: 1.65, kind: "attackDebuffDefense", stat: "attack", element: null, duration: 3 },
      { name: "貫突", cost: 10, power: 1.5, kind: "attackIgnoreDefense", stat: "attack", element: null },
      { name: "聚氣", cost: 6, power: 0, kind: "chargeUp", stat: "attack", element: null },
      { name: "氣彈", cost: 10, power: 1.7, kind: "chiBlast", stat: "attack", element: null },
      { name: "真氣爆發", cost: 0, power: 0, kind: "passiveChiOnHit", stat: "attack", element: null },
      { name: "三連擊", cost: 9, power: 0.68, kind: "multiHit", stat: "attack", hits: 3, element: null },
      { name: "追打", cost: 11, power: 0.72, kind: "multiHit", stat: "attack", hits: 3, element: null },
      { name: "極限連舞", cost: 16, power: 0.62, kind: "multiHit", stat: "attack", hits: 5, element: null }
    ],
    "魔法師": [
      { name: "水槍", cost: 8, power: 1.45, kind: "attack", stat: "magic", element: "水" },
      { name: "酸雨", cost: 10, power: 1.55, kind: "attackPoison", stat: "magic", element: "水", chance: 0.2, duration: 3 },
      { name: "吹雪", cost: 12, power: 1.7, kind: "attackFreeze", stat: "magic", element: "水", chance: 0.35, duration: 2 },
      { name: "暴風雪", cost: 14, power: 2.0, kind: "attackFreeze", stat: "magic", element: "水", chance: 0.45, duration: 2 },
      { name: "霜天葬送", cost: 22, power: 2.85, kind: "attackFreeze", stat: "magic", element: "水", chance: 0.65, duration: 3 },
      { name: "火球", cost: 10, power: 1.8, kind: "attackBurn", stat: "magic", element: "火", chance: 0.2, duration: 2 },
      { name: "豪火柱", cost: 12, power: 1.95, kind: "attackBurn", stat: "magic", element: "火", chance: 0.2, duration: 2 },
      { name: "火焰之槍", cost: 14, power: 2.05, kind: "attackBurn", stat: "magic", element: "火", chance: 0.2, duration: 2 },
      { name: "焦土", cost: 14, power: 2.1, kind: "attackBurn", stat: "magic", element: "火", chance: 0.6, duration: 3 },
      { name: "焚天神兵", cost: 24, power: 3.0, kind: "attackBurn", stat: "magic", element: "火", chance: 0.8, duration: 4 },
      { name: "魔法強化", cost: 10, power: 0, kind: "buffMagicResistance", stat: "magic", element: null },
      { name: "疾走", cost: 8, power: 0, kind: "buffSpeedParty", stat: "magic", element: null },
      { name: "魔力聚流", cost: 10, power: 0, kind: "buffMagic", stat: "magic", element: null }
    ],
    "僧侶": [
      { name: "治療", cost: 8, power: 1.3, kind: "heal", stat: "magic", element: "日", school: "天法" },
      { name: "祝福", cost: 6, power: 0, kind: "cleanse", stat: "magic", element: "日", school: "天法" },
      { name: "大治療", cost: 14, power: 2.0, kind: "heal", stat: "magic", element: "日", school: "天法" },
      { name: "完全淨化", cost: 14, power: 0, kind: "cleanseAll", stat: "magic", element: "日", school: "天法" },
      { name: "祝聖", cost: 12, power: 0, kind: "buffAttackParty", stat: "magic", element: "日", school: "天法" },
      { name: "群體治療", cost: 18, power: 1.4, kind: "healAll", stat: "magic", element: "日", school: "天法" },
      { name: "完全治療", cost: 20, power: 0, kind: "fullHealSingle", stat: "magic", element: "日", school: "天法" },
      { name: "奇蹟", cost: 24, power: 0, kind: "reviveOne", stat: "magic", element: "日", school: "天法" },
      { name: "物理強化", cost: 10, power: 0, kind: "buffAttackDefenseSingle", stat: "magic", element: null, school: "增幅" },
      { name: "魔法強化", cost: 10, power: 0, kind: "buffMagicResistanceSingle", stat: "magic", element: null, school: "增幅" },
      { name: "疾走", cost: 8, power: 0, kind: "buffSpeedSingle", stat: "magic", element: null, school: "增幅" },
      { name: "聖盾", cost: 10, power: 0, kind: "buffResistanceSingle", stat: "magic", element: "日", school: "聖護" },
      { name: "祈禱戰歌", cost: 12, power: 0, kind: "buffAttackSingleStrong", stat: "magic", element: "日", school: "聖護" },
      { name: "祈禱結界", cost: 16, power: 0, kind: "statusWardParty", stat: "magic", element: "日", school: "聖護" },
      { name: "和平聖域", cost: 22, power: 0, kind: "sanctuary", stat: "magic", element: "日", school: "聖護" }
    ],
    "旅行者": [
      { name: "急救", cost: 8, power: 1.2, kind: "heal", stat: "magic", element: "日" },
      { name: "應援", cost: 8, power: 0, kind: "buffAttackSingle", stat: "magic", element: null },
      { name: "戰傷救護", cost: 12, power: 1.8, kind: "heal", stat: "magic", element: "日" },
      { name: "耐力提升", cost: 8, power: 0, kind: "buffDefenseSingle", stat: "magic", element: null },
      { name: "重斬", cost: 8, power: 1.75, kind: "attack", stat: "attack", element: null },
      { name: "火焰斬", cost: 10, power: 1.9, kind: "attackBurn", stat: "attack", element: "火", chance: 0.3, duration: 2 },
      { name: "旋風斬", cost: 12, power: 1.85, kind: "attack", stat: "attack", element: "風" },
      { name: "隼斬", cost: 14, power: 0.95, kind: "multiHit", stat: "attack", hits: 2, element: null },
      { name: "風刃", cost: 8, power: 1.45, kind: "attack", stat: "magic", element: "風" },
      { name: "旋風", cost: 10, power: 1.55, kind: "attack", stat: "magic", element: "風" },
      { name: "狂嵐", cost: 12, power: 1.8, kind: "attack", stat: "magic", element: "風" },
      { name: "嵐天風暴", cost: 14, power: 2.0, kind: "attack", stat: "magic", element: "風" },
      { name: "龍捲風", cost: 22, power: 2.7, kind: "attackStun", stat: "magic", element: "風", chance: 0.5, duration: 1 }
    ],
    "盜賊": [
      { name: "麻痺短劍", cost: 8, power: 1.45, kind: "attackParalyze", stat: "attack", element: null, chance: 0.3, duration: 3 },
      { name: "劇毒短劍", cost: 8, power: 1.45, kind: "attackPoison", stat: "attack", element: null, chance: 0.3, duration: 5 },
      { name: "睡眠短劍", cost: 8, power: 1.45, kind: "attackSleep", stat: "attack", element: null, chance: 0.3, duration: 3 },
      { name: "疾走", cost: 6, power: 0, kind: "buffSpeedSingle", stat: "speed", element: null },
      { name: "殘影", cost: 8, power: 0, kind: "afterimage", stat: "speed", element: null },
      { name: "影襲", cost: 10, power: 1.8, kind: "attackAfterimage", stat: "attack", element: null },
      { name: "竊盜", cost: 8, power: 0, kind: "steal", stat: "luck", element: null },
      { name: "投毒", cost: 10, power: 1.25, kind: "attackPoison", stat: "attack", element: null, chance: 0.3, duration: 5 },
      { name: "煙幕", cost: 8, power: 0, kind: "attackBlind", stat: "attack", element: null, chance: 0.3, duration: 5 },
      { name: "陷阱干擾", cost: 10, power: 0, kind: "attackTrap", stat: "attack", element: null, duration: 2 }
    ],
  },
  itemCatalog: {
    cloth_robe: { key: "cloth_robe", name: "布衣", type: "equipment", price: 12, slot: "身體", armorClass: "一般裝甲", element: null, description: "最基礎的布製上衣。", bonuses: { defense: 1 } },
    cloth_pants: { key: "cloth_pants", name: "布褲", type: "equipment", price: 12, slot: "腿", armorClass: "一般裝甲", element: null, description: "最基礎的布製褲裝。", bonuses: { defense: 1 } },
    grass_shoes: { key: "grass_shoes", name: "草鞋", type: "equipment", price: 10, slot: "腳", armorClass: "一般裝甲", element: null, description: "最基礎的鞋子。", bonuses: { speed: 1 } },
    wood_sword: { key: "wood_sword", name: "木劍", type: "equipment", price: 15, slot: "主手", weaponType: "劍", element: null, description: "遊戲初始木製劍。", bonuses: { attack: 5 } },
    wood_dagger: { key: "wood_dagger", name: "木匕首", type: "equipment", price: 15, slot: "主手", weaponType: "匕首", element: null, description: "適合靈活戰鬥的初階匕首。", bonuses: { attack: 5, speed: 1 } },
    wood_long_staff: { key: "wood_long_staff", name: "木長杖", type: "equipment", price: 15, slot: "主手", weaponType: "長杖", element: null, description: "偏重魔法輸出的初始長杖。", bonuses: { magic: 5 } },
    wood_short_staff: { key: "wood_short_staff", name: "木短杖", type: "equipment", price: 15, slot: "主手", weaponType: "短杖", element: null, description: "偏重恢復與穩定性的初始短杖。", bonuses: { magic: 3, resistance: 2 } },
    wood_gauntlet: { key: "wood_gauntlet", name: "木拳套", type: "equipment", price: 15, slot: "主手", weaponType: "拳套", element: null, description: "武鬥家入門木製拳套。", bonuses: { attack: 5, speed: 1 } },
    copper_sword: { key: "copper_sword", name: "銅劍", type: "equipment", price: 40, slot: "主手", weaponType: "劍", element: null, description: "比木劍更穩定的攻擊提升。", bonuses: { attack: 10 } },
    iron_sword: { key: "iron_sword", name: "鐵劍", type: "equipment", price: 85, slot: "主手", weaponType: "劍", element: null, description: "中期近戰的實用劍。", bonuses: { attack: 20 } },
    potion_hp_s: { key: "potion_hp_s", name: "小型生命藥水", type: "consumable", price: 18, description: "回復 45 HP。", healHp: 45, targetScope: "single_ally" },
    potion_mp_s: { key: "potion_mp_s", name: "小型魔力藥水", type: "consumable", price: 20, description: "回復 30 MP。", healMp: 30, targetScope: "single_ally" },
    potion_hp_m: { key: "potion_hp_m", name: "中型生命藥水", type: "consumable", price: 42, description: "回復 120 HP。", healHp: 120, targetScope: "single_ally" },
    potion_hp_l: { key: "potion_hp_l", name: "大型生命藥水", type: "consumable", price: 88, description: "回復 260 HP。", healHp: 260, targetScope: "single_ally" },
    potion_mp_m: { key: "potion_mp_m", name: "中型魔力藥水", type: "consumable", price: 46, description: "回復 80 MP。", healMp: 80, targetScope: "single_ally" },
    potion_mp_l: { key: "potion_mp_l", name: "大型魔力藥水", type: "consumable", price: 92, description: "回復 180 MP。", healMp: 180, targetScope: "single_ally" },
    ration_pack: { key: "ration_pack", name: "冒險乾糧", type: "consumable", price: 26, description: "回復 35 HP 與 15 MP。", healHp: 35, healMp: 15, targetScope: "single_ally" },
    field_bandage: { key: "field_bandage", name: "急救繃帶", type: "consumable", price: 14, description: "回復 28 HP。", healHp: 28, targetScope: "single_ally" },
    party_bread: { key: "party_bread", name: "行軍麵包", type: "consumable", price: 65, description: "全隊回復 60 HP。", healHp: 60, targetScope: "all_allies" },
    party_tea: { key: "party_tea", name: "提神香茶", type: "consumable", price: 72, description: "全隊回復 40 MP。", healMp: 40, targetScope: "all_allies" },
    revive_leaf: { key: "revive_leaf", name: "復甦葉", type: "consumable", price: 120, description: "使一名倒下隊友以 25% HP 復活。", reviveHpPercent: 0.25, targetScope: "fallen_ally" },
    revive_crystal: { key: "revive_crystal", name: "復甦水晶", type: "consumable", price: 220, description: "使一名倒下隊友以 50% HP 復活。", reviveHpPercent: 0.5, targetScope: "fallen_ally" },
    leather_cap: { key: "leather_cap", name: "皮帽", type: "equipment", price: 40, slot: "頭", armorClass: "輕型裝甲", element: null, description: "基礎輕裝頭部防具。", bonuses: { defense: 1, speed: 1 } },
    padded_vest: { key: "padded_vest", name: "襯墊皮甲", type: "equipment", price: 52, slot: "身體", armorClass: "輕型裝甲", element: null, description: "適合靈活戰士的輕型護甲。", bonuses: { defense: 3, speed: 1 } },
    chain_armor: { key: "chain_armor", name: "鎖子甲", type: "equipment", price: 70, slot: "身體", armorClass: "重型裝甲", element: null, description: "戰士常用的基礎重甲。", bonuses: { defense: 5, resistance: 1 } },
    apprentice_robe: { key: "apprentice_robe", name: "見習法袍", type: "equipment", price: 58, slot: "身體", armorClass: "魔法裝甲", element: null, description: "強化施法穩定性的入門法袍。", bonuses: { magic: 3, resistance: 2 } },
    stone_ring: { key: "stone_ring", name: "岩環", type: "equipment", price: 55, slot: "飾品1", element: "地", description: "提高防禦與抵抗。", bonuses: { defense: 2, resistance: 1 } },
    ember_blade: { key: "ember_blade", name: "餘燼短劍", type: "equipment", price: 70, slot: "主手", weaponType: "劍", element: "火", description: "帶火屬性的輕型武器。", bonuses: { attack: 5 } },
    bronze_dagger: { key: "bronze_dagger", name: "青銅匕首", type: "equipment", price: 48, slot: "主手", weaponType: "匕首", element: null, description: "比木匕首更適合刺殺與偷襲。", bonuses: { attack: 7, speed: 1 } },
    training_mace: { key: "training_mace", name: "修習鎚", type: "equipment", price: 54, slot: "主手", weaponType: "鎚", element: null, description: "僧侶與近戰支援都能使用的訓練鎚。", bonuses: { attack: 4, resistance: 2 } },
    oak_staff: { key: "oak_staff", name: "橡木長杖", type: "equipment", price: 52, slot: "主手", weaponType: "長杖", element: null, description: "比木長杖更成熟的施法武器。", bonuses: { magic: 8 } },
    moon_charm: { key: "moon_charm", name: "月影護符", type: "equipment", price: 72, slot: "飾品2", element: "月", description: "提高運氣與魔法。", bonuses: { magic: 2, luck: 2 } },
    gale_boots: { key: "gale_boots", name: "疾風靴", type: "equipment", price: 68, slot: "腳", armorClass: "輕型裝甲", element: "風", description: "讓步伐更輕盈。", bonuses: { speed: 3 } },
    sun_emblem: { key: "sun_emblem", name: "日耀徽章", type: "equipment", price: 75, slot: "飾品3", element: "日", description: "強化天法與抗性。", bonuses: { magic: 2, resistance: 2 } },
    mage_staff: { key: "mage_staff", name: "魔法師之杖", type: "equipment", price: 45, slot: "主手", weaponType: "長杖", element: null, description: "比木長杖更強的法術輸出武器。", bonuses: { magic: 10 } },
    prayer_short_staff: { key: "prayer_short_staff", name: "祈禱短杖", type: "equipment", price: 45, slot: "主手", weaponType: "短杖", element: null, description: "支援型職業適用的短杖。", bonuses: { magic: 6, resistance: 4 } },
  },
  shopItems: ["potion_hp_s", "potion_mp_s", "potion_hp_m", "potion_mp_m", "ration_pack", "field_bandage", "party_bread", "party_tea", "revive_leaf", "copper_sword", "iron_sword", "mage_staff", "oak_staff", "prayer_short_staff", "bronze_dagger", "training_mace", "leather_cap", "padded_vest", "chain_armor", "apprentice_robe", "stone_ring", "ember_blade", "gale_boots", "sun_emblem"],
  monsters: [
    { code: "slime", name: "草原史萊姆", category: "normal", level: 1, elements: ["水"], hp: 55, mp: 10, attack: 8, defense: 5, magic: 6, resistance: 6, speed: 7, luck: 4, exp: 20, gold: 8, note: "黏液衝擊", drops: ["potion_hp_s", "potion_mp_s"] },
    { code: "wolf", name: "狂牙野狼", category: "normal", level: 2, elements: ["風"], hp: 70, mp: 10, attack: 12, defense: 7, magic: 4, resistance: 5, speed: 12, luck: 5, exp: 28, gold: 12, note: "撕裂撲擊", drops: ["potion_hp_s", "leather_cap"] },
    { code: "scarecrow", name: "失控稻草人", category: "normal", level: 2, elements: ["地"], hp: 80, mp: 5, attack: 11, defense: 9, magic: 3, resistance: 6, speed: 6, luck: 3, exp: 30, gold: 14, note: "纏草束縛", drops: ["stone_ring", "potion_hp_s"] },
    { code: "mine_beast", name: "礦坑吞岩獸", category: "dungeon", level: 4, elements: ["地"], hp: 140, mp: 15, attack: 18, defense: 14, magic: 6, resistance: 10, speed: 8, luck: 4, exp: 75, gold: 40, note: "碎岩重踏", drops: ["stone_ring", "ember_blade"] },
    { code: "moon_king", name: "月咒妖精王", category: "dungeon", level: 7, elements: ["月", "風"], hp: 190, mp: 45, attack: 20, defense: 13, magic: 24, resistance: 18, speed: 18, luck: 10, exp: 120, gold: 65, note: "月影詛咒", drops: ["moon_charm", "potion_mp_s"] },
    { code: "wolf_king", name: "裂口巨狼王", category: "story", storyOrder: 1, level: 3, elements: ["風"], hp: 120, mp: 10, attack: 17, defense: 10, magic: 4, resistance: 8, speed: 16, luck: 6, exp: 60, gold: 35, note: "狂亂咬殺", drops: ["leather_cap", "potion_hp_s"] },
    { code: "tree_spirit", name: "腐化樹靈", category: "story", storyOrder: 2, level: 5, elements: ["地", "月"], hp: 165, mp: 25, attack: 16, defense: 16, magic: 18, resistance: 15, speed: 9, luck: 5, exp: 95, gold: 55, note: "腐根纏縛", drops: ["moon_charm", "stone_ring"] },
  ],
  areas: [],
  storyChapters: [],
  quests: [],
  monsterSkills: {},
  shopPools: {},
  dropTables: {},
};

const classAutoGrowth = {
  "戰士": { maxHp: 16, maxMp: 4, attack: 3, defense: 3, magic: 0, resistance: 2, speed: 1, luck: 1 },
  "武鬥家": { maxHp: 12, maxMp: 5, attack: 3, defense: 1, magic: 1, resistance: 1, speed: 3, luck: 1 },
  "魔法師": { maxHp: 8, maxMp: 12, attack: 0, defense: 1, magic: 4, resistance: 2, speed: 1, luck: 1 },
  "僧侶": { maxHp: 10, maxMp: 11, attack: 1, defense: 2, magic: 3, resistance: 3, speed: 1, luck: 1 },
  "旅行者": { maxHp: 11, maxMp: 8, attack: 2, defense: 2, magic: 2, resistance: 2, speed: 2, luck: 2 },
  "盜賊": { maxHp: 10, maxMp: 5, attack: 3, defense: 1, magic: 1, resistance: 1, speed: 4, luck: 2 },
};

const classSkillUnlocks = {
  "戰士": {
    "護盾": ["守護系", 0], "防禦姿態": ["守護系", 3], "群體嘲諷": ["守護系", 6],
    "重斬": ["斬擊系", 0], "火焰斬": ["斬擊系", 3], "旋風斬": ["斬擊系", 6], "隼斬": ["斬擊系", 9],
    "格擋反擊": ["反擊系", 0], "戰意回復": ["反擊系", 3], "決死反攻": ["反擊系", 6],
  },
  "武鬥家": {
    "直拳": ["拳擊系", 0], "碎骨拳": ["拳擊系", 3], "貫突": ["拳擊系", 6],
    "聚氣": ["氣功系", 0], "氣彈": ["氣功系", 3], "真氣爆發": ["氣功系", 6],
    "三連擊": ["連段系", 0], "追打": ["連段系", 3], "極限連舞": ["連段系", 6],
  },
  "魔法師": {
    "水槍": ["冰水系", 0], "酸雨": ["冰水系", 3], "吹雪": ["冰水系", 6], "暴風雪": ["冰水系", 9], "霜天葬送": ["冰水系", 12],
    "火球": ["火焰系", 0], "豪火柱": ["火焰系", 3], "火焰之槍": ["火焰系", 6], "焦土": ["火焰系", 9], "焚天神兵": ["火焰系", 12],
    "魔法強化": ["增幅系", 0], "疾走": ["增幅系", 3], "魔力聚流": ["增幅系", 6],
  },
  "僧侶": {
    "治療": ["天法系", 0], "祝福": ["天法系", 3], "大治療": ["天法系", 6], "完全淨化": ["天法系", 9], "祝聖": ["天法系", 12],
    "物理強化": ["增幅系", 0], "魔法強化": ["增幅系", 3], "疾走": ["增幅系", 6],
    "聖盾": ["聖護系", 0], "祈禱戰歌": ["聖護系", 3], "祈禱結界": ["聖護系", 6], "和平聖域": ["聖護系", 9],
    "群體治療": ["聖護系", 12], "完全治療": ["天法系", 12], "奇蹟": ["天法系", 15],
  },
  "旅行者": {
    "急救": ["求生系", 0], "應援": ["求生系", 3], "戰傷救護": ["求生系", 6], "耐力提升": ["求生系", 9],
    "重斬": ["斬擊系", 0], "火焰斬": ["斬擊系", 3], "旋風斬": ["斬擊系", 6], "隼斬": ["斬擊系", 9],
    "風刃": ["狂風系", 0], "旋風": ["狂風系", 3], "狂嵐": ["狂風系", 6], "嵐天風暴": ["狂風系", 9], "龍捲風": ["狂風系", 12],
  },
  "盜賊": {
    "麻痺短劍": ["異常系", 0], "劇毒短劍": ["異常系", 3], "睡眠短劍": ["異常系", 6],
    "疾走": ["影步系", 0], "殘影": ["影步系", 3], "影襲": ["影步系", 6],
    "竊盜": ["詭計系", 0], "投毒": ["詭計系", 3], "煙幕": ["詭計系", 6], "陷阱干擾": ["詭計系", 9],
  },
};

Object.entries(classSkillUnlocks).forEach(([className, mapping]) => {
  (data.classSkills[className] || []).forEach(skill => {
    const [branch, requiredPoints] = mapping[skill.name] || [null, 0];
    skill.branch = branch;
    skill.requiredPoints = requiredPoints;
  });
});

const defaultEquipRules = {
  weaponRules: {
    "戰士": ["劍", "斧", "鎚", "雙手劍"],
    "武鬥家": ["拳套"],
    "魔法師": ["長杖"],
    "僧侶": ["短杖", "鎚"],
    "旅行者": ["劍", "短杖", "鎚"],
    "盜賊": ["匕首"],
  },
  armorRules: {
    "戰士": ["重型裝甲", "輕型裝甲", "一般裝甲"],
    "武鬥家": ["輕型裝甲", "一般裝甲"],
    "魔法師": ["魔法裝甲", "一般裝甲"],
    "僧侶": ["輕型裝甲", "魔法裝甲", "一般裝甲"],
    "旅行者": ["重型裝甲", "輕型裝甲", "魔法裝甲", "一般裝甲"],
    "盜賊": ["輕型裝甲", "一般裝甲"],
  },
};

const state = {
  db: null,
  storageDriver: "indexeddb",
  currentPlayer: null,
  battle: null,
  inventoryTargeting: null,
  screen: "landing",
  skillTreeBranchFilter: "all",
  shopStock: [],
  equipRules: structuredClone(defaultEquipRules),
  classGrowth: structuredClone(classAutoGrowth),
  csvLoaded: false,
  auth: {
    enabled: false,
    client: null,
    session: null,
    user: null,
    profile: null,
    publicConfig: null,
  },
  cloudSync: { enabled: false, available: false, mode: "local", message: "本機存檔" },
};

const imageCatalog = {
  weapons: {
    "劍": "data/jpg/equipment/weapon/sword/W_Sword011.png",
    "雙手劍": "data/jpg/equipment/weapon/sword/W_Sword020.png",
    "斧": "data/jpg/equipment/weapon/axe/W_Axe010.png",
    "鎚": "data/jpg/equipment/weapon/mace/W_Mace010.png",
    "匕首": "data/jpg/equipment/weapon/dagger/W_Dagger014.png",
    "拳套": "data/jpg/equipment/weapon/fist/W_Fist004.png",
    "長杖": "",
    "短杖": "",
  },
  armor: {
    "頭": "data/jpg/equipment/armor/head/C_Hat02.png",
    "身體": "data/jpg/equipment/armor/body/A_Armour03.png",
    "腿": "data/jpg/equipment/armor/body/A_Clothing02.png",
    "腳": "data/jpg/equipment/armor/feet/A_Shoes06.png",
    "副手": "",
    "飾品1": "data/jpg/equipment/accessory/ring/Ac_Ring04.png",
    "飾品2": "data/jpg/equipment/accessory/medal/Ac_Medal03.png",
    "飾品3": "data/jpg/equipment/accessory/necklace/Ac_Necklace03.png",
  },
  consumables: {
    potion: "data/jpg/items/consumable/potion/P_Medicine05.png",
    remedy: "data/jpg/items/consumable/remedy/I_Antidote.png",
    food: "data/jpg/items/consumable/food/I_C_Bread.png",
    misc: "data/jpg/items/consumable/misc/I_Bottle03.png",
  },
  elements: {
    "地": "data/jpg/skills/element/earth/S_Earth04.png",
    "水": "data/jpg/skills/element/water/S_Water04.png",
    "火": "data/jpg/skills/element/fire/S_Fire04.png",
    "風": "data/jpg/skills/element/wind/S_Wind04.png",
    "雷": "data/jpg/skills/element/thunder/S_Thunder04.png",
    "日": "data/jpg/skills/element/holy/S_Holy04.png",
    "月": "data/jpg/skills/element/shadow/S_Shadow04.png",
    "無": "data/jpg/skills/physical/impact/S_Physic01.png",
  },
  support: {
    heal: "data/jpg/skills/support/light/S_Light02.png",
    buff: "data/jpg/skills/support/buff/S_Buff05.png",
    arcane: "data/jpg/skills/support/arcane/S_Magic03.png",
    debuff: "data/jpg/skills/element/poison/S_Poison04.png",
    sword: "data/jpg/skills/physical/sword/S_Sword05.png",
    bow: "data/jpg/skills/physical/bow/S_Bow05.png",
  },
  specialItems: {
    legend_sword: "data/jpg/equipment/weapon/sword/W_Sword021.png",
    abyss_demonblade: "data/jpg/equipment/weapon/sword/W_Sword019.png",
    dragonbone_staff: "",
    arcane_orb: "data/jpg/items/material/mineral/I_Crystal03.png",
    dragon_eye: "data/jpg/items/material/mineral/I_Diamond.png",
    moon_charm: "data/jpg/equipment/accessory/necklace/Ac_Necklace02.png",
    frost_ring: "data/jpg/equipment/accessory/ring/Ac_Ring04.png",
  },
};

const LOCAL_SAVE_KEY = "mmorpg_click_game_players_v1";
const CLOUD_SAVE_ENDPOINT = "/api/cloud-saves";
const PUBLIC_CONFIG_ENDPOINT = "/api/public-config";
const PROFILE_ENDPOINT = "/api/profile";
const ADMIN_USERS_ENDPOINT = "/api/admin-users";

function readLocalPlayers() {
  try {
    const raw = localStorage.getItem(LOCAL_SAVE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalPlayers(players) {
  localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(players));
}

function ensureCloudSaveId(player) {
  if (!player) return;
  if (!player.cloudSaveId) {
    if (globalThis.crypto?.randomUUID) {
      player.cloudSaveId = globalThis.crypto.randomUUID();
    } else {
      player.cloudSaveId = `save_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }
  }
}

async function refreshCloudSyncStatus() {
  try {
    const response = await fetch(`${CLOUD_SAVE_ENDPOINT}?mode=status`, { cache: "no-store" });
    if (!response.ok) throw new Error("cloud status");
    const payload = await response.json();
    state.cloudSync = {
      enabled: Boolean(payload.enabled),
      available: true,
      mode: payload.enabled ? "supabase" : "local",
      message: payload.enabled ? "Supabase 雲端同步已啟用" : "未設定 Supabase，使用本機存檔",
    };
  } catch {
    state.cloudSync = { enabled: false, available: false, mode: "local", message: "離線模式，本機存檔" };
  }
}

async function loadCloudPlayers() {
  if (!state.cloudSync.enabled) return [];
  if (state.auth.enabled && !state.auth.user) return [];
  try {
    const response = await fetch(CLOUD_SAVE_ENDPOINT, {
      cache: "no-store",
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error("cloud load");
    const payload = await response.json();
    return Array.isArray(payload.players) ? payload.players : [];
  } catch {
    return [];
  }
}

async function syncPlayerToCloud(player) {
  if (!state.cloudSync.enabled || !player) return;
  if (state.auth.enabled && !state.auth.user) return;
  ensureCloudSaveId(player);
  try {
    await fetch(CLOUD_SAVE_ENDPOINT, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ player }),
    });
  } catch {
    // Keep local saving resilient even if cloud sync is unavailable.
  }
}

function authToken() {
  return state.auth.session?.access_token || "";
}

function authHeaders(extra = {}) {
  const token = authToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }
  return { ok: response.ok, status: response.status, payload };
}

async function loadPublicConfig() {
  try {
    const { ok, payload } = await fetchJson(PUBLIC_CONFIG_ENDPOINT, { cache: "no-store" });
    if (!ok || !payload?.authEnabled || !globalThis.supabase?.createClient) {
      state.auth.enabled = false;
      return;
    }
    state.auth.enabled = true;
    state.auth.publicConfig = payload;
    state.auth.client = globalThis.supabase.createClient(payload.supabaseUrl, payload.supabaseAnonKey);
    const { data } = await state.auth.client.auth.getSession();
    state.auth.session = data?.session || null;
    state.auth.user = data?.session?.user || null;
    if (state.auth.user) {
      await refreshAuthProfile();
    }
    state.auth.client.auth.onAuthStateChange((_event, session) => {
      state.auth.session = session || null;
      state.auth.user = session?.user || null;
      if (state.auth.user) {
        refreshAuthProfile().then(() => {
          renderMenu();
          if (!state.currentPlayer) renderHome();
        });
      } else {
        state.auth.profile = null;
        state.currentPlayer = null;
        renderMenu();
        renderHome();
      }
    });
  } catch {
    state.auth.enabled = false;
  }
}

async function refreshAuthProfile() {
  if (!state.auth.enabled || !state.auth.user) {
    state.auth.profile = null;
    return null;
  }
  const { ok, payload } = await fetchJson(PROFILE_ENDPOINT, {
    headers: authHeaders(),
  });
  if (ok) {
    state.auth.profile = payload.profile || null;
    return state.auth.profile;
  }
  state.auth.profile = null;
  return null;
}

async function signInAccount(email, password) {
  if (!state.auth.client) return { ok: false, message: "\u5c1a\u672a\u8a2d\u5b9a Supabase Auth\u3002" };
  const { error } = await state.auth.client.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  await refreshAuthProfile();
  return { ok: true };
}

async function signUpAccount(email, password, displayName) {
  if (!state.auth.client) return { ok: false, message: "\u5c1a\u672a\u8a2d\u5b9a Supabase Auth\u3002" };
  const { error } = await state.auth.client.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || email.split("@")[0] },
    },
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "\u8a3b\u518a\u6210\u529f\uff0c\u82e5 Supabase \u555f\u7528\u4fe1\u7bb1\u9a57\u8b49\uff0c\u8acb\u5148\u5b8c\u6210\u9a57\u8b49\u518d\u767b\u5165\u3002" };
}

async function signOutAccount() {
  if (!state.auth.client) return;
  await state.auth.client.auth.signOut();
  state.currentPlayer = null;
  renderMenu();
  renderHome();
}

function canPlayOnline() {
  return !state.auth.enabled || Boolean(state.auth.user);
}

const dbApi = {
  async open() {
    if (typeof indexedDB === "undefined") {
      state.storageDriver = "localStorage";
      return null;
    }
    return new Promise(resolve => {
      try {
        const request = indexedDB.open("mmorpg_click_game", 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains("players")) {
            db.createObjectStore("players", { keyPath: "id", autoIncrement: true });
          }
        };
        request.onsuccess = () => {
          state.storageDriver = "indexeddb";
          resolve(request.result);
        };
        request.onerror = () => {
          state.storageDriver = "localStorage";
          resolve(null);
        };
      } catch {
        state.storageDriver = "localStorage";
        resolve(null);
      }
    });
  },
  async getAllPlayers() {
    if (state.auth.enabled && state.auth.user) {
      const cloudPlayers = await loadCloudPlayers();
      if (cloudPlayers.length) return cloudPlayers;
    }
    const localPlayers = state.storageDriver === "localStorage"
      ? readLocalPlayers()
      : await transaction("players", "readonly", store => store.getAll());
    if (localPlayers.length > 0) return localPlayers;
    return loadCloudPlayers();
  },
  async addPlayer(player) {
    ensureCloudSaveId(player);
    if (state.storageDriver === "localStorage") {
      const players = readLocalPlayers();
      const nextId = players.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
      const savedPlayer = { ...structuredClone(player), id: nextId };
      players.push(savedPlayer);
      writeLocalPlayers(players);
      await syncPlayerToCloud(savedPlayer);
      return nextId;
    }
    const id = await transaction("players", "readwrite", store => store.add(player));
    await syncPlayerToCloud({ ...structuredClone(player), id });
    return id;
  },
  async updatePlayer(player) {
    ensureCloudSaveId(player);
    if (state.storageDriver === "localStorage") {
      const players = readLocalPlayers();
      const index = players.findIndex(item => Number(item.id) === Number(player.id));
      if (index >= 0) {
        players[index] = structuredClone(player);
      } else {
        players.push(structuredClone(player));
      }
      writeLocalPlayers(players);
      await syncPlayerToCloud(player);
      return player.id;
    }
    const id = await transaction("players", "readwrite", store => store.put(player));
    await syncPlayerToCloud(player);
    return id;
  },
  async getPlayer(id) {
    if (state.auth.enabled && state.auth.user) {
      const cloudPlayer = (await loadCloudPlayers()).find(player => Number(player.id) === Number(id)) || null;
      if (cloudPlayer) return cloudPlayer;
    }
    if (state.storageDriver === "localStorage") {
      const localPlayer = readLocalPlayers().find(player => Number(player.id) === Number(id)) || null;
      if (localPlayer) return localPlayer;
      return (await loadCloudPlayers()).find(player => Number(player.id) === Number(id)) || null;
    }
    const localPlayer = await transaction("players", "readonly", store => store.get(id));
    if (localPlayer) return localPlayer;
    return (await loadCloudPlayers()).find(player => Number(player.id) === Number(id)) || null;
  },
};

const advancedClassDefinitions = [
  {
    code: "spellblade",
    name: "魔法戰士",
    armorType: "魔法裝甲",
    description: "融合劍技與魔法的前線戰士。",
    advantage: "優勢：攻魔雙修，能用附魔與魔法劍壓制全場。",
    branches: ["附加系", "魔法劍", "魔力系"],
    bonuses: { maxHp: 8, maxMp: 18, attack: 4, defense: 4, magic: 5, resistance: 2, speed: 1, luck: 1 },
    requirements: [{ classCode: "mage", level: 40 }, { classCode: "warrior", level: 40 }],
  },
  {
    code: "battle_master",
    name: "戰鬥大師",
    armorType: "重型裝甲",
    description: "將武技磨練到極致的霸道鬥士。",
    advantage: "優勢：爆發與壓制兼具，能以威壓打亂敵陣。",
    branches: ["無雙系", "威壓系", "破壞系"],
    bonuses: { maxHp: 14, maxMp: 6, attack: 5, defense: 4, magic: 1, resistance: 2, speed: 4, luck: 1 },
    requirements: [{ classCode: "martial", level: 40 }, { classCode: "warrior", level: 40 }],
  },
  {
    code: "sage",
    name: "賢者",
    armorType: "魔法裝甲",
    description: "精通日月秘術與高階恢復的全能法師。",
    advantage: "優勢：高 MP、高魔法與高抵抗，支援輸出都強。",
    branches: ["日", "月", "賢術系"],
    bonuses: { maxHp: 6, maxMp: 22, attack: 1, defense: 1, magic: 7, resistance: 5, speed: 1, luck: 2 },
    requirements: [{ classCode: "monk", level: 40 }, { classCode: "mage", level: 40 }],
  },
  {
    code: "paladin",
    name: "聖騎士",
    armorType: "重型裝甲",
    description: "以守護與神聖之力支撐隊伍的聖職騎士。",
    advantage: "優勢：坦度高，能分攤傷害與提供全隊加護。",
    branches: ["我為人人", "加護系", "騎士道"],
    bonuses: { maxHp: 15, maxMp: 12, attack: 2, defense: 5, magic: 4, resistance: 5, speed: 1, luck: 1 },
    requirements: [{ classCode: "monk", level: 40 }, { classCode: "martial", level: 40 }],
  },
  {
    code: "assassin",
    name: "暗殺者",
    armorType: "輕型裝甲",
    description: "以致命一擊與異常控制終結敵人的刺客。",
    advantage: "優勢：速度高、異常多，對失衡敵人有極高爆發。",
    branches: ["致死系", "生存系", "月"],
    bonuses: { maxHp: 6, maxMp: 14, attack: 5, defense: 2, magic: 3, resistance: 2, speed: 6, luck: 2 },
    requirements: [{ classCode: "traveler", level: 40 }, { classCode: "rogue", level: 40 }],
  },
  {
    code: "hero",
    name: "勇者",
    armorType: "重型裝甲",
    description: "兼具劍技、雷霆與全能強化的頂級職業。",
    advantage: "優勢：全能力成長優異，可同時擔任輸出與核心增幅。",
    branches: ["勇者系", "雷霆系"],
    bonuses: { maxHp: 14, maxMp: 16, attack: 5, defense: 5, magic: 5, resistance: 5, speed: 4, luck: 4 },
    requirements: [{ classCode: "battle_master", level: 60 }, { classCode: "sage", level: 60 }],
  },
  {
    code: "demon_king",
    name: "魔王",
    armorType: "魔法裝甲",
    description: "以深淵魔力與大地災厄支配戰場的終極職業。",
    advantage: "優勢：攻魔雙高，群體壓制與持續爆發兼備。",
    branches: ["魔王系", "大地"],
    bonuses: { maxHp: 12, maxMp: 20, attack: 5, defense: 4, magic: 7, resistance: 4, speed: 4, luck: 2 },
    requirements: [{ classCode: "spellblade", level: 60 }, { classCode: "assassin", level: 60 }],
  },
];

const advancedClassGrowth = {
  "魔法戰士": { maxHp: 12, maxMp: 10, attack: 3, defense: 3, magic: 3, resistance: 2, speed: 1, luck: 1 },
  "戰鬥大師": { maxHp: 15, maxMp: 6, attack: 4, defense: 3, magic: 1, resistance: 2, speed: 3, luck: 1 },
  "賢者": { maxHp: 8, maxMp: 14, attack: 1, defense: 1, magic: 5, resistance: 4, speed: 1, luck: 1 },
  "聖騎士": { maxHp: 14, maxMp: 10, attack: 2, defense: 4, magic: 3, resistance: 4, speed: 1, luck: 1 },
  "暗殺者": { maxHp: 10, maxMp: 9, attack: 4, defense: 2, magic: 2, resistance: 2, speed: 5, luck: 2 },
  "勇者": { maxHp: 14, maxMp: 12, attack: 4, defense: 4, magic: 4, resistance: 4, speed: 3, luck: 3 },
  "魔王": { maxHp: 12, maxMp: 15, attack: 4, defense: 3, magic: 5, resistance: 3, speed: 3, luck: 2 },
};

function ensureAdvancedClassData() {
  advancedClassDefinitions.forEach(definition => {
    const existing = data.classes.find(item => item.code === definition.code);
    if (!existing) {
      data.classes.push(structuredClone(definition));
    } else {
      Object.assign(existing, structuredClone(definition));
    }
    if (!data.classSkills[definition.name]) {
      data.classSkills[definition.name] = [];
    }
  });

  data.classes = data.classes.filter(item => !["sword_saint", "saint"].includes(item.code));

  Object.assign(classAutoGrowth, advancedClassGrowth);
  Object.assign(data.branchEffects, {
    "附加系": ["attack", 2],
    "魔法劍": ["magic", 2],
    "魔力系": ["maxMp", 5],
    "無雙系": ["maxHp", 5],
    "威壓系": ["attack", 2],
    "破壞系": ["speed", 2],
    "日": ["magic", 2],
    "月": ["resistance", 2],
    "賢術系": ["maxMp", 5],
    "我為人人": ["defense", 2],
    "加護系": ["resistance", 2],
    "騎士道": ["attack", 2],
    "致死系": ["attack", 2],
    "生存系": ["speed", 2],
    "勇者系": ["luck", 2],
    "雷霆系": ["attack", 3],
    "魔王系": ["magic", 3],
    "大地": ["attack", 3],
  });

  Object.assign(defaultEquipRules.weaponRules, {
    "魔法戰士": ["劍", "雙手劍", "長杖", "短杖"],
    "戰鬥大師": ["劍", "斧", "鎚", "雙手劍", "拳套"],
    "賢者": ["長杖", "短杖"],
    "聖騎士": ["劍", "鎚", "槍"],
    "暗殺者": ["匕首", "月刃"],
    "勇者": ["劍", "雙手劍", "長杖", "短杖", "槍"],
    "魔王": ["劍", "長杖", "短杖", "雙手劍"],
  });

  Object.assign(defaultEquipRules.armorRules, {
    "魔法戰士": ["重型裝甲", "輕型裝甲", "魔法裝甲", "一般裝甲"],
    "戰鬥大師": ["重型裝甲", "輕型裝甲", "一般裝甲"],
    "賢者": ["魔法裝甲", "輕型裝甲", "一般裝甲"],
    "聖騎士": ["重型裝甲", "輕型裝甲", "魔法裝甲", "一般裝甲"],
    "暗殺者": ["輕型裝甲", "一般裝甲"],
    "勇者": ["重型裝甲", "輕型裝甲", "魔法裝甲", "一般裝甲"],
    "魔王": ["重型裝甲", "魔法裝甲", "一般裝甲"],
  });

  delete data.classSkills["劍聖"];
  delete data.classSkills["聖人"];
}

function ensureAdvancedClassSkills() {
  const advancedSkills = {
    "魔法戰士": [
      { name: "水附加", cost: 8, power: 1.15, kind: "elementEnchantSelf", stat: "attack", element: "水", duration: 5, school: "附加系", branch: "附加系", requiredPoints: 0 },
      { name: "風附加", cost: 8, power: 1.15, kind: "elementEnchantSelf", stat: "attack", element: "風", duration: 5, school: "附加系", branch: "附加系", requiredPoints: 3 },
      { name: "地附加", cost: 8, power: 1.15, kind: "elementEnchantSelf", stat: "attack", element: "地", duration: 5, school: "附加系", branch: "附加系", requiredPoints: 6 },
      { name: "地水火風附加", cost: 14, power: 1.2, kind: "multiElementEnchantSelf", stat: "attack", duration: 5, school: "附加系", branch: "附加系", requiredPoints: 9 },
      { name: "波濤斬", cost: 14, power: 1.7, kind: "attackAll", stat: "attack", element: "水", school: "魔法劍", branch: "魔法劍", requiredPoints: 0 },
      { name: "狂風劍", cost: 16, power: 1.35, kind: "attackRandom", stat: "attack", element: "風", hits: 3, school: "魔法劍", branch: "魔法劍", requiredPoints: 3 },
      { name: "裂地斬", cost: 18, power: 2.1, kind: "attackAll", stat: "attack", element: "地", school: "魔法劍", branch: "魔法劍", requiredPoints: 6 },
      { name: "爆裂劍", cost: 22, power: 1.7, kind: "attackAllMulti", stat: "attack", element: "火", hits: 2, school: "魔法劍", branch: "魔法劍", requiredPoints: 9 },
      { name: "冥想", cost: 0, power: 0.1, kind: "mpHealPercent", stat: "magic", school: "魔力系", branch: "魔力系", requiredPoints: 0 },
      { name: "魔力提煉", cost: 10, power: 0.08, kind: "regenMp", stat: "magic", duration: 5, school: "魔力系", branch: "魔力系", requiredPoints: 3 },
      { name: "魔武戰技", cost: 14, power: 0, kind: "spellbladeMode", stat: "magic", duration: 5, school: "魔力系", branch: "魔力系", requiredPoints: 6 },
    ],
    "戰鬥大師": [
      { name: "捨身", cost: 12, power: 0, kind: "berserk", stat: "attack", duration: 4, school: "無雙系", branch: "無雙系", requiredPoints: 0 },
      { name: "亂舞", cost: 16, power: 0.72, kind: "multiHit", stat: "attack", hits: 4, school: "無雙系", branch: "無雙系", requiredPoints: 3 },
      { name: "魔神斬", cost: 18, power: 3.0, kind: "riskyTriple", stat: "attack", school: "無雙系", branch: "無雙系", requiredPoints: 6 },
      { name: "天賭嗜命", cost: 22, power: 0, kind: "allIn", stat: "attack", duration: 1, school: "無雙系", branch: "無雙系", requiredPoints: 9 },
      { name: "戰吼", cost: 14, power: 0, kind: "allStun", stat: "attack", chance: 0.5, duration: 1, school: "威壓系", branch: "威壓系", requiredPoints: 0 },
      { name: "威壓", cost: 14, power: 0, kind: "fearAll", stat: "attack", chance: 0.3, duration: 4, school: "威壓系", branch: "威壓系", requiredPoints: 3 },
      { name: "弱者殺手", cost: 12, power: 3.0, kind: "executeAilment", stat: "attack", school: "威壓系", branch: "威壓系", requiredPoints: 6 },
      { name: "裂盔斬", cost: 12, power: 1.9, kind: "attackDebuffDefense", stat: "attack", duration: 4, school: "破壞系", branch: "破壞系", requiredPoints: 0 },
      { name: "破刃擊", cost: 12, power: 1.9, kind: "attackDebuffAttack", stat: "attack", duration: 4, school: "破壞系", branch: "破壞系", requiredPoints: 3 },
      { name: "破壞毆打", cost: 16, power: 1.2, kind: "multiHitStun", stat: "attack", hits: 2, chance: 0.5, duration: 1, school: "破壞系", branch: "破壞系", requiredPoints: 6 },
    ],
    "賢者": [
      { name: "陽光射線", cost: 10, power: 1.35, kind: "attack", stat: "magic", element: "日", school: "日", branch: "日", requiredPoints: 0 },
      { name: "日冕", cost: 14, power: 0, kind: "buffDefensePartyStrong", stat: "magic", element: "日", duration: 4, school: "日", branch: "日", requiredPoints: 3 },
      { name: "太陽球", cost: 14, power: 0, kind: "buffResistancePartyStrong", stat: "magic", element: "日", duration: 4, school: "日", branch: "日", requiredPoints: 6 },
      { name: "烈日恆天", cost: 18, power: 1.85, kind: "attackAll", stat: "magic", element: "日", school: "日", branch: "日", requiredPoints: 9 },
      { name: "太陽風", cost: 20, power: 2.35, kind: "attack", stat: "magic", element: "日", school: "日", branch: "日", requiredPoints: 12 },
      { name: "太陽面爆發", cost: 26, power: 3.1, kind: "attackAll", stat: "magic", element: "日", school: "日", branch: "日", requiredPoints: 15 },
      { name: "新月", cost: 10, power: 1.35, kind: "attack", stat: "magic", element: "月", school: "月", branch: "月", requiredPoints: 0 },
      { name: "上弦月", cost: 14, power: 0, kind: "debuffDefenseAll", stat: "magic", element: "月", duration: 4, school: "月", branch: "月", requiredPoints: 3 },
      { name: "下弦月", cost: 14, power: 0, kind: "debuffResistanceAll", stat: "magic", element: "月", duration: 4, school: "月", branch: "月", requiredPoints: 6 },
      { name: "滿月", cost: 18, power: 1.85, kind: "attackAll", stat: "magic", element: "月", school: "月", branch: "月", requiredPoints: 9 },
      { name: "無月", cost: 20, power: 2.35, kind: "attack", stat: "magic", element: "月", school: "月", branch: "月", requiredPoints: 12 },
      { name: "月亮追逐者", cost: 26, power: 3.15, kind: "attack", stat: "magic", element: "月", school: "月", branch: "月", requiredPoints: 15 },
      { name: "癒合", cost: 10, power: 0.08, kind: "regenHpSingle", stat: "magic", duration: 5, school: "賢術系", branch: "賢術系", requiredPoints: 0 },
      { name: "加速癒合", cost: 14, power: 0.12, kind: "regenHpSingle", stat: "magic", duration: 5, school: "賢術系", branch: "賢術系", requiredPoints: 3 },
      { name: "大範圍祝福", cost: 16, power: 0, kind: "cleanseAll", stat: "magic", school: "賢術系", branch: "賢術系", requiredPoints: 6 },
      { name: "再生", cost: 18, power: 0.18, kind: "regenHpSingle", stat: "magic", duration: 5, school: "賢術系", branch: "賢術系", requiredPoints: 9 },
    ],
    "聖騎士": [
      { name: "hp給予", cost: 0, power: 0.5, kind: "allyHpTransfer", stat: "magic", school: "我為人人", branch: "我為人人", requiredPoints: 0 },
      { name: "mp給予", cost: 0, power: 0.5, kind: "allyMpTransfer", stat: "magic", school: "我為人人", branch: "我為人人", requiredPoints: 3 },
      { name: "銅牆鐵壁", cost: 16, power: 0, kind: "coverAll", stat: "defense", duration: 3, school: "我為人人", branch: "我為人人", requiredPoints: 6 },
      { name: "水之加護", cost: 10, power: 0, kind: "elementalWardParty", stat: "magic", element: "水", duration: 4, school: "加護系", branch: "加護系", requiredPoints: 0 },
      { name: "火之加護", cost: 10, power: 0, kind: "elementalWardParty", stat: "magic", element: "火", duration: 4, school: "加護系", branch: "加護系", requiredPoints: 3 },
      { name: "風之加護", cost: 10, power: 0, kind: "elementalWardParty", stat: "magic", element: "風", duration: 4, school: "加護系", branch: "加護系", requiredPoints: 6 },
      { name: "地之加護", cost: 10, power: 0, kind: "elementalWardParty", stat: "magic", element: "地", duration: 4, school: "加護系", branch: "加護系", requiredPoints: 9 },
      { name: "聖槍", cost: 12, power: 1.75, kind: "attack", stat: "attack", element: "日", school: "騎士道", branch: "騎士道", requiredPoints: 0 },
      { name: "大十字", cost: 16, power: 1.85, kind: "attackAll", stat: "attack", element: "日", school: "騎士道", branch: "騎士道", requiredPoints: 3 },
      { name: "奇蹟之劍", cost: 16, power: 1.8, kind: "attackDrain", stat: "attack", element: "日", school: "騎士道", branch: "騎士道", requiredPoints: 6 },
      { name: "神聖投槍", cost: 20, power: 2.4, kind: "attack", stat: "attack", element: "日", school: "騎士道", branch: "騎士道", requiredPoints: 9 },
    ],
    "暗殺者": [
      { name: "要害攻擊", cost: 10, power: 1.85, kind: "attackIgnoreDefense", stat: "attack", school: "致死系", branch: "致死系", requiredPoints: 0 },
      { name: "致死匕首", cost: 14, power: 1.6, kind: "attackInstantDeath", stat: "attack", chance: 0.05, school: "致死系", branch: "致死系", requiredPoints: 3 },
      { name: "異常調配", cost: 16, power: 0, kind: "randomAilmentAll", stat: "attack", chance: 1, duration: 3, school: "致死系", branch: "致死系", requiredPoints: 6 },
      { name: "處刑", cost: 18, power: 3.0, kind: "executeAilment", stat: "attack", school: "致死系", branch: "致死系", requiredPoints: 9 },
      { name: "神速", cost: 8, power: 0, kind: "buffSpeedSingleStrong", stat: "speed", duration: 3, school: "生存系", branch: "生存系", requiredPoints: 0 },
      { name: "卸甲", cost: 12, power: 1.7, kind: "attackDebuffDefense", stat: "attack", duration: 4, school: "生存系", branch: "生存系", requiredPoints: 3 },
      { name: "迴避反擊", cost: 12, power: 0, kind: "evadeCounter", stat: "speed", duration: 3, school: "生存系", branch: "生存系", requiredPoints: 6 },
      { name: "新月", cost: 10, power: 1.35, kind: "attack", stat: "magic", element: "月", school: "月", branch: "月", requiredPoints: 0 },
      { name: "上弦月", cost: 14, power: 0, kind: "debuffDefenseAll", stat: "magic", element: "月", duration: 4, school: "月", branch: "月", requiredPoints: 3 },
      { name: "下弦月", cost: 14, power: 0, kind: "debuffResistanceAll", stat: "magic", element: "月", duration: 4, school: "月", branch: "月", requiredPoints: 6 },
      { name: "滿月", cost: 18, power: 1.85, kind: "attackAll", stat: "magic", element: "月", school: "月", branch: "月", requiredPoints: 9 },
      { name: "無月", cost: 20, power: 2.35, kind: "attack", stat: "magic", element: "月", school: "月", branch: "月", requiredPoints: 12 },
      { name: "月亮追逐者", cost: 26, power: 3.15, kind: "attack", stat: "magic", element: "月", school: "月", branch: "月", requiredPoints: 15 },
    ],
    "勇者": [
      { name: "雷鳴斬", cost: 16, power: 1.8, kind: "attack", stat: "attack", element: "雷", school: "勇者系", branch: "勇者系", requiredPoints: 0 },
      { name: "羈絆", cost: 18, power: 0, kind: "buffAllParty", stat: "magic", duration: 4, school: "勇者系", branch: "勇者系", requiredPoints: 3 },
      { name: "超級斬", cost: 22, power: 2.3, kind: "attackAll", stat: "attack", element: "雷", school: "勇者系", branch: "勇者系", requiredPoints: 6 },
      { name: "輝煌聖劍", cost: 30, power: 3.25, kind: "attack", stat: "attack", element: "雷", school: "勇者系", branch: "勇者系", requiredPoints: 9 },
      { name: "超越者", cost: 0, power: 0, kind: "superTranscend", stat: "magic", duration: 5, school: "勇者系", branch: "勇者系", requiredPoints: 12 },
      { name: "落雷", cost: 10, power: 1.3, kind: "attackParalyze", stat: "magic", element: "雷", chance: 0.3, duration: 3, school: "雷霆系", branch: "雷霆系", requiredPoints: 0 },
      { name: "雷電", cost: 14, power: 1.15, kind: "attackAllParalyze", stat: "magic", element: "雷", chance: 0.3, duration: 3, school: "雷霆系", branch: "雷霆系", requiredPoints: 3 },
      { name: "閃電球", cost: 18, power: 1.85, kind: "attackParalyze", stat: "magic", element: "雷", chance: 0.35, duration: 3, school: "雷霆系", branch: "雷霆系", requiredPoints: 6 },
      { name: "雷電牢獄", cost: 24, power: 2.25, kind: "attackAllParalyze", stat: "magic", element: "雷", chance: 0.4, duration: 3, school: "雷霆系", branch: "雷霆系", requiredPoints: 9 },
      { name: "神罰天雷", cost: 30, power: 3.2, kind: "attackParalyze", stat: "magic", element: "雷", chance: 0.45, duration: 3, school: "雷霆系", branch: "雷霆系", requiredPoints: 12 },
    ],
    "魔王": [
      { name: "墮落斬", cost: 16, power: 1.85, kind: "attackDualElement", stat: "attack", element: "地|月", school: "魔王系", branch: "魔王系", requiredPoints: 0 },
      { name: "魔力超載", cost: 18, power: 0.5, kind: "overloadMagic", stat: "magic", duration: 5, school: "魔王系", branch: "魔王系", requiredPoints: 3 },
      { name: "月之波動", cost: 24, power: 2.25, kind: "attackAll", stat: "attack", element: "月", school: "魔王系", branch: "魔王系", requiredPoints: 6 },
      { name: "深淵魔劍", cost: 30, power: 3.25, kind: "attackDualElement", stat: "attack", element: "地|月", school: "魔王系", branch: "魔王系", requiredPoints: 9 },
      { name: "超越者", cost: 0, power: 0, kind: "superTranscend", stat: "magic", duration: 5, school: "魔王系", branch: "魔王系", requiredPoints: 12 },
      { name: "碎石波", cost: 10, power: 1.3, kind: "attack", stat: "magic", element: "地", school: "大地", branch: "大地", requiredPoints: 0 },
      { name: "岩刺", cost: 14, power: 1.15, kind: "attackAll", stat: "magic", element: "地", school: "大地", branch: "大地", requiredPoints: 3 },
      { name: "大地之槍", cost: 18, power: 1.85, kind: "attack", stat: "magic", element: "地", school: "大地", branch: "大地", requiredPoints: 6 },
      { name: "大地震", cost: 24, power: 2.25, kind: "attackAllStun", stat: "magic", element: "地", chance: 0.3, duration: 1, school: "大地", branch: "大地", requiredPoints: 9 },
      { name: "蓋亞之怒", cost: 30, power: 3.1, kind: "attackAll", stat: "magic", element: "地", school: "大地", branch: "大地", requiredPoints: 12 },
    ],
  };

  Object.entries(advancedSkills).forEach(([className, skills]) => {
    data.classSkills[className] = skills.map(skill => ({ ...skill }));
  });
  delete data.classSkills["劍聖"];
  delete data.classSkills["聖人"];
}


const offensiveSkillKinds = new Set([
  "attack", "attackAll", "attackRandom", "attackAllMulti", "attackDebuffDefense", "attackDebuffAttack", "attackDebuffResistance",
  "attackPoison", "attackSleep", "attackBlind", "attackTrap", "attackDebuffSpeed", "attackStun", "attackFreeze", "attackBurn", "attackAllPoison", "attackAllFreeze", "attackAllBurn",
  "multiHit", "attackIgnoreDefense", "attackParalyze", "attackAllParalyze", "attackDualElement", "attackAllStun", "attackDrain",
  "attackBuffSpeed", "chiBlast", "attackAfterimage", "steal", "riskyTriple", "executeAilment", "attackInstantDeath", "allStun",
  "fearAll", "debuffDefenseAll", "debuffResistanceAll", "randomAilmentAll", "multiHitStun"
]);

function skillDamageWeight(skill) {
  const power = Number(skill?.power || 0);
  const hits = Math.max(1, Number(skill?.hits || 1));
  if (skill?.kind === "multiHit" || skill?.kind === "multiHitStun" || skill?.kind === "attackRandom" || skill?.kind === "attackAllMulti") {
    return power * hits;
  }
  return power;
}

const skillTierOverrides = {
  "火球": "weak",
};

function classifyDamageTier(skill) {
  if (skill?.name && skillTierOverrides[skill.name]) {
    return skillTierOverrides[skill.name];
  }
  const weight = skillDamageWeight(skill);
  if (weight <= 0) return null;
  if (weight >= 3.4) return "max";
  if (weight >= 2.1) return "large";
  if (weight >= 1.6) return "medium";
  return "weak";
}

function tierTargetPower(tier) {
  return {
    weak: 1.5,
    medium: 2.5,
    large: 3.5,
    max: 5.0,
  }[tier] || 0;
}

function powerForSkillTier(skill, tier) {
  const target = tierTargetPower(tier);
  const hits = Math.max(1, Number(skill?.hits || 1));
  if (skill?.kind === "multiHit" || skill?.kind === "multiHitStun" || skill?.kind === "attackRandom" || skill?.kind === "attackAllMulti") {
    return Number((target / hits).toFixed(2));
  }
  return target;
}

function tierBaseCost(tier) {
  return {
    weak: 12,
    medium: 18,
    large: 28,
    max: 40,
  }[tier] || 0;
}

function skillCostModifier(skill) {
  if (skill?.kind === "attackAllMulti") return 8;
  if (["attackAll", "attackAllStun", "attackAllParalyze", "attackAllPoison", "attackAllFreeze", "attackAllBurn"].includes(skill?.kind)) return 6;
  if (skill?.kind === "attackRandom") return 5;
  if (skill?.kind === "multiHit" || skill?.kind === "multiHitStun") return 4;
  if (["attackIgnoreDefense", "attackDualElement", "attackDrain", "riskyTriple", "executeAilment", "attackInstantDeath", "allStun", "fearAll", "randomAilmentAll"].includes(skill?.kind)) return 5;
  if (["attackDebuffDefense", "attackDebuffAttack", "attackDebuffResistance", "attackPoison", "attackSleep", "attackBlind", "attackTrap", "attackDebuffSpeed", "attackStun", "attackFreeze", "attackBurn", "attackParalyze", "attackBuffSpeed", "chiBlast", "attackAfterimage", "steal", "debuffDefenseAll", "debuffResistanceAll"].includes(skill?.kind)) return 3;
  return 0;
}

function rebalanceSkillData() {
  Object.values(data.classSkills || {}).forEach(skills => {
    skills.forEach(skill => {
      if (!offensiveSkillKinds.has(skill.kind)) return;
      const tier = classifyDamageTier(skill);
      if (!tier) return;
      skill.power = powerForSkillTier(skill, tier);
      const originalCost = Math.max(0, Number(skill.cost || 0));
      if (originalCost <= 0) return;
      const raisedCost = Math.ceil(originalCost * 1.5);
      skill.cost = Math.max(raisedCost, tierBaseCost(tier) + skillCostModifier(skill));
    });
  });
}

function monsterTierBaseCost(tier) {
  return {
    weak: 6,
    medium: 10,
    large: 16,
    max: 24,
  }[tier] || 0;
}

function monsterSkillCostModifier(skill) {
  if (skill?.kind === "attackAllMulti") return 5;
  if (["attackAll", "attackAllStun", "attackAllParalyze", "attackAllPoison", "attackAllFreeze", "attackAllBurn"].includes(skill?.kind) || skill?.targetScope === "all_party") return 4;
  if (skill?.kind === "attackRandom") return 3;
  if (skill?.kind === "multiHit" || skill?.kind === "multiHitStun") return 3;
  if (["attackIgnoreDefense", "attackDualElement", "attackDrain", "riskyTriple", "executeAilment", "attackInstantDeath", "allStun", "fearAll", "randomAilmentAll"].includes(skill?.kind)) return 3;
  if (["attackDebuffDefense", "attackDebuffAttack", "attackDebuffResistance", "attackPoison", "attackSleep", "attackBlind", "attackTrap", "attackDebuffSpeed", "attackStun", "attackFreeze", "attackBurn", "attackParalyze", "attackBuffSpeed", "chiBlast", "attackAfterimage", "steal", "debuffDefenseAll", "debuffResistanceAll"].includes(skill?.kind)) return 2;
  return 0;
}

function rebalanceMonsterSkillData() {
  Object.values(data.monsterSkills || {}).forEach(skills => {
    skills.forEach(skill => {
      if (!offensiveSkillKinds.has(skill.kind)) return;
      const tier = classifyDamageTier(skill);
      if (!tier) return;
      skill.power = powerForSkillTier(skill, tier);
      const originalCost = Math.max(0, Number(skill.cost || 0));
      if (originalCost <= 0) return;
      const raisedCost = Math.ceil(originalCost * 1.35);
      skill.cost = Math.max(raisedCost, monsterTierBaseCost(tier) + monsterSkillCostModifier(skill));
    });
  });
}

function normalizeGroupMagicKinds() {
  const groupKindOverrides = {
    "酸雨": "attackAllPoison",
    "暴風雪": "attackAllFreeze",
    "焦土": "attackAllBurn",
  };
  Object.values(data.classSkills || {}).forEach(skills => {
    skills.forEach(skill => {
      const overrideKind = groupKindOverrides[skill.name];
      if (overrideKind) {
        skill.kind = overrideKind;
      }
    });
  });
}

function transaction(storeName, mode, action) {
  return new Promise((resolve, reject) => {
    if (!state.db) {
      reject(new Error("database unavailable"));
      return;
    }
    const tx = state.db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = action(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === "\"") {
      if (inQuotes && next === "\"") {
        cell += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some(value => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    if (row.some(value => value !== "")) rows.push(row);
  }
  const [headers, ...body] = rows;
  return (body || []).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

async function loadCsvRows(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`無法讀取 ${path}`);
  }
  return parseCsv(await response.text());
}

function toNumber(value) {
  if (value === "" || value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function csvItemToCatalogEntry(row) {
  const bonuses = {};
  const mapping = {
    max_hp_bonus: "maxHp",
    max_mp_bonus: "maxMp",
    attack_bonus: "attack",
    defense_bonus: "defense",
    magic_bonus: "magic",
    resistance_bonus: "resistance",
    speed_bonus: "speed",
    luck_bonus: "luck",
  };
  Object.entries(mapping).forEach(([csvKey, statKey]) => {
    const amount = toNumber(row[csvKey]);
    if (amount) bonuses[statKey] = amount;
  });
  const entry = {
    key: row.key,
    name: row.name,
    type: row.type,
    price: toNumber(row.price),
    description: row.description,
  };
  if (row.slot) entry.slot = row.slot;
  if (row.weapon_type) entry.weaponType = row.weapon_type;
  if (row.armor_class) entry.armorClass = row.armor_class;
  const exclusiveClasses = row.exclusive_classes || row.exclusive_classes_csv;
  if (exclusiveClasses) entry.exclusiveClasses = exclusiveClasses.split("|").map(value => value.trim()).filter(Boolean);
  if (row.image_path) entry.imagePath = row.image_path;
  if (row.element) entry.element = row.element;
  if (Object.keys(bonuses).length) entry.bonuses = bonuses;
  if (row.type === "consumable") {
    if (toNumber(row.heal_hp)) entry.healHp = toNumber(row.heal_hp);
    if (toNumber(row.heal_mp)) entry.healMp = toNumber(row.heal_mp);
    if (row.target_scope) entry.targetScope = row.target_scope;
    if (Number(row.revive_hp_percent) > 0) entry.reviveHpPercent = Number(row.revive_hp_percent);
    if (row.cure_ailments) entry.cureAilments = row.cure_ailments.split("|").map(value => value.trim()).filter(Boolean);
  }
  return entry;
}

function csvMonsterToEntry(row) {
  return {
    code: row.code,
    name: row.name,
    category: row.category,
    ...(row.story_order ? { storyOrder: toNumber(row.story_order) } : {}),
    level: toNumber(row.level),
    elements: row.elements ? row.elements.split("|") : [],
    hp: toNumber(row.hp),
    mp: toNumber(row.mp),
    attack: toNumber(row.attack),
    defense: toNumber(row.defense),
    magic: toNumber(row.magic),
    resistance: toNumber(row.resistance),
    speed: toNumber(row.speed),
    luck: toNumber(row.luck),
    exp: toNumber(row.exp),
    gold: toNumber(row.gold),
    note: row.note,
    dropTable: row.drop_table || "",
    drops: row.drops ? row.drops.split("|") : [],
    imagePath: row.image_path || "",
  };
}

function csvAreaToEntry(row) {
  return {
    id: row.area_id,
    name: row.name,
    category: row.category,
    storyStage: toNumber(row.story_stage),
    minLevel: toNumber(row.min_level),
    recommendedLevel: toNumber(row.recommended_level),
    monsterCodes: row.monster_codes ? row.monster_codes.split("|") : [],
    shopPool: row.shop_pool || "",
    theme: row.theme || "meadow",
    description: row.description || "",
  };
}

function csvStoryChapterToEntry(row) {
  return {
    id: row.chapter_id,
    storyStage: toNumber(row.story_stage),
    title: row.title,
    areaId: row.area_id,
    bossCode: row.boss_code,
    summary: row.summary || "",
    rewardGold: toNumber(row.reward_gold),
    rewardItem: row.reward_item || "",
  };
}

function csvQuestToEntry(row) {
  return {
    id: row.quest_id,
    storyStage: toNumber(row.story_stage),
    chapterId: row.chapter_id,
    title: row.title,
    objectiveType: row.objective_type,
    targetCode: row.target_code,
    targetCount: toNumber(row.target_count, 1),
    description: row.description || "",
    rewardExp: toNumber(row.reward_exp),
    rewardGold: toNumber(row.reward_gold),
    rewardItem: row.reward_item || "",
    isMain: toNumber(row.is_main, 1) === 1,
  };
}

function csvMonsterSkillToEntry(row) {
  const skill = {
    name: row.name,
    kind: row.kind,
    stat: row.stat,
    power: toNumber(row.power),
    element: row.element || null,
    cost: toNumber(row.cost),
    targetScope: row.target_scope || "single",
    weight: toNumber(row.weight, 1),
  };
  if (row.chance !== "") skill.chance = toNumber(row.chance);
  if (row.duration !== "") skill.duration = toNumber(row.duration);
  if (row.hits !== "") skill.hits = toNumber(row.hits);
  return skill;
}

function csvSkillToEntry(row) {
  const skill = {
    name: row.name,
    cost: toNumber(row.cost),
    power: toNumber(row.power),
    kind: row.kind,
    stat: row.stat,
    element: row.element || null,
  };
  if (row.chance !== "") skill.chance = toNumber(row.chance);
  if (row.duration !== "") skill.duration = toNumber(row.duration);
  if (row.hits !== "") skill.hits = toNumber(row.hits);
  if (row.school) skill.school = row.school;
  if (row.branch) skill.branch = row.branch;
  if (row.required_points !== "") skill.requiredPoints = toNumber(row.required_points);
  if (row.image_path) skill.imagePath = row.image_path;
  return skill;
}

function csvRaceToEntry(row) {
  return {
    code: row.code,
    name: row.name,
    description: row.description,
    advantage: row.advantage,
    skillName: row.skill_name,
    skillType: row.skill_type,
    skillDescription: row.skill_description,
    bonuses: {
      maxHp: toNumber(row.max_hp_bonus),
      maxMp: toNumber(row.max_mp_bonus),
      attack: toNumber(row.attack_bonus),
      defense: toNumber(row.defense_bonus),
      magic: toNumber(row.magic_bonus),
      resistance: toNumber(row.resistance_bonus),
      speed: toNumber(row.speed_bonus),
      luck: toNumber(row.luck_bonus),
    },
  };
}

function csvClassToEntry(row) {
  return {
    code: row.code,
    name: row.name,
    armorType: row.armor_type,
    description: row.description,
    advantage: row.advantage,
    branches: row.branches ? row.branches.split("|") : [],
    bonuses: {
      maxHp: toNumber(row.max_hp_bonus),
      maxMp: toNumber(row.max_mp_bonus),
      attack: toNumber(row.attack_bonus),
      defense: toNumber(row.defense_bonus),
      magic: toNumber(row.magic_bonus),
      resistance: toNumber(row.resistance_bonus),
      speed: toNumber(row.speed_bonus),
      luck: toNumber(row.luck_bonus),
    },
  };
}

function buildEquipRules(rows) {
  const weaponRules = {};
  const armorRules = {};
  rows.forEach(row => {
    weaponRules[row.class_name] = row.weapon_types ? row.weapon_types.split("|") : [];
    armorRules[row.class_name] = row.armor_classes ? row.armor_classes.split("|") : [];
  });
  return { weaponRules, armorRules };
}

function buildShopPools(rows) {
  return rows.reduce((acc, row) => {
    if (!acc[row.pool_id]) acc[row.pool_id] = [];
    acc[row.pool_id].push({
      itemKey: row.item_key,
      weight: Math.max(1, toNumber(row.weight)),
      minLevel: toNumber(row.min_level),
      maxLevel: toNumber(row.max_level) || 999,
    });
    return acc;
  }, {});
}

function buildDropTables(rows) {
  return rows.reduce((acc, row) => {
    if (!acc[row.table_id]) acc[row.table_id] = [];
    acc[row.table_id].push({
      itemKey: row.item_key,
      weight: Math.max(1, toNumber(row.weight)),
      minQty: Math.max(1, toNumber(row.min_qty) || 1),
      maxQty: Math.max(1, toNumber(row.max_qty) || 1),
    });
    return acc;
  }, {});
}

function buildClassSkills(rows) {
  return rows.reduce((acc, row) => {
    if (!acc[row.class_name]) acc[row.class_name] = [];
    acc[row.class_name].push(csvSkillToEntry(row));
    return acc;
  }, {});
}

function buildBranchEffects(rows) {
  return rows.reduce((acc, row) => {
    acc[row.branch_name] = [row.stat_key, toNumber(row.value)];
    return acc;
  }, {});
}

function buildClassGrowth(rows) {
  return rows.reduce((acc, row) => {
    acc[row.class_name] = {
      maxHp: toNumber(row.max_hp),
      maxMp: toNumber(row.max_mp),
      attack: toNumber(row.attack),
      defense: toNumber(row.defense),
      magic: toNumber(row.magic),
      resistance: toNumber(row.resistance),
      speed: toNumber(row.speed),
      luck: toNumber(row.luck),
    };
    return acc;
  }, {});
}

function buildMonsterSkills(rows) {
  return rows.reduce((acc, row) => {
    if (!acc[row.monster_code]) acc[row.monster_code] = [];
    acc[row.monster_code].push(csvMonsterSkillToEntry(row));
    return acc;
  }, {});
}

async function loadCsvDatabases() {
  try {
    const [raceRows, classRows, branchRows, growthRows, equipmentRows, consumableRows, monsterRows, equipRuleRows, shopRows, dropRows, areaRows, skillRows, chapterRows, questRows, monsterSkillRows] = await Promise.all([
      loadCsvRows("data/csv/races.csv"),
      loadCsvRows("data/csv/classes.csv"),
      loadCsvRows("data/csv/branch_effects.csv"),
      loadCsvRows("data/csv/class_growth.csv"),
      loadCsvRows("data/csv/equipment.csv"),
      loadCsvRows("data/csv/consumables.csv"),
      loadCsvRows("data/csv/monsters.csv"),
      loadCsvRows("data/csv/equip_rules.csv"),
      loadCsvRows("data/csv/shop_items.csv"),
      loadCsvRows("data/csv/drop_tables.csv"),
      loadCsvRows("data/csv/areas.csv"),
      loadCsvRows("data/csv/skills.csv"),
      loadCsvRows("data/csv/story_chapters.csv"),
      loadCsvRows("data/csv/quests.csv"),
      loadCsvRows("data/csv/monster_skills.csv"),
    ]);
    if (raceRows.length) {
      data.races = raceRows.map(csvRaceToEntry);
    }
    if (classRows.length) {
      data.classes = classRows.map(csvClassToEntry);
    }
    if (branchRows.length) {
      data.branchEffects = buildBranchEffects(branchRows);
    }
    if (growthRows.length) {
      state.classGrowth = buildClassGrowth(growthRows);
    }
    const itemEntries = {}
    equipmentRows.concat(consumableRows).forEach(row => {
      itemEntries[row.key] = csvItemToCatalogEntry(row);
    });
    if (Object.keys(itemEntries).length) {
      data.itemCatalog = itemEntries;
      data.shopItems = equipmentRows.filter(row => toNumber(row.price) > 0 && row.slot).slice(0, 24).map(row => row.key);
      if (!data.shopItems.includes("potion_hp_s")) data.shopItems.unshift("potion_hp_s");
      if (!data.shopItems.includes("potion_mp_s")) data.shopItems.splice(1, 0, "potion_mp_s");
    }
    if (monsterRows.length) {
      data.monsters = monsterRows.map(csvMonsterToEntry);
    }
    if (skillRows.length) {
      data.classSkills = buildClassSkills(skillRows);
    }
    if (equipRuleRows.length) {
      state.equipRules = buildEquipRules(equipRuleRows);
    }
    data.shopPools = buildShopPools(shopRows);
    data.dropTables = buildDropTables(dropRows);
    data.areas = areaRows.map(csvAreaToEntry);
    data.storyChapters = chapterRows.map(csvStoryChapterToEntry);
    data.quests = questRows.map(csvQuestToEntry);
    data.monsterSkills = buildMonsterSkills(monsterSkillRows);
    state.csvLoaded = true;
  } catch (error) {
    console.warn("CSV 資料載入失敗，改用內建資料。", error);
    state.csvLoaded = false;
    state.equipRules = structuredClone(defaultEquipRules);
    state.classGrowth = structuredClone(classAutoGrowth);
    data.shopPools = {};
    data.dropTables = {};
    data.areas = [];
    data.storyChapters = [];
    data.quests = [];
    data.monsterSkills = {};
  }
  ensureAdvancedClassData();
  ensureAdvancedClassSkills();
  normalizeGroupMagicKinds();
  rebalanceSkillData();
  rebalanceMonsterSkillData();
}

function renderMenu() {
  let items;
  if (state.currentPlayer) {
    items = [
      ["\u5192\u96aa\u9996\u9801", renderGameHub],
      ["\u89d2\u8272\u72c0\u614b", renderStatus],
      ["\u88dd\u5099", renderEquipmentPage],
      ["\u80cc\u5305", renderInventory],
      ["\u5546\u5e97", renderShop],
      ["\u540c\u4f34", renderCompanions],
      ["\u6280\u80fd\u6a39", renderSkillTree],
      ["\u91ce\u5916\u6230\u9b25", () => startBattle("normal")],
      ["\u526f\u672c\u6230\u9b25", () => startBattle("dungeon")],
      ["\u4e3b\u7dda\u6230\u9b25", () => startBattle("story")],
      ["\u4f11\u606f\u6062\u5fa9", restPlayer],
      ["\u5132\u5b58\u89d2\u8272", saveCurrentPlayer],
      ["\u8fd4\u56de\u6a19\u984c", leaveCurrentPlayer],
    ];
  } else if (state.auth.enabled && !state.auth.user) {
    items = [
      ["\u6a19\u984c\u9801", renderHome],
      ["\u767b\u5165", () => renderAuthScreen("login")],
      ["\u8a3b\u518a", () => renderAuthScreen("register")],
    ];
  } else {
    items = [
      ["\u6a19\u984c\u9801", renderHome],
      ["\u5efa\u7acb\u89d2\u8272", renderCreateCharacter],
      ["\u8b80\u53d6\u89d2\u8272", renderLoadGame],
    ];
  }
  if (state.auth.profile?.role === "admin") {
    items.push(["\u5e33\u865f\u7ba1\u7406", renderAdminPanel]);
  }
  if (state.auth.user) {
    items.push(["\u767b\u51fa", signOutAccount]);
  }
  menu.innerHTML = "";
  items.forEach(([label, handler]) => {
    const button = document.createElement("button");
    button.className = "menu-button";
    button.textContent = label;
    button.addEventListener("click", handler);
    menu.appendChild(button);
  });
  if (state.currentPlayer) {
    heroActions.innerHTML = `
      <button class="primary" type="button" id="hero-status">\u89d2\u8272\u72c0\u614b</button>
      <button class="secondary" type="button" id="hero-save">\u5132\u5b58\u89d2\u8272</button>
    `;
    document.querySelector("#hero-status").addEventListener("click", renderStatus);
    document.querySelector("#hero-save").addEventListener("click", saveCurrentPlayer);
  } else if (state.auth.enabled && !state.auth.user) {
    heroActions.innerHTML = `
      <button class="primary" type="button" id="hero-login">\u767b\u5165</button>
      <button class="secondary" type="button" id="hero-register">\u8a3b\u518a</button>
    `;
    document.querySelector("#hero-login").addEventListener("click", () => renderAuthScreen("login"));
    document.querySelector("#hero-register").addEventListener("click", () => renderAuthScreen("register"));
  } else {
    heroActions.innerHTML = `
      <button class="primary" type="button" id="hero-start">\u5efa\u7acb\u89d2\u8272</button>
      <button class="secondary" type="button" id="hero-load">\u8b80\u53d6\u89d2\u8272</button>
    `;
    document.querySelector("#hero-start").addEventListener("click", renderCreateCharacter);
    document.querySelector("#hero-load").addEventListener("click", renderLoadGame);
  }
}

function renderHome() {
  state.screen = "landing";
  applyAreaTheme(null);
  renderMenu();
  if (state.auth.enabled && !state.auth.user) {
    app.innerHTML = `
      <h3>\u767b\u5165\u5f8c\u958b\u59cb\u5192\u96aa</h3>
      <p class="hint">\u76ee\u524d\u7ad9\u9ede\u5df2\u555f\u7528\u5e33\u865f\u6a21\u5f0f\u3002\u4e00\u822c\u4f7f\u7528\u8005\u767b\u5165\u5f8c\u5373\u53ef\u904a\u73a9\uff1b\u7ba1\u7406\u8005\u9664\u4e86\u904a\u73a9\uff0c\u4e5f\u80fd\u7ba1\u7406\u5e33\u865f\u89d2\u8272\u8207\u5176\u4ed6\u5e33\u865f\u7684\u5b58\u6a94\u6b0a\u9650\u3002</p>
      <div class="inline-actions">
        <button class="primary" type="button" id="go-login">\u767b\u5165</button>
        <button class="secondary" type="button" id="go-register">\u8a3b\u518a</button>
      </div>
    `;
    document.querySelector("#go-login").addEventListener("click", () => renderAuthScreen("login"));
    document.querySelector("#go-register").addEventListener("click", () => renderAuthScreen("register"));
    return;
  }
  app.innerHTML = `
    <h3>\u8cc7\u6599\u9a45\u52d5\u7684\u6587\u5b57\u5192\u96aa</h3>
    <p class="hint">\u4f60\u53ef\u4ee5\u5efa\u7acb\u89d2\u8272\u3001\u8b80\u53d6\u5b58\u6a94\u3001\u57f9\u990a\u591a\u8077\u696d\u89d2\u8272\uff0c\u4e26\u5728\u5730\u5340\u4e4b\u9593\u5192\u96aa\u3001\u6230\u9b25\u8207\u63a8\u9032\u4e3b\u7dda\u3002</p>
    <p class="hint">${state.csvLoaded ? "\u5df2\u8f09\u5165 data/csv \u8cc7\u6599\u5eab\uff0c\u904a\u6232\u6703\u512a\u5148\u4f7f\u7528\u8cc7\u6599\u8868\u5167\u5bb9\u3002" : "\u76ee\u524d\u4f7f\u7528\u5167\u5efa\u8cc7\u6599\u3002\u82e5\u7ad9\u9ede\u672a\u6210\u529f\u8f09\u5165 data/csv\uff0c\u6703\u81ea\u52d5\u9000\u56de\u5167\u5efa\u8cc7\u6599\u3002"}</p>
    ${state.auth.user ? `<p class="hint">\u76ee\u524d\u767b\u5165\uff1a${state.auth.profile?.display_name || state.auth.user.email}\uff5c\u8eab\u5206\uff1a${state.auth.profile?.role === "admin" ? "\u7ba1\u7406\u8005" : "\u4e00\u822c\u4f7f\u7528\u8005"}\uff5c\u5b58\u6a94\u6b0a\u9650\uff1a${state.auth.profile?.save_permission || "owner_write"}</p>` : ""}
    <div class="card-grid">
      <div class="stat"><strong>\u89d2\u8272\u6d41\u7a0b</strong><p>\u5efa\u7acb\u89d2\u8272\u5f8c\u5373\u53ef\u958b\u59cb\u5192\u96aa\uff0c\u4e5f\u80fd\u96a8\u6642\u8b80\u53d6\u4f60\u81ea\u5df1\u7684\u5e33\u865f\u5b58\u6a94\u3002</p></div>
      <div class="stat"><strong>\u5b58\u6a94\u65b9\u5f0f</strong><p>\u672c\u6a5f\u6a21\u5f0f\u6703\u4f7f\u7528 IndexedDB \u6216 localStorage\uff1b\u767b\u5165\u5f8c\u4e5f\u80fd\u4f7f\u7528\u96f2\u7aef\u5b58\u6a94\u3002</p></div>
      <div class="stat"><strong>\u8cc7\u6599\u4f86\u6e90</strong><p>\u88dd\u5099\u3001\u6280\u80fd\u3001\u602a\u7269\u3001\u4e3b\u7dda\u3001\u5730\u5340\u7b49\u4e3b\u8981\u8cc7\u6599\u7531 CSV \u9a45\u52d5\u3002</p></div>
    </div>
  `;
}

function renderAuthScreen(mode = "login") {
  const authUrl = `./login.html?mode=${encodeURIComponent(mode)}`;
  window.location.href = authUrl;
}

async function renderAdminPanel() {
  window.location.href = "./admin.html";
}

function renderCreateCharacter() {
  if (state.auth.enabled && !state.auth.user) {
    toast("\u8acb\u5148\u767b\u5165\u5f8c\u518d\u5efa\u7acb\u89d2\u8272\u3002", "warning");
    renderAuthScreen("login");
    return;
  }
  state.screen = "create";
  applyAreaTheme(null);
  renderMenu();
  const raceCards = data.races.map(race => choiceCard(race.name, race.description, race.advantage, "race", race.code)).join("");
  const classCards = data.classes
    .filter(job => !(job.requirements?.length))
    .map(job => choiceCard(job.name, job.description, job.advantage, "class", job.code))
    .join("");
  app.innerHTML = `
    <h3>\u5efa\u7acb\u65b0\u89d2\u8272</h3>
    <div class="spacer"></div>
    <label>\u89d2\u8272\u540d\u7a31</label>
    <input type="text" id="player-name" placeholder="\u8acb\u8f38\u5165\u89d2\u8272\u540d\u7a31">
    <div class="spacer"></div>
    <h3>\u9078\u64c7\u7a2e\u65cf</h3>
    <div class="card-grid">${raceCards}</div>
    <div class="spacer"></div>
    <h3>\u9078\u64c7\u8077\u696d</h3>
    <div class="card-grid">${classCards}</div>
    <div class="spacer"></div>
    <div class="inline-actions">
      <button class="primary" type="button" id="create-player">\u5efa\u7acb\u89d2\u8272</button>
    </div>
  `;
  bindChoiceCards();
  document.querySelector("#create-player").addEventListener("click", async () => {
    const name = document.querySelector("#player-name").value.trim();
    const raceCode = document.querySelector(".choice-card[data-group='race'].selected")?.dataset.code;
    const classCode = document.querySelector(".choice-card[data-group='class'].selected")?.dataset.code;
    if (!name || !raceCode || !classCode) {
      return toast("\u8acb\u5b8c\u6574\u586b\u5beb\u540d\u7a31\u3001\u7a2e\u65cf\u8207\u8077\u696d\u3002", "warning");
    }
    const player = buildPlayer(name, raceCode, classCode);
    normalizePlayer(player);
    player.id = await dbApi.addPlayer(player);
    state.currentPlayer = player;
    renderGameHub("\u89d2\u8272\u5efa\u7acb\u5b8c\u6210\uff0c\u6e96\u5099\u5c55\u958b\u5192\u96aa\u3002");
  });
}

function renderLoadGame() {
  if (state.auth.enabled && !state.auth.user) {
    toast("\u8acb\u5148\u767b\u5165\u5f8c\u518d\u8b80\u53d6\u89d2\u8272\u3002", "warning");
    renderAuthScreen("login");
    return;
  }
  state.screen = "load";
  applyAreaTheme(null);
  renderMenu();
  dbApi.getAllPlayers().then(players => {
    if (!players.length) {
      app.innerHTML = `<h3>\u8b80\u53d6\u89d2\u8272</h3><p class="hint">\u76ee\u524d\u6c92\u6709\u53ef\u8b80\u53d6\u7684\u89d2\u8272\uff0c\u5148\u5efa\u7acb\u4e00\u4f4d\u65b0\u7684\u5192\u96aa\u8005\u5427\u3002</p>`;
      return;
    }
    app.innerHTML = `
      <h3>\u8b80\u53d6\u89d2\u8272</h3>
      <div class="card-grid">
        ${players.map(player => `
          <div class="save-card">
            <h4>${player.name}</h4>
            <p>${player.raceName} / ${player.className}</p>
            <p>Lv.${player.level} | \u8077\u696d Lv.${player.classLevel}</p>
            <button type="button" data-load-id="${player.id}">\u8b80\u53d6</button>
          </div>
        `).join("")}
      </div>
    `;
    app.querySelectorAll("[data-load-id]").forEach(button => {
      button.addEventListener("click", async () => {
        state.currentPlayer = await dbApi.getPlayer(button.dataset.loadId);
        normalizePlayer(state.currentPlayer);
        renderGameHub("\u89d2\u8272\u8b80\u53d6\u6210\u529f\uff0c\u6b61\u8fce\u56de\u4f86\u3002");
      });
    });
  });
}

function availableAreas(category, player) {
  if (!data.areas?.length) return [];
  return data.areas.filter(area => {
    if (area.category !== category) return false;
    if (category === "story") return area.storyStage === player.storyStage;
    if (area.storyStage && area.storyStage > player.storyStage) return false;
    return player.level >= Math.max(1, area.minLevel || 1);
  });
}

function getAreaById(areaId) {
  return data.areas?.find(area => area.id === areaId) || null;
}

function currentAreaForPlayer(player) {
  if (!player) return null;
  const preferred = getAreaById(player.currentAreaId);
  if (preferred) {
    if (preferred.category === "story") {
      if (preferred.storyStage === player.storyStage) return preferred;
    } else if (player.level >= Math.max(1, preferred.minLevel || 1)) {
      return preferred;
    }
  }
  return availableAreas("story", player)[0] || availableAreas("normal", player)[0] || availableAreas("dungeon", player)[0] || null;
}

function currentStoryChapter(player) {
  return data.storyChapters?.find(chapter => chapter.storyStage === player.storyStage) || null;
}

function currentMainQuest(player) {
  return data.quests?.find(quest => quest.storyStage === player.storyStage && quest.isMain) || null;
}

function rewardItemKeys(value) {
  return String(value || "").split("|").map(item => item.trim()).filter(Boolean);
}

function renderMediaThumb(path, alt, className = "") {
  if (!path) return "";
  const classes = ["media-thumb", className].filter(Boolean).join(" ");
  return `<img class="${classes}" src="${path}" alt="${alt}" loading="lazy" onerror="this.classList.add('hidden');this.removeAttribute('src');">`;
}

function firstElementOf(value) {
  if (!value) return "";
  return String(value).split("|").map(item => item.trim()).find(Boolean) || "";
}

function itemImagePath(item) {
  if (!item) return "";
  if (item.imagePath) return item.imagePath;
  if (imageCatalog.specialItems[item.key]) return imageCatalog.specialItems[item.key];
  if (item.type === "consumable") {
    if (item.key?.includes("potion") || item.healHp || item.healMp) return imageCatalog.consumables.potion;
    if (item.key?.includes("antidote")) return imageCatalog.consumables.remedy;
    return imageCatalog.consumables.misc;
  }
  if (item.weaponType && imageCatalog.weapons[item.weaponType]) return imageCatalog.weapons[item.weaponType];
  if (item.slot && imageCatalog.armor[item.slot]) return imageCatalog.armor[item.slot];
  if (item.element) return imageCatalog.elements[firstElementOf(item.element)] || "";
  return "";
}

function skillImagePath(skill) {
  if (!skill) return "";
  const element = firstElementOf(skill.element);
  if (element && imageCatalog.elements[element]) return imageCatalog.elements[element];
  if (String(skill.kind).includes("heal") || String(skill.kind).includes("cleanse") || skill.kind === "reviveOne") return imageCatalog.support.heal;
  if (String(skill.kind).includes("buff") || skill.kind === "sanctuary" || skill.kind === "statusWardParty") return imageCatalog.support.buff;
  if (String(skill.kind).includes("debuff") || String(skill.kind).includes("Poison") || String(skill.kind).includes("Blind") || String(skill.kind).includes("Trap")) return imageCatalog.support.debuff;
  if (String(skill.kind).includes("magic") || skill.stat === "magic") return imageCatalog.support.arcane;
  return imageCatalog.support.sword;
}

function monsterImagePath(monster) {
  if (!monster) return "";
  const element = firstElementOf((monster.elements || []).join("|"));
  if (element && imageCatalog.elements[element]) return imageCatalog.elements[element];
  return imageCatalog.support.arcane;
}

function applyAreaTheme(area) {
  const theme = area?.theme || "title";
  const screen = state.screen || "landing";
  const backgroundByScreen = {
    landing: "./data/jpg/background/冒險首頁.jpg",
    auth: "./data/jpg/background/登入畫面.jpg",
  };
  const fallbackAreaBackground = "./data/jpg/background/野外探索.jpg";
  const selectedBackground = backgroundByScreen[screen] || (area ? fallbackAreaBackground : backgroundByScreen.landing);
  document.body.dataset.areaTheme = theme;
  document.body.style.setProperty("--bg-image", selectedBackground ? `url("${selectedBackground}")` : "none");
}

function currentShopPoolId(player) {
  const currentArea = currentAreaForPlayer(player);
  if (currentArea?.shopPool) return currentArea.shopPool;
  const available = data.areas?.length
    ? data.areas
        .filter(area => area.shopPool && area.category !== "story" && player.level >= Math.max(1, area.minLevel || 1))
        .sort((a, b) => (a.recommendedLevel || 0) - (b.recommendedLevel || 0))
    : [];
  return available.length ? available[available.length - 1].shopPool : "";
}

function weightedPick(entries) {
  const total = entries.reduce((sum, entry) => sum + Math.max(1, entry.weight || 0), 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= Math.max(1, entry.weight || 0);
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1] || null;
}

function renderGameHub(message = "") {
  if (!state.currentPlayer) return renderHome();
  state.screen = "hub";
  renderMenu();
  const player = state.currentPlayer;
  const normalAreas = availableAreas("normal", player);
  const dungeonAreas = availableAreas("dungeon", player);
  const storyAreas = availableAreas("story", player);
  const currentArea = currentAreaForPlayer(player);
  const chapter = currentStoryChapter(player);
  const quest = currentMainQuest(player);
  const travelAreas = [...normalAreas, ...dungeonAreas, ...storyAreas];
  applyAreaTheme(currentArea);
  app.innerHTML = `
    <h3>冒險首頁</h3>
    ${message ? `<p class="success">${message}</p>` : ""}
    <div class="card-grid">
      <div class="stat">
        <strong>${player.name}</strong>
        <p>${player.raceName} / ${player.className}</p>
        <p>總等級 Lv.${player.level} / 1000 | 職業 Lv.${player.classLevel} / 100</p>
      </div>
      <div class="stat">
        <strong>目前進度</strong>
        <p>主線階段 ${player.storyStage}</p>
        <p>副本通關 ${player.dungeonClears}</p>
      </div>
      <div class="stat">
        <strong>接下來可以做什麼</strong>
        <p>查看狀態、培養技能、野外探索、副本挑戰或推進主線。</p>
      </div>
    </div>
    ${state.csvLoaded ? `
      <div class="spacer"></div>
      <div class="card-grid">
        <div class="stat"><strong>目前所在區域</strong><p>${currentArea ? currentArea.name : "未設定"}</p><p>${currentArea?.description || "尚未選定地區。"}</p></div>
        <div class="stat"><strong>目前主線章節</strong><p>${chapter ? chapter.title : "主線已完成"}</p><p>${chapter?.summary || "目前沒有進行中的章節。"}</p></div>
        <div class="stat"><strong>目前任務</strong><p>${quest ? quest.title : "自由探索"}</p><p>${quest?.description || "可以自由探索現有區域。"}</p></div>
      </div>
      <div class="spacer"></div>
      <div class="card">
        <h4>地區移動</h4>
        <div class="card-grid">
          ${travelAreas.length ? travelAreas.map(area => `
            <div class="stat ${currentArea?.id === area.id ? "area-current" : ""}">
              <strong>${area.name}</strong>
              <p>${area.category === "normal" ? "野外" : area.category === "dungeon" ? "副本" : `主線 ${area.storyStage}`}</p>
              <p>${area.description}</p>
              <button class="secondary" type="button" data-travel-area="${area.id}">${currentArea?.id === area.id ? "目前所在" : "前往此區域"}</button>
            </div>
          `).join("") : `<p class="hint">目前沒有可移動的地區。</p>`}
        </div>
      </div>
    ` : ""}
    <div class="spacer"></div>
    <div class="action-grid">
      <button class="primary" type="button" id="hub-status">角色狀態</button>
      <button class="secondary" type="button" id="hub-equipment">裝備</button>
      <button class="secondary" type="button" id="hub-inventory">背包</button>
      <button class="secondary" type="button" id="hub-shop">商店</button>
      <button class="secondary" type="button" id="hub-companions">同伴</button>
      <button class="secondary" type="button" id="hub-skills">技能樹</button>
      <button class="secondary" type="button" id="hub-normal">野外探索</button>
      <button class="secondary" type="button" id="hub-dungeon">副本挑戰</button>
      <button class="secondary" type="button" id="hub-story">主線推進</button>
    </div>
  `;
  document.querySelector(".action-grid")?.insertAdjacentHTML("beforeend", `<button class="secondary" type="button" id="hub-classes">轉職</button>`);
  document.querySelector("#hub-status").addEventListener("click", () => renderStatus());
  document.querySelector("#hub-equipment").addEventListener("click", () => renderEquipmentPage());
  document.querySelector("#hub-inventory").addEventListener("click", () => renderInventory());
  document.querySelector("#hub-shop").addEventListener("click", () => renderShop());
  document.querySelector("#hub-companions").addEventListener("click", () => renderCompanions());
  document.querySelector("#hub-classes").addEventListener("click", () => renderClassManagement());
  document.querySelector("#hub-skills").addEventListener("click", () => renderSkillTree());
  document.querySelector("#hub-normal").addEventListener("click", () => startBattle("normal"));
  document.querySelector("#hub-dungeon").addEventListener("click", () => startBattle("dungeon"));
  document.querySelector("#hub-story").addEventListener("click", () => startBattle("story"));
  app.querySelectorAll("[data-travel-area]").forEach(button => {
    button.addEventListener("click", async () => {
      player.currentAreaId = button.dataset.travelArea;
      await saveCurrentPlayer(false);
      renderGameHub(`你已移動到 ${getAreaById(player.currentAreaId)?.name || "新區域"}。`);
    });
  });
}

function renderStatus(message = "") {
  if (!state.currentPlayer) {
    return renderHome();
  }
  state.screen = "status";
  renderMenu();
  const player = state.currentPlayer;
  const stats = effectiveStats(player);
  app.innerHTML = `
    <h3>角色狀態</h3>
    ${message ? `<p class="success">${message}</p>` : ""}
    ${renderPageLinks("status")}
    <div class="card-grid">
      <div class="stat">
        <h4>${player.name}</h4>
        <p>${player.raceName} / ${player.className}</p>
        <p>總等級 Lv.${player.level} / 1000 | 職業 Lv.${player.classLevel} / 100</p>
        <p>目前職業 EXP ${player.exp} / ${nextLevelExp(player.classLevel)} | 技能點 ${player.skillPoints}</p>
        <p>金幣 ${player.gold}</p>
      </div>
      <div class="stat">
        <h4>生命與魔力</h4>
        <p>HP ${player.hp} / ${stats.maxHp}</p>
        <p>MP ${player.mp} / ${stats.maxMp}</p>
      </div>
      <div class="stat">
        <h4>種族技能</h4>
        <p>${player.raceSkillName} (${player.raceSkillType})</p>
        <p>${player.raceSkillDescription}</p>
      </div>
    </div>
    <div class="spacer"></div>
    <div class="stat-grid">
      ${statCell("攻擊", stats.attack)}
      ${statCell("防禦", stats.defense)}
      ${statCell("魔法", stats.magic)}
      ${statCell("抵抗", stats.resistance)}
      ${statCell("速度", stats.speed)}
      ${statCell("運氣", stats.luck)}
    </div>
    <div class="spacer"></div>
    <h3>裝備</h3>
    <div class="card-grid">
      ${player.equipment.map(item => renderEquipmentCard(item)).join("")}
    </div>
  `;
  app.insertAdjacentHTML("beforeend", `
    <div class="spacer"></div>
    <h3>職業列表</h3>
    <div class="card-grid">
      ${getPlayerClasses(player).map(classEntry => `
        <div class="stat">
          <strong>${classEntry.className}</strong>
          <p>Lv.${classEntry.classLevel} / 100</p>
          <p>${classEntry.classCode === player.activeClassCode ? "目前職業" : "已解鎖"}</p>
        </div>
      `).join("")}
    </div>
  `);
  attachPageLinks();
}

function renderInventory(message = "") {
  if (!state.currentPlayer) return renderHome();
  state.screen = "inventory";
  renderMenu();
  const player = state.currentPlayer;
  const inventory = player.inventory || [];
  const targeting = state.inventoryTargeting && inventory[state.inventoryTargeting.index]
    ? { index: state.inventoryTargeting.index, item: inventory[state.inventoryTargeting.index] }
    : null;
  const targetOptions = targeting ? targetableMembersForConsumable(player, targeting.item) : [];
  app.innerHTML = `
    <h3>背包</h3>
    ${message ? `<p class="success">${message}</p>` : ""}
    ${renderPageLinks("inventory")}
    <p class="hint">可以在這裡使用消耗品、指定隊友，或更換裝備。</p>
    <div class="card-grid">
      ${inventory.length ? inventory.map((item, index) => `
        <div class="choice-card">
          <div class="card-visual">
            ${renderMediaThumb(itemImagePath(item), item.name)}
            <div><h4>${item.name}</h4></div>
          </div>
          <p>${item.description || ""}</p>
          ${item.weaponType ? `<p>武器種類：${item.weaponType}</p>` : ""}
          ${item.armorClass ? `<p>裝甲種類：${item.armorClass}</p>` : ""}
          ${item.type === "equipment" ? `<p>強度評分：${itemPower(item)}</p><p>${formatItemBonuses(item.bonuses)}</p><p>${compareItemAgainstEquipped(item, player.equipment)}</p>` : ""}
          <p>種類：${item.type === "consumable" ? "消耗品" : "裝備"}${item.quantity ? ` | 數量 ${item.quantity}` : ""}</p>
          ${item.type === "consumable" ? `<p>目標：${consumableTargetLabel(item)}</p>` : ""}
          ${item.element ? `<p class="${elementClassName(item.element)}">屬性：${item.element}</p>` : ""}
          ${item.type === "consumable"
            ? `<button type="button" data-use-index="${index}">${targeting?.index === index ? "重新選擇對象" : "使用"}</button>`
            : `<button type="button" data-equip-index="${index}">裝備</button>`}
        </div>
      `).join("") : `<div class="stat"><p>背包目前是空的。</p></div>`}
    </div>
    ${targeting ? `
      <div class="spacer"></div>
      <div class="card">
        <h4>選擇 ${targeting.item.name} 的使用對象</h4>
        <div class="inline-actions">
          ${targetOptions.length
            ? targetOptions.map(({ member, partyIndex }) => `<button class="action" type="button" data-use-target-party="${partyIndex}">${member.name} HP ${Math.max(0, member.hp)}/${memberMaxStats(member, player).maxHp} | MP ${Math.max(0, member.mp)}/${memberMaxStats(member, player).maxMp}</button>`).join("")
            : `<span class="hint">目前沒有可使用的對象。</span>`}
          <button class="action" type="button" data-use-target-cancel="1">取消</button>
        </div>
      </div>
    ` : ""}
  `;
  app.querySelectorAll("[data-use-index]").forEach(button => {
    button.addEventListener("click", async () => {
      const result = requestInventoryItemUse(Number(button.dataset.useIndex));
      if (result.changed) await saveCurrentPlayer(false);
      renderInventory(result.message);
    });
  });
  app.querySelectorAll("[data-use-target-party]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!state.inventoryTargeting) return;
      const result = useInventoryItem(state.inventoryTargeting.index, { partyIndex: Number(button.dataset.useTargetParty) });
      state.inventoryTargeting = null;
      if (result.ok) await saveCurrentPlayer(false);
      renderInventory(result.message);
    });
  });
  app.querySelectorAll("[data-use-target-cancel]").forEach(button => {
    button.addEventListener("click", () => {
      state.inventoryTargeting = null;
      renderInventory();
    });
  });
  app.querySelectorAll("[data-equip-index]").forEach(button => {
    button.addEventListener("click", async () => {
      const result = equipInventoryItem(Number(button.dataset.equipIndex));
      await saveCurrentPlayer(false);
      renderInventory(result);
    });
  });
  attachPageLinks();
}

function renderEquipmentPage(message = "") {
  if (!state.currentPlayer) return renderHome();
  state.screen = "equipment";
  renderMenu();
  const player = state.currentPlayer;
  app.innerHTML = `
    <h3>裝備頁</h3>
    ${message ? `<p class="success">${message}</p>` : ""}
    ${renderPageLinks("equipment")}
    <p class="hint">在這裡可以確認目前穿戴裝備的數值、強度與屬性，並且卸下裝備。</p>
    <div class="card-grid">
      ${player.equipment.map((item, index) => `
        <div class="choice-card ${item.element ? elementClassName(item.element) : ""}">
          <div class="card-visual">
            ${renderMediaThumb(itemImagePath(item), item.name)}
            <div><h4>${item.slot}：${item.name}</h4></div>
          </div>
          <p>強度評分：${itemPower(item)}</p>
          <p>${formatItemBonuses(item.bonuses)}</p>
          ${item.element ? `<p>屬性：${item.element}</p>` : ""}
          <button type="button" data-unequip-index="${index}">卸下</button>
        </div>
      `).join("")}
    </div>
  `;
  app.querySelectorAll("[data-unequip-index]").forEach(button => {
    button.addEventListener("click", async () => {
      const result = unequipItem(Number(button.dataset.unequipIndex));
      await saveCurrentPlayer(false);
      renderEquipmentPage(result);
    });
  });
  attachPageLinks();
}

function renderShop(message = "") {
  if (!state.currentPlayer) return renderHome();
  state.screen = "shop";
  renderMenu();
  const player = state.currentPlayer;
  const stock = ensureShopStock();
  app.innerHTML = `
    <h3>商店</h3>
    ${message ? `<p class="success">${message}</p>` : ""}
    ${renderPageLinks("shop")}
    <p><span class="pill">持有金幣 ${player.gold}</span> <span class="pill">刷新費用 8 金幣</span></p>
    <div class="inline-actions">
      <button class="action" type="button" id="refresh-shop">刷新商品</button>
    </div>
    <div class="spacer"></div>
    <h4>本次商品</h4>
    <div class="card-grid">
      ${stock.map(key => {
        const item = data.itemCatalog[key];
        return `
          <div class="choice-card">
            <div class="card-visual">
              ${renderMediaThumb(itemImagePath(item), item.name)}
              <div><h4>${item.name}</h4></div>
            </div>
            <p>${item.description}</p>
            ${item.weaponType ? `<p>武器種類：${item.weaponType}</p>` : ""}
            ${item.armorClass ? `<p>裝甲種類：${item.armorClass}</p>` : ""}
            ${item.type === "equipment" ? `<p>強度評分：${itemPower(item)}</p><p>${formatItemBonuses(item.bonuses)}</p><p>${compareItemAgainstEquipped(item, player.equipment)}</p>` : ""}
            <p>價格：${item.price} 金幣</p>
            ${item.element ? `<p class="${elementClassName(item.element)}">屬性：${item.element}</p>` : ""}
            <button type="button" data-buy-key="${item.key}">購買</button>
          </div>
        `;
      }).join("")}
    </div>
    <div class="spacer"></div>
    <h4>販賣背包物品</h4>
    <div class="card-grid">
      ${(player.inventory || []).length ? player.inventory.map((item, index) => `
        <div class="choice-card ${item.element ? elementClassName(item.element) : ""}">
          <div class="card-visual">
            ${renderMediaThumb(itemImagePath(item), item.name)}
            <div><h4>${item.name}</h4></div>
          </div>
          <p>${item.description || ""}</p>
          ${item.weaponType ? `<p>武器種類：${item.weaponType}</p>` : ""}
          ${item.armorClass ? `<p>裝甲種類：${item.armorClass}</p>` : ""}
          ${item.type === "equipment" ? `<p>強度評分：${itemPower(item)}</p><p>${formatItemBonuses(item.bonuses)}</p>` : ""}
          <p>售價：${sellPrice(item)} 金幣${item.quantity ? ` | 數量 ${item.quantity}` : ""}</p>
          <button type="button" data-sell-inventory-index="${index}">販賣</button>
        </div>
      `).join("") : `<div class="stat"><p>背包沒有可販賣物品。</p></div>`}
    </div>
    <div class="spacer"></div>
    <h4>販賣已裝備物品</h4>
    <div class="card-grid">
      ${(player.equipment || []).length ? player.equipment.map((item, index) => `
        <div class="choice-card ${item.element ? elementClassName(item.element) : ""}">
          <div class="card-visual">
            ${renderMediaThumb(itemImagePath(item), item.name)}
            <div><h4>${item.slot}：${item.name}</h4></div>
          </div>
          ${item.weaponType ? `<p>武器種類：${item.weaponType}</p>` : ""}
          ${item.armorClass ? `<p>裝甲種類：${item.armorClass}</p>` : ""}
          <p>強度評分：${itemPower(item)}</p>
          <p>${formatItemBonuses(item.bonuses)}</p>
          <p>售價：${sellPrice(item)} 金幣</p>
          <button type="button" data-sell-equipment-index="${index}">卸下並販賣</button>
        </div>
      `).join("") : `<div class="stat"><p>目前沒有已裝備物品可販賣。</p></div>`}
    </div>
  `;
  document.querySelector("#refresh-shop").addEventListener("click", async () => {
    const result = refreshShopStock();
    await saveCurrentPlayer(false);
    renderShop(result);
  });
  app.querySelectorAll("[data-buy-key]").forEach(button => {
    button.addEventListener("click", async () => {
      const result = buyShopItem(button.dataset.buyKey);
      await saveCurrentPlayer(false);
      renderShop(result);
    });
  });
  app.querySelectorAll("[data-sell-inventory-index]").forEach(button => {
    button.addEventListener("click", async () => {
      const result = sellInventoryItem(Number(button.dataset.sellInventoryIndex));
      await saveCurrentPlayer(false);
      renderShop(result);
    });
  });
  app.querySelectorAll("[data-sell-equipment-index]").forEach(button => {
    button.addEventListener("click", async () => {
      const result = sellEquippedItem(Number(button.dataset.sellEquipmentIndex));
      await saveCurrentPlayer(false);
      renderShop(result);
    });
  });
  attachPageLinks();
}

function renderCompanions(message = "") {
  if (!state.currentPlayer) return renderHome();
  state.screen = "companions";
  renderMenu();
  const player = state.currentPlayer;
  app.innerHTML = `
    <h3>同伴招募</h3>
    ${message ? `<p class="success">${message}</p>` : ""}
    ${renderPageLinks("companions")}
    <p><span class="pill">隊伍人數 ${1 + (player.companions?.length || 0)} / 4</span> <span class="pill">最多可招募 3 位同伴</span></p>
    <div class="card-grid">
      ${(player.companions || []).map((companion, index) => `
        <div class="choice-card">
          <h4>${companion.name}</h4>
          <p>${companion.raceName} / ${companion.className}</p>
          <p>Lv.${companion.level} | 職業 Lv.${companion.classLevel} / 100</p>
          <p>EXP ${(companion.exp || 0)} / ${nextLevelExp(companion.classLevel)}</p>
          <p>HP ${companion.hp}/${companion.maxHp} | MP ${companion.mp}/${companion.maxMp}</p>
          <p class="muted">已學技能 ${availableCompanionSkills(companion).length} 個</p>
          <button type="button" data-dismiss-index="${index}">離隊</button>
        </div>
      `).join("") || `<div class="stat">目前還沒有同伴。</div>`}
    </div>
    <div class="spacer"></div>
    <h3>新增同伴</h3>
    <label>同伴名字</label>
    <input type="text" id="companion-name" placeholder="輸入同伴名字">
    <div class="spacer"></div>
    <h3>選擇種族</h3>
    <div class="card-grid">
      ${data.races.map(race => choiceCard(race.name, race.description, race.advantage, "companion-race", race.code)).join("")}
    </div>
    <div class="spacer"></div>
    <h3>選擇職業</h3>
    <div class="card-grid">
      ${data.classes.filter(job => !(job.requirements?.length)).map(job => choiceCard(job.name, job.description, job.advantage, "companion-class", job.code)).join("")}
    </div>
    <div class="spacer"></div>
    <button class="primary" type="button" id="recruit-companion">招募同伴</button>
  `;
  bindChoiceCards();
  app.querySelectorAll("[data-dismiss-index]").forEach(button => {
    button.addEventListener("click", async () => {
      player.companions.splice(Number(button.dataset.dismissIndex), 1);
      await saveCurrentPlayer(false);
      renderCompanions("同伴已離隊。");
    });
  });
  document.querySelector("#recruit-companion").addEventListener("click", async () => {
    const name = document.querySelector("#companion-name").value.trim();
    const raceCode = document.querySelector(".choice-card[data-group='companion-race'].selected")?.dataset.code;
    const classCode = document.querySelector(".choice-card[data-group='companion-class'].selected")?.dataset.code;
    const result = recruitCompanion(name, raceCode, classCode);
    await saveCurrentPlayer(false);
    renderCompanions(result);
  });
  attachPageLinks();
}

function renderClassManagement(message = "") {
  if (!state.currentPlayer) return renderHome();
  state.screen = "classes";
  renderMenu();
  const player = state.currentPlayer;
  commitActiveClassState(player);
  normalizePlayer(player);
  const ownedClasses = getPlayerClasses(player);
  const availableClasses = data.classes.filter(classDef => {
    if (getClassEntry(player, classDef.code)) return false;
    return !classDef.requirements?.length || canUnlockClass(player, classDef);
  });
  const lockedAdvancedClasses = data.classes.filter(classDef => {
    if (getClassEntry(player, classDef.code)) return false;
    return classDef.requirements?.length && !canUnlockClass(player, classDef);
  });

  app.innerHTML = `
    <h3>轉職</h3>
    ${message ? `<p class="success">${message}</p>` : ""}
    ${renderPageLinks("classes")}
    <div class="card-grid">
      <div class="stat">
        <h4>角色職業總覽</h4>
        <p>總等級 Lv.${player.level} / 1000</p>
        <p>目前職業：${player.className} Lv.${player.classLevel} / 100</p>
      </div>
      <div class="stat">
        <h4>轉職說明</h4>
        <p>能力值與已學技能會保留，經驗值只會灌到目前職業。</p>
        <p>可同時擁有複數職業，但所有職業累計最高為 1000 級。</p>
      </div>
    </div>
    <div class="spacer"></div>
    <h3>已擁有職業</h3>
    <div class="card-grid">
      ${ownedClasses.map(classEntry => `
        <div class="choice-card ${classEntry.classCode === player.activeClassCode ? "selected" : ""}">
          <h4>${classEntry.className}</h4>
          <p>Lv.${classEntry.classLevel} / 100</p>
          <p>${classEntry.classCode === player.activeClassCode ? "目前職業" : "可切換使用"}</p>
          <button type="button" data-switch-class="${classEntry.classCode}" ${classEntry.classCode === player.activeClassCode ? "disabled" : ""}>切換</button>
        </div>
      `).join("")}
    </div>
    <div class="spacer"></div>
    <h3>可解鎖職業</h3>
    <div class="card-grid">
      ${availableClasses.length ? availableClasses.map(classDef => `
        <div class="choice-card">
          <h4>${classDef.name}</h4>
          <p>${classDef.description}</p>
          <p>${classDef.advantage}</p>
          <p>條件：${classRequirementText(classDef)}</p>
          <button type="button" data-unlock-class="${classDef.code}">解鎖並轉職</button>
        </div>
      `).join("") : `<div class="stat"><strong>目前沒有新職業</strong><p>先提升既有職業等級，再回來查看。</p></div>`}
    </div>
    ${lockedAdvancedClasses.length ? `
      <div class="spacer"></div>
      <h3>尚未達成條件</h3>
      <div class="card-grid">
        ${lockedAdvancedClasses.map(classDef => `
          <div class="stat">
            <strong>${classDef.name}</strong>
            <p>${classRequirementText(classDef)}</p>
          </div>
        `).join("")}
      </div>
    ` : ""}
  `;

  app.querySelectorAll("[data-switch-class]").forEach(button => {
    button.addEventListener("click", async () => {
      const result = unlockOrSwitchClass(player, button.dataset.switchClass);
      await saveCurrentPlayer(false);
      renderClassManagement(result);
    });
  });

  app.querySelectorAll("[data-unlock-class]").forEach(button => {
    button.addEventListener("click", async () => {
      const result = unlockOrSwitchClass(player, button.dataset.unlockClass);
      await saveCurrentPlayer(false);
      renderClassManagement(result);
    });
  });

  attachPageLinks();
}

function renderSkillTree() {
  if (!state.currentPlayer) {
    return renderHome();
  }
  state.screen = "skills";
  renderMenu();
  const player = state.currentPlayer;
  syncClassBranchSnapshots(player);
  const filters = ownedBranchNames(player);
  if (state.skillTreeBranchFilter !== "all" && !filters.includes(state.skillTreeBranchFilter)) {
    state.skillTreeBranchFilter = "all";
  }
  const selectedBranch = state.skillTreeBranchFilter;
  const visibleSkills = ownedSkillReferences(player)
    .filter(ref => selectedBranch === "all" || ref.branch === selectedBranch);
  app.innerHTML = `
    <h3>技能樹</h3>
    <p class="hint">點擊升級目前職業可用的分支。重複分支會在不同職業間共用加點，已轉職過的職業技能也可繼續使用。</p>
    ${renderPageLinks("skills")}
    <p><span class="pill">目前職業 ${player.className}</span> <span class="pill">可用技能點 ${player.skillPoints}</span></p>
    <h3>目前職業分支</h3>
    <div class="card-grid">
      ${player.branches.map((branch, index) => {
        const [stat, value] = data.branchEffects[branch.name] || ["attack", 1];
        return `
          <div class="choice-card">
            <h4>${branch.name}</h4>
            <p>目前等級：Lv.${branch.level}</p>
            <p>每級效果：${stat} +${value}</p>
            <button type="button" data-branch-index="${index}">升級</button>
          </div>
        `;
      }).join("")}
    </div>
    <div class="spacer"></div>
    <h3>技能顯示</h3>
    <div class="inline-actions">
      <button type="button" data-skill-filter="all" ${selectedBranch === "all" ? "disabled" : ""}>全部</button>
      ${filters.map(branch => `<button type="button" data-skill-filter="${branch}" ${selectedBranch === branch ? "disabled" : ""}>${branch}</button>`).join("")}
    </div>
    <p class="hint">目前顯示：${selectedBranch === "all" ? "全部技能" : `${selectedBranch} 技能`}</p>
    <div class="card-grid">
      ${visibleSkills.map(ref => `
        <div class="stat">
          <div class="card-visual">
            ${renderMediaThumb(skillImagePath(ref.skill), ref.skill.name)}
            <div>
              <strong>${ref.skill.name}</strong>
              <div class="hint">${ref.className}・${ref.branch || "通用"}</div>
            </div>
          </div>
          <p>MP ${skillCost(player, ref.skill)} | 屬性 ${ref.skill.element || "無"}</p>
          <p>${skillKindText(ref.skill.kind)}</p>
          <p>${isSkillUnlocked(player, ref) ? "已解鎖" : skillUnlockText(player, ref)}</p>
        </div>
      `).join("") || `<div class="stat">這個技能樹目前沒有可顯示的技能。</div>`}
    </div>
  `;
  app.querySelectorAll("[data-branch-index]").forEach(button => {
    button.addEventListener("click", async () => {
      if (player.skillPoints <= 0) {
        return toast("目前沒有技能點。", "warning");
      }
      const branch = player.branches[Number(button.dataset.branchIndex)];
      const [stat, value] = data.branchEffects[branch.name] || ["attack", 1];
      const nextLevel = (branch.level || 0) + 1;
      setSharedBranchLevel(player, branch.name, nextLevel);
      player.skillPoints -= 1;
      if (stat === "maxHp" || stat === "maxMp") {
        player[stat] += value;
        if (stat === "maxHp") player.hp = Math.min(player.hp + value, player.maxHp);
        if (stat === "maxMp") player.mp = Math.min(player.mp + value, player.maxMp);
      } else {
        player[stat] += value;
      }
      syncClassBranchSnapshots(player);
      commitActiveClassState(player);
      await saveCurrentPlayer(false);
      renderSkillTree();
    });
  });
  app.querySelectorAll("[data-skill-filter]").forEach(button => {
    button.addEventListener("click", () => {
      state.skillTreeBranchFilter = button.dataset.skillFilter;
      renderSkillTree();
    });
  });
  attachPageLinks();
}

async function startBattle(category) {
  if (!state.currentPlayer) {
    return toast("請先建立或讀取角色。", "warning");
  }
  const player = state.currentPlayer;
  let enemies = [];
  let areaName = "";
  let chosenArea = null;
  if (category === "story") {
    chosenArea = availableAreas("story", player)[0] || null;
    const pool = chosenArea?.monsterCodes?.length
      ? data.monsters.filter(item => chosenArea.monsterCodes.includes(item.code))
      : data.monsters.filter(item => item.category === "story" && item.storyOrder === player.storyStage);
    const monster = pool[0];
    if (!monster) return toast("目前主線內容已暫時完成。", "success");
    areaName = chosenArea?.name || monster.name;
    enemies = [buildBattleEnemy(monster)];
  } else {
    const areas = availableAreas(category, player);
    const currentArea = currentAreaForPlayer(player);
    chosenArea = currentArea?.category === category && areas.some(area => area.id === currentArea.id)
      ? currentArea
      : (areas[0] || null);
    const pool = chosenArea?.monsterCodes?.length
      ? data.monsters.filter(item => chosenArea.monsterCodes.includes(item.code))
      : data.monsters.filter(item => item.category === category);
    areaName = chosenArea?.name || (category === "normal" ? "野外" : "副本");
    if (!pool.length) {
      return toast(category === "normal" ? "目前沒有可探索的區域。" : "目前沒有可挑戰的副本。", "warning");
    }
    const enemyCount = category === "dungeon" ? randomInt(2, 3) : randomInt(1, 3);
    enemies = Array.from({ length: enemyCount }, () => buildBattleEnemy(pool[Math.floor(Math.random() * pool.length)]));
  }
  if (chosenArea?.id) player.currentAreaId = chosenArea.id;
  state.battle = {
    type: category,
    areaId: chosenArea?.id || "",
    areaName,
    enemies,
    selectedEnemy: 0,
    targetMode: null,
    turn: 1,
    log: [`你來到 ${areaName || "未知區域"}。`, `遭遇 ${enemies.map(enemy => enemy.name).join("、")}！`],
    buffs: { attack: 0, defense: 0, magic: 0, resistance: 0, speed: 0, evade: 0, dragon: 0 },
    selfBuffs: createBattleBuffs(),
    dwarfGuardUsed: false,
    companions: (player.companions || []).map(companion => ({ ...structuredClone(companion), battleBuffs: createBattleBuffs() })),
  };
  applyAreaTheme(chosenArea);
  state.screen = "battle";
  renderMenu();
  renderBattle();
}

function renderBattle() {
  const player = state.currentPlayer;
  const battle = state.battle;
  const stats = battleStats(player, battle);
  const monster = selectedEnemy(battle);
  const battleEnded = !livingEnemies(battle).length || partyDefeated(player, battle);
  const enemyCards = (battle.enemies || []).map((enemy, index) => `
    <button class="choice-card compact-enemy-card ${battle.selectedEnemy === index ? "selected" : ""}" type="button" data-battle-enemy="${index}">
      <div class="card-visual">
        ${renderMediaThumb(monsterImagePath(enemy), enemy.name)}
        <div><h4>${enemy.name}</h4></div>
      </div>
      <p>HP ${Math.max(0, enemy.currentHp)} / ${enemy.maxHp}</p>
      <p>${enemy.elements.join(" / ")}</p>
      <p>${formatMonsterAilments(enemy.ailments)}</p>
    </button>
  `).join("");
  const targetButtons = battle.targetMode && battle.targetMode.type !== "enemy"
    ? (battle.targetMode.partyIndices?.length
        ? battle.targetMode.partyIndices.map(partyIndex => {
            const member = getPartyMembers(player, battle.companions || [])[partyIndex];
            if (!member) return "";
            const maxStats = memberMaxStats(member, player);
            return `<button class="action" type="button" data-target-party="${partyIndex}">${member.name} HP ${Math.max(0, member.hp)}/${maxStats.maxHp} | MP ${Math.max(0, member.mp)}/${maxStats.maxMp}</button>`;
          }).join("")
        : allyTargets(player, battle, battle.targetMode.type === "fallen_ally")
            .map((member, index) => ({ member, index }))
            .filter(({ member }) => battle.targetMode.type !== "fallen_ally" || member.hp <= 0)
            .map(({ member, index }) => `<button class="action" type="button" data-target-ally="${index}">${member.name} HP ${member.hp}/${memberMaxStats(member, player).maxHp}</button>`).join(""))
    : "";
  const targetPanel = battle.targetMode && battle.targetMode.type !== "enemy" ? `
    <div class="spacer"></div>
    <div class="card">
      <h4>選擇目標</h4>
      <div class="inline-actions">
        ${targetButtons}
        <button class="action" type="button" data-action="cancel-target">取消選擇</button>
      </div>
    </div>
  ` : "";
  app.innerHTML = `
    <h3>${battle.type === "normal" ? "野外戰鬥" : battle.type === "dungeon" ? "副本戰鬥" : "主線戰鬥"}</h3>
    <p class="hint">目前區域：${battle.areaName || "未知地區"}</p>
    <div class="battle-stack">
      <div class="battle-overview">
        <div class="card compact-card">
          <h4>敵方陣列</h4>
          <div class="card-grid enemy-grid-tight">${enemyCards}</div>
        </div>
        <div class="battle-monster compact-card">
          <div class="monster-focus">
            ${renderMediaThumb(monster ? monsterImagePath(monster) : "", monster?.name || "目標", "large")}
            <div class="monster-focus-copy">
              <h4>目前目標：${monster ? monster.name : "無"}</h4>
              <p>HP ${monster ? Math.max(0, monster.currentHp) : 0} / ${monster ? monster.maxHp : 0}</p>
              <p>屬性：${monster ? monster.elements.join(" / ") : "無"}</p>
              <p>異常：${monster ? formatMonsterAilments(monster.ailments) : "無"}</p>
              <p>技能：${monster ? formatMonsterSkillList(monster) : "無"}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="log">${battle.log.join("\n")}</div>
      <div class="battle-layout">
        <div class="battle-left">
          <div class="battle-player">
            <h4>${player.name}</h4>
            <p>HP ${player.hp} / ${stats.maxHp}</p>
            <p>MP ${player.mp} / ${stats.maxMp}</p>
            <p>${player.raceName} / ${player.className}</p>
          </div>
          ${(battle.companions || []).length ? `<div class="card-grid">${battle.companions.map(companion => `
            <div class="stat">
              <strong>${companion.name}</strong>
              <p>${companion.className}</p>
              <p>HP ${companion.hp}/${companion.maxHp} | MP ${companion.mp}/${companion.maxMp}</p>
            </div>
          `).join("")}</div>` : ""}
          <div class="battle-actions">
            ${battleEnded ? `
              <button class="action" type="button" data-action="return">返回冒險</button>
            ` : player.hp <= 0 ? `
              <button class="action" type="button" data-action="ally-turn">交給同伴</button>
              <button class="action" type="button" data-action="items">使用道具</button>
              <button class="action" type="button" data-action="status">查看狀態</button>
            ` : `
              <button class="action" type="button" data-action="attack">普通攻擊</button>
              <button class="action" type="button" data-action="skills">施放技能</button>
              <button class="action" type="button" data-action="items">使用道具</button>
              <button class="action" type="button" data-action="race">種族技能</button>
              <button class="action" type="button" data-action="defend">防禦</button>
              <button class="action" type="button" data-action="status">查看狀態</button>
              <button class="action" type="button" data-action="escape">逃跑</button>
            `}
          </div>
          <div class="inline-actions" id="skill-panel"></div>
          ${targetPanel}
        </div>
      </div>
    </div>
  `;
  app.querySelectorAll("[data-battle-enemy]").forEach(button => {
    button.addEventListener("click", () => {
      const targetIndex = Number(button.dataset.battleEnemy);
      if (battle.targetMode?.type === "enemy") {
        const mode = battle.targetMode;
        battle.targetMode = null;
        if (mode.action === "attack") return performBattleTurn({ type: "attack", targetIndex });
        if (mode.action === "skill") return performBattleTurn({ type: "skill", index: mode.index, targetIndex });
      }
      battle.selectedEnemy = targetIndex;
      renderBattle();
    });
  });
  app.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => handleBattleAction(button.dataset.action));
  });
  app.querySelectorAll("[data-target-ally]").forEach(button => {
    button.addEventListener("click", () => {
      const allyIndex = Number(button.dataset.targetAlly);
      const mode = battle.targetMode;
      battle.targetMode = null;
      if (mode?.action === "skill") performBattleTurn({ type: "skill", index: mode.index, allyIndex });
    });
  });
  app.querySelectorAll("[data-target-party]").forEach(button => {
    button.addEventListener("click", () => {
      const partyIndex = Number(button.dataset.targetParty);
      const mode = battle.targetMode;
      battle.targetMode = null;
      if (mode?.action === "item") performBattleTurn({ type: "item", index: mode.index, partyIndex });
    });
  });
}

function handleBattleAction(action) {
  if (!state.battle) return;
  if (action === "status") {
    const player = state.currentPlayer;
    const stats = battleStats(player, state.battle);
    state.battle.log.push(`狀態檢視：HP ${player.hp}/${stats.maxHp} MP ${player.mp}/${stats.maxMp} 攻擊 ${stats.attack} 防禦 ${stats.defense} 魔法 ${stats.magic}`);
    return renderBattle();
  }
  if (action === "return") {
    state.battle = null;
    return renderStatus("已返回冒險畫面。");
  }
  if (action === "cancel-target") {
    state.battle.targetMode = null;
    return renderBattle();
  }
  if (action === "skills") return renderSkillButtons();
  if (action === "items") return renderItemButtons();
  if (action === "ally-turn") return performBattleTurn({ type: "allyTurn" });
  if (action === "attack") return performBattleTurn({ type: "attack" });
  if (action === "race") return performBattleTurn({ type: "race" });
  if (action === "defend") return performBattleTurn({ type: "defend" });
  if (action === "escape") return tryEscape();
}

function renderSkillButtons() {
  const panel = document.querySelector("#skill-panel");
  const skills = availableSkills(state.currentPlayer);
  panel.innerHTML = skills
    .map((ref, index) => `<button class="skill-button" type="button" data-skill-index="${index}">${ref.skill.name}<br><small>${ref.className} | MP ${skillCost(state.currentPlayer, ref.skill)}</small></button>`)
    .join("");
  if (!panel.innerHTML) {
    panel.innerHTML = `<div class="stat">目前沒有可使用的技能。</div>`;
    return;
  }
  panel.querySelectorAll("[data-skill-index]").forEach(button => {
    button.addEventListener("click", () => performBattleTurn({ type: "skill", index: Number(button.dataset.skillIndex) }));
  });
}

function renderItemButtons() {
  const panel = document.querySelector("#skill-panel");
  const inventory = (state.currentPlayer?.inventory || []).filter(item => item.type === "consumable" && (item.quantity || 0) > 0);
  panel.innerHTML = inventory
    .map(item => {
      const index = state.currentPlayer.inventory.indexOf(item);
      return `<button class="skill-button" type="button" data-item-index="${index}">${item.name}<br><small>${consumableTargetLabel(item)} | x${item.quantity || 1}</small></button>`;
    })
    .join("");
  if (!panel.innerHTML) {
    panel.innerHTML = `<div class="stat">目前沒有可用道具。</div>`;
    return;
  }
  panel.querySelectorAll("[data-item-index]").forEach(button => {
    button.addEventListener("click", () => performBattleTurn({ type: "item", index: Number(button.dataset.itemIndex) }));
  });
}

async function performBattleTurn(action) {
  const player = state.currentPlayer;
  const battle = state.battle;
  const rawTarget = action.targetIndex !== undefined ? battle.enemies[action.targetIndex] : selectedEnemy(battle);
  const monster = rawTarget && rawTarget.currentHp > 0 ? rawTarget : selectedEnemy(battle);
  const stats = battleStats(player, battle);
  let defend = false;
  let acted = true;

  if (action.type === "allyTurn") {
    battle.log.push("你已倒下，由同伴接手戰鬥。");
  } else if (action.type === "attack") {
    if (!monster) {
      battle.log.push("目前沒有可攻擊的敵人。");
      acted = false;
      return renderBattle();
    }
    if (livingEnemies(battle).length > 1 && action.targetIndex === undefined) {
      battle.targetMode = { action: "attack", type: "enemy" };
      battle.log.push("請選擇普通攻擊的目標。");
      return renderBattle();
    }
    const attackElement = resolvePlayerAttackElement(player, battle);
    const damage = dealDamage(stats.attack, monsterBattleStats(monster, battle).defense, 1 + dualWieldBonus(player), attackElement, monster);
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    battle.log.push(`${player.name} 的普通攻擊造成 ${damage} 點傷害。`);
    applyLifesteal(player, damage, battle);
  } else if (action.type === "item") {
    const item = player.inventory[action.index];
    if (!item || item.type !== "consumable") {
      battle.log.push("找不到可使用的道具。");
      acted = false;
      return renderBattle();
    }
    const scope = consumableTargetScope(item);
    const targets = targetableMembersForConsumable(player, item, battle.companions || []);
    if (!targets.length) {
      battle.log.push(scope === "fallen_ally" ? "目前沒有倒下的隊友可使用該道具。" : "目前沒有需要使用該道具的隊友。");
      acted = false;
      return renderBattle();
    }
    if (scope !== "all_allies" && !Number.isInteger(action.partyIndex)) {
      if (targets.length === 1) {
        action.partyIndex = targets[0].partyIndex;
      } else {
        battle.targetMode = { action: "item", type: scope === "fallen_ally" ? "fallen_ally" : "ally", index: action.index, partyIndices: targets.map(target => target.partyIndex) };
        battle.log.push(`請選擇 ${item.name} 的使用對象。`);
        return renderBattle();
      }
    }
    const result = useInventoryItem(action.index, { partyIndex: action.partyIndex, companions: battle.companions || [] });
    if (!result.ok) {
      battle.log.push(result.message);
      acted = false;
      return renderBattle();
    }
    battle.log.push(result.message);
  } else if (action.type === "skill") {
    const skillEntry = availableSkills(player)[action.index];
    const skill = skillEntry?.skill;
    if (!skillEntry || !skill || !isSkillUnlocked(player, skillEntry)) {
      battle.log.push("這個技能尚未解鎖。");
      acted = false;
      return renderBattle();
    }
    const targetType = skillTargetType(skill);
    if (targetType === "enemy" && action.targetIndex === undefined) {
      const targets = livingEnemies(battle);
      if (!targets.length) {
        battle.log.push("目前沒有可指定的敵人。");
        acted = false;
        return renderBattle();
      }
      if (targets.length > 1) {
        battle.targetMode = { action: "skill", type: "enemy", index: action.index };
        battle.log.push(`請選擇 ${skill.name} 的目標。`);
        return renderBattle();
      }
      action.targetIndex = battle.enemies.indexOf(targets[0]);
    }
    if (targetType === "enemy" && !monster) {
      battle.log.push("目前沒有可指定的敵人。");
      acted = false;
      return renderBattle();
    }
    if (targetType === "ally" && action.allyIndex === undefined) {
      const targets = allyTargets(player, battle);
      if (targets.length > 1) {
        battle.targetMode = { action: "skill", type: "ally", index: action.index };
        battle.log.push(`請選擇 ${skill.name} 的對象。`);
        return renderBattle();
      }
      action.allyIndex = 0;
    }
    if (targetType === "fallen_ally" && action.allyIndex === undefined) {
      const allTargets = allyTargets(player, battle, true);
      const fallenTargets = allTargets.filter(member => member.hp <= 0);
      if (!fallenTargets.length) {
        battle.log.push("目前沒有倒下的隊友可指定。");
        acted = false;
        return renderBattle();
      }
      if (fallenTargets.length > 1) {
        battle.targetMode = { action: "skill", type: "fallen_ally", index: action.index };
        battle.log.push(`請選擇 ${skill.name} 的對象。`);
        return renderBattle();
      }
      action.allyIndex = allTargets.indexOf(fallenTargets[0]);
    }
    const realCost = skill.kind === "chiBlast" && (battle.selfBuffs.chi || 0) > 0 ? 0 : skillCost(player, skill);
    if (player.mp < realCost) {
      battle.log.push("MP 不足，無法施放技能。");
      acted = false;
    } else {
      player.mp -= realCost;
      handleSkill(skill, player, battle, monster, stats, action);
    }
  } else if (action.type === "race") {
    handleRaceSkill(player, battle);
  } else if (action.type === "defend") {
    defend = true;
    battle.log.push("你擺出防禦姿態。");
  }

  if (!acted) {
    return renderBattle();
  }
  if (!livingEnemies(battle).length) {
    syncBattleCompanions(player, battle);
    await finishVictory();
    return;
  }

  companionTurn(battle);
  if (!livingEnemies(battle).length) {
    syncBattleCompanions(player, battle);
    await finishVictory();
    return;
  }

  monsterTurn(player, battle, defend);
  if (!livingEnemies(battle).length) {
    syncBattleCompanions(player, battle);
    await finishVictory();
    return;
  }
  if (partyDefeated(player, battle)) {
    player.hp = Math.max(1, Math.floor(player.maxHp / 4));
    player.mp = Math.max(0, Math.floor(player.maxMp / 4));
    syncBattleCompanions(player, battle);
    (player.companions || []).forEach(companion => {
      companion.hp = Math.max(1, Math.floor(companion.maxHp / 4));
      companion.mp = Math.max(0, Math.floor(companion.maxMp / 4));
    });
    state.battle = null;
    await saveCurrentPlayer(false);
    renderGameHub("全隊戰敗，已撤退回冒險首頁。角色與同伴恢復到瀕危狀態。");
    return;
  }

  tickBuffs(battle);
  battle.turn += 1;
  syncBattleCompanions(player, battle);
  await saveCurrentPlayer(false);
  renderBattle();
}

function handleSkill(skill, player, battle, monster, stats, action = {}) {
  const monsterStats = monster ? monsterBattleStats(monster, battle) : null;
  const targetType = skillTargetType(skill);
  const allyPool = allyTargets(player, battle, targetType === "fallen_ally");
  const targetAlly = action.allyIndex !== undefined ? allyPool[action.allyIndex] : player;
  const party = [player].concat(battle.companions || []);

  if (skill.kind === "attack") return castAttackSkill(skill, player, battle, monster, stats, monsterStats);
  if (skill.kind === "attackAll") {
    castAttackAll(skill, player, battle, stats);
    return;
  }
  if (skill.kind === "attackRandom") {
    castAttackRandom(skill, player, battle, stats, skill.hits || 3);
    return;
  }
  if (skill.kind === "attackAllMulti") {
    for (let i = 0; i < (skill.hits || 2); i += 1) {
      if (!livingEnemies(battle).length) break;
      castAttackAll(skill, player, battle, stats);
    }
    return;
  }
  if (skill.kind === "attackDebuffDefense") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    applyMonsterAilment(monster, "defenseDown", skill.duration || 3, `${monster.name} 的防禦下降了。`, battle);
    return;
  }
  if (skill.kind === "attackDebuffAttack") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    applyMonsterAilment(monster, "attackDown", skill.duration || 3, `${monster.name} 的攻擊下降了。`, battle);
    return;
  }
  if (skill.kind === "attackDebuffResistance") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    applyMonsterAilment(monster, "resistanceDown", skill.duration || 3, `${monster.name} 的抵抗下降了。`, battle);
    return;
  }
  if (skill.kind === "debuffDefenseAll") {
    livingEnemies(battle).forEach(target => applyMonsterAilment(target, "defenseDown", skill.duration || 4, `${target.name} 的防禦下降了。`, battle));
    return;
  }
  if (skill.kind === "debuffResistanceAll") {
    livingEnemies(battle).forEach(target => applyMonsterAilment(target, "resistanceDown", skill.duration || 4, `${target.name} 的抵抗下降了。`, battle));
    return;
  }
  if (skill.kind === "attackDualElement") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    return;
  }
  if (skill.kind === "attackAllStun") {
    livingEnemies(battle).forEach(target => {
      castAttackSkill(skill, player, battle, target, stats, monsterBattleStats(target, battle));
      if (Math.random() < (skill.chance || 0.3)) applyMonsterAilment(target, "stun", skill.duration || 1, `${target.name} 暈眩了。`, battle);
    });
    return;
  }
  if (skill.kind === "attackAllParalyze") {
    livingEnemies(battle).forEach(target => {
      castAttackSkill(skill, player, battle, target, stats, monsterBattleStats(target, battle));
      if (Math.random() < (skill.chance || 0.3)) applyMonsterAilment(target, "paralyze", skill.duration || 3, `${target.name} 麻痺了。`, battle);
    });
    return;
  }
  if (skill.kind === "attackPoison") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    tryApplyChanceAilment(monster, "poison", skill, monster.name, "中毒", battle);
    return;
  }
  if (skill.kind === "attackSleep") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    tryApplyChanceAilment(monster, "sleep", skill, monster.name, "睡眠", battle);
    return;
  }
  if (skill.kind === "attackBlind") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    tryApplyChanceAilment(monster, "blind", skill, monster.name, "失明", battle);
    return;
  }
  if (skill.kind === "attackTrap") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    applyMonsterAilment(monster, "trap", skill.duration || 2, `${monster.name} 被設下陷阱。`, battle);
    return;
  }
  if (skill.kind === "attackDebuffSpeed") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    applyMonsterAilment(monster, "speedDown", skill.duration || 3, `${monster.name} 的速度下降了。`, battle);
    return;
  }
  if (skill.kind === "attackStun") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    tryApplyChanceAilment(monster, "stun", skill, monster.name, "暈眩", battle);
    return;
  }
  if (skill.kind === "attackFreeze") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    tryApplyChanceAilment(monster, "freeze", skill, monster.name, "凍結", battle);
    return;
  }
  if (skill.kind === "attackBurn") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    tryApplyChanceAilment(monster, "burn", skill, monster.name, "燒傷", battle);
    return;
  }
  if (skill.kind === "multiHit") {
    let total = 0;
    for (let i = 0; i < (skill.hits || 2) && monster?.currentHp > 0; i += 1) {
      total += castAttackSkill(skill, player, battle, monster, stats, monsterBattleStats(monster, battle));
    }
    battle.log.push(`${skill.name} 連續命中，總計造成 ${total} 點傷害。`);
    return;
  }
  if (skill.kind === "multiHitStun") {
    let total = 0;
    for (let i = 0; i < (skill.hits || 2) && monster?.currentHp > 0; i += 1) {
      total += castAttackSkill(skill, player, battle, monster, stats, monsterBattleStats(monster, battle));
    }
    battle.log.push(`${skill.name} 連續重擊，總計造成 ${total} 點傷害。`);
    tryApplyChanceAilment(monster, "stun", skill, monster.name, "暈眩", battle);
    return;
  }
  if (skill.kind === "attackIgnoreDefense") {
    const attackElement = resolvePlayerAttackElement(player, battle, skill.element || null);
    const damage = dealDamage(stats[skill.stat], 0, skill.power, attackElement, monster);
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    battle.log.push(`${player.name} 施放 ${skill.name}，無視防禦造成 ${damage} 點傷害。`);
    wakeSleepingMonster(monster, battle);
    applyLifesteal(player, damage, battle);
    return;
  }
  if (skill.kind === "attackParalyze") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    tryApplyChanceAilment(monster, "paralyze", skill, monster.name, "麻痺", battle);
    return;
  }
  if (skill.kind === "attackDrain") {
    const damage = castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    const heal = Math.max(1, Math.floor(damage * 0.35));
    player.hp = Math.min(stats.maxHp, player.hp + heal);
    battle.log.push(`${player.name} 吸收了 ${heal} HP。`);
    return;
  }
  if (skill.kind === "attackBuffSpeed") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    battle.selfBuffs.speed = Math.max(battle.selfBuffs.speed, 3);
    battle.selfBuffs.evade = Math.max(battle.selfBuffs.evade, 0.1);
    battle.log.push(`${player.name} 的速度與迴避上升了。`);
    return;
  }
  if (skill.kind === "riskyTriple") {
    if (Math.random() < 0.7) {
      battle.log.push(`${player.name} 的 ${skill.name} 失手了。`);
      return;
    }
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    return;
  }
  if (skill.kind === "executeAilment") {
    if (!monster) return;
    const executeSkill = { ...skill, power: monsterHasAnyAilment(monster) ? skill.power : Math.max(1, skill.power * 0.75) };
    castAttackSkill(executeSkill, player, battle, monster, stats, monsterStats);
    return;
  }
  if (skill.kind === "attackInstantDeath") {
    const attackElement = resolvePlayerAttackElement(player, battle, skill.element || null);
    const isBoss = ["story", "boss"].includes(monster.category) || monster.storyOrder;
    if (!isBoss && Math.random() < (skill.chance || 0.05)) {
      monster.currentHp = 0;
      battle.log.push(`${player.name} 以 ${skill.name} 直接處決了 ${monster.name}。`);
      return;
    }
    const damage = dealDamage(stats[skill.stat], 0, skill.power, attackElement, monster);
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    battle.log.push(`${player.name} 施放 ${skill.name}，造成 ${damage} 點傷害。`);
    wakeSleepingMonster(monster, battle);
    return;
  }
  if (skill.kind === "randomAilmentAll") {
    const ailmentPool = ["poison", "blind", "sleep", "burn", "freeze", "paralyze", "stun"];
    const ailmentLabel = { poison: "??", blind: "??", sleep: "??", burn: "??", freeze: "??", paralyze: "??", stun: "??" };
    livingEnemies(battle).forEach(target => {
      const ailment = ailmentPool[Math.floor(Math.random() * ailmentPool.length)];
      applyMonsterAilment(target, ailment, skill.duration || 3, `${target.name} ???${ailmentLabel[ailment]}?`, battle);
    });
    return;
  }
  if (skill.kind === "allStun") {
    livingEnemies(battle).forEach(target => {
      if (Math.random() < (skill.chance || 0.5)) {
        applyMonsterAilment(target, "stun", skill.duration || 1, `${target.name} ???????`, battle);
      }
    });
    return;
  }
  if (skill.kind === "fearAll") {
    livingEnemies(battle).forEach(target => {
      if (Math.random() < (skill.chance || 0.3)) {
        applyMonsterAilment(target, "fear", skill.duration || 4, `${target.name} ?????`, battle);
      }
    });
    return;
  }
  if (skill.kind === "buffAllParty") {
    battle.buffs.attack = Math.max(battle.buffs.attack, 4);
    battle.buffs.defense = Math.max(battle.buffs.defense, 4);
    battle.buffs.magic = Math.max(battle.buffs.magic, 4);
    battle.buffs.resistance = Math.max(battle.buffs.resistance, 4);
    battle.buffs.speed = Math.max(battle.buffs.speed, 4);
    battle.buffs.evade = Math.max(battle.buffs.evade, 0.25);
    battle.log.push(`${player.name} ?? ${skill.name}?????????`);
    return;
  }
  if (skill.kind === "superTranscend") {
    const spend = Math.floor(player.mp / 2);
    player.mp = Math.max(0, player.mp - spend);
    battle.selfBuffs.transcend = Math.max(battle.selfBuffs.transcend || 0, skill.duration || 5);
    battle.log.push(`${player.name} ?? ${spend} MP?????????`);
    return;
  }
  if (skill.kind === "overloadMagic") {
    battle.selfBuffs.regenMp = Math.max(battle.selfBuffs.regenMp, skill.duration || 5);
    battle.selfBuffs.magicBoost = Math.max(battle.selfBuffs.magicBoost || 0, 1.5);
    battle.log.push(`${player.name} ? MP ???????????????`);
    return;
  }
  if (skill.kind === "heal") {
    const heal = holyHealAmount(player, skill, stats, skill.power, 4, 10);
    targetAlly.hp = Math.min(targetAlly.maxHp, targetAlly.hp + heal);
    battle.log.push(`${player.name} ?? ${skill.name}?? ${targetAlly.name} ?? ${heal} HP?`);
    return;
  }
  if (skill.kind === "regenHpSingle") {
    const buffStore = targetAlly === player ? battle.selfBuffs : targetAlly.battleBuffs;
    buffStore.regen = Math.max(buffStore.regen || 0, skill.duration || 5);
    battle.log.push(`${player.name} ? ${targetAlly.name} ????????`);
    return;
  }
  if (skill.kind === "cleanse") {
    battle.log.push(`${player.name} ?? ${skill.name}???? ${targetAlly.name} ??????`);
    return;
  }
  if (skill.kind === "cleanseAll") {
    battle.log.push(`${player.name} ?? ${skill.name}?????????????`);
    return;
  }
  if (skill.kind === "healAll") {
    const amount = holyHealAmount(player, skill, stats, skill.power, 6, 12);
    party.forEach(member => {
      member.hp = Math.min(member.maxHp, member.hp + amount);
    });
    battle.log.push(`${player.name} ?? ${skill.name}????? ${amount} HP?`);
    return;
  }
  if (skill.kind === "fullHeal") {
    party.forEach(member => {
      member.hp = member.maxHp;
    });
    player.mp = Math.min(stats.maxMp, player.mp + Math.floor(stats.maxMp * 0.25));
    battle.log.push(`${player.name} ?? ${skill.name}????????`);
    return;
  }
  if (skill.kind === "fullHealSingle") {
    targetAlly.hp = targetAlly.maxHp;
    battle.log.push(`${player.name} ?? ${skill.name}?? ${targetAlly.name} ?????`);
    return;
  }
  if (skill.kind === "revive") {
    const fallen = party.filter(member => member.hp <= 0);
    if (!fallen.length) {
      battle.log.push(`${skill.name} ????????????`);
      return;
    }
    fallen.forEach(member => {
      member.hp = Math.floor(member.maxHp * 0.45);
      member.mp = Math.floor(member.maxMp * 0.35);
    });
    battle.log.push(`${player.name} ?? ${skill.name}?????????????`);
    return;
  }
  if (skill.kind === "reviveOne") {
    if (!targetAlly || targetAlly.hp > 0) {
      battle.log.push(`${skill.name} ??????????`);
      return;
    }
    targetAlly.hp = Math.floor(targetAlly.maxHp * 0.4);
    targetAlly.mp = Math.floor(targetAlly.maxMp * 0.3);
    battle.log.push(`${player.name} ?? ${skill.name}?? ${targetAlly.name} ????`);
    return;
  }
  if (skill.kind === "buffAttack") {
    battle.selfBuffs.attack = Math.max(battle.selfBuffs.attack, 3);
    battle.log.push(`${player.name} ????????`);
    return;
  }
  if (skill.kind === "guardShield") {
    battle.selfBuffs.shield = Math.max(battle.selfBuffs.shield, 2);
    battle.log.push(`${player.name} ????????????`);
    return;
  }
  if (skill.kind === "taunt") {
    battle.selfBuffs.taunt = Math.max(battle.selfBuffs.taunt, 3);
    battle.log.push(`${player.name} ?????????`);
    return;
  }
  if (skill.kind === "counterStance") {
    battle.selfBuffs.counter = Math.max(battle.selfBuffs.counter, 3);
    battle.log.push(`${player.name} ???????`);
    return;
  }
  if (skill.kind === "healPercent") {
    const heal = Math.max(1, Math.floor(stats.maxHp * skill.power));
    player.hp = Math.min(stats.maxHp, player.hp + heal);
    battle.log.push(`${player.name} ??? ${heal} HP?`);
    return;
  }
  if (skill.kind === "mpHealPercent") {
    const restore = Math.max(1, Math.floor(stats.maxMp * skill.power));
    player.mp = Math.min(stats.maxMp, player.mp + restore);
    battle.log.push(`${player.name} ??? ${restore} MP?`);
    return;
  }
  if (skill.kind === "regenMp") {
    battle.selfBuffs.regenMp = Math.max(battle.selfBuffs.regenMp, skill.duration || 5);
    battle.log.push(`${player.name} ? MP ??????`);
    return;
  }
  if (skill.kind === "spellbladeMode") {
    battle.selfBuffs.spellblade = Math.max(battle.selfBuffs.spellblade, skill.duration || 5);
    battle.log.push(`${player.name} ???????????????????`);
    return;
  }
  if (skill.kind === "elementEnchantSelf") {
    battle.selfBuffs.weaponElement = skill.element;
    battle.selfBuffs.weaponElements = null;
    battle.selfBuffs.weaponEnchantTurns = Math.max(battle.selfBuffs.weaponEnchantTurns || 0, skill.duration || 5);
    refreshPlayerStanceBuffs(battle);
    battle.log.push(`${player.name} ????? ${skill.element} ?????`);
    return;
  }
  if (skill.kind === "multiElementEnchantSelf") {
    battle.selfBuffs.weaponElement = null;
    battle.selfBuffs.weaponElements = ["\u5730", "\u6c34", "\u706b", "\u98a8"];
    battle.selfBuffs.weaponEnchantTurns = Math.max(battle.selfBuffs.weaponEnchantTurns || 0, skill.duration || 5);
    refreshPlayerStanceBuffs(battle);
    battle.log.push(`${player.name} ??????????????????`);
    return;
  }
  if (skill.kind === "buffMagic") {
    battle.selfBuffs.magic = Math.max(battle.selfBuffs.magic, 3);
    battle.log.push(`${player.name} ????????`);
    return;
  }
  if (skill.kind === "buffDefense") {
    battle.selfBuffs.defense = Math.max(battle.selfBuffs.defense, 3);
    battle.log.push(`${player.name} ????????`);
    return;
  }
  if (skill.kind === "buffResistance") {
    battle.selfBuffs.resistance = Math.max(battle.selfBuffs.resistance, 3);
    battle.log.push(`${player.name} ????????`);
    return;
  }
  if (["buffAttackDefenseSingle", "buffAttackSingle", "buffDefenseSingle", "buffMagicResistanceSingle", "buffSpeedSingle", "buffResistanceSingle", "buffAttackSingleStrong", "buffSpeedSingleStrong"].includes(skill.kind)) {
    const buffStore = targetAlly === player ? battle.selfBuffs : targetAlly.battleBuffs;
    if (skill.kind === "buffAttackDefenseSingle") {
      buffStore.attack = Math.max(buffStore.attack, 3);
      buffStore.defense = Math.max(buffStore.defense, 3);
    } else if (skill.kind === "buffAttackSingle") {
      buffStore.attack = Math.max(buffStore.attack, 3);
    } else if (skill.kind === "buffDefenseSingle") {
      buffStore.defense = Math.max(buffStore.defense, 3);
    } else if (skill.kind === "buffMagicResistanceSingle") {
      buffStore.magic = Math.max(buffStore.magic, 3);
      buffStore.resistance = Math.max(buffStore.resistance, 3);
    } else if (skill.kind === "buffSpeedSingle") {
      buffStore.speed = Math.max(buffStore.speed, 3);
      buffStore.evade = Math.max(buffStore.evade, 0.2);
    } else if (skill.kind === "buffResistanceSingle") {
      buffStore.resistance = Math.max(buffStore.resistance, 3);
    } else if (skill.kind === "buffAttackSingleStrong") {
      buffStore.attack = Math.max(buffStore.attack, 4);
    } else if (skill.kind === "buffSpeedSingleStrong") {
      buffStore.speed = Math.max(buffStore.speed, 4);
      buffStore.evade = Math.max(buffStore.evade, 0.35);
    }
    battle.log.push(`${player.name} ?? ${skill.name}???? ${targetAlly.name}?`);
    return;
  }
  if (skill.kind === "buffAttackParty") {
    battle.buffs.attack = Math.max(battle.buffs.attack, 3);
    battle.log.push(`${player.name} ?? ${skill.name}?????????`);
    return;
  }
  if (skill.kind === "buffAttackDefense") {
    battle.buffs.attack = Math.max(battle.buffs.attack, 3);
    battle.buffs.defense = Math.max(battle.buffs.defense, 3);
    battle.log.push(`${player.name} ?? ${skill.name}????????`);
    return;
  }
  if (skill.kind === "buffMagicResistance") {
    battle.buffs.magic = Math.max(battle.buffs.magic, 3);
    battle.buffs.resistance = Math.max(battle.buffs.resistance, 3);
    battle.log.push(`${player.name} ?? ${skill.name}???????????`);
    return;
  }
  if (skill.kind === "buffSpeedParty") {
    battle.buffs.speed = Math.max(battle.buffs.speed, 3);
    battle.buffs.evade = Math.max(battle.buffs.evade, 0.2);
    battle.log.push(`${player.name} ?? ${skill.name}????????`);
    return;
  }
  if (skill.kind === "buffDefensePartyStrong") {
    battle.buffs.defense = Math.max(battle.buffs.defense, 4);
    battle.log.push(`${player.name} ?? ${skill.name}????????????`);
    return;
  }
  if (skill.kind === "buffResistancePartyStrong") {
    battle.buffs.resistance = Math.max(battle.buffs.resistance, 4);
    battle.log.push(`${player.name} ?? ${skill.name}????????????`);
    return;
  }
  if (skill.kind === "statusWardParty") {
    battle.selfBuffs.statusWard = Math.max(battle.selfBuffs.statusWard, 3);
    battle.log.push(`${player.name} ??????????????`);
    return;
  }
  if (skill.kind === "sanctuary") {
    battle.selfBuffs.sanctuary = Math.max(battle.selfBuffs.sanctuary, 5);
    battle.selfBuffs.regen = Math.max(battle.selfBuffs.regen, 5);
    battle.log.push(`${player.name} ???????????????????`);
    return;
  }
  if (skill.kind === "berserk") {
    battle.selfBuffs.berserk = Math.max(battle.selfBuffs.berserk, skill.duration || 4);
    refreshPlayerStanceBuffs(battle);
    battle.log.push(`${player.name} ?????????????????`);
    return;
  }
  if (skill.kind === "allIn") {
    battle.selfBuffs.allIn = Math.max(battle.selfBuffs.allIn, skill.duration || 1);
    refreshPlayerStanceBuffs(battle);
    battle.log.push(`${player.name} ???????????????????`);
    return;
  }
  if (skill.kind === "allyHpTransfer") {
    if (!targetAlly || targetAlly === player) {
      battle.log.push(`${skill.name} ?????????`);
      return;
    }
    const amount = Math.max(1, Math.floor(player.hp * (skill.power || 0.5)));
    player.hp = Math.max(1, player.hp - amount);
    targetAlly.hp = Math.min(targetAlly.maxHp, targetAlly.hp + amount);
    battle.log.push(`${player.name} ? ${amount} HP ??? ${targetAlly.name}?`);
    return;
  }
  if (skill.kind === "allyMpTransfer") {
    if (!targetAlly || targetAlly === player) {
      battle.log.push(`${skill.name} ?????????`);
      return;
    }
    const amount = Math.max(1, Math.floor(player.mp * (skill.power || 0.5)));
    player.mp = Math.max(0, player.mp - amount);
    targetAlly.mp = Math.min(targetAlly.maxMp, targetAlly.mp + amount);
    battle.log.push(`${player.name} ? ${amount} MP ??? ${targetAlly.name}?`);
    return;
  }
  if (skill.kind === "coverAll") {
    battle.selfBuffs.coverAll = Math.max(battle.selfBuffs.coverAll, skill.duration || 3);
    battle.selfBuffs.taunt = Math.max(battle.selfBuffs.taunt, skill.duration || 3);
    battle.selfBuffs.shield = Math.max(battle.selfBuffs.shield, skill.duration || 3);
    battle.log.push(`${player.name} ?????????????????`);
    return;
  }
  if (skill.kind === "elementalWardParty") {
    battle.buffs.resistance = Math.max(battle.buffs.resistance, 3);
    battle.selfBuffs.elementalWard = skill.element;
    battle.log.push(`${player.name} ?? ${skill.name}???? ${skill.element} ????????`);
    return;
  }
  if (skill.kind === "chargeUp") {
    battle.selfBuffs.chi = Math.min(5, (battle.selfBuffs.chi || 0) + 1);
    battle.log.push(`${player.name} ?????????? ${battle.selfBuffs.chi}?`);
    return;
  }
  if (skill.kind === "chiBlast") {
    const bonus = battle.selfBuffs.chi || 0;
    const damage = dealDamage(stats.attack + bonus * 4, monsterStats.resistance, skill.power + bonus * 0.25, resolvePlayerAttackElement(player, battle, skill.element || null), monster);
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    battle.log.push(`${player.name} ? ${skill.name} ?? ${damage} ??????????????`);
    ["attackDown", "defenseDown", "resistanceDown", "speedDown"].forEach(key => { monster.ailments[key] = 0; });
    battle.selfBuffs.chi = 0;
    wakeSleepingMonster(monster, battle);
    return;
  }
  if (skill.kind === "afterimage") {
    battle.selfBuffs.afterimage = Math.max(battle.selfBuffs.afterimage, 1);
    battle.log.push(`${player.name} ????????????????`);
    return;
  }
  if (skill.kind === "attackAfterimage") {
    castAttackSkill(skill, player, battle, monster, stats, monsterStats);
    battle.selfBuffs.afterimage = Math.max(battle.selfBuffs.afterimage, 1);
    battle.log.push(`${player.name} ????????????`);
    return;
  }
  if (skill.kind === "evadeCounter") {
    battle.selfBuffs.evade = Math.max(battle.selfBuffs.evade, 0.35);
    battle.selfBuffs.counter = Math.max(battle.selfBuffs.counter, skill.duration || 3);
    battle.log.push(`${player.name} ?????????????`);
    return;
  }
  if (skill.kind === "steal") {
    if (Math.random() < 0.55) {
      const stolenGold = randomInt(5, 18);
      player.gold += stolenGold;
      battle.log.push(`${player.name} ??? ${stolenGold} ???`);
    } else {
      battle.log.push(`${player.name} ?????`);
    }
    return;
  }
}

function handleRaceSkill(player, battle) {
  if (player.raceName === "龍人") {
    if (player.mp < 15) return battle.log.push("MP 不足，無法發動龍血覺醒。");
    player.mp -= 15;
    battle.buffs.dragon = 3;
    battle.log.push("龍血覺醒發動，攻擊與魔法力提升 3 回合。");
    return;
  }
  if (player.raceName === "天翼族") {
    if (player.mp < 10) return battle.log.push("MP 不足，無法發動空域步法。");
    player.mp -= 10;
    battle.buffs.evade = 0.35;
    battle.log.push("空域步法發動，閃避率大幅提升。");
    return;
  }
  battle.log.push("這個種族技能是被動效果，戰鬥中會自動生效。");
}

function monsterTurn(player, battle, defend) {
  livingEnemies(battle).forEach(monster => {
    const ailmentResult = processMonsterAilments(battle, monster);
    if (ailmentResult === "defeated" || ailmentResult === "skip") return;
    const monsterStats = monsterBattleStats(monster, battle);
    const partyTargets = [];
    if (player.hp > 0) {
      partyTargets.push({ type: "player", actor: player, stats: battleStats(player, battle), defend });
    }
    (battle.companions || [])
      .filter(companion => companion.hp > 0)
      .forEach(companion => {
        partyTargets.push({ type: "companion", actor: companion, stats: companionStats(companion, battle), defend: false });
      });
    if (!partyTargets.length) return;
    const skill = chooseMonsterSkill(monster, battle);
    if (skill && monster.mp >= (skill.cost || 0)) {
      monster.mp -= skill.cost || 0;
      executeMonsterSkill(monster, skill, player, battle, partyTargets, defend);
    } else {
      executeMonsterSkill(monster, { name: monster.note || "普通攻擊", kind: "attack", stat: "attack", power: 1, targetScope: "single" }, player, battle, partyTargets, defend);
    }
  });
}

async function finishVictory() {
  const player = state.currentPlayer;
  const battle = state.battle;
  const totalExp = (battle.enemies || []).reduce((sum, enemy) => sum + enemy.exp, 0);
  const totalGold = (battle.enemies || []).reduce((sum, enemy) => sum + enemy.gold, 0);
  const storyChapter = battle.type === "story" ? currentStoryChapter(player) : null;
  const mainQuest = battle.type === "story" ? currentMainQuest(player) : null;
  player.exp += totalExp;
  commitActiveClassState(player);
  player.gold += totalGold;
  const storyBonusExp = battle.type === "story" ? (mainQuest?.rewardExp || 0) : 0;
  const storyBonusGold = battle.type === "story" ? Math.max(storyChapter?.rewardGold || 0, mainQuest?.rewardGold || 0) : 0;
  const storyRewardItems = battle.type === "story" ? rewardItemKeys(storyChapter?.rewardItem || mainQuest?.rewardItem || "") : [];
  battle.log.push(`你擊敗了本次敵群，獲得 EXP ${totalExp}、金幣 ${totalGold}。`);
  if (storyBonusExp) {
    player.exp += storyBonusExp;
    battle.log.push(`主線獎勵獲得 EXP ${storyBonusExp}`);
  }
  if (storyBonusGold) {
    player.gold += storyBonusGold;
    battle.log.push(`主線獎勵獲得金幣 ${storyBonusGold}`);
  }
  storyRewardItems.forEach(itemKey => {
    const rewardItem = addItemToInventory(player, itemKey);
    if (rewardItem) battle.log.push(`主線獎勵獲得 ${rewardItem.name}`);
  });
  (battle.enemies || []).forEach(enemy => {
    const droppedItemKey = rollDrop(enemy);
    if (droppedItemKey) {
      const droppedItem = addItemToInventory(player, droppedItemKey);
      battle.log.push(`掉落物品：${droppedItem.name}`);
    }
  });
  while (player.exp >= nextLevelExp(player.classLevel) && player.classLevel < 100 && totalPlayerLevel(player) < 1000) {
    player.exp -= nextLevelExp(player.classLevel);
    player.classLevel += 1;
    player.skillPoints += 1;
    applyClassLevelGrowth(player, player.className);
    (player.companions || []).forEach(companion => {
      const companionLevelUps = grantCompanionExp(companion, totalExp + storyBonusExp);
      if (companionLevelUps > 0) {
        battle.log.push(`${companion.name} 升了 ${companionLevelUps} 級，已自動習得新技能。`);
      }
    });
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    commitActiveClassState(player);
    syncActiveClassState(player);
    battle.log.push(`升級了，現在是 Lv.${player.level}，能力值已依職業自動成長。`);
  }
  commitActiveClassState(player);
  syncActiveClassState(player);
  if (battle.type === "story") {
    player.storyStage += 1;
    const nextStoryArea = availableAreas("story", player)[0];
    if (nextStoryArea?.id) {
      player.currentAreaId = nextStoryArea.id;
    }
  }
  if (battle.type === "dungeon") {
    player.dungeonClears += 1;
  }
  syncBattleCompanions(player, battle);
  await saveCurrentPlayer(false);
  renderBattle();
}

function tryEscape() {
  if (state.battle.type !== "normal") {
    return toast("副本與主線戰不能逃跑。", "warning");
  }
  if (Math.random() < 0.65) {
    state.battle.log.push("你成功脫離戰鬥。");
    state.battle = null;
    renderStatus("你已撤退。");
  } else {
    state.battle.log.push("逃跑失敗。");
    performBattleTurn({ type: "defend" });
  }
}

function buildPlayer(name, raceCode, classCode) {
  const race = data.races.find(item => item.code === raceCode);
  const job = data.classes.find(item => item.code === classCode);
  const stats = structuredClone(baseStats);
  applyBonuses(stats, race.bonuses);
  applyBonuses(stats, job.bonuses);
  const sharedBranches = job.branches.map(name => ({ name, level: 0 }));
  return {
    name,
    raceCode,
    raceName: race.name,
    raceSkillName: race.skillName,
    raceSkillType: race.skillType,
    raceSkillDescription: race.skillDescription,
    classCode,
    className: job.name,
    level: 1,
    classLevel: 1,
    exp: 0,
    skillPoints: 1,
    storyStage: 1,
    dungeonClears: 0,
    currentAreaId: "green_fields",
    hp: stats.maxHp,
    mp: stats.maxMp,
    ...stats,
    gold: 30,
    activeClassCode: job.code,
    sharedBranches,
    classes: [
      {
        classCode: job.code,
        className: job.name,
        classLevel: 1,
        exp: 0,
        skillPoints: 1,
        branches: sharedBranches.map(branch => ({ ...branch })),
      },
    ],
    branches: sharedBranches.map(branch => ({ ...branch })),
    equipment: starterEquipmentForClass(job.name),
    companions: [],
    inventory: [
      { ...structuredClone(data.itemCatalog.potion_hp_s), quantity: 2 },
      { ...structuredClone(data.itemCatalog.potion_mp_s), quantity: 1 },
      { ...structuredClone(data.itemCatalog.field_bandage), quantity: 1 },
    ],
  };
}

function getPlayerClasses(player) {
  player.classes ??= [];
  return player.classes;
}

function getClassDefinition(codeOrName) {
  return data.classes.find(item => item.code === codeOrName || item.name === codeOrName) || null;
}

function getClassEntry(player, classCode) {
  return getPlayerClasses(player).find(entry => entry.classCode === classCode) || null;
}

function totalPlayerLevel(player) {
  return getPlayerClasses(player).reduce((sum, entry) => sum + Math.max(1, entry.classLevel || 1), 0);
}

function currentActiveClass(player) {
  const classes = getPlayerClasses(player);
  if (!classes.length) return null;
  return getClassEntry(player, player.activeClassCode) || classes[0];
}

function mergeBranchLevelsIntoPool(pool, branches = []) {
  for (const branch of branches) {
    const name = typeof branch === "string" ? branch : branch?.name;
    if (!name) continue;
    const level = typeof branch === "string" ? 0 : Math.max(0, branch.level || 0);
    const existing = pool.find(item => item.name === name);
    if (existing) {
      existing.level = Math.max(existing.level || 0, level);
    } else {
      pool.push({ name, level });
    }
  }
}

function ensureSharedBranches(player) {
  const pool = [];
  mergeBranchLevelsIntoPool(pool, player.sharedBranches || []);
  mergeBranchLevelsIntoPool(pool, player.branches || []);
  getPlayerClasses(player).forEach(entry => {
    const classDef = getClassDefinition(entry.classCode || entry.className);
    mergeBranchLevelsIntoPool(pool, classDef?.branches || []);
    mergeBranchLevelsIntoPool(pool, entry.branches || []);
  });
  player.sharedBranches = pool;
  return player.sharedBranches;
}

function setSharedBranchLevel(player, branchName, level) {
  const pool = ensureSharedBranches(player);
  const existing = pool.find(branch => branch.name === branchName);
  if (existing) {
    existing.level = Math.max(0, level || 0);
    return existing;
  }
  const created = { name: branchName, level: Math.max(0, level || 0) };
  pool.push(created);
  return created;
}

function branchLevelsForClass(player, classCodeOrName) {
  const classDef = getClassDefinition(classCodeOrName);
  const branchNames = classDef?.branches || [];
  ensureSharedBranches(player);
  return branchNames.map(name => ({ name, level: (player.sharedBranches || []).find(branch => branch.name === name)?.level || 0 }));
}

function ownedBranchNames(player) {
  ensureSharedBranches(player);
  return (player.sharedBranches || []).map(branch => branch.name);
}

function syncClassBranchSnapshots(player) {
  ensureSharedBranches(player);
  getPlayerClasses(player).forEach(entry => {
    entry.branches = branchLevelsForClass(player, entry.classCode || entry.className);
  });
  const active = currentActiveClass(player);
  player.branches = active ? branchLevelsForClass(player, active.classCode || active.className) : [];
}

function commitActiveClassState(player) {
  const active = currentActiveClass(player);
  if (!active) return;
  (player.branches || []).forEach(branch => setSharedBranchLevel(player, branch.name, branch.level || 0));
  active.classCode = player.classCode;
  active.className = player.className;
  active.classLevel = player.classLevel;
  active.exp = player.exp;
  active.skillPoints = player.skillPoints;
  syncClassBranchSnapshots(player);
  active.branches = branchLevelsForClass(player, active.classCode || active.className);
}

function syncActiveClassState(player) {
  const active = currentActiveClass(player);
  if (!active) return;
  ensureSharedBranches(player);
  player.activeClassCode = active.classCode;
  player.classCode = active.classCode;
  player.className = active.className;
  player.classLevel = active.classLevel || 1;
  player.exp = active.exp || 0;
  player.skillPoints = active.skillPoints ?? 0;
  player.branches = branchLevelsForClass(player, active.classCode || active.className);
  player.level = totalPlayerLevel(player);
}

function playerClassLevel(player, classCode) {
  return getClassEntry(player, classCode)?.classLevel || 0;
}

function canUnlockClass(player, classDef) {
  if (getClassEntry(player, classDef.code)) return false;
  const requirements = classDef.requirements || [];
  return requirements.every(requirement => playerClassLevel(player, requirement.classCode) >= requirement.level);
}

function classRequirementText(classDef) {
  if (!classDef.requirements?.length) return "基礎職業，可直接轉職。";
  return classDef.requirements
    .map(requirement => {
      const job = getClassDefinition(requirement.classCode);
      return `${job?.name || requirement.classCode} Lv.${requirement.level}`;
    })
    .join(" + ");
}

function unlockOrSwitchClass(player, classCode) {
  commitActiveClassState(player);
  const existing = getClassEntry(player, classCode);
  if (existing) {
    player.activeClassCode = classCode;
    syncActiveClassState(player);
    return `${player.className} 已設為目前職業。`;
  }
  const classDef = getClassDefinition(classCode);
  if (!classDef) return "找不到該職業。";
  if (totalPlayerLevel(player) >= 1000) return "總等級已達 1000，無法再新增職業。";
  if (!canUnlockClass(player, classDef) && classDef.requirements?.length) {
    return "尚未達成轉職條件。";
  }
  const gainedHp = classDef.bonuses?.maxHp || 0;
  const gainedMp = classDef.bonuses?.maxMp || 0;
  applyBonuses(player, classDef.bonuses || {});
  player.hp += gainedHp;
  player.mp += gainedMp;
  (classDef.branches || []).forEach(name => setSharedBranchLevel(player, name, branchLevel(player, name)));
  getPlayerClasses(player).push({
    classCode: classDef.code,
    className: classDef.name,
    classLevel: 1,
    exp: 0,
    skillPoints: 1,
    branches: branchLevelsForClass(player, classDef.code),
  });
  player.activeClassCode = classDef.code;
  syncClassBranchSnapshots(player);
  syncActiveClassState(player);
  return `${classDef.name} 已解鎖並成為目前職業。`;
}

function effectiveStats(player) {
  const stats = {
    maxHp: player.maxHp,
    maxMp: player.maxMp,
    attack: player.attack,
    defense: player.defense,
    magic: player.magic,
    resistance: player.resistance,
    speed: player.speed,
    luck: player.luck,
  };
  (player.equipment || []).forEach(item => {
    Object.entries(item.bonuses || {}).forEach(([key, value]) => {
      stats[key] += value;
    });
  });
  return stats;
}

function battleStats(player, battle) {
  const stats = effectiveStats(player);
  if (player.raceName === "??" && battle.turn <= 3) {
    ["attack", "defense", "magic", "resistance", "speed", "luck"].forEach(key => { stats[key] += 2; });
  }
  if (player.raceName === "獸人" && player.hp <= stats.maxHp * 0.4) stats.attack += 5;
  if (battle.buffs.attack) stats.attack += 5;
  if (battle.buffs.defense) stats.defense += 5;
  if (battle.buffs.magic) stats.magic += 5;
  if (battle.buffs.resistance) stats.resistance += 5;
  if (battle.buffs.speed) stats.speed += 5;
  if (battle.selfBuffs?.attack) stats.attack += 5;
  if (battle.selfBuffs?.defense) stats.defense += 5;
  if (battle.selfBuffs?.magic) stats.magic += 5;
  if (battle.selfBuffs?.resistance) stats.resistance += 5;
  if (battle.selfBuffs?.speed) stats.speed += 5;
  if (skillKnown(player, "決死反攻") && player.hp <= stats.maxHp * 0.4) stats.attack += 8;
  if (battle.buffs.dragon) {
    stats.attack += 6;
    stats.magic += 6;
  }
  refreshPlayerStanceBuffs(battle);
  if (battle.selfBuffs?.attackBoost) stats.attack = Math.floor(stats.attack * battle.selfBuffs.attackBoost);
  if (battle.selfBuffs?.magicBoost) stats.magic = Math.floor(stats.magic * battle.selfBuffs.magicBoost);
  if (battle.selfBuffs?.transcend > 0) {
    stats.attack *= 2;
    stats.defense *= 2;
    stats.magic *= 2;
    stats.resistance *= 2;
    stats.speed *= 2;
  }
  if (battle.selfBuffs && Number.isFinite(battle.selfBuffs.defensePenalty) && battle.selfBuffs.defensePenalty >= 0 && ((battle.selfBuffs.berserk || 0) > 0 || (battle.selfBuffs.allIn || 0) > 0)) {
    stats.defense = Math.max(0, Math.floor(stats.defense * battle.selfBuffs.defensePenalty));
  }
  if ((battle.selfBuffs?.spellblade || 0) > 0) stats.attack += stats.magic;
  return stats;
}

function dealDamage(attackValue, defenseValue, power, element, monster) {
  const base = Math.max(1, Math.floor(attackValue * power - defenseValue / 2 + randomInt(0, 5)));
  const elements = typeof element === "string" && element.includes("|") ? element.split("|") : [element];
  const multiplier = Math.max(...elements.filter(Boolean).map(item => elementMultiplier(item, monster.elements)), 1);
  return Math.max(1, Math.floor(base * multiplier));
}

function chooseMonsterSkill(monster, battle) {
  const skills = (monster.skills || []).filter(skill => monster.mp >= (skill.cost || 0));
  if (!skills.length) return null;
  const hpRatio = monster.currentHp / Math.max(1, monster.maxHp);
  const weighted = skills.map(skill => {
    let weight = Math.max(1, skill.weight || 1);
    if (skill.kind === "healSelf") {
      weight = hpRatio <= 0.45 ? weight * 4 : Math.max(1, Math.floor(weight * 0.4));
    }
    if (["buffAttackSelf", "buffDefenseSelf", "buffMagicSelf"].includes(skill.kind)) {
      const key = skill.kind === "buffAttackSelf" ? "attack" : skill.kind === "buffDefenseSelf" ? "defense" : "magic";
      weight = monster.battleBuffs?.[key] > 0 ? 1 : (battle.turn <= 3 ? weight * 2 : weight);
    }
    if (skill.targetScope === "all_party" && livingEnemies(battle).length === 1) {
      weight += 1;
    }
    return { ...skill, weight };
  });
  return weightedPick(weighted);
}

function chooseMonsterTarget(monster, partyTargets, battle) {
  const forcedPlayer = battle.selfBuffs.taunt > 0 && state.currentPlayer?.hp > 0;
  if (forcedPlayer) {
    return partyTargets.find(item => item.type === "player") || partyTargets[0];
  }
  return partyTargets[Math.floor(Math.random() * partyTargets.length)];
}

function monsterHitTarget(monster, skill, target, battle, defend) {
  const monsterStats = monsterBattleStats(monster, battle);
  const blindPenalty = monster.ailments.blind > 0 ? 0.5 : 0;
  const evadeRate = Math.min(0.85, 0.05 + Math.max(0, target.stats.speed - monsterStats.speed) * 0.01 + battle.buffs.evade + (target.type === "player" ? battle.selfBuffs.evade : (target.actor.battleBuffs?.evade || 0)) + blindPenalty);
  if (Math.random() < evadeRate) {
    battle.log.push(`${target.actor.name} 閃過了 ${monster.name} 的 ${skill.name}。`);
    return;
  }
  if (target.type === "player" && battle.selfBuffs.afterimage > 0) {
    battle.selfBuffs.afterimage = 0;
    battle.log.push(`${target.actor.name} 的殘影替身化解了 ${skill.name}。`);
    return;
  }
  if (target.type === "companion" && target.actor.battleBuffs?.afterimage > 0) {
    target.actor.battleBuffs.afterimage = 0;
    battle.log.push(`${target.actor.name} 的殘影化解了 ${skill.name}。`);
    return;
  }
  const attackStat = skill.stat === "magic" ? monsterStats.magic : monsterStats.attack;
  const defenseStat = skill.stat === "magic" ? target.stats.resistance : target.stats.defense;
  let damage = skill.kind === "attackIgnoreDefense"
    ? Math.max(1, Math.floor(attackStat * skill.power + randomInt(0, 4)))
    : Math.max(1, Math.floor(attackStat * skill.power - defenseStat / 2 + randomInt(0, 4)));
  damage = Math.max(1, Math.floor(damage * elementMultiplier(skill.element, target.actor.elements || [])));
  if (target.defend) damage = Math.floor(damage * (battle.selfBuffs.shield > 0 ? 0.4 : 0.65));
  if (battle.selfBuffs.sanctuary > 0) damage = Math.floor(damage * 0.5);
  if (target.type === "player" && target.actor.raceName === "矮人" && !battle.dwarfGuardUsed) {
    damage = Math.floor(damage * 0.7);
    battle.dwarfGuardUsed = true;
    battle.log.push("鋼鐵體魄發動，首次重擊傷害被削減。");
  }
  target.actor.hp = Math.max(0, target.actor.hp - damage);
  battle.log.push(`${monster.name} 對 ${target.actor.name} 使用 ${skill.name}，造成 ${damage} 點傷害。`);
  if (skill.kind === "attackDrain") {
    const heal = Math.max(1, Math.floor(damage * 0.3));
    monster.currentHp = Math.min(monster.maxHp, monster.currentHp + heal);
    battle.log.push(`${monster.name} 吸收了 ${heal} HP。`);
  }
  if (target.type === "player" && target.actor.className === "武鬥家" && skillKnown(target.actor, "真氣爆發")) {
    battle.selfBuffs.chi = Math.min(5, (battle.selfBuffs.chi || 0) + 1);
    battle.log.push("真氣爆發觸發，獲得 1 層聚氣。");
  }
  if (target.type === "player" && battle.selfBuffs.counter > 0 && Math.random() < 0.3) {
    const counterDamage = Math.max(1, Math.floor(battleStats(target.actor, battle).attack * 0.9));
    monster.currentHp = Math.max(0, monster.currentHp - counterDamage);
    battle.log.push(`${target.actor.name} 反擊成功，造成 ${counterDamage} 點傷害。`);
  }
}

function executeMonsterSkill(monster, skill, player, battle, partyTargets, defend) {
  if (skill.kind === "healSelf") {
    const amount = Math.max(8, Math.floor(monster.magic * Math.max(0.2, skill.power || 0.2)) + randomInt(6, 12));
    monster.currentHp = Math.min(monster.maxHp, monster.currentHp + amount);
    battle.log.push(`${monster.name} 使用 ${skill.name}，回復 ${amount} HP。`);
    return;
  }
  if (skill.kind === "buffAttackSelf") {
    monster.battleBuffs.attack = Math.max(monster.battleBuffs.attack, 3);
    battle.log.push(`${monster.name} 使用 ${skill.name}，攻擊力提升。`);
    return;
  }
  if (skill.kind === "buffDefenseSelf") {
    monster.battleBuffs.defense = Math.max(monster.battleBuffs.defense, 3);
    battle.log.push(`${monster.name} 使用 ${skill.name}，防禦力提升。`);
    return;
  }
  if (skill.kind === "buffMagicSelf") {
    monster.battleBuffs.magic = Math.max(monster.battleBuffs.magic, 3);
    battle.log.push(`${monster.name} 使用 ${skill.name}，魔法力提升。`);
    return;
  }
  if (skill.kind === "multiHit") {
    const target = chooseMonsterTarget(monster, partyTargets, battle);
    const hitCount = Math.max(2, skill.hits || 2);
    for (let i = 0; i < hitCount; i += 1) {
      if (target.actor.hp <= 0) break;
      monsterHitTarget(monster, skill, target, battle, defend);
    }
    return;
  }
  if (skill.targetScope === "all_party" || skill.kind === "attackAll") {
    partyTargets.forEach(target => {
      if (target.actor.hp > 0) monsterHitTarget(monster, { ...skill, kind: "attack" }, target, battle, defend);
    });
    return;
  }
  const target = chooseMonsterTarget(monster, partyTargets, battle);
  monsterHitTarget(monster, skill, target, battle, defend);
}

function elementMultiplier(attackElement, monsterElements) {
  if (!attackElement) return 1;
  if (monsterElements.some(item => (elementAdvantage[attackElement] || []).includes(item))) return 1.25;
  if (monsterElements.some(item => (elementAdvantage[item] || []).includes(attackElement))) return 0.85;
  return 1;
}

function applyLifesteal(player, damage, battle) {
  if (player.raceName !== "吸血族" || damage <= 0) return;
  const heal = Math.max(1, Math.floor(damage / 5));
  player.hp = Math.min(effectiveStats(player).maxHp, player.hp + heal);
  battle.log.push(`鮮血汲取發動，回復 ${heal} HP。`);
}

function dualWieldBonus(player) {
  return player.className === "盜賊" && player.equipment.some(item => item.slot === "副手") ? 0.2 : 0;
}

function skillCost(player, skill) {
  const baseCost = Math.max(0, Math.ceil((skill.cost || 0) * 0.5));
  if (baseCost <= 0) return 0;
  if (player.raceName === "???" && skill.school === "??") {
    return Math.max(1, Math.floor(baseCost * 0.8));
  }
  return baseCost;
}

function createMonsterAilments() {
  return { burn: 0, poison: 0, freeze: 0, paralyze: 0, blind: 0, sleep: 0, trap: 0, stun: 0, fear: 0, attackDown: 0, defenseDown: 0, resistanceDown: 0, speedDown: 0 };
}

function createBattleBuffs() {
  return {
    attack: 0,
    defense: 0,
    magic: 0,
    resistance: 0,
    speed: 0,
    evade: 0,
    shield: 0,
    counter: 0,
    afterimage: 0,
    statusWard: 0,
    sanctuary: 0,
    regen: 0,
    regenMp: 0,
    taunt: 0,
    chi: 0,
    coverAll: 0,
    spellblade: 0,
    allIn: 0,
    berserk: 0,
    attackBoost: 0,
    defensePenalty: 0,
    magicBoost: 0,
    transcend: 0,
    weaponElement: null,
    weaponElements: null,
    weaponEnchantTurns: 0,
    elementalWard: null,
  };
}

function buildBattleEnemy(monster) {
  return {
    ...structuredClone(monster),
    currentHp: monster.hp,
    maxHp: monster.hp,
    ailments: createMonsterAilments(),
    battleBuffs: createBattleBuffs(),
    skills: (data.monsterSkills[monster.code] || []).map(skill => ({ ...structuredClone(skill) })),
  };
}

function livingEnemies(battle) {
  return (battle.enemies || []).filter(enemy => enemy.currentHp > 0);
}

function selectedEnemy(battle) {
  const enemies = battle.enemies || [];
  if (!enemies.length) return null;
  const current = enemies[battle.selectedEnemy ?? 0];
  if (current && current.currentHp > 0) return current;
  const nextIndex = enemies.findIndex(enemy => enemy.currentHp > 0);
  if (nextIndex >= 0) {
    battle.selectedEnemy = nextIndex;
    return enemies[nextIndex];
  }
  return null;
}

function allyTargets(player, battle, includeFallen = false) {
  return getPartyMembers(player, battle.companions || []).filter(member => includeFallen || member.hp > 0);
}

function skillTargetType(skill) {
  const enemyKinds = new Set([
    "attack", "attackDebuffDefense", "attackDebuffAttack", "attackDebuffResistance",
    "attackPoison", "attackSleep", "attackBlind", "attackTrap", "attackDebuffSpeed", "attackStun", "attackFreeze",
    "attackBurn", "multiHit", "attackIgnoreDefense", "attackParalyze", "attackDualElement",
    "attackDrain", "attackBuffSpeed", "chiBlast", "attackAfterimage", "steal", "riskyTriple",
    "executeAilment", "attackInstantDeath", "multiHitStun"
  ]);
  const allyKinds = new Set([
    "heal", "fullHealSingle", "buffAttackSingle", "buffDefenseSingle", "buffResistanceSingle", "buffAttackSingleStrong",
    "buffAttackDefenseSingle", "buffMagicResistanceSingle", "buffSpeedSingle", "regenHpSingle", "allyHpTransfer",
    "allyMpTransfer", "buffSpeedSingleStrong"
  ]);
  if (enemyKinds.has(skill.kind)) return "enemy";
  if (allyKinds.has(skill.kind)) return "ally";
  if (skill.kind === "reviveOne") return "fallen_ally";
  return "none";
}

function monsterBattleStats(monster, battle) {
  const ailments = monster?.ailments || createMonsterAilments();
  const buffs = monster?.battleBuffs || createBattleBuffs();
  return {
    attack: Math.max(1, monster.attack - (ailments.attackDown ? 5 : 0) + (buffs.attack ? 5 : 0)),
    defense: Math.max(0, monster.defense - (ailments.defenseDown ? 6 : 0) + (buffs.defense ? 5 : 0)),
    magic: Math.max(1, monster.magic + (buffs.magic ? 5 : 0)),
    resistance: Math.max(0, monster.resistance - (ailments.resistanceDown ? 6 : 0) - (ailments.burn ? 3 : 0) - (ailments.freeze ? 3 : 0) + (buffs.resistance ? 5 : 0)),
    speed: Math.max(1, monster.speed - (ailments.speedDown ? 5 : 0) - (ailments.freeze ? 4 : 0) + (buffs.speed ? 5 : 0)),
  };
}

function resolvePlayerAttackElement(player, battle, fallbackElement = null) {
  if (fallbackElement) return fallbackElement;
  const selfBuffs = battle?.selfBuffs || {};
  if (Array.isArray(selfBuffs.weaponElements) && selfBuffs.weaponElements.length) {
    return selfBuffs.weaponElements[randomInt(0, selfBuffs.weaponElements.length - 1)];
  }
  if (selfBuffs.weaponElement) return selfBuffs.weaponElement;
  const weapon = (player.equipment || []).find(item => item.slot === "???");
  return weapon?.element || null;
}

function resolveCompanionAttackElement(companion) {
  return companion.attackElement || null;
}

function refreshPlayerStanceBuffs(battle) {
  if (!battle?.selfBuffs) return;
  if ((battle.selfBuffs.weaponEnchantTurns || 0) <= 0) {
    battle.selfBuffs.weaponElement = null;
    battle.selfBuffs.weaponElements = null;
  }
  if ((battle.selfBuffs.allIn || 0) > 0) {
    battle.selfBuffs.attackBoost = 4;
    battle.selfBuffs.defensePenalty = 0;
    return;
  }
  if ((battle.selfBuffs.berserk || 0) > 0) {
    battle.selfBuffs.attackBoost = 2;
    battle.selfBuffs.defensePenalty = 0.5;
    return;
  }
  if ((battle.selfBuffs.weaponEnchantTurns || 0) > 0) {
    battle.selfBuffs.attackBoost = Math.max(1.15, battle.selfBuffs.attackBoost || 0);
  } else {
    battle.selfBuffs.attackBoost = 0;
  }
  battle.selfBuffs.defensePenalty = 0;
}

function wakeSleepingMonster(monster, battle) {
  if (monster?.ailments?.sleep > 0 && Math.random() < 0.3) {
    monster.ailments.sleep = 0;
    battle.log.push(`${monster.name} ????????`);
  }
}

function monsterHasAnyAilment(monster) {
  return Object.values(monster?.ailments || {}).some(value => value > 0);
}

function castAttackAll(skill, player, battle, stats) {
  let total = 0;
  livingEnemies(battle).forEach(target => {
    total += castAttackSkill(skill, player, battle, target, stats, monsterBattleStats(target, battle));
  });
  return total;
}

function castAttackRandom(skill, player, battle, stats, hitCount = 1) {
  let total = 0;
  for (let i = 0; i < hitCount; i += 1) {
    const targets = livingEnemies(battle);
    if (!targets.length) break;
    const target = targets[randomInt(0, targets.length - 1)];
    total += castAttackSkill(skill, player, battle, target, stats, monsterBattleStats(target, battle));
  }
  return total;
}

function clearPlayerStanceBuffs(battle, key) {
  if (!battle?.selfBuffs) return;
  if (key === "weaponEnchantTurns" && battle.selfBuffs.weaponEnchantTurns <= 0) {
    battle.selfBuffs.weaponElement = null;
    battle.selfBuffs.weaponElements = null;
  }
  refreshPlayerStanceBuffs(battle);
}

function tickActorBuffs(actor, buffs, battle, label) {
  if (!buffs) return;
  ["attack", "defense", "magic", "resistance", "speed", "shield", "counter", "afterimage", "statusWard", "sanctuary", "regen", "regenMp", "taunt", "coverAll", "spellblade", "allIn", "berserk", "transcend", "weaponEnchantTurns"].forEach(key => {
    if (buffs[key] > 0) buffs[key] -= 1;
  });
  buffs.evade = Math.max(0, (buffs.evade || 0) - 0.15);
  if (buffs.regen > 0) {
    const heal = Math.max(1, Math.floor(actor.maxHp * 0.1));
    actor.hp = Math.min(actor.maxHp, actor.hp + heal);
    battle.log.push(`${label} ???????? ${heal} HP?`);
  }
  if (buffs.regenMp > 0) {
    const restore = Math.max(1, Math.floor(actor.maxMp * 0.08));
    actor.mp = Math.min(actor.maxMp, actor.mp + restore);
    battle.log.push(`${label} ? MP ????? ${restore}?`);
  }
  if ((buffs.regenMp || 0) <= 0) buffs.magicBoost = 0;
}

function castAttackSkill(skill, player, battle, monster, stats, monsterStats) {
  if (!monster || monster.currentHp <= 0) return 0;
  const targetStats = monsterStats || monsterBattleStats(monster, battle);
  const attackElement = resolvePlayerAttackElement(player, battle, skill.element || null);
  const targetDefense = skill.stat === "magic" ? targetStats.resistance : targetStats.defense;
  const damage = dealDamage(stats[skill.stat], targetDefense, skill.power, attackElement, monster);
  monster.currentHp = Math.max(0, monster.currentHp - damage);
  battle.log.push(`${player.name} 使用 ${skill.name}，對 ${monster.name} 造成 ${damage} 點傷害。`);
  wakeSleepingMonster(monster, battle);
  applyLifesteal(player, damage, battle);
  if (player.raceName === "吸血族" && skill.stat === "magic" && Math.random() < 0.35) {
    player.mp = Math.min(effectiveStats(player).maxMp, player.mp + 5);
    battle.log.push("吸血族天賦發動，回復 5 MP。");
  }
  return damage;
}

function holyHealAmount(player, skill, stats, power, bonusMin, bonusMax) {
  let heal = Math.floor(stats.magic * power + randomInt(bonusMin, bonusMax));
  if (player.raceName === "天翼族" && skill.school === "天法") {
    heal = Math.floor(heal * 1.2);
  }
  return heal;
}

function applyMonsterAilment(monster, key, duration, message, battle) {
  if (!monster.ailments) monster.ailments = createMonsterAilments();
  monster.ailments[key] = Math.max(monster.ailments[key] || 0, duration);
  if (message) battle.log.push(message);
}

function tryApplyChanceAilment(monster, key, skill, monsterName, detail, battle) {
  if (Math.random() >= (skill.chance || 0)) return;
  applyMonsterAilment(monster, key, skill.duration || 2, `${monsterName} ${detail}。`, battle);
}

function processMonsterAilments(battle, monster) {
  const ailments = monster.ailments || createMonsterAilments();
  if (ailments.burn > 0) {
    const damage = Math.max(4, Math.floor(monster.maxHp * 0.08) + randomInt(1, 4));
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    battle.log.push(`${monster.name} ????? ${damage} ????`);
    if (monster.currentHp <= 0) return "defeated";
  }
  if (ailments.poison > 0) {
    const damage = Math.max(3, Math.floor(monster.maxHp * 0.1) + randomInt(1, 3));
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    battle.log.push(`${monster.name} ????? ${damage} ????`);
    if (monster.currentHp <= 0) return "defeated";
  }
  if (ailments.trap > 0) {
    monster.currentHp = Math.max(0, monster.currentHp - 50);
    battle.log.push(`${monster.name} ??????? 50 ????`);
    if (monster.currentHp <= 0) return "defeated";
  }
  if (ailments.sleep > 0) {
    battle.log.push(`${monster.name} ???????????`);
    return "skip";
  }
  if (ailments.stun > 0) {
    battle.log.push(`${monster.name} ?????????`);
    return "skip";
  }
  if (ailments.fear > 0 && Math.random() < 0.35) {
    battle.log.push(`${monster.name} ????????`);
    return "skip";
  }
  if (ailments.freeze > 0 && Math.random() < 0.55) {
    battle.log.push(`${monster.name} ?????????????????`);
    return "skip";
  }
  if (ailments.paralyze > 0 && Math.random() < 0.4) {
    battle.log.push(`${monster.name} ?????????`);
    return "skip";
  }
  return "act";
}

function formatMonsterAilments(ailments = {}) {
  const labels = {
    burn: "燒傷",
    poison: "中毒",
    freeze: "凍結",
    paralyze: "麻痺",
    blind: "失明",
    sleep: "睡眠",
    trap: "陷阱",
    stun: "暈眩",
    fear: "恐懼",
    attackDown: "攻擊下降",
    defenseDown: "防禦下降",
    resistanceDown: "抵抗下降",
    speedDown: "速度下降",
  };
  const active = Object.entries(ailments).filter(([, value]) => value > 0).map(([key, value]) => `${labels[key] || key} ${value}`);
  return active.length ? active.join(" / ") : "無";
}

function formatMonsterSkillList(monster) {
  const names = (monster?.skills || []).map(skill => skill.name);
  return names.length ? names.join("、") : (monster?.note || "普通攻擊");
}

function tickBuffs(battle) {
  ["attack", "defense", "magic", "resistance", "speed", "dragon"].forEach(key => {
    if (battle.buffs[key] > 0) battle.buffs[key] -= 1;
  });
  battle.buffs.evade = Math.max(0, battle.buffs.evade - 0.15);

  if (state.currentPlayer) {
    tickActorBuffs(state.currentPlayer, battle.selfBuffs, battle, state.currentPlayer.name);
    clearPlayerStanceBuffs(battle, "weaponEnchantTurns");
  }

  (battle.companions || []).forEach(companion => {
    if (!companion.battleBuffs) return;
    tickActorBuffs(companion, companion.battleBuffs, battle, companion.name);
  });

  (battle.enemies || []).forEach(enemy => {
    Object.keys(enemy.ailments || {}).forEach(key => {
      if (enemy.ailments[key] > 0) enemy.ailments[key] -= 1;
    });
    if (enemy.battleBuffs) {
      ["attack", "defense", "magic", "resistance", "speed", "shield", "counter", "afterimage", "statusWard", "sanctuary", "regen", "regenMp", "taunt", "coverAll", "spellblade", "allIn", "berserk", "transcend", "weaponEnchantTurns"].forEach(key => {
        if (enemy.battleBuffs[key] > 0) enemy.battleBuffs[key] -= 1;
      });
      enemy.battleBuffs.evade = Math.max(0, (enemy.battleBuffs.evade || 0) - 0.15);
    }
  });
}

async function restPlayer() {
  if (!state.currentPlayer) return toast("請先建立或讀取角色。", "warning");
  const player = state.currentPlayer;
  const partySize = 1 + ((player.companions || []).length);
  const restCost = partySize * 5;
  if (player.gold < restCost) {
    return toast(`金幣不足，旅店休息需要 ${restCost} 金幣。`, "warning");
  }
  player.gold -= restCost;
  const stats = effectiveStats(player);
  player.hp = stats.maxHp;
  player.mp = stats.maxMp;
  (player.companions || []).forEach(companion => {
    companion.hp = companion.maxHp;
    companion.mp = companion.maxMp;
  });
  await saveCurrentPlayer(false);
  renderGameHub(`你在旅店休息，花費 ${restCost} 金幣，隊伍全員已完全恢復。`);
}

async function saveCurrentPlayer(showMessage = true) {
  if (!state.currentPlayer) return;
  if (state.auth.enabled && !state.auth.user) {
    toast("\u8acb\u5148\u767b\u5165\u5f8c\u518d\u5132\u5b58\u89d2\u8272\u3002", "warning");
    renderAuthScreen("login");
    return;
  }
  commitActiveClassState(state.currentPlayer);
  normalizePlayer(state.currentPlayer);
  await dbApi.updatePlayer(state.currentPlayer);
  if (showMessage) toast("\u89d2\u8272\u5df2\u6210\u529f\u5132\u5b58\u3002", "success");
}

function nextLevelExp(level) {
  return 100 + (level - 1) * 40;
}

function spentSkillPoints(player) {
  ensureSharedBranches(player);
  return (player.sharedBranches || []).reduce((sum, branch) => sum + (branch.level || 0), 0);
}

function branchLevel(player, branchName) {
  ensureSharedBranches(player);
  return (player.sharedBranches || []).find(branch => branch.name === branchName)?.level || 0;
}

function buildSkillReference(player, className, skillIndex) {
  const skill = (data.classSkills[className] || [])[skillIndex];
  if (!skill) return null;
  const unlockData = classSkillUnlocks[className]?.[skill.name] || [];
  return {
    className,
    classCode: getClassDefinition(className)?.code || className,
    skillIndex,
    skill,
    branch: skill.branch || unlockData[0] || null,
    requiredPoints: skill.requiredPoints ?? unlockData[1] ?? 0,
  };
}

function ownedSkillReferences(player) {
  const activeCode = player.activeClassCode;
  const refs = [];
  getPlayerClasses(player).forEach(classEntry => {
    (data.classSkills[classEntry.className] || []).forEach((skill, skillIndex) => {
      const ref = buildSkillReference(player, classEntry.className, skillIndex);
      if (ref) refs.push(ref);
    });
  });
  refs.sort((a, b) => {
    const aActive = a.classCode === activeCode ? 0 : 1;
    const bActive = b.classCode === activeCode ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    if ((a.branch || "") !== (b.branch || "")) return (a.branch || "").localeCompare(b.branch || "", "zh-Hant");
    if ((a.requiredPoints || 0) !== (b.requiredPoints || 0)) return (a.requiredPoints || 0) - (b.requiredPoints || 0);
    return a.skill.name.localeCompare(b.skill.name, "zh-Hant");
  });
  const deduped = [];
  const seen = new Map();
  refs.forEach(ref => {
    const key = ref.skill.name;
    const existingIndex = seen.get(key);
    if (existingIndex === undefined) {
      seen.set(key, deduped.length);
      deduped.push(ref);
      return;
    }
    const existing = deduped[existingIndex];
    if (existing.classCode !== activeCode && ref.classCode === activeCode) {
      deduped[existingIndex] = ref;
    }
  });
  return deduped;
}

function isSkillUnlocked(player, skillRefOrIndex, className = player.className) {
  const ref = typeof skillRefOrIndex === "number"
    ? buildSkillReference(player, className, skillRefOrIndex)
    : skillRefOrIndex;
  if (!ref) return false;
  if (!ref.branch) return true;
  return branchLevel(player, ref.branch) >= (ref.requiredPoints || 0);
}

function availableSkills(player) {
  return ownedSkillReferences(player)
    .filter(ref => isSkillUnlocked(player, ref) && !ref.skill.kind.startsWith("passive"));
}

function skillKnown(player, skillName) {
  return ownedSkillReferences(player)
    .some(ref => ref.skill.name === skillName && isSkillUnlocked(player, ref));
}

function skillUnlockText(player, skill) {
  if (!skill.branch) return "已解鎖";
  const current = branchLevel(player, skill.branch);
  return `需 ${skill.branch} 投入 ${skill.requiredPoints || 0} 點，目前 ${current} 點`;
}

function skillKindText(kind) {
  if (kind.startsWith("attack")) return "攻擊技能";
  if (kind.includes("heal") || kind.includes("cleanse") || kind === "revive") return "回復技能";
  return "輔助技能";
}

function applyBonuses(target, bonuses) {
  Object.entries(bonuses).forEach(([key, value]) => {
    target[key] += value;
  });
}

function choiceCard(title, desc, bonusText, group, code) {
  return `
    <button class="choice-card" type="button" data-group="${group}" data-code="${code}">
      <h4>${title}</h4>
      <p>${desc}</p>
      <p class="muted">${bonusText}</p>
    </button>
  `;
}

function bindChoiceCards() {
  app.querySelectorAll(".choice-card").forEach(button => {
    button.addEventListener("click", () => {
      const group = button.dataset.group;
      app.querySelectorAll(`.choice-card[data-group='${group}']`).forEach(card => card.classList.remove("selected"));
      button.classList.add("selected");
    });
  });
}

function statCell(label, value) {
  return `<div class="stat"><strong>${label}</strong><p>${value}</p></div>`;
}

function toast(text, tone = "success") {
  app.insertAdjacentHTML("afterbegin", `<p class="${tone === "success" ? "success" : tone === "warning" ? "warning" : "danger"}">${text}</p>`);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function leaveCurrentPlayer() {
  state.currentPlayer = null;
  state.battle = null;
  state.shopStock = [];
  renderHome();
}

function normalizePlayer(player) {
  if (!player) return;
  ensureCloudSaveId(player);
  const job = data.classes.find(item => item.name === player.className || item.code === player.classCode);
  player.skillPoints ??= 1;
  player.inventory ??= [];
  player.equipment ??= [];
  player.companions ??= [];
  player.currentAreaId ??= "green_fields";
  if (!getAreaById(player.currentAreaId)) {
    player.currentAreaId = "green_fields";
  }
  if (!player.classes?.length && job) {
    player.classes = [{
      classCode: job.code,
      className: job.name,
      classLevel: player.classLevel || player.level || 1,
      exp: player.exp || 0,
      skillPoints: player.skillPoints ?? 1,
      branches: (player.branches || job.branches || []).map(nameOrBranch => {
        if (typeof nameOrBranch === "string") return { name: nameOrBranch, level: 0 };
        return { name: nameOrBranch.name, level: nameOrBranch.level || 0 };
      }),
    }];
    player.activeClassCode = job.code;
  }
  getPlayerClasses(player).forEach(entry => {
    const classDef = getClassDefinition(entry.classCode || entry.className);
    entry.classCode = classDef?.code || entry.classCode;
    entry.className = classDef?.name || entry.className;
    entry.classLevel = entry.classLevel || 1;
    entry.exp ??= 0;
    entry.skillPoints ??= 1;
    const branchNames = classDef?.branches || [];
    if (!entry.branches || entry.branches.length !== branchNames.length || entry.branches.some((branch, index) => branch.name !== branchNames[index])) {
      entry.branches = branchNames.map(name => {
        const existing = (entry.branches || []).find(branch => branch.name === name);
        return { name, level: existing?.level || 0 };
      });
    }
  });
  ensureSharedBranches(player);
  syncClassBranchSnapshots(player);
  if (!player.activeClassCode || !getClassEntry(player, player.activeClassCode)) {
    player.activeClassCode = getPlayerClasses(player)[0]?.classCode || job?.code;
  }
  player.equipment = player.equipment.map(item => ({ bonuses: {}, ...item, bonuses: item.bonuses || {} }));
  player.companions = player.companions.map(companion => ({ ...companion, raceCode: companion.raceCode || "human", raceName: companion.raceName || (data.races.find(race => race.code === (companion.raceCode || "human"))?.name || "??"), exp: companion.exp || 0, level: companion.level || 1, classLevel: companion.classLevel || 1 }));
  syncActiveClassState(player);
}

function starterEquipmentForClass(className) {
  const basicArmor = [
    structuredClone(data.itemCatalog.cloth_robe),
    structuredClone(data.itemCatalog.cloth_pants),
    structuredClone(data.itemCatalog.grass_shoes),
  ];
  const weapons = {
    "戰士": [structuredClone(data.itemCatalog.wood_sword)],
    "武鬥家": [structuredClone(data.itemCatalog.wood_gauntlet)],
    "魔法師": [structuredClone(data.itemCatalog.wood_long_staff)],
    "僧侶": [structuredClone(data.itemCatalog.wood_short_staff)],
    "旅行者": [structuredClone(data.itemCatalog.wood_sword)],
    "盜賊": [structuredClone(data.itemCatalog.wood_dagger), { ...structuredClone(data.itemCatalog.wood_dagger), slot: "副手" }],
  };
  return basicArmor.concat(weapons[className] || []);
}

function rollDrop(monster) {
  const dropEntries = data.dropTables?.[monster.dropTable || monster.code] || [];
  if (dropEntries.length) {
    const picked = weightedPick(dropEntries);
    return picked?.itemKey || null;
  }
  if (!monster.drops?.length) return null;
  const rate = monster.category === "story" ? 1 : monster.category === "dungeon" ? 0.8 : 0.55;
  if (Math.random() > rate) return null;
  return monster.drops[Math.floor(Math.random() * monster.drops.length)];
}

function addItemToInventory(player, itemKey) {
  const template = structuredClone(data.itemCatalog[itemKey]);
  if (!player.inventory) player.inventory = [];
  if (template.type === "consumable") {
    const existing = player.inventory.find(item => item.key === itemKey);
    if (existing) {
      existing.quantity = (existing.quantity || 0) + 1;
      return existing;
    }
    template.quantity = 1;
  }
  player.inventory.push(template);
  return template;
}

function consumableTargetScope(item) {
  if (item?.targetScope) return item.targetScope;
  if (item?.reviveHpPercent) return "fallen_ally";
  return "single_ally";
}

function consumableTargetLabel(item) {
  const scope = consumableTargetScope(item);
  if (scope === "all_allies") return "全隊";
  if (scope === "fallen_ally") return "倒下隊友";
  return "單體隊友";
}

function getPartyMembers(player, companions = player?.companions || []) {
  return [player].concat(companions || []).filter(Boolean);
}

function memberMaxStats(member, player) {
  if (member === player) return effectiveStats(player);
  return { maxHp: member.maxHp || member.hp || 0, maxMp: member.maxMp || member.mp || 0 };
}

function targetableMembersForConsumable(player, item, companions = player?.companions || []) {
  const members = getPartyMembers(player, companions);
  const scope = consumableTargetScope(item);
  return members
    .map((member, partyIndex) => ({ member, partyIndex }))
    .filter(({ member }) => {
      if (scope === "fallen_ally") return member.hp <= 0;
      return member.hp > 0;
    });
}

function applyConsumableToTarget(item, target, player) {
  const maxStats = memberMaxStats(target, player);
  let hpGain = 0;
  let mpGain = 0;
  let revived = false;

  if (item.reviveHpPercent && target.hp <= 0) {
    const revivedHp = Math.max(1, Math.floor(maxStats.maxHp * item.reviveHpPercent));
    target.hp = revivedHp;
    if (typeof target.mp === "number" && target.mp < 0) target.mp = 0;
    revived = true;
    hpGain += revivedHp;
  }

  if (item.healHp && target.hp > 0) {
    const nextHp = Math.min(maxStats.maxHp, target.hp + item.healHp);
    hpGain += Math.max(0, nextHp - target.hp);
    target.hp = nextHp;
  }
  if (item.healMp && typeof target.mp === "number" && target.hp > 0) {
    const nextMp = Math.min(maxStats.maxMp, target.mp + item.healMp);
    mpGain += Math.max(0, nextMp - target.mp);
    target.mp = nextMp;
  }
  if (item.cureAilments?.length && target.ailments) {
    item.cureAilments.forEach(key => {
      if (target.ailments[key]) target.ailments[key] = 0;
    });
  }

  return { hpGain, mpGain, revived, changed: revived || hpGain > 0 || mpGain > 0 };
}

function consumeInventoryStack(player, index) {
  const item = player.inventory[index];
  item.quantity = (item.quantity || 1) - 1;
  if (item.quantity <= 0) {
    player.inventory.splice(index, 1);
  }
}

function useInventoryItem(index, options = {}) {
  const player = state.currentPlayer;
  const item = player.inventory[index];
  if (!item) return { ok: false, message: "找不到這個物品。" };
  if (item.type !== "consumable") return { ok: false, message: "這個物品不能直接使用。" };

  const companions = options.companions || player.companions || [];
  const scope = consumableTargetScope(item);
  const targets = targetableMembersForConsumable(player, item, companions);
  if (!targets.length) {
    return { ok: false, message: scope === "fallen_ally" ? "目前沒有倒下的隊友可使用此道具。" : "目前沒有需要使用此道具的隊友。" };
  }

  if (scope === "all_allies") {
    const results = targets.map(({ member }) => ({ member, effect: applyConsumableToTarget(item, member, player) })).filter(entry => entry.effect.changed);
    if (!results.length) return { ok: false, message: "目前沒有需要使用此道具的隊友。" };
    consumeInventoryStack(player, index);
    const totalHp = results.reduce((sum, entry) => sum + entry.effect.hpGain, 0);
    const totalMp = results.reduce((sum, entry) => sum + entry.effect.mpGain, 0);
    const pieces = [];
    if (totalHp) pieces.push(`共回復 ${totalHp} HP`);
    if (totalMp) pieces.push(`共回復 ${totalMp} MP`);
    return { ok: true, changed: true, message: `${item.name} 已使用，${pieces.join("、")}。` };
  }

  let targetEntry = null;
  if (Number.isInteger(options.partyIndex)) {
    targetEntry = targets.find(entry => entry.partyIndex === options.partyIndex) || null;
    if (!targetEntry) return { ok: false, message: "這個目標目前不能使用該道具。" };
  } else if (targets.length === 1) {
    targetEntry = targets[0];
  } else {
    return { ok: false, pending: true, message: `請選擇 ${item.name} 的使用對象。` };
  }

  const effect = applyConsumableToTarget(item, targetEntry.member, player);
  if (!effect.changed) return { ok: false, message: `${targetEntry.member.name} 目前不需要使用 ${item.name}。` };
  consumeInventoryStack(player, index);
  const pieces = [];
  if (effect.revived) pieces.push("復活");
  if (effect.hpGain) pieces.push(`回復 ${effect.hpGain} HP`);
  if (effect.mpGain) pieces.push(`回復 ${effect.mpGain} MP`);
  return { ok: true, changed: true, message: `${item.name} 已對 ${targetEntry.member.name} 使用，${pieces.join("、")}。` };
}

function requestInventoryItemUse(index) {
  const player = state.currentPlayer;
  const item = player.inventory[index];
  if (!item) return { changed: false, message: "找不到這個物品。" };
  if (item.type !== "consumable") return { changed: false, message: "這個物品不能直接使用。" };

  const scope = consumableTargetScope(item);
  if (scope === "all_allies") {
    state.inventoryTargeting = null;
    const result = useInventoryItem(index);
    return { changed: result.ok, message: result.message };
  }

  const targets = targetableMembersForConsumable(player, item);
  if (!targets.length) {
    state.inventoryTargeting = null;
    return { changed: false, message: scope === "fallen_ally" ? "目前沒有倒下的隊友可使用此道具。" : "目前沒有需要使用此道具的隊友。" };
  }
  if (targets.length === 1) {
    state.inventoryTargeting = null;
    const result = useInventoryItem(index, { partyIndex: targets[0].partyIndex });
    return { changed: result.ok, message: result.message };
  }
  state.inventoryTargeting = { index };
  return { changed: false, message: `請選擇 ${item.name} 的使用對象。` };
}

function equipInventoryItem(index) {
  const player = state.currentPlayer;
  const item = player.inventory[index];
  if (!item) return "找不到這個物品。";
  if (item.type !== "equipment") return "這個物品不是裝備。";
  const equipCheck = canEquipItem(player.className, item);
  if (equipCheck !== true) return equipCheck;
  const equipIndex = player.equipment.findIndex(equip => equip.slot === item.slot);
  if (equipIndex >= 0) {
    player.inventory.push(player.equipment[equipIndex]);
    player.equipment[equipIndex] = item;
  } else {
    player.equipment.push(item);
  }
  player.inventory.splice(index, 1);
  const stats = effectiveStats(player);
  player.hp = Math.min(player.hp, stats.maxHp);
  player.mp = Math.min(player.mp, stats.maxMp);
  return `${item.name} 已裝備到 ${item.slot}。`;
}

function unequipItem(index) {
  const player = state.currentPlayer;
  const item = player.equipment[index];
  if (!item) return "找不到這件裝備。";
  player.inventory.push(item);
  player.equipment.splice(index, 1);
  const stats = effectiveStats(player);
  player.hp = Math.min(player.hp, stats.maxHp);
  player.mp = Math.min(player.mp, stats.maxMp);
  return `${item.name} 已卸下並放回背包。`;
}

function buyShopItem(itemKey) {
  const player = state.currentPlayer;
  const item = data.itemCatalog[itemKey];
  if (!item) return "找不到這個商品。";
  if (player.gold < item.price) return "金幣不足。";
  player.gold -= item.price;
  addItemToInventory(player, itemKey);
  return `${item.name} 已購買並放入背包。`;
}

function sellPrice(item) {
  if (!item) return 0;
  return Math.max(1, Math.floor((item.price || 10) * 0.5));
}

function sellInventoryItem(index) {
  const player = state.currentPlayer;
  const item = player.inventory[index];
  if (!item) return "找不到這個物品。";
  player.gold += sellPrice(item);
  if (item.quantity && item.quantity > 1) {
    item.quantity -= 1;
  } else {
    player.inventory.splice(index, 1);
  }
  return `${item.name} 已販賣，獲得 ${sellPrice(item)} 金幣。`;
}

function sellEquippedItem(index) {
  const player = state.currentPlayer;
  const item = player.equipment[index];
  if (!item) return "找不到這件裝備。";
  const value = sellPrice(item);
  player.gold += value;
  player.equipment.splice(index, 1);
  const stats = effectiveStats(player);
  player.hp = Math.min(player.hp, stats.maxHp);
  player.mp = Math.min(player.mp, stats.maxMp);
  return `${item.name} 已販賣，獲得 ${value} 金幣。`;
}

function generateShopStock() {
  const player = state.currentPlayer;
  const poolId = player ? currentShopPoolId(player) : "";
  const weightedPool = (data.shopPools?.[poolId] || []).filter(entry => {
    if (!player) return true;
    return player.level >= entry.minLevel && player.level <= entry.maxLevel;
  });
  if (!weightedPool.length) {
    const guaranteed = ["potion_hp_s", "potion_mp_s"];
    const pool = data.shopItems.filter(key => !guaranteed.includes(key));
    const stock = [...guaranteed];
    while (stock.length < 8 && pool.length) {
      const index = randomInt(0, pool.length - 1);
      stock.push(pool[index]);
      pool.splice(index, 1);
    }
    return stock;
  }
  const stock = [];
  const uniqueKeys = new Set();
  while (stock.length < 8 && uniqueKeys.size < weightedPool.length) {
    const picked = weightedPick(weightedPool);
    if (!picked?.itemKey || uniqueKeys.has(picked.itemKey)) continue;
    uniqueKeys.add(picked.itemKey);
    stock.push(picked.itemKey);
  }
  if (!stock.includes("potion_hp_s")) stock.unshift("potion_hp_s");
  if (!stock.includes("potion_mp_s")) stock.splice(Math.min(1, stock.length), 0, "potion_mp_s");
  return stock.slice(0, 8);
}

function ensureShopStock() {
  if (!state.shopStock?.length) {
    state.shopStock = generateShopStock();
  }
  return state.shopStock;
}

function refreshShopStock() {
  const player = state.currentPlayer;
  const cost = 8;
  if (player.gold < cost) return "金幣不足，無法刷新商店。";
  player.gold -= cost;
  state.shopStock = generateShopStock();
  return `商店已刷新，本次花費 ${cost} 金幣。`;
}

function recruitCompanion(name, raceCode, classCode) {
  const player = state.currentPlayer;
  if (!name || !raceCode || !classCode) return "請輸入同伴名字並選擇種族與職業。";
  if ((player.companions || []).length >= 3) return "最多只能擁有三位同伴。";
  const companion = buildCompanion(name, raceCode, classCode, player.level);
  player.companions.push(companion);
  return `${companion.name} 已加入隊伍。`;
}

function buildCompanion(name, raceCode, classCode, level) {
  const race = data.races.find(item => item.code === raceCode) || data.races[0];
  const job = data.classes.find(item => item.code === classCode);
  const stats = structuredClone(baseStats);
  applyBonuses(stats, race.bonuses || {});
  applyBonuses(stats, job.bonuses || {});
  const companion = {
    name,
    raceCode: race.code,
    raceName: race.name,
    raceSkillName: race.skillName,
    classCode,
    className: job.name,
    level: 1,
    classLevel: 1,
    exp: 0,
    hp: stats.maxHp,
    mp: stats.maxMp,
    ...stats,
  };
  while (companion.level < level) {
    levelUpCompanion(companion);
  }
  return companion;
}

function levelUpCompanion(companion) {
  companion.level += 1;
  companion.classLevel = Math.min(100, companion.classLevel + 1);
  applyClassLevelGrowth(companion, companion.className);
  companion.hp = companion.maxHp;
  companion.mp = companion.maxMp;
}

function companionSkillUnlockLevel(skill) {
  return Math.max(1, (skill.requiredPoints || 0) + 1);
}

function availableCompanionSkills(companion) {
  return (data.classSkills[companion.className] || [])
    .filter(skill => !skill.kind.startsWith("passive"))
    .filter(skill => companion.classLevel >= companionSkillUnlockLevel(skill));
}

function grantCompanionExp(companion, amount) {
  if (!amount) return 0;
  companion.exp = (companion.exp || 0) + amount;
  let levelUps = 0;
  while (companion.exp >= nextLevelExp(companion.classLevel) && companion.classLevel < 100) {
    companion.exp -= nextLevelExp(companion.classLevel);
    levelUpCompanion(companion);
    levelUps += 1;
  }
  return levelUps;
}

function applyClassLevelGrowth(target, className) {
  const growth = state.classGrowth?.[className] || classAutoGrowth[className] || classAutoGrowth["旅行者"];
  Object.entries(growth).forEach(([key, value]) => {
    target[key] += value;
  });
}

function companionStats(companion, battle = null) {
  const stats = {
    maxHp: companion.maxHp,
    maxMp: companion.maxMp,
    attack: companion.attack,
    defense: companion.defense,
    magic: companion.magic,
    resistance: companion.resistance,
    speed: companion.speed,
    luck: companion.luck,
  };
  if (battle?.buffs?.attack) stats.attack += 5;
  if (battle?.buffs?.defense) stats.defense += 5;
  if (battle?.buffs?.magic) stats.magic += 5;
  if (battle?.buffs?.resistance) stats.resistance += 5;
  if (battle?.buffs?.speed) stats.speed += 5;
  if (companion.battleBuffs?.attack) stats.attack += 5;
  if (companion.battleBuffs?.defense) stats.defense += 5;
  if (companion.battleBuffs?.magic) stats.magic += 5;
  if (companion.battleBuffs?.resistance) stats.resistance += 5;
  if (companion.battleBuffs?.speed) stats.speed += 5;
  return stats;
}

function companionTurn(battle) {
  (battle.companions || []).filter(companion => companion.hp > 0).forEach(companion => {
    const targets = livingEnemies(battle);
    if (!targets.length) return;
    const monster = targets[Math.floor(Math.random() * targets.length)];
    const unlockedSkills = availableCompanionSkills(companion)
      .filter(skill => companion.mp >= skillCost(companion, skill));
    const healSkill = unlockedSkills
      .filter(skill => ["heal", "healAll", "fullHealSingle"].includes(skill.kind))
      .sort((a, b) => (b.power || 0) - (a.power || 0))[0];
    const supportSkill = unlockedSkills.find(skill => ["buffAttackSingle", "buffDefenseSingle", "buffSpeedSingle", "buffAttackParty", "buffDefenseParty", "buffMagic", "buffMagicResistance", "buffSpeedParty"].includes(skill.kind));
    const attackSkill = unlockedSkills
      .filter(skill => ["attack", "attackBurn", "attackPoison", "attackParalyze", "multiHit", "attackAll", "attackFreeze", "attackStun", "attackAllStun", "attackAllParalyze", "attackDebuffDefense", "attackDebuffAttack", "attackDebuffResistance", "attackIgnoreDefense", "attackDualElement"].includes(skill.kind))
      .sort((a, b) => (b.power || 0) - (a.power || 0))[0];
    const lowTarget = lowestHpPartyMember(state.currentPlayer, battle);
    const shouldHeal = lowTarget && (lowTarget.hp / lowTarget.maxHp) <= 0.55;
    const chosenSkill = shouldHeal ? (healSkill || attackSkill || supportSkill) : (attackSkill || supportSkill || healSkill);
    if (chosenSkill) {
      const stats = companionStats(companion, battle);
      companion.mp -= skillCost(companion, chosenSkill);
      if (["heal", "healAll", "fullHealSingle"].includes(chosenSkill.kind)) {
        const target = lowestHpPartyMember(state.currentPlayer, battle);
        if (target) {
          const heal = chosenSkill.kind === "fullHealSingle"
            ? target.maxHp
            : Math.floor(stats.magic * (chosenSkill.power || 1) + randomInt(4, 8));
          target.hp = Math.min(target.maxHp, target.hp + heal);
          battle.log.push(`${companion.name} 施放 ${chosenSkill.name}，替 ${target.name} 回復 ${heal} HP。`);
          return;
        }
      }
      if (["buffAttackSingle", "buffDefenseSingle", "buffSpeedSingle", "buffAttackParty", "buffDefenseParty", "buffMagic", "buffMagicResistance", "buffSpeedParty"].includes(chosenSkill.kind)) {
        battle.log.push(`${companion.name} 施放 ${chosenSkill.name}，強化了隊伍。`);
        if (chosenSkill.kind === "buffAttackSingle" || chosenSkill.kind === "buffAttackParty") battle.buffs.attack = Math.max(battle.buffs.attack, 3);
        if (chosenSkill.kind === "buffDefenseSingle" || chosenSkill.kind === "buffDefenseParty") battle.buffs.defense = Math.max(battle.buffs.defense, 3);
        if (chosenSkill.kind === "buffMagic" || chosenSkill.kind === "buffMagicResistance") {
          battle.buffs.magic = Math.max(battle.buffs.magic, 3);
          battle.buffs.resistance = Math.max(battle.buffs.resistance, 3);
        }
        if (chosenSkill.kind === "buffSpeedSingle" || chosenSkill.kind === "buffSpeedParty") battle.buffs.speed = Math.max(battle.buffs.speed, 3);
        return;
      }
      const monsterStats = monsterBattleStats(monster, battle);
      if (chosenSkill.kind === "attackAll" || chosenSkill.kind === "attackAllStun" || chosenSkill.kind === "attackAllParalyze") {
        livingEnemies(battle).forEach(enemy => {
          const enemyStats = monsterBattleStats(enemy, battle);
          const damage = dealDamage(stats[chosenSkill.stat], chosenSkill.stat === "magic" ? enemyStats.resistance : enemyStats.defense, chosenSkill.power, chosenSkill.element, enemy);
          enemy.currentHp = Math.max(0, enemy.currentHp - damage);
        });
        battle.log.push(`${companion.name} 施放 ${chosenSkill.name}，對敵群造成打擊。`);
        return;
      }
      const damage = dealDamage(stats[chosenSkill.stat], chosenSkill.stat === "magic" ? monsterStats.resistance : monsterStats.defense, chosenSkill.power, chosenSkill.element, monster);
      monster.currentHp = Math.max(0, monster.currentHp - damage);
      battle.log.push(`${companion.name} 施放 ${chosenSkill.name}，造成 ${damage} 點傷害。`);
      return;
    }
    const stats = companionStats(companion, battle);
    const monsterStats = monsterBattleStats(monster, battle);
    const damage = dealDamage(stats.attack, monsterStats.defense, 1, resolveCompanionAttackElement(companion), monster);
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    battle.log.push(`${companion.name} 協力攻擊，造成 ${damage} 點傷害。`);
  });
}

function syncBattleCompanions(player, battle) {
  player.companions = (battle.companions || []).map(companion => ({ ...companion }));
}

function lowestHpPartyMember(player, battle) {
  const pool = [player].concat((battle.companions || [])).filter(member => member.hp > 0);
  return pool.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
}

function partyDefeated(player, battle) {
  return player.hp <= 0 && (battle.companions || []).every(companion => companion.hp <= 0);
}

function renderEquipmentCard(item) {
  return `<div class="stat ${item.element ? elementClassName(item.element) : ""}"><div class="card-visual">${renderMediaThumb(itemImagePath(item), item.name)}<div><strong>${item.slot}</strong><p>${item.name}${item.element ? ` [${item.element}]` : ""}</p></div></div>${item.weaponType ? `<p>武器：${item.weaponType}</p>` : ""}${item.armorClass ? `<p>裝甲：${item.armorClass}</p>` : ""}<p>強度：${itemPower(item)}</p><p>${formatItemBonuses(item.bonuses)}</p></div>`;
}

function elementClassName(element) {
  return {
    "地": "element-earth",
    "水": "element-water",
    "火": "element-fire",
    "風": "element-wind",
    "雷": "element-thunder",
    "日": "element-sun",
    "月": "element-moon",
  }[element] || "";
}

function itemPower(item) {
  const bonus = item.bonuses || {};
  return Math.max(
    0,
    (bonus.attack || 0) * 2 +
    (bonus.defense || 0) * 2 +
    (bonus.magic || 0) * 2 +
    (bonus.resistance || 0) * 2 +
    (bonus.speed || 0) * 2 +
    (bonus.luck || 0) * 2 +
    Math.floor((bonus.maxHp || 0) / 6) +
    Math.floor((bonus.maxMp || 0) / 6)
  );
}

function formatItemBonuses(bonuses = {}) {
  const labels = { maxHp: "HP", maxMp: "MP", attack: "攻擊", defense: "防禦", magic: "魔法", resistance: "抵抗", speed: "速度", luck: "運氣" };
  const entries = Object.entries(bonuses);
  if (!entries.length) return "無數值加成";
  return entries.map(([key, value]) => `${labels[key] || key} ${value > 0 ? "+" : ""}${value}`).join(" / ");
}

function compareItemAgainstEquipped(item, equippedItems) {
  const current = equippedItems.find(equipped => equipped.slot === item.slot);
  if (!current) return "比較：目前該部位空缺";
  const allKeys = new Set([...Object.keys(item.bonuses || {}), ...Object.keys(current.bonuses || {})]);
  const parts = [];
  allKeys.forEach(key => {
    const diff = (item.bonuses?.[key] || 0) - (current.bonuses?.[key] || 0);
    if (diff !== 0) parts.push(`${displayStatName(key)} ${diff > 0 ? "+" : ""}${diff}`);
  });
  const powerDiff = itemPower(item) - itemPower(current);
  if (powerDiff !== 0) parts.unshift(`強度 ${powerDiff > 0 ? "+" : ""}${powerDiff}`);
  return `比較 ${current.name}：${parts.length ? parts.join(" / ") : "與目前裝備相同"}`;
}

function displayStatName(key) {
  return { maxHp: "HP", maxMp: "MP", attack: "攻擊", defense: "防禦", magic: "魔法", resistance: "抵抗", speed: "速度", luck: "運氣" }[key] || key;
}

function renderPageLinks(active) {
  const links = [
    ["hub", "\u5192\u96aa\u9996\u9801", renderGameHub],
    ["status", "\u72c0\u614b", renderStatus],
    ["classes", "\u8f49\u8077", renderClassManagement],
    ["equipment", "\u88dd\u5099", renderEquipmentPage],
    ["inventory", "\u80cc\u5305", renderInventory],
    ["shop", "\u5546\u5e97", renderShop],
    ["companions", "\u540c\u4f34", renderCompanions],
    ["skills", "\u6280\u80fd\u6a39", renderSkillTree],
  ];
  return `
    <div class="page-links">
      ${links.map(([key, label]) => `<button class="page-link ${active === key ? "active" : ""}" type="button" data-page-link="${key}">${label}</button>`).join("")}
    </div>
  `;
}

function canEquipItem(className, item) {
  const weaponRules = state.equipRules?.weaponRules || defaultEquipRules.weaponRules;
  const armorRules = state.equipRules?.armorRules || defaultEquipRules.armorRules;
  if (item.exclusiveClasses?.length && !item.exclusiveClasses.includes(className)) {
    return `${className} 無法裝備 ${item.name}。`;
  }
  if (item.weaponType && !(weaponRules[className] || []).includes(item.weaponType)) {
    return `${className} 無法裝備 ${item.weaponType}。`;
  }
  if (item.armorClass && !(armorRules[className] || []).includes(item.armorClass)) {
    return `${className} 無法裝備 ${item.armorClass}。`;
  }
  return true;
}

function attachPageLinks() {
  const map = {
    hub: renderGameHub,
    status: renderStatus,
    classes: renderClassManagement,
    equipment: renderEquipmentPage,
    inventory: renderInventory,
    shop: renderShop,
    companions: renderCompanions,
    skills: renderSkillTree,
  };
  app.querySelectorAll("[data-page-link]").forEach(button => {
    button.addEventListener("click", () => map[button.dataset.pageLink]?.());
  });
}

async function init() {
  await loadCsvDatabases();
  await loadPublicConfig();
  await refreshCloudSyncStatus();
  state.db = await dbApi.open();
  renderMenu();
  renderHome();
}

init();
