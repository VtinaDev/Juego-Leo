import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import AboutGame from '../views/AboutGame.vue'
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
    { path: '/aboutgame', name: 'AboutGame', component: AboutGame },
    { path: '/congrats', name: 'Congrats', component: Congrats },
    { path: '/levels', name: 'Levels', component: Levels },
    { path: '/game/:levelId/:stageId',name: 'game',component: Game },
    { path: '/mapview', name: 'MapView', component: MapView },
    { path: '/profile', name: 'Profile', component: Profile },
    { path: '/subscribe', name: 'Subscribe', component: Subscribe },

  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
