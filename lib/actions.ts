/**
 * Server Actions — the centerpiece of state mutation in this app.
 * All progress saving, scoring, and session management flows through here
 * instead of separate REST API routes. Next.js serializes these functions
 * and invokes them on the server from Client Components via form actions
 * or direct calls.
 */

"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { scoreAssessment, TOTAL_QUESTIONS } from "@/lib/questionBank";
import {
  clearProgress,
  clearResult,
  clearSession,
  createInitialProgress,
  getProgress,
  getSessionId,
  setProgress,
  setResult,
  setSessionId,
} from "@/lib/session";
import type { Answer } from "@/types/assessment";

/** Creates a new session and redirects to the assessment. */
export async function startAssessment(): Promise<void> {
  const sessionId = randomUUID();
  await setSessionId(sessionId);
  await setProgress(createInitialProgress(sessionId));
  redirect("/assessment");
}

/**
 * Persists the user's answer and advances the question index.
 * Called on "Next" and on per-question timeout (auto-advance).
 */
export async function saveProgress(
  questionId: string,
  answer: Answer,
  currentIndex: number,
  elapsedSeconds: number
): Promise<void> {
  const sessionId = await getSessionId();
  const existing = await getProgress();

  if (!sessionId || !existing || existing.sessionId !== sessionId) {
    redirect("/");
  }

  const nextIndex = currentIndex + 1;

  await setProgress({
    ...existing,
    currentIndex: nextIndex,
    answers: { ...existing.answers, [questionId]: answer },
    totalElapsedSeconds: elapsedSeconds,
  });
}

/**
 * Scores the assessment server-side, clears progress, stores the result
 * in a short-lived cookie, and redirects to the results page.
 * Correct answers are compared here — never on the client.
 */
export async function submitAssessment(
  questionId: string,
  answer: Answer,
  elapsedSeconds: number
): Promise<void> {
  const sessionId = await getSessionId();
  const existing = await getProgress();

  if (!sessionId || !existing || existing.sessionId !== sessionId) {
    redirect("/");
  }

  const finalAnswers = { ...existing.answers, [questionId]: answer };
  const resultId = randomUUID();

  const result = scoreAssessment(
    resultId,
    sessionId,
    finalAnswers,
    elapsedSeconds
  );

  await clearProgress();
  await setResult(result);
  redirect(`/result/${resultId}`);
}

/** Clears all cookies and starts a fresh assessment. */
export async function retakeAssessment(): Promise<void> {
  await clearSession();
  await clearResult();
  await startAssessment();
}

/** Guard used by the assessment page — ensures valid session state. */
export async function getAssessmentState() {
  const sessionId = await getSessionId();
  if (!sessionId) return null;

  const progress = await getProgress();
  if (!progress || progress.sessionId !== sessionId) return null;

  if (progress.currentIndex >= TOTAL_QUESTIONS) {
    return null;
  }

  return { sessionId, progress };
}
