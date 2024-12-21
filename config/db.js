// Mengimpor mongoose untuk berinteraksi dengan MongoDB
const mongoose = require('mongoose');

// Fungsi untuk menghubungkan ke database MongoDB secara asinkron
const connectDB = async () => {
    try {
        // Mencoba untuk menghubungkan ke MongoDB menggunakan URI yang disediakan dalam variabel lingkungan
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Jika koneksi berhasil, tampilkan pesan di console
        console.log('Koneksi ke database berhasil');
    } catch (error) {
        // Jika ada kesalahan saat menghubungkan, tampilkan pesan kesalahan dan hentikan proses
        console.error('Gagal menghubungkan ke database:', error);
        process.exit(1);  // Menghentikan aplikasi dengan kode keluar 1 (kesalahan)
    }
};

// Mengekspor fungsi connectDB agar dapat digunakan di file lain
module.exports = connectDB;
