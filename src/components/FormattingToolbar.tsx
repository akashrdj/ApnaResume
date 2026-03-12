import { useState, useRef, useEffect } from 'react';
import { Type, ChevronDown } from 'lucide-react';
import { FONT_FAMILIES, FONT_SIZES, TEXT_COLORS } from '../types/editor';

interface FormattingToolbarProps {
  className?: string;
}

export default function FormattingToolbar({ className = '' }: FormattingToolbarProps) {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [currentFont, setCurrentFont] = useState('Arial');
  const [currentSize, setCurrentSize] = useState(14);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const savedRangeRef = useRef<Range | null>(null);
  const fontFamilyRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Save current text selection so dropdowns don't lose it
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  // Track formatting state from the current selection
  useEffect(() => {
    const onSelectionChange = () => {
      try {
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
        setIsUnderline(document.queryCommandState('underline'));

        const rawFont = document.queryCommandValue('fontName').replace(/['"]/g, '').trim();
        if (rawFont) {
          // queryCommandValue may return the full CSS font stack — take only the first font name
          const firstFont = rawFont.split(',')[0].trim();
          const matched = FONT_FAMILIES.find(f => f.toLowerCase() === firstFont.toLowerCase());
          setCurrentFont(matched || firstFont || 'Arial');
        }

        const sel = window.getSelection();
        if (sel && sel.anchorNode) {
          const el = sel.anchorNode.nodeType === Node.ELEMENT_NODE
            ? (sel.anchorNode as HTMLElement)
            : sel.anchorNode.parentElement;
          if (el) {
            const sizeStr = window.getComputedStyle(el).fontSize;
            const size = parseInt(sizeStr);
            if (!isNaN(size) && size > 0) setCurrentSize(size);

            const rgb = window.getComputedStyle(el).color.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
              setCurrentColor(
                '#' + rgb.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('')
              );
            }
          }
        }
      } catch {}
    };

    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontFamilyRef.current && !fontFamilyRef.current.contains(event.target as Node)) {
        setShowFontFamily(false);
      }
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) {
        setShowFontSize(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyFontFamily = (font: string) => {
    restoreSelection();
    document.execCommand('fontName', false, font);
    setCurrentFont(font);
    setShowFontFamily(false);
  };

  // execCommand fontSize only supports 1-7, so we inject a <span> for pixel sizes
  const applyFontSize = (sizePx: number) => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { setShowFontSize(false); return; }
    const range = sel.getRangeAt(0);
    if (!range.collapsed) {
      try {
        const fragment = range.extractContents();
        const span = document.createElement('span');
        span.style.fontSize = `${sizePx}px`;
        span.appendChild(fragment);
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
      } catch (e) {
        console.error('Font size error:', e);
      }
    }
    setCurrentSize(sizePx);
    setShowFontSize(false);
  };

  const applyColor = (color: string) => {
    restoreSelection();
    document.execCommand('foreColor', false, color);
    setCurrentColor(color);
    setShowColorPicker(false);
  };

  return (
    <div className={`bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm ${className}`}>
      <div className="flex items-center gap-1 p-2 flex-wrap">
        {/* Font Family Dropdown */}
        <div ref={fontFamilyRef} className="relative">
          <button
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowFontFamily(v => !v); setShowFontSize(false); setShowColorPicker(false); }}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm min-w-[140px]"
            title="Font Family"
          >
            <Type className="w-4 h-4 text-gray-500" />
            <span className="flex-1 text-left truncate" style={{ fontFamily: currentFont }}>{currentFont}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showFontFamily && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font}
                  onMouseDown={(e) => { e.preventDefault(); applyFontFamily(font); }}
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors text-sm ${currentFont === font ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div ref={fontSizeRef} className="relative">
          <button
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowFontSize(v => !v); setShowFontFamily(false); setShowColorPicker(false); }}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm min-w-[64px]"
            title="Font Size"
          >
            <span className="flex-1 text-left">{currentSize}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-300 rounded-lg shadow-xl max-h-52 overflow-y-auto z-50">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  onMouseDown={(e) => { e.preventDefault(); applyFontSize(size); }}
                  className={`w-full text-left px-4 py-1.5 hover:bg-blue-50 transition-colors text-sm ${currentSize === size ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Bold */}
        <button
          onMouseDown={(e) => { e.preventDefault(); document.execCommand('bold', false); setIsBold(v => !v); }}
          className={`px-2.5 py-1.5 rounded transition-colors text-sm font-bold ${isBold ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>

        {/* Italic */}
        <button
          onMouseDown={(e) => { e.preventDefault(); document.execCommand('italic', false); setIsItalic(v => !v); }}
          className={`px-2.5 py-1.5 rounded transition-colors text-sm italic font-serif ${isItalic ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>

        {/* Underline */}
        <button
          onMouseDown={(e) => { e.preventDefault(); document.execCommand('underline', false); setIsUnderline(v => !v); }}
          className={`px-2.5 py-1.5 rounded transition-colors text-sm underline ${isUnderline ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
          title="Underline (Ctrl+U)"
        >
          U
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Text Color */}
        <div ref={colorPickerRef} className="relative">
          <button
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowColorPicker(v => !v); setShowFontFamily(false); setShowFontSize(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            title="Text Color"
          >
            <span className="text-sm font-bold" style={{ color: currentColor }}>A</span>
            <div className="w-4 h-1.5 rounded-sm border border-gray-300" style={{ backgroundColor: currentColor }} />
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-gray-300 rounded-lg shadow-xl z-50 w-52">
              <p className="text-xs text-gray-500 mb-2 font-medium">Text Color</p>
              <div className="grid grid-cols-7 gap-1.5">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    onMouseDown={(e) => { e.preventDefault(); applyColor(color); }}
                    className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${currentColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-gray-200">
                <label className="text-xs text-gray-500">Custom color:</label>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => applyColor(e.target.value)}
                  className="w-full h-7 mt-1 cursor-pointer rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Hint */}
        <div className="ml-auto text-xs text-gray-400 px-2 hidden sm:block select-none">
          Select text in the preview →
        </div>
      </div>
    </div>
  );
}
