<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const orders = ref([])
const loading = ref(true)
const error = ref(null)

const fetchOrders = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/api/orders/my')
    orders.value = response.data
  } catch (err) {
    error.value = err.response?.status === 401
      ? 'Необходимо авторизоваться'
      : 'Не удалось загрузить заказы'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getStatusText = (status) => {
  const statuses = {
    'NEW': 'Новый',
    'CONFIRMED': 'Подтверждён',
    'COMPLETED': 'Выполнен',
    'CANCELLED': 'Отменён'
  }
  return statuses[status] || status
}

const getStatusColor = (status) => {
  const colors = {
    'NEW': 'bg-blue-100 text-blue-800',
    'CONFIRMED': 'bg-green-100 text-green-800',
    'COMPLETED': 'bg-gray-100 text-gray-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

onMounted(fetchOrders)
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Мои заказы</h1>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500">Загрузка заказов...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button
          @click="fetchOrders"
          class="px-4 py-2 bg-rose-400 text-white rounded-lg hover:bg-rose-500 transition-colors"
        >
          Попробовать снова
        </button>
      </div>

      <div v-else-if="orders.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">У вас пока нет заказов</h3>
        <p class="text-gray-500 mb-6">Сделайте свой первый заказ в нашем магазине</p>
        <router-link
          to="/"
          class="inline-flex items-center px-6 py-3 bg-rose-400 text-white rounded-xl hover:bg-rose-500 transition-colors font-medium"
        >
          Перейти в каталог
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.orderId"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">Заказ №{{ order.orderId }}</span>
              <span class="text-sm text-gray-400">•</span>
              <span class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</span>
            </div>
            <span
              :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusColor(order.status)]"
            >
             {{ getStatusText(order.status) }}
           </span>
          </div>

          <div class="px-6 py-4">
            <div
              v-for="item in order.items"
              :key="item.itemId"
              class="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0"
            >
              <img
                :src="item.productImageUrl || '/placeholder-product.png'"
                :alt="item.productName"
                class="w-16 h-16 object-cover rounded-lg bg-gray-100"
              />
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ item.productName || 'Товар' }}</h4>
                <p class="text-sm text-gray-500">{{ item.quantity }} шт. × {{ item.price }} ₽</p>
              </div>
              <span class="font-semibold text-gray-900">{{ item.subtotal || (item.price * item.quantity) }} ₽</span>
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 flex items-center justify-between flex-wrap gap-4">
            <div class="space-y-1">
              <p v-if="order.appointmentDate" class="text-sm text-gray-600">
                <span class="font-medium">Дата записи:</span> {{ formatDate(order.appointmentDate) }}
              </p>
              <p v-if="order.appointmentTimeSlot" class="text-sm text-gray-600">
                <span class="font-medium">Время:</span>
                {{ order.appointmentTimeSlot }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500 mb-1">Итого</p>
              <p class="text-xl font-bold text-rose-500">{{ order.totalAmount }} ₽</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
