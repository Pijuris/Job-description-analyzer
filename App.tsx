import React, { useState } from 'react';
import AnalysisInput from './components/AnalysisInput';
import Dashboard from './components/Dashboard';
import { analyzeJobPosting } from './services/geminiService';
import { calculateMetrics } from './utils/calculations';
import { FullReport, RawAnalysisResponse } from './types';

function App() {
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async (content: string, isPdf: boolean) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const rawData: RawAnalysisResponse = await analyzeJobPosting(content, isPdf);
      // calculateMetrics now returns the complete FullReport including processed tasks
      const fullReport: FullReport = calculateMetrics(rawData);

      setReport(fullReport);
    } catch (err: any) {
      console.error("Analysis Failed:", err);
      setError(err.message || "Failed to analyze the job posting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">Transferability<span className="text-indigo-600">AI</span></span>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 3.0 Pro
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!report && (
          <div className="text-center max-w-2xl mx-auto mt-12 mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Workforce Intelligence
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Upload a job description to generate a comprehensive <strong>GenAI Transferability Report</strong>. 
              We calculate automation potential and human-AI augmentation opportunities using advanced task-level analysis.
            </p>
          </div>
        )}

        <AnalysisInput onAnalyze={handleAnalysis} isLoading={loading} />

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-4xl mx-auto flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
             {error}
          </div>
        )}

        {loading && (
           <div className="mt-12 text-center">
             <div className="inline-block animate-pulse">
               <div className="h-4 w-64 bg-slate-200 rounded mb-2"></div>
               <div className="h-4 w-48 bg-slate-200 rounded"></div>
             </div>
             <p className="text-slate-500 mt-4 text-sm">Reasoning about tasks and skills (Thinking Mode Active)...</p>
           </div>
        )}

        {report && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">{report.jobTitle}</h2>
              <span className="text-sm text-slate-400">Analyzed {new Date(report.analysisDate).toLocaleDateString()}</span>
            </div>
            <Dashboard report={report} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Transferability AI. Analysis powered by Google Gemini.
        </div>
      </footer>
    </div>
  );
}

export default App;