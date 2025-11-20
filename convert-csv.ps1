# CSV Converter for Supabase Import
# Converts Google Sheets CSV format to Supabase-compatible format

param(
    [string]$InputFile,
    [string]$TableType
)

function Show-Usage {
    Write-Host @"
===============================================================
          CSV CONVERTER FOR SUPABASE IMPORT                   
===============================================================

USAGE:
  .\convert-csv.ps1 -InputFile <file.csv> -TableType <type>

TABLE TYPES:
  spareparts  - Convert spareparts CSV
  reports     - Convert reports CSV
  tasks       - Convert tasks CSV
  repairs     - Convert repairs CSV

EXAMPLES:
  .\convert-csv.ps1 -InputFile "spareparts.csv" -TableType spareparts
  .\convert-csv.ps1 -InputFile "tasks.csv" -TableType tasks

OUTPUT:
  Creates new file: <original>-supabase.csv
  Ready for Supabase import!

"@
    exit
}

if (-not $InputFile -or -not $TableType) {
    Show-Usage
}

if (-not (Test-Path $InputFile)) {
    Write-Host "ERROR: File '$InputFile' not found!" -ForegroundColor Red
    exit 1
}

$outputFile = $InputFile -replace '\.csv$', '-supabase.csv'

Write-Host ""
Write-Host "Converting CSV for Supabase..." -ForegroundColor Cyan
Write-Host "   Input:  $InputFile" -ForegroundColor Gray
Write-Host "   Output: $outputFile" -ForegroundColor Gray
Write-Host "   Type:   $TableType" -ForegroundColor Gray
Write-Host ""

