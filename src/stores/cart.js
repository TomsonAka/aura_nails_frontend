import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi } from '@/services/cartApi'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + (item.product?.price || item.price) * item.quantity, 0)
  )

  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const isInCart = (productId) => {
    return items.value.some(item => item.product?.id === productId)
  }

  async function loadCart() {
    isLoading.value = true
    error.value = null
    try {
      const response = await cartApi.getMyCart()
      items.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Ошибка загрузки корзины:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function add(product) {
    try {
      await cartApi.addToMyCart(product.id)
      await loadCart()
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Ошибка добавления:', err)
    }
  }

  async function remove(productId) {
    try {
      await cartApi.removeFromMyCart(productId)
      items.value = items.value.filter(item => item.product?.id !== productId)
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Ошибка удаления:', err)
    }
  }
  async function clearCart() {
    try {
      await cartApi.clearMyCart()
      items.value = []
    } catch (err) {
      console.error('Ошибка очистки корзины:', err)
      throw err
    }
  }

  return {
    items,
    isLoading,
    error,
    totalPrice,
    count,
    isInCart,
    loadCart,
    clearCart,
    add,
    remove
  }
})
