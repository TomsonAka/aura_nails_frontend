<script setup>
import { ref, onMounted } from 'vue'

const staticConfig = {
  1: {
    status: 'Топ-мастер',
    experience: 5,
    rating: 4.9,
    reviewsCount: 127,
    photoOverride: '/masters/alina.jpg',
    reviews: [
      { id: 1, text: 'Идеальный френч, держится 3 недели!', author: 'Анна', rating: 5 },
      { id: 2, text: 'Очень внимательная к деталям, рекомендую!', author: 'Мария', rating: 5 },
      { id: 3, text: 'Лучший мастер, хожу только к ней', author: 'Ольга', rating: 5 }
    ]
  },
  2: {
    status: 'Мастер',
    experience: 3,
    rating: 4.8,
    reviewsCount: 89,
    photoOverride: '/masters/alina.jpg',
    reviews: [
      { id: 1, text: 'Очень аккуратная, цвет подобрала идеально', author: 'Елена', rating: 5 },
      { id: 2, text: 'Приятная атмосфера, качественная работа', author: 'София', rating: 5 },
      { id: 3, text: 'Маникюр держится уже третью неделю', author: 'Анна', rating: 5 }
    ]
  },
  3: {
    status: 'Топ-мастер',
    experience: 7,
    rating: 5.0,
    reviewsCount: 203,
    photoOverride: '/masters/alina.jpg',
    reviews: [
      { id: 1, text: 'Лучший маникюр в городе, хожу только к ней', author: 'Ольга', rating: 5 },
      { id: 2, text: 'Профессионал своего дела, всегда идеально', author: 'Наталья', rating: 5 },
      { id: 3, text: 'Быстро, качественно, красиво!', author: 'Виктория', rating: 5 }
    ]
  }
}

const masters = ref([])
const loading = ref(false)
const error = ref(null)

const reviewsIndex = ref({})

onMounted(async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:8080/api/masters')
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`)

    const backendData = await response.json()

    masters.value = backendData.map(backendMaster => {
      const staticPart = staticConfig[backendMaster.id]
      reviewsIndex.value[backendMaster.id] = 0

      return {
        id: backendMaster.id,
        name: backendMaster.name,
        photo: staticPart.photoOverride,
        status: staticPart.status,
        experience: staticPart.experience,
        rating: staticPart.rating,
        reviewsCount: staticPart.reviewsCount,
        reviews: staticPart.reviews
      }
    })

    startReviewsCarousel()

  } catch (err) {
    error.value = err.message
    console.error('Не удалось загрузить мастеров:', err)
  } finally {
    loading.value = false
  }
})

const nextReview = (masterId, reviewsLength) => {
  const currentIdx = reviewsIndex.value[masterId]
  reviewsIndex.value[masterId] = (currentIdx + 1) % reviewsLength
}

const startReviewsCarousel = () => {
  setInterval(() => {
    masters.value.forEach(master => {
      nextReview(master.id, master.reviews.length)
    })
  }, 4000)
}

const emit = defineEmits(['select-master'])
const selectMaster = (master) => {
  emit('select-master', master)
}
</script>

<template>
  <section class="masters-section">
    <div class="container">
      <h1 class="title">Наши мастера</h1>

      <div v-if="loading" class="status-message">
        Загружаем лучших мастеров...
      </div>

      <div v-else class="masters-grid">
        <div
          v-for="master in masters"
          :key="master.id"
          class="master-card"
          @click="selectMaster(master)"
        >
          <img
            :src="master.photo"
            :alt="master.name"
            class="master-photo"
            @error="$event.target.src='/masters/default.jpg'"
          />

          <div class="master-info">
            <h3 class="master-name">{{ master.name }}</h3>
            <span class="master-status">{{ master.status }}</span>

            <div class="master-stats">
              <span class="stat">Стаж: {{ master.experience }} лет</span>
              <span class="stat">★ {{ master.rating }}</span>
              <span class="stat">{{ master.reviewsCount }} отзывов</span>
            </div>

            <div class="reviews-carousel">
              <transition name="fade" mode="out-in">
                <div
                  :key="reviewsIndex[master.id]"
                  class="review-slide"
                >
                  <div class="stars">
                    <span
                      v-for="n in 5"
                      :key="n"
                      :class="{ filled: n <= master.reviews[reviewsIndex[master.id]].rating }"
                    >★</span>
                  </div>
                  <p class="review-text">"{{ master.reviews[reviewsIndex[master.id]].text }}"</p>
                  <span class="review-author">— {{ master.reviews[reviewsIndex[master.id]].author }}</span>
                </div>
              </transition>

              <div class="carousel-dots">
                <span
                  v-for="(review, idx) in master.reviews"
                  :key="review.id"
                  :class="['dot', { active: idx === reviewsIndex[master.id] }]"
                />
              </div>
            </div>

            <a href="#" class="all-reviews-link" @click.stop.prevent>
              Все {{ master.reviewsCount }} отзывов →
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.masters-section {
  background-color: rgb(250, 203, 231);
  padding: 60px 20px;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 40px;
  color: #333;
}

.status-message {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
  background: rgba(255,255,255,0.5);
  border-radius: 12px;
}

.masters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.master-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.master-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
}

.master-photo {
  width: 100%;
  height: 300px;
  object-fit: cover;
  background-color: #eee;
}

.master-info {
  padding: 25px;
  text-align: center;
}

.master-name {
  font-size: 20px;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

.master-status {
  display: inline-block;
  background: #ff6b9d;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.master-stats {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #555;
}

.reviews-carousel {
  background: #fef2f6;
  border-radius: 12px;
  padding: 15px;
  text-align: left;
  border: 1px solid #ffe0ec;
  min-height: 120px;
  position: relative;
}

.review-slide {
  display: flex;
  flex-direction: column;
}

.stars {
  font-size: 14px;
  margin-bottom: 8px;
  letter-spacing: 2px;
  color: #e0e0e0;
}

.stars span.filled {
  color: #ffc107;
}

.review-text {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  margin-bottom: 8px;
  font-style: italic;
  min-height: 40px;
}

.review-author {
  font-size: 12px;
  color: #888;
  font-weight: 500;
  display: block;
  text-align: right;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.3s ease;
}

.dot.active {
  background: #ff6b9d;
  transform: scale(1.3);
}

.all-reviews-link {
  display: inline-block;
  margin-top: 15px;
  color: #ff6b9d;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.all-reviews-link:hover {
  color: #ff4785;
  transform: translateX(4px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 600px) {
  .masters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
