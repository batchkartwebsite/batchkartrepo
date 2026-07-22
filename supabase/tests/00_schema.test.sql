begin;
select plan(6);

-- pgTAP + helpers are available in the test DB.
select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'batches', 'batches table exists');

-- Every one of the 29 domain tables has RLS enabled.
select is(
  (select count(*)::int
   from pg_tables
   where schemaname = 'public'
     and tablename in (
       'profiles','admin_users','notifications','exam_categories','states','cities',
       'coaching_institutes','coaching_branches','coaching_faculty','batches','discounts','faqs',
       'student_preferences','requirement_posts','discount_requests','saved_batches','batch_contacts','student_documents',
       'reviews','blog_posts','blog_categories','testimonials','newsletter_subscribers',
       'audit_logs','media','reports','settings',
       'coaching_members','coaching_member_branches','coaching_claims'
     )
     and rowsecurity = false),
  0,
  'no domain table has RLS disabled'
);

-- Enum sanity.
select has_type('public', 'moderation_status', 'moderation_status enum exists');
select has_type('public', 'user_role', 'user_role enum exists');

-- Helper function exists.
select has_function('public', 'is_admin', 'is_admin() exists');

select * from finish();
rollback;
