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
    { code: "warrior", name: "戰士", description: "高生存近戰，擅長承受傷害。", advantage: "優勢：穩定扛傷，適合正面作戰。", bonuses: { maxHp: 20, attack: 5, defense: 5, resistance: 2, speed: -1 }, branches: ["守護系", "斬擊系", "反擊系"] },
    { code: "martial", name: "武鬥家", description: "高速連擊與單體爆發。", advantage: "優勢：手感俐落，單體連打很強。", bonuses: { maxHp: 10, maxMp: 5, attack: 4, defense: 1, resistance: 1, speed: 5, luck: 1 }, branches: ["拳擊系", "氣功系", "連段系"] },
    { code: "mage", name: "魔法師", description: "火焰、寒冰、大地三系法術專家。", advantage: "優勢：範圍法術與屬性輸出突出。", bonuses: { maxHp: -5, maxMp: 30, defense: -2, magic: 8, resistance: 3, speed: 1 }, branches: ["火焰系", "寒冰系", "大地系"] },
    { code: "monk", name: "僧侶", description: "恢復、祈禱、聖護與天法專精。", advantage: "優勢：恢復與保命能力最穩定。", bonuses: { maxHp: 5, maxMp: 25, defense: 1, magic: 5, resistance: 6, luck: 1 }, branches: ["天法系", "祈禱系", "聖護系"] },
    { code: "traveler", name: "旅行者", description: "平均泛用，兼具探索與輔助。", advantage: "優勢：適應性高，玩法彈性大。", bonuses: { maxHp: 5, maxMp: 10, attack: 2, defense: 2, magic: 2, resistance: 2, speed: 2, luck: 2 }, branches: ["求生系", "輔助系", "探索系"] },
    { code: "rogue", name: "盜賊", description: "高速暴擊與雙匕首靈活戰鬥。", advantage: "優勢：速度快，暴擊與雙持特色鮮明。", bonuses: { maxMp: 5, attack: 3, resistance: 1, speed: 7, luck: 4 }, branches: ["暗殺系", "影步系", "詭計系"] },
    { code: "beastmaster", name: "馴獸師", description: "召喚與指揮並重，持續作戰能力佳。", advantage: "優勢：持續作戰穩，兼具攻擊與回復。", bonuses: { maxHp: 10, maxMp: 15, attack: 2, defense: 2, magic: 3, resistance: 2, speed: 2, luck: 1 }, branches: ["野獸系", "指揮系", "共鳴系"] },
  ],
  branchEffects: {
    "守護系": ["defense", 2], "斬擊系": ["attack", 2], "反擊系": ["luck", 1],
    "拳擊系": ["attack", 2], "氣功系": ["magic", 2], "連段系": ["speed", 2],
    "火焰系": ["magic", 2], "寒冰系": ["resistance", 2], "大地系": ["defense", 2],
    "天法系": ["magic", 2], "祈禱系": ["maxMp", 5], "聖護系": ["resistance", 2],
    "求生系": ["maxHp", 5], "輔助系": ["resistance", 1], "探索系": ["luck", 2],
    "暗殺系": ["attack", 2], "影步系": ["speed", 2], "詭計系": ["luck", 2],
    "野獸系": ["attack", 2], "指揮系": ["defense", 1], "共鳴系": ["magic", 1],
  },
  classSkills: {
    "戰士": [{ name: "重斬", cost: 8, power: 1.75, kind: "attack", stat: "attack", element: null }, { name: "防禦姿態", cost: 6, power: 0, kind: "buffDefense", stat: "defense", element: null }],
    "武鬥家": [{ name: "三連擊", cost: 9, power: 1.55, kind: "attack", stat: "attack", element: "風" }, { name: "聚氣", cost: 6, power: 0, kind: "buffAttack", stat: "attack", element: null }],
    "魔法師": [{ name: "火球術", cost: 10, power: 1.8, kind: "attack", stat: "magic", element: "火" }, { name: "石槍術", cost: 10, power: 1.8, kind: "attack", stat: "magic", element: "地" }],
    "僧侶": [{ name: "治癒術", cost: 10, power: 1.6, kind: "heal", stat: "magic", element: "日" }, { name: "聖盾", cost: 8, power: 0, kind: "buffResistance", stat: "resistance", element: "日" }],
    "旅行者": [{ name: "急救", cost: 8, power: 1.2, kind: "heal", stat: "magic", element: "日" }, { name: "鼓舞", cost: 6, power: 0, kind: "buffAttack", stat: "attack", element: null }],
    "盜賊": [{ name: "背刺", cost: 8, power: 1.7, kind: "attack", stat: "attack", element: "月" }, { name: "煙幕", cost: 6, power: 0, kind: "evade", stat: "speed", element: null }],
    "馴獸師": [{ name: "狼獸突襲", cost: 9, power: 1.65, kind: "attack", stat: "attack", element: "風" }, { name: "生命連結", cost: 8, power: 1.2, kind: "heal", stat: "magic", element: "水" }],
  },
  equipment: {
    "戰士": [{ slot: "主手", name: "青銅劍", element: null }, { slot: "頭", name: "鐵盔", element: null }],
    "武鬥家": [{ slot: "腳", name: "輕皮靴", element: null }],
    "魔法師": [{ slot: "主手", name: "橡木長杖", element: "火" }],
    "僧侶": [{ slot: "主手", name: "祈禱短杖", element: "日" }, { slot: "頭", name: "鐵盔", element: null }],
    "旅行者": [{ slot: "主手", name: "青銅劍", element: null }, { slot: "身體", name: "旅者披風", element: null }],
    "盜賊": [{ slot: "主手", name: "疾風匕首", element: "風" }, { slot: "副手", name: "影襲副匕", element: "月" }, { slot: "身體", name: "旅者披風", element: null }, { slot: "腳", name: "輕皮靴", element: null }],
    "馴獸師": [{ slot: "主手", name: "祈禱短杖", element: "日" }, { slot: "身體", name: "旅者披風", element: null }],
  },
  monsters: [
    { code: "slime", name: "草原史萊姆", category: "normal", level: 1, elements: ["水"], hp: 55, mp: 10, attack: 8, defense: 5, magic: 6, resistance: 6, speed: 7, luck: 4, exp: 20, gold: 8, note: "黏液衝擊" },
    { code: "wolf", name: "狂牙野狼", category: "normal", level: 2, elements: ["風"], hp: 70, mp: 10, attack: 12, defense: 7, magic: 4, resistance: 5, speed: 12, luck: 5, exp: 28, gold: 12, note: "撕裂撲擊" },
    { code: "scarecrow", name: "失控稻草人", category: "normal", level: 2, elements: ["地"], hp: 80, mp: 5, attack: 11, defense: 9, magic: 3, resistance: 6, speed: 6, luck: 3, exp: 30, gold: 14, note: "纏草束縛" },
    { code: "mine_beast", name: "礦坑吞岩獸", category: "dungeon", level: 4, elements: ["地"], hp: 140, mp: 15, attack: 18, defense: 14, magic: 6, resistance: 10, speed: 8, luck: 4, exp: 75, gold: 40, note: "碎岩重踏" },
    { code: "moon_king", name: "月咒妖精王", category: "dungeon", level: 7, elements: ["月", "風"], hp: 190, mp: 45, attack: 20, defense: 13, magic: 24, resistance: 18, speed: 18, luck: 10, exp: 120, gold: 65, note: "月影詛咒" },
    { code: "wolf_king", name: "裂口巨狼王", category: "story", storyOrder: 1, level: 3, elements: ["風"], hp: 120, mp: 10, attack: 17, defense: 10, magic: 4, resistance: 8, speed: 16, luck: 6, exp: 60, gold: 35, note: "狂亂咬殺" },
    { code: "tree_spirit", name: "腐化樹靈", category: "story", storyOrder: 2, level: 5, elements: ["地", "月"], hp: 165, mp: 25, attack: 16, defense: 16, magic: 18, resistance: 15, speed: 9, luck: 5, exp: 95, gold: 55, note: "腐根纏縛" },
  ],
};

