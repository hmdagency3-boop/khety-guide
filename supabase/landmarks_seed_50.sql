-- ============================================================
-- Khety — Landmarks Expansion: 38 new landmarks (total 50)
-- Run this in your Supabase SQL Editor AFTER supabase_landmarks.sql
-- ============================================================

INSERT INTO public.landmarks (
  id, name, name_ar, description, category, image_url, rating,
  latitude, longitude, city, region,
  opening_hours, ticket_price, historical_period,
  tags, highlights, tips, is_published
) VALUES

-- ══════════════════════════════════════════════
--  CAIRO REGION (8 new)
-- ══════════════════════════════════════════════
(
  'grand-egyptian-museum',
  'Grand Egyptian Museum',
  'المتحف المصري الكبير',
  'The world''s largest archaeological museum, housing over 100,000 artefacts including the complete treasures of Tutankhamun. The 481-metre main hall is one of the largest in the world.',
  'museum',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Grand_Egyptian_Museum_entrance.jpg/1280px-Grand_Egyptian_Museum_entrance.jpg',
  4.9, 29.9879, 31.1122, 'Giza', 'Giza Governorate',
  '9:00 AM – 9:00 PM', '$25 (foreigners)', 'Opened 2023',
  ARRAY['Museum','UNESCO','Tutankhamun','Modern'],
  ARRAY['Complete Tutankhamun Treasure','Grand Staircase','Grand Atrium','Statues of Ramesses II'],
  ARRAY['Book tickets online to skip queues','Allow a full day','Night visit is spectacular'],
  TRUE
),
(
  'saladin-citadel',
  'Saladin Citadel',
  'قلعة صلاح الدين',
  'A medieval Islamic fortification perched on a rocky spur of the Muqattam Hills, built by Saladin in 1183 AD. It served as the seat of Egyptian government for 700 years.',
  'castle',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Cairo_Citadel_at_night.jpg/1280px-Cairo_Citadel_at_night.jpg',
  4.6, 30.0287, 31.2598, 'Cairo', 'Cairo Governorate',
  '9:00 AM – 5:00 PM', '$4 (foreigners)', 'Ayyubid Period, 1183 AD',
  ARRAY['Castle','Islamic','Historic','Fortress'],
  ARRAY['Mohamed Ali Mosque','National Military Museum','Panoramic Cairo views','Mosque of al-Nasir Muhammad'],
  ARRAY['Visit the Mohamed Ali Mosque inside','Best panoramic view of Cairo from the walls','Combine with Islamic Cairo walking tour'],
  TRUE
),
(
  'mohamed-ali-mosque',
  'Mohamed Ali Mosque',
  'مسجد محمد علي',
  'Also called the Alabaster Mosque, this Ottoman-style masterpiece sits atop the Citadel of Cairo and dominates the city''s skyline. Built between 1830 and 1848 by Khedive Mohamed Ali.',
  'mosque',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Cairo_-_Mosque_of_Muhammad_Ali.jpg/1280px-Cairo_-_Mosque_of_Muhammad_Ali.jpg',
  4.7, 30.0288, 31.2601, 'Cairo', 'Cairo Governorate',
  '9:00 AM – 5:00 PM (closed during prayer)', 'Free (included in Citadel ticket)', 'Ottoman Period, 1830–1848',
  ARRAY['Mosque','Ottoman','Historic','Alabaster'],
  ARRAY['Alabaster-lined courtyard','Twin minarets 82m tall','Ottoman dome interior','City views'],
  ARRAY['Dress modestly – robes at entrance','Remove shoes','Combine with Citadel visit'],
  TRUE
),
(
  'ibn-tulun-mosque',
  'Mosque of Ibn Tulun',
  'مسجد ابن طولون',
  'Cairo''s oldest mosque still standing in its original form, built in 876–879 AD. One of the largest mosques in the world with a unique spiral minaret inspired by Samarra in Iraq.',
  'mosque',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/IbnTulunMosque.jpg/1280px-IbnTulunMosque.jpg',
  4.6, 30.0148, 31.2494, 'Cairo', 'Cairo Governorate',
  '8:00 AM – 4:00 PM', 'Free', 'Tulunid Period, 879 AD',
  ARRAY['Mosque','Islamic','UNESCO','Historic'],
  ARRAY['Unique spiral minaret','Open courtyard','Ziyada outer walls','Attached Gayer-Anderson Museum'],
  ARRAY['Climb the minaret for city views','Visit the adjacent Gayer-Anderson Museum','Best in the morning light'],
  TRUE
),
(
  'sultan-hassan-mosque',
  'Sultan Hassan Mosque & Madrasa',
  'مسجد ومدرسة السلطان حسن',
  'A masterpiece of Mamluk architecture built 1356–1363 AD, considered one of the greatest medieval Islamic buildings in the world. Its towering facade reaches 36 metres.',
  'mosque',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Sultan-Hassan-Mosque-Complex-Cairo-Aug-2008.jpg/1280px-Sultan-Hassan-Mosque-Complex-Cairo-Aug-2008.jpg',
  4.7, 30.0270, 31.2560, 'Cairo', 'Cairo Governorate',
  '8:00 AM – 5:00 PM', '$2', 'Mamluk Period, 1356–1363 AD',
  ARRAY['Mosque','Mamluk','Historic','Architecture'],
  ARRAY['Massive entrance portal','Four-iwan courtyard','Mausoleum of Sultan Hassan','Adjacent Al-Rifai Mosque'],
  ARRAY['Combine with Al-Rifai Mosque next door','Best photographed from the Citadel','Free audio guide available'],
  TRUE
),
(
  'cairo-tower',
  'Cairo Tower',
  'برج القاهرة',
  'A 187-metre concrete tower on Gezira Island, built in 1961. The observation deck offers a 360-degree panoramic view of Cairo, the Nile, and the Pyramids of Giza in the distance.',
  'modern',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Cairo_tower_-_برج_القاهرة.jpg/640px-Cairo_tower_-_برج_القاهرة.jpg',
  4.3, 30.0453, 31.2237, 'Cairo', 'Cairo Governorate',
  '9:00 AM – 1:00 AM', '$5 (foreigners)', 'Modern, opened 1961',
  ARRAY['Modern','Viewpoint','Nile','Landmark'],
  ARRAY['360° panoramic view','Nile and Pyramids vista','Revolving restaurant','Lotus flower design'],
  ARRAY['Visit at sunset for best photos','Book the revolving restaurant for dinner','Clear days reveal the Pyramids'],
  TRUE
),
(
  'coptic-museum',
  'Coptic Museum',
  'المتحف القبطي',
  'The world''s largest collection of Coptic Christian art and artefacts, displaying manuscripts, textiles, icons, woodwork and metal objects from the 4th to the 19th century.',
  'museum',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Coptic_Museum_Cairo.jpg/1280px-Coptic_Museum_Cairo.jpg',
  4.5, 30.0055, 31.2290, 'Cairo', 'Cairo Governorate',
  '9:00 AM – 5:00 PM', '$5 (foreigners)', 'Opened 1910 — collection spans 4th–19th century AD',
  ARRAY['Museum','Coptic','Christian','Historic'],
  ARRAY['Nag Hammadi Gnostic Gospels','Roman crypt','Wooden screens','Ancient textiles'],
  ARRAY['Combine with the Hanging Church visit','Allow 2 hours','Photography allowed in most halls'],
  TRUE
),
(
  'el-muizz-street',
  'Al-Muizz Street',
  'شارع المعز',
  'The spine of Islamic Cairo, a 1-km medieval street stretching from Bab el-Futuh to Bab Zuweila. Often called the world''s longest open-air Islamic museum, lined with hundreds of monuments.',
  'historic',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Al_Moez_Street_Cairo.jpg/640px-Al_Moez_Street_Cairo.jpg',
  4.7, 30.0516, 31.2628, 'Cairo', 'Cairo Governorate',
  'Open 24 hours (shops 10 AM – midnight)', 'Free', 'Fatimid–Mamluk Period, 969 AD onwards',
  ARRAY['Islamic','Historic','UNESCO','Walking'],
  ARRAY['Bab Zuweila twin minarets','Qalawun complex','Al-Aqmar Mosque','Sabil-Kuttab of Abdel Katkhuda'],
  ARRAY['Best explored on foot in the evening','Join a guided walking tour','Start from Bab el-Futuh gate'],
  TRUE
),

