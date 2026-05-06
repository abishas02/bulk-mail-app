import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, form);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        toast.success('Welcome back, Admin!');
        onLogin();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.icon}>✉️</div>
        <h1 style={styles.title}>BulkMailer</h1>
        <p style={styles.subtitle}>Admin Login</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              placeholder="admin"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button style={loading ? { ...styles.btn, opacity: 0.6 } : styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={styles.hint}>Default: admin / admin123</p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg)',
    backgroundImage: 'radial-gradient(ellipse at 60% 30%, #6c63ff22 0%, transparent 60%)',
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '20px', padding: '48px', width: '100%', maxWidth: '420px',
    boxShadow: '0 0 60px #6c63ff15',
  },
  icon: { fontSize: '40px', textAlign: 'center', marginBottom: '12px' },
  title: { fontSize: '32px', fontWeight: 800, textAlign: 'center', color: 'var(--text)' },
  subtitle: { textAlign: 'center', color: 'var(--muted)', marginBottom: '36px', fontFamily: 'var(--font-mono)', fontSize: '13px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: {
    background: '#0a0a0f', border: '1px solid var(--border)', borderRadius: '10px',
    padding: '14px 16px', color: 'var(--text)', fontSize: '15px',
    outline: 'none', transition: 'border-color 0.2s',
  },
  btn: {
    background: 'var(--accent)', color: '#fff', border: 'none',
    borderRadius: '10px', padding: '14px', fontSize: '15px',
    fontWeight: 700, cursor: 'pointer', marginTop: '8px',
    transition: 'transform 0.1s, box-shadow 0.2s',
    boxShadow: '0 4px 20px #6c63ff40',
  },
  hint: { textAlign: 'center', color: 'var(--muted)', fontSize: '12px', marginTop: '20px', fontFamily: 'var(--font-mono)' },
};
