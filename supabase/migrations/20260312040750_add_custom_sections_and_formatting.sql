/*
  # Add Custom Sections and Formatting Support

  1. Changes
    - Add `section_order` column to store the order of sections (array of section identifiers)
    - Add `custom_sections` column to store user-defined sections with formatting
    - Add `formatting_options` column for global formatting preferences
  
  2. Details
    - `section_order`: Array of strings representing section order (e.g., ['personal', 'experience', 'education', 'skills', 'projects', 'custom_1'])
    - `custom_sections`: JSONB array containing custom sections with rich formatting
    - `formatting_options`: JSONB object for font family, default sizes, colors, etc.
  
  3. Notes
    - Custom sections will support rich text formatting (bold, italic, underline, font size, color)
    - Section ordering will allow drag-and-drop reordering of all sections
    - Backward compatible with existing resumes (section_order defaults to standard order)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resumes' AND column_name = 'section_order'
  ) THEN
    ALTER TABLE resumes ADD COLUMN section_order text[] DEFAULT ARRAY['personal', 'experience', 'education', 'skills', 'projects'];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resumes' AND column_name = 'custom_sections'
  ) THEN
    ALTER TABLE resumes ADD COLUMN custom_sections jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resumes' AND column_name = 'formatting_options'
  ) THEN
    ALTER TABLE resumes ADD COLUMN formatting_options jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;