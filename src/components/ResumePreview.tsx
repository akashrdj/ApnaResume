import { ResumeData } from '../lib/supabase';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  templateId: string;
}

export default function ResumePreview({ data, templateId }: ResumePreviewProps) {
  const templates: Record<string, React.ComponentType<{ data: ResumeData }>> = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    minimalist: MinimalistTemplate,
    bold: BoldTemplate,
    executive: ExecutiveTemplate,
    creative: CreativeTemplate,
  };

  const Template = templates[templateId] || ModernTemplate;

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
      <div className="aspect-[8.5/11] overflow-auto print:aspect-auto print:overflow-visible">
        <Template data={data} />
      </div>
    </div>
  );
}

function ModernTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="h-full bg-white p-12 text-gray-900">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          {data.personalInfo?.name || 'Your Name'}
        </h1>
        <p className="text-xl text-blue-600 mb-4">
          {data.personalInfo?.title || 'Your Professional Title'}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {data.personalInfo?.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {data.personalInfo.email}
            </div>
          )}
          {data.personalInfo?.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {data.personalInfo.phone}
            </div>
          )}
          {data.personalInfo?.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {data.personalInfo.location}
            </div>
          )}
        </div>
      </div>

      {data.personalInfo?.summary && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 border-b-2 border-blue-600 pb-1">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 border-b-2 border-blue-600 pb-1">
            Work Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{exp.location}</p>
                    <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-gray-700 text-sm leading-relaxed mt-2">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 border-b-2 border-blue-600 pb-1">
            Education
          </h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                  <p className="text-gray-700">{edu.institution}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>{edu.location}</p>
                  <p>{edu.startDate} - {edu.endDate}</p>
                  {edu.gpa && <p>GPA: {edu.gpa}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 border-b-2 border-blue-600 pb-1">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.filter(s => s).map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.projects && data.projects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 border-b-2 border-blue-600 pb-1">
            Projects
          </h2>
          <div className="space-y-3">
            {data.projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                <p className="text-gray-700 text-sm mt-1">{project.description}</p>
                {project.technologies.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Technologies:</span> {project.technologies.join(', ')}
                  </p>
                )}
                {project.link && (
                  <a href={project.link} className="text-blue-600 text-sm flex items-center gap-1 mt-1">
                    <ExternalLink className="w-3 h-3" />
                    {project.link}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClassicTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="h-full bg-white p-12 text-gray-900">
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
        <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">
          {data.personalInfo?.name || 'Your Name'}
        </h1>
        <p className="text-lg mb-3">{data.personalInfo?.title || 'Your Professional Title'}</p>
        <div className="flex justify-center flex-wrap gap-3 text-sm">
          {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo?.phone && <span>•</span>}
          {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo?.location && <span>•</span>}
          {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
        </div>
      </div>

      {data.personalInfo?.summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-400 pb-1">
            Summary
          </h2>
          <p className="text-sm leading-relaxed">{data.personalInfo.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-400 pb-1">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between mb-1">
                  <h3 className="font-bold">{exp.position}</h3>
                  <span className="text-sm">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="italic">{exp.company}</p>
                  <span className="text-sm">{exp.location}</span>
                </div>
                {exp.description && <p className="text-sm leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-400 pb-1">
            Education
          </h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold">{edu.degree} in {edu.field}</h3>
                    <p className="italic">{edu.institution}, {edu.location}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{edu.startDate} - {edu.endDate}</p>
                    {edu.gpa && <p>GPA: {edu.gpa}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-400 pb-1">
            Skills
          </h2>
          <p className="text-sm">{data.skills.filter(s => s).join(' • ')}</p>
        </div>
      )}

      {data.projects && data.projects.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-400 pb-1">
            Projects
          </h2>
          <div className="space-y-3">
            {data.projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-bold">{project.name}</h3>
                <p className="text-sm mt-1">{project.description}</p>
                {project.technologies.length > 0 && (
                  <p className="text-sm italic mt-1">{project.technologies.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MinimalistTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="h-full bg-white p-12 text-gray-900">
      <div className="mb-10">
        <h1 className="text-5xl font-light mb-2">{data.personalInfo?.name || 'Your Name'}</h1>
        <p className="text-lg text-gray-600 mb-4">{data.personalInfo?.title || 'Your Professional Title'}</p>
        <div className="flex gap-6 text-sm text-gray-500">
          {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
        </div>
      </div>

      {data.personalInfo?.summary && (
        <div className="mb-10">
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between mb-1">
                  <h3 className="font-medium">{exp.position}</h3>
                  <span className="text-sm text-gray-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{exp.company} • {exp.location}</p>
                {exp.description && <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{edu.degree} in {edu.field}</h3>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                  </div>
                  <span className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Skills</h2>
          <p className="text-sm text-gray-700">{data.skills.filter(s => s).join(', ')}</p>
        </div>
      )}

      {data.projects && data.projects.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Projects</h2>
          <div className="space-y-4">
            {data.projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-gray-700 mt-1">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BoldTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="h-full bg-white">
      <div className="bg-gradient-to-r from-green-600 to-teal-500 text-white p-12 pb-8">
        <h1 className="text-5xl font-bold mb-2">{data.personalInfo?.name || 'Your Name'}</h1>
        <p className="text-2xl mb-4 text-green-100">{data.personalInfo?.title || 'Your Professional Title'}</p>
        <div className="flex flex-wrap gap-4 text-green-100">
          {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
        </div>
      </div>

      <div className="p-12 pt-8">
        {data.personalInfo?.summary && (
          <div className="mb-8">
            <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Experience</h2>
            <div className="space-y-5">
              {data.experience.map((exp) => (
                <div key={exp.id} className="border-l-4 border-green-500 pl-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg">{exp.position}</h3>
                    <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium">{exp.company} • {exp.location}</p>
                  {exp.description && <p className="text-gray-600 text-sm mt-2 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education && data.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-bold">{edu.degree} in {edu.field}</h3>
                  <p className="text-gray-700">{edu.institution} • {edu.location}</p>
                  <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.filter(s => s).map((skill, index) => (
                <span key={index} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.projects && data.projects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">Projects</h2>
            <div className="space-y-4">
              {data.projects.map((project) => (
                <div key={project.id} className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-bold text-lg">{project.name}</h3>
                  <p className="text-gray-700 mt-1">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">{project.technologies.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExecutiveTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="h-full bg-white">
      <div className="bg-gray-900 text-white p-12">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">{data.personalInfo?.name || 'Your Name'}</h1>
        <p className="text-xl text-gray-300">{data.personalInfo?.title || 'Your Professional Title'}</p>
      </div>

      <div className="p-12">
        <div className="grid grid-cols-3 gap-6 mb-8 pb-6 border-b-2 border-gray-200">
          {data.personalInfo?.email && (
            <div>
              <p className="text-xs uppercase text-gray-500 mb-1">Email</p>
              <p className="text-sm">{data.personalInfo.email}</p>
            </div>
          )}
          {data.personalInfo?.phone && (
            <div>
              <p className="text-xs uppercase text-gray-500 mb-1">Phone</p>
              <p className="text-sm">{data.personalInfo.phone}</p>
            </div>
          )}
          {data.personalInfo?.location && (
            <div>
              <p className="text-xs uppercase text-gray-500 mb-1">Location</p>
              <p className="text-sm">{data.personalInfo.location}</p>
            </div>
          )}
        </div>

        {data.personalInfo?.summary && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-900">Executive Summary</h2>
            <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-900">Professional Experience</h2>
            <div className="space-y-5">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-bold text-lg">{exp.position}</h3>
                    <span className="text-sm text-gray-600">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{exp.company} • {exp.location}</p>
                  {exp.description && <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education && data.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-900">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold">{edu.degree} in {edu.field}</h3>
                  <p className="text-gray-700">{edu.institution} • {edu.location}</p>
                  <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          {data.skills && data.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-900">Core Competencies</h2>
              <ul className="space-y-1">
                {data.skills.filter(s => s).map((skill, index) => (
                  <li key={index} className="text-sm text-gray-700">• {skill}</li>
                ))}
              </ul>
            </div>
          )}

          {data.projects && data.projects.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-900">Key Projects</h2>
              <div className="space-y-2">
                {data.projects.map((project) => (
                  <div key={project.id}>
                    <h3 className="font-semibold text-sm">{project.name}</h3>
                    <p className="text-xs text-gray-600">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreativeTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="h-full bg-white flex">
      <div className="w-1/3 bg-gradient-to-b from-cyan-600 to-indigo-900 text-white p-8">
        <div className="mb-8">
          <div className="w-24 h-24 bg-white rounded-full mb-4 flex items-center justify-center">
            <span className="text-4xl font-bold text-cyan-600">
              {data.personalInfo?.name?.charAt(0) || 'Y'}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{data.personalInfo?.name || 'Your Name'}</h1>
          <p className="text-cyan-100">{data.personalInfo?.title || 'Your Professional Title'}</p>
        </div>

        <div className="space-y-6 text-sm">
          {data.personalInfo?.email && (
            <div>
              <h3 className="font-bold uppercase text-xs mb-1 text-cyan-200">Email</h3>
              <p className="break-all">{data.personalInfo.email}</p>
            </div>
          )}
          {data.personalInfo?.phone && (
            <div>
              <h3 className="font-bold uppercase text-xs mb-1 text-cyan-200">Phone</h3>
              <p>{data.personalInfo.phone}</p>
            </div>
          )}
          {data.personalInfo?.location && (
            <div>
              <h3 className="font-bold uppercase text-xs mb-1 text-cyan-200">Location</h3>
              <p>{data.personalInfo.location}</p>
            </div>
          )}
        </div>

        {data.skills && data.skills.length > 0 && (
          <div className="mt-8">
            <h2 className="font-bold uppercase text-xs mb-3 text-cyan-200">Skills</h2>
            <div className="space-y-2">
              {data.skills.filter(s => s).map((skill, index) => (
                <div key={index} className="bg-white bg-opacity-20 rounded px-3 py-1 text-sm">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-2/3 p-8">
        {data.personalInfo?.summary && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3 text-cyan-700">About Me</h2>
            <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-cyan-700">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <h3 className="font-bold text-gray-900">{exp.position}</h3>
                  <p className="text-cyan-600 font-medium">{exp.company}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate} • {exp.location}
                  </p>
                  {exp.description && <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education && data.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-cyan-700">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold text-gray-900">{edu.degree} in {edu.field}</h3>
                  <p className="text-cyan-600">{edu.institution}</p>
                  <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects && data.projects.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-cyan-700">Projects</h2>
            <div className="space-y-3">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="font-bold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <p className="text-xs text-cyan-600 mt-1">{project.technologies.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
