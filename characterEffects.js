// Character (brawler) effects and styles
export function getCharacterSVGDefs() {
  return `
    <defs>
      <linearGradient id="bladeGradient1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff"/>
        <stop offset="100%" stop-color="#b0b0b0"/>
      </linearGradient>
      <linearGradient id="bladeGradient2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff"/>
        <stop offset="100%" stop-color="#b0b0b0"/>
      </linearGradient>
      <linearGradient id="fireGradient1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffbe0"/>
        <stop offset="40%" stop-color="#ffb400"/>
        <stop offset="80%" stop-color="#ff4c60"/>
        <stop offset="100%" stop-color="#ff1e3c"/>
      </linearGradient>
      <linearGradient id="fireGradient2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffbe0"/>
        <stop offset="40%" stop-color="#ffb400"/>
        <stop offset="80%" stop-color="#ff4c60"/>
        <stop offset="100%" stop-color="#ff1e3c"/>
      </linearGradient>
      <filter id="fireGlow1" x="-20" y="-20" width="40" height="60">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="fireGlow2" x="-20" y="-20" width="40" height="60">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- Add more character-specific effects here as needed -->
    </defs>
  `;
} 