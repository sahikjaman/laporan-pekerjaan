// Migration Script: Google Sheets → Supabase
// Run this script to migrate existing data

import { reportsAPI, tasksAPI, sparepartsAPI, repairsAPI } from './src/supabaseClient.js';

// Google Sheets Data ID
const SPREADSHEET_ID = '1WGHf-m5GkpExqP-GqHb41-ebAMfMIItr47AAc_gJvjE';

// ============================================
// MANUAL MIGRATION INSTRUCTIONS
// ============================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║     📊 PANDUAN MIGRASI DATA DARI GOOGLE SHEETS              ║
╚══════════════════════════════════════════════════════════════╝

Karena Google Sheets API memerlukan OAuth setup yang kompleks,
berikut cara termudah untuk migrate data Anda:

📋 STEP-BY-STEP MIGRATION:

1️⃣  EXPORT DATA DARI GOOGLE SHEETS
   ────────────────────────────────
   a. Buka Google Sheets Anda:
      https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit
   
   b. Untuk setiap sheet (Reports, Tasks, Spareparts, Repairs):
      - Klik nama sheet di bagian bawah
      - File → Download → CSV (.csv)
      - Simpan dengan nama yang jelas:
        * reports.csv
        * tasks.csv  
        * spareparts.csv
        * repairs.csv

2️⃣  IMPORT KE SUPABASE VIA DASHBOARD
   ──────────────────────────────────
   a. Buka Supabase Dashboard:
      https://supabase.com/dashboard/project/vlwppmcddxchdozqrbfa
   
   b. Untuk setiap table:
      - Klik "Table Editor" di sidebar kiri
      - Pilih table (contoh: reports)
      - Klik tombol "Insert" → "Import data from CSV"
      - Upload file CSV yang sudah didownload
      - Map kolom-kolom:

3️⃣  COLUMN MAPPING GUIDE
   ─────────────────────

   📝 REPORTS TABLE:
   ┌─────────────────────┬──────────────────┐
   │ Google Sheets       │ Supabase Column  │
   ├─────────────────────┼──────────────────┤
   │ tanggal             → date             │
   │ jamMulai            → start_time       │
   │ jamSelesai          → end_time         │
   │ lokasi              → location         │
   │ namaProyek          → project          │
   │ jenisKegiatan +     → description      │
   │ unitAlat +          │  (gabungkan)     │
   │ deskripsi           │                  │
   │ catatan             → notes            │
   └─────────────────────┴──────────────────┘

   ✅ TASKS TABLE:
   ┌─────────────────────┬──────────────────┐
   │ Google Sheets       │ Supabase Column  │
   ├─────────────────────┼──────────────────┤
   │ namaTask            → title            │
   │ deskripsi           → description      │
   │ prioritas           → priority         │
   │ deadline            → deadline         │
   │ progress            → progress         │
   │ status              → status           │
   └─────────────────────┴──────────────────┘
   
   Note: progressLogs harus diimport terpisah ke table progress_logs

   📦 SPAREPARTS TABLE:
   ┌─────────────────────┬──────────────────┐
   │ Google Sheets       │ Supabase Column  │
   ├─────────────────────┼──────────────────┤
   │ namaPart            → name             │
   │ jumlah              → quantity         │
   │ unit                → unit             │
   │ deskripsi           → description      │
   │ status              → status           │
   │ tanggalDipesan      → order_date       │
   │ tanggalDatang       → arrival_date     │
   └─────────────────────┴──────────────────┘

   🔧 REPAIRS TABLE:
   ┌─────────────────────┬──────────────────┐
   │ Google Sheets       │ Supabase Column  │
   ├─────────────────────┼──────────────────┤
   │ itemRepair +        → equipment        │
   │ unitAlat            │  (gabungkan)     │
   │ deskripsiKerusakan  → issue            │
   │ status              → status           │
   │ (default)           → priority         │
   │ (optional)          → technician       │
   │ (optional)          → notes            │
   └─────────────────────┴──────────────────┘

4️⃣  ALTERNATIVE: IMPORT VIA SQL
   ────────────────────────────
   Jika Anda familiar dengan SQL:
   
   a. Prepare data dalam format JSON atau CSV
   b. Buka Supabase → SQL Editor
   c. Run INSERT statements:

   INSERT INTO reports (date, start_time, end_time, location, project, description, notes)
   VALUES 
     ('2025-01-15', '08:00', '17:00', 'Jakarta', 'Project A', 'Description', 'Notes'),
     ('2025-01-16', '09:00', '16:00', 'Surabaya', 'Project B', 'Description', NULL);

5️⃣  VERIFY MIGRATION
   ────────────────────
   a. Check data di Supabase Table Editor
   b. Buka aplikasi: http://localhost:5173
   c. Verify semua data muncul dengan benar
   d. Test CRUD operations (create, edit, delete)

═══════════════════════════════════════════════════════════════

⚡ TIPS:

