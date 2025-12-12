import React, { useState } from 'react';

interface Props {
  onAnalyze: (text: string, isPdf: boolean) => void;
  isLoading: boolean;
}

const AnalysisInput: React.FC<Props> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  
  // URL Fetching State
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Extract base64 part
          const base64 = result.split(',')[1];
          setPdfData(base64);
          setFileName(file.name);
          setText(''); // Clear text if file is selected
        };
        reader.readAsDataURL(file);
      } else {
        // Try to read as text for other formats
        const reader = new FileReader();
        reader.onload = () => {
           setText(reader.result as string);
           setFileName(file.name);
           setPdfData(null);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleUrlFetch = async () => {
    if (!url) return;
    setIsFetching(true);
    setFetchError(null);
    
    try {
      // Use a CORS proxy to bypass browser restrictions for the demo
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) throw new Error("Failed to fetch URL");
      
      const html = await response.text();

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Cleanup DOM
      const toRemove = doc.querySelectorAll('script, style, nav, header, footer, iframe, noscript');
      toRemove.forEach(el => el.remove());

      // Heuristic extraction for common job boards
      let extractedText = '';
      const selectors = [
        '#jobDescriptionText', // Indeed
        '.description__text', // LinkedIn (public)
        '.job-description',   // Generic
        '[data-testid="job-description"]', // Glassdoor/Various
        '.jobDescriptionContent', // Glassdoor
        'article',
        'main'
      ];

      for (const selector of selectors) {
        const element = doc.querySelector(selector);
        if (element && element.textContent && element.textContent.length > 200) {
          extractedText = element.textContent;
          break;
        }
      }

      // Fallback to body if specific selectors fail
      if (!extractedText) {
        extractedText = doc.body.innerText || doc.body.textContent || '';
      }

      // Clean up whitespace
      extractedText = extractedText.replace(/\s+/g, ' ').trim();

      if (extractedText.length < 100) {
        throw new Error("Could not extract meaningful content. The site might be blocking scrapers.");
      }

      setText(extractedText);
      setFileName(null);
      setPdfData(null);
      setFetchError(null);
    } catch (err: any) {
      console.error(err);
      setFetchError("Could not retrieve content. The site may block access. Please copy/paste the text instead.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = () => {
    if (pdfData) {
      onAnalyze(pdfData, true);
    } else {
      onAnalyze(text, false);
    }
  };

  const handleClear = () => {
    setText('');
    setFileName(null);
    setPdfData(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto mt-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Job Analysis Input</h2>
        <p className="text-slate-500 text-sm">Paste a job description, enter a URL, or upload a PDF.</p>
      </div>

      <div className="space-y-4">
        
        {/* URL Input Section */}
        <div className="flex gap-2">
           <input 
             type="url" 
             placeholder="https://www.linkedin.com/jobs/..."
             className="flex-1 px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 text-sm"
             value={url}
             onChange={(e) => setUrl(e.target.value)}
             disabled={isFetching || isLoading}
           />
           <button
             onClick={handleUrlFetch}
             disabled={!url || isFetching || isLoading}
             className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
           >
             {isFetching ? 'Fetching...' : 'Fetch URL'}
           </button>
        </div>

        {fetchError && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
            {fetchError}
          </div>
        )}

        <div className="relative">
          <textarea
            className={`w-full h-48 p-4 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-700 ${fileName ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder={fileName ? `File selected: ${fileName}` : "Job title, responsibilities, and requirements..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!!fileName || isLoading}
          />
          {fileName && (
            <button 
              onClick={handleClear}
              className="absolute top-4 right-4 text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded"
            >
              Remove File
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <label className={`flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors text-sm font-medium ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              {fileName ? 'Change File' : 'Upload Job PDF/Text'}
              <input type="file" className="hidden" accept=".pdf,.txt,.md" onChange={handleFileChange} disabled={isLoading} />
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={(!text && !fileName) || isLoading}
            className={`w-full sm:w-auto px-8 py-2.5 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all ${
              (!text && !fileName) || isLoading
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                Analyze Impact
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisInput;