<script setup lang="ts" vapor>
import { computed } from 'vue';

const props = defineProps<{
  score: number;
  maxCombo: number;
}>();

const emit = defineEmits<{
  'restart': [];
  'show-knowledge': [];
}>();

const displayScore = computed(() => props.score * 1000);

const resultClass = computed(() => {
  const digits = String(props.score).length;
  if (digits <= 1) return 'alert-danger';
  if (digits === 2) return 'alert-warning';
  if (digits === 3) return 'alert-info';
  return 'alert-success';
});

const message = computed(() => {
  const digits = String(props.score).length;
  if (digits <= 1) return '不要气馁，继续努力!';
  if (digits === 2) return '坚持就是胜利!';
  if (digits === 3) return '离消灭病毒只剩一点点了!';
  return '病毒已经消灭，感谢您为消灭病毒做出的努力!';
});
</script>

<template>
  <div class="result-overlay">
    <div class="result-card" :class="resultClass">
      <div class="result-score-label">您获得了</div>
      <div class="result-score">{{ displayScore }}</div>
      <div class="result-score-unit">分</div>
      <div class="result-message">{{ message }}</div>
      <div v-if="maxCombo >= 3" class="result-combo">最高连杀: {{ maxCombo }}</div>
      <button class="btn btn-lg btn-primary" @click="emit('restart')">继续消灭</button>
    </div>
  </div>
</template>

<style scoped>
.result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.result-card {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 90%;
  width: 320px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}

.alert-danger .result-score { color: #ff6b6b; }
.alert-warning .result-score { color: #ffc107; }
.alert-info .result-score { color: #74c0fc; }
.alert-success .result-score { color: #51cf66; }

.result-score-label {
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  margin-bottom: 8px;
}

.result-score {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
}

.result-score-unit {
  color: rgba(255,255,255,0.6);
  font-size: 16px;
  margin-bottom: 16px;
}

.result-message {
  color: rgba(255,255,255,0.85);
  font-size: 14px;
  margin-bottom: 16px;
}

.result-combo {
  color: #ffc107;
  font-size: 12px;
  margin-bottom: 20px;
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
