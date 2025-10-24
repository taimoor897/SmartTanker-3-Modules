require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');


// Import models and routes
const User = require('./user');
const iotRoutes = require('./Routes/iotRoutes');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ IoT Routes (Main — handles /api/iot/tank-level and /api/iot/get-level)
app.use('/api/iot', iotRoutes);

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// 🧭 Dashboard route (example static data for now)
app.get('/api/dashboard/data', (req, res) => {
  const activeOrders = 2;
  const bookingHistory = [
    { id: 1, date: '2025-10-17', status: 'Delivered' },
    { id: 2, date: '2025-10-18', status: 'Pending' }
  ];

  res.json({
    activeOrders,
    bookingHistory
  });
});

// ✅ Signup route
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Login route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🏡 Root route
app.get('/', (req, res) => res.send('🚀 SmartTanker Backend is running!'));

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
