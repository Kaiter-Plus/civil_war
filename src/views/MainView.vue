<template>
  <el-container class="main-view">
    <game-logo />
    <button-group :buttonGroup="buttonGroup" @showDialog="showDialog" />
    <Dialog :show="show" :message="message" />
  </el-container>
</template>

<script>
  import GameLogo from 'components/content/mainview/GameLogo'
  import ButtonGroup from 'components/content/mainview/ButtonGroup'
  import Dialog from 'components/common/dialog/Dialog'


  export default {
    name: 'MainView',
    data() {
      return {
        buttonGroup: [
          { type: 'success', text: '开始游戏' },
          { type: 'primary', text: '查看规则' },
          { type: 'warning', text: '防疫小知识' },
          { type: 'danger', text: '谣言我先知' }
        ],
        show: true
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
      },
      // 产生随机数
      randomIndex(start = 0, end) {
        const length = Math.abs(start - end)
        const index = Math.floor(Math.random() * length) + Math.min(start, end)
        return index
      }
    },
    computed: {
      // 需要展示的信息
      message(messages) {
        // return messages[this.randomIndex(0, messages.length)]
        return '11111111111111111111111111'
      }
    },
    components: {
      GameLogo,
      ButtonGroup,
      Dialog
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