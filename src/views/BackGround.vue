<template>
  <div class="background"></div>
</template>

<script>
  export default {
    name: 'BackGround'
  }
</script>

<style lang="less" scoped>
  @background-url: '/img/bg.jpeg';
  .background {
    height: 100%;
    width: 100%;
    background: url(@background-url) no-repeat 0 0;
    background-size: cover;
    filter: blur(15px) grayscale(0.3);
  }
</style>