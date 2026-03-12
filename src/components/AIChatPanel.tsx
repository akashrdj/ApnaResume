import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Loader2, Wand2, FileText, List, ScanLine, RotateCcw, MessageCircle } from 'lucide-react';
import { chatWithAI, isGeminiConfigured } from '../lib/gemini';
import { AIMessage } from '../types/editor';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  sectionTitle: string;
  currentContent: string;
  onApplySuggestion?: (content: string) => void;
  // Scan props
  mode: 'chat' | 'scan';
  onModeChange: (m: 'chat' | 'scan') => void;
  resumeData?: string;
  onScanStart?: () => void;
  onScanComplete?: () => void;
}

// ---------------------------------------------------------------------------
// ScoreRing — SVG circular score indicator
// ---------------------------------------------------------------------------
function ScoreRing({ score }: { score: number }) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const filled = (clampedScore / 100) * circumference;
  const color =
    clampedScore >= 80 ? '#22c55e' : clampedScore >= 60 ? '#f59e0b' : '#ef4444';
  const label =
    clampedScore >= 80 ? 'Great' : clampedScore >= 60 ? 'Good' : 'Needs Work';

  return (
    <div className="flex flex-col items-center py-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Resume Score</p>
      <svg width="96" height="96" viewBox="0 0 96 96" className="drop-shadow-sm">
        {/* Track */}
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        {/* Progress */}
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* Score number */}
        <text x="48" y="44" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="700" fill={color}>{clampedScore}</text>
        <text x="48" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#6b7280">/100</text>
      </svg>
      <span className="mt-2 text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset scan prompt
// ---------------------------------------------------------------------------
function buildScanPrompt(resumeJson: string): string {
  return `You are an expert resume analyst and career coach. Carefully read the resume data below and provide a thorough analysis.

Your response MUST start with this exact line (replace XX with the actual number):
Score: XX/100

Then continue with the following sections:

**Score Breakdown**
- Contact & Headline: X/10
- Work Experience: X/25
- Education: X/15
- Skills: X/15
- Projects/Portfolio: X/15
- Formatting & Clarity: X/10
- ATS Compatibility: X/10

**Top 3 Strengths**
List the 3 best things about this resume.

**Top 5 Improvements** (specific and actionable)
List 5 concrete changes that would most improve this resume.

**ATS Compatibility Notes**
Any keywords, formatting, or structural issues that might cause ATS filters to reject this resume.

---
Resume data (JSON):
${resumeJson}`;
}

