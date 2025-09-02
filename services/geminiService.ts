
import { GoogleGenAI, Type, Part } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const unifiedResponseSchema = {
    type: Type.OBJECT,
    properties: {
        candidateName: {
            type: Type.STRING,
            description: "The full name of the candidate, extracted from their resume. This will be used for the filename."
        },
        documentMarkdown: {
            type: Type.STRING,
            description: "The full Markdown content for the generated document (resume, cover letter, or application letter)."
        }
    },
    required: ["candidateName", "documentMarkdown"],
};

interface GenerationParams {
    generationMode: 'resume' | 'coverLetter' | 'applicationLetter';
    jobDescription: string;
    originalResume: string;
    jobTitle: string;
    companyName: string;
    resumeFile: { data: string; mimeType: string } | null;
}

export const generateDocument = async (params: GenerationParams): Promise<{ document: string; candidateName: string; }> => {
    const { generationMode, jobDescription, originalResume, jobTitle, companyName, resumeFile } = params;

    const systemInstruction = `You are an expert career coach, resume writer, and document designer. Your task is to generate a professional document based on the user's request. You will analyze the provided inputs and the specified 'generationMode' to create either a tailored resume, a cover letter, or a formal application letter. You must adhere strictly to the formatting rules for the selected mode and return the output in the specified JSON schema.`;
    
    const prompt = `
        **Primary Directive: Generate a Professional Document**

        Your task is to generate a single, complete Markdown string for the 'documentMarkdown' field based on the specified **generationMode**. You must also extract the candidate's name for the 'candidateName' field.

        **Generation Mode:** ${generationMode}

        ---
        ***IF a File is provided, ANALYZE IT first for all necessary candidate information.***
        ---

        **[BEGIN RULES FOR 'resume' MODE]**
        If the generationMode is 'resume', create a tailored, single-column resume.

        **Resume Structure & Markdown Guidelines:**
        1.  **Header (CRITICAL):**
            -   **Line 1: Candidate Name:** A Level 1 Markdown Heading (\`#\`) with the candidate's full name in ALL CAPS. Example: \`# PETER MENSAH\`.
            -   **Line 2: Contact Details:** A single line of text with Mobile, Email, and Address, each with a bolded label and separated by a pipe (\`|\`). Example: \`**Mobile:** +233240957500 | **Email:** ing.mensah@outlook.com | **Address:** 13 Cauliflower St.\`
            -   **Line 3: Professional Links:** A single line with clickable Markdown links for profiles like LinkedIn, Portfolio, separated by a pipe (\`|\`). Example: \`[LinkedIn](url) | [Portfolio](url)\`
        2.  **Professional Summary:**
            -   Heading: \`## PROFESSIONAL SUMMARY\`.
            -   A concise, 2-4 sentence summary tailored for the **${jobTitle}** role.
        3.  **Technical Skills / Professional Capabilities:**
            -   Heading: \`## TECHNICAL SKILLS\` (or a similar title).
            -   Organize skills into logical categories (e.g., Programming, Cloud Platforms). Format clearly, e.g., \`**Programming:** Python | Java | Go\`.
        4.  **Professional Experience:**
            -   Heading: \`## PROFESSIONAL EXPERIENCE\`.
            -   List jobs in reverse chronological order. Structure: \`### Job Title\`, followed by \`_Company Name, Location | Dates_\`, then 3-5 bullet points with achievements.
        5.  **Education:**
            -   Heading: \`## EDUCATION\`.
            -   Structure: \`### Degree Name, Major\`, followed by \`_University, Location | Graduation Date_\`.
        6.  **Optional Sections:**
            -   Include sections like \`## CERTIFICATIONS\`, \`## INTERESTS\`, \`## ADDITIONAL SKILLS\`, or \`## REFERENCES\` if relevant information is available. For References, use "_Available upon request._".

        **[END RULES FOR 'resume' MODE]**

        ---

        **[BEGIN RULES FOR 'coverLetter' MODE]**
        If the generationMode is 'coverLetter', revise the provided information into a clear, confident, and impactful professional cover letter.

        **Cover Letter Structure & Guidelines:**
        1.  **Header (CRITICAL):**
            -   Create a professional multi-line header. Each item MUST be on its own line:
                -   Line 1: \`**Full Name**\`
                -   Line 2: Pronouns (Optional, e.g., she/her)
                -   Line 3: City, State
                -   Line 4: Email Address
                -   Line 5: Phone Number
                -   Line 6: Professional links as Markdown: \`[LinkedIn](url) | [Portfolio](url)\`
        2.  **Date & Recipient:**
            -   Add a blank line, then the current date.
            -   Add another blank line, then the recipient's details (Hiring Manager, ${companyName}, Company Address).
        3.  **Body:**
            -   Start with a formal salutation (e.g., "Dear Hiring Team,").
            -   Write 3-4 concise paragraphs with a confident and engaging tone.
            -   **Crucially, connect the applicant's past experiences to the requirements of the new role.** Highlight transferable skills.
        4.  **Closing:**
            -   End with a professional closing (e.g., "Sincerely,"), followed by the applicant's typed name.
        5.  **Formatting:** Ensure clean spacing between all sections for readability.

        **[END RULES FOR 'coverLetter' MODE]**
        
        ---

        **[BEGIN RULES FOR 'applicationLetter' MODE]**
        If the generationMode is 'applicationLetter', generate a simple, formal, and more general job application letter.

        **Application Letter Structure & Guidelines:**
        1.  **Header, Date, Recipient:** Follow the exact same structure as the 'coverLetter' mode. For the recipient's address, you may include a plausible placeholder if one is not provided.
        2.  **Body:**
            -   Start with a formal salutation.
            -   **Do not reference specific past jobs, companies, or projects from the resume.**
            -   The tone must be formal and professional.
            -   Highlight general, transferable skills like organization, problem-solving, adaptability, and professionalism.
        3.  **Closing:**
            -   Reiterate enthusiasm, state availability for an interview, and thank the reader.
            -   End with a formal closing ("Sincerely,") and the applicant's typed name.
        4.  **Formatting:** The structure must be clean, with blank lines separating each section for a classic, professional look.
        
        **[END RULES FOR 'applicationLetter' MODE]**

        ---
        **INPUTS FOR PROCESSING:**

        1.  **Target Job Title:** ${jobTitle}
        2.  **Target Company Name:** ${companyName || 'Not Applicable'}
        3.  **Target Job Description:**
            ---
            ${jobDescription}
            ---
        4.  **Candidate's Original Information:**
            ---
            ${resumeFile ? "The user has provided a file attachment. Analyze it to extract all necessary information (name, experience, skills, etc.) to generate the document." : originalResume}
            ---

        Now, generate the complete response in the required JSON format, populating the 'documentMarkdown' field according to the rules for the specified **generationMode**.
    `;

    try {
        const textPart = { text: prompt };
        const parts: Part[] = [textPart];
        if (resumeFile) {
            parts.push({
                inlineData: {
                    data: resumeFile.data,
                    mimeType: resumeFile.mimeType
                }
            });
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.25,
                topP: 0.95,
                topK: 40,
                responseMimeType: "application/json",
                responseSchema: unifiedResponseSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && result.candidateName && result.documentMarkdown) {
            return {
                document: result.documentMarkdown,
                candidateName: result.candidateName
            };
        } else {
            throw new Error("The API returned an unexpected data structure. Missing required fields.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate the document. The model may be unavailable or the input may be invalid. Please try again.");
    }
};
