// Import Tasks with Progress Logs to Supabase
// This script handles the nested progressLogs data structure

import { tasksAPI, progressLogsAPI } from './src/supabaseClient.js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const TASKS_CSV = './tasks.csv';

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║     IMPORTING TASKS WITH PROGRESS LOGS TO SUPABASE          ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

async function importTasks() {
  try {
    // Read CSV file
    console.log('📖 Reading tasks.csv...');
    const fileContent = fs.readFileSync(TASKS_CSV, 'utf-8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true
    });

    console.log(`✅ Found ${records.length} tasks\n`);

    let successCount = 0;
    let progressLogCount = 0;

    for (const row of records) {
      try {
        const { 
          namaTask, 
          deskripsi, 
          prioritas, 
          deadline, 
          progress, 
          status,
          progressLogs 
        } = row;

        if (!namaTask || !deskripsi) {
          console.log('⚠️  Skipping row with missing data');
          continue;
        }

        // Convert status
        let convertedStatus = 'To Do';
        if (status === 'selesai' || status === 'completed') {
          convertedStatus = 'Completed';
        } else if (status === 'berlangsung' || status === 'progress') {
          convertedStatus = 'In Progress';
        }

        // Convert priority
        let convertedPriority = 'Medium';
        if (prioritas === 'high' || prioritas === 'tinggi') {
          convertedPriority = 'High';
        } else if (prioritas === 'low' || prioritas === 'rendah') {
          convertedPriority = 'Low';
        }

        // Create task
        console.log(`📝 Creating task: ${namaTask}`);
        const taskData = {
          title: namaTask,
          description: deskripsi,
          priority: convertedPriority,
          status: convertedStatus,
          progress: parseInt(progress) || 0,
          deadline: deadline || null
        };

        const createdTask = await tasksAPI.create(taskData);
        console.log(`   ✅ Task created with ID: ${createdTask.id}`);
        successCount++;

        // Parse and import progress logs if they exist
        if (progressLogs && progressLogs !== '[]' && progressLogs.trim() !== '') {
          try {
            const logs = JSON.parse(progressLogs);
            
            if (Array.isArray(logs) && logs.length > 0) {
              console.log(`   📊 Found ${logs.length} progress log(s)`);
              
              for (const log of logs) {
                const logData = {
                  task_id: createdTask.id,
                  progress: parseInt(log.progressIncrement) || 0,
                  note: log.deskripsi || log.description || 'Progress update',
                  created_at: log.tanggal ? `${log.tanggal}T00:00:00Z` : new Date().toISOString()
                };

                await progressLogsAPI.create(logData);
                progressLogCount++;
              }
              
              console.log(`   ✅ Imported ${logs.length} progress log(s)`);
            }
          } catch (parseError) {
            console.log(`   ⚠️  Could not parse progress logs: ${parseError.message}`);
          }
        }

        console.log('');

      } catch (error) {
        console.error(`   ❌ Error importing task: ${error.message}\n`);
      }
    }

    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    IMPORT COMPLETE!                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log(`✅ Successfully imported: ${successCount} tasks`);
    console.log(`✅ Successfully imported: ${progressLogCount} progress logs`);
    console.log('\n🔍 Verify data:');
    console.log('   1. Open: https://supabase.com/dashboard/project/vlwppmcddxchdozqrbfa');
    console.log('   2. Check tables: tasks & progress_logs');
    console.log('   3. Open app: http://localhost:5173\n');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   - tasks.csv exists in project root');
    console.error('   - Supabase connection is working');
    console.error('   - Tables are created (run supabase-schema.sql)\n');
    process.exit(1);
  }
}

// Run import
importTasks();
