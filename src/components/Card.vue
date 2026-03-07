<script setup>
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  id: Number,
  title: String,
  description: String,
  imageUrl: String,
  price: Number,
  isFavorite: Boolean,
  onClickFavorite: Function,
})

const cartStore = useCartStore()

const toggleCart = async () => {
  if (cartStore.isInCart(props.id)) {
    await cartStore.remove(props.id)
  } else {
    await cartStore.add({
      id: props.id,
      title: props.title,
      price: props.price,
      imageUrl: props.imageUrl
    })
  }
}
</script>

<template>
  <div class="relative bg-white border-2 border-slate-200 rounded-3xl p-8 transition hover:-translate-y-2 hover:shadow-xl flex flex-col h-full">

    <div class="w-full rounded-xl overflow-hidden bg-gray-100">
      <img
        :src="imageUrl"
        :alt="title"
        class="w-full h-48 object-cover"
      />
    </div>

    <p class="mt-4 font-medium min-h-[3rem]">{{ title }}</p>
    <h2 class="mt-2 text-gray-500 text-sm flex-grow">{{ description }}</h2>
    <div class="flex justify-between mt-auto items-center pt-4">
      <div class="flex flex-col">
        <span class="text-slate-400 text-sm">Цена:</span>
        <b class="text-lg">{{ price }} ₽</b>
      </div>

      <button
        @click.stop="toggleCart"
        class="relative w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center overflow-hidden"
        :class="cartStore.isInCart(id)
          ? 'bg-pink-500 shadow-lg shadow-pink-200 scale-105'
          : 'bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200'"
      >
        <svg
          class="w-5 h-5 transition-all duration-300"
          :class="cartStore.isInCart(id) ? 'text-white scale-110' : 'text-slate-400'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="cartStore.isInCart(id)"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M5 13l4 4L19 7"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
