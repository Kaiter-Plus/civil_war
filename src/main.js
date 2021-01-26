import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = true

new Vue({
  router,
  render: function(h) {
    return h(App)
  }
}).$mount('#app')
