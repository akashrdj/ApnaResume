import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Resume } from '../lib/supabase';
import { Plus, FileText, Trash2, LogOut, Loader2, CreditCard as Edit } from 'lucide-react';
import ResumeEditor from './ResumeEditor';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

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
      const { data, error } = await supabase
        .from('resumes')
        .insert([
          {
            user_id: user?.id,
            title: 'Untitled Resume',
            template_id: templateId,
            data: {
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
            }
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setResumes([data, ...resumes]);
      setSelectedResume(data);
      setShowTemplates(false);
    } catch (error) {
      console.error('Error creating resume:', error);
    }
  };

  const deleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

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

  if (selectedResume) {
    return (
      <ResumeEditor
        resume={selectedResume}
        onBack={() => {
          setSelectedResume(null);
          loadResumes();
        }}
      />
    );
  }

  if (showTemplates) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-gray-900">Choose a Template</h2>
            <p className="text-gray-600 mt-2">Select a professional template to start building your resume</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => createResume(template.id)}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="h-80 bg-gradient-to-br p-8 flex items-center justify-center" style={{ background: template.gradient }}>
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full h-full flex flex-col">
                    <div className="text-2xl font-bold mb-2">{template.preview.name}</div>
                    <div className="text-sm text-gray-600 mb-4">{template.preview.title}</div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Resumes</h2>
          <p className="text-gray-600">Create and manage your professional resumes</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => setShowTemplates(true)}
              className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center group"
            >
              <div className="bg-blue-100 group-hover:bg-blue-200 p-4 rounded-full mb-4 transition">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition">
                Create New Resume
              </span>
            </button>

            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 p-6 flex items-center justify-center">
                  <FileText className="w-20 h-20 text-white opacity-50" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                    {resume.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Updated {new Date(resume.updated_at).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedResume(resume)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteResume(resume.id)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
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
    </div>
  );
}

const templates = [
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
    preview: { name: 'Sam Williams', title: 'Creative Director' }
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Sophisticated design for senior-level positions',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    preview: { name: 'Chris Brown', title: 'CEO' }
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Unique layout perfect for designers and artists',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    preview: { name: 'Taylor Davis', title: 'UX Designer' }
  }
];
