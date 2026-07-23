-- ============ States (curated subset of Indian states/UTs) ============
insert into public.states (name, slug, code) values
  ('Delhi','delhi','DL'),
  ('Maharashtra','maharashtra','MH'),
  ('Uttar Pradesh','uttar-pradesh','UP'),
  ('Rajasthan','rajasthan','RJ'),
  ('Bihar','bihar','BR'),
  ('Karnataka','karnataka','KA'),
  ('Tamil Nadu','tamil-nadu','TN'),
  ('West Bengal','west-bengal','WB'),
  ('Telangana','telangana','TG'),
  ('Gujarat','gujarat','GJ')
on conflict (slug) do nothing;

-- ============ Popular coaching cities ============
insert into public.cities (state_id, name, slug, is_popular)
select s.id, c.name, c.slug, true
from (values
  ('Delhi','New Delhi','new-delhi','delhi'),
  ('Maharashtra','Mumbai','mumbai','maharashtra'),
  ('Maharashtra','Pune','pune','maharashtra'),
  ('Rajasthan','Kota','kota','rajasthan'),
  ('Rajasthan','Jaipur','jaipur','rajasthan'),
  ('Uttar Pradesh','Prayagraj','prayagraj','uttar-pradesh'),
  ('Uttar Pradesh','Lucknow','lucknow','uttar-pradesh'),
  ('Bihar','Patna','patna','bihar'),
  ('Karnataka','Bengaluru','bengaluru','karnataka'),
  ('Telangana','Hyderabad','hyderabad','telangana'),
  ('Tamil Nadu','Chennai','chennai','tamil-nadu'),
  ('West Bengal','Kolkata','kolkata','west-bengal')
) as c(state_name, name, slug, state_slug)
join public.states s on s.slug = c.state_slug
on conflict (slug) do nothing;

-- ============ Launch exam categories ============
insert into public.exam_categories (name, slug, icon, sort_order) values
  ('JEE','jee','GraduationCap',1),
  ('NEET','neet','Stethoscope',2),
  ('UPSC','upsc','Landmark',3),
  ('SSC','ssc','FileText',4),
  ('Banking','banking','Banknote',5),
  ('Railway (RRB)','railway-rrb','TrainFront',6),
  ('BPSC','bpsc','Landmark',7),
  ('CAT','cat','BriefcaseBusiness',8),
  ('GATE','gate','Cpu',9),
  ('CUET','cuet','BookOpen',10),
  ('CLAT','clat','Scale',11),
  ('NDA','nda','Shield',12),
  ('State PSC','state-psc','Building2',13)
on conflict (slug) do nothing;

-- ============ Blog categories ============
insert into public.blog_categories (name, slug, description) values
  ('Exam Tips','exam-tips','Strategies and tips for cracking competitive exams'),
  ('Preparation','preparation','Study plans, resources, and preparation guides'),
  ('Scholarships','scholarships','Scholarship opportunities and how to apply'),
  ('Admission','admission','Admission processes, cutoffs, and deadlines'),
  ('Career','career','Career guidance and outcomes'),
  ('Coaching Reviews','coaching-reviews','Honest reviews of coaching institutes')
on conflict (slug) do nothing;

-- ============ Default settings ============
insert into public.settings (key, value, "group") values
  ('seo.defaults',
   '{"title":"BatchKart — Discover the Right Coaching Batch","description":"India''s coaching batch discovery marketplace. Compare batches, unlock discounts, connect with the best educators.","ogImage":"/og-default.png"}'::jsonb,
   'seo'),
  ('homepage.trust_stats',
   '{"batches":0,"coaching":0,"cities":0,"rupees_saved":0}'::jsonb,
   'homepage'),
  ('general.feature_flags',
   '{"coaching_self_serve":false,"reviews_enabled":true,"newsletter_enabled":true}'::jsonb,
   'general')
on conflict (key) do nothing;

-- ============ Sample testimonials (homepage) ============
insert into public.testimonials (name, role, exam, quote, rating, is_featured) values
  ('Ananya Verma','JEE Aspirant','JEE','BatchKart helped me compare Kota batches and save ₹40,000 on my fee.',5,true),
  ('Rohan Gupta','NEET Aspirant','NEET','Found the perfect biology batch near me in two clicks.',5,true),
  ('Priya Singh','UPSC Aspirant','UPSC','The discount request feature is a game changer for students.',5,true)
on conflict do nothing;
