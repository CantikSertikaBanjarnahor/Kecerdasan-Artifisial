# Dashboard Website Curah Hujan Nusa Tenggara Barat (NTB)

## Tujuan
Menyusun dashboard web untuk membantu eksplorasi curah hujan di Provinsi Nusa Tenggara Barat melalui ringkasan statistik, grafik, filter, dan tabel data.

## Sumber dan status dataset
Sumber resmi yang dituju adalah portal NTB Satu Data pada dataset “Distribusi Curah Hujan Dasarian Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) Provinsi NTB”, serta katalog layanan data Stasiun Klimatologi NTB. Tautan:
- https://data.ntbprov.go.id/dataset/a00f9138-4b6c-4adc-9135-b5e7984f210a/show
- https://staklim-ntb.bmkg.go.id/pelayanan-data/katalog/instansi
- https://dataonline.bmkg.go.id/ketersediaandata

**Catatan kejujuran data:** halaman dataset NTB Satu Data yang diperiksa menampilkan 0 baris pada tabel. Tombol unduh CSV/Excel tampak tersedia, tetapi isi berkas tidak berhasil diverifikasi dalam proses penyusunan ini. Oleh sebab itu, proyek tidak memasukkan data simulasi dan tidak mengklaim telah menganalisis catatan observasi yang belum diperoleh. Untuk menampilkan hasil, unduh data dari sumber resmi dan muat CSV melalui dashboard.

## Fitur
1. Impor CSV.
2. KPI: jumlah catatan valid, rata-rata, maksimum, dan jumlah pos unik.
3. Grafik tren bulanan, rata-rata per kabupaten/kota, dan kategori.
4. Filter kabupaten/kota, tahun, dan pos hujan.
5. Tabel pratinjau serta ekspor hasil filter ke CSV.
6. Tampilan responsif untuk desktop dan perangkat seluler.

## Cara menjalankan
1. Ekstrak folder proyek.
2. Buka folder di Visual Studio Code.
3. Jalankan `index.html` di browser atau gunakan ekstensi Live Server.
4. Pilih CSV resmi melalui tombol **Pilih file CSV**.
5. Periksa hasil dan bandingkan nama kolom/satuan dengan berkas sumber.

## Batasan analisis
Jika data sumber merupakan data dasarian, grafik bulanan di dashboard menghitung rata-rata catatan dasarian per bulan. Nilai tersebut bukan total bulanan. Untuk menghitung total curah hujan bulanan, metode agregasi harus disesuaikan dengan karakteristik data sumber dan petunjuk BMKG.

---

# Kode sumber

