import Image from "next/image";
import { redirect } from "next/navigation";
import dayjs from "dayjs";

import Agent from "@/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import EmotionTracker from "@/components/EmotionTracker";
import EmotionFeedbackSync from "@/components/EmotionFeedbackSync";

// Dummy conversation data
const dummyConversation = [
  {
    role: "assistant",
    content: "Hello! Welcome to your mock interview for the Full Stack Developer position. I'm excited to speak with you today. How are you feeling?",
  },
  {
    role: "user",
    content: "Hi! I'm feeling good, thank you. I'm excited about this opportunity and ready to discuss my experience.",
  },
  {
    role: "assistant",
    content: "That's great to hear. Let's start with a technical question. Can you explain the difference between REST and GraphQL?",
  },
  {
    role: "user",
    content: "Sure! REST is a traditional API architecture style that uses HTTP methods like GET, POST, PUT, DELETE. It's stateless and works with multiple data formats. GraphQL, on the other hand, is a query language that allows clients to request exactly the data they need. The main differences are that REST has fixed endpoints, while GraphQL has a single endpoint and gives clients more flexibility. GraphQL also allows for more efficient data fetching with fewer round trips.",
  },
  {
    role: "assistant",
    content: "Excellent explanation! You covered the key points well. Now, how would you approach optimizing a React application?",
  },
  {
    role: "user",
    content: "There are several strategies. First, I'd use React.memo to prevent unnecessary re-renders of components. I'd also implement code splitting with React.lazy and Suspense to load components on demand. Using useMemo and useCallback hooks can help with expensive computations and function recreation. Virtualization for long lists is important, and I'd make sure to optimize images and assets. State management is crucial too - keeping state as local as possible and using proper state management solutions when needed.",
  },
  {
    role: "assistant",
    content: "Great answer! You mentioned several important optimization techniques. Let's talk about databases. Can you describe your approach to database design?",
  },
  {
    role: "user",
    content: "When designing a database, I start by understanding the business requirements and identifying entities and their relationships. I normalize the data to reduce redundancy, typically to third normal form, but I'm also aware that sometimes denormalization is necessary for performance. I consider indexing strategies for frequently queried fields, plan for scalability from the start, and think about data integrity with constraints. I also consider whether a relational or NoSQL database fits better based on the data structure and query patterns.",
  },
  {
    role: "assistant",
    content: "Very thorough response! You've demonstrated strong technical knowledge. Thank you for your time today. Do you have any questions for me?",
  },
  {
    role: "user",
    content: "Thank you! Yes, I'd like to know more about the team structure and what the day-to-day work would look like for this role.",
  },
  {
    role: "assistant",
    content: "I'd be happy to discuss that, but for this mock interview session, we'll wrap up here. You've done an excellent job! Your technical answers were clear and well-structured. Good luck with your interview process!",
  },
];

