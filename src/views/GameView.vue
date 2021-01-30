<template>
  <div class="game-view">
    {{data.knowledge}}
  </div>
</template>

<script>
  export default {
    name: 'GameView',
    props: {
      data: Object
    }
  }
</script>