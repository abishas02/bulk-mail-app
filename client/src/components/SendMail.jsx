import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SendMail() {
  const [form, setForm] = useState({ subject: '', body: '', recipientInput: '' });
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const API = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  const addRecipients = () => {
    const emails = form.recipientInput
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    const unique = [...new Set([...recipients, ...emails])];
    setRecipients(unique);
    setForm({ ...form, recipientInput: '' });
    toast.success(`${emails.length} email(s) added`);
  };

  const removeRecipient = (email) =>
    setRecipients(recipients.filter((r) => r !== email));

  const handleSend = async () => {
    if (!form.subject || !form.body || recipients.length === 0) {
      toast.error('Please fill all fields and add recipients');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(
        `${API}/api/send-email`,
        { subject: form.subject, body: form.body, recipients },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
      toast.success(res.data.message);
      if (res.data.status === 'sent') {
        setForm({ subject: '', body: '', recipientInput: '' });
        setRecipients([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>📤 Send Bulk Email</h2>

      {/* Subject */}
      <div style={styles.field}>
        <label style={styles.label}>Subject</label>
        <input
          style={styles.input}
          placeholder="Enter email subject..."
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
      </div>

      {/* Body */}
      <div style={styles.field}>
        <label style={styles.label}>Email Body (HTML supported)</label>
        <textarea
          style={{ ...styles.input, minHeight: '180px', resize: 'vertical', lineHeight: 1.6 }}
          placeholder="<h1>Hello!</h1> Write your email content here..."
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
      </div>

      {/* Recipients */}
      <div style={styles.field}>
        <label style={styles.label}>Add Recipients (comma, semicolon, or new line)</label>
        <div style={styles.row}>
          <textarea
            style={{ ...styles.input, flex: 1, minHeight: '80px', resize: 'vertical' }}
            placeholder="email1@example.com, email2@example.com..."
            value={form.recipientInput}
            onChange={(e) => setForm({ ...form, recipientInput: e.target.value })}
          />
          <button style={styles.addBtn} onClick={addRecipients}>Add</button>
        </div>
      </div>

      {/* Tag list */}
      {recipients.length > 0 && (
        <div style={styles.tags}>
          <span style={styles.tagCount}>{recipients.length} recipient(s)</span>
          {recipients.map((email) => (
            <span key={email} style={styles.tag}>
              {email}
              <button style={styles.tagX} onClick={() => removeRecipient(email)}>×</button>
            </span>
          ))}
        </div>
      )}

      {/* Send Button */}
      <button
        style={loading ? { ...styles.sendBtn, opacity: 0.6 } : styles.sendBtn}
        onClick={handleSend}
        disabled={loading}
      >
        {loading ? '⏳ Sending...' : `🚀 Send to ${recipients.length} Recipient(s)`}
      </button>

      {/* Result */}
      {result && (
        <div style={{
          ...styles.result,
          borderColor: result.status === 'sent' ? 'var(--success)' : result.status === 'partial' ? 'var(--warning)' : 'var(--error)',
        }}>
          <p style={{ fontWeight: 700, fontSize: '16px' }}>{result.message}</p>
          {result.results && (
            <ul style={{ marginTop: '12px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {result.results.map((r, i) => (
                <li key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: r.status === 'sent' ? 'var(--success)' : 'var(--error)' }}>
                  {r.status === 'sent' ? '✓' : '✗'} {r.email}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '20px' },
  heading: { fontSize: '24px', fontWeight: 800, color: 'var(--text)' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: {
    background: '#0a0a0f', border: '1px solid var(--border)', borderRadius: '10px',
    padding: '14px 16px', color: 'var(--text)', fontSize: '14px', outline: 'none',
    width: '100%',
  },
  row: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  addBtn: {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px',
    padding: '14px 20px', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' },
  tagCount: { fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' },
  tag: {
    background: '#6c63ff20', border: '1px solid #6c63ff40', borderRadius: '20px',
    padding: '4px 12px', fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px',
  },
  tagX: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '14px', lineHeight: 1 },
  sendBtn: {
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff',
    border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px',
    fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 30px #6c63ff30',
  },
  result: {
    background: '#0a0a0f', border: '1px solid', borderRadius: '12px',
    padding: '20px', maxHeight: '250px', overflowY: 'auto',
  },
};
