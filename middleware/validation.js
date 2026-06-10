// =============================================
// Middleware Validasi Input
// =============================================

// Validasi form registrasi
const validateRegister = (req, res, next) => {
    const { nama, email, password, confirmPassword } = req.body;
    const errors = {};

    // Validasi nama
    if (!nama || nama.trim() === '') {
        errors.nama = 'Nama lengkap wajib diisi';
    }

    // Validasi email
    if (!email || email.trim() === '') {
        errors.email = 'Email wajib diisi';
    } else if (!email.endsWith('@upitra.ac.id')) {
        errors.email = 'Email harus menggunakan domain @upitra.ac.id';
    } else {
        // Validasi format email lebih lanjut
        const emailRegex = /^[a-zA-Z0-9._%+-]+@upitra\.ac.id$/;
        if (!emailRegex.test(email)) {
            errors.email = 'Format email tidak valid';
        }
    }

    // Validasi password
    if (!password) {
        errors.password = 'Password wajib diisi';
    } else if (password.length < 8) {
        errors.password = 'Password minimal 8 karakter';
    }

    // Validasi konfirmasi password
    if (!confirmPassword) {
        errors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Password dan konfirmasi password tidak sama';
    }

    // Jika ada error, kirim response error
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
};

// Validasi form login
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = {};

    // Validasi email
    if (!email || email.trim() === '') {
        errors.email = 'Email wajib diisi';
    } else if (!email.endsWith('@upitra.ac.id')) {
        errors.email = 'Email harus menggunakan domain @upitra.ac.id';
    }

    // Validasi password
    if (!password) {
        errors.password = 'Password wajib diisi';
    }

    // Jika ada error, kirim response error
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
};

module.exports = { validateRegister, validateLogin };
