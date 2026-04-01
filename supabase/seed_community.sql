-- ============================================================
-- Khety Guide — Community Seed Data (International Travellers)
-- Run this in Supabase Dashboard → SQL Editor
-- Creates 20 fake travellers from around the world + 28 posts
-- ============================================================

-- Step 1: Insert fake auth users
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_user_meta_data, role, aud
) VALUES
  ('a1b2c301-0000-0000-0000-000000000001', 'james.harrison@example.com',    '', now(), now(), now(), '{"display_name":"James Harrison"}',       'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000002', 'wei.chen@example.com',          '', now(), now(), now(), '{"display_name":"陈伟"}',                  'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000003', 'sophie.martin@example.com',     '', now(), now(), now(), '{"display_name":"Sophie Martin"}',         'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000004', 'yuki.tanaka@example.com',       '', now(), now(), now(), '{"display_name":"田中雪"}',                 'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000005', 'carlos.mendoza@example.com',    '', now(), now(), now(), '{"display_name":"Carlos Mendoza"}',        'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000006', 'anna.mueller@example.com',      '', now(), now(), now(), '{"display_name":"Anna Müller"}',           'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000007', 'priya.sharma@example.com',      '', now(), now(), now(), '{"display_name":"Priya Sharma"}',          'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000008', 'dmitri.volkov@example.com',     '', now(), now(), now(), '{"display_name":"Дмитрий Волков"}',        'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000009', 'liu.yanmei@example.com',        '', now(), now(), now(), '{"display_name":"刘燕梅"}',                 'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000010', 'isabella.rossi@example.com',    '', now(), now(), now(), '{"display_name":"Isabella Rossi"}',        'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000011', 'park.jisoo@example.com',        '', now(), now(), now(), '{"display_name":"박지수"}',                 'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000012', 'emma.williams@example.com',     '', now(), now(), now(), '{"display_name":"Emma Williams"}',         'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000013', 'rafael.silva@example.com',      '', now(), now(), now(), '{"display_name":"Rafael Silva"}',          'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000014', 'fatima.al-zahra@example.com',   '', now(), now(), now(), '{"display_name":"فاطمة الزهراء"}',         'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000015', 'thomas.schneider@example.com',  '', now(), now(), now(), '{"display_name":"Thomas Schneider"}',      'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000016', 'akira.yamamoto@example.com',    '', now(), now(), now(), '{"display_name":"山本晃"}',                 'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000017', 'elena.popescu@example.com',     '', now(), now(), now(), '{"display_name":"Elena Popescu"}',         'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000018', 'zhang.wei@example.com',         '', now(), now(), now(), '{"display_name":"张伟"}',                   'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000019', 'olivia.johnson@example.com',    '', now(), now(), now(), '{"display_name":"Olivia Johnson"}',        'authenticated', 'authenticated'),
  ('a1b2c301-0000-0000-0000-000000000020', 'lucas.dubois@example.com',      '', now(), now(), now(), '{"display_name":"Lucas Dubois"}',          'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Insert profiles
INSERT INTO profiles (id, display_name, avatar_url, is_verified, created_at, updated_at) VALUES
  ('a1b2c301-0000-0000-0000-000000000001', 'James Harrison',    'https://api.dicebear.com/9.x/thumbs/svg?seed=james&backgroundColor=b6e3f4',    false, now() - interval '180 days', now()),
  ('a1b2c301-0000-0000-0000-000000000002', '陈伟',              'https://api.dicebear.com/9.x/thumbs/svg?seed=wchen&backgroundColor=ffd5dc',    false, now() - interval '150 days', now()),
  ('a1b2c301-0000-0000-0000-000000000003', 'Sophie Martin',     'https://api.dicebear.com/9.x/thumbs/svg?seed=sophie&backgroundColor=ffdfbf',   false, now() - interval '120 days', now()),
  ('a1b2c301-0000-0000-0000-000000000004', '田中雪',            'https://api.dicebear.com/9.x/thumbs/svg?seed=yuki&backgroundColor=d1d4f9',     false, now() - interval '110 days', now()),
  ('a1b2c301-0000-0000-0000-000000000005', 'Carlos Mendoza',    'https://api.dicebear.com/9.x/thumbs/svg?seed=carlos&backgroundColor=c0aede',   false, now() - interval '100 days', now()),
  ('a1b2c301-0000-0000-0000-000000000006', 'Anna Müller',       'https://api.dicebear.com/9.x/thumbs/svg?seed=annam&backgroundColor=b6e3f4',    false, now() - interval '95 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000007', 'Priya Sharma',      'https://api.dicebear.com/9.x/thumbs/svg?seed=priya&backgroundColor=ffd5dc',    false, now() - interval '90 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000008', 'Дмитрий Волков',    'https://api.dicebear.com/9.x/thumbs/svg?seed=dmitri&backgroundColor=ffdfbf',   false, now() - interval '85 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000009', '刘燕梅',            'https://api.dicebear.com/9.x/thumbs/svg?seed=liuym&backgroundColor=d1d4f9',    false, now() - interval '80 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000010', 'Isabella Rossi',    'https://api.dicebear.com/9.x/thumbs/svg?seed=isabella&backgroundColor=c0aede', false, now() - interval '75 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000011', '박지수',            'https://api.dicebear.com/9.x/thumbs/svg?seed=jisoo&backgroundColor=b6e3f4',    false, now() - interval '70 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000012', 'Emma Williams',     'https://api.dicebear.com/9.x/thumbs/svg?seed=emmaw&backgroundColor=ffd5dc',    false, now() - interval '65 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000013', 'Rafael Silva',      'https://api.dicebear.com/9.x/thumbs/svg?seed=rafael&backgroundColor=ffdfbf',   false, now() - interval '60 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000014', 'فاطمة الزهراء',    'https://api.dicebear.com/9.x/thumbs/svg?seed=fatima&backgroundColor=d1d4f9',   false, now() - interval '55 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000015', 'Thomas Schneider',  'https://api.dicebear.com/9.x/thumbs/svg?seed=thomas&backgroundColor=c0aede',   false, now() - interval '50 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000016', '山本晃',            'https://api.dicebear.com/9.x/thumbs/svg?seed=akira&backgroundColor=b6e3f4',    false, now() - interval '45 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000017', 'Elena Popescu',     'https://api.dicebear.com/9.x/thumbs/svg?seed=elena&backgroundColor=ffd5dc',    false, now() - interval '40 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000018', '张伟',              'https://api.dicebear.com/9.x/thumbs/svg?seed=zhangw&backgroundColor=ffdfbf',   false, now() - interval '35 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000019', 'Olivia Johnson',    'https://api.dicebear.com/9.x/thumbs/svg?seed=olivia&backgroundColor=d1d4f9',   false, now() - interval '30 days',  now()),
  ('a1b2c301-0000-0000-0000-000000000020', 'Lucas Dubois',      'https://api.dicebear.com/9.x/thumbs/svg?seed=lucas&backgroundColor=c0aede',    false, now() - interval '20 days',  now())
ON CONFLICT (id) DO NOTHING;

-- Step 3: Insert community posts (each in their native language)
INSERT INTO community_posts (
  id, user_id, content, image_url, image_urls,
  landmark_id, location_tag, likes_count,
  author_name, author_avatar, author_verified,
  created_at
) VALUES

-- James Harrison 🇬🇧 — English
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000001',
 'Standing at the base of the Great Pyramid put everything into perspective. I travel a lot but nothing has ever made me feel this small — in the best possible way. The sheer scale and the thought that humans built this 4,500 years ago with no modern tools is absolutely mind-blowing.',
 null, '{}', 'giza-pyramids', 'Giza, Cairo', 74,
 'James Harrison', 'https://api.dicebear.com/9.x/thumbs/svg?seed=james&backgroundColor=b6e3f4', false,
 now() - interval '30 days'),

