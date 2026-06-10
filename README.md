# Tugas Testing Login

Aplikasi autentikasi login dan registrasi sederhana yang dibangun dengan **Node.js**, **Express**, dan **MySQL**.

## Struktur Proyek

```
├─ config/                # Konfigurasi koneksi database MySQL
├─ database/              # Skrip schema SQL
├─ middleware/            # Validasi request
├─ public/                # Frontend statis (HTML, CSS, JS)
├─ routes/                # Route API Express
├─ server.js              # Entry point server
├─ package.json           # Metadata dan dependensi
└─ README.md              # Dokumentasi proyek
```

## Persyaratan

- **Node.js** (v14 atau lebih baru)
- **npm**
- **MySQL**

## Konfigurasi

1. Buat file `.env` di root folder dengan isi serupa:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=nama_database
   JWT_SECRET=rahasia_jwt_anda
   PORT=3000
   ```
2. Pastikan database MySQL sudah berjalan dan kredensial sesuai.
3. Jalankan skrip `database/schema.sql` untuk membuat tabel `users`.

## Instalasi

```bash
npm install
```

## Menjalankan Aplikasi

```bash
npm start
```

Akses aplikasi di `http://localhost:3000`.

## Fitur Utama

- Registrasi akun baru
- Login dengan email dan password
- Proteksi route API menggunakan JWT
- Ubah password (endpoint API bersyarat auth)

## Route API

- `POST /api/register` — daftar user baru
- `POST /api/login` — login dan dapatkan token JWT
- `POST /api/change-password` — ubah password (memerlukan header `Authorization: Bearer <token>`)

## Halaman Frontend

- `http://localhost:3000/` — halaman utama / dashboard
- `http://localhost:3000/login.html` — halaman login
- `http://localhost:3000/register.html` — halaman registrasi

## Catatan Penting

- Aplikasi menggunakan MySQL, bukan SQLite.
- Pastikan `JWT_SECRET` di `.env` diisi dengan string yang sulit ditebak.