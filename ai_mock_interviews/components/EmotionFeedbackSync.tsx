"use client";

import { useEffect } from "react";
import {
  updateFeedbackWithEmotions,
  getFeedbackByInterviewId,
} from "@/lib/actions/general.action";
import type { EmotionSummary } from "@/types";

export default function EmotionFeedbackSync({
  interviewId,
  userId,
}: {
  interviewId: string;
  userId?: string;
}) {
  useEffect(() => {
    if (!userId || !interviewId) return;

    let lastEndButtonState = false;

    const syncEmotionsToFeedback = async () => {
      // Wait a moment for feedback to be created by Agent
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Read emotion summary from localStorage
      const storageKey = `emotion-summary:${interviewId}`;
      try {
        const summaryJson = localStorage.getItem(storageKey);
        if (!summaryJson) return;

        const summary = JSON.parse(summaryJson) as EmotionSummary;
        if (!summary || summary.totalDetections === 0) return;

        // Get the feedback document for this interview
        const feedback = await getFeedbackByInterviewId({
          interviewId,
          userId,
        });

        if (feedback?.id) {
          await updateFeedbackWithEmotions(feedback.id, summary);
          console.log("Emotion data synced to feedback:", feedback.id);
        }
      } catch (error) {
        console.warn("Error syncing emotion data to feedback:", error);
        // Silent failure - doesn't affect main interview flow
      }
    };

    const handleEndClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest(".btn-disconnect")) {
        syncEmotionsToFeedback();
      }
    };

    // Poll for End button state changes
    const pollEndButton = setInterval(() => {
      const endButton = document.querySelector(".btn-disconnect");
      const isEndButtonVisible = !!endButton;

      // When End button disappears (call ended), sync emotions
      if (lastEndButtonState && !isEndButtonVisible) {
        syncEmotionsToFeedback();
      }

      lastEndButtonState = isEndButtonVisible;
    }, 500);

    document.addEventListener("click", handleEndClick);

    return () => {
      document.removeEventListener("click", handleEndClick);
      clearInterval(pollEndButton);
    };
  }, [interviewId, userId]);

  return null;
}
