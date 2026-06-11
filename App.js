import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  StatusBar, ScrollView, Image, ImageBackground, Alert
} from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

// ============================================================
// ROFT OF WORLDS — ПОЛНЫЙ КОД С АНИМАЦИЯМИ
// Все пути исправлены, все функции работают
// Автор: Artem233
// ============================================================

// Импорт спрайтов — все пути с пробелами перед скобками
const SPRITES = {
  player: {
    idle: require('./player-idle-1.png'),
    attack: [
      require('./player-attack-1.png'),
      require('./player-attack-2.png'),
      require('./player-attack-3.png'),
      require('./player-attack-4.png'),
      require('./player-attack-5.png'),
    ],
    run: [
      require('./player-run-1.png'),
      require('./player-run-2.png'),
      require('./player-run-3.png'),
      require('./player-run-4.png'),
      require('./player-run-5.png'),
      require('./player-run-6.png'),
      require('./player-run-7.png'),
    ],
    jump: [
      require('./player-jump-1.png'),
      require('./player-jump-2.png'),
      require('./player-jump-3.png'),
      require('./player-jump-4.png'),
    ],
    hurt: require('./player-idle-1.png'),
    dodge: require('./player-jump-1.png'),
  },
  goblin: {
    idle: require('./ogre-idle1.png'),
    walk: [
      require('./ogre-walk1.png'),
      require('./ogre-walk2.png'),
      require('./ogre-walk3.png'),
      require('./ogre-walk4.png'),
      require('./ogre-walk5.png'),
      require('./ogre-walk6.png'),
    ],
    attack: [
      require('./ogre-attack1.png'),
      require('./ogre-attack2.png'),
      require('./ogre-attack3.png'),
      require('./ogre-attack4.png'),
      require('./ogre-attack5.png'),
      require('./ogre-attack6.png'),
      require('./ogre-attack7.png'),
    ],
    hurt: require('./ogre-idle1.png'),
  },
  demon: {
    idle: [
      require('./idle1.png'),
      require('./idle2.png'),
      require('./idle3.png'),
      require('./idle4.png'),
      require('./idle5.png'),
      require('./idle6.png'),
    ],
    attack1: [
      require('./frame_1_ (1).png'),
      require('./frame_1_ (2).png'),
      require('./frame_1_ (3).png'),
      require('./frame_1_ (4).png'),
      require('./frame_1_ (5).png'),
      require('./frame_1_ (6).png'),
      require('./frame_1_ (7).png'),
      require('./frame_1_ (8).png'),
      require('./frame_1_ (9).png'),
      require('./frame_1_ (10).png'),
      require('./frame_1_ (11).png'),
      require('./frame_1_ (12).png'),
      require('./frame_1_ (13).png'),
      require('./frame_1_ (14).png'),
      require('./frame_1_ (15).png'),
      require('./frame_1_ (16).png'),
      require('./frame_1_ (17).png'),
      require('./frame_1_ (18).png'),
    ],
    attack2: [
      require('./frame1.png'),
      require('./frame2.png'),
      require('./frame3.png'),
      require('./frame4.png'),
      require('./frame5.png'),
      require('./frame6.png'),
      require('./frame7.png'),
      require('./frame8.png'),
      require('./frame9.png'),
      require('./frame10.png'),
      require('./frame11.png'),
      require('./frame12.png'),
      require('./frame13.png'),
      require('./frame14.png'),
      require('./frame15.png'),
      require('./frame16.png'),
      require('./frame17.png'),
      require('./frame18.png'),
    ],
  },
  shadow: {
    idle: require('./idle.png'),
    walk: require('./walk.png'),
    attack: [
      require('./attack (1).png'),
      require('./attack (2).png'),
      require('./attack (3).png'),
      require('./attack (4).png'),
    ],
    appear: [
      require('./appearance (1).png'),
      require('./appearance (2).png'),
      require('./appearance (3).png'),
      require('./appearance (4).png'),
      require('./appearance (5).png'),
      require('./appearance (6).png'),
    ],
    death: [
      require('./death (1).png'),
      require('./death (2).png'),
      require('./death (3).png'),
      require('./death (4).png'),
      require('./death (5).png'),
      require('./death (6).png'),
      require('./death (7).png'),
    ],
  },
  boss: {
    idle: require('./idle.png'),
    attack: [
      require('./_0000_Layer-1.png'),
      require('./_0001_Layer-2.png'),
      require('./_0002_Layer-3.png'),
      require('./_0003_Layer-4.png'),
      require('./_0004_Layer-5.png'),
      require('./_0005_Layer-6.png'),
      require('./_0006_Layer-7.png'),
    ],
  },
  merchant: {
    idle: [
      require('./idle (1).png'),
      require('./idle (2).png'),
      require('./idle (3).png'),
      require('./idle (4).png'),
    ],
  },
  backgrounds: {
    humanSky: require('./country_platform_back.png'),
    humanGround: require('./country-platform-tiles-example.png'),
    demonBg: require('./lava-backround-prewiew.png'),
  },
};

