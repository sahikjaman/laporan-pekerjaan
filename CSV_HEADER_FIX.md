# CSV Import Template & Header Mapping

## ⚠️ Header Mismatch Solution

Supabase menggunakan **snake_case** untuk nama kolom, sedangkan Google Sheets Anda menggunakan **Indonesia/Title Case**.

---

## 📋 CORRECT CSV HEADERS

### **SPAREPARTS TABLE**

**❌ Wrong Headers (dari Google Sheets)**:
```
ID, Nama Part, Deskripsi, Jumlah, Unit, Status, Tanggal Dipesan, Tanggal Datang, Dibuat Oleh, Created At
```

**✅ Correct Headers (untuk Supabase)**:
```
name,quantity,unit,description,status,order_date,arrival_date
```

**Note**: 
- `id`, `created_at`, `updated_at` akan di-generate otomatis oleh Supabase
- Kolom `Dibuat Oleh` dan `ID` tidak perlu (tidak ada di schema baru)

---

## 🔄 CONVERSION GUIDE

### Option 1: Manual Header Change (Recommended)

1. **Open CSV file** di Excel atau text editor
2. **Replace first row** dengan header yang benar:

**Before:**
```csv
ID,Nama Part,Deskripsi,Jumlah,Unit,Status,Tanggal Dipesan,Tanggal Datang,Dibuat Oleh,Created At
SP001,Circuit Breaker 100A,3-phase circuit breaker,5,pcs,ordered,2025-11-18,2025-11-20,Ahmad,2025-11-18 08:00
```

**After:**
```csv
name,quantity,unit,description,status,order_date,arrival_date
Circuit Breaker 100A,5,pcs,3-phase circuit breaker,Ordered,2025-11-18,2025-11-20
```

**Column Order:**
1. `name` (Nama Part)
2. `quantity` (Jumlah)  
3. `unit` (Unit)
4. `description` (Deskripsi)
5. `status` (Status - capitalize: Pending/Ordered/Arrived)
6. `order_date` (Tanggal Dipesan - format: YYYY-MM-DD)
7. `arrival_date` (Tanggal Datang - format: YYYY-MM-DD)

3. **Remove columns**: ID, Dibuat Oleh, Created At
4. **Save as new CSV**
5. **Import to Supabase**

---

### Option 2: Excel Formula Mapping

Create new sheet with correct headers and formulas:

```excel
| A (name)    | B (quantity) | C (unit) | D (description) | E (status)     | F (order_date)  | G (arrival_date) |
|-------------|--------------|----------|-----------------|----------------|-----------------|------------------|
| =Sheet1!B2  | =Sheet1!D2   | =Sheet1!E2| =Sheet1!C2     | =PROPER(Sheet1!F2) | =TEXT(Sheet1!G2,"YYYY-MM-DD") | =TEXT(Sheet1!H2,"YYYY-MM-DD") |
```

Then drag down, copy, paste values, export to CSV.

---

## 📊 ALL TABLES - CORRECT HEADERS

### **1. REPORTS**
```csv
date,start_time,end_time,location,project,description,notes
```

**Mapping from Google Sheets:**
- `date` ← Tanggal
- `start_time` ← Jam Mulai
- `end_time` ← Jam Selesai
- `location` ← Lokasi
- `project` ← Nama Proyek
- `description` ← Combine: Jenis Kegiatan + " - " + Unit Alat + "\n\n" + Deskripsi
- `notes` ← Catatan

**Example CSV:**
```csv
date,start_time,end_time,location,project,description,notes
2025-11-20,08:00,17:00,Jakarta Site A,Generator Maintenance,Maintenance - Generator Unit 1\n\nRegular maintenance check,All systems operational
2025-11-19,09:00,15:00,Surabaya Port,Crane Repair,Repair - Port Crane 3\n\nFixed electrical wiring issue,Replaced damaged cables
```

---

### **2. TASKS**
```csv
title,description,priority,status,progress,deadline
```

**Mapping from Google Sheets:**
- `title` ← Nama Task
- `description` ← Deskripsi
- `priority` ← Prioritas (capitalize: Low/Medium/High)
- `status` ← Status (convert: To Do/In Progress/Completed)
- `progress` ← Progress (0-100)
- `deadline` ← Deadline

**Example CSV:**
```csv
title,description,priority,status,progress,deadline
Inspect Generator Set,Perform monthly inspection on all generator sets,High,In Progress,60,2025-11-25
Replace Motor Brushes,Replace worn brushes on conveyor motor,Medium,To Do,0,2025-11-30
Update Documentation,Update all technical documentation,Low,Completed,100,2025-11-15
```

**Status Conversion:**
- `berlangsung` → `In Progress`
- `selesai` → `Completed`
- empty/other → `To Do`

---

### **3. SPAREPARTS**
```csv
name,quantity,unit,description,status,order_date,arrival_date
```

**Mapping from Google Sheets:**
- `name` ← Nama Part
- `quantity` ← Jumlah
- `unit` ← Unit
- `description` ← Deskripsi
- `status` ← Status (capitalize: Pending/Ordered/Arrived)
- `order_date` ← Tanggal Dipesan
- `arrival_date` ← Tanggal Datang

