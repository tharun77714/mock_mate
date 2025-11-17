import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

// Dummy feedback data
const dummyFeedback = {
  totalScore: 85,
  categoryScores: [
    {
      name: "Communication Skills",
      score: 88,
      comment: "Excellent clarity and articulation. You demonstrated strong verbal communication with well-structured responses. Your ability to explain complex concepts clearly was impressive. Consider working on maintaining this level of engagement throughout longer conversations.",
    },
    {
      name: "Technical Knowledge",
      score: 82,
      comment: "Solid understanding of core concepts. You showed good grasp of fundamental principles and were able to discuss technical topics confidently. Some areas could use deeper exploration, particularly around system design and scalability considerations.",
    },
    {
      name: "Problem-Solving",
      score: 87,
      comment: "Strong analytical thinking and logical approach. You broke down problems effectively and proposed reasonable solutions. Your thought process was clear and methodical. Continue to practice breaking down more complex scenarios into manageable components.",
    },
    {
      name: "Cultural & Role Fit",
      score: 90,
      comment: "Excellent alignment with company values. You demonstrated genuine interest in the role and company culture. Your enthusiasm and collaborative mindset came through clearly. Your experience and career goals align well with this position.",
    },
    {
      name: "Confidence & Clarity",
      score: 83,
      comment: "Confident and composed throughout the interview. You maintained good eye contact and engaged well with the interviewer. Your responses were clear and well-paced. Minor improvement could be made in handling unexpected questions with more ease.",
    },
  ],
  strengths: [
    "Clear and articulate communication style",
    "Strong technical foundation in core concepts",
    "Excellent problem-solving methodology",
    "Great cultural fit and enthusiasm for the role",
    "Professional demeanor and confidence",
    "Well-structured responses with good examples",
  ],
  areasForImprovement: [
    "Dive deeper into system design and architecture patterns",
    "Practice more behavioral questions with STAR method",
    "Prepare more examples from past projects",
    "Work on handling unexpected technical questions",
    "Consider practicing with mock interviews regularly",
  ],
  finalAssessment:
    "Overall, this was a strong interview performance. The candidate demonstrated solid technical knowledge, excellent communication skills, and a clear alignment with the company's values. While there are areas for improvement, particularly around deeper technical discussions, the foundation is strong. With continued practice and preparation, this candidate shows great potential. The problem-solving approach was methodical and the cultural fit is evident.",
  createdAt: new Date().toISOString(),
};

const dummyInterview = {
  role: "Senior Frontend Developer",
};

const Feedback = () => {
  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback on the Interview -{" "}
          <span className="capitalize">{dummyInterview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-5">
          {/* Overall Impression */}
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Overall Impression:{" "}
              <span className="text-primary-200 font-bold">
                {dummyFeedback.totalScore}
              </span>
              /100
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>
              {dummyFeedback.createdAt
                ? dayjs(dummyFeedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr />

      <p>{dummyFeedback.finalAssessment}</p>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-4">
        <h2>Breakdown of the Interview:</h2>
        {dummyFeedback.categoryScores.map((category, index) => (
          <div key={index}>
            <p className="font-bold">
              {index + 1}. {category.name} ({category.score}/100)
            </p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Strengths</h3>
        <ul>
          {dummyFeedback.strengths.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3>Areas for Improvement</h3>
        <ul>
          {dummyFeedback.areasForImprovement.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link href="/interview" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-black text-center">
              Start New Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;

