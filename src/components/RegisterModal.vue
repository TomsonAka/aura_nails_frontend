<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import axios from "axios";

const formData = reactive({
  email: "",
  username: "",
  password: "",
});

const emit = defineEmits(['close', 'switch-to-login'])

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
  axios.post('http://localhost:8080/auth/signup', formData)
};
</script>

<template>
  <div
    class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
    @click="closeOnOverlay"
  >
    <div
      class="modal-content-animated bg-white rounded-xl sm:rounded-2xl w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative mx-auto my-auto"
    >
      <div class="relative flex items-center justify-center p-4 sm:p-8 pb-0 sm:pb-0">
        <h2 class="text-xl sm:text-2xl font-bold">Зарегистрироваться</h2>

        <button
          @click="emit('close')"
          class="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-4 sm:p-8 pt-4 sm:pt-6">
        <form @submit.prevent="register" class="flex flex-col gap-3 sm:gap-4">

          <div>
            <label
              for="username"
              class="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
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
              class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-shadow"
            >
          </div>

          <div>
            <label
              for="email"
              class="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Введите email"
              v-model="formData.email"
              required
              autocomplete="email"
              class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label
              for="password"
              class="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2"
            >
              Пароль
            </label>
            <input
              type="password"
              id="password"
              placeholder="Введите пароль"
              v-model="formData.password"
              required
              autocomplete="new-password"
              class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-shadow"
            />
          </div>

          <div class="flex items-center justify-center p-0 sm:p-0 mt-2 sm:mt-4">
            <button
              type="submit"
              class="w-full bg-rose-300 hover:bg-rose-400 active:bg-rose-500 active:translate-y-0.5 text-white font-medium py-3 sm:py-3.5 px-4 rounded-xl transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-white text-sm sm:text-base shadow-md hover:shadow-lg active:shadow-sm"
            >
              Зарегистрироваться
            </button>
          </div>

          <div class="mt-2 sm:mt-4 text-center">
            <p class="text-gray-600 text-xs sm:text-sm">
              Уже есть аккаунт?
              <button
                type="button"
                class="text-rose-400 hover:text-rose-600 font-medium transition-colors"
                @click="emit('switch-to-login')"
              >
                Войти
              </button>
            </p>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>
