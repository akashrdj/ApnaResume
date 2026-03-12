import { ResumeData, CustomSection } from '../lib/supabase';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { renderFormattedText } from './RichTextEditor';

interface TemplateProps {
  data: ResumeData;
  customSections: CustomSection[];
  sectionOrder: string[];
}

export function ModernTemplate({ data, customSections, sectionOrder }: TemplateProps) {
  const headerStyle = "text-lg font-semibold mb-3 text-gray-900 border-b-2 border-blue-600 pb-1";

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'personal':
        return null;
      case 'experience':
        return data.experience && data.experience.length > 0 ? (
          <div className="mb-8 resume-section" key="experience">
            <h2 className={headerStyle}>Work Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id} className="resume-item">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">{renderFormattedText(exp.position)}</h3>
                      <p className="text-gray-700">{renderFormattedText(exp.company)}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{exp.location}</p>
                      <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                    </div>
                  </div>
                  {exp.description && (
                    <div className="text-gray-700 text-sm leading-relaxed mt-2">
                      {renderFormattedText(exp.description)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'education':
        return data.education && data.education.length > 0 ? (
          <div className="mb-8 resume-section" key="education">
            <h2 className={headerStyle}>Education</h2>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start resume-item">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {renderFormattedText(edu.degree)} in {renderFormattedText(edu.field)}
                    </h3>
                    <p className="text-gray-700">{renderFormattedText(edu.institution)}</p>
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
        ) : null;

      case 'skills':
        return data.skills && data.skills.length > 0 ? (
          <div className="mb-8 resume-section" key="skills">
            <h2 className={headerStyle}>Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.filter(s => s).map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects && data.projects.length > 0 ? (
          <div className="mb-8 resume-section" key="projects">
            <h2 className={headerStyle}>Projects</h2>
            <div className="space-y-3">
              {data.projects.map((project) => (
                <div key={project.id} className="resume-item">
                  <h3 className="font-semibold text-gray-900">{renderFormattedText(project.name)}</h3>
                  <div className="text-gray-700 text-sm mt-1">
                    {renderFormattedText(project.description)}
                  </div>
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
        ) : null;

      default:
        const customSection = customSections.find(s => s.id === sectionId);
        if (customSection) {
          return (
            <div className="mb-8 resume-section" key={customSection.id}>
              <h2 className={headerStyle}>{customSection.title}</h2>
              {customSection.content && (
                <div className="text-gray-700 leading-relaxed mb-3">
                  {renderFormattedText(customSection.content)}
                </div>
              )}
              {customSection.items && customSection.items.length > 0 && (
                <div className="space-y-3">
                  {customSection.items.map((item) => (
                    <div key={item.id} className="resume-item">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-semibold text-gray-900">{renderFormattedText(item.title)}</h3>
                          {item.subtitle && (
                            <p className="text-gray-700 text-sm">{renderFormattedText(item.subtitle)}</p>
                          )}
                        </div>
                        {item.date && (
                          <span className="text-sm text-gray-600">{item.date}</span>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-gray-700 text-sm leading-relaxed">
                          {renderFormattedText(item.description)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }
        return null;
    }
  };

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
        <div className="mb-8 resume-section">
          <h2 className={headerStyle}>Professional Summary</h2>
          <div className="text-gray-700 leading-relaxed">
            {renderFormattedText(data.personalInfo.summary)}
          </div>
        </div>
      )}

      {sectionOrder.filter(id => id !== 'personal').map(sectionId => renderSection(sectionId))}
    </div>
  );
}

export function ClassicTemplate({ data, customSections, sectionOrder }: TemplateProps) {
  return <ModernTemplate data={data} customSections={customSections} sectionOrder={sectionOrder} />;
}

export function MinimalistTemplate({ data, customSections, sectionOrder }: TemplateProps) {
  return <ModernTemplate data={data} customSections={customSections} sectionOrder={sectionOrder} />;
}

export function BoldTemplate({ data, customSections, sectionOrder }: TemplateProps) {
  return <ModernTemplate data={data} customSections={customSections} sectionOrder={sectionOrder} />;
}

export function ExecutiveTemplate({ data, customSections, sectionOrder }: TemplateProps) {
  return <ModernTemplate data={data} customSections={customSections} sectionOrder={sectionOrder} />;
}

export function CreativeTemplate({ data, customSections, sectionOrder }: TemplateProps) {
  return <ModernTemplate data={data} customSections={customSections} sectionOrder={sectionOrder} />;
}