-- ══════════════════════════════════════════════
--  GIZA REGION (3 new)
-- ══════════════════════════════════════════════
(
  'solar-boat-museum',
  'Solar Boat Museum (Khufu Ship)',
  'متحف المركب الشمسي',
  'Houses the oldest intact ship in the world — the 43-metre cedar boat of Pharaoh Khufu, buried at the foot of the Great Pyramid around 2500 BC and excavated in 1954.',
  'museum',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Khufu_ship.jpg/1280px-Khufu_ship.jpg',
  4.6, 29.9772, 31.1296, 'Giza', 'Giza Governorate',
  '9:00 AM – 4:00 PM', '$8 (foreigners)', 'Old Kingdom, c. 2500 BC',
  ARRAY['Museum','Ancient','Pharaonic','Ship'],
  ARRAY['World''s oldest intact ship','Khufu''s cedar solar boat','Ancient boat-building techniques'],
  ARRAY['Visit after the main pyramids','Shoe covers required inside','Photography permitted'],
  TRUE
),
(
  'memphis-ruins',
  'Memphis & Mit Rahina',
  'منف وميت رهينة',
  'The ancient capital of Egypt for much of the Old Kingdom, Memphis once rivalled Thebes in grandeur. Today the open-air museum displays a colossal limestone statue of Ramesses II.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Ramses_II_Memphis.jpg/640px-Ramses_II_Memphis.jpg',
  4.3, 29.8465, 31.2520, 'Mit Rahina', 'Giza Governorate',
  '9:00 AM – 4:00 PM', '$4 (foreigners)', 'Old Kingdom, c. 3100 BC',
  ARRAY['Ancient','Pharaonic','UNESCO','Ruins'],
  ARRAY['Colossal Ramesses II statue','Alabaster Sphinx','Temple of Ptah ruins'],
  ARRAY['Combine with Saqqara visit','Allow 1 hour','Easy day trip from Cairo'],
  TRUE
),
(
  'dahshur-pyramids',
  'Dahshur Pyramids',
  'أهرامات دهشور',
  'Home to two extraordinary pyramids of Pharaoh Sneferu — the Bent Pyramid (the best-preserved outer casing in Egypt) and the Red Pyramid, Egypt''s first true smooth-sided pyramid.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Snefru%27s_Bent_Pyramid_in_Dahshur.jpg/1280px-Snefru%27s_Bent_Pyramid_in_Dahshur.jpg',
  4.6, 29.7921, 31.2100, 'Dahshur', 'Giza Governorate',
  '8:00 AM – 4:00 PM', '$6 (foreigners)', 'Old Kingdom, c. 2600 BC',
  ARRAY['Ancient','Pharaonic','Pyramid','Uncrowded'],
  ARRAY['Bent Pyramid with intact casing','Red Pyramid interior','Black Pyramid of Amenemhat III'],
  ARRAY['Far less crowded than Giza','You can enter the Red Pyramid','Combine with Saqqara and Memphis'],
  TRUE
),

