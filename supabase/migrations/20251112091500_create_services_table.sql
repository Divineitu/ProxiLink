-- Migration: create services table for Sprint 3 (basic scaffold)
-- Creates a services table linked to vendor_profiles

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendor_profiles(id) on delete cascade,
  title text not null,
  description text,
  category text,
  price numeric,
  created_at timestamptz default now()
);

-- Indexes for proximity and quick category lookups (if using PostGIS later these can be upgraded)
create index if not exists idx_services_vendor_id on services(vendor_id);
create index if not exists idx_services_category on services(category);
