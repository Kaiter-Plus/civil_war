<script setup lang="ts" vapor>
const props = defineProps<{
  title: string
  content: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
    @click.self="emit('close')"
  >
    <div
      class="bg-[#1a1a2e] rounded-xl max-w-[90%] max-h-[80%] w-[400px] overflow-hidden shadow-2xl"
    >
      <!-- Header -->
      <div class="flex justify-between items-center p-4 px-5 border-b border-white/10">
        <h5 class="m-0 text-white text-lg">{{ title }}</h5>
        <button
          class="bg-none border-none text-white/60 text-2xl cursor-pointer leading-none hover:text-white"
          @click="emit('close')"
          aria-label="关闭"
        >
          &times;
        </button>
      </div>

      <!-- Body -->
      <div
        class="p-5 text-white/85 text-sm leading-relaxed max-h-[50vh] overflow-y-auto whitespace-pre-wrap"
        v-html="content"
      ></div>

      <!-- Footer -->
      <div class="p-4 px-5 border-t border-white/10 text-center">
        <button
          class="py-2.5 px-8 border-none rounded-md text-sm font-medium cursor-pointer bg-green-600 text-white hover:bg-green-700 transition-colors"
          @click="emit('close')"
        >
          我知道了
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* v-html 内容的深度样式 - 必须保留，无法用 Tailwind 类 */
:deep(.rumor) {
  color: #f87171;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 6px;
}

:deep(.truth) {
  color: #4ade80;
  padding: 10px;
  background: rgba(74, 222, 128, 0.1);
  border-radius: 6px;
}

:deep(.leaderboard-tabs) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.lb-section) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.lb-title) {
  color: #fff;
  font-weight: 600;
  padding: 10px 12px;
  text-align: center;
  background: rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.lb-empty) {
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  font-size: 12px;
  padding: 16px;
}

:deep(.lb-list) {
  font-size: 13px;
}

:deep(.lb-row) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.lb-row:last-child) {
  border-bottom: none;
}

:deep(.lb-rank) {
  width: 28px;
  font-size: 14px;
}

:deep(.lb-score) {
  flex: 1;
  text-align: center;
  color: #fbbf24;
  font-weight: 600;
}

:deep(.lb-date) {
  width: 70px;
  text-align: right;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
}
</style>
