# Dashboard Curah Hujan NTB — berbasis data resmi

## Status data (penting)
Proyek ini **tidak menyertakan angka simulasi**. Saat dibuka, dashboard menunggu file CSV yang diunduh dari sumber resmi. Ini disengaja agar tidak ada angka buatan yang disajikan sebagai hasil pengamatan.

Dalam pemeriksaan sumber pada 29 Oktober 2026:
- Portal NTB Satu Data memuat dataset **“Distribusi Curah Hujan Dasarian Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) Provinsi NTB”**, dengan cakupan Provinsi NTB dan tingkat penyajian pos hujan. Halaman yang terbaca menampilkan 0 baris di tabel, walaupun terdapat tombol unduh Excel/CSV. Karena isi berkas unduhan tidak berhasil diverifikasi dari sesi ini, proyek tidak mengklaim sudah memiliki data pengamatan yang dapat diverifikasi.
- Katalog Stasiun Klimatologi NTB menampilkan parameter curah hujan serta daftar stasiun/pos dan periode data tersedia. Portal Data Online BMKG juga menyediakan parameter RR (curah hujan), dengan akses data iklim melalui akun dan batasan periode tertentu.

## Sumber resmi
1. NTB Satu Data — Distribusi Curah Hujan Dasarian BMKG Provinsi NTB:  
   https://data.ntbprov.go.id/dataset/a00f9138-4b6c-4adc-9135-b5e7984f210a/show
2. Katalog layanan data Stasiun Klimatologi NTB:  
   https://staklim-ntb.bmkg.go.id/pelayanan-data/katalog/instansi
3. BMKG Data Online — ketersediaan data:  
   https://dataonline.bmkg.go.id/ketersediaandata
4. FAQ BMKG Data Online (parameter curah hujan RR dan tata cara akses):  
   https://dataonline.bmkg.go.id/faq

## Cara memperoleh dan memuat data
1. Buka tautan NTB Satu Data di atas. Tekan **Download CSV** jika file tersedia. Periksa isi file dan pastikan kolomnya benar-benar berisi catatan pengamatan, bukan hanya header.
2. Jika unduhan tidak berisi baris data, gunakan portal/katalog layanan data BMKG NTB atau BMKG Data Online untuk memeriksa ketersediaan data curah hujan pada pos/stasiun yang dibutuhkan. Ikuti proses akun/permohonan yang ditetapkan portal.
3. Simpan berkas resmi sebagai CSV.
4. Buka `index.html` di browser atau gunakan Live Server di VS Code.
5. Klik **Pilih file CSV** lalu pilih berkas resmi.
6. Dashboard akan membaca kolom curah hujan dan menampilkan ringkasan, grafik, filter, tabel, serta ekspor hasil filter.

## Struktur folder
- `index.html` — struktur dashboard.
- `style.css` — desain responsif.
- `script.js` — impor CSV, pengolahan, grafik, filter, tabel, dan ekspor.
- `dataset_resmi_belum_diunduh.csv` — template header kosong; **bukan data pengamatan**.
- `LAPORAN_MARKDOWN.md` — dokumentasi dan kode sumber dalam format Markdown.

## Kolom yang dikenali
Dashboard mencoba mengenali variasi nama kolom berikut:
- Pos hujan/stasiun: `Nama Pos Hujan`, `Nama Stasiun`, `Stasiun`
- Kabupaten/kota: `Nama Kabupaten/Kota`, `Kabupaten/Kota`, `Kabupaten`
- Curah hujan: `Curah Hujan (mm)`, `Curah Hujan`, `RR`, `Rainfall`
- Waktu: `Tahun`, `Bulan`, `Dasarian`, `Tanggal`
- Opsional: `Kategori`, `Latitude`, `Longitude`

Jika kolom pada berkas resmi berbeda, sesuaikan alias pada bagian `aliases` di `script.js`.

## Interpretasi
- Curah hujan dipertahankan sesuai nilai yang tercatat dalam berkas sumber.
- Grafik “menurut bulan” menghitung rata-rata dari catatan yang memiliki bulan dan nilai curah hujan valid. Jika sumber berupa data dasarian, hasilnya adalah rata-rata per catatan dasarian, bukan otomatis total curah hujan bulanan.
- Kategori hanya dihitung oleh dashboard jika sumber tidak menyediakan kategori. Ambang kategori sederhana pada kode adalah aturan visual untuk eksplorasi, bukan klasifikasi resmi BMKG. Untuk laporan akademik, utamakan kategori yang disediakan sumber resmi atau tulis dengan jelas metode kategorisasi yang digunakan.
- Pastikan rentang waktu, satuan, nama stasiun, dan kelengkapan catatan ditulis di laporan berdasarkan file yang benar-benar diunduh.

## Keterbatasan yang harus dinyatakan
Pada saat proyek ini disusun, file data mentah berisi catatan pengamatan belum berhasil diverifikasi/diunduh dari sumber publik dalam sesi ini. Karena itu, dashboard siap mengimpor data resmi, tetapi **grafik dan KPI baru terisi setelah pengguna memasukkan file resmi**. Jangan menyatakan bahwa analisis hasil sudah selesai sebelum data asli dimuat.
