import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL1),
  routes: [
    // ℹ️ We are redirecting to different pages based on role.
    // NOTE: Role is just for UI purposes. ACL is based on abilities.
    {
      path: '/',
      redirect: to => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        const userRole = (userData && userData.role) ? userData.role : null
        console.log( userRole, "userRole");
        if (userRole === 'admin')
          return { name: 'apps-user-list' }
        if (userRole === 'client')
          return { name: 'access-control' }
        
        return { name: 'apps-user-list', query: to.query }
      },
    },
    {
      path: '/pages/user-profile',
      redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
    },
    {
      path: '/pages/account-settings',
      redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
    },
    {
      path: '/apps/project/new-project-id',
      redirect: () => ({ name: 'apps-project-new-project-id', params: { id: "id" } }),
    },
    ...setupLayouts(routes),
  ],
})


router.beforeEach((to, from, next) => {
  const publicPages = ["/login", "/home"];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem("user");
  
  if (authRequired && !loggedIn) {
    next("/login");
  } else {
    next();
  }
});

export default router
