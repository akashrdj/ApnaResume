import React, { useState } from 'react';
import { Upload, FileText, Sparkles, Check, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  extractTextFromFile,
  parseResumeWithAI,
  ParsedResumeData,
  convertToResumeData,
  isParserConfigured,
} from '../lib/resumeParser';
import { ResumeData } from '../lib/supabase';

interface Props {
  onResumeDataExtracted: (data: ResumeData) => void;
  onParsingStart?: () => void;
  onParsingDone?: (data: ResumeData) => void;
}

type Step = 'upload' | 'extracting' | 'preview' | 'parsing' | 'parsed';

export function ResumeUploader({ onResumeDataExtracted, onParsingStart, onParsingDone }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [showParsedSections, setShowParsedSections] = useState({
    personalInfo: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
  });
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setStep('extracting');

    try {
      const text = await extractTextFromFile(selectedFile);
      setExtractedText(text);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from file');
      setStep('upload');
      setFile(null);
    }
  };

  const handleParseWithAI = async () => {
    if (!extractedText) return;

    if (!isParserConfigured()) {
      setError('Gemini API key not configured. Please add it to your .env file.');
      return;
    }

    setError('');
    setStep('parsing');
    onParsingStart?.();

    try {
      const parsed = await parseResumeWithAI(extractedText);
      setParsedData(parsed);
      if (onParsingDone) {
        // Hand off to parent overlay — reset uploader to clean state
        onParsingDone(convertToResumeData(parsed));
        setFile(null);
        setExtractedText('');
        setParsedData(null);
        setStep('upload');
      } else {
        setStep('parsed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse resume with AI');
      setStep('preview');
    }
  };

  const handleCreateResume = () => {
    if (!parsedData) return;
    
    const resumeData = convertToResumeData(parsedData);
    onResumeDataExtracted(resumeData);
  };

  const handleReset = () => {
    setFile(null);
    setExtractedText('');
    setParsedData(null);
    setError('');
    setStep('upload');
    setShowFullText(false);
  };

  const toggleSection = (section: keyof typeof showParsedSections) => {
    setShowParsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border border-purple-200 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Import Resume
            </h2>
            <p className="text-sm text-gray-600">Upload and parse with AI</p>
          </div>
        </div>

      {/* Upload Section */}
      {step === 'upload' && (
        <div>
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
              isDragging
                ? 'border-purple-500 bg-purple-100/50 scale-105'
                : 'border-purple-300 bg-white/50 hover:border-purple-400 hover:bg-white/70'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-10 h-10 text-purple-600" />
            </div>
            <p className="text-gray-800 font-bold text-lg mb-2">
              Drag & drop your resume
            </p>
            <p className="text-sm text-gray-600 mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,image/*"
              onChange={handleFileInput}
            />
            <label
              htmlFor="resume-upload"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              Select File
            </label>
            <p className="text-xs text-gray-500 mt-4 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Supports: PDF, Word, Images, Text files
            </p>
          </div>

          <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-bold text-gray-800 mb-2">✨ AI-Powered Parsing</p>
                <ol className="list-decimal ml-4 space-y-1.5 text-gray-700">
                  <li>Upload your existing resume (any format)</li>
                  <li>AI extracts and structures your data</li>
                  <li>Review automatically parsed sections</li>
                  <li>Choose a template and customize</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extracting Section */}
      {step === 'extracting' && (
        <div className="flex flex-col items-center justify-center py-16 bg-white/50 rounded-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin relative z-10" />
          </div>
          <p className="text-gray-800 font-bold text-lg mt-6">Extracting text...</p>
          <p className="text-sm text-gray-600 mt-2">{file?.name}</p>
          <div className="flex gap-2 mt-4">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
            <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="inline-block w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
      )}

      {/* Preview Extracted Text */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="bg-white/70 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-green-500 p-1.5 rounded-full">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm">Text extracted successfully!</p>
                  <p className="text-xs text-gray-600">{file?.name}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Upload Different
              </button>
            </div>

            <button
              onClick={() => setShowFullText(!showFullText)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
            >
              {showFullText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showFullText ? 'Hide' : 'Show'} extracted text ({extractedText.length.toLocaleString()} characters)
            </button>

            {showFullText && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {extractedText}
                </pre>
              </div>
            )}
          </div>

          <button
            onClick={handleParseWithAI}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
            Parse with AI Magic
          </button>

          <p className="text-xs text-center text-gray-600 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            AI will intelligently structure your resume data
          </p>

          {!isParserConfigured() && (
            <button
              onClick={() => setShowApiKeyHelp(!showApiKeyHelp)}
              className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 hover:bg-yellow-100 transition-colors"
            >
              ⚠️ Click here to configure Gemini API
            </button>
          )}

          {showApiKeyHelp && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <p className="font-bold text-blue-900 mb-2">📝 How to add your Gemini API key:</p>
              <ol className="list-decimal ml-4 space-y-1 text-blue-800">
                <li>Get free API key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium">makersuite.google.com</a></li>
                <li>Open <code className="bg-blue-100 px-1 rounded">.env</code> file in your project</li>
                <li>Replace <code className="bg-blue-100 px-1 rounded">your_gemini_api_key_here</code> with your actual key</li>
                <li>Save the file and refresh the page</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Parsing with AI */}
      {step === 'parsing' && (
        <div className="flex flex-col items-center justify-center py-16 bg-white/50 rounded-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin relative z-10" />
          </div>
          <p className="text-gray-800 font-bold text-lg mt-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            AI is analyzing your resume...
          </p>
          <p className="text-sm text-gray-600 mt-2">Extracting sections and structuring data</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-blue-100 px-3 py-1.5 rounded-full text-blue-700 font-medium animate-pulse">
              📝 Personal Info
            </div>
            <div className="bg-purple-100 px-3 py-1.5 rounded-full text-purple-700 font-medium animate-pulse" style={{ animationDelay: '0.2s' }}>
              💼 Experience
            </div>
            <div className="bg-pink-100 px-3 py-1.5 rounded-full text-pink-700 font-medium animate-pulse" style={{ animationDelay: '0.4s' }}>
              🎓 Education
            </div>
            <div className="bg-indigo-100 px-3 py-1.5 rounded-full text-indigo-700 font-medium animate-pulse" style={{ animationDelay: '0.6s' }}>
              ⚡ Skills
            </div>
          </div>
        </div>
      )}

      {/* Parsed Data Preview */}
      {step === 'parsed' && parsedData && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-green-500 to-blue-500 p-2 rounded-full">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-800 font-bold">Resume parsed successfully!</p>
                  <p className="text-xs text-gray-600">Review your data below</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Start Over
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <div className="border-2 border-purple-200 rounded-xl overflow-hidden bg-white/70 hover:border-purple-300 transition-colors">
            <button
              onClick={() => toggleSection('personalInfo')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors"
            >
              <span className="font-bold text-gray-800">📝 Personal Information</span>
              {showParsedSections.personalInfo ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            {showParsedSections.personalInfo && (
              <div className="p-4 space-y-2 text-sm bg-white">
                {parsedData.personalInfo.name && (
                  <p><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-600">{parsedData.personalInfo.name}</span></p>
                )}
                {parsedData.personalInfo.title && (
                  <p><span className="font-semibold text-gray-700">Title:</span> <span className="text-gray-600">{parsedData.personalInfo.title}</span></p>
                )}
                {parsedData.personalInfo.email && (
                  <p><span className="font-semibold text-gray-700">Email:</span> <span className="text-gray-600">{parsedData.personalInfo.email}</span></p>
                )}
                {parsedData.personalInfo.phone && (
                  <p><span className="font-semibold text-gray-700">Phone:</span> <span className="text-gray-600">{parsedData.personalInfo.phone}</span></p>
                )}
                {parsedData.personalInfo.location && (
                  <p><span className="font-semibold text-gray-700">Location:</span> <span className="text-gray-600">{parsedData.personalInfo.location}</span></p>
                )}
                {parsedData.personalInfo.summary && (
                  <p><span className="font-semibold text-gray-700">Summary:</span> <span className="text-gray-600">{parsedData.personalInfo.summary}</span></p>
                )}
              </div>
            )}
          </div>

          {/* Experience */}
          {parsedData.experience && parsedData.experience.length > 0 && (
            <div className="border-2 border-blue-200 rounded-xl overflow-hidden bg-white/70 hover:border-blue-300 transition-colors">
              <button
                onClick={() => toggleSection('experience')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors"
              >
                <span className="font-bold text-gray-800">💼 Experience ({parsedData.experience.length})</span>
                {showParsedSections.experience ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
              {showParsedSections.experience && (
                <div className="p-4 space-y-3 bg-white">
                  {parsedData.experience.map((exp, idx) => (
                    <div key={idx} className="pb-3 border-b border-gray-200 last:border-0">
                      <p className="font-bold text-gray-800">{exp.position}</p>
                      <p className="text-sm text-blue-600 font-medium">{exp.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {exp.startDate} - {exp.current ? '✨ Present' : exp.endDate}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Education */}
          {parsedData.education && parsedData.education.length > 0 && (
            <div className="border-2 border-green-200 rounded-xl overflow-hidden bg-white/70 hover:border-green-300 transition-colors">
              <button
                onClick={() => toggleSection('education')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
              >
                <span className="font-bold text-gray-800">🎓 Education ({parsedData.education.length})</span>
                {showParsedSections.education ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
              {showParsedSections.education && (
                <div className="p-4 space-y-3 bg-white">
                  {parsedData.education.map((edu, idx) => (
                    <div key={idx} className="pb-3 border-b border-gray-200 last:border-0">
                      <p className="font-bold text-gray-800">{edu.degree} in {edu.field}</p>
                      <p className="text-sm text-green-600 font-medium">{edu.institution}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {edu.startDate} - {edu.endDate}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {parsedData.skills && parsedData.skills.length > 0 && (
            <div className="border-2 border-pink-200 rounded-xl overflow-hidden bg-white/70 hover:border-pink-300 transition-colors">
              <button
                onClick={() => toggleSection('skills')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-colors"
              >
                <span className="font-bold text-gray-800">⚡ Skills ({parsedData.skills.length})</span>
                {showParsedSections.skills ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
              {showParsedSections.skills && (
                <div className="p-4 bg-white">
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Projects */}
          {parsedData.projects && parsedData.projects.length > 0 && (
            <div className="border-2 border-indigo-200 rounded-xl overflow-hidden bg-white/70 hover:border-indigo-300 transition-colors">
              <button
                onClick={() => toggleSection('projects')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 transition-colors"
              >
                <span className="font-bold text-gray-800">🚀 Projects ({parsedData.projects.length})</span>
                {showParsedSections.projects ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
              {showParsedSections.projects && (
                <div className="p-4 space-y-3 bg-white">
                  {parsedData.projects.map((project, idx) => (
                    <div key={idx} className="pb-3 border-b border-gray-200 last:border-0">
                      <p className="font-bold text-gray-800">{project.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech, techIdx) => (
                            <span
                              key={techIdx}
                              className="px-2 py-1 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 rounded-lg text-xs font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Resume Button */}
          <button
            onClick={handleCreateResume}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white rounded-2xl font-bold hover:from-green-700 hover:via-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg"
          >
            <Check className="w-6 h-6" />
            Create Resume with This Data
            <Sparkles className="w-5 h-5 animate-pulse" />
          </button>
          <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Select a template and customize further
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl flex items-start gap-3 shadow-md">
          <div className="bg-red-500 p-2 rounded-full flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900">Error</p>
            <p className="text-sm text-red-800 mt-1">{error}</p>
            {error.toLowerCase().includes('api') && (
              <button
                onClick={() => setShowApiKeyHelp(!showApiKeyHelp)}
                className="mt-2 text-xs text-red-700 hover:text-red-900 underline font-medium"
              >
                Click here for API key setup instructions
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
