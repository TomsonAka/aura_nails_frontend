<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()
const currentStep = ref(1)
const totalSteps = 5

const userPhone = ref('')
const userName = ref('')

const selectedDate = ref('')
const availableSlots = ref([])
const isLoadingSlots = ref(false)
const slotsError = ref('')

const masters = ref([])
const isLoadingMasters = ref(false)
const selectedMaster = ref(null)

const form = reactive({
  name: '',
  phone: '',
  selectedSlotId: null,
  selectedSlotLabel: '',
  selectedMasterId: null,
  selectedMasterName: '',
  paymentMethod: 'later',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: ''
})

const minDate = ref(new Date().toISOString().split('T')[0])

const fetchMasters = async () => {
  isLoadingMasters.value = true
  try {
    const response = await fetch('http://localhost:8080/api/masters')
    if (response.ok) {
      masters.value = await response.json()
    }
  } catch (e) {
    console.error('Ошибка загрузки мастеров:', e)
  } finally {
    isLoadingMasters.value = false
  }
}

const selectMaster = (master) => {
  selectedMaster.value = master
  form.selectedMasterId = master.id
  form.selectedMasterName = master.name
  form.selectedSlotId = null
  form.selectedSlotLabel = ''
  availableSlots.value = []
  selectedDate.value = ''
}

watch(selectedDate, async (newDate) => {
  if (!newDate || !form.selectedMasterId) {
    availableSlots.value = []
    return
  }

  isLoadingSlots.value = true
  slotsError.value = ''

  try {
    const response = await fetch(
      `http://localhost:8080/api/slots/available?date=${newDate}&masterId=${form.selectedMasterId}`
    )
    if (response.ok) {
      availableSlots.value = await response.json()
      form.selectedSlotId = null
      form.selectedSlotLabel = ''
    } else {
      slotsError.value = 'Не удалось загрузить слоты'
    }
  } catch (e) {
    console.error('Ошибка загрузки слотов:', e)
    slotsError.value = 'Ошибка соединения'
  } finally {
    isLoadingSlots.value = false
  }
})

