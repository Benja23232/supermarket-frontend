import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Tracking from './pages/Tracking'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'

export default function App() {
  const token = localStorage.getItem('token')

  return (
    <BrowserRouter>
      <div style={styles.container}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/tracking" element={token ? <Tracking /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={token ? <Admin /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
  }
}