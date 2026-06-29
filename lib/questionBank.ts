/**
 * Static question bank (15 questions) and server-only scoring helpers.
 * Correct answers live here and are never exported to client components.
 */

import type {
  Answer,
  ClientQuestion,
  Question,
  Result,
  Topic,
  TopicScore,
} from "@/types/assessment";

const QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "multiple-choice",
    topic: "Logic",
    prompt: "If all bloops are razzies and all razzies are lazzies, which must be true?",
    options: [
      "All bloops are lazzies",
      "All lazzies are bloops",
      "Some razzies are not bloops",
      "No lazzies are bloops",
    ],
    correctAnswer: "All bloops are lazzies",
  },
  {
    id: "q2",
    type: "multiple-choice",
    topic: "Math",
    prompt: "What is 15% of 240?",
    options: ["24", "30", "36", "42"],
    correctAnswer: "36",
  },
  {
    id: "q3",
    type: "multiple-choice",
    topic: "Verbal",
    prompt: "Choose the word closest in meaning to 'ephemeral'.",
    options: ["Permanent", "Fleeting", "Solid", "Ancient"],
    correctAnswer: "Fleeting",
  },
  {
    id: "q4",
    type: "multi-select",
    topic: "Logic",
    prompt: "Which are prime numbers? (Select all that apply)",
    options: ["2", "4", "7", "9", "11"],
    correctAnswer: ["2", "7", "11"],
  },
  {
    id: "q5",
    type: "multiple-choice",
    topic: "Math",
    prompt: "Solve for x: 3x + 7 = 22",
    options: ["3", "5", "7", "9"],
    correctAnswer: "5",
  },
  {
    id: "q6",
    type: "multiple-choice",
    topic: "Verbal",
    prompt: "The committee reached a ___ after hours of debate.",
    options: ["consensus", "conscience", "consequence", "confluence"],
    correctAnswer: "consensus",
  },
  {
    id: "q7",
    type: "multiple-choice",
    topic: "Logic",
    prompt: "A is taller than B. C is shorter than B. Who is shortest?",
    options: ["A", "B", "C", "Cannot be determined"],
    correctAnswer: "C",
  },
  {
    id: "q8",
    type: "multi-select",
    topic: "Math",
    prompt: "Which fractions equal 1/2? (Select all that apply)",
    options: ["2/4", "3/6", "4/6", "5/10", "3/5"],
    correctAnswer: ["2/4", "3/6", "5/10"],
  },
  {
    id: "q9",
    type: "multiple-choice",
    topic: "Verbal",
    prompt: "What is the antonym of 'verbose'?",
    options: ["Wordy", "Concise", "Elaborate", "Talkative"],
    correctAnswer: "Concise",
  },
  {
    id: "q10",
    type: "multiple-choice",
    topic: "Logic",
    prompt: "If it rains, the ground is wet. The ground is wet. What can we conclude?",
    options: [
      "It definitely rained",
      "It might have rained",
      "It did not rain",
      "The ground is dry",
    ],
    correctAnswer: "It might have rained",
  },
  {
    id: "q11",
    type: "multiple-choice",
    topic: "Math",
    prompt: "What is the area of a rectangle with length 8 and width 5?",
    options: ["13", "26", "40", "80"],
    correctAnswer: "40",
  },
  {
    id: "q12",
    type: "multi-select",
    topic: "Verbal",
    prompt: "Which words are synonyms of 'happy'? (Select all that apply)",
    options: ["Joyful", "Melancholy", "Content", "Gloomy", "Cheerful"],
    correctAnswer: ["Joyful", "Content", "Cheerful"],
  },
  {
    id: "q13",
    type: "multiple-choice",
    topic: "Logic",
    prompt: "In a sequence 2, 6, 18, 54, what comes next?",
    options: ["108", "162", "216", "72"],
    correctAnswer: "162",
  },
  {
    id: "q14",
    type: "multiple-choice",
    topic: "Math",
    prompt: "What is √144?",
    options: ["10", "11", "12", "14"],
    correctAnswer: "12",
  },
  {
    id: "q15",
    type: "multiple-choice",
    topic: "Verbal",
    prompt: "Choose the correctly spelled word.",
    options: ["Accomodate", "Accommodate", "Acommodate", "Acomodate"],
    correctAnswer: "Accommodate",
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

/** Returns questions without correct answers — safe for Client Components. */
export function getClientQuestions(): ClientQuestion[] {
  return QUESTIONS.map(({ id, type, topic, prompt, options }) => ({
    id,
    type,
    topic,
    prompt,
    options,
  }));
}

function answersMatch(expected: string | string[], given: Answer | undefined): boolean {
  if (given === undefined) return false;

  if (Array.isArray(expected)) {
    if (!Array.isArray(given)) return false;
    const sortedExpected = [...expected].sort();
    const sortedGiven = [...given].sort();
    return (
      sortedExpected.length === sortedGiven.length &&
      sortedExpected.every((val, i) => val === sortedGiven[i])
    );
  }

  return given === expected;
}

function buildTopicScores(
  answers: Record<string, Answer>
): TopicScore[] {
  const topics: Topic[] = ["Logic", "Math", "Verbal"];
  const byTopic = new Map<Topic, { correct: number; total: number }>();

  for (const topic of topics) {
    byTopic.set(topic, { correct: 0, total: 0 });
  }

  for (const question of QUESTIONS) {
    const stats = byTopic.get(question.topic)!;
    stats.total += 1;
    if (answersMatch(question.correctAnswer, answers[question.id])) {
      stats.correct += 1;
    }
  }

  return topics.map((topic) => {
    const { correct, total } = byTopic.get(topic)!;
    return {
      topic,
      correct,
      total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });
}

/** Server-only scoring — compares answers against the private question bank. */
export function scoreAssessment(
  resultId: string,
  sessionId: string,
  answers: Record<string, Answer>,
  timeTakenSeconds: number
): Result {
  let score = 0;

  for (const question of QUESTIONS) {
    if (answersMatch(question.correctAnswer, answers[question.id])) {
      score += 1;
    }
  }

  return {
    resultId,
    sessionId,
    score,
    totalQuestions: TOTAL_QUESTIONS,
    timeTakenSeconds,
    topicScores: buildTopicScores(answers),
    completedAt: Date.now(),
  };
}