**Example CSV:**
```csv
name,quantity,unit,description,status,order_date,arrival_date
Circuit Breaker 100A,5,pcs,3-phase circuit breaker,Ordered,2025-11-18,2025-11-20
Power Cable 10mm²,100,meters,Copper power cable,Pending,,
Motor Bearing SKF 6205,10,pcs,Deep groove ball bearing,Arrived,2025-11-15,2025-11-18
```

---

### **4. REPAIRS**
```csv
equipment,issue,status,priority,technician,notes
```

**Mapping from Google Sheets:**
- `equipment` ← Item Repair + " - " + Unit Alat
- `issue` ← Combine all details (see below)
- `status` ← Status (Pending/In Progress/Completed)
- `priority` ← Priority (default: Medium)
- `technician` ← (optional, can leave empty)
- `notes` ← (optional, can leave empty)

**Issue Field Format:**
```
[Deskripsi Kerusakan]

Lokasi: [Lokasi Operasi]
Tanggal Masuk: [Tanggal Masuk]
Tanggal Mulai: [Tanggal Mulai]
Tanggal Selesai: [Tanggal Selesai]
```

**Example CSV:**
```csv
equipment,issue,status,priority,technician,notes
Excavator CAT 320 - Heavy Equipment,Starter motor not working\n\nLokasi: Mining Site B\nTanggal Masuk: 2025-11-15\nTanggal Mulai: 2025-11-16\nTanggal Selesai: -,In Progress,High,,
Forklift Toyota FD30 - Warehouse,Battery not charging\n\nLokasi: Warehouse A\nTanggal Masuk: 2025-11-18\nTanggal Mulai: -\nTanggal Selesai: -,Pending,Medium,,
```

---

## 🛠️ Quick Fix Tool

Use this **PowerShell script** to convert headers automatically:

```powershell
# Convert CSV headers for Supabase import
$inputFile = "spareparts-original.csv"
$outputFile = "spareparts-supabase.csv"

# Read CSV
$data = Import-Csv $inputFile

# Convert and export with new headers
$data | Select-Object @{N='name';E={$_.'Nama Part'}},
                     @{N='quantity';E={$_.'Jumlah'}},
                     @{N='unit';E={$_.'Unit'}},
                     @{N='description';E={$_.'Deskripsi'}},
                     @{N='status';E={
                         $s = $_.Status
                         $s.Substring(0,1).ToUpper() + $s.Substring(1).ToLower()
                     }},
                     @{N='order_date';E={
                         if ($_.'Tanggal Dipesan') {
                             (Get-Date $_.'Tanggal Dipesan').ToString('yyyy-MM-dd')
                         }
                     }},
                     @{N='arrival_date';E={
                         if ($_.'Tanggal Datang') {
                             (Get-Date $_.'Tanggal Datang').ToString('yyyy-MM-dd')
                         }
                     }} | Export-Csv $outputFile -NoTypeInformation

Write-Host "✅ Converted! Import $outputFile to Supabase"
```

Save as `convert-csv.ps1` and run:
```powershell
.\convert-csv.ps1
```

---

## 📝 Step-by-Step Fix

### For SPAREPARTS (Your Current Issue):

1. **Open your CSV in Excel**
2. **Delete columns**: A (ID), I (Dibuat Oleh), J (Created At)
3. **Rearrange columns** in this order:
   - B (Nama Part) → rename to `name`
   - D (Jumlah) → rename to `quantity`
   - E (Unit) → rename to `unit`
   - C (Deskripsi) → rename to `description`
   - F (Status) → rename to `status` (capitalize value)
   - G (Tanggal Dipesan) → rename to `order_date`
   - H (Tanggal Datang) → rename to `arrival_date`

4. **Update Status values** (capitalize):
   - Find & Replace: `pending` → `Pending`
   - Find & Replace: `ordered` → `Ordered`
   - Find & Replace: `arrived` → `Arrived`

5. **Format dates** to YYYY-MM-DD:
   - Select date columns
   - Format Cells → Custom → `yyyy-mm-dd`

6. **Save as CSV** (UTF-8)

7. **Import to Supabase**

---

## ✅ Verification

After import, check in Supabase Table Editor:
- [ ] All rows imported
- [ ] No NULL in required fields (name, quantity, unit, status)
- [ ] Dates formatted correctly
- [ ] Status values are: Pending, Ordered, or Arrived
- [ ] id and timestamps auto-generated

---

## 💡 Pro Tips

1. **Keep original CSV** as backup
2. **Test with 1-2 rows first** before importing all
3. **Use Excel PROPER() function** for capitalization
4. **Use TEXT() function** for date formatting: `=TEXT(A2,"YYYY-MM-DD")`
5. **Empty dates**: Leave cell empty (will be NULL in database)

---

## 🆘 Still Having Issues?

**Error: "Column not found"**
→ Check header spelling exactly matches (case-sensitive)

**Error: "Invalid status value"**
→ Must be exactly: `Pending`, `Ordered`, or `Arrived`

**Error: "Invalid date format"**
→ Must be: `YYYY-MM-DD` (e.g., `2025-11-20`)

**Error: "Quantity must be positive"**
→ Check no 0 or negative numbers in quantity column

Need more help? Check the converted file or let me know!
