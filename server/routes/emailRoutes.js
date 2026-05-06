const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Email = require('../models/Email');
const { verifyToken } = require('../middleware/auth');


router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
    return res.json({ success: true, token });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});


router.post('/send-email', verifyToken, async (req, res) => {
  const { subject, body, recipients } = req.body;

  if (!subject || !body || !recipients || recipients.length === 0) {
    return res.status(400).json({ message: 'Subject, body, and recipients are required.' });
  }

  // Validate email formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validRecipients = recipients.filter((e) => emailRegex.test(e.trim()));

  if (validRecipients.length === 0) {
    return res.status(400).json({ message: 'No valid email addresses provided.' });
  }

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let successCount = 0;
  let failureCount = 0;
  const results = [];

  // Send emails one by one
  for (const email of validRecipients) {
    try {
      await transporter.sendMail({
        from: `"Bulk Mailer" <${process.env.EMAIL_USER}>`,
        to: email.trim(),
        subject,
        html: body,
      });
      successCount++;
      results.push({ email, status: 'sent' });
    } catch (err) {
      failureCount++;
      results.push({ email, status: 'failed', error: err.message });
    }
  }

  // Determine overall status
  let status = 'sent';
  if (successCount === 0) status = 'failed';
  else if (failureCount > 0) status = 'partial';

  // Save to MongoDB
  try {
    const record = new Email({
      subject,
      body,
      recipients: validRecipients,
      status,
      successCount,
      failureCount,
    });
    await record.save();
  } catch (dbErr) {
    console.error('DB save error:', dbErr.message);
  }

  return res.json({
    message:
      status === 'sent'
        ? 'All emails sent successfully!'
        : status === 'partial'
        ? `Sent: ${successCount}, Failed: ${failureCount}`
        : 'All emails failed to send.',
    status,
    successCount,
    failureCount,
    results,
  });
});


router.get('/email-history', verifyToken, async (req, res) => {
  try {
    const emails = await Email.find().sort({ sentAt: -1 }).limit(50);
    res.json({ emails });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching email history.' });
  }
});


router.delete('/email-history/:id', verifyToken, async (req, res) => {
  try {
    await Email.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting record.' });
  }
});

module.exports = router;
