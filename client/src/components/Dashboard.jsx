import { useState } from 'react';
import SendMail from './SendMail';
import EmailHistory from './EmailHistory';

export default function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('send');

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>✉️ BulkMailer</div>
        <nav style={styles.nav}>
          <button style={tab === 'send' ? { ...styles.navItem, ...styles.navActive } : styles.navItem} onClick={() => setTab('send')}>
            📤 Send Email
          </button>
          <button style={tab === 'history' ? { ...styles.navItem, ...styles.navActive } : styles.navItem} onClick={() => setTab('history')}>
            📋 History
          </button>
        </nav>
        <button style={styles.logout} onClick={onLogout}>← Logout</button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.content}>
          {tab === 'send' ? <SendMail /> : <EmailHistory />}
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: '240px', background: 'var(--surface)', borderRight: '1px solid var(--border)',
    padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '32px', flexShrink: 0,
  },
  logo: { fontSize: '20px', fontWeight: 800, color: 'var(--text)' },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  navItem: {
    background: 'none', border: 'none', color: 'var(--muted)', textAlign: 'left',
    padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
    fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all 0.15s',
  },
  navActive: { background: '#6c63ff20', color: 'var(--accent)' },
  logout: {
    background: 'none', border: '1px solid var(--border)', borderRadius: '10px',
    color: 'var(--muted)', padding: '10px', cursor: 'pointer', fontSize: '13px',
    fontFamily: 'var(--font-body)',
  },
  main: { flex: 1, overflowY: 'auto', background: 'var(--bg)' },
  content: { maxWidth: '800px', margin: '0 auto', padding: '40px 32px' },
};
