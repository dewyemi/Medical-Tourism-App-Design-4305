-- Enhanced Payment System with Cryptocurrency and Payment Plans
-- This migration adds comprehensive payment support including crypto and flexible payment plans

-- Create currencies table if not exists
CREATE TABLE IF NOT EXISTS currencies_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(10,4) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    is_crypto BOOLEAN DEFAULT FALSE,
    crypto_network VARCHAR(50), -- e.g., 'ethereum', 'bitcoin', 'polygon'
    contract_address TEXT, -- for ERC-20 tokens
    decimals INTEGER DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mobile money providers table if not exists
CREATE TABLE IF NOT EXISTS momo_providers_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    logo_url TEXT,
    api_endpoint TEXT,
    api_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table if not exists
CREATE TABLE IF NOT EXISTS payments_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings_meditravel(id) ON DELETE CASCADE,
    payment_plan_id UUID, -- Will reference payment_plans table
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL CHECK (
        payment_method IN (
            'stripe', 'momo', 'bank_transfer', 'crypto', 
            'payment_plan', 'insurance', 'cash'
        )
    ),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN (
            'pending', 'processing', 'completed', 'failed', 
            'cancelled', 'refunded', 'partially_refunded'
        )
    ),
    provider VARCHAR(100), -- e.g., 'MTN', 'Orange', 'Bitcoin', 'Ethereum'
    transaction_id VARCHAR(255),
    reference VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    fee_amount DECIMAL(12,2) DEFAULT 0,
    net_amount DECIMAL(12,2),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment plans table
CREATE TABLE IF NOT EXISTS payment_plans_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings_meditravel(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    down_payment DECIMAL(12,2) NOT NULL,
    installments INTEGER NOT NULL,
    installment_amount DECIMAL(12,2) NOT NULL,
    installment_frequency VARCHAR(20) NOT NULL CHECK (
        installment_frequency IN ('weekly', 'monthly', 'quarterly')
    ),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (
        status IN ('draft', 'active', 'completed', 'defaulted', 'cancelled')
    ),
    late_fee_rate DECIMAL(5,4) DEFAULT 0.05, -- 5% late fee
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment plan installments table
CREATE TABLE IF NOT EXISTS payment_installments_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_plan_id UUID NOT NULL REFERENCES payment_plans_emirafrik(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'paid', 'overdue', 'forgiven')
    ),
    payment_id UUID REFERENCES payments_emirafrik(id),
    paid_amount DECIMAL(12,2) DEFAULT 0,
    paid_at TIMESTAMP WITH TIME ZONE,
    late_fee DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crypto wallets table for secure handling
CREATE TABLE IF NOT EXISTS crypto_wallets_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(20) NOT NULL,
    network VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    daily_limit DECIMAL(12,2),
    balance DECIMAL(18,8) DEFAULT 0,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crypto transactions table
CREATE TABLE IF NOT EXISTS crypto_transactions_emirafrik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments_emirafrik(id) ON DELETE CASCADE,
    from_address TEXT,
    to_address TEXT NOT NULL,
    amount DECIMAL(18,8) NOT NULL,
    currency VARCHAR(20) NOT NULL,
    network VARCHAR(50) NOT NULL,
    transaction_hash TEXT,
    block_number BIGINT,
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 6,
    gas_fee DECIMAL(18,8),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'failed', 'replaced')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all new tables