try {
    $data = Import-Csv $InputFile -Encoding UTF8

    switch ($TableType.ToLower()) {
        "spareparts" {
            Write-Host "Converting SPAREPARTS..." -ForegroundColor Yellow
            
            $converted = $data | Select-Object @{N='name';E={$_.'Nama Part'}},
                                               @{N='quantity';E={[int]$_.'Jumlah'}},
                                               @{N='unit';E={$_.'Unit'}},
                                               @{N='description';E={$_.'Deskripsi'}},
                                               @{N='status';E={
                                                   $s = $_.Status
                                                   if ($s) {
                                                       $s.Substring(0,1).ToUpper() + $s.Substring(1).ToLower()
                                                   } else {
                                                       'Pending'
                                                   }
                                               }},
                                               @{N='order_date';E={
                                                   $date = $_.'Tanggal Dipesan'
                                                   if ($date -and $date -ne '') {
                                                       try {
                                                           (Get-Date $date).ToString('yyyy-MM-dd')
                                                       } catch {
                                                           $null
                                                       }
                                                   } else {
                                                       $null
                                                   }
                                               }},
                                               @{N='arrival_date';E={
                                                   $date = $_.'Tanggal Datang'
                                                   if ($date -and $date -ne '') {
                                                       try {
                                                           (Get-Date $date).ToString('yyyy-MM-dd')
                                                       } catch {
                                                           $null
                                                       }
                                                   } else {
                                                       $null
                                                   }
                                               }}
            
            $converted | Export-Csv $outputFile -NoTypeInformation -Encoding UTF8
            
            Write-Host "SUCCESS: Converted $($converted.Count) sparepart records" -ForegroundColor Green
        }
        
        "tasks" {
            Write-Host "Converting TASKS..." -ForegroundColor Yellow
            
            $converted = $data | Select-Object @{N='title';E={
                                                   if ($_.namaTask) { $_.namaTask }
                                                   elseif ($_.'Nama Task') { $_.'Nama Task' }
                                                   else { $null }
                                               }},
                                               @{N='description';E={
                                                   if ($_.deskripsi) { $_.deskripsi }
                                                   elseif ($_.Deskripsi) { $_.Deskripsi }
                                                   else { $null }
                                               }},
                                               @{N='priority';E={
                                                   $p = if ($_.prioritas) { $_.prioritas } else { $_.Prioritas }
                                                   if ($p -match 'high|tinggi') { 'High' }
                                                   elseif ($p -match 'low|rendah') { 'Low' }
                                                   else { 'Medium' }
                                               }},
                                               @{N='status';E={
                                                   $s = if ($_.status) { $_.status } else { $_.Status }
                                                   if ($s -match 'selesai|completed|done') { 'Completed' }
                                                   elseif ($s -match 'berlangsung|progress|ongoing') { 'In Progress' }
                                                   else { 'To Do' }
                                               }},
                                               @{N='progress';E={
                                                   $prog = if ($_.progress) { $_.progress } else { $_.Progress }
                                                   if ($prog) { [int]$prog } else { 0 }
                                               }},
                                               @{N='deadline';E={
                                                   $date = if ($_.deadline) { $_.deadline } else { $_.Deadline }
                                                   if ($date) {
                                                       try {
                                                           (Get-Date $date).ToString('yyyy-MM-dd')
                                                       } catch {
                                                           $null
                                                       }
                                                   }
                                               }}
            
            $converted | Export-Csv $outputFile -NoTypeInformation -Encoding UTF8
            
            Write-Host "SUCCESS: Converted $($converted.Count) task records" -ForegroundColor Green
        }
        
        "reports" {
            Write-Host "Converting REPORTS..." -ForegroundColor Yellow
            
            $converted = $data | Select-Object @{N='date';E={
                                                   try {
                                                       (Get-Date $_.Tanggal).ToString('yyyy-MM-dd')
                                                   } catch {
                                                       $null
                                                   }
                                               }},
                                               @{N='start_time';E={$_.'Jam Mulai'}},
                                               @{N='end_time';E={$_.'Jam Selesai'}},
                                               @{N='location';E={$_.Lokasi}},
                                               @{N='project';E={$_.'Nama Proyek'}},
                                               @{N='description';E={
                                                   "$($_.'Jenis Kegiatan') - $($_.'Unit Alat')`n`n$($_.Deskripsi)"
                                               }},
                                               @{N='notes';E={$_.Catatan}}
            
            $converted | Export-Csv $outputFile -NoTypeInformation -Encoding UTF8
            
            Write-Host "SUCCESS: Converted $($converted.Count) report records" -ForegroundColor Green
        }
        
        "repairs" {
            Write-Host "Converting REPAIRS..." -ForegroundColor Yellow
            
            $converted = $data | Select-Object @{N='equipment';E={
                                                   "$($_.'Item Repair') - $($_.'Unit Alat')"
                                               }},
                                               @{N='issue';E={
                                                   "$($_.'Deskripsi Kerusakan')`n`nLokasi: $($_.'Lokasi Operasi')`nTanggal Masuk: $($_.'Tanggal Masuk')`nTanggal Mulai: $($_.'Tanggal Mulai')`nTanggal Selesai: $($_.'Tanggal Selesai')"
                                               }},
                                               @{N='status';E={
                                                   $s = $_.Status
                                                   if ($s -match 'completed|selesai') { 'Completed' }
                                                   elseif ($s -match 'progress|berlangsung') { 'In Progress' }
                                                   else { 'Pending' }
                                               }},
                                               @{N='priority';E={'Medium'}},
                                               @{N='technician';E={$null}},
                                               @{N='notes';E={$null}}
            
            $converted | Export-Csv $outputFile -NoTypeInformation -Encoding UTF8
            
            Write-Host "SUCCESS: Converted $($converted.Count) repair records" -ForegroundColor Green
        }
        
        default {
            Write-Host "ERROR: Unknown table type: $TableType" -ForegroundColor Red
            Write-Host "   Valid types: spareparts, reports, tasks, repairs" -ForegroundColor Gray
            exit 1
        }
    }
    
    Write-Host ""
    Write-Host "===============================================================" -ForegroundColor Green
    Write-Host "  CONVERSION SUCCESSFUL!                                     " -ForegroundColor Green
    Write-Host "===============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Output file: $outputFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Open Supabase Dashboard: https://supabase.com/dashboard/project/vlwppmcddxchdozqrbfa" -ForegroundColor Gray
    Write-Host "2. Go to Table Editor → Select '$TableType' table" -ForegroundColor Gray
    Write-Host "3. Click 'Insert' → 'Import data from CSV'" -ForegroundColor Gray
    Write-Host "4. Upload: $outputFile" -ForegroundColor Gray
    Write-Host "5. Verify column mapping and import!" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR converting CSV: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tips:" -ForegroundColor Yellow
    Write-Host "   - Check CSV headers match expected format" -ForegroundColor Gray
    Write-Host "   - Ensure date columns have valid dates" -ForegroundColor Gray
    Write-Host "   - Check for special characters or encoding issues" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