const state = { db: null, currentPlayer: null, battle: null, screen: "landing" };

const dbApi = {
  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("mmorpg_click_game", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("players")) {
          db.createObjectStore("players", { keyPath: "id", autoIncrement: true });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  async getAllPlayers() {
    return transaction("players", "readonly", store => store.getAll());
  },
  async addPlayer(player) {
    return transaction("players", "readwrite", store => store.add(player));
  },
  async updatePlayer(player) {
    return transaction("players", "readwrite", store => store.put(player));
  },
  async getPlayer(id) {
    return transaction("players", "readonly", store => store.get(id));
  },
};

function transaction(storeName, mode, action) {
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = action(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function renderMenu() {
  const items = state.currentPlayer ? [
    ["冒險首頁", renderGameHub],
    ["角色狀態", renderStatus],
    ["技能樹", renderSkillTree],
    ["野外探索", () => startBattle("normal")],
    ["副本挑戰", () => startBattle("dungeon")],
    ["主線推進", () => startBattle("story")],
    ["休息恢復", restPlayer],
    ["立即儲存", saveCurrentPlayer],
    ["返回標題", leaveCurrentPlayer],
  ] : [
    ["標題頁", renderHome],
    ["建立角色", renderCreateCharacter],
    ["讀取角色", renderLoadGame],
  ];
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
      <button class="primary" type="button" id="hero-status">進入冒險</button>
      <button class="secondary" type="button" id="hero-save">儲存角色</button>
    `;
    document.querySelector("#hero-status").addEventListener("click", renderGameHub);
    document.querySelector("#hero-save").addEventListener("click", saveCurrentPlayer);
  } else {
    heroActions.innerHTML = `
      <button class="primary" type="button" id="hero-start">建立角色</button>
      <button class="secondary" type="button" id="hero-load">讀取角色</button>
    `;
    document.querySelector("#hero-start").addEventListener("click", renderCreateCharacter);
    document.querySelector("#hero-load").addEventListener("click", renderLoadGame);
  }
}

function renderHome() {
  state.screen = "landing";
  renderMenu();
  app.innerHTML = `
    <h3>標題頁</h3>
    <p class="hint">這個版本改為滑鼠點擊操作，不需要 PowerShell 或 cmd。直接雙擊 <strong>index.html</strong> 即可打開。</p>
    <div class="card-grid">
      <div class="stat"><strong>開始方式</strong><p>先建立角色或讀取角色，進入後才會看到遊戲內功能頁面。</p></div>
      <div class="stat"><strong>存檔方式</strong><p>所有角色資料都會存在你的瀏覽器 IndexedDB。</p></div>
      <div class="stat"><strong>目前支援</strong><p>建角、戰鬥、升級、技能樹、主線與副本。</p></div>
    </div>
  `;
}

function renderCreateCharacter() {
  state.screen = "create";
  renderMenu();
  const raceCards = data.races.map(race => choiceCard(race.name, race.description, race.advantage, "race", race.code)).join("");
  const classCards = data.classes.map(job => choiceCard(job.name, job.description, job.advantage, "class", job.code)).join("");
  app.innerHTML = `
    <h3>建立新角色</h3>
    <div class="spacer"></div>
    <label>角色名字</label>
    <input type="text" id="player-name" placeholder="輸入角色名字">
    <div class="spacer"></div>
    <h3>選擇種族</h3>
    <div class="card-grid">${raceCards}</div>
    <div class="spacer"></div>
    <h3>選擇職業</h3>
    <div class="card-grid">${classCards}</div>
    <div class="spacer"></div>
    <div class="inline-actions">
      <button class="primary" type="button" id="create-player">建立角色</button>
    </div>
  `;
  bindChoiceCards();
  document.querySelector("#create-player").addEventListener("click", async () => {
    const name = document.querySelector("#player-name").value.trim();
    const raceCode = document.querySelector(".choice-card[data-group='race'].selected")?.dataset.code;
    const classCode = document.querySelector(".choice-card[data-group='class'].selected")?.dataset.code;
    if (!name || !raceCode || !classCode) {
      return toast("請先填好名字並選擇種族與職業。", "warning");
    }
    const player = buildPlayer(name, raceCode, classCode);
    player.id = await dbApi.addPlayer(player);
    state.currentPlayer = player;
    renderGameHub("角色建立完成，現在正式進入冒險。");
  });
}

function renderLoadGame() {
  state.screen = "load";
  renderMenu();
  dbApi.getAllPlayers().then(players => {
    if (!players.length) {
      app.innerHTML = `<h3>讀取角色</h3><p class="hint">目前沒有存檔角色，先建立一位冒險者吧。</p>`;
      return;
    }
    app.innerHTML = `
      <h3>讀取角色</h3>
      <div class="card-grid">
        ${players.map(player => `
          <div class="save-card">
            <h4>${player.name}</h4>
            <p>${player.raceName} / ${player.className}</p>
            <p>Lv.${player.level} | 職業 Lv.${player.classLevel}</p>
            <button type="button" data-load-id="${player.id}">讀取</button>
          </div>
        `).join("")}
      </div>
    `;
    app.querySelectorAll("[data-load-id]").forEach(button => {
      button.addEventListener("click", async () => {
        state.currentPlayer = await dbApi.getPlayer(Number(button.dataset.loadId));
        renderGameHub("角色已讀取，現在正式進入冒險。");
      });
    });
  });
}

function renderGameHub(message = "") {
  if (!state.currentPlayer) return renderHome();
  state.screen = "hub";
  renderMenu();
  const player = state.currentPlayer;
  app.innerHTML = `
    <h3>冒險首頁</h3>
    ${message ? `<p class="success">${message}</p>` : ""}
    <div class="card-grid">
      <div class="stat">
        <strong>${player.name}</strong>
        <p>${player.raceName} / ${player.className}</p>
        <p>Lv.${player.level} | 職業 Lv.${player.classLevel}</p>
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
    <div class="spacer"></div>
    <div class="action-grid">
      <button class="primary" type="button" id="hub-status">角色狀態</button>
      <button class="secondary" type="button" id="hub-skills">技能樹</button>
      <button class="secondary" type="button" id="hub-normal">野外探索</button>
      <button class="secondary" type="button" id="hub-dungeon">副本挑戰</button>
      <button class="secondary" type="button" id="hub-story">主線推進</button>
    </div>
  `;
  document.querySelector("#hub-status").addEventListener("click", () => renderStatus());
  document.querySelector("#hub-skills").addEventListener("click", () => renderSkillTree());
  document.querySelector("#hub-normal").addEventListener("click", () => startBattle("normal"));
  document.querySelector("#hub-dungeon").addEventListener("click", () => startBattle("dungeon"));
  document.querySelector("#hub-story").addEventListener("click", () => startBattle("story"));
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
    <div class="card-grid">
      <div class="stat">
        <h4>${player.name}</h4>
        <p>${player.raceName} / ${player.className}</p>
        <p>Lv.${player.level} | 職業 Lv.${player.classLevel}</p>
        <p>EXP ${player.exp} | 技能點 ${player.skillPoints} | 金幣 ${player.gold}</p>
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
      ${player.equipment.map(item => `<div class="stat"><strong>${item.slot}</strong><p>${item.name}${item.element ? ` [${item.element}]` : ""}</p></div>`).join("")}
    </div>
  `;
}

function renderSkillTree() {
  if (!state.currentPlayer) {
    return renderHome();
  }
  state.screen = "skills";
  renderMenu();
  const player = state.currentPlayer;
  app.innerHTML = `
    <h3>技能樹</h3>
    <p class="hint">點擊升級分支。每次升級都會永久提升角色能力。</p>
    <p><span class="pill">可用技能點 ${player.skillPoints}</span></p>
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
    <h3>職業技能</h3>
    <div class="card-grid">
      ${data.classSkills[player.className].map(skill => `
        <div class="stat">
          <strong>${skill.name}</strong>
          <p>MP ${skill.cost} | 屬性 ${skill.element || "無"}</p>
          <p>${skill.kind === "attack" ? "攻擊技能" : skill.kind === "heal" ? "回復技能" : "輔助技能"}</p>
        </div>
      `).join("")}
    </div>
  `;
  app.querySelectorAll("[data-branch-index]").forEach(button => {
    button.addEventListener("click", async () => {
      if (player.skillPoints <= 0) {
        return toast("目前沒有技能點。", "warning");
      }
      const branch = player.branches[Number(button.dataset.branchIndex)];
      const [stat, value] = data.branchEffects[branch.name] || ["attack", 1];
      branch.level += 1;
      player.skillPoints -= 1;
      if (stat === "maxHp" || stat === "maxMp") {
        player[stat] += value;
        if (stat === "maxHp") player.hp = Math.min(player.hp + value, player.maxHp);
        if (stat === "maxMp") player.mp = Math.min(player.mp + value, player.maxMp);
      } else {
        player[stat] += value;
      }
      await saveCurrentPlayer(false);
      renderSkillTree();
    });
  });
}

async function startBattle(category) {
  if (!state.currentPlayer) {
    return toast("請先建立或讀取角色。", "warning");
  }
  const player = state.currentPlayer;
  let monster;
  if (category === "story") {
    monster = data.monsters.find(item => item.category === "story" && item.storyOrder === player.storyStage);
    if (!monster) {
      return toast("目前主線內容已暫時完成。", "success");
    }
  } else {
    const pool = data.monsters.filter(item => item.category === category);
    monster = structuredClone(pool[Math.floor(Math.random() * pool.length)]);
  }
  state.battle = {
    type: category,
    monster: structuredClone(monster),
    monsterHp: monster.hp,
    turn: 1,
    log: [`遭遇 ${monster.name}！`],
    buffs: { attack: 0, defense: 0, resistance: 0, evade: 0, dragon: 0 },
    dwarfGuardUsed: false,
  };
  state.screen = "battle";
  renderMenu();
  renderBattle();
}

function renderBattle() {
  const player = state.currentPlayer;
  const battle = state.battle;
  const stats = battleStats(player, battle);
  const monster = battle.monster;
  const battleEnded = battle.monsterHp <= 0 || player.hp <= 0;
  app.innerHTML = `
    <h3>${battle.type === "normal" ? "野外戰鬥" : battle.type === "dungeon" ? "副本戰鬥" : "主線戰鬥"}</h3>
    <div class="battle-layout">
      <div>
        <div class="battle-player">
          <h4>${player.name}</h4>
          <p>HP ${player.hp} / ${stats.maxHp}</p>
          <p>MP ${player.mp} / ${stats.maxMp}</p>
          <p>${player.raceName} / ${player.className}</p>
        </div>
        <div class="spacer"></div>
        <div class="battle-monster">
          <h4>${monster.name}</h4>
          <p>HP ${battle.monsterHp} / ${monster.hp}</p>
          <p>屬性 ${monster.elements.join(" / ")}</p>
          <p>技能 ${monster.note}</p>
        </div>
        <div class="battle-actions">
          ${battleEnded ? `
            <button class="action" type="button" data-action="return">返回冒險</button>
          ` : `
            <button class="action" type="button" data-action="attack">普通攻擊</button>
            <button class="action" type="button" data-action="skills">職業技能</button>
            <button class="action" type="button" data-action="race">種族技能</button>
            <button class="action" type="button" data-action="defend">防禦</button>
            <button class="action" type="button" data-action="status">查看狀態</button>
            <button class="action" type="button" data-action="escape">逃跑</button>
          `}
        </div>
        <div class="inline-actions" id="skill-panel"></div>
      </div>
      <div>
        <div class="log">${battle.log.join("\n")}</div>
      </div>
    </div>
  `;
  app.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => handleBattleAction(button.dataset.action));
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
  if (action === "skills") return renderSkillButtons();
  if (action === "attack") return performBattleTurn({ type: "attack" });
  if (action === "race") return performBattleTurn({ type: "race" });
  if (action === "defend") return performBattleTurn({ type: "defend" });
  if (action === "escape") return tryEscape();
}

function renderSkillButtons() {
  const panel = document.querySelector("#skill-panel");
  panel.innerHTML = data.classSkills[state.currentPlayer.className]
    .map((skill, index) => `<button class="skill-button" type="button" data-skill-index="${index}">${skill.name}<br><small>MP ${skill.cost}</small></button>`)
    .join("");
  panel.querySelectorAll("[data-skill-index]").forEach(button => {
    button.addEventListener("click", () => performBattleTurn({ type: "skill", index: Number(button.dataset.skillIndex) }));
  });
}

async function performBattleTurn(action) {
  const player = state.currentPlayer;
  const battle = state.battle;
  const monster = battle.monster;
  const stats = battleStats(player, battle);
  let defend = false;
  let acted = true;

  if (action.type === "attack") {
    const weapon = player.equipment.find(item => item.slot === "主手");
    const damage = dealDamage(stats.attack, monster.defense, 1 + dualWieldBonus(player), weapon?.element, monster);
    battle.monsterHp = Math.max(0, battle.monsterHp - damage);
    battle.log.push(`${player.name} 的普通攻擊造成 ${damage} 點傷害。`);
    applyLifesteal(player, damage, battle);
  } else if (action.type === "skill") {
    const skill = data.classSkills[player.className][action.index];
    const realCost = skillCost(player, skill);
    if (player.mp < realCost) {
      battle.log.push("MP 不足，技能施放失敗。");
      acted = false;
    } else {
      player.mp -= realCost;
      handleSkill(skill, player, battle, monster, stats);
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
  if (battle.monsterHp <= 0) {
    await finishVictory();
    return;
  }

  monsterTurn(player, battle, monster, defend);
  if (player.hp <= 0) {
    battle.log.push("你倒下了，戰鬥失敗。");
    player.hp = Math.max(1, Math.floor(player.maxHp / 4));
    player.mp = Math.max(0, Math.floor(player.maxMp / 4));
    await saveCurrentPlayer(false);
    renderBattle();
    return;
  }

  tickBuffs(battle);
  battle.turn += 1;
  await saveCurrentPlayer(false);
  renderBattle();
}

function handleSkill(skill, player, battle, monster, stats) {
  if (skill.kind === "attack") {
    const targetDefense = skill.stat === "magic" ? monster.resistance : monster.defense;
    const damage = dealDamage(stats[skill.stat], targetDefense, skill.power, skill.element, monster);
    battle.monsterHp = Math.max(0, battle.monsterHp - damage);
    battle.log.push(`${player.name} 施放 ${skill.name}，造成 ${damage} 點傷害。`);
    applyLifesteal(player, damage, battle);
    if (player.raceName === "精靈" && skill.stat === "magic" && Math.random() < 0.35) {
      player.mp = Math.min(effectiveStats(player).maxMp, player.mp + 5);
      battle.log.push("自然共鳴發動，回復 5 MP。");
    }
    return;
  }
  if (skill.kind === "heal") {
    let heal = Math.floor(stats.magic * skill.power + randomInt(4, 10));
    if (player.raceName === "天翼族") heal = Math.floor(heal * 1.2);
    player.hp = Math.min(stats.maxHp, player.hp + heal);
    battle.log.push(`${player.name} 施放 ${skill.name}，回復 ${heal} HP。`);
    return;
  }
  if (skill.kind === "buffAttack") {
    battle.buffs.attack = 3;
    battle.log.push(`${player.name} 的攻擊提升 3 回合。`);
    return;
  }
  if (skill.kind === "buffDefense") {
    battle.buffs.defense = 3;
    battle.log.push(`${player.name} 的防禦提升 3 回合。`);
    return;
  }
  if (skill.kind === "buffResistance") {
    battle.buffs.resistance = 3;
    battle.log.push(`${player.name} 的抵抗提升 3 回合。`);
    return;
  }
  if (skill.kind === "evade") {
    battle.buffs.evade = 0.2;
    battle.log.push(`${player.name} 的閃避率大幅提高。`);
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

function monsterTurn(player, battle, monster, defend) {
  const stats = battleStats(player, battle);
  const evadeRate = Math.min(0.35, 0.05 + Math.max(0, stats.speed - monster.speed) * 0.01 + battle.buffs.evade);
  if (Math.random() < evadeRate) {
    battle.log.push(`${player.name} 閃過了 ${monster.name} 的攻擊。`);
    return;
  }
  let damage = Math.max(1, monster.attack - Math.floor(stats.defense / 2) + randomInt(0, 4));
  if (defend) damage = Math.floor(damage * 0.65);
  if (player.raceName === "矮人" && !battle.dwarfGuardUsed) {
    damage = Math.floor(damage * 0.7);
    battle.dwarfGuardUsed = true;
    battle.log.push("鋼鐵體魄發動，首次重擊傷害被削減。");
  }
  player.hp = Math.max(0, player.hp - damage);
  battle.log.push(`${monster.name} 使用 ${monster.note}，造成 ${damage} 點傷害。`);
}

async function finishVictory() {
  const player = state.currentPlayer;
  const battle = state.battle;
  const monster = battle.monster;
  player.exp += monster.exp;
  player.gold += monster.gold;
  battle.log.push(`你擊敗了 ${monster.name}，獲得 EXP ${monster.exp}、金幣 ${monster.gold}。`);
  while (player.exp >= nextLevelExp(player.level)) {
    player.exp -= nextLevelExp(player.level);
    player.level += 1;
    player.classLevel += 1;
    player.skillPoints += 1;
    player.maxHp += 12;
    player.maxMp += 8;
    player.attack += 2;
    player.defense += 2;
    player.magic += 2;
    player.resistance += 2;
    player.speed += 1;
    player.luck += 1;
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    battle.log.push(`升級了，現在是 Lv.${player.level}。`);
  }
  if (battle.type === "story") {
    player.storyStage += 1;
  }
  if (battle.type === "dungeon") {
    player.dungeonClears += 1;
  }
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
    hp: stats.maxHp,
    mp: stats.maxMp,
    ...stats,
    gold: 30,
    branches: job.branches.map(name => ({ name, level: 0 })),
    equipment: structuredClone(data.equipment[job.name] || []),
  };
}

function effectiveStats(player) {
  return {
    maxHp: player.maxHp,
    maxMp: player.maxMp,
    attack: player.attack,
    defense: player.defense,
    magic: player.magic,
    resistance: player.resistance,
    speed: player.speed,
    luck: player.luck,
  };
}

function battleStats(player, battle) {
  const stats = effectiveStats(player);
  if (player.raceName === "人族" && battle.turn <= 3) {
    ["attack", "defense", "magic", "resistance", "speed", "luck"].forEach(key => { stats[key] += 2; });
  }
  if (player.raceName === "獸人" && player.hp <= stats.maxHp * 0.4) stats.attack += 5;
  if (battle.buffs.attack) stats.attack += 5;
  if (battle.buffs.defense) stats.defense += 5;
  if (battle.buffs.resistance) stats.resistance += 5;
  if (battle.buffs.dragon) {
    stats.attack += 6;
    stats.magic += 6;
  }
  return stats;
}

function dealDamage(attackValue, defenseValue, power, element, monster) {
  const base = Math.max(1, Math.floor(attackValue * power - defenseValue / 2 + randomInt(0, 5)));
  return Math.max(1, Math.floor(base * elementMultiplier(element, monster.elements)));
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
  if (player.raceName === "天翼族" && skill.element === "日" && ["heal", "buffResistance"].includes(skill.kind)) {
    return Math.max(1, Math.floor(skill.cost * 0.8));
  }
  return skill.cost;
}

function tickBuffs(battle) {
  ["attack", "defense", "resistance", "dragon"].forEach(key => {
    if (battle.buffs[key] > 0) battle.buffs[key] -= 1;
  });
  battle.buffs.evade = Math.max(0, battle.buffs.evade - 0.15);
}

async function restPlayer() {
  if (!state.currentPlayer) return toast("請先建立或讀取角色。", "warning");
  const stats = effectiveStats(state.currentPlayer);
  state.currentPlayer.hp = stats.maxHp;
  state.currentPlayer.mp = stats.maxMp;
  await saveCurrentPlayer(false);
  renderStatus("你在營地休息完畢，HP / MP 已恢復。");
}

async function saveCurrentPlayer(showMessage = true) {
  if (!state.currentPlayer) return;
  await dbApi.updatePlayer(state.currentPlayer);
  if (showMessage) toast("角色已儲存。", "success");
}

function nextLevelExp(level) {
  return 100 + (level - 1) * 40;
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
  renderHome();
}

async function init() {
  state.db = await dbApi.open();
  renderMenu();
  renderHome();
}

init();
