<template>
  <el-main class="button-group">
    <el-button type="success" round>开始游戏</el-button>
    <el-button type="primary" round>查看规则</el-button>
    <el-button type="warning" round>防疫小知识</el-button>
    <el-button type="danger" round>谣言我先知</el-button>
  </el-main>

</template>

<script>
  export default {
    name: 'ButtonGroup'
  }
</script>

<style scoped lang="less">
  .button-group {
    display: flex;
    flex-direction: column;
    margin-top: 15%;
    .el-button {
      margin: 10px 25%;
    }
  }
</style>
