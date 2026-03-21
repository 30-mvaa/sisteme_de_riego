-- Chuichun Community Management Database Schema
-- PostgreSQL 17

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS auth_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cedula VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    land_hectares DECIMAL(10,2) NOT NULL,
    land_location VARCHAR(200),
    land_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Community events
CREATE TABLE IF NOT EXISTS community_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('meeting', 'work')),
    event_date DATE NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event attendance
CREATE TABLE IF NOT EXISTS event_attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT false,
    fine_generated BOOLEAN DEFAULT false,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    fine_paid BOOLEAN DEFAULT false,
    fine_payment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, member_id)
);

-- Monthly charges
CREATE TABLE IF NOT EXISTS monthly_charges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
    amount DECIMAL(10,2) NOT NULL,
    paid BOOLEAN DEFAULT false,
    payment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, month)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id),
    member_name VARCHAR(100) NOT NULL,
    concept VARCHAR(20) NOT NULL CHECK (concept IN ('monthly', 'event_fine', 'other')),
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment charge relationships
CREATE TABLE IF NOT EXISTS payment_monthly_charges (
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    monthly_charge_id UUID NOT NULL REFERENCES monthly_charges(id) ON DELETE CASCADE,
    PRIMARY KEY (payment_id, monthly_charge_id)
);

-- Payment fine relationships
CREATE TABLE IF NOT EXISTS payment_event_attendances (
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    attendance_id UUID NOT NULL REFERENCES event_attendances(id) ON DELETE CASCADE,
    PRIMARY KEY (payment_id, attendance_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_cedula ON members(cedula);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_events_date ON community_events(event_date);
CREATE INDEX IF NOT EXISTS idx_attendances_event ON event_attendances(event_id);
CREATE INDEX IF NOT EXISTS idx_attendances_member ON event_attendances(member_id);
CREATE INDEX IF NOT EXISTS idx_monthly_charges_member ON monthly_charges(member_id);
CREATE INDEX IF NOT EXISTS idx_monthly_charges_month ON monthly_charges(month);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON payments(receipt_number);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_auth_users_updated_at BEFORE UPDATE ON auth_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_events_updated_at BEFORE UPDATE ON community_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_attendances_updated_at BEFORE UPDATE ON event_attendances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monthly_charges_updated_at BEFORE UPDATE ON monthly_charges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_monthly_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_event_attendances ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users" ON auth_users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON auth_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON auth_users FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON auth_users FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON members FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON members FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON members FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON community_events FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON community_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON community_events FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON community_events FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON event_attendances FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON event_attendances FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON event_attendances FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON event_attendances FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON monthly_charges FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON monthly_charges FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON monthly_charges FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON monthly_charges FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON payments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON payments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON payments FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON payment_monthly_charges FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON payment_monthly_charges FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON payment_monthly_charges FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON payment_event_attendances FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON payment_event_attendances FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON payment_event_attendances FOR DELETE USING (true);
