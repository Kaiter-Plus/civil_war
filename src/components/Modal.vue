<script setup lang="ts" vapor>
const props = defineProps<{
  title: string;
  content: string;
}>();

const emit = defineEmits<{
  'close': [];
}>();
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h5>{{ title }}</h5>
        <button class="modal-close" @click="emit('close')" aria-label="关闭">&times;</button>
      </div>
      <div class="modal-body" v-html="content"></div>
      <div class="modal-footer">
        <button class="btn btn-success" @click="emit('close')">我知道了</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a2e;
  border-radius: 12px;
  max-width: 90%;
  max-height: 80%;
  width: 400px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.modal-header h5 {
  margin: 0;
  color: #fff;
  font-size: 18px;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  padding: 20px;
  color: rgba(255,255,255,0.85);
  font-size: 14px;
  line-height: 1.6;
  max-height: 50vh;
  overflow-y: auto;
  white-space: pre-wrap;
}

.modal-body :deep(.rumor) {
  color: #ff6b6b;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(255,107,107,0.1);
  border-radius: 6px;
}

.modal-body :deep(.truth) {
  color: #51cf66;
  padding: 10px;
  background: rgba(81,207,102,0.1);
  border-radius: 6px;
}

.modal-body :deep(.leaderboard-tabs) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-body :deep(.lb-section) {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  overflow: hidden;
}

.modal-body :deep(.lb-title) {
  color: #fff;
  font-weight: 600;
  padding: 10px 12px;
  text-align: center;
  background: rgba(255,255,255,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.modal-body :deep(.lb-empty) {
  color: rgba(255,255,255,0.4);
  text-align: center;
  font-size: 12px;
  padding: 16px;
}

.modal-body :deep(.lb-list) {
  font-size: 13px;
}

.modal-body :deep(.lb-row) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.modal-body :deep(.lb-row:last-child) {
  border-bottom: none;
}

.modal-body :deep(.lb-rank) {
  width: 28px;
  font-size: 14px;
}

.modal-body :deep(.lb-score) {
  flex: 1;
  text-align: center;
  color: #ffc107;
  font-weight: 600;
}

.modal-body :deep(.lb-date) {
  width: 70px;
  text-align: right;
  color: rgba(255,255,255,0.4);
  font-size: 11px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  text-align: center;
}

.btn {
  padding: 10px 32px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-success {
  background: #198754;
  color: #fff;
}
</style>
