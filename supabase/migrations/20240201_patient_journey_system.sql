-- Create patient journey tracking system
CREATE TABLE IF NOT EXISTS patient_journeys_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    journey_stage VARCHAR(50) NOT NULL DEFAULT 'initial_inquiry' CHECK (
        journey_stage IN (
            'initial_inquiry',
            'medical_history_collection',
            'preliminary_assessment',
            'treatment_selection',
            'provider_matching',
            'payment_processing',
            'appointment_booking',
            'pre_travel_preparation',
            'visa_accommodation',
            'arrival_orientation',
            'treatment_execution',
            'recovery_monitoring',
            'discharge_planning',
            'return_travel',
            'follow_up_care',
            'outcome_assessment'
        )
    ),
    journey_data JSONB DEFAULT '{}',
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 16,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journey milestones table
CREATE TABLE IF NOT EXISTS journey_milestones_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID NOT NULL REFERENCES patient_journeys_emirafrik(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL,
    milestone_title VARCHAR(255) NOT NULL,
    milestone_description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical history records table
CREATE TABLE IF NOT EXISTS medical_history_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medical_conditions TEXT[],
    current_medications TEXT[],
    allergies TEXT[],
    previous_surgeries TEXT[],
    family_history TEXT[],
    lifestyle_factors JSONB DEFAULT '{}',
    emergency_contacts JSONB DEFAULT '{}',
    insurance_information JSONB DEFAULT '{}',
    documents JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer service tickets table
CREATE TABLE IF NOT EXISTS support_tickets_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    category VARCHAR(50) DEFAULT 'general' CHECK (
        category IN (
            'general',
            'medical',
            'payment',
            'travel',
            'technical',
            'complaint',
            'emergency'
        )
    ),
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket messages table
CREATE TABLE IF NOT EXISTS ticket_messages_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets_emirafrik(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '{}',
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treatment recommendations table
CREATE TABLE IF NOT EXISTS treatment_recommendations_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL REFERENCES treatments_meditravel(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations_meditravel(id) ON DELETE CASCADE,
    recommendation_score DECIMAL(3,2) DEFAULT 0.0,
    recommendation_reasons TEXT[],
    estimated_cost DECIMAL(10,2),
    estimated_duration INTEGER, -- in days
    success_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider profiles table (enhanced healthcare providers)
CREATE TABLE IF NOT EXISTS provider_profiles_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_type VARCHAR(50) NOT NULL CHECK (
        provider_type IN ('doctor', 'specialist', 'surgeon', 'facility', 'coordinator')
    ),
    specializations TEXT[],
    certifications TEXT[],
    experience_years INTEGER,
    education JSONB DEFAULT '{}',
    languages TEXT[],
    availability JSONB DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_patients INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    bio TEXT,
    profile_image_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create travel coordination table
CREATE TABLE IF NOT EXISTS travel_coordination_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    journey_id UUID NOT NULL REFERENCES patient_journeys_emirafrik(id) ON DELETE CASCADE,
    departure_country VARCHAR(100),
    departure_city VARCHAR(100),
    destination_country VARCHAR(100),
    destination_city VARCHAR(100),
    travel_dates JSONB DEFAULT '{}',
    visa_status VARCHAR(50) DEFAULT 'not_required' CHECK (
        visa_status IN ('not_required', 'pending', 'approved', 'rejected', 'expired')
    ),
    accommodation_booking JSONB DEFAULT '{}',
    flight_booking JSONB DEFAULT '{}',
    local_transport JSONB DEFAULT '{}',
    travel_insurance JSONB DEFAULT '{}',
    emergency_contacts JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointment scheduling table
CREATE TABLE IF NOT EXISTS appointments_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings_meditravel(id) ON DELETE CASCADE,
    appointment_type VARCHAR(50) NOT NULL CHECK (
        appointment_type IN (
            'consultation',
            'pre_treatment',
            'treatment',
            'post_treatment',
            'follow_up',
            'emergency'
        )
    ),
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled')
    ),
    appointment_notes TEXT,
    location VARCHAR(255),
    meeting_link TEXT,
    reminders_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create care plans table
CREATE TABLE IF NOT EXISTS care_plans_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL REFERENCES treatments_meditravel(id) ON DELETE CASCADE,
    plan_title VARCHAR(255) NOT NULL,
    plan_description TEXT,
    care_instructions TEXT,
    medications JSONB DEFAULT '{}',
    restrictions JSONB DEFAULT '{}',
    follow_up_schedule JSONB DEFAULT '{}',
    recovery_milestones JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('draft', 'active', 'completed', 'cancelled')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communication logs table
CREATE TABLE IF NOT EXISTS communication_logs_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL CHECK (
        communication_type IN ('message', 'call', 'video_call', 'email', 'notification')
    ),
    subject VARCHAR(255),
    content TEXT,
    attachments JSONB DEFAULT '{}',
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE patient_journeys_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_milestones_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_recommendations_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_coordination_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plans_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs_emirafrik ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patient journeys
CREATE POLICY "Users can view their own journey" ON patient_journeys_emirafrik
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own journey" ON patient_journeys_emirafrik
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journey" ON patient_journeys_emirafrik
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Providers and admins can view all journeys
CREATE POLICY "Providers can view all journeys" ON patient_journeys_emirafrik
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k 
            WHERE role IN ('healthcare_provider', 'admin')
        )
    );

-- Create RLS policies for medical history
CREATE POLICY "Users can manage their medical history" ON medical_history_emirafrik
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Providers can view patient medical history" ON medical_history_emirafrik
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k 
            WHERE role IN ('healthcare_provider', 'admin')
        )
    );

-- Create RLS policies for support tickets
CREATE POLICY "Users can manage their tickets" ON support_tickets_emirafrik
    FOR ALL USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Support staff can view all tickets" ON support_tickets_emirafrik
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k 
            WHERE role IN ('admin', 'healthcare_provider')
        )
    );

-- Create RLS policies for appointments
CREATE POLICY "Users can view their appointments" ON appointments_emirafrik
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = provider_id);

CREATE POLICY "Users can create appointments" ON appointments_emirafrik
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can manage appointments" ON appointments_emirafrik
    FOR ALL USING (auth.uid() = provider_id);

-- Create functions for journey management
CREATE OR REPLACE FUNCTION advance_patient_journey(
    p_user_id UUID,
    p_new_stage VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    journey_exists BOOLEAN;
BEGIN
    -- Check if journey exists
    SELECT EXISTS(
        SELECT 1 FROM patient_journeys_emirafrik 
        WHERE user_id = p_user_id
    ) INTO journey_exists;
    
    IF journey_exists THEN
        -- Update existing journey
        UPDATE patient_journeys_emirafrik 
        SET 
            journey_stage = p_new_stage,
            current_step = current_step + 1,
            last_updated = NOW()
        WHERE user_id = p_user_id;
    ELSE
        -- Create new journey
        INSERT INTO patient_journeys_emirafrik (user_id, journey_stage)
        VALUES (p_user_id, p_new_stage);
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS TEXT AS $$
BEGIN
    RETURN 'EMF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
           LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket number generation
CREATE OR REPLACE FUNCTION set_ticket_number() RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_number = generate_ticket_number();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number_trigger
    BEFORE INSERT ON support_tickets_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_number();

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_medical_history_updated_at
    BEFORE UPDATE ON medical_history_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_profiles_updated_at
    BEFORE UPDATE ON provider_profiles_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_coordination_updated_at
    BEFORE UPDATE ON travel_coordination_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_care_plans_updated_at
    BEFORE UPDATE ON care_plans_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();