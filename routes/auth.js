const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { validateRegister, validateLogin } = require('../middleware/validation');

const router = express.Router();

// =============================================
// Middleware untuk verifikasi JWT token
// =============================================
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token tidak valid'
        });
    }
};

// =============================================
// POST /api/register — Registrasi User Baru
// =============================================
router.post('/register', validateRegister, async (req, res) => {
    try {
        const { nama, email, password } = req.body;
        
        console.log('📥 Request register diterima:');
        console.log('   - Nama:', nama);
        console.log('   - Email:', email);

        // Cek apakah email sudah terdaftar di database
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email.trim().toLowerCase()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                errors: { email: 'Email sudah terdaftar' }
            });
        }

        // Hash password dengan bcrypt (salt round = 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan user baru ke database MySQL
        await pool.query(
            'INSERT INTO users (nama, email, password) VALUES (?, ?, ?)',
            [nama.trim(), email.trim().toLowerCase(), hashedPassword]
        );

        console.log(`✅ User terdaftar: ${nama.trim()} (${email.trim().toLowerCase()})`);

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil! Silakan login.'
        });

    } catch (error) {
        console.error('Error saat registrasi:', error);
        res.status(500).json({
            success: false,
            errors: { general: 'Terjadi kesalahan server. Silakan coba lagi.' }
        });
    }
});

// =============================================
// POST /api/login — Login User
// =============================================
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user berdasarkan email di database
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email.trim().toLowerCase()]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                errors: { email: 'Email tidak terdaftar' }
            });
        }

        const user = rows[0];

        // Verifikasi password dengan hash
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                errors: { password: 'Password salah' }
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, nama: user.nama, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error saat login:', error);
        res.status(500).json({
            success: false,
            errors: { general: 'Terjadi kesalahan server. Silakan coba lagi.' }
        });
    }
});

// =============================================
// POST /api/change-password — Ubah Password User
// =============================================
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;

        // Validasi input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password saat ini dan password baru harus diisi'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password baru minimal 8 karakter'
            });
        }

        // Cari user berdasarkan ID
        const [rows] = await pool.query(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const user = rows[0];

        // Verifikasi password saat ini
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password saat ini salah'
            });
        }

        // Hash password baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password di database
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        console.log(`✅ Password user ID ${userId} berhasil diubah`);

        res.json({
            success: true,
            message: 'Password berhasil diubah'
        });

    } catch (error) {
        console.error('Error saat ubah password:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server. Silakan coba lagi.'
        });
    }
});

module.exports = router;
