
import React, { useState, useCallback, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { generateDocument } from './services/geminiService';

const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const data = result.split(',')[1];
            resolve({ data, mimeType: file.type });
        };
        reader.onerror = (error) => reject(error);
    });
};

const ThemeSwitcher: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void; }> = ({ theme, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors duration-200"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            )}
        </button>
    );
};


const App = () => {
  const [generationMode, setGenerationMode] = useState<'resume' | 'coverLetter' | 'applicationLetter'>('resume');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [originalResume, setOriginalResume] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [mainContent, setMainContent] = useState('');
  const [sidebarContent, setSidebarContent] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    setMainContent('');
    setSidebarContent('');
    setError(null);
  }, [generationMode]);

  const handleGenerate = useCallback(async () => {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      setError('Please provide a job title and a job description.');
      return;
    }
    if ((generationMode === 'coverLetter' || generationMode === 'applicationLetter') && !companyName.trim()) {
      setError('Please provide a company name for the letter.');
      return;
    }
    if (!originalResume.trim() && !resumeFile) {
        setError('Please provide your resume by pasting text or uploading a file.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setMainContent('');
    setSidebarContent('');

    try {
      let resumeFileData: { data: string; mimeType: string } | null = null;
      if (resumeFile) {
        resumeFileData = await fileToBase64(resumeFile);
      }
      
      const result = await generateDocument({
          generationMode,
          jobDescription,
          originalResume,
          jobTitle,
          companyName,
          resumeFile: resumeFileData
      });

      setMainContent(result.document);
      setCandidateName(result.candidateName);
      setSidebarContent('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [
      generationMode, 
      jobTitle,
      companyName,
      jobDescription, 
      originalResume, 
      resumeFile,
    ]);

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white/80 dark:bg-slate-900/80 shadow-sm sticky top-0 z-10 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3.3.5-.7.5-1.1V6.5L15.5 2z"/><path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"/><path d="M15 2v5h5"/></svg>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Resume Tailor SkillSync
                </h1>
            </div>
            <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <InputSection
            generationMode={generationMode}
            setGenerationMode={setGenerationMode}
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            companyName={companyName}
            setCompanyName={setCompanyName}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            originalResume={originalResume}
            setOriginalResume={setOriginalResume}
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            onSubmit={handleGenerate}
            isLoading={isLoading}
          />
          <OutputSection
            generationMode={generationMode}
            mainContent={mainContent}
            sidebarContent={sidebarContent}
            isLoading={isLoading}
            error={error}
            candidateName={candidateName}
          />
        </div>
      </main>

       <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Powered by Google Gemini. Built with React & Tailwind CSS.</p>
       </footer>
    </div>
  );
};

export default App;
