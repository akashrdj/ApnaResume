import { useState, useRef } from 'react';

export interface FormattedText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  color?: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}

export default function RichTextEditor({ value, onChange, placeholder, className = '', multiline = false }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 14,
    color: '#000000'
  });

  const colors = [
    '#000000', '#374151', '#6B7280', '#EF4444', '#F59E0B',
    '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FFFFFF'
  ];

  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36];

  const applyFormatting = (format: string, value?: any) => {
    const textarea = textareaRef.current || inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (!selectedText) return;

    let formattedText = selectedText;
    const newFormatting = { ...formatting };

    switch (format) {
      case 'bold':
        newFormatting.bold = !formatting.bold;
        formattedText = `<b>${selectedText}</b>`;
        break;
      case 'italic':
        newFormatting.italic = !formatting.italic;
        formattedText = `<i>${selectedText}</i>`;
        break;
      case 'underline':
        newFormatting.underline = !formatting.underline;
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'fontSize':
        formattedText = `<span style="font-size:${value}px">${selectedText}</span>`;
        break;
      case 'color':
        formattedText = `<span style="color:${value}">${selectedText}</span>`;
        break;
    }

    const newText = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    onChange(newText);
    setFormatting(newFormatting);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 0);
  };

  const handleSelectionChange = () => {
    const textarea = textareaRef.current || inputRef.current;
    if (!textarea) return;
    setSelection({ start: textarea.selectionStart, end: textarea.selectionEnd });
  };

  const hasSelection = selection.end > selection.start;

  if (multiline) {
    return (
      <div className={className}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleSelectionChange}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          placeholder={placeholder}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelectionChange}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />
    </div>
  );
}

export function renderFormattedText(text: string | null | undefined): JSX.Element {
  const safe = text ?? '';
  const htmlString = safe
    .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>')
    .replace(/<i>(.*?)<\/i>/g, '<em>$1</em>')
    .replace(/<u>(.*?)<\/u>/g, '<span style="text-decoration: underline">$1</span>');

  return <span dangerouslySetInnerHTML={{ __html: htmlString }} />;
}
