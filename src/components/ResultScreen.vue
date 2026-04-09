<script setup lang="ts" vapor>
import { computed } from "vue"

const props = defineProps<{
  score: number
  maxCombo: number
}>()

const emit = defineEmits<{
  restart: []
  "show-knowledge": []
}>()

const displayScore = computed(() => props.score * 1000)

const scoreColorClass = computed(() => {
  const digits = String(props.score).length
  if (digits <= 1) return "text-red-400"
  if (digits === 2) return "text-yellow-500"
  if (digits === 3) return "text-blue-400"
  return "text-green-400"
})

const message = computed(() => {
  const digits = String(props.score).length
  if (digits <= 1) return "不要气馁，继续努力!"
  if (digits === 2) return "坚持就是胜利!"
  if (digits === 3) return "离消灭病毒只剩一点点了!"
  return "病毒已经消灭，感谢您为消灭病毒做出的努力!"
})
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
    <div class="bg-[#1a1a2e] rounded-2xl p-8 text-center max-w-[90%] w-[320px] shadow-2xl">
      <div class="text-white/70 text-sm mb-2">您获得了</div>
      <div class="text-5xl font-bold leading-tight" :class="scoreColorClass">
        {{ displayScore }}
      </div>
      <div class="text-white/60 text-base mb-4">分</div>
      <div class="text-white/85 text-sm mb-4">{{ message }}</div>
      <div v-if="maxCombo >= 3" class="text-yellow-500 text-xs mb-5">最高连杀: {{ maxCombo }}</div>
      <button
        class="w-full py-3.5 border-none rounded-lg text-base font-semibold cursor-pointer transition-transform duration-100 active:scale-[0.98] bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:opacity-90"
        @click="emit('restart')"
      >
        继续消灭
      </button>
    </div>
  </div>
</template>
