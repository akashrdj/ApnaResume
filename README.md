<div align="center">

# 📄 ApnaResume
### AI-Powered Resume Builder

[![Live Demo](https://img.shields.io/badge/Live%20Demo-apna--resume--seven.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://apna-resume-seven.vercel.app)
[![Built with Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

**Build professional, job-winning resumes in minutes using the power of AI.**

</div>

---

## 🌐 Live App

👉 **[https://apna-resume-seven.vercel.app](https://apna-resume-seven.vercel.app)**

---

## ✅ Deliverables

| # | Feature | Status |
|---|---------|--------|
| 1 | User Authentication (Sign Up / Sign In / Sign Out) | ✅ Done |
| 2 | Create, Edit & Delete Resumes | ✅ Done |
| 3 | Multiple Professional Resume Templates | ✅ Done |
| 4 | AI-Powered Resume Parsing (PDF / Word / Image upload) | ✅ Done |
| 5 | AI Chat Assistant for content suggestions per section | ✅ Done |
| 6 | AI Resume Scanner with ATS score & improvement tips | ✅ Done |
| 7 | Rich Text Editing with formatting toolbar | ✅ Done |
| 8 | Drag & Drop section reordering | ✅ Done |
| 9 | PDF Export with proper A4 pagination | ✅ Done |
| 10 | Responsive UI with modern design | ✅ Done |
| 11 | Deployed on Vercel with custom environment config | ✅ Done |

---

## 🚀 Features

### 🤖 AI Resume Parsing
Upload your existing resume (PDF, Word `.docx`, or image) and the app uses **Google Gemini AI** to automatically extract and populate:
- Personal info, contact details
- Work experience, education, skills
- Projects, certifications, custom sections

### 💬 AI Chat Assistant
Every resume section has a built-in AI chat panel powered by Gemini. Get real-time suggestions to improve bullet points, rephrase achievements, and tailor content for specific job roles.

### 🔍 AI Resume Scanner
Scan your resume against a job description to get:
- ATS compatibility score
- Missing keywords
- Section-wise improvement tips

### 📑 Resume Templates
6 professionally designed templates:
- **Modern** — Clean two-column layout
- **Classic** — Traditional single-column
- **Creative** — Bold header with accent colors
- **Minimal** — Clean whitespace-focused design
- **Executive** — Formal enterprise style
- **Tech** — Developer-focused layout

### 📄 A4 PDF Export
One-click PDF download with proper A4 page sizing, correct margins, and automatic page breaks — no content clipping.

### 🔒 Authentication
Secure email/password authentication via Supabase. Each user's resumes are stored privately in the cloud.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + custom CSS animations |
| AI | Google Gemini 1.5 Flash API |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth) |
| PDF Parsing | pdfjs-dist v4 |
| Word Parsing | Mammoth.js |
| Drag & Drop | @dnd-kit |
| Deployment | Vercel |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API key](https://makersuite.google.com/app/apikey)

### 1. Clone the repo
```bash
git clone https://github.com/akashrdj/ApnaResume.git
cd ApnaResume
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the dev server
```bash
npm run dev
```

App will be available at `http://localhost:5173`

---

## 🗄️ Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL from `IMPLEMENTATION_GUIDE.md` to create the `resumes` table
3. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: your deployed URL (e.g. `https://apna-resume-seven.vercel.app`)
   - **Redirect URLs**: `https://apna-resume-seven.vercel.app/**`

---

## 📦 Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder.

---

## 🚢 Deployment (Vercel)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add the 3 environment variables in Vercel's project settings
4. Click Deploy — Vercel auto-detects Vite

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AIChatPanel.tsx       # AI chat + resume scanner
│   ├── Dashboard.tsx         # Main resume list + routing
│   ├── ResumeEditor.tsx      # 3-panel editor (form + AI + preview)
│   ├── ResumeTemplates.tsx   # All 6 template renderers
│   ├── ResumePreview.tsx     # A4 live preview
│   ├── ResumeUploader.tsx    # File upload + AI parsing
│   ├── PricingPage.tsx       # Pricing UI
│   └── RichTextEditor.tsx    # Rich text input
├── lib/
│   ├── gemini.ts             # Gemini AI client
│   ├── resumeParser.ts       # PDF/Word/Image → ResumeData
│   └── supabase.ts           # Supabase client
├── hooks/
│   └── useAIAssistant.ts     # AI chat logic
└── types/
    └── editor.ts             # TypeScript interfaces
```

---

<div align="center">

Made with ❤️ · Powered by Gemini AI + Supabase

</div>

