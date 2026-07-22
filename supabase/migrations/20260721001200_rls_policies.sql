-- ============ Identity & Access ============
-- profiles: user reads/updates own; admin all.
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy profiles_admin_all on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- admin_users: admin only (self-read allowed for the logged-in admin).
create policy admin_users_self_or_admin on public.admin_users
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());
create policy admin_users_admin_write on public.admin_users
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- notifications: owner reads/updates; admin all.
create policy notifications_owner on public.notifications
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy notifications_owner_update on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_admin_all on public.notifications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============ Taxonomy & Location (public read, admin write) ============
create policy states_public_read on public.states
  for select to anon, authenticated using (true);
create policy states_admin_all on public.states
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy cities_public_read on public.cities
  for select to anon, authenticated using (true);
create policy cities_admin_all on public.cities
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy exam_categories_public_read on public.exam_categories
  for select to anon, authenticated using (is_active or public.is_admin());
create policy exam_categories_admin_all on public.exam_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============ Coaching Catalog ============
-- coaching_institutes: public sees published; admin all; member scoped write.
create policy coaching_public_read on public.coaching_institutes
  for select to anon, authenticated
  using (moderation_status = 'published' or public.is_admin() or public.is_active_member_of(id));
create policy coaching_admin_all on public.coaching_institutes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy coaching_member_manage on public.coaching_institutes
  for update to authenticated
  using (public.is_active_member_of(id)) with check (public.is_active_member_of(id));

-- coaching_branches: public read if parent published; admin all; member scoped.
create policy branches_public_read on public.coaching_branches
  for select to anon, authenticated
  using (
    public.is_admin()
    or public.can_manage_branch(coaching_id, id)
    or exists (
      select 1 from public.coaching_institutes c
      where c.id = coaching_id and c.moderation_status = 'published'
    )
  );
create policy branches_admin_all on public.coaching_branches
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy branches_member_manage on public.coaching_branches
  for all to authenticated
  using (public.can_manage_branch(coaching_id, id))
  with check (public.can_manage_branch(coaching_id, id));

-- coaching_faculty: public read if parent published; admin all; member (coaching-level -> all_branches).
create policy faculty_public_read on public.coaching_faculty
  for select to anon, authenticated
  using (
    public.is_admin()
    or public.is_active_member_of(coaching_id)
    or exists (
      select 1 from public.coaching_institutes c
      where c.id = coaching_id and c.moderation_status = 'published'
    )
  );
create policy faculty_admin_all on public.coaching_faculty
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy faculty_member_manage on public.coaching_faculty
  for all to authenticated
  using (public.can_manage_branch(coaching_id, null))
  with check (public.can_manage_branch(coaching_id, null));

-- batches: public sees published; admin all; member scoped by branch.
create policy batches_public_read on public.batches
  for select to anon, authenticated
  using (
    moderation_status = 'published'
    or public.is_admin()
    or public.can_manage_branch(coaching_id, branch_id)
  );
create policy batches_admin_all on public.batches
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy batches_member_manage on public.batches
  for all to authenticated
  using (public.can_manage_branch(coaching_id, branch_id))
  with check (public.can_manage_branch(coaching_id, branch_id));

-- discounts: public read if active + parent published; admin all; member scoped.
create policy discounts_public_read on public.discounts
  for select to anon, authenticated
  using (
    public.is_admin()
    or public.can_manage_branch(coaching_id, null)
    or (
      is_active and exists (
        select 1 from public.coaching_institutes c
        where c.id = coaching_id and c.moderation_status = 'published'
      )
    )
  );
create policy discounts_admin_all on public.discounts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy discounts_member_manage on public.discounts
  for all to authenticated
  using (public.can_manage_branch(coaching_id, null))
  with check (public.can_manage_branch(coaching_id, null));

-- faqs: public read; admin all. (Member write deferred with coaching UI.)
create policy faqs_public_read on public.faqs
  for select to anon, authenticated using (true);
create policy faqs_admin_all on public.faqs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============ Student & Marketplace (owner + admin) ============
create policy student_documents_owner on public.student_documents
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy student_documents_admin on public.student_documents
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy student_preferences_owner on public.student_preferences
  for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy student_preferences_admin on public.student_preferences
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy requirement_posts_owner on public.requirement_posts
  for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy requirement_posts_admin on public.requirement_posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy discount_requests_owner on public.discount_requests
  for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy discount_requests_admin on public.discount_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy saved_batches_owner on public.saved_batches
  for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy saved_batches_admin on public.saved_batches
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy batch_contacts_owner on public.batch_contacts
  for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy batch_contacts_admin on public.batch_contacts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============ Engagement & Content ============
-- reviews: public sees approved; author manages own; admin all.
create policy reviews_public_read on public.reviews
  for select to anon, authenticated
  using (status = 'approved' or author_id = auth.uid() or public.is_admin());
create policy reviews_author_write on public.reviews
  for all to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy reviews_admin_all on public.reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- blog_posts: public sees published; admin all.
create policy blog_posts_public_read on public.blog_posts
  for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy blog_posts_admin_all on public.blog_posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy blog_categories_public_read on public.blog_categories
  for select to anon, authenticated using (true);
create policy blog_categories_admin_all on public.blog_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy testimonials_public_read on public.testimonials
  for select to anon, authenticated using (true);
create policy testimonials_admin_all on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- newsletter_subscribers: anyone may subscribe (INSERT); only admin reads/manages.
create policy newsletter_public_insert on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);
create policy newsletter_admin_all on public.newsletter_subscribers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============ System & Admin (admin only, except reporter insert) ============
create policy media_admin_all on public.media
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy audit_logs_admin_read on public.audit_logs
  for select to authenticated using (public.is_admin());
create policy audit_logs_admin_insert on public.audit_logs
  for insert to authenticated with check (public.is_admin());

create policy reports_reporter_insert on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());
create policy reports_admin_all on public.reports
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- settings: public read (non-secret config: SEO defaults, homepage layout); admin write.
create policy settings_public_read on public.settings
  for select to anon, authenticated using (true);
create policy settings_admin_all on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============ Multi-tenant (admin all; member self-read) ============
create policy coaching_members_self_read on public.coaching_members
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());
create policy coaching_members_admin_all on public.coaching_members
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy member_branches_self_read on public.coaching_member_branches
  for select to authenticated using (
    public.is_admin()
    or exists (
      select 1 from public.coaching_members m
      where m.id = member_id and m.profile_id = auth.uid()
    )
  );
create policy member_branches_admin_all on public.coaching_member_branches
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy coaching_claims_owner on public.coaching_claims
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());
create policy coaching_claims_insert on public.coaching_claims
  for insert to authenticated with check (profile_id = auth.uid());
create policy coaching_claims_admin_all on public.coaching_claims
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