-- ══════════════════════════════════════════════
--  LUXOR REGION (5 new)
-- ══════════════════════════════════════════════
(
  'hatshepsut-temple',
  'Temple of Hatshepsut (Deir el-Bahari)',
  'معبد حتشبسوت - الدير البحري',
  'One of the most elegant temples in the ancient world, built by Egypt''s greatest female pharaoh in c. 1470 BC. Its three tiered colonnaded terraces rise dramatically against the cliffs of Deir el-Bahari.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Mortuary_Temple_of_Hatshepsut_crop.jpg/1280px-Mortuary_Temple_of_Hatshepsut_crop.jpg',
  4.8, 25.7380, 32.6059, 'Luxor', 'Luxor Governorate',
  '6:00 AM – 5:00 PM', '$8 (foreigners)', 'New Kingdom, c. 1479–1458 BC',
  ARRAY['Ancient','Pharaonic','UNESCO','Female Pharaoh'],
  ARRAY['Three terraced colonnades','Chapel of Hathor','Punt expedition reliefs','Anubis chapel'],
  ARRAY['Go very early — gets extremely hot','Wear sun protection','Combine with Valley of the Kings trip'],
  TRUE
),
(
  'valley-of-queens',
  'Valley of the Queens',
  'وادي الملكات',
  'The burial site of the wives and children of New Kingdom pharaohs, containing over 90 tombs. The tomb of Nefertari, wife of Ramesses II, is considered the finest in Egypt.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Valley_of_Queens_Entrance.jpg/1280px-Valley_of_Queens_Entrance.jpg',
  4.6, 25.7280, 32.5973, 'Luxor', 'Luxor Governorate',
  '6:00 AM – 4:00 PM', '$6 (includes 3 tombs)', 'New Kingdom, 1290–1185 BC',
  ARRAY['Ancient','Pharaonic','Tombs','UNESCO'],
  ARRAY['Tomb of Nefertari (separate ticket)','Tomb of Khaemweset','Vivid painted reliefs'],
  ARRAY['Nefertari''s tomb costs extra but is unmissable','Combine with Valley of the Kings','Photography banned inside'],
  TRUE
),
(
  'medinet-habu',
  'Medinet Habu',
  'مدينة هابو',
  'The mortuary temple of Ramesses III, one of the best-preserved temples in Luxor with vivid painted reliefs depicting his military victories against the Sea Peoples.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Medinet_Habu_temple.jpg/1280px-Medinet_Habu_temple.jpg',
  4.7, 25.7183, 32.5980, 'Luxor', 'Luxor Governorate',
  '6:00 AM – 5:00 PM', '$5 (foreigners)', 'New Kingdom, 1186–1155 BC',
  ARRAY['Ancient','Pharaonic','Temple','Less crowded'],
  ARRAY['Battle of the Sea Peoples reliefs','Migdol gateway','Chapel of the Divine Adoratrices'],
  ARRAY['Less crowded than Karnak','Best in morning light','Combine with Valley of the Queens'],
  TRUE
),
(
  'colossi-of-memnon',
  'Colossi of Memnon',
  'تمثالا ممنون',
  'Two massive stone statues of Pharaoh Amenhotep III rising 18 metres from the Luxor plain. Once the guardians of a vast mortuary temple, they are among the most recognisable monuments in Egypt.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Colossi_of_Memnon_May_2015.jpg/1280px-Colossi_of_Memnon_May_2015.jpg',
  4.5, 25.7208, 32.6100, 'Luxor', 'Luxor Governorate',
  'Open all day', 'Free', 'New Kingdom, c. 1350 BC',
  ARRAY['Ancient','Pharaonic','Statue','Free'],
  ARRAY['18-metre seated colossi','Recent excavations of the mortuary temple','Sunrise silhouettes'],
  ARRAY['Free entry — great for photos','Visit at sunrise or sunset','Short stop on the West Bank circuit'],
  TRUE
),
(
  'ramesseum',
  'The Ramesseum',
  'معبد رمسيس الثاني الجنائزي',
  'The mortuary temple of Ramesses II, inspiration for Shelley''s poem "Ozymandias." Famous for its colossal fallen statue of Ramesses II, weighing over 1,000 tonnes.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Ramesseum_2006.jpg/1280px-Ramesseum_2006.jpg',
  4.5, 25.7295, 32.6072, 'Luxor', 'Luxor Governorate',
  '6:00 AM – 5:00 PM', '$5 (foreigners)', 'New Kingdom, 1279–1213 BC',
  ARRAY['Ancient','Pharaonic','Temple','Ramesses II'],
  ARRAY['Fallen colossus of Ramesses','Hypostyle hall remains','Battle of Kadesh reliefs','Attached granaries'],
  ARRAY['Usually uncrowded','Great for photographers','Combine with nearby Medinet Habu'],
  TRUE
),