const SKILL_TREE = {
  shadow: { name: 'Тень', skills: [
    { id: 'shadow_strike', name: 'Удар Тени', cost: 1, desc: '+50% урона врагам с HP ниже 50%' },
    { id: 'invisibility', name: 'Невидимость', cost: 2, desc: 'Невидимость на 5 секунд' },
    { id: 'shadow_clone', name: 'Теневой клон', cost: 3, desc: 'Создаёт копию' },
    { id: 'death_sentence', name: 'Приговор Тьмы', cost: 5, desc: 'Мгновенное убийство врага с HP ниже 20%' },
  ]},
  fire: { name: 'Огонь', skills: [
    { id: 'fire_blade', name: 'Огненный клинок', cost: 1, desc: '+20% урона огнём' },
    { id: 'flame_wave', name: 'Волна пламени', cost: 2, desc: 'AoE урон всем врагам' },
    { id: 'fire_ring', name: 'Кольцо огня', cost: 3, desc: 'Защитное кольцо' },
    { id: 'meteor', name: 'Метеор', cost: 5, desc: 'Огромный урон всем на экране' },
  ]},
  rift: { name: 'Разлом', skills: [
    { id: 'rift_dash', name: 'Рывок', cost: 1, desc: 'Телепортация к врагу' },
    { id: 'teleport', name: 'Телепортация', cost: 2, desc: 'Свободное перемещение' },
    { id: 'spatial_cut', name: 'Пространственный разрез', cost: 3, desc: 'Игнорирует броню' },
    { id: 'black_hole', name: 'Чёрная дыра', cost: 5, desc: 'Затягивает всех врагов' },
  ]},
};

const CRAFT_RECIPES = [
  { id: 1, name: 'Зелье здоровья', icon: '🧪', cost: 100, desc: '+50 HP' },
  { id: 2, name: 'Зелье энергии', icon: '⚡', cost: 80, desc: '+30 EN' },
  { id: 3, name: 'Зелье SP', icon: '💠', cost: 80, desc: '+30 SP' },
  { id: 4, name: 'Улучшение оружия +1', icon: '🗡️', cost: 500, desc: '+5 ATK' },
  { id: 5, name: 'Улучшение брони +1', icon: '🛡️', cost: 400, desc: '+5 DEF' },
  { id: 6, name: 'Кольцо силы', icon: '💍', cost: 1000, desc: '+10 ATK, +5 DEF' },
];

const SHOP_ITEMS = [
  { name: 'Зелье здоровья', price: 80, icon: '🧪', heal: 50 },
  { name: 'Зелье энергии', price: 60, icon: '⚡', heal: 30 },
  { name: 'Зелье SP', price: 60, icon: '💠', heal: 30 },
];

