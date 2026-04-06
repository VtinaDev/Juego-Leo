import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authStore'

import Home from '../views/Home.vue'
import AboutGame from '../views/AboutGame.vue'
import Congrats from '../views/Congrats.vue'
import Game from '../views/Game.vue'
import MapView from '../views/MapView.vue'
import Profile from '../views/Profile.vue'
import Subscribe from '../views/Subscribe.vue'
import AiLab from '../views/AiLab.vue'
import BatchViewer from '../views/BatchViewer.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/aboutgame', name: 'AboutGame', component: AboutGame },
    { path: '/congrats', name: 'Congrats', component: Congrats },
    { path: '/game/:levelId/:stageId',name: 'game',component: Game, meta: { requiresAuth: true } },
    { path: '/mapview', name: 'MapView', component: MapView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'Profile', component: Profile },
    { path: '/subscribe', name: 'Subscribe', component: Subscribe },
    { path: '/ai-lab', name: 'AiLab', component: AiLab },
    { path: '/batch-viewer', name: 'batch-viewer', component: BatchViewer },

  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (!to.meta?.requiresAuth) return true

  const auth = useAuthStore()
  auth.load()

  if (auth.isAuthenticated) return true

  return {
    name: 'Profile',
    query: {
      loginRequired: '1',
      redirect: to.fullPath
    }
  }
})

export default router
