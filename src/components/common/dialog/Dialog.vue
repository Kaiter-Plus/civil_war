<template>
  <el-dialog class="dialog" title="321" :visible.sync="show" width="90%">
    <span>{{ message }}</span>
    <span slot="footer">
      <el-button type="primary" @click="show = false">我知道了</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    props: {
      show: Boolean,
      message: String
    }
  }
</script>