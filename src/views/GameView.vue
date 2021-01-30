<template>
  <div class="game-view">
    {{knowledge}}
  </div>
</template>

<script>
  export default {
    name: 'GameView',
    props: {
      knowledge: Array
    },
    created() {
      console.log(this.knowledge)
    }
  }
</script>