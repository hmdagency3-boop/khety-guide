-- ============================================================
-- Landmarks table for Khety Guide
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create the table
CREATE TABLE IF NOT EXISTS public.landmarks (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  name_ar      TEXT,
  description  TEXT,
  category     TEXT NOT NULL DEFAULT 'ancient',
  image_url    TEXT,
  rating       NUMERIC(3,1) NOT NULL DEFAULT 4.0,
  latitude     NUMERIC(10,7) NOT NULL,
  longitude    NUMERIC(10,7) NOT NULL,
  city         TEXT NOT NULL,
  region       TEXT,
  opening_hours   TEXT,
  ticket_price    TEXT,
  historical_period TEXT,
  tags         TEXT[] DEFAULT '{}',
  highlights   TEXT[] DEFAULT '{}',
  tips         TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_landmarks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS landmarks_updated_at ON public.landmarks;
CREATE TRIGGER landmarks_updated_at
  BEFORE UPDATE ON public.landmarks
  FOR EACH ROW EXECUTE FUNCTION update_landmarks_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.landmarks ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read published landmarks
DROP POLICY IF EXISTS "landmarks_public_read" ON public.landmarks;
CREATE POLICY "landmarks_public_read" ON public.landmarks
  FOR SELECT USING (is_published = TRUE);

-- Only admin users can insert/update/delete
DROP POLICY IF EXISTS "landmarks_admin_all" ON public.landmarks;
CREATE POLICY "landmarks_admin_all" ON public.landmarks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ── Seed Data ─────────────────────────────────────────────────
INSERT INTO public.landmarks (id, name, name_ar, description, category, image_url, rating, latitude, longitude, city, region, opening_hours, ticket_price, historical_period, tags, highlights, tips, is_published)
VALUES
(
  'giza-pyramids', 'Pyramids of Giza', 'أهرامات الجيزة',
  'The last surviving wonder of the ancient world, these massive pyramids were built as royal tombs for pharaohs Khufu, Khafre, and Menkaure over 4,500 years ago.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/1280px-Kheops-Pyramid.jpg',
  4.9, 29.9792, 31.1342, 'Giza', 'Giza Governorate',
  '8:00 AM – 5:00 PM', '$15 (foreigners)', 'Old Kingdom, 2560–2510 BC',
  ARRAY['UNESCO', 'Seven Wonders', 'Pyramid', 'Pharaonic'],
  ARRAY['Great Pyramid of Khufu', 'Sphinx', 'Solar Boat Museum', 'Pyramid of Khafre'],
  ARRAY['Visit at sunrise to avoid crowds', 'Hire a licensed guide', 'Watch out for camel touts'],
  TRUE
),
(
  'karnak-temple', 'Karnak Temple Complex', 'معبد الكرنك',
  'The largest ancient religious site in the world, Karnak is a vast temple complex dedicated to the Theban triad of Amun, Mut, and Khonsu, built over 2,000 years.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Karnak_temple_%28Egypt%29.jpg/1280px-Karnak_temple_%28Egypt%29.jpg',
  4.8, 25.7188, 32.6573, 'Luxor', 'Luxor Governorate',
  '6:00 AM – 5:30 PM', '$8 (foreigners)', 'Middle Kingdom to Ptolemaic Period, 2055 BC–395 AD',
  ARRAY['UNESCO', 'Temple', 'Pharaonic', 'Thebes'],
  ARRAY['Hypostyle Hall', 'Sacred Lake', 'Avenue of Sphinxes', 'Obelisk of Hatshepsut'],
  ARRAY['Go early morning for cooler temperatures', 'Attend the Sound & Light show at night', 'Wear comfortable shoes'],
  TRUE
),
(
  'abu-simbel', 'Abu Simbel Temples', 'معابد أبو سمبل',
  'Two massive rock temples carved into a mountainside by Ramesses II in 1264 BC, relocated in one of the greatest engineering feats of the 20th century to save them from rising Nile waters.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Abu_Simbel%2C_relocated_temple_front.jpg/1280px-Abu_Simbel%2C_relocated_temple_front.jpg',
  4.9, 22.3372, 31.6258, 'Abu Simbel', 'Aswan Governorate',
  '5:00 AM – 6:00 PM', '$15 (foreigners)', 'New Kingdom, 1264 BC',
  ARRAY['UNESCO', 'Temple', 'Ramesses II', 'Nubia'],
  ARRAY['Great Temple of Ramesses II', 'Temple of Nefertari', 'Solar alignment on Feb 22 & Oct 22'],
  ARRAY['Best visited on a sunrise tour from Aswan', 'Book in advance if visiting during solar alignment dates'],
  TRUE
),
(
  'egyptian-museum', 'Egyptian Museum', 'المتحف المصري',
  'Home to the world''s most extensive collection of ancient Egyptian artifacts, including the treasures of Tutankhamun and over 120,000 items spanning 5,000 years.',
  'museum',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Egyptian_Museum%2C_Cairo%2C_Egypt.jpg/1280px-Egyptian_Museum%2C_Cairo%2C_Egypt.jpg',
  4.7, 30.0478, 31.2336, 'Cairo', 'Cairo Governorate',
  '9:00 AM – 5:00 PM', '$8 (foreigners)', 'Opened 1902',
  ARRAY['Museum', 'Tutankhamun', 'Mummies', 'Artifacts'],
  ARRAY['Tutankhamun''s Gold Mask', 'Royal Mummies Hall', 'Narmer Palette', 'Rosetta Stone replica'],
  ARRAY['Allow at least 3 hours', 'Hire a guide for better context', 'Photography fee required inside'],
  TRUE
),
(
  'valley-of-kings', 'Valley of the Kings', 'وادي الملوك',
  'The royal burial ground of ancient Egypt''s New Kingdom pharaohs, containing over 60 tombs of kings including Tutankhamun and Ramesses II, decorated with elaborate hieroglyphs.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Valley_of_the_Kings_from_above.jpg/1280px-Valley_of_the_Kings_from_above.jpg',
  4.8, 25.7402, 32.6014, 'Luxor', 'Luxor Governorate',
  '6:00 AM – 5:00 PM', '$10 includes 3 tombs', 'New Kingdom, 1539–1075 BC',
  ARRAY['UNESCO', 'Pharaonic', 'Tombs', 'New Kingdom'],
  ARRAY['Tomb of Tutankhamun (KV62)', 'Tomb of Ramesses VI', 'Tomb of Seti I'],
  ARRAY['Take the train inside to avoid the heat', 'Buy tickets for Tutankhamun''s tomb separately', 'Go early morning'],
  TRUE
),
(
  'luxor-temple', 'Luxor Temple', 'معبد الأقصر',
  'A magnificent ancient Egyptian temple complex located on the east bank of the Nile, known for its giant statues of Ramesses II and stunning illumination at night.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Luxor_temple_entrance.jpg/1280px-Luxor_temple_entrance.jpg',
  4.7, 25.6994, 32.6392, 'Luxor', 'Luxor Governorate',
  '6:00 AM – 10:00 PM', '$8 (foreigners)', 'New Kingdom, 1400 BC',
  ARRAY['Temple', 'Pharaonic', 'Ramesses II', 'UNESCO'],
  ARRAY['Avenue of Sphinxes', 'Obelisk of Ramesses II', 'Abu al-Haggag Mosque'],
  ARRAY['Visit at night for stunning illuminations', 'Walk the full Avenue of Sphinxes to Karnak'],
  TRUE
),
(
  'philae-temple', 'Temple of Philae', 'معبد فيلة',
  'A beautiful island temple complex dedicated to the goddess Isis, relocated to Agilkia Island to save it from the rising waters of Lake Nasser after the Aswan Dam was built.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Philae_temple_front.jpg/1280px-Philae_temple_front.jpg',
  4.7, 24.0244, 32.8827, 'Aswan', 'Aswan Governorate',
  '7:00 AM – 4:00 PM', '$11 (foreigners) + boat fee', 'Ptolemaic Period, 380–362 BC',
  ARRAY['UNESCO', 'Temple', 'Isis', 'Island'],
  ARRAY['Kiosk of Trajan', 'Inner Sanctuary of Isis', 'Sound & Light Show'],
  ARRAY['Arrive by boat from Aswan', 'Visit in the evening for the Sound & Light Show'],
  TRUE
),
(
  'khan-el-khalili', 'Khan el-Khalili Bazaar', 'خان الخليلي',
  'Cairo''s legendary medieval marketplace, a labyrinth of narrow streets packed with shops selling spices, jewelry, papyrus, lanterns, and authentic Egyptian handicrafts since 1382.',
  'market',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Cairo-Khan_el_Khalili.jpg/1280px-Cairo-Khan_el_Khalili.jpg',
  4.5, 30.0478, 31.2628, 'Cairo', 'Cairo Governorate',
  '10:00 AM – 12:00 AM', 'Free entry', 'Mamluk Period, 1382 AD',
  ARRAY['Market', 'Bazaar', 'Shopping', 'Islamic Cairo'],
  ARRAY['Spice Souq', 'El Fishawi Café', 'Al-Hussein Square', 'Gold Bazaar'],
  ARRAY['Bargain always – start at 40% of asking price', 'Try tea at El Fishawi Café', 'Beware of overpricing for tourists'],
  TRUE
),
(
  'siwa-oasis', 'Siwa Oasis', 'واحة سيوة',
  'A remote and magical oasis town in Egypt''s Western Desert, famous for its salt lakes, Berber culture, Oracle of Amun temple where Alexander the Great visited, and stunning desert sunsets.',
  'nature',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/SiwaMountainFortress.jpg/1280px-SiwaMountainFortress.jpg',
  4.8, 29.2031, 25.5197, 'Siwa', 'Matrouh Governorate',
  'Open all day', 'Free (site fees may apply)', 'Ancient – Oracle consulted by Alexander the Great, 331 BC',
  ARRAY['Oasis', 'Desert', 'Nature', 'Berber'],
  ARRAY['Temple of the Oracle', 'Shali Fortress ruins', 'Cleopatra''s Bath', 'Great Sand Sea'],
  ARRAY['Rent a bike or donkey cart', 'Visit sunset at the Great Sand Sea', 'Dress modestly – conservative area'],
  TRUE
),
(
  'al-azhar-mosque', 'Al-Azhar Mosque', 'مسجد الأزهر',
  'One of the oldest and most prestigious mosques in the world, built in 970 AD. Home to Al-Azhar University, the world''s second-oldest continuously operating university.',
  'mosque',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Cairo%2C_Al_Azhar_Mosque%2C_minaret_pano.jpg/1280px-Cairo%2C_Al_Azhar_Mosque%2C_minaret_pano.jpg',
  4.6, 30.0456, 31.2627, 'Cairo', 'Cairo Governorate',
  '9:00 AM – 5:00 PM (closed Friday afternoon)', 'Free', 'Fatimid Period, 970 AD',
  ARRAY['Mosque', 'Islamic', 'UNESCO', 'Historic'],
  ARRAY['Five minarets', 'Madrasa courtyard', 'Riwaq of the Blind'],
  ARRAY['Dress modestly – robes provided at entrance', 'Remove shoes before entering', 'Visit nearby Al-Hussein Mosque too'],
  TRUE
),
(
  'white-desert', 'White Desert National Park', 'الصحراء البيضاء',
  'An otherworldly landscape of brilliant white chalk rock formations shaped by wind and sand erosion, creating surreal mushroom and ice cream cone shapes in the Egyptian desert.',
  'nature',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/White_desert%2C_Egypt.jpg/1280px-White_desert%2C_Egypt.jpg',
  4.9, 27.2800, 28.1500, 'Farafra', 'New Valley Governorate',
  'Open 24 hours', '$5 entry fee', 'Natural formation',
  ARRAY['Nature', 'Desert', 'National Park', 'Rock Formations'],
  ARRAY['Crystal Mountain', 'White chalk formations', 'Stargazing at night', 'Bedouin camps'],
  ARRAY['Camp overnight for the best experience', 'Join a tour from Bahariya Oasis', 'Bring warm clothes for cold desert nights'],
  TRUE
),
(
  'coptic-cairo', 'Coptic Cairo', 'القاهرة القبطية',
  'One of the world''s oldest Christian communities, featuring the Hanging Church, Ben Ezra Synagogue, and the Church of Saint Sergius built over the cave where the Holy Family sheltered.',
  'church',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Hanging_Church%2C_Coptic_Cairo%2C_Egypt.jpg/1280px-Hanging_Church%2C_Coptic_Cairo%2C_Egypt.jpg',
  4.5, 30.0059, 31.2296, 'Cairo', 'Cairo Governorate',
  '9:00 AM – 5:00 PM', 'Free', 'Roman Period onwards, 3rd–7th century AD',
  ARRAY['Church', 'Coptic', 'Historic', 'Christian'],
  ARRAY['Hanging Church (Al-Muallaqah)', 'Ben Ezra Synagogue', 'Church of St. Sergius & Bacchus'],
  ARRAY['Combine with the Coptic Museum visit', 'Dress modestly', 'Go early to beat tour groups'],
  TRUE
)
ON CONFLICT (id) DO NOTHING;
