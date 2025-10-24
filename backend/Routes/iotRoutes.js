const express = require('express');
const router = express.Router();
const { sendLowLevelAlert } = require('../alertController'); // ✅ Import alert helper

// Temporary in-memory storage for tank levels
const tankLevels = [];

// Define alert threshold (percentage)
const ALERT_THRESHOLD = Number(process.env.ALERT_THRESHOLD || 20);

// 📡 POST — Receive data from Arduino / IoT device
router.post('/tank-level', async (req, res) => {
  const { level, email, deviceId } = req.body;

  if (level === undefined || typeof level !== 'number' || level < 0 || level > 100) {
    return res.status(400).json({ success: false, message: 'Invalid level value' });
  }

  console.log(`📡 Received tank level: ${level}%`);
  tankLevels.push({ level, time: new Date() });

  // ✅ Trigger email alert if level below threshold
  try {
    const recipient = email || process.env.ALERT_RECIPIENT;
    const id = deviceId || 'default';

    if (level < ALERT_THRESHOLD && recipient) {
      await sendLowLevelAlert(level, recipient, id);
    }
  } catch (err) {
    console.error('❌ Error sending low-level alert:', err.message);
  }

  res.json({ success: true, message: 'Level received', data: { level } });
});

// 🧾 GET — Return latest 10 tank level entries
router.get('/get-level', (req, res) => {
  res.json({
    success: true,
    data: tankLevels.slice(-10).reverse()
  });
});

module.exports = router;