-- 陈伟 🇨🇳 — Chinese
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000002',
 '卢克索神庙的夜景真的太震撼了！灯光打在那些巨大的石柱上，感觉像穿越到了几千年前的古埃及。强烈建议晚上去，白天人太多，夜晚的氛围完全不一样。门票很值！',
 null, '{}', 'luxor-temple', '卢克索', 58,
 '陈伟', 'https://api.dicebear.com/9.x/thumbs/svg?seed=wchen&backgroundColor=ffd5dc', false,
 now() - interval '28 days'),

-- Sophie Martin 🇫🇷 — French
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000003',
 'Abou Simbel m''a laissée sans voix. J''ai fait le trajet de nuit depuis Assouan pour arriver à l''aube — les quatre colosses de Ramsès II illuminés par le soleil levant, c''est une image que je n''oublierai jamais. Un site absolument unique au monde.',
 null, '{}', 'abu-simbel', 'Abou Simbel, Assouan', 91,
 'Sophie Martin', 'https://api.dicebear.com/9.x/thumbs/svg?seed=sophie&backgroundColor=ffdfbf', false,
 now() - interval '25 days'),

-- 田中雪 🇯🇵 — Japanese
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000004',
 'ハン・エル＝ハリーリ市場は迷路みたいで面白かった！香辛料の香り、カラフルな布、職人さんの手作り品。値段交渉が楽しくて、思っていた半額で素敵なランプを買えました。カイロに来たら絶対行くべきスポット！',
 null, '{}', 'khan-el-khalili', 'カイロ', 43,
 '田中雪', 'https://api.dicebear.com/9.x/thumbs/svg?seed=yuki&backgroundColor=d1d4f9', false,
 now() - interval '23 days'),

-- Carlos Mendoza 🇲🇽 — Spanish
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000005',
 'El Valle de los Reyes me dejó sin palabras. Entré a la tumba de Ramsés VI y los murales en el techo son increíblemente vívidos, como si los hubieran pintado ayer. Es difícil imaginar que todo esto se creó hace más de 3,000 años. Egipto supera cualquier expectativa.',
 null, '{}', 'valley-of-kings', 'Luxor', 67,
 'Carlos Mendoza', 'https://api.dicebear.com/9.x/thumbs/svg?seed=carlos&backgroundColor=c0aede', false,
 now() - interval '21 days'),

-- Anna Müller 🇩🇪 — German
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000006',
 'Das Ägyptische Museum in Kairo ist überwältigend — über 120.000 Exponate auf zwei Etagen! Ich habe fünf Stunden gebraucht und trotzdem nicht alles gesehen. Die Totenmaske des Tutanchamun aus massivem Gold ist einfach atemberaubend. Unbedingt einen ganzen Tag einplanen!',
 null, '{}', 'egyptian-museum', 'Tahrir-Platz, Kairo', 55,
 'Anna Müller', 'https://api.dicebear.com/9.x/thumbs/svg?seed=annam&backgroundColor=b6e3f4', false,
 now() - interval '19 days'),

-- Priya Sharma 🇮🇳 — English (Indian traveller)
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000007',
 'The White Desert was unlike anything I have ever seen. We camped overnight among the chalk rock formations and the silence was so complete it was almost loud. The Milky Way above us was extraordinary. Coming from Mumbai, I had forgotten what true darkness and true silence feel like.',
 null, '{}', 'white-desert', 'Farafra, New Valley', 88,
 'Priya Sharma', 'https://api.dicebear.com/9.x/thumbs/svg?seed=priya&backgroundColor=ffd5dc', false,
 now() - interval '17 days'),

-- Дмитрий Волков 🇷🇺 — Russian
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000008',
 'Храм Филе на острове посреди Нила — место, от которого захватывает дух. Плыть к нему на лодке в закатных лучах, а потом бродить среди огромных колонн с иероглифами — это незабываемо. Жаль, что вечернее шоу звука и света было только на арабском и английском.',
 null, '{}', 'philae-temple', 'Асуан', 39,
 'Дмитрий Волков', 'https://api.dicebear.com/9.x/thumbs/svg?seed=dmitri&backgroundColor=ffdfbf', false,
 now() - interval '15 days'),

