import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Resume, ResumeData } from '../lib/supabase';
import { Plus, FileText, Trash2, LogOut, Loader2, CreditCard as Edit, Eye, X, Lock, Crown, Zap, ArrowRight, Check, Sparkles } from 'lucide-react';
import ResumeEditor from './ResumeEditor';
import ResumePreview from './ResumePreview';
import PricingPage from './PricingPage';
import { ResumeUploader } from './ResumeUploader';
import { GeminiAPITester } from './GeminiAPITester';

// ---------- Sample data to render inside template preview modal ----------
const SAMPLE_PREVIEW_DATA: ResumeData = {
  personalInfo: {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Senior Software Engineer',
    summary: 'Passionate software engineer with 5+ years of experience building scalable web applications and leading high-performance teams.',
  },
  experience: [
    {
      id: '1',
      position: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Jan 2022',
      endDate: '',
      current: true,
      description: '• Led development of microservices architecture serving 2M+ users\n• Reduced API response time by 40% through Redis caching\n• Mentored 4 junior engineers and conducted code reviews',
    },
    {
      id: '2',
      position: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      startDate: 'Jun 2019',
      endDate: 'Dec 2021',
      current: false,
      description: '• Built React dashboard that reduced customer support tickets by 30%\n• Integrated third-party payment APIs processing $500K/month',
    },
  ],
  education: [
    {
      id: '1',
      degree: 'B.S.',
      field: 'Computer Science',
      institution: 'State University',
      location: 'California',
      startDate: '2015',
      endDate: '2019',
      gpa: '3.8',
    },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'GraphQL'],
  projects: [
    {
      id: '1',
      name: 'Open Source Analytics Dashboard',
      description: 'Real-time analytics platform with 500+ GitHub stars and 10K monthly active users.',
      technologies: ['React', 'D3.js', 'WebSockets', 'Node.js'],
      link: 'github.com/alex/dashboard',
    },
  ],
};