ALTER TABLE currencies_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE momo_providers_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_installments_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_wallets_emirafrik ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_transactions_emirafrik ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active currencies" ON currencies_emirafrik
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active momo providers" ON momo_providers_emirafrik
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own payments" ON payments_emirafrik
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON payments_emirafrik
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment plans" ON payment_plans_emirafrik
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment plans" ON payment_plans_emirafrik
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their installments" ON payment_installments_emirafrik
    FOR SELECT USING (
        payment_plan_id IN (
            SELECT id FROM payment_plans_emirafrik WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view active crypto wallets" ON crypto_wallets_emirafrik
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their crypto transactions" ON crypto_transactions_emirafrik
    FOR SELECT USING (
        payment_id IN (
            SELECT id FROM payments_emirafrik WHERE user_id = auth.uid()
        )
    );

-- Admin policies
CREATE POLICY "Admins can manage currencies" ON currencies_emirafrik
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can manage momo providers" ON momo_providers_emirafrik
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can view all payments" ON payments_emirafrik
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_roles_meditravel_x8f24k WHERE role = 'admin'
        )
    );

-- Insert default currencies
INSERT INTO currencies_emirafrik (code, name, symbol, exchange_rate, is_crypto, crypto_network, decimals)
VALUES 
    -- Fiat currencies
    ('USD', 'US Dollar', '$', 1.0000, false, null, 2),
    ('EUR', 'Euro', '€', 0.8500, false, null, 2),
    ('GBP', 'British Pound', '£', 0.7500, false, null, 2),
    ('NGN', 'Nigerian Naira', '₦', 850.0000, false, null, 2),
    ('GHS', 'Ghanaian Cedi', '₵', 12.0000, false, null, 2),
    ('KES', 'Kenyan Shilling', 'KSh', 150.0000, false, null, 2),
    ('ZAR', 'South African Rand', 'R', 18.0000, false, null, 2),
    ('AED', 'UAE Dirham', 'د.إ', 3.6700, false, null, 2),
    ('THB', 'Thai Baht', '฿', 36.0000, false, null, 2),
    ('INR', 'Indian Rupee', '₹', 83.0000, false, null, 2),
    ('TRY', 'Turkish Lira', '₺', 28.0000, false, null, 2),
    
    -- Cryptocurrencies
    ('BTC', 'Bitcoin', '₿', 43000.0000, true, 'bitcoin', 8),
    ('ETH', 'Ethereum', 'Ξ', 2600.0000, true, 'ethereum', 18),
    ('USDT', 'Tether', 'USDT', 1.0000, true, 'ethereum', 6),
    ('USDC', 'USD Coin', 'USDC', 1.0000, true, 'ethereum', 6),
    ('BNB', 'Binance Coin', 'BNB', 300.0000, true, 'binance', 18),
    ('MATIC', 'Polygon', 'MATIC', 0.8000, true, 'polygon', 18)
ON CONFLICT (code) DO UPDATE SET
    exchange_rate = EXCLUDED.exchange_rate,
    updated_at = NOW();

-- Insert default mobile money providers
INSERT INTO momo_providers_emirafrik (code, name, country, currency, logo_url)
VALUES 
    ('MTN_GH', 'MTN Mobile Money', 'Ghana', 'GHS', 'https://cdn.logo.com/hotlink-ok/logos/mtn.png'),
    ('VODAFONE_GH', 'Vodafone Cash', 'Ghana', 'GHS', 'https://cdn.logo.com/hotlink-ok/logos/vodafone.png'),
    ('AIRTELTIGO_GH', 'AirtelTigo Money', 'Ghana', 'GHS', 'https://cdn.logo.com/hotlink-ok/logos/airtel.png'),
    ('MTN_NG', 'MTN Mobile Money', 'Nigeria', 'NGN', 'https://cdn.logo.com/hotlink-ok/logos/mtn.png'),
    ('AIRTEL_NG', 'Airtel Money', 'Nigeria', 'NGN', 'https://cdn.logo.com/hotlink-ok/logos/airtel.png'),
    ('MTN_CI', 'MTN Mobile Money', 'Ivory Coast', 'XOF', 'https://cdn.logo.com/hotlink-ok/logos/mtn.png'),
    ('ORANGE_CI', 'Orange Money', 'Ivory Coast', 'XOF', 'https://cdn.logo.com/hotlink-ok/logos/orange.png'),
    ('MTN_CM', 'MTN Mobile Money', 'Cameroon', 'XAF', 'https://cdn.logo.com/hotlink-ok/logos/mtn.png'),
    ('ORANGE_CM', 'Orange Money', 'Cameroon', 'XAF', 'https://cdn.logo.com/hotlink-ok/logos/orange.png'),
    ('MPESA_KE', 'M-Pesa', 'Kenya', 'KES', 'https://cdn.logo.com/hotlink-ok/logos/mpesa.png'),
    ('AIRTEL_KE', 'Airtel Money', 'Kenya', 'KES', 'https://cdn.logo.com/hotlink-ok/logos/airtel.png')
