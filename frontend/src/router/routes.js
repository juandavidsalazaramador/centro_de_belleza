
const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/pages/IndexPage.vue'),
      },
      {
        path: 'second',
        component: () => import('@/pages/SecondPage.vue'),
      },
      {
        path: 'admin/login',
        component: () => import('@/pages/AdminLoginPage.vue'),
      },
      {
        path: 'admin',
        component: () => import('@/pages/AdminDashboardPage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes