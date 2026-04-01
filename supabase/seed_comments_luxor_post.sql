-- ============================================================
-- Seed comments on the Luxor Temple post
-- Post ID: e3440736-4968-4f54-ba65-5ec3d623f9e6
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

INSERT INTO community_comments (
  post_id, user_id, content,
  author_name, author_avatar, author_verified, author_official,
  created_at
) VALUES

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000019',
 'These photos don''t even do it justice — Luxor Temple at night is one of the most magical things I have ever witnessed. The way the floodlights hit those columns... just breathtaking. Was there last October and still think about it.',
 'Olivia Johnson', 'https://api.dicebear.com/9.x/thumbs/svg?seed=olivia&backgroundColor=d1d4f9', false, false,
 now() - interval '5 days' - interval '10 hours'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000009',
 '卢克索神庙的夜景真的太美了！照片里的灯光效果令人窒息。我去的时候是下午，白天的感觉也很震撼，但看了你的照片真后悔没等到晚上！下次一定要看夜景 🌙',
 '刘燕梅', 'https://api.dicebear.com/9.x/thumbs/svg?seed=liuym&backgroundColor=d1d4f9', false, false,
 now() - interval '5 days'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000003',
 'Ces photos sont absolument magnifiques ! Le temple de Louxor illuminé la nuit est sur ma liste depuis des années. Tu as eu de la chance de le voir sous cet angle. C''est réservé pour mon prochain voyage en Égypte sans hésitation 🏛️✨',
 'Sophie Martin', 'https://api.dicebear.com/9.x/thumbs/svg?seed=sophie&backgroundColor=ffdfbf', false, false,
 now() - interval '4 days' - interval '16 hours'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000016',
 'ルクソール神殿の写真、素晴らしいですね！夜の照明で浮かび上がる石柱の美しさが伝わってきます。ラムセス2世の像が印象的！私は昼間に行きましたが、夜はまた違う雰囲気なんですね 😍',
 '山本晃', 'https://api.dicebear.com/9.x/thumbs/svg?seed=akira&backgroundColor=b6e3f4', false, false,
 now() - interval '4 days'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000005',
 'El Templo de Luxor de noche es impresionante. Yo lo visité de día y fue hermoso, pero viendo tus fotos me arrepiento de no haberme quedado hasta el anochecer. ¿Cuánto tiempo se necesita para verlo completo por la noche? 🤩',
 'Carlos Mendoza', 'https://api.dicebear.com/9.x/thumbs/svg?seed=carlos&backgroundColor=c0aede', false, false,
 now() - interval '3 days' - interval '20 hours'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000008',
 'Потрясающие фотографии! Луксорский храм ночью — это нечто особенное. Я был там во время восхода солнца, но ночная подсветка выглядит ещё более впечатляюще. Рамсес II действительно незабываем даже спустя тысячи лет 🏺',
 'Дмитрий Волков', 'https://api.dicebear.com/9.x/thumbs/svg?seed=dmitri&backgroundColor=ffdfbf', false, false,
 now() - interval '3 days'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000014',
 'يا سلام! الصور دي بتاخد النفس! معبد الأقصر بالليل فيه سحر مختلف خالص. اللي يزور الأقصر ولا يشوفه بالليل فاته نص التجربة. ربّنا يكرّمك على الصور الجميلة دي 😍🙏',
 'فاطمة الزهراء', 'https://api.dicebear.com/9.x/thumbs/svg?seed=fatima&backgroundColor=d1d4f9', false, false,
 now() - interval '2 days' - interval '18 hours'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000010',
 'Che meraviglia! Il tempio di Luxor di notte è qualcosa di unico al mondo. La terza foto con i colossus di Ramsete è la mia preferita — il contrasto tra il cielo scuro e la pietra illuminata è perfetto. Quante foto hai scattato in totale? 📸',
 'Isabella Rossi', 'https://api.dicebear.com/9.x/thumbs/svg?seed=isabella&backgroundColor=c0aede', false, false,
 now() - interval '2 days'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000011',
 '룩소르 신전 야경 사진 너무 아름다워요!! 저도 낮에만 방문했는데 밤에 보니 완전 다른 느낌이네요. 조명이 돌기둥에 반사되는 게 정말 환상적이에요 ✨ 다음에 이집트 가면 꼭 밤에 다시 방문할게요!',
 '박지수', 'https://api.dicebear.com/9.x/thumbs/svg?seed=jisoo&backgroundColor=b6e3f4', false, false,
 now() - interval '1 day' - interval '14 hours'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000013',
 'Fotos incríveis! O Templo de Luxor à noite tem uma magia diferente. Estive lá ao pôr do sol e foi lindo, mas a iluminação noturna que aparece nas suas fotos é de outro nível. Qual câmera você usou? Os detalhes ficaram perfeitos! 📷',
 'Rafael Silva', 'https://api.dicebear.com/9.x/thumbs/svg?seed=rafael&backgroundColor=ffdfbf', false, false,
 now() - interval '1 day'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000015',
 'Atemberaubende Aufnahmen! Der Luxor-Tempel ist sowieso schon beeindruckend, aber bei Nacht mit dieser Beleuchtung wirkt er fast magisch. Ich war tagsüber dort und wusste gar nicht, dass es auch eine nächtliche Besichtigung gibt. Unbedingt beim nächsten Besuch nachholen! 🌟',
 'Thomas Schneider', 'https://api.dicebear.com/9.x/thumbs/svg?seed=thomas&backgroundColor=c0aede', false, false,
 now() - interval '18 hours'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000007',
 'Stunning shots! The scale of those columns is something that photos struggle to capture but you have done an amazing job here. Pro tip for anyone visiting: arrive about 30 minutes before opening time, the morning light on the obelisk is extraordinary too 🌅',
 'Priya Sharma', 'https://api.dicebear.com/9.x/thumbs/svg?seed=priya&backgroundColor=ffd5dc', false, false,
 now() - interval '10 hours'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000018',
 '卢克索神庙夜景太震撼了！灯光把整个神庙映照得金碧辉煌，感觉像穿越到了古埃及鼎盛时期。最喜欢那张拉美西斯二世雕像的特写，细节清晰得不可思议。这是用手机拍的吗？效果真的太好了！',
 '张伟', 'https://api.dicebear.com/9.x/thumbs/svg?seed=zhangw&backgroundColor=ffdfbf', false, false,
 now() - interval '6 hours'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000001',
 'The Avenue of Sphinxes leading up to the entrance is what got me — over 1km of sphinx statues connecting Luxor and Karnak temples. Did you walk the full avenue? It was only recently restored and opened to the public. One of the great wonders of the ancient world 🦁',
 'James Harrison', 'https://api.dicebear.com/9.x/thumbs/svg?seed=james&backgroundColor=b6e3f4', false, false,
 now() - interval '3 hours'),

('e3440736-4968-4f54-ba65-5ec3d623f9e6',
 'a1b2c301-0000-0000-0000-000000000020',
 'Quelle beauté ! Le temple de Louxor est l''un des sites les plus photogéniques d''Égypte et tes photos en sont la preuve parfaite. La quatrième image avec le reflet dans le Nil au fond... ça c''est de la vraie magie photographique. Bravo ! 🌊✨',
 'Lucas Dubois', 'https://api.dicebear.com/9.x/thumbs/svg?seed=lucas&backgroundColor=c0aede', false, false,
 now() - interval '1 hour');