## 1. `index.html`

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Curah Hujan NTB | Data Resmi</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
</head>
<body>
  <aside class="sidebar">
    <div class="brand"><div class="brand-icon">☁</div><div><b>RainScope</b><small>NTB • Dashboard Iklim</small></div></div>
    <div class="side-label">MENU UTAMA</div>
    <a class="nav active" href="#ringkasan">▦ <span>Ringkasan</span></a>
    <a class="nav" href="#analisis">◷ <span>Analisis Curah Hujan</span></a>
    <a class="nav" href="#data">▤ <span>Tabel Data</span></a>
    <div class="sidebar-note"><b>Sumber data</b><p>BMKG / NTB Satu Data</p><a href="https://data.ntbprov.go.id/dataset/a00f9138-4b6c-4adc-9135-b5e7984f210a/show" target="_blank" rel="noopener">Buka dataset resmi ↗</a></div>
  </aside>

  <main class="main">
    <header class="topbar">
      <div><div class="eyebrow">MONITORING IKLIM REGIONAL</div><h1>Dashboard Curah Hujan NTB</h1><p class="subtitle">Eksplorasi data pengamatan curah hujan di Nusa Tenggara Barat.</p></div>
      <div class="status-pill"><span class="status-dot"></span> Dataset resmi • impor CSV</div>
    </header>

    <section class="notice" id="sourceNotice">
      <div class="notice-icon">i</div>
      <div><b>Data resmi belum dimuat</b><p>Unggah CSV yang diunduh dari portal resmi BMKG atau NTB Satu Data. Dashboard ini tidak membuat angka contoh atau menganggap data simulasi sebagai pengamatan.</p></div>
      <a href="https://data.ntbprov.go.id/dataset/a00f9138-4b6c-4adc-9135-b5e7984f210a/show" target="_blank" rel="noopener">Buka sumber ↗</a>
    </section>

    <section class="upload-panel" id="ringkasan">
      <div class="upload-copy"><span class="section-kicker">MULAI ANALISIS</span><h2>Masukkan dataset resmi</h2><p>Unggah file CSV dari portal. Kolom yang dikenali antara lain <code>Nama Pos Hujan</code>, <code>Nama Kabupaten/Kota</code>, <code>Curah Hujan (mm)</code>, <code>Bulan</code>, <code>Tahun</code>, dan <code>Dasarian</code>.</p></div>
      <label class="upload-button" for="csvFile">↑ Pilih file CSV</label>
      <input id="csvFile" type="file" accept=".csv,text/csv">
      <div id="fileName" class="file-name">Belum ada file dipilih</div>
      <button id="resetBtn" class="button button-light" type="button">Reset</button>
    </section>

    <section class="kpi-grid">
      <article class="kpi"><div class="kpi-top"><span>Total catatan</span><span class="kpi-icon blue">▤</span></div><div id="kpiRecords" class="kpi-value">—</div><div class="kpi-foot">Baris data valid</div></article>
      <article class="kpi"><div class="kpi-top"><span>Rata-rata curah hujan</span><span class="kpi-icon teal">≈</span></div><div id="kpiAverage" class="kpi-value">—</div><div class="kpi-foot">mm per catatan</div></article>
      <article class="kpi"><div class="kpi-top"><span>Curah hujan tertinggi</span><span class="kpi-icon orange">↑</span></div><div id="kpiMax" class="kpi-value">—</div><div id="kpiMaxLabel" class="kpi-foot">Menunggu data</div></article>
      <article class="kpi"><div class="kpi-top"><span>Pos hujan terdata</span><span class="kpi-icon purple">⌖</span></div><div id="kpiStations" class="kpi-value">—</div><div class="kpi-foot">Pos unik pada file</div></article>
    </section>

    <section class="filter-panel">
      <div><span class="section-kicker">FILTER DATA</span><h2>Atur tampilan analisis</h2></div>
      <label>Kabupaten/Kota<select id="districtFilter"><option value="">Semua wilayah</option></select></label>
      <label>Tahun<select id="yearFilter"><option value="">Semua tahun</option></select></label>
      <label>Pos hujan<select id="stationFilter"><option value="">Semua pos</option></select></label>
      <button id="clearFilters" class="button button-light" type="button">Hapus filter</button>
    </section>

    <section class="chart-grid" id="analisis">
      <article class="chart-card chart-wide"><div class="card-heading"><div><span class="section-kicker">TREN</span><h3>Curah hujan menurut bulan</h3></div><span class="chart-unit">mm</span></div><div class="chart-wrap"><canvas id="monthlyChart"></canvas><div class="empty-overlay" id="monthlyEmpty">Unggah dataset resmi untuk menampilkan grafik.</div></div></article>
      <article class="chart-card"><div class="card-heading"><div><span class="section-kicker">PERBANDINGAN</span><h3>Rata-rata per kabupaten/kota</h3></div></div><div class="chart-wrap"><canvas id="districtChart"></canvas><div class="empty-overlay" id="districtEmpty">Data belum dimuat.</div></div></article>
      <article class="chart-card"><div class="card-heading"><div><span class="section-kicker">DISTRIBUSI</span><h3>Kategori curah hujan</h3></div></div><div class="chart-wrap"><canvas id="categoryChart"></canvas><div class="empty-overlay" id="categoryEmpty">Data belum dimuat.</div></div></article>
    </section>

    <section class="table-card" id="data">
      <div class="table-head"><div><span class="section-kicker">DATA SUMBER</span><h2>Pratinjau tabel pengamatan</h2><p id="tableSummary">Belum ada data untuk ditampilkan.</p></div><button id="exportBtn" class="button button-dark" type="button" disabled>↓ Ekspor hasil CSV</button></div>
      <div class="table-scroll"><table><thead><tr><th>Pos Hujan</th><th>Kabupaten/Kota</th><th>Tahun</th><th>Bulan</th><th>Dasarian</th><th>Curah Hujan (mm)</th><th>Kategori</th></tr></thead><tbody id="tableBody"><tr><td colspan="7" class="empty-row">Unggah CSV resmi untuk melihat catatan.</td></tr></tbody></table></div>
      <div class="table-foot"><span id="pageInfo">0 catatan</span><div class="pager"><button id="prevPage" type="button" disabled>←</button><button id="nextPage" type="button" disabled>→</button></div></div>
    </section>

    <footer><span>RainScope NTB · Dashboard analisis curah hujan</span><span>Data harus bersumber dari pengamatan resmi dan mencantumkan atribusi.</span></footer>
  </main>
  <script src="script.js"></script>
