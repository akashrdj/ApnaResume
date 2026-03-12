import React, { useState } from 'react';
import { testGeminiAPI } from '../lib/testGemini';
import { Sparkles, Loader2, Check, AlertCircle, ExternalLink } from 'lucide-react';

export function GeminiAPITester() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const testResult = await testGeminiAPI();
      setResult(testResult);
      setShowDetails(true);
    } catch (error) {
      setResult({
        success: false,
        message: '❌ Test failed',
        details: { error: 'UNEXPECTED_ERROR', message: String(error) }
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!showDetails ? (
        <button
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50"
        >
          {testing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Testing API...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Test Gemini API
            </>
          )}
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-6 max-w-md animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {result?.success ? (
                <div className="bg-green-100 p-2 rounded-full">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900">API Test Result</h3>
                <p className={`text-sm ${result?.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result?.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>

          {result?.details && (
            <div className="space-y-3">
              {result.success ? (
                <div className="bg-green-50 rounded-lg p-4 text-sm">
                  <p className="text-green-800 font-medium mb-2">✓ Connection Successful</p>
                  <div className="space-y-1 text-green-700">
                    <p><span className="font-semibold">Model:</span> {result.details.model}</p>
                    <p><span className="font-semibold">API Key:</span> {result.details.apiKey}</p>
                    <p><span className="font-semibold">Status:</span> {result.details.status}</p>
                    {result.details.testResponse && (
                      <p><span className="font-semibold">Test Response:</span> "{result.details.testResponse}"</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 rounded-lg p-4 text-sm">
                  <p className="text-red-800 font-semibold mb-2">Error Details:</p>
                  <div className="space-y-2 text-red-700">
                    <p><span className="font-semibold">Type:</span> {result.details.error}</p>
                    {result.details.message && (
                      <p className="text-xs bg-red-100 p-2 rounded font-mono">{result.details.message}</p>
                    )}
                    {result.details.help && (
                      <p className="text-red-800 font-medium">{result.details.help}</p>
                    )}
                    {result.details.steps && (
                      <div className="mt-3">
                        <p className="font-semibold text-red-900 mb-1">Setup Steps:</p>
                        <ol className="list-decimal ml-4 space-y-1 text-xs">
                          {result.details.steps.map((step: string, idx: number) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleTest}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm"
                >
                  Test Again
                </button>
                {!result.success && (
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
                  >
                    Get API Key
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
