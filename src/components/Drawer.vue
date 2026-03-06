<script setup>
import { inject } from "vue";
import DrawerHead from './DrawerHead.vue'
import CartItemList from './CartItemList.vue'
import { useCartStore } from '@/stores/cart.js'

const { closeDrawer } = inject('cartActions')
const cartStore = useCartStore()
</script>

<template>
  <div class="drawer-wrapper">
    <div class="fixed top-0 left-0 h-full w-full bg-black z-10 opacity-70"></div>

    <div class="bg-white w-full sm:w-96 h-full fixed right-0 top-0 z-20 p-4 sm:p-6 md:p-8 rounded-l-none sm:rounded-l-xl flex flex-col">
      <DrawerHead @close="closeDrawer" />

      <div class="flex-1 overflow-auto my-3 sm:my-4">
        <CartItemList />
      </div>

      <div class="flex flex-col gap-3 sm:gap-4 mt-auto pt-3 sm:pt-4 border-t border-slate-100">
        <div class="flex gap-2 text-sm sm:text-base">
          <span>Товаров:</span>
          <div class="flex-1 border-b border-dashed"></div>
          <span class="font-medium whitespace-nowrap">{{ cartStore.count }} шт</span>
        </div>

        <div class="flex gap-2 text-sm sm:text-base">
          <span>Итого:</span>
          <div class="flex-1 border-b border-dashed"></div>
          <span class="font-medium whitespace-nowrap">{{ cartStore.totalPrice }} ₽</span>
        </div>

        <router-link
          v-if="cartStore.count > 0"
          to="/checkout"
          class="mt-2 sm:mt-4 transition bg-rose-300 w-full rounded-lg sm:rounded-xl py-2 sm:py-3 text-white text-center text-sm sm:text-base block hover:bg-rose-500 active:bg-rose-500 cursor-pointer font-medium"
          @click="closeDrawer"
        >
          Оформить заказ
        </router-link>
      </div>
    </div>
  </div>
</template>
