import { useRef, useEffect, useState } from 'react';
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

// A4 page height in pixels at 96 DPI (297mm ≈ 1122px)
const A4_HEIGHT = 1122;

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
  const contentRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(1);

  // Recalculate page count whenever content changes
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const pages = Math.max(1, Math.ceil(el.scrollHeight / A4_HEIGHT));
      setNumPages(pages);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-gray-100 rounded-xl p-4 print:p-0 print:bg-white print:rounded-none">
      {/* Page wrapper — editable like a Word document */}
      <div className="relative mx-auto print:shadow-none" style={{ width: '100%', maxWidth: '794px' }}>
        {/* The actual A4 page(s) */}
        <div
          className="bg-white shadow-xl print:shadow-none relative resume-page-box"
          style={{ minHeight: `${A4_HEIGHT}px` }}
        >
          {/* Content area — contentEditable so the toolbar can format it */}
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            className="outline-none"
            style={{ minHeight: `${A4_HEIGHT}px` }}
          >
            <Template data={data} customSections={customSections} sectionOrder={sectionOrder} />
          </div>

          {/* Visual page break lines */}
          {numPages > 1 && Array.from({ length: numPages - 1 }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 pointer-events-none print:hidden z-10"
              style={{ top: `${(i + 1) * A4_HEIGHT}px` }}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 border-t-2 border-dashed border-blue-300" />
                <span className="text-xs text-blue-400 bg-white px-2 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                  Page {i + 2}
                </span>
                <div className="flex-1 border-t-2 border-dashed border-blue-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Hint shown only on screen */}
        <p className="text-center text-xs text-gray-400 mt-2 print:hidden select-none">
          Click text above to select, then use the toolbar to format
        </p>
      </div>
    </div>
  );
}
