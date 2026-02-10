<script setup>
defineProps({
  title: String,
  description: String,
  imageUrl: String,
  price: Number,
  isFavorite: Boolean,
  isAdded: Boolean,
  onClickAdd: Function,
  onClickFavorite: Function,
})
</script>

<template>
  <div
    class="relative bg-white border-2 border-slate-200 rounded-3xl p-8 cursor-pointer transition hover:-translate-y-2 hover:shadow-xl"
  >
    <img
      :src="!isFavorite ? '/like-2.svg' : '/like-1.svg'"
      alt="like 1"
      class="absolute top-8 left-8"
      @click="onClickFavorite"
    />

    <img :src="imageUrl" alt="nails" class="rounded-xl " />

    <p class="mt-2">{{ title }}</p>
    <h2 class="mt-2 text-gray-500">{{ description }}</h2>

    <div class="flex justify-between mt-5">
      <div class="flex flex-col">
        <span class="text-slate-400">Цена:</span>
        <b>{{ price }} ₽</b>
      </div>
      <img @click="onClickAdd" :src="!isAdded ? '/plus.svg' : '/checked.svg'" alt="plus" />
    </div>
  </div>
</template>