ON CONFLICT (code) DO NOTHING;

-- Insert default crypto wallets (these would be managed securely in production)
INSERT INTO crypto_wallets_emirafrik (currency, network, address, daily_limit)
VALUES 
    ('BTC', 'bitcoin', '1EmirAfrikBTCWalletAddressExample123', 50000.00),
    ('ETH', 'ethereum', '0xEmirAfrikETHWalletAddressExample123456789', 100000.00),
    ('USDT', 'ethereum', '0xEmirAfrikUSDTWalletAddressExample123456789', 200000.00),
    ('USDC', 'ethereum', '0xEmirAfrikUSDCWalletAddressExample123456789', 200000.00)
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_currencies_updated_at
    BEFORE UPDATE ON currencies_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at
    BEFORE UPDATE ON payment_plans_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_installments_updated_at
    BEFORE UPDATE ON payment_installments_emirafrik
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate payment plans
CREATE OR REPLACE FUNCTION generate_payment_plan(
    p_user_id UUID,
    p_booking_id UUID,
    p_total_amount DECIMAL,
    p_down_payment DECIMAL,
    p_installments INTEGER,
    p_frequency VARCHAR,
    p_start_date DATE
) RETURNS UUID AS $$
DECLARE
    plan_id UUID;
    installment_amount DECIMAL;
    current_date DATE;
    i INTEGER;
BEGIN
    -- Calculate installment amount
    installment_amount := (p_total_amount - p_down_payment) / p_installments;
    
    -- Create payment plan
    INSERT INTO payment_plans_emirafrik (
        user_id, booking_id, plan_name, total_amount, down_payment,
        installments, installment_amount, installment_frequency,
        start_date, end_date
    ) VALUES (
        p_user_id, p_booking_id, 
        'Payment Plan for Booking ' || p_booking_id,
        p_total_amount, p_down_payment, p_installments, installment_amount,
        p_frequency, p_start_date,
        p_start_date + INTERVAL '1 month' * p_installments
    ) RETURNING id INTO plan_id;
    
    -- Generate installments
    current_date := p_start_date;
    FOR i IN 1..p_installments LOOP
        -- Calculate due date based on frequency
        IF p_frequency = 'weekly' THEN
            current_date := p_start_date + INTERVAL '1 week' * i;
        ELSIF p_frequency = 'monthly' THEN
            current_date := p_start_date + INTERVAL '1 month' * i;
        ELSIF p_frequency = 'quarterly' THEN
            current_date := p_start_date + INTERVAL '3 months' * i;
        END IF;
        
        INSERT INTO payment_installments_emirafrik (
            payment_plan_id, installment_number, due_date, amount
        ) VALUES (plan_id, i, current_date, installment_amount);
    END LOOP;
    
    RETURN plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update payment status
CREATE OR REPLACE FUNCTION update_payment_status(
    p_payment_id UUID,
    p_status VARCHAR,
    p_transaction_id VARCHAR DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE payments_emirafrik 
    SET 
        payment_status = p_status,
        transaction_id = COALESCE(p_transaction_id, transaction_id),
        processed_at = CASE 
            WHEN p_status = 'completed' THEN NOW() 
            ELSE processed_at 
        END,
        updated_at = NOW()
    WHERE id = p_payment_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;