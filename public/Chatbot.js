// Mengimpor modul yang diperlukan: 'socket.io' untuk komunikasi real-time dan 'axios' untuk melakukan request HTTP
const { Server } = require('socket.io');
const axios = require('axios');

// Menyediakan fungsi untuk menghubungkan socket.io dengan server dan menangani komunikasi
module.exports = function(io) {
    // Event listener untuk menangani koneksi dari client
    io.on('connection', (socket) => {
        console.log('User connected'); // Menampilkan pesan ketika seorang user terhubung

        // Mendengarkan event 'userMessage' dari client, untuk menerima pesan dari pengguna
        socket.on('userMessage', async (message) => {
            let response = '';  // Variabel untuk menyimpan respons dari bot

            // Mengubah pesan yang diterima menjadi format yang lebih mudah diproses (semua huruf kecil)
            const userSymptom = message.toLowerCase();

            try {
                // Melakukan request ke API Infermedica untuk diagnosis berdasarkan gejala yang diberikan oleh pengguna
                const apiResponse = await axios.post(
                    'https://api.infermedica.com/api/v3/diagnosis',  // URL endpoint API Infermedica
                    {
                        sex: 'male',  // Jenis kelamin, bisa diubah sesuai data pengguna
                        age: 30,      // Umur, sesuaikan dengan data pengguna
                        symptoms: [   // Gejala yang dilaporkan oleh pengguna
                            {
                                id: 's_21',  // ID gejala, misalnya 's_21' adalah untuk sakit kepala
                                source: 'user',  // Menandakan bahwa gejala berasal dari input pengguna
                                value: 1    // Nilai keparahan gejala (1 untuk ringan)
                            }
                        ],
                    },
                    {
                        // Menyertakan header untuk autentikasi dan tipe konten
                        headers: {
                            'App-Id': 'your_infermedica_app_id',  // Ganti dengan App-ID Anda
                            'App-Key': 'your_infermedica_app_key',  // Ganti dengan API Key Anda
                            'Content-Type': 'application/json'     // Tipe konten untuk request
                        }
                    }
                );

                // Mengambil data diagnosis dari respons API
                const diagnosis = apiResponse.data;
                // Mengirimkan diagnosis pertama ke pengguna
                response = `Berdasarkan gejala yang Anda sebutkan, kemungkinan besar Anda mengalami: ${diagnosis.structured.diagnosis[0].name}.`;

            } catch (error) {
                // Jika terjadi kesalahan saat menghubungi API Infermedica, tampilkan pesan error
                console.error('Error contacting Infermedica API:', error);
                response = 'Maaf, terjadi kesalahan saat memproses gejala Anda. Coba lagi nanti.';  // Pesan fallback
            }

            // Mengirimkan respons bot kembali ke client
            socket.emit('botResponse', response);
        });

        // Event listener untuk menangani ketika user terputus (disconnect)
        socket.on('disconnect', () => {
            console.log('User disconnected');  // Menampilkan pesan saat user terputus
        });
    });
};
