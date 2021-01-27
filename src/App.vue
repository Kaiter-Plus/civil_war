<template>
  <el-row id="app" class="app">
    <el-col class="container" :span="24" :lg="{span: 8, offset: 8}">
      <router-view />
    </el-col>
    <el-col class="background-container" :span="24" :lg="{span: 8, offset: 8}">
      <back-ground />
    </el-col>
  </el-row>
</template>

<script>
  import BackGround from 'views/BackGround'
  import MainView from 'views/MainView'

  export default {
    name: 'app',
    components: {
      BackGround,
      MainView
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
      border: 0.3125rem solid #f0f0f0;
      overflow: hidden;
    }
  }
</style>
