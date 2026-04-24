import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { getOrderById } from '../api/index.js'
import BottomNav from '../components/BottomNav.jsx'

const STATUSES = [
  { key: 'pending', label: 'Pedido confirmado', emoji: '✅', description: 'Pago acreditado' },
  { key: 'preparing', label: 'Preparando pedido', emoji: '👨‍🍳', description: 'En el supermercado' },
  { key: 'on_the_way', label: 'En camino', emoji: '🛵', description: 'Tu repartidor viene' },
  { key: 'delivered', label: 'Entregado', emoji: '📦', description: 'Que lo disfrutes!' },
]

export default function Tracking() {
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder') || 'null')
    if (!lastOrder) {
      setLoading(false)
      return
    }

    getOrderById(lastOrder.id)
      .then((res) => setOrder(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))

    const socket = io('http://localhost:3001')

    socket.on('connect', () => {
      socket.emit('join_order', lastOrder.id)
    })

    socket.on('order_status_updated', ({ orderId, status }) => {
      if (Number(orderId) === lastOrder.id) {
        setOrder((prev) => ({ ...prev, status }))
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const currentStatusIndex = order
    ? STATUSES.findIndex((s) => s.key === order.status)
    : 0

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Cargando pedido...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📦</div>
          <div style={styles.emptyText}>No tenés pedidos activos</div>
          <button style={styles.emptyBtn} onClick={() => navigate('/')}>
            Hacer un pedido
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.trackingHeader}>
        <div style={styles.trackingTitle}>
          {STATUSES[currentStatusIndex]?.emoji}{' '}
          {STATUSES[currentStatusIndex]?.label}
        </div>
        <div style={styles.trackingSub}>
          Pedido #{order.id} · Llega en aprox. 30 min
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.steps}>
          {STATUSES.map((status, index) => {
            const done = index < currentStatusIndex
            const active = index === currentStatusIndex
            const pending = index > currentStatusIndex

            return (
              <div key={status.key} style={styles.step}>
                <div style={styles.stepLineWrap}>
                  <div
                    style={{
                      ...styles.stepDot,
                      backgroundColor: pending ? '#f5f5f5' : '#1D9E75',
                      color: pending ? '#aaa' : '#fff',
                      border: active ? '3px solid #9FE1CB' : 'none',
                    }}
                  >
                    {done ? '✓' : status.emoji}
                  </div>
                  {index < STATUSES.length - 1 && (
                    <div
                      style={{
                        ...styles.stepConnector,
                        backgroundColor: done ? '#1D9E75' : '#eee',
                      }}
                    />
                  )}
                </div>
                <div style={styles.stepInfo}>
                  <div
                    style={{
                      ...styles.stepName,
                      color: pending ? '#aaa' : '#222',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {status.label}
                  </div>
                  <div style={styles.stepDesc}>{status.description}</div>
                </div>
              </div>
            )
          })}
        </div>

        {order.items && (
          <div style={styles.itemsBox}>
            <div style={styles.itemsTitle}>Productos del pedido</div>
            {order.items.map((item) => (
              <div key={item.id} style={styles.itemRow}>
                <span style={styles.itemEmoji}>{item.emoji}</span>
                <span style={styles.itemName}>{item.name}</span>
                <span style={styles.itemQty}>x{item.quantity}</span>
                <span style={styles.itemPrice}>
                  ${(item.unit_price * item.quantity).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
            <div style={styles.totalRow}>
              <span>Total</span>
              <span>${Number(order.total).toLocaleString('es-AR')}</span>
            </div>
          </div>
        )}

        <div style={styles.riderCard}>
          <div style={styles.riderAvatar}>👤</div>
          <div style={styles.riderInfo}>
            <div style={styles.riderName}>Carlos M.</div>
            <div style={styles.riderSub}>Tu repartidor · ⭐ 4.9</div>
          </div>
          <div style={styles.riderActions}>
            <button style={styles.riderBtn}>💬</button>
            <button style={styles.riderBtn}>📞</button>
          </div>
        </div>

        <button style={styles.newOrderBtn} onClick={() => navigate('/')}>
          Hacer otro pedido
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9f9f9' },
  trackingHeader: { backgroundColor: '#1D9E75', padding: '20px 16px 16px', color: '#fff' },
  trackingTitle: { fontSize: 18, fontWeight: 600, marginBottom: 4 },
  trackingSub: { fontSize: 13, opacity: 0.85 },
  content: { flex: 1, padding: 16 },
  steps: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 16 },
  step: { display: 'flex', gap: 12, marginBottom: 4 },
  stepLineWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  stepDot: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  stepConnector: { width: 2, flex: 1, minHeight: 24, margin: '4px 0' },
  stepInfo: { paddingTop: 6, paddingBottom: 16 },
  stepName: { fontSize: 14, marginBottom: 2 },
  stepDesc: { fontSize: 12, color: '#aaa' },
  itemsBox: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 14, marginBottom: 16 },
  itemsTitle: { fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#222' },
  itemRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  itemEmoji: { fontSize: 20 },
  itemName: { flex: 1, fontSize: 13, color: '#444' },
  itemQty: { fontSize: 13, color: '#888' },
  itemPrice: { fontSize: 13, fontWeight: 500, color: '#222' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, borderTop: '1px solid #eee', paddingTop: 10, marginTop: 4, color: '#222' },
  riderCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 },
  riderAvatar: { width: 44, height: 44, borderRadius: '50%', backgroundColor: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  riderInfo: { flex: 1 },
  riderName: { fontSize: 14, fontWeight: 600, color: '#222' },
  riderSub: { fontSize: 12, color: '#888' },
  riderActions: { display: 'flex', gap: 8 },
  riderBtn: { width: 36, height: 36, borderRadius: '50%', border: '1px solid #eee', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 },
  newOrderBtn: { width: '100%', backgroundColor: '#fff', color: '#1D9E75', border: '2px solid #1D9E75', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  loading: { textAlign: 'center', color: '#888', padding: 40 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, padding: '60px 0' },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#888' },
  emptyBtn: { backgroundColor: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, cursor: 'pointer' },
}