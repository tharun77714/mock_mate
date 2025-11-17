import React from 'react'

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
  customColors?: { primary: string; secondary: string; accent: string; background: string };
}

const ATS: React.FC<ATSProps> = ({ score, suggestions, customColors }) => {
  // Determine background gradient based on score
  const gradientClass = score > 69
    ? 'from-green-100'
    : score > 49
      ? 'from-yellow-100'
      : 'from-red-100';

  // Determine icon based on score
  const iconSrc = score > 69
    ? '/icons/ats-good.svg'
    : score > 49
      ? '/icons/ats-warning.svg'
      : '/icons/ats-bad.svg';

  // Determine subtitle based on score
  const subtitle = score > 69
    ? 'Great Job!'
    : score > 49
      ? 'Good Start'
      : 'Needs Improvement';

  return (
    <div className="rounded-2xl shadow-md w-full p-6" style={{
      background: 'rgba(15, 23, 42, 0.7)',
      border: '1px solid rgba(30, 58, 138, 0.25)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 40px rgba(30, 58, 138, 0.05)'
    }}>
      {/* Top section with icon and headline */}
      <div className="flex items-center gap-4 mb-6">
        <img src={iconSrc} alt="ATS Score Icon" className="w-12 h-12" />
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ color: customColors?.primary || '#ffffff' }}>ATS Score - {score}/100</h2>
        </div>
      </div>

      {/* Description section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 text-white">{subtitle}</h3>
        <p className="text-gray-400 mb-4">
          This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers.
        </p>

        {/* Suggestions list */}
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3">
              <img
                src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt={suggestion.type === "good" ? "Check" : "Warning"}
                className="w-5 h-5 mt-1"
              />
              <p className={suggestion.type === "good" ? "text-green-400" : "text-amber-400"}>
                {suggestion.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing encouragement */}
      <p className="text-gray-400 italic">
        Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters.
      </p>
    </div>
  )
}

export default ATS
