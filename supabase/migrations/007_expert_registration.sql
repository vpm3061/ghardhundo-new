-- Migration 007: Expert registration profile fields
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/angokuzvthqzezdnpptf/sql
-- Safe to re-run (IF NOT EXISTS guards throughout).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_years TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS property_specialization TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rera_number TEXT;
