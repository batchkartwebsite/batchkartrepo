-- Identity
create type public.user_role as enum ('student', 'coaching_admin', 'admin');
create type public.notification_type as enum (
  'welcome', 'requirement_submitted', 'requirement_updated',
  'discount_approved', 'discount_rejected', 'batch_recommendation',
  'review_status', 'admin', 'system'
);

-- Moderation / claiming (shared across catalog)
create type public.moderation_status as enum ('draft', 'pending', 'published', 'rejected');
create type public.claim_status as enum ('unclaimed', 'pending', 'claimed');

-- Batches
create type public.batch_mode as enum ('online', 'offline', 'hybrid');
create type public.batch_language as enum ('english', 'hindi', 'hinglish', 'regional');
create type public.fee_type as enum ('one_time', 'emi');
create type public.batch_status as enum ('active', 'inactive', 'archived');

-- Marketplace
create type public.requirement_status as enum ('active', 'paused', 'archived', 'deleted');
create type public.discount_request_status as enum ('pending', 'approved', 'rejected');
create type public.discount_reason as enum (
  'financial_need', 'merit', 'first_generation', 'sibling', 'switching', 'other'
);
create type public.batch_contact_status as enum ('contacted', 'applied');

-- Content / engagement
create type public.review_status as enum ('pending', 'approved', 'rejected');
create type public.blog_status as enum ('draft', 'published');
create type public.newsletter_status as enum ('subscribed', 'unsubscribed');

-- FAQ + reports + settings + multi-tenant
create type public.faq_parent_type as enum ('coaching', 'batch');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type public.settings_group as enum ('seo', 'homepage', 'general');
create type public.member_role as enum ('owner', 'manager', 'editor');
create type public.member_status as enum ('invited', 'active', 'suspended');
