-- =====================================================
-- Migration 002: Row Level Security Policies
-- =====================================================

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE handling_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Hanya authenticated user (admin tunggal) yang bisa akses semua tabel
CREATE POLICY "admin_full_access_admins" ON admins FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_interaction_types" ON interaction_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_handling_types" ON handling_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_districts" ON districts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_villages" ON villages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_customer_master" ON customer_master FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_import_batches" ON import_batches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_tickets" ON tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_ticket_status_history" ON ticket_status_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_full_access_backup_logs" ON backup_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role (untuk Edge Functions backup) bisa akses semua
CREATE POLICY "service_role_full_access_tickets" ON tickets FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_backup_logs" ON backup_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
