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
  <div class="relative bg-white border-2 border-slate-200 rounded-3xl p-8 transition hover:-translate-y-2 hover:shadow-xl">

    <div class="w-full rounded-xl overflow-hidden bg-gray-100">
      <img
        :src="imageUrl"
        :alt="title"
        class="w-full h-48 object-cover"
      />
    </div>

    <p class="mt-2 font-medium">{{ title }}</p>
    <h2 class="mt-2 text-gray-500 text-sm">{{ description }}</h2>

    <div class="flex justify-between mt-5 items-center">
      <div class="flex flex-col">
        <span class="text-slate-400 text-sm">Цена:</span>
        <b class="text-lg">{{ price }} ₽</b>
      </div>

      <img
        @click.stop="toggleCart"
        :src="cartStore.isInCart(id) ? '/checked.svg' : '/plus.svg'"
        alt="cart"
        class="cursor-pointer w-8 h-8 transition hover:scale-110"
        :class="{ 'opacity-50': cartStore.isLoading }"
      />
    </div>
  </div>
</template>
