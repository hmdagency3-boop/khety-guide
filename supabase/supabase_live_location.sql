-- Enable Realtime on user_last_location so the admin panel receives live updates
-- Run this once in the Supabase SQL Editor

ALTER PUBLICATION supabase_realtime ADD TABLE user_last_location;

-- Optional: tighten the SELECT policy to include anon so the OSM tiles load
-- (not needed — maps are loaded directly from openstreetmap.org)

-- Verify
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'user_last_location';
