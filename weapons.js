// Weapon rendering and logic
export function renderSword({x, y, angle, bladeGradient, fireGradient, fireGlow, facing}) {
  // x, y: sword base position; angle: rotation; gradients/filters: ids
  return `
    <g transform="rotate(${angle} ${x} ${y+15})">
      <!-- Sword blade -->
      <rect x="${x-2}" y="${y}" width="4" height="26" rx="1.2" fill="url(#${bladeGradient})" stroke="#fffbe0" stroke-width="1.2"/>
      <!-- Sword tip -->
      <polygon points="${x-2},${y} ${x+2},${y} ${x},${y-6}" fill="#fffbe0"/>
      <!-- Guard -->
      <rect x="${x-7}" y="${y+22}" width="14" height="4" rx="2" fill="#ffb400" stroke="#b97a00" stroke-width="1"/>
      <!-- Hilt -->
      <rect x="${x-1.2}" y="${y+26}" width="2.4" height="8" rx="1" fill="#b97a00"/>
      <!-- Fire effect -->
      <g filter="url(#${fireGlow})">
        <rect x="${x-3.5}" y="${y}" width="7" height="26" rx="3.5" fill="url(#${fireGradient})" opacity="0.7"/>
      </g>
    </g>
  `;
} 