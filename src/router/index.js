import { createRouter, createWebHistory } from 'vue-router'
import CatalogView from '../views/CatalogView.vue'
import Order from '../components/Order.vue'
import ProfileView from '@/views/ProfileView.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'



const routes = [
  {
    path: '/',
    name: 'Cart',
    component: CatalogView
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Order
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/masters',
    name: 'Masters',
    component: () => import('@/views/MastersView.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, isAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


export default router
