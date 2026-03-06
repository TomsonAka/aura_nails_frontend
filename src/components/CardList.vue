<script setup>
import Card from "./Card.vue";

defineProps({
  items: Array,
})

const onClickAdd = () => {
  alert("Добавить")
}
</script>


<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 px-2 sm:px-0">
    <Card
      v-for="item in items"
      :key="item.id"
      :id="item.id"
      :title="item.title"
      :description="item.description"
      :imageUrl="item.imageUrl"
      :price="item.price"
      :on-click-add="onClickAdd"
    />
  </div>
</template>
