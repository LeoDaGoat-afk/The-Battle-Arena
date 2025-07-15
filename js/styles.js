export const playerColors = [
  '#ff4c60', '#47e7fa', '#7bffb2', '#f7baff', '#ffc371', 
  '#ff5f6d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'
];

// rainbowBG 动画 keyframes 作为字符串导出，供 main.js 动态插入
export const rainbowBGKeyframes = `@keyframes rainbowBG {
  0% {background-position:0% 50%}
  50% {background-position:100% 50%}
  100% {background-position:0% 50%}
}`; 

function healthBar(x, y, w, h, health, maxHealth, color) {
  const pct = Math.max(0, Math.min(1, health / maxHealth));
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#222" rx="4"/>
    <rect x="${x}" y="${y}" width="${w * pct}" height="${h}" fill="${color}" rx="4"/>
    <text x="${x + w/2}" y="${y + h/2 + 6}" text-anchor="middle" font-size="18" fill="#fff" font-weight="bold">${health} / ${maxHealth}</text>
  `;
} 

function checkAttack(attacker, defender) {
  // 攻击判定为面朝方向的矩形区域
  const ax = attacker.x + (attacker.facing === 'right' ? 28 : -28);
  const ay = attacker.y + 28;
  const rx = ax + (attacker.facing === 'right' ? 0 : -attackRange);
  const rw = attackRange;
  const rh = attackWidth;
  // defender 脚下矩形
  const dx = defender.x - 28, dy = defender.y - 28, dw = 56, dh = 56;
  return (
    rx < dx + dw && rx + rw > dx &&
    ay < dy + dh && ay + rh > dy
  );
} 