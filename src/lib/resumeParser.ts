import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResumeData } from './supabase';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface ParsedResumeData {
  personalInfo: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    summary?: string;
  };
  experience: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    location?: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications?: string[];
  languages?: string[];
}

/**
 * Extract text from PDF file using PDF.js
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamically import PDF.js to reduce bundle size
    const pdfjsLib = await import('pdfjs-dist');
    
    // Use the locally bundled worker — avoids CDN version mismatch issues
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF. The file may be corrupted or image-based. Try uploading a different format.');
  }
}

/**
 * Extract text from Word document using Mammoth
 */
export async function extractTextFromWord(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error('Word extraction error:', error);
    throw new Error('Failed to extract text from Word document.');
  }
}

/**
 * Extract text from image using Gemini Vision API
 */
export async function extractTextFromImage(file: File): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
  let lastError: any;
  
  // Convert file to base64 once
  const base64 = await fileToBase64(file);
  
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent([
        'Extract all text from this resume image. Return only the text content, preserving the structure and layout as much as possible.',
        {
          inlineData: {
            mimeType: file.type,
            data: base64.split(',')[1],
          },
        },
      ]);
      
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      lastError = error;
      const errorStr = error.toString();
      
      // If rate limited, try next model
      if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('QUOTA_EXCEEDED')) {
        console.warn(`Rate limit on ${modelName}, trying next model...`);
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // All models failed with rate limits
  console.error('All models exhausted:', lastError);
  throw new Error('Failed to extract text from image - all AI models are rate limited. Please try again in a few minutes.');
}

/**
 * Extract text from plain text file
 */
export async function extractTextFromTxt(file: File): Promise<string> {
  return await file.text();
}

/**
 * Main extraction function - detects file type and extracts text
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await extractTextFromWord(file);
  } else if (fileType.startsWith('image/')) {
    return await extractTextFromImage(file);
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await extractTextFromTxt(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF, Word document, image, or text file.');
  }
}

/**
 * Parse extracted text using Gemini AI to create structured resume data
 */
export async function parseResumeWithAI(extractedText: string): Promise<ParsedResumeData> {
  if (!genAI) {
    throw new Error('Gemini API not configured. Please add your API key to continue.');
  }

  const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
  let lastError: any;

  const prompt = `You are a professional resume parser. Extract and structure the following resume text into a detailed JSON format.

RESUME TEXT:
${extractedText}

INSTRUCTIONS:
1. Extract all personal information (name, email, phone, location, LinkedIn, GitHub, website, professional summary)
2. Parse work experience with company name, position, dates, location, and detailed descriptions
3. Extract education with institution, degree, field of study, dates, and GPA if mentioned
4. List all technical and professional skills
5. Identify projects with name, description, technologies used, and links
6. Extract certifications and languages if present
7. For dates, use format: "MM/YYYY" or "Month YYYY"
8. Mark current positions with "current: true"
9. Be thorough and don't miss any details

Return ONLY valid JSON in this EXACT structure (no markdown, no code blocks, just JSON):
{
  "personalInfo": {
    "name": "string",
    "title": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string (URL)",
    "github": "string (URL)",
    "website": "string (URL)",
    "summary": "string (professional summary/objective)"
  },
  "experience": [
    {
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "current": boolean,
      "description": "string (detailed bullet points or paragraph)"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "location": "string",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "gpa": "string"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["tech1", "tech2"],
      "link": "string (URL)"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "languages": ["language1", "language2"]
}`;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text();

      // Clean up response - remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Parse the JSON
      const parsedData: ParsedResumeData = JSON.parse(jsonText);

      // Add unique IDs to array items
      if (parsedData.experience) {
        parsedData.experience = parsedData.experience.map((exp, idx) => ({
          ...exp,
          id: `exp_${Date.now()}_${idx}`,
        })) as any;
      }

      if (parsedData.education) {
        parsedData.education = parsedData.education.map((edu, idx) => ({
          ...edu,
          id: `edu_${Date.now()}_${idx}`,
        })) as any;
      }

      if (parsedData.projects) {
        parsedData.projects = parsedData.projects.map((proj, idx) => ({
          ...proj,
          id: `proj_${Date.now()}_${idx}`,
        })) as any;
      }

      return parsedData;
    } catch (error: any) {
      lastError = error;
      const errorStr = error.toString();
      
      // If rate limited, try next model
      if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('QUOTA_EXCEEDED')) {
        console.warn(`Rate limit on ${modelName}, trying next model...`);
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // All models failed with rate limits
  console.error('All models exhausted:', lastError);
  throw new Error('Failed to parse resume with AI - all models are rate limited. Please try again in a few minutes.');
}

/**
 * Convert ParsedResumeData to ResumeData format for the editor
 */
export function convertToResumeData(parsed: ParsedResumeData): ResumeData {
  return {
    personalInfo: {
      name: parsed.personalInfo.name || '',
      title: parsed.personalInfo.title || '',
      email: parsed.personalInfo.email || '',
      phone: parsed.personalInfo.phone || '',
      location: parsed.personalInfo.location || '',
      summary: parsed.personalInfo.summary || '',
    },
    experience: (parsed.experience || []).map((exp: any, idx) => ({
      id: exp.id || `exp_${Date.now()}_${idx}`,
      company: exp.company || '',
      position: exp.position || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      current: exp.current || false,
      description: exp.description || '',
    })),
    education: (parsed.education || []).map((edu: any, idx) => ({
      id: edu.id || `edu_${Date.now()}_${idx}`,
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      location: edu.location || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      gpa: edu.gpa || '',
    })),
    skills: (parsed.skills || []).filter(Boolean),
    projects: (parsed.projects || []).map((proj: any, idx) => ({
      id: proj.id || `proj_${Date.now()}_${idx}`,
      name: proj.name || '',
      description: proj.description || '',
      technologies: (proj.technologies || []).filter(Boolean),
      link: proj.link || '',
    })),
  };
}

/**
 * Helper function to convert File to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate if Gemini is configured
 */
export function isParserConfigured(): boolean {
  return !!genAI;
}