-- 刘燕梅 🇨🇳 — Chinese
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000009',
 '卡纳克神庙规模宏大，走了两个多小时还没看完！多柱大厅里134根巨柱直冲云霄，站在里面感觉自己特别渺小。建议早上6点开门就进去，凉快而且人少，拍照效果也好。这是我去过最壮观的古迹之一！',
 null, '{}', 'karnak-temple', '卢克索', 82,
 '刘燕梅', 'https://api.dicebear.com/9.x/thumbs/svg?seed=liuym&backgroundColor=d1d4f9', false,
 now() - interval '13 days'),

-- Isabella Rossi 🇮🇹 — Italian
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000010',
 'L''oasi di Siwa è un posto magico che sembra uscito da un altro mondo. Le sorgenti naturali di acqua calda, le rovine dell''antico oracolo di Alessandro Magno, e le notti stellate nel deserto — tutto ciò crea un''atmosfera unica. Ho soggiornato in un lodge di fango tradizionale, esperienza meravigliosa!',
 null, '{}', 'siwa-oasis', 'Siwa, Matrouh', 61,
 'Isabella Rossi', 'https://api.dicebear.com/9.x/thumbs/svg?seed=isabella&backgroundColor=c0aede', false,
 now() - interval '11 days'),

-- 박지수 🇰🇷 — Korean
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000011',
 '콥트 카이로는 정말 숨겨진 보석 같은 곳이에요! 현수교회, 성 세르지우스 교회, 벤 에즈라 회당까지 걸어서 다 볼 수 있어요. 카이로의 시끄러운 번화가와 달리 조용하고 영적인 분위기가 너무 좋았습니다. 이집트 역사의 또 다른 층위를 볼 수 있는 곳이에요.',
 null, '{}', 'coptic-cairo', '올드 카이로', 36,
 '박지수', 'https://api.dicebear.com/9.x/thumbs/svg?seed=jisoo&backgroundColor=b6e3f4', false,
 now() - interval '10 days'),

-- Emma Williams 🇺🇸 — English
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000012',
 'Al-Azhar Mosque is open to non-Muslim visitors and they provide robes at the entrance for free. I visited during afternoon prayer and the atmosphere was deeply moving — the light, the sound, the marble floors. Even as an outsider I felt completely welcomed. A hidden gem right next to Khan el-Khalili.',
 null, '{}', 'al-azhar-mosque', 'Al-Azhar, Cairo', 47,
 'Emma Williams', 'https://api.dicebear.com/9.x/thumbs/svg?seed=emmaw&backgroundColor=ffd5dc', false,
 now() - interval '9 days'),

-- Rafael Silva 🇧🇷 — Portuguese
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000013',
 'Abu Simbel foi o ponto alto de toda a viagem. Acordei às 3h da manhã para pegar o ônibus de Assuã e chegar ao amanhecer — valeu muito a pena! Os quatro colossus de Ramsés II têm 20 metros de altura. O que os egípcios conseguiram construir há 3.000 anos simplesmente desafia a imaginação.',
 null, '{}', 'abu-simbel', 'Abu Simbel, Assuã', 79,
 'Rafael Silva', 'https://api.dicebear.com/9.x/thumbs/svg?seed=rafael&backgroundColor=ffdfbf', false,
 now() - interval '7 days'),

-- فاطمة الزهراء 🇸🇦 — Arabic (Saudi visitor)
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000014',
 'زيارة الأهرامات كانت حلماً تحقق! قرأت عنها في الكتب المدرسية ولما وقفت أمامها ما صدقت عيني. الهرم الأكبر أضخم مما تتخيل في الصور. أوصي كل عربي يقدر يزور مصر يبدأ برحلته من الجيزة — هذا الإرث لنا جميعاً.',
 null, '{}', 'giza-pyramids', 'الجيزة، القاهرة', 93,
 'فاطمة الزهراء', 'https://api.dicebear.com/9.x/thumbs/svg?seed=fatima&backgroundColor=d1d4f9', false,
 now() - interval '6 days'),

-- Thomas Schneider 🇦🇹 — German
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000015',
 'Das Weiße Wüste Nationalpark ist ein surreales Erlebnis. Die Kalksteinformationen sehen aus wie Skulpturen eines modernen Künstlers — aber die Natur hat Jahrtausende daran gearbeitet. Wir haben dort gezeltet und der Sternenhimmel war atemberaubend. Von Wien nach Ägypten — und absolut keine Sekunde bereut.',
 null, '{}', 'white-desert', 'Farafra', 52,
 'Thomas Schneider', 'https://api.dicebear.com/9.x/thumbs/svg?seed=thomas&backgroundColor=c0aede', false,
 now() - interval '5 days'),

