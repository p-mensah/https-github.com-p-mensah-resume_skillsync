import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import { marked } from 'marked';

interface OutputSectionProps {
  mainContent: string;
  sidebarContent: string;
  generationMode: 'resume' | 'coverLetter' | 'applicationLetter';
  isLoading: boolean;
  error: string | null;
  candidateName: string;
}

const LoadingIndicator: React.FC = () => {
    const stages = [
        { message: "Initializing AI model...", progress: 5 },
        { message: "Parsing job description...", progress: 15 },
        { message: "Analyzing your resume...", progress: 30 },
        { message: "Identifying key skills & experiences...", progress: 45 },
        { message: "Crafting tailored content...", progress: 60 },
        { message: "Structuring the document...", progress: 75 },
        { message: "Finalizing professional formatting...", progress: 90 },
        { message: "Almost ready...", progress: 98 },
    ];
    const [currentStageIndex, setCurrentStageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStageIndex(prevIndex => {
                if (prevIndex >= stages.length - 1) {
                    clearInterval(interval);
                    return prevIndex;
                }
                return prevIndex + 1;
            });
        }, 1800);

        return () => clearInterval(interval);
    }, []);

    const { message, progress } = stages[currentStageIndex];

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 w-full">
            <svg className="animate-spin h-12 w-12 text-indigo-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">{message}</p>
            <div className="w-full max-w-sm bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                    aria-label="Generation progress"
                ></div>
            </div>
        </div>
    );
};

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-medium py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2"
            title="Copy to clipboard"
        >
            {copied ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Copied!
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    Copy
                </>
            )}
        </button>
    );
};


export const OutputSection: React.FC<OutputSectionProps> = ({ mainContent, sidebarContent, generationMode, isLoading, error, candidateName }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [mainHtml, setMainHtml] = useState('');

  const parseMarkdown = async (markdown: string) => {
    return await marked.parse(markdown, {
        breaks: true,
        gfm: true,
    });
  };

  useEffect(() => {
    if (mainContent) {
      parseMarkdown(mainContent).then(setMainHtml);
    } else {
      setMainHtml('');
    }
  }, [mainContent]);
  

  const getFilename = (extension: 'pdf' | 'doc') => {
    const sanitizedName = candidateName
        .trim()
        .replace(/[^a-zA-Z0-9\s-]/g, '') // remove most special chars
        .replace(/\s+/g, '_');          // replace spaces with underscores

    const baseName = sanitizedName || 'Candidate';

    switch(generationMode) {
      case 'resume':
        return `${baseName}_Resume.${extension}`;
      case 'coverLetter':
        return `${baseName}_Cover_Letter.${extension}`;
      case 'applicationLetter':
        return `${baseName}_Application_Letter.${extension}`;
      default:
        return `Generated_Document.${extension}`;
    }
  }

  const getHtmlForExport = () => {
    return mainHtml;
  }

  const getAllStyles = () => {
      let allCss = '';
      for (const sheet of Array.from(document.styleSheets)) {
          try {
              if (sheet.cssRules) {
                  for (const rule of Array.from(sheet.cssRules)) {
                      allCss += rule.cssText;
                  }
              }
          } catch (e) {
              console.warn(`Could not read CSS rules from stylesheet: ${sheet.href}`, e);
          }
      }
      return allCss;
  };

  const handleDownloadPDF = () => {
    const htmlToExport = getHtmlForExport();
    if (!htmlToExport) return;
    
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });
    
    const styles = getAllStyles();
    const wrapperClasses = "printable-output prose prose-slate";
    
    const htmlString = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset='utf-8'>
          <title>Generated Document</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="${wrapperClasses}" style="width: 515pt;">
            ${htmlToExport}
          </div>
        </body>
      </html>
    `;

    doc.html(htmlString, {
      callback: function(doc) {
        doc.save(getFilename('pdf'));
      },
      x: 40,
      y: 40,
      html2canvas: {
          scale: 0.75,
          useCORS: true
      },
      width: 515,
      windowWidth: 595,
    });
  };


  const handleDownloadDoc = () => {
    const htmlToExport = getHtmlForExport();
    if (!htmlToExport) return;

    const styles = getAllStyles();
    const wrapperClasses = "printable-output prose prose-slate";
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Generated Document</title><style>" + styles + "</style></head><body>" +
      `<div class="${wrapperClasses}">`;

    const footer = "</div></body></html>";
    const sourceHTML = header + htmlToExport + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = getFilename('doc');
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };


  const getPlaceholder = () => {
    switch(generationMode) {
      case 'resume':
        return {
          title: "Your Professional Resume",
          text: "Your AI-generated resume will appear here in a classic, single-column format."
        };
      case 'coverLetter':
        return {
          title: "Your Generated Cover Letter",
          text: "Your AI-generated cover letter will appear here once you provide the inputs and click the button."
        };
      case 'applicationLetter':
        return {
          title: "Your Generated Application Letter",
          text: "Your AI-generated application letter will appear here once you provide the inputs and click the button."
        }
      default:
        return { title: "", text: "" };
    }
  }

  const hasContent = !!mainContent;

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-slate-200 min-h-[500px] lg:sticky lg:top-24">
      <div className="relative h-full">
        {isLoading && <LoadingIndicator />}

        {error && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mb-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">An Error Occurred</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{error}</p>
            </div>
        )}

        {!isLoading && !error && hasContent && (
            <>
              <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
                <CopyButton textToCopy={mainContent} />
                <button
                    onClick={handleDownloadPDF}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-medium py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2"
                    aria-label="Download as PDF"
                    title="Download as PDF"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>PDF</span>
                </button>
                <button
                    onClick={handleDownloadDoc}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-medium py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2"
                    aria-label="Download as DOC"
                    title="Download as DOC"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>DOC</span>
                </button>
              </div>
              <div ref={contentRef} className="printable-output overflow-y-auto w-full h-full pt-12">
                <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: mainHtml }} />
              </div>
            </>
        )}

        {!isLoading && !error && !hasContent && (
           <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
            <>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{getPlaceholder().title}</h3>
                <p className="mt-1 max-w-md">{getPlaceholder().text}</p>
            </>
           </div>
        )}
      </div>
    </div>
  );
};