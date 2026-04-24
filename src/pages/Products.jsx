import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

export default function Products() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get('category')

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    setLoading(true)
    getProducts(categoryId)
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error(err)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [categoryId])

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

  const filtered = (products || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  const currentCategory = categories.find((c) => c.id === Number(categoryId))

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <button style={styles.backBtn} onClick={() => navigate('/')}>
            ← {currentCategory ? currentCategory.name : 'Catálogo'}
          </button>
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

      <div style={styles.cats}>
        <button
          style={{ ...styles.catChip, ...(categoryId === null ? styles.catChipActive : {}) }}
          onClick={() => setSearchParams({})}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            style={{
              ...styles.catChip,
              ...(Number(categoryId) === cat.id ? styles.catChipActive : {}),
            }}
            onClick={() => setSearchParams({ category: cat.id })}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}>Cargando productos...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.loading}>No se encontraron productos</div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((product) => (
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
  container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9f9f9' },
  header: { backgroundColor: '#fff', padding: '14px 16px 10px', borderBottom: '1px solid #eee' },
  headerTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  backBtn: { background: 'none', border: 'none', fontSize: 15, fontWeight: 600, color: '#222', cursor: 'pointer' },
  cartBtn: { position: 'relative', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#1D9E75', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 },
  search: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #eee', fontSize: 14, backgroundColor: '#f5f5f5', outline: 'none' },
  cats: { display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', backgroundColor: '#fff', borderBottom: '1px solid #eee' },
  catChip: { flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: '1px solid #eee', backgroundColor: '#f5f5f5', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' },
  catChipActive: { backgroundColor: '#1D9E75', color: '#fff', border: '1px solid #1D9E75' },
  content: { flex: 1, padding: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  loading: { textAlign: 'center', color: '#888', padding: 40 },
}