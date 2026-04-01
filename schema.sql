PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS races (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    advantage TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    skill_type TEXT NOT NULL,
    skill_description TEXT NOT NULL,
    max_hp_bonus INTEGER NOT NULL DEFAULT 0,
    max_mp_bonus INTEGER NOT NULL DEFAULT 0,
    attack_bonus INTEGER NOT NULL DEFAULT 0,
    defense_bonus INTEGER NOT NULL DEFAULT 0,
    magic_bonus INTEGER NOT NULL DEFAULT 0,
    resistance_bonus INTEGER NOT NULL DEFAULT 0,
    speed_bonus INTEGER NOT NULL DEFAULT 0,
    luck_bonus INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS classes (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    armor_type TEXT NOT NULL,
    description TEXT NOT NULL,
    advantage TEXT NOT NULL,
    branches_csv TEXT NOT NULL,
    max_hp_bonus INTEGER NOT NULL DEFAULT 0,
    max_mp_bonus INTEGER NOT NULL DEFAULT 0,
    attack_bonus INTEGER NOT NULL DEFAULT 0,
    defense_bonus INTEGER NOT NULL DEFAULT 0,
    magic_bonus INTEGER NOT NULL DEFAULT 0,
    resistance_bonus INTEGER NOT NULL DEFAULT 0,
    speed_bonus INTEGER NOT NULL DEFAULT 0,
    luck_bonus INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS branch_effects (
    branch_name TEXT PRIMARY KEY,
    stat_key TEXT NOT NULL,
    value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS class_growth (
    class_name TEXT PRIMARY KEY,
    max_hp INTEGER NOT NULL DEFAULT 0,
    max_mp INTEGER NOT NULL DEFAULT 0,
    attack INTEGER NOT NULL DEFAULT 0,
    defense INTEGER NOT NULL DEFAULT 0,
    magic INTEGER NOT NULL DEFAULT 0,
    resistance INTEGER NOT NULL DEFAULT 0,
    speed INTEGER NOT NULL DEFAULT 0,
    luck INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (class_name) REFERENCES classes(name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    name TEXT NOT NULL,
    cost INTEGER NOT NULL DEFAULT 0,
    power REAL NOT NULL DEFAULT 0,
    kind TEXT NOT NULL,
    stat TEXT NOT NULL,
    element TEXT,
    chance REAL,
    duration INTEGER,
    hits INTEGER,
    school TEXT,
    branch TEXT,
    required_points INTEGER NOT NULL DEFAULT 0,
    UNIQUE (class_name, name),
    FOREIGN KEY (class_name) REFERENCES classes(name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS equipment (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('equipment')),
    slot TEXT NOT NULL,
    weapon_type TEXT,
    armor_class TEXT,
    exclusive_classes_csv TEXT,
    element TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    max_hp_bonus INTEGER NOT NULL DEFAULT 0,
    max_mp_bonus INTEGER NOT NULL DEFAULT 0,
    attack_bonus INTEGER NOT NULL DEFAULT 0,
    defense_bonus INTEGER NOT NULL DEFAULT 0,
    magic_bonus INTEGER NOT NULL DEFAULT 0,
    resistance_bonus INTEGER NOT NULL DEFAULT 0,
    speed_bonus INTEGER NOT NULL DEFAULT 0,
    luck_bonus INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS consumables (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('consumable')),
    price INTEGER NOT NULL DEFAULT 0,
    heal_hp INTEGER NOT NULL DEFAULT 0,
    heal_mp INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS equip_rules (
    class_name TEXT PRIMARY KEY,
    weapon_types_csv TEXT NOT NULL,
    armor_classes_csv TEXT NOT NULL,
    FOREIGN KEY (class_name) REFERENCES classes(name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pool_id TEXT NOT NULL,
    item_key TEXT NOT NULL,
    weight INTEGER NOT NULL DEFAULT 1,
    min_level INTEGER NOT NULL DEFAULT 1,
    max_level INTEGER NOT NULL DEFAULT 999,
    UNIQUE (pool_id, item_key)
);

CREATE TABLE IF NOT EXISTS drop_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id TEXT NOT NULL,
    item_key TEXT,
    weight INTEGER NOT NULL DEFAULT 1,
    min_qty INTEGER NOT NULL DEFAULT 1,
    max_qty INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS areas (
    area_id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('normal', 'dungeon', 'story')),
    story_stage INTEGER NOT NULL DEFAULT 0,
    min_level INTEGER NOT NULL DEFAULT 1,
    recommended_level INTEGER NOT NULL DEFAULT 1,
    monster_codes_csv TEXT NOT NULL,
    shop_pool TEXT,
    theme TEXT NOT NULL DEFAULT 'meadow',
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS story_chapters (
    chapter_id TEXT PRIMARY KEY,
    story_stage INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    area_id TEXT NOT NULL,
    boss_code TEXT NOT NULL,
    summary TEXT NOT NULL,
    reward_gold INTEGER NOT NULL DEFAULT 0,
    reward_item TEXT,
    FOREIGN KEY (area_id) REFERENCES areas(area_id)
);

CREATE TABLE IF NOT EXISTS quests (
    quest_id TEXT PRIMARY KEY,
    story_stage INTEGER NOT NULL,
    chapter_id TEXT NOT NULL,
    title TEXT NOT NULL,
    objective_type TEXT NOT NULL,
    target_code TEXT NOT NULL,
    target_count INTEGER NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    reward_exp INTEGER NOT NULL DEFAULT 0,
    reward_gold INTEGER NOT NULL DEFAULT 0,
    reward_item TEXT,
    is_main INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (chapter_id) REFERENCES story_chapters(chapter_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS monsters (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('normal', 'dungeon', 'story')),
    story_order INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL,
    elements_csv TEXT NOT NULL,
    hp INTEGER NOT NULL,
    mp INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    magic INTEGER NOT NULL,
    resistance INTEGER NOT NULL,
    speed INTEGER NOT NULL,
    luck INTEGER NOT NULL,
    exp INTEGER NOT NULL,
    gold INTEGER NOT NULL,
    note TEXT NOT NULL,
    drop_table TEXT,
    drops_csv TEXT
);

CREATE TABLE IF NOT EXISTS monster_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monster_code TEXT NOT NULL,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    stat TEXT NOT NULL,
    power REAL NOT NULL DEFAULT 0,
    element TEXT,
    chance REAL,
    duration INTEGER,
    hits INTEGER,
    cost INTEGER NOT NULL DEFAULT 0,
    target_scope TEXT NOT NULL DEFAULT 'single',
    weight INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (monster_code) REFERENCES monsters(code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    race_code TEXT NOT NULL,
    race_name TEXT NOT NULL,
    class_code TEXT NOT NULL,
    class_name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    class_level INTEGER NOT NULL DEFAULT 1,
    exp INTEGER NOT NULL DEFAULT 0,
    gold INTEGER NOT NULL DEFAULT 0,
    hp INTEGER NOT NULL,
    mp INTEGER NOT NULL,
    max_hp INTEGER NOT NULL,
    max_mp INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    magic INTEGER NOT NULL,
    resistance INTEGER NOT NULL,
    speed INTEGER NOT NULL,
    luck INTEGER NOT NULL,
    skill_points INTEGER NOT NULL DEFAULT 1,
    story_stage INTEGER NOT NULL DEFAULT 1,
    dungeon_clears INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (race_code) REFERENCES races(code),
    FOREIGN KEY (class_code) REFERENCES classes(code)
);

CREATE TABLE IF NOT EXISTS player_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    item_key TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('equipment', 'consumable')),
    quantity INTEGER NOT NULL DEFAULT 1,
    slot_override TEXT,
    item_snapshot_json TEXT,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS player_equipment (
    player_id INTEGER NOT NULL,
    slot TEXT NOT NULL,
    item_key TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('equipment')),
    item_snapshot_json TEXT,
    PRIMARY KEY (player_id, slot),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS player_skill_branches (
    player_id INTEGER NOT NULL,
    branch_name TEXT NOT NULL,
    branch_level INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, branch_name),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS companions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    class_code TEXT NOT NULL,
    class_name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    class_level INTEGER NOT NULL DEFAULT 1,
    hp INTEGER NOT NULL,
    mp INTEGER NOT NULL,
    max_hp INTEGER NOT NULL,
    max_mp INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    magic INTEGER NOT NULL,
    resistance INTEGER NOT NULL,
    speed INTEGER NOT NULL,
    luck INTEGER NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (class_code) REFERENCES classes(code)
);

CREATE INDEX IF NOT EXISTS idx_skills_class_name ON skills(class_name);
CREATE INDEX IF NOT EXISTS idx_equipment_slot ON equipment(slot);
CREATE INDEX IF NOT EXISTS idx_equipment_weapon_type ON equipment(weapon_type);
CREATE INDEX IF NOT EXISTS idx_equipment_armor_class ON equipment(armor_class);
CREATE INDEX IF NOT EXISTS idx_shop_items_pool_id ON shop_items(pool_id);
CREATE INDEX IF NOT EXISTS idx_drop_tables_table_id ON drop_tables(table_id);
CREATE INDEX IF NOT EXISTS idx_areas_category ON areas(category);
CREATE INDEX IF NOT EXISTS idx_story_chapters_stage ON story_chapters(story_stage);
CREATE INDEX IF NOT EXISTS idx_quests_stage ON quests(story_stage);
CREATE INDEX IF NOT EXISTS idx_monsters_category ON monsters(category);
CREATE INDEX IF NOT EXISTS idx_monsters_story_order ON monsters(story_order);
CREATE INDEX IF NOT EXISTS idx_monster_skills_code ON monster_skills(monster_code);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_player_inventory_player_id ON player_inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_player_equipment_player_id ON player_equipment(player_id);
CREATE INDEX IF NOT EXISTS idx_player_skill_branches_player_id ON player_skill_branches(player_id);
CREATE INDEX IF NOT EXISTS idx_companions_player_id ON companions(player_id);