-- ══════════════════════════════════════════════
--  ASWAN REGION (5 new)
-- ══════════════════════════════════════════════
(
  'kom-ombo-temple',
  'Temple of Kom Ombo',
  'معبد كوم أمبو',
  'A unique double temple dedicated to both Sobek the crocodile god and Haroeris the falcon god, set dramatically on a bend of the Nile. Famous for its ancient calendar and surgical instruments carvings.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Kom_Ombo_Temple.jpg/1280px-Kom_Ombo_Temple.jpg',
  4.7, 24.4522, 32.9278, 'Kom Ombo', 'Aswan Governorate',
  '9:00 AM – 5:00 PM', '$7 (foreigners)', 'Ptolemaic Period, 180–47 BC',
  ARRAY['Ancient','Ptolemaic','Temple','Nile'],
  ARRAY['Twin sanctuaries','Crocodile mummies museum','Ancient surgical tools carvings','Nilometer'],
  ARRAY['Arrive by Nile cruise for best approach','Visit at sunset for golden light','Crocodile Museum is included'],
  TRUE
),
(
  'edfu-temple',
  'Temple of Edfu',
  'معبد إدفو',
  'The best-preserved ancient temple in Egypt, dedicated to Horus. Built in the Ptolemaic period, it looks almost new due to it being buried under sand for centuries until excavation in 1860.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Edfu_temple_overview.jpg/1280px-Edfu_temple_overview.jpg',
  4.8, 24.9779, 32.8734, 'Edfu', 'Aswan Governorate',
  '7:00 AM – 4:00 PM', '$7 (foreigners)', 'Ptolemaic Period, 237–57 BC',
  ARRAY['Ancient','Ptolemaic','Temple','Best preserved'],
  ARRAY['Intact pylon 36m high','Sanctuary of Horus','Granite statue of Horus','Festival of the Beautiful Meeting'],
  ARRAY['Best preserved Egyptian temple','Horse carriage rides from town','Visit on Nile cruise between Luxor and Aswan'],
  TRUE
),
(
  'unfinished-obelisk',
  'Unfinished Obelisk',
  'المسلة الناقصة',
  'The largest known ancient obelisk, still lying in the granite quarries of Aswan. If completed, it would have stood 42 metres tall and weighed 1,200 tonnes. Abandoned due to a crack in the granite.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Aswan_Unfinished_Obelisk.jpg/640px-Aswan_Unfinished_Obelisk.jpg',
  4.5, 24.0785, 32.8947, 'Aswan', 'Aswan Governorate',
  '7:00 AM – 5:00 PM', '$5 (foreigners)', 'New Kingdom, c. 1500 BC',
  ARRAY['Ancient','Quarry','Obelisk','Engineering'],
  ARRAY['World''s largest obelisk','Ancient quarry tools visible','Crack that caused abandonment'],
  ARRAY['Shows ancient quarrying techniques','Allow 45 minutes','Combine with Nubian Museum and Aswan Dam'],
  TRUE
),
(
  'aswan-high-dam',
  'Aswan High Dam',
  'السد العالي',
  'One of the world''s largest embankment dams, built between 1960 and 1970 with Soviet assistance. It created Lake Nasser, the world''s largest artificial lake, transforming Egypt''s agriculture.',
  'modern',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Aswan_High_Dam.jpg/1280px-Aswan_High_Dam.jpg',
  4.3, 23.9702, 32.8791, 'Aswan', 'Aswan Governorate',
  '7:00 AM – 5:00 PM', 'Free', 'Completed 1970',
  ARRAY['Modern','Engineering','Dam','Lake Nasser'],
  ARRAY['View across Lake Nasser','Soviet memorial lotus monument','Nile valley panorama','Hydroelectric station'],
  ARRAY['Take a photo from the viewing area','Combine with Unfinished Obelisk','Gateway to Abu Simbel trips'],
  TRUE
),
(
  'nubian-museum',
  'Nubian Museum Aswan',
  'المتحف النوبي أسوان',
  'An exceptional museum showcasing 50,000 years of Nubian civilisation, culture, and history. Built into the rock of Aswan''s hillside with beautiful gardens and an outdoor display of relocated monuments.',
  'museum',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Nubian_Museum_Aswan.jpg/640px-Nubian_Museum_Aswan.jpg',
  4.7, 24.0815, 32.8887, 'Aswan', 'Aswan Governorate',
  '9:00 AM – 9:00 PM', '$5 (foreigners)', 'Opened 1997 — collection spans 50,000 BC–present',
  ARRAY['Museum','Nubian','UNESCO','Cultural'],
  ARRAY['Relocated Nubian monuments','Traditional Nubian house model','Lake Nasser artefacts','Outdoor stone monuments'],
  ARRAY['One of Egypt''s finest museums','Evening visit is delightful','Allow 2 hours','Gardens are beautiful'],
  TRUE
),

