import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, createPaymentPreference } from '../api/index.js'
import BottomNav from '../components/BottomNav.jsx'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  function updateQuantity(id, delta) {
    const newCart = cart
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + delta } : item
      )
      .filter((item) => item.quantity > 0)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  function removeItem(id) {
    const newCart = cart.filter((item) => item.id !== id)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const envio = subtotal >= 15000 ? 0 : 1500
  const total = subtotal + envio
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  async function handleCheckout() {
    if (!user) {
      navigate('/login')
      return
    }
    if (cart.length === 0) {
      setError('Tu carrito está vacío')
      return
    }
    try {
      setLoading(true)
      setError('')
      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: Number(item.price),
        name: item.name,
      }))
      const orderRes = await createOrder(items, user.address)
      const order = orderRes.data
      localStorage.setItem('lastOrder', JSON.stringify(order))

      const prefRes = await createPaymentPreference(items, order.id)
      const { init_point } = prefRes.data

      localStorage.setItem('cart', JSON.stringify([]))
      window.location.href = init_point
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          ←
        </button>
        <span style={styles.headerTitle}>Mi carrito</span>
        <span style={styles.headerCount}>{cartCount} productos</span>
      </div>

      <div style={styles.content}>
        {cart.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🛒</div>
            <div style={styles.emptyText}>Tu carrito está vacío</div>
            <button style={styles.emptyBtn} onClick={() => navigate('/products')}>
              Ver productos
            </button>
          </div>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} style={styles.cartRow}>
                <div style={styles.itemImg}>{item.emoji}</div>
                <div style={styles.itemInfo}>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemPrice}>
                    ${Number(item.price).toLocaleString('es-AR')}
                  </div>
                </div>
                <div style={styles.qtyCtrl}>
                  <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, -1)}>−</button>
                  <span style={styles.qtyNum}>{item.quantity}</span>
                  <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <button style={styles.removeBtn} onClick={() => removeItem(item.id)}>✕</button>
              </div>
            ))}

            <div style={styles.summary}>
              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Envío</span>
                <span style={{ color: envio === 0 ? '#1D9E75' : '#222' }}>
                  {envio === 0 ? 'Gratis' : `$${envio.toLocaleString('es-AR')}`}
                </span>
              </div>
              {envio === 0 && (
                <div style={styles.freeShipping}>
                  🎉 ¡Conseguiste envío gratis!
                </div>
              )}
              {envio > 0 && (
                <div style={styles.freeShippingHint}>
                  Agregá ${(15000 - subtotal).toLocaleString('es-AR')} más para envío gratis
                </div>
              )}
              <div style={styles.summaryTotal}>
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div style={styles.addressBox}>
              <div style={styles.addressTitle}>Dirección de entrega</div>
              <div style={styles.addressText}>
                {user?.address || 'No tenés dirección guardada'}
              </div>
              {!user && (
                <button style={styles.loginLink} onClick={() => navigate('/login')}>
                  Iniciá sesión para continuar
                </button>
              )}
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button
              style={{ ...styles.checkoutBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Confirmar pedido →'}
            </button>
          </>
        )}
      </div>

      <BottomNav cartCount={cartCount} />
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9f9f9' },
  header: { backgroundColor: '#fff', padding: '14px 16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#222' },
  headerTitle: { fontSize: 16, fontWeight: 600, flex: 1 },
  headerCount: { fontSize: 13, color: '#888' },
  content: { flex: 1, padding: 16 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#888' },
  emptyBtn: { backgroundColor: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, cursor: 'pointer', marginTop: 8 },
  cartRow: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '12px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 },
  itemImg: { fontSize: 28, width: 48, height: 48, backgroundColor: '#f5f5f5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: 500, color: '#222', marginBottom: 4 },
  itemPrice: { fontSize: 12, color: '#888' },
  qtyCtrl: { display: 'flex', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' },
  removeBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 14, padding: 4 },
  summary: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 14, marginBottom: 12 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#666', marginBottom: 8 },
  summaryTotal: { display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#222', borderTop: '1px solid #eee', paddingTop: 10, marginTop: 4 },
  freeShipping: { backgroundColor: '#E1F5EE', color: '#0F6E56', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 8 },
  freeShippingHint: { backgroundColor: '#f5f5f5', color: '#888', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 8 },
  addressBox: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 14, marginBottom: 14 },
  addressTitle: { fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#222' },
  addressText: { fontSize: 13, color: '#888' },
  loginLink: { background: 'none', border: 'none', color: '#1D9E75', fontSize: 13, cursor: 'pointer', padding: 0, marginTop: 6, fontWeight: 500 },
  error: { backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 },
  checkoutBtn: { width: '100%', backgroundColor: '#1D9E75', color: '#fff', border: 'none', borderRadius: 12, padding: 16, fontSize: 16, fontWeight: 600, cursor: 'pointer' },
}