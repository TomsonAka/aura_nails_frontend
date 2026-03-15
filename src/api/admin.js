import axios from './axios'

const adminApi = {

  getOrders(params = {}) {
    return axios.get('/admin/orders', { params })
  },

  getOrderById(id) {
    return axios.get(`/admin/orders/${id}`)
  },

  updateOrderStatus(id, data) {
    return axios.put(`/admin/orders/${id}/status`, data)
  },

  getStatistics(params = {}) {
    return axios.get('/admin/orders/statistics', { params })
  },

  getMasters() {
    return axios.get('/admin/masters')
  },

  getProducts() {
    return axios.get('/admin/products')
  },

  createProduct(data) {
    return axios.post('/admin/products', data)
  },

  updateProduct(id, data) {
    return axios.put(`/admin/products/${id}`, data)
  },

  deleteProduct(id) {
    return axios.delete(`/admin/products/${id}`)
  }
}

export default adminApi
