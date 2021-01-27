<template>
  <el-container class="main-view">
    <game-logo />
    <button-group :buttonGroup="buttonGroup" @showDialog="showDialog" />
  </el-container>
</template>

<script>
  import GameLogo from 'components/content/mainview/GameLogo'
  import ButtonGroup from 'components/content/mainview/ButtonGroup'

  export default {
    name: 'MainView',
    data() {
      return {
        buttonGroup: [
          { type: 'success', text: '开始游戏' },
          { type: 'primary', text: '查看规则' },
          { type: 'warning', text: '防疫小知识' },
          { type: 'danger', text: '谣言我先知' }
        ]
      }
    },
    props: {
      knowledge: Array,
      rules: Array,
      rumors: Array
    },
    methods: {
      showDialog(payload) {
        console.log(payload.target)
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
