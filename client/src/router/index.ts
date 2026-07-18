import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const BASE = 'toscani-tenekeu | Dev Resource Hub'

async function requireAdmin() {
  try {
    const { getAdminSession } = await import('../services/cms')
    const session = await getAdminSession()
    return session.authenticated ? true : { path: '/admin/login' }
  } catch {
    return { path: '/admin/login' }
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: BASE,
        description: 'A curated library of programming books, tutorials, articles, and videos for developers at every level.',
      },
    },
    {
      path: '/books',
      name: 'books',
      component: () => import('../views/BooksView.vue'),
      meta: {
        title: `Programming Books — ${BASE}`,
        description: 'Handpicked programming books covering algorithms, languages, and software craftsmanship.',
      },
    },
    {
      path: '/tutorials',
      name: 'tutorials',
      component: () => import('../views/TutorialsView.vue'),
      meta: {
        title: `Programming Tutorials — ${BASE}`,
        description: 'Step-by-step tutorials for JavaScript, TypeScript, Vue, algorithms, and more.',
      },
    },
    {
      path: '/tutorials/:slug',
      name: 'tutorial-detail',
      component: () => import('../views/TutorialDetailView.vue'),
      meta: {
        title: `Tutorial — ${BASE}`,
        description: 'Learn through structured, step-by-step tutorials.',
      },
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('../views/ArticlesView.vue'),
      meta: {
        title: `Articles — ${BASE}`,
        description: 'In-depth articles on algorithms, frameworks, architecture patterns, and developer tooling.',
      },
    },
    {
      path: '/articles/:slug',
      name: 'article-detail',
      component: () => import('../views/ArticleDetailView.vue'),
      meta: {
        title: `Article — ${BASE}`,
        description: 'Long-form articles and technical notes.',
      },
    },
    {
      path: '/videos',
      name: 'videos',
      component: () => import('../views/VideosView.vue'),
      meta: {
        title: `Video Courses — ${BASE}`,
        description: 'Video tutorials and crash courses on programming languages, algorithms, and web frameworks.',
      },
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsView.vue'),
      meta: {
        title: `Projets — ${BASE}`,
        description: 'Applications et plateformes conçues et développées par Toscani Tenekeu.',
      },
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/AdminLoginView.vue'),
      meta: {
        title: `Admin Login — ${BASE}`,
        description: 'Administration du contenu éditorial.',
      },
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboardView.vue'),
      meta: {
        title: `Admin Dashboard — ${BASE}`,
        description: 'Gestion du contenu éditorial.',
      },
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin/content/new',
      name: 'admin-new-content',
      component: () => import('../views/AdminEditorView.vue'),
      meta: {
        title: `Create Content — ${BASE}`,
        description: 'Créer un article ou un tutoriel.',
      },
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin/content/:id',
      name: 'admin-edit-content',
      component: () => import('../views/AdminEditorView.vue'),
      meta: {
        title: `Edit Content — ${BASE}`,
        description: 'Modifier un article ou un tutoriel.',
      },
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin/comments',
      name: 'admin-comments',
      component: () => import('../views/AdminCommentsView.vue'),
      meta: {
        title: `Comments — ${BASE}`,
        description: 'Modération des commentaires.',
      },
      beforeEnter: requireAdmin,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = to.meta?.title as string | undefined
  const description = to.meta?.description as string | undefined

  document.title = title ?? BASE

  const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (metaDesc && description) metaDesc.content = description

  let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
  if (!ogTitle) {
    ogTitle = document.createElement('meta')
    ogTitle.setAttribute('property', 'og:title')
    document.head.appendChild(ogTitle)
  }
  ogTitle.content = title ?? BASE

  let ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
  if (!ogDesc) {
    ogDesc = document.createElement('meta')
    ogDesc.setAttribute('property', 'og:description')
    document.head.appendChild(ogDesc)
  }
  ogDesc.content = description ?? ''
})

export default router
