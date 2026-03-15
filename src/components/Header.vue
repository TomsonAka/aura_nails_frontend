<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart.js'

const props = defineProps({
  openModal: Function,
  isAuthenticated: Boolean,
  currentUser: String
})

const cartStore = useCartStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['openDrawer', 'logout'])

const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const handleLogout = () => {
  emit('logout')
  userMenuOpen.value = false
  closeMobileMenu()
}

const getInitials = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

const goHome = () => {
  if (route.path === '/') {
    window.location.reload()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <header class="flex flex-col sm:flex-row justify-between rounded-b-xl border-b border-slate-200 px-4 sm:px-6 md:px-7 py-4 sm:py-5 md:py-7 bg-white w-full">

    <div class="flex items-center justify-between">
      <div
        @click="goHome"
        class="flex items-center gap-2 sm:gap-3 md:gap-4 cursor-pointer"
      >
        <img src="/logo-1.png" alt="logo" class="w-8 sm:w-9 md:w-10" />
        <div>
          <h2 class="text-base sm:text-lg md:text-xl font-bold uppercase truncate">AuraNails</h2>
          <p class="text-xs sm:text-sm text-slate-400 truncate">Создаём настроение</p>
        </div>
      </div>

      <button
        @click="toggleMobileMenu"
        class="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <svg
          v-if="!mobileMenuOpen"
          class="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <svg
          v-else
          class="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <ul class="hidden sm:flex items-center justify-around sm:justify-end gap-2 sm:gap-4 md:gap-10 mt-4 sm:mt-0">
      <li
        @click="() => emit('openDrawer')"
        class="flex items-center cursor-pointer gap-1 sm:gap-2 md:gap-3 text-gray-500 hover:text-black text-xs sm:text-sm md:text-base"
      >
        <div class="relative">
          <img src="/cart.svg" alt="cart" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span v-if="cartStore.count > 0"
                class="absolute -top-2 -right-2 bg-rose-400 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {{ cartStore.count }}
          </span>
        </div>
        <span class="whitespace-nowrap">{{ cartStore.totalPrice }} ₽</span>
      </li>

      <li>
        <router-link
          to="/masters"
          class="flex items-center cursor-pointer gap-1 sm:gap-2 md:gap-3 text-gray-500 hover:text-black text-xs sm:text-sm md:text-base"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="hidden sm:inline">Мастера</span>
        </router-link>
      </li>

      <template v-if="!isAuthenticated">
        <li
          @click="props.openModal"
          class="flex items-center cursor-pointer gap-1 sm:gap-2 md:gap-3 text-gray-500 hover:text-black text-xs sm:text-sm md:text-base"
        >
          <img src="/profile.svg" alt="profile" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span class="hidden sm:inline">Профиль</span>
        </li>
      </template>

      <template v-else>
        <li class="relative">
          <button
            @click="toggleUserMenu"
            class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <div class="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {{ getInitials(currentUser) }}
            </div>
            <span class="text-gray-700 text-sm font-medium hidden md:inline">{{ currentUser }}</span>
            <svg
              class="w-4 h-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': userMenuOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div
            v-if="userMenuOpen"
            class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
          >
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm font-semibold text-gray-800">{{ currentUser }}</p>
              <p class="text-xs text-gray-500">Личный кабинет</p>
            </div>

            <a href="/profile" class="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
              <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="text-sm">Профиль</span>
            </a>

            <a href="/orders" class="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
              <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span class="text-sm">Мои заказы</span>
            </a>

            <div class="border-t border-gray-100 mt-2 pt-2">
              <button
                @click="handleLogout"
                class="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                <span class="text-sm font-medium">Выйти</span>
              </button>
            </div>
          </div>
        </li>
      </template>
    </ul>

    <div
      v-if="mobileMenuOpen"
      class="sm:hidden mt-3 pb-3 border-t border-gray-100 pt-3"
    >
      <ul class="flex flex-col gap-1.5">
        <template v-if="isAuthenticated">
          <li class="bg-gray-50 rounded-xl p-3">
            <router-link
              to="/profile"
              @click="closeMobileMenu"
              class="flex items-center gap-3 pb-3 border-b border-gray-200"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {{ getInitials(currentUser) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">{{ currentUser }}</p>
                <p class="text-xs text-gray-500">Личный кабинет</p>
              </div>
              <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </router-link>

            <button
              @click="handleLogout"
              class="flex items-center justify-center gap-1.5 mt-3 w-full py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>Выйти</span>
            </button>
          </li>
        </template>

        <li
          @click="() => { emit('openDrawer'); closeMobileMenu() }"
          class="flex items-center gap-2 py-2 px-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          <img src="/cart.svg" alt="cart" class="w-4 h-4" />
          <span class="text-sm">Корзина ({{ cartStore.totalPrice }} ₽)</span>
        </li>

        <li>
          <router-link
            to="/masters"
            @click="closeMobileMenu"
            class="flex items-center gap-2 py-2 px-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="text-sm">Мастера</span>
          </router-link>
        </li>

        <li>
          <router-link
            to="/orders"
            @click="closeMobileMenu"
            class="flex items-center gap-2 py-2 px-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <img src="/heart.svg" alt="heart" class="w-4 h-4" />
            <span class="text-sm">Заказы</span>
          </router-link>
        </li>

        <template v-if="!isAuthenticated">
          <li
            @click="() => { props.openModal(); closeMobileMenu() }"
            class="flex items-center gap-2 py-2 px-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <img src="/profile.svg" alt="profile" class="w-4 h-4" />
            <span class="text-sm">Профиль</span>
          </li>
        </template>
      </ul>
    </div>
  </header>
</template>
