<template>
  <el-main class="button-group">
    <el-button v-for="button in buttonGroup" :type="button.type" round :key="button.text" @click="showDialog"
      :value="button.text">
      {{ button.text }}
    </el-button>
  </el-main>
</template>

<script>
  export default {
    name: 'ButtonGroup',
    props: {
      buttonGroup: Array
    },
    methods: {
      showDialog(e) {
        this.$emit('showDialog', { target: e.target })
      }
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
