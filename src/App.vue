<template>
  <div id="app" class="app">
    <back-ground />
    <router-view />
  </div>
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
  .app {
    font-family: 'microsoft yahei', 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
