import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { generateQuestions, enhanceResume } from "~/lib/gemini"; // Note: File name kept as gemini.ts but now uses Groq API
import { extractTextFromPdf } from "~/lib/pdf2text";

export const meta = () => ([
    { title: 'Enhance Resume' },
    { name: 'description', content: 'Enhance your resume with AI assistance' },
])

const Enhance = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [step, setStep] = useState<'loading' | 'questions' | 'enhancing' | 'complete'>('loading');
    const [resumeText, setResumeText] = useState('');
    const [pros, setPros] = useState<string[]>([]);
    const [cons, setCons] = useState<string[]>([]);
    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [enhancedResume, setEnhancedResume] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate(`/auth?next=/resume/${id}/enhance`);
        }
    }, [isLoading, auth.isAuthenticated, id, navigate]);

    useEffect(() => {
        const loadResumeData = async () => {
            try {
                const resume = await kv.get(`resume:${id}`);
                if (!resume) {
                    setError('Resume not found');
                    return;
                }

                const data = JSON.parse(resume);
                const feedback = data.feedback;

                // Extract resume text from PDF
                const resumeBlob = await fs.read(data.resumePath);
                if (!resumeBlob) {
                    setError('Could not load resume file');
                    return;
                }

                // Create PDF URL for display
                const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                setResumeUrl(pdfUrl);

                // Load image for display
                try {
                    const imageBlob = await fs.read(data.imagePath);
                    if (imageBlob) {
                        const imgUrl = URL.createObjectURL(imageBlob);
                        setImageUrl(imgUrl);
                    } else {
                        console.warn('Image blob not found, will show PDF directly');
                    }
                } catch (err) {
                    console.warn('Could not load image, will show PDF directly:', err);
                }

                // Extract text from PDF
                let extractedText = '';
                try {
                    const pdfFile = new File([resumeBlob], 'resume.pdf', { type: 'application/pdf' });
                    extractedText = await extractTextFromPdf(pdfFile);
                } catch (err) {
                    console.warn('Could not extract text from PDF, using fallback:', err);
                    // Fallback: create a basic text structure
                    extractedText = `Resume Analysis:
Overall Score: ${feedback.overallScore}/100
ATS Score: ${feedback.ATS?.score || 0}/100

This resume needs enhancement based on the feedback provided.`;
                }

                // Extract pros and cons from feedback
                const prosList: string[] = [];
                const consList: string[] = [];

                // Collect pros (good tips)
                if (feedback.toneAndStyle?.tips) {
                    feedback.toneAndStyle.tips
                        .filter((tip: any) => tip.type === 'good')
                        .forEach((tip: any) => prosList.push(tip.tip));
                }
                if (feedback.content?.tips) {
                    feedback.content.tips
                        .filter((tip: any) => tip.type === 'good')
                        .forEach((tip: any) => prosList.push(tip.tip));
                }
                if (feedback.structure?.tips) {
                    feedback.structure.tips
                        .filter((tip: any) => tip.type === 'good')
                        .forEach((tip: any) => prosList.push(tip.tip));
                }
                if (feedback.skills?.tips) {
                    feedback.skills.tips
                        .filter((tip: any) => tip.type === 'good')
                        .forEach((tip: any) => prosList.push(tip.tip));
                }
                if (feedback.ATS?.tips) {
                    feedback.ATS.tips
                        .filter((tip: any) => tip.type === 'good')
                        .forEach((tip: any) => prosList.push(tip.tip));
                }

                // Collect cons (improve tips)
                if (feedback.toneAndStyle?.tips) {
                    feedback.toneAndStyle.tips
                        .filter((tip: any) => tip.type === 'improve')
                        .forEach((tip: any) => consList.push(tip.tip));
                }
                if (feedback.content?.tips) {
                    feedback.content.tips
                        .filter((tip: any) => tip.type === 'improve')
                        .forEach((tip: any) => consList.push(tip.tip));
                }
                if (feedback.structure?.tips) {
                    feedback.structure.tips
                        .filter((tip: any) => tip.type === 'improve')
                        .forEach((tip: any) => consList.push(tip.tip));
                }
                if (feedback.skills?.tips) {
                    feedback.skills.tips
                        .filter((tip: any) => tip.type === 'improve')
                        .forEach((tip: any) => consList.push(tip.tip));
                }
                if (feedback.ATS?.tips) {
                    feedback.ATS.tips
                        .filter((tip: any) => tip.type === 'improve')
                        .forEach((tip: any) => consList.push(tip.tip));
                }

                setPros(prosList);
                setCons(consList);
                setResumeText(extractedText);

                // Generate questions
                setStep('questions');
                setError(null); // Clear any previous errors
                try {
                    const generatedQuestions = await generateQuestions(extractedText, prosList, consList);
                    setQuestions(generatedQuestions);
                    setError(null); // Ensure error is cleared on success
                } catch (err) {
                    console.error('Error generating questions:', err);
                    // Use fallback questions silently
                    setQuestions([
                        'What specific achievements or projects can you add to strengthen your experience?',
                        'Are there any relevant skills or certifications you haven\'t included?',
                        'What quantifiable results or metrics can you add to your work experience?',
                        'Are there any gaps in your resume that need to be addressed?',
                        'What additional details about your education or training would be valuable?'
                    ]);
                    setError(null); // Don't show error, just use fallback
                }
            } catch (err) {
                console.error('Error loading resume data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load resume data');
            }
        };

        if (auth.isAuthenticated) {
            loadResumeData();
        }
    }, [id, auth.isAuthenticated, fs, kv]);

    const handleAnswerChange = (index: number, value: string) => {
        setAnswers(prev => ({ ...prev, [index]: value }));
    };

    const handleEnhance = async () => {
        // Check if all questions are answered
        const allAnswered = questions.every((_, index) => answers[index] && answers[index].trim() !== '');
        if (!allAnswered) {
            setError('Please answer all questions before enhancing the resume.');
            return;
        }

        setStep('enhancing');
        setError(null);

        try {
            const answerArray = questions.map((_, index) => answers[index] || '');
            console.log('Calling enhanceResume with:', { resumeTextLength: resumeText.length, pros: pros.length, cons: cons.length, questions: questions.length, answers: answerArray.length });
            const enhanced = await enhanceResume(resumeText, pros, cons, questions, answerArray);
            setEnhancedResume(enhanced);
            setStep('complete');
        } catch (err) {
            console.error('Error enhancing resume:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to enhance resume. Please try again.';
            setError(errorMessage);
            setStep('questions');
        }
    };

    const handleDownload = () => {
        const blob = new Blob([enhancedResume], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enhanced-resume-${id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (error && step === 'loading') {
        return (
            <main className="!pt-0">
                <nav className="resume-nav">
                    <Link to={`/resume/${id}`} className="back-button">
                        <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
                        <span className="text-white text-sm font-semibold">Back to Resume</span>
                    </Link>
                </nav>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 max-w-md">
                        <p className="text-red-400">{error}</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to={`/resume/${id}`} className="back-button">
                    <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Resume</span>
                </Link>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse gap-6">
                {/* Original Resume Display */}
                {resumeUrl && (
                    <section className="w-1/2 max-lg:w-full feedback-section h-[100vh] sticky top-0 flex items-center justify-center max-lg:h-auto max-lg:sticky-0 p-4" style={{
                        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(10, 10, 10, 0.95) 100%)'
                    }}>
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-full">
                            <div className="mb-4 rounded-lg p-3 shadow-sm" style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(30, 58, 138, 0.3)',
                                backdropFilter: 'blur(8px)'
                            }}>
                                <h3 className="text-lg font-bold text-center text-white">Original Resume</h3>
                            </div>
                            {imageUrl ? (
                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="block">
                                    <img
                                        src={imageUrl}
                                        className="w-full h-full object-contain rounded-2xl cursor-pointer"
                                        title="Original Resume - Click to open PDF"
                                        alt="Original Resume"
                                    />
                                </a>
                            ) : (
                                <div className="rounded-2xl p-4" style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(30, 58, 138, 0.3)',
                                    backdropFilter: 'blur(8px)'
                                }}>
                                    <iframe
                                        src={resumeUrl}
                                        className="w-full h-[600px] rounded-lg border"
                                        style={{ border: '1px solid rgba(30, 58, 138, 0.3)' }}
                                        title="Original Resume PDF"
                                    />
                                    <a 
                                        href={resumeUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block mt-4 text-center text-blue-400 hover:text-blue-300 underline transition-colors"
                                    >
                                        Open PDF in new tab
                                    </a>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                <section className="w-1/2 max-lg:w-full feedback-section p-6">
                    <h2 className="text-4xl font-bold mb-6 text-white">Enhance Your Resume</h2>

                    {step === 'loading' && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading resume data...</p>
                        </div>
                    </div>
                )}

                {step === 'questions' && (
                    <div className="space-y-6">
                        <div className="rounded-lg p-4 mb-6" style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(30, 58, 138, 0.3)',
                            backdropFilter: 'blur(8px)'
                        }}>
                            <h3 className="font-semibold text-white mb-2">Resume Feedback Summary</h3>
                            {pros.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-sm font-medium text-green-400 mb-1">Strengths:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-300">
                                        {pros.slice(0, 3).map((pro, i) => (
                                            <li key={i}>{pro}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {cons.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-amber-400 mb-1">Areas to Improve:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-300">
                                        {cons.slice(0, 3).map((con, i) => (
                                            <li key={i}>{con}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg shadow-md p-6" style={{
                            background: 'rgba(15, 23, 42, 0.7)',
                            border: '1px solid rgba(30, 58, 138, 0.25)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 40px rgba(30, 58, 138, 0.05)'
                        }}>
                            <h3 className="text-2xl font-bold mb-4 text-white">Answer These Questions</h3>
                            <p className="text-gray-400 mb-6">Your answers will help us create a better resume for you.</p>

                            {questions.map((question, index) => (
                                <div key={index} className="mb-6">
                                    <label className="block text-lg font-semibold text-white mb-2">
                                        {index + 1}. {question}
                                    </label>
                                    <textarea
                                        value={answers[index] || ''}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg focus:outline-none resize-none text-white"
                                        style={{
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '1px solid rgba(30, 58, 138, 0.3)',
                                            backdropFilter: 'blur(8px)'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                                            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.3)';
                                            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        rows={4}
                                        placeholder="Type your answer here..."
                                    />
                                </div>
                            ))}

                            {error && error.includes('answer all questions') && (
                                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4">
                                    <p className="text-red-400">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleEnhance}
                                disabled={questions.some((_, index) => !answers[index] || answers[index].trim() === '')}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Enhance Resume
                            </button>
                        </div>
                    </div>
                )}

                {step === 'enhancing' && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-400">Enhancing your resume with AI...</p>
                            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                        </div>
                    </div>
                )}

                {step === 'complete' && (
                    <div className="space-y-6">
                        <div className="rounded-lg p-4" style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(30, 58, 138, 0.3)',
                            backdropFilter: 'blur(8px)'
                        }}>
                            <h3 className="font-semibold text-green-400 mb-2">✓ Resume Enhanced Successfully!</h3>
                            <p className="text-sm text-gray-300">Your resume has been enhanced with better structure, formatting, and content.</p>
                        </div>

                        <div className="rounded-lg shadow-md p-6" style={{
                            background: 'rgba(15, 23, 42, 0.7)',
                            border: '1px solid rgba(30, 58, 138, 0.25)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 40px rgba(30, 58, 138, 0.05)'
                        }}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-white">Enhanced Resume</h3>
                                <button
                                    onClick={handleDownload}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Download
                                </button>
                            </div>
                            <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto" style={{
                                border: '1px solid rgba(30, 58, 138, 0.3)',
                                background: 'rgba(10, 10, 10, 0.6)',
                                backdropFilter: 'blur(8px)'
                            }}>
                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200">
                                    {enhancedResume}
                                </pre>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate(`/resume/${id}`)}
                                className="flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(30, 58, 138, 0.3)',
                                    backdropFilter: 'blur(8px)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(30, 58, 138, 0.4)';
                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                                    e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.3)';
                                }}
                            >
                                Back to Review
                            </button>
                            <button
                                onClick={() => {
                                    setStep('questions');
                                    setAnswers({});
                                    setEnhancedResume('');
                                }}
                                className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Enhance Again
                            </button>
                        </div>
                    </div>
                )}
                </section>
            </div>
        </main>
    );
};

export default Enhance;

