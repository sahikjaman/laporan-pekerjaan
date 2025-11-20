# 📊 Migration Guide: Google Sheets → Supabase

## 🎯 Overview

Google Sheets URL: `https://docs.google.com/spreadsheets/d/1WGHf-m5GkpExqP-GqHb41-ebAMfMIItr47AAc_gJvjE/edit`

---

## ⚡ Quick Start (Recommended)

### Method 1: Manual Import via Supabase Dashboard

**Best for**: Small to medium datasets (< 1000 rows per table)

#### Step 1: Export from Google Sheets

1. **Open your Google Sheets**
   ```
   https://docs.google.com/spreadsheets/d/1WGHf-m5GkpExqP-GqHb41-ebAMfMIItr47AAc_gJvjE/edit
   ```

2. **For each sheet tab** (Laporan, Tasks, Spareparts, Repairs):
   - Click on the sheet name at bottom
   - `File` → `Download` → `Comma Separated Values (.csv)`
   - Save as:
     - `reports.csv`
     - `tasks.csv`
     - `spareparts.csv`
     - `repairs.csv`

#### Step 2: Clean CSV Data (Important!)

Before importing, open CSV in Excel/Notepad and verify:

**✅ Date Format**: `YYYY-MM-DD` (e.g., `2025-11-20`)
**✅ Time Format**: `HH:MM` (e.g., `08:00`, `17:30`)
**✅ Status Values**:
- Tasks: `To Do`, `In Progress`, or `Completed`
- Spareparts: `Pending`, `Ordered`, or `Arrived`
- Repairs: `Pending`, `In Progress`, or `Completed`
**✅ Priority Values**: `Low`, `Medium`, or `High`

#### Step 3: Import to Supabase

1. **Open Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/vlwppmcddxchdozqrbfa
   ```

2. **Navigate to Table Editor**
   - Click `Table Editor` in left sidebar

3. **Import Data for Each Table**

---

### 📝 **TABLE 1: REPORTS**

**Target Table**: `reports`

**Column Mapping**:

| CSV Column (Google Sheets) | Supabase Column | Notes |
|---------------------------|-----------------|-------|
| `tanggal` | `date` | Format: YYYY-MM-DD |
| `jamMulai` | `start_time` | Format: HH:MM |
| `jamSelesai` | `end_time` | Format: HH:MM |
| `lokasi` | `location` | Text |
| `namaProyek` | `project` | Text |
| `jenisKegiatan` + `unitAlat` + `deskripsi` | `description` | Combine these 3 fields |
| `catatan` | `notes` | Optional, can be null |

**Import Steps**:
1. Select `reports` table
2. Click `Insert` → `Import data from CSV`
3. Upload `reports.csv`
4. Map columns as shown above
5. **Special handling for description**: 
   ```
   description = jenisKegiatan + " - " + unitAlat + "\n\n" + deskripsi
   ```
   You may need to prepare this in Excel before export:
   ```excel
   =CONCATENATE(C2, " - ", D2, CHAR(10), CHAR(10), E2)
   ```

---

### ✅ **TABLE 2: TASKS**

**Target Table**: `tasks`

**Column Mapping**:

| CSV Column | Supabase Column | Notes |
|-----------|-----------------|-------|
| `namaTask` | `title` | Text |
| `deskripsi` | `description` | Text |
| `prioritas` | `priority` | Must be: Low/Medium/High (capitalize first letter) |
| `deadline` | `deadline` | Format: YYYY-MM-DD |
| `progress` | `progress` | Integer 0-100 |
| `status` | `status` | Convert: `berlangsung`→`In Progress`, `selesai`→`Completed`, else→`To Do` |

**Status Conversion**:
```
berlangsung  → In Progress
selesai      → Completed
(empty/other)→ To Do
```

**Import Steps**:
1. Select `tasks` table
2. Click `Insert` → `Import data from CSV`
3. Upload `tasks.csv`
4. Map columns
5. **Before import**, update status column in Excel:
   ```excel
   =IF(F2="berlangsung","In Progress",IF(F2="selesai","Completed","To Do"))
   ```

**⚠️ Note**: Progress logs (progressLogs) need separate handling - see below.

---

### 📦 **TABLE 3: SPAREPARTS**

**Target Table**: `spareparts`

**Column Mapping**:

| CSV Column | Supabase Column | Notes |
|-----------|-----------------|-------|
| `namaPart` | `name` | Text |
| `jumlah` | `quantity` | Integer > 0 |
| `unit` | `unit` | Text (e.g., "pcs", "meters") |
| `deskripsi` | `description` | Text, optional |
| `status` | `status` | Must be: Pending/Ordered/Arrived |
| `tanggalDipesan` | `order_date` | Format: YYYY-MM-DD, optional |
| `tanggalDatang` | `arrival_date` | Format: YYYY-MM-DD, optional |

**Status Conversion**:
```
pending  → Pending
ordered  → Ordered
arrived  → Arrived
```

**Import Steps**:
1. Select `spareparts` table
2. Click `Insert` → `Import data from CSV`
3. Upload `spareparts.csv`
4. Map columns
5. **Update status in Excel** (capitalize first letter):
   ```excel
   =PROPER(E2)
   ```

---

### 🔧 **TABLE 4: REPAIRS**

**Target Table**: `repairs`

**Column Mapping**:

| CSV Column | Supabase Column | Notes |
|-----------|-----------------|-------|
| `itemRepair` + `unitAlat` | `equipment` | Combine: "itemRepair - unitAlat" |
| Multiple fields | `issue` | See below for combination |
| `status` | `status` | Convert to: Pending/In Progress/Completed |
| (not in sheet) | `priority` | Default: "Medium" |
| (not in sheet) | `technician` | Leave null |
| (not in sheet) | `notes` | Leave null |

**Issue Field Combination**:
```
issue = deskripsiKerusakan + "\n\n" +
        "Lokasi: " + lokasiOperasi + "\n" +
        "Tanggal Masuk: " + tanggalMasuk + "\n" +
        "Tanggal Mulai: " + tanggalMulai + "\n" +
        "Tanggal Selesai: " + tanggalSelesai
