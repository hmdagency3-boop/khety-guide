-- ============================================================
-- Safety Data Tables — Khety Guide
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── 1. Tables ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text        NOT NULL,
  name_ar        text,
  number         text        NOT NULL,
  description    text,
  description_ar text,
  category       text        DEFAULT 'general',
  available_hours text       DEFAULT '24/7',
  sort_order     integer     DEFAULT 0,
  is_active      boolean     DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.common_scams (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL,
  title_ar       text,
  description    text        NOT NULL,
  description_ar text,
  how_to_avoid   text        NOT NULL,
  how_to_avoid_ar text,
  severity       text        CHECK (severity IN ('low','medium','high')) DEFAULT 'medium',
  sort_order     integer     DEFAULT 0,
  is_active      boolean     DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tourist_rights (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL,
  title_ar       text,
  description    text        NOT NULL,
  description_ar text,
  icon           text,
  sort_order     integer     DEFAULT 0,
  is_active      boolean     DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- ── 2. updated_at trigger ────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_emergency_contacts_updated_at
    BEFORE UPDATE ON public.emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_common_scams_updated_at
    BEFORE UPDATE ON public.common_scams
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_tourist_rights_updated_at
    BEFORE UPDATE ON public.tourist_rights
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 3. Row-Level Security ─────────────────────────────────────

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.common_scams       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_rights     ENABLE ROW LEVEL SECURITY;

-- Public: read active rows
DROP POLICY IF EXISTS "public_read_emergency_contacts" ON public.emergency_contacts;
CREATE POLICY "public_read_emergency_contacts" ON public.emergency_contacts
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "public_read_common_scams" ON public.common_scams;
CREATE POLICY "public_read_common_scams" ON public.common_scams
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "public_read_tourist_rights" ON public.tourist_rights;
CREATE POLICY "public_read_tourist_rights" ON public.tourist_rights
  FOR SELECT USING (is_active = true);

-- ── 4. Seed Data ──────────────────────────────────────────────

INSERT INTO public.emergency_contacts
  (name, name_ar, number, description, description_ar, category, available_hours, sort_order)
VALUES
  ('Tourist Police',             'شرطة السياحة',       '126',              'Dedicated tourist assistance and emergency response', 'مساعدة السياح وخدمة الطوارئ المخصصة',      'police',  '24/7',           1),
  ('Ambulance',                  'الإسعاف',             '123',              'Emergency medical services nationwide',               'خدمات الإسعاف الطارئة على مستوى الجمهورية', 'medical', '24/7',           2),
  ('Fire Department',            'الإطفاء',             '180',              'Fire and rescue emergency services',                  'خدمات الإطفاء والإنقاذ الطارئة',            'fire',    '24/7',           3),
  ('Police',                     'الشرطة',              '122',              'National police emergency line',                      'خط الطوارئ للشرطة الوطنية',                  'police',  '24/7',           4),
  ('Egyptian Tourism Authority', 'هيئة تنشيط السياحة', '+20-2-2391-3454',  'Tourist complaints, queries and official guidance',   'شكاوى السياح والاستفسارات والتوجيه الرسمي', 'tourism', 'Business hours', 5)
ON CONFLICT DO NOTHING;

INSERT INTO public.common_scams
  (title, title_ar, description, description_ar, how_to_avoid, how_to_avoid_ar, severity, sort_order)
VALUES
  ('Fake Tour Guide',       'مرشد سياحي مزيف',       'Unlicensed individuals near monuments offer cheap tours that end at overpriced souvenir shops.',    'أفراد غير مرخصين قرب المعالم يعرضون جولات رخيصة تنتهي في محلات بأسعار مرتفعة.',     'Use only officially licensed guides with an Egyptian Tourism Authority ID badge.',  'استخدم فقط المرشدين الحاملين لبطاقة هيئة تنشيط السياحة الرسمية.',              'high',   1),
  ('Camel / Horse Ride',    'جولة الجمل والحصان',     'Tourists are offered a short cheap ride near the Pyramids, then charged hundreds of dollars to return.', 'يُعرض على السياح جولة قصيرة برخص ثم يُطلب منهم مئات الدولارات للعودة.',          'Agree on a clear round-trip price before mounting. Ignore free photo offers.',      'اتفق على سعر الرحلة ذهاباً وإياباً قبل الركوب. تجاهل عروض الصور المجانية.', 'high',   2),
  ('Fake Papyrus',          'بردي مزيف',              'Guides steer tourists to shops selling low-quality banana-leaf prints as authentic ancient papyrus.', 'يوجه المرشدون السياح لمحلات تبيع طبعات رديئة على أنها بردي أصيل.',              'Genuine papyrus bends without cracking. Buy only from certified shops.',            'البردي الحقيقي ينثني دون كسر. اشترِ فقط من محلات معتمدة.',                    'medium', 3),
  ('Taxi Overcharging',     'سائق تاكسي غير أمين',   'Unmetered taxis quote inflated fares, especially from airports and tourist sites.',                  'سيارات التاكسي بلا عداد تطلب أسعاراً مبالغاً فيها خاصة من المطارات.',           'Use Uber, Careem, or agree on the fare before entering the cab.',                   'استخدم أوبر أو كريم، أو اتفق على الأجرة قبل الصعود.',                         'medium', 4),
  ('Currency Exchange Scam','نصب الصرافة',            'Street changers offer tempting rates and short-change tourists using sleight of hand.',              'صرافو الشوارع يعرضون أسعاراً مغرية ويخدعون السياح بحركات سريعة.',              'Exchange only at official banks, hotel desks, or certified ATMs.',                 'صرّف فقط في البنوك أو مكاتب الفندق أو الصراف الآلي المعتمد.',                 'high',   5),
  ('Photo Fee Ambush',      'كمين الصور',             'Locals in traditional dress or with exotic animals encourage photos then demand high payment.',       'سكان يرتدون ملابس تقليدية أو يحملون حيوانات يشجعون التصوير ثم يطلبون أموالاً.', 'Decline or agree on a fee before taking any photo.',                               'ارفض أو اتفق على السعر قبل التقاط أي صورة.',                                  'low',    6)
ON CONFLICT DO NOTHING;

INSERT INTO public.tourist_rights
  (title, title_ar, description, description_ar, sort_order)
VALUES
  ('Right to Licensed Guides',      'حق الحصول على مرشد مرخص',          'You have the right to request proof of licensing from any tour guide.',                           'يحق لك طلب دليل الترخيص من أي مرشد سياحي.',                                             1),
  ('Right to Official Receipts',    'حق الحصول على إيصالات رسمية',       'Vendors and service providers must issue a receipt on request.',                                  'يجب على البائعين ومقدمي الخدمات إصدار إيصال عند الطلب.',                                2),
  ('Right to Tourist Police Help',  'حق طلب مساعدة الشرطة السياحية',    'Tourist police (126) are stationed at all major sites and obligated to assist foreign visitors.', 'الشرطة السياحية (126) في جميع المواقع الرئيسية وملزمة بمساعدة الزوار الأجانب.',        3),
  ('Right to Safe Transportation',  'حق التنقل الآمن',                   'Licensed taxis and app-based rides are regulated. You may refuse a ride and report overcharging.', 'سيارات الأجرة المرخصة منظمة. يمكنك رفض الرحلة والإبلاغ عن الإفراط في التسعير.',       4),
  ('Right to File a Complaint',     'حق تقديم شكوى',                     'Complaints against service providers can be filed with the Egyptian Tourism Authority (+20-2-2391-3454).', 'يمكن تقديم الشكاوى لهيئة تنشيط السياحة (+20-2-2391-3454) أو أقسام الشرطة السياحية.', 5),
  ('Right to Medical Assistance',   'حق الحصول على الرعاية الطبية',     'Emergency medical care cannot be withheld. Call 123 for ambulance. Travel insurance is strongly recommended.', 'لا يمكن حجب الرعاية الطبية الطارئة. اتصل بـ 123 للإسعاف. يُنصح بشدة بتأمين السفر.', 6)
ON CONFLICT DO NOTHING;
