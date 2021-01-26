<template>
  <el-row class="background"></el-row>
</template>

<script>
  export default {
    name: 'BackGround'
  }
</script>

<style lang="less" scoped>
  @background-url: '/img/bg.jpeg';
  .background {
    z-index: -2;
    position: absolute;
    width: 100%;
    height: 100%;
    background: url(@background-url) no-repeat 0 0;
    background-size: cover;
    filter: blur(20px);
  }
</style>