import { mapDescriptions, mapNames } from './maps.js';
import { charDescriptions, getBrawlerHealth } from './brawlers.js';
import { playerColors, rainbowBGKeyframes } from './styles.js';
import { startDuneCyclone } from './dune.js';

// ====== 全局变量 ======
let _player1Map = null;
let _player2Map = null;
let pickedBrawler1 = null;
let pickedBrawler2 = null;
let brawlerTurn = 1;

// ====== 工具函数 ======
function $(id) { return document.getElementById(id); }

// ====== 页面初始化 ======
function init() {
  // 动态插入 rainbowBG 动画 keyframes
  const styleSheet = document.createElement('style');
  styleSheet.innerHTML = rainbowBGKeyframes;
  document.head.appendChild(styleSheet);

  // Start 按钮
  $('startBtn').onclick = () => {
    $('pickBox').style.display = 'block';
    $('pickBox2').style.display = 'block';
    document.querySelector('h1').style.display = 'none';
    document.querySelector('.arena-controls').style.display = 'none';
    $('mapLabel').style.display = 'block';
    $('divider').style.display = 'block';
    $('pickBox').classList.remove('disabled');
    $('pickBox2').classList.add('disabled');
    $('pickTitle1').classList.add('active');
    $('pickTitle2').classList.remove('active');
  };

  // 地图选择事件绑定
  document.querySelectorAll('#pickBox .arena-option').forEach(btn => {
    btn.onclick = () => {
      const map = btn.getAttribute('data-map');
      const desc = mapDescriptions[map];
      $('modalContent').innerHTML = desc;
      $('mapModal').style.display = 'block';
      $('confirmModal1').style.display = 'inline-block';
      $('confirmModal2').style.display = 'none';
      _player1Map = map;
    };
  });
  document.querySelectorAll('#pickBox2 .arena-option').forEach(btn => {
    btn.onclick = () => {
      const map = btn.getAttribute('data-map');
      const desc = mapDescriptions[map];
      $('modalContent').innerHTML = desc;
      $('mapModal').style.display = 'block';
      $('confirmModal1').style.display = 'none';
      $('confirmModal2').style.display = 'inline-block';
      _player2Map = map;
    };
  });
  $('closeModal').onclick = () => {
    $('mapModal').style.display = 'none';
  };
  $('confirmModal1').onclick = () => {
    $('mapModal').style.display = 'none';
    $('pickBox').classList.add('disabled');
    $('pickBox2').classList.remove('disabled');
    $('pickTitle1').classList.remove('active');
    $('pickTitle2').classList.add('active');
  };
  $('confirmModal2').onclick = () => {
    $('mapModal').style.display = 'none';
    if (_player1Map && _player2Map) {
      let chosenMap = _player1Map;
      if (_player1Map !== _player2Map) {
        chosenMap = Math.random() < 0.5 ? _player1Map : _player2Map;
      }
      $('pickBox').style.display = 'none';
      $('pickBox2').style.display = 'none';
      $('divider').style.display = 'none';
      $('mapLabel').style.display = 'none';
      $('selectedMapName').textContent = mapNames[chosenMap];
      $('selectedMapDesc').innerHTML = mapDescriptions[chosenMap];
      $('battleScreen').style.display = 'block';
      // 倒计时
      let count = 3;
      const countdownElement = $('countdown');
      countdownElement.textContent = `Time to pick your brawlers in 3...`;
      const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          countdownElement.textContent = `Time to pick your brawlers in ${count}...`;
        } else {
          countdownElement.textContent = 'Time to pick your brawlers in 1...';
          setTimeout(() => {
            clearInterval(countdownInterval);
            $('battleScreen').style.display = 'none';
            $('mapScreen').style.display = 'block';
          }, 1000);
        }
      }, 1000);
    }
  };

  // 角色选择逻辑
  setBrawlerTurn(1);
  document.querySelectorAll('#mapScreen .arena-list').forEach((list, idx) => {
    list.querySelectorAll('.char-option').forEach(btn => {
      btn.onclick = () => {
        if ((brawlerTurn === 1 && idx === 0) || (brawlerTurn === 2 && idx === 1)) {
          const char = btn.getAttribute('data-char');
          const desc = charDescriptions[char];
          $('brawlerModalContent').innerHTML = desc;
          $('brawlerModal').style.display = 'block';
          $('brawlerConfirm').setAttribute('data-char', char);
          $('brawlerConfirm').setAttribute('data-turn', brawlerTurn);
        }
      };
    });
  });
  $('brawlerCancel').onclick = () => {
    $('brawlerModal').style.display = 'none';
  };
  $('brawlerConfirm').onclick = function() {
    const char = this.getAttribute('data-char');
    const turn = Number(this.getAttribute('data-turn'));
    $('brawlerModal').style.display = 'none';
    if (turn === 1) {
      pickedBrawler1 = char;
      dunePlayer1.maxHealth = dunePlayer1.health = getBrawlerHealth(char);
      setBrawlerTurn(2);
    } else {
      pickedBrawler2 = char;
      dunePlayer2.maxHealth = dunePlayer2.health = getBrawlerHealth(char);
      showDuneBlankIfNeeded();
    }
  };

  // Dune Cyclone blank 页面和玩法
  setupDuneBlank();
}

