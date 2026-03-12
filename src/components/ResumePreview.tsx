import { ResumeData, CustomSection } from '../lib/supabase';
import {
  ModernTemplate,
  ClassicTemplate,
  MinimalistTemplate,
  BoldTemplate,
  ExecutiveTemplate,
  CreativeTemplate
} from './ResumeTemplates';

interface ResumePreviewProps {
  data: ResumeData;
  templateId: string;
  customSections?: CustomSection[];
  sectionOrder?: string[];
}

export default function ResumePreview({ data, templateId, customSections = [], sectionOrder = [] }: ResumePreviewProps) {
  const templates: Record<string, React.ComponentType<{ data: ResumeData; customSections: CustomSection[]; sectionOrder: string[] }>> = {
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
        <Template data={data} customSections={customSections} sectionOrder={sectionOrder} />
      </div>
    </div>
  );
}