-- 山本晃 🇯🇵 — Japanese
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000016',
 '王家の谷は想像を超えていました。ラムセス6世の墓の天井画は色鮮やかで、3000年以上前に描かれたとは信じられないほどです。チケットを購入すればツタンカーメンの墓も追加料金で入れます。早朝に訪問することを強くおすすめします！',
 null, '{}', 'valley-of-kings', 'ルクソール', 68,
 '山本晃', 'https://api.dicebear.com/9.x/thumbs/svg?seed=akira&backgroundColor=b6e3f4', false,
 now() - interval '4 days'),

-- Elena Popescu 🇷🇴 — Romanian
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000017',
 'Piața Khan el-Khalili din Cairo este un labirint fascinant de culori, mirosuri și sunete! Am petrecut 3 ore negociind și cumpărând — am găsit un papirus autentic manual pictat și o lampă de bronz minunată. Sfat: începeți negocierea de la jumătate din prețul cerut. Comercianții se așteaptă la asta!',
 null, '{}', 'khan-el-khalili', 'Cairo', 40,
 'Elena Popescu', 'https://api.dicebear.com/9.x/thumbs/svg?seed=elena&backgroundColor=ffd5dc', false,
 now() - interval '3 days'),

-- 张伟 🇨🇳 — Chinese
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000018',
 '西瓦绿洲真的是世外桃源！从亚历山大港开车5小时到达，但完全值得。克利奥帕特拉温泉自然热水泡澡，死人山看日落，沙漠中骑驴……每一刻都是难忘的体验。建议住传统泥屋旅馆，体验当地文化！',
 null, '{}', 'siwa-oasis', '西瓦', 57,
 '张伟', 'https://api.dicebear.com/9.x/thumbs/svg?seed=zhangw&backgroundColor=ffdfbf', false,
 now() - interval '2 days'),

-- Olivia Johnson 🇦🇺 — English (Australian)
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000019',
 'Karnak Temple at 6am with almost no other tourists — pure magic. The light hits those massive columns and you just stand there with your mouth open. I have been to Angkor Wat, Machu Picchu and Petra, and Karnak still stopped me in my tracks. Egypt keeps surprising me every single day.',
 null, '{}', 'karnak-temple', 'Luxor', 104,
 'Olivia Johnson', 'https://api.dicebear.com/9.x/thumbs/svg?seed=olivia&backgroundColor=d1d4f9', false,
 now() - interval '1 day'),

-- Lucas Dubois 🇫🇷 — French
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000020',
 'Le temple de Philae la nuit lors du spectacle Son et Lumière — moment magique! Les colonnes illuminées se reflètent dans le Nil et la voix raconte le mythe d''Osiris et Isis. Je recommande de réserver les billets à l''avance, surtout en haute saison. Assouan en général est une ville magnifique.',
 null, '{}', 'philae-temple', 'Assouan', 48,
 'Lucas Dubois', 'https://api.dicebear.com/9.x/thumbs/svg?seed=lucas&backgroundColor=c0aede', false,
 now() - interval '18 hours'),

-- Additional posts from same users

-- James Harrison 🇬🇧 (2nd post)
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000001',
 'Tip for first-time visitors: hire an official guide from the tourism authority at the Pyramids entrance — it''s worth every penny. They know the history in detail, keep the vendors away, and show you angles and spots the average tourist completely misses.',
 null, '{}', 'giza-pyramids', 'Giza', 38,
 'James Harrison', 'https://api.dicebear.com/9.x/thumbs/svg?seed=james&backgroundColor=b6e3f4', false,
 now() - interval '16 days'),

