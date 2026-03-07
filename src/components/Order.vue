<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()
const currentStep = ref(1)
const totalSteps = 4

const userPhone = ref('')
const userName = ref('')

const form = reactive({
  name: '',
  phone: '',
  time: '',
  paymentMethod: 'later',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: ''
})

const formatPhone = (value) => {
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


const onPhoneInput = (e) => {
  form.phone = formatPhone(e.target.value)
}

onMounted(async () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  if (token) {
    try {
      const response = await fetch('http://localhost:8080/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const userData = await response.json()

        userPhone.value = userData.phone || ''
        userName.value = userData.username || ''

        if (userPhone.value) {
          form.phone = formatPhone(userPhone.value)
        }
        if (userName.value) {
          form.name = userName.value
        }
      }
    } catch (e) {
      console.error('Failed to load user data')
    }
  }
})

const timeSlots = [
  {
    value: 'morning',
    label: 'Утро',
    time: '09:00 - 12:00',
    icon: '🌅',
    color: 'from-amber-400 to-orange-400',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300'
  },
  {
    value: 'day',
    label: 'День',
    time: '12:00 - 18:00',
    icon: '☀️',
    color: 'from-yellow-400 to-orange-400',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300'
  },
  {
    value: 'evening',
    label: 'Вечер',
    time: '18:00 - 21:00',
    icon: '🌙',
    color: 'from-indigo-400 to-purple-400',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300'
  }
]

const validateStep = (step) => {
  switch(step) {
    case 1: {
      const digits = form.phone.replace(/\D/g, '')
      if (form.name.trim().length < 2) {
        alert('Пожалуйста, введите ваше имя')
        return false
      }
      if (digits.length !== 11) {
        alert('Пожалуйста, введите корректный номер телефона')
        return false
      }
      return true
    }
    case 2: {
      if (!form.time) {
        alert('Пожалуйста, выберите время посещения')
        return false
      }
      return true
    }
    case 3: {
      if (form.paymentMethod === 'online') {
        if (!form.cardNumber || !form.cardExpiry || !form.cardCvc) {
          alert('Пожалуйста, заполните все данные карты')
          return false
        }
      }
      return true
    }
    default:
      return true
  }
}

const nextStep = () => {
  if (validateStep(currentStep.value) && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitOrder = async () => {
  if (!validateStep(3)) return

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  try {
    const orderPayload = {
      customerName: form.name,
      customerPhone: form.phone, // ← Отправляем как есть, без обработки
      appointmentTimeSlot: form.time,
      productIds: cartStore.items.map(item => item.product?.id || item.id),
      paymentMethod: form.paymentMethod.toUpperCase()
    }

    console.log('Отправка заказа:', orderPayload)

    const response = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(orderPayload)
    })

    if (response.ok) {
      alert('Заказ успешно оформлен! 🎉')
      cartStore.clearCart()
      router.push('/')
    } else {
      alert('Ошибка: ' + response.status)
    }

  } catch (error) {
    console.error('Ошибка:', error)
    alert('Не удалось оформить заказ')
  }
}

