import Vue from 'vue'
import VueRouter from 'vue-router'

import MainView from 'views/MainView'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'MainView',
    component: MainView
  },
  {
    path: '/gameview',
    name: 'GameView',
    component: function() {
      return import(/* webpackChunkName: "gameview" */ 'views/GameView')
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
