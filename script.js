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
