import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function EmailHistory() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const API = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/api/email-history`, { headers });
      setEmails(res.data.emails);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    try {
      await axios.delete(`${API}/api/email-history/${id}`, { headers });
      setEmails(emails.filter((e) => e._id !== id));
      toast.success('Record deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const statusColor = (s) => s === 'sent' ? 'var(--success)' : s === 'partial' ? 'var(--warning)' : 'var(--error)';

  if (loading) return <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>Loading history...</div>;
  if (!emails.length) return <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>No emails sent yet.</div>;

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>📋 Email History</h2>
      <p style={styles.sub}>{emails.length} record(s) found</p>

      {emails.map((email) => (
        <div key={email._id} style={styles.card}>
          <div style={styles.cardTop}>
            <div style={{ flex: 1 }}>
              <p style={styles.subject}>{email.subject}</p>
              <p style={styles.meta}>
                {new Date(email.sentAt).toLocaleString()} ·{' '}
                {email.recipients.length} recipient(s) ·{' '}
                ✓ {email.successCount} / ✗ {email.failureCount}
              </p>
            </div>
            <div style={styles.actions}>
              <span style={{ ...styles.badge, color: statusColor(email.status), borderColor: statusColor(email.status) }}>
                {email.status.toUpperCase()}
              </span>
              <button style={styles.expandBtn} onClick={() => setExpanded(expanded === email._id ? null : email._id)}>
                {expanded === email._id ? 'Hide' : 'View'}
              </button>
              <button style={styles.deleteBtn} onClick={() => deleteRecord(email._id)}>
                🗑
              </button>
            </div>
          </div>

          {expanded === email._id && (
            <div style={styles.detail}>
              <p style={styles.detailLabel}>Recipients:</p>
              <div style={styles.emailList}>
                {email.recipients.map((r, i) => (
                  <span key={i} style={styles.emailChip}>{r}</span>
                ))}
              </div>
              <p style={{ ...styles.detailLabel, marginTop: '12px' }}>Body Preview:</p>
              <div style={styles.bodyPreview} dangerouslySetInnerHTML={{ __html: email.body }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '16px' },
  heading: { fontSize: '24px', fontWeight: 800 },
  sub: { color: 'var(--muted)', fontSize: '13px', fontFamily: 'var(--font-mono)' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' },
  cardTop: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  subject: { fontWeight: 700, fontSize: '15px', marginBottom: '6px' },
  meta: { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' },
  actions: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 },
  badge: { border: '1px solid', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)' },
  expandBtn: { background: '#6c63ff20', border: '1px solid #6c63ff40', borderRadius: '8px', color: 'var(--accent)', padding: '6px 14px', cursor: 'pointer', fontSize: '12px' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.7 },
  detail: { marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' },
  detailLabel: { fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 },
  emailList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  emailChip: { background: '#6c63ff15', border: '1px solid #6c63ff30', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' },
  bodyPreview: { background: '#0a0a0f', borderRadius: '8px', padding: '12px', fontSize: '13px', maxHeight: '150px', overflow: 'auto', color: 'var(--text)' },
};
