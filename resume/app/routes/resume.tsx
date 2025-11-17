import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import ColorCustomizer from "~/components/ColorCustomizer";

export const meta = () => ([
    { title: 'Resume Review' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [customColors, setCustomColors] = useState({
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#10b981',
        background: '#000000'
    });
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            console.log({resumeUrl, imageUrl, feedback: data.feedback });
        }

        loadResume();
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <div className="flex items-center justify-between w-full">
                    <Link to="/" className="back-button">
                        <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                        <span className="text-white text-sm font-semibold">Back to Homepage</span>
                    </Link>
                    <ColorCustomizer onColorChange={setCustomColors} />
                </div>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section h-[100vh] sticky top-0 items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(10, 10, 10, 0.95) 100%)'
                }}>
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section" style={{ 
                    backgroundColor: customColors.background === '#ffffff' ? '#0a0a0a' : (customColors.background === '#000000' ? '#0a0a0a' : customColors.background)
                }}>
                    <h2 className="text-4xl font-bold text-white" style={{ color: customColors.primary || '#ffffff' }}>Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} customColors={customColors} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} customColors={customColors} />
                            <Details feedback={feedback} customColors={customColors} />
                            <div className="rounded-2xl shadow-md w-full p-6" style={{
                                background: 'rgba(15, 23, 42, 0.7)',
                                border: '1px solid rgba(30, 58, 138, 0.25)',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 40px rgba(30, 58, 138, 0.05)'
                            }}>
                                <button
                                    onClick={() => navigate(`/resume/${id}/enhance`)}
                                    className="w-full text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    style={{
                                        background: `linear-gradient(135deg, ${customColors.primary}, ${customColors.secondary})`,
                                        boxShadow: '0px 4px 15px rgba(30, 58, 138, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1)'
                                    }}
                                >
                                    ✨ Enhance Resume
                                </button>
                            </div>
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume
