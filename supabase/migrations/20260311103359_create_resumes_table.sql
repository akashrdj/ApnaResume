/*
  # Create Resumes Table

  ## Overview
  This migration creates the core database structure for the resume builder application.

  ## New Tables
  
  ### `resumes`
  - `id` (uuid, primary key) - Unique identifier for each resume
  - `user_id` (uuid, foreign key) - References auth.users, the owner of the resume
  - `title` (text) - User-defined title for the resume (e.g., "Software Engineer Resume")
  - `template_id` (text) - Identifier for which template design to use
  - `data` (jsonb) - Flexible JSON structure storing all resume content:
    - Personal info (name, email, phone, location, summary)
    - Work experience entries
    - Education entries
    - Skills
    - Projects
    - Certifications
  - `created_at` (timestamptz) - When the resume was created
  - `updated_at` (timestamptz) - Last modification timestamp

  ## Security
  - Enable Row Level Security on `resumes` table
  - Users can SELECT their own resumes
  - Users can INSERT their own resumes
  - Users can UPDATE their own resumes
  - Users can DELETE their own resumes

  ## Notes
  - Using JSONB for flexibility across different template structures
  - Timestamps track creation and modification history
  - RLS ensures users can only access their own resumes
*/

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Resume',
  template_id text NOT NULL DEFAULT 'modern',
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own resumes"
  ON resumes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON resumes(updated_at DESC);