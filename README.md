# Event Manager

Aplikasi web pengelolaan event menggunakan React + Vite. Antarmuka berbahasa Indonesia, mata uang Rupiah, data contoh, dan penyimpanan lokal di browser.

## Fitur
- Dashboard ringkasan event, peserta, pemasukan dan pengeluaran.
- CRUD event, pencarian dan filter status.
- CRUD peserta yang terhubung dengan event.
- Ubah status pembayaran dan kehadiran langsung dari tabel.
- Laporan keuangan per event, pencatatan pengeluaran, dan saldo bersih.
- Ekspor peserta dan laporan keuangan ke Excel (.xlsx).
- Responsif untuk desktop dan HP.
- Data disimpan melalui localStorage; tidak memerlukan server/database untuk versi demo.

## Persyaratan
- Windows 10/11
- Node.js versi 20 atau lebih baru (disarankan versi LTS)
- npm (ikut terpasang bersama Node.js)

## Menjalankan di Windows
1. Ekstrak `event-manager.zip`.
2. Buka folder `event-manager`.
3. Klik address bar File Explorer, ketik `cmd`, lalu tekan Enter.
4. Jalankan:

   ```bash
   npm install
   npm run dev
   ```

5. Buka URL yang muncul di terminal, biasanya `http://localhost:5173`.
6. Untuk menghentikan server tekan `Ctrl + C`.

## Memeriksa build produksi
```bash
npm run build
npm run preview
```

## Struktur folder
```text
event-manager/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── App.jsx       # halaman, state, modal, dan alur data
    ├── data.js       # data contoh event, peserta, pengeluaran
    ├── main.jsx      # entry point React
    └── styles.css    # seluruh gaya responsif
```

## Catatan penting
- Data disimpan di browser/perangkat yang digunakan. Data tidak otomatis tersinkron antarperangkat dan dapat hilang jika data situs/browser dibersihkan.
- Gunakan ekspor Excel sebagai cadangan data.
- Pemasukan laporan keuangan dihitung dari peserta dengan status `Lunas`. Status `DP` belum dihitung sebagai pemasukan pada versi demo.
- Untuk penggunaan produksi/multi-user, perlu backend/API, database, autentikasi, otorisasi, dan backup.
