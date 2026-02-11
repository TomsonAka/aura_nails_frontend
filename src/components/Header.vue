<script setup>
const props = defineProps({
  openModal: Function,
})
const emit = defineEmits(['openDrawer'])
</script>

<template>
  <header class="flex justify-between border-b border-slate-200 px-10 py-10">
    <div class="flex items-center gap-4">
      <img src="/logo-1.png" alt="logo" class="w-10" />
      <div>
        <h2 class="text-xl font-bold uppercase">AuraNails</h2>
        <p class="text-slate-400">Создаём настроение</p>
      </div>
    </div>

    <ul class="flex items-center gap-10">
      <li
        @click="() => emit('openDrawer')"
        class="flex items-center cursor-pointer gap-3 text-gray-500 hover:text-black"
      >
        <img src="/cart.svg" alt="cart " />
        <b>1203 руб.</b>
      </li>

      <li class="flex items-center cursor-pointer gap-3 text-gray-500 hover:text-black">
        <img src="/heart.svg" alt="heart " />
        <span>Избранное</span>
      </li>

      <li
        @click="props.openModal"
        class="flex items-center cursor-pointer gap-3 text-gray-500 hover:text-black"
      >
        <img src="/profile.svg" alt="profile " />
        <span>Профиль</span>
      </li>
    </ul>
  </header>
</template>
