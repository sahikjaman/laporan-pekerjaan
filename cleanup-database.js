import { supabase } from './src/supabaseClient.js';

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║           CLEANING UP DATABASE FOR RE-IMPORT                ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

async function cleanup() {
  try {
    // Delete progress logs first (foreign key constraint)
    console.log('🗑️  Deleting progress logs...');
    const { error: logsError } = await supabase
      .from('progress_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (logsError) throw logsError;
    console.log('   ✅ Progress logs deleted\n');

    // Delete tasks
    console.log('🗑️  Deleting tasks...');
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (tasksError) throw tasksError;
    console.log('   ✅ Tasks deleted\n');

    // Delete spareparts
    console.log('🗑️  Deleting spareparts...');
    const { error: partsError } = await supabase
      .from('spareparts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (partsError) throw partsError;
    console.log('   ✅ Spareparts deleted\n');

    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                 DATABASE CLEANUP COMPLETE!                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log('✅ Ready for fresh import\n');
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanup();
