-- 025_health_check_helper.sql
-- Helper function to allow preflight script to verify schema sync
-- This prevents "stacking" features without running migrations

BEGIN;

-- Create helper function to get column names for a table
CREATE OR REPLACE FUNCTION public.get_column_names(target_table_name text)
RETURNS TABLE (column_name text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT cols.column_name::text
  FROM information_schema.columns AS cols
  WHERE cols.table_schema = 'public'
    AND cols.table_name = target_table_name
  ORDER BY cols.ordinal_position;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_column_names(text) TO authenticated;

COMMENT ON FUNCTION public.get_column_names IS 'Helper function for DANA preflight health checks. Returns all column names for a given table to verify schema sync.';

COMMIT;
