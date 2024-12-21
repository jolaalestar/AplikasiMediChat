require('dotenv').config();  // Memuat file .env yang berisi variabel lingkungan (seperti PORT, MONGODB_URI, dll) agar dapat digunakan dalam aplikasi.

const express = require('express');  // Mengimpor pustaka Express.js untuk membangun server web.
const path = require('path');  // Mengimpor pustaka path untuk memanipulasi dan membangun jalur file dan direktori.
const nodemailer = require('nodemailer');  // Mengimpor Nodemailer untuk mengirim email.
const { Server } = require('socket.io');  // Mengimpor Server dari Socket.IO untuk komunikasi waktu nyata antara server dan klien.
const http = require('http');  // Mengimpor pustaka http untuk membuat server HTTP.
const connectDB = require('./config/db');  // Mengimpor fungsi connectDB untuk menghubungkan aplikasi ke MongoDB.
const chatbot = require('./public/Chatbot');  // Mengimpor logika chatbot dari folder 'public' yang mengelola interaksi chatbot.

// Membuat instance aplikasi Express
const app = express();
// Membuat server HTTP menggunakan aplikasi Express
const server = http.createServer(app);
// Membuat instance Socket.IO yang menghubungkan server dengan klien
const io = new Server(server);

// Middleware untuk mengolah body data dalam format JSON dan URL-encoded
app.use(express.json());  // Untuk mengolah data JSON yang dikirim melalui request.
app.use(express.urlencoded({ extended: true }));  // Untuk mengolah data URL-encoded (seperti data form HTML).

// Menyajikan file statis (HTML, CSS, JS) dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));  // Middleware ini memungkinkan server untuk melayani file statis seperti gambar, file HTML, CSS, dan JS.


// Rute untuk halaman utama (home), ketika mengakses root ('/'), akan mengirim file 'index.html' yang ada di folder 'public'.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Mengirim file index.html sebagai respons.
});

// Menghubungkan ke MongoDB menggunakan fungsi connectDB (dengan URL koneksi yang terdapat di .env)
connectDB();  // Menggunakan MONGODB_URI dari file .env yang telah dimuat dengan dotenv.


// Konfigurasi transporter untuk Nodemailer menggunakan kredensial dari .env
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Menggunakan layanan Gmail untuk mengirim email.
    auth: {
        user: process.env.EMAIL_USER,  // Mengambil email pengguna dari variabel lingkungan yang telah diset di file .env.
        pass: process.env.EMAIL_PASS  // Mengambil password pengguna dari variabel lingkungan yang telah diset di file .env.
    }
});

// Rute untuk mengirim pesan email, dengan menerima data melalui request body
app.post('/kirim-email', (req, res) => {
    const { ke, subjek, pesan } = req.body;  // Menyusun data yang dikirim oleh pengguna, seperti alamat email tujuan, subjek, dan pesan.

    // Menyusun opsi email yang akan dikirimkan
    const mailOptions = {
        from: process.env.EMAIL_USER,  // Alamat email pengirim
        to: ke,  // Alamat email penerima
        subject: subjek,  // Subjek email
        text: pesan  // Isi pesan email
    };

    // Mengirim email menggunakan Nodemailer
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error mengirim email:", error.message);  // Menangani error jika pengiriman email gagal
            return res.status(500).json({ success: false, message: 'Gagal mengirim email' });  // Menanggapi dengan error
        }
        res.status(200).json({ success: true, message: 'Email terkirim', info: info.response });  // Menanggapi dengan sukses jika email terkirim.
    });
});

// Menyambungkan chatbot ke Socket.IO
chatbot(io);  // Menyambungkan logika chatbot dengan instance Socket.IO, memungkinkan interaksi chatbot berbasis web socket.


// Menentukan port yang digunakan dan menjalankan server
const port = process.env.PORT || 3000;  // Menggunakan PORT yang diambil dari file .env atau 3000 sebagai fallback.
server.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);  // Menampilkan pesan bahwa server berjalan dan mendengarkan pada port yang ditentukan.
});
