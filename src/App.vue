<script setup>
import { onMounted, provide, ref } from 'vue'
import axios from 'axios'

import Header from './components/Header.vue'
import CardList from './components/CardList.vue'
import Drawer from './components/Drawer.vue'
import ProfileSignin from './components/ProfileSignin.vue'
import Profile from './components/Profile.vue'

const items = ref([])
const drawerOpen = ref(false)
const showModal = ref(false)
const currentModal = ref('login')

const closeDrawer = () => {
  drawerOpen.value = false
}
const openDrawer = () => {
  drawerOpen.value = true
}

const closeModal = () => {
  showModal.value = false
}

const openModal = () => {
  showModal.value = true
  currentModal.value = 'login'
}

const switchToRegister = () => {
  currentModal.value = 'register'
}

const switchToLogin = () => {
  currentModal.value = 'login'
}

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/api/products')
    items.value = data
  } catch (err) {
    console.log(err)
  }
})

provide('cartActions', {
  closeDrawer,
  openDrawer,
})
</script>

<template>
  <Drawer v-if="drawerOpen" @close="closeDrawer" />

  <ProfileSignin
    v-if="showModal && currentModal === 'login'"
    @close="closeModal"
    @switch-to-register="switchToRegister"
  />

  <Profile
    v-if="showModal && currentModal === 'register'"
    @close="closeModal"
    @switch-to-login="switchToLogin"
  />

  <div class="bg-white w-4/5 m-auto rounded-xl shadow-xl mt-14">
    <Header @open-drawer="openDrawer" :open-modal="openModal" />

    <div class="p-10">
      <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold mb-8">Каталог</h2>

        <div class="flex gap-4">
          <select class="py-2 px-3 border rounded-md outline-none">
            <option>По названию</option>
            <option>По цене</option>
          </select>
          <div class="relative">
            <img class="absolute left-4 top-3" src="/search.svg" />
            <input
              class="border rounded-md py-2 pl-11 pr-4 outline-none hover:border-gray-400 focus:border-gray-400"
              placeholder="Поиск"
            />
          </div>
        </div>
      </div>

      <div class="mt-10">
        <CardList :items="items" />
      </div>
    </div>
  </div>
</template>
