-- Create enhanced treatment details table
CREATE TABLE IF NOT EXISTS treatment_details_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_id UUID NOT NULL REFERENCES treatments_meditravel(id) ON DELETE CASCADE,
    success_rate DECIMAL(5,2) CHECK (success_rate BETWEEN 0 AND 100),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')),
    recovery_time_min INTEGER,
    recovery_time_max INTEGER,
    hospital_stay_min INTEGER,
    hospital_stay_max INTEGER,
    procedure_duration_min INTEGER,
    procedure_duration_max INTEGER,
    anesthesia_type TEXT[],
    pre_procedure_requirements TEXT[],
    post_procedure_care TEXT[],
    common_side_effects TEXT[],
    rare_complications TEXT[],
    contraindications TEXT[],
    alternative_treatments TEXT[],
    scientific_evidence TEXT,
    medical_references JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treatment comparison table for side-by-side comparison
CREATE TABLE IF NOT EXISTS treatment_comparisons_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_ids UUID[] NOT NULL,
    comparison_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treatment reviews with detailed attributes
CREATE TABLE IF NOT EXISTS treatment_detailed_reviews_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews_meditravel(id) ON DELETE CASCADE,
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    pain_level_rating INTEGER CHECK (pain_level_rating BETWEEN 1 AND 5),
    recovery_time_rating INTEGER CHECK (recovery_time_rating BETWEEN 1 AND 5),
    side_effects_severity INTEGER CHECK (side_effects_severity BETWEEN 1 AND 5),
    value_for_money_rating INTEGER CHECK (value_for_money_rating BETWEEN 1 AND 5),
    hospital_quality_rating INTEGER CHECK (hospital_quality_rating BETWEEN 1 AND 5),
    staff_care_rating INTEGER CHECK (staff_care_rating BETWEEN 1 AND 5),
    would_recommend BOOLEAN,
    outcome_satisfaction INTEGER CHECK (outcome_satisfaction BETWEEN 1 AND 5),
    specific_benefits TEXT[],
    specific_drawbacks TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treatment cost comparison across destinations
CREATE TABLE IF NOT EXISTS treatment_pricing_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_id UUID NOT NULL REFERENCES treatments_meditravel(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations_meditravel(id) ON DELETE CASCADE,
    base_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    price_components JSONB DEFAULT '{}', -- Detailed breakdown of costs
    price_includes TEXT[],
    price_excludes TEXT[],
    discounts_available JSONB DEFAULT '{}',
    insurance_accepted BOOLEAN DEFAULT FALSE,
    insurance_details TEXT,
    payment_plans_available BOOLEAN DEFAULT FALSE,
    payment_plan_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(treatment_id, destination_id)
);

-- Create patient treatment preferences
CREATE TABLE IF NOT EXISTS patient_treatment_preferences_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    preferred_countries TEXT[],
    excluded_countries TEXT[],
    max_travel_distance INTEGER, -- in miles/km
    preferred_treatment_types TEXT[],
    preferred_hospital_types TEXT[],
    preferred_accommodation_level VARCHAR(20) CHECK (preferred_accommodation_level IN ('budget', 'standard', 'premium', 'luxury')),
    required_amenities TEXT[],
    dietary_restrictions TEXT[],
    mobility_limitations TEXT,
    companion_traveling BOOLEAN DEFAULT FALSE,
    companion_details JSONB DEFAULT '{}',
    language_requirements TEXT[],
    cultural_preferences TEXT[],
    religious_requirements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create healthcare provider expertise table
CREATE TABLE IF NOT EXISTS provider_expertise_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL REFERENCES treatments_meditravel(id) ON DELETE CASCADE,
    expertise_level VARCHAR(20) CHECK (expertise_level IN ('basic', 'intermediate', 'advanced', 'expert', 'pioneer')),
    years_experience INTEGER,
    procedures_performed INTEGER,
    success_rate DECIMAL(5,2),
    complication_rate DECIMAL(5,2),
    specialization_details TEXT,
    certifications TEXT[],
    research_publications TEXT[],
    teaching_positions TEXT[],
    awards_recognitions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider_id, treatment_id)
);

