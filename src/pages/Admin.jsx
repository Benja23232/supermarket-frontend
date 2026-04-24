import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/index.js'

const STATUSES = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  on_the_way: 'En camino',
  delivered: 'Entregado',
}

const STATUS_COLORS = {
  pending: '#f59e0b',
  preparing: '#3b82f6',
  on_the_way: '#8b5cf6',
  delivered: '#1D9E75',
}

export default function Admin() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('orders')
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    category_id: 1, name: '', brand: '', price: '', emoji: '', stock: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [statsRes, ordersRes, usersRes, productsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/orders'),
        api.get('/admin/users'),
        api.get('/products'),
      ])
      setStats(statsRes.data)
      setOrders(ordersRes.data)
      setUsers(usersRes.data)
      setProducts(productsRes.data)
    } catch (error) {
      console.error(error)
      if (error.response?.status === 403) {
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status })
      setOrders(orders.map((o) => o.id === orderId ? { ...o, status } : o))
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm('¿Seguro que querés eliminar este producto?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      setProducts(products.filter((p) => p.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  async function handleSaveProduct() {
    try {
      if (editingProduct) {
        const res = await api.put(`/admin/products/${editingProduct.id}`, productForm)
        setProducts(products.map((p) => p.id === editingProduct.id ? res.data : p))
      } else {
        const res = await api.post('/admin/products', productForm)
        setProducts([...products, res.data])
      }
      setShowProductForm(false)
      setEditingProduct(null)
      setProductForm({ category_id: 1, name: '', brand: '', price: '', emoji: '', stock: '' })
    } catch (error) {
      console.error(error)
    }
  }

  function handleEditProduct(product) {
    setEditingProduct(product)
    setProductForm({
      category_id: product.category_id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      emoji: product.emoji,
      stock: product.stock,
    })
    setShowProductForm(true)
  }

  if (loading) return <div style={styles.loading}>Cargando panel...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>super<span style={{ color: '#1D9E75' }}>ya</span> admin</div>
        </div>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Volver a la app</button>
      </div>

      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.orders}</div>
            <div style={styles.statLabel}>Pedidos</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.users}</div>
            <div style={styles.statLabel}>Usuarios</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.products}</div>
            <div style={styles.statLabel}>Productos</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>${Number(stats.revenue).toLocaleString('es-AR')}</div>
            <div style={styles.statLabel}>Ingresos</div>
          </div>
        </div>
      )}

      <div style={styles.tabs}>
        {['orders', 'products', 'users'].map((t) => (
          <button
            key={t}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t === 'orders' ? 'Pedidos' : t === 'products' ? 'Productos' : 'Usuarios'}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={styles.empty}>No hay pedidos todavía</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <div>
                      <div style={styles.orderTitle}>Pedido #{order.id}</div>
                      <div style={styles.orderSub}>{order.user_name} · {order.user_email}</div>
                      <div style={styles.orderSub}>{order.address}</div>
                    </div>
                    <div style={styles.orderRight}>
                      <div style={styles.orderTotal}>${Number(order.total).toLocaleString('es-AR')}</div>
                      <div style={{ ...styles.statusBadge, backgroundColor: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status] }}>
                        {STATUSES[order.status]}
                      </div>
                    </div>
                  </div>
                  <div style={styles.statusRow}>
                    <span style={styles.statusLabel}>Cambiar estado:</span>
                    <select
                      style={styles.select}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {Object.entries(STATUSES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'products' && (
          <div>
            <button style={styles.addBtn} onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ category_id: 1, name: '', brand: '', price: '', emoji: '', stock: '' }) }}>
              + Agregar producto
            </button>

            {showProductForm && (
              <div style={styles.form}>
                <div style={styles.formTitle}>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</div>
                <input style={styles.input} placeholder="Nombre" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                <input style={styles.input} placeholder="Marca" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} />
                <input style={styles.input} placeholder="Precio" type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                <input style={styles.input} placeholder="Emoji" value={productForm.emoji} onChange={(e) => setProductForm({ ...productForm, emoji: e.target.value })} />
                <input style={styles.input} placeholder="Stock" type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
                <select style={styles.input} value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })}>
                  <option value={1}>Frutas y verduras</option>
                  <option value={2}>Carnes</option>
                  <option value={3}>Lácteos</option>
                  <option value={4}>Panadería</option>
                  <option value={5}>Limpieza</option>
                  <option value={6}>Bebidas</option>
                  <option value={7}>Snacks</option>
                  <option value={8}>Mascotas</option>
                </select>
                <div style={styles.formBtns}>
                  <button style={styles.saveBtn} onClick={handleSaveProduct}>Guardar</button>
                  <button style={styles.cancelBtn} onClick={() => setShowProductForm(false)}>Cancelar</button>
                </div>
              </div>
            )}

            {products.map((product) => (
              <div key={product.id} style={styles.productRow}>
                <div style={styles.productEmoji}>{product.emoji}</div>
                <div style={styles.productInfo}>
                  <div style={styles.productName}>{product.name}</div>
                  <div style={styles.productSub}>{product.brand} · Stock: {product.stock}</div>
                </div>
                <div style={styles.productPrice}>${Number(product.price).toLocaleString('es-AR')}</div>
                <div style={styles.productActions}>
                  <button style={styles.editBtn} onClick={() => handleEditProduct(product)}>Editar</button>
                  <button style={styles.deleteBtn} onClick={() => handleDeleteProduct(product.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div>
            {users.map((user) => (
              <div key={user.id} style={styles.userCard}>
                <div style={styles.userAvatar}>{user.name.charAt(0).toUpperCase()}</div>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{user.name}</div>
                  <div style={styles.userSub}>{user.email}</div>
                  <div style={styles.userSub}>{user.phone || 'Sin teléfono'} · {user.address || 'Sin dirección'}</div>
                </div>
                <div style={{ ...styles.roleBadge, backgroundColor: user.role === 'admin' ? '#1D9E7520' : '#f5f5f5', color: user.role === 'admin' ? '#1D9E75' : '#888' }}>
                  {user.role}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f9f9f9' },
  header: { backgroundColor: '#fff', padding: '14px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: {},
  logo: { fontSize: 20, fontWeight: 700, color: '#222' },
  backBtn: { background: 'none', border: '1px solid #eee', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', color: '#666' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 20 },
  statCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '16px', textAlign: 'center' },
  statNumber: { fontSize: 22, fontWeight: 700, color: '#222', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#888' },
  tabs: { display: 'flex', backgroundColor: '#fff', borderBottom: '1px solid #eee', padding: '0 20px' },
  tab: { padding: '12px 20px', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: 14, color: '#888' },
  tabActive: { borderBottomColor: '#1D9E75', color: '#1D9E75', fontWeight: 600 },
  content: { padding: 20 },
  orderCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 12 },
  orderHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  orderTitle: { fontSize: 15, fontWeight: 600, color: '#222', marginBottom: 4 },
  orderSub: { fontSize: 12, color: '#888', marginBottom: 2 },
  orderRight: { textAlign: 'right' },
  orderTotal: { fontSize: 16, fontWeight: 700, color: '#222', marginBottom: 6 },
  statusBadge: { fontSize: 12, padding: '4px 10px', borderRadius: 20, fontWeight: 500 },
  statusRow: { display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #eee', paddingTop: 10 },
  statusLabel: { fontSize: 13, color: '#888' },
  select: { padding: '6px 10px', borderRadius: 8, border: '1px solid #eee', fontSize: 13, cursor: 'pointer' },
  addBtn: { backgroundColor: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, cursor: 'pointer', marginBottom: 16, fontWeight: 500 },
  form: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  formTitle: { fontSize: 15, fontWeight: 600, color: '#222', marginBottom: 4 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #eee', fontSize: 14, outline: 'none' },
  formBtns: { display: 'flex', gap: 10 },
  saveBtn: { backgroundColor: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 500 },
  cancelBtn: { backgroundColor: '#f5f5f5', color: '#666', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' },
  productRow: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '12px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 },
  productEmoji: { fontSize: 28, width: 44, height: 44, backgroundColor: '#f5f5f5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: 500, color: '#222' },
  productSub: { fontSize: 12, color: '#888', marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: 700, color: '#222' },
  productActions: { display: 'flex', gap: 8 },
  editBtn: { backgroundColor: '#f5f5f5', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: '#444' },
  deleteBtn: { backgroundColor: '#fef2f2', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: '#dc2626' },
  userCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '12px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 },
  userAvatar: { width: 44, height: 44, borderRadius: '50%', backgroundColor: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#1D9E75' },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: 500, color: '#222' },
  userSub: { fontSize: 12, color: '#888', marginTop: 2 },
  roleBadge: { fontSize: 12, padding: '4px 10px', borderRadius: 20, fontWeight: 500 },
  empty: { textAlign: 'center', color: '#888', padding: 40 },
  loading: { textAlign: 'center', color: '#888', padding: 40 },
}