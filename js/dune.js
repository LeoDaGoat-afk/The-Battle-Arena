import { playerColors, rainbowBGKeyframes } from './styles.js';
import { getBrawlerHealth } from './brawlers.js';

// Dune Cyclone 玩法主入口
export function startDuneCyclone(player1, player2) {
  // ====== 玩法参数 ======
  const duneBlocks = [
    { x: 120, y: 470, w: 180, h: 24, angle: 0 },
    { x: 420, y: 420, w: 180, h: 24, angle: 0 },
    { x: 720, y: 470, w: 180, h: 24, angle: 0 }
  ];
  const duneFloor = { x: 0, y: 580, w: 1000, h: 30 };
  const duneWalls = [
    { x: 0, y: 0, w: 20, h: 600 },
    { x: 980, y: 0, w: 20, h: 600 }
  ];
  const gravity = 1.2;
  const jumpPower = -18;
  const moveSpeed = 7;
  const attackCooldown = 18; // 帧
  const attackRange = 60; // 剑长，决定攻击的前后距离
  const attackWidth = 32; // 攻击判定宽，决定上下的判定高度
  const attackDamage = 120;

  // ====== 状态 ======
  let p1 = { ...player1, vx: 0, vy: 0, onGround: false, attacking: false, attackTimer: 0, facing: 'right', dead: false };
  let p2 = { ...player2, vx: 0, vy: 0, onGround: false, attacking: false, attackTimer: 0, facing: 'right', dead: false };
  let keys1 = { a: false, d: false, w: false, j: false };
  let keys2 = { left: false, right: false, up: false, num1: false };
  let winner = null;

  // ====== SVG 渲染 ======
  const duneBlank = document.getElementById('duneBlank');
  duneBlank.innerHTML = `<svg id="duneSVG" width="100vw" height="100vh" viewBox="0 0 1000 600" style="position:absolute;top:0;left:0;width:100vw;height:100vh;"></svg>`;
  const svg = document.getElementById('duneSVG');

  // ====== 控制绑定 ======
  function keydown(e) {
    if (e.repeat) return;
    if (e.key === 'a' || e.key === 'A') keys1.a = true;
    if (e.key === 'd' || e.key === 'D') keys1.d = true;
    if (e.key === 'w' || e.key === 'W') keys1.w = true;
    if (e.key === 'j' || e.key === 'J') keys1.j = true;
    if (e.key === 'ArrowLeft') keys2.left = true;
    if (e.key === 'ArrowRight') keys2.right = true;
    if (e.key === 'ArrowUp') keys2.up = true;
    if (e.key === '1') keys2.num1 = true;
  }
  function keyup(e) {
    if (e.key === 'a' || e.key === 'A') keys1.a = false;
    if (e.key === 'd' || e.key === 'D') keys1.d = false;
    if (e.key === 'w' || e.key === 'W') keys1.w = false;
    if (e.key === 'j' || e.key === 'J') keys1.j = false;
    if (e.key === 'ArrowLeft') keys2.left = false;
    if (e.key === 'ArrowRight') keys2.right = false;
    if (e.key === 'ArrowUp') keys2.up = false;
    if (e.key === '1') keys2.num1 = false;
  }
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);

  // ====== 动画主循环 ======
  function loop() {
    if (winner) return;
    // 玩家1移动
    if (keys1.a) { p1.vx = -moveSpeed; p1.facing = 'left'; }
    else if (keys1.d) { p1.vx = moveSpeed; p1.facing = 'right'; }
    else p1.vx = 0;
    if (keys1.w && p1.onGround) { p1.vy = jumpPower; p1.onGround = false; }
    // 玩家2移动
    if (keys2.left) { p2.vx = -moveSpeed; p2.facing = 'left'; }
    else if (keys2.right) { p2.vx = moveSpeed; p2.facing = 'right'; }
    else p2.vx = 0;
    if (keys2.up && p2.onGround) { p2.vy = jumpPower; p2.onGround = false; }
    // 攻击判定
    if (keys1.j && !p1.attacking && p1.attackTimer <= 0) {
      p1.attacking = true; p1.attackTimer = attackCooldown;
      if (checkAttack(p1, p2)) {
        console.log('P1 hit P2!', p1, p2);
        p2.health -= attackDamage;
        if (p2.health <= 0) { p2.health = 0; p2.dead = true; winner = 1; showWinner(1); }
      }
    }
    if (keys2.num1 && !p2.attacking && p2.attackTimer <= 0) {
      p2.attacking = true; p2.attackTimer = attackCooldown;
      if (checkAttack(p2, p1)) {
        p1.health -= attackDamage;
        if (p1.health <= 0) { p1.health = 0; p1.dead = true; winner = 2; showWinner(2); }
      }
    }
    if (p1.attacking) { p1.attackTimer--; if (p1.attackTimer <= 0) p1.attacking = false; }
    if (p2.attacking) { p2.attackTimer--; if (p2.attackTimer <= 0) p2.attacking = false; }
    // 物理
    p1.vy += gravity; p1.x += p1.vx; p1.y += p1.vy;
    p2.vy += gravity; p2.x += p2.vx; p2.y += p2.vy;
    // 碰撞检测
    p1.onGround = false; p2.onGround = false;
    const allObjs = [...duneBlocks, duneFloor, ...duneWalls];
    for (let obj of allObjs) {
      collide(p1, obj);
      collide(p2, obj);
    }
    // 边界
    bound(p1); bound(p2);
    // 渲染
    render();
    if (!winner) requestAnimationFrame(loop);
  }

  // ====== 攻击判定 ======
  function checkAttack(attacker, defender) {
    // 攻击判定为面朝方向的矩形区域
    const ax = attacker.x + (attacker.facing === 'right' ? 0 : -attackRange);
    const ay = attacker.y - 28; // 让攻击判定从角色头顶开始
    const rx = ax + (attacker.facing === 'right' ? 0 : -attackRange);
    const rw = attackRange;
    const rh = 56; // 覆盖整个角色高度
    // defender 脚下矩形
    const dx = defender.x - 28, dy = defender.y - 28, dw = 56, dh = 56;
    return (
      rx < dx + dw && rx + rw > dx &&
      ay < dy + dh && ay + rh > dy
    );
  }

  // ====== 碰撞检测 ======
  function collide(p, obj) {
    const left = p.x - 28, right = p.x + 28, top = p.y - 28, bottom = p.y + 70;
    const oleft = obj.x, oright = obj.x + obj.w, otop = obj.y, obottom = obj.y + obj.h;
    // 落地
    if (right > oleft && left < oright && bottom > otop && top < obottom) {
      if (p.vy > 0 && p.y < obj.y) { p.y = obj.y - 70; p.vy = 0; p.onGround = true; }
      else if (p.vx > 0 && p.x < obj.x) { p.x = obj.x - 28; p.vx = 0; }
      else if (p.vx < 0 && p.x > obj.x + obj.w) { p.x = obj.x + obj.w + 28; p.vx = 0; }
      else if (p.vy < 0 && p.y > obj.y + obj.h) { p.y = obj.y + obj.h + 28; p.vy = 0; }
    }
  }
  function bound(p) {
    if (p.x < 28) p.x = 28;
    if (p.x > 1000-28) p.x = 1000-28;
    if (p.y > 600-28) { p.y = 600-28; p.vy = 0; p.onGround = true; }
  }

  // ====== 渲染 ======
  function render() {
    svg.innerHTML = '';
    // 渲染场景
    duneWalls.forEach(wall => {
      svg.innerHTML += `<rect x="${wall.x}" y="${wall.y}" width="${wall.w}" height="${wall.h}" fill="#444" stroke="#222" stroke-width="2"/>`;
    });
    duneBlocks.forEach(block => {
      svg.innerHTML += `<rect x="${block.x}" y="${block.y}" width="${block.w}" height="${block.h}" fill="#fffbe0" stroke="#222" stroke-width="4" rx="8" transform="rotate(${block.angle} ${block.x + block.w/2} ${block.y + block.h/2})"/>`;
    });
    svg.innerHTML += `<rect x="${duneFloor.x}" y="${duneFloor.y}" width="${duneFloor.w}" height="${duneFloor.h}" fill="#fffbe0" stroke="#222" stroke-width="4" rx="12"/>`;
    // 血条
    function healthBar(x, y, w, h, health, maxHealth, color) {
      const pct = Math.max(0, Math.min(1, health / maxHealth));
      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#222" rx="4"/>
        <rect x="${x}" y="${y}" width="${w * pct}" height="${h}" fill="${color}" rx="4"/>
        <text x="${x + w/2}" y="${y + h/2 + 6}" text-anchor="middle" font-size="18" fill="#fff" font-weight="bold">${health} / ${maxHealth}</text>
      `;
    }
    // 玩家1
    svg.innerHTML += `
      <g>
        ${healthBar(p1.x-40, p1.y-60, 80, 16, p1.health, p1.maxHealth, p1.color)}
        <circle cx="${p1.x}" cy="${p1.y}" r="28" fill="#232946" stroke="${p1.color}" stroke-width="4"/>
        <ellipse cx="${p1.x-8}" cy="${p1.y-4}" rx="3.5" ry="5" fill="#fff"/>
        <ellipse cx="${p1.x+8}" cy="${p1.y-4}" rx="3.5" ry="5" fill="#fff"/>
        <path d="M${p1.x-7},${p1.y+8} Q${p1.x},${p1.y+16} ${p1.x+7},${p1.y+8}" stroke="#fff" stroke-width="2" fill="none"/>
        <rect x="${p1.x-10}" y="${p1.y+28}" width="20" height="40" rx="8" fill="${p1.color}"/>
        <rect x="${p1.x-7}" y="${p1.y+40}" width="6" height="32" rx="2" fill="#232946"/>
        <rect x="${p1.x+1}" y="${p1.y+40}" width="6" height="32" rx="2" fill="#232946"/>
        <ellipse cx="${p1.x-6}" cy="${p1.y+70}" rx="6" ry="4" fill="#232946" stroke="${p1.color}" stroke-width="2"/>
        <ellipse cx="${p1.x+6}" cy="${p1.y+70}" rx="6" ry="4" fill="#232946" stroke="${p1.color}" stroke-width="2"/>
        <g transform="rotate(${p1.facing==='right'?30:-30} ${p1.facing==='right'?p1.x+32:p1.x-32} ${p1.y+65})">
          <rect x="${(p1.facing==='right'?p1.x+32:p1.x-32)-2}" y="${p1.y+50}" width="4" height="26" rx="1.2" fill="#fff" stroke="#fffbe0" stroke-width="1.2"/>
          <polygon points="${(p1.facing==='right'?p1.x+32:p1.x-32)-2},${p1.y+50} ${(p1.facing==='right'?p1.x+32:p1.x-32)+2},${p1.y+50} ${(p1.facing==='right'?p1.x+32:p1.x-32)},${p1.y+44}" fill="#fffbe0"/>
          <rect x="${(p1.facing==='right'?p1.x+32:p1.x-32)-7}" y="${p1.y+72}" width="14" height="4" rx="2" fill="#ffb400" stroke="#b97a00" stroke-width="1"/>
          <rect x="${(p1.facing==='right'?p1.x+32:p1.x-32)-1.2}" y="${p1.y+76}" width="2.4" height="8" rx="1" fill="#b97a00"/>
        </g>
        ${p1.attacking ? `<rect x="${p1.facing==='right'?p1.x+28:p1.x-28-attackRange}" y="${p1.y+28}" width="${attackRange}" height="${attackWidth}" fill="#ff4c60" opacity="0.3"/>` : ''}
      </g>
    `;
    // 玩家2
    svg.innerHTML += `
      <g>
        ${healthBar(p2.x-40, p2.y-60, 80, 16, p2.health, p2.maxHealth, p2.color)}
        <circle cx="${p2.x}" cy="${p2.y}" r="28" fill="#232946" stroke="${p2.color}" stroke-width="4"/>
        <ellipse cx="${p2.x-8}" cy="${p2.y-4}" rx="3.5" ry="5" fill="#fff"/>
        <ellipse cx="${p2.x+8}" cy="${p2.y-4}" rx="3.5" ry="5" fill="#fff"/>
        <path d="M${p2.x-7},${p2.y+8} Q${p2.x},${p2.y+16} ${p2.x+7},${p2.y+8}" stroke="#fff" stroke-width="2" fill="none"/>
        <rect x="${p2.x-10}" y="${p2.y+28}" width="20" height="40" rx="8" fill="${p2.color}"/>
        <rect x="${p2.x-7}" y="${p2.y+40}" width="6" height="32" rx="2" fill="#232946"/>
        <rect x="${p2.x+1}" y="${p2.y+40}" width="6" height="32" rx="2" fill="#232946"/>
        <ellipse cx="${p2.x-6}" cy="${p2.y+70}" rx="6" ry="4" fill="#232946" stroke="${p2.color}" stroke-width="2"/>
        <ellipse cx="${p2.x+6}" cy="${p2.y+70}" rx="6" ry="4" fill="#232946" stroke="${p2.color}" stroke-width="2"/>
        <g transform="rotate(${p2.facing==='right'?30:-30} ${p2.facing==='right'?p2.x+32:p2.x-32} ${p2.y+65})">
          <rect x="${(p2.facing==='right'?p2.x+32:p2.x-32)-2}" y="${p2.y+50}" width="4" height="26" rx="1.2" fill="#fff" stroke="#fffbe0" stroke-width="1.2"/>
          <polygon points="${(p2.facing==='right'?p2.x+32:p2.x-32)-2},${p2.y+50} ${(p2.facing==='right'?p2.x+32:p2.x-32)+2},${p2.y+50} ${(p2.facing==='right'?p2.x+32:p2.x-32)},${p2.y+44}" fill="#fffbe0"/>
          <rect x="${(p2.facing==='right'?p2.x+32:p2.x-32)-7}" y="${p2.y+72}" width="14" height="4" rx="2" fill="#ffb400" stroke="#b97a00" stroke-width="1"/>
          <rect x="${(p2.facing==='right'?p2.x+32:p2.x-32)-1.2}" y="${p2.y+76}" width="2.4" height="8" rx="1" fill="#b97a00"/>
        </g>
        ${p2.attacking ? `<rect x="${p2.facing==='right'?p2.x+28:p2.x-28-attackRange}" y="${p2.y+28}" width="${attackRange}" height="${attackWidth}" fill="#47e7fa" opacity="0.3"/>` : ''}
      </g>
    `;
    // 胜负
    if (winner) {
      svg.innerHTML += `<text x="500" y="300" text-anchor="middle" font-size="48" fill="#ffb400" font-weight="bold">Player ${winner} Wins!</text>`;
    }
  }

  // ====== 胜负判定 ======
  function showWinner(w) {
    render();
    setTimeout(() => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
    }, 1000);
  }

  // ====== 启动动画 ======
  loop();
} 