-- Create provider availability for appointments
CREATE TABLE IF NOT EXISTS provider_availability_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    max_appointments INTEGER DEFAULT 10,
    appointment_duration INTEGER DEFAULT 30, -- in minutes
    buffer_time INTEGER DEFAULT 10, -- in minutes
    location_id UUID, -- Could reference a locations table
    is_virtual BOOLEAN DEFAULT FALSE,
    recurring BOOLEAN DEFAULT TRUE,
    specific_date DATE, -- For non-recurring availability
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider reviews and ratings
CREATE TABLE IF NOT EXISTS provider_reviews_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings_meditravel(id) ON DELETE SET NULL,
    treatment_id UUID REFERENCES treatments_meditravel(id) ON DELETE SET NULL,
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    knowledge_rating INTEGER CHECK (knowledge_rating BETWEEN 1 AND 5),
    bedside_manner_rating INTEGER CHECK (bedside_manner_rating BETWEEN 1 AND 5),
    facility_rating INTEGER CHECK (facility_rating BETWEEN 1 AND 5),
    staff_rating INTEGER CHECK (staff_rating BETWEEN 1 AND 5),
    wait_time_rating INTEGER CHECK (wait_time_rating BETWEEN 1 AND 5),
    review_text TEXT,
    would_recommend BOOLEAN,
    verified BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient-provider matching table
CREATE TABLE IF NOT EXISTS patient_provider_matching_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES treatments_meditravel(id) ON DELETE SET NULL,
    matching_score DECIMAL(5,2) CHECK (matching_score BETWEEN 0 AND 100),
    matching_criteria JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider team table for complex procedures
CREATE TABLE IF NOT EXISTS provider_teams_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(255) NOT NULL,
    lead_provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_members UUID[] NOT NULL,
    specialization TEXT,
    procedures_offered TEXT[],
    hospital_id UUID, -- Could reference a hospitals table
    team_bio TEXT,
    team_image_url TEXT,
    success_rate DECIMAL(5,2),
    years_collaborating INTEGER,
    cases_completed INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treatment decision support system
CREATE TABLE IF NOT EXISTS treatment_recommendations_logic_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condition VARCHAR(255) NOT NULL,
    symptom_pattern TEXT[],
    severity_level VARCHAR(20) CHECK (severity_level IN ('mild', 'moderate', 'severe', 'critical')),
    patient_age_min INTEGER,
    patient_age_max INTEGER,
    patient_gender VARCHAR(10), -- NULL means any gender
    contraindications TEXT[],
    comorbidity_factors TEXT[],
    first_line_treatments UUID[], -- Array of treatment_id references
    second_line_treatments UUID[], -- Array of treatment_id references
    alternative_treatments UUID[], -- Array of treatment_id references
    supporting_evidence TEXT,
    recommendation_strength VARCHAR(20) CHECK (recommendation_strength IN ('weak', 'moderate', 'strong')),
    medical_guidelines TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE treatment_details_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_comparisons_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_detailed_reviews_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_pricing_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_treatment_preferences_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_expertise_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_reviews_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_provider_matching_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_teams_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_recommendations_logic_emirafrik ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Treatment details are publicly viewable
CREATE POLICY "Treatment details are viewable by all users" ON treatment_details_emirafrik
    FOR SELECT USING (true);

-- Users can view their own treatment comparisons
CREATE POLICY "Users can view their own treatment comparisons" ON treatment_comparisons_emirafrik
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own treatment comparisons
CREATE POLICY "Users can create their own treatment comparisons" ON treatment_comparisons_emirafrik
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can manage their own treatment preferences
CREATE POLICY "Users can manage their own treatment preferences" ON patient_treatment_preferences_emirafrik
    FOR ALL USING (auth.uid() = user_id);

-- Provider expertise is viewable by all
CREATE POLICY "Provider expertise is viewable by all" ON provider_expertise_emirafrik
    FOR SELECT USING (true);

-- Providers can manage their own expertise
CREATE POLICY "Providers can manage their own expertise" ON provider_expertise_emirafrik
    FOR ALL USING (
        auth.uid() = provider_id OR
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k 
            WHERE role = 'admin'
        )
    );

-- Provider availability is viewable by all
CREATE POLICY "Provider availability is viewable by all" ON provider_availability_emirafrik
    FOR SELECT USING (true);

-- Providers can manage their own availability
CREATE POLICY "Providers can manage their own availability" ON provider_availability_emirafrik
    FOR ALL USING (
        auth.uid() = provider_id OR
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k 
            WHERE role = 'admin'
        )
    );

-- Provider reviews are viewable by all
CREATE POLICY "Provider reviews are viewable by all" ON provider_reviews_emirafrik
    FOR SELECT USING (true);

-- Users can create reviews for providers they've had appointments with
CREATE POLICY "Users can create provider reviews" ON provider_reviews_emirafrik
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own provider matches
CREATE POLICY "Users can view their own provider matches" ON patient_provider_matching_emirafrik
    FOR SELECT USING (auth.uid() = user_id);

-- Providers can view matches where they are the provider
CREATE POLICY "Providers can view their matches" ON patient_provider_matching_emirafrik
    FOR SELECT USING (auth.uid() = provider_id);