-- ══════════════════════════════════════════════
--  ALEXANDRIA (5 new)
-- ══════════════════════════════════════════════
(
  'bibliotheca-alexandrina',
  'Bibliotheca Alexandrina',
  'مكتبة الإسكندرية',
  'The modern reincarnation of the legendary ancient Library of Alexandria, opened in 2002. A stunning architectural masterpiece on the Mediterranean seafront holding 8 million books.',
  'museum',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Biblioth%C3%A8que_d%27Alexandrie.jpg/1280px-Biblioth%C3%A8que_d%27Alexandrie.jpg',
  4.7, 31.2089, 29.9091, 'Alexandria', 'Alexandria Governorate',
  '10:00 AM – 7:00 PM (closed Fridays)', '$3 (foreigners)', 'Opened 2002',
  ARRAY['Library','Modern','Cultural','UNESCO'],
  ARRAY['Main reading room 11 floors','Ancient manuscripts collection','4 museums inside','Planetarium'],
  ARRAY['Book tickets in advance','Visit the Antiquities Museum inside','The architecture exterior is worth seeing alone'],
  TRUE
),
(
  'citadel-qaitbay',
  'Citadel of Qaitbay',
  'قلعة قايتباي',
  'A 15th-century Mamluk fortress built on the exact site of the ancient Lighthouse of Alexandria, one of the Seven Wonders of the Ancient World, using its stones in the construction.',
  'castle',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Citadel_of_Qaitbay_Alexandria.jpg/1280px-Citadel_of_Qaitbay_Alexandria.jpg',
  4.6, 31.2138, 29.8857, 'Alexandria', 'Alexandria Governorate',
  '9:00 AM – 4:00 PM', '$4 (foreigners)', 'Mamluk Period, 1477 AD',
  ARRAY['Castle','Mamluk','Lighthouse','Mediterranean'],
  ARRAY['Site of ancient Pharos lighthouse','Sea views from battlements','Naval Museum inside','Granite pharaonic blocks reused'],
  ARRAY['Mediterranean views are stunning','Best photographed from the corniche','Combine with nearby Bibliotheca Alexandrina'],
  TRUE
),
(
  'catacombs-kom-el-shoqafa',
  'Catacombs of Kom el Shoqafa',
  'مقابر كوم الشقافة',
  'The largest known funerary complex in Egypt and one of the Seven Wonders of the Middle Ages. A multi-level Roman burial complex blending Egyptian, Greek, and Roman styles, carved in the 2nd century AD.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Alexandria_-_Kom_el_Shoqafa_catacombs_%28Egypt%29.jpg/640px-Alexandria_-_Kom_el_Shoqafa_catacombs_%28Egypt%29.jpg',
  4.5, 31.1891, 29.8922, 'Alexandria', 'Alexandria Governorate',
  '9:00 AM – 5:00 PM', '$5 (foreigners)', 'Roman Period, 2nd century AD',
  ARRAY['Ancient','Roman','Catacombs','UNESCO'],
  ARRAY['Three-level underground tomb','Triclinium banquet hall','Egyptian-Greek-Roman hybrid art','Hall of Caracalla'],
  ARRAY['Bring a light jacket — underground is cool','Allow 1.5 hours','Not suitable for claustrophobic visitors'],
  TRUE
),
(
  'pompeys-pillar',
  'Pompey''s Pillar',
  'عمود السواري',
  'A 30-metre red granite Roman column erected in 297 AD in honour of Emperor Diocletian. Despite its name, it has no connection to Pompey — it is the tallest ancient column in Egypt.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Pompeys_pillar.jpg/640px-Pompeys_pillar.jpg',
  4.1, 31.1857, 29.8991, 'Alexandria', 'Alexandria Governorate',
  '9:00 AM – 5:00 PM', '$3 (foreigners)', 'Roman Period, 297 AD',
  ARRAY['Ancient','Roman','Column','Alexandria'],
  ARRAY['30-metre granite column','Two granite sphinxes','Foundation of Serapeum temple','Underground cisterns'],
  ARRAY['Quick 45-minute visit','Combine with Catacombs of Kom el Shoqafa nearby','One of Egypt''s few Roman monuments'],
  TRUE
),
(
  'montaza-palace',
  'Montaza Palace & Gardens',
  'قصر المنتزه وحدائقه',
  'A royal summer palace built in 1892, combining Turkish and Florentine architectural styles on a scenic headland overlooking the Mediterranean. The 150-acre gardens are open to the public.',
  'palace',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Montaza_Palace_Alexandria.jpg/1280px-Montaza_Palace_Alexandria.jpg',
  4.4, 31.2904, 30.0152, 'Alexandria', 'Alexandria Governorate',
  '7:00 AM – 11:00 PM (gardens)', '$2 garden entry', 'Khedivial Period, 1892 AD',
  ARRAY['Palace','Royal','Gardens','Mediterranean'],
  ARRAY['Al-Haramlik Palace','150 acres of Mediterranean gardens','Private beach','Lighthouse'],
  ARRAY['Gardens are the highlight — palace is not open','Great for a family afternoon','Beautiful sea views'],
  TRUE
),

