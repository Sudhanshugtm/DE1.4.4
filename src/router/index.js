import { createRouter, createWebHistory } from 'vue-router'
import HubView from '../views/HubView.vue'
import EditorView from '../views/EditorView.vue'
import OutlineLabView from '../views/OutlineLabView.vue'
import ReadingView from '../views/ReadingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'hub',
      component: HubView,
    },
    {
      path: '/article',
      name: 'article',
      component: ReadingView,
    },
    {
      path: '/editor',
      name: 'editor',
      component: EditorView,
    },
    {
      path: '/outline-lab',
      name: 'outline-lab',
      component: OutlineLabView,
    },
  ],
})

export default router
