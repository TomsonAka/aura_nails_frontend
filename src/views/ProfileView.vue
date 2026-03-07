<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = ref({
  username: '',
  phone: ''
})

const originalUser = ref({})
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const successMessage = ref('')

const formatPhone = (value) => {
  if (!value) return ''

  let cleaned = value.replace(/\D/g, '')

  if (cleaned.startsWith('8')) {
    cleaned = cleaned.slice(1)
  } else if (cleaned.startsWith('7')) {
    cleaned = cleaned.slice(1)
  }

  cleaned = cleaned.slice(0, 10)

  if (cleaned.length === 0) return ''

  if (cleaned.length <= 3) {
    return `+7 (${cleaned}`
  } else if (cleaned.length <= 6) {
    return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
  } else if (cleaned.length <= 8) {
    return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else {
    return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`
  }
}

const handlePhoneInput = (e) => {
  const value = e.target.value
  user.value.phone = formatPhone(value)
}

const fetchUser = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/user/me')
    const userData = response.data

    user.value.username = userData.username || ''

    if (userData.phone) {
      user.value.phone = formatPhone(userData.phone)
    } else {
      user.value.phone = ''
    }

    originalUser.value = { ...user.value }
  } catch (err) {
    error.value = 'Не удалось загрузить данные профиля'
    if (err.response?.status === 401) {
      router.push('/')
    }
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  error.value = ''
  successMessage.value = ''

  if (!user.value.username.trim()) {
    error.value = 'Имя обязательно для заполнения'
    return
  }

  saving.value = true
  try {
    const digits = user.value.phone.replace(/\D/g, '')
    const phoneToSend = digits.length === 11 ? digits : (digits.length === 10 ? '7' + digits : '')

    const response = await api.put('/api/user/me', {
      username: user.value.username,
      phone: phoneToSend
    })

    successMessage.value = response.data.message || 'Профиль обновлён'
    originalUser.value = { ...user.value }

    localStorage.setItem('username', user.value.username)
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка при обновлении профиля'
  } finally {
    saving.value = false
  }
}

const hasChanges = () => {
  return user.value.username !== originalUser.value.username ||
    user.value.phone !== originalUser.value.phone
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-2xl mx-auto">

      <div class="mb-8 ">
        <h1 class="text-3xl font-bold text-gray-900">Личный кабинет</h1>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
        {{ error }}
      </div>

      <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
        {{ successMessage }}
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400"></div>
        </div>

        <form v-else @submit.prevent="updateProfile" class="space-y-6">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {{ user.username ? user.username.charAt(0).toUpperCase() : 'U' }}
            </div>
            <div>
              <p class="text-sm text-gray-500">Пользователь</p>
              <p class="font-semibold text-gray-900">{{ user.username || 'Пользователь' }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Имя <span class="text-red-500">*</span>
            </label>
            <input
              v-model="user.username"
              type="text"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
              placeholder="Введите ваше имя"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Номер телефона
            </label>
            <input
              :value="user.phone"
              @input="handlePhoneInput"
              type="tel"
              inputmode="tel"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
              placeholder="+7 (999) 999-99-99"
            />
            <p class="text-xs text-gray-500 mt-1">Используется для уведомлений</p>
          </div>

          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="!hasChanges() || saving"
              class="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-rose-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
            </button>
          </div>
        </form>
      </div>

      <div class="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Быстрые ссылки</h3>
        <div class="space-y-3">
          <router-link to="/orders" class="flex items-center gap-3 text-gray-600 hover:text-rose-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            История заказов
          </router-link>

          <button @click="router.push('/')" class="flex items-center gap-3 text-gray-600 hover:text-rose-500 transition-colors w-full">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            На главную
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