-- ══════════════════════════════════════════════
--  SINAI & RED SEA (5 new)
-- ══════════════════════════════════════════════
(
  'st-catherines-monastery',
  'St. Catherine''s Monastery',
  'دير سانت كاترين',
  'The world''s oldest continuously inhabited Christian monastery, built by Emperor Justinian in 565 AD at the foot of Mount Sinai. UNESCO World Heritage Site housing priceless Byzantine mosaics and manuscripts.',
  'church',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/SFEC_EGYPT_STCATHERINE-2010-RPT_002.jpg/1280px-SFEC_EGYPT_STCATHERINE-2010-RPT_002.jpg',
  4.8, 28.5559, 33.9759, 'St. Catherine', 'South Sinai Governorate',
  '9:00 AM – 12:00 PM (Mon–Fri, Sat closed)', 'Free', 'Byzantine Period, 565 AD',
  ARRAY['Church','UNESCO','Byzantine','Monastery'],
  ARRAY['Burning Bush','Byzantine Transfiguration mosaic','Library of ancient manuscripts','Chapel of the Burning Bush'],
  ARRAY['Dress very modestly','Visit early — closes at noon','Combine with Mount Sinai sunrise hike'],
  TRUE
),
(
  'mount-sinai',
  'Mount Sinai (Gebel Musa)',
  'جبل موسى',
  'A 2,285-metre peak in the Sinai Peninsula revered by three world religions as the site where Moses received the Ten Commandments. Climbed by thousands of pilgrims and trekkers each year.',
  'nature',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Gebel_Mousa.jpg/1280px-Gebel_Mousa.jpg',
  4.9, 28.5388, 33.9752, 'St. Catherine', 'South Sinai Governorate',
  'Open 24 hours (night hike recommended)', 'Free', 'Religious significance: c. 1446 BC',
  ARRAY['Nature','Religious','Hiking','Sinai'],
  ARRAY['Summit at 2285m','3,750 Steps of Penitence','Chapel of the Holy Trinity','Panoramic Sinai sunrise'],
  ARRAY['Start the 3-hour hike at 2 AM for sunrise','Rent a blanket at the top','Wear warm layers even in summer'],
  TRUE
),
(
  'ras-muhammad',
  'Ras Muhammad National Park',
  'محمية رأس محمد',
  'Egypt''s first national park at the tip of the Sinai Peninsula, where the Gulf of Suez meets the Gulf of Aqaba. One of the world''s top dive sites with stunning coral reefs and marine biodiversity.',
  'nature',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Ras_Muhammad_National_Park.jpg/1280px-Ras_Muhammad_National_Park.jpg',
  4.9, 27.7340, 34.2540, 'Sharm el-Sheikh', 'South Sinai Governorate',
  '9:00 AM – 5:00 PM', '$10 entry', 'Natural Park, established 1983',
  ARRAY['Nature','Diving','Snorkelling','Marine'],
  ARRAY['Shark Reef dive site','Yolanda Reef wreck','Mangrove forests','Shark Observatory cliff'],
  ARRAY['Book a dive trip from Sharm el-Sheikh','Non-divers can snorkel from the shore','Bring water and sun protection'],
  TRUE
),
(
  'blue-hole-dahab',
  'Blue Hole, Dahab',
  'الثقب الأزرق - دهب',
  'One of the world''s most famous dive sites — a 130-metre deep underwater sinkhole just 8 metres from the Sinai shore. The legendary "diver''s cemetery" also attracts free-divers and snorkellers.',
  'nature',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Blue_Hole_Dahab.jpg/1280px-Blue_Hole_Dahab.jpg',
  4.8, 28.5706, 34.5389, 'Dahab', 'South Sinai Governorate',
  'Open 24 hours', 'Free (dive guides available)', 'Natural formation',
  ARRAY['Diving','Nature','Snorkelling','Red Sea'],
  ARRAY['130m-deep sinkhole','The Arch underwater tunnel','Crystal clear visibility','Free-diving world records'],
  ARRAY['Snorkelling is safe and spectacular on the rim','Only dive with an experienced guide','Best visibility in the morning'],
  TRUE
),
(
  'hurghada-coral-reef',
  'Giftun Island & Hurghada Reef',
  'جزيرة جفتون والشعاب المرجانية بالغردقة',
  'A protected marine national park featuring some of the Red Sea''s most pristine coral reefs, sea turtles, dolphins, and colourful fish, accessible by boat from Hurghada.',
  'nature',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Hurghada_Red_Sea_Coral_Reef.jpg/1280px-Hurghada_Red_Sea_Coral_Reef.jpg',
  4.7, 27.1714, 33.8820, 'Hurghada', 'Red Sea Governorate',
  'Day trips depart 9:00 AM', '$25–40 (boat trip)', 'Natural — Protected since 1992',
  ARRAY['Nature','Diving','Snorkelling','Red Sea'],
  ARRAY['Big Giftun Island beach','Sea turtle nesting sites','Dolphin spotting','Coral garden snorkel'],
  ARRAY['Book morning boat trips for calmer seas','Apply reef-safe sunscreen only','Try a glass-bottom boat if you don''t dive'],
  TRUE
),

