<script setup>
defineProps({
  id: Number,
  title: String,
  price: Number,
  imageUrl: String,
  quantity: { type: Number, default: 1 }
})

const emit = defineEmits(['remove'])
</script>

<template>
  <div class="flex items-start sm:items-center border border-slate-300 p-3 sm:p-4 rounded-xl gap-3 sm:gap-4 bg-white">
    <img
      class="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
      :src="imageUrl"
      :alt="title"
    />

    <div class="flex flex-col flex-1 min-w-0">
      <p class="font-medium text-sm sm:text-base truncate pr-2">{{ title }}</p>
      <span class="text-xs text-gray-400">Кол-во: {{ quantity }}</span>

      <div class="flex justify-between mt-1 sm:mt-2 items-center">
        <b class="text-sm sm:text-base text-slate-900 whitespace-nowrap">{{ price * quantity }} ₽</b>
        <img
          class="opacity-100 hover:opacity-110 cursor-pointer transition w-4 h-4 sm:w-5 sm:h-5"
          src="/close.svg"
          @click="emit('remove', id)"
          alt="remove"
        />
      </div>
    </div>
  </div>
</template>