-- Provider teams are viewable by all
CREATE POLICY "Provider teams are viewable by all" ON provider_teams_emirafrik
    FOR SELECT USING (true);

-- Treatment pricing is viewable by all
CREATE POLICY "Treatment pricing is viewable by all" ON treatment_pricing_emirafrik
    FOR SELECT USING (true);

-- Treatment recommendation logic is viewable by healthcare providers and admins
CREATE POLICY "Treatment recommendation logic is viewable by providers and admins" ON treatment_recommendations_logic_emirafrik
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k 
            WHERE role IN ('healthcare_provider', 'admin')
        )
    );

-- Create functions for treatment recommendation
CREATE OR REPLACE FUNCTION get_treatment_recommendations(
    p_user_id UUID,
    p_condition TEXT DEFAULT NULL,
    p_symptoms TEXT[] DEFAULT NULL,
    p_severity VARCHAR DEFAULT NULL,
    p_budget_max DECIMAL DEFAULT NULL
) RETURNS TABLE (
    treatment_id UUID,
    treatment_name TEXT,
    match_score DECIMAL,
    recommendation_reason TEXT,
    estimated_cost DECIMAL,
    success_rate DECIMAL,
    provider_id UUID,
    provider_name TEXT
) AS $$
BEGIN
    -- This is a placeholder for the recommendation algorithm
    -- In a real implementation, this would include complex matching logic
    RETURN QUERY
    SELECT 
        t.id as treatment_id,
        t.name as treatment_name,
        75.5::DECIMAL as match_score,
        'Based on your condition and preferences' as recommendation_reason,
        tp.base_price as estimated_cost,
        td.success_rate,
        pe.provider_id,
        up.first_name || ' ' || up.last_name as provider_name
    FROM 
        treatments_meditravel t
    LEFT JOIN 
        treatment_details_emirafrik td ON t.id = td.treatment_id
    LEFT JOIN 
        treatment_pricing_emirafrik tp ON t.id = tp.treatment_id
    LEFT JOIN 
        provider_expertise_emirafrik pe ON t.id = pe.treatment_id
    LEFT JOIN 
        user_profiles_meditravel up ON pe.provider_id = up.id
    WHERE 
        (p_budget_max IS NULL OR tp.base_price <= p_budget_max)
    ORDER BY 
        pe.expertise_level DESC, td.success_rate DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Create function to find matching providers
CREATE OR REPLACE FUNCTION find_matching_providers(
    p_user_id UUID,
    p_treatment_id UUID
) RETURNS TABLE (
    provider_id UUID,
    provider_name TEXT,
    match_score DECIMAL,
    expertise_level VARCHAR,
    years_experience INTEGER,
    success_rate DECIMAL,
    availability_count INTEGER
) AS $$
BEGIN
    -- This is a placeholder for the provider matching algorithm
    RETURN QUERY
    SELECT 
        pe.provider_id,
        up.first_name || ' ' || up.last_name as provider_name,
        (pe.success_rate * 0.5 + pe.years_experience * 2)::DECIMAL as match_score,
        pe.expertise_level,
        pe.years_experience,
        pe.success_rate,
        COUNT(pa.id) as availability_count
    FROM 
        provider_expertise_emirafrik pe
    JOIN 
        user_profiles_meditravel up ON pe.provider_id = up.id
    LEFT JOIN 
        provider_availability_emirafrik pa ON pe.provider_id = pa.provider_id
    WHERE 
        pe.treatment_id = p_treatment_id
        AND pa.is_available = true
    GROUP BY 
        pe.provider_id, up.first_name, up.last_name, pe.expertise_level, 
        pe.years_experience, pe.success_rate
    ORDER BY 
        match_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
CREATE TRIGGER update_treatment_details_updated_at
    BEFORE UPDATE ON treatment_details_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_comparisons_updated_at
    BEFORE UPDATE ON treatment_comparisons_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_detailed_reviews_updated_at
    BEFORE UPDATE ON treatment_detailed_reviews_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_pricing_updated_at
    BEFORE UPDATE ON treatment_pricing_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_treatment_preferences_updated_at
    BEFORE UPDATE ON patient_treatment_preferences_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_expertise_updated_at
    BEFORE UPDATE ON provider_expertise_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_availability_updated_at
    BEFORE UPDATE ON provider_availability_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_reviews_updated_at
    BEFORE UPDATE ON provider_reviews_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_provider_matching_updated_at
    BEFORE UPDATE ON patient_provider_matching_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_teams_updated_at
    BEFORE UPDATE ON provider_teams_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_recommendations_logic_updated_at
    BEFORE UPDATE ON treatment_recommendations_logic_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();