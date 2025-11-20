import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://vlwppmcddxchdozqrbfa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsd3BwbWNkZHhjaGRvenFyYmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTkzMTYsImV4cCI6MjA3OTE5NTMxNn0.T54F7L5epqtCQJXtAUXzbMd2HAhPqKDVDLrQD3a7P3M';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// REPORTS API
// ============================================

export const reportsAPI = {
  // Get all reports
  async getAll() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get single report by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new report
  async create(report) {
    const { data, error } = await supabase
      .from('reports')
      .insert([report])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update report
  async update(id, updates) {
    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete report
  async delete(id) {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to real-time changes
  subscribe(callback) {
    return supabase
      .channel('reports_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reports' }, 
        callback
      )
      .subscribe();
  }
};

// ============================================
// TASKS API
// ============================================

export const tasksAPI = {
  // Get all tasks
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get single task by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new task
  async create(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update task
  async update(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete task
  async delete(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to real-time changes
  subscribe(callback) {
    return supabase
      .channel('tasks_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' }, 
        callback
      )
      .subscribe();
  }
};

// ============================================
// PROGRESS LOGS API
// ============================================

export const progressLogsAPI = {
  // Get all progress logs for a task
  async getByTaskId(taskId) {
    const { data, error } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create new progress log
  async create(log) {
    const { data, error } = await supabase
      .from('progress_logs')
      .insert([log])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update progress log
  async update(id, updates) {
    const { data, error } = await supabase
      .from('progress_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete progress log
  async delete(id) {
    const { error } = await supabase
      .from('progress_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// SPAREPARTS API
// ============================================

export const sparepartsAPI = {
  // Get all spareparts
  async getAll() {
    const { data, error } = await supabase
      .from('spareparts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get single sparepart by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('spareparts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new sparepart order
  async create(sparepart) {
    const { data, error } = await supabase
      .from('spareparts')
      .insert([sparepart])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update sparepart
  async update(id, updates) {
    const { data, error } = await supabase
      .from('spareparts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete sparepart
  async delete(id) {
    const { error } = await supabase
      .from('spareparts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to real-time changes
  subscribe(callback) {
    return supabase
      .channel('spareparts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'spareparts' }, 
        callback
      )
      .subscribe();
  }
};

// ============================================
// REPAIRS API
// ============================================

export const repairsAPI = {
  // Get all repairs
  async getAll() {
    const { data, error } = await supabase
      .from('repairs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get single repair by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('repairs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new repair
  async create(repair) {
    const { data, error } = await supabase
      .from('repairs')
      .insert([repair])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update repair
  async update(id, updates) {
    const { data, error } = await supabase
      .from('repairs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete repair
  async delete(id) {
    const { error } = await supabase
      .from('repairs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to real-time changes
  subscribe(callback) {
    return supabase
      .channel('repairs_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'repairs' }, 
        callback
      )
      .subscribe();
  }
};

// ============================================
// STATISTICS API
// ============================================

export const statisticsAPI = {
  // Get task statistics
  async getTasks() {
    const { data, error } = await supabase
      .from('task_statistics')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get sparepart statistics
  async getSpareparts() {
    const { data, error } = await supabase
      .from('sparepart_statistics')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get repair statistics
  async getRepairs() {
    const { data, error } = await supabase
      .from('repair_statistics')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }
};
