<script setup lang="ts" vapor>
import { ref } from 'vue';
import logoImg from '../assets/img/logo.png';
import { images } from '../game/config';

type Difficulty = 'easy' | 'normal' | 'hard';

const props = defineProps<{
  difficulty: Difficulty;
}>();

const emit = defineEmits<{
  'update:difficulty': [value: Difficulty];
  'start': [];
  'show': [type: 'rules' | 'knowledge' | 'rumors' | 'leaderboard'];
}>();

const difficulty = ref<Difficulty>(props.difficulty);

function setDifficulty(d: Difficulty) {
  difficulty.value = d;
  emit('update:difficulty', d);
}
</script>

<template>
  <div class="menu-screen">
    <!-- Logo -->
    <div class="title">
      <div class="logo">
        <img :src="logoImg" alt="全民战疫" class="img-fluid" draggable="false" />
      </div>
    </div>

    <!-- 难度选择 -->
    <div class="difficulty-group">
      <div class="btn-group">
        <button
          v-for="d in (['easy', 'normal', 'hard'] as const)"
          :key="d"
          type="button"
          class="diff-btn"
          :class="{ 'active-selected': difficulty === d }"
          @click="setDifficulty(d)"
        >
          {{ d === 'easy' ? '简单' : d === 'normal' ? '普通' : '困难' }}
        </button>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="button-group">
      <button class="btn btn-success" @click="emit('start')">开始游戏</button>
      <button class="btn btn-primary" @click="emit('show', 'rules')">查看规则</button>
      <button class="btn btn-warning" @click="emit('show', 'knowledge')">防疫小知识</button>
      <button class="btn btn-danger" @click="emit('show', 'rumors')">谣言我先知</button>
      <button class="btn btn-leaderboard" @click="emit('show', 'leaderboard')">排行榜</button>
    </div>
  </div>
</template>

<style scoped>
.menu-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  gap: 20px;
}

.title .logo img {
  width: 280px;
  max-width: 80vw;
  user-select: none;
}

.difficulty-group {
  width: 80%;
  max-width: 320px;
}

.btn-group {
  display: flex;
  width: 100%;
  gap: 2px;
}

.diff-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.1);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.diff-btn:hover {
  background: rgba(255,255,255,0.2);
}

.diff-btn.active-selected {
  background: #198754;
  border-color: #198754;
}

.button-group {
  display: flex;
  flex-direction: column;
  width: 80%;
  max-width: 320px;
  gap: 10px;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn:active {
  transform: scale(0.98);
}

.btn-success { background: #198754; color: #fff; }
.btn-primary { background: #0d6efd; color: #fff; }
.btn-warning { background: #ffc107; color: #000; }
.btn-danger { background: #dc3545; color: #fff; }
.btn-leaderboard { background: #6f42c1; color: #fff; }
</style>
