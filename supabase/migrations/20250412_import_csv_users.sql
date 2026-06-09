-- Import users from CSV with hashed passwords
-- These users have bcrypt password hashes that need to be preserved

-- Insert users into auth.users with their existing password hashes
-- Using only essential columns that exist in Supabase auth schema
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  is_sso_user
) VALUES (
  '0b1db34b-506e-4a4e-9c0b-9417920c70e1',
  'tsivtsivadze23@gmail.com',
  '$2a$10$rOKCbcukx0fBdWr3COj9QOdOIwfnY8fqaCvIs.troy1wuHhxzhu1.',
  '2026-04-01 15:19:11+00',
  '{"full_name": "დავით წივწივაძე"}'::jsonb,
  '2026-04-01 15:19:11+00',
  '2026-04-01 15:19:11+00',
  'authenticated',
  false
), (
  '9ae70fa0-cc23-4d54-881f-af328844f10b',
  'shengeliagiorgi2023@gmail.com',
  '$2a$10$ca9OaOXRYYoFA1o0T0uCXuvSUPVXjehR9KJx.cIkiD1qYPquguuKy',
  '2026-04-11 11:49:17+00',
  '{"full_name": "გიორგი შენგელია"}'::jsonb,
  '2026-04-11 11:49:17+00',
  '2026-04-11 11:49:17+00',
  'authenticated',
  false
), (
  '6fc312a3-10ae-4da2-b4d3-c8bac2314993',
  'ecseminari@gmail.com',
  '$2a$10$WhhRks0vwDiLtiUJgtyu9uCq7mF3DlzgFeDkyO9IdZ9pqHh4aV4zy',
  '2026-04-11 16:35:40+00',
  '{"full_name": "ირაკლი მარგველაშვილი"}'::jsonb,
  '2026-04-11 16:35:40+00',
  '2026-04-11 16:35:40+00',
  'authenticated',
  false
), (
  '9be5a950-2718-4cff-bd1b-fc6e401c8202',
  'maria.kh.2073@gmail.com',
  '$2a$10$GlmBO97a9KhwJ.2sT7LZHOOmkMRGidqxAYXXHeLsLBbOHHBfmkjxW',
  '2026-04-11 17:12:51+00',
  '{"full_name": "მარიამი ხმალაძე"}'::jsonb,
  '2026-04-11 17:12:51+00',
  '2026-04-11 17:12:51+00',
  'authenticated',
  false
);

-- Create profiles for these users (skip if already exist)
INSERT INTO profiles (user_id, email, full_name, created_at)
VALUES 
  ('0b1db34b-506e-4a4e-9c0b-9417920c70e1', 'tsivtsivadze23@gmail.com', 'დავით წივწივაძე', '2026-04-01 15:19:11+00'),
  ('9ae70fa0-cc23-4d54-881f-af328844f10b', 'shengeliagiorgi2023@gmail.com', 'გიორგი შენგელია', '2026-04-11 11:49:17+00'),
  ('6fc312a3-10ae-4da2-b4d3-c8bac2314993', 'ecseminari@gmail.com', 'ირაკლი მარგველაშვილი', '2026-04-11 16:35:40+00'),
  ('9be5a950-2718-4cff-bd1b-fc6e401c8202', 'maria.kh.2073@gmail.com', 'მარიამი ხმალაძე', '2026-04-11 17:12:51+00')
ON CONFLICT (user_id) DO NOTHING;

-- Create user roles (skip if already exist)
INSERT INTO user_roles (user_id, role)
VALUES 
  ('0b1db34b-506e-4a4e-9c0b-9417920c70e1', 'user'),
  ('9ae70fa0-cc23-4d54-881f-af328844f10b', 'user'),
  ('6fc312a3-10ae-4da2-b4d3-c8bac2314993', 'user'),
  ('9be5a950-2718-4cff-bd1b-fc6e401c8202', 'user')
ON CONFLICT (user_id) DO NOTHING;

-- Log the import
SELECT 'Imported 4 users from CSV' as result;
