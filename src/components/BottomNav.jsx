import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Grid, ShoppingCart, Clock } from 'lucide-react'

export default function BottomNav({ cartCount = 0 }) {
  const navigate = useNavigate()
  const location = useLocation()

  const items = [
    { label: 'Inicio', icon: Home, path: '/' },
    { label: 'Catálogo', icon: Grid, path: '/products' },
    { label: 'Carrito', icon: ShoppingCart, path: '/cart' },
    { label: 'Mi pedido', icon: Clock, path: '/tracking' },
  ]

  return (
    <nav style={styles.nav}>
      {items.map((item) => {
        const active = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...styles.item,
              color: active ? '#1D9E75' : '#888',
            }}
          >
            <div style={styles.iconWrap}>
              <item.icon size={22} />
              {item.path === '/cart' && cartCount > 0 && (
                <span style={styles.badge}>{cartCount}</span>
              )}
            </div>
            <span style={styles.label}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    borderTop: '1px solid #eee',
    backgroundColor: '#fff',
    paddingBottom: 0,
    position: 'sticky',
    bottom: 0,
  },
  item: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '8px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#1D9E75',
    color: '#fff',
    borderRadius: '50%',
    width: 16,
    height: 16,
    fontSize: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
  },
  label: {
    fontSize: 10,
  },
}