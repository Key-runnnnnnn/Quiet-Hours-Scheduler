-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiet_hours table
CREATE TABLE IF NOT EXISTS public.quiet_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_sent BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure end_time is after start_time
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_quiet_hours_user_id ON public.quiet_hours(user_id);
CREATE INDEX IF NOT EXISTS idx_quiet_hours_start_time ON public.quiet_hours(start_time);
CREATE INDEX IF NOT EXISTS idx_quiet_hours_active ON public.quiet_hours(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quiet_hours_reminder_pending ON public.quiet_hours(reminder_sent, start_time) WHERE reminder_sent = false AND is_active = true;

-- Create updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating updated_at timestamps
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_quiet_hours_updated_at ON public.quiet_hours;
CREATE TRIGGER trigger_quiet_hours_updated_at
    BEFORE UPDATE ON public.quiet_hours
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
