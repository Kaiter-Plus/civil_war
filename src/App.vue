<script setup lang="ts" vapor>
import { ref, onMounted, shallowRef } from 'vue';
import MenuScreen from './components/MenuScreen.vue';
import GameCanvas from './components/GameCanvas.vue';
import ResultScreen from './components/ResultScreen.vue';
import Modal from './components/Modal.vue';
import { useGame } from './composables/useGame';

type GameScreen = 'menu' | 'ready' | 'playing' | 'over';

const screen = ref<GameScreen>('menu');
const showModal = ref(false);
const modalTitle = ref('');
const modalContent = ref('');
const selectedDifficulty = ref<'easy' | 'normal' | 'hard'>('normal');

const gameRef = shallowRef<ReturnType<typeof useGame> | null>(null);
const gameCanvasRef = shallowRef<{ canvasRef: HTMLCanvasElement | null } | null>(null);

const finalScore = ref(0);
const maxCombo = ref(0);

function startGame() {
  screen.value = 'ready';
  const canvasEl = gameCanvasRef.value?.canvasRef;
  if (canvasEl && gameRef.value) {
    gameRef.value.beginGame(canvasEl, selectedDifficulty.value);
  }
}

function onGameOver(score: number, combo: number) {
  screen.value = 'over';
  finalScore.value = score;
  maxCombo.value = combo;
}

function restart() {
  screen.value = 'menu';
  finalScore.value = 0;
  maxCombo.value = 0;
}

function showInfo(type: 'rules' | 'knowledge' | 'rumors' | 'leaderboard') {
  const data = gameRef.value?.getData();
  if (!data) return;

  if (type === 'rules') {
    modalTitle.value = '游戏规则';
    modalContent.value = data.rules.join('\n');
  } else if (type === 'knowledge') {
    modalTitle.value = '防疫小知识';
    const idx = Math.floor(Math.random() * data.knowledge.length);
    modalContent.value = data.knowledge[idx];
  } else if (type === 'rumors') {
    modalTitle.value = '谣言我先知';
    const idx = Math.floor(Math.random() * data.rumors.length);
    const [rumor, truth] = data.rumors[idx];
    modalContent.value = `<div class="rumor">${rumor}</div><div class="truth">${truth}</div>`;
  } else if (type === 'leaderboard') {
    modalTitle.value = '排行榜';
    modalContent.value = generateLeaderboardHtml(data.getLeaderboard);
  }
  showModal.value = true;
}

function generateLeaderboardHtml(getLeaderboard: (d: string) => { score: number; date: string }[]) {
  let html = '<div class="leaderboard-tabs">';
  for (const diff of ['easy', 'normal', 'hard'] as const) {
    const label = diff === 'easy' ? '简单' : diff === 'normal' ? '普通' : '困难';
    const scores = getLeaderboard(diff);
    html += `<div class="lb-section"><div class="lb-title">${label}</div>`;
    if (scores.length === 0) {
      html += '<div class="lb-empty">暂无记录</div>';
    } else {
      html += '<div class="lb-list">';
      for (let i = 0; i < scores.length; i++) {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        const date = new Date(scores[i].date).toLocaleDateString('zh-CN');
        html += `<div class="lb-row"><span class="lb-rank">${medal}</span><span class="lb-score">${scores[i].score}</span><span class="lb-date">${date}</span></div>`;
      }
      html += '</div>';
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

onMounted(() => {
  gameRef.value = useGame({
    onGameOver,
    onReady: () => {
      screen.value = 'playing';
    },
  });
});
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <!-- 菜单界面 -->
    <MenuScreen
      v-if="screen === 'menu'"
      :difficulty="selectedDifficulty"
      @update:difficulty="selectedDifficulty = $event"
      @start="startGame"
      @show="showInfo"
    />

    <!-- 游戏界面 -->
    <GameCanvas
      v-show="screen === 'ready' || screen === 'playing'"
      ref="gameCanvasRef"
      :game="gameRef"
      :screen="screen"
    />

    <!-- 结算界面 -->
    <ResultScreen
      v-if="screen === 'over'"
      :score="finalScore"
      :max-combo="maxCombo"
      @restart="restart"
      @show-knowledge="showInfo('knowledge')"
    />

    <!-- 弹窗 -->
    <Modal
      v-if="showModal"
      :title="modalTitle"
      :content="modalContent"
      @close="showModal = false"
    />
  </div>
</template>
