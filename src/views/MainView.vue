<template>
  <el-container class="main-view">
    <game-logo />
    <button-group />
  </el-container>
</template>

<script>
  import GameLogo from 'components/content/mainview/GameLogo'
  import ButtonGroup from 'components/content/mainview/ButtonGroup'

  export default {
    name: 'MainView',
    props: {
      knowledge: Array,
      rules: Array,
      rumors: Array
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