import { useState, useRef, useEffect } from 'react';
import { GripVertical, MessageCircle, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { FormattingStyle } from '../types/editor';

interface EditableSectionProps {
  id: string;
  title: string;
  content: string;
  formatting: FormattingStyle;
  isVisible?: boolean;
  onContentChange: (content: string) => void;
  onFormatChange: (formatting: FormattingStyle) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onToggleVisibility?: () => void;
  onAIAssist?: () => void;
  onDragStart?: (id: string) => void;
  onDragOver?: (id: string) => void;
  onDragEnd?: () => void;
  className?: string;
}

export default function EditableSection({
  id,
  title,
  content,
  formatting,
  isVisible = true,
  onContentChange,
  onFormatChange,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onAIAssist,
  onDragStart,
  onDragOver,
  onDragEnd,
  className = '',
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (localContent !== content) {
      onContentChange(localContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setLocalContent(content);
      setIsEditing(false);
    }
    // Don't close on Enter for multiline content
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const sectionStyle: React.CSSProperties = {
    fontFamily: formatting.fontFamily || 'Arial',
    fontSize: `${formatting.fontSize || 14}px`,
    fontWeight: formatting.fontWeight || 'normal',
    fontStyle: formatting.fontStyle || 'normal',
    textDecoration: formatting.textDecoration || 'none',
    textAlign: formatting.textAlign || 'left',
    color: formatting.color || '#000000',
    lineHeight: formatting.lineHeight || 1.5,
    letterSpacing: formatting.letterSpacing ? `${formatting.letterSpacing}px` : 'normal',
  };

  return (
    <div
      className={`group relative transition-all duration-200 ${
        !isVisible ? 'opacity-50' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={!isEditing}
      onDragStart={() => onDragStart?.(id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(id);
      }}
      onDragEnd={onDragEnd}
    >
      {/* Hover Controls */}
      {isHovered && !isEditing && (
        <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1.5 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 cursor-move"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Section Header with Title and Actions */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {title}
        </h3>
        
        {isHovered && (
          <div className="flex items-center gap-1">
            {onAIAssist && (
              <button
                onClick={onAIAssist}
                className="p-1.5 rounded hover:bg-purple-100 transition-colors text-purple-600"
                title="AI Assist"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
            {onToggleVisibility && (
              <button
                onClick={onToggleVisibility}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600"
                title={isVisible ? 'Hide section' : 'Show section'}
              >
                {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={onDuplicate}
                className="p-1.5 rounded hover:bg-blue-100 transition-colors text-blue-600"
                title="Duplicate section"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 rounded hover:bg-red-100 transition-colors text-red-600"
                title="Delete section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Editable Content */}
      <div
        className={`relative min-h-[60px] ${
          isEditing ? 'ring-2 ring-blue-500 rounded' : 'cursor-text'
        } ${isHovered && !isEditing ? 'bg-blue-50/30' : ''}`}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleTextareaChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full p-3 border-0 focus:outline-none resize-none bg-white rounded"
            style={sectionStyle}
            placeholder={`Enter ${title.toLowerCase()} content...`}
          />
        ) : (
          <div
            ref={contentRef}
            className="p-3 whitespace-pre-wrap break-words"
            style={sectionStyle}
          >
            {localContent || (
              <span className="text-gray-400 italic">
                Click to edit {title.toLowerCase()}...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Edit Indicator */}
      {isEditing && (
        <div className="absolute -bottom-6 left-0 text-xs text-gray-500 flex items-center gap-2">
          <span>Press ESC to cancel</span>
          <span>•</span>
          <span>Click outside to save</span>
        </div>
      )}
    </div>
  );
}