// ---------------------------------------------------------------------------
// AIChatPanel component
// ---------------------------------------------------------------------------
export default function AIChatPanel({
  isOpen,
  onClose,
  sectionId,
  sectionTitle,
  currentContent,
  mode,
  onModeChange,
  resumeData,
  onScanStart,
  onScanComplete,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const [scanScore, setScanScore] = useState<number | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isConfigured = isGeminiConfigured();

  // Welcome message when chat opens fresh
  useEffect(() => {
    if (isOpen && messages.length === 0 && mode === 'chat') {
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: `Hi! I'm your AI resume assistant.\n\nYou can ask me anything about your resume, or switch to the **Scan** tab to get an automatic AI analysis with a score and improvement tips!`,
        timestamp: new Date(),
        sectionId,
      }]);
    }
  }, [isOpen]);

  // Auto-scan trigger: fires when mode switches to 'scan' and hasn't scanned yet
  useEffect(() => {
    if (isOpen && mode === 'scan' && !hasScanned && isConfigured) {
      runScan();
    }
  }, [isOpen, mode]);

  const runScan = async () => {
    if (!resumeData || isScanLoading) return;
    setIsScanLoading(true);
    setScanScore(null);
    setHasScanned(true);
    onScanStart?.();

    // Add a "scanning" system message
    const scanningMsg: AIMessage = {
      id: 'scan-init',
      role: 'assistant',
      content: '🔍 Scanning your resume... This may take a few seconds.',
      timestamp: new Date(),
      sectionId: 'scan',
    };
    setMessages(prev => [...prev.filter(m => m.id !== 'scan-init'), scanningMsg]);

    try {
      const prompt = buildScanPrompt(resumeData);
      const response = await chatWithAI(prompt, []);

      // Parse score
      const scoreMatch = response.match(/Score:\s*(\d+)\s*\/\s*100/i);
      const parsedScore = scoreMatch ? Math.max(30, Math.min(100, parseInt(scoreMatch[1], 10))) : null;
      setScanScore(parsedScore);

      const resultMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sectionId: 'scan',
      };
      setMessages(prev => [...prev.filter(m => m.id !== 'scan-init'), resultMsg]);
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'scan-init'),
        {
          id: 'scan-error',
          role: 'assistant',
          content: '❌ Scan failed. Please check your API key and try again.',
          timestamp: new Date(),
          sectionId: 'scan',
        },
      ]);
      setHasScanned(false); // allow retry
    } finally {
      setIsScanLoading(false);
      onScanComplete?.();
    }
  };

  const handleRescan = () => {
    setHasScanned(false);
    setScanScore(null);
    setMessages([]);
    // Trigger via next render
    setTimeout(() => runScan(), 50);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isConfigured) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      sectionId,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const contextualMessage =
        mode === 'scan' && resumeData
          ? `The user is in resume scan/analysis mode. Resume JSON: ${resumeData}\n\nUser follow-up: ${inputMessage}`
          : `Section: ${sectionTitle}\nCurrent content: ${currentContent || 'Empty'}\n\nUser question: ${inputMessage}`;

      const response = await chatWithAI(contextualMessage, conversationHistory);

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          sectionId,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
          sectionId,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const quickPrompts: Record<string, string> = {
      generate: `Generate professional content for this ${sectionTitle} section`,
      improve: `Improve the current content to make it more professional and impactful`,
      expand: `Expand the current content with more details and achievements`,
      bullets: `Convert this into professional bullet points with strong action verbs`,
    };
    setInputMessage(quickPrompts[action] || '');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 rounded-xl overflow-hidden" style={{ position: 'relative' }}>
      {/* Loading bar — shown during scan */}
      {isScanLoading && <div className="ai-loading-bar" />}

      {/* ── Top bar: close + title ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${mode === 'scan' ? 'from-green-500 to-teal-500' : 'from-purple-500 to-blue-500'}`}>
            {mode === 'scan' ? <ScanLine className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">
            {mode === 'scan' ? 'AI Scanner' : 'AI Assistant'}
          </h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* ── Chat | Scan tabs ── */}
      <div className="flex mx-4 mb-2 bg-gray-100 rounded-lg p-1 gap-1">
        <button
          onClick={() => onModeChange('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-all ${
            mode === 'chat'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Chat
        </button>
        <button
          onClick={() => onModeChange('scan')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-all ${
            mode === 'scan'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ScanLine className="w-3.5 h-3.5" />
          Scan
          {isScanLoading && <Loader2 className="w-3 h-3 animate-spin ml-0.5" />}
        </button>
      </div>

      {/* ── Score ring (scan mode only, after scan) ── */}
      {mode === 'scan' && scanScore !== null && <ScoreRing score={scanScore} />}

      {/* ── Scan loading placeholder ── */}
      {mode === 'scan' && isScanLoading && scanScore === null && (
        <div className="flex flex-col items-center gap-3 py-6 border-b border-gray-100 bg-gradient-to-b from-green-50 to-white">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-green-100 flex items-center justify-center">
              <ScanLine className="w-7 h-7 text-green-500" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-green-400 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-green-700">Scanning resume…</p>
          <p className="text-xs text-gray-400">Gemini is reading your resume</p>
        </div>
      )}

      {/* ── API key check ── */}
      {!isConfigured && (
        <div className="mx-4 mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">⚠️ Gemini API key not configured.</p>
        </div>
      )}

      {/* ── Quick actions (chat mode only) ── */}
      {mode === 'chat' && (
        <div className="px-4 pb-3 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { key: 'generate', label: 'Generate', icon: <Wand2 className="w-3.5 h-3.5 text-purple-600" />, disabled: false },
              { key: 'improve',  label: 'Improve',  icon: <Sparkles className="w-3.5 h-3.5 text-blue-600" />,   disabled: !currentContent },
              { key: 'expand',   label: 'Expand',   icon: <FileText className="w-3.5 h-3.5 text-green-600" />,  disabled: !currentContent },
              { key: 'bullets',  label: 'Bullets',  icon: <List className="w-3.5 h-3.5 text-orange-600" />,     disabled: !currentContent },
            ].map(({ key, label, icon, disabled }) => (
              <button
                key={key}
                onClick={() => handleQuickAction(key)}
                disabled={!isConfigured || isLoading || disabled}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs text-gray-700"
              >
                {icon}{label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-xl p-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1.5 opacity-60">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {(isLoading) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              <span className="text-xs text-gray-400">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Re-scan button (scan mode, after scan) ── */}
      {mode === 'scan' && hasScanned && !isScanLoading && (
        <div className="px-4 pb-2">
          <button
            onClick={handleRescan}
            className="w-full py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Re-scan Resume
          </button>
        </div>
      )}

      {/* ── Input ── */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              !isConfigured
                ? 'Configure API key to use AI'
                : mode === 'scan'
                ? 'Ask a follow-up about your resume…'
                : 'Ask me anything…'
            }
            disabled={!isConfigured || isLoading || isScanLoading}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isScanLoading || !isConfigured}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center self-end"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
