<template>
  <el-main class="button-group">
    <el-button v-for="button in buttonGroup" :type="button.type" round :key="button">
      {{button.text}}
    </el-button>
  </el-main>

</template>

<script>
  export default {
    name: 'ButtonGroup',
    props: {
      buttonGroup: Array
    }
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
