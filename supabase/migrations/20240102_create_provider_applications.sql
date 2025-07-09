-- Create provider applications table
CREATE TABLE IF NOT EXISTS provider_applications_meditravel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    years_experience INTEGER NOT NULL CHECK (years_experience > 0),
    institution VARCHAR(255),
    bio TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE provider_applications_meditravel ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own applications" 
    ON provider_applications_meditravel FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" 
    ON provider_applications_meditravel FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending applications" 
    ON provider_applications_meditravel FOR UPDATE 
    USING (auth.uid() = user_id AND status = 'pending');

-- Admin policies
CREATE POLICY "Admins can view all applications" 
    ON provider_applications_meditravel FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can update application status" 
    ON provider_applications_meditravel FOR UPDATE 
    USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k WHERE role = 'admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_provider_applications_updated_at 
    BEFORE UPDATE ON provider_applications_meditravel 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();