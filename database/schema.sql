-- =============================================
-- Database & Tabel untuk Sistem Autentikasi
-- =============================================

CREATE DATABASE IF NOT EXISTS auth_upitra;
USE auth_upitra;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
