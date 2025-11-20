// Import Spareparts to Supabase
import { sparepartsAPI } from './src/supabaseClient.js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const SPAREPARTS_CSV = './spareparts-supabase.csv';

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║          IMPORTING SPAREPARTS TO SUPABASE                    ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

async function importSpareparts() {
  try {
    console.log('📖 Reading spareparts-supabase.csv...');
    const fileContent = fs.readFileSync(SPAREPARTS_CSV, 'utf-8').replace(/^\uFEFF/, ''); // Remove BOM
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_quotes: true
    });

    console.log(`✅ Found ${records.length} spareparts\n`);

    let successCount = 0;

    for (const row of records) {
      try {
        const { name, quantity, unit, description, status, order_date, arrival_date } = row;

        if (!name || !quantity || !unit) {
          console.log('⚠️  Skipping row with missing required fields');
          continue;
        }

        console.log(`📦 Importing: ${name}`);
        
        const sparepartData = {
          name: name,
          quantity: parseInt(quantity),
          unit: unit,
          description: description || null,
          status: status || 'Pending',
          order_date: order_date || null,
          arrival_date: arrival_date || null
        };

        await sparepartsAPI.create(sparepartData);
        console.log(`   ✅ Success\n`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
      }
    }

    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    IMPORT COMPLETE!                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log(`✅ Successfully imported: ${successCount} spareparts`);
    console.log('\n🔍 Verify in app: http://localhost:5173\n');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error('\n💡 Make sure spareparts-supabase.csv exists\n');
    process.exit(1);
  }
}

importSpareparts();
