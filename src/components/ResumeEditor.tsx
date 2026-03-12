import { useState, useEffect } from 'react';
import { Resume, ResumeData, CustomSection, supabase } from '../lib/supabase';
import { ArrowLeft, Download, Plus, Trash2, CreditCard as Edit2, Check, MessageCircle, Sparkles, ScanLine, X, Crown } from 'lucide-react';
import ResumePreview from './ResumePreview';
import DraggableSection from './DraggableSection';
import RichTextEditor, { renderFormattedText } from './RichTextEditor';
import FormattingToolbar from './FormattingToolbar';
import AIChatPanel from './AIChatPanel';
import { isGeminiConfigured } from '../lib/gemini';

interface ResumeEditorProps {
  resume: Resume;
  onBack: () => void;
  onUpgrade?: () => void;
}

export default function ResumeEditor({ resume, onBack, onUpgrade }: ResumeEditorProps) {
  const [data, setData] = useState<ResumeData>(resume.data || {});
  const [title, setTitle] = useState(resume.title);
  const [sectionOrder, setSectionOrder] = useState<string[]>(resume.section_order || ['personal', 'experience', 'education', 'skills', 'projects']);
  const [customSections, setCustomSections] = useState<CustomSection[]>(resume.custom_sections || []);
  const [saving, setSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  
  // New state for enhanced features
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMode, setAiMode] = useState<'chat' | 'scan'>('chat');
  const [zoom, setZoom] = useState(100);
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeSectionForAI, setActiveSectionForAI] = useState<{ id: string; title: string; content: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      saveResume();
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [data, title, sectionOrder, customSections]);

  const saveResume = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('resumes')
        .update({
          data,
          title,
          section_order: sectionOrder,
          custom_sections: customSections,
          updated_at: new Date().toISOString()
        })
        .eq('id', resume.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setSaving(false);
    }
  };

  // AI Chat handlers
  const openAIChatForSection = (sectionId: string, title: string, content: string) => {
    setActiveSectionForAI({ id: sectionId, title, content });
    setAiMode('chat');
    setShowAIChat(true);
  };

  const handleAISuggestionApply = (content: string) => {
    if (!activeSectionForAI) return;
    
    // Apply the AI suggestion to the appropriate section
    const sectionId = activeSectionForAI.id;
    
    if (sectionId.startsWith('custom_')) {
      // Update custom section
      setCustomSections(customSections.map(section =>
        section.id === sectionId ? { ...section, content } : section
      ));
    } else {
      // Update standard section (you can expand this based on your data structure)
      // For now, this is a placeholder - adapt to your actual data structure
      console.log('Apply AI content to section:', sectionId, content);
    }
    
    setShowAIChat(false);
    setActiveSectionForAI(null);
  };

  const handleSectionReorder = (draggedId: string, targetId: string) => {
    const newOrder = [...sectionOrder];
    const draggedIndex = newOrder.indexOf(draggedId);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);

    setSectionOrder(newOrder);
  };

  const addCustomSection = () => {
    const newSection: CustomSection = {
      id: `custom_${Date.now()}`,
      title: 'New Section',
      content: '',
      items: []
    };
    setCustomSections([...customSections, newSection]);
    setSectionOrder([...sectionOrder, newSection.id]);
  };

  const updateCustomSection = (id: string, field: string, value: any) => {
    setCustomSections(customSections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const deleteCustomSection = (id: string) => {
    setCustomSections(customSections.filter(section => section.id !== id));
    setSectionOrder(sectionOrder.filter(sectionId => sectionId !== id));
  };

  const addCustomSectionItem = (sectionId: string) => {
    setCustomSections(customSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: [
            ...(section.items || []),
            {
              id: Date.now().toString(),
              title: '',
              subtitle: '',
              description: '',
              date: ''
            }
          ]
        };
      }
      return section;
    }));
  };

  const updateCustomSectionItem = (sectionId: string, itemId: string, field: string, value: string) => {
    setCustomSections(customSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items?.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
          )
        };
      }
      return section;
    }));
  };

  const deleteCustomSectionItem = (sectionId: string, itemId: string) => {
    setCustomSections(customSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items?.filter(item => item.id !== itemId)
        };
      }
      return section;
    }));
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
    setIsPrinting(true);
    const restore = () => {
      setIsPrinting(false);
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    // Double rAF ensures React has re-rendered (zoom reset to 100%) before the print dialog opens
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'personal':
        return (
          <DraggableSection
            key="personal"
            id="personal"
            title="Personal Information"
            onReorder={handleSectionReorder}
          >
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
            <RichTextArea
              label="Professional Summary"
              value={data.personalInfo?.summary || ''}
              onChange={(v) => updatePersonalInfo('summary', v)}
              placeholder="Brief overview of your professional background and key strengths..."
            />
          </DraggableSection>
        );

      case 'experience':
        return (
          <DraggableSection
            key="experience"
            id="experience"
            title="Work Experience"
            onReorder={handleSectionReorder}
            action={
              <div className="flex items-center space-x-2">
                {isGeminiConfigured() && (
                  <button
                    onClick={() => {
                      const experienceContent = data.experience?.map(exp => 
                        `${exp.position} at ${exp.company}\n${exp.description || ''}`
                      ).join('\n\n') || '';
                      openAIChatForSection('experience', 'Work Experience', experienceContent);
                    }}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                    title="AI Assistant"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">AI</span>
                  </button>
                )}
                <button
                  onClick={addExperience}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add</span>
                </button>
              </div>
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
                <RichTextArea
                  label="Description"
                  value={exp.description}
                  onChange={(v) => updateExperience(exp.id, 'description', v)}
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>
            ))}
          </DraggableSection>
        );

      case 'education':
        return (
          <DraggableSection
            key="education"
            id="education"
            title="Education"
            onReorder={handleSectionReorder}
            action={
              <div className="flex items-center space-x-2">
                {isGeminiConfigured() && (
                  <button
                    onClick={() => {
                      const eduContent = data.education?.map(edu => 
                        `${edu.degree} in ${edu.field} from ${edu.institution}`
                      ).join('\n') || '';
                      openAIChatForSection('education', 'Education', eduContent);
                    }}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                    title="AI Assistant"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">AI</span>
                  </button>
                )}
                <button
                  onClick={addEducation}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add</span>
                </button>
              </div>
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
          </DraggableSection>
        );

      case 'skills':
        return (
          <DraggableSection
            key="skills"
            id="skills"
            title="Skills"
            onReorder={handleSectionReorder}
            action={
              <div className="flex items-center space-x-2">
                {isGeminiConfigured() && (
                  <button
                    onClick={() => {
                      const skillsContent = data.skills?.join(', ') || '';
                      openAIChatForSection('skills', 'Skills', skillsContent);
                    }}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                    title="AI Assistant"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">AI</span>
                  </button>
                )}
                <button
                  onClick={addSkill}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add</span>
                </button>
              </div>
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
          </DraggableSection>
        );

      case 'projects':
        return (
          <DraggableSection
            key="projects"
            id="projects"
            title="Projects"
            onReorder={handleSectionReorder}
            action={
              <div className="flex items-center space-x-2">
                {isGeminiConfigured() && (
                  <button
                    onClick={() => {
                      const projectsContent = data.projects?.map(proj => 
                        `${proj.name}: ${proj.description}`
                      ).join('\n\n') || '';
                      openAIChatForSection('projects', 'Projects', projectsContent);
                    }}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                    title="AI Assistant"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">AI</span>
                  </button>
                )}
                <button
                  onClick={addProject}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add</span>
                </button>
              </div>
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
                <RichTextArea
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
          </DraggableSection>
        );

      default:
        const customSection = customSections.find(s => s.id === sectionId);
        if (customSection) {
          return (
            <DraggableSection
              key={customSection.id}
              id={customSection.id}
              title={customSection.title}
              onReorder={handleSectionReorder}
              action={
                <div className="flex items-center space-x-2">
                  {isGeminiConfigured() && (
                    <button
                      onClick={() => openAIChatForSection(
                        customSection.id,
                        customSection.title,
                        customSection.content
                      )}
                      className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                      title="AI Assistant"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">AI</span>
                    </button>
                  )}
                  <button
                    onClick={() => addCustomSectionItem(customSection.id)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add Item</span>
                  </button>
                  <button
                    onClick={() => deleteCustomSection(customSection.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              }
            >
              <Input
                label="Section Title"
                value={customSection.title}
                onChange={(v) => updateCustomSection(customSection.id, 'title', v)}
                placeholder="Section Name (e.g., Hobbies, Certifications)"
              />
              <RichTextArea
                label="Section Content"
                value={customSection.content}
                onChange={(v) => updateCustomSection(customSection.id, 'content', v)}
                placeholder="Add general content for this section..."
              />
              {customSection.items?.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3 mt-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    <button
                      onClick={() => deleteCustomSectionItem(customSection.id, item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    label="Title"
                    value={item.title}
                    onChange={(v) => updateCustomSectionItem(customSection.id, item.id, 'title', v)}
                    placeholder="Item Title"
                  />
                  <Input
                    label="Subtitle (optional)"
                    value={item.subtitle || ''}
                    onChange={(v) => updateCustomSectionItem(customSection.id, item.id, 'subtitle', v)}
                    placeholder="Subtitle"
                  />
                  <Input
                    label="Date (optional)"
                    value={item.date || ''}
                    onChange={(v) => updateCustomSectionItem(customSection.id, item.id, 'date', v)}
                    placeholder="2023"
                  />
                  <RichTextArea
                    label="Description"
                    value={item.description}
                    onChange={(v) => updateCustomSectionItem(customSection.id, item.id, 'description', v)}
                    placeholder="Description..."
                  />
                </div>
              ))}
            </DraggableSection>
          );
        }
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="w-full px-4 lg:px-6 py-4">
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
              
              {/* AI Scan Button */}
              {isGeminiConfigured() && (
                <button
                  onClick={() => {
                    if (showAIChat && aiMode === 'scan') {
                      setShowAIChat(false);
                    } else {
                      setAiMode('scan');
                      setShowAIChat(true);
                    }
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    showAIChat && aiMode === 'scan'
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title="AI Scan — auto-analyze resume"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>AI Scan</span>
                </button>
              )}

              {/* AI Chat Button */}
              {isGeminiConfigured() && (
                <button
                  onClick={() => {
                    if (showAIChat && aiMode === 'chat') {
                      setShowAIChat(false);
                    } else {
                      setAiMode('chat');
                      setShowAIChat(true);
                    }
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    showAIChat && aiMode === 'chat'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                  title="AI Chat"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Chat</span>
                </button>
              )}
              
              <button
                onClick={onUpgrade}
                className="print:hidden flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:from-amber-500 hover:to-orange-600 transition-all hover:shadow-lg"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Pro</span>
              </button>
              
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

      {/* Formatting Toolbar — always visible, works on selected text in the preview */}
      <FormattingToolbar className="print:hidden" />

      <div className="w-full px-4 lg:px-6 py-4 print:p-0" style={{ height: isPrinting ? 'auto' : 'calc(100vh - 112px)', overflow: isPrinting ? 'visible' : 'hidden' }}>
        {/* 3-panel animated flex layout — each panel scrolls independently */}
        <div className="flex gap-4 print:block h-full">

          {/* LEFT — Section editor (shrinks when AI open) */}
          <div
            className="flex-shrink-0 print:hidden overflow-y-auto h-full"
            style={{
              width: showAIChat ? '22%' : '30%',
              transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <div className="space-y-6 pb-6">
            {sectionOrder.map(sectionId => renderSection(sectionId))}
            <button
              onClick={addCustomSection}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center space-x-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Add Custom Section</span>
            </button>
            </div>
          </div>

          {/* MIDDLE — PDF Viewer (shifts left when AI open) */}
          <div
            className="flex flex-col print:block h-full"
            style={{
              width: showAIChat ? '45%' : '70%',
              flexShrink: 0,
              transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <div className="flex-1 overflow-y-auto print:max-h-none print:overflow-visible relative">
              {/* Blue shimmer overlay while scanning */}
              {isScanning && <div className="scan-overlay" />}
              <div style={{ zoom: isPrinting ? '100%' : `${zoom}%`, transformOrigin: 'top center' }}>
                <ResumePreview
                  data={data}
                  templateId={resume.template_id}
                  customSections={customSections}
                  sectionOrder={sectionOrder}
                />
              </div>
            </div>
            {/* Zoom Controls */}
            <div className="print:hidden flex items-center justify-end gap-2 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-2 rounded-b-xl shadow-sm">
              <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-bold text-lg leading-none transition" title="Zoom out">−</button>
              <input type="range" min={25} max={200} step={5} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-28 accent-blue-600" />
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 font-bold text-lg leading-none transition" title="Zoom in">+</button>
              <span className="text-xs text-gray-500 w-10 text-right cursor-pointer select-none" onClick={() => setZoom(100)} title="Click to reset zoom">{zoom}%</span>
            </div>
          </div>

          {/* RIGHT — AI Panel (slides in from right) */}
          <div
            className="flex flex-col print:hidden overflow-hidden h-full"
            style={{
              width: showAIChat ? '33%' : '0%',
              flexShrink: 0,
              opacity: showAIChat ? 1 : 0,
              transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
            }}
          >
            {/* Unified AI panel — Chat | Scan tabs */}
            <div className="flex flex-col h-full rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <AIChatPanel
                isOpen={showAIChat}
                onClose={() => setShowAIChat(false)}
                sectionId={activeSectionForAI?.id || 'personal'}
                sectionTitle={activeSectionForAI?.title || 'Resume'}
                currentContent={activeSectionForAI?.content || ''}
                onApplySuggestion={handleAISuggestionApply}
                mode={aiMode}
                onModeChange={(m) => setAiMode(m)}
                resumeData={JSON.stringify(data)}
                onScanStart={() => setIsScanning(true)}
                onScanComplete={() => setIsScanning(false)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* AI Chat Panel — now inline, no popup */}
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

function RichTextArea({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        multiline
      />
    </div>
  );
}
