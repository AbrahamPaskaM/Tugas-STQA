const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    try {
        console.log('🔄 Membuat database dan tabel...\n');

        // Koneksi ke MySQL tanpa database spesifik
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('✅ Terhubung ke MySQL Server\n');

        // Buat database
        console.log('📦 Membuat database: auth_upitra');
        await connection.query('CREATE DATABASE IF NOT EXISTS auth_upitra');
        console.log('✅ Database berhasil dibuat/sudah ada\n');

        // Gunakan database
        await connection.query('USE auth_upitra');

        // Buat tabel users
        console.log('📋 Membuat tabel: users');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                nama VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabel users berhasil dibuat/sudah ada\n');

        // Tampilkan struktur tabel
        const [columns] = await connection.query('DESCRIBE users');
        console.log('📊 Struktur Tabel users:');
        console.table(columns);

        await connection.end();

        console.log('\n✨ Database setup selesai! Server siap dijalankan.');
        console.log('📌 Jalankan: npm start\n');

    } catch (error) {
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('❌ Koneksi ke MySQL hilang');
        } else if (error.code === 'ER_CON_COUNT_ERROR') {
            console.error('❌ Terlalu banyak koneksi ke database');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('❌ Username atau password MySQL salah');
            console.error('   Pastikan .env sudah benar:\n');
            console.error('   DB_HOST=' + process.env.DB_HOST);
            console.error('   DB_USER=' + process.env.DB_USER);
            console.error('   DB_PASSWORD=' + (process.env.DB_PASSWORD ? '[ada]' : '[kosong]'));
        } else if (error.code === 'ER_PARSE_ERROR') {
            console.error('❌ Error SQL:', error.message);
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

setupDatabase();
