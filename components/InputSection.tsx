
import React from 'react';

interface InputSectionProps {
  generationMode: 'resume' | 'coverLetter' | 'applicationLetter';
  setGenerationMode: (mode: 'resume' | 'coverLetter' | 'applicationLetter') => void;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  originalResume: string;
  setOriginalResume: (value: string) => void;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ModeSwitcher: React.FC<{
    mode: 'resume' | 'coverLetter' | 'applicationLetter';
    setMode: (mode: 'resume' | 'coverLetter' | 'applicationLetter') => void;
}> = ({ mode, setMode }) => (
    <div className="flex w-full bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
        <button
            onClick={() => setMode('resume')}
            className={`w-1/3 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 ${mode === 'resume' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow' : 'text-slate-600 dark:text-slate-300'}`}
            aria-pressed={mode === 'resume'}
        >
            Resume
        </button>
        <button
            onClick={() => setMode('coverLetter')}
            className={`w-1/3 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 ${mode === 'coverLetter' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow' : 'text-slate-600 dark:text-slate-300'}`}
            aria-pressed={mode === 'coverLetter'}
        >
            Cover Letter
        </button>
        <button
            onClick={() => setMode('applicationLetter')}
            className={`w-1/3 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 ${mode === 'applicationLetter' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow' : 'text-slate-600 dark:text-slate-300'}`}
            aria-pressed={mode === 'applicationLetter'}
        >
            Application Letter
        </button>
    </div>
);


const SingleLineInput: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    icon: React.ReactNode;
}> = ({ id, label, value, onChange, placeholder, icon }) => (
    <div>
        <label htmlFor={id} className="flex items-center gap-2 mb-2 text-lg font-semibold text-slate-700 dark:text-slate-300">
            {icon}
            {label}
        </label>
        <input
            type="text"
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            aria-label={label}
        />
    </div>
);


const TextInput: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    rows: number;
    icon: React.ReactNode;
}> = ({ id, label, value, onChange, placeholder, rows, icon }) => (
    <div>
        <label htmlFor={id} className="flex items-center gap-2 mb-2 text-lg font-semibold text-slate-700 dark:text-slate-300">
            {icon}
            {label}
        </label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            aria-label={label}
        />
    </div>
);


export const InputSection: React.FC<InputSectionProps> = ({
  generationMode,
  setGenerationMode,
  jobTitle,
  setJobTitle,
  companyName,
  setCompanyName,
  jobDescription,
  setJobDescription,
  originalResume,
  setOriginalResume,
  resumeFile,
  setResumeFile,
  onSubmit,
  isLoading,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setOriginalResume(''); // Clear textarea if file is chosen
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleResumeTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setOriginalResume(e.target.value);
      if(e.target.value) {
          handleRemoveFile(); // clear file if user starts typing
      }
  }

  return (
    <div className="space-y-6 bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      <ModeSwitcher mode={generationMode} setMode={setGenerationMode} />
      <SingleLineInput
        id="job-title"
        label="Job Title"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        placeholder="e.g., Senior Software Engineer"
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3.3.5-.7.5-1.1V6.5L15.5 2z"/><path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"/><path d="M15 2v5h5"/></svg>}
       />
      {(generationMode === 'coverLetter' || generationMode === 'applicationLetter') && (
        <SingleLineInput
            id="company-name"
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Acme Corporation"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>}
        />
      )}
      <TextInput
        id="job-description"
        label="Job Description"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the full job description here..."
        rows={10}
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M5 12v6"/><path d="M5 18v-6"/></svg>}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
            <label htmlFor="original-resume" className="flex items-center gap-2 text-lg font-semibold text-slate-700 dark:text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M12 8v4"/><path d="M8 8h.01"/><path d="M16 8h.01"/></svg>
                Your Resume
            </label>
            <input
                type="file"
                id="resume-file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.txt"
                aria-label="Upload resume file"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
                Browse file...
            </button>
        </div>

        {resumeFile && (
            <div className="flex items-center justify-between bg-indigo-50 dark:bg-slate-700/50 p-2 rounded-md mb-2 text-sm">
                <span className="truncate text-slate-700 dark:text-slate-300">{resumeFile.name}</span>
                <button onClick={handleRemoveFile} className="p-1 rounded-full hover:bg-indigo-200 dark:hover:bg-slate-600" aria-label="Remove file">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-400"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        )}

        <textarea
            id="original-resume"
            value={originalResume}
            onChange={handleResumeTextChange}
            placeholder={resumeFile ? "Resume uploaded. You can now submit." : "Paste your current resume or browse a file..."}
            rows={15}
            disabled={!!resumeFile}
            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
            aria-label="Your Resume"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {
                    generationMode === 'resume' ? 'Tailor My Resume' : 
                    generationMode === 'coverLetter' ? 'Generate Cover Letter' : 
                    'Generate Application Letter'
                }
            </>
        )}
      </button>
    </div>
  );
};