// ====== 角色选择轮次控制 ======
function setBrawlerTurn(turn) {
  brawlerTurn = turn;
  const leftCol = document.querySelector('#mapScreen > div:nth-of-type(3)');
  const rightCol = document.querySelector('#mapScreen > div:nth-of-type(4)');
  if (turn === 1) {
    leftCol.style.pointerEvents = '';
    leftCol.style.opacity = '1';
    rightCol.style.pointerEvents = 'none';
    rightCol.style.opacity = '0.5';
  } else {
    leftCol.style.pointerEvents = 'none';
    leftCol.style.opacity = '0.5';
    rightCol.style.pointerEvents = '';
    rightCol.style.opacity = '1';
  }
}

// ====== Dune Cyclone blank 页面和玩法 ======
// 生成两个不同的颜色
function getTwoDistinctColors() {
  const idx1 = Math.floor(Math.random() * playerColors.length);
  let idx2 = Math.floor(Math.random() * playerColors.length);
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * playerColors.length);
  }
  return [playerColors[idx1], playerColors[idx2]];
}
const [color1, color2] = getTwoDistinctColors();
let dunePlayer1 = {
  x: 250, y: 350, vx: 0, vy: 0, facing: 'right', onGround: false, health: 1700, maxHealth: 1700, color: color1
};
let dunePlayer2 = {
  x: 750, y: 370, vx: 0, vy: 0, facing: 'right', onGround: false, health: 1700, maxHealth: 1700, color: color2
};

function setupDuneBlank() {
  // 创建 blank 页面
  const duneBlank = document.createElement('div');
  duneBlank.id = 'duneBlank';
  duneBlank.style.display = 'none';
  duneBlank.style.position = 'fixed';
  duneBlank.style.top = '0';
  duneBlank.style.left = '0';
  duneBlank.style.width = '100vw';
  duneBlank.style.height = '100vh';
  duneBlank.style.background = 'linear-gradient(270deg, #ff5f6d, #ffc371, #47e7fa, #7bffb2, #f7baff, #ff5f6d)';
  duneBlank.style.backgroundSize = '1200% 1200%';
  duneBlank.style.animation = 'rainbowBG 8s ease infinite';
  duneBlank.style.zIndex = '9999';
  document.body.appendChild(duneBlank);
}

function showDuneBlankIfNeeded() {
  if (_player1Map && _player2Map) {
    let chosenMap = _player1Map;
    if (_player1Map !== _player2Map) {
      chosenMap = Math.random() < 0.5 ? _player1Map : _player2Map;
    }
    if (chosenMap === 'dune') {
      $('mapScreen').style.display = 'none';
      $('duneBlank').style.display = 'block';
      // 启动 Dune Cyclone 玩法
      startDuneCyclone(dunePlayer1, dunePlayer2);
    }
  }
}

// ====== 启动 ======
document.addEventListener('DOMContentLoaded', init); 