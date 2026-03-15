<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const reviews = ref([
  {
    id: 1,
    text: 'Очень понравилось обслуживание! Алина — настоящий профессионал, маникюр держится уже третью неделю без сколов',
    author: 'Мария',
    rating: 5
  },
  {
    id: 2,
    text: 'Лучший салон в Уфе! Всё стерильно, мастера вежливые и внимательные. Рекомендую всем подругам',
    author: 'Екатерина',
    rating: 5
  },
  {
    id: 3,
    text: 'Отличный дизайн, цены адекватные. Приду ещё!',
    author: 'Анастасия',
    rating: 4
  },
  {
    id: 4,
    text: 'Делала наращивание впервые, результат превзошёл ожидания. Спасибо за красивые ногти!',
    author: 'Ольга',
    rating: 5
  }
])

const currentIndex = ref(0)
let intervalId = null

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % reviews.value.length
}

const goToSlide = (index) => {
  currentIndex.value = index
  resetTimer()
}

const resetTimer = () => {
  clearInterval(intervalId)
  startTimer()
}

const startTimer = () => {
  intervalId = setInterval(nextSlide, 5000)
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <section class="reviews-section">
    <div class="reviews-container">


      <div class="carousel-wrapper">
        <transition name="fade" mode="out-in">
          <div :key="currentIndex" class="review-slide">
            <div class="stars">
              <span v-for="n in 5" :key="n" :class="{ 'filled': n <= reviews[currentIndex].rating }">★</span>
            </div>
            <p class="review-text">"{{ reviews[currentIndex].text }}"</p>
            <span class="review-author">— {{ reviews[currentIndex].author }}</span>
          </div>
        </transition>
      </div>


      <div class="carousel-dots">
        <button
          v-for="(review, index) in reviews"
          :key="review.id"
          @click="goToSlide(index)"
          :class="['dot', { active: index === currentIndex }]"
          :aria-label="`Перейти к отзыву ${index + 1}`"
        />
      </div>

    </div>
  </section>
</template>

<style scoped>
.reviews-section {
  background-color: rgb(250, 203, 231);
  padding: 40px 20px;
  margin-top: 40px;
}

.reviews-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.carousel-wrapper {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-slide {
  max-width: 600px;
}

.stars {
  font-size: 24px;
  margin-bottom: 20px;
  letter-spacing: 4px;
}

.stars span {
  color: #e0e0e0;
}

.stars span.filled {
  color: #ffc107;
}

.review-text {
  font-size: 18px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 20px;
  font-style: italic;
}

.review-author {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.carousel-dots {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.dot:hover {
  background: #ffb6c1;
}

.dot.active {
  background: #ff6b9d;
  transform: scale(1.2);
}

.all-reviews-link {
  display: inline-block;
  margin-top: 25px;
  color: #ff6b9d;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s;
}

.all-reviews-link:hover {
  color: #ff4785;
  text-decoration: underline;
}


.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
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
  .reviews-container {
    padding: 30px 20px;
    margin: 0 10px;
  }

  .review-text {
    font-size: 16px;
  }

  .carousel-wrapper {
    min-height: 200px;
  }
}
</style>