</body>
</html>
```

## 2. `style.css`

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
:root{--navy:#10263f;--ink:#1d3046;--muted:#738196;--line:#e6edf3;--bg:#f5f8fb;--teal:#13a89e;--blue:#4d80e6;--orange:#f0a34a;--purple:#8c72d8}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:'DM Sans',sans-serif;font-size:14px}.sidebar{width:236px;background:#10263f;color:#eaf1f7;position:fixed;inset:0 auto 0 0;padding:28px 18px;display:flex;flex-direction:column;z-index:3}.brand{display:flex;align-items:center;gap:11px;padding:0 8px 32px}.brand-icon{height:40px;width:40px;display:grid;place-items:center;background:#1c5264;border-radius:13px;color:#76e0d6;font-size:24px}.brand b{display:block;font:800 18px Manrope,sans-serif;letter-spacing:-.5px}.brand small{display:block;color:#9eb2c6;margin-top:4px;font-size:11px}.side-label,.section-kicker,.eyebrow{font-size:10px;letter-spacing:1.5px;font-weight:700;color:#8797aa}.side-label{padding:0 12px 12px}.nav{display:flex;align-items:center;gap:13px;padding:13px 12px;border-radius:10px;color:#aebfd0;text-decoration:none;margin:2px 0;font-weight:600}.nav.active,.nav:hover{background:#1b3b54;color:white}.nav.active{box-shadow:inset 3px 0 #29c3b4}.sidebar-note{margin-top:auto;border:1px solid #2a435b;background:#172f48;border-radius:12px;padding:15px;font-size:12px}.sidebar-note b{font-size:12px}.sidebar-note p{color:#aabccd;line-height:1.5}.sidebar-note a{color:#64d5cb;text-decoration:none;font-weight:700}.main{margin-left:236px;padding:34px 38px 24px;max-width:1600px}.topbar{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:25px}.eyebrow{color:#15a99f;margin-bottom:10px}.topbar h1{font:800 29px Manrope,sans-serif;letter-spacing:-1.1px;margin:0 0 8px;color:#132b43}.subtitle{color:var(--muted);margin:0}.status-pill{background:white;border:1px solid var(--line);border-radius:30px;padding:10px 13px;font-size:11px;color:#566b80;white-space:nowrap}.status-dot{display:inline-block;width:7px;height:7px;background:#13a89e;border-radius:50%;margin-right:7px}.notice{display:flex;align-items:center;gap:13px;padding:16px 18px;border:1px solid #f0d7a9;background:#fff9ed;border-radius:13px;margin-bottom:20px}.notice-icon{display:grid;place-items:center;flex-shrink:0;width:29px;height:29px;border-radius:50%;background:#f8e6bf;color:#916018;font-weight:800}.notice b{font-size:13px;color:#76521b}.notice p{font-size:12px;color:#8c744e;margin:4px 0 0;line-height:1.5}.notice>a{margin-left:auto;color:#976519;text-decoration:none;font-size:12px;font-weight:700;white-space:nowrap}.upload-panel{display:flex;align-items:center;gap:15px;flex-wrap:wrap;background:#fff;border:1px solid var(--line);border-radius:14px;padding:21px 23px;margin-bottom:20px}.upload-copy{flex:1;min-width:260px}.upload-copy h2,.filter-panel h2,.table-head h2{font:700 18px Manrope,sans-serif;margin:6px 0;color:#183149}.upload-copy p{margin:0;max-width:660px;color:var(--muted);font-size:12px;line-height:1.65}.upload-copy code{background:#f1f5f8;padding:2px 4px;border-radius:4px;color:#315c76}.upload-button{background:#102f4a;color:#fff;padding:12px 17px;border-radius:9px;font-weight:700;cursor:pointer;font-size:12px;white-space:nowrap}.upload-button:hover{background:#194566}#csvFile{display:none}.file-name{font-size:11px;color:var(--muted);max-width:160px;overflow-wrap:anywhere}.button{border:0;border-radius:8px;padding:11px 14px;font:700 12px 'DM Sans',sans-serif;cursor:pointer}.button:disabled{opacity:.4;cursor:not-allowed}.button-light{background:#f1f5f8;color:#526579}.button-dark{background:#102f4a;color:#fff}.kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin-bottom:20px}.kpi{background:#fff;border:1px solid var(--line);border-radius:13px;padding:19px 19px 16px;min-width:0}.kpi-top{display:flex;justify-content:space-between;align-items:center;color:#6c7e91;font-size:12px;font-weight:600;gap:8px}.kpi-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-size:19px}.blue{background:#e9f0ff;color:#4d80e6}.teal{background:#e2f8f4;color:#13a89e}.orange{background:#fff0de;color:#d98a2e}.purple{background:#f0eaff;color:#8c72d8}.kpi-value{font:800 27px Manrope,sans-serif;color:#183149;letter-spacing:-1px;margin:15px 0 5px;overflow:hidden;text-overflow:ellipsis}.kpi-foot{font-size:11px;color:#95a2b1}.filter-panel{display:flex;align-items:end;gap:14px;flex-wrap:wrap;background:#fff;border:1px solid var(--line);border-radius:13px;padding:18px 20px;margin-bottom:20px}.filter-panel>div{margin-right:auto}.filter-panel h2{margin-bottom:0}.filter-panel label{display:flex;flex-direction:column;gap:7px;font-size:11px;color:#718196;font-weight:700}.filter-panel select{min-width:150px;max-width:220px;border:1px solid #dfe7ee;background:#fff;border-radius:8px;padding:10px;color:#31485e;font:500 12px 'DM Sans',sans-serif}.chart-grid{display:grid;grid-template-columns:1.35fr 1fr;gap:16px;margin-bottom:20px}.chart-card,.table-card{background:#fff;border:1px solid var(--line);border-radius:13px;padding:21px;min-width:0}.chart-wide{grid-column:1/-1}.card-heading{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:15px}.card-heading h3{font:700 16px Manrope,sans-serif;margin:6px 0 0;color:#1c354d}.chart-unit{font-size:10px;color:#6d8093;background:#f2f6f9;padding:6px 9px;border-radius:6px}.chart-wrap{height:255px;position:relative}.chart-wide .chart-wrap{height:275px}.empty-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:25px;color:#8998a8;font-size:12px;background:rgba(255,255,255,.9);border:1px dashed #dce5ec;border-radius:9px;pointer-events:none}.table-card{padding:0;overflow:hidden}.table-head{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:21px 22px;border-bottom:1px solid var(--line)}.table-head h2{margin-bottom:5px}.table-head p{margin:0;color:#8795a4;font-size:11px}.table-scroll{overflow-x:auto}table{border-collapse:collapse;width:100%;white-space:nowrap;font-size:12px}thead{background:#f7f9fb;color:#708195}th{text-align:left;font-size:10px;letter-spacing:.4px;text-transform:uppercase;padding:13px 17px}td{padding:13px 17px;border-top:1px solid #edf1f5;color:#4e6175}tbody tr:hover{background:#f8fbfd}.empty-row{text-align:center;padding:32px;color:#96a3b1}.table-foot{display:flex;align-items:center;justify-content:space-between;padding:13px 20px;color:#8291a1;font-size:11px;border-top:1px solid var(--line)}.pager{display:flex;gap:6px}.pager button{border:1px solid #dfe7ee;background:white;border-radius:6px;padding:6px 10px;color:#425a70;cursor:pointer}.pager button:disabled{opacity:.4;cursor:not-allowed}footer{display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap;padding:22px 3px 0;color:#95a1ae;font-size:10px}
@media(max-width:1100px){.main{padding:26px 22px}.sidebar{width:205px}.main{margin-left:205px}.kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.chart-grid{grid-template-columns:1fr}.chart-wide{grid-column:auto}.filter-panel>div{width:100%}}
@media(max-width:720px){.sidebar{position:static;width:auto;padding:15px 16px;flex-direction:row;align-items:center;gap:8px}.brand{padding:0;margin-right:auto}.brand-icon{width:34px;height:34px}.side-label,.sidebar-note,.nav span{display:none}.nav{padding:10px;margin:0}.main{margin:0;padding:22px 14px}.topbar{display:block}.topbar h1{font-size:25px}.status-pill{display:inline-block;margin-top:15px}.notice{align-items:flex-start;flex-wrap:wrap}.notice>a{margin-left:42px}.upload-panel{align-items:flex-start}.upload-copy{flex-basis:100%}.kpi-grid{gap:10px}.kpi{padding:14px}.kpi-value{font-size:23px}.filter-panel label{flex:1;min-width:130px}.filter-panel select{min-width:0;width:100%}.chart-card{padding:15px}.table-head{align-items:flex-start;flex-direction:column}.chart-wrap{height:235px}.chart-wide .chart-wrap{height:250px}footer{line-height:1.5}}

```

