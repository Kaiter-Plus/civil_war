<script setup lang="ts" vapor>
import { ref } from 'vue';
import logoImg from '../assets/img/logo.png';

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
  <div class="flex flex-col items-center justify-center h-full p-5 gap-5">
    <!-- Logo -->
    <div>
      <img 
        :src="logoImg" 
        alt="全民战疫" 
        class="w-[280px] max-w-[80vw] select-none" 
        draggable="false" 
      />
    </div>

    <!-- 难度选择 -->
    <div class="w-4/5 max-w-[320px]">
      <div class="flex w-full gap-0.5">
        <button
          v-for="d in (['easy', 'normal', 'hard'] as const)"
          :key="d"
          type="button"
          class="flex-1 p-2.5 border text-sm cursor-pointer transition-all duration-200"
          :class="difficulty === d 
            ? 'bg-green-600 border-green-600 text-white' 
            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'"
          @click="setDifficulty(d)"
        >
          {{ d === 'easy' ? '简单' : d === 'normal' ? '普通' : '困难' }}
        </button>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="flex flex-col w-4/5 max-w-[320px] gap-2.5">
      <button 
        class="w-full p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-100 hover:opacity-90 active:scale-[0.98] bg-green-600 text-white" 
        @click="emit('start')"
      >
        开始游戏
      </button>
      <button 
        class="w-full p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-100 hover:opacity-90 active:scale-[0.98] bg-blue-600 text-white" 
        @click="emit('show', 'rules')"
      >
        查看规则
      </button>
      <button 
        class="w-full p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-100 hover:opacity-90 active:scale-[0.98] bg-yellow-500 text-black" 
        @click="emit('show', 'knowledge')"
      >
        防疫小知识
      </button>
      <button 
        class="w-full p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-100 hover:opacity-90 active:scale-[0.98] bg-red-600 text-white" 
        @click="emit('show', 'rumors')"
      >
        谣言我先知
      </button>
      <button 
        class="w-full p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-100 hover:opacity-90 active:scale-[0.98] bg-purple-600 text-white" 
        @click="emit('show', 'leaderboard')"
      >
        排行榜
      </button>
    </div>
  </div>
</template>