const formatPhone = (value) => {
  let cleaned = value.replace(/\D/g, '')
  if (cleaned.startsWith('8')) cleaned = cleaned.slice(1)
  else if (cleaned.startsWith('7')) cleaned = cleaned.slice(1)
  cleaned = cleaned.slice(0, 10)
  if (cleaned.length === 0) return ''
  if (cleaned.length <= 3) return `+7 (${cleaned}`
  else if (cleaned.length <= 6) return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
  else if (cleaned.length <= 8) return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  else return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`
}

const onPhoneInput = (e) => {
  const input = e.target
  const cursorPos = input.selectionStart
  const prevLength = input.value.length
  const formatted = formatPhone(input.value)
  form.phone = formatted
  setTimeout(() => {
    const newLength = formatted.length
    const diff = newLength - prevLength
    input.setSelectionRange(cursorPos + diff, cursorPos + diff)
  }, 0)
}

const onPhoneKeydown = (e) => {
  if ([46, 8, 9, 27, 13].includes(e.keyCode)) return
  if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) return
  if (e.keyCode < 48 || e.keyCode > 57) {
    if (e.keyCode < 96 || e.keyCode > 105) e.preventDefault()
  }
}

const onPhonePaste = (e) => {
  e.preventDefault()
  const pasted = e.clipboardData.getData('text')
  form.phone = formatPhone(pasted)
}

onMounted(async () => {
  await fetchMasters()
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
        if (userPhone.value) form.phone = formatPhone(userPhone.value)
        if (userName.value) form.name = userName.value
      }
    } catch (e) {
      console.error('Failed to load user data')
    }
  }
})

const selectSlot = (slot) => {
  form.selectedSlotId = slot.id
  form.selectedSlotLabel = slot.label || `${slot.startTime} — ${slot.endTime}`
}

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
      if (!form.selectedMasterId) {
        alert('Пожалуйста, выберите мастера')
        return false
      }
      return true
    }
    case 3: {
      if (!selectedDate.value) {
        alert('Пожалуйста, выберите дату')
        return false
      }
      if (!form.selectedSlotId) {
        alert('Пожалуйста, выберите время')
        return false
      }
      return true
    }
    case 4: {
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
  if (currentStep.value > 1) currentStep.value--
}

const submitOrder = async () => {
  if (!validateStep(4)) return

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  try {
    const digits = form.phone.replace(/\D/g, '')
    const orderPayload = {
      customerName: form.name,
      customerPhone: `+7${digits.slice(1, 4)}${digits.slice(4, 7)}${digits.slice(7, 9)}${digits.slice(9, 11)}`,
      masterId: form.selectedMasterId,
      timeSlotId: form.selectedSlotId,
      productIds: cartStore.items.map(item => item.product?.id || item.id),
      paymentMethod: form.paymentMethod.toUpperCase()
    }

    const response = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(orderPayload)
    })

    if (response.ok) {
      alert('Заказ успешно оформлен!')
      cartStore.clearCart()
      router.push('/')
    } else {
      const errorData = await response.json().catch(() => ({}))
      alert('Ошибка: ' + (errorData.message || response.status))
    }
  } catch (error) {
    console.error('Ошибка:', error)
    alert('Не удалось оформить заказ')
  }
}

const getStepTitle = (stepNumber) => {
  const titles = {
    1: 'Контактная информация',
    2: 'Выбор мастера',
    3: 'Дата и время',
    4: 'Способ оплаты',
    5: 'Подтверждение'
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

      <div class="bg-white rounded-3xl shadow-xl p-4 sm:p-6 mb-6">
        <div class="relative">
          <div class="absolute left-0 right-0 top-6 sm:top-8 h-1 bg-gray-200 rounded-full"></div>
          <div
            class="absolute left-0 top-6 sm:top-8 h-1 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
            :style="{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }"
          ></div>
          <div class="relative z-10 flex justify-between">
            <div
              v-for="step in totalSteps"
              :key="step"
              class="flex flex-col items-center flex-1"
            >
              <div
                :class="[
                  'w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-500 shadow-lg',
                  currentStep >= step
                    ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white scale-110'
                    : 'bg-gray-200 text-gray-500'
                ]"
              >
                <svg v-if="currentStep > step" class="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                </svg>
                <span v-else>{{ step }}</span>
              </div>
              <span
                :class="[
                  'mt-2 text-xs font-semibold text-center transition-colors duration-300 px-1',
                  currentStep >= step ? 'text-rose-600' : 'text-gray-400'
                ]"
              >
                <span class="hidden sm:inline">{{ getStepTitle(step) }}</span>
                <span class="sm:hidden">
                  {{ step === 1 ? 'Контакты' : step === 2 ? 'Мастер' : step === 3 ? 'Время' : step === 4 ? 'Оплата' : 'Готово' }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <transition name="fade" mode="out-in">

          <div v-if="currentStep === 1" key="step1" class="p-6 sm:p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Контактная информация</h2>
                <p class="text-gray-500">Шаг 1 из 5</p>
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
                    @keydown="onPhoneKeydown"
                    @paste="onPhonePaste"
                    type="tel"
                    inputmode="numeric"
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

          <div v-else-if="currentStep === 2" key="step2" class="p-6 sm:p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Выбор мастера</h2>
                <p class="text-gray-500">Шаг 2 из 5</p>
              </div>
            </div>

            <div v-if="isLoadingMasters" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
              <p class="mt-2 text-gray-500">Загрузка мастеров...</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="master in masters"
                :key="master.id"
                @click="selectMaster(master)"
                :class="[
                  'p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center space-x-4',
                  form.selectedMasterId === master.id
                    ? 'border-rose-500 bg-rose-50 shadow-md'
                    : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/30'
                ]"
              >
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {{ master.name.charAt(0) }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="font-bold text-lg text-gray-900">{{ master.name }}</h3>
                    <div v-if="form.selectedMasterId === master.id" class="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                  <p v-if="master.specialization" class="text-sm text-gray-600 mt-1">{{ master.specialization }}</p>
                  <p v-if="master.rating" class="text-sm text-rose-600 mt-1">★ {{ master.rating }}</p>
                </div>
              </div>

              <div v-if="masters.length === 0" class="text-center py-8 text-gray-500">
                <p>Нет доступных мастеров</p>
              </div>
            </div>
          </div>

          <div v-else-if="currentStep === 3" key="step3" class="p-6 sm:p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Выберите дату и время</h2>
                <p class="text-gray-500">Шаг 3 из 5 • {{ form.selectedMasterName }}</p>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Дата посещения <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="selectedDate"
                    type="date"
                    :min="minDate"
                    class="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all outline-none text-lg"
                  />
                  <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>

              <div v-if="isLoadingSlots" class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                <p class="mt-2 text-gray-500">Загрузка доступного времени...</p>
              </div>

              <div v-else-if="slotsError" class="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-center">
                {{ slotsError }}
              </div>

              <div v-else-if="selectedDate && availableSlots.length > 0">
                <label class="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Доступное время <span class="text-rose-500">*</span>
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <button
                    v-for="slot in availableSlots"
                    :key="slot.id"
                    @click="selectSlot(slot)"
                    :class="[
                      'p-4 rounded-xl border-2 transition-all duration-200 text-center',
                      form.selectedSlotId === slot.id
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-md'
                        : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/30 text-gray-700'
                    ]"
                  >
                    <div class="font-bold text-lg">{{ slot.startTime }}</div>
                    <div class="text-xs text-gray-500">— {{ slot.endTime }}</div>
                  </button>
                </div>
              </div>

              <div v-else-if="selectedDate && !isLoadingSlots" class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>На эту дату нет свободного времени</p>
                <p class="text-sm mt-1">Попробуйте выбрать другую дату</p>
              </div>

              <div v-else class="text-center py-8 text-gray-400">
                <p>Выберите дату, чтобы увидеть доступное время</p>
              </div>
            </div>
          </div>

          <div v-else-if="currentStep === 4" key="step4" class="p-6 sm:p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Способ оплаты</h2>
                <p class="text-gray-500">Шаг 4 из 5</p>
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
                      maxlength="3"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <div v-else-if="currentStep === 5" key="step5" class="p-6 sm:p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Подтверждение заказа</h2>
                <p class="text-gray-500">Шаг 5 из 5</p>
              </div>
            </div>

            <div class="space-y-6">
              <div class="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border-2 border-rose-100">
                <h3 class="font-bold text-gray-900 mb-4 text-lg">Данные записи</h3>

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
                    <span class="text-gray-600">Мастер:</span>
                    <span class="font-semibold text-rose-600">{{ form.selectedMasterName }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Дата:</span>
                    <span class="font-semibold text-gray-900">{{ selectedDate ? new Date(selectedDate).toLocaleDateString('ru-RU') : '' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Время:</span>
                    <span class="font-semibold text-rose-600">{{ form.selectedSlotLabel }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Оплата:</span>
                    <span class="font-semibold text-gray-900">
                      {{ form.paymentMethod === 'online' ? 'Онлайн' : 'При получении' }}
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

        <div class="p-6 sm:p-8 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            class="px-6 py-3 sm:px-8 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center space-x-2"
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
            class="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-rose-600 hover:to-pink-600 transition-all flex items-center space-x-2"
          >
            <span>Далее</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>

          <button
            v-else
            @click="submitOrder"
            class="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center space-x-2"
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
