<template>
  <el-row id="app" class="app">
    <!-- begin:主容器开始 -->
    <el-col class="container" :span="24" :lg="{span: 8, offset: 8}">
      <router-view :data="data" />
    </el-col>
    <!-- end:主容器结束 -->
    <!-- begin:游戏背景容器 -->
    <el-col class="background-container" :span="24" :lg="{span: 8, offset: 8}">
      <back-ground />
    </el-col>
    <!-- end:游戏背景容器 -->
  </el-row>
</template>

<script>
  // 导入数据请求接口
  import { request } from 'network'

  // 导入组件
  import BackGround from 'views/BackGround'

  export default {
    name: 'app',
    data() {
      return {
        data: null
      }
    },
    created() {
      // 获取数据
      const url = '/data.json'
      request(url).then(res => {
        this.data = res
      }).catch(e => {
        console.log(e)
      })

    },
    components: {
      BackGround
    }
  }
</script>

<style lang="less">
  #app {
    font-family: 'microsoft yahei', 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    position: absolute;
    height: 100%;
    width: 100%;
    .background-container,
    .container {
      height: 100%;
    }
    .background-container {
      position: absolute;
      z-index: -2;
    }
    .container {
      @media screen and (min-width: 1200px) {
        border: 0.0625rem solid #f0f0f0;
      }
      overflow: hidden;
    }
    .el-dialog {
      @media screen and (min-width: 1200px) {
        width: 30% !important;
      }
    }
    .el-alert {
      margin: 5px 0;
    }
  }
</style>