-- ══════════════════════════════════════════════
--  MIDDLE EGYPT & UPPER EGYPT (4 new)
-- ══════════════════════════════════════════════
(
  'abydos-temple',
  'Temple of Seti I at Abydos',
  'معبد سيتي الأول بأبيدوس',
  'One of the most exquisitely decorated temples in Egypt, built by Seti I c. 1280 BC. Home to the Abydos King List — a crucial historical record engraved with the names of 76 pharaohs.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Abydos_Seti_I_temple.jpg/1280px-Abydos_Seti_I_temple.jpg',
  4.8, 26.1847, 31.9197, 'Abydos', 'Sohag Governorate',
  '8:00 AM – 5:00 PM', '$6 (foreigners)', 'New Kingdom, c. 1279–1213 BC',
  ARRAY['Ancient','Pharaonic','Temple','Undervisited'],
  ARRAY['Abydos King List','Seven chapels painted in vivid colour','Osireion underground cenotaph','Temple of Ramesses II nearby'],
  ARRAY['Often uncrowded','Some of the finest painted reliefs in Egypt','Day trip from Luxor (2.5 hours)'],
  TRUE
),
(
  'dendera-temple',
  'Temple of Hathor at Dendera',
  'معبد حتحور بدندرة',
  'One of the best-preserved temple complexes in Egypt, dedicated to Hathor, goddess of love and music. Famous for the Dendera Zodiac ceiling, the earliest known star chart, and a secret underground crypt.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Temple_of_Hathor%2C_Dendera%2C_Egypt.jpg/1280px-Temple_of_Hathor%2C_Dendera%2C_Egypt.jpg',
  4.8, 26.1423, 32.6696, 'Dendera', 'Qena Governorate',
  '7:00 AM – 5:00 PM', '$8 (foreigners)', 'Ptolemaic–Roman Period, 54 BC–395 AD',
  ARRAY['Ancient','Ptolemaic','Temple','Zodiac'],
  ARRAY['Dendera Zodiac reproduction','Crypts with carvings','Roof with panoramic views','Hathor-headed columns'],
  ARRAY['Climb to the roof for Nile views','Day trip from Luxor (1 hour north)','Visit with Abydos on same day'],
  TRUE
),
(
  'tell-el-amarna',
  'Tell el-Amarna (Akhetaten)',
  'تل العمارنة - أخيتاتون',
  'The short-lived capital city built by pharaoh Akhenaten in 1346 BC to worship the sun disc Aten. Abandoned after his death, it preserves the most revealing picture of daily life in ancient Egypt.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Amarna_aerial.jpg/1280px-Amarna_aerial.jpg',
  4.5, 27.6469, 30.9053, 'Minya', 'Minya Governorate',
  '8:00 AM – 4:00 PM', '$5 (foreigners)', 'New Kingdom, 1346–1332 BC',
  ARRAY['Ancient','Pharaonic','Akhenaten','Ruins'],
  ARRAY['Royal Tomb of Akhenaten','North Tombs of Nobles','Worker''s village ruins','Small Aten Temple'],
  ARRAY['Hire a local guide in Minya','Cross by ferry to the East Bank','Combine with Beni Hassan cave tombs'],
  TRUE
),
(
  'beni-hassan-tombs',
  'Beni Hassan Rock Tombs',
  'مقابر بني حسن',
  'Forty rock-cut tombs of Middle Kingdom nomarchs (provincial governors) carved into the eastern cliffs above the Nile, decorated with vivid everyday-life paintings including wrestling matches and birds.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Beni_Hasan_Tomb_of_Khnumhotep_painting.jpg/1280px-Beni_Hasan_Tomb_of_Khnumhotep_painting.jpg',
  4.4, 27.9328, 30.8916, 'Abu Qirqas', 'Minya Governorate',
  '8:00 AM – 4:00 PM', '$5 (foreigners)', 'Middle Kingdom, 2055–1650 BC',
  ARRAY['Ancient','Tombs','Paintings','Middle Kingdom'],
  ARRAY['World''s earliest wrestling paintings','Tomb of Khnumhotep II with Asiatic visitors','Tomb of Amenemhat','Painted hunting scenes'],
  ARRAY['Cross by ferry from Minya','Hire a local taxi for the climb','Best combined with Tell el-Amarna'],
  TRUE
),

