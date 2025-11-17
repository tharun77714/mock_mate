// Groq API service (switched from Gemini)
// Note: In Vite, environment variables must be prefixed with VITE_ to be accessible in the frontend
// Add VITE_GROQ_API_KEY=your_api_key to your .env file in the root directory
// WARNING: Exposing API keys in frontend code is a security risk. For production, use a backend proxy.
const GROQ_API_KEY = (import.meta.env.VITE_GROQ_API_KEY || '').trim();
// Groq API endpoint (OpenAI-compatible format)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Using llama-3.1-70b-versatile model (fast and powerful)
const GROQ_MODEL = 'llama-3.1-70b-versatile';

// Debug: Log the key status (first 10 chars only for security)
if (typeof window !== 'undefined') {
    console.log('Groq API Key Status:', {
        hasKey: !!GROQ_API_KEY,
        keyLength: GROQ_API_KEY.length,
        keyPreview: GROQ_API_KEY ? GROQ_API_KEY.substring(0, 10) + '...' : 'NOT SET',
        fullEnv: import.meta.env.VITE_GROQ_API_KEY ? 'Set' : 'Not set',
        model: GROQ_MODEL
    });
}

export interface GroqMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function callGroqAPI(prompt: string, conversationHistory: GroqMessage[] = []): Promise<string> {
    if (!GROQ_API_KEY || GROQ_API_KEY.trim() === '') {
        const errorMsg = 'GROQ_API_KEY is not set. Please add VITE_GROQ_API_KEY=your_api_key to your .env file in the ai-resume-analyzer directory and restart the dev server.';
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    
    // Log first few characters to help debug (without exposing full key)
    console.log('Using Groq API key:', GROQ_API_KEY.substring(0, 10) + '...');

    // Build messages array for Groq (OpenAI-compatible format)
    const messages: GroqMessage[] = conversationHistory.length > 0
        ? [...conversationHistory, { role: 'user', content: prompt }]
        : [{ role: 'user', content: prompt }];

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || errorData.error?.type || `HTTP ${response.status}`;
            console.error('Groq API Error Details:', errorData);
            
            // Provide more helpful error messages
            if (errorMsg.includes('API key') || errorMsg.includes('unauthorized') || errorMsg.includes('Invalid')) {
                throw new Error(`Invalid Groq API Key. Please check:
1. Your API key is correct (get one from https://console.groq.com/keys)
2. The key is set as VITE_GROQ_API_KEY in your .env file
3. You've restarted the dev server after adding the key
4. The API key hasn't been revoked or expired`);
            } else if (errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
                throw new Error('Groq API quota exceeded. Please check your usage limits.');
            } else {
                throw new Error(`Groq API error: ${errorMsg}. Please check your API key and try again.`);
            }
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const text = data.choices[0].message.content;
            if (!text) {
                throw new Error('Empty response from Groq API');
            }
            return text;
        }
        
        console.error('Unexpected response format:', data);
        throw new Error('Unexpected response format from Groq API');
    } catch (error) {
        console.error('Error calling Groq API:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to connect to Groq API. Please check your internet connection and API key.');
    }
}

export async function generateQuestions(resumeText: string, pros: string[], cons: string[]): Promise<string[]> {
    const prosText = pros.length > 0 ? `Pros:\n${pros.map(p => `- ${p}`).join('\n')}` : 'No specific pros identified.';
    const consText = cons.length > 0 ? `Cons:\n${cons.map(c => `- ${c}`).join('\n')}` : 'No specific cons identified.';

    const prompt = `You are a professional resume enhancement assistant. Based on the following resume and feedback, generate 5-7 specific questions that will help improve the resume. Focus on areas that need improvement.

Resume:
${resumeText.substring(0, 2000)}${resumeText.length > 2000 ? '...' : ''}

Feedback:
${prosText}

${consText}

Generate 5-7 questions as a JSON array of strings. Each question should be specific and actionable. Return ONLY the JSON array, no other text, no markdown, no code blocks.

Example format: ["Question 1?", "Question 2?", "Question 3?"]`;

    try {
        if (!GROQ_API_KEY) {
            throw new Error('API key not configured');
        }
        
        const response = await callGroqAPI(prompt);
        // Try to parse the response as JSON
        let cleaned = response.trim();
        // Remove markdown code blocks if present
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        // Remove any leading/trailing brackets or quotes that might be outside the array
        if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
            // Good, it's already an array
        } else {
            // Try to extract the array
            const match = cleaned.match(/\[.*\]/s);
            if (match) {
                cleaned = match[0];
            }
        }
        
        const questions = JSON.parse(cleaned);
        
        if (Array.isArray(questions) && questions.length > 0) {
            return questions.slice(0, 7); // Limit to 7 questions max
        }
        throw new Error('Invalid response format - not an array');
    } catch (error) {
        console.error('Error generating questions with Groq:', error);
        console.warn('Using fallback questions');
        // Fallback questions
        return [
            'What specific achievements or projects can you add to strengthen your experience?',
            'Are there any relevant skills or certifications you haven\'t included?',
            'What quantifiable results or metrics can you add to your work experience?',
            'Are there any gaps in your resume that need to be addressed?',
            'What additional details about your education or training would be valuable?'
        ];
    }
}

export async function enhanceResume(
    resumeText: string,
    pros: string[],
    cons: string[],
    questions: string[],
    answers: string[]
): Promise<string> {
    const prosText = pros.length > 0 ? `Pros:\n${pros.map(p => `- ${p}`).join('\n')}` : 'No specific pros identified.';
    const consText = cons.length > 0 ? `Cons:\n${cons.map(c => `- ${c}`).join('\n')}` : 'No specific cons identified.';
    
    const qaPairs = questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || 'No answer provided'}`).join('\n\n');

    const prompt = `You are a professional resume writer. Based on the original resume, feedback, and the user's answers to improvement questions, create an enhanced version of the resume.

Original Resume:
${resumeText}

Original Feedback:
${prosText}

${consText}

Questions and Answers:
${qaPairs}

Please create an enhanced resume with:
1. Professional formatting with clear sections
2. Improved structure and organization
3. Better use of fonts and visual hierarchy
4. Enhanced content based on the user's answers
5. Strong action verbs and quantifiable achievements where possible
6. Proper spacing and readability

Return the enhanced resume in a clean, well-formatted text format. Use markdown formatting for structure (headers, lists, etc.). Do not include any explanations or notes - just return the enhanced resume content.`;

    try {
        const enhancedResume = await callGroqAPI(prompt);
        return enhancedResume;
    } catch (error) {
        console.error('Error enhancing resume:', error);
        throw new Error('Failed to enhance resume. Please try again.');
    }
}

