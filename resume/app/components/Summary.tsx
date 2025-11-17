import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

const Category = ({ title, score, customColors }: { title: string, score: number, customColors?: { primary: string; secondary: string; accent: string; background: string } }) => {
    const textColor = score > 70 ? 'text-green-600'
            : score > 49
        ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row gap-2 items-center justify-center">
                    <p className="text-2xl text-white" style={{ color: customColors?.primary || '#ffffff' }}>{title}</p>
                    <ScoreBadge score={score} customColors={customColors} />
                </div>
                <p className="text-2xl text-white">
                    <span className={textColor}>{score}</span>/100
                </p>
            </div>
        </div>
    )
}

const Summary = ({ feedback, customColors }: { feedback: Feedback, customColors?: { primary: string; secondary: string; accent: string; background: string } }) => {
    return (
        <div className="rounded-2xl shadow-md w-full" style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(30, 58, 138, 0.25)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 40px rgba(30, 58, 138, 0.05)'
        }}>
            <div className="flex flex-row items-center p-4 gap-8">
                <ScoreGauge score={feedback.overallScore} customColors={customColors} />

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-white" style={{ color: customColors?.primary || '#ffffff' }}>Your Resume Score</h2>
                    <p className="text-sm text-gray-400">
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>

            <Category title="Tone & Style" score={feedback.toneAndStyle.score} customColors={customColors} />
            <Category title="Content" score={feedback.content.score} customColors={customColors} />
            <Category title="Structure" score={feedback.structure.score} customColors={customColors} />
            <Category title="Skills" score={feedback.skills.score} customColors={customColors} />
        </div>
    )
}
export default Summary