## 3. `script.js`

```javascript
const $ = (id) => document.getElementById(id);
let allRows = [];
let filteredRows = [];
let page = 0;
const pageSize = 10;
let charts = {};

const aliases = {
  station: ['nama pos hujan','pos hujan','nama stasiun','stasiun','station','station name'],
  district: ['nama kabupaten/kota','kabupaten/kota','kabupaten','kota','nama kabupaten','wilayah','district'],
  rainfall: ['curah hujan (mm)','curah hujan','curah_hujan','rr','rainfall','rainfall (mm)','nilai curah hujan'],
  month: ['bulan','month'],
  year: ['tahun','year'],
  decade: ['dasarian','periode dasarian'],
  category: ['kategori','category'],
  date: ['tanggal','date','tanggal pengamatan'],
  lat: ['latitude','lintang'],
  lon: ['longitude','bujur']
};

function normalizeKey(value){ return String(value ?? '').toLowerCase().trim().replace(/[_-]+/g,' ').replace(/\s+/g,' '); }
function getField(row, key){
  const keys = Object.keys(row);
  const normalized = keys.map(k => [k, normalizeKey(k)]);
  for (const alias of aliases[key] || []) {
    const found = normalized.find(([original, norm]) => norm === normalizeKey(alias));
    if (found) return row[found[0]];
  }
  return '';
}
function num(value){
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  let s = String(value ?? '').trim();
  if (!s || ['-','na','n/a','null','nan','tidak ada'].includes(s.toLowerCase())) return null;
  s = s.replace(/\s/g,'');
  if (s.includes(',') && !s.includes('.')) s = s.replace(',','.');
  else s = s.replace(/,/g,'');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function monthNumber(value){
  const s = String(value ?? '').trim().toLowerCase();
  const months = {'januari':1,'jan':1,'februari':2,'feb':2,'maret':3,'mar':3,'april':4,'apr':4,'mei':5,'may':5,'juni':6,'jun':6,'juli':7,'jul':7,'agustus':8,'agu':8,'ags':8,'aug':8,'september':9,'sep':9,'oktober':10,'okt':10,'oct':10,'november':11,'nov':11,'desember':12,'des':12,'dec':12};
  const parsed = Number(s);
  if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 12) return parsed;
  return months[s] || null;
}
function normalizeRows(raw){
  return raw.map((r, idx) => {
    const rainfall = num(getField(r,'rainfall'));
    const year = num(getField(r,'year'));
    const monthRaw = getField(r,'month');
    const dateRaw = getField(r,'date');
    let month = monthNumber(monthRaw);
    if (!month && dateRaw) {
      const d = new Date(dateRaw);
      if (!Number.isNaN(d.getTime())) month = d.getMonth()+1;
    }
    let date = dateRaw ? String(dateRaw).trim() : '';
    const row = {
      station: String(getField(r,'station') || 'Tidak disebutkan').trim(),
      district: String(getField(r,'district') || 'Tidak disebutkan').trim(),
      rainfall, year: year ? Math.trunc(year) : null,
      month, monthName: month ? ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][month-1] : String(monthRaw || '—'),
      decade: String(getField(r,'decade') || '—').trim(),
      category: String(getField(r,'category') || '').trim(),
      date, lat: num(getField(r,'lat')), lon: num(getField(r,'lon')),
      raw: r, sourceIndex: idx
    };
    if (!row.category && rainfall !== null) row.category = categoryFor(rainfall);
    return row;
  }).filter(r => r.rainfall !== null && r.rainfall >= 0);
}
function categoryFor(v){
  if (v === 0) return 'Tidak ada hujan';
  if (v < 20) return 'Rendah';
  if (v < 50) return 'Sedang';
  if (v < 100) return 'Tinggi';
  return 'Sangat tinggi';
}
function fmt(v, digits=1){ return Number(v).toLocaleString('id-ID',{maximumFractionDigits:digits}); }
function setStatus(hasData, text){
  $('sourceNotice').querySelector('b').textContent = hasData ? 'Data berhasil dimuat' : 'Data resmi belum dimuat';
  $('sourceNotice').querySelector('p').textContent = text;
  $('sourceNotice').style.background = hasData ? '#effaf6' : '#fff9ed';
  $('sourceNotice').style.borderColor = hasData ? '#bfe8d7' : '#f0d7a9';
}
function uniqueSorted(values){
  return [...new Set(values.filter(v => v !== null && v !== '' && v !== 'Tidak disebutkan'))].sort((a,b)=>String(a).localeCompare(String(b),'id',{numeric:true}));
}
function populateFilters(){
  const specs = [
    ['districtFilter', uniqueSorted(allRows.map(r=>r.district))],
    ['yearFilter', uniqueSorted(allRows.map(r=>r.year)).sort((a,b)=>a-b)],
    ['stationFilter', uniqueSorted(allRows.map(r=>r.station))]
  ];
  specs.forEach(([id, vals])=>{
    const select=$(id), old=select.value;
    select.innerHTML = `<option value="">${id==='districtFilter'?'Semua wilayah':id==='yearFilter'?'Semua tahun':'Semua pos'}</option>`;
    vals.forEach(v=>{ const o=document.createElement('option'); o.value=String(v); o.textContent=String(v); select.appendChild(o); });
    if (vals.map(String).includes(old)) select.value=old;
  });
}
function applyFilters(){
  const district=$('districtFilter').value, year=$('yearFilter').value, station=$('stationFilter').value;
  filteredRows=allRows.filter(r=>(!district||r.district===district)&&(!year||String(r.year)===year)&&(!station||r.station===station));
  page=0; renderAll();
}
function updateKpis(rows){
  const valid=rows.filter(r=>r.rainfall!==null);
  $('kpiRecords').textContent=fmt(valid.length,0);
  $('kpiAverage').textContent=valid.length?fmt(valid.reduce((s,r)=>s+r.rainfall,0)/valid.length,2):'—';
  const max=valid.length?valid.reduce((a,b)=>a.rainfall>b.rainfall?a:b):null;
  $('kpiMax').textContent=max?`${fmt(max.rainfall,2)} mm`:'—';
  $('kpiMaxLabel').textContent=max?`${max.station} · ${max.year ?? 'tahun tidak tersedia'}`:'Menunggu data';
  $('kpiStations').textContent=valid.length?fmt(new Set(valid.map(r=>r.station)).size,0):'—';
}
function chartDefaults(){
  return {responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{usePointStyle:true,boxWidth:7,color:'#708195',font:{family:'DM Sans',size:10}}}},scales:{x:{grid:{display:false},ticks:{color:'#7f8fa0',font:{family:'DM Sans',size:10},maxRotation:0}},y:{beginAtZero:true,grid:{color:'#edf1f5'},ticks:{color:'#7f8fa0',font:{family:'DM Sans',size:10}}}}};
}
function replaceChart(id, config){
  if(charts[id]) charts[id].destroy();
  charts[id]=new Chart($(id),config);
}
function showEmpty(id, show){ $(id).style.display=show?'flex':'none'; }
function renderCharts(rows){
  const valid=rows.filter(r=>r.rainfall!==null);
  const monthNames=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const monthAgg=Array.from({length:12},(_,i)=>{const arr=valid.filter(r=>r.month===i+1);return arr.length?arr.reduce((s,r)=>s+r.rainfall,0)/arr.length:null;});
  replaceChart('monthlyChart',{type:'line',data:{labels:monthNames,datasets:[{label:'Rata-rata curah hujan',data:monthAgg,borderColor:'#12a99e',backgroundColor:'rgba(18,169,158,.12)',fill:true,tension:.35,pointRadius:3,pointBackgroundColor:'#12a99e',spanGaps:false}]},options:chartDefaults()});
  const districtAgg=uniqueSorted(valid.map(r=>r.district)).map(name=>({name, vals:valid.filter(r=>r.district===name).map(r=>r.rainfall)})).map(x=>({name:x.name,avg:x.vals.reduce((a,b)=>a+b,0)/x.vals.length})).sort((a,b)=>b.avg-a.avg).slice(0,10);
  replaceChart('districtChart',{type:'bar',data:{labels:districtAgg.map(x=>x.name),datasets:[{label:'Rata-rata (mm)',data:districtAgg.map(x=>x.avg),backgroundColor:'#4d80e6',borderRadius:5,maxBarThickness:28}]},options:{...chartDefaults(),indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grid:{color:'#edf1f5'},ticks:{color:'#7f8fa0',font:{size:10}}},y:{grid:{display:false},ticks:{color:'#7f8fa0',font:{size:10}}}}}});
  const cats=['Tidak ada hujan','Rendah','Sedang','Tinggi','Sangat tinggi'];
  const catCounts=cats.map(c=>valid.filter(r=>r.category===c).length);
  const unknown=valid.filter(r=>!cats.includes(r.category)).length;
  if(unknown){cats.push('Kategori sumber lain');catCounts.push(unknown);}
  replaceChart('categoryChart',{type:'doughnut',data:{labels:cats,datasets:[{data:catCounts,backgroundColor:['#cbd5df','#71c5b8','#4d80e6','#f0a34a','#df6e73','#9a86df'],borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:7,padding:13,color:'#708195',font:{family:'DM Sans',size:10}}}}}});
  const has=valid.length>0; ['monthlyEmpty','districtEmpty','categoryEmpty'].forEach(id=>showEmpty(id,!has));
  if(!has){$('monthlyEmpty').textContent='Tidak ada baris curah hujan numerik yang valid.';$('districtEmpty').textContent='Tidak ada data valid.';$('categoryEmpty').textContent='Tidak ada data valid.';}
}
function renderTable(rows){
  const start=page*pageSize, subset=rows.slice(start,start+pageSize), body=$('tableBody');
  body.innerHTML='';
  if(!subset.length){body.innerHTML='<tr><td colspan="7" class="empty-row">Tidak ada catatan yang cocok dengan filter.</td></tr>';}
  subset.forEach(r=>{
    const tr=document.createElement('tr');
    const vals=[r.station,r.district,r.year??'—',r.monthName,r.decade,r.rainfall===null?'—':fmt(r.rainfall,2),r.category||'—'];
    vals.forEach((v,i)=>{const td=document.createElement('td');td.textContent=v;if(i===5)td.style.fontWeight='700';tr.appendChild(td);});
    body.appendChild(tr);
  });
  $('tableSummary').textContent=`Menampilkan ${fmt(rows.length,0)} catatan setelah filter.`;
  $('pageInfo').textContent=rows.length?`${start+1}–${Math.min(start+pageSize,rows.length)} dari ${rows.length} catatan`:'0 catatan';
  $('prevPage').disabled=page===0;
  $('nextPage').disabled=(page+1)*pageSize>=rows.length;
  $('exportBtn').disabled=!rows.length;
}
function renderAll(){updateKpis(filteredRows);renderCharts(filteredRows);renderTable(filteredRows);}
function loadCSV(file){
  if(!file)return;
  $('fileName').textContent=file.name;
  Papa.parse(file,{header:true,skipEmptyLines:true,complete:(results)=>{
    const raw=results.data.filter(r=>Object.values(r).some(v=>String(v??'').trim()!==''));
    if(!raw.length){setStatus(false,'File CSV terbaca tetapi tidak memiliki baris data. Periksa berkas yang diunduh dari portal resmi.');return;}
    const rows=normalizeRows(raw);
    if(!rows.length){setStatus(false,'CSV terbaca, tetapi kolom curah hujan tidak dikenali atau semua nilainya kosong/tidak valid. Pastikan kolom berisi nilai curah hujan dalam mm.');return;}
    allRows=rows;populateFilters();filteredRows=[...allRows];page=0;renderAll();
    setStatus(true,`Berhasil memuat ${fmt(rows.length,0)} baris dengan nilai curah hujan numerik dari file “${file.name}”. Pastikan file tersebut memang diunduh dari sumber resmi.`);
  },error:(err)=>setStatus(false,'Gagal membaca CSV: '+err.message)});
}
function exportCSV(){
  const cols=['Nama Pos Hujan','Nama Kabupaten/Kota','Tahun','Bulan','Dasarian','Curah Hujan (mm)','Kategori'];
  const rows=filteredRows.map(r=>[r.station,r.district,r.year??'',r.monthName,r.decade,r.rainfall,r.category]);
  const csv=[cols,...rows].map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url;a.download='hasil_filter_curah_hujan_ntb.csv';a.click();URL.revokeObjectURL(url);
}
$('csvFile').addEventListener('change',e=>loadCSV(e.target.files[0]));
['districtFilter','yearFilter','stationFilter'].forEach(id=>$(id).addEventListener('change',applyFilters));
$('clearFilters').addEventListener('click',()=>{['districtFilter','yearFilter','stationFilter'].forEach(id=>$(id).value='');applyFilters();});
$('prevPage').addEventListener('click',()=>{if(page>0){page--;renderTable(filteredRows);}});
$('nextPage').addEventListener('click',()=>{if((page+1)*pageSize<filteredRows.length){page++;renderTable(filteredRows);}});
$('exportBtn').addEventListener('click',exportCSV);
$('resetBtn').addEventListener('click',()=>{allRows=[];filteredRows=[];page=0;$('csvFile').value='';$('fileName').textContent='Belum ada file dipilih';['districtFilter','yearFilter','stationFilter'].forEach(id=>$(id).innerHTML=`<option value="">${id==='districtFilter'?'Semua wilayah':id==='yearFilter'?'Semua tahun':'Semua pos'}</option>`);setStatus(false,'Unggah CSV yang diunduh dari portal resmi BMKG atau NTB Satu Data. Dashboard ini tidak membuat angka contoh atau menganggap data simulasi sebagai pengamatan.');renderAll();});
renderAll();

```

## 4. `dataset_resmi_belum_diunduh.csv`

```csv
Nama Pos Hujan,Latitude,Longitude,Nama Desa,Nama Kecamatan,Nama Kabupaten/Kota,Curah Hujan (mm),Kategori,Dasarian,Bulan,Tahun

```
