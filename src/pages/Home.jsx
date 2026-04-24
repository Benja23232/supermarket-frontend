import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../api/index.js'
import BottomNav from '../components/BottomNav.jsx'
import ProductCard from '../components/ProductCard.jsx'

const categories = [
  { id: 1, name: 'Frutas y verduras', emoji: '🥦' },
  { id: 2, name: 'Carnes', emoji: '🥩' },
  { id: 3, name: 'Lácteos', emoji: '🥛' },
  { id: 4, name: 'Panadería', emoji: '🍞' },
  { id: 5, name: 'Limpieza', emoji: '🧹' },
  { id: 6, name: 'Bebidas', emoji: '🧃' },
  { id: 7, name: 'Snacks', emoji: '🍫' },
  { id: 8, name: 'Mascotas', emoji: '🐾' },
]

export default function Home() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error(err)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [])

  function addToCart(product) {
    const exists = cart.find((item) => item.id === product.id)
    let newCart
    if (exists) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      )
    } else {
      newCart = [...cart, { ...product, quantity: 1 }]
    }
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const featured = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      )
    : products.slice(0, 6)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <div style={styles.logo}>super<span style={styles.logoSpan}>ya</span></div>
            <div style={styles.address}>📍 {user?.address || 'Agregá tu dirección'}</div>
          </div>
          <button style={styles.cartBtn} onClick={() => navigate('/cart')}>
            🛒
            {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
          </button>
        </div>
        <input
          style={styles.search}
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={styles.content}>
        {!search && (
          <>
            <div style={styles.banner}>
              <div style={styles.bannerTitle}>Envío gratis hoy 🎉</div>
              <div style={styles.bannerSub}>En pedidos mayores a $15.000 · Llega en 30 min</div>
            </div>

            {user ? (
              <div style={styles.welcomeBar}>
                Hola, <strong>{user.name.split(' ')[0]}</strong> 👋
              </div>
            ) : (
              <button style={styles.loginBar} onClick={() => navigate('/login')}>
                Iniciá sesión para hacer pedidos →
              </button>
            )}

            <div style={styles.sectionTitle}>Categorías</div>
            <div style={styles.categories}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={styles.catCard}
                  onClick={() => navigate(`/products?category=${cat.id}`)}
                >
                  <div style={styles.catIcon}>{cat.emoji}</div>
                  <div style={styles.catLabel}>{cat.name}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={styles.sectionTitle}>
          {search ? `Resultados para "${search}"` : 'Más vendidos'}
        </div>

        {loading ? (
          <div style={styles.loading}>Cargando productos...</div>
        ) : featured.length === 0 ? (
          <div style={styles.loading}>No se encontraron productos</div>
        ) : search ? (
          <div style={styles.grid}>
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
              />
            ))}
          </div>
        ) : (
          <div style={styles.productsRow}>
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav cartCount={cartCount} />
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9f9f9' , paddingBottom: 0 },
  header: { backgroundColor: '#fff', padding: '14px 16px 10px', borderBottom: '1px solid #eee' },
  headerTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  logo: { fontSize: 22, fontWeight: 700, color: '#222' },
  logoSpan: { color: '#1D9E75' },
  address: { fontSize: 12, color: '#888', marginTop: 2 },
  cartBtn: { position: 'relative', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#1D9E75', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 },
  search: { width: '90%', padding: '10px 14px', borderRadius: 10, border: '1px solid #eee', fontSize: 14, backgroundColor: '#f5f5f5', outline: 'none', color: 'black' },
  content: { flex: 1, padding: 16, overflowY: 'auto' },
  banner: { backgroundColor: '#1D9E75', borderRadius: 12, padding: '14px 16px', marginBottom: 16, color: '#fff' },
  bannerTitle: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  bannerSub: { fontSize: 12, opacity: 0.9 },
  welcomeBar: { backgroundColor: '#E1F5EE', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#0F6E56' },
  loginBar: { width: '100%', backgroundColor: '#E1F5EE', border: 'none', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#0F6E56', cursor: 'pointer', textAlign: 'left', fontWeight: 500 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#222', marginBottom: 12 },
  categories: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 },
  catCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '10px 6px', textAlign: 'center', cursor: 'pointer' },
  catIcon: { fontSize: 24, marginBottom: 4 },
  catLabel: { fontSize: 10, color: '#666', lineHeight: 1.3 },
  productsRow: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  loading: { textAlign: 'center', color: '#888', padding: 20 },
}