import api from '@/api/axios'

export const cartApi = {
  getMyCart: () => api.get('/api/cart'),

  addToMyCart: (productId) => api.post(`/api/cart/add/${productId}`),

  removeFromMyCart: (productId) => api.delete(`/api/cart/remove/${productId}`),

  clearMyCart: () => api.delete('/api/cart/clear')
}
