<script setup lang="ts" vapor>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  game: any;
  screen: string;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

function handleResize() {
  if (props.game) {
    props.game.resize();
  }
}

function handleMouseMove(e: MouseEvent) {
  if (props.screen !== 'playing' || !props.game) return;
  props.game.handleMove(e.clientX, e.clientY);
}

function handleTouchMove(e: TouchEvent) {
  if (props.screen !== 'playing' || !props.game) return;
  e.preventDefault();
  const touch = e.changedTouches[0];
  props.game.handleMove(touch.clientX, touch.clientY);
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('touchmove', handleTouchMove);
});

// 向父组件暴露 canvasRef
defineExpose({ canvasRef });
</script>

<template>
  <canvas ref="canvasRef" class="game-canvas"></canvas>
</template>

<style scoped>
.game-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>
