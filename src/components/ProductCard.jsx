export default function ProductCard({ product, onAdd }) {
  return (
    <div style={styles.card}>
      <div style={styles.img}>{product.emoji}</div>
      <div style={styles.name}>{product.name}</div>
      <div style={styles.brand}>{product.brand}</div>
      <div style={styles.price}>${Number(product.price).toLocaleString('es-AR')}</div>
      <button style={styles.btn} onClick={() => onAdd(product)}>
        + Agregar
      </button>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #eee',
    borderRadius: 12,
    padding: 10,
    minWidth: 130,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  img: {
    fontSize: 36,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: '10px 0',
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    color: '#222',
    marginBottom: 4,
    lineHeight: 1.3,
    fontWeight: 500,
  },
  brand: {
    fontSize: 11,
    color: '#888',
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: 700,
    color: '#222',
    marginBottom: 8,
  },
  btn: {
    backgroundColor: '#1D9E75',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '7px 0',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 'auto',
  },
}