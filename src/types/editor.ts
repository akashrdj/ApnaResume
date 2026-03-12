export interface FormattingStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  backgroundColor?: string;
  lineHeight?: number;
  letterSpacing?: number;
}

export interface SectionFormatting {
  sectionId: string;
  styles: FormattingStyle;
  marginTop?: number;
  marginBottom?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sectionId?: string;
}

export interface AISuggestion {
  type: 'improve' | 'expand' | 'summarize' | 'rewrite' | 'generate';
  originalText: string;
  suggestedText: string;
  sectionId: string;
}

export interface EditableContent {
  id: string;
  content: string;
  formatting: FormattingStyle;
  isEditing: boolean;
}

export interface SectionAction {
  type: 'edit' | 'ai-assist' | 'delete' | 'duplicate' | 'move';
  sectionId: string;
  payload?: any;
}

export const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
  'Garamond',
  'Palatino',
  'Comic Sans MS',
  'Impact',
  'Lucida Console',
  'Tahoma',
  'Trebuchet MS'
] as const;

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48, 56, 64, 72] as const;

export const TEXT_COLORS = [
  '#000000', // Black
  '#1F2937', // Dark Gray
  '#6B7280', // Medium Gray
  '#9CA3AF', // Light Gray
  '#FFFFFF', // White
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Deep Orange
  '#84CC16', // Lime
] as const;
