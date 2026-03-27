PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS races (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    bonuses_json TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    skill_type TEXT NOT NULL,
    skill_description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS classes (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    bonuses_json TEXT NOT NULL,
    branches_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS equipment_templates (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slot TEXT NOT NULL,
    rarity TEXT NOT NULL,
    element TEXT,
    bonuses_json TEXT NOT NULL,
    allowed_classes_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS monsters (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level INTEGER NOT NULL,
    element_primary TEXT,
    element_secondary TEXT,
    hp INTEGER NOT NULL,
    mp INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    magic INTEGER NOT NULL,
    resistance INTEGER NOT NULL,
    speed INTEGER NOT NULL,
    luck INTEGER NOT NULL,
    exp_reward INTEGER NOT NULL,
    gold_reward INTEGER NOT NULL,
    skill_note TEXT NOT NULL,
    story_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    race_code TEXT NOT NULL,
    class_code TEXT NOT NULL,
    level INTEGER NOT NULL,
    class_level INTEGER NOT NULL,
    exp INTEGER NOT NULL,
    skill_points INTEGER NOT NULL,
    story_stage INTEGER NOT NULL DEFAULT 1,
    dungeon_clears INTEGER NOT NULL DEFAULT 0,
    hp INTEGER NOT NULL,
    max_hp INTEGER NOT NULL,
    mp INTEGER NOT NULL,
    max_mp INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    magic INTEGER NOT NULL,
    resistance INTEGER NOT NULL,
    speed INTEGER NOT NULL,
    luck INTEGER NOT NULL,
    gold INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (race_code) REFERENCES races(code),
    FOREIGN KEY (class_code) REFERENCES classes(code)
);

CREATE TABLE IF NOT EXISTS player_equipment (
    player_id INTEGER NOT NULL,
    slot TEXT NOT NULL,
    equipment_code TEXT NOT NULL,
    PRIMARY KEY (player_id, slot),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_code) REFERENCES equipment_templates(code)
);

CREATE TABLE IF NOT EXISTS player_skill_branches (
    player_id INTEGER NOT NULL,
    branch_key TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    branch_level INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, branch_key),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_monsters_category ON monsters(category);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