1. Export per sheet untuk menghindari confusion
2. Gunakan "Find & Replace" di spreadsheet untuk cleanup data
3. Pastikan format tanggal: YYYY-MM-DD
4. Pastikan format waktu: HH:MM
5. Status dan priority harus match dengan constraints di database
6. Backup data Anda sebelum migration

═══════════════════════════════════════════════════════════════

🚀 QUICK MIGRATION (Jika data sedikit):

Jika data Anda tidak banyak (< 50 rows), lebih cepat:
1. Buka aplikasi di browser
2. Input ulang data secara manual via form
3. Data akan langsung masuk ke Supabase

═══════════════════════════════════════════════════════════════

Need help? Check:
- SUPABASE_MIGRATION.md untuk detail
- SUPABASE_SETUP.md untuk troubleshooting
- Supabase Dashboard → Logs untuk error messages

Good luck! 🎉
`);

// ============================================
// AUTOMATED MIGRATION (REQUIRES SETUP)
// ============================================

// Uncomment and modify this if you want automated migration
// Requires Google Sheets API credentials setup

/*
import { google } from 'googleapis';

async function migrateFromGoogleSheets() {
  try {
    // Setup Google Sheets API (requires OAuth)
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json', // Download from Google Cloud Console
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Read Reports
    console.log('📊 Migrating Reports...');
    const reportsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Laporan!A2:Z', // Adjust range based on your sheet
    });

    const reportsData = reportsResponse.data.values || [];
    
    for (const row of reportsData) {
      const [tanggal, jamMulai, jamSelesai, lokasi, namaProyek, jenisKegiatan, unitAlat, deskripsi, catatan] = row;
      
      if (!tanggal || !lokasi || !namaProyek) continue; // Skip empty rows
      
      await reportsAPI.create({
        date: tanggal,
        start_time: jamMulai,
        end_time: jamSelesai,
        location: lokasi,
        project: namaProyek,
        description: `${jenisKegiatan} - ${unitAlat}\n\n${deskripsi}`,
        notes: catatan || null,
      });
      
      console.log('✅ Migrated report:', namaProyek);
    }

    // Read Tasks
    console.log('📋 Migrating Tasks...');
    const tasksResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Tasks!A2:Z',
    });

    const tasksData = tasksResponse.data.values || [];
    
    for (const row of tasksData) {
      const [namaTask, deskripsi, prioritas, deadline, progress, status] = row;
      
      if (!namaTask || !deskripsi) continue;
      
      await tasksAPI.create({
        title: namaTask,
        description: deskripsi,
        priority: prioritas.charAt(0).toUpperCase() + prioritas.slice(1).toLowerCase(),
        deadline: deadline,
        progress: parseInt(progress) || 0,
        status: status === 'selesai' ? 'Completed' : status === 'berlangsung' ? 'In Progress' : 'To Do',
      });
      
      console.log('✅ Migrated task:', namaTask);
    }

    // Read Spareparts
    console.log('📦 Migrating Spareparts...');
    const sparepartsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Spareparts!A2:Z',
    });

    const sparepartsData = sparepartsResponse.data.values || [];
    
    for (const row of sparepartsData) {
      const [namaPart, jumlah, unit, deskripsi, status, tanggalDipesan, tanggalDatang] = row;
      
      if (!namaPart || !jumlah) continue;
      
      await sparepartsAPI.create({
        name: namaPart,
        quantity: parseInt(jumlah),
        unit: unit,
        description: deskripsi || null,
        status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        order_date: tanggalDipesan || null,
        arrival_date: tanggalDatang || null,
      });
      
      console.log('✅ Migrated sparepart:', namaPart);
    }

    // Read Repairs
    console.log('🔧 Migrating Repairs...');
    const repairsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Repairs!A2:Z',
    });

    const repairsData = repairsResponse.data.values || [];
    
    for (const row of repairsData) {
      const [itemRepair, tanggalMasuk, tanggalMulai, tanggalSelesai, unitAlat, lokasiOperasi, deskripsiKerusakan, status] = row;
      
      if (!itemRepair || !tanggalMasuk) continue;
      
      await repairsAPI.create({
        equipment: `${itemRepair} - ${unitAlat}`,
        issue: `${deskripsiKerusakan}\n\nLokasi: ${lokasiOperasi}\nTanggal Masuk: ${tanggalMasuk}\nTanggal Mulai: ${tanggalMulai}\nTanggal Selesai: ${tanggalSelesai}`,
        status: status === 'received' ? 'Pending' : status === 'progress' ? 'In Progress' : 'Completed',
        priority: 'Medium',
        technician: null,
        notes: null,
      });
      
      console.log('✅ Migrated repair:', itemRepair);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('✅ All data has been migrated to Supabase');
    console.log('🔍 Verify in Supabase Dashboard or open the app');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('💡 Check your Google Sheets API setup and credentials');
  }
}

// Run migration
// migrateFromGoogleSheets();
*/
