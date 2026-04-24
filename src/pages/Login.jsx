import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/index.js'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      setError('Completá todos los campos')
      return
    }
    try {
      setLoading(true)
      setError('')
      const res = await login(email, password)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>super<span style={styles.logoSpan}>ya</span></h1>
        <p style={styles.subtitle}>Ingresá a tu cuenta</p>
      </div>

      <div style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Contraseña</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p style={styles.register}>
          ¿No tenés cuenta?{' '}
          <Link to="/register" style={styles.link}>Registrate</Link>
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
  register: {
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