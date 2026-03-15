<script>
import { ref, reactive, onMounted } from 'vue'
import adminApi from '@/api/admin'

export default {
  name: 'AdminDashboard',
  setup() {
    const orders = ref([])
    const masters = ref([])
    const stats = ref({
      newOrders: 0,
      confirmedOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    })
    const loading = ref(true)

    const filters = reactive({
      startDate: '',
      endDate: '',
      masterId: '',
      status: ''
    })

    const loadOrders = async () => {
      loading.value = true
      try {
        const params = {}
        if (filters.startDate) params.startDate = filters.startDate
        if (filters.endDate) params.endDate = filters.endDate
        if (filters.masterId) params.masterId = filters.masterId
        if (filters.status) params.status = filters.status

        const response = await adminApi.getOrders(params)
        orders.value = response.data
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error)
      } finally {
        loading.value = false
      }
    }

    const loadMasters = async () => {
      try {
        const response = await adminApi.getMasters()
        masters.value = response.data
      } catch (error) {
        console.error('Ошибка загрузки мастеров:', error)
      }
    }

    const loadStats = async () => {
      try {
        const response = await adminApi.getStatistics()
        stats.value = response.data
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error)
      }
    }

    const updateOrderStatus = async (orderId, newStatus) => {
      try {
        await adminApi.updateOrderStatus(orderId, { status: newStatus })
        await loadOrders()
        await loadStats()
        showNotification('Статус успешно обновлен', 'success')
      } catch (error) {
        console.error('Ошибка обновления статуса:', error)
        showNotification('Ошибка обновления статуса', 'error')
      }
    }

    const resetFilters = () => {
      filters.startDate = ''
      filters.endDate = ''
      filters.masterId = ''
      filters.status = ''
      loadOrders()
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const translateStatus = (status) => {
      const statuses = {
        'NEW': 'Новая',
        'CONFIRMED': 'Подтверждена',
        'COMPLETED': 'Завершена',
        'CANCELLED': 'Отменена'
      }
      return statuses[status] || status
    }

    const showNotification = (message, type) => {
      const div = document.createElement('div')
      div.textContent = message
      div.className = `notification notification-${type}`
      div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `
      document.body.appendChild(div)
      setTimeout(() => {
        div.remove()
      }, 3000)
    }

    onMounted(() => {
      const today = new Date().toISOString().split('T')[0]
      filters.startDate = today
      filters.endDate = today

      loadOrders()
      loadMasters()
      loadStats()
    })

    return {
      orders,
      masters,
      stats,
      loading,
      filters,
      loadOrders,
      updateOrderStatus,
      resetFilters,
      formatDate,
      translateStatus
    }
  }
}
</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <div class="logo">
        <span class="logo-icon">💅</span>
        <div class="logo-text">
          <h1>AURANAILS</h1>
          <p>Панель администратора</p>
        </div>
      </div>
      <div class="header-actions">
        <router-link to="/" class="btn-back">На сайт</router-link>
      </div>
    </div>

    <div class="admin-container">
      <div class="stats-grid">
        <div class="stat-card new">
          <div class="stat-value">{{ stats.newOrders }}</div>
          <div class="stat-label">Новые записи</div>
        </div>
        <div class="stat-card confirmed">
          <div class="stat-value">{{ stats.confirmedOrders }}</div>
          <div class="stat-label">Подтверждено</div>
        </div>
        <div class="stat-card completed">
          <div class="stat-value">{{ stats.completedOrders }}</div>
          <div class="stat-label">Выполнено</div>
        </div>
        <div class="stat-card cancelled">
          <div class="stat-value">{{ stats.cancelledOrders }}</div>
          <div class="stat-label">Отменено</div>
        </div>
      </div>

      <div class="filters-section">
        <h2 class="section-title">Фильтры</h2>
        <div class="filters-grid">
          <div class="filter-group">
            <label>Дата начала</label>
            <input
              type="date"
              v-model="filters.startDate"
              class="filter-input"
            >
          </div>
          <div class="filter-group">
            <label>Дата окончания</label>
            <input
              type="date"
              v-model="filters.endDate"
              class="filter-input"
            >
          </div>
          <div class="filter-group">
            <label>Мастер</label>
            <select v-model="filters.masterId" class="filter-input">
              <option value="">Все мастера</option>
              <option v-for="master in masters" :key="master.id" :value="master.id">
                {{ master.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>Статус</label>
            <select v-model="filters.status" class="filter-input">
              <option value="">Все статусы</option>
              <option value="NEW">Новые</option>
              <option value="CONFIRMED">Подтвержденные</option>
              <option value="COMPLETED">Завершенные</option>
              <option value="CANCELLED">Отмененные</option>
            </select>
          </div>
          <div class="filter-actions">
            <button @click="loadOrders" class="btn btn-primary">Применить</button>
            <button @click="resetFilters" class="btn btn-secondary">Сбросить</button>
          </div>
        </div>
      </div>

      <div class="orders-section">
        <div class="section-header">
          <h2 class="section-title">Записи клиентов</h2>
          <span class="orders-count">{{ orders.length }} записей</span>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Загрузка...</p>
        </div>

        <div v-else-if="orders.length === 0" class="no-data">
          <p>Записей не найдено</p>
        </div>

        <div v-else class="orders-table-wrapper">
          <table class="orders-table">
            <thead>
            <tr>
              <th>Клиент</th>
              <th>Мастер</th>
              <th>Дата и время</th>
              <th>Услуги</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="order in orders" :key="order.orderId">
              <td>
                <div class="customer-info">
                  <div class="customer-name">{{ order.customerName }}</div>
                  <div class="customer-phone">{{ order.customerPhone }}</div>
                </div>
              </td>
              <td>
                <span class="master-name">{{ order.masterName || 'Не назначен' }}</span>
              </td>
              <td>
                <div class="datetime-info">
                  <div class="date">{{ formatDate(order.appointmentDate) }}</div>
                  <div class="time">{{ order.appointmentTimeSlot }}</div>
                </div>
              </td>
              <td>
                <div class="services-list">
                    <span v-for="(item, idx) in order.items" :key="idx" class="service-tag">
                      {{ item.productName }}
                    </span>
                </div>
              </td>
              <td>
                <span class="order-price">{{ order.totalAmount }} ₽</span>
              </td>
              <td>
                  <span :class="['status-badge', `status-${order.status}`]">
                    {{ translateStatus(order.status) }}
                  </span>
              </td>
              <td>
                <select
                  :value="order.status"
                  @change="updateOrderStatus(order.orderId, $event.target.value)"
                  class="status-select"
                >
                  <option value="NEW">Новая</option>
                  <option value="CONFIRMED">Подтверждена</option>
                  <option value="COMPLETED">Завершена</option>
                  <option value="CANCELLED">Отменена</option>
                </select>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5d5e6 0%, #f8e1ec 100%);
}

.admin-header {
  background: white;
  padding: 20px 40px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff6b9d, #ff8fab);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.logo-text h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.logo-text p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.btn-back {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #e8e8e8;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.stat-card.new .stat-value { color: #ff6b9d; }
.stat-card.confirmed .stat-value { color: #4CAF50; }
.stat-card.completed .stat-value { color: #2196F3; }
.stat-card.cancelled .stat-value { color: #f44336; }

.filters-section,
.orders-section {
  background: white;
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #1a1a1a;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  align-items: end;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.filter-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #f0f0f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s;
}

.filter-input:focus {
  outline: none;
  border-color: #ff6b9d;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b9d, #ff8fab);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.4);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.orders-count {
  color: #666;
  font-size: 14px;
}

.loading,
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b9d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.orders-table-wrapper {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
  background: #fafafa;
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  color: #555;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.orders-table td {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.orders-table tbody tr:hover {
  background: #fafafa;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-weight: 600;
  color: #1a1a1a;
}

.customer-phone {
  color: #999;
  font-size: 13px;
}

.master-name {
  color: #ff6b9d;
  font-weight: 500;
}

.datetime-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date {
  font-weight: 500;
  color: #1a1a1a;
}

.time {
  color: #999;
  font-size: 13px;
}

.services-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.service-tag {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
}

.order-price {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 16px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.status-NEW { background: #fff3cd; color: #856404; }
.status-CONFIRMED { background: #d4edda; color: #155724; }
.status-IN_PROGRESS { background: #cce5ff; color: #004085; }
.status-COMPLETED { background: #d1ecf1; color: #0c5460; }
.status-CANCELLED { background: #f8d7da; color: #721c24; }

.status-select {
  padding: 8px 12px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  background: white;
}

.status-select:focus {
  outline: none;
  border-color: #ff6b9d;
}

@media (max-width: 768px) {
  .admin-header {
    padding: 15px 20px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .orders-table {
    font-size: 13px;
  }

  .orders-table th,
  .orders-table td {
    padding: 12px;
  }
}
</style>
