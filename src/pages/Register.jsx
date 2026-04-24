import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/index.js'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(field, value) {
    setForm({ ...form, [field]: value })
  }

  async function handleRegister() {
    if (!form.name || !form.email || !form.password) {
      setError('Nombre, email y contraseña son obligatorios')
      return
    }
    try {
      setLoading(true)
      setError('')
      const res = await register(form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>super<span style={styles.logoSpan}>ya</span></h1>
        <p style={styles.subtitle}>Creá tu cuenta</p>
      </div>

      <div style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Nombre completo *</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Juan Pérez"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email *</label>
          <input
            style={styles.input}
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Contraseña *</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Teléfono</label>
          <input
            style={styles.input}
            type="tel"
            placeholder="221 000 0000"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Dirección de entrega</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Av. 51 1234, La Plata"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p style={styles.login}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={styles.link}>Ingresá</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    padding: '40px 24px',
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  header: {
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 600,
    color: '#222',
    margin: 0,
  },
  logoSpan: {
    color: '#1D9E75',
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    marginTop: 6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#444',
  },
  input: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #ddd',
    fontSize: 15,
    outline: 'none',
  },
  btn: {
    backgroundColor: '#1D9E75',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '14px',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 8,
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
  },
  login: {
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
  },
  link: {
    color: '#1D9E75',
    fontWeight: 500,
    textDecoration: 'none',
  },
}