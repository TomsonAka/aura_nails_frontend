<script setup>
import { provide, ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import Header from './components/Header.vue'
import Drawer from './components/Drawer.vue'
import ProfileSignin from './components/ProfileSignin.vue'
import RegisterModal from './components/RegisterModal.vue'
import ReviewsCarousel from './views/ReviewsCarousel.vue'
import Footer from './components/Footer.vue'

const route = useRoute()

const drawerOpen = ref(false)
const showModal = ref(false)
const currentModal = ref('login')
const isAuthenticated = ref(false)
const currentUser = ref(null)

const cartStore = useCartStore()

onMounted(() => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  if (token && user) {
    isAuthenticated.value = true
    currentUser.value = user
    cartStore.loadCart()
  }
})

const isAdminPage = computed(() => route.path.startsWith('/admin'))

const closeDrawer = () => { drawerOpen.value = false }
const openDrawer = () => { drawerOpen.value = true }
const closeModal = () => { showModal.value = false }
const openModal = () => { showModal.value = true; currentModal.value = 'login' }
const switchToRegister = () => { currentModal.value = 'register' }
const switchToLogin = () => { currentModal.value = 'login' }

const handleLoginSuccess = (userData) => {
  isAuthenticated.value = true
  currentUser.value = userData.username
  showModal.value = false
  cartStore.loadCart()
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  isAuthenticated.value = false
  currentUser.value = null
  cartStore.items = []
}

provide('cartActions', { closeDrawer, openDrawer })
provide('auth', { isAuthenticated, currentUser, handleLogout })
</script>

<template>
  <Drawer v-if="drawerOpen && !isAdminPage" @close="closeDrawer" />

  <ProfileSignin
    v-if="showModal && currentModal === 'login' && !isAdminPage"
    @close="closeModal"
    @switch-to-register="switchToRegister"
    @login-success="handleLoginSuccess"
  />

  <RegisterModal
    v-if="showModal && currentModal === 'register' && !isAdminPage"
    @close="closeModal"
    @switch-to-login="switchToLogin"
    @login-success="handleLoginSuccess"
  />

  <Header
    v-if="!isAdminPage"
    @open-drawer="openDrawer"
    :open-modal="openModal"
    :is-authenticated="isAuthenticated"
    :current-user="currentUser"
    @logout="handleLogout"
  />

  <router-view />

  <ReviewsCarousel v-if="!isAdminPage" />
  <Footer v-if="!isAdminPage" />
</template>