-- 陈伟 🇨🇳 (2nd post)
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000002',
 '埃及博物馆必看！图坦卡蒙的黄金面具在现实中比照片震撼百倍，纯金打造，3000多年过去了还是那么闪亮。建议买语音导览，里面的中文讲解非常详细。至少留半天时间，展品太多了，一天都看不完。',
 null, '{}', 'egyptian-museum', '解放广场，开罗', 63,
 '陈伟', 'https://api.dicebear.com/9.x/thumbs/svg?seed=wchen&backgroundColor=ffd5dc', false,
 now() - interval '14 days'),

-- Priya Sharma 🇮🇳 (2nd post)
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000007',
 'Siwa Oasis is the most peaceful place I have visited in all my travels across 40 countries. Waking up to complete silence, fresh dates from the palm trees, natural hot springs — it feels like the world has not changed here for centuries. Please do not over-tourify it. Keep it special.',
 null, '{}', 'siwa-oasis', 'Siwa, Egypt', 76,
 'Priya Sharma', 'https://api.dicebear.com/9.x/thumbs/svg?seed=priya&backgroundColor=ffd5dc', false,
 now() - interval '10 days'),

-- 刘燕梅 🇨🇳 (2nd post)
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000009',
 '白沙漠国家公园——这辈子见过最奇特的风景！白色石灰岩被风侵蚀成各种形状，像蘑菇、像鸡、像冰淇淋。在这里露营看星星，银河清晰可见。从开罗出发大约6小时车程，建议参加当地旅行团，包食宿和帐篷。',
 null, '{}', 'white-desert', '法拉菲拉', 95,
 '刘燕梅', 'https://api.dicebear.com/9.x/thumbs/svg?seed=liuym&backgroundColor=d1d4f9', false,
 now() - interval '7 days'),

-- Isabella Rossi 🇮🇹 (2nd post)
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000010',
 'La Moschea di Al-Azhar è aperta ai visitatori non musulmani — l''ingresso è gratuito e all''entrata forniscono abiti da indossare. L''atmosfera all''interno è di una serenità assoluta, soprattutto durante la preghiera. Un posto dove si percepisce davvero la storia millenaria dell''Islam.',
 null, '{}', 'al-azhar-mosque', 'Al-Azhar, Cairo', 29,
 'Isabella Rossi', 'https://api.dicebear.com/9.x/thumbs/svg?seed=isabella&backgroundColor=c0aede', false,
 now() - interval '5 days'),

-- Emma Williams 🇺🇸 (2nd post)
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000012',
 'Valley of the Kings — do not skip the add-on ticket for Tutankhamun''s tomb. It''s small compared to others but the history inside is enormous. The mummy is still there in the golden sarcophagus. Standing 3 feet from a 3,300-year-old pharaoh is genuinely surreal.',
 null, '{}', 'valley-of-kings', 'Luxor', 71,
 'Emma Williams', 'https://api.dicebear.com/9.x/thumbs/svg?seed=emmaw&backgroundColor=ffd5dc', false,
 now() - interval '3 days'),

-- Olivia Johnson 🇦🇺 (2nd post)
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000019',
 'Coptic Cairo is a beautiful surprise. Within a few blocks you have ancient churches, a synagogue, a Roman fortress and a mosque all coexisting. The Hanging Church alone is worth the trip — the wooden interior is stunning. Go early morning on a weekday for a quiet visit.',
 null, '{}', 'coptic-cairo', 'Old Cairo', 33,
 'Olivia Johnson', 'https://api.dicebear.com/9.x/thumbs/svg?seed=olivia&backgroundColor=d1d4f9', false,
 now() - interval '20 hours'),

-- Sophie Martin 🇫🇷 (2nd post)
(gen_random_uuid(), 'a1b2c301-0000-0000-0000-000000000003',
 'Le bazar Khan el-Khalili est une expérience sensorielle totale — les épices, les parfums, les couleurs, les appels des vendeurs. J''ai trouvé de magnifiques lampes en cuivre et des foulards en coton à des prix imbattables après négociation. Le café Fishawi, ouvert depuis 1773, est incontournable!',
 null, '{}', 'khan-el-khalili', 'Le Caire', 44,
 'Sophie Martin', 'https://api.dicebear.com/9.x/thumbs/svg?seed=sophie&backgroundColor=ffdfbf', false,
 now() - interval '12 hours')

ON CONFLICT DO NOTHING;