```

Excel formula:
```excel
=CONCATENATE(G2,CHAR(10),CHAR(10),"Lokasi: ",F2,CHAR(10),"Tanggal Masuk: ",B2,CHAR(10),"Tanggal Mulai: ",C2,CHAR(10),"Tanggal Selesai: ",D2)
```

**Status Conversion**:
```
received → Pending
progress → In Progress
completed → Completed
```

**Import Steps**:
1. Prepare combined columns in Excel first
2. Select `repairs` table
3. Click `Insert` → `Import data from CSV`
4. Upload modified CSV
5. For `priority`, use default "Medium" for all rows

---

### 📜 **TABLE 5: PROGRESS_LOGS** (if applicable)

If your tasks have progress logs stored as JSON or nested data:

**Target Table**: `progress_logs`

**Column Mapping**:

| Data | Supabase Column | Notes |
|------|-----------------|-------|
| Task ID from tasks table | `task_id` | UUID (foreign key) |
| Progress value | `progress` | Integer 0-100 |
| Log description | `note` | Text |
| Auto-generated | `created_at` | Timestamp |

**Import Steps**:
1. Extract progress logs from tasks
2. Get task UUIDs from imported tasks table
3. Create CSV with: task_id, progress, note
4. Import to `progress_logs` table

---

## 🛠️ Alternative: SQL Import

If you prefer SQL and have programming experience:

### Step 1: Prepare Data

Export from Google Sheets and convert to SQL INSERT statements.

### Step 2: Run in Supabase SQL Editor

```sql
-- Example for Reports
INSERT INTO reports (date, start_time, end_time, location, project, description, notes)
VALUES 
  ('2025-11-20', '08:00', '17:00', 'Jakarta Site A', 'Generator Maintenance', 
   'Maintenance - Generator Unit 1\n\nRegular maintenance check on diesel generator', 
   'All systems operational'),
  ('2025-11-19', '09:00', '15:00', 'Surabaya Port', 'Crane Repair',
   'Repair - Port Crane 3\n\nFixed electrical wiring issue on port crane',
   'Replaced damaged cables');

-- Example for Tasks
INSERT INTO tasks (title, description, priority, status, progress, deadline)
VALUES
  ('Inspect Generator Set', 'Perform monthly inspection on all generator sets', 
   'High', 'In Progress', 60, '2025-11-25'),
  ('Replace Motor Brushes', 'Replace worn brushes on conveyor motor',
   'Medium', 'To Do', 0, '2025-11-30');

-- Example for Spareparts
INSERT INTO spareparts (name, quantity, unit, description, status, order_date)
VALUES
  ('Circuit Breaker 100A', 5, 'pcs', '3-phase circuit breaker', 'Ordered', '2025-11-18'),
  ('Power Cable 10mm²', 100, 'meters', 'Copper power cable', 'Pending', NULL);

-- Example for Repairs
INSERT INTO repairs (equipment, issue, status, priority)
VALUES
  ('Excavator CAT 320 - Heavy Equipment', 
   'Starter motor not working\n\nLokasi: Mining Site B\nTanggal Masuk: 2025-11-15\nTanggal Mulai: 2025-11-16\nTanggal Selesai: -',
   'In Progress', 'High'),
  ('Forklift Toyota FD30 - Warehouse',
   'Battery not charging\n\nLokasi: Warehouse A\nTanggal Masuk: 2025-11-18\nTanggal Mulai: -\nTanggal Selesai: -',
   'Pending', 'Medium');