const getStepTitle = (stepNumber) => {
  const titles = {
    1: 'Контактная информация',
    2: 'Выберите время',
    3: 'Способ оплаты',
    4: 'Подтверждение'
  }
  return titles[stepNumber]
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Оформление заказа</h1>
        <p class="text-gray-600">Заполните данные для записи</p>
      </div>

      <div class="bg-white rounded-3xl shadow-xl p-6 mb-6">
        <div class="flex items-center justify-between relative">
          <div class="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>

          <div
            class="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-rose-400 to-pink-500 -translate-y-1/2 rounded-full transition-all duration-500"
            :style="{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }"
          ></div>

          <div
            v-for="step in totalSteps"
            :key="step"
            class="relative z-10 flex flex-col items-center"
          >
            <div
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-lg',
                currentStep >= step
                  ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white scale-110'
                  : 'bg-gray-200 text-gray-500'
              ]"
            >
              <svg
                v-if="currentStep > step"
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
              <span v-else>{{ step }}</span>
            </div>
            <span
              :class="[
                'mt-2 text-xs font-semibold transition-colors duration-300',
                currentStep >= step ? 'text-rose-600' : 'text-gray-400'
              ]"
            >
              {{ getStepTitle(step) }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <transition name="fade" mode="out-in">

          <div v-if="currentStep === 1" key="step1" class="p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Контактная информация</h2>
                <p class="text-gray-500">Шаг 1 из 4</p>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Ваше имя <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Введите имя"
                    class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all outline-none text-lg"
                  />
                  <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Телефон <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    :value="form.phone"
                    @input="onPhoneInput"
                    type="tel"
                    placeholder="+7 (999) 000-00-00"
                    class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all outline-none text-lg"
                  />
                  <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="currentStep === 2" key="step2" class="p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Выберите время посещения</h2>
                <p class="text-gray-500">Шаг 2 из 4</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label
                v-for="slot in timeSlots"
                :key="slot.value"
                class="relative cursor-pointer group"
              >
                <input
                  type="radio"
                  v-model="form.time"
                  :value="slot.value"
                  class="sr-only peer"
                />
                <div
                  :class="[
                    'p-6 rounded-2xl border-3 transition-all duration-300',
                    'hover:shadow-xl hover:-translate-y-2',
                    'peer-checked:ring-4 peer-checked:ring-rose-200 peer-checked:shadow-xl',
                    slot.bgColor,
                    form.time === slot.value ? slot.borderColor : 'border-gray-200'
                  ]"
                >
                  <div class="text-4xl mb-3">{{ slot.icon }}</div>
                  <div class="font-bold text-gray-900 text-lg">{{ slot.label }}</div>
                  <div class="text-gray-600 mt-1">{{ slot.time }}</div>
                </div>
                <div
                  v-if="form.time === slot.value"
                  class="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center shadow-lg"
                >
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </label>
            </div>
          </div>

          <div v-else-if="currentStep === 3" key="step3" class="p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Способ оплаты</h2>
                <p class="text-gray-500">Шаг 3 из 4</p>
              </div>
            </div>

            <div class="space-y-4 mb-6">
              <label class="relative flex items-start p-5 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-rose-300 hover:bg-rose-50/50 transition-all">
                <input
                  type="radio"
                  v-model="form.paymentMethod"
                  value="later"
                  class="mt-1 w-5 h-5 text-rose-500 border-gray-300 focus:ring-rose-500"
                />
                <div class="ml-4 flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-gray-900 text-lg">Оплата после процедуры</span>
                    <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Рекомендуем</span>
                  </div>
                  <p class="text-gray-600 mt-1">Оплачиваете наличными или картой у мастера</p>
                </div>
              </label>

              <label class="relative flex items-start p-5 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-rose-300 hover:bg-rose-50/50 transition-all">
                <input
                  type="radio"
                  v-model="form.paymentMethod"
                  value="online"
                  class="mt-1 w-5 h-5 text-rose-500 border-gray-300 focus:ring-rose-500"
                />
                <div class="ml-4 flex-1">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-gray-900 text-lg">Оплата онлайн сейчас</span>
                    <span class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">Безопасно</span>
                  </div>
                  <p class="text-gray-600 mt-1">Банковской картой через защищенное соединение</p>
                </div>
              </label>
            </div>

            <transition name="slide">
              <div v-if="form.paymentMethod === 'online'" class="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 space-y-4">
                <div class="flex items-center space-x-2 mb-4">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  <span class="font-bold text-gray-700">Данные карты</span>
                </div>

                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Номер карты</label>
                  <input
                    v-model="form.cardNumber"
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Срок</label>
                    <input
                      v-model="form.cardExpiry"
                      type="text"
                      placeholder="MM/YY"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CVC</label>
                    <input
                      v-model="form.cardCvc"
                      type="text"
                      placeholder="123"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <div v-else-if="currentStep === 4" key="step4" class="p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Подтверждение заказа</h2>
                <p class="text-gray-500">Шаг 4 из 4</p>
              </div>
            </div>

            <div class="space-y-6">
              <div class="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border-2 border-rose-100">
                <h3 class="font-bold text-gray-900 mb-4 text-lg">Данные заказа</h3>

                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Имя:</span>
                    <span class="font-semibold text-gray-900">{{ form.name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Телефон:</span>
                    <span class="font-semibold text-gray-900">{{ form.phone }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Время:</span>
                    <span class="font-semibold text-gray-900">
                      {{ timeSlots.find(s => s.value === form.time)?.label }}
                      ({{ timeSlots.find(s => s.value === form.time)?.time }})
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Оплата:</span>
                    <span class="font-semibold text-gray-900">
                      {{ form.paymentMethod === 'online' ? '💳 Онлайн' : '💵 При получении' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <h3 class="font-bold text-gray-900 mb-4 text-lg">Товары в заказе</h3>
                <div class="flex justify-between mb-2">
                  <span class="text-gray-600">Количество:</span>
                  <span class="font-bold text-gray-900">{{ cartStore.count }} шт.</span>
                </div>
                <div class="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                  <span class="text-lg font-bold text-gray-800">Итого:</span>
                  <span class="text-3xl font-bold text-rose-600">{{ cartStore.totalPrice }} ₽</span>
                </div>
              </div>
            </div>
          </div>

        </transition>

        <div class="p-8 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            class="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span>Назад</span>
          </button>
          <div v-else></div>

          <button
            v-if="currentStep < totalSteps"
            @click="nextStep"
            class="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-rose-600 hover:to-pink-600 transition-all flex items-center space-x-2"
          >
            <span>Далее</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>

          <button
            v-else
            @click="submitOrder"
            class="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center space-x-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Подтвердить заказ</span>
          </button>
        </div>
      </div>

      <div class="text-center mt-6">
        <router-link
          to="/"
          class="inline-flex items-center text-gray-600 hover:text-rose-600 font-medium transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Вернуться в каталог
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
