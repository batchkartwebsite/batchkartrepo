-- Full-text search
create index batches_search_vector_idx on public.batches using gin (search_vector);

-- Foreign-key btrees (write-path + join performance)
create index cities_state_id_idx on public.cities (state_id);
create index exam_categories_parent_id_idx on public.exam_categories (parent_id);
create index coaching_branches_coaching_id_idx on public.coaching_branches (coaching_id);
create index coaching_branches_city_id_idx on public.coaching_branches (city_id);
create index coaching_faculty_coaching_id_idx on public.coaching_faculty (coaching_id);
create index batches_coaching_id_idx on public.batches (coaching_id);
create index batches_branch_id_idx on public.batches (branch_id);
create index batches_exam_id_idx on public.batches (exam_id);
create index discounts_coaching_id_idx on public.discounts (coaching_id);
create index discounts_batch_id_idx on public.discounts (batch_id);
create index faqs_parent_idx on public.faqs (parent_type, parent_id);
create index student_preferences_profile_id_idx on public.student_preferences (profile_id);
create index requirement_posts_student_id_idx on public.requirement_posts (student_id);
create index requirement_posts_exam_id_idx on public.requirement_posts (exam_id);
create index requirement_posts_city_id_idx on public.requirement_posts (city_id);
create index discount_requests_student_id_idx on public.discount_requests (student_id);
create index discount_requests_batch_id_idx on public.discount_requests (batch_id);
create index saved_batches_student_id_idx on public.saved_batches (student_id);
create index batch_contacts_student_id_idx on public.batch_contacts (student_id);
create index student_documents_owner_id_idx on public.student_documents (owner_id);
create index reviews_coaching_id_idx on public.reviews (coaching_id);
create index reviews_author_id_idx on public.reviews (author_id);
create index blog_posts_category_id_idx on public.blog_posts (category_id);
create index notifications_user_id_idx on public.notifications (user_id);
create index audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index reports_entity_idx on public.reports (entity_type, entity_id);
create index coaching_members_coaching_id_idx on public.coaching_members (coaching_id);
create index coaching_members_profile_id_idx on public.coaching_members (profile_id);
create index coaching_member_branches_member_id_idx on public.coaching_member_branches (member_id);
create index coaching_member_branches_branch_id_idx on public.coaching_member_branches (branch_id);
create index coaching_claims_coaching_id_idx on public.coaching_claims (coaching_id);
create index coaching_claims_profile_id_idx on public.coaching_claims (profile_id);

-- Moderation / status filters (admin list views + public catalog)
create index coaching_institutes_moderation_idx on public.coaching_institutes (moderation_status);
create index batches_moderation_idx on public.batches (moderation_status);
create index batches_status_idx on public.batches (status);
create index requirement_posts_status_idx on public.requirement_posts (status);
create index requirement_posts_start_date_idx on public.requirement_posts (study_start_date);
create index discount_requests_status_idx on public.discount_requests (status);
create index reviews_status_idx on public.reviews (status);
create index blog_posts_status_idx on public.blog_posts (status);
create index batches_start_date_idx on public.batches (start_date);

-- Trigram indexes for autocomplete
create index coaching_institutes_name_trgm_idx on public.coaching_institutes using gin (name gin_trgm_ops);
create index batches_name_trgm_idx on public.batches using gin (name gin_trgm_ops);
create index cities_name_trgm_idx on public.cities using gin (name gin_trgm_ops);