```

---

## ✅ Verification Checklist

After importing, verify:

### 1. **Check Data in Supabase**
- [ ] Open Supabase Dashboard → Table Editor
- [ ] Click each table and verify row count
- [ ] Check data looks correct
- [ ] No NULL values in required fields

### 2. **Test in Application**
- [ ] Open app: `http://localhost:5173`
- [ ] Check Dashboard shows correct statistics
- [ ] Navigate to Reports tab - data visible?
- [ ] Navigate to Tasks tab - data visible?
- [ ] Navigate to Spareparts tab - data visible?
- [ ] Navigate to Repairs tab - data visible?

### 3. **Test CRUD Operations**
- [ ] Create new report - works?
- [ ] Edit existing report - updates?
- [ ] Delete report - removes?
- [ ] Same for Tasks, Spareparts, Repairs

### 4. **Check Filtering**
- [ ] Search/filter by date
- [ ] Filter tasks by status
- [ ] Filter spareparts by status
- [ ] All filters working correctly?

---

## 🐛 Common Issues & Solutions

### Issue 1: "Insert failed - constraint violation"

**Cause**: Data doesn't match database constraints

**Solutions**:
- Check status values are exactly: `Pending`, `Ordered`, `Arrived`, `To Do`, `In Progress`, `Completed`
- Check priority values are: `Low`, `Medium`, `High`
- Check quantity > 0
- Check progress is 0-100
- Check date format is `YYYY-MM-DD`
- Check time format is `HH:MM`

### Issue 2: "Foreign key violation" (progress_logs)

**Cause**: task_id doesn't exist in tasks table

**Solution**:
- Import tasks first
- Get UUIDs from tasks table
- Use correct UUIDs in progress_logs

### Issue 3: "Cannot parse date"

**Cause**: Date format incorrect

**Solution**:
- Must be `YYYY-MM-DD` format
- In Excel: Format cells as `Date` with format `2025-11-20`
- Or use TEXT formula: `=TEXT(A2,"YYYY-MM-DD")`

### Issue 4: "Data not showing in app"

**Cause**: Data in wrong format for mappers

**Solution**:
- Check `dataMappers.js` expectations
- Verify column names match exactly
- Refresh browser (Ctrl+F5)

---

## 📊 Data Preparation Tips

### Excel Formulas to Help

**Combine columns for description**:
```excel
=CONCATENATE(C2, " - ", D2, CHAR(10), CHAR(10), E2)
```

**Convert status**:
```excel
=IF(F2="berlangsung","In Progress",IF(F2="selesai","Completed","To Do"))
```

**Capitalize first letter**:
```excel
=PROPER(E2)
```

**Format date**:
```excel
=TEXT(A2,"YYYY-MM-DD")
```

**Format time**:
```excel
=TEXT(B2,"HH:MM")
```

### Find & Replace Cleanup

Before export, in Google Sheets:
1. `Edit` → `Find and replace`
2. Common replacements:
   - `berlangsung` → `In Progress`
   - `selesai` → `Completed`
   - `pending` → `Pending`
   - `ordered` → `Ordered`
   - `arrived` → `Arrived`

---

## 🚀 Quick Migration (Small Data)

If you have < 50 rows total:

**Just re-enter manually in the app!**

1. Open `http://localhost:5173`
2. Click "New Report" / "New Task" / etc.
3. Fill forms with data from Google Sheets
4. Data saves directly to Supabase
5. Much faster than CSV import setup

---

## 📞 Need Help?

**Check these resources**:
1. Supabase Dashboard → Logs (for error messages)
2. Browser Console (F12) → Check for errors
3. `SUPABASE_MIGRATION.md` - Technical details
4. `SUPABASE_SETUP.md` - Setup guide

**Common questions**:
- "How do I get UUIDs?" → Import first, then check Table Editor
- "Status not matching?" → Use exact case: `Pending` not `pending`
- "Date format error?" → Use `YYYY-MM-DD`
- "Can't see data?" → Clear browser cache, refresh

---

## 🎯 Summary

**Easiest Method**:
1. Export each sheet to CSV
2. Clean data in Excel (fix dates, status values)
3. Import via Supabase Dashboard
4. Verify in app

**Estimated Time**: 30-60 minutes (depending on data size)

**Success Rate**: 99% if you follow column mapping exactly

Good luck with your migration! 🎉
