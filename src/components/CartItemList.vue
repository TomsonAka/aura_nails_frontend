<script setup>
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import CartItem from './CartItem.vue'

const cartStore = useCartStore()

onMounted(() => {
  cartStore.loadCart()
})
</script>

<template>
  <div class="flex flex-col flex-1 gap-3 sm:gap-4 px-2 sm:px-0 max-w-full">

    <div v-if="cartStore.isLoading" class="text-center py-8 sm:py-12">
      <p class="text-sm sm:text-base">Загрузка...</p>
    </div>

    <div v-else-if="cartStore.error" class="text-center py-8 sm:py-12 text-red-500">
      <p class="text-sm sm:text-base">Ошибка: {{ cartStore.error }}</p>
    </div>

    <template v-else>
      <div class="space-y-2 sm:space-y-3 md:space-y-4">
        <CartItem
          v-for="item in cartStore.items"
          :key="item.id"
          :id="item.product.id"
          :title="item.product.name || item.product.title"
          :price="item.product.price"
          :imageUrl="item.product.imageUrl"
          :quantity="item.quantity"
          @remove="(id) => cartStore.remove(id)"
        />
      </div>

      <div
        v-if="cartStore.count === 0"
        class="text-center text-gray-400 py-8 sm:py-12 flex flex-col items-center"
      >
        <p class="text-base sm:text-lg">Корзина пустая</p>
        <p class="text-xs sm:text-sm mt-1 sm:mt-2">Добавьте товары в корзину</p>
      </div>

    </template>

  </div>
</template>
