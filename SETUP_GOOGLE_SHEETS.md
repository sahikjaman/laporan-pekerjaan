# Setup Google Sheets untuk Progress Logs

## 1. Update Struktur Google Sheets

Buka Google Spreadsheet Anda dan tambahkan kolom baru di sheet **"Tasks"**:

### Struktur Kolom Tasks (A-I):
| Kolom | Header | Deskripsi |
|-------|--------|-----------|
| A | ID | ID unik task |
| B | Nama Task | Nama task |
| C | Deskripsi | Deskripsi task |
| D | Prioritas | low/medium/high |
| E | Deadline | Tanggal deadline |
| F | Progress | Persentase progress (0-100) |
| G | Status | selesai/berlangsung |
| H | Created At | Tanggal dibuat |
| **I** | **Progress Logs** | **JSON array riwayat progress (BARU)** |

## 2. Tambahkan Header di Row 1

Pastikan Row 1 di sheet "Tasks" memiliki header berikut:

```
ID | Nama Task | Deskripsi | Prioritas | Deadline | Progress | Status | Created At | Progress Logs
```

## 3. Format Kolom Progress Logs (Kolom I)

Kolom I akan menyimpan data dalam format JSON. Contoh isi:

```json
[
  {
    "id": "1699876543210",
    "tanggal": "2025-11-13",
    "deskripsi": "Menyelesaikan instalasi kabel fase A",
    "progressIncrement": 25,
    "createdAt": "2025-11-13T10:30:00.000Z"
  },
  {
    "id": "1699876598765",
    "tanggal": "2025-11-14",
    "deskripsi": "Testing dan verifikasi sambungan",
    "progressIncrement": 30,
    "createdAt": "2025-11-14T14:15:00.000Z"
  }
]
```

## 4. Tips untuk Melihat Progress Logs di Google Sheets

Karena data progressLogs disimpan sebagai JSON string, Anda bisa:

### Opsi 1: Biarkan sebagai JSON (Recommended)
- Data tetap dalam format JSON
- Mudah dibaca oleh aplikasi
- Copy-paste ke JSON formatter online untuk melihat detail

### Opsi 2: Buat Kolom Terpisah untuk Summary (Optional)
Tambahkan kolom J untuk ringkasan yang lebih mudah dibaca:

Di kolom J, gunakan formula:
```
=IF(I2="","",CONCATENATE("Total Logs: ",LEN(I2)-LEN(SUBSTITUTE(I2,"{",""))," entries"))
```

### Opsi 3: Google Apps Script untuk Formatting (Advanced)
Buat Apps Script untuk mem-parse dan menampilkan progress logs dalam format yang lebih mudah dibaca.

## 5. Verifikasi Setup

Setelah setup selesai:

1. ✅ Kolom I sudah ditambahkan dengan header "Progress Logs"
2. ✅ File `api/tasks.js` sudah diupdate
3. ✅ Restart development server: `npm run dev`
4. ✅ Test membuat task baru dengan progress logs
5. ✅ Cek di Google Sheets apakah data tersimpan di kolom I

## 6. Contoh Data di Google Sheets

| ID | Nama Task | ... | Progress Logs |
|----|-----------|-----|---------------|
| 1699876543210 | Maintenance Generator A | ... | `[{"id":"1699876598765","tanggal":"2025-11-13",...}]` |

## 7. Troubleshooting

**Q: Data progressLogs tidak muncul?**
- Pastikan kolom I sudah ada di Google Sheets
- Cek console browser untuk error
- Restart development server

**Q: Error saat save task?**
- Pastikan range di `api/tasks.js` sudah diubah dari `A:H` ke `A:I`
- Verifikasi Google Sheets API permissions

**Q: Format JSON terlihat sulit dibaca?**
- Gunakan JSON formatter online: https://jsonformatter.org
- Atau buat kolom summary dengan formula

## 8. File yang Sudah Diupdate

✅ `api/tasks.js` - Backend API untuk menyimpan/load progressLogs
✅ `src/App.jsx` - Frontend sudah support progressLogs

Sekarang sistem Anda sudah siap menyimpan riwayat progress ke Google Sheets! 🚀

---

# Setup Sheet Spareparts

## 1. Buat Sheet Baru "Spareparts"

Buka Google Spreadsheet Anda dan buat sheet baru dengan nama **"Spareparts"**

### Struktur Kolom Spareparts (A-J):
| Kolom | Header | Deskripsi |
|-------|--------|-----------|
| A | ID | ID unik sparepart |
| B | Nama Part | Nama sparepart |
| C | Deskripsi | Deskripsi detail sparepart |
| D | Jumlah | Jumlah yang dibutuhkan |
| E | Unit | Satuan (pcs, set, unit, dll) |
| F | Status | pending/ordered/arrived |
| G | Tanggal Dipesan | Tanggal pemesanan (YYYY-MM-DD) |
| H | Tanggal Datang | Tanggal kedatangan (YYYY-MM-DD) |
| I | Dibuat Oleh | Nama pembuat request |
| J | Created At | Timestamp dibuat |

## 2. Tambahkan Header di Row 1

Pastikan Row 1 di sheet "Spareparts" memiliki header berikut:

```
ID | Nama Part | Deskripsi | Jumlah | Unit | Status | Tanggal Dipesan | Tanggal Datang | Dibuat Oleh | Created At
```

## 3. Format Kolom

- **Status**: Isi dengan salah satu: `pending`, `ordered`, atau `arrived`
- **Tanggal**: Format YYYY-MM-DD (contoh: 2025-11-13)
- **Jumlah**: Angka (contoh: 10, 5, 100)

## 4. Contoh Data

| ID | Nama Part | Deskripsi | Jumlah | Unit | Status | Tanggal Dipesan | Tanggal Datang | Dibuat Oleh | Created At |
|----|-----------|-----------|--------|------|--------|-----------------|----------------|-------------|------------|
| 1699876543210 | Kabel NYY 3x10mm | Kabel listrik untuk instalasi panel | 100 | meter | ordered | 2025-11-13 | | John Doe | 2025-11-13T10:30:00.000Z |
| 1699876598765 | MCB 16A | MCB untuk proteksi sirkuit | 10 | pcs | arrived | 2025-11-12 | 2025-11-14 | Jane Smith | 2025-11-12T14:15:00.000Z |

## 5. Verifikasi Setup

Setelah setup selesai:

1. ✅ Sheet "Spareparts" sudah dibuat
2. ✅ Header kolom A-J sudah sesuai
3. ✅ File `api/spareparts.js` sudah ada
4. ✅ Restart development server: `npm run dev`
5. ✅ Test menambah sparepart baru di tab Sparepart
6. ✅ Cek di Google Sheets apakah data tersimpan

## 6. File yang Sudah Diupdate

✅ `api/spareparts.js` - Backend API untuk spareparts
✅ `src/App.jsx` - Frontend dengan tab Sparepart

Sekarang sistem sparepart Anda sudah terintegrasi dengan Google Sheets! 🔧
