<template>
  <el-header class="game-logo"></el-header>
</template>

<script>
  export default {
    name: 'GameLogo'
  }
</script>

<style lang="less" scoped>
  @game-logo: '/img/logo.png';
  .game-logo {
    background: url(@game-logo) no-repeat 0 0;
    background-size: cover;
    margin-top: 20%;
    padding-bottom: 30.354%;
  }
</style>