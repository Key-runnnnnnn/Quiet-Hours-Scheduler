-- Enable Row Level Security (RLS) on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiet_hours ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own quiet hours" ON public.quiet_hours;
DROP POLICY IF EXISTS "Users can create own quiet hours" ON public.quiet_hours;
DROP POLICY IF EXISTS "Users can update own quiet hours" ON public.quiet_hours;
DROP POLICY IF EXISTS "Users can delete own quiet hours" ON public.quiet_hours;

-- Profiles table policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Quiet Hours table policies
CREATE POLICY "Users can view own quiet hours"
    ON public.quiet_hours FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiet hours"
    ON public.quiet_hours FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiet hours"
    ON public.quiet_hours FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiet hours"
    ON public.quiet_hours FOR DELETE
    USING (auth.uid() = user_id);
