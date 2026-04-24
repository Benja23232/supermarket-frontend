import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getProducts = (category_id) =>
  api.get('/products', { params: category_id ? { category_id } : {} })

export const getProductById = (id) =>
  api.get(`/products/${id}`)

export const login = (email, password) =>
  api.post('/users/login', { email, password })

export const register = (data) =>
  api.post('/users/register', data)

export const getProfile = () =>
  api.get('/users/profile')

export const createOrder = (items, address) =>
  api.post('/orders', { items, address })

export const getMyOrders = () =>
  api.get('/orders')

export const getOrderById = (id) =>
  api.get(`/orders/${id}`)

export default api