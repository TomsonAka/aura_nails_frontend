<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const formData = reactive({
  username: '',
  password: '',
})

const emit = defineEmits(['close', 'switch-to-register'])

const closeOnOverlay = (event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const closeOnEsc = (event) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', closeOnEsc)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', closeOnEsc)
  document.body.style.overflow = ''
})

const register = () => {
  console.log('Отправка данных:', formData);
  axios.post('http://localhost:8080/auth/signin', formData)
};


const handleClick = () => {
  console.log('Восстановление пароля...')
}
</script>

<template>
  <div
    class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
    @click="closeOnOverlay"
  >
    <div
      class="modal-content-animated bg-white rounded-xl sm:rounded-2xl w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative"
    >

      <div class="relative flex items-center justify-center p-4 sm:p-8 pb-0 sm:pb-0">
        <h2 class="text-xl sm:text-2xl font-bold">Войти</h2>

      </div>

      <div class="p-4 sm:p-8 pt-4 sm:pt-6">
        <form @submit.prevent="register" class="flex flex-col gap-3 sm:gap-4">

          <div>
            <label
              for="username"
              class="block text-gray-700 text-sm font-medium mb-1 sm:mb-2"
            >
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              placeholder="Введите имя пользователя"
              v-model="formData.username"
              required
              autocomplete="username"
              class="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-shadow"
            >
          </div>

          <div>
            <label
              for="password"
              class="block text-gray-700 text-sm font-medium mb-1 sm:mb-2"
            >
              Пароль
            </label>
            <input
              type="password"
              id="password"
              placeholder="Введите пароль"
              v-model="formData.password"
              required
              autocomplete="current-password"
              class="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-shadow"
            />
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              class="text-slate-800 hover:text-slate-900 text-xs sm:text-sm transition-colors"
              @click="handleClick"
            >
              Забыли пароль?
            </button>
          </div>

          <button
            type="submit"
            class="w-full bg-rose-300 hover:bg-rose-400 active:bg-rose-500 active:translate-y-0.5 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-white text-base sm:text-lg shadow-md hover:shadow-lg active:shadow-sm"
          >
            Войти
          </button>

          <div class="mt-3 sm:mt-4 text-center">
            <p class="text-gray-600 text-xs sm:text-sm">
              Нет аккаунта?
              <button
                type="button"
                class="text-rose-400 hover:text-rose-600 font-medium transition-colors"
                @click="emit('switch-to-register')"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
