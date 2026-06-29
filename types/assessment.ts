/**
 * Shared TypeScript types for the Checkpoint assessment app.
 * Defines the shape of questions, answers, session progress, and results.
 */

export type Topic = "Logic" | "Math" | "Verbal";

export type QuestionType = "multiple-choice" | "multi-select";

/** Full question with correct answer — server-side only. */
export interface Question {
  id: string;
  type: QuestionType;
  topic: Topic;
  prompt: string;
  options: string[];
  correctAnswer: string | string[];
}

/** Question stripped of correct answer — safe to send to the client. */
export interface ClientQuestion {
  id: string;
  type: QuestionType;
  topic: Topic;
  prompt: string;
  options: string[];
}

export type Answer = string | string[];

/** Progress persisted in an encrypted cookie between questions and across refreshes. */
export interface SessionProgress {
  sessionId: string;
  currentIndex: number;
  answers: Record<string, Answer>;
  startedAt: number;
  totalElapsedSeconds: number;
}

export interface TopicScore {
  topic: Topic;
  correct: number;
  total: number;
  accuracy: number;
}

/** Final scored result shown on the results page. */
export interface Result {
  resultId: string;
  sessionId: string;
  score: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  topicScores: TopicScore[];
  completedAt: number;
}
