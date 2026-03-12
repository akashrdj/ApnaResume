import { useState, useEffect } from 'react';
import { Resume, ResumeData, supabase } from '../lib/supabase';
import { ArrowLeft, Save, Download, Plus, Trash2, CreditCard as Edit2, Check, X } from 'lucide-react';
import ResumePreview from './ResumePreview';

interface ResumeEditorProps {
  resume: Resume;
  onBack: () => void;
}

export default function ResumeEditor({ resume, onBack }: ResumeEditorProps) {
  const [data, setData] = useState<ResumeData>(resume.data || {});
  const [title, setTitle] = useState(resume.title);
  const [saving, setSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      saveResume();
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [data, title]);

  const saveResume = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('resumes')
        .update({ data, title, updated_at: new Date().toISOString() })
        .eq('id', resume.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setData({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      } as any
    });
  };

  const addExperience = () => {
    setData({
      ...data,
      experience: [
        ...(data.experience || []),
        {
          id: Date.now().toString(),
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        }
      ]
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setData({
      ...data,
      experience: data.experience?.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const deleteExperience = (id: string) => {
    setData({
      ...data,
      experience: data.experience?.filter(exp => exp.id !== id)
    });
  };

  const addEducation = () => {
    setData({
      ...data,
      education: [
        ...(data.education || []),
        {
          id: Date.now().toString(),
          institution: '',
          degree: '',
          field: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: ''
        }
      ]
    });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setData({
      ...data,
      education: data.education?.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  const deleteEducation = (id: string) => {
    setData({
      ...data,
      education: data.education?.filter(edu => edu.id !== id)
    });
  };

  const addSkill = () => {
    setData({
      ...data,
      skills: [...(data.skills || []), '']
    });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...(data.skills || [])];
    newSkills[index] = value;
    setData({ ...data, skills: newSkills });
  };

  const deleteSkill = (index: number) => {
    setData({
      ...data,
      skills: data.skills?.filter((_, i) => i !== index)
    });
  };

  const addProject = () => {
    setData({
      ...data,
      projects: [
        ...(data.projects || []),
        {
          id: Date.now().toString(),
          name: '',
          description: '',
          technologies: [],
          link: ''
        }
      ]
    });
  };

  const updateProject = (id: string, field: string, value: any) => {
    setData({
      ...data,
      projects: data.projects?.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    });
  };

  const deleteProject = (id: string) => {
    setData({
      ...data,
      projects: data.projects?.filter(proj => proj.id !== id)
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {editingTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-semibold border-b-2 border-blue-600 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => setEditingTitle(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Check className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold">{title}</h1>
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {saving && <span className="text-sm text-gray-500">Saving...</span>}
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-1">
          <div className="space-y-6 print:hidden">
            <Section title="Personal Information">
              <Input
                label="Full Name"
                value={data.personalInfo?.name || ''}
                onChange={(v) => updatePersonalInfo('name', v)}
                placeholder="John Doe"
              />
              <Input
                label="Professional Title"
                value={data.personalInfo?.title || ''}
                onChange={(v) => updatePersonalInfo('title', v)}
                placeholder="Software Engineer"
              />
              <Input
                label="Email"
                type="email"
                value={data.personalInfo?.email || ''}
                onChange={(v) => updatePersonalInfo('email', v)}
                placeholder="john@example.com"
              />
              <Input
                label="Phone"
                value={data.personalInfo?.phone || ''}
                onChange={(v) => updatePersonalInfo('phone', v)}
                placeholder="+1 (555) 123-4567"
              />
              <Input
                label="Location"
                value={data.personalInfo?.location || ''}
                onChange={(v) => updatePersonalInfo('location', v)}
                placeholder="San Francisco, CA"
              />
              <TextArea
                label="Professional Summary"
                value={data.personalInfo?.summary || ''}
                onChange={(v) => updatePersonalInfo('summary', v)}
                placeholder="Brief overview of your professional background and key strengths..."
              />
            </Section>

            <Section
              title="Work Experience"
              action={
                <button
                  onClick={addExperience}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add</span>
                </button>
              }
            >
              {data.experience?.map((exp, index) => (
                <div key={exp.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-700">Experience {index + 1}</span>
                    <button
                      onClick={() => deleteExperience(exp.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    label="Company"
                    value={exp.company}
                    onChange={(v) => updateExperience(exp.id, 'company', v)}
                    placeholder="Company Name"
                  />
                  <Input
                    label="Position"
                    value={exp.position}
                    onChange={(v) => updateExperience(exp.id, 'position', v)}
                    placeholder="Job Title"
                  />
                  <Input
                    label="Location"
                    value={exp.location}
                    onChange={(v) => updateExperience(exp.id, 'location', v)}
                    placeholder="City, State"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Start Date"
                      value={exp.startDate}
                      onChange={(v) => updateExperience(exp.id, 'startDate', v)}
                      placeholder="Jan 2020"
                    />
                    <Input
                      label="End Date"
                      value={exp.endDate}
                      onChange={(v) => updateExperience(exp.id, 'endDate', v)}
                      placeholder="Dec 2022"
                      disabled={exp.current}
                    />
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Currently working here</span>
                  </label>
                  <TextArea
                    label="Description"
                    value={exp.description}
                    onChange={(v) => updateExperience(exp.id, 'description', v)}
                    placeholder="Describe your responsibilities and achievements..."
                  />
                </div>
              ))}
            </Section>

            <Section
              title="Education"
              action={
                <button
                  onClick={addEducation}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add</span>
                </button>
              }
            >
              {data.education?.map((edu, index) => (
                <div key={edu.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-700">Education {index + 1}</span>
                    <button
                      onClick={() => deleteEducation(edu.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    label="Institution"
                    value={edu.institution}
                    onChange={(v) => updateEducation(edu.id, 'institution', v)}
                    placeholder="University Name"
                  />
                  <Input
                    label="Degree"
                    value={edu.degree}
                    onChange={(v) => updateEducation(edu.id, 'degree', v)}
                    placeholder="Bachelor of Science"
                  />
                  <Input
                    label="Field of Study"
                    value={edu.field}
                    onChange={(v) => updateEducation(edu.id, 'field', v)}
                    placeholder="Computer Science"
                  />
                  <Input
                    label="Location"
                    value={edu.location}
                    onChange={(v) => updateEducation(edu.id, 'location', v)}
                    placeholder="City, State"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Start Date"
                      value={edu.startDate}
                      onChange={(v) => updateEducation(edu.id, 'startDate', v)}
                      placeholder="2016"
                    />
                    <Input
                      label="End Date"
                      value={edu.endDate}
                      onChange={(v) => updateEducation(edu.id, 'endDate', v)}
                      placeholder="2020"
                    />
                    <Input
                      label="GPA"
                      value={edu.gpa || ''}
                      onChange={(v) => updateEducation(edu.id, 'gpa', v)}
                      placeholder="3.8"
                    />
                  </div>
                </div>
              ))}
            </Section>

            <Section
              title="Skills"
              action={
                <button
                  onClick={addSkill}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add</span>
                </button>
              }
            >
              <div className="space-y-2">
                {data.skills?.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      placeholder="Enter a skill"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={() => deleteSkill(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title="Projects"
              action={
                <button
                  onClick={addProject}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add</span>
                </button>
              }
            >
              {data.projects?.map((project, index) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-700">Project {index + 1}</span>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    label="Project Name"
                    value={project.name}
                    onChange={(v) => updateProject(project.id, 'name', v)}
                    placeholder="Project Name"
                  />
                  <TextArea
                    label="Description"
                    value={project.description}
                    onChange={(v) => updateProject(project.id, 'description', v)}
                    placeholder="Describe the project..."
                  />
                  <Input
                    label="Technologies (comma-separated)"
                    value={project.technologies.join(', ')}
                    onChange={(v) => updateProject(project.id, 'technologies', v.split(',').map(t => t.trim()))}
                    placeholder="React, Node.js, MongoDB"
                  />
                  <Input
                    label="Link (optional)"
                    value={project.link || ''}
                    onChange={(v) => updateProject(project.id, 'link', v)}
                    placeholder="https://project-url.com"
                  />
                </div>
              ))}
            </Section>
          </div>

          <div className="lg:sticky lg:top-8 h-fit print:block">
            <ResumePreview data={data} templateId={resume.template_id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text', disabled = false }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
      />
    </div>
  );
}
