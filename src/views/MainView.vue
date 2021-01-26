<template>
  <el-container class="main-view">
    <game-logo :url="logoSrc" />
    <button-group />
  </el-container>
</template>

<script>
  import GameLogo from 'components/mainview/GameLogo'
  import ButtonGroup from 'components/mainview/ButtonGroup'

  export default {
    name: 'MainView',
    data() {
      return {
        logoSrc: 'img/logo.png'
      }
    },
    components: {
      GameLogo,
      ButtonGroup
    }
  }
</script>

<style lang="less" scoped>
  .main-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
</style>