-- ══════════════════════════════════════════════
--  WESTERN DESERT OASES (4 new)
-- ══════════════════════════════════════════════
(
  'wadi-el-hitan',
  'Wadi Al-Hitan (Valley of the Whales)',
  'وادي الحيتان',
  'A UNESCO World Heritage Site containing hundreds of fossils of the earliest forms of whale (Archaeoceti), showing the transition from land to sea mammals, 40 million years ago.',
  'nature',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Wadi_El_Hitan.jpg/1280px-Wadi_El_Hitan.jpg',
  4.8, 29.2667, 30.0500, 'Wadi el-Rayan', 'Fayoum Governorate',
  '9:00 AM – 4:00 PM', '$5 entry + $5 car fee', 'Natural — 40 million years old',
  ARRAY['UNESCO','Nature','Fossils','Desert'],
  ARRAY['Whale fossil trail 3km walk','Visitor centre with skeleton casts','Open-air museum','Desert landscapes'],
  ARRAY['Bring water — no facilities','4WD vehicle recommended','Easy day trip from Fayoum or Cairo'],
  TRUE
),
(
  'bahariya-oasis',
  'Bahariya Oasis',
  'واحة الباحرية',
  'A lush oasis in the Western Desert famous for the Valley of the Golden Mummies — over 10,000 Greco-Roman mummies discovered in 1996 — and as the gateway to the Black and White Deserts.',
  'nature',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bahariya_oasis.jpg/1280px-Bahariya_oasis.jpg',
  4.6, 28.3478, 28.8708, 'Bawiti', 'Giza Governorate',
  'Open all day', 'Free (museum $3)', 'Ancient — Golden Mummies discovered 1996',
  ARRAY['Oasis','Desert','Mummies','Gateway'],
  ARRAY['Valley of the Golden Mummies','Hot springs at Bir el-Ghaba','Local market in Bawiti','Gateway to Black & White Deserts'],
  ARRAY['Base for White Desert tours','Stay overnight for desert stargazing','Hire a 4WD for desert excursions'],
  TRUE
),
(
  'black-desert',
  'Black Desert',
  'الصحراء السوداء',
  'A dramatic volcanic plateau of black basalt-capped mountains near Bahariya Oasis, strikingly contrasting with the surrounding golden sand. The landscape resembles a moonscape blanketed in black gravel.',
  'nature',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Black_desert_egypt.jpg/1280px-Black_desert_egypt.jpg',
  4.6, 28.5167, 28.7000, 'Bahariya', 'Giza Governorate',
  'Open 24 hours', 'Free (arrange via Bahariya tour)', 'Natural volcanic formation',
  ARRAY['Nature','Desert','Volcanic','Unique'],
  ARRAY['Black basalt cone mountains','English Mountain viewpoint','Crystal Mountain nearby','Sunset over dark dunes'],
  ARRAY['Combine with White Desert overnight','4WD essential','Book through Bahariya Oasis tour operators'],
  TRUE
),
(
  'dakhla-oasis',
  'Dakhla Oasis & Mut',
  'واحة الداخلة',
  'A vast, lush oasis deep in Egypt''s Western Desert with ancient mud-brick villages, Roman ruins, hot springs, and the stunning Qasr village — an intact 10th-century Islamic walled town.',
  'nature',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Dakhla_Oasis_Egypt.jpg/1280px-Dakhla_Oasis_Egypt.jpg',
  4.6, 25.4889, 29.0000, 'Mut', 'New Valley Governorate',
  'Open all day', 'Free (site fees apply)', 'Roman and Islamic periods',
  ARRAY['Oasis','Desert','Islamic','Roman'],
  ARRAY['Qasr medieval walled village','Al-Muzawaka painted tombs','Deir el-Hagar Roman temple','Natural hot springs'],
  ARRAY['Requires a multi-day desert trip','Combine with Kharga Oasis','Hire a local guide for the tombs'],
  TRUE
),

-- ══════════════════════════════════════════════
--  FAYOUM & NORTH EGYPT (3 new)
-- ══════════════════════════════════════════════
(
  'fayoum-oasis',
  'Fayoum Oasis & Lake Qarun',
  'واحة الفيوم وبحيرة قارون',
  'Egypt''s largest oasis and the cradle of Egyptian agriculture, home to Lake Qarun (ancient Lake Moeris), Ptolemaic temples, waterwheels, and the world''s oldest oil painting at Karanis.',
  'nature',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Fayoum_Lake_Qarun.jpg/1280px-Fayoum_Lake_Qarun.jpg',
  4.4, 29.3084, 30.8428, 'Fayoum City', 'Fayoum Governorate',
  'Open all day', 'Free (site fees vary)', 'Ancient — inhabited since 9000 BC',
  ARRAY['Oasis','Nature','Roman','Lake'],
  ARRAY['Lake Qarun bird sanctuary','Karanis Greco-Roman town','Qasr Qarun Ptolemaic temple','Seven ancient waterwheels'],
  ARRAY['Easy 2-hour drive from Cairo','Excellent birdwatching in winter','Combine with Wadi el-Hitan trip'],
  TRUE
),
(
  'saqqara',
  'Saqqara Necropolis',
  'سقارة',
  'The vast ancient burial ground for the ancient capital Memphis, containing the world''s oldest monumental stone building — the Step Pyramid of Djoser (c. 2650 BC) — and over a dozen pyramids.',
  'ancient',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Saqqara_BW_5.jpg/1280px-Saqqara_BW_5.jpg',
  4.8, 29.8713, 31.2165, 'Saqqara', 'Giza Governorate',
  '8:00 AM – 5:00 PM', '$10 (foreigners)', 'Old Kingdom onwards, 2650 BC',
  ARRAY['Ancient','UNESCO','Pyramid','Necropolis'],
  ARRAY['Step Pyramid of Djoser','Mastaba of Ti','Serapeum of Apis bulls','Pyramid of Unas with Texts'],
  ARRAY['One of the most important sites in Egypt','Combine with Memphis and Dahshur','Allow a full half-day'],
  TRUE
),
(
  'rashid-rosetta',
  'Rashid (Rosetta)',
  'رشيد',
  'A charming Delta port city where the Rosetta Stone was discovered in 1799, deciphering ancient Egyptian hieroglyphics. Famous for Ottoman mansions, a colourful fish market, and Fort Julien.',
  'historic',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Rosetta_Fort_Julien.jpg/640px-Rosetta_Fort_Julien.jpg',
  4.2, 31.4018, 30.4166, 'Rosetta', 'Beheira Governorate',
  '9:00 AM – 5:00 PM', '$3', 'Ottoman Period, 15th–19th century AD',
  ARRAY['Historic','Ottoman','Delta','Rosetta Stone'],
  ARRAY['Fort Julien where Rosetta Stone was found','Ottoman merchant houses','Fish market on the Nile','Red-brick mosques'],
  ARRAY['Easy day trip from Alexandria','Local fish lunch is excellent','The town itself is the attraction'],
  TRUE
)

ON CONFLICT (id) DO NOTHING;

-- Verify count
SELECT COUNT(*) AS total_landmarks FROM public.landmarks WHERE is_published = TRUE;
