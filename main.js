import { charDescriptions, getBrawlerHealth } from './brawlers.js';
import { mapDescriptions, mapNames } from './maps.js';
import { getMapSVGDefs } from './effects.js';
import { getCharacterSVGDefs } from './characterEffects.js';
import { renderSword } from './weapons.js';

// Color palette for players
const playerColors = [
  '#ff4c60', '#47e7fa', '#7bffb2', '#f7baff', '#ffc371',
  '#ff5f6d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'
];

// Function to get two different random colors
function getTwoDistinctColors() {
  const idx1 = Math.floor(Math.random() * playerColors.length);
  const color1 = playerColors[idx1];
  const remaining = playerColors.filter((c, i) => i !== idx1);
  const color2 = remaining[Math.floor(Math.random() * remaining.length)];
  return [color1, color2];
}

// Assign colors at game start
export let player1Color, player2Color;
[player1Color, player2Color] = getTwoDistinctColors();

// Player state
let player1 = {
  x: 250, y: 350, vx: 0, vy: 0, facing: 'right', onGround: false,
  swordSwing: false, swingTimer: 0, color: player1Color
};
let player2 = {
  x: 750, y: 370, vx: 0, vy: 0, facing: 'right', onGround: false,
  swordSwing: false, swingTimer: 0, color: player2Color
};

// Sword swing constants
const SWING_DURATION = 12; // frames
const SWING_ANGLE = 90;    // degrees for swing effect

// Key state
let keys = { a: false, d: false, w: false, s: false };
let keys2 = { left: false, right: false, up: false, down: false };

// Key event listeners
window.addEventListener('keydown', (e) => {
  if (e.key === 'a' || e.key === 'A') keys.a = true;
  if (e.key === 'd' || e.key === 'D') keys.d = true;
  if (e.key === 'w' || e.key === 'W') keys.w = true;
  if (e.key === 's' || e.key === 'S') {
    if (!player1.swordSwing) { player1.swordSwing = true; player1.swingTimer = SWING_DURATION; }
  }
  if (e.key === 'ArrowLeft') keys2.left = true;
  if (e.key === 'ArrowRight') keys2.right = true;
  if (e.key === 'ArrowUp') keys2.up = true;
  if (e.key === 'ArrowDown') {
    if (!player2.swordSwing) { player2.swordSwing = true; player2.swingTimer = SWING_DURATION; }
  }
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'a' || e.key === 'A') keys.a = false;
  if (e.key === 'd' || e.key === 'D') keys.d = false;
  if (e.key === 'w' || e.key === 'W') keys.w = false;
  if (e.key === 's' || e.key === 'S') keys.s = false;
  if (e.key === 'ArrowLeft') keys2.left = false;
  if (e.key === 'ArrowRight') keys2.right = false;
  if (e.key === 'ArrowUp') keys2.up = false;
  if (e.key === 'ArrowDown') keys2.down = false;
});

// Animation/render loop
function gameLoop() {
  // Update sword swing timers
  if (player1.swordSwing) {
    player1.swingTimer--;
    if (player1.swingTimer <= 0) player1.swordSwing = false;
  }
  if (player2.swordSwing) {
    player2.swingTimer--;
    if (player2.swingTimer <= 0) player2.swordSwing = false;
  }

  // ... (update player movement, physics, etc. here) ...

  // Render (example for sword only)
  // Calculate sword angle
  let swordAngle1 = player1.facing === 'right' ? 30 : -30;
  if (player1.swordSwing) swordAngle1 = player1.facing === 'right' ? SWING_ANGLE : -SWING_ANGLE;
  let swordAngle2 = player2.facing === 'right' ? 30 : -30;
  if (player2.swordSwing) swordAngle2 = player2.facing === 'right' ? SWING_ANGLE : -SWING_ANGLE;

  // ... (render the rest of the scene, using renderSword with the calculated angles) ...

  requestAnimationFrame(gameLoop);
}

gameLoop();
// ... rest of your main game logic ... 