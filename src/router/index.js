import { createRouter, createWebHistory } from 'vue-router'
import HubView from '../views/HubView.vue'
import EditorView from '../views/EditorView.vue'
import OutlineLabView from '../views/OutlineLabView.vue'
import PreEditorReadingView from '../preEditor/views/PreEditorReadingView.vue'
import ArticleGuidanceSetupView from '../preEditor/views/ArticleGuidanceSetupView.vue'

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
      component: PreEditorReadingView,
    },
    {
      path: '/article-guidance',
      name: 'article-guidance',
      component: ArticleGuidanceSetupView,
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
