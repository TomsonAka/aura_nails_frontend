<script setup>
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import CardList from '../components/CardList.vue'

const items = ref([])
const searchQuery = ref('')
const sortBy = ref('title')
let searchTimeout = null

const fetchItems = async () => {
  try {
    const { data } = await axios.get('http://localhost:8080/api/products')
    items.value = data
  } catch (err) {
    console.error(err)
  }
}

const searchItems = async (query) => {
  if (!query.trim()) {
    fetchItems()
    return
  }

  try {
    const { data } = await axios.get('http://localhost:8080/api/products/search', {
      params: { title: query }
    })
    items.value = data
  } catch (err) {
    console.error(err)
  }
}

watch(searchQuery, (newQuery) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchItems(newQuery)
  }, 300)
})

const sortItems = () => {
  if (sortBy.value === 'price') {
    items.value.sort((a, b) => a.price - b.price)
  } else {
    items.value.sort((a, b) => a.title.localeCompare(b.title))
  }
}

watch(sortBy, sortItems)

onMounted(fetchItems)
</script>

<template>
  <div class="bg-white w-full sm:w-11/12 lg:w-4/5 mx-auto rounded-xl shadow-xl mt-4 sm:mt-8 lg:mt-14">
    <div class="p-4 sm:p-6 lg:p-10">

      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <h2 class="text-2xl sm:text-3xl lg:text-3xl font-bold mb-0">Каталог</h2>

        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

          <select
            v-model="sortBy"
            class="w-full sm:w-auto py-2 px-3 border rounded-md outline-none cursor-pointer text-sm sm:text-base bg-white"
          >
            <option value="title">По названию</option>
            <option value="price">По цене</option>
          </select>

          <div class="relative w-full sm:w-auto">
            <img
              class="absolute left-3 top-2.5 w-4 h-4 sm:w-5 sm:h-5 opacity-50"
              src="/search.svg"
            />
            <input
              v-model="searchQuery"
              class="border rounded-md py-2 pl-9 sm:pl-11 pr-4 outline-none hover:border-gray-400 focus:border-gray-400 w-full sm:w-64 text-sm sm:text-base"
              placeholder="Поиск"
            />
          </div>
        </div>
      </div>

      <div class="mt-6 sm:mt-8 lg:mt-10">
        <div v-if="items.length === 0" class="text-center text-gray-500 py-8 sm:py-10">
          <p class="text-base sm:text-lg">Ничего не найдено</p>
          <p class="text-xs sm:text-sm mt-1 text-gray-400">Попробуйте изменить параметры поиска</p>
        </div>
        <CardList v-else :items="items" />
      </div>

    </div>
  </div>
</template>
