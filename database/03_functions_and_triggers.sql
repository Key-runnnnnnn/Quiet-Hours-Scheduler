-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get upcoming quiet hours that need reminders
CREATE OR REPLACE FUNCTION public.get_upcoming_reminders(reminder_window_minutes INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    title TEXT,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qh.id,
        qh.user_id,
        p.email as user_email,
        p.name as user_name,
        qh.title,
        qh.description,
        qh.start_time,
        qh.end_time
    FROM public.quiet_hours qh
    JOIN public.profiles p ON qh.user_id = p.id
    WHERE 
        qh.is_active = true 
        AND qh.reminder_sent = false
        AND qh.start_time > NOW()
        AND qh.start_time <= NOW() + (reminder_window_minutes || ' minutes')::INTERVAL
    ORDER BY qh.start_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark reminders as sent
CREATE OR REPLACE FUNCTION public.mark_reminders_sent(reminder_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.quiet_hours
    SET reminder_sent = true, updated_at = NOW()
    WHERE id = ANY(reminder_ids)
    AND reminder_sent = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for overlapping quiet hours
CREATE OR REPLACE FUNCTION public.check_overlap_quiet_hours(
    p_user_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    overlap_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO overlap_count
    FROM public.quiet_hours
    WHERE 
        user_id = p_user_id
        AND is_active = true
        AND (p_exclude_id IS NULL OR id != p_exclude_id)
        AND (
            (start_time < p_end_time AND end_time > p_start_time)
        );
    
    RETURN overlap_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