// Dummy feedback data
const dummyFeedback = {
  totalScore: 87,
  categoryScores: [
    {
      name: "Communication Skills",
      score: 90,
      comment: "Excellent clarity and articulation. You demonstrated strong verbal communication with well-structured responses. Your ability to explain complex technical concepts clearly was very impressive.",
    },
    {
      name: "Technical Knowledge",
      score: 88,
      comment: "Strong understanding of core concepts. You showed excellent grasp of REST, GraphQL, React optimization, and database design principles. Your explanations were thorough and accurate.",
    },
    {
      name: "Problem-Solving",
      score: 85,
      comment: "Good analytical thinking and logical approach. You broke down questions effectively and provided comprehensive solutions. Your thought process was clear and methodical.",
    },
    {
      name: "Cultural & Role Fit",
      score: 87,
      comment: "You demonstrated genuine interest in the role and asked thoughtful questions. Your enthusiasm came through clearly, and you showed good alignment with technical roles.",
    },
    {
      name: "Confidence & Clarity",
      score: 86,
      comment: "Confident and composed throughout the interview. You maintained good engagement with the interviewer and provided clear, well-paced responses.",
    },
  ],
  strengths: [
    "Excellent technical communication skills",
    "Strong understanding of React optimization techniques",
    "Good grasp of API design principles (REST vs GraphQL)",
    "Thoughtful approach to database design",
    "Clear and structured responses",
    "Demonstrated enthusiasm and interest in the role",
  ],
  areasForImprovement: [
    "Could provide more specific examples from past projects",
    "Consider discussing trade-offs in technical decisions",
    "Practice providing more concise answers when appropriate",
    "Could dive deeper into scalability considerations",
  ],
  finalAssessment:
    "Overall, this was a strong interview performance. You demonstrated solid technical knowledge across multiple domains, excellent communication skills, and clear thinking. Your explanations were well-structured and easy to follow. While there are areas for improvement, particularly in providing more specific examples and discussing trade-offs, the foundation is very strong. You showed good potential for a Full Stack Developer role.",
  emotions: {
    averages: {
      happy: 42.3,
      neutral: 35.7,
      confident: 67.2,
      engaged: 58.4,
      calm: 51.9,
      focused: 62.1,
    },
    dominantCounts: {
      confident: 15,
      neutral: 12,
      happy: 8,
      engaged: 7,
      focused: 5,
    },
    avgConfidence: 67.2,
    avgClarity: 73.5,
    totalDetections: 47,
  },
  createdAt: (() => {
    const date = new Date();
    date.setDate(date.getDate() - 3);
    return date.toISOString();
  })(),
};

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();

  // Check if this is the dummy interview
  const isDummyInterview = id === "dummy-interview-001";

  let interview;
  let feedback;

  if (isDummyInterview) {
    // Create dummy interview data
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    interview = {
      id: "dummy-interview-001",
      userId: user?.id || "",
      role: "Full Stack Developer",
      level: "Senior",
      type: "Technical",
      techstack: ["React", "Node.js", "TypeScript", "MongoDB"],
      questions: [
        "Explain the difference between REST and GraphQL",
        "How would you optimize a React application?",
        "Describe your approach to database design",
      ],
      finalized: true,
      createdAt: threeDaysAgo.toISOString(),
      coverImage: "/covers/amazon.png",
    };
    feedback = dummyFeedback;
  } else {
    interview = await getInterviewById(id);
    if (!interview) redirect("/");

    feedback = await getFeedbackByInterviewId({
      interviewId: id,
      userId: user?.id!,
    });
  }

  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />
            <h3 className="capitalize">{interview.role} Interview</h3>
          </div>

          <DisplayTechIcons techStack={interview.techstack} />
        </div>

        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
          {interview.type}
        </p>
      </div>

      {isDummyInterview && feedback ? (
        <>
          {/* Dummy Conversation Transcript */}
          <section className="flex flex-col gap-6 mt-8">
            <h2>Interview Conversation</h2>
            <div className="card-border">
              <div className="card p-6">
                <div className="flex flex-col gap-4 max-h-96 overflow-auto">
                  {dummyConversation.map((message, index) => (
                    <div
                      key={index}
                      className={`flex flex-col gap-2 ${
                        message.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <span className="text-xs opacity-70 capitalize">
                        {message.role === "user" ? "You" : "AI Interviewer"}
                      </span>
                      <div
                        className={`px-4 py-3 rounded-lg max-w-[80%] ${
                          message.role === "user"
                            ? "bg-primary-200 text-dark-100"
                            : "bg-dark-200 text-light-100"
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Dummy Feedback Section */}
          <section className="flex flex-col gap-6 mt-8">
            <h2>Interview Feedback</h2>
            <div className="card-border">
              <div className="card p-6">
                <div className="flex flex-col gap-6">
                  {/* Overall Score */}
                  <div className="flex flex-row gap-5 items-center">
                    <div className="flex flex-row gap-2 items-center">
                      <Image src="/star.svg" width={22} height={22} alt="star" />
                      <p>
                        Overall Impression:{" "}
                        <span className="text-primary-200 font-bold">
                          {feedback.totalScore}
                        </span>
                        /100
                      </p>
                    </div>
                    <div className="flex flex-row gap-2">
                      <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
                      <p>
                        {feedback.createdAt
                          ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <hr />

                  {/* Final Assessment */}
                  <p>{feedback.finalAssessment}</p>

                  {/* Category Scores */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-semibold">Breakdown of the Interview:</h3>
                    {feedback.categoryScores.map((category, index) => (
                      <div key={index}>
                        <p className="font-bold">
                          {index + 1}. {category.name} ({category.score}/100)
                        </p>
                        <p>{category.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Strengths and Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <h3 className="text-lg font-semibold">Strengths</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {feedback.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-3">
                      <h3 className="text-lg font-semibold">Areas for Improvement</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {feedback.areasForImprovement.map((area, index) => (
                          <li key={index}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Emotion Statistics Section */}
          {feedback.emotions && (
            <section className="flex flex-col gap-6 mt-8">
              <h2>Emotion Analysis</h2>
              <div className="card-border">
                <div className="card p-6">
                  <div className="flex flex-col gap-6">
                    {/* Overall Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm opacity-70">Confidence</p>
                        <p className="text-2xl font-bold text-primary-200">
                          {feedback.emotions.avgConfidence.toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm opacity-70">Clarity</p>
                        <p className="text-2xl font-bold text-primary-200">
                          {feedback.emotions.avgClarity.toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm opacity-70">Total Detections</p>
                        <p className="text-2xl font-bold text-primary-200">
                          {feedback.emotions.totalDetections}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm opacity-70">Dominant Emotion</p>
                        <p className="text-lg font-semibold capitalize">
                          {Object.entries(feedback.emotions.dominantCounts)
                            .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                        </p>
                      </div>
                    </div>

                    <hr />

                    {/* Emotion Averages */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xl font-semibold">Emotion Averages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(feedback.emotions.averages)
                          .sort((a, b) => b[1] - a[1])
                          .map(([emotion, value]) => (
                            <div key={emotion} className="flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="capitalize font-semibold">{emotion}</span>
                                <span className="text-primary-200 font-bold">
                                  {value.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-dark-200 rounded-full h-2">
                                <div
                                  className="bg-primary-200 h-2 rounded-full transition-all"
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Dominant Emotions */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xl font-semibold">Dominant Emotions Count</h3>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(feedback.emotions.dominantCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([emotion, count]) => (
                            <div
                              key={emotion}
                              className="px-4 py-2 rounded-full bg-dark-200 border border-primary-200/30 flex items-center gap-2"
                            >
                              <span className="capitalize font-semibold">{emotion}</span>
                              <span className="text-primary-200 font-bold">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          <Agent
            userName={user?.name!}
            userId={user?.id}
            interviewId={id}
            type="interview"
            questions={interview.questions}
            feedbackId={(feedback && "id" in feedback) ? (feedback as { id: string }).id : undefined}
          />

          {/* Non-invasive emotion tracker (does not affect agent logic) */}
          <EmotionTracker interviewId={id} />
          {/* Sync emotion data to feedback after call ends */}
          <EmotionFeedbackSync interviewId={id} userId={user?.id} />
        </>
      )}
    </>
  );
};

export default InterviewDetails;
