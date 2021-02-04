<template>
  <el-container class="main-view">

    <!-- 游戏logo -->
    <game-logo />

    <!-- 游戏按钮 -->
    <button-group :buttonGroup="buttonGroup" @showDialog="showDialog" />

    <!-- begin:游戏规则 -->
    <el-dialog class="rules-dialog" title="游戏规则" :visible.sync="show.rules" width="90%">
      <el-alert v-for="(rule, index) in data.rules" :title="rule" :type="alertType[index]" :closable="false"
        :key="rule" />
      <span slot="footer">
        <el-button type="primary" @click="show.rules = false">我知道了</el-button>
      </span>
    </el-dialog>
    <!-- end:游戏规则 -->

    <!-- begin:防疫小知识-->
    <el-dialog class="knowledge-dialog" title="防疫小知识" :visible.sync="show.knowledge" width="90%">
      <el-alert :title="getKnowledgeItem()" type="success" :closable="false" />
      <span slot="footer">
        <el-button type="primary" @click="show.knowledge = false">我知道了</el-button>
      </span>
    </el-dialog>
    <!-- end:防疫小知识 -->

    <!-- begin:谣言我先知-->
    <el-dialog class="rumors-dialog" title="谣言我先知" :visible.sync="show.rumor" width="90%">
      <el-alert v-for="(rumor, index) in getrumor()" :title="rumor" :type="alertType[index]" :closable="false"
        :key="rumor" />
      <span slot="footer">
        <el-button type="primary" @click="show.rumor = false">我知道了</el-button>
      </span>
    </el-dialog>
    <!-- end:谣言我先知 -->

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
          { id: 0, type: 'success', text: '开始游戏' },
          { id: 1, type: 'primary', text: '查看规则' },
          { id: 2, type: 'warning', text: '防疫小知识' },
          { id: 3, type: 'danger', text: '谣言我先知' }
        ],
        alertType: ['error', 'success', 'warning', 'info'],
        show: {
          rules: false,
          knowledge: false,
          rumor: false
        }
      }
    },
    props: {
      data: Object
    },
    methods: {
      // 展示信息框
      showDialog(id) {
        switch (id) {
          case 0:
            this.$router.push('/gameview')
            break
          case 1:
            this.show.rules = true
            break
          case 2:
            this.show.knowledge = true
            break
          case 3:
            this.show.rumor = true
            break
          default:
            break
        }
      },
      // 获取一个防疫小知识
      getKnowledgeItem() {
        return this.data.knowledge[this.randomIndex(this.data.knowledge.length)]
      },
      // 获取一个谣言
      getrumor() {
        return this.data.rumors[this.randomIndex(this.data.rumors.length)]
      },
      // 产生随机数
      randomIndex(end, start = 0) {
        const length = Math.abs(start - end)
        const index = Math.floor(Math.random() * length) + Math.min(start, end)
        return index
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