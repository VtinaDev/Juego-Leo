import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Congrats from '../views/Congrats.vue'
import Game from '../views/Game.vue'
import Levels from '../views/Levels.vue'
import MapView from '../views/MapView.vue'
import Profile from '../views/Profile.vue'
import Subscribe from '../views/Subscribe.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/congrats', name: 'Congrats', component: Congrats },
    { path: '/game/:level/:stage', name: 'Game', component: Game },
    { path: '/levels', name: 'Levels', component: Levels },
    { path: '/mapview', name: 'MapView', component: MapView },
    { path: '/profile', name: 'Profile', component: Profile },
    { path: '/subscribe', name: 'Subscribe', component: Subscribe },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }

    return { top: 0 }
  },
})

export default router
