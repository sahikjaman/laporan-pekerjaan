-- HVE Electrical SPIL Database Schema
-- Created: 2025-11-20
-- Description: Complete database schema for field work management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    project VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster date queries
CREATE INDEX idx_reports_date ON reports(date DESC);
CREATE INDEX idx_reports_project ON reports(project);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
    status VARCHAR(20) NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Completed')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    deadline DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for filtering and sorting
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- ============================================
-- PROGRESS LOGS TABLE
-- ============================================
CREATE TABLE progress_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for task relationship
CREATE INDEX idx_progress_logs_task_id ON progress_logs(task_id);

-- ============================================
-- SPAREPARTS TABLE
-- ============================================
CREATE TABLE spareparts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Ordered', 'Arrived')),
    order_date DATE,
    arrival_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for status filtering
CREATE INDEX idx_spareparts_status ON spareparts(status);
CREATE INDEX idx_spareparts_name ON spareparts(name);

-- ============================================
-- REPAIRS TABLE
-- ============================================
CREATE TABLE repairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment VARCHAR(255) NOT NULL,
    issue TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
    technician VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for filtering
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_repairs_priority ON repairs(priority);
CREATE INDEX idx_repairs_equipment ON repairs(equipment);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spareparts_updated_at BEFORE UPDATE ON spareparts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE spareparts ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (since we don't have auth yet)
-- WARNING: For production, implement proper authentication!

CREATE POLICY "Enable all operations for all users" ON reports
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON tasks
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON progress_logs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON spareparts
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON repairs
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================
-- Uncomment to insert sample data for testing

/*
-- Sample Reports
INSERT INTO reports (date, start_time, end_time, location, project, description, notes) VALUES
('2025-11-20', '08:00', '17:00', 'Jakarta Site A', 'Generator Maintenance', 'Regular maintenance check on diesel generator', 'All systems operational'),
('2025-11-19', '09:00', '15:00', 'Surabaya Port', 'Crane Repair', 'Fixed electrical wiring issue on port crane', 'Replaced damaged cables');

-- Sample Tasks
INSERT INTO tasks (title, description, priority, status, progress, deadline) VALUES
('Inspect Generator Set', 'Perform monthly inspection on all generator sets', 'High', 'In Progress', 60, '2025-11-25'),
('Replace Motor Brushes', 'Replace worn brushes on conveyor motor', 'Medium', 'To Do', 0, '2025-11-30');

-- Sample Spareparts
INSERT INTO spareparts (name, quantity, unit, description, status, order_date) VALUES
('Circuit Breaker 100A', 5, 'pcs', '3-phase circuit breaker', 'Ordered', '2025-11-18'),
('Power Cable 10mm²', 100, 'meters', 'Copper power cable', 'Pending', NULL);

-- Sample Repairs
INSERT INTO repairs (equipment, issue, status, priority, technician, notes) VALUES
('Excavator CAT 320', 'Starter motor not working', 'In Progress', 'High', 'Ahmad Ridwan', 'Ordered new starter motor'),
('Forklift Toyota FD30', 'Battery not charging', 'Pending', 'Medium', NULL, 'Waiting for inspection');
*/

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View for task statistics
CREATE VIEW task_statistics AS
SELECT 
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'Completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress_tasks,
    COUNT(*) FILTER (WHERE status = 'To Do') as todo_tasks,
    ROUND(AVG(progress), 2) as avg_progress
FROM tasks;

-- View for sparepart statistics
CREATE VIEW sparepart_statistics AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending_orders,
    COUNT(*) FILTER (WHERE status = 'Ordered') as ordered_items,
    COUNT(*) FILTER (WHERE status = 'Arrived') as arrived_items,
    SUM(quantity) as total_quantity
FROM spareparts;

-- View for repair statistics
CREATE VIEW repair_statistics AS
SELECT 
    COUNT(*) as total_repairs,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending_repairs,
    COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress_repairs,
    COUNT(*) FILTER (WHERE status = 'Completed') as completed_repairs,
    COUNT(*) FILTER (WHERE priority = 'High') as high_priority
FROM repairs;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE reports IS 'Daily field work reports';
COMMENT ON TABLE tasks IS 'Task management with progress tracking';
COMMENT ON TABLE progress_logs IS 'Historical progress updates for tasks';
COMMENT ON TABLE spareparts IS 'Spare parts ordering and inventory';
COMMENT ON TABLE repairs IS 'Equipment repair tracking';

-- End of schema
