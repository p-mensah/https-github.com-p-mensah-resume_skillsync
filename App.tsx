
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
      <header className="bg-white dark:bg-slate-800/50 shadow-sm sticky top-0 z-10 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3.3.5-.7.5-1.1V6.5L15.5 2z"/><path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"/><path d="M15 2v5h5"/></svg>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Resume Tailor SkillSync
            </h1>
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
