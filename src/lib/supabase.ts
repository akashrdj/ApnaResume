import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  data: ResumeData;
  created_at: string;
  updated_at: string;
}

export interface ResumeData {
  personalInfo?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    title: string;
  };
  experience?: WorkExperience[];
  education?: Education[];
  skills?: string[];
  projects?: Project[];
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}
