import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import EmotionSummaryClient from "@/components/EmotionSummaryClient";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
  getFeedbackByInterviewId,
} from "@/lib/actions/general.action";

async function Home({ searchParams }: { searchParams?: { interviewId?: string } }) {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  // Add dummy interview from 3 days ago
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const dummyInterview = {
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

  // Combine real interviews with dummy interview
  const allUserInterviews = userInterviews ? [...userInterviews, dummyInterview] : [dummyInterview];

  const hasPastInterviews = allUserInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  // If redirected from an interview session, try to load feedback for that interview
  const selectedInterviewId = searchParams?.interviewId;
  let selectedFeedback: Awaited<ReturnType<typeof getFeedbackByInterviewId>> | null = null;
  if (selectedInterviewId && user?.id) {
    selectedFeedback = await getFeedbackByInterviewId({
      interviewId: selectedInterviewId,
      userId: user.id,
    });
  }

  return (
    <>
      <div className="flex items-center justify-end mb-6">
        <Link
          href="/feedback"
          className="px-4 py-2 rounded-full bg-primary-200 text-dark-100 hover:bg-primary-200/80 font-semibold text-sm transition-colors"
        >
          Feedback
        </Link>
      </div>

      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-4 mt-8">
        <div className="flex flex-row justify-between items-center">
          <h2>Interview Feedback</h2>
          {selectedInterviewId && (
            <div className="flex gap-3">
              <Button className="btn-secondary" asChild>
                <Link href={`/interview/${selectedInterviewId}`}>Open Interview</Link>
              </Button>
              <Button className="btn-primary" asChild>
                <Link href={`/interview/${selectedInterviewId}/feedback`}>Open Full Feedback</Link>
              </Button>
            </div>
          )}
        </div>

        {selectedInterviewId ? (
          selectedFeedback ? (
            <div className="flex flex-col gap-4 card-border p-4">
              <div className="flex flex-row gap-5 items-center">
                <div className="flex flex-row gap-2 items-center">
                  <Image src="/star.svg" width={22} height={22} alt="star" />
                  <p>
                    Overall Impression:{" "}
                    <span className="text-primary-200 font-bold">
                      {selectedFeedback.totalScore}
                    </span>
                    /100
                  </p>
                </div>

                <div className="flex flex-row gap-2">
                  <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
                  <p>
                    {selectedFeedback.createdAt
                      ? dayjs(selectedFeedback.createdAt).format("MMM D, YYYY h:mm A")
                      : "N/A"}
                  </p>
                </div>
              </div>

              <p>{selectedFeedback.finalAssessment}</p>

              {selectedFeedback.transcript && selectedFeedback.transcript.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3>Conversation Transcript</h3>
                  <div className="card-border p-3 max-h-64 overflow-auto space-y-2">
                    {selectedFeedback.transcript.map((m: { role: string; content: string }, i: number) => (
                      <div key={i} className="text-sm">
                        <span className="font-semibold capitalize">{m.role}:</span>{" "}
                        <span>{m.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <h3>Breakdown</h3>
                  <div className="flex flex-col gap-3">
                    {selectedFeedback.categoryScores?.map((category: any, index: number) => (
                      <div key={index}>
                        <p className="font-bold">
                          {index + 1}. {category.name} ({category.score}/100)
                        </p>
                        <p>{category.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3>Highlights</h3>
                  <div>
                    <p className="font-semibold mb-1">Strengths</p>
                    <ul className="list-disc ml-5">
                      {selectedFeedback.strengths?.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Areas for Improvement</p>
                    <ul className="list-disc ml-5">
                      {selectedFeedback.areasForImprovement?.map((a: string, i: number) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Client-side emotion summary sourced from localStorage if present */}
              <EmotionSummaryClient interviewId={selectedInterviewId} />
            </div>
          ) : (
            <div className="card-border p-4"><p>Generating feedback... refresh this page in a few seconds.</p></div>
          )
        ) : (
          <div className="card-border p-4">
            <p>No feedback yet. Start an interview to generate feedback.</p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            allUserInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