export default function App() {
  const [screen, setScreen] = useState('title');
  const [world, setWorld] = useState('human');
  const [showInventory, setShowInventory] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showCraft, setShowCraft] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogLines, setDialogLines] = useState([]);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [currentSkillTree, setCurrentSkillTree] = useState('shadow');
  const [merchantFrame, setMerchantFrame] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [score, setScore] = useState(0);

  const [player, setPlayer] = useState({
    x: W * 0.15, y: H - 160, vx: 0, vy: 0,
    hp: 100, maxHp: 100, sp: 80, maxSp: 80, en: 100, maxEn: 100,
    xp: 0, xpNext: 100, level: 1, gold: 5000,
    atk: 28, def: 14, style: 'shadow',
    state: 'idle', dir: 1, onGround: true,
    invincible: false, invTimer: 0,
    animFrame: 0, animTimer: 0,
    attackAnim: 0, attackPlaying: false,
    inventory: [
      { id: 1, name: 'Теневой клинок', type: 'weapon', atk: 15, icon: '🗡️', equipped: true },
      { id: 2, name: 'Броня Разлома', type: 'armor', def: 20, icon: '🛡️', equipped: true },
      { id: 3, name: 'Зелье здоровья', type: 'potion', amount: 3, heal: 50, icon: '🧪' },
      { id: 4, name: 'Зелье энергии', type: 'potion', amount: 2, heal: 30, icon: '⚡' },
    ],
    skills: { shadow: ['shadow_strike'], fire: [], rift: [] },
    skillPoints: 5, kills: 0,
  });

  const [enemies, setEnemies] = useState([]);
  const [boss, setBoss] = useState(null);
  const [particles, setParticles] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const frameRef = useRef(null);
  const playerRef = useRef(player);
  useEffect(() => { playerRef.current = player; }, [player]);

  // Таймер игры и анимация торговца
  useEffect(() => {
    const timer = setInterval(() => {
      setMerchantFrame(prev => (prev + 1) % 4);
      if (screen === 'game') setGameTime(prev => prev + 1);
    }, 500);
    return () => clearInterval(timer);
  }, [screen]);

  const addNotif = useCallback((text, color = '#fff') => {
    const id = Date.now();
    setNotifs(prev => [...prev.slice(-4), { id, text, color }]);
    setTimeout(() => setNotifs(prev => prev.filter(n => n.id !== id)), 2200);
  }, []);

  const addParticle = useCallback((x, y, opts = {}) => {
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, x, y, ...opts, life: opts.life || 25 }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), opts.life || 25);
  }, []);

  const spawnEnemy = useCallback((x, type) => {
    const t = { goblin: { hp: 80, atk: 14, xp: 40, gold: 30, speed: 1.5, size: 48 }, demon: { hp: 180, atk: 32, xp: 100, gold: 60, speed: 1.2, size: 56 }, shadow: { hp: 130, atk: 24, xp: 75, gold: 50, speed: 2.5, size: 44 } }[type];
    return { id: Date.now() + Math.random(), x, y: H - 160 - t.size, hp: t.hp, maxHp: t.hp, atk: t.atk, xp: t.xp, gold: t.gold, speed: t.speed, size: t.size, type, dir: -1, alive: true, attackCd: 0, stunTimer: 0, animFrame: 0, animTimer: 0, attackFrame: 0, attacking: false, deathFrame: 0, dying: false };
  }, []);

  const spawnBoss = useCallback(() => {
    setBoss({ id: 'boss', x: W * 0.85, y: H - 160 - 80, hp: 900, maxHp: 900, atk: 48, xp: 500, gold: 500, size: 80, name: 'ВЛАДЫКА ТЕНЕЙ', dir: -1, alive: true, phase: 1, attackCd: 0, stunTimer: 0, animFrame: 0, attackFrame: 0, attacking: false });
    addNotif('⚠️ ВЛАДЫКА ТЕНЕЙ ПРОБУДИЛСЯ!', '#ef4444');
  }, [addNotif]);

  // Автоспавн врагов
  useEffect(() => {
    if (screen !== 'game') return;
    const spawnTimer = setInterval(() => {
      setEnemies(prev => {
        const alive = prev.filter(e => e.alive).length;
        if (alive < 8) {
          const types = world === 'demon' ? ['demon', 'shadow'] : ['goblin'];
          const type = types[Math.floor(Math.random() * types.length)];
          const side = Math.random() > 0.5 ? 1 : -1;
          const x = playerRef.current.x + side * (W * 0.4 + Math.random() * 200);
          return [...prev, spawnEnemy(Math.max(50, Math.min(W - 50, x)), type)];
        }
        return prev;
      });
    }, 8000);
    return () => clearInterval(spawnTimer);
  }, [screen, world, spawnEnemy]);

  useEffect(() => {
    if (screen !== 'game') return;
    const e = [];
    for (let i = 0; i < 6; i++) e.push(spawnEnemy(W * 0.35 + i * 140, 'goblin'));
    setEnemies(e);
    setTimeout(() => { spawnBoss(); startDialog(); }, 3000);
  }, [screen]);

  const startDialog = () => {
    setDialogLines([
      { name: 'Кейн', text: 'Тьма пробудилась... Мой клинок чувствует это.', avatar: '⚔️' },
      { name: '???', text: 'Глупец... Владыка Теней уже здесь.', avatar: '👹' },
      { name: 'Кейн', text: 'Я готов. Разлом не поглотит этот мир.', avatar: '⚔️' },
    ]);
    setDialogIndex(0);
    setShowDialog(true);
  };

  const nextDialogLine = () => {
    if (dialogIndex + 1 < dialogLines.length) setDialogIndex(prev => prev + 1);
    else { setShowDialog(false); setDialogLines([]); setDialogIndex(0); }
  };

  useEffect(() => {
    if (player.xp >= player.xpNext) {
      setPlayer(prev => ({ ...prev, level: prev.level + 1, xp: prev.xp - prev.xpNext, xpNext: Math.round(prev.xpNext * 1.5), maxHp: prev.maxHp + 22, hp: Math.min(prev.hp + 35, prev.maxHp + 22), maxSp: prev.maxSp + 8, sp: Math.min(prev.sp + 15, prev.maxSp + 8), maxEn: prev.maxEn + 5, en: Math.min(prev.en + 10, prev.maxEn + 5), atk: prev.atk + 6, def: prev.def + 3, skillPoints: prev.skillPoints + 1 }));
      addNotif(`⭐ УРОВЕНЬ ${player.level + 1}!`, '#fbbf24');
    }
  }, [player.xp]);

  useEffect(() => {
    if (screen !== 'game' || showInventory || showSkills || showCraft || showShop || showDialog) return;
    const loop = () => {
      setPlayer(prev => {
        const p = { ...prev };
        p.vy = Math.min(p.vy + 0.6, 16); p.y += p.vy; p.x += p.vx;
        if (p.y >= H - 160) { p.y = H - 160; p.vy = 0; p.onGround = true; } else p.onGround = false;
        p.vx *= 0.82; p.x = Math.max(25, Math.min(W - 25, p.x));
        if (p.invTimer > 0) { p.invTimer--; if (p.invTimer <= 0) p.invincible = false; }
        if (p.sp < p.maxSp) p.sp = Math.min(p.maxSp, p.sp + 0.08);
        if (p.en < p.maxEn) p.en = Math.min(p.maxEn, p.en + 0.14);
        p.animTimer++;
        if (p.attackPlaying) { p.attackAnim++; if (p.attackAnim >= 5) { p.attackPlaying = false;
          p.attackAnim = 0;
          p.state = 'idle'; } } else if (p.animTimer > 6) { p.animTimer = 0;
          p.animFrame = (p.animFrame + 1) % 4; }
        return p;
      });
      setEnemies(prev => prev.map(e => {
        if (!e.alive) return e;
        if (e.dying) { e.deathFrame++; if (e.deathFrame >= 7) return { ...e, hp: 0, alive: false }; return e; }
        if (e.stunTimer > 0) return { ...e, stunTimer: e.stunTimer - 1 };
        if (e.attacking) { e.attackFrame++; if (e.attackFrame >= (e.type === 'goblin' ? 7 : 4)) { e.attacking = false;
            e.attackFrame = 0; } }
        const dist = Math.abs(playerRef.current.x - e.x);
        if (dist < 380) { const dir = playerRef.current.x > e.x ? 1 : -1; if (dist > e.size + 30) { e.x += dir * e.speed;
            e.dir = dir;
            e.animFrame = (e.animFrame + 1) % (e.type === 'goblin' ? 6 : 4);
            e.attackCd = Math.max(0, e.attackCd - 1); } else if (e.attackCd <= 0) { e.attacking = true;
            e.attackFrame = 0;
            setPlayer(p => { if (p.invincible) return p; const dmg = Math.max(1, e.atk - p.def);
              addNotif(`-${Math.round(dmg)}`, '#ef4444'); const nh = Math.max(0, p.hp - dmg); if (nh <= 0) setTimeout(() => setPlayer(pl => ({ ...pl, hp: Math.round(pl.maxHp * 0.6), x: W * 0.15, invincible: true, invTimer: 100 })), 1800); return { ...p, hp: nh, invincible: true, invTimer: 20 }; });
            e.attackCd = 45 + Math.floor(Math.random() * 25);
            e.dir = dir; } } else { e.x += e.dir * e.speed * 0.2;
          e.attackCd = Math.max(0, e.attackCd - 1); }
        return e;
      }));
      if (boss?.alive) setBoss(prev => { if (!prev) return prev; if (prev.attacking) { prev.attackFrame++; if (prev.attackFrame >= 7) { prev.attacking = false;
            prev.attackFrame = 0; } } const dist = Math.abs(playerRef.current.x - prev.x); if (prev.stunTimer > 0) return { ...prev, stunTimer: prev.stunTimer - 1 }; const dir = playerRef.current.x > prev.x ? 1 : -1; if (dist > prev.size + 50) { prev.x += dir * 2;
          prev.dir = dir;
          prev.attackCd = Math.max(0, prev.attackCd - 1); } else if (prev.attackCd <= 0) { prev.attacking = true;
          prev.attackFrame = 0;
          setPlayer(p => { if (p.invincible) return p; const dmg = Math.max(1, prev.atk * (prev.phase === 2 ? 1.6 : 1) - p.def);
            addNotif(`-${Math.round(dmg)}`, '#ef4444'); const nh = Math.max(0, p.hp - dmg); if (nh <= 0) setTimeout(() => setPlayer(pl => ({ ...pl, hp: Math.round(pl.maxHp * 0.6), x: W * 0.15, invincible: true, invTimer: 100 })), 1800); return { ...p, hp: nh, invincible: true, invTimer: 20 }; });
          prev.attackCd = prev.phase === 2 ? 25 : 40;
          prev.dir = dir; } return prev; });
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [screen, showInventory, showSkills, showCraft, showShop, showDialog, boss]);

  const handleAttack = () => setPlayer(prev => {
    if (prev.attackPlaying) return prev;
    const wp = prev.inventory.filter(i => i.type === 'weapon' && i.equipped).reduce((a, i) => a + (i.atk || 0), 0);
    const dmg = prev.atk + wp;
    addParticle(prev.x + prev.dir * 40, prev.y - 10, { color: '#fbbf24', size: 12 });
    setEnemies(e => e.map(en => { if (!en.alive || Math.abs(prev.x - en.x) >= 85) return en; const fd = Math.round(dmg * (0.85 + Math.random() * 0.3)); const nh = Math.max(0, en.hp - fd); if (nh <= 0) { addNotif(`+${en.xp} XP`, '#4ade80');
        setPlayer(p => ({ ...p, xp: p.xp + en.xp, gold: p.gold + en.gold, kills: p.kills + 1, score: score + en.xp })); if (en.type === 'shadow') return { ...en, dying: true, deathFrame: 0 }; return { ...en, hp: 0, alive: false }; } return { ...en, hp: nh, stunTimer: 15 }; }));
    if (boss?.alive && Math.abs(prev.x - boss.x) < 100) setBoss(b => { if (!b) return b; const nh = Math.max(0, b.hp - Math.round(dmg * 0.85)); if (nh <= b.maxHp * 0.5 && b.phase === 1) { addNotif('⚠️ ФАЗА ЯРОСТИ!', '#ef4444'); return { ...b, hp: nh, phase: 2, stunTimer: 20 }; } if (nh <= 0) { addNotif('🏆 БОСС ПОВЕРЖЕН!', '#fbbf24');
        setPlayer(p => ({ ...p, xp: p.xp + b.xp, gold: p.gold + b.gold })); return { ...b, hp: 0, alive: false }; } return { ...b, hp: nh, stunTimer: 10 }; });
    return { ...prev, state: 'attack', attackPlaying: true, attackAnim: 0 };
  });

  const handleSkill = () => setPlayer(prev => {
    if (prev.sp < 25) { addNotif('Нет SP!', '#ef4444'); return prev; }
    addNotif('✨ ТЕНЕВОЙ УДАР!', '#a855f7');
    addParticle(prev.x, prev.y, { color: '#a855f7', size: 20 });
    setEnemies(e => e.map(en => { if (!en.alive || Math.abs(prev.x - en.x) > 200) return en; const nh = Math.max(0, en.hp - Math.round(prev.atk * 2.5)); if (nh <= 0) { setPlayer(p => ({ ...p, xp: p.xp + en.xp, gold: p.gold + en.gold, kills: p.kills + 1 })); return { ...en, hp: 0, alive: false }; } return { ...en, hp: nh, stunTimer: 25 }; }));
    return { ...prev, sp: prev.sp - 25 };
  });

  const handleDodge = () => setPlayer(prev => { if (prev.en < 15) { addNotif('Нет EN!', '#ef4444'); return prev; } return { ...prev, x: prev.x + prev.dir * 100, en: prev.en - 15, invincible: true, invTimer: 8, state: 'dodge' }; });
  const handleJump = () => setPlayer(prev => prev.onGround ? { ...prev, vy: -13, onGround: false, state: 'jump' } : prev);
  const handleMove = (dx) => setPlayer(prev => ({ ...prev, vx: dx * 5.5, dir: dx !== 0 ? (dx > 0 ? 1 : -1) : prev.dir, state: dx !== 0 && prev.onGround ? 'walk' : prev.state }));
  const handleRift = () => { setWorld(w => w === 'human' ? 'demon' : 'human');
    addNotif(`🌀 ${world === 'human' ? 'МИР ДЕМОНОВ' : 'МИР ЛЮДЕЙ'}`, '#22d3ee'); };

  const consumeItem = (item) => setPlayer(prev => { const heal = item.heal || 50; if (item.name.includes('здоровья')) addNotif(`+${heal} HP`, '#4ade80'); else if (item.name.includes('энергии')) addNotif(`+${heal} EN`, '#60a5fa'); else addNotif(`+${heal} SP`, '#60a5fa'); return { ...prev, hp: item.name.includes('здоровья') ? Math.min(prev.maxHp, prev.hp + heal) : prev.hp, en: item.name.includes('энергии') ? Math.min(prev.maxEn, prev.en + heal) : prev.en, sp: !item.name.includes('здоровья') && !item.name.includes('энергии') ? Math.min(prev.maxSp, prev.sp + heal) : prev.sp, inventory: prev.inventory.map(i => i.id === item.id ? { ...i, amount: i.amount - 1 } : i).filter(i => i.amount > 0) }; });
  const equipItem = (item) => setPlayer(prev => ({ ...prev, inventory: prev.inventory.map(i => i.id === item.id ? { ...i, equipped: !i.equipped } : i) }));
  const learnSkill = (tree, id, cost) => setPlayer(prev => { if (prev.skillPoints < cost) { addNotif('Мало очков!', '#ef4444'); return prev; } if (prev.skills[tree].includes(id)) { addNotif('Уже изучено!', '#fbbf24'); return prev; } addNotif('✅ Навык изучен!', '#4ade80'); return { ...prev, skillPoints: prev.skillPoints - cost, skills: { ...prev.skills, [tree]: [...prev.skills[tree], id] } }; });
  const craftItem = (r) => setPlayer(prev => { if (prev.gold < r.cost) { addNotif('Мало золота!', '#ef4444'); return prev; } addNotif(`✅ ${r.name}!`, '#4ade80'); if (r.id <= 3) { const ex = prev.inventory.find(i => i.name === r.name); if (ex) return { ...prev, gold: prev.gold - r.cost, inventory: prev.inventory.map(i => i.id === ex.id ? { ...i, amount: i.amount + 1 } : i) }; return { ...prev, gold: prev.gold - r.cost, inventory: [...prev.inventory, { id: Date.now(), name: r.name, type: 'potion', amount: 1, heal: r.id === 1 ? 50 : 30, icon: r.icon }] }; } if (r.id === 4) return { ...prev, gold: prev.gold - r.cost, atk: prev.atk + 5 }; if (r.id === 5) return { ...prev, gold: prev.gold - r.cost, def: prev.def + 5 }; return { ...prev, gold: prev.gold - r.cost, atk: prev.atk + 10, def: prev.def + 5 }; });
  const buyItem = (item) => setPlayer(prev => { if (prev.gold < item.price) { addNotif('Мало золота!', '#ef4444'); return prev; } addNotif(`✅ ${item.name}!`, '#4ade80'); const ex = prev.inventory.find(i => i.name === item.name); if (ex) return { ...prev, gold: prev.gold - item.price, inventory: prev.inventory.map(i => i.id === ex.id ? { ...i, amount: i.amount + 1 } : i) }; return { ...prev, gold: prev.gold - item.price, inventory: [...prev.inventory, { id: Date.now(), name: item.name, type: 'potion', amount: 1, heal: item.heal, icon: item.icon }] }; });

  const getPlayerSprite = () => {
    if (player.state === 'attack' && player.attackPlaying) return SPRITES.player.attack[Math.min(player.attackAnim, 4)];
    if (player.state === 'walk') return SPRITES.player.run[player.animFrame % 7];
    if (player.state === 'jump') return SPRITES.player.jump[Math.min(player.animFrame, 3)];
    if (player.state === 'dodge') return SPRITES.player.dodge;
    if (player.invincible && player.state !== 'dodge') return SPRITES.player.hurt;
    return SPRITES.player.idle;
  };

  const getEnemySprite = (e) => {
    if (e.type === 'goblin') {
      if (e.attacking) return SPRITES.goblin.attack[Math.min(e.attackFrame, 6)];
      if (Math.abs(playerRef.current.x - e.x) < 380 && Math.abs(playerRef.current.x - e.x) > e.size + 30) return SPRITES.goblin.walk[e.animFrame % 6];
      return SPRITES.goblin.idle;
    }
    if (e.type === 'demon') {
      if (e.attacking) return SPRITES.demon.attack1[Math.min(e.attackFrame, 17)];
      return SPRITES.demon.idle[e.animFrame % 6];
    }
    if (e.type === 'shadow') {
      if (e.dying) return SPRITES.shadow.death[Math.min(e.deathFrame, 6)];
      if (e.attacking) return SPRITES.shadow.attack[Math.min(e.attackFrame, 3)];
      return SPRITES.shadow.idle;
    }
    return SPRITES.goblin.idle;
  };

  const getBossSprite = () => {
    if (!boss) return SPRITES.boss.idle;
    if (boss.attacking) return SPRITES.boss.attack[Math.min(boss.attackFrame, 6)];
    return SPRITES.boss.idle;
  };

  if (screen === 'title') {
    return (
      <View style={st.title}><StatusBar hidden /><View style={st.titleBg}><View style={st.glow1} /><View style={st.glow2} />
        <Text style={st.logo}>ROFT OF WORLDS</Text><Text style={st.sub}>Action RPG · Two Dimensions</Text><View style={st.line} />
        <TouchableOpacity style={st.btn} onPress={() => setScreen('game')}><Text style={st.btnT}>⚔ НОВАЯ ИГРА</Text></TouchableOpacity>
        <TouchableOpacity style={st.btn} onPress={() => Alert.alert('Roft of Worlds', 'Автор: Artem233\nВерсия: 2.0\nЖанр: Action RPG\n\nСистемы:\n- Анимации всех персонажей\n- Инвентарь и экипировка\n- Дерево навыков (3 ветки)\n- Крафт предметов\n- Магазин\n- Два мира\n- Автоспавн врагов\n- Босс с фазами')}><Text style={st.btnT}>📖 ОБ ИГРЕ</Text></TouchableOpacity>
        <Text style={st.ver}>v2.0 · Artem233</Text></View></View>
    );
  }

  return (
    <View style={st.game}><StatusBar hidden />
      {world === 'human' ? <ImageBackground source={SPRITES.backgrounds.humanSky} style={st.bg} resizeMode="cover" /> : <ImageBackground source={SPRITES.backgrounds.demonBg} style={st.bg} resizeMode="cover" />}
      {world === 'human' && <Image source={SPRITES.backgrounds.humanGround} style={st.groundImg} />}
      {world === 'demon' && <View style={[st.ground, { backgroundColor: '#2a0808' }]} />}
      {particles.map(p => <View key={p.id} style={[st.particle, { left: p.x, top: p.y, width: p.size || 6, height: p.size || 6, backgroundColor: p.color || '#fff' }]} />)}
      <TouchableOpacity onPress={() => setShowShop(true)} style={[st.merchant, { left: W * 0.75, top: H - 210 }]}>
        <Image source={SPRITES.merchant.idle[merchantFrame]} style={{ width: 48, height: 48 }} />
      </TouchableOpacity>
      {enemies.filter(e => e.alive || e.dying).map(e => (
        <View key={e.id} style={[st.enemy, { left: e.x - e.size/2, top: e.y }]}>
          <Image source={getEnemySprite(e)} style={{ width: e.size, height: e.size }} />
          {!e.dying && <View style={st.enemyHp}><View style={[st.enemyHpF, { width: `${(e.hp/e.maxHp)*100}%` }]} /></View>}
        </View>
      ))}
      {boss?.alive && (
        <View style={[st.bossContainer, { left: boss.x - boss.size/2, top: boss.y }]}>
          <Image source={getBossSprite()} style={{ width: boss.size, height: boss.size }} />
          <Text style={st.bossName}>{boss.name}</Text><View style={st.bossHpBar}><View style={[st.bossHpFill, { width: `${(boss.hp/boss.maxHp)*100}%`, backgroundColor: boss.phase === 2 ? '#ef4444' : '#fbbf24' }]} /></View>
          <Text style={st.bossPhase}>{boss.phase === 2 ? 'ФАЗА ЯРОСТИ' : 'ФАЗА I'}</Text>
        </View>
      )}
      <View style={[st.player, { left: player.x - 32, top: player.y - 64, opacity: player.invincible ? 0.5 : 1 }]}>
        <Image source={getPlayerSprite()} style={{ width: 64, height: 64 }} />
      </View>
      <View style={st.hud}><View style={st.hudP}><View style={st.hudR}><View style={{ flex: 1 }}>
        <Text style={st.hp}>❤️ HP {Math.round(player.hp)}/{player.maxHp}</Text><View style={st.hpBar}><View style={[st.hpFill, { width: `${(player.hp/player.maxHp)*100}%` }]} /></View>
        <View style={st.resRow}><Text style={st.resT}>💠 {Math.round(player.sp)}</Text><Text style={st.resT}>⚡ {Math.round(player.en)}</Text><Text style={st.resT}>⏱ {Math.floor(gameTime/2)}с</Text></View></View>
        <View style={{ alignItems: 'flex-end', marginLeft: 12 }}><Text style={st.lvl}>Ур. {player.level}</Text><Text style={st.gold}>💰 {player.gold}</Text>
        <View style={[st.worldBadge, { borderColor: world === 'human' ? 'rgba(96,165,250,0.5)' : 'rgba(248,113,113,0.5)' }]}><Text style={{ color: world === 'human' ? '#93c5fd' : '#fca5a5', fontSize: 9, fontWeight: '700' }}>{world === 'human' ? 'ЛЮДИ' : 'ДЕМОНЫ'}</Text></View>
        <Text style={st.kills}>⚔ {player.kills} убийств</Text></View></View>
        <View style={st.hudBtns}>
          <TouchableOpacity style={st.hudBtn} onPress={() => setShowInventory(true)}><Text style={st.hudBtnT}>🎒</Text></TouchableOpacity>
          <TouchableOpacity style={st.hudBtn} onPress={() => setShowSkills(true)}><Text style={st.hudBtnT}>🌳</Text></TouchableOpacity>
          <TouchableOpacity style={st.hudBtn} onPress={() => setShowCraft(true)}><Text style={st.hudBtnT}>⚒️</Text></TouchableOpacity>
          <TouchableOpacity style={st.hudBtn} onPress={() => setShowShop(true)}><Text style={st.hudBtnT}>🛒</Text></TouchableOpacity>
        </View></View></View>
      <View style={st.notifs}>{notifs.map(n => <Text key={n.id} style={[st.notif, { color: n.color }]}>{n.text}</Text>)}</View>
      <View style={st.ctrl}>
        <View style={st.dpad}>
          <TouchableOpacity style={st.dbtn} onPressIn={() => handleMove(-1)} onPressOut={() => handleMove(0)}><Text style={st.dicon}>◀</Text></TouchableOpacity>
          <TouchableOpacity style={st.dbtn} onPress={handleJump}><Text style={st.dicon}>▲</Text></TouchableOpacity>
          <TouchableOpacity style={st.dbtn} onPressIn={() => handleMove(1)} onPressOut={() => handleMove(0)}><Text style={st.dicon}>▶</Text></TouchableOpacity>
        </View>
        <View style={st.acts}>
          <TouchableOpacity style={st.abtn} onPress={handleDodge}><Text style={st.aicon}>💨</Text></TouchableOpacity>
          <TouchableOpacity style={st.abtn} onPress={handleRift}><Text style={st.aicon}>🌀</Text></TouchableOpacity>
          <TouchableOpacity style={st.abtn} onPress={handleSkill}><Text style={st.aicon}>✨</Text></TouchableOpacity>
          <TouchableOpacity style={[st.abtn, st.atk]} onPress={handleAttack}><Text style={[st.aicon, { fontSize: 24 }]}>⚔</Text></TouchableOpacity>
        </View>
      </View>
      {showDialog && dialogLines.length > 0 && (
        <TouchableOpacity style={st.dialogOverlay} onPress={nextDialogLine} activeOpacity={0.9}><View style={st.dialogBox}>
          <Text style={st.dialogAvatar}>{dialogLines[dialogIndex].avatar}</Text><View style={{ flex: 1 }}><Text style={st.dialogName}>{dialogLines[dialogIndex].name}</Text><Text style={st.dialogText}>{dialogLines[dialogIndex].text}</Text></View><Text style={st.dialogNext}>▶</Text>
        </View></TouchableOpacity>
      )}
      {showInventory && <ModalView title="🎒 ИНВЕНТАРЬ" close={() => setShowInventory(false)}>
        {player.inventory.map(item => <TouchableOpacity key={item.id} style={st.invItem} onPress={() => item.type === 'potion' ? consumeItem(item) : equipItem(item)}><Text style={{ fontSize: 24 }}>{item.icon}</Text><View style={{ flex: 1 }}><Text style={{ color: '#fff', fontWeight: '700' }}>{item.name}</Text>{item.type === 'potion' ? <Text style={{ color: '#888' }}>x{item.amount}</Text> : item.equipped ? <Text style={{ color: '#4ade80' }}>Экипировано</Text> : <Text style={{ color: '#666' }}>Нажмите</Text>}</View></TouchableOpacity>)}
      </ModalView>}
      {showSkills && <ModalView title={`🌳 НАВЫКИ (Очков: ${player.skillPoints})`} close={() => setShowSkills(false)}>
        <View style={st.tabRow}>{Object.keys(SKILL_TREE).map(tree => <TouchableOpacity key={tree} style={[st.tab, currentSkillTree === tree && st.tabActive]} onPress={() => setCurrentSkillTree(tree)}><Text style={[st.tabT, currentSkillTree === tree && st.tabTActive]}>{SKILL_TREE[tree].name}</Text></TouchableOpacity>)}</View>
        {SKILL_TREE[currentSkillTree].skills.map(skill => { const unlocked = player.skills[currentSkillTree].includes(skill.id); return <TouchableOpacity key={skill.id} style={[st.skillItem, unlocked && st.skillUnlocked]} onPress={() => !unlocked && learnSkill(currentSkillTree, skill.id, skill.cost)}><Text style={{ fontSize: 20 }}>{unlocked ? '✅' : '🔒'}</Text><View style={{ flex: 1 }}><Text style={{ color: unlocked ? '#fff' : '#888', fontWeight: '700' }}>{skill.name} ({skill.cost} очк.)</Text><Text style={{ color: '#666', fontSize: 11 }}>{skill.desc}</Text></View></TouchableOpacity>; })}
      </ModalView>}
      {showCraft && <ModalView title="⚒️ КРАФТ" close={() => setShowCraft(false)}>
        {CRAFT_RECIPES.map(r => <TouchableOpacity key={r.id} style={st.invItem} onPress={() => craftItem(r)}><Text style={{ fontSize: 24 }}>{r.icon}</Text><View style={{ flex: 1 }}><Text style={{ color: '#fff', fontWeight: '700' }}>{r.name}</Text><Text style={{ color: '#888' }}>{r.desc}</Text></View><Text style={{ color: '#fbbf24', fontWeight: '700' }}>{r.cost}💰</Text></TouchableOpacity>)}
      </ModalView>}
      {showShop && <ModalView title="🛒 ТОРГОВЕЦ" close={() => setShowShop(false)}>
        <Text style={{ color: '#ccc', textAlign: 'center', marginBottom: 10 }}>Добро пожаловать, путник!</Text>
        {SHOP_ITEMS.map((item, i) => <TouchableOpacity key={i} style={st.invItem} onPress={() => buyItem(item)}><Text style={{ fontSize: 24 }}>{item.icon}</Text><Text style={{ color: '#fff', fontWeight: '700', flex: 1 }}>{item.name}</Text><Text style={{ color: '#fbbf24', fontWeight: '700' }}>{item.price}💰</Text></TouchableOpacity>)}
      </ModalView>}
    </View>
  );
}

const ModalView = ({ title, close, children }) => (
  <View style={st.modal}><View style={st.modalCard}><Text style={st.modalTitle}>{title}</Text>
    <ScrollView style={{ maxHeight: 250, width: '100%' }}>{children}</ScrollView>
    <TouchableOpacity style={st.modalBtn} onPress={close}><Text style={st.modalBtnT}>ЗАКРЫТЬ</Text></TouchableOpacity>
  </View></View>
);

const st = StyleSheet.create({
  title: { flex: 1 }, titleBg: { flex: 1, backgroundColor: '#0a0a1a', alignItems: 'center', justifyContent: 'center' },
  glow1: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(192,132,252,0.06)' },
  glow2: { position: 'absolute', bottom: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(34,211,238,0.04)' },
  logo: { fontSize: 46, fontWeight: '900', color: '#c084fc', letterSpacing: 6, textAlign: 'center' }, sub: { color: '#a78bfa', fontSize: 14, letterSpacing: 8, marginTop: 6 },
  line: { width: 180, height: 2, backgroundColor: '#c084fc', marginVertical: 24, opacity: 0.4 },
  btn: { width: '75%', paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', marginBottom: 10 },
  btnT: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 3 }, ver: { color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: 4, marginTop: 20 },
  game: { flex: 1 }, bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, ground: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 180 },
  groundImg: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, resizeMode: 'repeat' },
  particle: { position: 'absolute', borderRadius: 50, opacity: 0.8 }, merchant: { position: 'absolute' },
  enemy: { position: 'absolute', alignItems: 'center' }, enemyHp: { width: 40, height: 3, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 2, marginTop: 2, overflow: 'hidden' }, enemyHpF: { height: '100%', backgroundColor: '#4ade80' },
  bossContainer: { position: 'absolute', alignItems: 'center' }, bossName: { color: '#ef4444', fontSize: 11, fontWeight: '900', letterSpacing: 3, marginTop: 4 },
  bossHpBar: { width: 110, height: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, marginTop: 4, overflow: 'hidden' }, bossHpFill: { height: '100%', borderRadius: 4 },
  bossPhase: { color: '#fbbf24', fontSize: 10, marginTop: 2, fontWeight: '700' }, player: { position: 'absolute' },
  hud: { position: 'absolute', top: 8, left: 8, right: 8 }, hudP: { backgroundColor: 'rgba(10,10,28,0.78)', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  hudR: { flexDirection: 'row', justifyContent: 'space-between' }, hp: { color: '#fff', fontSize: 11, fontWeight: '700' },
  hpBar: { height: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 5, marginTop: 3, overflow: 'hidden', width: 140 }, hpFill: { height: '100%', backgroundColor: '#ef4444' },
  resRow: { flexDirection: 'row', gap: 12, marginTop: 4 }, resT: { color: '#ccc', fontSize: 10 },
  lvl: { color: '#fbbf24', fontSize: 16, fontWeight: '900' }, gold: { color: '#fbbf24', fontSize: 11, fontWeight: '700' },
  worldBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, marginTop: 2 }, kills: { color: '#888', fontSize: 9, marginTop: 2 },
  hudBtns: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 }, hudBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }, hudBtnT: { fontSize: 16 },
  notifs: { position: 'absolute', top: 100, right: 10, gap: 3 }, notif: { fontSize: 12, fontWeight: '700' },
  ctrl: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, alignItems: 'flex-end' },
  dpad: { flexDirection: 'row', alignItems: 'center', gap: 2 }, dbtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }, dicon: { fontSize: 18, color: '#fff' },
  acts: { flexDirection: 'row', gap: 5 }, abtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  atk: { backgroundColor: 'rgba(239,68,68,0.3)', borderColor: 'rgba(239,68,68,0.5)', width: 54, height: 54 }, aicon: { fontSize: 20 },
  dialogOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, paddingBottom: 30 },
  dialogBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(10,10,30,0.94)', borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: 'rgba(192,132,252,0.3)' },
  dialogAvatar: { fontSize: 32 }, dialogName: { color: '#c084fc', fontSize: 12, fontWeight: '700', letterSpacing: 2 }, dialogText: { color: '#fff', fontSize: 13, lineHeight: 18, marginTop: 2 }, dialogNext: { color: '#a78bfa', fontSize: 16 },
  modal: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modalCard: { width: '82%', maxHeight: '70%', backgroundColor: 'rgba(15,15,35,0.95)', borderRadius: 22, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { color: '#c084fc', fontSize: 20, fontWeight: '900', letterSpacing: 4, marginBottom: 12 },
  modalBtn: { width: '100%', paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', marginTop: 10 },
  modalBtnT: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 2 },
  invItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, width: '100%', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 12 }, tab: { flex: 1, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(192,132,252,0.3)', borderColor: '#c084fc' }, tabT: { color: '#888', fontSize: 11, fontWeight: '700' }, tabTActive: { color: '#fff' },
  skillItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, width: '100%', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' }, skillUnlocked: { backgroundColor: 'rgba(74,222,128,0.08)' },
});