type TemplateItem = {
  id: string;
  name: string;
  description: string;
  gradient: string;
  preview: { name: string; title: string };
  isPro?: boolean;
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState<ResumeData | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [parseOverlay, setParseOverlay] = useState<{
    phase: 'hidden' | 'loading' | 'done';
    data: ResumeData | null;
    animate: boolean;
  }>({ phase: 'hidden', data: null, animate: false });

  const openPreview = (template: TemplateItem) => {
    setPreviewTemplate(template);
    // Tiny delay so the DOM mounts before we trigger the transition
    requestAnimationFrame(() => requestAnimationFrame(() => setPreviewVisible(true)));
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setTimeout(() => setPreviewTemplate(null), 320);
  };

  const handleUseTemplate = (templateId: string) => {
    closePreview();
    setTimeout(() => createResume(templateId), 320);
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createResume = async (templateId: string) => {
    try {
      const resumeData = parsedResumeData || {
        personalInfo: {
          name: '',
          email: user?.email || '',
          phone: '',
          location: '',
          summary: '',
          title: ''
        },
        experience: [],
        education: [],
        skills: [],
        projects: []
      };

      const { data, error } = await supabase
        .from('resumes')
        .insert([
          {
            user_id: user?.id,
            title: parsedResumeData ? (parsedResumeData.personalInfo.name || 'Imported Resume') : 'Untitled Resume',
            template_id: templateId,
            data: resumeData,
            section_order: ['personal', 'experience', 'education', 'skills', 'projects'],
            custom_sections: [],
            formatting_options: {}
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setResumes([data, ...resumes]);
      setSelectedResume(data);
      setShowTemplates(false);
      setParsedResumeData(null); // Reset parsed data after use
    } catch (error) {
      console.error('Error creating resume:', error);
    }
  };

  const deleteResume = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setResumes(resumes.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  const confirmDelete = (resume: Resume) => {
    setDeleteConfirm({ id: resume.id, title: resume.title });
  };

  const handleConfirmedDelete = async () => {
    if (!deleteConfirm) return;
    await deleteResume(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const handleResumeDataExtracted = (data: ResumeData) => {
    setParsedResumeData(data);
    setShowTemplates(true);
  };

  const handleParsingStart = () => {
    setParseOverlay({ phase: 'loading', data: null, animate: false });
    requestAnimationFrame(() => requestAnimationFrame(() =>
      setParseOverlay(prev => ({ ...prev, animate: true }))
    ));
  };

  const handleParsingDone = (data: ResumeData) => {
    setParseOverlay(prev => ({ ...prev, phase: 'done', data }));
  };

  const handleOverlayCreateResume = () => {
    if (parseOverlay.data) {
      const data = parseOverlay.data;
      setParseOverlay({ phase: 'hidden', data: null, animate: false });
      setParsedResumeData(data);
      setShowTemplates(true);
    }
  };

  const handleOverlayClose = () => {
    setParseOverlay({ phase: 'hidden', data: null, animate: false });
  };

  if (showPricing) {
    return (
      <PricingPage
        onBack={() => setShowPricing(false)}
      />
    );
  }

  if (selectedResume) {
    return (
      <ResumeEditor
        resume={selectedResume}
        onBack={() => {
          setSelectedResume(null);
          loadResumes();
        }}
        onUpgrade={() => setShowPricing(true)}
      />
    );
  }

  if (showTemplates) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="w-full px-4 lg:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setShowTemplates(false); setParsedResumeData(null); }}
                className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5 text-sm font-medium transition"
              >
                ← Back
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Choose a Template</h2>
                <p className="text-xs text-gray-500">
                  {parsedResumeData ? '✨ Select a template for your imported data' : 'Click any template to preview, then use it'}
                </p>
              </div>
            </div>
            {/* Upgrade button */}
            <button
              onClick={() => setShowPricing(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-md hover:from-amber-500 hover:to-orange-600 transition-all hover:shadow-lg"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </button>
          </div>
        </div>

        <div className="w-full px-4 lg:px-6 py-10">
          {parsedResumeData && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 font-medium text-sm">✓ Resume data imported! Select a template to create your resume.</p>
            </div>
          )}

          {/* Free templates */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Free Templates</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.filter(t => !t.isPro).map((template) => (
                <div
                  key={template.id}
                  onClick={() => openPreview(template)}
                  className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group border border-gray-100 hover:border-blue-200"
                >
                  <div className="h-52 relative flex items-center justify-center p-6" style={{ background: template.gradient }}>
                    <div className="bg-white rounded-lg shadow-lg p-5 w-full h-full flex flex-col">
                      <div className="text-lg font-bold mb-1">{template.preview.name}</div>
                      <div className="text-xs text-gray-500 mb-3">{template.preview.title}</div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-1.5 bg-gray-100 rounded w-2/3"></div>
                        <div className="h-1.5 bg-gray-100 rounded w-4/5"></div>
                      </div>
                    </div>
                    {/* Hover eye icon */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center rounded-t-2xl">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-gray-800 shadow-lg">
                        <Eye className="w-4 h-4" /> Preview
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-gray-500 text-sm">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro templates */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pro Templates</p>
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 px-3 py-1 rounded-full">
                <Crown className="w-3 h-3 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">Unlock with Pro</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.filter(t => t.isPro).map((template) => (
                <div
                  key={template.id}
                  onClick={() => openPreview(template)}
                  className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group border border-amber-100 hover:border-amber-300 relative"
                >
                  {/* Pro badge */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                    <Crown className="w-3 h-3" /> PRO
                  </div>
                  <div className="h-52 relative flex items-center justify-center p-6" style={{ background: template.gradient }}>
                    <div className="bg-white rounded-lg shadow-lg p-5 w-full h-full flex flex-col">
                      <div className="text-lg font-bold mb-1">{template.preview.name}</div>
                      <div className="text-xs text-gray-500 mb-3">{template.preview.title}</div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-1.5 bg-gray-100 rounded w-2/3"></div>
                        <div className="h-1.5 bg-gray-100 rounded w-4/5"></div>
                      </div>
                    </div>
                    {/* Lock overlay */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center rounded-t-2xl">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-amber-700 shadow-lg">
                        <Eye className="w-4 h-4" /> Preview
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{template.name}</h3>
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <p className="text-gray-500 text-sm">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Template Preview Modal ── */}
        {previewTemplate && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${previewVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}
            onClick={closePreview}
          >
            <div
              className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${previewVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'}`}
              style={{ width: '780px', maxWidth: '95vw', maxHeight: '92vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${previewTemplate.isPro ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-900">{previewTemplate.name}</h3>
                      {previewTemplate.isPro && (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          <Crown className="w-2.5 h-2.5" /> PRO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{previewTemplate.description}</p>
                  </div>
                </div>
                <button onClick={closePreview} className="p-2 hover:bg-gray-100 rounded-xl transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Template preview area */}
              <div className="flex-1 overflow-auto bg-gray-100 relative" style={{ minHeight: 0 }}>
                <div style={{ zoom: '0.52', transformOrigin: 'top center', padding: '20px' }}>
                  <ResumePreview
                    data={SAMPLE_PREVIEW_DATA}
                    templateId={previewTemplate.id}
                    customSections={[]}
                    sectionOrder={['personal', 'experience', 'education', 'skills', 'projects']}
                  />
                </div>
                {/* Pro lock gradient overlay */}
                {previewTemplate.isPro && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-white/95 pointer-events-none" />
                )}
              </div>

              {/* Modal footer */}
              <div className={`px-6 py-4 border-t ${previewTemplate.isPro ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gray-50'}`}>
                {previewTemplate.isPro ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">🔒 Pro Template</p>
                      <p className="text-xs text-gray-500">Upgrade your plan to unlock this and all other Pro templates.</p>
                    </div>
                    <button
                      onClick={closePreview}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { closePreview(); setTimeout(() => setShowPricing(true), 320); }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl hover:from-amber-500 hover:to-orange-600 transition shadow-md hover:shadow-lg text-sm"
                    >
                      <Zap className="w-4 h-4" />
                      Upgrade to Pro
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">This is a preview with sample data. Your resume will use your own content.</p>
                    </div>
                    <button
                      onClick={closePreview}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleUseTemplate(previewTemplate.id)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-md hover:shadow-lg text-sm"
                    >
                      Use This Template
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="w-full px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Resume Builder
                </h1>
                <p className="text-xs text-gray-600">Professional resumes in minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Upgrade to Pro button */}
              <button
                onClick={() => setShowPricing(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-md hover:from-amber-500 hover:to-orange-600 transition-all hover:shadow-lg"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 lg:px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'} 👋
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Ready to build your next great resume?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Existing Resumes (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                📄 My Resumes
                {resumes.length > 0 && (
                  <span className="text-lg font-normal text-gray-500">({resumes.length})</span>
                )}
              </h2>
              <p className="text-gray-600">Create and manage your professional resumes</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 bg-white/50 rounded-2xl">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-3" />
                  <p className="text-gray-600">Loading your resumes...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <button
                  onClick={() => setShowTemplates(true)}
                  className="bg-white border-2 border-dashed border-purple-300 rounded-2xl p-10 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-200 flex flex-col items-center justify-center group shadow-sm hover:shadow-lg"
                >
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 p-5 rounded-2xl mb-4 transition">
                    <Plus className="w-10 h-10 text-purple-600" />
                  </div>
                  <span className="text-lg font-bold text-gray-700 group-hover:text-purple-600 transition">
                    Create New Resume
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Choose from 6 templates</span>
                </button>

                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-200 hover:border-purple-300"
                  >
                    <div className="h-44 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:scale-110 transition-transform duration-500"></div>
                      <FileText className="w-20 h-20 text-white opacity-80 relative z-10 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-purple-600 transition">
                        {resume.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Updated {new Date(resume.updated_at).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedResume(resume)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => confirmDelete(resume)}
                          className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 transition border border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Section - Resume Uploader (1/3 width) */}
          <div className="lg:col-span-1">
            <ResumeUploader
              onResumeDataExtracted={handleResumeDataExtracted}
              onParsingStart={handleParsingStart}
              onParsingDone={handleParsingDone}
            />
          </div>
        </div>
      </div>

      {/* Floating API Tester */}
      <GeminiAPITester />

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{ animation: 'fadeSlideIn 0.22s ease-out forwards' }}
          >
            {/* Red top bar */}
            <div className="h-1.5 bg-gradient-to-r from-red-400 via-rose-500 to-red-500" />

            <div className="px-7 py-6">
              {/* Icon */}
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 border border-red-100 mx-auto mb-5">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>

              {/* Text */}
              <h3 className="text-center text-lg font-bold text-gray-900 mb-1">Delete Resume?</h3>
              <p className="text-center text-sm text-gray-500 mb-1">
                <span className="font-semibold text-gray-700">&ldquo;{deleteConfirm.title}&rdquo;</span>
              </p>
              <p className="text-center text-sm text-gray-400">This action cannot be undone.</p>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmedDelete}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm hover:from-red-600 hover:to-rose-700 transition shadow-md hover:shadow-lg"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Full-Page Parse Overlay ── */}
      {parseOverlay.phase !== 'hidden' && (
        <div
          className="fixed inset-0 z-[60] flex flex-col"
          style={{
            background: 'linear-gradient(160deg, #f0f4ff 0%, #faf5ff 50%, #fff8f0 100%)',
            transform: parseOverlay.animate ? 'translateY(0%)' : 'translateY(100%)',
            transition: 'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Overlay top bar */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl shadow-md ${
                parseOverlay.phase === 'loading'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                  : 'bg-gradient-to-br from-green-500 to-blue-600'
              }`}>
                {parseOverlay.phase === 'loading' ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Check className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {parseOverlay.phase === 'loading' ? '✨ Analyzing your resume...' : '🎉 Resume Parsed Successfully!'}
                </h2>
                <p className="text-xs text-gray-500">
                  {parseOverlay.phase === 'loading'
                    ? 'AI is extracting and structuring your data'
                    : 'Review your data below, then choose a template'}
                </p>
              </div>
            </div>
            <button
              onClick={handleOverlayClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">

              {/* ── Loading skeleton ── */}
              {parseOverlay.phase === 'loading' && (
                <div
                  className="space-y-5"
                  style={{ opacity: 1, transition: 'opacity 0.4s' }}
                >
                  {/* Parsing progress indicator */}
                  <div className="bg-white/80 rounded-2xl p-6 shadow-md border border-purple-100 flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                      <Loader2 className="w-14 h-14 text-purple-600 animate-spin relative z-10" />
                    </div>
                    <p className="text-gray-700 font-semibold text-base">AI is reading every line of your resume...</p>
                    <div className="flex gap-3 flex-wrap justify-center">
                      {['📝 Personal Info', '💼 Experience', '🎓 Education', '⚡ Skills', '🚀 Projects'].map((label, i) => (
                        <span
                          key={label}
                          className="px-3 py-1.5 rounded-full text-xs font-medium animate-pulse"
                          style={{
                            animationDelay: `${i * 0.15}s`,
                            background: ['#dbeafe','#ede9fe','#dcfce7','#fce7f3','#e0e7ff'][i],
                            color: ['#1d4ed8','#7c3aed','#15803d','#be185d','#4338ca'][i],
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Skeleton cards */}
                  {[1,2,3,4].map(n => (
                    <div key={n} className="bg-white/70 rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-1/4 mb-5"></div>
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                        <div className="h-3 bg-gray-100 rounded-full w-5/6"></div>
                        <div className="h-3 bg-gray-100 rounded-full w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Parsed data display ── */}
              {parseOverlay.phase === 'done' && parseOverlay.data && (
                <div
                  className="space-y-5"
                  style={{
                    animation: 'fadeSlideIn 0.6s ease-out forwards',
                  }}
                >
                  {/* Personal Info card */}
                  <div className="bg-white rounded-2xl shadow-md border border-purple-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-purple-100">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">📝 <span>Personal Information</span></h3>
                    </div>
                    <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      {parseOverlay.data.personalInfo.name && (
                        <p><span className="font-semibold text-gray-600">Name: </span><span className="text-gray-800">{parseOverlay.data.personalInfo.name}</span></p>
                      )}
                      {parseOverlay.data.personalInfo.title && (
                        <p><span className="font-semibold text-gray-600">Title: </span><span className="text-gray-800">{parseOverlay.data.personalInfo.title}</span></p>
                      )}
                      {parseOverlay.data.personalInfo.email && (
                        <p><span className="font-semibold text-gray-600">Email: </span><span className="text-gray-800">{parseOverlay.data.personalInfo.email}</span></p>
                      )}
                      {parseOverlay.data.personalInfo.phone && (
                        <p><span className="font-semibold text-gray-600">Phone: </span><span className="text-gray-800">{parseOverlay.data.personalInfo.phone}</span></p>
                      )}
                      {parseOverlay.data.personalInfo.location && (
                        <p><span className="font-semibold text-gray-600">Location: </span><span className="text-gray-800">{parseOverlay.data.personalInfo.location}</span></p>
                      )}
                      {parseOverlay.data.personalInfo.summary && (
                        <p className="sm:col-span-2 mt-1"><span className="font-semibold text-gray-600">Summary: </span><span className="text-gray-700">{parseOverlay.data.personalInfo.summary}</span></p>
                      )}
                    </div>
                  </div>

                  {/* Experience */}
                  {parseOverlay.data.experience.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">💼 <span>Experience ({parseOverlay.data.experience.length})</span></h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {parseOverlay.data.experience.map((exp, i) => (
                          <div key={i} className="px-6 py-4">
                            <p className="font-bold text-gray-800">{exp.position}</p>
                            <p className="text-sm text-blue-600 font-medium">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                            <p className="text-xs text-gray-500 mt-1">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</p>
                            {exp.description && (
                              <p className="text-sm text-gray-600 mt-2 whitespace-pre-line line-clamp-3">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {parseOverlay.data.education.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md border border-green-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">🎓 <span>Education ({parseOverlay.data.education.length})</span></h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {parseOverlay.data.education.map((edu, i) => (
                          <div key={i} className="px-6 py-4">
                            <p className="font-bold text-gray-800">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                            <p className="text-sm text-green-600 font-medium">{edu.institution}</p>
                            <p className="text-xs text-gray-500 mt-1">{edu.startDate} – {edu.endDate}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {parseOverlay.data.skills.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md border border-pink-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-pink-100">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">⚡ <span>Skills ({parseOverlay.data.skills.length})</span></h3>
                      </div>
                      <div className="px-6 py-4 flex flex-wrap gap-2">
                        {parseOverlay.data.skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {parseOverlay.data.projects.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md border border-indigo-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-4 border-b border-indigo-100">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">🚀 <span>Projects ({parseOverlay.data.projects.length})</span></h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {parseOverlay.data.projects.map((proj, i) => (
                          <div key={i} className="px-6 py-4">
                            <p className="font-bold text-gray-800">{proj.name}</p>
                            {proj.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{proj.description}</p>}
                            {proj.technologies && proj.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {proj.technologies.map((tech, ti) => (
                                  <span key={ti} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">{tech}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom spacer so CTA doesn't overlap last card */}
                  <div className="h-6"></div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky bottom CTA bar */}
          <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-t border-purple-100 px-6 py-4 flex items-center justify-between gap-4 shadow-lg">
            <button
              onClick={handleOverlayClose}
              className="text-sm text-gray-500 hover:text-gray-800 font-medium transition px-4 py-2 rounded-xl hover:bg-gray-100"
            >
              ← Go Back
            </button>
            <button
              disabled={parseOverlay.phase !== 'done'}
              onClick={handleOverlayCreateResume}
              className={`flex items-center gap-2.5 px-7 py-3 rounded-2xl font-bold text-base shadow-lg transition-all ${
                parseOverlay.phase === 'done'
                  ? 'bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 text-white hover:from-green-600 hover:via-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {parseOverlay.phase !== 'done' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
              ) : (
                <><Check className="w-5 h-5" /> Create Resume with This Data <Sparkles className="w-4 h-4 animate-pulse" /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const templates: TemplateItem[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean and contemporary design perfect for tech and creative roles',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: { name: 'John Doe', title: 'Software Engineer' }
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional layout suitable for corporate and formal positions',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    preview: { name: 'Jane Smith', title: 'Marketing Manager' }
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Simple and elegant design that highlights your content',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    preview: { name: 'Alex Johnson', title: 'Product Designer' }
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Eye-catching design for creative professionals',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    preview: { name: 'Sam Williams', title: 'Creative Director' },
    isPro: true,
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Sophisticated design for senior-level positions',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    preview: { name: 'Chris Brown', title: 'CEO' },
    isPro: true,
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Unique layout perfect for designers and artists',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    preview: { name: 'Taylor Davis', title: 'UX Designer' },
    isPro: true,
  },
];
