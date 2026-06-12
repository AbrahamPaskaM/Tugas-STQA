const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// Middleware
// =============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file frontend dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// Routes
// =============================================
app.use('/api', authRoutes);

// Handle 404 untuk API routes
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.path} tidak ditemukan`
    });
});

// Route utama — langsung ke halaman portfolio (guest mode)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
    });
});

// =============================================
// Start Server
// =============================================
app.listen(PORT, () => {
    console.log(`\n🚀 http://localhost:${PORT}\n`);
});
