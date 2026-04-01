-- ============================================================
-- Seed comments on the Welcome post
-- Post ID: 5b9e3938-9a38-453f-9380-92776e1123c3
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

INSERT INTO community_comments (
  post_id, user_id, content,
  author_name, author_avatar, author_verified, author_official,
  created_at
) VALUES

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000001',
 'This is exactly what I was looking for! Planning my Egypt trip for next month and an app like this makes all the difference. Already bookmarked the Pyramids and Karnak guides 🏛️',
 'James Harrison', 'https://api.dicebear.com/9.x/thumbs/svg?seed=james&backgroundColor=b6e3f4', false, false,
 now() - interval '6 days'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000002',
 '这个应用太棒了！终于有一个专门为埃及旅行设计的导览app！中文支持非常好，历史介绍也很详细。五星好评！🌟',
 '陈伟', 'https://api.dicebear.com/9.x/thumbs/svg?seed=wchen&backgroundColor=ffd5dc', false, false,
 now() - interval '5 days' - interval '18 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000003',
 'Enfin une application complète pour visiter l''Égypte ! Les descriptions des sites sont très détaillées et l''interface est magnifique. Je recommande à tous mes amis voyageurs 🇪🇬',
 'Sophie Martin', 'https://api.dicebear.com/9.x/thumbs/svg?seed=sophie&backgroundColor=ffdfbf', false, false,
 now() - interval '5 days'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000004',
 'エジプト旅行の計画中にこのアプリを見つけました！観光スポットの情報が豊富で、地図機能もとても使いやすいです。来月カイロへ行くのが楽しみになりました 🏺',
 '田中雪', 'https://api.dicebear.com/9.x/thumbs/svg?seed=yuki&backgroundColor=d1d4f9', false, false,
 now() - interval '4 days' - interval '20 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000005',
 '¡Increíble aplicación! Estaba buscando algo así desde hace tiempo. Los consejos de seguridad son muy útiles y los precios de entrada actualizados me ahorrarán muchos problemas. ¡Gracias equipo Khety! 👏',
 'Carlos Mendoza', 'https://api.dicebear.com/9.x/thumbs/svg?seed=carlos&backgroundColor=c0aede', false, false,
 now() - interval '4 days'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000006',
 'Endlich eine App die wirklich hilft! Die Informationen zu Öffnungszeiten und Eintrittspreisen sind super aktuell. Die KI-Funktion für Reiseplanung ist besonders praktisch. Sehr empfehlenswert! ⭐⭐⭐⭐⭐',
 'Anna Müller', 'https://api.dicebear.com/9.x/thumbs/svg?seed=annam&backgroundColor=b6e3f4', false, false,
 now() - interval '3 days' - interval '14 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000007',
 'What a thoughtful app! The safety tips section alone is worth downloading it for. As a solo female traveller, having reliable local information is so important. Well done to the team behind this! 🙌',
 'Priya Sharma', 'https://api.dicebear.com/9.x/thumbs/svg?seed=priya&backgroundColor=ffd5dc', false, false,
 now() - interval '3 days'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000008',
 'Отличное приложение! Наконец-то есть нормальный гид по Египту. Функция чата с ИИ очень умная — задал вопрос про Абу-Симбел и получил подробный ответ на русском языке. Молодцы разработчики! 👍',
 'Дмитрий Волков', 'https://api.dicebear.com/9.x/thumbs/svg?seed=dmitri&backgroundColor=ffdfbf', false, false,
 now() - interval '2 days' - interval '22 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000009',
 '用了好几个旅游app，这个是最专业的！AI助手用中文回答问题，还能根据我的偏好制定行程，真的太方便了。下周就去开罗，有了这个app感觉安心多了！',
 '刘燕梅', 'https://api.dicebear.com/9.x/thumbs/svg?seed=liuym&backgroundColor=d1d4f9', false, false,
 now() - interval '2 days' - interval '6 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000010',
 'Bellissima app! L''interfaccia è elegante e le informazioni sono affidabili. Ho usato la funzione AR per identificare i geroglifici al museo egizio — fantastico! Un lavoro davvero ben fatto 🏆',
 'Isabella Rossi', 'https://api.dicebear.com/9.x/thumbs/svg?seed=isabella&backgroundColor=c0aede', false, false,
 now() - interval '1 day' - interval '20 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000011',
 '이 앱 정말 대박이에요! AI 가이드한테 이집트 여행 일정 짜달라고 했더니 완벽한 10일 일정을 만들어줬어요. 한국어로도 잘 답변해줘서 너무 편했습니다. 꼭 써보세요! 🌟',
 '박지수', 'https://api.dicebear.com/9.x/thumbs/svg?seed=jisoo&backgroundColor=b6e3f4', false, false,
 now() - interval '1 day' - interval '10 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000012',
 'Just got back from two weeks in Egypt and this app was open every single day. The landmark pages have just the right amount of information — not too much, not too little. The map feature saved me multiple times in Cairo!',
 'Emma Williams', 'https://api.dicebear.com/9.x/thumbs/svg?seed=emmaw&backgroundColor=ffd5dc', false, false,
 now() - interval '22 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000013',
 'Que aplicativo incrível! Viajei pelo Egito por 12 dias e usei o Khety todos os dias. As dicas sobre preços e como evitar golpes me pouparam muito dinheiro e aborrecimento. Parabéns à equipe! 🎉',
 'Rafael Silva', 'https://api.dicebear.com/9.x/thumbs/svg?seed=rafael&backgroundColor=ffdfbf', false, false,
 now() - interval '16 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000014',
 'تطبيق رائع جداً! الذكاء الاصطناعي فيه بيجاوب على الأسئلة بالعربي بشكل مفيد جداً. كمان معلومات المعالم دقيقة ومحدّثة. ربّي يوفق فريق خيتي على هذا الجهد الجميل 🙏',
 'فاطمة الزهراء', 'https://api.dicebear.com/9.x/thumbs/svg?seed=fatima&backgroundColor=d1d4f9', false, false,
 now() - interval '10 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000015',
 'Sehr durchdachte App! Besonders gefällt mir, dass man mit dem KI-Assistenten auf Deutsch sprechen kann und echte Insider-Tipps bekommt, nicht nur die üblichen Touristeninformationen. Klare Kaufempfehlung!',
 'Thomas Schneider', 'https://api.dicebear.com/9.x/thumbs/svg?seed=thomas&backgroundColor=c0aede', false, false,
 now() - interval '7 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000016',
 'アプリのデザインがとても洗練されていて使いやすいです！カメラでヒエログリフをスキャンする機能が特に面白かったです。エジプト旅行の必須アプリです！絶対おすすめ 📸',
 '山本晃', 'https://api.dicebear.com/9.x/thumbs/svg?seed=akira&backgroundColor=b6e3f4', false, false,
 now() - interval '4 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000019',
 'As someone who has travelled to 50+ countries, I can honestly say Khety is one of the best destination-specific travel apps I have ever used. The cultural context provided alongside practical info is what sets it apart. Brilliant work.',
 'Olivia Johnson', 'https://api.dicebear.com/9.x/thumbs/svg?seed=olivia&backgroundColor=d1d4f9', false, false,
 now() - interval '2 hours'),

('5b9e3938-9a38-453f-9380-92776e1123c3',
 'a1b2c301-0000-0000-0000-000000000020',
 'Application magnifique et très bien conçue ! Le guide IA est impressionnant — j''ai posé des questions complexes sur l''histoire de l''Égypte antique et les réponses étaient détaillées et précises. Bravo à toute l''équipe ! 🏺✨',
 'Lucas Dubois', 'https://api.dicebear.com/9.x/thumbs/svg?seed=lucas&backgroundColor=c0aede', false, false,
 now() - interval '45 minutes');
